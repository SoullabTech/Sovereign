/**
 * PostgreSQL Database Client
 *
 * Shared database client for the MAIA platform.
 * Used by both the MAIA API service and Next.js server-side code.
 *
 * NOTE: This module can only be used server-side.
 */

import pg from 'pg';
const { Pool } = pg;

// Singleton pool instance
let pool: pg.Pool | null = null;

/**
 * Get or create the database pool
 */
function getPool(): pg.Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://soullab@localhost:5432/maia_consciousness',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('[POSTGRES] Unexpected pool error:', err);
    });

    pool.on('connect', () => {
      console.log('[POSTGRES] New client connected');
    });
  }

  return pool;
}

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number | null;
  command: string;
  oid: number;
  fields: pg.FieldDef[];
}

/**
 * Execute a parameterized query
 */
export async function query<T = any>(
  sql: string,
  params: any[] = []
): Promise<QueryResult<T>> {
  const p = getPool();
  const start = Date.now();

  try {
    const result = await p.query<T>(sql, params);
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
      return { rows: [], rowCount: 0, command: '', oid: 0, fields: [] };
    }

    console.error('[POSTGRES] Query error:', error);
    console.error('   SQL:', sql);
    throw error;
  }
}

/**
 * Execute a single query and return first row
 */
export async function queryOne<T = any>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const result = await query<T>(sql, params);
  return result.rows[0] || null;
}

/**
 * Execute a query and return all rows
 */
export async function queryMany<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const result = await query<T>(sql, params);
  return result.rows;
}

/**
 * Transaction client type
 */
export interface TransactionClient {
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
}

/**
 * Execute queries in a transaction
 */
export async function transaction<T>(
  callback: (client: TransactionClient) => Promise<T>
): Promise<T> {
  const p = getPool();
  const client = await p.connect();

  const txClient: TransactionClient = {
    query: async (sql: string, params: any[] = []) => {
      return client.query(sql, params);
    }
  };

  try {
    await client.query('BEGIN');
    const result = await callback(txClient);
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
  const p = getPool();
  return {
    totalCount: p.totalCount,
    idleCount: p.idleCount,
    waitingCount: p.waitingCount,
  };
}

/**
 * Gracefully close the pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    try {
      await pool.end();
      pool = null;
      console.log('[POSTGRES] Pool closed gracefully');
    } catch (error) {
      console.error('[POSTGRES] Error closing pool:', error);
    }
  }
}

/**
 * Helper: Insert and return the inserted row
 */
export async function insertOne<T = any>(
  table: string,
  data: Record<string, any>
): Promise<T> {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

  const sql = `
    INSERT INTO ${table} (${columns.join(', ')})
    VALUES (${placeholders})
    RETURNING *
  `;

  const result = await query<T>(sql, values);
  return result.rows[0];
}

/**
 * Helper: Update and return the updated row
 */
export async function updateOne<T = any>(
  table: string,
  id: string,
  data: Record<string, any>
): Promise<T | null> {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const setClause = columns.map((col, i) => `${col} = $${i + 2}`).join(', ');

  const sql = `
    UPDATE ${table}
    SET ${setClause}
    WHERE id = $1
    RETURNING *
  `;

  const result = await query<T>(sql, [id, ...values]);
  return result.rows[0] || null;
}

/**
 * Helper: Find one by condition
 */
export async function findOne<T = any>(
  table: string,
  column: string,
  value: any
): Promise<T | null> {
  const sql = `SELECT * FROM ${table} WHERE ${column} = $1 LIMIT 1`;
  const result = await query<T>(sql, [value]);
  return result.rows[0] || null;
}

/**
 * Helper: Find many by condition
 */
export async function findMany<T = any>(
  table: string,
  column: string,
  value: any,
  limit?: number
): Promise<T[]> {
  const sql = limit
    ? `SELECT * FROM ${table} WHERE ${column} = $1 LIMIT ${limit}`
    : `SELECT * FROM ${table} WHERE ${column} = $1`;

  const result = await query<T>(sql, [value]);
  return result.rows;
}

// Aliases for backward compatibility
export const getOne = queryOne;
export const getMany = queryMany;
