/**
 * Shared Database Pool
 *
 * Re-exports the main PostgreSQL connection from lib/db/postgres.ts
 * This provides backward compatibility for files importing from lib/database/pool
 */

import { query } from '../db/postgres';
import type { QueryResult, QueryResultRow } from 'pg';

/**
 * Database pool interface for PostgreSQL-style queries
 * Wraps the main postgres query function
 */
export const pool = {
  async query<T extends QueryResultRow = any>(
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>> {
    return query<T>(text, params);
  }
};

export default pool;
