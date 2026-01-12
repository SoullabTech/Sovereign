/**
 * SCHEMA GATE
 *
 * In-app schema version check that fails fast if required migrations are missing.
 * This is a belt-and-suspenders complement to the startup script (scripts/ensure-migrations.sh).
 *
 * Required migrations are defined in: database/required_migrations.txt
 * (single source of truth shared with ensure-migrations.sh)
 *
 * Usage:
 *   import { ensureSchemaReady } from '@/lib/db/schemaGate';
 *   await ensureSchemaReady(); // throws if schema is behind
 */

import { query } from './postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load required migrations from single source of truth file
function loadRequiredMigrations(): string[] {
  try {
    // Try multiple paths (works in both dev and production standalone)
    const possiblePaths = [
      join(process.cwd(), 'database', 'required_migrations.txt'),
      join(__dirname, '..', '..', 'database', 'required_migrations.txt'),
    ];

    for (const filePath of possiblePaths) {
      try {
        const content = readFileSync(filePath, 'utf-8');
        const migrations = content
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith('#'));

        if (migrations.length > 0) {
          return migrations;
        }
      } catch {
        // Try next path
      }
    }

    console.warn('⚠️ [SchemaGate] Could not load required_migrations.txt, using empty list');
    return [];
  } catch (err) {
    console.warn('⚠️ [SchemaGate] Error loading required migrations:', err);
    return [];
  }
}

// Cache the loaded migrations
let _requiredMigrations: string[] | null = null;
function getRequiredMigrations(): string[] {
  if (_requiredMigrations === null) {
    _requiredMigrations = loadRequiredMigrations();
  }
  return _requiredMigrations;
}

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
    const requiredMigrations = getRequiredMigrations();

    // If no required migrations, skip check
    if (requiredMigrations.length === 0) {
      console.log('✅ [SchemaGate] No required migrations defined, skipping check');
      gateResult = { checked: true, error: null };
      return;
    }

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
        [requiredMigrations]
      );

      const applied = new Set(rows.map((r: { filename: string }) => r.filename));
      const missing = requiredMigrations.filter((m) => !applied.has(m));

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
  _requiredMigrations = null; // Also reload migrations file
}

/**
 * Check schema compatibility without throwing.
 * Returns { compatible: true } or { compatible: false, missing: [...] }
 */
export async function checkSchemaCompatibility(): Promise<
  { compatible: true } | { compatible: false; missing: string[]; error?: string }
> {
  const requiredMigrations = getRequiredMigrations();

  if (requiredMigrations.length === 0) {
    return { compatible: true };
  }

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
      [requiredMigrations]
    );

    const applied = new Set(rows.map((r: { filename: string }) => r.filename));
    const missing = requiredMigrations.filter((m) => !applied.has(m));

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
