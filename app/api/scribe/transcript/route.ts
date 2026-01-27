export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';

/**
 * POST /api/scribe/transcript
 *
 * Append a transcript entry to a scribe session.
 * Only works if transcript is enabled and consent is confirmed.
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
    const { sessionId, speaker, content, participantLabel, spokenAt } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required', code: 'MISSING_SESSION_ID' },
        { status: 400 }
      );
    }

    if (!speaker) {
      return NextResponse.json(
        { error: 'Speaker required', code: 'MISSING_SPEAKER' },
        { status: 400 }
      );
    }

    if (!['self', 'other', 'maia', 'unknown'].includes(speaker)) {
      return NextResponse.json(
        { error: 'Invalid speaker value', code: 'INVALID_SPEAKER' },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content required', code: 'MISSING_CONTENT' },
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

    // Check session state
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

    if (!session.transcript_enabled) {
      return NextResponse.json(
        { error: 'Transcript not enabled for this session', code: 'TRANSCRIPT_DISABLED' },
        { status: 400 }
      );
    }

    // Insert transcript entry
    const entryData: Record<string, any> = {
      session_id: sessionId,
      speaker,
      content: content.trim(),
      spoken_at: spokenAt ? new Date(spokenAt) : new Date(),
    };

    if (participantLabel) {
      entryData.participant_label = participantLabel;
    }

    const entry = await insertOne('scribe_transcript_entries', entryData);

    return NextResponse.json({
      success: true,
      entryId: entry.id,
    });
  } catch (error: any) {
    console.error('[Scribe] Transcript error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to append transcript', code: 'TRANSCRIPT_FAILED' },
      { status: 500 }
    );
  }
}
