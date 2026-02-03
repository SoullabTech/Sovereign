#!/usr/bin/env npx tsx
/**
 * PHI Encryption Backfill Script
 *
 * HIPAA Sprint 7 Phase 2A
 *
 * Encrypts existing plaintext PHI in database:
 * - Processes in batches (configurable)
 * - Resumable (tracks last processed ID)
 * - Updates encryption status table
 * - Supports dry-run mode
 *
 * Usage:
 *   npx tsx scripts/backfill-phi-encryption.ts [options]
 *
 * Options:
 *   --table <name>    Table to process (default: all Wave 1)
 *   --batch <size>    Batch size (default: 500)
 *   --dry-run         Don't write, just log what would happen
 *   --resume          Resume from last processed ID
 *   --verify          Verify encrypted data decrypts correctly
 */

import { query } from '../lib/db/postgres';
import { encryptForDB, decryptFromDB, PHIContext } from '../lib/security/phiEncryption';

// ============================================================================
// CONFIGURATION
// ============================================================================

interface ColumnConfig {
  table: string;
  column: string;
  idColumn: string;
  ownerColumn?: string; // practitioner_id, member_id, etc.
}

// Wave 1 columns to encrypt
const WAVE1_COLUMNS: ColumnConfig[] = [
  {
    table: 'client_messages',
    column: 'body',
    idColumn: 'id',
    ownerColumn: 'practitioner_id',
  },
  {
    table: 'practitioner_messages',
    column: 'subject',
    idColumn: 'id',
    ownerColumn: 'practitioner_id',
  },
  {
    table: 'practitioner_messages',
    column: 'body',
    idColumn: 'id',
    ownerColumn: 'practitioner_id',
  },
];

// ============================================================================
// HELPERS
// ============================================================================

function parseArgs(): {
  table: string | null;
  batchSize: number;
  dryRun: boolean;
  resume: boolean;
  verify: boolean;
} {
  const args = process.argv.slice(2);
  return {
    table: args.includes('--table') ? args[args.indexOf('--table') + 1] : null,
    batchSize: args.includes('--batch') ? parseInt(args[args.indexOf('--batch') + 1]) : 500,
    dryRun: args.includes('--dry-run'),
    resume: args.includes('--resume'),
    verify: args.includes('--verify'),
  };
}

async function tableExists(tableName: string): Promise<boolean> {
  const result = await query(
    `SELECT 1 FROM information_schema.tables WHERE table_name = $1`,
    [tableName]
  );
  return result.rows.length > 0;
}

async function getLastProcessedId(table: string, column: string): Promise<string | null> {
  const result = await query(
    `SELECT last_processed_id FROM phi_encryption_status
     WHERE table_name = $1 AND column_name = $2`,
    [table, column]
  );
  return result.rows[0]?.last_processed_id || null;
}

async function updateStatus(
  table: string,
  column: string,
  updates: {
    status?: string;
    encrypted_rows?: number;
    last_processed_id?: string;
    started_at?: Date;
    completed_at?: Date;
  }
): Promise<void> {
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

  values.push(table, column);

  await query(
    `UPDATE phi_encryption_status SET ${sets.join(', ')}
     WHERE table_name = $${paramIndex++} AND column_name = $${paramIndex}`,
    values
  );
}

// ============================================================================
// BACKFILL LOGIC
// ============================================================================

