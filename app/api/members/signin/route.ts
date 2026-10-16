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
import { createSession, setSessionCookie, setAccessCookies } from '@/lib/auth/serverSessions';
import { logAuthEvent } from '@/lib/security/authAudit';
import { resolveMemberDisplayName } from '@/lib/stellium/clients';
import { writerStudioBetaPreConsentCandidate, writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';
import { restrictedBetaEnabled } from '@/lib/writersStudio/restrictedBetaAdmission';
import { memberHasHistoricalBetaConsent } from '@/lib/writersStudio/betaPostWithdrawalCustody';
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

    // Restrict accounts BEFORE session creation, not merely when the writer
    // subsequently navigates. An authenticated but uninvited member must
    // never receive a beta session through this public sign-in endpoint.
    let betaConsentRequired = false;
    let betaCustodyOnly = false;
    if (restrictedBetaEnabled(process.env.WRITERS_STUDIO_RESTRICTED_BETA)) {
      let admitted = false;
      let invitationCandidate = false;
      let priorParticipant = false;
      try {
        admitted = (await writersStudioBetaAccess(member.id)).eligible;
        if (!admitted) invitationCandidate = await writerStudioBetaPreConsentCandidate(member.id);
        if (!admitted && !invitationCandidate) priorParticipant = await memberHasHistoricalBetaConsent(member.id);
      } catch {
        return NextResponse.json(
          { error: 'Beta admission is temporarily unavailable' },
          { status: 503, headers: { 'Cache-Control': 'no-store' } },
        );
      }
      if (!admitted && !invitationCandidate && !priorParticipant) {
        return NextResponse.json(
          { error: 'This account is not admitted to the private beta' },
          { status: 403, headers: { 'Cache-Control': 'no-store' } },
        );
      }
      betaConsentRequired = !admitted && invitationCandidate;
      betaCustodyOnly = !admitted && !invitationCandidate && priorParticipant;
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
      console.error('[PasswordSignin] Failed to create session:', sessionError);
      // Closed beta must never claim a successful member sign-in unless the
      // durable, verified session was issued. Ordinary platform behavior is
      // left unchanged by this isolated candidate.
      if (restrictedBetaEnabled(process.env.WRITERS_STUDIO_RESTRICTED_BETA)) {
        return NextResponse.json(
          { error: 'Session could not be established. Please try again.' },
          { status: 503, headers: { 'Cache-Control': 'no-store' } },
        );
      }
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
      betaConsentRequired,
      betaCustodyOnly,
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
