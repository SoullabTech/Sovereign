import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest as getMemberId } from '@/lib/auth/getMemberFromRequest';
import { memberRef } from '@/lib/privacy/memberRef';

export const dynamic = 'force-dynamic';

// GET /api/sovereign/principles — list member's accepted organizing principles
export async function GET(req: NextRequest) {
  const memberId = await getMemberId(req);
  if (!memberId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    const result = await query(
      `SELECT id, title, principle, question_answered, evidence, conversation_id, created_at, accepted_at
       FROM member_organizing_principles
       WHERE member_id = $1 AND status = 'accepted'
       ORDER BY created_at DESC
       LIMIT 50`,
      [memberId],
    );
    return NextResponse.json({ principles: result.rows ?? [] });
  } catch (err) {
    console.error('[principles] GET error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

// POST /api/sovereign/principles — save an accepted organizing principle
export async function POST(req: NextRequest) {
  const memberId = await getMemberId(req);
  if (!memberId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: {
    title: string;
    principle: string;
    questionAnswered?: string;
    evidence?: string[];
    conversationId?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const { title, principle, questionAnswered, evidence, conversationId } = body;

  if (!title?.trim() || !principle?.trim()) {
    return NextResponse.json({ error: 'title and principle required' }, { status: 400 });
  }

  try {
    const result = await query(
      `INSERT INTO member_organizing_principles
         (member_id, title, principle, question_answered, evidence, conversation_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, principle, created_at`,
      [
        memberId,
        title.trim(),
        principle.trim(),
        questionAnswered?.trim() || 'What principle emerged that can guide future situations?',
        JSON.stringify(evidence ?? []),
        conversationId ?? null,
      ],
    );

    const row = result.rows?.[0];
    console.log('[principles] saved:', { memberId: memberRef(memberId), title: row?.title });
    return NextResponse.json({ principle: row }, { status: 201 });
  } catch (err) {
    console.error('[principles] POST error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

// DELETE /api/sovereign/principles?id=... — archive (not hard-delete)
export async function DELETE(req: NextRequest) {
  const memberId = await getMemberId(req);
  if (!memberId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  try {
    await query(
      `UPDATE member_organizing_principles SET status = 'archived'
       WHERE id = $1 AND member_id = $2`,
      [id, memberId],
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[principles] DELETE error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
