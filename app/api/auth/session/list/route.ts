/**
 * List Active Sessions
 *
 * GET /api/auth/session/list
 *
 * Returns all active sessions for the current member.
 */

export const dynamic = 'force-static'

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession, getMemberSessions } from '@/lib/auth/serverSessions';

export async function GET(request: NextRequest) {
  try {
    const currentSession = await getCurrentSession();
    if (!currentSession) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const sessions = await getMemberSessions(currentSession.memberId);

    const formattedSessions = sessions.map(session => ({
      id: session.id,
      deviceId: session.deviceId,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      lastActiveAt: session.lastActiveAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
      isCurrent: session.id === currentSession.id,
    }));

    return NextResponse.json({ sessions: formattedSessions });

  } catch (error) {
    console.error('[Session] List error:', error);
    return NextResponse.json(
      { error: 'Failed to list sessions' },
      { status: 500 }
    );
  }
}
