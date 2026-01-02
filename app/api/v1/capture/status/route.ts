/**
 * Capture Status
 * GET /api/v1/capture/status
 *
 * 🔐 Server-side auth: userId derived from session cookie
 *
 * Returns active session and recent notes
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getActiveSession,
  getSessionNotes,
  getRecentSessions
} from '@/lib/capture/captureStore';
import { resolveCaptureUserIdFromQuery, withSessionCookie } from '@/lib/capture/captureAuth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId') || 'soullab';

    // 🔐 Derive userId server-side (falls back to query param in dev mode)
    const { userId, setCookie } = resolveCaptureUserIdFromQuery(request);

    // Get active session
    const activeSession = await getActiveSession(userId, orgId);

    // Get notes for active session
    let notes: Awaited<ReturnType<typeof getSessionNotes>> = [];
    if (activeSession) {
      notes = await getSessionNotes(activeSession.id);
    }

    // Get recent sessions
    const recentSessions = await getRecentSessions(userId, 5, orgId);

    return withSessionCookie(
      NextResponse.json({
        success: true,
        active: activeSession !== null,
        session: activeSession,
        notes,
        noteCount: notes.length,
        recentSessions: recentSessions.filter(s => s.id !== activeSession?.id)
      }),
      setCookie
    );

  } catch (error) {
    console.error('❌ [Capture] Status check failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get capture status' },
      { status: 500 }
    );
  }
}
