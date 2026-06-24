export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireAdmin, isGateResponse } from '@/lib/beta-testers/requireAdmin';
import { updateById } from '@/lib/beta-testers/adminUpdate';

const VALID_ELEMENTS = ['fire', 'water', 'earth', 'air', 'aether'];

export async function GET(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  try {
    const r = await query(
      `SELECT id, title, prompt, element, active, sort_order, created_at
         FROM beta_challenges ORDER BY sort_order ASC, created_at ASC`
    );
    return NextResponse.json({ challenges: r.rows });
  } catch (error) {
    console.error('[admin/beta-testers/challenges] GET error:', error);
    return NextResponse.json({ challenges: [] });
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  const b = await request.json().catch(() => ({}));
  const title = String(b?.title ?? '').trim();
  const prompt = String(b?.prompt ?? '').trim();
  const element = b?.element ? String(b.element) : null;
  const active = b?.active === undefined ? true : Boolean(b.active);
  const sortOrder = Number.isFinite(b?.sortOrder) ? Number(b.sortOrder) : 0;
  if (!title || !prompt) return NextResponse.json({ error: 'title and prompt required' }, { status: 400 });
  if (element && !VALID_ELEMENTS.includes(element)) return NextResponse.json({ error: 'invalid element' }, { status: 400 });
  try {
    const r = await query(
      `INSERT INTO beta_challenges (title, prompt, element, active, sort_order)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, prompt, element, active, sortOrder]
    );
    return NextResponse.json({ challenge: r.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('[admin/beta-testers/challenges] POST error:', error);
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
  if (typeof b.title === 'string') fields.title = b.title.trim();
  if (typeof b.prompt === 'string') fields.prompt = b.prompt.trim();
  if ('element' in b) {
    const el = b.element ? String(b.element) : null;
    if (el && !VALID_ELEMENTS.includes(el)) return NextResponse.json({ error: 'invalid element' }, { status: 400 });
    fields.element = el;
  }
  if (typeof b.active === 'boolean') fields.active = b.active;
  if (Number.isFinite(b?.sortOrder)) fields.sort_order = Number(b.sortOrder);
  if (Object.keys(fields).length === 0) return NextResponse.json({ error: 'no fields' }, { status: 400 });

  try {
    const row = await updateById('beta_challenges', id, fields, { touchUpdatedAt: true });
    return NextResponse.json({ challenge: row });
  } catch (error) {
    console.error('[admin/beta-testers/challenges] PATCH error:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  try {
    await query(`DELETE FROM beta_challenges WHERE id = $1`, [id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/beta-testers/challenges] DELETE error:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
