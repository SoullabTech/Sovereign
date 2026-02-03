export const dynamic = 'force-dynamic';

/**
 * OAuth Exchange Endpoint
 *
 * POST /api/auth/exchange
 *
 * Exchanges a one-time code for session cookies.
 * This is the secure alternative to passing session tokens in URLs.
 *
 * The code is:
 * - Single-use (marked as used after exchange)
 * - Short-lived (5 minute expiry)
 * - Validated against the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';

const SESSION_COOKIE_NAME = 'maia_session';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ ok: false, error: 'Missing code' }, { status: 400 });
    }

    // Atomic claim: UPDATE + RETURNING prevents race conditions
    // If two requests hit simultaneously, only one gets the row
    const result = await query(
      `UPDATE auth_exchange_codes
       SET used_at = NOW()
       WHERE code = $1
         AND used_at IS NULL
         AND expires_at > NOW()
       RETURNING session_token, member_id`,
      [code]
    );

    if (result.rows.length === 0) {
      console.warn('[AUTH EXCHANGE] Invalid, expired, or already-used code');
      return NextResponse.json({ ok: false, error: 'Invalid or expired code' }, { status: 401 });
    }

    const { session_token: sessionToken, member_id: memberId } = result.rows[0];

    // Get the session expiry from auth_sessions
    const sessionResult = await query(
      `SELECT expires_at FROM auth_sessions WHERE session_token = $1`,
      [sessionToken]
    );

    if (sessionResult.rows.length === 0) {
      console.error('[AUTH EXCHANGE] Session not found for token');
      return NextResponse.json({ ok: false, error: 'Session not found' }, { status: 401 });
    }

    const expiresAt = new Date(sessionResult.rows[0].expires_at);

    // Set the session cookie (HttpOnly, secure)
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt
    });

    // Also set member ID cookie (used by some API routes)
    cookieStore.set('maia_member_id', memberId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt
    });

    console.log(`[AUTH EXCHANGE] Successfully exchanged code for member ${memberId}`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[AUTH EXCHANGE] error', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
