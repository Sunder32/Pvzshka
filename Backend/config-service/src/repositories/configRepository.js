import { getDatabase } from '../config/database.js'
import { logger } from '../utils/logger.js'

/**
 * Получить конфигурацию магазина из базы данных
 * @param {string} tenantId - ID магазина или subdomain
 * @returns {Promise<Object|null>} - Конфиг или null
 */
export async function getConfigFromDB(tenantId) {
  try {
    const db = getDatabase()
    
    // Проверяем, является ли tenantId UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantId)
    
    const query = isUUID ? `
      SELECT 
        tc.id,
        tc.tenant_id,
        t.subdomain,
        t.name as tenant_name,
        t.status,
        t.tier,
        tc.version,
        tc.branding,
        tc.layout,
        tc.features,
        tc.homepage,
        tc.seo,
        tc.integrations,
        tc.locale,
        tc.contact_info,
        tc.is_active,
        tc.created_at,
        tc.updated_at
      FROM tenant_configs tc
      JOIN tenants t ON t.id = tc.tenant_id
      WHERE tc.tenant_id = $1::uuid
      LIMIT 1
    ` : `
      SELECT 
        tc.id,
        tc.tenant_id,
        t.subdomain,
        t.name as tenant_name,
        t.status,
        t.tier,
        tc.version,
        tc.branding,
        tc.layout,
        tc.features,
        tc.homepage,
        tc.seo,
        tc.integrations,
        tc.locale,
        tc.contact_info,
        tc.is_active,
        tc.created_at,
        tc.updated_at
      FROM tenant_configs tc
      JOIN tenants t ON t.id = tc.tenant_id
      WHERE t.subdomain = $1
      LIMIT 1
    `
    
    const result = await db.query(query, [tenantId])
    
    if (result.rows.length === 0) {
      return null
    }
    
    const row = result.rows[0]
    return {
      tenantId: row.tenant_id,
      subdomain: row.subdomain,
      name: row.tenant_name,
      status: row.status,
      tier: row.tier,
      version: row.version,
      branding: row.branding,
      layout: row.layout,
      features: row.features,
      homepage: row.homepage,
      seo: row.seo,
      integrations: row.integrations,
      locale: row.locale,
      contactInfo: row.contact_info,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  } catch (error) {
    logger.error(`Error fetching config from DB for tenant ${tenantId}:`, error)
    throw error
  }
}

/**
 * Сохранить конфигурацию магазина в базу данных
 * @param {string} tenantId - ID магазина или subdomain
 * @param {Object} config - Конфигурация
 * @returns {Promise<Object>} - Обновленный конфиг
 */
export async function saveConfigToDB(tenantId, config) {
  try {
    const db = getDatabase()
    
    // Проверяем, является ли tenantId UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantId)
    
    // Сначала найдем tenant_id
    const tenantQuery = isUUID
      ? `SELECT id FROM tenants WHERE id = $1::uuid LIMIT 1`
      : `SELECT id FROM tenants WHERE subdomain = $1 LIMIT 1`
    
    const tenantResult = await db.query(tenantQuery, [tenantId])
    
    if (tenantResult.rows.length === 0) {
      throw new Error(`Tenant ${tenantId} not found`)
    }
    
    const actualTenantId = tenantResult.rows[0].id
    
    // Обновляем или создаем конфиг
    const query = `
      INSERT INTO tenant_configs (
        tenant_id, 
        branding, 
        layout, 
        features, 
        homepage, 
        seo, 
        integrations, 
        locale,
        contact_info
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (tenant_id) DO UPDATE SET
        branding = COALESCE($2, tenant_configs.branding),
        layout = COALESCE($3, tenant_configs.layout),
        features = COALESCE($4, tenant_configs.features),
        homepage = COALESCE($5, tenant_configs.homepage),
        seo = COALESCE($6, tenant_configs.seo),
        integrations = COALESCE($7, tenant_configs.integrations),
        locale = COALESCE($8, tenant_configs.locale),
        contact_info = COALESCE($9, tenant_configs.contact_info),
        updated_at = NOW()
      RETURNING *
    `
    
    const result = await db.query(query, [
      actualTenantId,
      config.branding ? JSON.stringify(config.branding) : null,
      config.layout ? JSON.stringify(config.layout) : null,
      config.features ? JSON.stringify(config.features) : null,
      config.homepage ? JSON.stringify(config.homepage) : null,
      config.seo ? JSON.stringify(config.seo) : null,
      config.integrations ? JSON.stringify(config.integrations) : null,
      config.locale ? JSON.stringify(config.locale) : null,
      config.contactInfo ? JSON.stringify(config.contactInfo) : null,
    ])
    
    if (result.rows.length === 0) {
      throw new Error(`Failed to save config for tenant ${tenantId}`)
    }

    const row = result.rows[0]
    return {
      tenantId: row.tenant_id,
      version: row.version,
      branding: row.branding,
      layout: row.layout,
      features: row.features,
      homepage: row.homepage,
      seo: row.seo,
      integrations: row.integrations,
      locale: row.locale,
      contactInfo: row.contact_info,
      updatedAt: row.updated_at,
    }
  } catch (error) {
    logger.error(`Error saving config to DB for tenant ${tenantId}:`, error)
    throw error
  }
}

/**
 * Создать нового магазина с дефолтным конфигом
 * @param {Object} tenantData - Данные магазина
 * @returns {Promise<Object>} - Созданный магазин
 */
export async function createTenantWithConfig(tenantData) {
  try {
    const db = getDatabase()
    const { name, subdomain, adminEmail, tier = 'free', config = {} } = tenantData
    
    const query = `
      INSERT INTO tenants (name, subdomain, admin_email, tier, config, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, 'active', NOW(), NOW())
      RETURNING 
        id,
        name,
        subdomain,
        admin_email,
        config,
        status,
        tier,
        created_at,
        updated_at
    `
    
    const result = await db.query(query, [
      name,
      subdomain,
      adminEmail,
      tier,
      JSON.stringify(config),
    ])
    
    const tenant = result.rows[0]
    return {
      tenantId: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      adminEmail: tenant.admin_email,
      status: tenant.status,
      tier: tenant.tier,
      config: tenant.config,
      createdAt: tenant.created_at,
      updatedAt: tenant.updated_at,
    }
  } catch (error) {
    logger.error('Error creating tenant:', error)
    throw error
  }
}

/**
 * Получить список всех магазинов
 * @param {Object} options - Опции фильтрации
 * @returns {Promise<Array>} - Список магазинов
 */
export async function getAllTenants(options = {}) {
  try {
    const db = getDatabase()
    const { status, tier, limit = 100, offset = 0 } = options
    
    let query = `
      SELECT 
        id,
        name,
        subdomain,
        admin_email,
        status,
        tier,
        created_at,
        updated_at
      FROM tenants
      WHERE 1=1
    `
    
    const params = []
    let paramIndex = 1
    
    if (status) {
      query += ` AND status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }
    
    if (tier) {
      query += ` AND tier = $${paramIndex}`
      params.push(tier)
      paramIndex++
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)
    
    const result = await db.query(query, params)
    
    return result.rows.map(tenant => ({
      tenantId: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      adminEmail: tenant.admin_email,
      status: tenant.status,
      tier: tenant.tier,
      createdAt: tenant.created_at,
      updatedAt: tenant.updated_at,
    }))
  } catch (error) {
    logger.error('Error fetching all tenants:', error)
    throw error
  }
}

/**
 * Удалить магазин
 * @param {string} tenantId - ID магазина
 * @returns {Promise<boolean>} - Успешность удаления
 */
export async function deleteTenant(tenantId) {
  try {
    const db = getDatabase()
    
    // Мягкое удаление - меняем статус на 'deleted'
    const query = `
      UPDATE tenants
      SET 
        status = 'deleted',
        updated_at = NOW()
      WHERE id = $1 OR subdomain = $1
      RETURNING id
    `
    
    const result = await db.query(query, [tenantId])
    
    return result.rows.length > 0
  } catch (error) {
    logger.error(`Error deleting tenant ${tenantId}:`, error)
    throw error
  }
}

/**
 * Обновить статус магазина
 * @param {string} tenantId - ID магазина
 * @param {string} status - Новый статус (active, suspended, deleted)
 * @returns {Promise<Object>} - Обновленный магазин
 */
export async function updateTenantStatus(tenantId, status) {
  try {
    const db = getDatabase()
    const validStatuses = ['active', 'suspended', 'deleted']
    
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`)
    }
    
    const query = `
      UPDATE tenants
      SET 
        status = $1,
        updated_at = NOW()
      WHERE id = $2 OR subdomain = $2
      RETURNING 
        id,
        name,
        subdomain,
        status,
        tier,
        updated_at
    `
    
    const result = await db.query(query, [status, tenantId])
    
    if (result.rows.length === 0) {
      throw new Error(`Tenant ${tenantId} not found`)
    }
    
    const tenant = result.rows[0]
    return {
      tenantId: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      status: tenant.status,
      tier: tenant.tier,
      updatedAt: tenant.updated_at,
    }
  } catch (error) {
    logger.error(`Error updating tenant status ${tenantId}:`, error)
    throw error
  }
}

/**
 * Обновить тарифный план магазина
 * @param {string} tenantId - ID магазина
 * @param {string} tier - Новый тариф (free, basic, premium, enterprise)
 * @returns {Promise<Object>} - Обновленный магазин
 */
export async function updateTenantTier(tenantId, tier) {
  try {
    const db = getDatabase()
    const validTiers = ['free', 'basic', 'premium', 'enterprise']
    
    if (!validTiers.includes(tier)) {
      throw new Error(`Invalid tier: ${tier}`)
    }
    
    const query = `
      UPDATE tenants
      SET 
        tier = $1,
        updated_at = NOW()
      WHERE id = $2 OR subdomain = $2
      RETURNING 
        id,
        name,
        subdomain,
        status,
        tier,
        updated_at
    `
    
    const result = await db.query(query, [tier, tenantId])
    
    if (result.rows.length === 0) {
      throw new Error(`Tenant ${tenantId} not found`)
    }
    
    const tenant = result.rows[0]
    return {
      tenantId: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      status: tenant.status,
      tier: tenant.tier,
      updatedAt: tenant.updated_at,
    }
  } catch (error) {
    logger.error(`Error updating tenant tier ${tenantId}:`, error)
    throw error
  }
}
