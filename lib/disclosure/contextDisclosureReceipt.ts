/**
 * CONTEXT DISCLOSURE RECEIPT — the accountability half of a context crossing.
 *
 * ⭐ GENERALIZED BEFORE FIRST APPLICATION (founder, 2026-09-09). The
 * constitutional question is not unique to manuscript passages:
 *
 *   ⭐⭐ What context crossed into cognition for this encounter,
 *       and under what authority?
 *
 * A journal entry, a Keep, a remembered decision, a past session, a Work
 * passage, an invoked I Ching reading — different authority and different
 * provenance, one question. Focus (`source_class: 'work'`) is the first
 * implemented source class, and ⛔ the only one v1 admits.
 *
 * Contract: docs/programme/FOCUS-DISCLOSURE-RECEIPT_CONTRACT_2026-09-09.md (RATIFIED,
 * generalized §9)
 *
 *   ⭐⭐ Disclosure without accountability is not authorized.
 *       Accountability without a disclosure must never pretend that one occurred.
 *
 * Three truths, three authorities, never collapsed into one object:
 *   `conversation_turns`            what was said
 *   S5 provenance / consent state   under what authority persistence was allowed
 *   this receipt                    what governed boundary actually crossed
 *
 * ⛔ THIS MODULE IS NOT OBSERVABILITY, AND MUST NOT BE MADE FAILURE-TOLERANT.
 * `memory_transition_records` may be fire-and-forget because it observes what
 * the system did. This is the evidence that the system exercised authority over
 * member-owned Work. The founder's boundary:
 *
 *   ⭐ Accountability may block the optional disclosure.
 *     It must not unnecessarily block the conversation.
 *
 * So `mintDisclosureAttempt()` returns `null` on any failure and the CALLER MUST
 * then not disclose — and must tell the writer (see §3a of the contract; that
 * obligation lives on the Writer's Studio surface, not here).
 */

import { query } from '@/lib/db/postgres';

/** Bump when the disclosure contract changes; recorded on every receipt. */
export const DISCLOSURE_POLICY_VERSION = 'context-disclosure-v1';

/**
 * WHAT kind of context crossed. Intended axis: work · memory · journal · keep ·
 * decision · change · session · symbolic_system.
 * ⛔ v1 admits `work` only — a future capability is not a present data field, and
 * widening the axis is a migration.
 */
export type DisclosureSourceClass = 'work';

/**
 * WHY it was entitled to participate — not merely that it was available.
 *
 *   ⭐ Availability is not permission to participate.
 *   ⭐ Participation is not authority.
 *
 * Intended axis: ambient_continuity · member_invited · member_invoked ·
 * standing_authorization. ⛔ v1 admits `member_invoked` only: Focus is context
 * the writer placed and then explicitly handed across, never context MAIA
 * reached for.
 *
 * ⛔⛔ NEVER DERIVED FROM CROSSED CONTENT. A manuscript sentence reading "ask the
 * I Ching what this means" does not authorize a consultation. The Work may
 * contain an invitation as CONTENT; only the writer can turn it into AUTHORITY.
 */
export type DisclosureParticipationBasis = 'member_invoked';

/** The only boundary constituted in v1. */
export type DisclosureBoundary = 'writers_studio.focus->maia_cognition';

/** The SHAPE of the selection — never its location. */
export type DisclosureScopeKind = 'whole_work' | 'section' | 'passage';

/**
 * The writer gesture that authorized the crossing. Closed vocabulary: the kind
 * of gesture, never its content.
 */
export type DisclosureGesture = 'ask_maia' | 'work_with_this' | 'widen_focus';

export interface ContextDisclosureAttempt {
  /** Unique per attempt; a retry MUST reuse it so evidence cannot be duplicated. */
  readonly disclosureId: string;
  readonly memberId: string;
  /** Serving-request id. ⛔ Never a conversation turn id. */
  readonly requestRef: string;
  readonly boundary: DisclosureBoundary;
  readonly sourceClass: DisclosureSourceClass;
  readonly participationBasis: DisclosureParticipationBasis;
  /** Identity of the crossed thing — authored or assigned, never derived from its content. */
  readonly sourceRef: string;
  readonly scopeKind: DisclosureScopeKind;
  /**
   * Admitted ONLY when the section IS the disclosed thing. For a passage the
   * containing section materially narrows reconstruction, so it is refused here
   * as well as by a CHECK constraint — the receipt proves the governed crossing,
   * not the identity of what crossed.
   */
  readonly sectionRef?: string;
  readonly gesture: DisclosureGesture;
}

/**
 * ⛔ THE REFUSAL SURFACE. These names have appeared on every design that turned
 * a receipt into a shadow copy. A caller reaching for one of them is reaching for
 * the wrong thing, and this type says so at compile time.
 *
 * ⭐ The hash is the one that looks safe and is not: a digest leaks nothing
 * WITHOUT the Work — but the Work is exactly what an auditor of this system
 * holds, so a hash beside the manuscript is a selection locator.
 */
