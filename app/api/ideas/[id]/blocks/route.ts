export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/ideas/[id]/blocks — Append a block to an idea.
 *
 * Body: { block_type: 'note'|'decision'|'change', content: string, metadata?: object }
 *
 * The trigger on member_idea_blocks will update member_ideas.last_decision_at
 * automatically when block_type = 'decision'.
 */
export async function POST(
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
      block_type?: unknown;
      content?: unknown;
      metadata?: unknown;
    };

    const blockType = typeof body.block_type === 'string' ? body.block_type : '';
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    const metadata =
      body.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata)
        ? body.metadata
        : {};

    if (!['note', 'decision', 'change'].includes(blockType)) {
      return NextResponse.json({ error: 'Invalid block_type' }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    if (content.length > 4000) {
      return NextResponse.json({ error: 'Content too long (max 4000 chars)' }, { status: 400 });
    }

    // Verify ownership before inserting a child row
    const ownership = await query(
      `SELECT id FROM member_ideas WHERE id = $1 AND member_id = $2`,
      [ideaId, session.memberId]
    );
    if (ownership.rows.length === 0) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }

    const result = await query(
      `INSERT INTO member_idea_blocks (idea_id, member_id, block_type, content, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, block_type, content, metadata, created_at`,
      [ideaId, session.memberId, blockType, content, JSON.stringify(metadata)]
    );

    // Touch last_entered_at so the idea bubbles up in the list
    await query(
      `UPDATE member_ideas SET last_entered_at = NOW() WHERE id = $1`,
      [ideaId]
    );

    return NextResponse.json({ success: true, block: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('[member-ideas] Add block failed:', error);
    return NextResponse.json({ error: 'Failed to add block' }, { status: 500 });
  }
}
