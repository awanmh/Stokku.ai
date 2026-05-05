package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/stokku-ai/backend/internal/domain"
	"github.com/stokku-ai/backend/internal/usecase"
	"github.com/stokku-ai/backend/pkg/response"
)

type AuthHandler struct {
	authUC *usecase.AuthUsecase
}

func NewAuthHandler(authUC *usecase.AuthUsecase) *AuthHandler {
	return &AuthHandler{authUC: authUC}
}

// Login validates credentials and sends an OTP email.
// Returns a session_id for use with VerifyOTP.
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req domain.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	if req.Email == "" || req.Password == "" {
		return response.BadRequest(c, "Email and password are required")
	}

	result, err := h.authUC.Login(c.Context(), req)
	if err != nil {
		return response.Unauthorized(c, err.Error())
	}

	return response.Success(c, result, "OTP telah dikirim ke email Anda")
}

// LoginDirect performs direct login without OTP (for demo accounts).
func (h *AuthHandler) LoginDirect(c *fiber.Ctx) error {
	var req domain.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	if req.Email == "" || req.Password == "" {
		return response.BadRequest(c, "Email and password are required")
	}

	result, err := h.authUC.LoginDirect(c.Context(), req)
	if err != nil {
		return response.Unauthorized(c, err.Error())
	}

	return response.Success(c, result, "Login successful")
}

// VerifyOTP validates the OTP code and returns a JWT token.
func (h *AuthHandler) VerifyOTP(c *fiber.Ctx) error {
	var req domain.VerifyOTPRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	if req.SessionID == "" || req.OTPCode == "" {
		return response.BadRequest(c, "Session ID and OTP code are required")
	}

	result, err := h.authUC.VerifyOTP(c.Context(), req)
	if err != nil {
		return response.Unauthorized(c, err.Error())
	}

	return response.Success(c, result, "Login successful")
}

// ResendOTP generates and sends a new OTP for an existing session.
func (h *AuthHandler) ResendOTP(c *fiber.Ctx) error {
	var body struct {
		SessionID string `json:"session_id"`
	}
	if err := c.BodyParser(&body); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	if body.SessionID == "" {
		return response.BadRequest(c, "Session ID is required")
	}

	result, err := h.authUC.ResendOTP(c.Context(), body.SessionID)
	if err != nil {
		return response.BadRequest(c, err.Error())
	}

	return response.Success(c, result, "OTP baru telah dikirim")
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req domain.RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	if req.Email == "" || req.Name == "" || req.Password == "" {
		return response.BadRequest(c, "Email, name, and password are required")
	}

	result, err := h.authUC.Register(c.Context(), req)
	if err != nil {
		return response.Conflict(c, err.Error())
	}

	return response.Created(c, result, "Registration successful")
}

func (h *AuthHandler) GetProfile(c *fiber.Ctx) error {
	userID := getUserID(c)
	user, err := h.authUC.GetProfile(c.Context(), userID)
	if err != nil {
		return response.NotFound(c, "User not found")
	}
	return response.Success(c, user, "Profile retrieved")
}

func (h *AuthHandler) GetAllUsers(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 20)
	offset := c.QueryInt("offset", 0)

	users, total, err := h.authUC.GetAllUsers(c.Context(), limit, offset)
	if err != nil {
		return response.InternalError(c, "Failed to fetch users")
	}
	return response.Paginated(c, users, total, limit, offset)
}

func (h *AuthHandler) CreateUser(c *fiber.Ctx) error {
	var req domain.RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	if req.Email == "" || req.Name == "" || req.Password == "" {
		return response.BadRequest(c, "Email, name, and password are required")
	}

	result, err := h.authUC.Register(c.Context(), req)
	if err != nil {
		return response.Conflict(c, err.Error())
	}

	return response.Created(c, result.User, "User created successfully")
}

func (h *AuthHandler) UpdateUser(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.BadRequest(c, "Invalid user ID")
	}

	user, err := h.authUC.GetProfile(c.Context(), id)
	if err != nil {
		return response.NotFound(c, "User not found")
	}

	var body struct {
		Name *string `json:"name"`
		Role *string `json:"role"`
	}
	if err := c.BodyParser(&body); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	if body.Name != nil {
		user.Name = *body.Name
	}
	if body.Role != nil {
		user.Role = domain.Role(*body.Role)
	}

	if err := h.authUC.UpdateUser(c.Context(), user); err != nil {
		return response.InternalError(c, "Failed to update user")
	}

	return response.Success(c, user, "User updated successfully")
}

func (h *AuthHandler) DeleteUser(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.BadRequest(c, "Invalid user ID")
	}

	if err := h.authUC.DeleteUser(c.Context(), id); err != nil {
		return response.InternalError(c, "Failed to delete user")
	}

	return response.Success(c, nil, "User deleted successfully")
}
