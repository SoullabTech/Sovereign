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
import { createSession, revokeSession } from '@/lib/auth/serverSessions';
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
        action: 'signin_failed',
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
        action: 'signin_failed',
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

    // R1-E: a verified password is not yet an authenticated session.
    // Mint server authority before preparing the response. The response that
    // we return is the ONLY object whose cookies are ever mutated.
    let session: Awaited<ReturnType<typeof createSession>> | undefined;
    try {
      session = await createSession({
        memberId: member.id,
        ipAddress: clientIP,
        userAgent,
      });
      if (!session.sessionToken || !session.id ||
          !(session.expiresAt instanceof Date) ||
          !Number.isFinite(session.expiresAt.getTime())) {
        throw new Error('SESSION_ISSUANCE_INCOMPLETE');
      }
    } catch {
      // If session creation returned an unusable record, revoke it too.
      if (session?.id) {
        try { await revokeSession(session.id, 'session_issuance_failed'); }
        catch { console.error('[PasswordSignin] Session revocation unavailable'); }
      }
      console.error('[PasswordSignin] Session issuance unavailable');
      return NextResponse.json(
        { error: 'Sign-in could not be completed. Please try again.' },
        { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
      );
    }

    // Session is checked above; preserve its concrete type for cookie
    // preparation, not an optional/best-effort success path.
    if (!session) {
      return NextResponse.json(
        { error: 'Sign-in could not be completed. Please try again.' },
        { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
      );
    }

    // A failed or partially completed cookie write discards this whole
    // response, never returning a false success or partially issued cookies.
    // An authenticated bearer is the LAST cookie we prepare.
    let response: NextResponse;
    try {
      const expires = session.expiresAt;
      response = NextResponse.json({
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
          mustResetPassword: member.must_reset_password || false,
        },
        session: {
          expiresAt: expires.toISOString(),
          // Existing iOS/Safari session transport. Never persisted in logs.
          token: session.sessionToken,
        },
      }, { headers: { 'Cache-Control': 'private, no-store' } });

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        expires,
      };
      response.cookies.set('maia_member_id', member.id, cookieOptions);
      response.cookies.set('maia_tier', member.tier || 'free', cookieOptions);
      response.cookies.set(
        'maia_roles', JSON.stringify(member.roles || ['member']), cookieOptions,
      );
      response.cookies.set('maia_session', session.sessionToken, cookieOptions);
    } catch {
      // A partially prepared response is NOT returned. Revoke the minted
      // bearer even if cookie preparation succeeded before a later failure.
      try {
        await revokeSession(session.id, 'session_issuance_failed');
      } catch {
        console.error('[PasswordSignin] Session revocation unavailable');
      }
      console.error('[PasswordSignin] Cookie issuance unavailable');
      return NextResponse.json(
        { error: 'Sign-in could not be completed. Please try again.' },
        { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
      );
    }

    // Housekeeping must not turn a fully issued session into a false 500.
    // This can be retried independently, never with an extra login session.
    try {
      await query(
        'UPDATE members SET last_sign_in = NOW() WHERE id = $1',
        [member.id],
      );
    } catch {
      console.warn('[PasswordSignin] Last-sign-in timestamp unavailable');
    }
    try {
      await logAuthEvent({
        action: 'signin_success',
        memberId: member.id,
        result: 'success',
      }, request);
    } catch {
      console.warn('[PasswordSignin] Success audit unavailable');
    }

    return response;

  } catch (error) {
    console.error('[PasswordSignin] Error:', error);

    return NextResponse.json(
      { error: 'Sign in failed' },
      { status: 500 }
    );
  }
}
