// Production requires force-dynamic for database access
export const dynamic = 'force-dynamic'

/**
 * Password Reset Flow
 * POST /api/members/reset-password - RETIRED: sends nothing (see handler)
 * PUT /api/members/reset-password - Confirm a founder-issued reset link
 * GET /api/members/reset-password?token= - Validate a reset link
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { hashPassword } from '@/lib/auth/passwordUtils';
import {
  checkRateLimit,
  getClientIP,
  buildRateLimitHeaders
} from '@/lib/auth/rateLimiter';

const ENDPOINT = '/api/members/reset-password';

/**
 * POST - Former "request a reset link" door. RETIRED.
 *
 * The managed mail boundary admits only the sign-in code (`auth:email-code`),
 * so this route could never deliver a reset link; for a real member it
 * minted a token, failed the send, and answered 502, which also told the
 * caller that the address belongs to a member. Self-serve recovery is now the
 * email sign-in code (/signin?method=code).
 *
 * This handler therefore does nothing: it reads no member, writes no token,
 * sends no mail, logs no address, and answers the same for every input.
 * Founder-issued reset links (admin reset-link route) still land on
 * /reset-password?token= and are confirmed by PUT below.
 */
export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in app build' }, { status: 503 });
  }

  const clientIP = getClientIP(request);
  const rateLimitResult = await checkRateLimit(clientIP, 'ip', ENDPOINT);
  if (!rateLimitResult.allowed) {
    const headers = buildRateLimitHeaders(rateLimitResult);
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Password reset links are no longer emailed. Use "Email me a sign-in code" on the sign-in page.',
    signInPath: '/signin?method=code',
  });
}

/**
 * PUT - Confirm password reset
 * Validates token and updates password
 */
export async function PUT(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Find valid token
    const tokenResult = await query(
      `SELECT t.id, t.member_id, m.username, m.name
       FROM password_reset_tokens t
       JOIN members m ON t.member_id = m.id
       WHERE t.token = $1
         AND t.used = false
         AND t.expires_at > NOW()`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      );
    }

    const tokenRecord = tokenResult.rows[0];

    // Update password with bcrypt
    const passwordHash = await hashPassword(password);
    await query(
      'UPDATE members SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, tokenRecord.member_id]
    );

    // Mark token as used
    await query(
      'UPDATE password_reset_tokens SET used = true WHERE id = $1',
      [tokenRecord.id]
    );

    console.log('[MEMBERS] Password reset completed for:', tokenRecord.username);

    return NextResponse.json({
      success: true,
      message: 'Password reset successful. You can now sign in with your new password.',
      username: tokenRecord.username
    });
  } catch (error) {
    console.error('[MEMBERS] Reset confirm error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}

/**
 * GET - Validate token (for UI to check before showing form)
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ valid: false, error: 'No token provided' });
    }

    const result = await query(
      `SELECT t.id, m.name
       FROM password_reset_tokens t
       JOIN members m ON t.member_id = m.id
       WHERE t.token = $1
         AND t.used = false
         AND t.expires_at > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ valid: false, error: 'Invalid or expired token' });
    }

    return NextResponse.json({
      valid: true,
      name: result.rows[0].name
    });
  } catch (error) {
    console.error('[MEMBERS] Token validation error:', error);
    return NextResponse.json({ valid: false, error: 'Validation failed' });
  }
}
