/**
 * Start Capture Session
 * POST /api/v1/capture/session/start
 *
 * 🔐 Server-side auth: userId derived from session cookie
 */

import { NextRequest, NextResponse } from 'next/server';
import { startSession, getActiveSession } from '@/lib/capture/captureStore';
import { resolveCaptureUserId, withSessionCookie } from '@/lib/capture/captureAuth';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId: bodyUserId, orgId = 'soullab', autoStarted = false } = body;

    // 🔐 Derive userId server-side (falls back to client in dev mode)
    const { userId, setCookie } = resolveCaptureUserId(request, bodyUserId);

    // Check if user already has an active session
    const existing = await getActiveSession(userId, orgId);
    if (existing) {
      return withSessionCookie(
        NextResponse.json({
          success: true,
          session: existing,
          alreadyActive: true
        }),
        setCookie
      );
    }

    const session = await startSession(userId, orgId, autoStarted);

    return withSessionCookie(
      NextResponse.json({
        success: true,
        session,
        alreadyActive: false
      }),
      setCookie
    );

  } catch (error) {
    console.error('❌ [Capture] Start session failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start capture session' },
      { status: 500 }
    );
  }
}
