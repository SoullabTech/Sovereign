export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';
import { IDEA_BLOCK_MAX_CHARS } from '@/lib/ideas/constants';

/**
 * POST /api/ideas/capture — Compat wrapper for the in-conversation idea capture toast.
 *
 * This was originally wired to `creative_attempts` (the migration that added
 * fields for it was never applied cleanly). It now targets `member_ideas`,
 * the proper iterative-idea workspace introduced in migration
 * 20260409000001_member_ideas.sql.
 *
 * Creates:
 *   - A new member_ideas row (title + framing from description)
 *   - An initial 'note' block containing the source excerpt, with
 *     metadata.{source='conversation', conversationId, confidence}
 *     so we preserve the capture provenance without needing new columns.
 *
 * Keeps the original request shape so existing callers in
 * components/OracleConversation.tsx do not need to change.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as {
      title?: string;
      description?: string;
      sourceText?: string;
      confidence?: number;
      conversationId?: string;
    };

    const title = (body.title || '').trim();
    const description = (body.description || '').trim() || null;
    const sourceText = (body.sourceText || '').trim() || null;

    if (!title && !description) {
      return NextResponse.json(
        { error: 'At least title or description is required' },
        { status: 400 }
      );
    }

    // Use title if provided, otherwise synthesize one from the first line of description
    const ideaTitle = title || (description ? description.split('\n')[0].slice(0, 120) : 'Untitled idea');
    const ideaFraming = description && description !== ideaTitle ? description : null;

    // Create the idea
    const ideaResult = await query(
      `INSERT INTO member_ideas (member_id, title, framing)
       VALUES ($1, $2, $3)
       RETURNING id, title, framing, created_at`,
      [session.memberId, ideaTitle.slice(0, 200), ideaFraming]
    );
    const idea = ideaResult.rows[0];

    // Attach an initial note block with the source excerpt + capture metadata
    if (sourceText) {
      const metadata = {
        source: 'conversation',
        capture_mode: 'heuristic_confirmed',
        conversationId: body.conversationId || null,
        confidence: typeof body.confidence === 'number' ? body.confidence : null,
      };
      await query(
        `INSERT INTO member_idea_blocks (idea_id, member_id, block_type, content, metadata)
         VALUES ($1, $2, 'note', $3, $4)`,
        [idea.id, session.memberId, sourceText.slice(0, IDEA_BLOCK_MAX_CHARS), JSON.stringify(metadata)]
      );
    }

    return NextResponse.json({
      success: true,
      idea: {
        id: idea.id,
        title: idea.title,
        description: idea.framing,
        createdAt: idea.created_at,
      },
    });
  } catch (error) {
    console.error('[member-ideas/capture] Failed:', error);
    return NextResponse.json(
      { error: 'Failed to capture idea' },
      { status: 500 }
    );
  }
}
