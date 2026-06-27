package usecase

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stokku-ai/backend/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// --- Mock TransactionRepository ---

type MockTransactionRepository struct {
	mock.Mock
}

func (m *MockTransactionRepository) Create(ctx context.Context, tx *domain.Transaction) error {
	args := m.Called(ctx, tx)
	return args.Error(0)
}

func (m *MockTransactionRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.TransactionView, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.TransactionView), args.Error(1)
}

func (m *MockTransactionRepository) GetAll(ctx context.Context, filter domain.TransactionFilter) ([]domain.TransactionView, int, error) {
	args := m.Called(ctx, filter)
	return args.Get(0).([]domain.TransactionView), args.Int(1), args.Error(2)
}

func (m *MockTransactionRepository) GetRecentByWarehouse(ctx context.Context, warehouseID uuid.UUID, limit int) ([]domain.TransactionView, error) {
	args := m.Called(ctx, warehouseID, limit)
	return args.Get(0).([]domain.TransactionView), args.Error(1)
}

// --- Mock StockRepository ---

type MockStockRepository struct {
	mock.Mock
}

func (m *MockStockRepository) GetByWarehouseAndProduct(ctx context.Context, warehouseID, productID uuid.UUID) (*domain.Stock, error) {
	args := m.Called(ctx, warehouseID, productID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Stock), args.Error(1)
}

func (m *MockStockRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.StockView, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.StockView), args.Error(1)
}

func (m *MockStockRepository) Upsert(ctx context.Context, stock *domain.Stock) error {
	args := m.Called(ctx, stock)
	return args.Error(0)
}

func (m *MockStockRepository) GetByWarehouse(ctx context.Context, warehouseID uuid.UUID, limit, offset int) ([]domain.StockView, int, error) {
	args := m.Called(ctx, warehouseID, limit, offset)
	return args.Get(0).([]domain.StockView), args.Int(1), args.Error(2)
}

func (m *MockStockRepository) GetAllStocks(ctx context.Context, filter domain.StockFilter) ([]domain.StockView, int, error) {
	args := m.Called(ctx, filter)
	return args.Get(0).([]domain.StockView), args.Int(1), args.Error(2)
}

func (m *MockStockRepository) GetLowStockItems(ctx context.Context, limit int) ([]domain.StockView, error) {
	args := m.Called(ctx, limit)
	return args.Get(0).([]domain.StockView), args.Error(1)
}

func (m *MockStockRepository) GetDeadStock(ctx context.Context, daysSinceLastMove int, limit int) ([]domain.StockView, error) {
	args := m.Called(ctx, daysSinceLastMove, limit)
	return args.Get(0).([]domain.StockView), args.Error(1)
}

func (m *MockStockRepository) GetTotalStockValue(ctx context.Context, warehouseID *uuid.UUID) (float64, error) {
	args := m.Called(ctx, warehouseID)
	return args.Get(0).(float64), args.Error(1)
}

// --- Mock LockRepository ---

type MockLockRepository struct {
	mock.Mock
}

func (m *MockLockRepository) AcquireLock(ctx context.Context, key string, ttl time.Duration) (bool, error) {
	args := m.Called(ctx, key, ttl)
	return args.Bool(0), args.Error(1)
}

func (m *MockLockRepository) ReleaseLock(ctx context.Context, key string) error {
	args := m.Called(ctx, key)
	return args.Error(0)
}

// --- Tests ---

func TestStockIn_Success(t *testing.T) {
	txRepo := new(MockTransactionRepository)
	stockRepo := new(MockStockRepository)
	lockRepo := new(MockLockRepository)
	uc := NewTransactionUsecase(txRepo, stockRepo, lockRepo)
	ctx := context.Background()

	warehouseID := uuid.New()
	productID := uuid.New()
	performerID := uuid.New()

	lockKey := "stock:" + warehouseID.String() + ":" + productID.String()

	lockRepo.On("AcquireLock", ctx, lockKey, 10*time.Second).Return(true, nil)
	lockRepo.On("ReleaseLock", ctx, lockKey).Return(nil)

	existingStock := &domain.Stock{
		WarehouseID: warehouseID,
		ProductID:   productID,
		Quantity:    50,
	}
	stockRepo.On("GetByWarehouseAndProduct", ctx, warehouseID, productID).Return(existingStock, nil)
	stockRepo.On("Upsert", ctx, mock.AnythingOfType("*domain.Stock")).Return(nil)
	txRepo.On("Create", ctx, mock.AnythingOfType("*domain.Transaction")).Return(nil)

	req := domain.CreateTransactionRequest{
		WarehouseID: warehouseID,
		ProductID:   productID,
		Type:        domain.TxTypeStockIn,
		Quantity:    20,
		Reference:   "PO-001",
	}

	result, err := uc.CreateTransaction(ctx, req, performerID)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, 20, result.Quantity)
	assert.Equal(t, domain.TxTypeStockIn, result.Type)
	// Stock should now be 70
	assert.Equal(t, 70, existingStock.Quantity)
	lockRepo.AssertExpectations(t)
	stockRepo.AssertExpectations(t)
	txRepo.AssertExpectations(t)
}

