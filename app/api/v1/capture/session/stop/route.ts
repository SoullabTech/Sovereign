/**
 * Stop Capture Session
 * POST /api/v1/capture/session/stop
 *
 * 🔐 Server-side auth: userId derived from session cookie
 */

import { NextRequest, NextResponse } from 'next/server';
import { stopSession, getActiveSession } from '@/lib/capture/captureStore';
import { resolveCaptureUserId, withSessionCookie } from '@/lib/capture/captureAuth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId: bodyUserId, sessionId, orgId = 'soullab' } = body;

    // 🔐 Derive userId server-side (falls back to client in dev mode)
    const { userId, setCookie } = resolveCaptureUserId(request, bodyUserId);

    let targetSessionId = sessionId;

    // If no sessionId provided, find active session for user
    if (!targetSessionId) {
      const active = await getActiveSession(userId, orgId);
      if (!active) {
        return withSessionCookie(
          NextResponse.json({
            success: false,
            error: 'No active session found'
          }, { status: 404 }),
          setCookie
        );
      }
      targetSessionId = active.id;
    }

    const session = await stopSession(targetSessionId);

    if (!session) {
      return withSessionCookie(
        NextResponse.json({
          success: false,
          error: 'Session not found or already stopped'
        }, { status: 404 }),
        setCookie
      );
    }

    return withSessionCookie(
      NextResponse.json({
        success: true,
        session
      }),
      setCookie
    );

  } catch (error) {
    console.error('❌ [Capture] Stop session failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to stop capture session' },
      { status: 500 }
    );
  }
}
