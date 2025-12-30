// backend: lib/db.ts
// Compatibility shim: keep old imports working, but route everything to canonical postgres client.
export { pool, query } from './db/postgres';
export type { QueryResult, QueryResultRow } from 'pg';
