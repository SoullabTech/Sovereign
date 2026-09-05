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
import { loadRevisionContent, loadLiveWork } from '@/lib/manuscript/development/capture';

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

  const question = typeof body.question === 'string' ? body.question.trim() : '';
  if (!question) return NextResponse.json({ refusal: 'malformed', detail: 'question' }, { status: 400 });
  if (question.length > MAX_QUESTION) {
    return NextResponse.json({ refusal: 'question_too_long' }, { status: 413 });
  }

  const threadId = typeof body.threadId === 'string' ? body.threadId : null;
  const anchor = threadId ? null : parseAnyAnchor(body.anchor);
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
      manuscriptId: id, memberId, anchor: effectiveAnchor, existing, question,
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
}) {
  const { manuscriptId, memberId, anchor, existing, question } = input;

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

  /* The revision the reading FROZE, not the newest. `recoverEvidence` verifies
     it against the frozen digest before slicing, so a wrong or moved revision
     yields a refusal and no text — never a substitution. */
  const revisionContent = await loadRevisionContent(
    reading!.readState.draftId, reading!.readState.revisionNumber);
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

  const outcome = await askMaiaDevelopmental(
    ctx,
    historyFor(priorTurns.map((t) => ({ speaker: t.speaker, body: t.body })), question),
    question,
  );

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
