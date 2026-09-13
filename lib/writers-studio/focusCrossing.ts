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
import { presentBoundaryOutcome, presentCrossing, presentMaterialization, type FocusDisclosurePresentation } from './focusDisclosureSurface';
import type { FocusMaterialization } from './focusMaterialization';
import type { TurnPosture } from '@/lib/sanctuary/turnPosture';
import type { DisclosureScopeKind, DisclosureGesture } from '@/lib/disclosure/contextDisclosureReceipt';
import type { CognitionPrepareInput, PreparedHandoff } from './writersStudioCognition';
import type { MemberIdentity } from '@/lib/maia/canonical-turn';
import { bindWorkScope, type BoundWorkScope } from '@/lib/jarvis/boundWorkScope';

/**
 * Reads the authorized Work. ⛔ Called ONLY after `may_cross` AND after the Work
 * scope is bound.
 *
 * ⭐ A1/BP-3 · IT TAKES A `BoundWorkScope`, NOT `memberId` + `workRef`. The pair
 * of strings could be supplied by any caller; the scope cannot be constructed
 * without a minted identity and a successful ownership read. The assembler's own
 * `AND member_id = $2` predicate STAYS — binding the authority does not make
 * defence in depth redundant, and removing it would be a repair this act does
 * not authorize.
 */
export interface FocusAssembler {
  (ref: {
    scope: BoundWorkScope;
    scopeKind: DisclosureScopeKind; sectionRef?: string;
    /** The writer's selection. Carried in the REQUEST; never in the receipt. */
    range?: { start: number; end: number };
  }): Promise<FocusMaterialization>;
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
    input: { memberId: string; sessionId: string; requestId: string; ask: string; posture: TurnPosture },
  ) => { handoff: Promise<boolean>; result: Promise<{ ok: boolean; response?: string }> };
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

  // ── 2 · BIND THE WORK AUTHORITY (A1 · BP-3). Until this line the Work was
  // addressed by a pair of strings; from here it is addressed by a capability
  // that could not be constructed without a minted identity and an ownership
  // read. ⛔ The scope is process-local (BW-AUTH-2) and is never receipted,
  // logged, queued or returned.
  const scope = await bindWorkScope(req.identity, req.workRef);
  if (!scope.ok) {
    // ⭐ BW-AUTH-3 · NO EXISTENCE ORACLE. This returns the SAME presentation as
    // an authorized-but-unreadable Work below. A caller cannot learn from the
    // outcome whether the Work is absent, someone else's, or merely unavailable.
    // The receipt stays `attempted` — truthfully: no Work crossed.
    return {
      presentation: presentBoundaryOutcome({ kind: 'receipt_refused', outcome: { kind: 'unavailable' } }),
      response: null, disclosureId: null, boundary,
    };
  }

  // ── 3 · ONLY NOW is the Work read. C2 depends on this ordering.
  const focusContext = await deps.assemble({
    scope: scope.value,
    scopeKind: req.scopeKind, sectionRef: req.sectionRef, range: req.range,
  });

  /* ⛔ An assembler that returns nothing at all is a CONTRACT VIOLATION, not an
     empty Work and not a refusal. Classified rather than crashed — and rather
     than silently treated as absence, which is the entire defect BW-03 exists to
     remove. Unreachable through the types; reachable through a stale caller. */
  const materialized: FocusMaterialization = focusContext
    ?? { kind: 'invariant_failed', detail: { stage: 'shape', error: 'assembler returned no outcome' } };

  if (materialized.kind !== 'loaded') {
    /* ⭐ BW-03 · AUTHORITY WAS ESTABLISHED AND MATERIALIZATION DID NOT SUCCEED.
       That is a DIFFERENT TRUTH from the pre-authority refusal above, and the
       writer is no longer told the same thing. The receipt stays `attempted` —
       truthfully: authorization existed, the crossing did not. Nothing was
       handed to cognition, so it is never confirmed. */
    return {
      presentation: presentMaterialization(materialized),
      response: null, disclosureId: null, boundary,
    };
  }

  // ── 4 · CONSTRUCT · ADJUDICATE · RENDER. Everything before the model.
  const prepared = await deps.prepare({
    identity: req.identity,
    sessionId: req.sessionId, requestId: req.requestId, ask: req.ask,
    workRef: req.workRef, scopeKind: req.scopeKind, label: req.sectionRef,
    focusContext: materialized.content, sanctuary: req.posture.sanctuary,
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
  const { handoff, result: generating } = deps.generate(prepared, {
    memberId: req.memberId, sessionId: req.sessionId,
    requestId: req.requestId, ask: req.ask, posture: req.posture,
  });

  // ⭐ H1 · Wait for the TRUE handoff — the response-producing call being invoked,
  // not this service being entered. A refusal, an early responder or a throw
  // before the model resolves this false.
  const crossed = await handoff;
  if (!crossed) {
    // ⛔ No crossing, therefore no confirmation. The receipt stays `attempted`.
    void generating;
    return {
      presentation: presentBoundaryOutcome({ kind: 'receipt_refused', outcome: { kind: 'unavailable' } }),
      response: null, disclosureId: null, boundary,
    };
  }

  // ⭐ C3/C6 · Confirm the id that authorized THIS handoff, because the admitted
  // Work entered the response-producing path — not because an answer came back.
  const confirmed = await confirmDisclosureCrossed(boundary.disclosureId);

  // ── 6 · Only now await generation. A failure here leaves a truthful `crossed`.
  const result = await generating;

  return {
    presentation: presentCrossing(confirmed),
    response: result.ok ? result.response ?? null : null,
    disclosureId: boundary.disclosureId,
    boundary,
  };
}
