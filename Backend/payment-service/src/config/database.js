import pkg from 'pg';
const { Pool } = pkg;

let pool;

export const initDatabase = () => {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://admin:password@localhost:5432/marketplace',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
  });

  console.log('✅ Database pool initialized');
  return pool;
};

export const getPool = () => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDatabase() first.');
  }
  return pool;
};

export const query = (text, params) => {
  return pool.query(text, params);
};

export default { initDatabase, getPool, query };
