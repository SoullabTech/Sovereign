// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * Soullab Press — Collections (member-authored developmental containers).
 *
 * POST  { name }                                — create a collection.
 * PATCH { collectionId, keepId, op }            — 'place' | 'remove' a keep.
 * DELETE ?collectionId=                          — remove a collection (items cascade; keeps survive).
 *
 * DOCTRINE (Gatherings ruling, spec §0.4):
 *   - The system may NEVER create a collection. Only this member-called route
 *     writes one, and the name arrives from the request body — there are no
 *     defaults, templates, or suggestions anywhere in the stack. An empty
 *     field and a cursor; naming is already interpretation, so naming is hers.
 *   - Placement is authored, not inferred. Only explicit member ops move keeps.
 *   - Report when pulled, never notice when idle: collection facts (counts,
 *     chapter distribution) are computed in the GET detail route the member
 *     opens — never pushed, never notified.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { memberRef } from '@/lib/privacy/memberRef';

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await ctx.params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { name } = (body ?? {}) as { name?: unknown };
    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const owns = await query(
      `SELECT 1 FROM member_manuscripts WHERE id = $1 AND member_id = $2`,
      [id, memberId],
    );
    if (owns.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const result = await query<{ id: string; created_at: string }>(
      `INSERT INTO manuscript_collections (member_id, manuscript_id, name)
       VALUES ($1, $2, $3) RETURNING id, created_at`,
      [memberId, id, name.trim()],
    );
    console.log(
      `[MAIA/press] collection created { memberRef: ${memberRef(memberId)}, ` +
        `manuscriptId: ${id}, collectionId: ${result.rows[0].id} }`,
    );
    return NextResponse.json(
      { collection: { id: result.rows[0].id, name: name.trim(), createdAt: result.rows[0].created_at } },
      { status: 201 },
    );
  } catch (err) {
    console.error('[press/manuscripts/:id/collections] POST error:', err);
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await ctx.params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { collectionId, keepId, op } = (body ?? {}) as {
      collectionId?: unknown;
      keepId?: unknown;
      op?: unknown;
    };
    if (
      typeof collectionId !== 'string' ||
      typeof keepId !== 'string' ||
      (op !== 'place' && op !== 'remove')
    ) {
      return NextResponse.json(
        { error: "collectionId, keepId, and op ('place' | 'remove') are required" },
        { status: 400 },
      );
    }

    // Both objects must belong to this member and this manuscript.
    const owns = await query(
      `SELECT 1
         FROM manuscript_collections c
         JOIN manuscript_keeps k ON k.manuscript_id = c.manuscript_id
        WHERE c.id = $1 AND k.id = $2 AND c.manuscript_id = $3
          AND c.member_id = $4 AND k.member_id = $4`,
      [collectionId, keepId, id, memberId],
    );
    if (owns.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (op === 'place') {
      await query(
        `INSERT INTO manuscript_collection_items (collection_id, keep_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [collectionId, keepId],
      );
    } else {
      await query(
        `DELETE FROM manuscript_collection_items WHERE collection_id = $1 AND keep_id = $2`,
        [collectionId, keepId],
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[press/manuscripts/:id/collections] PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update placement' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await ctx.params;
    const collectionId = request.nextUrl.searchParams.get('collectionId');
    if (!collectionId) return NextResponse.json({ error: 'collectionId is required' }, { status: 400 });

    const result = await query(
      `DELETE FROM manuscript_collections WHERE id = $1 AND manuscript_id = $2 AND member_id = $3`,
      [collectionId, id, memberId],
    );
    if ((result.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ removed: true });
  } catch (err) {
    console.error('[press/manuscripts/:id/collections] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to remove collection' }, { status: 500 });
  }
}
