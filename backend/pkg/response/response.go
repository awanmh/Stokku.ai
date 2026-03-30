package response

import "github.com/gofiber/fiber/v2"

type Response struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Message string      `json:"message"`
}

type PaginatedResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Message string      `json:"message"`
	Meta    Meta        `json:"meta"`
}

type Meta struct {
	Total  int `json:"total"`
	Limit  int `json:"limit"`
	Offset int `json:"offset"`
}

func Success(c *fiber.Ctx, data interface{}, message string) error {
	return c.Status(fiber.StatusOK).JSON(Response{
		Success: true,
		Data:    data,
		Message: message,
	})
}

func Created(c *fiber.Ctx, data interface{}, message string) error {
	return c.Status(fiber.StatusCreated).JSON(Response{
		Success: true,
		Data:    data,
		Message: message,
	})
}

func Paginated(c *fiber.Ctx, data interface{}, total, limit, offset int) error {
	return c.Status(fiber.StatusOK).JSON(PaginatedResponse{
		Success: true,
		Data:    data,
		Message: "Data retrieved successfully",
		Meta: Meta{
			Total:  total,
			Limit:  limit,
			Offset: offset,
		},
	})
}

func Error(c *fiber.Ctx, statusCode int, message string) error {
	return c.Status(statusCode).JSON(Response{
		Success: false,
		Message: message,
	})
}

func BadRequest(c *fiber.Ctx, message string) error {
	return Error(c, fiber.StatusBadRequest, message)
}

func Unauthorized(c *fiber.Ctx, message string) error {
	return Error(c, fiber.StatusUnauthorized, message)
}

func Forbidden(c *fiber.Ctx, message string) error {
	return Error(c, fiber.StatusForbidden, message)
}

func NotFound(c *fiber.Ctx, message string) error {
	return Error(c, fiber.StatusNotFound, message)
}

func InternalError(c *fiber.Ctx, message string) error {
	return Error(c, fiber.StatusInternalServerError, message)
}

func Conflict(c *fiber.Ctx, message string) error {
	return Error(c, fiber.StatusConflict, message)
}
