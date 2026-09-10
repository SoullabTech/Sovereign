/**
 * WS2-05B-8B-02c-2 · ANCHORED ASK MAIA — the conversation endpoint.
 *
 * WHAT THIS ROUTE CANNOT REACH, BY CONSTRUCTION.
 *
 * It does not import `proposalStore` (which exports `updateReviewed`),
 * `structureService` (which writes), or any adoption path. Its reading comes
 * from `lib/manuscript/ask/frozenReading`, whose every statement is a SELECT.
 * That is gate 7 as a property of the module graph rather than a promise in a
 * comment, and `__tests__/askRuntimeCannotWrite.test.ts` asserts it.
 *
 * The only rows this route writes are `ask_threads` and `ask_turns` — the
 * conversation, never the Work.
 *
 * CLOSED AT THE BOUNDARY, like 5b: the whole envelope is parsed and refused
 * whole. A conversation request is not a place to be generous about shape.
 *
 * ZERO BODY READS. No section prose is loaded, sent, or storable here. There is
 * no read-request path in this slice at all — see `askReader`, which sends no
 * tools.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { checkAnchor, type AskAnchor, type AnchorRefusal } from '@/lib/manuscript/ask/anchor';
import {
  loadFrozenReading, loadSectionHeads, measureNow, memberOwnsWork,
} from '@/lib/manuscript/ask/frozenReading';
import { computeStaleness, frozenSideFor } from '@/lib/manuscript/ask/staleness';
import { canonicalFingerprint } from '@/lib/manuscript/structure/canonicalFingerprint';
import { askMaia } from '@/lib/manuscript/ask/askReader';
import {
  openThread, appendTurn, loadThread, threadsOnAnchor,
} from '@/lib/manuscript/ask/threadStore';
import { isHeldRetry, historyFor } from '@/lib/manuscript/ask/retry';
import { checkObservationAnchor, selectObservation } from '@/lib/manuscript/ask/developmentalAnchor';
import { loadFrozenDevelopmentalReading } from '@/lib/manuscript/ask/frozenDevelopmentalReading';
import {
  assembleDevelopmentalContext, developmentalStaleness,
} from '@/lib/manuscript/ask/developmentalContext';
import { askMaiaDevelopmental } from '@/lib/manuscript/ask/developmentalAskReader';
import { loadRevisionContentForCognition, loadLiveWork } from '@/lib/manuscript/development/capture';
import { establishDisclosureBoundary, mayCrossBoundary } from '@/lib/disclosure/disclosureBoundary';
import { confirmDisclosureCrossed } from '@/lib/disclosure/contextDisclosureReceipt';
import { actIdentifiers, isUsableActId } from '@/lib/disclosure/actIdentity';
import { bodyBearingRefs, disclosureMemberKey } from '@/lib/manuscript/development/evidenceRef';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import type { DisclosureLocus } from '@/lib/disclosure/disclosureAuthority';
import { parseSelectionCommission, type SelectionCommission } from '@/lib/manuscript/ask/selectionCommission';
import { selectDevelopmental } from '@/lib/manuscript/ask/developmentalSelector';
/* THE BOUNDARY SEAM, AND NOT THE STANDING STORE. This route does not import
   `currentStandings` and must not: the D5 amendment permits standing to enforce
   eligibility upstream of cognition, through this seam, and the seam returns
   lawful KEYS rather than a standing map. There is no standing value in this
   file to leak into a prompt. */
import { resolveLawfulCandidates } from '@/lib/manuscript/boundary/candidateEligibility';
import { assessReading } from '@/lib/manuscript/developmentalReading/assess';

export const dynamic = 'force-dynamic';

const ANCHOR_STATUS: Record<AnchorRefusal, number> = {
  anchor_requires_reading: 422,
  anchor_reading_mismatch: 409,
  anchor_unresolved: 404,
  anchor_unknown: 422,
};

const MAX_QUESTION = 4000;

