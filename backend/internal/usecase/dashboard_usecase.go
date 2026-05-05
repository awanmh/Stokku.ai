package usecase

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/stokku-ai/backend/internal/domain"
)

type DashboardUsecase struct {
	pool      *pgxpool.Pool
	stockRepo domain.StockRepository
}

func NewDashboardUsecase(pool *pgxpool.Pool, stockRepo domain.StockRepository) *DashboardUsecase {
	return &DashboardUsecase{pool: pool, stockRepo: stockRepo}
}

func (uc *DashboardUsecase) GetStats(ctx context.Context) (*domain.DashboardStats, error) {
	stats := &domain.DashboardStats{}

	// Total active products
	err := uc.pool.QueryRow(ctx, `SELECT COUNT(*) FROM products WHERE is_active = true`).Scan(&stats.TotalProducts)
	if err != nil {
		return nil, err
	}

	// Total active warehouses
	err = uc.pool.QueryRow(ctx, `SELECT COUNT(*) FROM warehouses WHERE is_active = true`).Scan(&stats.TotalWarehouses)
	if err != nil {
		return nil, err
	}

	// Total stock value
	stats.TotalStockValue, err = uc.stockRepo.GetTotalStockValue(ctx, nil)
	if err != nil {
		return nil, err
	}

	// Low stock count
	err = uc.pool.QueryRow(ctx,
		`SELECT COUNT(*) FROM stocks s JOIN products p ON p.id = s.product_id WHERE s.quantity <= p.min_stock AND s.quantity > 0`,
	).Scan(&stats.LowStockCount)
	if err != nil {
		return nil, err
	}

	// Dead stock count (no movement for 90 days)
	err = uc.pool.QueryRow(ctx,
		`SELECT COUNT(*) FROM stocks s WHERE s.quantity > 0
		AND NOT EXISTS (
			SELECT 1 FROM transactions t
			WHERE t.product_id = s.product_id AND t.warehouse_id = s.warehouse_id
			AND t.created_at > NOW() - INTERVAL '90 days'
		)`,
	).Scan(&stats.DeadStockCount)
	if err != nil {
		return nil, err
	}

	// Today's transactions
	err = uc.pool.QueryRow(ctx,
		`SELECT COUNT(*) FROM transactions WHERE created_at::date = CURRENT_DATE`,
	).Scan(&stats.TodayTxCount)
	if err != nil {
		return nil, err
	}

	return stats, nil
}

func (uc *DashboardUsecase) GetLowStockAlerts(ctx context.Context, limit int) ([]domain.StockView, error) {
	if limit <= 0 {
		limit = 10
	}
	return uc.stockRepo.GetLowStockItems(ctx, limit)
}

func (uc *DashboardUsecase) GetDeadStock(ctx context.Context, limit int) ([]domain.StockView, error) {
	if limit <= 0 {
		limit = 10
	}
	return uc.stockRepo.GetDeadStock(ctx, 90, limit)
}
