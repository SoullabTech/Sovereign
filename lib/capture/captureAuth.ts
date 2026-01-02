/**
 * Capture Mode Authentication
 *
 * Server-side user identity resolution for Capture Mode APIs.
 * Follows the same pattern as /api/between/chat:
 * - Production: Uses session cookie → anon:{sessionId}
 * - Dev with trust: Can accept client-provided userId
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

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
 * Get or create session ID from cookie
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
 * @param req - NextRequest
 * @param bodyUserId - Optional userId from request body (only trusted in dev mode)
 * @returns { userId, setCookie? }
 */
export function resolveCaptureUserId(
  req: NextRequest,
  bodyUserId?: string
): { userId: string; setCookie?: string } {
  const { sid, setCookie } = getOrCreateSessionId(req);

  // Two-key safety: Trust body ID requires explicit opt-in
  const TRUST_BODY_ID =
    process.env.MAIA_DEV_TRUST_BODY_ID === '1' &&
    (!IS_PROD || process.env.MAIA_TRUST_BODY_ID_IN_PROD === '1');

  // TODO: When auth is implemented, derive userId from verified session/token
  const authUserId: string | null = null;

  let userId: string;
  if (authUserId) {
    // Server-verified identity (future: NextAuth, Clerk, etc.)
    userId = authUserId;
  } else if (TRUST_BODY_ID && bodyUserId && bodyUserId.trim()) {
    // Dev mode with trust: accept client-provided userId
    userId = bodyUserId.trim();
  } else {
    // Default: anonymous session-scoped identity
    userId = `anon:${sid}`;
  }

  return { userId, setCookie };
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
export function resolveCaptureUserIdFromQuery(
  req: NextRequest
): { userId: string; setCookie?: string } {
  const { searchParams } = new URL(req.url);
  const queryUserId = searchParams.get('userId') || undefined;
  return resolveCaptureUserId(req, queryUserId);
}
