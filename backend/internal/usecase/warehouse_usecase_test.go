package usecase

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stokku-ai/backend/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// --- Mock WarehouseRepository ---

type MockWarehouseRepository struct {
	mock.Mock
}

func (m *MockWarehouseRepository) Create(ctx context.Context, warehouse *domain.Warehouse) error {
	args := m.Called(ctx, warehouse)
	return args.Error(0)
}

func (m *MockWarehouseRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Warehouse, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Warehouse), args.Error(1)
}

func (m *MockWarehouseRepository) GetAll(ctx context.Context, limit, offset int) ([]domain.Warehouse, int, error) {
	args := m.Called(ctx, limit, offset)
	return args.Get(0).([]domain.Warehouse), args.Int(1), args.Error(2)
}

func (m *MockWarehouseRepository) Update(ctx context.Context, warehouse *domain.Warehouse) error {
	args := m.Called(ctx, warehouse)
	return args.Error(0)
}

func (m *MockWarehouseRepository) Delete(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

// --- Tests ---

func TestCreateWarehouse_Success(t *testing.T) {
	mockRepo := new(MockWarehouseRepository)
	uc := NewWarehouseUsecase(mockRepo)
	ctx := context.Background()

	mockRepo.On("Create", ctx, mock.AnythingOfType("*domain.Warehouse")).Return(nil)

	req := domain.CreateWarehouseRequest{
		Name:     "Gudang Pusat",
		Location: "Jakarta",
		Address:  "Jl. Sudirman No 1",
	}

	result, err := uc.Create(ctx, req)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, "Gudang Pusat", result.Name)
	assert.Equal(t, "Jakarta", result.Location)
	assert.Equal(t, "Jl. Sudirman No 1", result.Address)
	mockRepo.AssertExpectations(t)
}

func TestCreateWarehouse_RepoError(t *testing.T) {
	mockRepo := new(MockWarehouseRepository)
	uc := NewWarehouseUsecase(mockRepo)
	ctx := context.Background()

	mockRepo.On("Create", ctx, mock.AnythingOfType("*domain.Warehouse")).Return(errors.New("db error"))

	req := domain.CreateWarehouseRequest{
		Name:     "Gudang Baru",
		Location: "Bandung",
	}

	result, err := uc.Create(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Equal(t, "failed to create warehouse", err.Error())
}

func TestGetWarehouseByID_Success(t *testing.T) {
	mockRepo := new(MockWarehouseRepository)
	uc := NewWarehouseUsecase(mockRepo)
	ctx := context.Background()

	warehouseID := uuid.New()
	warehouse := &domain.Warehouse{
		ID:       warehouseID,
		Name:     "Gudang Pusat",
		Location: "Jakarta",
		Address:  "Jl. Sudirman No 1",
		IsActive: true,
	}
	mockRepo.On("GetByID", ctx, warehouseID).Return(warehouse, nil)

	result, err := uc.GetByID(ctx, warehouseID)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, warehouseID, result.ID)
	assert.Equal(t, "Gudang Pusat", result.Name)
	mockRepo.AssertExpectations(t)
}

func TestGetWarehouseByID_NotFound(t *testing.T) {
	mockRepo := new(MockWarehouseRepository)
	uc := NewWarehouseUsecase(mockRepo)
	ctx := context.Background()

	warehouseID := uuid.New()
	mockRepo.On("GetByID", ctx, warehouseID).Return(nil, errors.New("not found"))

	result, err := uc.GetByID(ctx, warehouseID)

	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Equal(t, "warehouse not found", err.Error())
}

func TestGetAllWarehouses_Success(t *testing.T) {
	mockRepo := new(MockWarehouseRepository)
	uc := NewWarehouseUsecase(mockRepo)
	ctx := context.Background()

	warehouses := []domain.Warehouse{
		{ID: uuid.New(), Name: "Gudang A", Location: "Jakarta"},
		{ID: uuid.New(), Name: "Gudang B", Location: "Bandung"},
		{ID: uuid.New(), Name: "Gudang C", Location: "Surabaya"},
	}
	mockRepo.On("GetAll", ctx, 20, 0).Return(warehouses, 3, nil)

	result, total, err := uc.GetAll(ctx, 20, 0)

	assert.NoError(t, err)
	assert.Len(t, result, 3)
	assert.Equal(t, 3, total)
	mockRepo.AssertExpectations(t)
}

