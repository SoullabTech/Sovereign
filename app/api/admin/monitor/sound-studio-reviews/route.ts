/**
 * /api/admin/monitor/sound-studio-reviews — founder view of named-beta Sound Studio reviews. Admin-gated.
 *   GET  — every saved review: reviewer name, work, confirmed lines, whether the conversation was kept
 *   POST — on-demand theme synthesis across confirmed lines (not stored). The model sees only the lines under
 *          anonymous references; names, ids, dates and transcripts are never sent.
 * Raw transcripts are never returned here; they exist only when a reviewer chose to keep them.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { checkAdminAuth } from '@/lib/admin/adminAuth';
import { generateWithClaude } from '@/lib/ai/claudeClient';
import { REVIEWABLE_WORKS, validateLines } from '@/lib/listening/soundStudioReview';
import {
  buildSynthesisInputs,
  parseThemes,
  synthesisSystemPrompt,
  synthesisUserInput,
} from '@/lib/listening/soundStudioReviewSynthesis';

export const dynamic = 'force-dynamic';
const NO_STORE = { 'Cache-Control': 'private, no-store' };

type Row = {
  id: string; work_id: string; lines: unknown; passage_label: string | null; kept_transcript: boolean;
  created_at: string; reviewer: string | null;
};

async function loadReviews(workId: string | null) {
  const result = await query<Row>(
    `SELECT r.id, r.work_id, r.lines, r.passage_label, (r.transcript IS NOT NULL) AS kept_transcript, r.created_at,
            COALESCE(m.name, m.username) AS reviewer
       FROM sound_studio_reviews r LEFT JOIN members m ON m.id = r.member_id
      WHERE ($1::text IS NULL OR r.work_id = $1)
      ORDER BY r.created_at DESC LIMIT 500`,
    [workId],
  );
  return result.rows.map(r => ({
    id: r.id,
    workId: r.work_id,
    workTitle: REVIEWABLE_WORKS[r.work_id] ?? r.work_id,
    reviewer: r.reviewer ?? 'Reviewer',
    passageLabel: r.passage_label,
    keptTranscript: r.kept_transcript,
    createdAt: r.created_at,
    lines: validateLines(r.lines) ?? [],
  }));
}

export async function GET(request: NextRequest) {
  if (!(await checkAdminAuth(request)).authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const reviews = await loadReviews(null);
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    reviews,
    basis: 'Reviewer-confirmed lines only. No listening telemetry exists; an absent review means nothing was said, not that nothing was felt.',
  }, { headers: NO_STORE });
}

export async function POST(request: NextRequest) {
  if (!(await checkAdminAuth(request)).authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { workId?: unknown };
  const workId = typeof body.workId === 'string' && REVIEWABLE_WORKS[body.workId] ? body.workId : null;
  const reviews = await loadReviews(workId);
  const inputs = buildSynthesisInputs(reviews);
  if (!inputs.length) return NextResponse.json({ themes: [], lines: [] }, { headers: NO_STORE });
  try {
    const result = await generateWithClaude({
      systemPrompt: synthesisSystemPrompt(),
      userInput: synthesisUserInput(inputs),
      meta: { mode: 'sound_studio_review_synthesis' },
    });
    return NextResponse.json({
      themes: parseThemes(result.text, inputs),
      lines: inputs.map(i => ({ ref: i.ref, workTitle: i.workTitle, kind: i.line.kind, text: i.line.text })),
    }, { headers: NO_STORE });
  } catch {
    return NextResponse.json({ refusal: 'synthesis_unavailable' }, { status: 503, headers: NO_STORE });
  }
}