async function backfillColumn(
  config: ColumnConfig,
  options: { batchSize: number; dryRun: boolean; resume: boolean; verify: boolean }
): Promise<{ processed: number; encrypted: number; errors: number }> {
  const { table, column, idColumn, ownerColumn } = config;
  const { batchSize, dryRun, resume, verify } = options;

  const encColumn = `${column}_enc`;
  const metaColumn = `${column}_enc_meta`;

  console.log(`\n[${table}.${column}] Starting backfill...`);

  // Check if table exists
  if (!(await tableExists(table))) {
    console.log(`[${table}.${column}] Table does not exist, skipping`);
    return { processed: 0, encrypted: 0, errors: 0 };
  }

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total FROM ${table} WHERE ${column} IS NOT NULL AND ${encColumn} IS NULL`
  );
  const total = parseInt(countResult.rows[0].total);

  if (total === 0) {
    console.log(`[${table}.${column}] No rows to encrypt`);
    await updateStatus(table, column, { status: 'completed', completed_at: new Date() });
    return { processed: 0, encrypted: 0, errors: 0 };
  }

  console.log(`[${table}.${column}] ${total} rows to encrypt`);

  // Update status
  await updateStatus(table, column, {
    status: 'in_progress',
    started_at: new Date(),
  });

  // Get starting point
  let lastId = resume ? await getLastProcessedId(table, column) : null;
  if (lastId) {
    console.log(`[${table}.${column}] Resuming from ID: ${lastId}`);
  }

  let processed = 0;
  let encrypted = 0;
  let errors = 0;

  while (true) {
    // Fetch batch
    const whereClause = lastId
      ? `${column} IS NOT NULL AND ${encColumn} IS NULL AND ${idColumn} > $1`
      : `${column} IS NOT NULL AND ${encColumn} IS NULL`;

    const params = lastId ? [lastId] : [];

    const result = await query(
      `SELECT ${idColumn}, ${column}${ownerColumn ? `, ${ownerColumn}` : ''}
       FROM ${table}
       WHERE ${whereClause}
       ORDER BY ${idColumn}
       LIMIT ${batchSize}`,
      params
    );

    if (result.rows.length === 0) {
      break;
    }

    // Process batch
    for (const row of result.rows) {
      const rowId = row[idColumn];
      const plaintext = row[column];
      const ownerId = ownerColumn ? row[ownerColumn] : undefined;

      try {
        const context: PHIContext = {
          table,
          column,
          rowId,
          ownerId,
        };

        const { ciphertext, meta } = encryptForDB(plaintext, context);

        if (!dryRun) {
          await query(
            `UPDATE ${table} SET ${encColumn} = $1, ${metaColumn} = $2 WHERE ${idColumn} = $3`,
            [ciphertext, JSON.stringify(meta), rowId]
          );
        }

        // Verify if requested
        if (verify && !dryRun) {
          const verifyResult = await query(
            `SELECT ${encColumn}, ${metaColumn} FROM ${table} WHERE ${idColumn} = $1`,
            [rowId]
          );
          const storedCiphertext = verifyResult.rows[0][encColumn];
          const storedMeta = verifyResult.rows[0][metaColumn];
          const decrypted = decryptFromDB(storedCiphertext, storedMeta, context);

          if (decrypted !== plaintext) {
            throw new Error('Verification failed: decrypted does not match original');
          }
        }

        encrypted++;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[${table}.${column}] Error encrypting row ${rowId}: ${message}`);
        errors++;
      }

      processed++;
      lastId = rowId;
    }

    // Update progress
    if (!dryRun) {
      await updateStatus(table, column, {
        encrypted_rows: encrypted,
        last_processed_id: lastId,
      });
    }

    const pct = ((processed / total) * 100).toFixed(1);
    process.stdout.write(`\r[${table}.${column}] Progress: ${processed}/${total} (${pct}%)`);
  }

  console.log(`\n[${table}.${column}] Complete: ${encrypted} encrypted, ${errors} errors`);

  if (!dryRun && errors === 0) {
    await updateStatus(table, column, {
      status: 'completed',
      completed_at: new Date(),
    });
  }

  return { processed, encrypted, errors };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const options = parseArgs();

  console.log('PHI Encryption Backfill');
  console.log('=======================');
  console.log(`Batch size: ${options.batchSize}`);
  console.log(`Dry run: ${options.dryRun}`);
  console.log(`Resume: ${options.resume}`);
  console.log(`Verify: ${options.verify}`);

  if (options.dryRun) {
    console.log('\n⚠️  DRY RUN MODE - No data will be written\n');
  }

  // Check for encryption key
  if (!process.env.PHI_ENCRYPTION_KEY) {
    console.error('ERROR: PHI_ENCRYPTION_KEY environment variable not set');
    process.exit(1);
  }

  // Filter columns if table specified
  const columns = options.table
    ? WAVE1_COLUMNS.filter(c => c.table === options.table)
    : WAVE1_COLUMNS;

  if (columns.length === 0) {
    console.error(`No columns found for table: ${options.table}`);
    process.exit(1);
  }

  let totalProcessed = 0;
  let totalEncrypted = 0;
  let totalErrors = 0;

  for (const config of columns) {
    const { processed, encrypted, errors } = await backfillColumn(config, options);
    totalProcessed += processed;
    totalEncrypted += encrypted;
    totalErrors += errors;
  }

  console.log('\n========== SUMMARY ==========');
  console.log(`Total processed: ${totalProcessed}`);
  console.log(`Total encrypted: ${totalEncrypted}`);
  console.log(`Total errors: ${totalErrors}`);

  if (totalErrors > 0) {
    console.log('\n⚠️  Some rows failed to encrypt. Review errors above.');
    process.exit(1);
  }

  console.log('\n✅ Backfill complete');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
