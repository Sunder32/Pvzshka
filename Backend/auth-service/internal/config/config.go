package config

import (
	"os"
)

type Config struct {
	Environment  string
	Port         string
	DatabaseURL  string
	RedisURL     string
	JWTSecret    string
	JWTExpiration string
	RefreshTokenExpiration string
}

func Load() *Config {
	return &Config{
		Environment:  getEnv("NODE_ENV", "development"),
		Port:         getEnv("PORT", "8080"),
		DatabaseURL:  getEnv("DATABASE_URL", "postgresql://platform:platform123@localhost:5432/platform?sslmode=disable"),
		RedisURL:     getEnv("REDIS_URL", "redis://localhost:6379"),
		JWTSecret:    getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		JWTExpiration: getEnv("JWT_EXPIRATION", "24h"),
		RefreshTokenExpiration: getEnv("REFRESH_TOKEN_EXPIRATION", "168h"), // 7 days
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
