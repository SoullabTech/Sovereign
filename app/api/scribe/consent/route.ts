export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';

/**
 * POST /api/scribe/consent
 *
 * Confirm or decline recording consent for a scribe session.
 * If declined, the session is deactivated immediately.
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
    const { sessionId, confirmed, method = 'voice' } = body;

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

    // Update consent status
    const consentStatus = confirmed ? 'confirmed' : 'declined';

    if (confirmed) {
      // Confirm consent
      await query(
        `UPDATE scribe_sessions
         SET consent_status = $1,
             consent_confirmed_at = NOW(),
             consent_method = $2
         WHERE id = $3`,
        [consentStatus, method, sessionId]
      );
    } else {
      // Decline consent - also deactivate the session
      await query(
        `UPDATE scribe_sessions
         SET consent_status = $1,
             consent_confirmed_at = NOW(),
             consent_method = $2,
             is_active = false,
             ended_at = NOW()
         WHERE id = $3`,
        [consentStatus, method, sessionId]
      );
    }

    console.log(`[Scribe] Consent ${consentStatus} for session ${sessionId}`);

    return NextResponse.json({
      success: true,
      sessionId,
      consentStatus,
    });
  } catch (error: any) {
    console.error('[Scribe] Consent error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update consent', code: 'CONSENT_FAILED' },
      { status: 500 }
    );
  }
}
