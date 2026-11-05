/**
 * Shared Astrology Pro write-origin guard. Moved verbatim from
 * app/api/astrology/pro/my-chart/route.ts so every Pro chart route that
 * accepts a member write applies the identical origin decision.
 */
import type { NextRequest } from 'next/server';
import { getMemberIdFromSessionToken } from '@/lib/auth/getMemberFromRequest';

/**
 * R9 review-only: tie a private chart POST to an exact approved target origin
 * independently of member identity, rather than comparing browser Origin to
 * an internal Next.js reverse-proxy URL. Host and forwarding headers do NOT
 * prove a request travelled through Caddy; verified auth_sessions is the
 * separate membership authority. The shared ingress must still be reviewed.
 */
const APPROVED_PRO_WEB_ORIGINS = new Set([
  'https://soullab.life',
  'https://maia.soullab.life',
]);

function expectedProWebOrigin(request: NextRequest): string | null {
  try {
    const target = new URL(request.url);
    const host = request.headers.get('host');
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const localDev = process.env.NODE_ENV === 'development' &&
      target.protocol === 'http:' &&
      (target.hostname === 'localhost' || target.hostname === '127.0.0.1') &&
      (!host || host === target.host);
    if (forwardedProto !== null && forwardedProto !== 'https' &&
        !(localDev && forwardedProto === 'http')) return null;

    if (host) {
      const exactPublicTarget = 'https://' + host;
      if (APPROVED_PRO_WEB_ORIGINS.has(exactPublicTarget)) {
        if (APPROVED_PRO_WEB_ORIGINS.has(target.origin) &&
            target.origin !== exactPublicTarget) return null;
        return exactPublicTarget;
      }
    } else if (APPROVED_PRO_WEB_ORIGINS.has(target.origin)) {
      return target.origin;
    }

    if (process.env.NODE_ENV === 'development' &&
        target.protocol === 'http:' &&
        (target.hostname === 'localhost' || target.hostname === '127.0.0.1') &&
        (!host || host === target.host) &&
        (forwardedProto === null || forwardedProto === 'http')) {
      return target.origin;
    }
  } catch {
    // A malformed request target is never a source of origin authority.
  }
  return null;
}

export async function proChartWriteOriginAllowed(request: NextRequest, memberId: string): Promise<boolean> {
  const site = request.headers.get('sec-fetch-site');
  if (site === 'cross-site') return false;
  const expected = expectedProWebOrigin(request);
  if (!expected) return false;

  const origin = request.headers.get('origin');
  if (origin !== null) {
    try {
      // Do not accept paths, case variants or opaque origins as exact Origin.
      return origin === expected && new URL(origin).origin === expected;
    } catch { return false; }
  }

  // Browsers may omit Origin for a same-origin request. Identity is still
  // resolved from a server-issued session, never from this metadata.
  if (site === 'same-origin') return true;

  // Native Capacitor may attach BOTH an auth cookie and header bearer.
  // An originless write requires a bearer verified independently through
  // the existing SQL auth_sessions authority for the SAME member.
  const headerToken = request.headers.get('x-session-token');
  if (typeof headerToken !== 'string' || headerToken.trim() === '') return false;
  const cookie = request.headers.get('cookie') || '';
  const hasSessionCookie = /(?:^|;)\s*maia_session\s*=/.test(cookie);
  if (!hasSessionCookie) return true; // Primary auth resolver verified this token.
  try {
    const headerMemberId = await getMemberIdFromSessionToken(headerToken);
    return headerMemberId !== null && headerMemberId === memberId;
  } catch {
    // Failure of the additional session lookup fails closed without logging.
    return false;
  }
}
