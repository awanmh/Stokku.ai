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

type productRepository struct {
	pool *pgxpool.Pool
}

func NewProductRepository(pool *pgxpool.Pool) domain.ProductRepository {
	return &productRepository{pool: pool}
}

func (r *productRepository) Create(ctx context.Context, product *domain.Product) error {
	product.ID = uuid.New()
	product.IsActive = true
	product.CreatedAt = time.Now()
	product.UpdatedAt = time.Now()

	query := `INSERT INTO products (id, sku, name, description, category, unit, price, min_stock, max_stock, image_url, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`

	_, err := r.pool.Exec(ctx, query,
		product.ID, product.SKU, product.Name, product.Description,
		product.Category, product.Unit, product.Price, product.MinStock,
		product.MaxStock, product.ImageURL, product.IsActive,
		product.CreatedAt, product.UpdatedAt,
	)
	return err
}

func (r *productRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Product, error) {
	product := &domain.Product{}
	query := `SELECT id, sku, name, description, category, unit, price, min_stock, max_stock, image_url, is_active, created_at, updated_at
		FROM products WHERE id = $1`

	err := r.pool.QueryRow(ctx, query, id).Scan(
		&product.ID, &product.SKU, &product.Name, &product.Description,
		&product.Category, &product.Unit, &product.Price, &product.MinStock,
		&product.MaxStock, &product.ImageURL, &product.IsActive,
		&product.CreatedAt, &product.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return product, nil
}

func (r *productRepository) GetBySKU(ctx context.Context, sku string) (*domain.Product, error) {
	product := &domain.Product{}
	query := `SELECT id, sku, name, description, category, unit, price, min_stock, max_stock, image_url, is_active, created_at, updated_at
		FROM products WHERE sku = $1`

	err := r.pool.QueryRow(ctx, query, sku).Scan(
		&product.ID, &product.SKU, &product.Name, &product.Description,
		&product.Category, &product.Unit, &product.Price, &product.MinStock,
		&product.MaxStock, &product.ImageURL, &product.IsActive,
		&product.CreatedAt, &product.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return product, nil
}

func (r *productRepository) GetAll(ctx context.Context, filter domain.ProductFilter) ([]domain.Product, int, error) {
	var conditions []string
	var args []interface{}
	argIdx := 1

	if filter.Search != "" {
		conditions = append(conditions, fmt.Sprintf("(name ILIKE $%d OR sku ILIKE $%d)", argIdx, argIdx))
		args = append(args, "%"+filter.Search+"%")
		argIdx++
	}
	if filter.Category != "" {
		conditions = append(conditions, fmt.Sprintf("category = $%d", argIdx))
		args = append(args, filter.Category)
		argIdx++
	}
	if filter.IsActive != nil {
		conditions = append(conditions, fmt.Sprintf("is_active = $%d", argIdx))
		args = append(args, *filter.IsActive)
		argIdx++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	var total int
	countQuery := "SELECT COUNT(*) FROM products " + whereClause
	if err := r.pool.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := fmt.Sprintf(`SELECT id, sku, name, description, category, unit, price, min_stock, max_stock, image_url, is_active, created_at, updated_at
		FROM products %s ORDER BY created_at DESC LIMIT $%d OFFSET $%d`, whereClause, argIdx, argIdx+1)

	args = append(args, filter.Limit, filter.Offset)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var products []domain.Product
	for rows.Next() {
		var p domain.Product
		if err := rows.Scan(&p.ID, &p.SKU, &p.Name, &p.Description,
			&p.Category, &p.Unit, &p.Price, &p.MinStock, &p.MaxStock,
			&p.ImageURL, &p.IsActive, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, 0, err
		}
		products = append(products, p)
	}
	return products, total, nil
}

func (r *productRepository) Update(ctx context.Context, product *domain.Product) error {
	product.UpdatedAt = time.Now()
	query := `UPDATE products SET name=$2, description=$3, category=$4, unit=$5, price=$6,
		min_stock=$7, max_stock=$8, is_active=$9, updated_at=$10 WHERE id=$1`

	_, err := r.pool.Exec(ctx, query,
		product.ID, product.Name, product.Description, product.Category,
		product.Unit, product.Price, product.MinStock, product.MaxStock,
		product.IsActive, product.UpdatedAt,
	)
	return err
}

func (r *productRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM products WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, id)
	return err
}
