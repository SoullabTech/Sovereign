export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/ideas/[id]/touch
 *
 * Bumps last_entered_at without loading the idea or any blocks.
 * Used by the "Return to this" button so the engagement signal updates
 * even when the member is already on the page (GET already touches
 * last_entered_at on load).
 *
 * Empty request body. Empty response beyond {success, last_entered_at}.
 */
export async function POST(
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
      `UPDATE member_ideas
          SET last_entered_at = NOW()
        WHERE id = $1 AND member_id = $2
      RETURNING last_entered_at`,
      [ideaId, session.memberId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      last_entered_at: result.rows[0].last_entered_at,
    });
  } catch (error) {
    console.error('[member-ideas] Touch failed:', error);
    return NextResponse.json({ error: 'Failed to touch idea' }, { status: 500 });
  }
}
