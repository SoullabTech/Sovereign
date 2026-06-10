/**
 * Password Sign In
 *
 * POST /api/members/signin
 *
 * Authenticates with username/password and creates a session.
 * Returns session token for Safari/iOS header-based auth.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { verifyPassword } from '@/lib/auth/passwordUtils';
import { createSession, setSessionCookie, setAccessCookies, MemberNotActiveError } from '@/lib/auth/serverSessions';
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
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    // Find member by username (case-insensitive)
    const result = await query(
      `SELECT id, passkey, username, password_hash, name, preferred_name,
              onboarded, onboarding_step, tier, roles, subscription_active, subscription_expires_at,
              has_webauthn, preferred_auth_method, must_reset_password
       FROM members
       WHERE LOWER(username) = LOWER($1)`,
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
    let session;
    try {
      session = await createSession({
        memberId: member.id,
        ipAddress: clientIP,
        userAgent
      });
      await setSessionCookie(session.sessionToken, session.expiresAt);
      // Set access cookies for middleware (tier, roles, member_id)
      await setAccessCookies(
        member.id,
        member.tier || 'free',
        member.roles || ['member'],
        session.expiresAt
      );
    } catch (sessionError) {
      // Lifecycle gate: disabled / archived members cannot sign in. createSession
      // refuses them (the universal chokepoint); surface a clear message here
      // rather than the swallow-and-continue path below.
      if (sessionError instanceof MemberNotActiveError) {
        await logAuthEvent({
          action: 'password_signin',
          memberId: member.id,
          result: 'failure',
          errorMessage: `account_${sessionError.status}`
        }, request);
        return NextResponse.json(
          { error: 'This account is not active. Please contact an administrator.' },
          { status: 403 }
        );
      }
      console.error('[PasswordSignin] Failed to create session:', sessionError);
      // Continue without session - still return member data
    }

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
      session: session ? {
        expiresAt: session.expiresAt.toISOString(),
        // Include session token for Safari/iOS clients where cookies are blocked by ITP
        // Client should store this in localStorage and send via x-session-token header
        token: session.sessionToken
      } : undefined
    });

  } catch (error) {
    console.error('[PasswordSignin] Error:', error);

    return NextResponse.json(
      { error: 'Sign in failed' },
      { status: 500 }
    );
  }
}
