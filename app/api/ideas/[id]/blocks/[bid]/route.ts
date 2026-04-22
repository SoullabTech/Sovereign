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
 * PATCH /api/ideas/[id]/blocks/[bid] — Shallow-merge metadata, or convert
 * a note into a decision/shift (block_type swap).
 *
 * Body: { metadata?: object, block_type?: 'decision' | 'change' }
 *
 * Used for:
 *   - "Mark as tested" on decision blocks ({ metadata: { tested: true } })
 *   - Setting outcome on shift blocks after the fact ({ metadata: { outcome: 'worked' } })
 *   - Post-hoc structuring: convert a freeform note into a Decision or Shift
 *     ({ block_type: 'decision' } or { block_type: 'change' })
 *
 * Conversion constraints (enforced in TS and SQL):
 *   - Only `note` blocks may be converted
 *   - Only `note → decision` or `note → change` allowed
 *   - MAIA-authored `maia_reflection` blocks are never convertible (trust boundary)
 *   - No reverse transitions (decision → note, etc.)
 *
 * Shallow merge semantics unchanged: metadata = metadata || $new. Content
 * itself is NOT editable — use delete-and-recreate if rewriting is needed.
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

    const body = (await request.json()) as {
      metadata?: unknown;
      block_type?: unknown;
    };

    const hasMetadata =
      body.metadata !== undefined &&
      body.metadata !== null &&
      typeof body.metadata === 'object' &&
      !Array.isArray(body.metadata);

    const hasBlockType = body.block_type !== undefined;

    if (!hasMetadata && !hasBlockType) {
      return NextResponse.json(
        { error: 'metadata or block_type required' },
        { status: 400 }
      );
    }

    let newBlockType: 'decision' | 'change' | null = null;
    if (hasBlockType) {
      if (body.block_type !== 'decision' && body.block_type !== 'change') {
        return NextResponse.json(
          { error: 'block_type conversion limited to decision or change' },
          { status: 400 }
        );
      }
      newBlockType = body.block_type;
    }

    const metadataJson = hasMetadata ? JSON.stringify(body.metadata) : '{}';

    // The `($1::text IS NULL OR block_type = 'note')` clause enforces that
    // block_type swaps are only permitted on note blocks. If the caller
    // didn't request a type change, $1 is NULL and the guard is bypassed.
    const result = await query(
      `UPDATE member_idea_blocks
          SET block_type = COALESCE($1::text, block_type),
              metadata   = metadata || $2::jsonb
        WHERE id = $3 AND idea_id = $4 AND member_id = $5
          AND ($1::text IS NULL OR block_type = 'note')
      RETURNING id, block_type, content, metadata, created_at`,
      [newBlockType, metadataJson, blockId, ideaId, session.memberId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          error: hasBlockType
            ? 'Block not found, or conversion not allowed (only note → decision/change)'
            : 'Block not found',
        },
        { status: 404 }
      );
    }

    // If converting to decision, touch the parent idea so the decision
    // strip surfaces it. (The INSERT trigger only fires on new rows.)
    if (newBlockType === 'decision') {
      await query(
        `UPDATE member_ideas
            SET last_decision_at = NOW()
          WHERE id = $1 AND member_id = $2`,
        [ideaId, session.memberId]
      );
    }

    return NextResponse.json({ success: true, block: result.rows[0] });
  } catch (error) {
    console.error('[member-ideas] Patch block failed:', error);
    return NextResponse.json({ error: 'Failed to update block' }, { status: 500 });
  }
}
