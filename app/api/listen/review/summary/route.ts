// POST /api/listen/review/summary — propose summary lines for the reviewer to check.
// Stateless: nothing is stored until the reviewer confirms and saves (POST /api/listen/review).
import { NextResponse } from 'next/server';
import { generateWithClaude } from '@/lib/ai/claudeClient';
import { refuseIfNotOrdinary } from '@/lib/listening/listenReviewPosture';
import { requireListenReviewer } from '@/lib/listening/listenReviewerGate';
import {
  isReviewableWork,
  parseSummary,
  summarySystemPrompt,
  summaryUserInput,
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
  const raw = body.transcript;
  const endWith = Array.isArray(raw) && raw.length % 2 === 0 ? 'reviewer' : 'guide';
  const turns = validateTranscript(raw, endWith);
  if (!turns || !turns.some(t => t.role === 'reviewer')) {
    return NextResponse.json({ refusal: 'malformed_transcript' }, { status: 400, headers: NO_STORE });
  }
  try {
    const result = await generateWithClaude({
      systemPrompt: summarySystemPrompt(),
      userInput: summaryUserInput(turns),
      meta: { mode: 'sound_studio_review' },
    });
    return NextResponse.json({ lines: parseSummary(result.text) }, { headers: NO_STORE });
  } catch {
    return NextResponse.json({ refusal: 'guide_unavailable' }, { status: 503, headers: NO_STORE });
  }
}
