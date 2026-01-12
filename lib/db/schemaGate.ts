/**
 * SCHEMA GATE
 *
 * In-app schema version check that fails fast if required migrations are missing.
 * This is a belt-and-suspenders complement to the startup script (scripts/ensure-migrations.sh).
 *
 * Usage:
 *   import { ensureSchemaReady } from '@/lib/db/schemaGate';
 *   await ensureSchemaReady(); // throws if schema is behind
 */

import { query } from './postgres';

// Required migrations that the code depends on
// Add new required migrations here as they're created
const REQUIRED_MIGRATIONS = [
  '20260112000010_add_origin_route_and_processing_profile.sql',
  // Add future required migrations here
] as const;

let gatePromise: Promise<void> | null = null;
let gateResult: { checked: boolean; error: Error | null } = { checked: false, error: null };

/**
 * Ensure all required migrations have been applied.
 * Caches the result so repeated calls are cheap.
 *
 * @throws Error if schema_migrations table doesn't exist or required migrations are missing
 */
export function ensureSchemaReady(): Promise<void> {
  // Return cached result if already checked
  if (gateResult.checked) {
    if (gateResult.error) {
      return Promise.reject(gateResult.error);
    }
    return Promise.resolve();
  }

  // Return in-flight check if running
  if (gatePromise) {
    return gatePromise;
  }

  gatePromise = (async () => {
    try {
      // Check if schema_migrations table exists
      const tableCheck = await query(`
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'schema_migrations'
        LIMIT 1
      `);

      if (tableCheck.rows.length === 0) {
        throw new Error(
          'DB schema behind code: schema_migrations table does not exist. Run: ./scripts/apply-migrations.sh'
        );
      }

      // Check for required migrations
      const { rows } = await query(
        `SELECT filename FROM schema_migrations WHERE filename = ANY($1::text[])`,
        [REQUIRED_MIGRATIONS]
      );

      const applied = new Set(rows.map((r: { filename: string }) => r.filename));
      const missing = REQUIRED_MIGRATIONS.filter((m) => !applied.has(m));

      if (missing.length > 0) {
        throw new Error(
          `DB schema behind code. Missing migrations: ${missing.join(', ')}. Run: ./scripts/apply-migrations.sh`
        );
      }

      console.log('✅ [SchemaGate] DB schema is compatible');
      gateResult = { checked: true, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('❌ [SchemaGate]', error.message);
      gateResult = { checked: true, error };
      throw error;
    } finally {
      gatePromise = null;
    }
  })();

  return gatePromise;
}

/**
 * Reset the schema gate cache. Useful for testing or after running migrations.
 */
export function resetSchemaGate(): void {
  gatePromise = null;
  gateResult = { checked: false, error: null };
}

/**
 * Check schema compatibility without throwing.
 * Returns { compatible: true } or { compatible: false, missing: [...] }
 */
export async function checkSchemaCompatibility(): Promise<
  { compatible: true } | { compatible: false; missing: string[]; error?: string }
> {
  try {
    // Check if schema_migrations table exists
    const tableCheck = await query(`
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'schema_migrations'
      LIMIT 1
    `);

    if (tableCheck.rows.length === 0) {
      return {
        compatible: false,
        missing: ['schema_migrations table'],
        error: 'schema_migrations table does not exist',
      };
    }

    // Check for required migrations
    const { rows } = await query(
      `SELECT filename FROM schema_migrations WHERE filename = ANY($1::text[])`,
      [REQUIRED_MIGRATIONS]
    );

    const applied = new Set(rows.map((r: { filename: string }) => r.filename));
    const missing = REQUIRED_MIGRATIONS.filter((m) => !applied.has(m));

    if (missing.length > 0) {
      return { compatible: false, missing };
    }

    return { compatible: true };
  } catch (err) {
    return {
      compatible: false,
      missing: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
