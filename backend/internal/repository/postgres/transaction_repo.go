package postgres

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/stokku-ai/backend/internal/domain"
)

type transactionRepository struct {
	pool *pgxpool.Pool
}

func NewTransactionRepository(pool *pgxpool.Pool) domain.TransactionRepository {
	return &transactionRepository{pool: pool}
}

func (r *transactionRepository) Create(ctx context.Context, tx *domain.Transaction) error {
	tx.ID = uuid.New()
	query := `INSERT INTO transactions (id, warehouse_id, product_id, type, quantity, reference, notes, performed_by, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`

	_, err := r.pool.Exec(ctx, query,
		tx.ID, tx.WarehouseID, tx.ProductID, tx.Type, tx.Quantity,
		tx.Reference, tx.Notes, tx.PerformedBy, tx.CreatedAt,
	)
	return err
}

func (r *transactionRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.TransactionView, error) {
	tv := &domain.TransactionView{}
	query := `SELECT t.id, t.warehouse_id, t.product_id, t.type, t.quantity, t.reference, t.notes, t.performed_by, t.created_at,
		p.name, p.sku, w.name, u.name
		FROM transactions t
		JOIN products p ON p.id = t.product_id
		JOIN warehouses w ON w.id = t.warehouse_id
		JOIN users u ON u.id = t.performed_by
		WHERE t.id = $1`

	err := r.pool.QueryRow(ctx, query, id).Scan(
		&tv.ID, &tv.WarehouseID, &tv.ProductID, &tv.Type, &tv.Quantity,
		&tv.Reference, &tv.Notes, &tv.PerformedBy, &tv.CreatedAt,
		&tv.ProductName, &tv.ProductSKU, &tv.WarehouseName, &tv.PerformerName,
	)
	if err != nil {
		return nil, err
	}
	return tv, nil
}

func (r *transactionRepository) GetAll(ctx context.Context, filter domain.TransactionFilter) ([]domain.TransactionView, int, error) {
	var conditions []string
	var args []interface{}
	argIdx := 1

	if filter.WarehouseID != nil {
		conditions = append(conditions, fmt.Sprintf("t.warehouse_id = $%d", argIdx))
		args = append(args, *filter.WarehouseID)
		argIdx++
	}
	if filter.ProductID != nil {
		conditions = append(conditions, fmt.Sprintf("t.product_id = $%d", argIdx))
		args = append(args, *filter.ProductID)
		argIdx++
	}
	if filter.Type != nil {
		conditions = append(conditions, fmt.Sprintf("t.type = $%d", argIdx))
		args = append(args, *filter.Type)
		argIdx++
	}
	if filter.StartDate != nil {
		conditions = append(conditions, fmt.Sprintf("t.created_at >= $%d", argIdx))
		args = append(args, *filter.StartDate)
		argIdx++
	}
	if filter.EndDate != nil {
		conditions = append(conditions, fmt.Sprintf("t.created_at <= $%d", argIdx))
		args = append(args, *filter.EndDate)
		argIdx++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	var total int
	countQ := fmt.Sprintf(`SELECT COUNT(*) FROM transactions t %s`, whereClause)
	if err := r.pool.QueryRow(ctx, countQ, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := fmt.Sprintf(`SELECT t.id, t.warehouse_id, t.product_id, t.type, t.quantity, t.reference, t.notes, t.performed_by, t.created_at,
		p.name, p.sku, w.name, u.name
		FROM transactions t
		JOIN products p ON p.id = t.product_id
		JOIN warehouses w ON w.id = t.warehouse_id
		JOIN users u ON u.id = t.performed_by
		%s ORDER BY t.created_at DESC LIMIT $%d OFFSET $%d`, whereClause, argIdx, argIdx+1)

	args = append(args, filter.Limit, filter.Offset)
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var txs []domain.TransactionView
	for rows.Next() {
		var tv domain.TransactionView
		if err := rows.Scan(&tv.ID, &tv.WarehouseID, &tv.ProductID, &tv.Type, &tv.Quantity,
			&tv.Reference, &tv.Notes, &tv.PerformedBy, &tv.CreatedAt,
			&tv.ProductName, &tv.ProductSKU, &tv.WarehouseName, &tv.PerformerName); err != nil {
			return nil, 0, err
		}
		txs = append(txs, tv)
	}
	return txs, total, nil
}

func (r *transactionRepository) GetRecentByWarehouse(ctx context.Context, warehouseID uuid.UUID, limit int) ([]domain.TransactionView, error) {
	query := `SELECT t.id, t.warehouse_id, t.product_id, t.type, t.quantity, t.reference, t.notes, t.performed_by, t.created_at,
		p.name, p.sku, w.name, u.name
		FROM transactions t
		JOIN products p ON p.id = t.product_id
		JOIN warehouses w ON w.id = t.warehouse_id
		JOIN users u ON u.id = t.performed_by
		WHERE t.warehouse_id = $1
		ORDER BY t.created_at DESC LIMIT $2`

	rows, err := r.pool.Query(ctx, query, warehouseID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var txs []domain.TransactionView
	for rows.Next() {
		var tv domain.TransactionView
		if err := rows.Scan(&tv.ID, &tv.WarehouseID, &tv.ProductID, &tv.Type, &tv.Quantity,
			&tv.Reference, &tv.Notes, &tv.PerformedBy, &tv.CreatedAt,
			&tv.ProductName, &tv.ProductSKU, &tv.WarehouseName, &tv.PerformerName); err != nil {
			return nil, err
		}
		txs = append(txs, tv)
	}
	return txs, nil
}
