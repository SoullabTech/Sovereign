/**
 * Capture Mode Authentication
 *
 * Server-side user identity resolution for Capture Mode APIs.
 * Supports multiple auth methods for iOS/Safari compatibility:
 * - Session cookie (standard web)
 * - x-session-token header (Safari/iOS where cookies are blocked)
 * - Dev mode: Can accept client-provided userId
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '@/lib/db/postgres';

const SESSION_COOKIE_NAME = 'maia_session';
const IS_PROD = process.env.NODE_ENV === 'production';

/**
 * Build a session cookie string (httpOnly, secure in prod, 30 days)
 */
function buildSessionCookie(sid: string): string {
  const maxAge = 60 * 60 * 24 * 30; // 30 days
  const secure = IS_PROD ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

/**
 * Validate a session token against the auth_sessions table
 * Returns the member_id if valid, null otherwise
 */
async function validateSessionToken(token: string): Promise<string | null> {
  try {
    const res = await query<{ member_id: string }>(
      `SELECT member_id
       FROM auth_sessions
       WHERE session_token = $1
         AND revoked = FALSE
         AND expires_at > NOW()
       LIMIT 1`,
      [token]
    );
    return res.rows[0]?.member_id || null;
  } catch (error) {
    console.error('[captureAuth] Session token validation failed:', error);
    return null;
  }
}

/**
 * Get or create session ID from cookie or header
 * Checks x-session-token header for Safari/iOS fallback
 */
function getOrCreateSessionId(req: NextRequest): { sid: string; setCookie?: string } {
  const existingCookie = req.cookies.get(SESSION_COOKIE_NAME);
  if (existingCookie?.value) {
    return { sid: existingCookie.value };
  }

  // Create new server-issued session ID
  const sid = `sid_${crypto.randomBytes(16).toString('hex')}`;
  const setCookie = buildSessionCookie(sid);
  return { sid, setCookie };
}

/**
 * Resolve effective userId for Capture Mode
 *
 * Auth methods (in priority order):
 * 1. x-session-token header → lookup member_id from auth_sessions (Safari/iOS)
 * 2. maia_session cookie → lookup member_id from auth_sessions (standard web)
 * 3. Dev mode with trust: accept client-provided userId
 * 4. Fallback: anonymous session-scoped identity
 *
 * @param req - NextRequest
 * @param bodyUserId - Optional userId from request body (only trusted in dev mode)
 * @returns { userId, setCookie? }
 */
export async function resolveCaptureUserId(
  req: NextRequest,
  bodyUserId?: string
): Promise<{ userId: string; setCookie?: string }> {
  // Method 1: x-session-token header (Safari/iOS where cookies are blocked)
  const sessionToken = req.headers.get('x-session-token');
  if (sessionToken) {
    const memberId = await validateSessionToken(sessionToken);
    if (memberId) {
      console.log('[captureAuth] Authenticated via x-session-token header');
      return { userId: memberId };
    }
  }

  // Method 2: Session cookie (standard web)
  const cookieToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (cookieToken) {
    const memberId = await validateSessionToken(cookieToken);
    if (memberId) {
      console.log('[captureAuth] Authenticated via session cookie');
      return { userId: memberId };
    }
  }

  // Method 3: Dev mode with trust - accept client-provided userId
  const TRUST_BODY_ID =
    process.env.MAIA_DEV_TRUST_BODY_ID === '1' &&
    (!IS_PROD || process.env.MAIA_TRUST_BODY_ID_IN_PROD === '1');

  if (TRUST_BODY_ID && bodyUserId && bodyUserId.trim()) {
    console.log('[captureAuth] Using trusted body userId (dev mode)');
    return { userId: bodyUserId.trim() };
  }

  // Method 4: Fallback to anonymous session-scoped identity
  const { sid, setCookie } = getOrCreateSessionId(req);
  console.log('[captureAuth] Using anonymous session identity');
  return { userId: `anon:${sid}`, setCookie };
}

/**
 * Helper to add Set-Cookie header to response
 */
export function withSessionCookie(res: NextResponse, setCookie?: string): NextResponse {
  if (setCookie) {
    res.headers.append('Set-Cookie', setCookie);
  }
  return res;
}

/**
 * Shorthand for GET requests: derive userId from query params OR session
 */
export async function resolveCaptureUserIdFromQuery(
  req: NextRequest
): Promise<{ userId: string; setCookie?: string }> {
  const { searchParams } = new URL(req.url);
  const queryUserId = searchParams.get('userId') || undefined;
  return resolveCaptureUserId(req, queryUserId);
}
