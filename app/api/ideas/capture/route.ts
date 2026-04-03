export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';

/**
 * POST /api/ideas/capture — Save a confirmed idea
 *
 * Sovereignty: Member identity is resolved server-side from the authenticated
 * session. The client sends only the idea content, never a memberId.
 *
 * Storage: Uses existing `creative_attempts` table with type='idea'.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      sourceText,
      confidence,
      conversationId,
    } = body as {
      title?: string;
      description?: string;
      sourceText?: string;
      confidence?: number;
      conversationId?: string;
    };

    if (!title && !description) {
      return NextResponse.json(
        { error: 'At least title or description is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO creative_attempts (
        member_id, type, title, content_text, status,
        source, capture_mode, confidence, conversation_id, source_excerpt
      ) VALUES ($1, 'idea', $2, $3, 'raw', 'conversation', 'heuristic_confirmed', $4, $5, $6)
      RETURNING id, title, content_text, created_at`,
      [
        session.memberId,
        title || null,
        description || null,
        confidence || null,
        conversationId || null,
        sourceText ? sourceText.slice(0, 500) : null,
      ]
    );

    const idea = result.rows[0];
    console.info('[idea-field] Idea saved:', {
      id: idea.id,
      memberId: session.memberId.slice(0, 8) + '...',
      title: title?.slice(0, 40),
    });

    return NextResponse.json({
      success: true,
      idea: {
        id: idea.id,
        title: idea.title,
        description: idea.content_text,
        createdAt: idea.created_at,
      },
    });
  } catch (error) {
    console.error('[idea-field] Capture failed:', error);
    return NextResponse.json(
      { error: 'Failed to capture idea' },
      { status: 500 }
    );
  }
}
