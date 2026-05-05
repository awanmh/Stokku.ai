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

// --- Mock OTPRepository ---
type MockOTPRepository struct {
	mock.Mock
}

func (m *MockOTPRepository) StoreOTP(ctx context.Context, sessionID, email, otpCode string) error {
	args := m.Called(ctx, sessionID, email, otpCode)
	return args.Error(0)
}

func (m *MockOTPRepository) GetOTP(ctx context.Context, sessionID string) (string, string, error) {
	args := m.Called(ctx, sessionID)
	return args.String(0), args.String(1), args.Error(2)
}

func (m *MockOTPRepository) DeleteOTP(ctx context.Context, sessionID string) error {
	args := m.Called(ctx, sessionID)
	return args.Error(0)
}

// --- Mock OTPMailer ---
type MockOTPMailer struct {
	mock.Mock
}

func (m *MockOTPMailer) SendOTP(toEmail, otpCode string) error {
	args := m.Called(toEmail, otpCode)
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
	mockOTP := new(MockOTPRepository)
	mockMailer := new(MockOTPMailer)
	uc := NewAuthUsecase(mockRepo, mockOTP, mockMailer, jwtConfig())
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
	mockOTP.On("StoreOTP", ctx, mock.Anything, "admin@test.com", mock.Anything).Return(nil)
	mockMailer.On("SendOTP", "admin@test.com", mock.Anything).Return(nil)

	result, err := uc.Login(ctx, domain.LoginRequest{
		Email:    "admin@test.com",
		Password: "password123",
	})

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.NotEmpty(t, result.SessionID)
	assert.Contains(t, result.Message, "Kode OTP telah dikirim")
	mockRepo.AssertExpectations(t)
	mockOTP.AssertExpectations(t)
	mockMailer.AssertExpectations(t)
}

func TestLogin_WrongPassword(t *testing.T) {
	mockRepo := new(MockUserRepository)
	mockOTP := new(MockOTPRepository)
	mockMailer := new(MockOTPMailer)
	uc := NewAuthUsecase(mockRepo, mockOTP, mockMailer, jwtConfig())
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
	mockOTP := new(MockOTPRepository)
	mockMailer := new(MockOTPMailer)
	uc := NewAuthUsecase(mockRepo, mockOTP, mockMailer, jwtConfig())
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

func TestLogin_DeactivatedUser(t *testing.T) {
	mockRepo := new(MockUserRepository)
	mockOTP := new(MockOTPRepository)
	mockMailer := new(MockOTPMailer)
	uc := NewAuthUsecase(mockRepo, mockOTP, mockMailer, jwtConfig())
	ctx := context.Background()

	user := &domain.User{
		ID:       uuid.New(),
		Email:    "inactive@test.com",
		Name:     "Inactive User",
		Password: hashedPassword("password123"),
		Role:     domain.RoleViewer,
		IsActive: false,
	}

	mockRepo.On("GetByEmail", ctx, "inactive@test.com").Return(user, nil)

	result, err := uc.Login(ctx, domain.LoginRequest{
		Email:    "inactive@test.com",
		Password: "password123",
	})

	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Equal(t, "account is deactivated", err.Error())
	mockRepo.AssertExpectations(t)
}

func TestRegister_Success(t *testing.T) {
	mockRepo := new(MockUserRepository)
	mockOTP := new(MockOTPRepository)
	mockMailer := new(MockOTPMailer)
	uc := NewAuthUsecase(mockRepo, mockOTP, mockMailer, jwtConfig())
	ctx := context.Background()

	mockRepo.On("GetByEmail", ctx, "newuser@test.com").Return(nil, errors.New("not found"))
	mockRepo.On("Create", ctx, mock.AnythingOfType("*domain.User")).Return(nil)

	result, err := uc.Register(ctx, domain.RegisterRequest{
		Email:    "newuser@test.com",
		Name:     "New User",
		Password: "securepassword",
		Role:     domain.RoleViewer,
	})

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.NotEmpty(t, result.Token)
	assert.Equal(t, "newuser@test.com", result.User.Email)
	assert.Equal(t, "New User", result.User.Name)
	mockRepo.AssertExpectations(t)
}

func TestRegister_DuplicateEmail(t *testing.T) {
	mockRepo := new(MockUserRepository)
	mockOTP := new(MockOTPRepository)
	mockMailer := new(MockOTPMailer)
	uc := NewAuthUsecase(mockRepo, mockOTP, mockMailer, jwtConfig())
	ctx := context.Background()

	existingUser := &domain.User{
		ID:    uuid.New(),
		Email: "existing@test.com",
	}
	mockRepo.On("GetByEmail", ctx, "existing@test.com").Return(existingUser, nil)

	result, err := uc.Register(ctx, domain.RegisterRequest{
		Email:    "existing@test.com",
		Name:     "Duplicate",
		Password: "password",
	})

	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Equal(t, "email already registered", err.Error())
	mockRepo.AssertExpectations(t)
}

func TestRegister_DefaultRole(t *testing.T) {
	mockRepo := new(MockUserRepository)
	mockOTP := new(MockOTPRepository)
	mockMailer := new(MockOTPMailer)
	uc := NewAuthUsecase(mockRepo, mockOTP, mockMailer, jwtConfig())
	ctx := context.Background()

	mockRepo.On("GetByEmail", ctx, "norole@test.com").Return(nil, errors.New("not found"))
	mockRepo.On("Create", ctx, mock.AnythingOfType("*domain.User")).Return(nil)

	result, err := uc.Register(ctx, domain.RegisterRequest{
		Email:    "norole@test.com",
		Name:     "No Role User",
		Password: "password",
		Role:     "", // empty role
	})

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, domain.RoleViewer, result.User.Role)
}

func TestGetProfile_Success(t *testing.T) {
	mockRepo := new(MockUserRepository)
	mockOTP := new(MockOTPRepository)
	mockMailer := new(MockOTPMailer)
	uc := NewAuthUsecase(mockRepo, mockOTP, mockMailer, jwtConfig())
	ctx := context.Background()

	userID := uuid.New()
	user := &domain.User{
		ID:       userID,
		Email:    "admin@test.com",
		Name:     "Admin",
		Role:     domain.RoleAdmin,
		IsActive: true,
	}
	mockRepo.On("GetByID", ctx, userID).Return(user, nil)

	result, err := uc.GetProfile(ctx, userID)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, userID, result.ID)
	assert.Equal(t, "admin@test.com", result.Email)
	mockRepo.AssertExpectations(t)
}

func TestGetProfile_NotFound(t *testing.T) {
	mockRepo := new(MockUserRepository)
	mockOTP := new(MockOTPRepository)
	mockMailer := new(MockOTPMailer)
	uc := NewAuthUsecase(mockRepo, mockOTP, mockMailer, jwtConfig())
	ctx := context.Background()

	userID := uuid.New()
	mockRepo.On("GetByID", ctx, userID).Return(nil, errors.New("not found"))

	result, err := uc.GetProfile(ctx, userID)

	assert.Error(t, err)
	assert.Nil(t, result)
	mockRepo.AssertExpectations(t)
}
