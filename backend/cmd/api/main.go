package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gofiber/fiber/v2"
	"github.com/stokku-ai/backend/internal/config"
	deliveryhttp "github.com/stokku-ai/backend/internal/delivery/http"
	"github.com/stokku-ai/backend/internal/delivery/http/handler"
	"github.com/stokku-ai/backend/internal/infrastructure/cache"
	"github.com/stokku-ai/backend/internal/infrastructure/database"
	"github.com/stokku-ai/backend/internal/repository/postgres"
	redisrepo "github.com/stokku-ai/backend/internal/repository/redis"
	"github.com/stokku-ai/backend/internal/usecase"
)

func main() {
	// Load config
	cfg := config.Load()

	// PostgreSQL
	pool, err := database.NewPostgresPool(cfg.Database)
	if err != nil {
		log.Fatalf("Failed to connect to PostgreSQL: %v", err)
	}
	defer pool.Close()
	log.Println("Connected to PostgreSQL")

	// Redis
	redisClient, err := cache.NewRedisClient(cfg.Redis)
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	defer redisClient.Close()
	log.Println("Connected to Redis")

	// Run migrations
	runMigrations()

	// Repositories
	userRepo := postgres.NewUserRepository(pool)
	productRepo := postgres.NewProductRepository(pool)
	warehouseRepo := postgres.NewWarehouseRepository(pool)
	stockRepo := postgres.NewStockRepository(pool)
	txRepo := postgres.NewTransactionRepository(pool)
	lockRepo := redisrepo.NewLockRepository(redisClient)

	// Usecases
	authUC := usecase.NewAuthUsecase(userRepo, cfg.JWT)
	productUC := usecase.NewProductUsecase(productRepo)
	warehouseUC := usecase.NewWarehouseUsecase(warehouseRepo)
	txUC := usecase.NewTransactionUsecase(txRepo, stockRepo, lockRepo)
	dashboardUC := usecase.NewDashboardUsecase(pool, stockRepo)

	// Handlers
	handlers := deliveryhttp.Handlers{
		Auth:        handler.NewAuthHandler(authUC),
		Product:     handler.NewProductHandler(productUC),
		Warehouse:   handler.NewWarehouseHandler(warehouseUC),
		Transaction: handler.NewTransactionHandler(txUC),
		Dashboard:   handler.NewDashboardHandler(dashboardUC),
		Forecast:    handler.NewForecastHandler(),
	}

	// Fiber app
	app := fiber.New(fiber.Config{
		AppName:      "stokku.ai API",
		ErrorHandler: customErrorHandler,
	})

	// Setup routes
	deliveryhttp.SetupRouter(app, handlers, cfg.JWT.Secret)

	// Graceful shutdown
	go func() {
		sigCh := make(chan os.Signal, 1)
		signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
		<-sigCh
		log.Println("Shutting down server...")
		_ = app.Shutdown()
	}()

	// Start server
	port := ":" + cfg.Server.Port
	log.Printf("Starting stokku.ai API on port %s (env: %s)", cfg.Server.Port, cfg.Server.Env)
	if err := app.Listen(port); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

func customErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
	}
	return c.Status(code).JSON(fiber.Map{
		"success": false,
		"message": err.Error(),
	})
}

func runMigrations() {
	// In production, use a migration tool like golang-migrate
	// For now, we rely on the SQL files being run manually or by Docker entrypoint
	log.Println("Migrations should be run using the SQL files in /migrations directory")
}
