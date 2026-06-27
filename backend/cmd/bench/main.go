package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"sync"
	"sync/atomic"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
	
	"github.com/stokku-ai/backend/internal/domain"
	postgresrepo "github.com/stokku-ai/backend/internal/repository/postgres"
	redisrepo "github.com/stokku-ai/backend/internal/repository/redis"
	"github.com/stokku-ai/backend/internal/usecase"
)

func main() {
	_ = godotenv.Load("../../.env")
	dbURL := "postgres://postgres:root@localhost:5432/stokku?sslmode=disable"
	
	ctx := context.Background()
	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to db: %v", err)
	}
	defer pool.Close()

	redisPort := os.Getenv("REDIS_PORT")
	if redisPort == "" {
		redisPort = "6381"
	}
	rdb := redis.NewClient(&redis.Options{
		Addr: "localhost:" + redisPort,
	})
	
	// Repositories
	txRepo := postgresrepo.NewTransactionRepository(pool)
	stockRepo := postgresrepo.NewStockRepository(pool)
	lockRepo := redisrepo.NewLockRepository(rdb)

	uc := usecase.NewTransactionUsecase(txRepo, stockRepo, lockRepo)

	// Pick a random user, warehouse, product for the test
	var uID, wID, pID uuid.UUID
	err = pool.QueryRow(ctx, "SELECT id FROM users LIMIT 1").Scan(&uID)
	err = pool.QueryRow(ctx, "SELECT id FROM warehouses LIMIT 1").Scan(&wID)
	err = pool.QueryRow(ctx, "SELECT id FROM products LIMIT 1").Scan(&pID)
	
	if err != nil {
		log.Fatalf("Failed to get basic data: %v", err)
	}

	log.Printf("Starting Concurrency Benchmark for WID: %s, PID: %s", wID, pID)

	var wg sync.WaitGroup
	var successCount, failCount int32
	
	start := time.Now()
	
	// Simulate 100 concurrent requests
	numWorkers := 100
	for i := 0; i < numWorkers; i++ {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			
			req := domain.CreateTransactionRequest{
				WarehouseID: wID,
				ProductID:   pID,
				Type:        domain.TxTypeStockIn,
				Quantity:    1,
				Reference:   fmt.Sprintf("BENCH-%d", idx),
				Notes:       "Benchmark concurrency",
			}
			
			// Retry mechanism since lock might be busy
			maxRetries := 5
			success := false
			for r := 0; r < maxRetries; r++ {
				_, err := uc.CreateTransaction(context.Background(), req, uID)
				if err == nil {
					success = true
					break
				}
				if r == maxRetries-1 {
					log.Printf("Failed: %v", err)
				}
				time.Sleep(50 * time.Millisecond) // wait before retry
			}
			
			if success {
				atomic.AddInt32(&successCount, 1)
			} else {
				atomic.AddInt32(&failCount, 1)
			}
		}(i)
	}
	
	wg.Wait()
	duration := time.Since(start)
	
	log.Printf("Benchmark Completed in %v", duration)
	log.Printf("Total Requests: %d", numWorkers)
	log.Printf("Successful Transactions: %d", successCount)
	log.Printf("Failed Transactions: %d", failCount)
	log.Printf("Throughput: %.2f req/sec", float64(numWorkers)/duration.Seconds())
	
	// Verify final stock quantity
	var finalQty int
	pool.QueryRow(ctx, "SELECT quantity FROM stocks WHERE warehouse_id = $1 AND product_id = $2", wID, pID).Scan(&finalQty)
	log.Printf("Current Stock Quantity in DB: %d", finalQty)
}
