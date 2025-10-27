package middleware

import (
	"context"
	"net/http"
	"strings"
)

// Tenant context keys
type contextKey string

const (
	TenantIDKey     contextKey = "tenantID"
	SubdomainKey    contextKey = "subdomain"
	HasTenantKey    contextKey = "hasTenant"
	TenantInfoKey   contextKey = "tenantInfo"
)

// TenantInfo represents tenant information
type TenantInfo struct {
	ID        string
	Subdomain string
	Name      string
	Status    string
	Tier      string
}

// TenantMiddleware extracts tenant context from request
func TenantMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var tenantID string
		var subdomain string
		hasTenant := false

		// 1. Try X-Tenant-ID header (highest priority)
		if tid := r.Header.Get("X-Tenant-ID"); tid != "" {
			tenantID = tid
			hasTenant = true
		} else if tid := r.Header.Get("X-Tenant"); tid != "" {
			// 2. Try X-Tenant header (legacy)
			tenantID = tid
			hasTenant = true
		} else if host := r.Host; host != "" {
			// 3. Extract from subdomain
			parts := strings.Split(host, ".")
			if len(parts) > 0 {
				subdomain = parts[0]
				tenantID = subdomain
				hasTenant = true
			}
		} else if strings.Contains(r.URL.Path, "/market/") {
			// 4. Extract from URL path
			pathParts := strings.Split(r.URL.Path, "/")
			for i, part := range pathParts {
				if part == "market" && i+1 < len(pathParts) {
					subdomain = pathParts[i+1]
					tenantID = subdomain
					hasTenant = true
					break
				}
			}
		}

		// Default to "default" if no tenant context found
		if tenantID == "" {
			tenantID = "default"
		}

		// Create tenant info
		tenantInfo := &TenantInfo{
			ID:        tenantID,
			Subdomain: subdomain,
		}

		// Set context values
		ctx := context.WithValue(r.Context(), TenantIDKey, tenantID)
		ctx = context.WithValue(ctx, SubdomainKey, subdomain)
		ctx = context.WithValue(ctx, HasTenantKey, hasTenant)
		ctx = context.WithValue(ctx, TenantInfoKey, tenantInfo)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// RequireTenant middleware ensures tenant context exists
func RequireTenant(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		hasTenant := GetHasTenant(r.Context())
		tenantID := GetTenantID(r.Context())

		if !hasTenant || tenantID == "default" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"error":"Bad Request","message":"Tenant context is required"}`))
			return
		}

		next.ServeHTTP(w, r)
	})
}

// GetTenantID retrieves tenant ID from context
func GetTenantID(ctx context.Context) string {
	if tid, ok := ctx.Value(TenantIDKey).(string); ok {
		return tid
	}
	return "default"
}

// GetSubdomain retrieves subdomain from context
func GetSubdomain(ctx context.Context) string {
	if subdomain, ok := ctx.Value(SubdomainKey).(string); ok {
		return subdomain
	}
	return ""
}

// GetHasTenant checks if tenant context exists
func GetHasTenant(ctx context.Context) bool {
	if has, ok := ctx.Value(HasTenantKey).(bool); ok {
		return has
	}
	return false
}

// GetTenantInfo retrieves full tenant info from context
func GetTenantInfo(ctx context.Context) *TenantInfo {
	if info, ok := ctx.Value(TenantInfoKey).(*TenantInfo); ok {
		return info
	}
	return &TenantInfo{ID: "default"}
}
