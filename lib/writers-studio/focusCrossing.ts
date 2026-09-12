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
import {
  focusParticipation, type FocusMemberStatus, type FocusParticipation,
} from './focusParticipation';
import {
  completeFocusCrossingAct, openFocusCrossingAct, type FocusActMember,
} from './focusCrossingAct';

/**
 * Reads ONE authorized member. ⛔ Called only after that member's `may_cross`.
 *
 * ⭐ ONE MEMBER, ONE CALL, ONE RESULT — never a joined blob. A member whose body
 * cannot be read returns null and becomes `unavailable` in the participation:
 * the writer still declared attention there, so the member does not vanish.
 */
export interface FocusAssembler {
  (ref: {
    memberId: string; workRef: string;
    scopeKind: DisclosureScopeKind; sectionRef?: string;
    /** The writer's selection. Carried in the REQUEST; never in the receipt. */
    range?: { start: number; end: number };
  }): Promise<string | null>;
}

/** One declared place in the writer's attention, as the route received it. */
export interface FocusMemberScope {
  readonly focusMemberId: string;
  readonly sectionRef: string;
  /** Present for a passage member; absent for a whole-section member. */
  readonly range?: { start: number; end: number };
  /**
   * ⭐ Ruled 2026-09-12: an `unverified` anchor's CURRENT TEXT must not cross.
   * Such a member is declared to MAIA and never read. The route decides this
   * from anchor currency; the crossing obeys it and reads nothing.
   */
  readonly readable: boolean;
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
  /** ⭐ ONE HTTP request. A retry mints a new one; it does NOT make a new act. */
  requestId: string;
  /**
   * ⭐⭐ THE WRITER'S GESTURE, durable across retries.
   *
   *   one writer gesture → one act identity → N member disclosures
   *     → one canonical MAIA handoff
   *
   * ⛔ NOT MINTED HERE. A crossing that minted its own act identity would make
   * a retried request look like a second act, and the writer would acquire a
   * disclosure history for an act they performed once.
   */
  actId: string;
  /** ⭐ Minted by `resolveCanonicalIdentity` at the route. A raw id is refused
   *  by `constructCanonicalTurn`, and rightly: one identity truth, not two. */
  identity: MemberIdentity;
  posture: TurnPosture;
  memberId: string;
  sessionId: string;
  workRef: string;
  /** The declared attention. ⛔ Every member crosses at SECTION scope or not at all. */
  members: readonly FocusMemberScope[];
  /**
   * Which member is in hand. ⛔ Confers NO additional disclosure authority — it
   * lives on the act, never on a receipt, because a receipt answers what
   * material was authorized to cross and this answers what we are acting on.
   */
  activeMemberId: string | null;
  gesture: DisclosureGesture;
  ask: string;
}

export type FocusCrossingResult = {
  readonly presentation: FocusDisclosurePresentation;
  readonly response: string | null;
  /** ⭐ The ids that authorized the handoff — and, when confirmed, the ones confirmed. */
  readonly disclosureIds: readonly string[];
  /** Retained for the single-member shape the surface still reads. */
  readonly disclosureId: string | null;
  readonly boundary: BoundaryOutcome;
  /** What MAIA was actually given, so the surface can say it too. */
  readonly participation: FocusParticipation | null;
  /**
   * ⛔ `contradiction` is NOT a failure of the crossing — it is the record
   * refusing to let one actId describe two different acts. The crossing did not
   * happen, and the reason is that the request disagreed with the act it
   * claimed to be retrying.
   */
  readonly act: 'opened' | 'continued' | 'contradiction' | 'unrecorded' | null;
};

