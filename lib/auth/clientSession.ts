/**
 * CLIENT PORTAL SESSION
 *
 * Session management for practitioner clients accessing their portal.
 * Separate from member/practitioner auth - this is for end clients
 * who have claimed their chart access via invite code.
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const COOKIE_NAME = 'maia_client_portal';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

interface ClientSessionPayload {
  portalSlug: string;
  clientId: string;
  practitionerId: string;
  iat: number;
  exp: number;
}

/**
 * Sign a payload into a session token
 */
function sign(payload: ClientSessionPayload): string {
  const secret = process.env.CLIENT_SESSION_SECRET || process.env.PHI_ENCRYPTION_KEY || 'dev-client-secret';
  const json = JSON.stringify(payload);
  const sig = crypto.createHmac('sha256', secret).update(json).digest('hex');
  return Buffer.from(`${json}.${sig}`).toString('base64url');
}

/**
 * Verify and decode a session token
 */
function verify(token: string): ClientSessionPayload | null {
  try {
    const secret = process.env.CLIENT_SESSION_SECRET || process.env.PHI_ENCRYPTION_KEY || 'dev-client-secret';
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const idx = raw.lastIndexOf('.');
    if (idx < 0) return null;

    const json = raw.slice(0, idx);
    const sig = raw.slice(idx + 1);
    const expected = crypto.createHmac('sha256', secret).update(json).digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return null;
    }

    return JSON.parse(json) as ClientSessionPayload;
  } catch {
    return null;
  }
}

/**
 * Create a client session and set the cookie
 */
export async function createClientSession(
  res: NextResponse,
  data: { portalSlug: string; clientId: string; practitionerId: string }
): Promise<void> {
  const now = Date.now();
  const payload: ClientSessionPayload = {
    ...data,
    iat: now,
    exp: now + SESSION_DURATION_MS,
  };

  const token = sign(payload);

  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

/**
 * Get the current client session from cookies
 * Returns null if no valid session exists
 */
export async function getClientSession(): Promise<{
  portalSlug: string;
  clientId: string;
  practitionerId: string;
} | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verify(token);
    if (!payload) return null;

    // Check expiration
    if (payload.exp < Date.now()) return null;

    return {
      portalSlug: payload.portalSlug,
      clientId: payload.clientId,
      practitionerId: payload.practitionerId,
    };
  } catch {
    return null;
  }
}

/**
 * Clear the client session cookie
 */
export function clearClientSession(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
}

/**
 * Require a valid client session or return 401 response
 * Helper for API routes
 */
export async function requireClientSession(
  portalSlug: string
): Promise<{ clientId: string; practitionerId: string } | NextResponse> {
  const session = await getClientSession();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (session.portalSlug !== portalSlug) {
    return NextResponse.json({ error: 'Session mismatch' }, { status: 403 });
  }

  return {
    clientId: session.clientId,
    practitionerId: session.practitionerId,
  };
}
