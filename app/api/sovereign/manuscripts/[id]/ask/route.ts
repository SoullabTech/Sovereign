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

export const dynamic = 'force-dynamic';

const ANCHOR_STATUS: Record<AnchorRefusal, number> = {
  anchor_requires_reading: 422,
  anchor_reading_mismatch: 409,
  anchor_unresolved: 404,
  anchor_unknown: 422,
};

const MAX_QUESTION = 4000;

/** Closed parse. An unknown key is a refusal, not something to ignore. */
function parseAnchor(v: unknown): AskAnchor | null {
  if (typeof v !== 'object' || v === null) return null;
  const o = v as Record<string, unknown>;
  const keys = Object.keys(o).sort().join(',');
  const s = (k: string) => typeof o[k] === 'string' && (o[k] as string).length > 0;
  const n = (k: string) => Number.isInteger(o[k]) && (o[k] as number) >= 0;

  switch (o.on) {
    case 'work':
      return keys === 'on' ? { on: 'work' } : null;
    case 'proposal':
      return keys === 'on,proposalId' && s('proposalId')
        ? { on: 'proposal', proposalId: o.proposalId as string } : null;
    case 'division':
      return keys === 'on,proposalId,unitId' && s('proposalId') && s('unitId')
        ? { on: 'division', proposalId: o.proposalId as string, unitId: o.unitId as string } : null;
    case 'question':
      return keys === 'on,proposalId,questionIndex' && s('proposalId') && n('questionIndex')
        ? { on: 'question', proposalId: o.proposalId as string, questionIndex: o.questionIndex as number } : null;
    case 'uncertainty':
      return keys === 'on,proposalId,regionIndex' && s('proposalId') && n('regionIndex')
        ? { on: 'uncertainty', proposalId: o.proposalId as string, regionIndex: o.regionIndex as number } : null;
    /* `section` and `concern` are NOT parseable in 02c-2. Author-originated
       section-level concerns are a later slice, and a shape the boundary accepts
       before the surface exists is a shape nobody has proved. */
    default:
      return null;
  }
}

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
  try { anchor = parseAnchor(JSON.parse(raw)); } catch { anchor = null; }
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
  const anchor = threadId ? null : parseAnchor(body.anchor);
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
  const frozenIdentity = frozenSideFor({
    stored: existing?.reading ?? null,
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
    /* No reading, no frozen material to answer from. 02c-2 has no author-
       originated slice yet, so this is unreachable from the surface; refusing is
       still the honest answer rather than inventing context. */
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
