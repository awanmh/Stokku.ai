package postgres

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/stokku-ai/backend/internal/domain"
)

type userRepository struct {
	pool *pgxpool.Pool
}

func NewUserRepository(pool *pgxpool.Pool) domain.UserRepository {
	return &userRepository{pool: pool}
}

func (r *userRepository) Create(ctx context.Context, user *domain.User) error {
	user.ID = uuid.New()
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()
	user.IsActive = true

	query := `INSERT INTO users (id, email, name, password, role, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`

	_, err := r.pool.Exec(ctx, query,
		user.ID, user.Email, user.Name, user.Password, user.Role,
		user.IsActive, user.CreatedAt, user.UpdatedAt,
	)
	return err
}

func (r *userRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	user := &domain.User{}
	query := `SELECT id, email, name, password, role, is_active, created_at, updated_at
		FROM users WHERE id = $1`

	err := r.pool.QueryRow(ctx, query, id).Scan(
		&user.ID, &user.Email, &user.Name, &user.Password, &user.Role,
		&user.IsActive, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *userRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	user := &domain.User{}
	query := `SELECT id, email, name, password, role, is_active, created_at, updated_at
		FROM users WHERE email = $1`

	err := r.pool.QueryRow(ctx, query, email).Scan(
		&user.ID, &user.Email, &user.Name, &user.Password, &user.Role,
		&user.IsActive, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *userRepository) GetAll(ctx context.Context, limit, offset int) ([]domain.User, int, error) {
	var total int
	countQuery := `SELECT COUNT(*) FROM users`
	if err := r.pool.QueryRow(ctx, countQuery).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := `SELECT id, email, name, password, role, is_active, created_at, updated_at
		FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`

	rows, err := r.pool.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var users []domain.User
	for rows.Next() {
		var u domain.User
		if err := rows.Scan(&u.ID, &u.Email, &u.Name, &u.Password, &u.Role,
			&u.IsActive, &u.CreatedAt, &u.UpdatedAt); err != nil {
			return nil, 0, err
		}
		users = append(users, u)
	}
	return users, total, nil
}

func (r *userRepository) Update(ctx context.Context, user *domain.User) error {
	user.UpdatedAt = time.Now()
	query := `UPDATE users SET email = $2, name = $3, role = $4, is_active = $5, updated_at = $6
		WHERE id = $1`

	_, err := r.pool.Exec(ctx, query,
		user.ID, user.Email, user.Name, user.Role, user.IsActive, user.UpdatedAt,
	)
	return err
}

func (r *userRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, id)
	return err
}
