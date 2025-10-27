package service

import (
	"context"
	"errors"
	"time"

	"auth-service/internal/config"
	"auth-service/internal/models"
	"auth-service/internal/repository"

	"github.com/go-redis/redis/v8"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type Claims struct {
	UserID   string `json:"user_id"`
	TenantID string `json:"tenant_id"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

type AuthService struct {
	userRepo   *repository.UserRepository
	tenantRepo *repository.TenantRepository
	redis      *redis.Client
	config     *config.Config
}

func NewAuthService(
	userRepo *repository.UserRepository,
	tenantRepo *repository.TenantRepository,
	redis *redis.Client,
	config *config.Config,
) *AuthService {
	return &AuthService{
		userRepo:   userRepo,
		tenantRepo: tenantRepo,
		redis:      redis,
		config:     config,
	}
}

func (s *AuthService) Register(ctx context.Context, req *models.RegisterRequest, tenantID uuid.UUID) (*models.User, error) {
	// Check if user already exists
	existing, _ := s.userRepo.FindByEmail(ctx, req.Email, tenantID)
	if existing != nil {
		return nil, errors.New("user with this email already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Create user
	user := &models.User{
		ID:           uuid.New(),
		TenantID:     tenantID,
		Email:        req.Email,
		Phone:        req.Phone,
		PasswordHash: string(hashedPassword),
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Role:         "customer",
		IsVerified:   false,
		IsActive:     true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	// TODO: Send verification email

	return user, nil
}

func (s *AuthService) Login(ctx context.Context, req *models.LoginRequest, tenantID uuid.UUID) (*models.LoginResponse, error) {
	// Find user
	user, err := s.userRepo.FindByEmail(ctx, req.Email, tenantID)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	if !user.IsActive {
		return nil, errors.New("account is deactivated")
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Generate tokens
	accessToken, err := s.GenerateAccessToken(user)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.GenerateRefreshToken(user)
	if err != nil {
		return nil, err
	}

	// Update last login
	s.userRepo.UpdateLastLogin(ctx, user.ID)

	// Store refresh token in Redis
	s.redis.Set(ctx, "refresh_token:"+user.ID.String(), refreshToken, 7*24*time.Hour)

	return &models.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    24 * 60 * 60, // 24 hours
		User:         user,
	}, nil
}

func (s *AuthService) GenerateAccessToken(user *models.User) (string, error) {
	claims := &Claims{
		UserID:   user.ID.String(),
		TenantID: user.TenantID.String(),
		Email:    user.Email,
		Role:     user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "auth-service",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.config.JWTSecret))
}

func (s *AuthService) GenerateRefreshToken(user *models.User) (string, error) {
	claims := &Claims{
		UserID:   user.ID.String(),
		TenantID: user.TenantID.String(),
		Email:    user.Email,
		Role:     user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "auth-service",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.config.JWTSecret))
}

func (s *AuthService) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.config.JWTSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

func (s *AuthService) RefreshAccessToken(ctx context.Context, refreshToken string) (*models.LoginResponse, error) {
	// Validate refresh token
	claims, err := s.ValidateToken(refreshToken)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	// Check if refresh token is in Redis
	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		return nil, err
	}

	storedToken, err := s.redis.Get(ctx, "refresh_token:"+userID.String()).Result()
	if err != nil || storedToken != refreshToken {
		return nil, errors.New("refresh token not found or expired")
	}

	// Get user
	tenantID, _ := uuid.Parse(claims.TenantID)
	user, err := s.userRepo.FindByEmail(ctx, claims.Email, tenantID)
	if err != nil {
		return nil, err
	}

	// Generate new access token
	accessToken, err := s.GenerateAccessToken(user)
	if err != nil {
		return nil, err
	}

	return &models.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken, // Keep same refresh token
		ExpiresIn:    24 * 60 * 60,
		User:         user,
	}, nil
}

func (s *AuthService) Logout(ctx context.Context, userID uuid.UUID) error {
	// Remove refresh token from Redis
	return s.redis.Del(ctx, "refresh_token:"+userID.String()).Err()
}
