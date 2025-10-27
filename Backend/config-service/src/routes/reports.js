import express from 'express';
import { getDatabase } from '../config/database.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// GET /api/reports - Получить отчеты о продажах
router.get('/', async (req, res) => {
  try {
    const pool = getDatabase();
    const { 
      tenant_id, 
      period = 'month', // day, week, month, year
      start_date,
      end_date,
      category,
      limit = 100,
      offset = 0 
    } = req.query;

    if (!tenant_id) {
      return res.status(400).json({
        success: false,
        error: 'tenant_id is required'
      });
    }

    let dateFilter = '';
    const queryParams = [tenant_id];
    let paramIndex = 2;

    // Фильтр по периоду
    if (start_date && end_date) {
      dateFilter = `AND sale_date BETWEEN $${paramIndex}::timestamp AND $${paramIndex + 1}::timestamp`;
      queryParams.push(start_date, end_date);
      paramIndex += 2;
    } else {
      // Стандартные периоды
      switch (period) {
        case 'day':
          dateFilter = `AND sale_date >= NOW() - INTERVAL '1 day'`;
          break;
        case 'week':
          dateFilter = `AND sale_date >= NOW() - INTERVAL '7 days'`;
          break;
        case 'month':
          dateFilter = `AND sale_date >= NOW() - INTERVAL '30 days'`;
          break;
        case 'year':
          dateFilter = `AND sale_date >= NOW() - INTERVAL '1 year'`;
          break;
        default:
          dateFilter = `AND sale_date >= NOW() - INTERVAL '30 days'`;
      }
    }

    // Фильтр по категории
    let categoryFilter = '';
    if (category) {
      categoryFilter = `AND category = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }

    const query = `
      SELECT 
        id,
        tenant_id,
        order_id,
        product_id,
        product_name,
        quantity,
        unit_price,
        total_price,
        sale_date,
        category,
        customer_id,
        created_at,
        updated_at
      FROM sales_reports
      WHERE tenant_id = $1
        ${dateFilter}
        ${categoryFilter}
      ORDER BY sale_date DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: result.rows.length
      }
    });

  } catch (error) {
    logger.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports',
      message: error.message
    });
  }
});

