// POST /api/listen/review/turn — the review guide's next question.
// Stateless: the client holds the conversation; nothing is stored here. Not MAIA; no memory read or written.
import { NextResponse } from 'next/server';
import { generateWithClaude } from '@/lib/ai/claudeClient';
import { refuseIfNotOrdinary } from '@/lib/listening/listenReviewPosture';
import { requireListenReviewer } from '@/lib/listening/listenReviewerGate';
import { SOUND_STUDIO_WORKS } from '@/lib/listening/soundStudioExperience';
import {
  SUGGEST_FINISH_AFTER,
  guideSystemPrompt,
  guideUserInput,
  isReviewableWork,
  parseGuideReply,
  reviewerReplyCount,
  validateTranscript,
} from '@/lib/listening/soundStudioReview';

export const dynamic = 'force-dynamic';
const NO_STORE = { 'Cache-Control': 'private, no-store' };

export async function POST(request: Request) {
  const gate = await requireListenReviewer();
  if (!gate.ok) return new NextResponse(null, { status: gate.status, headers: NO_STORE });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body !== 'object' || Object.keys(body).some(k => k !== 'workId' && k !== 'transcript' && k !== 'sanctuary')) {
    return NextResponse.json({ refusal: 'malformed' }, { status: 400, headers: NO_STORE });
  }
  const notOrdinary = await refuseIfNotOrdinary(gate.memberId, body);
  if (notOrdinary) return notOrdinary;
  if (!isReviewableWork(body.workId)) return NextResponse.json({ refusal: 'unknown_work' }, { status: 400, headers: NO_STORE });
  const turns = validateTranscript(body.transcript, 'reviewer');
  if (!turns) return NextResponse.json({ refusal: 'malformed_transcript' }, { status: 400, headers: NO_STORE });

  const work = SOUND_STUDIO_WORKS.find(w => w.id === body.workId);
  try {
    const result = await generateWithClaude({
      systemPrompt: guideSystemPrompt(body.workId, work?.description ?? ''),
      userInput: guideUserInput(turns),
      meta: { mode: 'sound_studio_review' },
    });
    const reply = parseGuideReply(result.text);
    return NextResponse.json({
      reply: reply.text,
      paused: reply.kind === 'paused',
      suggestFinish: reviewerReplyCount(turns) >= SUGGEST_FINISH_AFTER,
    }, { headers: NO_STORE });
  } catch {
    return NextResponse.json({ refusal: 'guide_unavailable' }, { status: 503, headers: NO_STORE });
  }
}
