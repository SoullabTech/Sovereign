/**
 * WORK-FIRST-DEVELOP-01 — durable ordinary conversation about a Living Work
 * before a manuscript exists.
 *
 * Same ask_threads / ask_turns spine, same Ask reader, same retry/history law.
 * No manuscript is fabricated to satisfy routing.
 *
 * ⛔ Declared Source/Idea bodies do not cross here merely because they belong
 * to the Work. This ordinary conversation receives Work declarations + C14.
 */
import { isPostureDeclaration, resolveStudioPosture, type KeepWitness } from '@/lib/sanctuary/studioPosture';
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  appendTurn,
  loadLivingWorkThread,
  openLivingWorkThread,
  threadsOnLivingWork,
} from '@/lib/manuscript/ask/threadStore';
import { computeStaleness } from '@/lib/manuscript/ask/staleness';
import { askMaia } from '@/lib/manuscript/ask/askReader';
import { buildLivingWorkOnlyContext } from '@/lib/manuscript/ask/workContext';
import { isHeldRetry, historyFor } from '@/lib/manuscript/ask/retry';
import { workContextFingerprint } from '@/lib/writersStudio/workContextFingerprint';
import { meteredRoute, bindMaiaMeter } from '@/lib/writersStudio/maiaMeter';

export const dynamic = 'force-dynamic';

const MAX_QUESTION = 4000;
const WORK_ANCHOR = { on: 'work' } as const;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const { id: workId } = await params;

  // Ownership + existence without leaking another member's Work.
  const fingerprint = await workContextFingerprint(workId, memberId);
  if (!fingerprint) {
    return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  }

  const threadId = req.nextUrl.searchParams.get('thread');
  if (threadId) {
    const thread = await loadLivingWorkThread(threadId, memberId);
    if (!thread || thread.livingWorkId !== workId) {
      return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
    }
    return NextResponse.json({ thread });
  }

  return NextResponse.json({
    threads: await threadsOnLivingWork(workId, memberId),
  });
}

async function postHandler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const { id: workId } = await params;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ refusal: 'malformed', detail: 'not JSON' }, { status: 400 });
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return NextResponse.json({ refusal: 'malformed' }, { status: 400 });
  }
  const body = raw as Record<string, unknown>;
  const allowed = new Set(['question', 'threadId', 'sanctuary']);
  if (Object.keys(body).some((key) => !allowed.has(key))) {
    return NextResponse.json({ refusal: 'malformed', detail: 'unknown field' }, { status: 400 });
  }

  const question = typeof body.question === 'string' ? body.question.trim() : '';
  if (!question) {
    return NextResponse.json({ refusal: 'malformed', detail: 'question' }, { status: 400 });
  }
  if (question.length > MAX_QUESTION) {
    return NextResponse.json({ refusal: 'question_too_long' }, { status: 413 });
  }

  /* ⭐⭐ SANCTUARY CLOSURE (founder ruling 2026-11-09): a turn is kept ONLY when the request DECLARED an ordinary posture. Sanctuary, or a
     posture the client could not read (undeclared), answers in the moment and keeps nothing: no thread opened, no turn written. */
  if (body.sanctuary !== undefined && !isPostureDeclaration(body.sanctuary)) {
    return NextResponse.json({ refusal: 'malformed', detail: 'sanctuary' }, { status: 400 });
  }
  const studioPosture = await resolveStudioPosture(memberId, body);
  const storing = studioPosture.keep;
  bindMaiaMeter(memberId, { sanctuary: studioPosture.sanctuary === true });
  /* The store refuses any write without this witness; it exists only when storing is true. */
  const keep = studioPosture.witness as KeepWitness;

  const requestedThreadId = typeof body.threadId === 'string' ? body.threadId : null;
  const existing = requestedThreadId
    ? await loadLivingWorkThread(requestedThreadId, memberId)
    : null;
  if (requestedThreadId && (!existing || existing.livingWorkId !== workId)) {
    return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  }

  // Establish all context truth before opening a durable relationship.
  const currentFingerprint = await workContextFingerprint(workId, memberId);
  if (!currentFingerprint) {
    return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  }

  const staleness = computeStaleness({
    frozen: null,
    canonicalAtOpen: existing?.canonicalAtOpen ?? currentFingerprint,
    now: { canonicalFingerprint: currentFingerprint },
    frozenProposalId: null,
  });

  const built = await buildLivingWorkOnlyContext({
    workId,
    memberId,
    continuity: { structure: 'unmeasured', prose: 'unmeasured' },
  });
  if (!built.ok) {
    return NextResponse.json({ refusal: built.reason }, { status: 422 });
  }

  const liveThreadId = existing?.id ?? (!storing ? '' : await openLivingWorkThread({ keep: keep,
    livingWorkId: workId,
    memberId,
    canonicalAtOpen: currentFingerprint,
    initiatedBy: 'author',
  }));

  const priorTurns = existing?.turns ?? [];
  if (storing && !isHeldRetry(priorTurns, question)) {
    await appendTurn({ keep: keep,
      threadId: liveThreadId,
      memberId,
      speaker: 'author',
      body: question,
      staleness,
    });
  }

  const outcome = await askMaia(
    {
      kind: 'work',
      anchor: WORK_ANCHOR,
      facts: built.facts,
      staleness,
      /* Walk defect 5, Living Work path (independent review 2026-11-09): in Sanctuary she is told so, and is not given the Studio guide
         or the offers (reading permission, plan, keeping…), exactly as on the manuscript route. */
      sanctuary: studioPosture.sanctuary === true,
    },
    historyFor(
      priorTurns.map((turn) => ({ speaker: turn.speaker, body: turn.body })),
      question,
    ),
    question,
  );

  if (!outcome.ok) {
    return NextResponse.json(
      { threadId: liveThreadId || null, refusal: outcome.refusal, staleness },
      { status: 502 },
    );
  }

  if (!storing) {
    // Answered in the moment, kept nowhere. An earlier ordinary thread (if continuing) is returned unchanged.
    return NextResponse.json({
      threadId: existing?.id ?? null,
      thread: existing ? await loadLivingWorkThread(existing.id, memberId) : null,
      sanctuary: { notKept: true, question, answer: outcome.answer },
      staleness,
    });
  }

  await appendTurn({ keep: keep,
    threadId: liveThreadId,
    memberId,
    speaker: 'maia',
    body: outcome.answer,
    staleness,
    answerProvenance: outcome.provenance,
  });

  const thread = await loadLivingWorkThread(liveThreadId, memberId);
  if (!thread) {
    return NextResponse.json(
      { threadId: liveThreadId, refusal: 'answer_not_recorded', staleness },
      { status: 500 },
    );
  }

  return NextResponse.json({
    threadId: liveThreadId,
    thread,
    staleness,
  });
}

export const POST = meteredRoute('work_ask', postHandler);
