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
 * ⚠️ THE ASK LIBRARY writes only `ask_threads` and `ask_turns` — the
 * conversation, never the Work; `askRuntimeCannotWrite` asserts that over
 * `lib/manuscript/ask`, and it stays true.
 *
 * ⛔ THE ROUTE IS NO LONGER THAT NARROW, and saying otherwise would be false.
 * Under S3 it also causes writes, through `lib/disclosure`, to the authorization
 * opportunity, its consumption, the consent state and the disclosure receipts.
 * ⭐ None of them is the Work: every one is a record of AUTHORITY, and the Work
 * itself is still only ever read.
 *
 * CLOSED AT THE BOUNDARY, like 5b: the whole envelope is parsed and refused
 * whole. A conversation request is not a place to be generous about shape.
 *
 * ZERO BODY READS ON THE STRUCTURE PATH. No section prose is loaded, sent, or
 * storable there — see `askReader`, which sends no tools.
 *
 * ⭐ S3 · THE DEVELOPMENTAL PATH READS BODY ONLY UNDER FRESH SECTION AUTHORITY.
 * `loadRevisionContent` is reachable from exactly one place in this file, and
 * only after: the requirement was derived SERVER-SIDE from the observation's own
 * evidence refs · the member's explicit act covered it · a single-use
 * authorization opportunity was ATOMICALLY consumed · the consumed opportunity's
 * coordinates matched this exact Ask · and every required section minted a
 * disclosure boundary that returned `may_cross`.
 * ⛔ No other branch loads body. ⛔ A client's account of what it needs never
 * widens what crosses.
 *
 * ⭐ AND AFTER COGNITION, THE THREE RECORDS ARE ONE RECORD. The persisted turn,
 * the confirmation of every crossing, and the completion of the consumed
 * opportunity commit in a single transaction or not at all. ⛔ That transaction
 * supplies ATOMICITY, NEVER AUTHORITY — it opens after the body has already
 * crossed, and the claim it accounts for was won long before it.
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
  openThread, appendTurn, appendTurnWithClient, loadThread, threadsOnAnchor,
} from '@/lib/manuscript/ask/threadStore';
import { isHeldRetry, historyFor } from '@/lib/manuscript/ask/retry';
import { checkObservationAnchor, selectObservation } from '@/lib/manuscript/ask/developmentalAnchor';
import { loadFrozenDevelopmentalReading } from '@/lib/manuscript/ask/frozenDevelopmentalReading';
import {
  assembleDevelopmentalContext, developmentalStaleness,
} from '@/lib/manuscript/ask/developmentalContext';
import { askMaiaDevelopmental } from '@/lib/manuscript/ask/developmentalAskReader';
import { loadRevisionContent, loadLiveWork } from '@/lib/manuscript/development/capture';
import { requirementOf, sectionIdsOf } from '@/lib/manuscript/development/evidenceRef';
import { deriveBodyRequirement, authorizationCovers } from '@/lib/manuscript/ask/bodyRequirement';
import { deriveSectionOrientations } from '@/lib/manuscript/development/frozenOrientation';
import { mintAct, claimAct, recordCompletionWithClient } from '@/lib/disclosure/authorizationAct';
import { establishDisclosureBoundary, mayCrossBoundary } from '@/lib/disclosure/disclosureBoundary';
import { confirmDisclosureCrossedWithClient } from '@/lib/disclosure/contextDisclosureReceipt';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import { transaction } from '@/lib/db/postgres';
import { randomUUID } from 'node:crypto';

