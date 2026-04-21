package usecase

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stokku-ai/backend/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// --- Mock ProductRepository ---

type MockProductRepository struct {
	mock.Mock
}

func (m *MockProductRepository) Create(ctx context.Context, product *domain.Product) error {
	args := m.Called(ctx, product)
	return args.Error(0)
}

func (m *MockProductRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Product, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Product), args.Error(1)
}

func (m *MockProductRepository) GetBySKU(ctx context.Context, sku string) (*domain.Product, error) {
	args := m.Called(ctx, sku)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Product), args.Error(1)
}

func (m *MockProductRepository) GetAll(ctx context.Context, filter domain.ProductFilter) ([]domain.Product, int, error) {
	args := m.Called(ctx, filter)
	return args.Get(0).([]domain.Product), args.Int(1), args.Error(2)
}

func (m *MockProductRepository) Update(ctx context.Context, product *domain.Product) error {
	args := m.Called(ctx, product)
	return args.Error(0)
}

func (m *MockProductRepository) Delete(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

// --- Tests ---

func TestCreateProduct_Success(t *testing.T) {
	mockRepo := new(MockProductRepository)
	uc := NewProductUsecase(mockRepo)
	ctx := context.Background()

	mockRepo.On("GetBySKU", ctx, "SKU-001").Return(nil, errors.New("not found"))
	mockRepo.On("Create", ctx, mock.AnythingOfType("*domain.Product")).Return(nil)

	req := domain.CreateProductRequest{
		SKU:      "SKU-001",
		Name:     "Laptop Gaming",
		Category: "Electronics",
		Unit:     "pcs",
		Price:    1500.00,
		MinStock: 5,
		MaxStock: 100,
	}

	result, err := uc.Create(ctx, req)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, "SKU-001", result.SKU)
	assert.Equal(t, "Laptop Gaming", result.Name)
	assert.Equal(t, 1500.00, result.Price)
	mockRepo.AssertExpectations(t)
}

func TestCreateProduct_DuplicateSKU(t *testing.T) {
	mockRepo := new(MockProductRepository)
	uc := NewProductUsecase(mockRepo)
	ctx := context.Background()

	existing := &domain.Product{ID: uuid.New(), SKU: "SKU-001", Name: "Existing Product"}
	mockRepo.On("GetBySKU", ctx, "SKU-001").Return(existing, nil)

	req := domain.CreateProductRequest{
		SKU:  "SKU-001",
		Name: "Another Product",
	}

	result, err := uc.Create(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Equal(t, "SKU already exists", err.Error())
	mockRepo.AssertExpectations(t)
}

func TestCreateProduct_RepoError(t *testing.T) {
	mockRepo := new(MockProductRepository)
	uc := NewProductUsecase(mockRepo)
	ctx := context.Background()

	mockRepo.On("GetBySKU", ctx, "SKU-002").Return(nil, errors.New("not found"))
	mockRepo.On("Create", ctx, mock.AnythingOfType("*domain.Product")).Return(errors.New("db error"))

	req := domain.CreateProductRequest{
		SKU:  "SKU-002",
		Name: "Test Product",
	}

	result, err := uc.Create(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Equal(t, "failed to create product", err.Error())
}

func TestGetProductByID_Success(t *testing.T) {
	mockRepo := new(MockProductRepository)
	uc := NewProductUsecase(mockRepo)
	ctx := context.Background()

	productID := uuid.New()
	product := &domain.Product{
		ID:   productID,
		SKU:  "SKU-001",
		Name: "Laptop Gaming",
	}
	mockRepo.On("GetByID", ctx, productID).Return(product, nil)

	result, err := uc.GetByID(ctx, productID)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, productID, result.ID)
	assert.Equal(t, "Laptop Gaming", result.Name)
	mockRepo.AssertExpectations(t)
}

func TestGetProductByID_NotFound(t *testing.T) {
	mockRepo := new(MockProductRepository)
	uc := NewProductUsecase(mockRepo)
	ctx := context.Background()

	productID := uuid.New()
	mockRepo.On("GetByID", ctx, productID).Return(nil, errors.New("not found"))

	result, err := uc.GetByID(ctx, productID)

	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Equal(t, "product not found", err.Error())
}

func TestGetAllProducts_Success(t *testing.T) {
	mockRepo := new(MockProductRepository)
	uc := NewProductUsecase(mockRepo)
	ctx := context.Background()

	products := []domain.Product{
		{ID: uuid.New(), SKU: "SKU-001", Name: "Product A"},
		{ID: uuid.New(), SKU: "SKU-002", Name: "Product B"},
	}
	filter := domain.ProductFilter{Limit: 20, Offset: 0}
	mockRepo.On("GetAll", ctx, filter).Return(products, 2, nil)

	result, total, err := uc.GetAll(ctx, filter)

	assert.NoError(t, err)
	assert.Len(t, result, 2)
	assert.Equal(t, 2, total)
	mockRepo.AssertExpectations(t)
}

func TestGetAllProducts_DefaultLimit(t *testing.T) {
	mockRepo := new(MockProductRepository)
	uc := NewProductUsecase(mockRepo)
	ctx := context.Background()

	products := []domain.Product{}
	// When limit is 0, it should default to 20
	expectedFilter := domain.ProductFilter{Limit: 20, Offset: 0}
	mockRepo.On("GetAll", ctx, expectedFilter).Return(products, 0, nil)

	result, total, err := uc.GetAll(ctx, domain.ProductFilter{Limit: 0, Offset: 0})

	assert.NoError(t, err)
	assert.Len(t, result, 0)
	assert.Equal(t, 0, total)
	mockRepo.AssertExpectations(t)
}

func TestUpdateProduct_Success(t *testing.T) {
	mockRepo := new(MockProductRepository)
	uc := NewProductUsecase(mockRepo)
	ctx := context.Background()

	productID := uuid.New()
	product := &domain.Product{
		ID:    productID,
		SKU:   "SKU-001",
		Name:  "Old Name",
		Price: 100.00,
	}
	mockRepo.On("GetByID", ctx, productID).Return(product, nil)
	mockRepo.On("Update", ctx, product).Return(nil)

	newName := "New Name"
	newPrice := 200.00
	req := domain.UpdateProductRequest{
		Name:  &newName,
		Price: &newPrice,
	}

	result, err := uc.Update(ctx, productID, req)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, "New Name", result.Name)
	assert.Equal(t, 200.00, result.Price)
	// SKU should remain unchanged
	assert.Equal(t, "SKU-001", result.SKU)
	mockRepo.AssertExpectations(t)
}

