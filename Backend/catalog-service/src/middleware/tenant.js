// Middleware для извлечения tenant_id из URL и установки контекста

export const tenantMiddleware = (req, res, next) => {
  try {
    // Извлекаем tenant_id из различных источников
    let tenantId = null
    let subdomain = null

    // 1. Из заголовка X-Tenant-ID (приоритет)
    if (req.headers['x-tenant-id']) {
      tenantId = req.headers['x-tenant-id']
    }
    // 2. Из заголовка X-Tenant (legacy)
    else if (req.headers['x-tenant']) {
      tenantId = req.headers['x-tenant']
    }
    // 3. Из поддомена (например, shop1.marketplace.com)
    else if (req.headers.host) {
      subdomain = req.headers.host.split('.')[0]
      req.subdomain = subdomain
    }
    // 4. Из URL пути (например, /api/market/shop1/products)
    else if (req.path && req.path.includes('/market/')) {
      const pathParts = req.path.split('/')
      const marketIndex = pathParts.indexOf('market')
      if (marketIndex !== -1 && pathParts[marketIndex + 1]) {
        subdomain = pathParts[marketIndex + 1]
        req.subdomain = subdomain
      }
    }

    // Устанавливаем tenant_id или используем default для compatibility
    req.tenantId = tenantId || subdomain || 'default'
    req.tenant = { 
      id: req.tenantId,
      subdomain: subdomain || req.tenantId
    }

    // Добавляем флаг для проверки наличия tenant context
    req.hasTenantContext = !!tenantId || !!subdomain

    next()
  } catch (error) {
    console.error('Tenant middleware error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process tenant context'
    })
  }
}

// Middleware для обязательной проверки tenant context
export const requireTenant = (req, res, next) => {
  if (!req.hasTenantContext && req.tenantId === 'default') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Tenant context is required. Please provide X-Tenant-ID header or access via tenant subdomain.'
    })
  }
  next()
}

// Функция для получения tenant_id из БД по поддомену (для будущего использования с БД)
export async function getTenantBySubdomain(subdomain) {
  // TODO: Implement database query when PostgreSQL connection is added
  // For now, return mock data or subdomain as tenantId
  return {
    id: subdomain,
    subdomain: subdomain,
    name: `${subdomain} Marketplace`,
    status: 'active',
    tier: 'standard'
  }
}

// Middleware для загрузки полной информации о tenant
export const loadTenantInfo = () => async (req, res, next) => {
  try {
    if (req.subdomain && (!req.tenantId || req.tenantId === req.subdomain)) {
      const tenant = await getTenantBySubdomain(req.subdomain)
      
      if (!tenant) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Tenant with subdomain '${req.subdomain}' not found or is not active`
        })
      }
      
      req.tenantId = tenant.id
      req.tenant = tenant
    }
    
    next()
  } catch (error) {
    console.error('Load tenant info error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to load tenant information'
    })
  }
}
