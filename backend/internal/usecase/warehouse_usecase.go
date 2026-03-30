package usecase

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/stokku-ai/backend/internal/domain"
)

type WarehouseUsecase struct {
	warehouseRepo domain.WarehouseRepository
}

func NewWarehouseUsecase(warehouseRepo domain.WarehouseRepository) *WarehouseUsecase {
	return &WarehouseUsecase{warehouseRepo: warehouseRepo}
}

func (uc *WarehouseUsecase) Create(ctx context.Context, req domain.CreateWarehouseRequest) (*domain.Warehouse, error) {
	wh := &domain.Warehouse{
		Name:     req.Name,
		Location: req.Location,
		Address:  req.Address,
	}
	if err := uc.warehouseRepo.Create(ctx, wh); err != nil {
		return nil, errors.New("failed to create warehouse")
	}
	return wh, nil
}

func (uc *WarehouseUsecase) GetByID(ctx context.Context, id uuid.UUID) (*domain.Warehouse, error) {
	wh, err := uc.warehouseRepo.GetByID(ctx, id)
	if err != nil {
		return nil, errors.New("warehouse not found")
	}
	return wh, nil
}

func (uc *WarehouseUsecase) GetAll(ctx context.Context, limit, offset int) ([]domain.Warehouse, int, error) {
	if limit <= 0 {
		limit = 20
	}
	return uc.warehouseRepo.GetAll(ctx, limit, offset)
}

func (uc *WarehouseUsecase) Update(ctx context.Context, id uuid.UUID, req domain.UpdateWarehouseRequest) (*domain.Warehouse, error) {
	wh, err := uc.warehouseRepo.GetByID(ctx, id)
	if err != nil {
		return nil, errors.New("warehouse not found")
	}

	if req.Name != nil {
		wh.Name = *req.Name
	}
	if req.Location != nil {
		wh.Location = *req.Location
	}
	if req.Address != nil {
		wh.Address = *req.Address
	}
	if req.IsActive != nil {
		wh.IsActive = *req.IsActive
	}

	if err := uc.warehouseRepo.Update(ctx, wh); err != nil {
		return nil, errors.New("failed to update warehouse")
	}
	return wh, nil
}

func (uc *WarehouseUsecase) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := uc.warehouseRepo.GetByID(ctx, id)
	if err != nil {
		return errors.New("warehouse not found")
	}
	return uc.warehouseRepo.Delete(ctx, id)
}
