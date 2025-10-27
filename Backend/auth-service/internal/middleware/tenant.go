package middleware

import (
	"context"
	"net/http"
	"strings"
)

// TenantContextKey is the key for tenant context
type TenantContextKey string

const (
	TenantIDKey     TenantContextKey = "tenantID"
	TenantKey       TenantContextKey = "tenant"
	SubdomainKey    TenantContextKey = "subdomain"
	HasTenantKey    TenantContextKey = "hasTenant"
)

// Tenant represents tenant information
type Tenant struct {
	ID        string `json:"id"`
	Subdomain string `json:"subdomain"`
	Name      string `json:"name"`
	Status    string `json:"status"`
	Tier      string `json:"tier"`
}

// TenantMiddleware extracts tenant ID from various sources
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
				hasTenant = true
			}
		} else if strings.Contains(r.URL.Path, "/market/") {
			// 4. Extract from URL path (e.g., /market/shop1/products)
			pathParts := strings.Split(r.URL.Path, "/")
			for i, part := range pathParts {
				if part == "market" && i+1 < len(pathParts) {
					subdomain = pathParts[i+1]
					hasTenant = true
					break
				}
			}
		}

		// Default to "default" if no tenant context found
		if tenantID == "" && subdomain != "" {
			tenantID = subdomain
		} else if tenantID == "" {
			tenantID = "default"
		}

		// Create tenant object
		tenant := &Tenant{
			ID:        tenantID,
			Subdomain: subdomain,
		}

		// Add to context
		ctx := context.WithValue(r.Context(), TenantIDKey, tenantID)
		ctx = context.WithValue(ctx, TenantKey, tenant)
		ctx = context.WithValue(ctx, SubdomainKey, subdomain)
		ctx = context.WithValue(ctx, HasTenantKey, hasTenant)

		// Call next handler with updated context
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// RequireTenant middleware ensures tenant context exists
func RequireTenant(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		hasTenant := r.Context().Value(HasTenantKey)
		tenantID := r.Context().Value(TenantIDKey)

		if hasTenant == false || tenantID == "default" {
			http.Error(w, `{"error":"Bad Request","message":"Tenant context is required"}`, http.StatusBadRequest)
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

// GetTenant retrieves tenant from context
func GetTenant(ctx context.Context) *Tenant {
	if tenant, ok := ctx.Value(TenantKey).(*Tenant); ok {
		return tenant
	}
	return &Tenant{ID: "default", Subdomain: "default"}
}

// GetSubdomain retrieves subdomain from context
func GetSubdomain(ctx context.Context) string {
	if subdomain, ok := ctx.Value(SubdomainKey).(string); ok {
		return subdomain
	}
	return ""
}

// HasTenantContext checks if tenant context exists
func HasTenantContext(ctx context.Context) bool {
	if has, ok := ctx.Value(HasTenantKey).(bool); ok {
		return has
	}
	return false
}
