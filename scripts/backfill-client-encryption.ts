#!/usr/bin/env npx ts-node
/**
 * BACKFILL CLIENT NAME ENCRYPTION
 *
 * Encrypts existing plaintext client names in the practitioner_clients table.
 * Safe to run multiple times - only processes rows without encryption.
 *
 * Usage:
 *   npx ts-node scripts/backfill-client-encryption.ts [--dry-run] [--batch-size=100]
 *
 * Environment variables required:
 *   - DATABASE_URL or individual PG* vars
 *   - PHI_ENCRYPTION_KEY (32 bytes, base64 or hex)
 *
 * HIPAA Sprint 7 - Phase 2A
 */

import { query } from '../lib/db/postgres';
import { PHIEncryption, PHIContext, PHIEncryptionMeta } from '../lib/security/phiEncryption';

// Parse CLI arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const batchSizeArg = args.find(a => a.startsWith('--batch-size='));
const batchSize = batchSizeArg ? parseInt(batchSizeArg.split('=')[1], 10) : 100;

interface ClientRow {
  id: string;
  practitioner_id: string;
  name: string;
  preferred_name: string | null;
  name_enc: string | null;
}

/**
 * Build PHI context for encryption
 */
function buildContext(clientId: string, practitionerId: string, column: string): PHIContext {
  return {
    table: 'practitioner_clients',
    column,
    rowId: clientId,
    ownerId: practitionerId,
  };
}

/**
 * Encrypt and update a single client record
 */
async function encryptClient(client: ClientRow): Promise<boolean> {
  try {
    // Encrypt name
    const nameContext = buildContext(client.id, client.practitioner_id, 'name');
    const nameEncrypted = PHIEncryption.encryptForDB(client.name, nameContext);

    // Encrypt preferred_name if present
    let preferredNameEncrypted: { ciphertext: string; meta: PHIEncryptionMeta } | null = null;
    if (client.preferred_name) {
      const prefContext = buildContext(client.id, client.practitioner_id, 'preferred_name');
      preferredNameEncrypted = PHIEncryption.encryptForDB(client.preferred_name, prefContext);
    }

    if (dryRun) {
      console.log(`  [DRY RUN] Would encrypt client ${client.id}`);
      return true;
    }

    // Update with encrypted values
    if (preferredNameEncrypted) {
      await query(
        `UPDATE practitioner_clients
         SET name_enc = $1, name_enc_meta = $2,
             preferred_name_enc = $3, preferred_name_enc_meta = $4,
             encryption_key_version = 1
         WHERE id = $5`,
        [
          nameEncrypted.ciphertext,
          JSON.stringify(nameEncrypted.meta),
          preferredNameEncrypted.ciphertext,
          JSON.stringify(preferredNameEncrypted.meta),
          client.id,
        ]
      );
    } else {
      await query(
        `UPDATE practitioner_clients
         SET name_enc = $1, name_enc_meta = $2, encryption_key_version = 1
         WHERE id = $3`,
        [
          nameEncrypted.ciphertext,
          JSON.stringify(nameEncrypted.meta),
          client.id,
        ]
      );
    }

    return true;
  } catch (error) {
    console.error(`  ERROR encrypting client ${client.id}:`, error);
    return false;
  }
}

/**
 * Main backfill function
 */
async function backfillEncryption(): Promise<void> {
  console.log('='.repeat(60));
  console.log('CLIENT NAME ENCRYPTION BACKFILL');
  console.log('='.repeat(60));
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Batch size: ${batchSize}`);
  console.log();

  // Check encryption key is configured
  if (!process.env.PHI_ENCRYPTION_KEY) {
    console.error('ERROR: PHI_ENCRYPTION_KEY environment variable not set');
    process.exit(1);
  }

  // Get total count of records needing encryption
  const countResult = await query(
    `SELECT COUNT(*) as total FROM practitioner_clients WHERE name_enc IS NULL AND name IS NOT NULL`
  );
  const totalToEncrypt = parseInt(countResult.rows[0]?.total || '0', 10);

  console.log(`Records needing encryption: ${totalToEncrypt}`);

  if (totalToEncrypt === 0) {
    console.log('All records are already encrypted. Nothing to do.');
    return;
  }

  // Process in batches
  let processed = 0;
  let encrypted = 0;
  let failed = 0;

  while (processed < totalToEncrypt) {
    // Get next batch
    const batchResult = await query(
      `SELECT id, practitioner_id, name, preferred_name, name_enc
       FROM practitioner_clients
       WHERE name_enc IS NULL AND name IS NOT NULL
       ORDER BY created_at ASC
       LIMIT $1`,
      [batchSize]
    );

    if (batchResult.rows.length === 0) break;

    console.log(`\nProcessing batch ${Math.floor(processed / batchSize) + 1}...`);

    for (const client of batchResult.rows as ClientRow[]) {
      const success = await encryptClient(client);
      if (success) {
        encrypted++;
      } else {
        failed++;
      }
      processed++;
    }

    // Progress update
    const pct = Math.round((processed / totalToEncrypt) * 100);
    console.log(`  Progress: ${processed}/${totalToEncrypt} (${pct}%)`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('BACKFILL COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total processed: ${processed}`);
  console.log(`Successfully encrypted: ${encrypted}`);
  console.log(`Failed: ${failed}`);

  if (dryRun) {
    console.log('\nThis was a DRY RUN. No changes were made.');
    console.log('Remove --dry-run to perform actual encryption.');
  }
}

/**
 * Verify encryption (optional post-run check)
 */
async function verifyEncryption(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('VERIFICATION');
  console.log('='.repeat(60));

  // Get encryption status per practitioner
  const statusResult = await query(`
    SELECT
      practitioner_id,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE name_enc IS NOT NULL) as encrypted,
      COUNT(*) FILTER (WHERE name_enc IS NULL) as unencrypted
    FROM practitioner_clients
    GROUP BY practitioner_id
    ORDER BY total DESC
    LIMIT 10
  `);

  console.log('\nTop 10 practitioners by client count:');
  console.log('Practitioner ID                          | Total | Encrypted | Unencrypted');
  console.log('-'.repeat(75));

  for (const row of statusResult.rows) {
    console.log(
      `${row.practitioner_id} | ${String(row.total).padStart(5)} | ${String(row.encrypted).padStart(9)} | ${String(row.unencrypted).padStart(11)}`
    );
  }

  // Overall summary
  const overallResult = await query(`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE name_enc IS NOT NULL) as encrypted,
      COUNT(*) FILTER (WHERE name_enc IS NULL) as unencrypted
    FROM practitioner_clients
  `);

  const overall = overallResult.rows[0];
  const pct = overall.total > 0
    ? Math.round((overall.encrypted / overall.total) * 100)
    : 100;

  console.log('\nOverall encryption status:');
  console.log(`  Total clients: ${overall.total}`);
  console.log(`  Encrypted: ${overall.encrypted} (${pct}%)`);
  console.log(`  Unencrypted: ${overall.unencrypted}`);
}

// Run
(async () => {
  try {
    await backfillEncryption();
    await verifyEncryption();
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
})();
