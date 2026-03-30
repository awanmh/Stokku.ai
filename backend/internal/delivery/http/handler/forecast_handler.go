package handler

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/stokku-ai/backend/pkg/response"
)

type ForecastHandler struct{}

func NewForecastHandler() *ForecastHandler {
	return &ForecastHandler{}
}

// GetForecast returns mock forecast data — placeholder for AI service integration
func (h *ForecastHandler) GetForecast(c *fiber.Ctx) error {
	mockForecast := map[string]interface{}{
		"product_id":   c.Query("product_id", "sample-product-id"),
		"warehouse_id": c.Query("warehouse_id", "sample-warehouse-id"),
		"forecast": []map[string]interface{}{
			{
				"date":           time.Now().AddDate(0, 0, 7).Format("2006-01-02"),
				"predicted_demand": 150,
				"confidence":     0.85,
			},
			{
				"date":           time.Now().AddDate(0, 0, 14).Format("2006-01-02"),
				"predicted_demand": 130,
				"confidence":     0.78,
			},
			{
				"date":           time.Now().AddDate(0, 0, 21).Format("2006-01-02"),
				"predicted_demand": 165,
				"confidence":     0.72,
			},
			{
				"date":           time.Now().AddDate(0, 0, 28).Format("2006-01-02"),
				"predicted_demand": 140,
				"confidence":     0.65,
			},
		},
		"recommendation": "Stock levels are adequate for the next 4 weeks based on predicted demand patterns.",
		"status":          "mock",
		"note":            "This is placeholder data. AI forecasting service will be integrated in a future release.",
	}

	return response.Success(c, mockForecast, "Forecast data retrieved (mock)")
}

// GetReplenishmentSuggestion returns a mock draft PO suggestion
func (h *ForecastHandler) GetReplenishmentSuggestion(c *fiber.Ctx) error {
	mockSuggestion := map[string]interface{}{
		"suggestions": []map[string]interface{}{
			{
				"product_sku":        "SKU-001",
				"product_name":       "Sample Product A",
				"current_stock":      45,
				"recommended_order":  100,
				"estimated_stockout": time.Now().AddDate(0, 0, 12).Format("2006-01-02"),
				"priority":           "high",
			},
			{
				"product_sku":        "SKU-002",
				"product_name":       "Sample Product B",
				"current_stock":      200,
				"recommended_order":  50,
				"estimated_stockout": time.Now().AddDate(0, 0, 30).Format("2006-01-02"),
				"priority":           "medium",
			},
		},
		"status": "mock",
		"note":   "This is placeholder data. AI-powered replenishment will be available after AI service integration.",
	}

	return response.Success(c, mockSuggestion, "Replenishment suggestion retrieved (mock)")
}
