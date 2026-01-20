// backend
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';

/**
 * POST /api/auth/session/step-up/mark
 * Mark the current session as having completed step-up authentication
 *
 * Authentication: Session cookie only
 * Note: This should only be called after successful passkey re-authentication
 */
export async function POST(req: NextRequest) {
  const session = await getCurrentSession();

  if (!session?.id) {
    return NextResponse.json(
      { error: 'Session required', code: 'NO_SESSION' },
      { status: 401 }
    );
  }

  try {
    await query(
      `UPDATE auth_sessions SET last_step_up_at = NOW() WHERE id = $1`,
      [session.id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Step-up Mark] Error:', error);
    return NextResponse.json(
      { error: 'Failed to mark step-up' },
      { status: 500 }
    );
  }
}
