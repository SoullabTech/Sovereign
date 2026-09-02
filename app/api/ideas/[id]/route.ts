export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Single column list so every response shape stays identical. seed / title_source
// / proposed_titles are Cut 1 (20260902000001) — the seed records where the
// inquiry began, the title records what it has become, and they are allowed to
// diverge without either overwriting the other.
const IDEA_COLUMNS = `id, title, framing, status, tags, created_at, updated_at,
       last_entered_at, last_decision_at, seed, seed_block_id, title_source,
       proposed_titles, proposed_titles_at`;

/**
 * GET /api/ideas/[id]
 *
 * Returns the idea and all its blocks in chronological order (oldest first).
 * Touches last_entered_at so "return to idea" remains the primary engagement signal.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: ideaId } = await params;
    if (!UUID_RE.test(ideaId)) {
      return NextResponse.json({ error: 'Invalid idea id' }, { status: 400 });
    }

    // Touch last_entered_at as we load — this is the signal of real engagement.
    const ideaResult = await query(
      `UPDATE member_ideas
          SET last_entered_at = NOW()
        WHERE id = $1 AND member_id = $2
      RETURNING ${IDEA_COLUMNS}`,
      [ideaId, session.memberId]
    );

    if (ideaResult.rows.length === 0) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }

    const blocksResult = await query(
      `SELECT id, block_type, content, metadata, created_at
         FROM member_idea_blocks
        WHERE idea_id = $1
        ORDER BY created_at ASC`,
      [ideaId]
    );

    return NextResponse.json({
      success: true,
      idea: ideaResult.rows[0],
      blocks: blocksResult.rows,
    });
  } catch (error) {
    console.error('[member-ideas] Get failed:', error);
    return NextResponse.json({ error: 'Failed to load idea' }, { status: 500 });
  }
}

/**
 * PATCH /api/ideas/[id]
 *
 * Body: { title?, framing?, status? }
 * Partial update — only the fields supplied are changed.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: ideaId } = await params;
    if (!UUID_RE.test(ideaId)) {
      return NextResponse.json({ error: 'Invalid idea id' }, { status: 400 });
    }

    const body = (await request.json()) as {
      title?: unknown;
      framing?: unknown;
      status?: unknown;
      accept_proposed_title?: unknown;
      dismiss_proposed_titles?: unknown;
    };

    const updates: string[] = [];
    const values: unknown[] = [];

    // ── The ratification boundary ────────────────────────────────────────────
    // Renaming happens here and only here. `accept_proposed_title` is the
    // member accepting one of MAIA's suggestions — and it is verified against
    // the stored proposals, so an arbitrary string cannot be laundered through
    // this path as if MAIA had offered it.
    if (typeof body.accept_proposed_title === 'string') {
      const chosen = body.accept_proposed_title.trim();
      const stored = await query<{ proposed_titles: string[] }>(
        `SELECT proposed_titles FROM member_ideas WHERE id = $1 AND member_id = $2`,
        [ideaId, session.memberId]
      );
      if (stored.rows.length === 0) {
        return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
      }
      if (!(stored.rows[0].proposed_titles ?? []).includes(chosen)) {
        return NextResponse.json(
          { error: 'That name is not one of the current suggestions' },
          { status: 400 }
        );
      }
      values.push(chosen);
      updates.push(`title = $${values.length}`);
      updates.push(`title_source = 'maia_accepted'`);
      updates.push(`proposed_titles = '{}'`);
      updates.push(`proposed_titles_at = NULL`);
    }

    if (typeof body.title === 'string') {
      const title = body.title.trim();
      if (!title) {
        return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
      }
      if (title.length > 200) {
        return NextResponse.json({ error: 'Title too long (max 200 chars)' }, { status: 400 });
      }
      values.push(title);
      updates.push(`title = $${values.length}`);
      // A person typed it. Whatever it was before — auto-derived or accepted —
      // it is now named.
      updates.push(`title_source = 'member'`);
      updates.push(`proposed_titles = '{}'`);
      updates.push(`proposed_titles_at = NULL`);
    }

    if (body.dismiss_proposed_titles === true) {
      updates.push(`proposed_titles = '{}'`);
      updates.push(`proposed_titles_at = NULL`);
    }

    if (body.framing !== undefined) {
      const framing = typeof body.framing === 'string' ? body.framing.trim() : null;
      values.push(framing || null);
      updates.push(`framing = $${values.length}`);
    }

    if (typeof body.status === 'string') {
      if (!['active', 'parked', 'integrated'].includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      values.push(body.status);
      updates.push(`status = $${values.length}`);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(ideaId, session.memberId);
    const result = await query(
      `UPDATE member_ideas
          SET ${updates.join(', ')}
        WHERE id = $${values.length - 1} AND member_id = $${values.length}
      RETURNING ${IDEA_COLUMNS}`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, idea: result.rows[0] });
  } catch (error) {
    console.error('[member-ideas] Update failed:', error);
    return NextResponse.json({ error: 'Failed to update idea' }, { status: 500 });
  }
}

/**
 * DELETE /api/ideas/[id]
 *
 * Cascades to all blocks via FK ON DELETE CASCADE.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: ideaId } = await params;
    if (!UUID_RE.test(ideaId)) {
      return NextResponse.json({ error: 'Invalid idea id' }, { status: 400 });
    }

    const result = await query(
      `DELETE FROM member_ideas WHERE id = $1 AND member_id = $2 RETURNING id`,
      [ideaId, session.memberId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[member-ideas] Delete failed:', error);
    return NextResponse.json({ error: 'Failed to delete idea' }, { status: 500 });
  }
}
