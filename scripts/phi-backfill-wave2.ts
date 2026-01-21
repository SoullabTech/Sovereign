/**
 * PHI BACKFILL - WAVE 2
 *
 * One-time migration to encrypt legacy rows that existed before dual-write.
 * Run with: npx tsx scripts/phi-backfill-wave2.ts
 *
 * SAFE: Only updates rows where _enc IS NULL. Idempotent.
 */

import { query, getClient } from '@/lib/db/postgres';
import { encryptForDB, PHIContext } from '@/lib/security/phiEncryption';

// ============================================================================
// HELPERS
// ============================================================================

function encrypt(plaintext: string, context: PHIContext): { ciphertext: string; meta: string } {
  const { ciphertext, meta } = encryptForDB(plaintext, context);
  return { ciphertext, meta: JSON.stringify(meta) };
}

async function backfillCaseNotes(): Promise<number> {
  const { rows } = await query(`
    SELECT id, case_id, content
    FROM case_notes
    WHERE content IS NOT NULL AND content_enc IS NULL
  `);

  if (rows.length === 0) {
    console.log('[case_notes] No rows to backfill');
    return 0;
  }

  console.log(`[case_notes] Backfilling ${rows.length} rows...`);

  for (const row of rows) {
    const context: PHIContext = {
      table: 'case_notes',
      column: 'content',
      rowId: row.id,
      ownerId: row.case_id,
    };
    const { ciphertext, meta } = encrypt(row.content, context);

    await query(
      `UPDATE case_notes
       SET content_enc = $1, content_enc_meta = $2
       WHERE id = $3`,
      [ciphertext, meta, row.id]
    );
  }

  console.log(`[case_notes] Backfilled ${rows.length} rows`);
  return rows.length;
}

async function backfillMaiaConsultations(): Promise<number> {
  const { rows } = await query(`
    SELECT id, practitioner_id, practitioner_query, context_provided, maia_response, practitioner_feedback
    FROM maia_consultations
    WHERE (practitioner_query IS NOT NULL AND practitioner_query_enc IS NULL)
       OR (context_provided IS NOT NULL AND context_provided_enc IS NULL)
       OR (maia_response IS NOT NULL AND maia_response_enc IS NULL)
       OR (practitioner_feedback IS NOT NULL AND practitioner_feedback_enc IS NULL)
  `);

  if (rows.length === 0) {
    console.log('[maia_consultations] No rows to backfill');
    return 0;
  }

  console.log(`[maia_consultations] Backfilling ${rows.length} rows...`);

  for (const row of rows) {
    const updates: string[] = [];
    const values: (string | null)[] = [];
    let paramIndex = 1;

    // practitioner_query
    if (row.practitioner_query && !row.practitioner_query_enc) {
      const ctx: PHIContext = {
        table: 'maia_consultations',
        column: 'practitioner_query',
        rowId: row.id,
        ownerId: row.practitioner_id,
      };
      const { ciphertext, meta } = encrypt(row.practitioner_query, ctx);
      updates.push(`practitioner_query_enc = $${paramIndex++}, practitioner_query_enc_meta = $${paramIndex++}`);
      values.push(ciphertext, meta);
    }

    // context_provided (JSONB - stringify first)
    if (row.context_provided && !row.context_provided_enc) {
      const ctx: PHIContext = {
        table: 'maia_consultations',
        column: 'context_provided',
        rowId: row.id,
        ownerId: row.practitioner_id,
      };
      const plaintext = typeof row.context_provided === 'string'
        ? row.context_provided
        : JSON.stringify(row.context_provided);
      const { ciphertext, meta } = encrypt(plaintext, ctx);
      updates.push(`context_provided_enc = $${paramIndex++}, context_provided_enc_meta = $${paramIndex++}`);
      values.push(ciphertext, meta);
    }

    // maia_response
    if (row.maia_response && !row.maia_response_enc) {
      const ctx: PHIContext = {
        table: 'maia_consultations',
        column: 'maia_response',
        rowId: row.id,
        ownerId: row.practitioner_id,
      };
      const { ciphertext, meta } = encrypt(row.maia_response, ctx);
      updates.push(`maia_response_enc = $${paramIndex++}, maia_response_enc_meta = $${paramIndex++}`);
      values.push(ciphertext, meta);
    }

    // practitioner_feedback
    if (row.practitioner_feedback && !row.practitioner_feedback_enc) {
      const ctx: PHIContext = {
        table: 'maia_consultations',
        column: 'practitioner_feedback',
        rowId: row.id,
        ownerId: row.practitioner_id,
      };
      const { ciphertext, meta } = encrypt(row.practitioner_feedback, ctx);
      updates.push(`practitioner_feedback_enc = $${paramIndex++}, practitioner_feedback_enc_meta = $${paramIndex++}`);
      values.push(ciphertext, meta);
    }

    if (updates.length > 0) {
      values.push(row.id);
      await query(
        `UPDATE maia_consultations SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
        values
      );
    }
  }

  console.log(`[maia_consultations] Backfilled ${rows.length} rows`);
  return rows.length;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('PHI BACKFILL - WAVE 2');
  console.log('='.repeat(60));

  if (!process.env.PHI_ENCRYPTION_KEY) {
    console.error('ERROR: PHI_ENCRYPTION_KEY not set');
    process.exit(1);
  }

  let total = 0;

  try {
    total += await backfillCaseNotes();
    total += await backfillMaiaConsultations();

    console.log('='.repeat(60));
    console.log(`COMPLETE: Backfilled ${total} rows`);
    console.log('='.repeat(60));

    // Verify no gaps remain
    console.log('\nVerification:');

    const caseNotesGap = await query(`
      SELECT COUNT(*) as gap FROM case_notes
      WHERE content IS NOT NULL AND content_enc IS NULL
    `);
    console.log(`  case_notes gaps: ${caseNotesGap.rows[0].gap}`);

    const consultationsGap = await query(`
      SELECT
        COUNT(*) FILTER (WHERE practitioner_query IS NOT NULL AND practitioner_query_enc IS NULL) as query_gap,
        COUNT(*) FILTER (WHERE context_provided IS NOT NULL AND context_provided_enc IS NULL) as context_gap,
        COUNT(*) FILTER (WHERE maia_response IS NOT NULL AND maia_response_enc IS NULL) as response_gap,
        COUNT(*) FILTER (WHERE practitioner_feedback IS NOT NULL AND practitioner_feedback_enc IS NULL) as feedback_gap
      FROM maia_consultations
    `);
    const gaps = consultationsGap.rows[0];
    console.log(`  maia_consultations gaps: query=${gaps.query_gap}, context=${gaps.context_gap}, response=${gaps.response_gap}, feedback=${gaps.feedback_gap}`);

    const hasGaps = parseInt(caseNotesGap.rows[0].gap) > 0
      || parseInt(gaps.query_gap) > 0
      || parseInt(gaps.context_gap) > 0
      || parseInt(gaps.response_gap) > 0
      || parseInt(gaps.feedback_gap) > 0;

    if (hasGaps) {
      console.log('\nWARNING: Gaps remain after backfill');
      process.exit(1);
    } else {
      console.log('\nSUCCESS: All gaps closed');
    }
  } catch (err) {
    console.error('Backfill failed:', err);
    process.exit(1);
  }
}

main();
