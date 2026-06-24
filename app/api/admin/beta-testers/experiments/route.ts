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
      `SELECT id, code, title, protocol, active, sort_order, created_at
         FROM beta_experiments ORDER BY sort_order ASC, created_at ASC`
    );
    return NextResponse.json({ experiments: r.rows });
  } catch (error) {
    console.error('[admin/beta-testers/experiments] GET error:', error);
    return NextResponse.json({ experiments: [] });
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  const b = await request.json().catch(() => ({}));
  const code = b?.code ? String(b.code).trim() : null;
  const title = String(b?.title ?? '').trim();
  const protocol = String(b?.protocol ?? '').trim();
  const sortOrder = Number.isFinite(b?.sortOrder) ? Number(b.sortOrder) : 0;
  if (!title || !protocol) return NextResponse.json({ error: 'title and protocol required' }, { status: 400 });
  try {
    const r = await query(
      `INSERT INTO beta_experiments (code, title, protocol, sort_order) VALUES ($1, $2, $3, $4) RETURNING *`,
      [code, title, protocol, sortOrder]
    );
    return NextResponse.json({ experiment: r.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('[admin/beta-testers/experiments] POST error:', error);
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
  if ('code' in b) fields.code = b.code ? String(b.code).trim() : null;
  if (typeof b.title === 'string') fields.title = b.title.trim();
  if (typeof b.protocol === 'string') fields.protocol = b.protocol.trim();
  if (typeof b.active === 'boolean') fields.active = b.active;
  if (Number.isFinite(b?.sortOrder)) fields.sort_order = Number(b.sortOrder);
  if (Object.keys(fields).length === 0) return NextResponse.json({ error: 'no fields' }, { status: 400 });
  try {
    const row = await updateById('beta_experiments', id, fields, { touchUpdatedAt: true });
    return NextResponse.json({ experiment: row });
  } catch (error) {
    console.error('[admin/beta-testers/experiments] PATCH error:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  try {
    await query(`DELETE FROM beta_experiments WHERE id = $1`, [id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/beta-testers/experiments] DELETE error:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
