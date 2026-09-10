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
/* S3 · P1 — section-scoped body-disclosure authority for the developmental lane. */
import { randomUUID } from 'crypto';
import { observationLocation } from '@/lib/manuscript/development/resolve';
import { stalenessFrom, hasUnverifiableEvidence } from '@/lib/manuscript/ask/developmentalContext';
import {
  resolveBodyRequirement, enforceW2SectionBoundary,
} from '@/lib/manuscript/ask/bodyGate/resolveBodyRequirement';
import { createPendingAsk } from '@/lib/manuscript/ask/pendingAsk/pendingAskStore';
import { createPendingAskClaimant } from '@/lib/manuscript/ask/pendingAsk/pendingAskClaimant';
import { claimAcquired } from '@/lib/manuscript/ask/pendingAsk/claimContract';
import { establishDisclosureBoundary, mayCrossBoundary } from '@/lib/disclosure/disclosureBoundary';
import { confirmDisclosureCrossed } from '@/lib/disclosure/contextDisclosureReceipt';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';

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

/**
 * S3 · P1 · ACT 3 — the member's explicit authorization act.
 *
 * ⛔ A DISTINCT DISCRIMINATED ACT, never a field on an ordinary Ask. A shape like
 * `ask({ …, allowBody: true })` is too easy to treat as client-supplied
 * authority; this one announces itself and is parsed closed.
 *
 * ⛔ The client supplies the pending identity and its own choice of sections. It
 * NEVER supplies `may_cross`, and the server trusts neither the requirement nor
 * the section set it names — both are re-derived from the frozen reading.
 */
export interface AuthorizeSectionsAct {
  readonly pendingAskRef: string;
  readonly authorizes: readonly string[];
}

function parseAuthorizeAct(v: unknown): AuthorizeSectionsAct | null {
  if (typeof v !== 'object' || v === null) return null;
  const o = v as Record<string, unknown>;
  if (o.act !== 'authorize_sections_and_resume') return null;
  /* ⭐ CLOSED OVER THE ACT'S OWN FIELDS, not over the whole envelope. ACT 3 IS
     still an Ask: it carries the question and the thread or anchor alongside the
     authorization, because the member is continuing one conversation rather than
     starting a second protocol. Demanding the body contain ONLY the act's three
     keys would refuse every well-formed resume. */
  if (typeof o.pendingAskRef !== 'string' || o.pendingAskRef.length < 32) return null;
  if (!Array.isArray(o.authorizes) || o.authorizes.length === 0) return null;
  if (!o.authorizes.every((x) => typeof x === 'string' && x.length > 0)) return null;
  return { pendingAskRef: o.pendingAskRef, authorizes: [...new Set(o.authorizes as string[])].sort() };
}

