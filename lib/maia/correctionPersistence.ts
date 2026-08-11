/**
 * Correction persistence — Gate 1 Layer B (durable conversational corrigibility).
 *
 * ⭐ AUTHORITY: founder ruling
 *    docs/governance/FOUNDER_RULING_PERSISTENT_CORRIGIBILITY_GATE1_2026-08-09.md
 *    on the evidence record
 *    docs/architecture/audits/MAIA_PERSISTENT_CORRIGIBILITY_RECONCILIATION_2026-08-09.md.
 *
 * The governing distinction (F1/F5): **the member authors the correction; the
 * system faithfully registers its consequence.** Detection does not create
 * authority — the member's utterance does. The detector functions as
 * recognition/transcription of an authored act, not as its author.
 *
 * Semantics (F2): supersession, not deletion.
 *   member corrects X → X remains historical evidence (row untouched except
 *   eligibility) → X loses eligibility for unqualified current recall →
 *   the member's words persist verbatim as a member_corrections row.
 *
 * Boundaries enforced here:
 *   ⛔ Ambiguity fails toward non-supersession (F5): only explicit, high-
 *      confidence detection (≥ SUPERSESSION_CONFIDENCE_FLOOR) with a
 *      deterministic referent supersedes anything. Lower-confidence explicit
 *      phrases are recorded as member-authored correction acts WITHOUT
 *      supersession. Everything else does nothing.
 *   ⛔ The referent is never inferred: it is the immediately preceding
 *      assistant turn in the SAME session, or nothing.
 *   ⛔ Sanctuary writes nothing (S1 posture gate, fail closed).
 *   ⛔ No retroactive inference: this module acts only on the current turn's
 *      explicit act. Bulk detector passes over historical turns are
 *      constitutionally refused (founder ruling, production-data section).
 *   ⭐ Corrigibility of the corrigibility mechanism (F6): reverseMemberCorrection
 *      restores eligibility while preserving the full correction history —
 *      reversal adds a row, never removes one.
 */

import { query } from '@/lib/db/postgres';
import { TurnPosture, contentWritable } from '@/lib/sanctuary/turnPosture';
import type { CorrectionDetectionResult } from '@/lib/consciousness/correctionDetection';

/**
 * Confidence floor for supersession (F5: ambiguous fails toward non-supersession).
 * Detector tiers: repeat 0.92 · thread_loss 0.90 · misread 0.85 · general 0.70.
 * The 'general' tier records the member act but supersedes nothing.
 */
export const SUPERSESSION_CONFIDENCE_FLOOR = 0.85;

export const DETECTOR_VERSION = 'phrase-v1';

export type CorrectionPersistResult = {
  /** Whether a member_corrections row was written. */
  recorded: boolean;
  /** Whether a prior assistant turn lost current-recall eligibility. */
  superseded: boolean;
  correctionId?: string;
  supersededTurnId?: string;
  /** Why nothing (or only a record) was written — for the ops log. */
  reason?:
    | 'no_signal'
    | 'sanctuary'
    | 'below_supersession_floor'
    | 'no_deterministic_referent'
    | 'write_error';
};

/**
 * Persist an explicit member correction and register its consequence.
 *
 * Call AFTER detection on the member's full message text (never on a
 * truncated render — invariant A9). Fire-and-forget safe: all failures are
 * contained and reported in the result, never thrown.
 */
