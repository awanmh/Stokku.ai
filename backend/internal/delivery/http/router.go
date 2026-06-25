package http

import (
	"github.com/gofiber/fiber/v2"
	"github.com/stokku-ai/backend/internal/delivery/http/handler"
	"github.com/stokku-ai/backend/internal/delivery/http/middleware"
	"github.com/stokku-ai/backend/internal/domain"
)

type Handlers struct {
	Auth        *handler.AuthHandler
	Product     *handler.ProductHandler
	Warehouse   *handler.WarehouseHandler
	Transaction *handler.TransactionHandler
	Dashboard   *handler.DashboardHandler
	Forecast    *handler.ForecastHandler
	Report      *handler.ReportHandler
}

func SetupRouter(app *fiber.App, h Handlers, jwtSecret string) {
	// Global middleware
	app.Use(middleware.CORS())
	app.Use(middleware.Logger())

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"success": true,
			"message": "stokku.ai API is running",
			"data": fiber.Map{
				"status":  "healthy",
				"version": "1.0.0",
			},
		})
	})

	// API v1
	api := app.Group("/api/v1")

	// Public routes
	auth := api.Group("/auth")
	auth.Post("/login", h.Auth.Login)
	auth.Post("/login/direct", h.Auth.LoginDirect)
	auth.Post("/verify-otp", h.Auth.VerifyOTP)
	auth.Post("/resend-otp", h.Auth.ResendOTP)
	auth.Post("/register", h.Auth.Register)

	// Protected routes
	protected := api.Group("", middleware.AuthMiddleware(jwtSecret))

	// Profile
	protected.Get("/auth/profile", h.Auth.GetProfile)

	// Users (admin only)
	users := protected.Group("/users", middleware.RoleGuard(domain.RoleAdmin))
	users.Get("/", h.Auth.GetAllUsers)
	users.Post("/", h.Auth.CreateUser)
	users.Put("/:id", h.Auth.UpdateUser)
	users.Delete("/:id", h.Auth.DeleteUser)

	// Products
	products := protected.Group("/products")
	products.Get("/", h.Product.GetAll)
	products.Get("/:id", h.Product.GetByID)
	products.Post("/", middleware.RoleGuard(domain.RoleAdmin, domain.RoleWarehouseStaff), h.Product.Create)
	products.Put("/:id", middleware.RoleGuard(domain.RoleAdmin, domain.RoleWarehouseStaff), h.Product.Update)
	products.Delete("/:id", middleware.RoleGuard(domain.RoleAdmin), h.Product.Delete)

	// Warehouses
	warehouses := protected.Group("/warehouses")
	warehouses.Get("/", h.Warehouse.GetAll)
	warehouses.Get("/:id", h.Warehouse.GetByID)
	warehouses.Post("/", middleware.RoleGuard(domain.RoleAdmin), h.Warehouse.Create)
	warehouses.Put("/:id", middleware.RoleGuard(domain.RoleAdmin), h.Warehouse.Update)
	warehouses.Delete("/:id", middleware.RoleGuard(domain.RoleAdmin), h.Warehouse.Delete)

	// Transactions
	transactions := protected.Group("/transactions")
	transactions.Get("/", h.Transaction.GetAll)
	transactions.Get("/:id", h.Transaction.GetByID)
	transactions.Post("/", middleware.RoleGuard(domain.RoleAdmin, domain.RoleWarehouseStaff), h.Transaction.Create)

	// Inventory
	protected.Get("/inventory", h.Transaction.GetInventory)

	// Reports
	reports := protected.Group("/reports", middleware.RoleGuard(domain.RoleAdmin, domain.RoleWarehouseStaff))
	reports.Get("/inventory/excel", h.Report.GenerateInventoryExcel)
	reports.Get("/transactions/pdf", h.Report.GenerateTransactionsPDF)

	// Dashboard
	dashboard := protected.Group("/dashboard")
	dashboard.Get("/stats", h.Dashboard.GetStats)
	dashboard.Get("/alerts/low-stock", h.Dashboard.GetLowStockAlerts)
	dashboard.Get("/alerts/dead-stock", h.Dashboard.GetDeadStock)

	// AI / Forecast (placeholder)
	ai := protected.Group("/ai")
	ai.Get("/forecast", h.Forecast.GetForecast)
	ai.Get("/replenishment", h.Forecast.GetReplenishmentSuggestion)
}
