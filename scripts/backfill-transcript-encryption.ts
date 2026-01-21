#!/usr/bin/env npx tsx
/**
 * Transcript PHI Encryption Backfill Script
 *
 * HIPAA Sprint 7 Phase 3A
 *
 * Encrypts existing plaintext transcript segments:
 * - supervision_transcript_segments.text
 * - practice_transcript_segments.text
 *
 * Three-pass workflow:
 * 1. --dry-run     (counts only, no writes)
 * 2. --live        (encrypt and write *_enc)
 * 3. --verify      (compare decrypted matches original)
 *
 * Usage:
 *   npx tsx scripts/backfill-transcript-encryption.ts [options]
 *
 * Options:
 *   --table <name>    Table to process (default: both)
 *   --batch <size>    Batch size (default: 500)
 *   --dry-run         Don't write, just log what would happen
 *   --live            Write encrypted data
 *   --verify          Verify encrypted data decrypts correctly
 *   --resume          Resume from last processed ID
 */

import { query } from '../lib/db/postgres';
import { encryptForDB, decryptFromDB, PHIContext } from '../lib/security/phiEncryption';

// ============================================================================
// CONFIGURATION
// ============================================================================

interface TranscriptTableConfig {
  table: 'supervision_transcript_segments' | 'practice_transcript_segments';
  sessionColumn: string;
  practitionerColumn?: string;
}

const TRANSCRIPT_TABLES: TranscriptTableConfig[] = [
  {
    table: 'supervision_transcript_segments',
    sessionColumn: 'session_id',
    // No direct practitioner column - would need join to supervision_sessions
  },
  {
    table: 'practice_transcript_segments',
    sessionColumn: 'session_id',
    // No direct practitioner column - would need join to practice_sessions
  },
];

// ============================================================================
// HELPERS
// ============================================================================

function parseArgs(): {
  table: string | null;
  batchSize: number;
  dryRun: boolean;
  live: boolean;
  verify: boolean;
  resume: boolean;
} {
  const args = process.argv.slice(2);
  return {
    table: args.includes('--table') ? args[args.indexOf('--table') + 1] : null,
    batchSize: args.includes('--batch') ? parseInt(args[args.indexOf('--batch') + 1]) : 500,
    dryRun: args.includes('--dry-run'),
    live: args.includes('--live'),
    verify: args.includes('--verify'),
    resume: args.includes('--resume'),
  };
}

async function tableExists(tableName: string): Promise<boolean> {
  const result = await query(
    `SELECT 1 FROM information_schema.tables WHERE table_name = $1`,
    [tableName]
  );
  return result.rows.length > 0;
}

