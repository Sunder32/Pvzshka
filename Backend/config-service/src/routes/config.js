import express from 'express'
import { getRedis } from '../config/redis.js'
import { logger } from '../utils/logger.js'
import {
  getConfigFromDB,
  saveConfigToDB,
  createTenantWithConfig,
  getAllTenants,
  deleteTenant,
  updateTenantStatus,
  updateTenantTier,
} from '../repositories/configRepository.js'

const router = express.Router()

// Структура конфига магазина
const defaultConfig = {
  branding: {
    name: '',
    logo: '',
    favicon: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
  },
  layout: {
    headerStyle: 'default', // default, minimal, centered
    footerStyle: 'default',
    productCardStyle: 'card', // card, list, grid
  },
  features: {
    wishlist: true,
    compare: true,
    quickView: true,
    reviews: true,
    ratings: true,
    socialShare: true,
  },
  categories: [],
  homepage: {
    hero: {
      enabled: true,
      title: '',
      subtitle: '',
      image: '',
      cta: {
        text: 'Shop Now',
        link: '/catalog',
      },
    },
    featuredProducts: {
      enabled: true,
      title: 'Featured Products',
      limit: 8,
    },
    categories: {
      enabled: true,
      title: 'Shop by Category',
    },
  },
  seo: {
    title: '',
    description: '',
    keywords: [],
    ogImage: '',
  },
  integrations: {
    analytics: {
      googleAnalytics: '',
      yandexMetrika: '',
    },
    payment: {
      stripe: false,
      paypal: false,
      yookassa: false,
    },
    shipping: {
      cdek: false,
      russianPost: false,
      pickup: true,
    },
  },
  locale: {
    currency: 'RUB',
    language: 'ru',
    timezone: 'Europe/Moscow',
  },
  version: 1,
  updatedAt: new Date().toISOString(),
}

// GET /api/config/:tenantId - Получить конфиг магазина
router.get('/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params
    const redis = getRedis()

    // Пытаемся получить из Redis
    const cached = await redis.get(`config:${tenantId}`)
    if (cached) {
      logger.info(`Config cache hit for tenant: ${tenantId}`)
      return res.json({
        success: true,
        data: JSON.parse(cached),
        source: 'cache',
      })
    }

    // Получаем из PostgreSQL
    const dbData = await getConfigFromDB(tenantId)
    
    if (!dbData) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found',
      })
    }

    // Формируем полный конфиг, мержим с дефолтным
    const config = {
      ...defaultConfig,
      ...dbData.config,
      tenantId: dbData.tenantId,
      subdomain: dbData.subdomain,
      branding: {
        ...defaultConfig.branding,
        ...(dbData.config?.branding || {}),
        name: dbData.name,
      },
      status: dbData.status,
      tier: dbData.tier,
      createdAt: dbData.createdAt,
      updatedAt: dbData.updatedAt,
    }

    // Сохраняем в Redis на 1 час
    await redis.setEx(`config:${tenantId}`, 3600, JSON.stringify(config))

    res.json({
      success: true,
      data: config,
      source: 'database',
    })
  } catch (error) {
    logger.error('Error fetching config:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch config',
      message: error.message,
    })
  }
})

// PUT /api/config/:tenantId - Обновить конфиг магазина
router.put('/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params
    const updates = req.body
    const redis = getRedis()

    // Получаем текущий конфиг из БД
    const dbData = await getConfigFromDB(tenantId)
    
    if (!dbData) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found',
      })
    }

    // Мержим с новыми данными
    const updatedConfig = {
      ...dbData.config,
      ...updates,
      version: (dbData.config?.version || 0) + 1,
      updatedAt: new Date().toISOString(),
    }

    // Сохраняем в PostgreSQL
    await saveConfigToDB(tenantId, updatedConfig)

    // Обновляем кэш в Redis
    const fullConfig = {
      ...defaultConfig,
      ...updatedConfig,
      tenantId: dbData.tenantId,
      subdomain: dbData.subdomain,
      branding: {
        ...defaultConfig.branding,
        ...(updatedConfig.branding || {}),
        name: dbData.name,
      },
      status: dbData.status,
      tier: dbData.tier,
    }
    
    await redis.setEx(`config:${tenantId}`, 3600, JSON.stringify(fullConfig))

    // Отправляем webhook-уведомления подписчикам
    await notifyConfigUpdate(tenantId, fullConfig)

    logger.info(`Config updated for tenant: ${tenantId}, version: ${updatedConfig.version}`)

    res.json({
      success: true,
      data: fullConfig,
      message: 'Config updated successfully',
    })
  } catch (error) {
    logger.error('Error updating config:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update config',
      message: error.message,
    })
  }
})

// PATCH /api/config/:tenantId - Частичное обновление конфига
router.patch('/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params
    const updates = req.body
    const redis = getRedis()

    const current = await redis.get(`config:${tenantId}`)
    if (!current) {
      return res.status(404).json({
        success: false,
        error: 'Config not found',
      })
    }

    const currentConfig = JSON.parse(current)
    const updatedConfig = deepMerge(currentConfig, updates)
    updatedConfig.version = (currentConfig.version || 0) + 1
    updatedConfig.updatedAt = new Date().toISOString()

    await redis.setEx(`config:${tenantId}`, 3600, JSON.stringify(updatedConfig))
    await notifyConfigUpdate(tenantId, updatedConfig)

    res.json({
      success: true,
      data: updatedConfig,
      message: 'Config updated successfully',
    })
  } catch (error) {
    logger.error('Error patching config:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to patch config',
      message: error.message,
    })
  }
})

