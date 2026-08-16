/**
 * createMemberMemoryAtomFromKeep — source-table → atoms bridge adapter
 *
 * Governed by:
 *   - docs/architecture/KEEP_CAPTURE_TO_ATOMS_AUDIT_2026-05-26.md
 *   - docs/canon/THE_CLEARING.md
 *   - docs/canon/RIGHT_TO_REMAIN_UNPOSSESSED.md
 *
 * Rule (Kelly 2026-05-26):
 *   Keep/Capture is the member gesture. Semantic atoms are the memory
 *   substrate. They are not parallel systems — Keep/Capture is the front
 *   door into atoms.
 *
 * What this adapter does:
 *   After a source row is created in response to a member Keep/Capture
 *   gesture (e.g. POST /api/capsules/from-text), this adapter writes the
 *   companion row in `member_memory_atoms` so the kept material enters the
 *   semantic continuity substrate alongside its source.
 *
 * What this adapter does NOT do:
 *   - Does NOT confer recall authority. `return_preference` defaults to
 *     'member_pulled' (DB default). The atom does not auto-surface until
 *     the member explicitly opts up via the atom-gesture surface.
 *   - Does NOT touch `crossing_allowed`. DB CHECK constraint
 *     crossing_must_be_false rejects any non-FALSE write from app code.
 *   - Does NOT set `is_breakthrough`. Member-only via
 *     POST /api/sovereign/atoms/[id]/breakthrough.
 *   - Does NOT infer registers or elemental lenses. Per doctrine, lenses
 *     and registers are MEMBER-selected, never system-inferred — even
 *     when the source row carries hints (capsule.signals.element may be
 *     LLM-distilled). The member adds them later via atom gestures.
 *
 * Idempotency:
 *   Relies on `idx_memory_atoms_unique_source`
 *   (UNIQUE on member_id, source_type, source_id WHERE source_id IS NOT NULL)
 *   via ON CONFLICT DO NOTHING. Safe to call multiple times for the same
 *   (member, source).
 *
 * Failure mode:
 *   Returns null on failure. Caller is fire-and-forget — never blocks the
 *   source creation response. Failure is logged with the
 *   `[atoms-adapter]` marker so the ops grep contract reads it.
 */

import { query } from '@/lib/db/postgres';
import type { MemoryAtomSourceType } from './types';

export interface KeepFromSourceInput {
  memberId: string;
  sourceType: MemoryAtomSourceType; // must NOT be 'spontaneous'
  sourceId: string;                 // required (PK of the source row)
  title: string;                    // human-meaningful anchor; usually source.title
}

export interface KeepFromSourceResult {
  atomId: string;
  created: boolean; // true if a new atom row was created; false if duplicate
}

/**
 * Bridge a source-table write to the atoms substrate.
 *
 * The atom is created with:
 *   - status = 'active' (DB default behaviour for first INSERT)
 *   - return_preference = DB default ('member_pulled' — see migration
 *     20260523000001_atoms_return_preference_default_contextual_doorway.sql;
 *     note: filename is historical; current default is restrictive per
 *     memoryAtomsLoader.ts:36)
 *   - crossing_allowed = FALSE (DB default + CHECK constraint)
 *   - is_breakthrough = FALSE (DB default; member-only flip)
 *   - body = NULL (sourced atoms keep content in the source table)
 *   - primary_register = NULL, registers = [], elemental_lenses = []
 *     (member places these later via atom gestures)
 *   - thread_ids = []
 *   - kept_at = NOW(), last_touched_at = NOW()
 */
export async function createMemberMemoryAtomFromKeep(
  input: KeepFromSourceInput,
): Promise<KeepFromSourceResult | null> {
  const { memberId, sourceType, sourceId, title } = input;

  // 'spontaneous' has no source row — it's body-only, handled by keepSource
  // directly. The adapter is for source-bridged writes only.
  if (sourceType === 'spontaneous') {
    console.warn(
      `[atoms-adapter] keep-from-source rejected: 'spontaneous' has no source row { memberIdPrefix: '${memberId.slice(0, 8)}' }`,
    );
    return null;
  }

  if (!sourceId) {
    console.warn(
      `[atoms-adapter] keep-from-source rejected: sourceId required for sourceType '${sourceType}' { memberIdPrefix: '${memberId.slice(0, 8)}' }`,
    );
    return null;
  }

  if (!title || title.trim().length === 0) {
    console.warn(
      `[atoms-adapter] keep-from-source rejected: title required { memberIdPrefix: '${memberId.slice(0, 8)}', sourceType, sourceId }`,
    );
    return null;
  }

  try {
    // ON CONFLICT against the partial UNIQUE index. If a row already exists
    // for this (member, source_type, source_id), we leave it untouched and
    // fetch its id via the WHERE branch below — this preserves the kept_at
    // and last_touched_at of the original Keep gesture.
    const insertResult = await query<{ id: string }>(
      `INSERT INTO member_memory_atoms (
         member_id, source_type, source_id, title,
         body,
         primary_register, registers, elemental_lenses, thread_ids,
         status,
         kept_at, last_touched_at
       ) VALUES (
         $1, $2, $3, $4,
         NULL,
         NULL, '{}', '{}', '{}',
         'active',
         NOW(), NOW()
       )
       ON CONFLICT (member_id, source_type, source_id)
         WHERE source_id IS NOT NULL
         DO NOTHING
       RETURNING id`,
      [memberId, sourceType, sourceId, title],
    );

    if (insertResult.rows.length > 0) {
      const atomId = insertResult.rows[0].id;
      console.log(
        `[atoms-adapter] keep-from-source created { memberIdPrefix: '${memberId.slice(0, 8)}', sourceType: '${sourceType}', sourceId: '${sourceId.slice(0, 8)}', atomId: '${atomId.slice(0, 8)}' }`,
      );
      return { atomId, created: true };
    }

    // Duplicate — fetch existing atom id (do NOT touch last_touched_at;
    // that's a member gesture, not a system update).
    const existing = await query<{ id: string }>(
      `SELECT id FROM member_memory_atoms
       WHERE member_id = $1 AND source_type = $2 AND source_id = $3
       LIMIT 1`,
      [memberId, sourceType, sourceId],
    );

    if (existing.rows.length > 0) {
      const atomId = existing.rows[0].id;
      console.log(
        `[atoms-adapter] keep-from-source duplicate { memberIdPrefix: '${memberId.slice(0, 8)}', sourceType: '${sourceType}', sourceId: '${sourceId.slice(0, 8)}', atomId: '${atomId.slice(0, 8)}' }`,
      );
      return { atomId, created: false };
    }

    // ON CONFLICT silently did nothing and the row isn't there — extremely
    // unlikely; would indicate a partial-index miss or race. Emit failure-empty
    // marker per observability discipline.
    console.error(
      `[atoms-adapter] keep-from-source failure-empty { memberIdPrefix: '${memberId.slice(0, 8)}', sourceType: '${sourceType}', sourceId: '${sourceId.slice(0, 8)}', reason: 'insert-noop-and-select-empty' }`,
    );
    return null;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `[atoms-adapter] keep-from-source failure-empty { memberIdPrefix: '${memberId.slice(0, 8)}', sourceType: '${sourceType}', sourceId: '${sourceId.slice(0, 8)}', error: ${JSON.stringify(message)} }`,
    );
    return null;
  }
}
