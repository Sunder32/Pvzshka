// Tenant middleware for payment-service

export interface TenantRequest {
  headers?: {
    [key: string]: string | string[] | undefined
    host?: string
  }
  path?: string
  tenantId?: string
  subdomain?: string
  tenant?: {
    id: string
    subdomain?: string
    name?: string
    status?: string
    tier?: string
  }
  hasTenantContext?: boolean
}

export interface ResponseType {
  status: (code: number) => ResponseType
  json: (body: any) => void
}

/**
 * Middleware to extract tenant ID from various sources
 */
export const tenantMiddleware = (req: any, res: any, next: () => void) => {
  try {
    let tenantId: string | null = null
    let subdomain: string | null = null
    let hasTenant = false

    // 1. Try X-Tenant-ID header (highest priority)
    if (req.headers && req.headers['x-tenant-id']) {
      tenantId = req.headers['x-tenant-id'] as string
      hasTenant = true
    }
    // 2. Try X-Tenant header (legacy)
    else if (req.headers && req.headers['x-tenant']) {
      tenantId = req.headers['x-tenant'] as string
      hasTenant = true
    }
    // 3. Extract from subdomain
    else if (req.headers && req.headers.host) {
      const parts = req.headers.host.split('.')
      if (parts.length > 0) {
        subdomain = parts[0]
        tenantId = subdomain
        hasTenant = true
      }
    }
    // 4. Extract from URL path (e.g., /market/shop1/payments)
    else if (req.path && req.path.includes('/market/')) {
      const pathParts = req.path.split('/')
      const marketIndex = pathParts.indexOf('market')
      if (marketIndex !== -1 && marketIndex + 1 < pathParts.length) {
        subdomain = pathParts[marketIndex + 1]
        tenantId = subdomain
        hasTenant = true
      }
    }

    // Default to "default" if no tenant context found
    if (!tenantId) {
      tenantId = 'default'
    }

    // Set tenant context in request
    req.tenantId = tenantId
    req.subdomain = subdomain || undefined
    req.tenant = {
      id: tenantId,
      subdomain: subdomain || undefined,
    }
    req.hasTenantContext = hasTenant

    next()
  } catch (error) {
    console.error('Tenant middleware error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process tenant context',
    })
  }
}

/**
 * Middleware to require tenant context
 */
export const requireTenant = (req: any, res: any, next: () => void) => {
  if (!req.hasTenantContext || req.tenantId === 'default') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Tenant context is required. Please provide X-Tenant-ID header or access via tenant subdomain.',
    })
  }
  next()
}

/**
 * Get tenant ID from request
 */
export function getTenantId(req: TenantRequest): string {
  return req.tenantId || 'default'
}

/**
 * Check if tenant context exists
 */
export function hasTenantContext(req: TenantRequest): boolean {
  return req.hasTenantContext || false
}
