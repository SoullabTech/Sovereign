import { NextRequest, NextResponse } from 'next/server';

/**
 * Credentialed API requests from the public site, restricted beta site and
 * native Soullab shell. An Origin is NOT member authority; every private
 * handler must still verify the session and the record owner.
 *
 * Match origins exactly. Never suffix-match arbitrary *.soullab.life domains,
 * reflect unknown origins, or authorize "null" as a web Origin.
 */
const WEB_ORIGINS = new Set([
  'https://soullab.life',
  'https://www.soullab.life',
  'https://beta.soullab.life',
]);
const NATIVE_ORIGINS = new Set([
  'capacitor://localhost',
  'ionic://localhost',
]);

export function trustedSynastryOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (WEB_ORIGINS.has(origin) || NATIVE_ORIGINS.has(origin)) return true;
  return process.env.NODE_ENV === 'development' &&
    (origin === 'http://localhost:3000' || origin === 'http://localhost:5173');
}

/**
 * A missing Origin is accepted only from a session-token client, never
 * from a cookie-only browser POST with an absent Origin.
 */
export function authorizedSynastryMutation(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (origin) return trustedSynastryOrigin(origin);
  return Boolean(request.headers.get('x-session-token'));
}

export function withSynastryCors(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('origin');
  response.headers.set('Vary', 'Origin');
  if (trustedSynastryOrigin(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin!);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, X-Session-Token, X-Member-Id, X-Maia-Anon-Id, X-App-Shell',
    );
  }
  return response;
}

export function synastryPreflight(request: NextRequest): NextResponse {
  const response = trustedSynastryOrigin(request.headers.get('origin'))
    ? new NextResponse(null, { status: 204 })
    : NextResponse.json({ error: 'Origin not allowed' }, { status: 403 });
  return withSynastryCors(request, response);
}
