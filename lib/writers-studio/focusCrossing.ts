/**
 * THE FOCUS CROSSING — one authorized boundary, one accountable crossing,
 * one canonical MAIA, and no invisible alternate path.
 *
 * ⭐⭐ C1 · BOUNDARY SINGULARITY. Every Writer's Studio Work-context cognition
 * path passes through the constituted disclosure boundary **exactly once** —
 * not "at least once". This module is that path, and it is the only one.
 *
 * ⭐⭐ WHAT COUNTS AS A CROSSING (frozen before implementation):
 *
 *   The crossing occurs when the authorized Work context is HANDED TO canonical
 *   MAIA cognition — not when MAIA finishes answering.
 *
 *   boundary authorized → Work assembled → ⭐ HANDOFF ← the crossing
 *      → receipt confirmed → cognition continues → response succeeds or fails
 *
 * ⛔ A generation failure after handoff does NOT mean the Work never crossed:
 * the receipt still says `crossed`. And a route failure BEFORE the handoff must
 * never confirm. **The receipt is evidence of disclosure, not of successful
 * inference. Response success is not disclosure evidence — handoff is.**
 *
 * ⭐ C2 · The Work is READ SERVER-SIDE, AFTER `may_cross`, and never accepted
 * from the caller. If the client supplied the passage text, the boundary would
 * be decorative — the text would already have left the Work, and the receipt
 * would describe a crossing the client, not the boundary, controlled.
 *
 * ⛔ THE ROOM IS HELD CONSTANT. Focus enters the canonical `writers_studio`
 * participation path as a CONTEXT PRODUCER. It never becomes a separate prompt
 * that bypasses the room's role, provenance or organism.
 *   *Hold the room constant. Change the mind.*
 *   *The frame determines the center of inquiry. It does not limit the field of
 *   intelligence.*
 */

import { establishDisclosureBoundary, mayCrossBoundary, type BoundaryOutcome } from '@/lib/disclosure/disclosureBoundary';
import { confirmDisclosureCrossed } from '@/lib/disclosure/contextDisclosureReceipt';
import { presentBoundaryOutcome, presentCrossing, type FocusDisclosurePresentation } from './focusDisclosureSurface';
import type { TurnPosture } from '@/lib/sanctuary/turnPosture';
import type { DisclosureScopeKind, DisclosureGesture } from '@/lib/disclosure/contextDisclosureReceipt';

/** Reads the authorized Work. ⛔ Called ONLY after `may_cross`. */
export interface FocusAssembler {
  (ref: {
    memberId: string; workRef: string;
    scopeKind: DisclosureScopeKind; sectionRef?: string;
    /** The writer's selection. Carried in the REQUEST; never in the receipt. */
    range?: { start: number; end: number };
  }): Promise<string | null>;
}

/**
 * Hands the assembled context to canonical MAIA cognition.
 *
 * ⛔ Injected as a port so the falsifiers can observe the handoff — NOT so an
 * alternate brain can be substituted. C5 asserts the production wiring is the
 * canonical `writers_studio` path and nothing else.
 */
export interface CanonicalCognition {
  (input: {
    memberId: string; sessionId: string; requestId: string;
    ask: string; focusContext: string;
  }): Promise<{ ok: boolean; response?: string }>;
}

export interface FocusCrossingRequest {
  requestId: string;
  posture: TurnPosture;
  memberId: string;
  sessionId: string;
  disclosureId: string;
  workRef: string;
  scopeKind: DisclosureScopeKind;
  sectionRef?: string;
  range?: { start: number; end: number };
  gesture: DisclosureGesture;
  ask: string;
}

export type FocusCrossingResult = {
  readonly presentation: FocusDisclosurePresentation;
  readonly response: string | null;
  /** ⭐ The id that authorized the handoff — and, when confirmed, the one confirmed. */
  readonly disclosureId: string | null;
  readonly boundary: BoundaryOutcome;
};

export async function performFocusCrossing(
  req: FocusCrossingRequest,
  deps: { assemble: FocusAssembler; cognition: CanonicalCognition },
): Promise<FocusCrossingResult> {
  // ── 1 · THE ONE BOUNDARY. Consent precondition, then receipt, then permission.
  const boundary = await establishDisclosureBoundary({
    requestId: req.requestId,
    posture: req.posture,
    memberId: req.memberId,
    sessionId: req.sessionId,
    disclosure: {
      disclosureId: req.disclosureId,
      boundary: 'writers_studio.focus->maia_cognition',
      sourceClass: 'work',
      participationBasis: 'member_invoked',
      sourceRef: req.workRef,
      scopeKind: req.scopeKind,
      sectionRef: req.sectionRef,
      gesture: req.gesture,
    },
  });

  if (!mayCrossBoundary(boundary)) {
    // ⛔ C4 · NO SCOPE SUBSTITUTION. Every refusal returns a §3a state and
    // nothing else happens — no Work is read, no cognition is called, and an
    // ordinary-scope request is NOT silently performed in its place.
    return {
      presentation: presentBoundaryOutcome(boundary),
      response: null, disclosureId: null, boundary,
    };
  }

  // ── 2 · ONLY NOW is the Work read. C2 depends on this ordering.
  const focusContext = await deps.assemble({
    memberId: req.memberId, workRef: req.workRef,
    scopeKind: req.scopeKind, sectionRef: req.sectionRef, range: req.range,
  });

  if (!focusContext) {
    // The authorized Work could not be read. The receipt stays `attempted`,
    // which is the truthful state: authorization existed, the crossing did not.
    // ⛔ Never confirmed — nothing was handed to cognition.
    return {
      presentation: presentBoundaryOutcome({ kind: 'receipt_refused', outcome: { kind: 'unavailable' } }),
      response: null, disclosureId: null, boundary,
    };
  }

  // ── 3 · THE CROSSING IS THE HANDOFF.
  const handoff = deps.cognition({
    memberId: req.memberId, sessionId: req.sessionId, requestId: req.requestId,
    ask: req.ask, focusContext,
  });

  // ⭐ C3/C6 · Confirm because the handoff BEGAN, with the same disclosureId that
  // authorized it — not because an answer came back. A generation failure after
  // this point leaves a truthful `crossed` receipt.
  const confirmed = await confirmDisclosureCrossed(boundary.disclosureId);

  const result = await handoff.catch(() => ({ ok: false as const }));

  return {
    presentation: presentCrossing(confirmed),
    response: result.ok ? (result as { response?: string }).response ?? null : null,
    disclosureId: boundary.disclosureId,
    boundary,
  };
}
