export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';

/**
 * POST /api/scribe/mark
 *
 * Add a moment marker to a scribe session.
 * Validates marker type against the session's container.
 */

import { NextRequest, NextResponse } from 'next/server';
import { insertOne } from '@/lib/db/postgres';
import {
  getMemberIdFromRequest,
  verifySessionOwnership,
  isValidMarkerType,
} from '@/lib/scribe/scribeAuth';

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
    const { sessionId, markerType, note, speaker } = body;

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

    // Check session is active and consent confirmed
    if (!session.is_active) {
      return NextResponse.json(
        { error: 'Session is not active', code: 'SESSION_INACTIVE' },
        { status: 400 }
      );
    }

    if (session.consent_status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Consent not confirmed', code: 'CONSENT_REQUIRED' },
        { status: 400 }
      );
    }

    // Validate marker type against container
    if (!isValidMarkerType(session.container, markerType)) {
      return NextResponse.json(
        {
          error: `Invalid marker type "${markerType}" for ${session.container} container`,
          code: 'INVALID_MARKER_TYPE',
        },
        { status: 400 }
      );
    }

    // Insert marker
    const markerData: Record<string, any> = {
      session_id: sessionId,
      marker_type: markerType || 'generic',
      marked_by: 'member',
    };

    if (note) markerData.note = note;
    if (speaker) markerData.speaker = speaker;

    const marker = await insertOne('scribe_markers', markerData);

    console.log(`[Scribe] Marked "${markerType || 'moment'}" in session ${sessionId}`);

    return NextResponse.json({
      success: true,
      markerId: marker.id,
      markedAt: marker.marked_at,
    });
  } catch (error: any) {
    console.error('[Scribe] Mark error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add marker', code: 'MARK_FAILED' },
      { status: 500 }
    );
  }
}
