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
import { cookies } from 'next/headers';
import { getSessionFromCookie, validateSession } from '@/lib/auth/serverSessions';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { resolveMemberDisplayName } from '@/lib/stellium/clients';

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
    'Access-Control-Allow-Headers': 'Content-Type, Accept, X-Member-Id, X-Session-Token',
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
  | 'member_not_found'
  | 'identity_claim_mismatch';

/**
 * Which verified credential carried the identity on this request.
 *   'cookie'  — maia_session (web, same-origin)
 *   'header'  — x-session-token (iOS/Capacitor + Safari, where the cookie
 *               structurally cannot travel cross-origin)
 *   'none'    — no verified credential arrived
 *
 * Reported so a native tester can see WHICH credential reached the server,
 * rather than inferring it from an authed boolean that used to be reachable
 * two different ways.
 */
export type WhoamiCredentialSource = 'cookie' | 'header' | 'none';

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
  /** Which verified credential authenticated this request (see type doc). */
  credentialSource?: WhoamiCredentialSource;
  debug?: {
    hasCookie: boolean;
    cookieLength?: number;
    /** x-session-token header present on the request (native/Safari path). */
    hasSessionTokenHeader?: boolean;
    /** x-member-id header present. An UNVERIFIED claim — never identity. */
    hasMemberIdClaim?: boolean;
  };
}

/**
 * Read-only probe of a presented token. Diagnostics ONLY — it explains why a
 * credential did not work. It never decides identity: `getMemberIdFromRequest`
 * has already made that decision before any of this runs.
 *
 * Deliberately does NOT call `validateSession`, which bumps `last_active_at`.
 * Explaining a failure must not write.
 */
async function probeToken(token: string | null): Promise<
  { present: false } | { present: true; status: 'valid' | 'revoked' | 'expired' | 'unknown' }
> {
  if (!token) return { present: false };
  const result = await query<{ revoked: boolean; expires_at: string }>(
    `SELECT revoked, expires_at FROM auth_sessions WHERE session_token = $1`,
    [token]
  );
  if (result.rows.length === 0) return { present: true, status: 'unknown' };
  const row = result.rows[0];
  if (row.revoked) return { present: true, status: 'revoked' };
  if (new Date(row.expires_at) < new Date()) return { present: true, status: 'expired' };
  return { present: true, status: 'valid' };
}

/**
 * GET /api/auth/whoami
 *
 * Returns current authentication state from server-side session.
 * This is the canonical source of truth for "am I signed in?"
 *
 * ── ONE IDENTITY AUTHORITY ────────────────────────────────────────────────
 *
 * The authentication decision is NOT made here. It is delegated, whole, to
 * `getMemberIdFromRequest()` — the same function the conversation and memory
 * path calls (`app/api/sovereign/app/maia/list/resolveIdentity.ts`). Whatever
 * that function returns is what this endpoint reports. Everything below it is
 * diagnostic metadata describing WHICH credentials were presented and WHY one
 * may have failed; none of it can change `authed`.
 *
 *     AUTHORITY    getMemberIdFromRequest(request)
 *     DIAGNOSTICS  which credentials were present? why might one have failed?
 *     NEVER        whoami reimplementing authentication
 *
 * This is stricter than "the same logic". Two implementations of the same
 * predicate drift, and the drift is invisible until it costs someone their
 * memory. This endpoint answering differently from the memory path is exactly
 * the bug being fixed (see below), so the decision has to be owned by one
 * function rather than agreed upon by two.
 *
 * Two divergences that an independent re-implementation reintroduced, and that
 * delegation structurally cannot:
 *   1. A stale `maia_session` cookie must NOT mask a valid `x-session-token`.
 *      The canonical resolver tries the cookie, and falls through to the header
 *      when the cookie does not produce a verified member. A `cookie || header`
 *      shortcut would authenticate the cookie's failure instead — precisely the
 *      state an iOS device in a half-migrated session lands in.
 *   2. The identity claim is `x-member-id` OR the `maia_member_id` cookie.
 *      Checking only the header leaves the cookie claim unchecked.
 *
 * ── THE ORIGINAL DIVERGENCE ───────────────────────────────────────────────
 *
 * whoami previously accepted a bare `x-member-id` header as proof of identity
 * whenever no cookie was present (a plain `SELECT id FROM members WHERE id=$1`
 * existence check). On the web that branch is unreachable — the `maia_session`
 * cookie is always sent same-origin, so whoami and the memory path agreed. On
 * iOS/Capacitor the cookie CANNOT travel cross-origin, so whoami always fell
 * into the `x-member-id` branch and answered `authed: true`, while
 * `getMemberIdFromRequest` — which refuses a bare `x-member-id` as impersonable
 * (member UUIDs are client-exposed) — resolved the identical request to `null`.
 * Native therefore presented as signed in and simultaneously conversed as a
 * stranger, with cross-session memory off.
 *
 * A device with no valid session token is now told the truth (`authed: false`)
 * so it can re-authenticate, instead of being told it is recognized by a server
 * that will not recognize it.
 */
