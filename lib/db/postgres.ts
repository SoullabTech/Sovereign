/**
 * POSTGRES DATABASE CLIENT
 *
 * Simple, reliable Postgres client for local development
 * Uses DATABASE_URL from environment
 *
 * NOTE: Conditionally imports pg only on server-side to avoid bundling for browser
 */

import { createHash } from 'crypto';

import type { Pool, QueryResult, QueryResultRow } from 'pg';

// Only create pool on server-side (Node.js environment)
const isServer = typeof window === 'undefined';
let pool: Pool | null = null;

if (isServer) {
  const { Pool: PgPool } = require('pg');
  const newPool = new PgPool({
    connectionString: process.env.DATABASE_URL || 'postgresql://soullab@localhost:5432/maia_consciousness',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Handle pool errors
  newPool.on('error', (err: Error) => {
    console.error('❌ [POSTGRES] Unexpected pool error:', err);
  });

  pool = newPool;
}

/**
 * SOURCE-CUSTODY-PII-01 · R1.6 — query parameters are DESCRIBED, never printed.
 *
 * Both error paths in this file used to log `params` directly, so any query
 * failure emitted whatever the caller passed. `resolveAdmission` passes a
 * submitted passkey; member lookups pass emails and ids. A database fault was
 * therefore a credential- and PII-disclosure path into logs — which are
 * shipped, aggregated and retained on different terms from the database whose
 * contents they were describing.
 *
 * ⛔ NOT AN ENV FLAG AND NOT A CALL-SITE OPT-IN. A flag defaults wrong on some
 * host eventually; an opt-in leaves every existing call site unsafe until
 * somebody remembers it. Redaction is unconditional, so neither configuration
 * nor forgetfulness can turn it off. This is the same discipline the missing
 * table ruling below applies to its own question.
 *
 * ⭐ DEBUGGABILITY SURVIVES WITHOUT THE VALUES. Type, length and a short digest
 * distinguish "param 1 was an empty string" from "param 1 was 43 characters",
 * and let the same value be correlated across two log lines — which is what
 * operators actually use params for. It is not enough to reconstruct a value.
 */
export function describeParams(params: readonly unknown[]): string {
  if (!params || params.length === 0) return '(none)';
  return `[${params.map(describeParam).join(', ')}]`;
}

function describeParam(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'boolean') return `boolean(${value})`;
  if (typeof value === 'number') return 'number';
  if (value instanceof Date) return 'date';
  if (Array.isArray(value)) return `array(${value.length})`;
  if (typeof value === 'string') return `string(${value.length})#${shortDigest(value)}`;
  if (typeof value === 'object') return 'object';
  return typeof value;
}

/** Correlation only. Truncated deliberately: enough to match, not to attack. */
function shortDigest(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 8);
}

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
  if (!pool) {
    throw new Error('[POSTGRES] Database queries can only be executed server-side');
  }

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
    /* A missing table is infrastructure failure, not an empty result, and it
       propagates like every other error. This function used to translate
       Postgres 42P01 (undefined_table) into a successful `{rows: []}`, which
       collapsed two independent states — "the query ran and found nothing" and
       "the query could not run" — for all ~750 callers at once. A member could
       then be told "you have no works" when the platform was in fact unable to
       read them (observed on the #867 walk). Callers that genuinely want to
       continue past a read failure already say so in their own catch blocks,
       which is where that product decision belongs.

       If a table is ever genuinely optional — schema legitimately staged ahead
       of its callers — the ruling permits an explicit opt-in at the call site
       that names the exact table, signals the degradation, and returns a state
       visibly distinguishable from an empty read. Build it against that real
       caller when one appears; do not reintroduce a blanket allowlist or an
       environment flag here, both of which put this layer back in the business
       of deciding product semantics for callers that never asked.
       Ruling + caller inventory: docs/ops/DB_MISSING_TABLE_DEGRADATION_AUDIT_2026-08-01.md */
    console.error('❌ [POSTGRES] Query error:', error);
    console.error('   SQL:', sql);
    console.error('   Params:', describeParams(params));
    throw error;
  }
}