export const __parseAuthorizeActForTest = parseAuthorizeAct;

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
      /* ⛔ `null` means ACT 1. An unparseable act is NOT silently downgraded to
         one: a member who tried to authorize and was misread as merely asking
         would be paused again with no explanation. */
      authorization: 'act' in body ? parseAuthorizeAct(body) : null,
      malformedAct: 'act' in body && parseAuthorizeAct(body) === null,
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
  /** S3 · P1 — present only on ACT 3. `null` is an ordinary Ask. */
  authorization?: AuthorizeSectionsAct | null;
  /** An `act` key that did not parse. ⛔ Refused, never downgraded to ACT 1. */
  malformedAct?: boolean;
}) {
  const { manuscriptId, memberId, anchor, existing, question } = input;
  const authorization = input.authorization ?? null;
  if (input.malformedAct) {
    return NextResponse.json({ refusal: 'malformed', detail: 'act' }, { status: 400 });
  }

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

  /* ⭐⭐ S3 · P1 · THE HINGE — the evidence requirement and the containing
     section set are resolved from the ref KINDS and the frozen coordinates.
     ⛔ No character of the Work is read to decide whether a character of the
     Work may be read. */
  const requirement = resolveBodyRequirement(observation.evidenceRefs);
  const now = await loadLiveWork(manuscriptId, memberId);
  const canonicalMoved = canonicalNow === null ? { state: 'unmeasured' as const }
    : canonicalAtOpen === canonicalNow ? { state: 'unchanged' as const } : { state: 'changed' as const };

  /* ── BODY REQUIRED ────────────────────────────────────────────────────────
     Everything in this branch happens with `loadRevisionContent` unreachable. */
  if (requirement.bodyRequired) {
    return developmentalBodyTurn({
      manuscriptId, memberId, anchor, existing, question,
      reading: reading!, observation, requirement, now, canonicalAtOpen, canonicalMoved,
      authorization,
    });
  }

  /* ── STRUCTURE / POSITION SUFFICIENT ──────────────────────────────────────
     ⭐ `null` here is TRUE, not a withholding: no reference requires body depth,
     so `recoverEvidence` never reaches the branch that would want the revision,
     and no prose-disclosure receipt is minted. */
  const revisionContent: string | null = null;

  const ctx = assembleDevelopmentalContext({
    reading: reading!, observation, revisionContent, now,
  });
  const staleness = developmentalStaleness(ctx, canonicalMoved);

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

/* ═══ S3 · P1 — THE BODY PATH ══════════════════════════════════════════════════
 *
 *   ⭐⭐ No authored BODY characters required by the Ask enter cognition without
 *       fresh, section-scoped body-disclosure authority.
 *
 * ⛔ NOT a claim that no authored characters cross before body authority —
 * member-authored headings already reach cognition through
 * `FrozenStructureUnit.title` under the `structure` requirement. That is a
 * separate governance lane which this repair neither creates nor closes.
 *
 * ⛔ `passage` is NOT AVAILABLE AS AUTHORITY. The scope here is `section`,
 * everywhere, in the boundary and in what the member is asked. Wording that says
 * "passage" while establishing section authority is silent widening.
 */

type FrozenReading = NonNullable<Awaited<ReturnType<typeof loadFrozenDevelopmentalReading>>>;
type Observation = NonNullable<ReturnType<typeof selectObservation>>;

/** ⭐ One disclosure identity per section authorized in THIS invocation. */
const DEVELOPMENTAL_BOUNDARY = 'writers_studio.ask->maia_developmental' as const;

async function developmentalBodyTurn(input: {
  manuscriptId: string;
  memberId: string;
  anchor: Extract<AskAnchor, { on: 'observation' }>;
  existing: Awaited<ReturnType<typeof loadThread>>;
  question: string;
  reading: FrozenReading;
  observation: Observation;
  requirement: { bodyRequired: boolean; requiredSections: readonly string[] };
  now: Awaited<ReturnType<typeof loadLiveWork>>;
  canonicalAtOpen: string;
  canonicalMoved: { state: 'unmeasured' | 'unchanged' | 'changed' };
  authorization: AuthorizeSectionsAct | null;
}) {
  const {
    manuscriptId, memberId, anchor, existing, question, reading, observation,
    requirement, now, canonicalAtOpen, canonicalMoved, authorization,
  } = input;

  /* ⭐ Measured with no prose: refs from the frozen observation, location from
     the frozen read state against the live Work's coordinates. This is why the
     paused turn can be RECORDED without assembling a context — and assembling
     one would mean calling the assembler with a null revision, whose `null`
     branch produces exactly the `unverifiable` shape this path must never
     return. The safest way not to return it is never to construct it. */
  const location = observationLocation(observation.evidenceRefs, reading.readState, now);
  const staleness = stalenessFrom(observation.evidenceRefs, location, canonicalMoved);

  const liveThreadId = existing ? existing.id : await openThread({
    manuscriptId,
    memberId,
    anchor,
    reading: {
      kind: 'developmental',
      readingId: reading.id,
      draftId: reading.readState.draftId,
      revisionNumber: reading.readState.revisionNumber,
      inputFingerprint: reading.readState.inputFingerprint,
      commissionedLens: reading.scope.commissionedLens,
      readerProvenance: reading.provenance.reader,
    },
    canonicalAtOpen,
    initiatedBy: 'author',
  });

  /* THE AUTHOR'S WORDS ARE RECORDED FIRST, on the body path too. A pause is not
     a failure, and a member who asked and was asked for authority has still
     asked. */
  const priorTurns = existing?.turns ?? [];
  if (!isHeldRetry(priorTurns, question)) {
    await appendTurn({ threadId: liveThreadId, memberId, speaker: 'author', body: question, staleness });
  }

  const shared = { threadId: liveThreadId, workRef: manuscriptId, staleness, location };

  /* ── ACT 2 · BODY_AUTHORITY_REQUIRED ──────────────────────────────────────
     ⛔ A lawful intermediate state of the Ask protocol. NOT an error, NOT
     authority, and it carries no authored characters. Presented again unchanged
     it does nothing. */
  if (!authorization) {
    const pendingAskRef = await createPendingAsk({
      memberId, manuscriptId, threadId: liveThreadId,
      readingId: reading.id, observationKey: observation.key,
    });
    if (!pendingAskRef) {
      /* ⛔ Never offer a resume no invocation could claim. */
      return NextResponse.json({ ...shared, refusal: 'pending_ask_unavailable' }, { status: 503 });
    }
    return NextResponse.json({
      ...shared,
      result: 'BODY_AUTHORITY_REQUIRED',
      pendingAskRef,
      /* ⭐ ALL required sections at once: all-or-none is the answer contract, and
         a member cannot make an informed act about a partial set.
         ⚠️ Ids only. Whether the surface may show the member their own headings
         is ruled lawful but is a SURFACE decision; nothing here returns one. */
      sections: requirement.requiredSections,
    });
  }

  /* ── ACT 3 · RESUME ───────────────────────────────────────────────────────
     ⭐ Every fact below is re-derived. `pendingAskRef` answers only "which Ask
     are we continuing?" — it carries nothing the server has to believe. */

  /* ALL-OR-NONE, evaluated against the RE-DERIVED requirement, never the
     client's account of it. */
  const outstanding = requirement.requiredSections.filter((sec) => !authorization.authorizes.includes(sec));
  if (outstanding.length > 0) {
    return NextResponse.json({
      ...shared, result: 'BODY_SCOPE_INCOMPLETE', outstanding,
      pendingAskRef: authorization.pendingAskRef,
    }, { status: 200 });
  }

  /* ⭐⭐ THE ATOMIC CLAIM — ONCE, and BEFORE any disclosure machinery. A losing
     resume must reach no boundary, no may_cross, no load and no receipt: atomic
     bookkeeping after the constitutional event would be useless. */
  const claim = await createPendingAskClaimant().claim(authorization.pendingAskRef);
  if (!claimAcquired(claim)) {
    /* ⭐ Each answer stays itself. `unavailable` means the system could not
       establish what happened — ⛔ never that someone else consumed the act. */
    const status = claim.kind === 'already_consumed' ? 200
      : claim.kind === 'expired' ? 410 : claim.kind === 'unknown' ? 404 : 503;
    return NextResponse.json({
      ...shared,
      ...(claim.kind === 'already_consumed'
        ? { result: 'ALREADY_CONSUMED', completion: claim.completion }
        : { refusal: claim.kind }),
    }, { status });
  }

  /* The claim identifies an Ask. It must be THIS Ask, and this member's. */
  const c = claim.coordinates;
  if (c.memberId !== memberId || c.manuscriptId !== manuscriptId
      || c.threadId !== liveThreadId || c.readingId !== reading.id
      || c.observationKey !== observation.key) {
    return NextResponse.json({ ...shared, refusal: 'pending_ask_mismatch' }, { status: 409 });
  }

  /* ⭐⭐ ONE SERVING REQUEST FOR THE WHOLE EXECUTION. Every section's receipt
     shares this `request_ref`, so an auditor grouping by it sees ONE member act
     carrying N independently section-scoped crossings.
     ⛔ That is not a multi-section authority token: authority stays section-
     scoped, and what is shared is the request, never the permission. */
  const requestId = randomUUID();
  const posture = TurnPosture.resolve({});

  /* ⭐⭐ ALL REQUIRED BOUNDARIES BEFORE ANY BODY IS LOADED.
     ⛔ BOUNDARY ESTABLISHMENT IS NOT DISCLOSURE COMPLETION. A boundary that
     succeeds inside a multi-boundary attempt stays merely `attempted` until the
     ONE authorized handoff actually occurs — so if a later boundary fails, the
     earlier ones are NEVER promoted to `crossed`. Their attempted rows are
     truthful evidence that a crossing may have occurred and was not confirmed. */
  const established: string[] = [];
  for (const sec of requirement.requiredSections) {
    const boundary = await establishDisclosureBoundary({
      requestId,
      posture,
      memberId,
      sessionId: liveThreadId,
      disclosure: {
        disclosureId: randomUUID(),
        boundary: DEVELOPMENTAL_BOUNDARY,
        sourceClass: 'work',
        participationBasis: 'member_invoked',
        sourceRef: manuscriptId,
        scopeKind: 'section',
        sectionRef: sec,
        gesture: 'work_with_this',
      },
    });
    if (!mayCrossBoundary(boundary)) {
      /* ⭐⭐ THE SIXTH STATE. The member DID authorize; the disclosure could not
         be established; nothing was read; and the claim above is SPENT.
         ⛔ Saying only the first three would leave the writer believing they are
         still authorized — the same class of untruth as an unauthorized crossing
         wearing the verification-failure shape.
         ⛔ NOT `BODY_AUTHORITY_REQUIRED`: their act happened.
         ⛔ NOT `BODY_UNVERIFIABLE`: nothing was read, so nothing failed
            verification. ⛔ And NOT a 500: the system refused correctly. */
      return NextResponse.json({
        ...shared,
        result: 'DISCLOSURE_UNAVAILABLE',
        actSpent: true,
        /* Continuity hygiene for the surface: authorizing again is a NEW act. */
        sections: requirement.requiredSections,
      }, { status: 503 });
    }
    established.push(boundary.disclosureId);
  }

  /* ── ⭐ ONLY NOW IS PROSE REACHABLE ───────────────────────────────────────
     W1 may be the whole revision where integrity requires it; W2 is bounded
     below. A wider trusted retrieval is not a wider authority. */
  const revisionContent = await loadRevisionContent(reading.readState.draftId, reading.readState.revisionNumber);
  const assembled = assembleDevelopmentalContext({ reading, observation, revisionContent, now });

  /* ⭐⭐ INDEPENDENT W2 ENFORCEMENT. It reads what `recoverEvidence` actually
     produced, ⛔ never `requiredSections === authorizes` — a boundary that
     trusts the computation it exists to bound cannot fail when that computation
     is wrong. */
  const { ctx, withheld } = enforceW2SectionBoundary(assembled, authorization.authorizes);

  if (hasUnverifiableEvidence(ctx)) {
    /* ⭐ Authority EXISTED and the evidence could not be faithfully recovered.
       This is the ONLY path to this state, which is what makes it impossible
       for an unauthorized crossing to wear it. */
    return NextResponse.json({
      ...shared, result: 'BODY_UNVERIFIABLE',
      refusal: 'evidence_not_recoverable',
    }, { status: 200 });
  }

  const outcome = await askMaiaDevelopmental(
    ctx,
    historyFor(priorTurns.map((t) => ({ speaker: t.speaker, body: t.body })), question),
    question,
  );

  /* ⭐ ONE HANDOFF HAPPENED, so every section scope it carried is now genuinely
     crossed. N receipts, one execution — the receipts record WHICH scopes
     crossed, and authorize nothing else. */
  for (const disclosureId of established) await confirmDisclosureCrossed(disclosureId);
  await createPendingAskClaimant().recordCompleted(authorization.pendingAskRef);

  if (!outcome.ok) {
    return NextResponse.json({ ...shared, refusal: outcome.refusal }, { status: 502 });
  }

  await appendTurn({
    threadId: liveThreadId, memberId, speaker: 'maia', body: outcome.answer,
    staleness, answerProvenance: outcome.provenance,
  });

  const thread = await loadThread(liveThreadId, memberId);
  return NextResponse.json({
    ...shared,
    result: 'BODY_AUTHORIZED',
    thread,
    disclosedSections: requirement.requiredSections,
    withheldSections: withheld,
    observation: {
      key: ctx.observation.key,
      lens: ctx.reading.lens,
      frozenAt: ctx.reading.frozenAt,
      unverifiableEvidence: 0,
    },
  });
}
