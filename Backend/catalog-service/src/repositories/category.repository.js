const { getPool } = require('../config/database');

class CategoryRepository {
  async findAll({ tenantId, parentId }) {
    const pool = getPool();
    
    let query = `
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      WHERE c.tenant_id = $1
    `;
    
    const params = [tenantId];

    if (parentId) {
      query += ` AND c.parent_id = $2`;
      params.push(parentId);
    } else {
      query += ` AND c.parent_id IS NULL`;
    }

    query += ` GROUP BY c.id ORDER BY c.order_index, c.name`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  async findById(id, tenantId) {
    const pool = getPool();
    const result = await pool.query(
      `SELECT c.*, COUNT(p.id) as product_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id
       WHERE c.id = $1 AND c.tenant_id = $2
       GROUP BY c.id`,
      [id, tenantId]
    );
    return result.rows[0];
  }

  async create(categoryData) {
    const pool = getPool();
    const {
      tenant_id,
      parent_id,
      name,
      description,
      slug,
      icon_url,
      order_index,
    } = categoryData;

    const result = await pool.query(
      `INSERT INTO categories (tenant_id, parent_id, name, description, slug, icon_url, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        tenant_id,
        parent_id || null,
        name,
        description || null,
        slug || name.toLowerCase().replace(/\s+/g, '-'),
        icon_url || null,
        order_index || 0,
      ]
    );

    return result.rows[0];
  }

  async update(id, categoryData) {
    const pool = getPool();
    const updates = [];
    const params = [];
    let paramIndex = 1;

    const allowedFields = ['parent_id', 'name', 'description', 'slug', 'icon_url', 'order_index', 'is_active'];

    for (const field of allowedFields) {
      if (categoryData[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        params.push(categoryData[field]);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const result = await pool.query(
      `UPDATE categories SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    return result.rows[0];
  }

  async delete(id) {
    const pool = getPool();
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
  }
}

module.exports = new CategoryRepository();
