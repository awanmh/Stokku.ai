package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type Warehouse struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	Location  string    `json:"location"`
	Address   string    `json:"address"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreateWarehouseRequest struct {
	Name     string `json:"name"`
	Location string `json:"location"`
	Address  string `json:"address"`
}

type UpdateWarehouseRequest struct {
	Name     *string `json:"name,omitempty"`
	Location *string `json:"location,omitempty"`
	Address  *string `json:"address,omitempty"`
	IsActive *bool   `json:"is_active,omitempty"`
}

type WarehouseRepository interface {
	Create(ctx context.Context, warehouse *Warehouse) error
	GetByID(ctx context.Context, id uuid.UUID) (*Warehouse, error)
	GetAll(ctx context.Context, limit, offset int) ([]Warehouse, int, error)
	Update(ctx context.Context, warehouse *Warehouse) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// Stock represents the quantity of a product in a specific warehouse
type Stock struct {
	ID          uuid.UUID `json:"id"`
	WarehouseID uuid.UUID `json:"warehouse_id"`
	ProductID   uuid.UUID `json:"product_id"`
	Quantity    int       `json:"quantity"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type StockView struct {
	Stock
	ProductName   string `json:"product_name"`
	ProductSKU    string `json:"product_sku"`
	WarehouseName string `json:"warehouse_name"`
	Price         float64 `json:"price"`
	MinStock      int    `json:"min_stock"`
	TotalValue    float64 `json:"total_value"`
}

type StockRepository interface {
	GetByID(ctx context.Context, id uuid.UUID) (*StockView, error)
	GetByWarehouseAndProduct(ctx context.Context, warehouseID, productID uuid.UUID) (*Stock, error)
	Upsert(ctx context.Context, stock *Stock) error
	GetByWarehouse(ctx context.Context, warehouseID uuid.UUID, limit, offset int) ([]StockView, int, error)
	GetAllStocks(ctx context.Context, filter StockFilter) ([]StockView, int, error)
	GetLowStockItems(ctx context.Context, limit int) ([]StockView, error)
	GetDeadStock(ctx context.Context, daysSinceLastMove int, limit int) ([]StockView, error)
	GetTotalStockValue(ctx context.Context, warehouseID *uuid.UUID) (float64, error)
}

type StockFilter struct {
	WarehouseID *uuid.UUID
	Search      string
	LowStock    bool
	Limit       int
	Offset      int
}
