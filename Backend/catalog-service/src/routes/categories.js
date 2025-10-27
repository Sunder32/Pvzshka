import express from 'express'
import { getPool } from '../config/database.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

// GET /api/v1/categories
router.get('/', async (req, res) => {
  try {
    const pool = getPool()
    const { tenant_id, parent_id } = req.query
    
    if (!tenant_id) {
      return res.status(400).json({ error: 'tenant_id is required' })
    }

    let query = `
      SELECT 
        id,
        tenant_id,
        parent_id,
        name,
        slug,
        description,
        image_url,
        sort_order,
        metadata,
        is_active,
        created_at
      FROM categories
      WHERE tenant_id = $1 AND is_active = true
    `
    const queryParams = [tenant_id]

    if (parent_id) {
      query += ` AND parent_id = $2`
      queryParams.push(parent_id)
    } else {
      query += ` AND parent_id IS NULL`
    }

    query += ` ORDER BY sort_order ASC, name ASC`

    const result = await pool.query(query, queryParams)
    
    res.json({
      success: true,
      categories: result.rows
    })
  } catch (error) {
    logger.error('Error fetching categories:', error)
    res.status(500).json({ error: 'Internal server error', message: error.message })
  }
})

// GET /api/v1/categories/:id
router.get('/:id', async (req, res) => {
  try {
    const pool = getPool()
    const { id } = req.params
    const { tenant_id } = req.query

    if (!tenant_id) {
      return res.status(400).json({ error: 'tenant_id is required' })
    }

    const query = `
      SELECT * FROM categories
      WHERE id = $1 AND tenant_id = $2 AND is_active = true
    `

    const result = await pool.query(query, [id, tenant_id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' })
    }

    res.json({
      success: true,
      category: result.rows[0]
    })
  } catch (error) {
    logger.error('Error fetching category:', error)
    res.status(500).json({ error: 'Internal server error', message: error.message })
  }
})

export default router
