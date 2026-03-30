package usecase

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/stokku-ai/backend/internal/domain"
)

type ProductUsecase struct {
	productRepo domain.ProductRepository
}

func NewProductUsecase(productRepo domain.ProductRepository) *ProductUsecase {
	return &ProductUsecase{productRepo: productRepo}
}

func (uc *ProductUsecase) Create(ctx context.Context, req domain.CreateProductRequest) (*domain.Product, error) {
	existing, _ := uc.productRepo.GetBySKU(ctx, req.SKU)
	if existing != nil {
		return nil, errors.New("SKU already exists")
	}

	product := &domain.Product{
		SKU:         req.SKU,
		Name:        req.Name,
		Description: req.Description,
		Category:    req.Category,
		Unit:        req.Unit,
		Price:       req.Price,
		MinStock:    req.MinStock,
		MaxStock:    req.MaxStock,
	}

	if err := uc.productRepo.Create(ctx, product); err != nil {
		return nil, errors.New("failed to create product")
	}
	return product, nil
}

func (uc *ProductUsecase) GetByID(ctx context.Context, id uuid.UUID) (*domain.Product, error) {
	product, err := uc.productRepo.GetByID(ctx, id)
	if err != nil {
		return nil, errors.New("product not found")
	}
	return product, nil
}

func (uc *ProductUsecase) GetAll(ctx context.Context, filter domain.ProductFilter) ([]domain.Product, int, error) {
	if filter.Limit <= 0 {
		filter.Limit = 20
	}
	return uc.productRepo.GetAll(ctx, filter)
}

func (uc *ProductUsecase) Update(ctx context.Context, id uuid.UUID, req domain.UpdateProductRequest) (*domain.Product, error) {
	product, err := uc.productRepo.GetByID(ctx, id)
	if err != nil {
		return nil, errors.New("product not found")
	}

	if req.Name != nil {
		product.Name = *req.Name
	}
	if req.Description != nil {
		product.Description = *req.Description
	}
	if req.Category != nil {
		product.Category = *req.Category
	}
	if req.Unit != nil {
		product.Unit = *req.Unit
	}
	if req.Price != nil {
		product.Price = *req.Price
	}
	if req.MinStock != nil {
		product.MinStock = *req.MinStock
	}
	if req.MaxStock != nil {
		product.MaxStock = *req.MaxStock
	}
	if req.IsActive != nil {
		product.IsActive = *req.IsActive
	}

	if err := uc.productRepo.Update(ctx, product); err != nil {
		return nil, errors.New("failed to update product")
	}
	return product, nil
}

func (uc *ProductUsecase) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := uc.productRepo.GetByID(ctx, id)
	if err != nil {
		return errors.New("product not found")
	}
	return uc.productRepo.Delete(ctx, id)
}
