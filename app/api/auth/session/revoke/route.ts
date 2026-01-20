/**
 * Revoke Session
 *
 * POST /api/auth/session/revoke
 *
 * Signs out a specific session.
 */

export const dynamic = 'force-static' // Changed for Capacitor build compatibility;

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession, revokeSession } from '@/lib/auth/serverSessions';
import { logAuthEvent } from '@/lib/security/authAudit';

export async function POST(request: NextRequest) {
  try {
    const currentSession = await getCurrentSession();
    if (!currentSession) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Can't revoke current session through this endpoint
    if (sessionId === currentSession.id) {
      return NextResponse.json(
        { error: 'Use /api/auth/signout to end your current session' },
        { status: 400 }
      );
    }

    const success = await revokeSession(sessionId, 'remote_signout');

    if (!success) {
      return NextResponse.json(
        { error: 'Session not found or already revoked' },
        { status: 404 }
      );
    }

    await logAuthEvent({
      action: 'session_revoked',
      memberId: currentSession.memberId,
      result: 'success',
      metadata: { revokedSessionId: sessionId }
    }, request);

    return NextResponse.json({
      success: true,
      message: 'Session revoked'
    });

  } catch (error) {
    console.error('[Session] Revoke error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke session' },
      { status: 500 }
    );
  }
}
