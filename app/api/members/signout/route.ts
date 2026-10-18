export const dynamic = 'force-dynamic';

/**
 * Class A — session sign-out and local cookie clearing.
 *
 * This route is EXACT-PATH admitted in the strict access matrix so an
 * already-expired/revoked session can still clear local state. A public
 * routing classification is NOT authorization: POST enforces its own
 * explicit web Origin or header-credential transport before any DB access.
 *
 * Unlike the old sign-out handler, Safari/Capacitor x-session-token sessions
 * are revoked as well. A failed SQL revocation must never be reported as
 * successful sign-out.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import {
  checkSignoutTransport, signoutPreflight, signoutCorsHeaders,
} from '@/lib/auth/signoutRequestPolicy';

const BASE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'Vary': 'Origin, Cookie, x-session-token',
};

type Reply = {
  success: boolean;
  serverRevocationConfirmed: boolean;
  localCookiesCleared: boolean;
  code?: string;
};

function response(
  status: number,
  body: Reply,
  origin: string | null = null,
  clearLocalCookies = false,
): NextResponse {
  const result = NextResponse.json(body, {
    status,
    headers: { ...BASE_HEADERS, ...signoutCorsHeaders(origin) },
  });

  if (clearLocalCookies) {
    const options = {
      expires: new Date(0),
      maxAge: 0,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };
    for (const name of ['maia_session', 'maia_member_id', 'maia_tier', 'maia_roles']) {
      result.cookies.set(name, '', { ...options, httpOnly: true });
    }
  }
  return result;
}

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  const preflight = signoutPreflight(request.headers);
  if (!preflight.allowed) {
    return new NextResponse(null, { status: 403, headers: BASE_HEADERS });
  }
  return new NextResponse(null, {
    status: 204,
    headers: { ...BASE_HEADERS, ...signoutCorsHeaders(preflight.corsOrigin) },
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Refuse unknown URL parameters, especially any attempt to pass a session
  // token in a URL. Never take identity or session authority from a query.
  if (request.nextUrl.search) {
    return response(400, {
      success: false, serverRevocationConfirmed: false,
      localCookiesCleared: false, code: 'UNEXPECTED_PARAMETERS',
    });
  }

  const posture = checkSignoutTransport(request.headers);
  if (!posture.allowed) {
    return response(403, {
      success: false, serverRevocationConfirmed: false,
      localCookiesCleared: false, code: 'ORIGIN_OR_SESSION_REQUIRED',
    });
  }

  const cookie = request.cookies.get('maia_session')?.value?.trim();
  const header = request.headers.get('x-session-token')?.trim();

  // Native WebView/Capacitor must supply its bearer; a cookie or claimed
  // x-member-id alone is NOT a native authentication proof.
  if (posture.transport === 'native' && !header) {
    return response(403, {
      success: false, serverRevocationConfirmed: false,
      localCookiesCleared: false, code: 'HEADER_SESSION_REQUIRED',
    }, posture.corsOrigin);
  }

  // A caller possessing two session tokens asks to close both. Querying
  // with a single atomic UPDATE prevents a partially revoked pair.
  // Revocation is idempotent for already expired or revoked sessions.
  const tokens = [...new Set([cookie, header].filter((v): v is string => !!v))];

  try {
    if (tokens.length > 0) {
      await query(
        `UPDATE auth_sessions
            SET revoked = TRUE, revoked_at = NOW(), revoked_reason = 'user_signout'
          WHERE session_token = ANY($1::varchar[])
            AND revoked = FALSE`,
        [tokens],
      );
    }

    // A completed database UPDATE proves no matching session remains
    // unrevoked. No token is echoed and no session existence is disclosed.
    return response(200, {
      success: true, serverRevocationConfirmed: true,
      localCookiesCleared: true,
    }, posture.corsOrigin, true);
  } catch (error) {
    // Local cookie expiry is still offered, but server revocation is NOT
    // claimed. Other devices or a previously copied header token may remain
    // usable until the database returns and a separate revocation succeeds.
    console.error('[MEMBERS] Sign-out revocation unavailable');
    return response(503, {
      success: false, serverRevocationConfirmed: false,
      localCookiesCleared: true, code: 'REVOCATION_UNCONFIRMED',
    }, posture.corsOrigin, true);
  }
}
