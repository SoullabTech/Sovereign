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
import { workingStyleFrom } from '@/lib/writersStudio/workingStyle';

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

export async function POST(
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
  const allowed = new Set(['question', 'threadId', 'workingStyle']);
  if (Object.keys(body).some((key) => !allowed.has(key))) {
    return NextResponse.json({ refusal: 'malformed', detail: 'unknown field' }, { status: 400 });
  }

  const workingStyle = workingStyleFrom(body.workingStyle);
  const question = typeof body.question === 'string' ? body.question.trim() : '';
  if (!question) {
    return NextResponse.json({ refusal: 'malformed', detail: 'question' }, { status: 400 });
  }
  if (question.length > MAX_QUESTION) {
    return NextResponse.json({ refusal: 'question_too_long' }, { status: 413 });
  }

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

  const liveThreadId = existing?.id ?? await openLivingWorkThread({
    livingWorkId: workId,
    memberId,
    canonicalAtOpen: currentFingerprint,
    initiatedBy: 'author',
  });

  const priorTurns = existing?.turns ?? [];
  if (!isHeldRetry(priorTurns, question)) {
    await appendTurn({
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
    },
    historyFor(
      priorTurns.map((turn) => ({ speaker: turn.speaker, body: turn.body })),
      question,
    ),
    question,
    { engagement: workingStyle.engagement, responseStyle: workingStyle.explanation },
  );

  if (!outcome.ok) {
    return NextResponse.json(
      { threadId: liveThreadId, refusal: outcome.refusal, staleness },
      { status: 502 },
    );
  }

  await appendTurn({
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
