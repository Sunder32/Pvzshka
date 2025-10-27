import express from 'express';
import { getDatabase } from '../config/database.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// GET /api/suppliers - Получить всех поставщиков для tenant
router.get('/', async (req, res) => {
  try {
    const pool = getDatabase();
    const { tenant_id, status, limit = 100, offset = 0 } = req.query;

    if (!tenant_id) {
      return res.status(400).json({
        success: false,
        message: 'tenant_id is required',
      });
    }

    let query = `
      SELECT 
        id, tenant_id, name, contact_person, email, phone, 
        address, description, products_count, status, 
        created_at, updated_at
      FROM suppliers
      WHERE tenant_id = $1
    `;
    const params = [tenant_id];

    // Фильтр по статусу
    if (status) {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Получить общее количество
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM suppliers 
      WHERE tenant_id = $1 ${status ? 'AND status = $2' : ''}
    `;
    const countParams = status ? [tenant_id, status] : [tenant_id];
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    logger.error('Error fetching suppliers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suppliers',
      error: error.message,
    });
  }
});

// GET /api/suppliers/stats - Статистика поставщиков для tenant
router.get('/stats', async (req, res) => {
  try {
    const pool = getDatabase();
    const { tenant_id } = req.query;

    if (!tenant_id) {
      return res.status(400).json({
        success: false,
        message: 'tenant_id is required',
      });
    }

    const query = `
      SELECT 
        COUNT(*) as total_suppliers,
        COUNT(*) FILTER (WHERE status = 'active') as active_suppliers,
        COALESCE(SUM(products_count), 0) as total_products
      FROM suppliers
      WHERE tenant_id = $1
    `;

    const result = await pool.query(query, [tenant_id]);

    res.json({
      success: true,
      data: {
        totalSuppliers: parseInt(result.rows[0].total_suppliers),
        activeSuppliers: parseInt(result.rows[0].active_suppliers),
        totalProducts: parseInt(result.rows[0].total_products),
      },
    });
  } catch (error) {
    logger.error('Error fetching supplier stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supplier stats',
      error: error.message,
    });
  }
});

// GET /api/suppliers/:id - Получить одного поставщика
router.get('/:id', async (req, res) => {
  try {
    const pool = getDatabase();
    const { id } = req.params;
    const { tenant_id } = req.query;

    if (!tenant_id) {
      return res.status(400).json({
        success: false,
        message: 'tenant_id is required',
      });
    }

    const query = `
      SELECT 
        id, tenant_id, name, contact_person, email, phone, 
        address, description, products_count, status, 
        created_at, updated_at
      FROM suppliers
      WHERE id = $1 AND tenant_id = $2
    `;

    const result = await pool.query(query, [id, tenant_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Error fetching supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supplier',
      error: error.message,
    });
  }
});

// POST /api/suppliers - Создать поставщика
router.post('/', async (req, res) => {
  try {
    const pool = getDatabase();
    const {
      tenant_id,
      name,
      contact_person,
      email,
      phone,
      address,
      description,
      products_count = 0,
      status = 'active',
    } = req.body;

    if (!tenant_id || !name) {
      return res.status(400).json({
        success: false,
        message: 'tenant_id and name are required',
      });
    }

    const query = `
      INSERT INTO suppliers (
        tenant_id, name, contact_person, email, phone, 
        address, description, products_count, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await pool.query(query, [
      tenant_id,
      name,
      contact_person,
      email,
      phone,
      address,
      description,
      products_count,
      status,
    ]);

    logger.info(`Supplier created: ${result.rows[0].id} for tenant ${tenant_id}`);

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Error creating supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create supplier',
      error: error.message,
    });
  }
});

// PUT /api/suppliers/:id - Обновить поставщика
router.put('/:id', async (req, res) => {
  try {
    const pool = getDatabase();
    const { id } = req.params;
    const {
      tenant_id,
      name,
      contact_person,
      email,
      phone,
      address,
      description,
      products_count,
      status,
    } = req.body;

    if (!tenant_id) {
      return res.status(400).json({
        success: false,
        message: 'tenant_id is required',
      });
    }

    // Проверка существования
    const checkQuery = 'SELECT id FROM suppliers WHERE id = $1 AND tenant_id = $2';
    const checkResult = await pool.query(checkQuery, [id, tenant_id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
    }

    // Динамическое построение запроса обновления
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (contact_person !== undefined) {
      updates.push(`contact_person = $${paramCount++}`);
      values.push(contact_person);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (address !== undefined) {
      updates.push(`address = $${paramCount++}`);
      values.push(address);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (products_count !== undefined) {
      updates.push(`products_count = $${paramCount++}`);
      values.push(products_count);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    values.push(id, tenant_id);
    const query = `
      UPDATE suppliers 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount} AND tenant_id = $${paramCount + 1}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    logger.info(`Supplier updated: ${id}`);

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Error updating supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update supplier',
      error: error.message,
    });
  }
});

// DELETE /api/suppliers/:id - Удалить поставщика
router.delete('/:id', async (req, res) => {
  try {
    const pool = getDatabase();
    const { id } = req.params;
    const { tenant_id } = req.query;

    if (!tenant_id) {
      return res.status(400).json({
        success: false,
        message: 'tenant_id is required',
      });
    }

    const query = 'DELETE FROM suppliers WHERE id = $1 AND tenant_id = $2 RETURNING id';
    const result = await pool.query(query, [id, tenant_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
    }

    logger.info(`Supplier deleted: ${id}`);

    res.json({
      success: true,
      message: 'Supplier deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete supplier',
      error: error.message,
    });
  }
});

export default router;
