/**
 * Class A — sign-out origin/CSRF policy.
 *
 * A cookie alone is ambient web authority, so it requires an EXACT approved
 * web Origin. Safari and native clients may instead send an x-session-token
 * bearer that the sign-out handler revokes against auth_sessions.
 *
 * In particular: Origin:null is NEVER trusted, even with a bearer token.
 * A claimed member ID, URL parameter or user-agent is never authentication.
 */
export type SignoutTransport =
  | { allowed: true; transport: 'web' | 'native' | 'header-only'; corsOrigin: string | null }
  | { allowed: false; reason: 'untrusted_origin' | 'session_header_required' | 'origin_or_header_required' };

const WEB_ORIGINS = new Set([
  'https://soullab.life',
  'https://www.soullab.life',
]);

const NATIVE_ORIGINS = new Set([
  'capacitor://localhost',
  'ionic://localhost',
]);

const PREFLIGHT_HEADERS = new Set([
  'accept',
  'content-type',
  'x-session-token',
  'x-member-id',
  'x-maia-anon-id',
  'x-app-shell',
]);

function configuredWebOrigins(): Set<string> {
  const origins = new Set(WEB_ORIGINS);
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (!configured) return origins;

  try {
    const url = new URL(configured);
    const local = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
    if (
      (url.protocol === 'https:' || (url.protocol === 'http:' && local)) &&
      !url.username && !url.password &&
      url.pathname === '/' && !url.search && !url.hash
    ) origins.add(url.origin);
  } catch {
    // Invalid server configuration may not expand the trust set.
  }
  return origins;
}

/** Applies before reading cookies or touching any database. */
export function checkSignoutTransport(headers: Headers): SignoutTransport {
  const origin = headers.get('origin');
  const hasBearer = !!headers.get('x-session-token')?.trim();

  if (!origin) {
    return hasBearer
      ? { allowed: true, transport: 'header-only', corsOrigin: null }
      : { allowed: false, reason: 'origin_or_header_required' };
  }
  if (origin === 'null') return { allowed: false, reason: 'untrusted_origin' };

  if (configuredWebOrigins().has(origin)) {
    return { allowed: true, transport: 'web', corsOrigin: null };
  }
  if (NATIVE_ORIGINS.has(origin)) {
    return hasBearer
      ? { allowed: true, transport: 'native', corsOrigin: origin }
      : { allowed: false, reason: 'session_header_required' };
  }
  return { allowed: false, reason: 'untrusted_origin' };
}

/**
 * Preflight is a statement about permitted request headers, NOT a grant of
 * authentication. The actual POST still requires a verified bearer for
 * native origins. Nothing reflects an unknown Origin or supports wildcard CORS.
 */
export function signoutPreflight(headers: Headers): {
  allowed: boolean;
  corsOrigin: string | null;
} {
  const origin = headers.get('origin');
  if (!origin || origin === 'null') return { allowed: false, corsOrigin: null };
  if (!configuredWebOrigins().has(origin) && !NATIVE_ORIGINS.has(origin)) {
    return { allowed: false, corsOrigin: null };
  }
  if (headers.get('access-control-request-method') !== 'POST') {
    return { allowed: false, corsOrigin: null };
  }
  const requested = (headers.get('access-control-request-headers') || '')
    .split(',')
    .map(v => v.trim().toLowerCase())
    .filter(Boolean);
  if (requested.some(h => !PREFLIGHT_HEADERS.has(h))) {
    return { allowed: false, corsOrigin: null };
  }
  return { allowed: true, corsOrigin: origin };
}

export function signoutCorsHeaders(origin: string | null): Record<string, string> {
  if (!origin) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
      'Accept, Content-Type, X-Session-Token, X-Member-Id, X-Maia-Anon-Id, X-App-Shell',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '300',
  };
}
