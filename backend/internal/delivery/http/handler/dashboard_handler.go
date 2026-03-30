package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/stokku-ai/backend/internal/usecase"
	"github.com/stokku-ai/backend/pkg/response"
)

type DashboardHandler struct {
	dashboardUC *usecase.DashboardUsecase
}

func NewDashboardHandler(dashboardUC *usecase.DashboardUsecase) *DashboardHandler {
	return &DashboardHandler{dashboardUC: dashboardUC}
}

func (h *DashboardHandler) GetStats(c *fiber.Ctx) error {
	stats, err := h.dashboardUC.GetStats(c.Context())
	if err != nil {
		return response.InternalError(c, "Failed to fetch dashboard stats")
	}
	return response.Success(c, stats, "Dashboard stats retrieved")
}

func (h *DashboardHandler) GetLowStockAlerts(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 10)
	alerts, err := h.dashboardUC.GetLowStockAlerts(c.Context(), limit)
	if err != nil {
		return response.InternalError(c, "Failed to fetch low stock alerts")
	}
	return response.Success(c, alerts, "Low stock alerts retrieved")
}

func (h *DashboardHandler) GetDeadStock(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 10)
	deadStock, err := h.dashboardUC.GetDeadStock(c.Context(), limit)
	if err != nil {
		return response.InternalError(c, "Failed to fetch dead stock")
	}
	return response.Success(c, deadStock, "Dead stock retrieved")
}
