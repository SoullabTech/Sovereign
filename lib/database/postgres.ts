// lib/database/postgres.ts
// PostgreSQL connection pool for MAIA learning system

import { Pool } from 'pg';

// Singleton connection pool
let pool: Pool | null = null;

function createPool(): Pool {
  // Use DATABASE_URL if available, otherwise individual connection parameters
  if (process.env.DATABASE_URL) {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      // Connection pool settings
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  return new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DATABASE || 'maia_sovereign',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD,

    // Connection pool settings
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

export function getPool(): Pool {
  if (!pool) {
    pool = createPool();
  }
  return pool;
}

// Helper for single queries
export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result.rows;
}

// Helper for single row queries
export async function queryOne<T = any>(text: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length > 0 ? rows[0] : null;
}

// Type for query function signature
export type QueryFn = <T = unknown>(text: string, params?: unknown[]) => Promise<T[]>;

// Transaction helper
export async function transaction<T>(callback: (queryFn: QueryFn) => Promise<T>): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create a query function bound to this client
    const clientQuery = async <U = any>(text: string, params: any[] = []): Promise<U[]> => {
      const result = await client.query(text, params);
      return result.rows;
    };

    const result = await callback(clientQuery);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Close pool (for cleanup)
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}