export async function persistMemberCorrection(
  posture: TurnPosture,
  input: {
    memberId: string;
    sessionId: string | null;
    /** The member's message — persisted verbatim as the authored act (F1). */
    verbatimText: string;
    detection: CorrectionDetectionResult;
  },
): Promise<CorrectionPersistResult> {
  const { memberId, sessionId, verbatimText, detection } = input;

  if (!detection.hasCorrectionSignal || !detection.correctionType) {
    return { recorded: false, superseded: false, reason: 'no_signal' };
  }

  // Sanctuary: a correction uttered in sanctuary governs the turn (Layer A
  // still runs) but persists nothing (invariant A8).
  if (!contentWritable(posture, 'correctionPersistence.persistMemberCorrection', sessionId ?? undefined)) {
    return { recorded: false, superseded: false, reason: 'sanctuary' };
  }

  if (!memberId || !verbatimText?.trim()) {
    return { recorded: false, superseded: false, reason: 'no_signal' };
  }

  const wantsSupersession =
    detection.confidence >= SUPERSESSION_CONFIDENCE_FLOOR;

  try {
    // Deterministic referent (F5): the immediately preceding assistant turn in
    // this session — the statement the member is correcting. Never inferred;
    // member-scoped (invariant: one member's correction cannot touch another's
    // rows).
    let supersededTurnId: string | undefined;
    if (wantsSupersession && sessionId) {
      const referent = await query<{ id: string }>(
        `SELECT id FROM conversation_turns
         WHERE session_id = $1 AND user_id = $2 AND role = 'assistant'
           AND recall_eligibility = 'eligible'
         ORDER BY created_at DESC, seq DESC
         LIMIT 1`,
        [sessionId, memberId],
      );
      supersededTurnId = referent.rows[0]?.id;
    }

    const superseding = Boolean(wantsSupersession && supersededTurnId);

    // The member's authored act, verbatim, with detection provenance (F6).
    const inserted = await query<{ id: string }>(
      `INSERT INTO member_corrections
         (member_id, session_id, verbatim_text, correction_type, matched_phrase,
          detection_confidence, detector_version, superseded_turn_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        memberId,
        sessionId,
        verbatimText,
        detection.correctionType,
        detection.matchedPhrase ?? null,
        detection.confidence,
        DETECTOR_VERSION,
        superseding ? supersededTurnId : null,
      ],
    );
    const correctionId = inserted.rows[0]?.id;
    if (!correctionId) {
      return { recorded: false, superseded: false, reason: 'write_error' };
    }

    if (!superseding) {
      return {
        recorded: true,
        superseded: false,
        correctionId,
        reason: wantsSupersession ? 'no_deterministic_referent' : 'below_supersession_floor',
      };
    }

    // Register the consequence (F2): eligibility changes; the row itself —
    // content, provenance, timestamps — is untouched. The DB CHECK
    // turns_supersession_coherent guarantees this write carries the member act.
    await query(
      `UPDATE conversation_turns
       SET recall_eligibility = 'superseded',
           superseded_by_correction_id = $1
       WHERE id = $2 AND user_id = $3`,
      [correctionId, supersededTurnId, memberId],
    );

    return { recorded: true, superseded: true, correctionId, supersededTurnId };
  } catch (err) {
    console.warn('[correctionPersistence] persist failed (non-fatal):', err);
    return { recorded: false, superseded: false, reason: 'write_error' };
  }
}

/**
 * Reverse a prior correction (F6 — the correction system is itself corrigible).
 *
 * Restores eligibility of any turns the correction superseded and records the
 * reversal AS a new member_corrections row referencing the reversed one.
 * The original correction row is preserved untouched: history accumulates,
 * it is never rewritten. Member-scoped end to end.
 */
export async function reverseMemberCorrection(input: {
  memberId: string;
  correctionId: string;
  /** The member's words performing the reversal (or the gesture description). */
  verbatimText: string;
}): Promise<{ reversed: boolean; reversalId?: string; restoredTurnCount?: number }> {
  const { memberId, correctionId, verbatimText } = input;
  if (!memberId || !correctionId || !verbatimText?.trim()) {
    return { reversed: false };
  }
  try {
    // Verify ownership before touching anything (isolation invariant).
    const owned = await query<{ id: string }>(
      `SELECT id FROM member_corrections WHERE id = $1 AND member_id = $2`,
      [correctionId, memberId],
    );
    if (owned.rows.length === 0) {
      return { reversed: false };
    }

    const reversal = await query<{ id: string }>(
      `INSERT INTO member_corrections
         (member_id, verbatim_text, correction_type, detection_confidence,
          detector_version, reverses_correction_id)
       VALUES ($1, $2, 'general', 1.0, 'member-gesture', $3)
       RETURNING id`,
      [memberId, verbatimText, correctionId],
    );
    const reversalId = reversal.rows[0]?.id;
    if (!reversalId) return { reversed: false };

    const restored = await query(
      `UPDATE conversation_turns
       SET recall_eligibility = 'eligible',
           superseded_by_correction_id = NULL
       WHERE superseded_by_correction_id = $1 AND user_id = $2`,
      [correctionId, memberId],
    );

    return { reversed: true, reversalId, restoredTurnCount: restored.rowCount ?? 0 };
  } catch (err) {
    console.warn('[correctionPersistence] reverse failed (non-fatal):', err);
    return { reversed: false };
  }
}

/** Ops log shape — matches the *-block log family on the live route. */
export function summarizeCorrectionPersistForLog(result: CorrectionPersistResult) {
  return {
    recorded: result.recorded,
    superseded: result.superseded,
    reason: result.reason ?? 'ok',
  };
}
