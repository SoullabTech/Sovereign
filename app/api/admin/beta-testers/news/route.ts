export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireAdmin, isGateResponse } from '@/lib/beta-testers/requireAdmin';
import { updateById } from '@/lib/beta-testers/adminUpdate';

/** GET all news (including unpublished drafts). */
export async function GET(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  try {
    const r = await query(
      `SELECT id, title, body, published, published_at, created_at, updated_at
         FROM beta_news ORDER BY created_at DESC`
    );
    return NextResponse.json({ news: r.rows });
  } catch (error) {
    console.error('[admin/beta-testers/news] GET error:', error);
    return NextResponse.json({ news: [] });
  }
}

/** POST create. */
export async function POST(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  const b = await request.json().catch(() => ({}));
  const title = String(b?.title ?? '').trim();
  const body = String(b?.body ?? '').trim();
  const published = Boolean(b?.published);
  if (!title || !body) return NextResponse.json({ error: 'title and body required' }, { status: 400 });
  try {
    const r = await query(
      `INSERT INTO beta_news (title, body, published, published_at, author_member_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, body, published, published ? new Date() : null, gate.memberId]
    );
    return NextResponse.json({ news: r.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('[admin/beta-testers/news] POST error:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

/** PATCH update (title, body, published). */
export async function PATCH(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  const b = await request.json().catch(() => ({}));
  const id = String(b?.id ?? '');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const fields: Record<string, unknown> = {};
  if (typeof b.title === 'string') fields.title = b.title.trim();
  if (typeof b.body === 'string') fields.body = b.body.trim();
  if (typeof b.published === 'boolean') {
    fields.published = b.published;
    fields.published_at = b.published ? new Date() : null;
  }
  if (Object.keys(fields).length === 0) return NextResponse.json({ error: 'no fields' }, { status: 400 });

  try {
    const row = await updateById('beta_news', id, fields, { touchUpdatedAt: true });
    return NextResponse.json({ news: row });
  } catch (error) {
    console.error('[admin/beta-testers/news] PATCH error:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

/** DELETE ?id= */
export async function DELETE(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  try {
    await query(`DELETE FROM beta_news WHERE id = $1`, [id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/beta-testers/news] DELETE error:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
