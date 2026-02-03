export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';

/**
 * POST /api/scribe/stop
 *
 * End a scribe session and calculate duration.
 * Summary generation is handled separately.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
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
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required', code: 'MISSING_SESSION_ID' },
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
        { error: 'Session is already stopped', code: 'SESSION_ALREADY_STOPPED' },
        { status: 400 }
      );
    }

    // Calculate duration in seconds
    const now = new Date();
    const startedAt = session.started_at;
    const durationSeconds = Math.round((now.getTime() - startedAt.getTime()) / 1000);

    // Update session
    await query(
      `UPDATE scribe_sessions
       SET is_active = false,
           ended_at = NOW()
       WHERE id = $1`,
      [sessionId]
    );

    // Get marker count
    const markerResult = await query(
      `SELECT COUNT(*) as count FROM scribe_markers WHERE session_id = $1`,
      [sessionId]
    );
    const markerCount = parseInt(markerResult.rows[0]?.count || '0', 10);

    // Get transcript entry count (if any)
    const transcriptResult = await query(
      `SELECT COUNT(*) as count FROM scribe_transcript_entries WHERE session_id = $1`,
      [sessionId]
    );
    const transcriptCount = parseInt(transcriptResult.rows[0]?.count || '0', 10);

    console.log(
      `[Scribe] Session ${sessionId} stopped. Duration: ${durationSeconds}s, Markers: ${markerCount}, Transcript entries: ${transcriptCount}`
    );

    return NextResponse.json({
      success: true,
      sessionId,
      duration: durationSeconds,
      session: {
        id: sessionId,
        container: session.container,
        startedAt: session.started_at,
        endedAt: now,
        markerCount,
        transcriptCount,
      },
    });
  } catch (error: any) {
    console.error('[Scribe] Stop error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to stop session', code: 'STOP_FAILED' },
      { status: 500 }
    );
  }
}