export type RefusedReceiptField =
  | 'text' | 'passage' | 'excerpt' | 'summary' | 'embedding'
  | 'hash' | 'digest' | 'fingerprint'
  | 'startOffset' | 'endOffset' | 'range' | 'length' | 'wordCount' | 'geometry';

export interface MintedDisclosure {
  readonly id: string;
  readonly disclosureId: string;
}

/**
 * PHASE 1 — mint BEFORE the context reaches the cognition boundary.
 *
 * Returns the receipt on success, `null` on any failure.
 *
 * ⛔ `null` means DO NOT DISCLOSE. Not "log and continue". The Focus passage does
 * not cross, Focus-scoped cognition does not run, and the writer is told — while
 * ordinary conversation remains available.
 */
export async function mintDisclosureAttempt(
  attempt: ContextDisclosureAttempt,
): Promise<MintedDisclosure | null> {
  if (attempt.sectionRef && attempt.scopeKind !== 'section') {
    // Refuse in the application too, not only at the CHECK: a caller that passes
    // this is holding a locator, and the honest response is to refuse the
    // disclosure rather than to quietly drop the field and proceed.
    console.error('[DISCLOSURE] mint refused — sectionRef supplied for a non-section scope', {
      scopeKind: attempt.scopeKind,
    });
    return null;
  }

  try {
    const result = await query<{ id: string }>(
      `INSERT INTO context_disclosure_receipts
         (disclosure_id, member_id, request_ref, boundary, source_class,
          participation_basis, source_ref, scope_kind, section_ref,
          authorized_by, gesture, policy_version, state)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'member', $10, $11, 'attempted')
       ON CONFLICT (disclosure_id) DO NOTHING
       RETURNING id`,
      [
        attempt.disclosureId, attempt.memberId, attempt.requestRef, attempt.boundary,
        attempt.sourceClass, attempt.participationBasis, attempt.sourceRef,
        attempt.scopeKind, attempt.sectionRef ?? null,
        attempt.gesture, DISCLOSURE_POLICY_VERSION,
      ],
    );

    if (result.rows[0]?.id) return { id: result.rows[0].id, disclosureId: attempt.disclosureId };

    // Conflict: this disclosure was already minted. A retry is lawful and must
    // resolve to the SAME row rather than a second piece of evidence.
    const existing = await query<{ id: string }>(
      `SELECT id FROM context_disclosure_receipts WHERE disclosure_id = $1`,
      [attempt.disclosureId],
    );
    if (existing.rows[0]?.id) {
      return { id: existing.rows[0].id, disclosureId: attempt.disclosureId };
    }

    console.error('[DISCLOSURE] mint refused — no row after conflict', {
      disclosureIdPrefix: attempt.disclosureId.slice(0, 12),
    });
    return null;
  } catch (err) {
    // Fail closed. The accountability substrate being unavailable is exactly the
    // case where a disclosure may not proceed.
    console.error('[DISCLOSURE] mint failed — disclosure refused', {
      disclosureIdPrefix: attempt.disclosureId.slice(0, 12),
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

/**
 * PHASE 3 — confirm AFTER the context has reached the cognition boundary.
 *
 * ⛔ A failure here does NOT undo the crossing and must never be swallowed. The
 * row stays `attempted`, which is permanent, indexed and queryable: a crossing
 * that may have occurred and was not confirmed. That is a governance anomaly,
 * not an observability gap — and `attempted` never means "nothing crossed".
 *
 * Idempotent: confirming an already-confirmed crossing preserves the original
 * `crossed_at` (enforced by the DB trigger, not by this caller's discipline).
 */
export async function confirmDisclosureCrossed(disclosureId: string): Promise<boolean> {
  try {
    const result = await query(
      `UPDATE context_disclosure_receipts
          SET state = 'crossed', crossed_at = COALESCE(crossed_at, NOW())
        WHERE disclosure_id = $1`,
      [disclosureId],
    );
    if ((result.rowCount ?? 0) === 0) {
      console.error('[DISCLOSURE] ⛔ UNRESOLVED CROSSING — no receipt to confirm', {
        disclosureIdPrefix: disclosureId.slice(0, 12),
      });
      return false;
    }
    return true;
  } catch (err) {
    console.error('[DISCLOSURE] ⛔ UNRESOLVED CROSSING — confirm failed after the boundary was crossed', {
      disclosureIdPrefix: disclosureId.slice(0, 12),
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

/**
 * The governance anomaly query: crossings begun and never confirmed.
 * Read-only, and deliberately exposed so the anomaly is loud rather than latent.
 */
export async function unresolvedCrossings(olderThanMinutes = 5): Promise<number> {
  const result = await query<{ n: string }>(
    `SELECT COUNT(*)::text AS n FROM context_disclosure_receipts
      WHERE state = 'attempted' AND attempted_at < NOW() - make_interval(mins => $1)`,
    [olderThanMinutes],
  );
  return parseInt(result.rows[0]?.n ?? '0', 10);
}