func TestStockOut_Success(t *testing.T) {
	txRepo := new(MockTransactionRepository)
	stockRepo := new(MockStockRepository)
	lockRepo := new(MockLockRepository)
	uc := NewTransactionUsecase(txRepo, stockRepo, lockRepo)
	ctx := context.Background()

	warehouseID := uuid.New()
	productID := uuid.New()
	performerID := uuid.New()

	lockKey := "stock:" + warehouseID.String() + ":" + productID.String()

	lockRepo.On("AcquireLock", ctx, lockKey, 10*time.Second).Return(true, nil)
	lockRepo.On("ReleaseLock", ctx, lockKey).Return(nil)

	existingStock := &domain.Stock{
		WarehouseID: warehouseID,
		ProductID:   productID,
		Quantity:    100,
	}
	stockRepo.On("GetByWarehouseAndProduct", ctx, warehouseID, productID).Return(existingStock, nil)
	stockRepo.On("Upsert", ctx, mock.AnythingOfType("*domain.Stock")).Return(nil)
	txRepo.On("Create", ctx, mock.AnythingOfType("*domain.Transaction")).Return(nil)

	req := domain.CreateTransactionRequest{
		WarehouseID: warehouseID,
		ProductID:   productID,
		Type:        domain.TxTypeStockOut,
		Quantity:    30,
		Reference:   "SO-001",
	}

	result, err := uc.CreateTransaction(ctx, req, performerID)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, 30, result.Quantity)
	// Stock should now be 70
	assert.Equal(t, 70, existingStock.Quantity)
}

func TestStockOut_InsufficientStock(t *testing.T) {
	txRepo := new(MockTransactionRepository)
	stockRepo := new(MockStockRepository)
	lockRepo := new(MockLockRepository)
	uc := NewTransactionUsecase(txRepo, stockRepo, lockRepo)
	ctx := context.Background()

	warehouseID := uuid.New()
	productID := uuid.New()
	performerID := uuid.New()

	lockKey := "stock:" + warehouseID.String() + ":" + productID.String()

	lockRepo.On("AcquireLock", ctx, lockKey, 10*time.Second).Return(true, nil)
	lockRepo.On("ReleaseLock", ctx, lockKey).Return(nil)

	existingStock := &domain.Stock{
		WarehouseID: warehouseID,
		ProductID:   productID,
		Quantity:    5,
	}
	stockRepo.On("GetByWarehouseAndProduct", ctx, warehouseID, productID).Return(existingStock, nil)

	req := domain.CreateTransactionRequest{
		WarehouseID: warehouseID,
		ProductID:   productID,
		Type:        domain.TxTypeStockOut,
		Quantity:    20,
	}

	result, err := uc.CreateTransaction(ctx, req, performerID)

	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Contains(t, err.Error(), "insufficient stock")
}

func TestStockOut_LockConflict(t *testing.T) {
	txRepo := new(MockTransactionRepository)
	stockRepo := new(MockStockRepository)
	lockRepo := new(MockLockRepository)
	uc := NewTransactionUsecase(txRepo, stockRepo, lockRepo)
	ctx := context.Background()

	warehouseID := uuid.New()
	productID := uuid.New()
	performerID := uuid.New()

	lockKey := "stock:" + warehouseID.String() + ":" + productID.String()

	// Lock NOT acquired — another process holds it
	lockRepo.On("AcquireLock", ctx, lockKey, 10*time.Second).Return(false, nil)

	req := domain.CreateTransactionRequest{
		WarehouseID: warehouseID,
		ProductID:   productID,
		Type:        domain.TxTypeStockOut,
		Quantity:    10,
	}

	result, err := uc.CreateTransaction(ctx, req, performerID)

	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Contains(t, err.Error(), "being modified by another process")
	lockRepo.AssertExpectations(t)
}

func TestStockIn_LockError(t *testing.T) {
	txRepo := new(MockTransactionRepository)
	stockRepo := new(MockStockRepository)
	lockRepo := new(MockLockRepository)
	uc := NewTransactionUsecase(txRepo, stockRepo, lockRepo)
	ctx := context.Background()

	warehouseID := uuid.New()
	productID := uuid.New()
	performerID := uuid.New()

	lockKey := "stock:" + warehouseID.String() + ":" + productID.String()

	lockRepo.On("AcquireLock", ctx, lockKey, 10*time.Second).Return(false, errors.New("redis connection failed"))

	req := domain.CreateTransactionRequest{
		WarehouseID: warehouseID,
		ProductID:   productID,
		Type:        domain.TxTypeStockIn,
		Quantity:    10,
	}

	result, err := uc.CreateTransaction(ctx, req, performerID)

	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Contains(t, err.Error(), "failed to acquire lock")
}
