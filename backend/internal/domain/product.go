package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type Product struct {
	ID          uuid.UUID `json:"id"`
	SKU         string    `json:"sku"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	Unit        string    `json:"unit"`
	Price       float64   `json:"price"`
	MinStock    int       `json:"min_stock"`
	MaxStock    int       `json:"max_stock"`
	ImageURL    string    `json:"image_url,omitempty"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CreateProductRequest struct {
	SKU         string  `json:"sku"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Category    string  `json:"category"`
	Unit        string  `json:"unit"`
	Price       float64 `json:"price"`
	MinStock    int     `json:"min_stock"`
	MaxStock    int     `json:"max_stock"`
}

type UpdateProductRequest struct {
	Name        *string  `json:"name,omitempty"`
	Description *string  `json:"description,omitempty"`
	Category    *string  `json:"category,omitempty"`
	Unit        *string  `json:"unit,omitempty"`
	Price       *float64 `json:"price,omitempty"`
	MinStock    *int     `json:"min_stock,omitempty"`
	MaxStock    *int     `json:"max_stock,omitempty"`
	IsActive    *bool    `json:"is_active,omitempty"`
}

type ProductFilter struct {
	Search   string
	Category string
	IsActive *bool
	Limit    int
	Offset   int
}

type ProductRepository interface {
	Create(ctx context.Context, product *Product) error
	GetByID(ctx context.Context, id uuid.UUID) (*Product, error)
	GetBySKU(ctx context.Context, sku string) (*Product, error)
	GetAll(ctx context.Context, filter ProductFilter) ([]Product, int, error)
	Update(ctx context.Context, product *Product) error
	Delete(ctx context.Context, id uuid.UUID) error
}
