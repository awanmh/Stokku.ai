package postgres

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/stokku-ai/backend/internal/domain"
)

type warehouseRepository struct {
	pool *pgxpool.Pool
}

func NewWarehouseRepository(pool *pgxpool.Pool) domain.WarehouseRepository {
	return &warehouseRepository{pool: pool}
}

func (r *warehouseRepository) Create(ctx context.Context, warehouse *domain.Warehouse) error {
	warehouse.ID = uuid.New()
	warehouse.IsActive = true
	warehouse.CreatedAt = time.Now()
	warehouse.UpdatedAt = time.Now()

	query := `INSERT INTO warehouses (id, name, location, address, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)`

	_, err := r.pool.Exec(ctx, query,
		warehouse.ID, warehouse.Name, warehouse.Location, warehouse.Address,
		warehouse.IsActive, warehouse.CreatedAt, warehouse.UpdatedAt,
	)
	return err
}

func (r *warehouseRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Warehouse, error) {
	wh := &domain.Warehouse{}
	query := `SELECT id, name, location, address, is_active, created_at, updated_at
		FROM warehouses WHERE id = $1`

	err := r.pool.QueryRow(ctx, query, id).Scan(
		&wh.ID, &wh.Name, &wh.Location, &wh.Address,
		&wh.IsActive, &wh.CreatedAt, &wh.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return wh, nil
}

func (r *warehouseRepository) GetAll(ctx context.Context, limit, offset int) ([]domain.Warehouse, int, error) {
	var total int
	if err := r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM warehouses`).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := `SELECT id, name, location, address, is_active, created_at, updated_at
		FROM warehouses ORDER BY created_at DESC LIMIT $1 OFFSET $2`

	rows, err := r.pool.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var warehouses []domain.Warehouse
	for rows.Next() {
		var wh domain.Warehouse
		if err := rows.Scan(&wh.ID, &wh.Name, &wh.Location, &wh.Address,
			&wh.IsActive, &wh.CreatedAt, &wh.UpdatedAt); err != nil {
			return nil, 0, err
		}
		warehouses = append(warehouses, wh)
	}
	return warehouses, total, nil
}

func (r *warehouseRepository) Update(ctx context.Context, warehouse *domain.Warehouse) error {
	warehouse.UpdatedAt = time.Now()
	query := `UPDATE warehouses SET name=$2, location=$3, address=$4, is_active=$5, updated_at=$6
		WHERE id=$1`

	_, err := r.pool.Exec(ctx, query,
		warehouse.ID, warehouse.Name, warehouse.Location, warehouse.Address,
		warehouse.IsActive, warehouse.UpdatedAt,
	)
	return err
}

func (r *warehouseRepository) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM warehouses WHERE id = $1`, id)
	return err
}
