// lib/db.ts - PostgreSQL connection pool for MAIA consciousness computing

import { Pool, PoolConfig } from 'pg';

// PostgreSQL connection configuration
const poolConfig: PoolConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'maia_consciousness',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
  maxUses: 7500, // Close connections after 7500 uses
};

// Create the connection pool
export const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  pool.end(() => {
    console.log('PostgreSQL pool has ended');
  });
});

export default pool;