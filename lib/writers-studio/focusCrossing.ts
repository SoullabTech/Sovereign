/**
 * THE FOCUS CROSSING — one authorized boundary, one accountable crossing,
 * one canonical MAIA, and no invisible alternate path.
 *
 * ⭐⭐ C1 · BOUNDARY SINGULARITY. Every Writer's Studio Work-context cognition
 * path passes through the constituted disclosure boundary **exactly once** —
 * not "at least once". This module is that path, and it is the only one.
 *
 * ⭐⭐ WHAT COUNTS AS A CROSSING — AMENDED BY FOCUS-PRODUCER-01.
 *
 * "Not the answer, the handoff" still stands. What changed is what qualifies as
 * the handoff. Entering a wrapper function is not one: the first implementation
 * confirmed the receipt immediately after invoking the cognition port, and that
 * port merely placed the text in a `meta` field nothing read. A receipt can be
 * perfectly valid and describe content canonical cognition never rendered.
 *
 *   The crossing occurs when an ADMITTED Writer's Studio producer containing the
 *   authorized Work is handed into the RESPONSE-PRODUCING cognition path.
 *
 *   authorized → typed producers → MIPA admits → CanonicalTurn → renderer
 *     includes them at every tier → generation begins   ← ⭐ THE CROSSING
 *       → receipt confirmed → generation awaited
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
import type { CognitionPrepareInput, PreparedHandoff } from './writersStudioCognition';
import type { MemberIdentity } from '@/lib/maia/canonical-turn';

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
 * The two-phase cognition port.
 *
 * ⛔ Injected so the falsifiers can observe the handoff — NOT so an alternate
 * brain can be substituted. C5 asserts the production wiring is the canonical
 * `writers_studio` path and nothing else.
 */
export interface CanonicalCognitionPort {
  prepare: (input: CognitionPrepareInput) => Promise<PreparedHandoff | null>;
  generate: (
    prepared: PreparedHandoff,
    input: { memberId: string; sessionId: string; requestId: string; ask: string },
  ) => Promise<{ ok: boolean; response?: string }>;
}

export interface FocusCrossingRequest {
  requestId: string;
  /** ⭐ Minted by `resolveCanonicalIdentity` at the route. A raw id is refused
   *  by `constructCanonicalTurn`, and rightly: one identity truth, not two. */
  identity: MemberIdentity;
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
  deps: { assemble: FocusAssembler; prepare: CanonicalCognitionPort['prepare']; generate: CanonicalCognitionPort['generate'] },
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

  // ── 3 · CONSTRUCT · ADJUDICATE · RENDER. Everything before the model.
  const prepared = await deps.prepare({
    identity: req.identity,
    sessionId: req.sessionId, requestId: req.requestId, ask: req.ask,
    workRef: req.workRef, scopeKind: req.scopeKind, label: req.sectionRef,
    focusContext, sanctuary: req.posture.sanctuary,
  });
  if (!prepared) {
    // ⛔ Construction, adjudication or rendering failed → NO HANDOFF, NO CONFIRM.
    // The receipt stays `attempted`: authorization existed, the crossing did not.
    return {
      presentation: presentBoundaryOutcome({ kind: 'receipt_refused', outcome: { kind: 'unavailable' } }),
      response: null, disclosureId: null, boundary,
    };
  }

  // ── 4 · THE HANDOFF. Generation BEGINS here; the promise is deliberately not
  // awaited yet, so the receipt is confirmed at the moment of crossing.
  const generating = deps.generate(prepared, {
    memberId: req.memberId, sessionId: req.sessionId,
    requestId: req.requestId, ask: req.ask,
  });

  // ⭐ C3/C6 · Confirm the id that authorized THIS handoff, because the admitted
  // Work entered the response-producing path — not because an answer came back.
  const confirmed = await confirmDisclosureCrossed(boundary.disclosureId);

  // ── 5 · Only now await generation. A failure here leaves a truthful `crossed`.
  const result = await generating;

  return {
    presentation: presentCrossing(confirmed),
    response: result.ok ? result.response ?? null : null,
    disclosureId: boundary.disclosureId,
    boundary,
  };
}
