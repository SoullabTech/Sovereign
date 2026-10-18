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
import { cookies } from 'next/headers';
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

    // A password check is NOT a signed-in session. Commit the durable session
    // and its cookies first; failure at any step must not return success: true.
    let session: Awaited<ReturnType<typeof createSession>> | undefined;
    try {
      session = await createSession({
        memberId: member.id,
        ipAddress: clientIP,
        userAgent
      });
      await setSessionCookie(session.sessionToken, session.expiresAt);
      await setAccessCookies(
        member.id,
        member.tier || 'free',
        member.roles || ['member'],
        session.expiresAt
      );
    } catch {
      console.error('[PasswordSignin] Session establishment failed; refusing sign-in');

      // If a session row was created but response-cookie construction failed,
      // revoke the partial session. Never return that token in the error.
      if (session) {
        const revoked = await revokeSession(session.id, 'signin_cookie_establishment_failed');
        if (!revoked) {
          console.error('[PasswordSignin] Partial session revocation unconfirmed');
        }
      }

      // Local auth cookies must never survive a failed session handshake.
      try {
        const store = await cookies();
        for (const name of ['maia_session', 'maia_member_id', 'maia_tier', 'maia_roles']) {
          store.delete(name);
        }
      } catch {
        console.error('[PasswordSignin] Cookie cleanup could not be verified');
      }

      await logAuthEvent({
        action: 'signin_failed',
        memberId: member.id,
        result: 'failure',
        errorMessage: 'Session establishment failed',
      }, request);

      const failure = NextResponse.json({
        success: false,
        error: 'Sign in unavailable. Please try again.',
        code: 'SESSION_ESTABLISHMENT_FAILED',
      }, { status: 503, headers: { 'Cache-Control': 'private, no-store' } });

      // Explicit response-side cookie expiry covers partial writes even if
      // the request-cookie adapter has already been populated.
      for (const name of ['maia_session', 'maia_member_id', 'maia_tier', 'maia_roles']) {
        failure.cookies.set(name, '', {
          expires: new Date(0),
          maxAge: 0,
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
      }
      return failure;
    }

    // A successful session is now established. Reset the limiter only now.
    await resetRateLimit(clientIP, 'ip', ENDPOINT);

    // Update last sign in
    await query(
      `UPDATE members SET last_sign_in = NOW() WHERE id = $1`,
      [member.id]
    );

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
      session: {
        expiresAt: session.expiresAt.toISOString(),
        // Safari/iOS header fallback must be issued only for a fully
        // established, durable server session, never after a failed insert.
        token: session.sessionToken
      }
    });

  } catch (error) {
    console.error('[PasswordSignin] Error:', error);

    return NextResponse.json(
      { error: 'Sign in failed' },
      { status: 500 }
    );
  }
}
