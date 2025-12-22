/**
 * POSTGRES DATABASE CLIENT
 *
 * Simple, reliable Postgres client for local development
 * Uses DATABASE_URL from environment
 */

import 'server-only';
import { Pool, QueryResult, QueryResultRow } from 'pg';

// Create connection pool
const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://localhost:5432/maia_consciousness'; // safe fallback (no credentials)

const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ [POSTGRES] Unexpected pool error:', err);
});

/**
 * Execute a parameterized query
 *
 * @param sql - SQL query string with $1, $2, etc. placeholders
 * @param params - Array of parameter values
 * @returns Query result
 *
 * @example
 * const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
 * const users = result.rows;
 */
export async function query<T extends QueryResultRow = any>(
  sql: string,
  params: any[] = []
): Promise<QueryResult<T>> {
  const start = Date.now();

  try {
    const result = await pool.query<T>(sql, params);
    const duration = Date.now() - start;

    // Log slow queries (>100ms)
    if (duration > 100) {
      console.warn(`⚠️  [POSTGRES] Slow query (${duration}ms):`, sql.substring(0, 100));
    }

    return result;
  } catch (error: any) {
    // 42P01 = undefined_table - gracefully degrade instead of crashing
    if (error?.code === '42P01') {
      console.warn('⚠️  [POSTGRES] Missing table (graceful degradation):', error?.message);
      return { rows: [], rowCount: 0, command: '', oid: 0, fields: [] } as QueryResult<T>;
    }

    console.error('❌ [POSTGRES] Query error:', error);
    console.error('   SQL:', sql);
    console.error('   Params:', params);
    throw error;
  }
}

/**
 * Execute multiple queries in a transaction
 *
 * @param callback - Function that receives a transaction client
 * @returns Result from callback
 *
 * @example
 * const result = await transaction(async (client) => {
 *   await client.query('INSERT INTO users ...');
 *   await client.query('INSERT INTO profiles ...');
 *   return { success: true };
 * });
 */
export async function transaction<T>(
  callback: (client: TransactionClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const txClient: TransactionClient = {
      query: async (sql: string, params: any[] = []) => {
        return client.query(sql, params);
      }
    };

    const result = await callback(txClient);

    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ [POSTGRES] Transaction rolled back:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Transaction client type
 */
export interface TransactionClient {
  query<T extends QueryResultRow = any>(
    sql: string,
    params?: any[]
  ): Promise<QueryResult<T>>;
}

/**
 * Test database connection
 *
 * @returns true if connection successful, false otherwise
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as now');
    console.log('✅ [POSTGRES] Connection successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ [POSTGRES] Connection failed:', error);
    return false;
  }
}

/**
 * Get pool stats for monitoring
 */
export function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

/**
 * Gracefully close all connections
 */
export async function closePool(): Promise<void> {
  try {
    await pool.end();
    console.log('✅ [POSTGRES] Pool closed gracefully');
  } catch (error) {
    console.error('❌ [POSTGRES] Error closing pool:', error);
  }
}

/**
 * Get a pooled client for transactions or multi-query operations
 * IMPORTANT: Caller MUST call client.release() when done
 */
export async function getClient() {
  return pool.connect();
}

/**
 * Helper: Insert and return the inserted row
 */
export async function insertOne<T extends QueryResultRow = any>(
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
export async function updateOne<T extends QueryResultRow = any>(
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
 * Helper: Soft delete (if table has deleted_at column)
 */
export async function softDelete<T extends QueryResultRow = any>(
  table: string,
  id: string
): Promise<T | null> {
  const sql = `
    UPDATE ${table}
    SET deleted_at = NOW()
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING *
  `;

  const result = await query<T>(sql, [id]);
  return result.rows[0] || null;
}

/**
 * Helper: Find one by condition
 */
export async function findOne<T extends QueryResultRow = any>(
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
export async function findMany<T extends QueryResultRow = any>(
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

// Export pool for advanced usage
export { pool };

// Default export
export default {
  query,
  transaction,
  testConnection,
  getPoolStats,
  closePool,
  getClient,
  insertOne,
  updateOne,
  softDelete,
  findOne,
  findMany,
  pool,
};
