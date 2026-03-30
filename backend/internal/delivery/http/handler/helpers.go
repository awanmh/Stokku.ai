package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// getUserID extracts the authenticated user's UUID from Fiber context
func getUserID(c *fiber.Ctx) uuid.UUID {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return uuid.Nil
	}
	return userID
}
