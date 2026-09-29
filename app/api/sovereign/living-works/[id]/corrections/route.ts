import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { currentWriterCorrectionsForWork } from '@/lib/writersStudio/writerCorrectionsServer';
import { isWriterCorrectionKind } from '@/lib/writersStudio/writerCorrections';

export const dynamic = 'force-dynamic';

const MAX_CORRECTION = 4000;

type TurnRow = {
  living_work_id: string | null;
  manuscript_id: string | null;
  speaker: string;
  body: string;
};

async function ownsWork(memberId: string, workId: string): Promise<boolean> {
  const owned = await query('SELECT 1 FROM living_works WHERE id = $1 AND member_id = $2', [workId, memberId]);
  return owned.rows.length === 1;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const { id: workId } = await params;
  if (!(await ownsWork(memberId, workId))) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  return NextResponse.json({ corrections: await currentWriterCorrectionsForWork(memberId, workId) });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const { id: workId } = await params;
  if (!(await ownsWork(memberId, workId))) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });

  const raw = await req.json().catch(() => null);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return NextResponse.json({ refusal: 'malformed' }, { status: 400 });
  }
  const body = raw as Record<string, unknown>;
  const allowed = new Set(['threadId', 'maiaTurnIndex', 'kind', 'correction']);
  if (Object.keys(body).some((key) => !allowed.has(key))) {
    return NextResponse.json({ refusal: 'malformed', detail: 'unknown_field' }, { status: 400 });
  }
  const threadId = typeof body.threadId === 'string' ? body.threadId : '';
  const maiaTurnIndex = Number.isInteger(body.maiaTurnIndex) ? Number(body.maiaTurnIndex) : -1;
  const correction = typeof body.correction === 'string' ? body.correction.trim() : '';
  if (!threadId || maiaTurnIndex < 0 || !isWriterCorrectionKind(body.kind)
    || correction.length < 1 || correction.length > MAX_CORRECTION) {
    return NextResponse.json({ refusal: 'malformed' }, { status: 400 });
  }

  const turn = await query<TurnRow>(
    `SELECT th.living_work_id, th.manuscript_id, u.speaker, u.body
       FROM ask_threads th
       JOIN ask_turns u ON u.thread_id = th.id AND u.turn_index = $3
      WHERE th.id = $1 AND th.member_id = $2`,
    [threadId, memberId, maiaTurnIndex],
  );
  const row = turn.rows[0];
  if (!row || row.speaker !== 'maia') {
    return NextResponse.json({ refusal: 'maia_turn_not_found' }, { status: 404 });
  }

  let belongs = row.living_work_id === workId;
  if (!belongs && row.manuscript_id) {
    const expression = await query(
      `SELECT 1 FROM living_work_expressions
        WHERE living_work_id = $1 AND expression_type = 'manuscript' AND expression_id = $2`,
      [workId, row.manuscript_id],
    );
    belongs = expression.rows.length === 1;
  }
  if (!belongs) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });

  let inserted;
  try {
    inserted = await query<{ id: string; created_at: string | Date }>(
      `INSERT INTO writer_studio_corrections
         (member_id, living_work_id, thread_id, maia_turn_index, kind, correction_text)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, created_at`,
      [memberId, workId, threadId, maiaTurnIndex, body.kind, correction],
    );
  } catch (error) {
    if ((error as { code?: string })?.code === '42P01') {
      return NextResponse.json({ refusal: 'correction_substrate_not_ready' }, { status: 503 });
    }
    throw error;
  }
  const record = inserted.rows[0]!;
  return NextResponse.json({
    correction: {
      id: record.id,
      workId,
      threadId,
      maiaTurnIndex,
      kind: body.kind,
      priorClaim: row.body,
      correction,
      createdAt: record.created_at instanceof Date ? record.created_at.toISOString() : String(record.created_at),
    },
  });
}
