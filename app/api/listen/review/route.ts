// /api/listen/review — the reviewer's own saved reviews.
//   GET  — list your reviews (never anyone else's)
//   POST — save reviewer-confirmed lines; the raw transcript only if keepTranscript is true
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireListenReviewer } from '@/lib/listening/listenReviewerGate';
import { validateSaveRequest } from '@/lib/listening/soundStudioReview';

export const dynamic = 'force-dynamic';
const NO_STORE = { 'Cache-Control': 'private, no-store' };

type Row = { id: string; work_id: string; lines: unknown; kept_transcript: boolean; created_at: string };

export async function GET() {
  const gate = await requireListenReviewer();
  if (!gate.ok) return new NextResponse(null, { status: gate.status, headers: NO_STORE });
  const result = await query<Row>(
    `SELECT id, work_id, lines, (transcript IS NOT NULL) AS kept_transcript, created_at
       FROM sound_studio_reviews WHERE member_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [gate.memberId],
  );
  return NextResponse.json({
    reviews: result.rows.map(r => ({
      id: r.id, workId: r.work_id, lines: r.lines, keptTranscript: r.kept_transcript, createdAt: r.created_at,
    })),
  }, { headers: NO_STORE });
}

export async function POST(request: Request) {
  const gate = await requireListenReviewer();
  if (!gate.ok) return new NextResponse(null, { status: gate.status, headers: NO_STORE });
  const save = validateSaveRequest(await request.json().catch(() => null));
  if (!save) return NextResponse.json({ refusal: 'malformed' }, { status: 400, headers: NO_STORE });
  const result = await query<{ id: string; created_at: string }>(
    `INSERT INTO sound_studio_reviews
       (member_id, work_id, passage_label, elapsed_ms, lines, transcript, consent_version, origin)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, 'review_guide')
     RETURNING id, created_at`,
    [
      gate.memberId, save.workId, save.passageLabel, save.elapsedMs,
      JSON.stringify(save.lines), save.transcript ? JSON.stringify(save.transcript) : null, save.consentVersion,
    ],
  );
  const row = result.rows[0];
  if (!row) return NextResponse.json({ refusal: 'not_saved' }, { status: 500, headers: NO_STORE });
  return NextResponse.json({ id: row.id, createdAt: row.created_at }, { status: 201, headers: NO_STORE });
}
