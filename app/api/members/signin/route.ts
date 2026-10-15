/**
 * Password Sign In
 *
 * POST /api/members/signin
 *
 * Authenticates with email-or-username/password and creates a session.
 * Returns session token for Safari/iOS header-based auth.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { verifyPassword } from '@/lib/auth/passwordUtils';
import { createSession, setSessionCookie, setAccessCookies, revokeSession } from '@/lib/auth/serverSessions';
import { logAuthEvent } from '@/lib/security/authAudit';
import { resolveMemberDisplayName } from '@/lib/stellium/clients';
import {
  checkRateLimit,
  resetRateLimit,
  getClientIP,
  buildRateLimitHeaders
} from '@/lib/auth/rateLimiter';

const ENDPOINT = '/api/members/signin';

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || undefined;

  try {
    // Rate limit
    const rateLimitResult = await checkRateLimit(clientIP, 'ip', ENDPOINT);
    if (!rateLimitResult.allowed) {
      const headers = buildRateLimitHeaders(rateLimitResult);
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429, headers }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Email or username and password required' },
        { status: 400 }
      );
    }

    // Find member by username or email (case-insensitive). The request field remains
    // `username` for backward compatibility with existing clients.
    const result = await query(
      `SELECT id, passkey, username, password_hash, name, preferred_name,
              onboarded, onboarding_step, tier, roles, subscription_active, subscription_expires_at,
              has_webauthn, preferred_auth_method, must_reset_password
       FROM members
       WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)
       ORDER BY CASE WHEN LOWER(username) = LOWER($1) THEN 0 ELSE 1 END
       LIMIT 1`,
      [username]
    );

    if (result.rows.length === 0) {
      await logAuthEvent({
        action: 'password_signin',
        memberId: null,
        result: 'failure',
        errorMessage: 'User not found'
      }, request);

      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const member = result.rows[0];

    // Verify password
    const verifyResult = await verifyPassword(password, member.password_hash);
    if (!verifyResult.ok) {
      await logAuthEvent({
        action: 'password_signin',
        memberId: member.id,
        result: 'failure',
        errorMessage: 'Invalid password'
      }, request);

      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Transparent SHA256 → bcrypt upgrade on successful login
    if (verifyResult.needsUpgrade) {
      try {
        const { hashPassword } = await import('@/lib/auth/passwordUtils');
        const newHash = await hashPassword(password);
        await query(
          `UPDATE members SET password_hash = $1 WHERE id = $2`,
          [newHash, member.id]
        );
        console.log(`[Auth] Upgraded password hash to bcrypt for member ${member.id}`);
      } catch (upgradeError) {
        // Non-fatal — user is still signed in, upgrade will retry next login
        console.error('[Auth] bcrypt upgrade failed:', upgradeError);
      }
    }

    // Reset rate limit on success
    await resetRateLimit(clientIP, 'ip', ENDPOINT);

    // Create session
    let session: Awaited<ReturnType<typeof createSession>> | undefined;
    try {
      session = await createSession({
        memberId: member.id,
        ipAddress: clientIP,
        userAgent
      });
      // Access metadata is not authentication; the verified bearer is issued last.
      await setAccessCookies(
        member.id,
        member.tier || 'free',
        member.roles || ['member'],
        session.expiresAt
      );
      await setSessionCookie(session.sessionToken, session.expiresAt);
    } catch {
      // Never report sign-in success or expose member data if the verified
      // session or cookie cannot be issued. Revoke any minted unusable session.
      if (session) await revokeSession(session.id, 'session_issuance_failed');
      console.error('[PasswordSignin] Session issuance unavailable');
      return NextResponse.json(
        { error: 'Sign-in could not be completed. Please try again.' },
        { status: 503, headers: { 'Cache-Control': 'private, no-store' } }
      );
    }

    // This is optional metadata, not authentication authority. A committed
    // session and HttpOnly bearer cookie must not be reported as a failed
    // sign-in because this timestamp update became unavailable afterward.
    try {
      await query(
        `UPDATE members SET last_sign_in = NOW() WHERE id = $1`,
        [member.id]
      );
    } catch {
      console.warn('[PasswordSignin] Last-sign-in timestamp unavailable after session issuance');
    }

    await logAuthEvent({
      action: 'password_signin',
      memberId: member.id,
      result: 'success'
    }, request);

    return NextResponse.json({
      success: true,
      memberId: member.id,
      member: {
        id: member.id,
        username: member.username,
        name: (member.name || '').trim() || null,
        preferredName: resolveMemberDisplayName(member),
        onboarded: member.onboarded,
        onboardingStep: member.onboarding_step,
        tier: member.tier || 'free',
        roles: member.roles || ['member'],
        subscriptionActive: member.subscription_active || false,
        subscriptionExpiresAt: member.subscription_expires_at || null,
        hasWebauthn: member.has_webauthn || false,
        preferredAuthMethod: member.preferred_auth_method || 'password',
        mustResetPassword: member.must_reset_password || false
      },
      session: session ? {
        expiresAt: session.expiresAt.toISOString(),
        // Include session token for Safari/iOS clients where cookies are blocked by ITP
        // Client should store this in localStorage and send via x-session-token header
        token: session.sessionToken
      } : undefined
    }, { headers: { 'Cache-Control': 'private, no-store' } });

  } catch (error) {
    console.error('[PasswordSignin] Error:', error);

    return NextResponse.json(
      { error: 'Sign in failed' },
      { status: 500 }
    );
  }
}
