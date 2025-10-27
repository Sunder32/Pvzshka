import express from 'express';
import { getPool } from '../config/database.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// GET /api/v1/products
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const { tenant_id, category_id, search, page = 1, limit = 20, is_featured, sort = 'created_at', order = 'DESC' } = req.query;

    if (!tenant_id) {
      return res.status(400).json({ error: 'tenant_id is required' });
    }

    const queryParams = [tenant_id];
    let paramIndex = 2;
    let whereClause = 'WHERE p.tenant_id = $1 AND p.is_active = true';

    if (category_id) {
      whereClause += ` AND p.category_id = $${paramIndex}`;
      queryParams.push(category_id);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND p.title ILIKE $${paramIndex}`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (is_featured === 'true') {
      whereClause += ` AND p.is_featured = true`;
    }

    const allowedSorts = ['created_at', 'price', 'title', 'inventory'];
    const sortField = allowedSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const offset = (parseInt(page) - 1) * parseInt(limit);
    queryParams.push(parseInt(limit), offset);

    const query = `SELECT p.id, p.tenant_id, p.category_id, p.sku, p.title, p.description, p.price, p.compare_at_price, p.inventory, p.images, p.is_featured, p.is_active, p.created_at, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id ${whereClause} ORDER BY p.${sortField} ${sortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

    const countQuery = `SELECT COUNT(*) as total FROM products p ${whereClause}`;

    const [result, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2))
    ]);
    
    res.json({ success: true, products: result.rows, pagination: { page: parseInt(page), limit: parseInt(limit), total: parseInt(countResult.rows[0].total), pages: Math.ceil(parseInt(countResult.rows[0].total) / parseInt(limit)) } });
  } catch (error) {
    logger.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /api/v1/products/:id
router.get('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { tenant_id } = req.query;

    if (!tenant_id) {
      return res.status(400).json({ error: 'tenant_id is required' });
    }
    
    const query = `SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1 AND p.tenant_id = $2 AND p.is_active = true`;
    
    const result = await pool.query(query, [id, tenant_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ success: true, product: result.rows[0] });
  } catch (error) {
    logger.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

export default router;