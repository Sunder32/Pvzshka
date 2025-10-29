import pg from 'pg';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

let pool = null;

export async function connectDatabase() {
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'marketplace',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on('error', (err, client) => {
    logger.error('Unexpected error on idle client', err);
    process.exit(-1);
  });

  // Проверяем подключение
  try {
    await pool.query('SELECT NOW()');
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }

  return pool;
}

export function getDatabase() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call connectDatabase() first.');
  }
  return pool;
}

// Backward compatibility
export const getPool = getDatabase;
export const initDatabase = connectDatabase;

// Query helper function
export async function query(text, params) {
  const db = getDatabase();
  return await db.query(text, params);
}

export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('✅ Database connection pool closed');
  }
}
