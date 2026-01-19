/**
 * PostgreSQL Database Client
 *
 * Connection pool and query utilities for the API service.
 * Mirrors the interface from lib/db/postgres.ts for compatibility.
 */

import pg, { QueryResultRow } from 'pg';
const { Pool } = pg;

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://soullab@localhost:5432/maia_consciousness',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('[POSTGRES] Unexpected pool error:', err);
});

// Log successful connection on first query
let connected = false;
pool.on('connect', () => {
  if (!connected) {
    connected = true;
    console.log('[POSTGRES] Connection pool established');
  }
});

/**
 * Execute a parameterized query
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: any[] = []
): Promise<pg.QueryResult<T>> {
  const start = Date.now();

  try {
    const result = await pool.query<T>(sql, params);
    const duration = Date.now() - start;

    // Log slow queries (>100ms)
    if (duration > 100) {
      console.warn(`[POSTGRES] Slow query (${duration}ms):`, sql.substring(0, 100));
    }

    return result;
  } catch (error: any) {
    // 42P01 = undefined_table - gracefully degrade
    if (error?.code === '42P01') {
      console.warn('[POSTGRES] Missing table (graceful degradation):', error?.message);
      return { rows: [], rowCount: 0, command: '', oid: 0, fields: [] } as pg.QueryResult<T>;
    }

    console.error('[POSTGRES] Query error:', error);
    console.error('   SQL:', sql);
    throw error;
  }
}

/**
 * Execute a single query and return first row
 */
export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const result = await query<T>(sql, params);
  return result.rows[0] || null;
}

/**
 * Execute a query and return all rows
 */
export async function queryMany<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const result = await query<T>(sql, params);
  return result.rows;
}

/**
 * Execute queries in a transaction
 */
export async function transaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as now');
    console.log('[POSTGRES] Connection test successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('[POSTGRES] Connection test failed:', error);
    return false;
  }
}

/**
 * Get pool statistics
 */
export function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

/**
 * Gracefully close the pool
 */
export async function closePool(): Promise<void> {
  try {
    await pool.end();
    console.log('[POSTGRES] Pool closed gracefully');
  } catch (error) {
    console.error('[POSTGRES] Error closing pool:', error);
  }
}

export default pool;