/**
 * Closed parse. An unknown key is a refusal, not something to ignore.
 *
 * THE BOUNDARY ACCEPTS ONLY WHAT THIS SLICE HAS PROVED.
 *
 * `AskAnchor` is the CONTRACT vocabulary and knows the whole union; this parser
 * is the RUNTIME boundary and knows only the three kinds 02c-2 actually built:
 * `question`, `uncertainty`, and the truthful `division` conversation. The two
 * are deliberately not the same list.
 *
 * WHY `work` AND `proposal` CAME OUT. A `work` anchor loads no proposal, so a
 * raw POST could open and PERSIST a thread and only then return `no_reading` -
 * an author-originated Work thread entering through HTTP before the slice that
 * defines what such a thread is. The type may know the future union; the
 * boundary must not. `section` and `concern` were never parseable for the same
 * reason.
 *
 * A shape the boundary accepts before its surface exists is a shape nobody has
 * proved, and the row it writes is evidence of a conversation nobody designed.
 */
const SUPPORTED_ANCHORS = ['question', 'uncertainty', 'division'] as const;

function parseAnchor(v: unknown): AskAnchor | null {
  if (typeof v !== 'object' || v === null) return null;
  const o = v as Record<string, unknown>;
  if (!(SUPPORTED_ANCHORS as readonly string[]).includes(o.on as string)) return null;

  const keys = Object.keys(o).sort().join(',');
  const s = (k: string) => typeof o[k] === 'string' && (o[k] as string).length > 0;
  const n = (k: string) => Number.isInteger(o[k]) && (o[k] as number) >= 0;

  switch (o.on) {
    case 'division':
      return keys === 'on,proposalId,unitId' && s('proposalId') && s('unitId')
        ? { on: 'division', proposalId: o.proposalId as string, unitId: o.unitId as string } : null;
    case 'question':
      return keys === 'on,proposalId,questionIndex' && s('proposalId') && n('questionIndex')
        ? { on: 'question', proposalId: o.proposalId as string, questionIndex: o.questionIndex as number } : null;
    case 'uncertainty':
      return keys === 'on,proposalId,regionIndex' && s('proposalId') && n('regionIndex')
        ? { on: 'uncertainty', proposalId: o.proposalId as string, regionIndex: o.regionIndex as number } : null;
    default:
      return null;
  }
}

/**
 * BUILD-07E — the developmental boundary, kept SEPARATE from `parseAnchor`.
 *
 * The structure parser above is untouched by 07E and stays that way: two frozen
 * objects, two boundaries, neither able to admit the other's shape. `observation`
 * is not added to SUPPORTED_ANCHORS, so a developmental anchor can never be
 * approved by the structure path and then resolved against a proposal.
 *
 * v1 IS OBSERVATION-ONLY (founder ruling Q1). There is no reading-level anchor
 * to parse, and the boundary must not know a shape whose surface does not exist.
 */
function parseDevelopmentalAnchor(v: unknown): AskAnchor | null {
  if (typeof v !== 'object' || v === null) return null;
  const o = v as Record<string, unknown>;
  if (o.on !== 'observation') return null;
  const keys = Object.keys(o).sort().join(',');
  const s = (k: string) => typeof o[k] === 'string' && (o[k] as string).length > 0;
  return keys === 'observationKey,on,readingId' && s('readingId') && s('observationKey')
    ? { on: 'observation', readingId: o.readingId as string, observationKey: o.observationKey as string }
    : null;
}

/** Either boundary. Each parser knows only its own object; neither widens the other. */
function parseAnyAnchor(v: unknown): AskAnchor | null {
  return parseAnchor(v) ?? parseDevelopmentalAnchor(v);
}

/** Exported for the boundary test: the runtime surface, not the contract union. */
export const __supportedAnchorsForTest = SUPPORTED_ANCHORS;
export const __parseAnchorForTest = parseAnchor;
export const __parseDevelopmentalAnchorForTest = parseDevelopmentalAnchor;
/* A commission is NOT an anchor. Exported separately for the falsifier that
   asserts it never reached SUPPORTED_ANCHORS or either anchor parser. */
export const __parseSelectionCommissionForTest = parseSelectionCommission;

/**
 * GET — the threads already open on an anchor, so the surface may offer to
 * resume one. Many threads per anchor are lawful; preferring resume over
 * multiplying is presentation policy, not an identity restriction.
 */
