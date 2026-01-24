export const dynamic = 'force-dynamic';

/**
 * AUTH WHOAMI ENDPOINT
 *
 * Single source of truth for "who am I?"
 * Returns current session state from server-side validation.
 *
 * This endpoint is the diagnostic foundation for auth debugging.
 * @see docs/security/security-constitution.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession, getSessionFromCookie } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';

export type WhoamiReason =
  | 'no_cookie'
  | 'invalid_session'
  | 'expired_session'
  | 'revoked_session'
  | 'member_not_found';

export interface WhoamiResponse {
  authed: boolean;
  memberId?: string;
  username?: string;
  name?: string;
  preferredName?: string;
  tier?: string;
  isPractitioner?: boolean;
  reason?: WhoamiReason;
  sessionId?: string;
  expiresAt?: string;
  debug?: {
    hasCookie: boolean;
    cookieLength?: number;
  };
}

/**
 * GET /api/auth/whoami
 *
 * Returns current authentication state from server-side session.
 * This is the canonical source of truth for "am I signed in?"
 */
export async function GET(request: NextRequest): Promise<NextResponse<WhoamiResponse>> {
  const startTime = Date.now();

  try {
    // Check if session cookie exists
    const sessionToken = await getSessionFromCookie();
    const hasCookie = !!sessionToken;

    // For Capacitor/mobile apps: Also check x-member-id header
    // (iOS blocks cross-origin cookies, so we use header-based auth)
    const memberIdHeader = request.headers.get('x-member-id');

    if (!sessionToken && !memberIdHeader) {
      return NextResponse.json({
        authed: false,
        reason: 'no_cookie',
        debug: { hasCookie: false },
      });
    }

    // If we have a member ID header but no cookie, look up member directly
    // (Capacitor apps use header-based auth since iOS blocks cross-origin cookies)
    if (memberIdHeader && !sessionToken) {
      const memberResult = await query(
        `SELECT
           id, username, name, preferred_name, tier,
           is_practitioner, onboarded, onboarding_step
         FROM members
         WHERE id = $1`,
        [memberIdHeader]
      );

      if (memberResult.rows.length === 0) {
        return NextResponse.json({
          authed: false,
          reason: 'member_not_found',
          debug: { hasCookie: false },
        });
      }

      const member = memberResult.rows[0];

      console.log(`[WHOAMI] Authenticated via x-member-id header: ${member.username} (${Date.now() - startTime}ms)`);

      return NextResponse.json({
        authed: true,
        memberId: member.id,
        username: member.username,
        name: member.name,
        preferredName: member.preferred_name || member.name,
        tier: member.tier || 'free',
        isPractitioner: member.is_practitioner || false,
        debug: {
          hasCookie: false,
        },
      });
    }

    // At this point, sessionToken must exist (we returned early if it didn't)
    // TypeScript doesn't narrow through complex conditionals, so we assert
    const validSessionToken = sessionToken!;

    // Validate session
    const session = await getCurrentSession();

    if (!session) {
      // Session token exists but validation failed
      // Try to determine why
      const rawResult = await query(
        `SELECT revoked, expires_at FROM auth_sessions WHERE session_token = $1`,
        [validSessionToken]
      );

      let reason: WhoamiReason = 'invalid_session';
      if (rawResult.rows.length > 0) {
        const row = rawResult.rows[0];
        if (row.revoked) {
          reason = 'revoked_session';
        } else if (new Date(row.expires_at) < new Date()) {
          reason = 'expired_session';
        }
      }

      return NextResponse.json({
        authed: false,
        reason,
        debug: {
          hasCookie: true,
          cookieLength: validSessionToken.length,
        },
      });
    }

    // Session valid - fetch member details
    const memberResult = await query(
      `SELECT
         id, username, name, preferred_name, tier,
         is_practitioner, onboarded, onboarding_step
       FROM members
       WHERE id = $1`,
      [session.memberId]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json({
        authed: false,
        reason: 'member_not_found',
        debug: {
          hasCookie: true,
          cookieLength: validSessionToken.length,
        },
      });
    }

    const member = memberResult.rows[0];

    const response: WhoamiResponse = {
      authed: true,
      memberId: member.id,
      username: member.username,
      name: member.name,
      preferredName: member.preferred_name || member.name,
      tier: member.tier || 'free',
      isPractitioner: member.is_practitioner || false,
      sessionId: session.id,
      expiresAt: session.expiresAt.toISOString(),
      debug: {
        hasCookie: true,
        cookieLength: validSessionToken.length,
      },
    };

    // Log for monitoring (but not the session token itself)
    console.log(`[WHOAMI] Authenticated: ${member.username} (${Date.now() - startTime}ms)`);

    return NextResponse.json(response);
  } catch (error) {
    console.error('[WHOAMI] Error:', error);
    return NextResponse.json(
      {
        authed: false,
        reason: 'invalid_session',
        debug: { hasCookie: false },
      },
      { status: 500 }
    );
  }
}
