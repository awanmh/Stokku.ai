package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/stokku-ai/backend/internal/domain"
	"github.com/stokku-ai/backend/internal/usecase"
	"github.com/stokku-ai/backend/pkg/response"
)

type WarehouseHandler struct {
	warehouseUC *usecase.WarehouseUsecase
}

func NewWarehouseHandler(warehouseUC *usecase.WarehouseUsecase) *WarehouseHandler {
	return &WarehouseHandler{warehouseUC: warehouseUC}
}

func (h *WarehouseHandler) Create(c *fiber.Ctx) error {
	var req domain.CreateWarehouseRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}
	if req.Name == "" {
		return response.BadRequest(c, "Warehouse name is required")
	}

	wh, err := h.warehouseUC.Create(c.Context(), req)
	if err != nil {
		return response.InternalError(c, err.Error())
	}
	return response.Created(c, wh, "Warehouse created successfully")
}

func (h *WarehouseHandler) GetByID(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.BadRequest(c, "Invalid warehouse ID")
	}

	wh, err := h.warehouseUC.GetByID(c.Context(), id)
	if err != nil {
		return response.NotFound(c, err.Error())
	}
	return response.Success(c, wh, "Warehouse retrieved")
}

func (h *WarehouseHandler) GetAll(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 20)
	offset := c.QueryInt("offset", 0)

	warehouses, total, err := h.warehouseUC.GetAll(c.Context(), limit, offset)
	if err != nil {
		return response.InternalError(c, "Failed to fetch warehouses")
	}
	return response.Paginated(c, warehouses, total, limit, offset)
}

func (h *WarehouseHandler) Update(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.BadRequest(c, "Invalid warehouse ID")
	}

	var req domain.UpdateWarehouseRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	wh, err := h.warehouseUC.Update(c.Context(), id, req)
	if err != nil {
		return response.NotFound(c, err.Error())
	}
	return response.Success(c, wh, "Warehouse updated successfully")
}

func (h *WarehouseHandler) Delete(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.BadRequest(c, "Invalid warehouse ID")
	}

	if err := h.warehouseUC.Delete(c.Context(), id); err != nil {
		return response.NotFound(c, err.Error())
	}
	return response.Success(c, nil, "Warehouse deleted successfully")
}
