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

	// Weekly Activity
	stats.WeeklyActivity = make([]domain.WeeklyActivity, 0)
	rows, err := uc.pool.Query(ctx, `
		SELECT 
			EXTRACT(ISODOW FROM created_at) as day_of_week,
			SUM(CASE WHEN type = 'stock_in' THEN quantity ELSE 0 END) as stock_in,
			SUM(CASE WHEN type = 'stock_out' THEN quantity ELSE 0 END) as stock_out
		FROM transactions 
		WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
		GROUP BY EXTRACT(ISODOW FROM created_at), DATE(created_at)
		ORDER BY DATE(created_at)
	`)
	if err == nil {
		defer rows.Close()
		dayMap := map[int]string{1: "Sen", 2: "Sel", 3: "Rab", 4: "Kam", 5: "Jum", 6: "Sab", 7: "Min"}
		for rows.Next() {
			var dow int
			var in, out int
			if err := rows.Scan(&dow, &in, &out); err == nil {
				stats.WeeklyActivity = append(stats.WeeklyActivity, domain.WeeklyActivity{
					Name:     dayMap[dow],
					StockIn:  in,
					StockOut: out,
				})
			}
		}
	}

	// Top Products
	stats.TopProducts = make([]domain.TopProduct, 0)
	topRows, err := uc.pool.Query(ctx, `
		SELECT p.name, SUM(t.quantity) as value
		FROM transactions t
		JOIN products p ON p.id = t.product_id
		WHERE t.type = 'stock_out'
		GROUP BY p.name
		ORDER BY value DESC
		LIMIT 5
	`)
	if err == nil {
		defer topRows.Close()
		for topRows.Next() {
			var name string
			var val int
			if err := topRows.Scan(&name, &val); err == nil {
				stats.TopProducts = append(stats.TopProducts, domain.TopProduct{
					Name:  name,
					Value: val,
				})
			}
		}
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
