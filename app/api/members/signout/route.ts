export const dynamic = 'force-dynamic';

/**
 * Web sign-out: conservative origin gate, durable revocation and local cookie
 * clearing. The exact /api/members/signout path must be individually declared
 * in the access matrix so stale/expired sessions can also leave safely.
 *
 * AUTH SECURITY CANDIDATE ONLY. Native callers are NOT qualified here:
 * no Origin:null, implicit host trust, or unverified Capacitor bypass.
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';

const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

/** Fail closed if production has not configured its own approved web origins. */
function trustedSameOriginWebRequest(request: NextRequest): boolean {
  const claimedOrigin = request.headers.get('origin');
  const fetchSite = request.headers.get('sec-fetch-site');
  if (!claimedOrigin || claimedOrigin === 'null') return false;
  if (fetchSite && fetchSite !== 'same-origin') return false;

  try {
    const parsed = new URL(claimedOrigin);
    if (parsed.username || parsed.password || parsed.pathname !== '/' ||
        parsed.search || parsed.hash) return false;
    if (parsed.origin !== claimedOrigin) return false;
    if (parsed.protocol !== 'https:' &&
        !(parsed.protocol === 'http:' &&
          (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'))) {
      return false;
    }

    // Never use untrusted Host, X-Forwarded-* or a client-supplied tier to
    // enlarge this list. An HTTPS reverse proxy must preserve the public URL.
    const configured = (process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS ?? '')
      .split(',').map(item => item.trim()).filter(Boolean);
    return configured.includes(claimedOrigin) &&
      request.nextUrl.origin === claimedOrigin;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!trustedSameOriginWebRequest(request)) {
    return NextResponse.json(
      { success: false, error: 'Origin verification required' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('maia_session')?.value;
  let serverSessionRevoked = false;
  let revocationUnavailable = false;

  if (token) {
    try {
      const result = await query(
        `UPDATE auth_sessions
         SET revoked = TRUE, revoked_at = NOW(), revoked_reason = 'user_signout'
         WHERE session_token = $1 AND revoked = FALSE`,
        [token]
      );
      serverSessionRevoked = (result.rowCount ?? 0) > 0;
    } catch {
      revocationUnavailable = true;
      // Never report durable revocation when the database did not confirm it.
      console.error('[MEMBERS] Sign-out server revocation unavailable');
    }
  }

  // A stale or revoked session must still be able to clear browser cookies.
  // If the DB is unavailable, clearing these is only local sign-out, NOT proof
  // that the old bearer token is now invalid.
  const clearOptions = { ...COOKIE_OPTIONS, expires: new Date(0) };
  cookieStore.set('maia_session', '', { ...clearOptions, httpOnly: true });
  cookieStore.set('maia_member_id', '', { ...clearOptions, httpOnly: true });
  cookieStore.set('maia_tier', '', { ...clearOptions, httpOnly: true });
  cookieStore.set('maia_roles', '', { ...clearOptions, httpOnly: true });

  return NextResponse.json(
    revocationUnavailable
      ? { success: false, localCookiesCleared: true,
          serverSessionRevoked: false,
          error: 'Server session revocation unavailable' }
      : { success: true, localCookiesCleared: true,
          serverSessionRevoked },
    {
      status: revocationUnavailable ? 503 : 200,
      headers: { 'Cache-Control': 'no-store' },
    }
  );
}