export async function performFocusCrossing(
  req: FocusCrossingRequest,
  deps: { assemble: FocusAssembler; prepare: CanonicalCognitionPort['prepare']; generate: CanonicalCognitionPort['generate'] },
): Promise<FocusCrossingResult> {
  const refused = (b: BoundaryOutcome, p?: FocusDisclosurePresentation): FocusCrossingResult => ({
    presentation: p ?? presentBoundaryOutcome(b),
    response: null, disclosureIds: [], disclosureId: null, boundary: b,
    participation: null, act: null,
  });
  const unavailable: BoundaryOutcome = { kind: 'receipt_refused', outcome: { kind: 'unavailable' } };

  /* ── 1 · ⭐⭐ EVERY BOUNDARY BEFORE ANY BODY IS READ.
     Ported verbatim in law from the developmental Ask path, which has walked it
     green. Boundary establishment is NOT disclosure completion: a boundary that
     succeeds inside a multi-boundary attempt stays `attempted` until the ONE
     authorized handoff occurs, so a later refusal never promotes an earlier
     success. Those attempted rows are truthful evidence that a crossing may
     have occurred and was not confirmed.

     ⛔ ONE SERVING REQUEST FOR THE WHOLE EXECUTION. Every member's receipt
     shares `req.requestId`, so an auditor grouping by it sees ONE member act
     carrying N independently section-scoped crossings. That is not a
     multi-member authority token: authority stays member-scoped, and what is
     shared is the request, never the permission.

     ⛔ AND ONLY READABLE MEMBERS ACQUIRE A BOUNDARY. An `unverified` member is
     declared attention, not authorized content: establishing a boundary for one
     would mint a receipt for material the ruling says must not cross. */
  const established: { member: FocusMemberScope; disclosureId: string }[] = [];
  let first: BoundaryOutcome | null = null;

  for (const member of req.members) {
    if (!member.readable) continue;
    const boundary = await establishDisclosureBoundary({
      requestId: req.requestId,
      posture: req.posture,
      memberId: req.memberId,
      sessionId: req.sessionId,
      disclosure: {
        /* ⭐ A NEW disclosure identity per member per act — never reused, so an
           unresolved prior attempt can never be replayed as though it were this
           one. ⛔ Minted by the ROUTE, not here: see `FocusMemberScope`. */
        disclosureId: `${req.actId}:${member.focusMemberId}`,
        boundary: 'writers_studio.focus->maia_cognition',
        sourceClass: 'work',
        participationBasis: 'member_invoked',
        sourceRef: req.workRef,
        /* ⛔ F10 · SECTION SCOPE, ALWAYS. `whole_work` is gone from this path:
           a distributed Focus Set performed as one whole-Work disclosure is
           silent authority widening wearing the shape of convenience. */
        scopeKind: 'section',
        sectionRef: member.sectionRef,
        gesture: req.gesture,
      },
    });
    first ??= boundary;
    if (!mayCrossBoundary(boundary)) {
      /* ⛔ C4 · NO SCOPE SUBSTITUTION, and now also NO PARTIAL SET. One member
         refused refuses the crossing: proceeding with the rest would silently
         narrow the writer's declared attention to whatever happened to be
         permitted, which is the widening defect in its mirror. */
      return refused(boundary);
    }
    established.push({ member, disclosureId: boundary.disclosureId });
  }

  const boundary = first ?? unavailable;

  /* ── 2 · ONLY NOW are the bodies read. C2 depends on this ordering.
     One call per member — ⛔ never a joined read, because a joined read has no
     member boundaries to lose them at. */
  const bodies = new Map<string, string>();
  for (const { member } of established) {
    const text = await deps.assemble({
      memberId: req.memberId, workRef: req.workRef,
      scopeKind: 'section', sectionRef: member.sectionRef, range: member.range,
    });
    if (text !== null) bodies.set(member.focusMemberId, text);
  }

  /* ⭐⭐ THE PARTICIPATION — five memberships, three bodies, and MAIA told both.
     A member declared but not read does not disappear here; it becomes
     `unverified` (the writer's anchor needs confirming) or `unavailable` (it
     was authorized and could not be read). Either way its existence crosses and
     its content does not. */
  let participation: FocusParticipation;
  try {
    participation = focusParticipation({
      members: req.members.map((m, i) => {
        const content = bodies.get(m.focusMemberId);
        const status: FocusMemberStatus = !m.readable ? 'unverified'
          : content === undefined ? 'unavailable' : 'readable';
        return {
          focusMemberId: m.focusMemberId, ordinal: i + 1, sectionRef: m.sectionRef,
          status, active: false, bodyAvailable: content !== undefined,
          ...(status === 'readable' ? { content } : {}),
        };
      }),
      activeMemberId: req.activeMemberId,
    });
  } catch {
    /* ⛔ The participation contract refuses rather than repairs, and so does
       this. A set that cannot be constructed truthfully is not crossed at all. */
    return refused(unavailable);
  }

  /* ⛔ Nothing readable means nothing to hand over. The receipts stay
     `attempted`, which is the truthful state: authorization existed, the
     crossing did not. */
  if (participation.readable === 0) return refused(unavailable);

  /* ── ⭐⭐ 3 · THE WRITER'S ACT, RECORDED BEFORE THE TURN.
     Without this the system can perform the right crossing and be unable to
     answer, afterwards, what the crossing was OF — which is exactly what a
     RevisionProposal will need to point back to.

     ⭐ It is opened HERE, after the participation is settled and before any
     cognition, so the record describes the attention as it actually stood at
     the moment of asking.

     ⛔ A CONTRADICTION STOPS THE CROSSING. One actId describing two different
     acts is not a retry, and continuing would produce a MAIA turn whose
     provenance says something the writer never asked. Receipts stay
     `attempted`, which is truthful: authorization existed, the crossing did not. */
  const actMembers: FocusActMember[] = participation.members.map((m) => ({
    focusMemberId: m.focusMemberId,
    ordinal: m.ordinal,
    currencyState: m.status === 'readable' ? 'current' : m.status,
    bodyAvailable: m.bodyAvailable,
    disclosureReceiptId: m.bodyAvailable
      ? established.find((e) => e.member.focusMemberId === m.focusMemberId)?.disclosureId ?? null
      : null,
  }));
  const act = await openFocusCrossingAct({
    actId: req.actId, memberId: req.memberId, workId: req.workRef,
    members: actMembers, activeMemberId: req.activeMemberId,
  });
  if (act.kind === 'contradiction' || act.kind === 'refused') {
    return { ...refused(unavailable), act: 'contradiction' };
  }
  if (act.kind === 'unavailable') {
    /* ⛔ An unrecordable act must not become an unrecorded crossing. The record
       is the only thing that can later say what was attended to, and a turn
       produced without it is a turn nothing can account for. */
    return { ...refused(unavailable), act: 'unrecorded' };
  }

  // ── 4 · CONSTRUCT · ADJUDICATE · RENDER. Everything before the model.
  const prepared = await deps.prepare({
    identity: req.identity,
    sessionId: req.sessionId, requestId: req.requestId, ask: req.ask,
    workRef: req.workRef, participation, sanctuary: req.posture.sanctuary,
  });
  if (!prepared) return refused(unavailable);

  // ── 5 · THE HANDOFF. ⭐ F8 · ONE gesture, ONE canonical turn — not one per
  // member. Generation BEGINS here; the promise is deliberately not awaited yet,
  // so the receipts are confirmed at the moment of crossing.
  const { handoff, result: generating } = deps.generate(prepared, {
    memberId: req.memberId, sessionId: req.sessionId,
    requestId: req.requestId, ask: req.ask, posture: req.posture,
  });

  // ⭐ H1 · Wait for the TRUE handoff — the response-producing call being invoked.
  const crossed = await handoff;
  if (!crossed) {
    void generating;
    return refused(unavailable);
  }

  /* ⭐ C3/C6 · ONE HANDOFF HAPPENED, so every member scope it carried is now
     genuinely crossed. N receipts, one execution — the receipts record WHICH
     scopes crossed, and authorize nothing else.
     ⛔ Only the members whose bodies actually reached the producer are
     confirmed: an authorized member whose read failed never crossed. */
  const confirmedIds: string[] = [];
  let allConfirmed = true;
  for (const { member, disclosureId } of established) {
    if (!bodies.has(member.focusMemberId)) continue;
    const ok = await confirmDisclosureCrossed(disclosureId);
    /* ⛔ A confirmation that did not take is not silently dropped: the crossing
       DID occur, and a receipt that failed to record it is a gap in the
       evidence, which the presentation must not describe as a clean crossing. */
    if (!ok) allConfirmed = false;
    else confirmedIds.push(disclosureId);
  }

  /* ⭐ A8/A9 · the act names the ONE turn it produced. A second, different turn
     on this act refuses — which is how the record stays able to say that this
     conversation was this gesture's conversation. */
  await completeFocusCrossingAct(req.actId, prepared.turn.turnId);

  // ── 6 · Only now await generation. A failure here leaves truthful `crossed` rows.
  const result = await generating;

  return {
    presentation: presentCrossing(allConfirmed && confirmedIds.length > 0),
    response: result.ok ? result.response ?? null : null,
    disclosureIds: confirmedIds,
    disclosureId: confirmedIds[0] ?? null,
    boundary,
    participation,
    act: act.kind === 'opened' ? 'opened' : 'continued',
  };
}
