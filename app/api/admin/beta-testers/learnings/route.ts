export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireAdmin, isGateResponse } from '@/lib/beta-testers/requireAdmin';
import { updateById } from '@/lib/beta-testers/adminUpdate';

const VALID_VISIBILITY = ['admin_only', 'cohort'];

/** GET all shared learnings (admin sees drafts + cohort-visible). */
export async function GET(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  try {
    const r = await query(
      `SELECT id, title, body, source_observation_id, visibility, published_at, created_at
         FROM beta_shared_learnings ORDER BY created_at DESC`
    );
    return NextResponse.json({ learnings: r.rows });
  } catch (error) {
    console.error('[admin/beta-testers/learnings] GET error:', error);
    return NextResponse.json({ learnings: [] });
  }
}

/** POST create (optionally promoted from an observation via sourceObservationId). */
export async function POST(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  const b = await request.json().catch(() => ({}));
  const title = String(b?.title ?? '').trim();
  const body = String(b?.body ?? '').trim();
  const sourceObservationId = b?.sourceObservationId ? String(b.sourceObservationId) : null;
  const visibility = b?.visibility ? String(b.visibility) : 'admin_only';
  const publish = Boolean(b?.publish);
  if (!title || !body) return NextResponse.json({ error: 'title and body required' }, { status: 400 });
  if (!VALID_VISIBILITY.includes(visibility)) return NextResponse.json({ error: 'invalid visibility' }, { status: 400 });
  try {
    const r = await query(
      `INSERT INTO beta_shared_learnings
        (title, body, source_observation_id, curated_by_member_id, visibility, published_at)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, body, sourceObservationId, gate.memberId, visibility, publish ? new Date() : null]
    );
    return NextResponse.json({ learning: r.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('[admin/beta-testers/learnings] POST error:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

/** PATCH update (title, body, visibility, publish). */
export async function PATCH(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  const b = await request.json().catch(() => ({}));
  const id = String(b?.id ?? '');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const fields: Record<string, unknown> = {};
  if (typeof b.title === 'string') fields.title = b.title.trim();
  if (typeof b.body === 'string') fields.body = b.body.trim();
  if ('visibility' in b) {
    const v = String(b.visibility);
    if (!VALID_VISIBILITY.includes(v)) return NextResponse.json({ error: 'invalid visibility' }, { status: 400 });
    fields.visibility = v;
  }
  if (typeof b.publish === 'boolean') fields.published_at = b.publish ? new Date() : null;
  if (Object.keys(fields).length === 0) return NextResponse.json({ error: 'no fields' }, { status: 400 });

  try {
    // beta_shared_learnings has no updated_at column — do not touch it.
    const row = await updateById('beta_shared_learnings', id, fields);
    return NextResponse.json({ learning: row });
  } catch (error) {
    console.error('[admin/beta-testers/learnings] PATCH error:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  try {
    await query(`DELETE FROM beta_shared_learnings WHERE id = $1`, [id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/beta-testers/learnings] DELETE error:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