func TestGetAllWarehouses_DefaultLimit(t *testing.T) {
	mockRepo := new(MockWarehouseRepository)
	uc := NewWarehouseUsecase(mockRepo)
	ctx := context.Background()

	warehouses := []domain.Warehouse{}
	// When limit is 0, should default to 20
	mockRepo.On("GetAll", ctx, 20, 0).Return(warehouses, 0, nil)

	result, total, err := uc.GetAll(ctx, 0, 0)

	assert.NoError(t, err)
	assert.Len(t, result, 0)
	assert.Equal(t, 0, total)
	mockRepo.AssertExpectations(t)
}

func TestUpdateWarehouse_Success(t *testing.T) {
	mockRepo := new(MockWarehouseRepository)
	uc := NewWarehouseUsecase(mockRepo)
	ctx := context.Background()

	warehouseID := uuid.New()
	warehouse := &domain.Warehouse{
		ID:       warehouseID,
		Name:     "Gudang Lama",
		Location: "Jakarta",
		Address:  "Jl. Lama",
		IsActive: true,
	}
	mockRepo.On("GetByID", ctx, warehouseID).Return(warehouse, nil)
	mockRepo.On("Update", ctx, warehouse).Return(nil)

	newName := "Gudang Baru"
	newLocation := "Bandung"
	req := domain.UpdateWarehouseRequest{
		Name:     &newName,
		Location: &newLocation,
	}

	result, err := uc.Update(ctx, warehouseID, req)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, "Gudang Baru", result.Name)
	assert.Equal(t, "Bandung", result.Location)
	// Address should remain unchanged
	assert.Equal(t, "Jl. Lama", result.Address)
	mockRepo.AssertExpectations(t)
}

func TestUpdateWarehouse_NotFound(t *testing.T) {
	mockRepo := new(MockWarehouseRepository)
	uc := NewWarehouseUsecase(mockRepo)
	ctx := context.Background()

	warehouseID := uuid.New()
	mockRepo.On("GetByID", ctx, warehouseID).Return(nil, errors.New("not found"))

	newName := "Test"
	req := domain.UpdateWarehouseRequest{Name: &newName}

	result, err := uc.Update(ctx, warehouseID, req)

	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Equal(t, "warehouse not found", err.Error())
}

func TestUpdateWarehouse_DeactivateWarehouse(t *testing.T) {
	mockRepo := new(MockWarehouseRepository)
	uc := NewWarehouseUsecase(mockRepo)
	ctx := context.Background()

	warehouseID := uuid.New()
	warehouse := &domain.Warehouse{
		ID:       warehouseID,
		Name:     "Gudang Aktif",
		IsActive: true,
	}
	mockRepo.On("GetByID", ctx, warehouseID).Return(warehouse, nil)
	mockRepo.On("Update", ctx, warehouse).Return(nil)

	inactive := false
	req := domain.UpdateWarehouseRequest{
		IsActive: &inactive,
	}

	result, err := uc.Update(ctx, warehouseID, req)

	assert.NoError(t, err)
	assert.False(t, result.IsActive)
}

func TestDeleteWarehouse_Success(t *testing.T) {
	mockRepo := new(MockWarehouseRepository)
	uc := NewWarehouseUsecase(mockRepo)
	ctx := context.Background()

	warehouseID := uuid.New()
	warehouse := &domain.Warehouse{ID: warehouseID, Name: "Gudang Test"}
	mockRepo.On("GetByID", ctx, warehouseID).Return(warehouse, nil)
	mockRepo.On("Delete", ctx, warehouseID).Return(nil)

	err := uc.Delete(ctx, warehouseID)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestDeleteWarehouse_NotFound(t *testing.T) {
	mockRepo := new(MockWarehouseRepository)
	uc := NewWarehouseUsecase(mockRepo)
	ctx := context.Background()

	warehouseID := uuid.New()
	mockRepo.On("GetByID", ctx, warehouseID).Return(nil, errors.New("not found"))

	err := uc.Delete(ctx, warehouseID)

	assert.Error(t, err)
	assert.Equal(t, "warehouse not found", err.Error())
}
