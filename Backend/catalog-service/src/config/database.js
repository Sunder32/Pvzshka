import pg from 'pg';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

let pool;

export async function connectDatabase() {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    await pool.query('SELECT NOW()');
    logger.info('✅ Connected to PostgreSQL database');

    return pool;
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
}

export function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  return pool;
}

// Helper function to execute queries with tenant context
export async function queryWithTenant(sql, params, tenantId) {
  const client = await pool.connect();
  try {
    // Set tenant context for RLS
    await client.query(`SET app.current_tenant = '${tenantId}'`);
    const result = await client.query(sql, params);
    return result;
  } finally {
    client.release();
  }
}

export default { connectDatabase, getPool, queryWithTenant };