// DELETE /api/config/:tenantId - Удалить конфиг (сброс к default)
router.delete('/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params
    const redis = getRedis()

    await redis.del(`config:${tenantId}`)

    res.json({
      success: true,
      message: 'Config reset to default',
    })
  } catch (error) {
    logger.error('Error deleting config:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete config',
      message: error.message,
    })
  }
})

// GET /api/config/:tenantId/version - Получить версию конфига
router.get('/:tenantId/version', async (req, res) => {
  try {
    const { tenantId } = req.params
    const redis = getRedis()

    const cached = await redis.get(`config:${tenantId}`)
    if (!cached) {
      return res.json({
        success: true,
        version: 0,
        updatedAt: null,
      })
    }

    const config = JSON.parse(cached)
    res.json({
      success: true,
      version: config.version || 0,
      updatedAt: config.updatedAt || null,
    })
  } catch (error) {
    logger.error('Error getting config version:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get config version',
      message: error.message,
    })
  }
})

// Функция для отправки webhook-уведомлений
async function notifyConfigUpdate(tenantId, config) {
  try {
    const redis = getRedis()
    
    // Публикуем событие в Redis Pub/Sub
    await redis.publish(
      'config:updated',
      JSON.stringify({
        tenantId,
        version: config.version,
        updatedAt: config.updatedAt,
        event: 'config.updated',
      })
    )

    logger.info(`Config update notification sent for tenant: ${tenantId}`)
  } catch (error) {
    logger.error('Error sending config update notification:', error)
  }
}

// Вспомогательная функция для глубокого слияния объектов
function deepMerge(target, source) {
  const output = { ...target }
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key]
        } else {
          output[key] = deepMerge(target[key], source[key])
        }
      } else {
        output[key] = source[key]
      }
    })
  }
  
  return output
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item)
}

// POST /api/config - Создать новый магазин с конфигом
router.post('/', async (req, res) => {
  try {
    const { name, subdomain, adminEmail, tier, config } = req.body

    // Валидация
    if (!name || !subdomain || !adminEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, subdomain, adminEmail',
      })
    }

    // Мержим дефолтный конфиг с переданным
    const initialConfig = {
      ...defaultConfig,
      ...config,
      branding: {
        ...defaultConfig.branding,
        ...(config?.branding || {}),
        name,
      },
    }

    // Создаем магазин в БД
    const tenant = await createTenantWithConfig({
      name,
      subdomain,
      adminEmail,
      tier: tier || 'free',
      config: initialConfig,
    })

    logger.info(`New tenant created: ${tenant.tenantId} (${tenant.subdomain})`)

    res.status(201).json({
      success: true,
      data: tenant,
      message: 'Tenant created successfully',
    })
  } catch (error) {
    logger.error('Error creating tenant:', error)
    
    // Обработка дубликата subdomain
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Subdomain already exists',
        message: error.message,
      })
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create tenant',
      message: error.message,
    })
  }
})

// GET /api/config - Получить список всех магазинов
router.get('/', async (req, res) => {
  try {
    const { status, tier, limit, offset } = req.query

    const tenants = await getAllTenants({
      status,
      tier,
      limit: limit ? parseInt(limit) : 100,
      offset: offset ? parseInt(offset) : 0,
    })

    res.json({
      success: true,
      data: tenants,
      count: tenants.length,
    })
  } catch (error) {
    logger.error('Error fetching tenants:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tenants',
      message: error.message,
    })
  }
})

// PATCH /api/config/:tenantId/status - Обновить статус магазина
router.patch('/:tenantId/status', async (req, res) => {
  try {
    const { tenantId } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: status',
      })
    }

    const tenant = await updateTenantStatus(tenantId, status)
    const redis = getRedis()

    // Инвалидируем кэш
    await redis.del(`config:${tenantId}`)

    logger.info(`Tenant status updated: ${tenantId} -> ${status}`)

    res.json({
      success: true,
      data: tenant,
      message: 'Status updated successfully',
    })
  } catch (error) {
    logger.error('Error updating tenant status:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update status',
      message: error.message,
    })
  }
})

// PATCH /api/config/:tenantId/tier - Обновить тарифный план
router.patch('/:tenantId/tier', async (req, res) => {
  try {
    const { tenantId } = req.params
    const { tier } = req.body

    if (!tier) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: tier',
      })
    }

    const tenant = await updateTenantTier(tenantId, tier)
    const redis = getRedis()

    // Инвалидируем кэш
    await redis.del(`config:${tenantId}`)

    logger.info(`Tenant tier updated: ${tenantId} -> ${tier}`)

    res.json({
      success: true,
      data: tenant,
      message: 'Tier updated successfully',
    })
  } catch (error) {
    logger.error('Error updating tenant tier:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update tier',
      message: error.message,
    })
  }
})

export default router
