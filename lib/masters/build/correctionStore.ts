/**
 * Master Correction Store — Co-Training Loop
 *
 * Fire-and-forget writes for master corrections/feedback.
 * Follows the spiralStatePersistence.ts pattern:
 *   - storeCorrection returns void (not Promise) to prevent accidental await
 *   - getCorrections is a read path for the build pipeline
 *
 * Correction types:
 *   - thumbs:       👍/👎 after response
 *   - felt_like_me: "Felt like me" / "Not like me" toggle
 *   - rewrite:      "Rewrite as me" → text input (highest value training data)
 *   - note:         Field journal entry ("this felt off")
 */

import { query } from '@/lib/db/postgres';
import type { MasterCorrection, CorrectionType, CorrectionSignal } from './types';

/**
 * Store a correction from the master. Fire-and-forget — never blocks anything.
 * Returns void (not Promise) to prevent accidental await.
 */
export function storeCorrection(correction: {
  master_id: string;
  member_id: string;
  turn_id?: string;
  correction_type: CorrectionType;
  original_content?: string;
  corrected_content?: string;
  signal: CorrectionSignal;
  context?: string;
}): void {
  // Guard: 'rewrite' corrections must have meaningful content (min 10 chars)
  if (correction.correction_type === 'rewrite'
    && (!correction.corrected_content || correction.corrected_content.length < 10)) {
    console.warn('[master-correction] Skipped: rewrite too short or empty');
    return;
  }

  // Deduplicate: skip if same turn+type was already corrected (uses ON CONFLICT)
  // For turn-scoped corrections, we use turn_id + correction_type as a natural dedup key.
  // For notes (no turn_id), every submission is unique — no dedup needed.
  const sql = correction.turn_id
    ? `INSERT INTO master_corrections
         (master_id, member_id, turn_id, correction_type, original_content, corrected_content, signal, context)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT DO NOTHING`
    : `INSERT INTO master_corrections
         (master_id, member_id, turn_id, correction_type, original_content, corrected_content, signal, context)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;

  query(sql, [
    correction.master_id,
    correction.member_id,
    correction.turn_id ?? null,
    correction.correction_type,
    correction.original_content ?? null,
    correction.corrected_content ?? null,
    correction.signal,
    correction.context ?? null,
  ]).catch((error) => {
    // Swallow — correction storage should never break anything
    console.warn('[master-correction] Failed to store correction:', {
      masterId: correction.master_id,
      type: correction.correction_type,
      error: error instanceof Error ? error.message : String(error),
    });
  });
}

/**
 * Read corrections for a master (used by build pipeline, Phase 2+).
 * Optional `since` filter for incremental reads.
 */
export async function getCorrections(
  masterId: string,
  since?: string
): Promise<MasterCorrection[]> {
  const params: unknown[] = [masterId];
  let whereClause = 'WHERE master_id = $1';

  if (since) {
    whereClause += ' AND created_at > $2';
    params.push(since);
  }

  const result = await query<MasterCorrection>(
    `SELECT
      id, master_id, member_id, turn_id,
      correction_type, original_content, corrected_content,
      signal, context, created_at
    FROM master_corrections
    ${whereClause}
    ORDER BY created_at DESC`,
    params
  );

  return result.rows ?? [];
}

/**
 * Count corrections by type for a master (observability).
 */
export async function getCorrectionCounts(
  masterId: string
): Promise<Record<CorrectionType, number>> {
  const result = await query<{ correction_type: CorrectionType; count: string }>(
    `SELECT correction_type, COUNT(*)::text as count
     FROM master_corrections
     WHERE master_id = $1
     GROUP BY correction_type`,
    [masterId]
  );

  const counts: Record<CorrectionType, number> = {
    thumbs: 0,
    felt_like_me: 0,
    rewrite: 0,
    note: 0,
  };

  for (const row of result.rows ?? []) {
    counts[row.correction_type] = parseInt(row.count, 10);
  }

  return counts;
}
