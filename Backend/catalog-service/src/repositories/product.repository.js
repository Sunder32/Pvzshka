const { getPool } = require('../config/database');

class ProductRepository {
  async findAll({ tenantId, categoryId, vendorId, limit, offset }) {
    const pool = getPool();
    
    let query = `
      SELECT p.*, c.name as category_name, u.email as vendor_email
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.vendor_id = u.id
      WHERE p.tenant_id = $1
    `;
    
    const params = [tenantId];
    let paramIndex = 2;

    if (categoryId) {
      query += ` AND p.category_id = $${paramIndex}`;
      params.push(categoryId);
      paramIndex++;
    }

    if (vendorId) {
      query += ` AND p.vendor_id = $${paramIndex}`;
      params.push(vendorId);
      paramIndex++;
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  async findById(id, tenantId) {
    const pool = getPool();
    const result = await pool.query(
      `SELECT p.*, c.name as category_name, u.email as vendor_email
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.vendor_id = u.id
       WHERE p.id = $1 AND p.tenant_id = $2`,
      [id, tenantId]
    );
    return result.rows[0];
  }

  async create(productData) {
    const pool = getPool();
    const {
      tenant_id,
      vendor_id,
      category_id,
      name,
      description,
      sku,
      price,
      compare_at_price,
      cost_per_item,
      stock,
      images,
      variants,
      tags,
      metadata,
    } = productData;

    const result = await pool.query(
      `INSERT INTO products (
        tenant_id, vendor_id, category_id, name, description, sku,
        price, compare_at_price, cost_per_item, stock,
        images, variants, tags, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        tenant_id,
        vendor_id || null,
        category_id,
        name,
        description || null,
        sku,
        price,
        compare_at_price || null,
        cost_per_item || null,
        stock || 0,
        JSON.stringify(images || []),
        JSON.stringify(variants || []),
        JSON.stringify(tags || []),
        JSON.stringify(metadata || {}),
      ]
    );

    return result.rows[0];
  }

  async update(id, productData) {
    const pool = getPool();
    const updates = [];
    const params = [];
    let paramIndex = 1;

    const allowedFields = [
      'category_id', 'name', 'description', 'sku', 'price',
      'compare_at_price', 'cost_per_item', 'stock', 'images',
      'variants', 'tags', 'metadata', 'is_active'
    ];

    for (const field of allowedFields) {
      if (productData[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        
        if (['images', 'variants', 'tags', 'metadata'].includes(field)) {
          params.push(JSON.stringify(productData[field]));
        } else {
          params.push(productData[field]);
        }
        
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const result = await pool.query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    return result.rows[0];
  }

  async delete(id) {
    const pool = getPool();
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
  }

  async updateStock(id, quantity) {
    const pool = getPool();
    const result = await pool.query(
      `UPDATE products SET stock = stock + $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [quantity, id]
    );
    return result.rows[0];
  }
}

module.exports = new ProductRepository();