export async function GET(
  req: NextRequest, { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  /* OWNERSHIP FIRST, FOR EVERY ANCHOR. Not a consequence of whichever read
     happened to run. See `memberOwnsWork`. */
  if (!(await memberOwnsWork(id, memberId))) {
    return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  }

  const threadId = req.nextUrl.searchParams.get('thread');
  if (threadId) {
    const t = await loadThread(threadId, memberId);
    if (!t || t.manuscriptId !== id) {
      return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
    }
    return NextResponse.json({ thread: t });
  }

  const raw = req.nextUrl.searchParams.get('anchor');
  if (!raw) return NextResponse.json({ refusal: 'malformed', detail: 'anchor' }, { status: 400 });
  let anchor: AskAnchor | null = null;
  try { anchor = parseAnyAnchor(JSON.parse(raw)); } catch { anchor = null; }
  if (!anchor) return NextResponse.json({ refusal: 'anchor_unknown' }, { status: 422 });

  return NextResponse.json({ threads: await threadsOnAnchor(id, memberId, anchor) });
}

/**
 * POST — one author turn, one MAIA answer.
 *
 * Opens the thread if `threadId` is absent. The author's words are recorded
 * BEFORE the model is called, so a transport failure loses the answer and never
 * the question.
 */
export async function POST(
  req: NextRequest, { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  /* OWNERSHIP FIRST, BEFORE ANY READ OR ANY THREAD WRITE. A `work` anchor loads
     no proposal, so without this a request could reach `openThread` having
     proved only that the caller is some member and the id is some Work. */
  if (!(await memberOwnsWork(id, memberId))) {
    return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  }

  let raw: unknown;
  try { raw = await req.json(); } catch {
    return NextResponse.json({ refusal: 'malformed', detail: 'not JSON' }, { status: 400 });
  }
  if (typeof raw !== 'object' || raw === null) {
    return NextResponse.json({ refusal: 'malformed' }, { status: 400 });
  }
  const body = raw as Record<string, unknown>;

  /**
   * ⭐⭐ ACT IDENTITY IS THE CALLER'S, BECAUSE THE CLASSIFICATION IS THE CALLER'S.
   * Only the surface that watched the writer ask knows whether this invocation is
   * that ask again or a new one. Deriving it here per request would make every
   * transport replay a fresh disclosure act — the defect the Focus route carried.
   */
  const actId = body.actId;
  if (!isUsableActId(actId)) {
    return NextResponse.json(
      { refusal: 'malformed', detail: 'actId — one stable id per writer act, reused verbatim on retry' },
      { status: 400 });
  }

  const question = typeof body.question === 'string' ? body.question.trim() : '';
  if (!question) return NextResponse.json({ refusal: 'malformed', detail: 'question' }, { status: 400 });
  if (question.length > MAX_QUESTION) {
    return NextResponse.json({ refusal: 'question_too_long' }, { status: 413 });
  }

  const threadId = typeof body.threadId === 'string' ? body.threadId : null;
  const anchor = threadId ? null : parseAnyAnchor(body.anchor);

  /* SEL-0 — THE SELECTION COMMISSION BRANCH.
     WRITER PRECEDENCE IS ENFORCED BY THIS ORDER AND BY NOTHING ELSE (Q1,
     absolute). The commission is only READ when no anchor was parsed, so a
     request naming an observation cannot reach the selector even if it also
     carries a commission field — the selector is not consulted, rather than
     consulted and then overruled. A resumed thread never selects either: it
     already has its observation, and choosing a second one inside it would
     substitute for an address the writer already made.
     ABSENCE OF AN ANCHOR IS NOT PERMISSION — a commission must be present and
     well-formed in its own right, which is what `parseSelectionCommission`
     refuses to infer from anything else about the request. */
  const commission = threadId || anchor ? null : parseSelectionCommission(body.selectionCommission);
  if (commission) {
    return developmentalSelectionTurn({
      manuscriptId: id, memberId, commission, question, actId,
    });
  }

  if (!threadId && !anchor) {
    return NextResponse.json({ refusal: 'anchor_unknown' }, { status: 422 });
  }

  /* Resume, or open. A resumed thread keeps the anchor and reading it was
     opened on; neither is re-read from the request, so a client cannot re-point
     a conversation by asking a second question with different pointers. */
  const existing = threadId ? await loadThread(threadId, memberId) : null;
  if (threadId && (!existing || existing.manuscriptId !== id)) {
    return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  }
  const effectiveAnchor = existing ? existing.anchor : anchor!;

  /* BUILD-07E — the developmental lane. Everything above is shared (ownership,
     envelope, thread resolution); everything below this branch is the 05B
     structure path, unchanged. The two never meet again: a developmental anchor
     never reaches `loadFrozenReading`, and a structure anchor never reaches
     `loadFrozenDevelopmentalReading`. */
  if (effectiveAnchor.on === 'observation') {
    return developmentalTurn({
      manuscriptId: id, memberId, anchor: effectiveAnchor, existing, question, actId,
    });
  }

  const proposalId = 'proposalId' in effectiveAnchor
    ? (effectiveAnchor as { proposalId: string }).proposalId : null;

  const reading = proposalId
    ? await loadFrozenReading(id, proposalId, memberId) : null;
  if (proposalId && !reading) {
    return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  }

  const check = checkAnchor(effectiveAnchor, reading
    ? { proposalId: reading.proposalId, interpretation: reading.interpretation } : null);
  if (!check.ok) {
    return NextResponse.json({ refusal: check.refusal, detail: check.detail },
      { status: ANCHOR_STATUS[check.refusal] });
  }

  /* Measured, or honestly reported as unmeasured. Never assumed. */
  let canonicalNow: string | null = null;
  try { canonicalNow = await canonicalFingerprint(id); } catch { canonicalNow = null; }
  const now = await measureNow(id, memberId);

  /* NO FABRICATED BASELINE. An earlier draft stored the literal string
     'unmeasured-at-open' when the fingerprint could not be taken, and a real
     fingerprint would later compare unequal to it and report CHANGED - the exact
     defect the three-state shape was corrected to remove, reintroduced through
     the back door. A thread that cannot establish its BEFORE does not open. */
  if (!existing && canonicalNow === null) {
    return NextResponse.json({ refusal: 'canonical_unmeasurable' }, { status: 503 });
  }
  const canonicalAtOpen = existing ? existing.canonicalAtOpen : canonicalNow!;

  /* FROZEN COMES FROM THE THREAD, CURRENT FROM THE FRESH LOAD.
     Taking both sides from the freshly loaded proposal compared the current
     revision to itself, so editing the reviewed structure while a thread was
     open still reported `unchanged`. The thread already stores what the author
     was looking at; that is the only honest `was`. */
  /* The stored identity is a union since 07E. Only a structure identity is the
     `was` of a structure comparison; a developmental one cannot reach here
     (the branch above returned), and narrowing says so rather than casting. */
  const storedStructure = existing?.reading && existing.reading.kind !== 'developmental'
    ? existing.reading : null;

  const frozenIdentity = frozenSideFor({
    stored: storedStructure,
    fresh: reading ? {
      proposalId: reading.proposalId,
      interpretationInputHash: reading.interpretationInputHash,
      sectionTopologyHash: reading.sectionTopologyHash,
      reviewRevision: reading.reviewRevision,
    } : null,
  });

  const staleness = computeStaleness({
    frozen: frozenIdentity ? {
      interpretationInputHash: frozenIdentity.interpretationInputHash,
      sectionTopologyHash: frozenIdentity.sectionTopologyHash,
      reviewRevision: frozenIdentity.reviewRevision,
    } : null,
    canonicalAtOpen,
    now: { ...now, reviewRevision: reading?.reviewRevision ?? null, canonicalFingerprint: canonicalNow },
    frozenProposalId: frozenIdentity?.proposalId ?? null,
  });

  const liveThreadId = existing ? existing.id : await openThread({
    manuscriptId: id,
    memberId,
    anchor: check.anchor,
    reading: reading ? {
      proposalId: reading.proposalId,
      interpretationInputHash: reading.interpretationInputHash,
      sectionTopologyHash: reading.sectionTopologyHash,
      reviewRevision: reading.reviewRevision,
      readerProvenance: reading.readerProvenance,
    } : null,
    canonicalAtOpen,
    /* The author is the one who opened their mouth. That the marker was one of
       MAIA's questions is carried by the ANCHOR, not by pretending she spoke. */
    initiatedBy: 'author',
  });

  /* A RETRY OF A HELD QUESTION REUSES THE TURN IT IS RETRYING. Appending again
     would put the same words on the thread twice and — because prior turns are
     replayed as history while the question is sent separately — hand MAIA the
     same question twice in one request. A reworded question is a new turn. */
  const priorTurns = existing?.turns ?? [];
  const retryingHeld = isHeldRetry(priorTurns, question);
  if (!retryingHeld) {
    await appendTurn({
      threadId: liveThreadId, memberId, speaker: 'author', body: question, staleness,
    });
  }

  if (!reading) {
    /* UNREACHABLE WHILE THE BOUNDARY ACCEPTS ONLY PROPOSAL-BEARING ANCHORS, and
       kept for exactly that reason: it is the honest answer the day a
       reading-less anchor is added, and deleting it would mean the first such
       anchor arrives at a route with no opinion about having nothing to read. */
    return NextResponse.json({ threadId: liveThreadId, refusal: 'no_reading' }, { status: 422 });
  }

  const outcome = await askMaia(
    {
      anchor: check.anchor,
      interpretation: reading.interpretation,
      evidence: reading.evidence,
      coverage: reading.coverage,
      reviewed: reading.reviewed,
      reviewRevision: reading.reviewRevision,
      sections: await loadSectionHeads(id, memberId),
      staleness,
    },
    /* The held turn is dropped from history because `question` carries it. */
    historyFor(priorTurns.map((t) => ({ speaker: t.speaker, body: t.body })), question),
    question,
  );

  if (!outcome.ok) {
    /* The question is already recorded. A failed answer is reported as a
       failure, never rendered as one of hers. */
    return NextResponse.json({ threadId: liveThreadId, refusal: outcome.refusal, staleness },
      { status: 502 });
  }

  await appendTurn({
    threadId: liveThreadId, memberId, speaker: 'maia', body: outcome.answer,
    staleness, answerProvenance: outcome.provenance,
  });

  const thread = await loadThread(liveThreadId, memberId);
  return NextResponse.json({ threadId: liveThreadId, thread, staleness });
}

/**
 * BUILD-07E — one author turn, one MAIA answer, anchored to one observation.
 *
 * SEPARATE FROM THE STRUCTURE FLOW, sharing only what is genuinely one thing:
 * ownership, the envelope, thread resolution, the append-only turn record, and
 * the canonical baseline. The reading, the coherence rule, the context and the
 * reader are all the developmental object's own — because sharing them would
 * mean a function holding both frozen objects, and that function is exactly
 * where one reading's authority gets laundered onto another's content.
 *
 * ORDER MATTERS AND IS THE STRUCTURE PATH'S ORDER. The author's words are
 * recorded BEFORE the model is called, so a transport failure loses the answer
 * and never the question.
 *
 * A SUPERSEDED OBSERVATION OPENS (founder ruling Q3). It opens AS superseded:
 * the location travels to the reader, which says what moved, and back to the
 * surface in the response, which shows it. Refusing would erase a legitimate
 * historical relationship with the Work; opening silently would present an old
 * observation as current.
 */
async function developmentalTurn(input: {
  manuscriptId: string;
  memberId: string;
  anchor: Extract<AskAnchor, { on: 'observation' }>;
  existing: Awaited<ReturnType<typeof loadThread>>;
  question: string;
  /** ⭐ The writer's act, named by the surface that saw it. Never invented here. */
  actId: string;
}) {
  const { manuscriptId, memberId, anchor, existing, question, actId } = input;

  const reading = await loadFrozenDevelopmentalReading(manuscriptId, anchor.readingId, memberId);
  const check = checkObservationAnchor(anchor, reading);
  if (!check.ok) {
    return NextResponse.json({ refusal: check.refusal, detail: check.detail },
      { status: ANCHOR_STATUS[check.refusal] });
  }
  /* `checkObservationAnchor` has already established both. The non-null
     assertions restate what it proved rather than re-deriving it here. */
  const observation = selectObservation(reading!, anchor.observationKey)!;

  let canonicalNow: string | null = null;
  try { canonicalNow = await canonicalFingerprint(manuscriptId); } catch { canonicalNow = null; }

  /* NO FABRICATED BASELINE — the structure path's ruling, and the same reason:
     a thread that cannot establish its BEFORE does not open. */
  if (!existing && canonicalNow === null) {
    return NextResponse.json({ refusal: 'canonical_unmeasurable' }, { status: 503 });
  }
  const canonicalAtOpen = existing ? existing.canonicalAtOpen : canonicalNow!;

  /* ⭐⭐ THE DISCLOSURE BOUNDARY. This observation's prose-bearing evidence is
     what will cross, so the authority is established — and the receipt minted —
     BEFORE any authored character is loaded for cognition.

     ⛔ ONE HANDOFF IS ONE ACT. Several refs, possibly non-adjacent, are ONE
     disclosure with `scope_kind = evidence_set`, never N receipts. The capability
     knows exact membership because applicability is enforced at the load; the
     receipt records only that the composite disclosure occurred.

     ⭐ Membership is canonical and order-independent — authority answers what may
     cross. The live `evidenceRefs` array keeps its own order for rendering,
     because ordering answers how what crossed is presented. */
  const proseRefs = bodyBearingRefs(observation.evidenceRefs);
  const members = proseRefs.map(disclosureMemberKey).filter((k): k is string => k !== null);

  const locus: DisclosureLocus | null =
    members.length === 0
      ? null
      : members.length === 1 && proseRefs[0].kind === 'section'
        ? { scopeKind: 'section', sectionRef: proseRefs[0].sectionId }
        : members.length === 1 && proseRefs[0].kind === 'passage'
          ? { scopeKind: 'passage', sectionRef: proseRefs[0].sectionId, range: proseRefs[0].range }
          : { scopeKind: 'evidence_set', members };

  const { requestId, disclosureId } = actIdentifiers(actId);
  const posture = TurnPosture.resolve({ userId: memberId });

  /* An observation resting on no prose discloses nothing — it reaches cognition
     as observation and refusal, exactly as an unverifiable ref already does. No
     boundary is established for a crossing that does not occur. */
  const boundary = locus === null ? null : await establishDisclosureBoundary({
    requestId, posture, memberId, sessionId: null, disclosureId,
    boundary: 'manuscript_prose->maia_cognition',
    sourceClass: 'work',
    participationBasis: 'member_invoked',
    workRef: manuscriptId,
    locus,
    gesture: 'ask_maia',
  });

  if (boundary !== null && !mayCrossBoundary(boundary)) {
    /* ⛔ NO SCOPE SUBSTITUTION. The turn does not quietly proceed without the
       evidence it was supposed to rest on — that would be MAIA reasoning about a
       passage she was refused. */
    return NextResponse.json({ refusal: 'disclosure_unavailable' }, { status: 503 });
  }

  /* The revision the reading FROZE, not the newest. `recoverEvidence` verifies
     it against the frozen digest before slicing, so a wrong or moved revision
     yields a refusal and no text — never a substitution. */
  const disclosure = boundary === null ? null : await loadRevisionContentForCognition(
    boundary.authority,
    { memberId, workRef: manuscriptId, locus: locus! },
    reading!.readState.draftId, reading!.readState.revisionNumber,
  );
  const revisionContent = disclosure?.kind === 'disclosed' ? disclosure.content : null;
  const now = await loadLiveWork(manuscriptId, memberId);

  const ctx = assembleDevelopmentalContext({
    reading: reading!, observation, revisionContent, now,
  });
  const staleness = developmentalStaleness(
    ctx,
    canonicalNow === null ? { state: 'unmeasured' }
      : canonicalAtOpen === canonicalNow ? { state: 'unchanged' } : { state: 'changed' });

  const liveThreadId = existing ? existing.id : await openThread({
    manuscriptId,
    memberId,
    anchor: check.anchor,
    reading: {
      kind: 'developmental',
      readingId: reading!.id,
      draftId: reading!.readState.draftId,
      revisionNumber: reading!.readState.revisionNumber,
      inputFingerprint: reading!.readState.inputFingerprint,
      commissionedLens: reading!.scope.commissionedLens,
      readerProvenance: reading!.provenance.reader,
    },
    canonicalAtOpen,
    /* The author opened their mouth. That the marker was one of MAIA's
       observations is carried by the ANCHOR, not by pretending she spoke. */
    initiatedBy: 'author',
  });

  const priorTurns = existing?.turns ?? [];
  const retryingHeld = isHeldRetry(priorTurns, question);
  if (!retryingHeld) {
    await appendTurn({
      threadId: liveThreadId, memberId, speaker: 'author', body: question, staleness,
    });
  }

  /* ⭐⭐ THE HANDOFF SEAM. Generation begins here and is deliberately NOT awaited
     yet, so the receipt is confirmed at the moment of crossing rather than on an
     answer. `onHandoff` fires inside the provider, immediately before the request
     leaves the process; `.finally` settles false if the call completes without
     ever dispatching — a refusal, a missing client, a throw.

       handoff fails                  → receipt stays `attempted`
       handoff succeeds, answer fails → receipt stays `crossed`

     ⛔ A generation failure after handoff does NOT mean the Work never crossed.
     Response success is not disclosure evidence — handoff is. */
  let signalled = false;
  let settle!: (v: boolean) => void;
  const handoff = new Promise<boolean>((r) => { settle = r; });
  const generating = askMaiaDevelopmental(
    ctx,
    historyFor(priorTurns.map((t) => ({ speaker: t.speaker, body: t.body })), question),
    question,
    { onHandoff: () => { signalled = true; settle(true); } },
  ).finally(() => { if (!signalled) settle(false); });

  const crossed = await handoff;
  if (crossed && boundary !== null) {
    /* Confirm the id that authorized THIS handoff, because the authorized prose
       entered the response-producing path. ⛔ A pre-handoff failure leaves the
       receipt `attempted`, which is the truthful state — and does NOT make its
       capability resumable: a later deliberate retry is a new authority act. */
    await confirmDisclosureCrossed(boundary.disclosureId);
  }

  const outcome = await generating;

  if (!outcome.ok) {
    /* The question is already recorded. A failed answer is reported as a
       failure, never rendered as one of hers. */
    return NextResponse.json(
      { threadId: liveThreadId, refusal: outcome.refusal, staleness, location: ctx.location },
      { status: 502 });
  }

  await appendTurn({
    threadId: liveThreadId, memberId, speaker: 'maia', body: outcome.answer,
    staleness, answerProvenance: outcome.provenance,
  });

  const thread = await loadThread(liveThreadId, memberId);
  return NextResponse.json({
    threadId: liveThreadId,
    thread,
    staleness,
    /* The developmental lane's PRIMARY vocabulary travels to the surface intact.
       Collapsing it into `staleness` alone would hand the room five structure
       dimensions and no answer to the question it actually has to render:
       is what she noticed still true of this Work? */
    location: ctx.location,
    observation: {
      key: ctx.observation.key,
      lens: ctx.reading.lens,
      frozenAt: ctx.reading.frozenAt,
      unverifiableEvidence: ctx.evidence.filter((e) => e.kind === 'unverifiable').length,
    },
  });
}

/**
 * SEL-0 — MAIA choosing what to raise, on the writer's explicit commission.
 *
 * THIS IS THE REAL STUDIO PATH. The boundary and the selector run here, in the
 * ask route, and the observation the selector chooses is handed straight to
 * `developmentalTurn` — the same function that serves an observation the writer
 * named. What reaches the room is one observation in an ordinary ask thread,
 * with ordinary turns, ordinary staleness and ordinary provenance. Nothing
 * about the conversation is a selection surface.
 *
 * THE ORDER IS THE CONTRACT'S ORDER: boundary, then set, then selector. The
 * selector is NOT INVOKED when a gate fires. A gate is a 200 carrying a named
 * state, not an error — *"there is nothing I may raise"* is a true answer to
 * the question the writer asked.
 *
 * ⛔ STANDING NEVER APPEARS IN THIS FUNCTION. It is read inside the boundary
 * seam and reduced there to the set of keys it excludes; what comes back is a
 * list of lawful keys. So there is no standing value here to pass on, log, or
 * accidentally include — the D5 amendment is satisfied by the absence of the
 * data rather than by discipline about it.
 *
 * ⛔ THE ORDERING NEVER LEAVES THIS FUNCTION. `ordering[0]` becomes the offered
 * observation; the rest is discarded with the request. Confidence is never
 * returned. §2.7 forbids the room a ranked list and §2.6 forbids it a number,
 * and the way to guarantee that is to never send either.
 */
async function developmentalSelectionTurn(input: {
  manuscriptId: string;
  memberId: string;
  commission: SelectionCommission;
  question: string;
  actId: string;
}) {
  const { manuscriptId, memberId, commission, question, actId } = input;

  const reading = await loadFrozenDevelopmentalReading(
    manuscriptId, commission.readingId, memberId);
  if (!reading || reading.outcome !== 'reading') {
    return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  }

  /* The frozen reading against the Work as it now stands — the only comparison
     that establishes supersession. A failure to load the live Work surfaces as
     `unmeasured` and is caught by the first gate; it is never absorbed. */
  const now = await loadLiveWork(manuscriptId, memberId);
  const assessment = assessReading(reading, now);

  let boundary;
  try {
    boundary = await resolveLawfulCandidates({
      memberId, reading, assessment, offered: new Set(commission.offered),
    });
  } catch {
    /* THE STANDING READ THREW, AND THAT IS NOT "NOTHING IS DISMISSED".
       `currentStandings` throws rather than returning an empty result for
       exactly this reason. Selecting from a candidate set built on an unread
       boundary would let an infrastructure failure quietly re-offer something
       the writer dismissed. */
    return NextResponse.json(
      { selection: { commissionId: commission.commissionId, refusal: 'boundary_unreadable' } },
      { status: 503 });
  }

  if (boundary.gate !== null) {
    return NextResponse.json(
      { selection: { commissionId: commission.commissionId, gate: boundary.gate } },
      { status: 200 });
  }

  const candidates = reading.observations.filter((o) => boundary.lawfulKeys.includes(o.key));

  /* Permitted input (§2.4, unaffected by the D5 amendment), read through the
     existing thread reader rather than a second query written for the selector.
     An observation the writer already opened a conversation about is a fact
     about THEIR act, not a standing and not a usage signal. */
  const openThreads = new Set<string>();
  for (const o of candidates) {
    const threads = await threadsOnAnchor(manuscriptId, memberId, {
      on: 'observation', readingId: reading.id, observationKey: o.key,
    });
    if (threads.length > 0) openThreads.add(o.key);
  }

  const result = await selectDevelopmental({
    candidates,
    writerTurn: question,
    commissionedLens: reading.scope.commissionedLens,
    withStructure: reading.scope.withStructure,
    sectionsRead: reading.scope.bodyScope.length,
    revisionNumber: reading.readState.revisionNumber,
    openThreads,
  });

  if (result.kind === 'unreachable') {
    /* NOT A DECLINE. A transport or format failure must never be rendered to
       the writer as MAIA's developmental restraint. */
    return NextResponse.json(
      { selection: { commissionId: commission.commissionId, refusal: 'unreachable' } },
      { status: 502 });
  }

  if (result.kind === 'decline') {
    /* Terminal within this commission (§2.6): the inputs are unchanged by a
       decline, so a subsequent "what else?" would deterministically decline
       again. The room is told so rather than invited to retry. */
    return NextResponse.json(
      { selection: { commissionId: commission.commissionId, outcome: 'decline', terminal: true } },
      { status: 200 });
  }

  const chosen = result.ordering[0]!;

  /* ONE OBSERVATION, THROUGH THE ORDINARY PATH. The synthesized anchor is the
     same shape the writer's own address produces, so the thread MAIA opens is
     indistinguishable from one they opened themselves — which is what makes
     this a conversation rather than a recommendation. */
  const turn = await developmentalTurn({
    manuscriptId,
    memberId,
    actId,
    anchor: { on: 'observation', readingId: reading.id, observationKey: chosen },
    existing: null,
    question,
  });

  const turnBody = await turn.json().catch(() => ({}));
  return NextResponse.json(
    {
      ...(turnBody as Record<string, unknown>),
      selection: {
        commissionId: commission.commissionId,
        outcome: 'offered',
        observationKey: chosen,
        /* What the room carries back on "what else?" so the next offer
           advances. Commission-scoped by construction: a new commissionId
           starts from an empty record and cannot inherit this one. */
        offered: [...commission.offered, chosen],
      },
    },
    { status: turn.status });
}
