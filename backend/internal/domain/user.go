package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type Role string

const (
	RoleAdmin          Role = "admin"
	RoleWarehouseStaff Role = "warehouse_staff"
	RoleViewer         Role = "viewer"
)

type User struct {
	ID        uuid.UUID `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	Password  string    `json:"-"`
	Role      Role      `json:"role"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Email    string `json:"email"`
	Name     string `json:"name"`
	Password string `json:"password"`
	Role     Role   `json:"role"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

// OTP types for 2-step login
type LoginOTPResponse struct {
	SessionID string `json:"session_id"`
	Message   string `json:"message"`
}

type VerifyOTPRequest struct {
	SessionID string `json:"session_id"`
	OTPCode   string `json:"otp_code"`
}

type OTPRepository interface {
	StoreOTP(ctx context.Context, sessionID, email, otpCode string) error
	GetOTP(ctx context.Context, sessionID string) (email string, otpCode string, err error)
	DeleteOTP(ctx context.Context, sessionID string) error
}

type UserRepository interface {
	Create(ctx context.Context, user *User) error
	GetByID(ctx context.Context, id uuid.UUID) (*User, error)
	GetByEmail(ctx context.Context, email string) (*User, error)
	GetAll(ctx context.Context, limit, offset int) ([]User, int, error)
	Update(ctx context.Context, user *User) error
	Delete(ctx context.Context, id uuid.UUID) error
}
