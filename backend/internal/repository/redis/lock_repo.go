package redisrepo

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/stokku-ai/backend/internal/domain"
)

type lockRepository struct {
	client *redis.Client
}

func NewLockRepository(client *redis.Client) domain.LockRepository {
	return &lockRepository{client: client}
}

// AcquireLock attempts to acquire a distributed lock using Redis SET NX with TTL.
// Returns true if the lock was successfully acquired, false if already held.
func (r *lockRepository) AcquireLock(ctx context.Context, key string, ttl time.Duration) (bool, error) {
	lockKey := "lock:" + key
	ok, err := r.client.SetNX(ctx, lockKey, "locked", ttl).Result()
	if err != nil {
		return false, err
	}
	return ok, nil
}

// ReleaseLock releases a distributed lock.
func (r *lockRepository) ReleaseLock(ctx context.Context, key string) error {
	lockKey := "lock:" + key
	return r.client.Del(ctx, lockKey).Err()
}
