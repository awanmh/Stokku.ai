package usecase

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"math/big"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/stokku-ai/backend/internal/config"
	"github.com/stokku-ai/backend/internal/domain"
	"golang.org/x/crypto/bcrypt"
)

type OTPMailer interface {
	SendOTP(toEmail, otpCode string) error
}

type AuthUsecase struct {
	userRepo domain.UserRepository
	otpRepo  domain.OTPRepository
	mailer   OTPMailer
	jwtCfg   config.JWTConfig
}

func NewAuthUsecase(
	userRepo domain.UserRepository,
	otpRepo domain.OTPRepository,
	mailer OTPMailer,
	jwtCfg config.JWTConfig,
) *AuthUsecase {
	return &AuthUsecase{
		userRepo: userRepo,
		otpRepo:  otpRepo,
		mailer:   mailer,
		jwtCfg:   jwtCfg,
	}
}

// Login validates credentials and sends an OTP to the user's email.
// Returns a session ID that must be used with VerifyOTP to complete login.
// If Redis/SMTP is unavailable, returns an error suggesting to use direct login.
func (uc *AuthUsecase) Login(ctx context.Context, req domain.LoginRequest) (*domain.LoginOTPResponse, error) {
	user, err := uc.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	if !user.IsActive {
		return nil, errors.New("account is deactivated")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Generate OTP and session
	otpCode := generateOTP()
	sessionID := uuid.New().String()

	// Store OTP in Redis
	if err := uc.otpRepo.StoreOTP(ctx, sessionID, user.Email, otpCode); err != nil {
		// Redis unavailable — inform user to use direct login
		return nil, fmt.Errorf("OTP service unavailable: %w. Use direct login instead", err)
	}

	// Send OTP via email
	if err := uc.mailer.SendOTP(user.Email, otpCode); err != nil {
		// Clean up the stored OTP if email fails
		_ = uc.otpRepo.DeleteOTP(ctx, sessionID)
		return nil, fmt.Errorf("failed to send OTP email: %w", err)
	}

	return &domain.LoginOTPResponse{
		SessionID: sessionID,
		Message:   fmt.Sprintf("Kode OTP telah dikirim ke %s", maskEmail(user.Email)),
	}, nil
}

// LoginDirect performs a direct login without OTP (for demo accounts).
func (uc *AuthUsecase) LoginDirect(ctx context.Context, req domain.LoginRequest) (*domain.AuthResponse, error) {
	user, err := uc.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	if !user.IsActive {
		return nil, errors.New("account is deactivated")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid email or password")
	}

	token, err := uc.generateToken(user)
	if err != nil {
		return nil, err
	}

	return &domain.AuthResponse{Token: token, User: *user}, nil
}

// VerifyOTP validates the OTP code and returns the JWT token.
func (uc *AuthUsecase) VerifyOTP(ctx context.Context, req domain.VerifyOTPRequest) (*domain.AuthResponse, error) {
	storedEmail, storedCode, err := uc.otpRepo.GetOTP(ctx, req.SessionID)
	if err != nil {
		return nil, errors.New("OTP expired or invalid session")
	}

	if storedCode != req.OTPCode {
		return nil, errors.New("invalid OTP code")
	}

	// OTP is correct — delete it (one-time use)
	_ = uc.otpRepo.DeleteOTP(ctx, req.SessionID)

	// Get user and generate token
	user, err := uc.userRepo.GetByEmail(ctx, storedEmail)
	if err != nil {
		return nil, errors.New("user not found")
	}

	token, err := uc.generateToken(user)
	if err != nil {
		return nil, err
	}

	return &domain.AuthResponse{Token: token, User: *user}, nil
}

// ResendOTP generates a new OTP for an existing session.
func (uc *AuthUsecase) ResendOTP(ctx context.Context, sessionID string) (*domain.LoginOTPResponse, error) {
	storedEmail, _, err := uc.otpRepo.GetOTP(ctx, sessionID)
	if err != nil {
		return nil, errors.New("session expired, please login again")
	}

	// Generate new OTP
	newOTP := generateOTP()
	newSessionID := uuid.New().String()

	// Delete old session and store new one
	_ = uc.otpRepo.DeleteOTP(ctx, sessionID)
	if err := uc.otpRepo.StoreOTP(ctx, newSessionID, storedEmail, newOTP); err != nil {
		return nil, errors.New("failed to generate OTP")
	}

	// Send new OTP
	if err := uc.mailer.SendOTP(storedEmail, newOTP); err != nil {
		_ = uc.otpRepo.DeleteOTP(ctx, newSessionID)
		return nil, errors.New("failed to send OTP email")
	}

	return &domain.LoginOTPResponse{
		SessionID: newSessionID,
		Message:   fmt.Sprintf("Kode OTP baru telah dikirim ke %s", maskEmail(storedEmail)),
	}, nil
}

func (uc *AuthUsecase) Register(ctx context.Context, req domain.RegisterRequest) (*domain.AuthResponse, error) {
	existing, _ := uc.userRepo.GetByEmail(ctx, req.Email)
	if existing != nil {
		return nil, errors.New("email already registered")
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	user := &domain.User{
		Email:    req.Email,
		Name:     req.Name,
		Password: string(hashed),
		Role:     req.Role,
	}

	if user.Role == "" {
		user.Role = domain.RoleViewer
	}

	if err := uc.userRepo.Create(ctx, user); err != nil {
		return nil, errors.New("failed to create user")
	}

	token, err := uc.generateToken(user)
	if err != nil {
		return nil, err
	}

	return &domain.AuthResponse{Token: token, User: *user}, nil
}

func (uc *AuthUsecase) GetProfile(ctx context.Context, userID uuid.UUID) (*domain.User, error) {
	return uc.userRepo.GetByID(ctx, userID)
}

func (uc *AuthUsecase) GetAllUsers(ctx context.Context, limit, offset int) ([]domain.User, int, error) {
	return uc.userRepo.GetAll(ctx, limit, offset)
}

func (uc *AuthUsecase) UpdateUser(ctx context.Context, user *domain.User) error {
	return uc.userRepo.Update(ctx, user)
}

func (uc *AuthUsecase) DeleteUser(ctx context.Context, id uuid.UUID) error {
	return uc.userRepo.Delete(ctx, id)
}

func (uc *AuthUsecase) generateToken(user *domain.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id": user.ID.String(),
		"email":   user.Email,
		"role":    string(user.Role),
		"exp":     time.Now().Add(uc.jwtCfg.Expiration).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(uc.jwtCfg.Secret))
}

// generateOTP generates a cryptographically secure 6-digit OTP.
func generateOTP() string {
	n, _ := rand.Int(rand.Reader, big.NewInt(1000000))
	return fmt.Sprintf("%06d", n.Int64())
}

// maskEmail masks an email for privacy, e.g. "a***n@gmail.com".
func maskEmail(email string) string {
	at := -1
	for i, c := range email {
		if c == '@' {
			at = i
			break
		}
	}
	if at <= 1 {
		return email
	}
	return string(email[0]) + "***" + email[at-1:]
}
