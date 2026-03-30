package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/stokku-ai/backend/internal/domain"
	"github.com/stokku-ai/backend/pkg/response"
)

func AuthMiddleware(secret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return response.Unauthorized(c, "Missing authorization header")
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return response.Unauthorized(c, "Invalid authorization format")
		}

		token, err := jwt.Parse(parts[1], func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.ErrUnauthorized
			}
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			return response.Unauthorized(c, "Invalid or expired token")
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return response.Unauthorized(c, "Invalid token claims")
		}

		userID, _ := uuid.Parse(claims["user_id"].(string))
		c.Locals("user_id", userID)
		c.Locals("user_role", domain.Role(claims["role"].(string)))
		c.Locals("user_email", claims["email"].(string))

		return c.Next()
	}
}

// RoleGuard restricts access to users with specific roles
func RoleGuard(allowedRoles ...domain.Role) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRole, ok := c.Locals("user_role").(domain.Role)
		if !ok {
			return response.Forbidden(c, "Unable to determine user role")
		}

		for _, role := range allowedRoles {
			if userRole == role {
				return c.Next()
			}
		}

		return response.Forbidden(c, "Insufficient permissions")
	}
}
