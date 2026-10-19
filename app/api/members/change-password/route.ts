export const dynamic = 'force-dynamic';

/**
 * Change Password Endpoint
 * Allows authenticated members to change their password
 *
 * Security:
 * - Validates session from httpOnly cookie
 * - Verifies current password using same hash function as signin
 * - Invalidates all other sessions after password change
 * - CSRF protection via Origin header check
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';
import { verifyPassword, hashPassword } from '@/lib/auth/passwordUtils';

interface SessionRow {
  member_id: string;
  expires_at: Date;
  revoked: boolean;
}

interface MemberRow {
  id: string;
  password_hash: string;
}

/**
 * Validate that request originates from our own domain (CSRF protection)
 */
function validateOrigin(request: NextRequest): boolean {
  // C0-PROXY: compare parsed origins for exact scheme, host and port.
  // Prefix checks admitted lookalikes such as soullab.life.attacker.invalid.
  const allowed = [
    'https://soullab.life',
    'https://www.soullab.life',
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'https://localhost:3000',
  ].filter((value): value is string => typeof value === 'string' && value.length > 0);

  const approvedOrigins = new Set(
    allowed.flatMap((value) => {
      try {
        const parsed = new URL(value);
        // A configured destination cannot supply authentication credentials.
        return parsed.username || parsed.password ? [] : [parsed.origin];
      } catch {
        return [];
      }
    })
  );

  const origin = request.headers.get('origin');
  if (origin !== null) {
    try {
      const parsed = new URL(origin);
      // The Origin header must itself be exactly a serialized origin,
      // never a path, userinfo, query, fragment or lookalike host.
      return parsed.href === parsed.origin + '/' &&
        origin === parsed.origin &&
        approvedOrigins.has(parsed.origin);
    } catch {
      return false;
    }
  }

  // Some compatible clients send Referer instead of Origin. Accept only the
  // same approved parsed origin; never allow an invalid Origin to fall back.
  const referer = request.headers.get('referer');
  if (!referer) return false;
  try {
    const parsed = new URL(referer);
    return !parsed.username && !parsed.password && approvedOrigins.has(parsed.origin);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // CSRF protection: validate request origin
    if (!validateOrigin(request)) {
      // Do not echo untrusted Origin/Referer: they may contain sensitive URLs.
      console.warn('[MEMBERS] Change password blocked: unapproved request origin');
      return NextResponse.json(
        { error: 'Invalid request origin' },
        { status: 403 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Get session from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('maia_session')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Validate session in database (strong verification)
    const sessionResult = await query<SessionRow>(
      `SELECT member_id, expires_at, revoked
       FROM auth_sessions
       WHERE session_token = $1`,
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const session = sessionResult.rows[0];

    if (session.revoked || new Date(session.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    // Get member's current password hash
    const memberResult = await query<MemberRow>(
      'SELECT id, password_hash FROM members WHERE id = $1',
      [session.member_id]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    const member = memberResult.rows[0];

    // Verify current password (auto-detects bcrypt vs legacy SHA256)
    const { ok } = await verifyPassword(currentPassword, member.password_hash);
    if (!ok) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 403 }
      );
    }

    // Update password with bcrypt
    const newPasswordHash = await hashPassword(newPassword);
    await query(
      'UPDATE members SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, member.id]
    );

    // Invalidate all OTHER sessions for this member (security best practice)
    // Keep the current session valid so user isn't logged out
    const revokedResult = await query(
      `UPDATE auth_sessions
       SET revoked = TRUE
       WHERE member_id = $1
         AND session_token != $2
         AND revoked = FALSE`,
      [member.id, token]
    );

    console.log(`[MEMBERS] Password changed for member: ${member.id}, revoked ${revokedResult.rowCount} other sessions`);

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MEMBERS] Change password error: ${message}`);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
