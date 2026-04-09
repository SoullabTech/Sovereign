export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * DELETE /api/ideas/[id]/blocks/[bid] — Remove a single block.
 *
 * The trigger on member_idea_blocks only touches last_decision_at on INSERT,
 * so deleting a decision block does NOT clear last_decision_at. That's fine
 * for v1 — the field is a soft signal, not authoritative state.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; bid: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: ideaId, bid: blockId } = await params;
    if (!UUID_RE.test(ideaId) || !UUID_RE.test(blockId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const result = await query(
      `DELETE FROM member_idea_blocks
        WHERE id = $1 AND idea_id = $2 AND member_id = $3
      RETURNING id`,
      [blockId, ideaId, session.memberId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[member-ideas] Delete block failed:', error);
    return NextResponse.json({ error: 'Failed to delete block' }, { status: 500 });
  }
}

/**
 * PATCH /api/ideas/[id]/blocks/[bid] — Shallow-merge metadata on a block.
 *
 * Body: { metadata: object }
 *
 * Used for:
 *   - "Mark as tested" on decision blocks ({ metadata: { tested: true } })
 *   - Setting outcome on shift blocks after the fact ({ metadata: { outcome: 'worked' } })
 *
 * Shallow merge: metadata = metadata || $new. Top-level keys in the new
 * object overwrite; nothing at the old level is cleared unless you pass
 * an explicit null. Content itself is NOT editable via this route — use a
 * delete-and-recreate if rewriting is ever needed.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; bid: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: ideaId, bid: blockId } = await params;
    if (!UUID_RE.test(ideaId) || !UUID_RE.test(blockId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const body = (await request.json()) as { metadata?: unknown };
    if (
      !body.metadata ||
      typeof body.metadata !== 'object' ||
      Array.isArray(body.metadata)
    ) {
      return NextResponse.json({ error: 'metadata object required' }, { status: 400 });
    }

    const result = await query(
      `UPDATE member_idea_blocks
          SET metadata = metadata || $1::jsonb
        WHERE id = $2 AND idea_id = $3 AND member_id = $4
      RETURNING id, block_type, content, metadata, created_at`,
      [JSON.stringify(body.metadata), blockId, ideaId, session.memberId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, block: result.rows[0] });
  } catch (error) {
    console.error('[member-ideas] Patch block failed:', error);
    return NextResponse.json({ error: 'Failed to update block' }, { status: 500 });
  }
}
