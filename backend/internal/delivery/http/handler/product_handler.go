package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/stokku-ai/backend/internal/domain"
	"github.com/stokku-ai/backend/internal/usecase"
	"github.com/stokku-ai/backend/pkg/response"
)

type ProductHandler struct {
	productUC *usecase.ProductUsecase
}

func NewProductHandler(productUC *usecase.ProductUsecase) *ProductHandler {
	return &ProductHandler{productUC: productUC}
}

func (h *ProductHandler) Create(c *fiber.Ctx) error {
	var req domain.CreateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	if req.SKU == "" || req.Name == "" {
		return response.BadRequest(c, "SKU and name are required")
	}

	product, err := h.productUC.Create(c.Context(), req)
	if err != nil {
		return response.Conflict(c, err.Error())
	}

	return response.Created(c, product, "Product created successfully")
}

func (h *ProductHandler) GetByID(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.BadRequest(c, "Invalid product ID")
	}

	product, err := h.productUC.GetByID(c.Context(), id)
	if err != nil {
		return response.NotFound(c, err.Error())
	}

	return response.Success(c, product, "Product retrieved")
}

func (h *ProductHandler) GetAll(c *fiber.Ctx) error {
	filter := domain.ProductFilter{
		Search:   c.Query("search"),
		Category: c.Query("category"),
		Limit:    c.QueryInt("limit", 20),
		Offset:   c.QueryInt("offset", 0),
	}

	products, total, err := h.productUC.GetAll(c.Context(), filter)
	if err != nil {
		return response.InternalError(c, "Failed to fetch products")
	}

	return response.Paginated(c, products, total, filter.Limit, filter.Offset)
}

func (h *ProductHandler) Update(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.BadRequest(c, "Invalid product ID")
	}

	var req domain.UpdateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	product, err := h.productUC.Update(c.Context(), id, req)
	if err != nil {
		return response.NotFound(c, err.Error())
	}

	return response.Success(c, product, "Product updated successfully")
}

func (h *ProductHandler) Delete(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.BadRequest(c, "Invalid product ID")
	}

	if err := h.productUC.Delete(c.Context(), id); err != nil {
		return response.NotFound(c, err.Error())
	}

	return response.Success(c, nil, "Product deleted successfully")
}