func TestUpdateProduct_NotFound(t *testing.T) {
	mockRepo := new(MockProductRepository)
	uc := NewProductUsecase(mockRepo)
	ctx := context.Background()

	productID := uuid.New()
	mockRepo.On("GetByID", ctx, productID).Return(nil, errors.New("not found"))

	newName := "Test"
	req := domain.UpdateProductRequest{Name: &newName}

	result, err := uc.Update(ctx, productID, req)

	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Equal(t, "product not found", err.Error())
}

func TestUpdateProduct_PartialUpdate(t *testing.T) {
	mockRepo := new(MockProductRepository)
	uc := NewProductUsecase(mockRepo)
	ctx := context.Background()

	productID := uuid.New()
	product := &domain.Product{
		ID:          productID,
		SKU:         "SKU-001",
		Name:        "Original",
		Description: "Original Desc",
		Category:    "Electronics",
		Unit:        "pcs",
		Price:       100.00,
		MinStock:    5,
		MaxStock:    50,
		IsActive:    true,
	}
	mockRepo.On("GetByID", ctx, productID).Return(product, nil)
	mockRepo.On("Update", ctx, product).Return(nil)

	// Only update category — everything else stays the same
	newCategory := "Accessories"
	req := domain.UpdateProductRequest{
		Category: &newCategory,
	}

	result, err := uc.Update(ctx, productID, req)

	assert.NoError(t, err)
	assert.Equal(t, "Accessories", result.Category)
	assert.Equal(t, "Original", result.Name)
	assert.Equal(t, 100.00, result.Price)
}

func TestDeleteProduct_Success(t *testing.T) {
	mockRepo := new(MockProductRepository)
	uc := NewProductUsecase(mockRepo)
	ctx := context.Background()

	productID := uuid.New()
	product := &domain.Product{ID: productID, SKU: "SKU-001"}
	mockRepo.On("GetByID", ctx, productID).Return(product, nil)
	mockRepo.On("Delete", ctx, productID).Return(nil)

	err := uc.Delete(ctx, productID)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestDeleteProduct_NotFound(t *testing.T) {
	mockRepo := new(MockProductRepository)
	uc := NewProductUsecase(mockRepo)
	ctx := context.Background()

	productID := uuid.New()
	mockRepo.On("GetByID", ctx, productID).Return(nil, errors.New("not found"))

	err := uc.Delete(ctx, productID)

	assert.Error(t, err)
	assert.Equal(t, "product not found", err.Error())
}
