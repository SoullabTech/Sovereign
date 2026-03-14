/**
 * DB Safety Guard
 *
 * Call this at the start of any script that writes to the database.
 * It verifies we're connected to the right database before doing anything destructive.
 *
 * Why this exists:
 *   Scripts run from the host can accidentally hit a local dev postgres
 *   instead of the Docker production postgres when DATABASE_URL is wrong or absent.
 *   The wrong-DB incident (March 2026): a backfill script stored a garbage summary
 *   because ts-node hit localhost:5432 instead of maia-postgres:5432.
 *
 * Usage:
 *   import { assertCorrectDb } from '../lib/scripts/dbSafetyGuard';
 *   await assertCorrectDb(); // throws + exits if wrong DB
 *
 * Override for local dev:
 *   --allow-localhost flag  (e.g. npx ts-node script.ts --allow-localhost)
 */

// Use relative path — this file runs outside Next.js (scripts context, tsx direct)
import { query } from '../db/postgres';

const EXPECTED_DB = 'maia_consciousness';
const ALLOW_LOCALHOST = process.argv.includes('--allow-localhost');

/**
 * Verify DB connection is to the correct database.
 * Prints connection info at startup regardless.
 * Exits with code 1 if wrong DB (unless --allow-localhost is set).
 */
export async function assertCorrectDb(): Promise<void> {
  try {
    const result = await query<{
      current_db: string;
      server_addr: string | null;
      server_port: number;
    }>(
      `SELECT
        current_database() AS current_db,
        inet_server_addr()::text AS server_addr,
        inet_server_port() AS server_port`,
      []
    );

    const row = result.rows[0];
    if (!row) throw new Error('DB connectivity check returned no rows');

    const { current_db, server_addr, server_port } = row;
    const addr = server_addr ?? 'unix socket';

    console.log(`[DB Guard] Connected: ${current_db} @ ${addr}:${server_port}`);

    // Wrong database name — always fatal
    if (current_db !== EXPECTED_DB) {
      console.error(`[DB Guard] ❌ WRONG DATABASE: expected "${EXPECTED_DB}", got "${current_db}"`);
      console.error(`[DB Guard]    Set DATABASE_URL correctly or use --allow-localhost to override.`);
      process.exit(1);
    }

    // Localhost address — warn or fatal
    const isLocalhost = !server_addr || server_addr === '127.0.0.1' || server_addr === '::1';
    if (isLocalhost) {
      if (ALLOW_LOCALHOST) {
        console.warn(`[DB Guard] ⚠️  Connected to localhost — proceeding with --allow-localhost`);
      } else {
        console.error(`[DB Guard] ❌ REFUSING TO RUN: connected to localhost postgres.`);
        console.error(`[DB Guard]    This script should run inside the Docker stack where DATABASE_URL`);
        console.error(`[DB Guard]    points to maia-postgres, not localhost.`);
        console.error(`[DB Guard]    To run from host against dev postgres, pass --allow-localhost.`);
        console.error(`[DB Guard]    To run against production, exec into the container:`);
        console.error(`[DB Guard]      docker exec maia-sovereign node -e "require('./script').main()"`);
        process.exit(1);
      }
    }

    console.log(`[DB Guard] ✅ DB verified: ${current_db} @ ${addr}:${server_port}`);

  } catch (err: any) {
    if (err.code === 'ERR_PROCESS_EXIT') throw err; // re-throw exit signals
    console.error('[DB Guard] ❌ Failed to verify DB connection:', err.message);
    process.exit(1);
  }
}
