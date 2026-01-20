// backend
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';

/**
 * POST /api/auth/session/revoke-others
 * Revoke all sessions except the current one
 *
 * Authentication: Session cookie only
 */
export async function POST(req: NextRequest) {
  const session = await getCurrentSession();

  if (!session?.memberId || !session?.id) {
    return NextResponse.json(
      { error: 'Session required', code: 'NO_SESSION', action: 'signin' },
      { status: 401 }
    );
  }

  try {
    // Revoke all other sessions for this member
    const result = await query(
      `UPDATE auth_sessions
       SET revoked = TRUE, revoked_at = NOW(), revoked_reason = 'bulk_revoke'
       WHERE member_id = $1
         AND id <> $2
         AND revoked = FALSE`,
      [session.memberId, session.id]
    );

    return NextResponse.json({
      success: true,
      revokedCount: result.rowCount || 0,
    });
  } catch (error) {
    console.error('[Session Revoke Others] Error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke sessions' },
      { status: 500 }
    );
  }
}
