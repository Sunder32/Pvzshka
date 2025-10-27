package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID  `json:"id" db:"id"`
	TenantID     uuid.UUID  `json:"tenant_id" db:"tenant_id"`
	Email        string     `json:"email" db:"email"`
	Phone        *string    `json:"phone,omitempty" db:"phone"`
	PasswordHash string     `json:"-" db:"password_hash"`
	FirstName    *string    `json:"first_name,omitempty" db:"first_name"`
	LastName     *string    `json:"last_name,omitempty" db:"last_name"`
	AvatarURL    *string    `json:"avatar_url,omitempty" db:"avatar_url"`
	Role         string     `json:"role" db:"role"`
	IsVerified   bool       `json:"is_verified" db:"is_verified"`
	IsActive     bool       `json:"is_active" db:"is_active"`
	LastLoginAt  *time.Time `json:"last_login_at,omitempty" db:"last_login_at"`
	Metadata     string     `json:"metadata,omitempty" db:"metadata"` // JSON string
	CreatedAt    time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at" db:"updated_at"`
}

type Tenant struct {
	ID           uuid.UUID  `json:"id" db:"id"`
	Subdomain    string     `json:"subdomain" db:"subdomain"`
	CustomDomain *string    `json:"custom_domain,omitempty" db:"custom_domain"`
	Name         string     `json:"name" db:"name"`
	Tier         string     `json:"tier" db:"tier"`
	Status       string     `json:"status" db:"status"`
	Country      string     `json:"country" db:"country"`
	Config       string     `json:"config" db:"config"` // JSON string
	BillingInfo  *string    `json:"billing_info,omitempty" db:"billing_info"` // JSON string
	CreatedAt    time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at" db:"updated_at"`
}

// DTOs
type RegisterRequest struct {
	Email     string  `json:"email" binding:"required,email"`
	Password  string  `json:"password" binding:"required,min=8"`
	FirstName *string `json:"first_name"`
	LastName  *string `json:"last_name"`
	Phone     *string `json:"phone"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
	User         *User  `json:"user"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

type UpdateUserRequest struct {
	FirstName *string `json:"first_name"`
	LastName  *string `json:"last_name"`
	Phone     *string `json:"phone"`
	AvatarURL *string `json:"avatar_url"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=8"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type ResetPasswordRequest struct {
	Token    string `json:"token" binding:"required"`
	Password string `json:"password" binding:"required,min=8"`
}

type VerifyEmailRequest struct {
	Token string `json:"token" binding:"required"`
}
