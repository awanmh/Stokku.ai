package usecase

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/stokku-ai/backend/internal/domain"
)

type TransactionUsecase struct {
	txRepo    domain.TransactionRepository
	stockRepo domain.StockRepository
	lockRepo  domain.LockRepository
}

func NewTransactionUsecase(
	txRepo domain.TransactionRepository,
	stockRepo domain.StockRepository,
	lockRepo domain.LockRepository,
) *TransactionUsecase {
	return &TransactionUsecase{
		txRepo:    txRepo,
		stockRepo: stockRepo,
		lockRepo:  lockRepo,
	}
}

// CreateTransaction handles stock_in/stock_out with Redis distributed lock to prevent race conditions.
func (uc *TransactionUsecase) CreateTransaction(ctx context.Context, req domain.CreateTransactionRequest, performedBy uuid.UUID) (*domain.Transaction, error) {
	if req.Quantity <= 0 {
		return nil, errors.New("quantity must be positive")
	}

	// Acquire distributed lock on the specific warehouse+product combination
	lockKey := fmt.Sprintf("stock:%s:%s", req.WarehouseID.String(), req.ProductID.String())
	acquired, err := uc.lockRepo.AcquireLock(ctx, lockKey, 10*time.Second)
	if err != nil {
		return nil, fmt.Errorf("failed to acquire lock: %w", err)
	}
	if !acquired {
		return nil, errors.New("stock is being modified by another process, please try again")
	}
	defer uc.lockRepo.ReleaseLock(ctx, lockKey)

	// Get current stock (or create new if not exists)
	stock, err := uc.stockRepo.GetByWarehouseAndProduct(ctx, req.WarehouseID, req.ProductID)
	if err != nil {
		// Stock record doesn't exist yet — initialize
		stock = &domain.Stock{
			WarehouseID: req.WarehouseID,
			ProductID:   req.ProductID,
			Quantity:    0,
		}
	}

	// Apply mutation
	switch req.Type {
	case domain.TxTypeStockIn:
		stock.Quantity += req.Quantity
	case domain.TxTypeStockOut:
		if stock.Quantity < req.Quantity {
			return nil, fmt.Errorf("insufficient stock: have %d, requested %d", stock.Quantity, req.Quantity)
		}
		stock.Quantity -= req.Quantity
	default:
		return nil, errors.New("invalid transaction type")
	}

	// Persist stock update
	if err := uc.stockRepo.Upsert(ctx, stock); err != nil {
		return nil, fmt.Errorf("failed to update stock: %w", err)
	}

	// Record transaction
	tx := &domain.Transaction{
		WarehouseID: req.WarehouseID,
		ProductID:   req.ProductID,
		Type:        req.Type,
		Quantity:    req.Quantity,
		Reference:   req.Reference,
		Notes:       req.Notes,
		PerformedBy: performedBy,
		CreatedAt:   time.Now(),
	}

	if err := uc.txRepo.Create(ctx, tx); err != nil {
		return nil, fmt.Errorf("failed to record transaction: %w", err)
	}

	return tx, nil
}

func (uc *TransactionUsecase) GetByID(ctx context.Context, id uuid.UUID) (*domain.TransactionView, error) {
	return uc.txRepo.GetByID(ctx, id)
}

func (uc *TransactionUsecase) GetAll(ctx context.Context, filter domain.TransactionFilter) ([]domain.TransactionView, int, error) {
	if filter.Limit <= 0 {
		filter.Limit = 20
	}
	return uc.txRepo.GetAll(ctx, filter)
}

func (uc *TransactionUsecase) GetInventory(ctx context.Context, filter domain.StockFilter) ([]domain.StockView, int, error) {
	if filter.Limit <= 0 {
		filter.Limit = 20
	}
	return uc.stockRepo.GetAllStocks(ctx, filter)
}
