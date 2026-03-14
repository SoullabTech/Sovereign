/**
 * Shared Database Pool — thin shim over lib/db/postgres
 *
 * The learning/comparison services (engineComparisonService, etc.) import
 * `pool` from this file. Previously this was a stub that threw on every call,
 * producing noisy "Database connection not implemented" errors in prod logs.
 *
 * Fix: delegate to the real pool in lib/db/postgres so all callers work
 * without any changes to the import sites.
 */
export { pool } from '@/lib/db/postgres';
export default (await import('@/lib/db/postgres')).pool;
