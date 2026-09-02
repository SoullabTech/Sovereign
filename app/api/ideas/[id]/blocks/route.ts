export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';
import { storeRecognitionEvent } from '@/lib/maia/decisionChangeRecognition';
import { IDEA_BLOCK_MAX_CHARS } from '@/lib/ideas/constants';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Does this block's metadata indicate it originated from a MAIA recognition
// invitation acceptance (client posts with source: 'maia_recognition')?
function isMaiaRecognitionOrigin(metadata: unknown): boolean {
  return (
    typeof metadata === 'object' &&
    metadata !== null &&
    !Array.isArray(metadata) &&
    (metadata as { source?: unknown }).source === 'maia_recognition'
  );
}

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
    if (content.length > IDEA_BLOCK_MAX_CHARS) {
      return NextResponse.json(
        {
          error: `Content too long (max ${IDEA_BLOCK_MAX_CHARS} chars)`,
          max_chars: IDEA_BLOCK_MAX_CHARS,
          received_chars: content.length,
        },
        { status: 400 }
      );
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

    // Fire-and-forget: if this block was created by accepting a MAIA
    // recognition invitation, log the invitation_accepted event. The event
    // log drives cooldown, quiet-zone, and dedup for future detection.
    // Non-blocking — the block creation succeeds regardless.
    if (
      (blockType === 'decision' || blockType === 'change') &&
      isMaiaRecognitionOrigin(metadata)
    ) {
      const recognitionStrength =
        (metadata as { recognition_strength?: unknown }).recognition_strength === 'medium'
          ? 'medium'
          : 'strong';
      storeRecognitionEvent({
        threadId: ideaId,
        memberId: session.memberId,
        eventType: 'invitation_accepted',
        signalKind: blockType,
        signalStrength: recognitionStrength,
        meta: {
          source: 'blocks_post',
          source_block_id:
            (metadata as { source_block_id?: string }).source_block_id ?? null,
          maia_reflection_block_id:
            (metadata as { maia_reflection_block_id?: string })
              .maia_reflection_block_id ?? null,
          created_block_id: result.rows[0].id,
        },
      });
    }

    return NextResponse.json({ success: true, block: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('[member-ideas] Add block failed:', error);
    return NextResponse.json({ error: 'Failed to add block' }, { status: 500 });
  }
}
