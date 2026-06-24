export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireAdmin, isGateResponse } from '@/lib/beta-testers/requireAdmin';
import { updateById } from '@/lib/beta-testers/adminUpdate';

const VALID_STATUS = ['considering', 'building', 'wired', 'surfacing', 'verified', 'shipped'];

export async function GET(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  try {
    const r = await query(
      `SELECT id, title, description, status, category, sort_order, updated_at
         FROM beta_roadmap_items ORDER BY sort_order ASC, updated_at DESC`
    );
    return NextResponse.json({ items: r.rows });
  } catch (error) {
    console.error('[admin/beta-testers/roadmap] GET error:', error);
    return NextResponse.json({ items: [] });
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  const b = await request.json().catch(() => ({}));
  const title = String(b?.title ?? '').trim();
  const description = String(b?.description ?? '').trim();
  const status = b?.status ? String(b.status) : 'considering';
  const category = b?.category ? String(b.category).trim() : null;
  const sortOrder = Number.isFinite(b?.sortOrder) ? Number(b.sortOrder) : 0;
  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 });
  if (!VALID_STATUS.includes(status)) return NextResponse.json({ error: 'invalid status' }, { status: 400 });
  try {
    const r = await query(
      `INSERT INTO beta_roadmap_items (title, description, status, category, sort_order)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description, status, category, sortOrder]
    );
    return NextResponse.json({ item: r.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('[admin/beta-testers/roadmap] POST error:', error);
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
  if (typeof b.description === 'string') fields.description = b.description.trim();
  if ('status' in b) {
    const st = String(b.status);
    if (!VALID_STATUS.includes(st)) return NextResponse.json({ error: 'invalid status' }, { status: 400 });
    fields.status = st;
  }
  if ('category' in b) fields.category = b.category ? String(b.category).trim() : null;
  if (Number.isFinite(b?.sortOrder)) fields.sort_order = Number(b.sortOrder);
  if (Object.keys(fields).length === 0) return NextResponse.json({ error: 'no fields' }, { status: 400 });

  try {
    const row = await updateById('beta_roadmap_items', id, fields, { touchUpdatedAt: true });
    return NextResponse.json({ item: row });
  } catch (error) {
    console.error('[admin/beta-testers/roadmap] PATCH error:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  try {
    await query(`DELETE FROM beta_roadmap_items WHERE id = $1`, [id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/beta-testers/roadmap] DELETE error:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