export async function GET(request: NextRequest): Promise<NextResponse<WhoamiResponse>> {
  const startTime = Date.now();
  const corsHeaders = getCorsHeaders(request);

  try {
    // ── AUTHORITY ─────────────────────────────────────────────────────────
    // The single identity decision. Nothing below may override it.
    const verifiedMemberId = await getMemberIdFromRequest(request);

    // ── DIAGNOSTICS ───────────────────────────────────────────────────────
    // Which credentials were presented. Descriptive only.
    const cookieToken = await getSessionFromCookie();
    const headerToken = request.headers.get('x-session-token');
    const memberIdClaim =
      request.headers.get('x-member-id') ||
      (await cookies()).get('maia_member_id')?.value ||
      null;

    const debugBase = {
      hasCookie: !!cookieToken,
      hasSessionTokenHeader: !!headerToken,
      hasMemberIdClaim: !!memberIdClaim,
      ...(cookieToken ? { cookieLength: cookieToken.length } : {}),
    };

    if (!verifiedMemberId) {
      // Not authenticated. Explain why, without re-deciding anything.
      const [cookieProbe, headerProbe] = await Promise.all([
        probeToken(cookieToken),
        probeToken(headerToken),
      ]);

      let reason: WhoamiReason;
      if (!cookieProbe.present && !headerProbe.present) {
        // No credential arrived at all. Note a device CAN reach here holding a
        // perfectly good `x-member-id` — the state that used to be misreported
        // as authed. Reason key retained as 'no_cookie' for /debug/auth.
        reason = 'no_cookie';
      } else {
        const statuses = [cookieProbe, headerProbe]
          .filter((p): p is { present: true; status: 'valid' | 'revoked' | 'expired' | 'unknown' } => p.present)
          .map((p) => p.status);

        if (statuses.includes('valid')) {
          // A credential validates, yet the authority still refused: the only
          // way that happens is a conflicting identity claim.
          reason = 'identity_claim_mismatch';
          console.warn(
            '[WHOAMI] identity claim conflicts with the authenticated session — rejecting (possible impersonation attempt)'
          );
        } else if (statuses.includes('revoked')) {
          reason = 'revoked_session';
        } else if (statuses.includes('expired')) {
          reason = 'expired_session';
        } else {
          reason = 'invalid_session';
        }
      }

      return NextResponse.json({
        authed: false,
        reason,
        credentialSource: 'none',
        debug: debugBase,
      }, { headers: corsHeaders });
    }

    // Authenticated. Label WHICH credential carried it, in the authority's own
    // priority order (cookie, then header). This only names what already
    // happened.
    //
    // The whole labelling step is wrapped because "diagnostics cannot revise
    // the decision" has to hold against a THROW, not just against a different
    // return value. Without this, a session row with a malformed `expires_at`
    // makes `.toISOString()` raise, the outer catch converts an authenticated
    // request into `authed: false`, and the diagnostic layer has silently
    // overruled the authority — the precise failure mode this endpoint exists
    // to eliminate. A label we cannot compute costs us a label; it must never
    // cost the member their identity.
    //
    // `validateSession` is used on this path deliberately: bumping
    // `last_active_at` for a genuinely authenticated request is correct.
    let credentialSource: WhoamiCredentialSource = 'none';
    let session: Awaited<ReturnType<typeof validateSession>> = null;
    try {
      session = cookieToken ? await validateSession(cookieToken) : null;
      if (session?.memberId === verifiedMemberId) {
        credentialSource = 'cookie';
      } else {
        session = headerToken ? await validateSession(headerToken) : null;
        credentialSource = session?.memberId === verifiedMemberId ? 'header' : 'none';
        if (credentialSource === 'none') session = null;
      }
    } catch (labelErr) {
      console.warn('[WHOAMI] credential labelling failed (non-fatal, identity stands):', labelErr);
      session = null;
      credentialSource = 'none';
    }

    // Only report session detail we can actually represent. An unparseable
    // expiry is omitted rather than thrown or guessed.
    const expiresAtIso =
      session && !Number.isNaN(session.expiresAt?.getTime?.())
        ? session.expiresAt.toISOString()
        : null;

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
        credentialSource,
        debug: debugBase,
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
      ...(session?.id ? { sessionId: session.id } : {}),
      ...(expiresAtIso ? { expiresAt: expiresAtIso } : {}),
      credentialSource,
      debug: debugBase,
    };

    // Log for monitoring (but not the session token itself)
    console.log(
      `[WHOAMI] Authenticated: ${member.username} via ${credentialSource} (${Date.now() - startTime}ms)`
    );

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error) {
    console.error('[WHOAMI] Error:', error);
    return NextResponse.json(
      {
        authed: false,
        reason: 'invalid_session',
        credentialSource: 'none',
        debug: { hasCookie: false },
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
