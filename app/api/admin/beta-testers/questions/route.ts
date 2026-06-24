export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireAdmin, isGateResponse } from '@/lib/beta-testers/requireAdmin';
import { updateById } from '@/lib/beta-testers/adminUpdate';

export async function GET(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  try {
    const r = await query(
      `SELECT id, question, detail, active, sort_order, created_at
         FROM beta_questions ORDER BY sort_order ASC, created_at ASC`
    );
    return NextResponse.json({ questions: r.rows });
  } catch (error) {
    console.error('[admin/beta-testers/questions] GET error:', error);
    return NextResponse.json({ questions: [] });
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  const b = await request.json().catch(() => ({}));
  const question = String(b?.question ?? '').trim();
  const detail = String(b?.detail ?? '').trim();
  const sortOrder = Number.isFinite(b?.sortOrder) ? Number(b.sortOrder) : 0;
  if (!question) return NextResponse.json({ error: 'question required' }, { status: 400 });
  try {
    const r = await query(
      `INSERT INTO beta_questions (question, detail, sort_order) VALUES ($1, $2, $3) RETURNING *`,
      [question, detail, sortOrder]
    );
    return NextResponse.json({ question: r.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('[admin/beta-testers/questions] POST error:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  const b = await request.json().catch(() => ({}));
  const id = String(b?.id ?? '');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const fields: Record<string, unknown> = {};
  if (typeof b.question === 'string') fields.question = b.question.trim();
  if (typeof b.detail === 'string') fields.detail = b.detail.trim();
  if (typeof b.active === 'boolean') fields.active = b.active;
  if (Number.isFinite(b?.sortOrder)) fields.sort_order = Number(b.sortOrder);
  if (Object.keys(fields).length === 0) return NextResponse.json({ error: 'no fields' }, { status: 400 });
  try {
    const row = await updateById('beta_questions', id, fields, { touchUpdatedAt: true });
    return NextResponse.json({ question: row });
  } catch (error) {
    console.error('[admin/beta-testers/questions] PATCH error:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  try {
    await query(`DELETE FROM beta_questions WHERE id = $1`, [id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/beta-testers/questions] DELETE error:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
