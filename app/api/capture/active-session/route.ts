export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';

/**
 * GET /api/capture/active-session  (USC-02)
 *
 * "Where would a capture land right now?"
 *
 * This is the endpoint a watch or Lock Screen widget polls to render session
 * state (SESSION 32:14) without holding a session id. It answers honestly when
 * nothing is eligible — a capture then lands in the personal inbox.
 *
 * A session is eligible only if it is active AND consent-confirmed. This route
 * never creates a session: the consent moment belongs to Session Room.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';
import { resolveActiveSessionTarget } from '@/lib/capture/sessionCapture';

export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const target = await resolveActiveSessionTarget(memberId);

    if (!target) {
      return NextResponse.json({
        success: true,
        active: false,
        binding: 'inbox',
        session: null,
        // Surfaces should say "saved to your captures", not "no session".
        captureDestination: 'Your captures',
      });
    }

    const elapsedMs = Date.now() - new Date(target.startedAt).getTime();

    return NextResponse.json({
      success: true,
      active: true,
      binding: 'session',
      session: {
        sessionId: target.sessionId,
        container: target.container,
        title: target.title,
        startedAt: target.startedAt,
        elapsedMs: Math.max(0, elapsedMs),
        memoryPolicy: target.memoryPolicy,
      },
      captureDestination: target.title || 'Current session',
    });
  } catch (error: any) {
    console.error('[capture] active-session failed:', error?.message);
    return NextResponse.json(
      { error: 'Failed to resolve active session', code: 'ACTIVE_SESSION_FAILED' },
      { status: 500 }
    );
  }
}
