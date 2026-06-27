package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type TransactionType string

const (
	TxTypeStockIn  TransactionType = "stock_in"
	TxTypeStockOut TransactionType = "stock_out"
)

type Transaction struct {
	ID            uuid.UUID       `json:"id"`
	WarehouseID   uuid.UUID       `json:"warehouse_id"`
	ProductID     uuid.UUID       `json:"product_id"`
	Type          TransactionType `json:"type"`
	Quantity      int             `json:"quantity"`
	Reference     string          `json:"reference"`
	Notes         string          `json:"notes"`
	PerformedBy   uuid.UUID       `json:"performed_by"`
	CreatedAt     time.Time       `json:"created_at"`
}

type TransactionView struct {
	Transaction
	ProductName   string `json:"product_name"`
	ProductSKU    string `json:"product_sku"`
	WarehouseName string `json:"warehouse_name"`
	PerformerName string `json:"performer_name"`
}

type CreateTransactionRequest struct {
	WarehouseID uuid.UUID       `json:"warehouse_id"`
	ProductID   uuid.UUID       `json:"product_id"`
	Type        TransactionType `json:"type"`
	Quantity    int             `json:"quantity"`
	Reference   string          `json:"reference"`
	Notes       string          `json:"notes"`
}

type TransactionFilter struct {
	WarehouseID *uuid.UUID
	ProductID   *uuid.UUID
	Type        *TransactionType
	StartDate   *time.Time
	EndDate     *time.Time
	Limit       int
	Offset      int
}

type TransactionRepository interface {
	Create(ctx context.Context, tx *Transaction) error
	GetByID(ctx context.Context, id uuid.UUID) (*TransactionView, error)
	GetAll(ctx context.Context, filter TransactionFilter) ([]TransactionView, int, error)
	GetRecentByWarehouse(ctx context.Context, warehouseID uuid.UUID, limit int) ([]TransactionView, error)
}

// DashboardStats holds aggregated dashboard metrics
type WeeklyActivity struct {
	Name     string `json:"name"`
	StockIn  int    `json:"stockIn"`
	StockOut int    `json:"stockOut"`
}

type TopProduct struct {
	Name  string `json:"name"`
	Value int    `json:"value"`
}

type DashboardStats struct {
	TotalProducts   int              `json:"total_products"`
	TotalWarehouses int              `json:"total_warehouses"`
	TotalStockValue float64          `json:"total_stock_value"`
	LowStockCount   int              `json:"low_stock_count"`
	DeadStockCount  int              `json:"dead_stock_count"`
	TodayTxCount    int              `json:"today_tx_count"`
	WeeklyActivity  []WeeklyActivity `json:"weekly_activity"`
	TopProducts     []TopProduct     `json:"top_products"`
}

// LockRepository for distributed locking via Redis
type LockRepository interface {
	AcquireLock(ctx context.Context, key string, ttl time.Duration) (bool, error)
	ReleaseLock(ctx context.Context, key string) error
}
