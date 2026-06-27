package handler

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/stokku-ai/backend/internal/domain"
	"github.com/stokku-ai/backend/internal/usecase"
	"github.com/stokku-ai/backend/pkg/response"
)

type TransactionHandler struct {
	txUC *usecase.TransactionUsecase
}

func NewTransactionHandler(txUC *usecase.TransactionUsecase) *TransactionHandler {
	return &TransactionHandler{txUC: txUC}
}

func (h *TransactionHandler) Create(c *fiber.Ctx) error {
	var req domain.CreateTransactionRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	if req.Quantity <= 0 {
		return response.BadRequest(c, "Quantity must be positive")
	}

	userID := getUserID(c)
	tx, err := h.txUC.CreateTransaction(c.Context(), req, userID)
	if err != nil {
		return response.BadRequest(c, err.Error())
	}

	return response.Created(c, tx, "Transaction recorded successfully")
}

func (h *TransactionHandler) GetByID(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.BadRequest(c, "Invalid transaction ID")
	}

	tx, err := h.txUC.GetByID(c.Context(), id)
	if err != nil {
		return response.NotFound(c, "Transaction not found")
	}

	return response.Success(c, tx, "Transaction retrieved")
}

func (h *TransactionHandler) GetAll(c *fiber.Ctx) error {
	filter := domain.TransactionFilter{
		Limit:  c.QueryInt("limit", 20),
		Offset: c.QueryInt("offset", 0),
	}

	if wid := c.Query("warehouse_id"); wid != "" {
		id, err := uuid.Parse(wid)
		if err == nil {
			filter.WarehouseID = &id
		}
	}
	if pid := c.Query("product_id"); pid != "" {
		id, err := uuid.Parse(pid)
		if err == nil {
			filter.ProductID = &id
		}
	}
	if t := c.Query("type"); t != "" {
		txType := domain.TransactionType(t)
		filter.Type = &txType
	}
	if sd := c.Query("start_date"); sd != "" {
		if parsed, err := time.Parse("2006-01-02", sd); err == nil {
			filter.StartDate = &parsed
		}
	}
	if ed := c.Query("end_date"); ed != "" {
		if parsed, err := time.Parse("2006-01-02", ed); err == nil {
			end := parsed.Add(24*time.Hour - time.Second)
			filter.EndDate = &end
		}
	}

	txs, total, err := h.txUC.GetAll(c.Context(), filter)
	if err != nil {
		return response.InternalError(c, "Failed to fetch transactions")
	}

	return response.Paginated(c, txs, total, filter.Limit, filter.Offset)
}

func (h *TransactionHandler) GetInventory(c *fiber.Ctx) error {
	filter := domain.StockFilter{
		Search:   c.Query("search"),
		LowStock: c.Query("low_stock") == "true",
		Limit:    c.QueryInt("limit", 20),
		Offset:   c.QueryInt("offset", 0),
	}

	if wid := c.Query("warehouse_id"); wid != "" {
		id, err := uuid.Parse(wid)
		if err == nil {
			filter.WarehouseID = &id
		}
	}

	stocks, total, err := h.txUC.GetInventory(c.Context(), filter)
	if err != nil {
		return response.InternalError(c, "Failed to fetch inventory")
	}

	return response.Paginated(c, stocks, total, filter.Limit, filter.Offset)
}

func (h *TransactionHandler) GetInventoryByID(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.BadRequest(c, "Invalid inventory ID")
	}

	stock, err := h.txUC.GetInventoryByID(c.Context(), id)
	if err != nil {
		return response.NotFound(c, "Inventory not found")
	}

	return response.Success(c, stock, "Inventory retrieved")
}
