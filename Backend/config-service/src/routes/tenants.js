import express from 'express';
import { getDatabase } from '../config/database.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// GET /api/tenants - Получить все tenants
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const query = `
      SELECT 
        id,
        subdomain,
        name,
        tier,
        status,
        custom_domain as "customDomain",
        country,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM tenants
      WHERE status != 'deleted'
      ORDER BY created_at DESC
    `;
    
    const result = await db.query(query);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    logger.error('Error fetching tenants:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tenants',
      message: error.message,
    });
  }
});

// GET /api/tenants/stats - Получить статистику
router.get('/stats', async (req, res) => {
  try {
    const db = getDatabase();
    
    const statsQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE status != 'deleted') as total_tenants,
        COUNT(*) FILTER (WHERE status = 'active') as active_tenants,
        (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users
      FROM tenants
    `;
    
    const result = await db.query(statsQuery);
    const stats = result.rows[0];
    
    res.json({
      success: true,
      data: {
        totalTenants: parseInt(stats.total_tenants) || 0,
        activeTenants: parseInt(stats.active_tenants) || 0,
        totalUsers: parseInt(stats.total_users) || 0,
        monthlyRevenue: 0, // TODO: Подключить payment service
      },
    });
  } catch (error) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
    });
  }
});

// GET /api/tenants/:id - Получить один tenant
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    // Проверяем UUID или subdomain
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    const query = isUUID
      ? `SELECT * FROM tenants WHERE id = $1::uuid LIMIT 1`
      : `SELECT * FROM tenants WHERE subdomain = $1 LIMIT 1`;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found',
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    logger.error(`Error fetching tenant ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tenant',
    });
  }
});

// POST /api/tenants - Создать tenant
router.post('/', async (req, res) => {
  try {
    const { subdomain, name, tier = 'starter', customDomain, country = 'RU' } = req.body;
    
    if (!subdomain || !name) {
      return res.status(400).json({
        success: false,
        error: 'Subdomain and name are required',
      });
    }
    
    const db = getDatabase();
    
    const query = `
      INSERT INTO tenants (subdomain, name, tier, custom_domain, country, status, config)
      VALUES ($1, $2, $3, $4, $5, 'active', '{}')
      RETURNING 
        id,
        subdomain,
        name,
        tier,
        status,
        custom_domain as "customDomain",
        country,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    
    const result = await db.query(query, [subdomain, name, tier, customDomain, country]);
    const newTenant = result.rows[0];
    
    // Создаем конфиг для нового tenant
    const configQuery = `
      INSERT INTO tenant_configs (tenant_id, branding, contact_info)
      VALUES (
        $1,
        jsonb_build_object(
          'siteName', $2,
          'logoUrl', '',
          'faviconUrl', '',
          'primaryColor', '#3B82F6',
          'secondaryColor', '#10B981',
          'accentColor', '#F59E0B'
        ),
        jsonb_build_object(
          'email', '',
          'phone', '',
          'address', '',
          'workingHours', 'Пн-Пт: 9:00-18:00'
        )
      )
      ON CONFLICT (tenant_id) DO NOTHING
    `;
    
    await db.query(configQuery, [newTenant.id, name]);
    
    logger.info(`Created new tenant: ${subdomain} (${newTenant.id})`);
    
    res.status(201).json({
      success: true,
      data: newTenant,
    });
  } catch (error) {
    logger.error('Error creating tenant:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        success: false,
        error: 'Tenant with this subdomain already exists',
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create tenant',
      message: error.message,
    });
  }
});

// PUT /api/tenants/:id - Обновить tenant
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, tier, status, customDomain, country } = req.body;
    
    const db = getDatabase();
    
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (tier !== undefined) {
      updates.push(`tier = $${paramCount++}`);
      values.push(tier);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (customDomain !== undefined) {
      updates.push(`custom_domain = $${paramCount++}`);
      values.push(customDomain);
    }
    if (country !== undefined) {
      updates.push(`country = $${paramCount++}`);
      values.push(country);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
    }
    
    updates.push(`updated_at = NOW()`);
    values.push(id);
    
    const query = `
      UPDATE tenants
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}::uuid
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found',
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    logger.error(`Error updating tenant ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to update tenant',
    });
  }
});

// DELETE /api/tenants/:id - Удалить tenant (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const query = `
      UPDATE tenants
      SET status = 'deleted', updated_at = NOW()
      WHERE id = $1::uuid
      RETURNING id
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Tenant deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting tenant ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete tenant',
    });
  }
});

export default router;