/** How long one authorization opportunity stays claimable. Continuity hygiene — ⛔ never authority. */
const AUTHORIZATION_TTL_MINUTES = 30;

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
 *
 * ── ⚠️ ASK-WORK-ANCHOR-01 · B1 — HALF OF THAT REASONING IS NOW SPENT ───────
 *
 * ⭐ THE ORDERING DEFECT IS REPAIRED. The readingless decision now stands ABOVE
 * `openThread` and above the author's turn, so the sentence *"could open and
 * PERSIST a thread and only then return `no_reading`"* is no longer true of this
 * route. ⛔ It is kept above rather than deleted, because it is why the boundary
 * was closed and the record of that is worth more than a tidy comment.
 *
 * ⛔⛔ AND THE BOUNDARY STAYS CLOSED ANYWAY, on the half that has NOT been
 * spent: *a shape the boundary accepts before its surface exists is a shape
 * nobody has proved.* `askMaia` still takes a proposal-shaped context —
 * `interpretation`, `evidence`, `coverage`, `reviewed` — and there is no Work
 * context anywhere in this substrate. An admitted `work` anchor would now reach
 * a lawful thread and fail THERE instead, which is better and is not enough.
 *
 * ⭐ The order is the law: ordering (B1) → a Work context (B2) → widening (B3).
 * ⛔ Nothing may be added to `SUPPORTED_ANCHORS` until B2 is witnessed.
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

  /* ⭐ S3 · ACT 3. A DISTINCT, CLOSED act — not a flag on an ordinary Ask.
     ⛔ The client never submits `may_cross`, and there is no `allowBody: true`. */
  const act = typeof body.act === 'string' ? body.act : null;
  if (act !== null && act !== 'authorize_sections_and_resume') {
    return NextResponse.json({ refusal: 'malformed', detail: 'act' }, { status: 400 });
  }
  const authorizes = act === null ? null
    : Array.isArray(body.authorizes) && body.authorizes.every((x) => typeof x === 'string')
      ? (body.authorizes as string[]) : null;
  const pendingAskRef = act === null ? null
    : typeof body.pendingAskRef === 'string' ? body.pendingAskRef : null;
  if (act !== null && (!authorizes || !pendingAskRef)) {
    return NextResponse.json(
      { refusal: 'malformed', detail: 'authorizes and pendingAskRef are required for this act' },
      { status: 400 });
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
      authorizes, pendingAskRef,
      /* ⭐ ONE identity, minted at the boundary and carried through consent and
         receipt. ⛔ Correlation only — it is never act identity. */
      requestId: randomUUID(),
      posture: TurnPosture.resolve(body),
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

  /* ══════════════════════════════════════════════════════════════════════════
     ⭐⭐ ASK-WORK-ANCHOR-01 · B1 — THE READINGLESS DECISION, ABOVE ANY WRITE.

     ⚠️ THIS BRANCH STOOD BELOW `openThread` AND BELOW THE AUTHOR'S TURN. It was
     kept, correctly, as *"the honest answer the day a reading-less anchor is
     added"* — but from where it stood, that day would have looked like this:

         admit {on:'work'}
           → thread row written
           → the member's own words written
           → 422 no_reading

         = durable evidence of a conversation the system had not established it
           could conduct, carrying what she actually said

     ⭐ The parse boundary and this branch were the same finding written from
     opposite ends, and they agreed: the boundary refused the anchor precisely
     BECAUSE this branch was in the wrong place. Moving it is what lets the
     boundary be widened later — ⛔ and widening is NOT this act.

     ⭐ THE ACCEPTANCE LAW: a refusal discovered before opening a relationship
     must leave no evidence that the relationship existed. So the response no
     longer carries a `threadId` — ⛔ there is no thread to name, and naming one
     was only possible because one had already been written.

     ⛔ STILL UNREACHABLE TODAY, and deliberately so. `parseAnchor` admits only
     proposal-bearing anchors, and a proposal-dependent anchor with no reading is
     already refused above — by the 404 at `loadFrozenReading` or by
     `checkAnchor`'s `anchor_requires_reading`. ⭐ That is the point: the ordering
     is repaired BEFORE the boundary can reach it, not after.

     ⛔ `isProposalDependent` is deliberately NOT consulted here. `checkAnchor`
     is the anchor authority and has already refused every proposal-dependent
     anchor that lacks its reading; asking a second question about the same fact
     would be a second authority on it. What remains at this line is exactly the
     case the boundary does not yet admit.
     ══════════════════════════════════════════════════════════════════════════ */
  if (!reading) {
    return NextResponse.json({ refusal: 'no_reading' }, { status: 422 });
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

  const outcome = await askMaia(
    {
      /* ⭐ ASK-WORK-ANCHOR-01 · B2 — the context is a discriminated union now,
         and this lane says which kind it is. ⛔ Every other field is unchanged. */
      kind: 'proposal' as const,
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
  /** ACT 3 only. The member's explicit act — ⭐ a CLAIM, never an authority. */
  authorizes: readonly string[] | null;
  /** ACT 3 only. Identity of the paused opportunity. ⛔ Possessing it permits nothing. */
  pendingAskRef: string | null;
  requestId: string;
  posture: TurnPosture;
}) {
  const {
    manuscriptId, memberId, anchor, existing, question,
    authorizes, pendingAskRef, requestId, posture,
  } = input;

  const reading = await loadFrozenDevelopmentalReading(manuscriptId, anchor.readingId, memberId);
  const check = checkObservationAnchor(anchor, reading);
  if (!check.ok) {
    return NextResponse.json({ refusal: check.refusal, detail: check.detail },
      { status: ANCHOR_STATUS[check.refusal] });
  }
  const observation = selectObservation(reading!, anchor.observationKey)!;

  let canonicalNow: string | null = null;
  try { canonicalNow = await canonicalFingerprint(manuscriptId); } catch { canonicalNow = null; }

  if (!existing && canonicalNow === null) {
    return NextResponse.json({ refusal: 'canonical_unmeasurable' }, { status: 503 });
  }
  const canonicalAtOpen = existing ? existing.canonicalAtOpen : canonicalNow!;

  /* ⭐⭐ S3 · THE REQUIREMENT IS DERIVED, NOT ASSERTED. From the observation's own
     evidence refs, server-side, every time — on the pause AND again on the
     resume. ⛔ The client's account never reaches this. */
  const bodyReq = deriveBodyRequirement(observation.evidenceRefs);

  /* ⭐⭐ ORIENTATION BEFORE THE ASK. Where each required section SITS in the
     frozen topology of THIS reading — derived from the same frozen state that
     governs the pause, server-side, from the DERIVED required set only.

     ⛔ FAIL CLOSED, AND BEFORE ANY MUTATION. A required identity that is not in
     the frozen topology is not orientable, and an Ask that cannot locate the
     section it proposes to request permission for is not entitled to request
     it. No thread is opened, no opportunity minted, no act claimed. The refusal
     carries a count and no identifier — a refusal is not an occasion to
     disclose. */
  const orientation = deriveSectionOrientations(
    reading!.readState.sectionTopology, bodyReq.sections);
  if (orientation.kind === 'unlocatable') {
    return NextResponse.json({
      refusal: 'section_orientation_unavailable',
      unlocatableCount: orientation.unlocatableCount,
    }, { status: 500 });
  }

  const now = await loadLiveWork(manuscriptId, memberId);

  /* The packet as it stands WITHOUT body. This is the whole context on the
     structure-sufficient path, and the staleness source on every path: location
     is derived from refs and the live Work, never from prose. */
  const ctxWithoutBody = assembleDevelopmentalContext({
    reading: reading!, observation, revisionContent: null, now,
  });
  const staleness = developmentalStaleness(
    ctxWithoutBody,
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
    initiatedBy: 'author',
  });

  /* ⭐ AFTER STRUCTURAL PREFLIGHT HAS SUCCEEDED, the author's words are recorded
     before any DOWNSTREAM pause, cognition or transport failure — so those lose
     the answer and never the question.

     ⛔ The scope matters and is narrower than it once read. A preflight refusal
     above (no lawful body requirement to orient) happens BEFORE this point and
     deliberately persists nothing: there is not yet a valid developmental Ask to
     record, and creating conversational state to preserve prose would turn an
     internal invariant failure into durable record.
     ⚠️ `isHeldRetry` decides only whether this is the SAME turn being re-sent.
     ⛔ It decides nothing constitutional: prose never gates authority here. */
  const priorTurns = existing?.turns ?? [];
  if (!isHeldRetry(priorTurns, question)) {
    await appendTurn({
      threadId: liveThreadId, memberId, speaker: 'author', body: question, staleness,
    });
  }
  const history = historyFor(
    priorTurns.map((t) => ({ speaker: t.speaker, body: t.body })), question);

  /* ── ACT 1 · no body required. The existing path, and it NEVER loads prose. */
  if (!bodyReq.required && !pendingAskRef) {
    return answerFrom(ctxWithoutBody, {
      liveThreadId, memberId, staleness, history, question, crossed: [],
    });
  }

  /* ── ACT 2 · body required, no member act yet. PAUSE.
     ⛔ No loadRevisionContent · no boundary · no receipt · no cognition with body. */
  if (!pendingAskRef) {
    const ref = await mintAct({
      memberId, manuscriptId, threadId: liveThreadId,
      readingId: reading!.id, observationKey: anchor.observationKey,
    }, AUTHORIZATION_TTL_MINUTES);
    return NextResponse.json({
      result: 'BODY_AUTHORITY_REQUIRED',
      threadId: liveThreadId,
      pendingAskRef: ref,
      workRef: manuscriptId,
      /* ⭐ Section IDENTITIES only (Q1 disposition (a)). ⛔ No headings: a heading
         is authored disclosure, and whether returning one to its own author is a
         disclosure at all is PARKED, not decided here. */
      sections: bodyReq.sections,
      /* ⭐ ADDITIVE. `sections` remains the authority identity array, untouched.
         Orientation is presentation metadata, ordered by whole-Work ordinal. */
      sectionOrientations: orientation.orientations,
      staleness,
    });
  }

  /* ── ACT 3 · the member authorized. Re-derive, compare, THEN claim. */
  if (!bodyReq.required) {
    /* An authorization for an Ask that needs no body. ⛔ Nothing is consumed. */
    return NextResponse.json(
      { refusal: 'body_not_required', threadId: liveThreadId }, { status: 409 });
  }

  /* ⭐ SCOPE BEFORE CLAIM. ⛔ Do not spend the member's single-use act to discover
     the client supplied an incomplete set — the opportunity stays claimable. */
  if (!authorizationCovers(authorizes ?? [], bodyReq.sections)) {
    return NextResponse.json({
      result: 'BODY_SCOPE_INCOMPLETE',
      threadId: liveThreadId,
      pendingAskRef,
      sections: bodyReq.sections,
      /* ⭐ THE SAME derivation as ACT 2, from the same frozen reading — so the
         member is never told a section sits in two different places. */
      sectionOrientations: orientation.orientations,
    });
  }

  /* ⭐⭐ THE CLAIM. The successful mutation IS the consumption. */
  const claim = await claimAct(pendingAskRef, memberId, requestId);

  if (claim.kind === 'unclaimable') {
    return claim.reason === 'unknown_act'
      ? NextResponse.json({ refusal: 'not_found' }, { status: 404 })
      : NextResponse.json({
          result: 'AUTHORIZATION_EXPIRED', threadId: liveThreadId,
        });
  }
  if (claim.kind === 'already') {
    /* ⛔ A replay never crosses again. `completed` recovers the SAME execution;
       `interrupted` requires a FRESH member act and is never resumable here. */
    const st = claim.state;
    if (st.kind === 'completed') {
      const thread = await loadThread(liveThreadId, memberId);
      return NextResponse.json({
        result: 'ALREADY_COMPLETED',
        threadId: liveThreadId, thread, staleness,
        completionRef: st.completionRef,
      });
    }
    return NextResponse.json({ result: 'INTERRUPTED', threadId: liveThreadId, staleness });
  }

  /* ⭐ THE OPPORTUNITY MUST HAVE BEEN FOR THIS EXACT ASK. A mismatch cannot put a
     consumed human act back — that would turn one act into reusable permission. */
  const c = claim.act;
  if (c.memberId !== memberId || c.manuscriptId !== manuscriptId
      || c.threadId !== liveThreadId || c.readingId !== reading!.id
      || c.observationKey !== anchor.observationKey) {
    return NextResponse.json(
      { refusal: 'authorization_not_for_this_ask', threadId: liveThreadId }, { status: 409 });
  }

  /* ⭐ ONE BOUNDARY PER AUTHORIZED SECTION. Ruling 5: one consumption, N receipts.
     ALL must return may_cross before prose is reachable. */
  const crossed: string[] = [];
  for (const sectionRef of bodyReq.sections) {
    const boundary = await establishDisclosureBoundary({
      requestId, posture, memberId, sessionId: liveThreadId,
      disclosure: {
        disclosureId: randomUUID(),
        boundary: 'writers_studio.developmental_ask->maia_cognition',
        sourceClass: 'work',
        participationBasis: 'member_invoked',
        sourceRef: manuscriptId,
        scopeKind: 'section',
        sectionRef,
        gesture: 'authorize_sections',
      },
    });
    if (!mayCrossBoundary(boundary)) {
      /* ⛔ The act stays spent and NO body loads. Earlier receipts remain
         `attempted`, which is the truthful state. ⛔ This is NOT
         BODY_AUTHORITY_REQUIRED — the member already acted. */
      return NextResponse.json({
        refusal: 'disclosure_unavailable', threadId: liveThreadId, crossedSoFar: crossed.length,
      }, { status: 503 });
    }
    crossed.push(boundary.disclosureId);
  }

  /* ⭐⭐ ONLY NOW. The single reachable body read in this file. */
  const revisionContent = await loadRevisionContent(
    reading!.readState.draftId, reading!.readState.revisionNumber);

  const ctx = assembleDevelopmentalContext({
    reading: reading!, observation, revisionContent, now,
  });

  /* ⭐ W2 ENFORCED INDEPENDENTLY OF THE DERIVATION THAT AUTHORIZED IT. If a
     recovered body reference names a section outside the authorized set, the
     derivation and the authority have diverged — refuse rather than cross. */
  const authorized = new Set(bodyReq.sections);
  const outside = ctx.evidence.some((e) => e.kind === 'verified'
    && requirementOf(e.ref) === 'body'
    && sectionIdsOf(e.ref).some((id) => !authorized.has(id)));
  if (outside) {
    console.error('[S3] W2 boundary violation — recovered body outside the authorized set', {
      threadId: liveThreadId,
    });
    return NextResponse.json(
      { refusal: 'disclosure_unavailable', threadId: liveThreadId }, { status: 500 });
  }

  /* Authority existed; the evidence could not be faithfully recovered.
     ⛔ CATEGORICALLY different from absent authority, and never reported as it. */
  const bodyRecovered = ctx.evidence.some(
    (e) => e.kind === 'verified' && requirementOf(e.ref) === 'body');
  if (!bodyRecovered) {
    return NextResponse.json({
      result: 'BODY_UNVERIFIABLE', threadId: liveThreadId, staleness, location: ctx.location,
    });
  }

  return answerFrom(ctx, {
    liveThreadId, memberId, staleness, history, question, crossed, pendingAskRef,
  });
}

/**
 * The answer, then — ATOMICALLY — the persisted turn, the confirmations, and the
 * completion.
 *
 * ⭐⭐ THE COMPLETION IDENTITY IS THE PERSISTED TURN, never "the model returned
 * text". W-B's law is that a retry recovers the SAME completed execution, so
 * there must BE a completed execution object to recover. ⛔ Transient text is not
 * a completion.
 *
 * ⭐⭐ AND THE THREE FACTS ARE ONE FACT. Written in sequence they had two windows
 * in which a durable canonical outcome existed while the authority substrate
 * could not see it:
 *
 *   RI-X1 — turn persisted, completion absent. A later retry reported
 *           `INTERRUPTED` while a canonical result existed. That is the frozen
 *           Ruling 6 violation: incompletion is not resumable by replay, but
 *           COMPLETION must be recoverable, and this made a completed execution
 *           unrecoverable and indistinguishable from an interrupted one.
 *   RI-X2 — a receipt confirmation returned `false` and the route continued to
 *           200. A crossing that may have occurred and was not confirmed was
 *           answered as an ordinary success.
 *
 * ⭐ Now all three commit together or none of them do. A receipt confirmation
 * failure THROWS rather than returning `false`, and `conflict` or
 * `no_consumption` THROW rather than being read as completion — neither can be
 * ignored, because neither is a value.
 *
 * ⛔⛔ THE TRANSACTION SUPPLIES ATOMICITY, NEVER AUTHORITY. It begins AFTER the
 * body has already crossed. The authority was the `ON CONFLICT DO NOTHING`
 * claim and the `may_cross` boundaries, both of which happened earlier and
 * neither of which this transaction can grant, withhold, or restore.
 *
 * ⛔ AND IT DOES NOT UNDO A CROSSING. On rollback the receipts stay `attempted`
 * — permanently, truthfully — the act stays consumed-and-incomplete, and the
 * member is told the answer was not recorded. ⛔ The answer text is NOT returned:
 * a result delivered outside an accountable completion is exactly the outcome
 * the record is supposed to stand for.
 */
async function answerFrom(
  ctx: ReturnType<typeof assembleDevelopmentalContext>,
  o: {
    liveThreadId: string; memberId: string; staleness: ReturnType<typeof developmentalStaleness>;
    history: { speaker: 'author' | 'maia'; body: string }[]; question: string;
    crossed: readonly string[]; pendingAskRef?: string;
  },
) {
  const outcome = await askMaiaDevelopmental(ctx, o.history, o.question);

  if (!outcome.ok) {
    /* The question is already recorded. ⛔ No completion, so a consumed act
       remains interrupted rather than silently finished. */
    return NextResponse.json(
      { threadId: o.liveThreadId, refusal: outcome.refusal, staleness: o.staleness, location: ctx.location },
      { status: 502 });
  }

  try {
    await transaction(async (client) => {
      const turnIndex = await appendTurnWithClient(client, {
        threadId: o.liveThreadId, memberId: o.memberId, speaker: 'maia', body: outcome.answer,
        staleness: o.staleness, answerProvenance: outcome.provenance,
      });

      /* The crossings are confirmed against the turn that now exists — and a
         confirmation that finds no receipt aborts all of this. */
      for (const disclosureId of o.crossed) {
        await confirmDisclosureCrossedWithClient(client, disclosureId);
      }

      if (o.pendingAskRef) {
        /* ⭐ The canonical completed execution: the append-only turn, whose UPDATE
           the database refuses. ⛔ Not the answer text. */
        await recordCompletionWithClient(
          client, o.pendingAskRef, `${o.liveThreadId}:${turnIndex}`);
      }
    });
  } catch {
    /* ⛔ LOUD, AND CONTENT-FREE. The transaction helper has already logged the
       error itself; this line names the lane so the anomaly is findable.
       ⛔ No act reference, no completion identity, no prose. */
    console.error('[S3] post-cognition tail rolled back — the answer was not recorded');

    /* ⛔ NOTHING WAS COMMITTED. The question stands, the receipts stay
       `attempted`, and a consumed act stays interrupted — which is what it is.
       ⛔ No answer text: it has no accountable completion to be delivered under. */
    return NextResponse.json({
      threadId: o.liveThreadId,
      refusal: 'answer_not_recorded',
      staleness: o.staleness,
      location: ctx.location,
    }, { status: 500 });
  }

  const thread = await loadThread(o.liveThreadId, o.memberId);
  return NextResponse.json({
    threadId: o.liveThreadId,
    thread,
    staleness: o.staleness,
    location: ctx.location,
    observation: {
      key: ctx.observation.key,
      lens: ctx.reading.lens,
      frozenAt: ctx.reading.frozenAt,
      unverifiableEvidence: ctx.evidence.filter((e) => e.kind === 'unverifiable').length,
    },
  });
}
