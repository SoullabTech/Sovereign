export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';

/**
 * POST /api/scribe/pause
 *
 * Pause or resume a scribe session.
 * Creates a marker to track when the session was paused/resumed.
 */

import { NextRequest, NextResponse } from 'next/server';
import { insertOne } from '@/lib/db/postgres';
import { getMemberIdFromRequest, verifySessionOwnership } from '@/lib/scribe/scribeAuth';

export async function POST(request: NextRequest) {
  try {
    // Auth: Get member ID from session
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { sessionId, action } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required', code: 'MISSING_SESSION_ID' },
        { status: 400 }
      );
    }

    if (!['pause', 'resume'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "pause" or "resume"', code: 'INVALID_ACTION' },
        { status: 400 }
      );
    }

    // Verify ownership
    const session = await verifySessionOwnership(sessionId, memberId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or not owned by member', code: 'SESSION_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check session is active
    if (!session.is_active) {
      return NextResponse.json(
        { error: 'Session is not active', code: 'SESSION_INACTIVE' },
        { status: 400 }
      );
    }

    // Insert marker for pause/resume
    const marker = await insertOne('scribe_markers', {
      session_id: sessionId,
      marker_type: action,
      marked_by: 'member',
    });

    console.log(`[Scribe] Session ${sessionId} ${action}d`);

    return NextResponse.json({
      success: true,
      sessionId,
      isPaused: action === 'pause',
      markerId: marker.id,
    });
  } catch (error: any) {
    console.error('[Scribe] Pause error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to pause/resume session', code: 'PAUSE_FAILED' },
      { status: 500 }
    );
  }
}
