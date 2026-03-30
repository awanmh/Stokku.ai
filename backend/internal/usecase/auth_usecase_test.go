package usecase

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stokku-ai/backend/internal/config"
	"github.com/stokku-ai/backend/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"golang.org/x/crypto/bcrypt"
	"time"
)

// --- Mock UserRepository ---

type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) Create(ctx context.Context, user *domain.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}

func (m *MockUserRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *MockUserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	args := m.Called(ctx, email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *MockUserRepository) GetAll(ctx context.Context, limit, offset int) ([]domain.User, int, error) {
	args := m.Called(ctx, limit, offset)
	return args.Get(0).([]domain.User), args.Int(1), args.Error(2)
}

func (m *MockUserRepository) Update(ctx context.Context, user *domain.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}

func (m *MockUserRepository) Delete(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

// --- Tests ---

func jwtConfig() config.JWTConfig {
	return config.JWTConfig{
		Secret:     "test-secret-key",
		Expiration: 24 * time.Hour,
	}
}

func hashedPassword(raw string) string {
	h, _ := bcrypt.GenerateFromPassword([]byte(raw), bcrypt.DefaultCost)
	return string(h)
}

func TestLogin_Success(t *testing.T) {
	mockRepo := new(MockUserRepository)
	uc := NewAuthUsecase(mockRepo, jwtConfig())
	ctx := context.Background()

	user := &domain.User{
		ID:       uuid.New(),
		Email:    "admin@test.com",
		Name:     "Admin",
		Password: hashedPassword("password123"),
		Role:     domain.RoleAdmin,
		IsActive: true,
	}

	mockRepo.On("GetByEmail", ctx, "admin@test.com").Return(user, nil)

	result, err := uc.Login(ctx, domain.LoginRequest{
		Email:    "admin@test.com",
		Password: "password123",
	})

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.NotEmpty(t, result.Token)
	assert.Equal(t, "admin@test.com", result.User.Email)
	mockRepo.AssertExpectations(t)
}

func TestLogin_WrongPassword(t *testing.T) {
	mockRepo := new(MockUserRepository)
	uc := NewAuthUsecase(mockRepo, jwtConfig())
	ctx := context.Background()

	user := &domain.User{
		ID:       uuid.New(),
		Email:    "admin@test.com",
		Name:     "Admin",
		Password: hashedPassword("correct-password"),
		Role:     domain.RoleAdmin,
		IsActive: true,
	}

	mockRepo.On("GetByEmail", ctx, "admin@test.com").Return(user, nil)

	result, err := uc.Login(ctx, domain.LoginRequest{
		Email:    "admin@test.com",
		Password: "wrong-password",
	})

	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Equal(t, "invalid email or password", err.Error())
	mockRepo.AssertExpectations(t)
}

func TestLogin_UserNotFound(t *testing.T) {
	mockRepo := new(MockUserRepository)
	uc := NewAuthUsecase(mockRepo, jwtConfig())
	ctx := context.Background()

	mockRepo.On("GetByEmail", ctx, "unknown@test.com").Return(nil, errors.New("not found"))

	result, err := uc.Login(ctx, domain.LoginRequest{
		Email:    "unknown@test.com",
		Password: "anything",
	})

	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Equal(t, "invalid email or password", err.Error())
	mockRepo.AssertExpectations(t)
}
