package usecase

import (
	"context"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/stokku-ai/backend/internal/config"
	"github.com/stokku-ai/backend/internal/domain"
	"golang.org/x/crypto/bcrypt"
)

type AuthUsecase struct {
	userRepo domain.UserRepository
	jwtCfg   config.JWTConfig
}

func NewAuthUsecase(userRepo domain.UserRepository, jwtCfg config.JWTConfig) *AuthUsecase {
	return &AuthUsecase{userRepo: userRepo, jwtCfg: jwtCfg}
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

func (uc *AuthUsecase) Login(ctx context.Context, req domain.LoginRequest) (*domain.AuthResponse, error) {
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
