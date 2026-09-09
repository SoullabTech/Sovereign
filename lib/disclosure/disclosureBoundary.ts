/**
 * THE DISCLOSURE BOUNDARY — the ordering made structural.
 *
 *   ⭐⭐ Resolve authority first. Prove it exists. Account for the disclosure.
 *       Then let the context cross.
 *
 * REQUEST-ORDER-01 refuted the assumption that the consent row exists before Work
 * context is assembled: `recordConsentState()` is fire-and-forget, so the FK on
 * `context_disclosure_receipts.request_ref` merely made a violation fail closed —
 * invisibly. This seam replaces "usually true" with an ordering that cannot be
 * skipped, because each step is the previous step's returned authority.
 *
 *   resolve TurnPosture
 *        ↓
 *   ONE named requestId, held by the caller
 *        ↓
 *   AWAIT requireConsentState        ← precondition, not audit trace
 *        ↓  not established → REFUSE. No Work context is assembled at all.
 *   assemble Focus  (the CALLER does this, only on `may_cross`)
 *        ↓
 *   mint context-disclosure receipt  ← only `minted` authorizes
 *        ↓
 *   hand context to cognition        ← ⛔ NOT PERFORMED HERE. #1275 is frozen.
 *        ↓
 *   confirmDisclosureCrossed
 *
 * ⛔ THIS MODULE NEVER CALLS COGNITION and never touches Work content. It returns
 * permission, and the caller performs the crossing. That is deliberate: a seam
 * that both authorized and executed would make the two indistinguishable in a
 * later audit.
 *
 * ⛔ §3a IS NOT DISCHARGED HERE. The surface must tell the writer which of these
 * outcomes occurred — and only `boundary_unavailable`/`refused` before any
 * handoff may be rendered as "nothing from this Focus was sent".
 */

import { requireConsentState, consentEstablished } from '@/lib/provenance/requireConsentState';
import type { TurnPosture } from '@/lib/sanctuary/turnPosture';
import {
  mintDisclosureAttempt, mayCross,
  type ContextDisclosureAttempt, type MintOutcome,
} from './contextDisclosureReceipt';

export type BoundaryOutcome =
  /** ⭐ The ONLY outcome under which the caller may assemble and cross. */
  | { readonly kind: 'may_cross'; readonly disclosureId: string; readonly receiptId: string }
  /** The consent precondition was not established. Nothing was assembled. */
  | { readonly kind: 'consent_unavailable'; readonly reason: string }
  /**
   * The accountability record could not be minted. Nothing was assembled.
   * ⭐ The outcome type EXCLUDES `minted`: a refusal that could carry a mint
   * would force every consumer to handle an impossible case, and the §3a surface
   * would need a fallback with no truthful copy. Make it unrepresentable instead.
   */
  | { readonly kind: 'receipt_refused'; readonly outcome: Exclude<MintOutcome, { kind: 'minted' }> };

export const mayCrossBoundary = (o: BoundaryOutcome): o is Extract<BoundaryOutcome, { kind: 'may_cross' }> =>
  o.kind === 'may_cross';

/**
 * Establish the boundary for one disclosure.
 *
 * `requestId` is supplied by the caller and used for BOTH the consent row and
 * the receipt's `request_ref` — ⭐ one visible value carried across the whole
 * boundary, never regenerated downstream. *An identifier that governs downstream
 * authority must be available downstream.*
 */
export async function establishDisclosureBoundary(opts: {
  requestId: string;
  posture: TurnPosture;
  memberId: string;
  sessionId?: string | null;
  disclosure: Omit<ContextDisclosureAttempt, 'requestRef' | 'memberId'>;
}): Promise<BoundaryOutcome> {
  // 1 · AUTHORITY FIRST — awaited, verified, fail-closed.
  const consent = await requireConsentState({
    requestId: opts.requestId,
    posture: opts.posture,
    memberId: opts.memberId,
    sessionId: opts.sessionId ?? null,
  });
  if (!consentEstablished(consent)) {
    // ⛔ Return BEFORE any context is assembled. The failure must cost the writer
    // a refusal, never a silent answer built from context that had no authority.
    return {
      kind: 'consent_unavailable',
      reason: consent.kind === 'identity_mismatch' ? 'request identity mismatch' : consent.reason,
    };
  }

  // 2 · ACCOUNTABILITY SECOND — the same requestId, carried, not regenerated.
  const mint = await mintDisclosureAttempt({
    ...opts.disclosure,
    memberId: opts.memberId,
    requestRef: opts.requestId,
  });
  if (!mayCross(mint)) return { kind: 'receipt_refused', outcome: mint };

  // 3 · Permission returned. The CALLER crosses, then confirms.
  return { kind: 'may_cross', disclosureId: mint.disclosureId, receiptId: mint.id };
}