async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  const result = await query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_name = $1 AND column_name = $2`,
    [tableName, columnName]
  );
  return result.rows.length > 0;
}

async function getLastProcessedId(table: string): Promise<string | null> {
  const hasTable = await tableExists('phi_encryption_status');
  if (!hasTable) return null;

  const result = await query(
    `SELECT last_processed_id FROM phi_encryption_status
     WHERE table_name = $1 AND column_name = 'text'`,
    [table]
  );
  return result.rows[0]?.last_processed_id || null;
}

async function updateStatus(
  table: string,
  updates: {
    status?: string;
    encrypted_rows?: number;
    last_processed_id?: string;
    started_at?: Date;
    completed_at?: Date;
  }
): Promise<void> {
  const hasTable = await tableExists('phi_encryption_status');
  if (!hasTable) {
    console.log(`[${table}] Status table not found, skipping status update`);
    return;
  }

  const sets: string[] = ['updated_at = NOW()'];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (updates.status !== undefined) {
    sets.push(`status = $${paramIndex++}`);
    values.push(updates.status);
  }
  if (updates.encrypted_rows !== undefined) {
    sets.push(`encrypted_rows = $${paramIndex++}`);
    values.push(updates.encrypted_rows);
  }
  if (updates.last_processed_id !== undefined) {
    sets.push(`last_processed_id = $${paramIndex++}`);
    values.push(updates.last_processed_id);
  }
  if (updates.started_at !== undefined) {
    sets.push(`started_at = $${paramIndex++}`);
    values.push(updates.started_at);
  }
  if (updates.completed_at !== undefined) {
    sets.push(`completed_at = $${paramIndex++}`);
    values.push(updates.completed_at);
  }

  values.push(table);

  await query(
    `UPDATE phi_encryption_status SET ${sets.join(', ')}
     WHERE table_name = $${paramIndex} AND column_name = 'text'`,
    values
  );
}

// ============================================================================
// BACKFILL LOGIC
// ============================================================================

async function backfillTable(
  config: TranscriptTableConfig,
  options: { batchSize: number; dryRun: boolean; live: boolean; verify: boolean; resume: boolean }
): Promise<{ processed: number; encrypted: number; verified: number; errors: number }> {
  const { table, sessionColumn } = config;
  const { batchSize, dryRun, live, verify, resume } = options;

  console.log(`\n[${table}] Starting backfill...`);

  // Check if table exists
  if (!(await tableExists(table))) {
    console.log(`[${table}] Table does not exist, skipping`);
    return { processed: 0, encrypted: 0, verified: 0, errors: 0 };
  }

  // Check if encrypted columns exist
  if (!(await columnExists(table, 'text_enc'))) {
    console.log(`[${table}] text_enc column does not exist - run migration first`);
    return { processed: 0, encrypted: 0, verified: 0, errors: 0 };
  }

  // Get counts for different scenarios
  const totalResult = await query(
    `SELECT COUNT(*) as total FROM ${table} WHERE text IS NOT NULL`
  );
  const total = parseInt(totalResult.rows[0].total);

  const unencryptedResult = await query(
    `SELECT COUNT(*) as count FROM ${table} WHERE text IS NOT NULL AND text_enc IS NULL`
  );
  const unencrypted = parseInt(unencryptedResult.rows[0].count);

  const encryptedResult = await query(
    `SELECT COUNT(*) as count FROM ${table} WHERE text_enc IS NOT NULL`
  );
  const encrypted = parseInt(encryptedResult.rows[0].count);

  console.log(`[${table}] Total segments: ${total}`);
  console.log(`[${table}] Already encrypted: ${encrypted}`);
  console.log(`[${table}] Need encryption: ${unencrypted}`);

  // Dry run - just show counts
  if (dryRun) {
    console.log(`[${table}] DRY RUN - Would encrypt ${unencrypted} rows`);
    return { processed: 0, encrypted: 0, verified: 0, errors: 0 };
  }

  // Verify mode - check existing encrypted data
  if (verify) {
    return await verifyTable(config, options);
  }

  // Live mode - encrypt unencrypted rows
  if (!live) {
    console.log(`[${table}] Neither --live nor --verify specified, skipping`);
    return { processed: 0, encrypted: 0, verified: 0, errors: 0 };
  }

  if (unencrypted === 0) {
    console.log(`[${table}] No rows to encrypt`);
    await updateStatus(table, { status: 'completed', completed_at: new Date() });
    return { processed: 0, encrypted: 0, verified: 0, errors: 0 };
  }

  // Update status
  await updateStatus(table, {
    status: 'in_progress',
    started_at: new Date(),
  });

  // Get starting point
  let lastId = resume ? await getLastProcessedId(table) : null;
  if (lastId) {
    console.log(`[${table}] Resuming from ID: ${lastId}`);
  }

  let processed = 0;
  let encryptedCount = 0;
  let errors = 0;

  while (true) {
    // Fetch batch of unencrypted rows
    const whereClause = lastId
      ? `text IS NOT NULL AND text_enc IS NULL AND id > $1`
      : `text IS NOT NULL AND text_enc IS NULL`;

    const params = lastId ? [lastId] : [];

    const result = await query(
      `SELECT id, ${sessionColumn}, text
       FROM ${table}
       WHERE ${whereClause}
       ORDER BY id
       LIMIT ${batchSize}`,
      params
    );

    if (result.rows.length === 0) {
      break;
    }

    // Process batch
    for (const row of result.rows) {
      const rowId = row.id;
      const sessionId = row[sessionColumn];
      const plaintext = row.text;

      try {
        const context: PHIContext = {
          table,
          column: 'text',
          rowId,
          ownerId: sessionId, // Use sessionId as owner for AAD
        };

        const { ciphertext, meta } = encryptForDB(plaintext, context);

        await query(
          `UPDATE ${table} SET text_enc = $1, text_enc_meta = $2 WHERE id = $3`,
          [ciphertext, JSON.stringify(meta), rowId]
        );

        encryptedCount++;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error(`\n[${table}] Error encrypting row ${rowId}: ${message}`);
        errors++;
      }

      processed++;
      lastId = rowId;
    }

    // Update progress
    await updateStatus(table, {
      encrypted_rows: encryptedCount,
      last_processed_id: lastId,
    });

    const pct = ((processed / unencrypted) * 100).toFixed(1);
    process.stdout.write(`\r[${table}] Progress: ${processed}/${unencrypted} (${pct}%)`);
  }

  console.log(`\n[${table}] Complete: ${encryptedCount} encrypted, ${errors} errors`);

  if (errors === 0) {
    await updateStatus(table, {
      status: 'completed',
      completed_at: new Date(),
    });
  }

  return { processed, encrypted: encryptedCount, verified: 0, errors };
}

async function verifyTable(
  config: TranscriptTableConfig,
  options: { batchSize: number }
): Promise<{ processed: number; encrypted: number; verified: number; errors: number }> {
  const { table, sessionColumn } = config;
  const { batchSize } = options;

  console.log(`[${table}] VERIFY MODE - Checking encrypted data...`);

  // Get count of encrypted rows
  const countResult = await query(
    `SELECT COUNT(*) as count FROM ${table} WHERE text_enc IS NOT NULL`
  );
  const total = parseInt(countResult.rows[0].count);

  if (total === 0) {
    console.log(`[${table}] No encrypted rows to verify`);
    return { processed: 0, encrypted: 0, verified: 0, errors: 0 };
  }

  console.log(`[${table}] ${total} rows to verify`);

  let processed = 0;
  let verified = 0;
  let errors = 0;
  let lastId: string | null = null;

  while (true) {
    const whereClause = lastId
      ? `text_enc IS NOT NULL AND id > $1`
      : `text_enc IS NOT NULL`;

    const params = lastId ? [lastId] : [];

    const result = await query(
      `SELECT id, ${sessionColumn}, text, text_enc, text_enc_meta
       FROM ${table}
       WHERE ${whereClause}
       ORDER BY id
       LIMIT ${batchSize}`,
      params
    );

    if (result.rows.length === 0) {
      break;
    }

    for (const row of result.rows) {
      const rowId = row.id;
      const sessionId = row[sessionColumn];
      const originalText = row.text;
      const ciphertext = row.text_enc;
      const meta = row.text_enc_meta;

      try {
        const context: PHIContext = {
          table,
          column: 'text',
          rowId,
          ownerId: sessionId,
        };

        const decrypted = decryptFromDB(ciphertext, meta, context);

        // Compare decrypted to original
        if (decrypted === originalText) {
          verified++;
        } else {
          console.error(`\n[${table}] Verification MISMATCH for row ${rowId}`);
          console.error(`  Original length: ${originalText?.length}, Decrypted length: ${decrypted.length}`);
          errors++;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error(`\n[${table}] Decrypt failed for row ${rowId}: ${message}`);
        errors++;
      }

      processed++;
      lastId = rowId;
    }

    const pct = ((processed / total) * 100).toFixed(1);
    process.stdout.write(`\r[${table}] Verified: ${processed}/${total} (${pct}%)`);
  }

  console.log(`\n[${table}] Verification complete: ${verified} verified, ${errors} errors`);

  return { processed, encrypted: 0, verified, errors };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const options = parseArgs();

  console.log('Transcript PHI Encryption Backfill');
  console.log('===================================');
  console.log(`Batch size: ${options.batchSize}`);
  console.log(`Mode: ${options.dryRun ? 'DRY RUN' : options.verify ? 'VERIFY' : options.live ? 'LIVE' : 'NONE'}`);
  console.log(`Resume: ${options.resume}`);

  if (options.dryRun) {
    console.log('\n⚠️  DRY RUN MODE - Showing counts only\n');
  }

  // Check for encryption key
  if (!process.env.PHI_ENCRYPTION_KEY && !options.dryRun) {
    console.error('ERROR: PHI_ENCRYPTION_KEY environment variable not set');
    process.exit(1);
  }

  // Filter tables if specified
  const tables = options.table
    ? TRANSCRIPT_TABLES.filter(t => t.table === options.table)
    : TRANSCRIPT_TABLES;

  if (tables.length === 0) {
    console.error(`No tables found matching: ${options.table}`);
    console.error('Valid tables: supervision_transcript_segments, practice_transcript_segments');
    process.exit(1);
  }

  let totalProcessed = 0;
  let totalEncrypted = 0;
  let totalVerified = 0;
  let totalErrors = 0;

  for (const config of tables) {
    const { processed, encrypted, verified, errors } = await backfillTable(config, options);
    totalProcessed += processed;
    totalEncrypted += encrypted;
    totalVerified += verified;
    totalErrors += errors;
  }

  console.log('\n========== SUMMARY ==========');
  console.log(`Total processed: ${totalProcessed}`);
  if (options.live) {
    console.log(`Total encrypted: ${totalEncrypted}`);
  }
  if (options.verify) {
    console.log(`Total verified: ${totalVerified}`);
  }
  console.log(`Total errors: ${totalErrors}`);

  if (totalErrors > 0) {
    console.log('\n⚠️  Some rows had errors. Review output above.');
    process.exit(1);
  }

  console.log('\n✅ Backfill complete');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
