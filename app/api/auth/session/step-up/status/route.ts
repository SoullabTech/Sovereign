// backend
import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';

const STEP_UP_WINDOW_SECONDS = 10 * 60; // 10 minutes

/**
 * GET /api/auth/session/step-up/status
 * Check if the current session has recent step-up authentication
 *
 * Authentication: Session cookie only
 */
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);

  if (!session?.id) {
    return NextResponse.json(
      { ok: false, recent: false, code: 'NO_SESSION' },
      { status: 401 }
    );
  }

  try {
    // Check for recent step-up authentication
    const result = await query(
      `SELECT last_step_up_at FROM auth_sessions WHERE id = $1`,
      [session.id]
    );

    const lastStepUp = result.rows[0]?.last_step_up_at;
    const lastTime = lastStepUp ? new Date(lastStepUp).getTime() : 0;
    const now = Date.now();
    const recent = lastTime > 0 && (now - lastTime) <= STEP_UP_WINDOW_SECONDS * 1000;

    return NextResponse.json({
      ok: true,
      recent,
      windowSeconds: STEP_UP_WINDOW_SECONDS,
      lastStepUpAt: lastStepUp || null,
    });
  } catch (error) {
    console.error('[Step-up Status] Error:', error);
    return NextResponse.json(
      { ok: false, recent: false, error: 'Failed to check step-up status' },
      { status: 500 }
    );
  }
}