/**
 * A GOVERNED REFUSAL IS NOT AN UNEXPECTED ERROR.
 *
 * Some statements are designed to be refused by the database — a trigger whose
 * RAISE *is* the authority, not a malfunction. Routed through `query()` those
 * refusals print at error level WITH THE SQL AND THE PARAMS, which does two
 * wrong things: it trains operators to ignore errors, and it emits the very
 * identities the refusal declined to act on. ⭐ *A refusal is not an occasion to
 * disclose.*
 *
 * ⛔ THIS IS NOT A `quiet` OR `suppressErrors` FLAG, and must never become one.
 * A blanket switch spreads; this makes the exceptional semantics visible at the
 * call site and silent nowhere else. It follows the discipline the missing-table
 * ruling already set for this file: an explicit opt-in that NAMES the exact
 * condition, rather than a policy decided down here for callers who never asked.
 *
 * The discriminator is SEMANTIC — a fragment of the refusal's own message —
 * never a line number and never a bare SQLSTATE, because `P0001` is every
 * `RAISE EXCEPTION` in the database and would silence refusals this caller has
 * never heard of.
 *
 *   expected refusal   → `{ refused: true }`. ⛔ Nothing is logged.
 *   ordinary success   → `{ refused: false, result }`.
 *   anything else      → logged exactly as `query()` logs it, and rethrown.
 *                        ⭐ An unexpected failure on this path stays LOUD.
 *
 * ⛔ It cannot delegate to `query()` — that function has already logged by the
 * time it rethrows, which is the whole defect this exists to avoid.
 */
export type ExpectedRefusalOutcome<T extends QueryResultRow> =
  | { readonly refused: false; readonly result: QueryResult<T> }
  | { readonly refused: true };

export async function queryWithExpectedRefusal<T extends QueryResultRow = any>(
  sql: string,
  params: any[],
  expectedRefusal: { readonly fragment: string; readonly why: string },
): Promise<ExpectedRefusalOutcome<T>> {
  if (!pool) {
    throw new Error('[POSTGRES] Database queries can only be executed server-side');
  }
  if (!expectedRefusal.fragment) {
    throw new Error('[POSTGRES] an expected refusal must name the message it expects');
  }

  try {
    return { refused: false, result: await pool.query<T>(sql, params) };
  } catch (error: any) {
    const message = typeof error?.message === 'string' ? error.message : '';
    if (message.includes(expectedRefusal.fragment)) {
      // The refusal the caller declared. ⛔ No SQL, no params, no identities.
      return { refused: true };
    }
    console.error('❌ [POSTGRES] Query error:', error);
    console.error('   SQL:', sql);
    console.error('   Params:', describeParams(params));
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
  if (!pool) {
    throw new Error('[POSTGRES] Transactions can only be executed server-side');
  }
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
  if (!pool) {
    return { totalCount: 0, idleCount: 0, waitingCount: 0 };
  }
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
  if (!pool) {
    return;
  }
  try {
    await pool.end();
    console.log('✅ [POSTGRES] Pool closed gracefully');
  } catch (error) {
    console.error('❌ [POSTGRES] Error closing pool:', error);
  }
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

/**
 * Helper: Execute query and return first row only
 * Like query() but returns T | null instead of QueryResult
 */
export async function queryOne<T extends QueryResultRow = any>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const result = await query<T>(sql, params);
  return result.rows[0] || null;
}

// Export pool for advanced usage
export { pool };

// Aliases for backward compatibility
// getOne/getMany expect (sql, params) unlike findOne/findMany which expect (table, column, value)
export const getOne = queryOne;
export async function getMany<T extends QueryResultRow = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const result = await query<T>(sql, params);
  return result.rows;
}

// Default export
export default {
  query,
  queryOne,
  transaction,
  testConnection,
  getPoolStats,
  closePool,
  insertOne,
  updateOne,
  softDelete,
  findOne,
  findMany,
  getOne,
  getMany,
  pool,
};
