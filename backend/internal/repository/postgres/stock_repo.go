package postgres

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/stokku-ai/backend/internal/domain"
)

type stockRepository struct {
	pool *pgxpool.Pool
}

func NewStockRepository(pool *pgxpool.Pool) domain.StockRepository {
	return &stockRepository{pool: pool}
}

func (r *stockRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.StockView, error) {
	sv := &domain.StockView{}
	query := `SELECT s.id, s.warehouse_id, s.product_id, s.quantity, s.updated_at,
		p.name, p.sku, w.name, p.price, p.min_stock, (s.quantity * p.price)
		FROM stocks s
		JOIN products p ON p.id = s.product_id
		JOIN warehouses w ON w.id = s.warehouse_id
		WHERE s.id = $1`

	err := r.pool.QueryRow(ctx, query, id).Scan(
		&sv.ID, &sv.WarehouseID, &sv.ProductID, &sv.Quantity, &sv.UpdatedAt,
		&sv.ProductName, &sv.ProductSKU, &sv.WarehouseName,
		&sv.Price, &sv.MinStock, &sv.TotalValue,
	)
	if err != nil {
		return nil, err
	}
	return sv, nil
}

func (r *stockRepository) GetByWarehouseAndProduct(ctx context.Context, warehouseID, productID uuid.UUID) (*domain.Stock, error) {
	s := &domain.Stock{}
	query := `SELECT id, warehouse_id, product_id, quantity, updated_at
		FROM stocks WHERE warehouse_id = $1 AND product_id = $2`

	err := r.pool.QueryRow(ctx, query, warehouseID, productID).Scan(
		&s.ID, &s.WarehouseID, &s.ProductID, &s.Quantity, &s.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return s, nil
}

func (r *stockRepository) Upsert(ctx context.Context, stock *domain.Stock) error {
	stock.UpdatedAt = time.Now()
	if stock.ID == uuid.Nil {
		stock.ID = uuid.New()
	}

	query := `INSERT INTO stocks (id, warehouse_id, product_id, quantity, updated_at)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (warehouse_id, product_id) DO UPDATE SET quantity = $4, updated_at = $5`

	_, err := r.pool.Exec(ctx, query,
		stock.ID, stock.WarehouseID, stock.ProductID, stock.Quantity, stock.UpdatedAt,
	)
	return err
}

func (r *stockRepository) GetByWarehouse(ctx context.Context, warehouseID uuid.UUID, limit, offset int) ([]domain.StockView, int, error) {
	var total int
	countQ := `SELECT COUNT(*) FROM stocks WHERE warehouse_id = $1`
	if err := r.pool.QueryRow(ctx, countQ, warehouseID).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := `SELECT s.id, s.warehouse_id, s.product_id, s.quantity, s.updated_at,
		p.name, p.sku, w.name, p.price, p.min_stock, (s.quantity * p.price)
		FROM stocks s
		JOIN products p ON p.id = s.product_id
		JOIN warehouses w ON w.id = s.warehouse_id
		WHERE s.warehouse_id = $1
		ORDER BY p.name LIMIT $2 OFFSET $3`

	rows, err := r.pool.Query(ctx, query, warehouseID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var stocks []domain.StockView
	for rows.Next() {
		var sv domain.StockView
		if err := rows.Scan(&sv.ID, &sv.WarehouseID, &sv.ProductID, &sv.Quantity,
			&sv.UpdatedAt, &sv.ProductName, &sv.ProductSKU, &sv.WarehouseName,
			&sv.Price, &sv.MinStock, &sv.TotalValue); err != nil {
			return nil, 0, err
		}
		stocks = append(stocks, sv)
	}
	return stocks, total, nil
}

func (r *stockRepository) GetAllStocks(ctx context.Context, filter domain.StockFilter) ([]domain.StockView, int, error) {
	var conditions []string
	var args []interface{}
	argIdx := 1

	if filter.WarehouseID != nil {
		conditions = append(conditions, fmt.Sprintf("s.warehouse_id = $%d", argIdx))
		args = append(args, *filter.WarehouseID)
		argIdx++
	}
	if filter.Search != "" {
		conditions = append(conditions, fmt.Sprintf("(p.name ILIKE $%d OR p.sku ILIKE $%d)", argIdx, argIdx))
		args = append(args, "%"+filter.Search+"%")
		argIdx++
	}
	if filter.LowStock {
		conditions = append(conditions, "s.quantity <= p.min_stock")
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	var total int
	countQ := fmt.Sprintf(`SELECT COUNT(*) FROM stocks s JOIN products p ON p.id = s.product_id %s`, whereClause)
	if err := r.pool.QueryRow(ctx, countQ, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := fmt.Sprintf(`SELECT s.id, s.warehouse_id, s.product_id, s.quantity, s.updated_at,
		p.name, p.sku, w.name, p.price, p.min_stock, (s.quantity * p.price)
		FROM stocks s
		JOIN products p ON p.id = s.product_id
		JOIN warehouses w ON w.id = s.warehouse_id
		%s ORDER BY p.name LIMIT $%d OFFSET $%d`, whereClause, argIdx, argIdx+1)

	args = append(args, filter.Limit, filter.Offset)
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var stocks []domain.StockView
	for rows.Next() {
		var sv domain.StockView
		if err := rows.Scan(&sv.ID, &sv.WarehouseID, &sv.ProductID, &sv.Quantity,
			&sv.UpdatedAt, &sv.ProductName, &sv.ProductSKU, &sv.WarehouseName,
			&sv.Price, &sv.MinStock, &sv.TotalValue); err != nil {
			return nil, 0, err
		}
		stocks = append(stocks, sv)
	}
	return stocks, total, nil
}

func (r *stockRepository) GetLowStockItems(ctx context.Context, limit int) ([]domain.StockView, error) {
	query := `SELECT s.id, s.warehouse_id, s.product_id, s.quantity, s.updated_at,
		p.name, p.sku, w.name, p.price, p.min_stock, (s.quantity * p.price)
		FROM stocks s
		JOIN products p ON p.id = s.product_id
		JOIN warehouses w ON w.id = s.warehouse_id
		WHERE s.quantity <= p.min_stock AND s.quantity > 0
		ORDER BY (s.quantity::float / NULLIF(p.min_stock, 0)) ASC
		LIMIT $1`

	rows, err := r.pool.Query(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stocks []domain.StockView
	for rows.Next() {
		var sv domain.StockView
		if err := rows.Scan(&sv.ID, &sv.WarehouseID, &sv.ProductID, &sv.Quantity,
			&sv.UpdatedAt, &sv.ProductName, &sv.ProductSKU, &sv.WarehouseName,
			&sv.Price, &sv.MinStock, &sv.TotalValue); err != nil {
			return nil, err
		}
		stocks = append(stocks, sv)
	}
	return stocks, nil
}

func (r *stockRepository) GetDeadStock(ctx context.Context, daysSinceLastMove int, limit int) ([]domain.StockView, error) {
	query := `SELECT s.id, s.warehouse_id, s.product_id, s.quantity, s.updated_at,
		p.name, p.sku, w.name, p.price, p.min_stock, (s.quantity * p.price)
		FROM stocks s
		JOIN products p ON p.id = s.product_id
		JOIN warehouses w ON w.id = s.warehouse_id
		WHERE s.quantity > 0
		AND NOT EXISTS (
			SELECT 1 FROM transactions t
			WHERE t.product_id = s.product_id
			AND t.warehouse_id = s.warehouse_id
			AND t.created_at > NOW() - INTERVAL '1 day' * $1
		)
		ORDER BY s.updated_at ASC
		LIMIT $2`

	rows, err := r.pool.Query(ctx, query, daysSinceLastMove, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stocks []domain.StockView
	for rows.Next() {
		var sv domain.StockView
		if err := rows.Scan(&sv.ID, &sv.WarehouseID, &sv.ProductID, &sv.Quantity,
			&sv.UpdatedAt, &sv.ProductName, &sv.ProductSKU, &sv.WarehouseName,
			&sv.Price, &sv.MinStock, &sv.TotalValue); err != nil {
			return nil, err
		}
		stocks = append(stocks, sv)
	}
	return stocks, nil
}

func (r *stockRepository) GetTotalStockValue(ctx context.Context, warehouseID *uuid.UUID) (float64, error) {
	var value float64
	if warehouseID != nil {
		err := r.pool.QueryRow(ctx,
			`SELECT COALESCE(SUM(s.quantity * p.price), 0) FROM stocks s JOIN products p ON p.id = s.product_id WHERE s.warehouse_id = $1`,
			*warehouseID).Scan(&value)
		return value, err
	}
	err := r.pool.QueryRow(ctx,
		`SELECT COALESCE(SUM(s.quantity * p.price), 0) FROM stocks s JOIN products p ON p.id = s.product_id`).Scan(&value)
	return value, err
}
