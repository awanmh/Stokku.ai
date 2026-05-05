package redisrepo

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

const otpTTL = 5 * time.Minute

var ErrRedisUnavailable = errors.New("Redis is not available, OTP features are disabled")

// OTPRepository stores and retrieves OTP codes using Redis.
type OTPRepository struct {
	client *redis.Client
}

// NewOTPRepository creates a new OTPRepository.
func NewOTPRepository(client *redis.Client) *OTPRepository {
	return &OTPRepository{client: client}
}

// IsAvailable returns true if the Redis client is connected.
func (r *OTPRepository) IsAvailable() bool {
	return r.client != nil
}

func otpKey(sessionID string) string {
	return fmt.Sprintf("otp:%s", sessionID)
}

// StoreOTP saves an OTP code in Redis with a 5-minute TTL.
func (r *OTPRepository) StoreOTP(ctx context.Context, sessionID, email, otpCode string) error {
	if r.client == nil {
		return ErrRedisUnavailable
	}
	key := otpKey(sessionID)
	pipe := r.client.Pipeline()
	pipe.HSet(ctx, key, "email", email, "code", otpCode)
	pipe.Expire(ctx, key, otpTTL)
	_, err := pipe.Exec(ctx)
	return err
}

// GetOTP retrieves the email and OTP code for a session.
func (r *OTPRepository) GetOTP(ctx context.Context, sessionID string) (string, string, error) {
	if r.client == nil {
		return "", "", ErrRedisUnavailable
	}
	key := otpKey(sessionID)
	result, err := r.client.HGetAll(ctx, key).Result()
	if err != nil {
		return "", "", err
	}
	if len(result) == 0 {
		return "", "", errors.New("OTP expired or not found")
	}
	return result["email"], result["code"], nil
}

// DeleteOTP removes the OTP from Redis after successful verification.
func (r *OTPRepository) DeleteOTP(ctx context.Context, sessionID string) error {
	if r.client == nil {
		return ErrRedisUnavailable
	}
	return r.client.Del(ctx, otpKey(sessionID)).Err()
}

