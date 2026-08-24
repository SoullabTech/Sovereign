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
import { resolveMemberDisplayName } from '@/lib/stellium/clients';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

// =============================================================================
// CORS HELPERS - Required for Capacitor/mobile app cross-origin requests
// =============================================================================

const ALLOWED_ORIGINS = new Set([
  'https://soullab.life',
  'http://localhost:5173',
  'http://localhost:3000',
  'capacitor://localhost',
  'ionic://localhost',
  'null', // WebKit sometimes reports this for file-like/Capacitor contexts
]);

function getCorsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get('origin');

  let allowedOrigin: string;
  if (origin === 'null') {
    allowedOrigin = 'null';
  } else if (origin && ALLOWED_ORIGINS.has(origin)) {
    allowedOrigin = origin;
  } else {
    allowedOrigin = 'https://soullab.life';
  }

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, X-Member-Id',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin',
  };
}

/**
 * CORS Preflight Handler
 */
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}

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
  const corsHeaders = getCorsHeaders(request);

  try {
    // Check if session cookie exists
    const sessionToken = await getSessionFromCookie();
    const hasCookie = !!sessionToken;

    // AUTH-01-D: `x-member-id` is NO LONGER an authentication path here.
    // It previously returned `authed: true` after a bare `SELECT id FROM members
    // WHERE id = $1` — the exact impersonation pattern lib/auth/getMemberFromRequest.ts
    // documents as fixed elsewhere, in the one route whose entire job is to answer
    // "am I authenticated?". Existence of a member row is never authentication.
    //
    // Capacitor/iOS keeps a working path: getMemberIdFromRequest validates the
    // `x-session-token` header against auth_sessions, and rejects an x-member-id
    // claim that disagrees with it.
    const verifiedMemberId = await getMemberIdFromRequest(request);

    if (!sessionToken && !verifiedMemberId) {
      return NextResponse.json({
        authed: false,
        reason: 'no_cookie',
        debug: { hasCookie: false },
      }, { headers: corsHeaders });
    }

    // Header-token path (Capacitor/iOS): the member is already VERIFIED against
    // auth_sessions above. The lookup below hydrates the profile; it is not the
    // authentication step.
    if (verifiedMemberId && !sessionToken) {
      const memberResult = await query(
        `SELECT
           id, username, name, preferred_name, tier,
           is_practitioner, onboarded, onboarding_step
         FROM members
         WHERE id = $1`,
        [verifiedMemberId]
      );

      if (memberResult.rows.length === 0) {
        return NextResponse.json({
          authed: false,
          reason: 'member_not_found',
          debug: { hasCookie: false },
        }, { headers: corsHeaders });
      }

      const member = memberResult.rows[0];

      console.log(`[WHOAMI] Authenticated via verified session token: ${member.username} (${Date.now() - startTime}ms)`);

      return NextResponse.json({
        authed: true,
        memberId: member.id,
        username: member.username,
        name: member.name,
        preferredName: resolveMemberDisplayName(member),
        tier: member.tier || 'free',
        isPractitioner: member.is_practitioner || false,
        debug: {
          hasCookie: false,
        },
      }, { headers: corsHeaders });
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
      }, { headers: corsHeaders });
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
      }, { headers: corsHeaders });
    }

    const member = memberResult.rows[0];

    const response: WhoamiResponse = {
      authed: true,
      memberId: member.id,
      username: member.username,
      name: member.name,
      preferredName: resolveMemberDisplayName(member),
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

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error) {
    console.error('[WHOAMI] Error:', error);
    return NextResponse.json(
      {
        authed: false,
        reason: 'invalid_session',
        debug: { hasCookie: false },
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