// GET /api/reports/stats - Получить статистику продаж
router.get('/stats', async (req, res) => {
  try {
    const pool = getDatabase();
    const { tenant_id, period = 'month' } = req.query;

    if (!tenant_id) {
      return res.status(400).json({
        success: false,
        error: 'tenant_id is required'
      });
    }

    let dateFilter = '';
    switch (period) {
      case 'day':
        dateFilter = `AND sale_date >= NOW() - INTERVAL '1 day'`;
        break;
      case 'week':
        dateFilter = `AND sale_date >= NOW() - INTERVAL '7 days'`;
        break;
      case 'month':
        dateFilter = `AND sale_date >= NOW() - INTERVAL '30 days'`;
        break;
      case 'year':
        dateFilter = `AND sale_date >= NOW() - INTERVAL '1 year'`;
        break;
      default:
        dateFilter = `AND sale_date >= NOW() - INTERVAL '30 days'`;
    }

    // Общая статистика
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT order_id) as total_orders,
        COUNT(*) as total_sales,
        SUM(quantity) as total_items_sold,
        SUM(total_price) as total_revenue,
        AVG(total_price) as avg_order_value,
        COUNT(DISTINCT category) as total_categories
      FROM sales_reports
      WHERE tenant_id = $1
        ${dateFilter}
    `;

    const statsResult = await pool.query(statsQuery, [tenant_id]);
    const stats = statsResult.rows[0];

    // Топ товары
    const topProductsQuery = `
      SELECT 
        product_name,
        SUM(quantity) as total_quantity,
        SUM(total_price) as total_revenue,
        COUNT(*) as sales_count
      FROM sales_reports
      WHERE tenant_id = $1
        ${dateFilter}
      GROUP BY product_name
      ORDER BY total_revenue DESC
      LIMIT 10
    `;

    const topProductsResult = await pool.query(topProductsQuery, [tenant_id]);

    // Статистика по категориям
    const categoriesQuery = `
      SELECT 
        category,
        COUNT(*) as sales_count,
        SUM(quantity) as total_quantity,
        SUM(total_price) as total_revenue
      FROM sales_reports
      WHERE tenant_id = $1
        ${dateFilter}
      GROUP BY category
      ORDER BY total_revenue DESC
    `;

    const categoriesResult = await pool.query(categoriesQuery, [tenant_id]);

    // Динамика продаж по дням (последние 30 дней)
    const salesTrendQuery = `
      SELECT 
        DATE(sale_date) as date,
        COUNT(*) as sales_count,
        SUM(quantity) as items_sold,
        SUM(total_price) as revenue
      FROM sales_reports
      WHERE tenant_id = $1
        AND sale_date >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(sale_date)
      ORDER BY date ASC
    `;

    const salesTrendResult = await pool.query(salesTrendQuery, [tenant_id]);

    res.json({
      success: true,
      data: {
        overview: {
          totalOrders: parseInt(stats.total_orders) || 0,
          totalSales: parseInt(stats.total_sales) || 0,
          totalItemsSold: parseInt(stats.total_items_sold) || 0,
          totalRevenue: parseFloat(stats.total_revenue) || 0,
          avgOrderValue: parseFloat(stats.avg_order_value) || 0,
          totalCategories: parseInt(stats.total_categories) || 0
        },
        topProducts: topProductsResult.rows.map(row => ({
          productName: row.product_name,
          totalQuantity: parseInt(row.total_quantity),
          totalRevenue: parseFloat(row.total_revenue),
          salesCount: parseInt(row.sales_count)
        })),
        categories: categoriesResult.rows.map(row => ({
          category: row.category,
          salesCount: parseInt(row.sales_count),
          totalQuantity: parseInt(row.total_quantity),
          totalRevenue: parseFloat(row.total_revenue)
        })),
        salesTrend: salesTrendResult.rows.map(row => ({
          date: row.date,
          salesCount: parseInt(row.sales_count),
          itemsSold: parseInt(row.items_sold),
          revenue: parseFloat(row.revenue)
        }))
      }
    });

  } catch (error) {
    logger.error('Error fetching report stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report statistics',
      message: error.message
    });
  }
});

// GET /api/reports/revenue - Получить данные о выручке по периодам
router.get('/revenue', async (req, res) => {
  try {
    const pool = getDatabase();
    const { tenant_id, group_by = 'day' } = req.query; // day, week, month

    if (!tenant_id) {
      return res.status(400).json({
        success: false,
        error: 'tenant_id is required'
      });
    }

    let groupByFormat = '';
    let intervalValue = '30 days';

    switch (group_by) {
      case 'day':
        groupByFormat = `DATE(sale_date)`;
        intervalValue = '30 days';
        break;
      case 'week':
        groupByFormat = `DATE_TRUNC('week', sale_date)`;
        intervalValue = '12 weeks';
        break;
      case 'month':
        groupByFormat = `DATE_TRUNC('month', sale_date)`;
        intervalValue = '12 months';
        break;
      default:
        groupByFormat = `DATE(sale_date)`;
        intervalValue = '30 days';
    }

    const query = `
      SELECT 
        ${groupByFormat} as period,
        COUNT(*) as sales_count,
        SUM(quantity) as items_sold,
        SUM(total_price) as revenue
      FROM sales_reports
      WHERE tenant_id = $1
        AND sale_date >= NOW() - INTERVAL '${intervalValue}'
      GROUP BY period
      ORDER BY period ASC
    `;

    const result = await pool.query(query, [tenant_id]);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        period: row.period,
        salesCount: parseInt(row.sales_count),
        itemsSold: parseInt(row.items_sold),
        revenue: parseFloat(row.revenue)
      }))
    });

  } catch (error) {
    logger.error('Error fetching revenue data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch revenue data',
      message: error.message
    });
  }
});

export default router;
