/**
 * Admin Authentication API
 *
 * GET  - Check if current member session has admin access (used by client pages to skip password gate)
 * POST - Validate admin password (shared password fallback)
 *
 * Password stored in LABTOOLS_ADMIN_PASSWORD env var
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/admin/adminAuth';
import { deriveVerifiedAccess } from '@/lib/auth/verifiedAccess';

export const dynamic = 'force-dynamic';

// Simple rate limiting - track failed attempts
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0] ||
         req.headers.get('x-real-ip') ||
         'unknown';
}

function isRateLimited(ip: string): boolean {
  const record = failedAttempts.get(ip);
  if (!record) return false;

  // Reset if lockout period passed
  if (Date.now() - record.lastAttempt > LOCKOUT_MS) {
    failedAttempts.delete(ip);
    return false;
  }

  return record.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(ip: string): void {
  const record = failedAttempts.get(ip);
  if (record) {
    record.count++;
    record.lastAttempt = Date.now();
  } else {
    failedAttempts.set(ip, { count: 1, lastAttempt: Date.now() });
  }
}

function clearFailedAttempts(ip: string): void {
  failedAttempts.delete(ip);
}

// This legacy endpoint serves two distinct authorities. The proxy's exact
// route requires an authenticated member session for BOTH methods; the
// handler must preserve the DIFFERENT semantics of each method.
//
// GET is member-owner/admin-status only. A browser's cached shared admin
// password is NOT proof of any member's admin_role, and a stale Safari header
// must never override the active HttpOnly member cookie.
// POST is the historical shared-password challenge, now ALSO gated to a
// verified application-admin member session (the existing Cockpit's outer
// role). The returned UI token is not a member session or release authority.
const PRIVATE_NO_STORE = { 'Cache-Control': 'private, no-store', Vary: 'Cookie, X-Session-Token' };

function memberOnlyAuthRequest(req: NextRequest): NextRequest {
  const headers = new Headers(req.headers);
  headers.delete('x-admin-password');
  headers.delete('authorization');
  if (req.cookies.get('maia_session')?.value) {
    headers.delete('x-session-token');
  }
  return new NextRequest(req.url, { method: 'GET', headers });
}

export async function GET(req: NextRequest) {
  const verified = await deriveVerifiedAccess(req);
  if (!verified.authenticated || !verified.memberId) {
    // Preserve the existing owner-probe contract: HTTP 200 + false.
    return NextResponse.json({ isAdmin: false }, { headers: PRIVATE_NO_STORE });
  }
  const admin = await checkAdminAuth(memberOnlyAuthRequest(req));
  if (!admin.authed || admin.via !== 'member' || admin.memberId !== verified.memberId) {
    return NextResponse.json({ isAdmin: false }, { headers: PRIVATE_NO_STORE });
  }
  return NextResponse.json(
    { isAdmin: true, via: 'member', role: admin.role },
    { headers: PRIVATE_NO_STORE },
  );
}

export async function POST(req: NextRequest) {
  // A correct shared password alone cannot cross this sensitive legacy gate.
  // Independently enforce the member app-admin role even if the proxy is
  // accidentally omitted; do not infer it from admin_role or caller headers.
  const verified = await deriveVerifiedAccess(req);
  if (!verified.authenticated) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  if (!verified.roles.includes('admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const ip = getClientIP(req);

  // Check rate limit
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many failed attempts. Try again later.' },
      { status: 429 }
    );
  }

  try {
    const { password } = await req.json();

    const adminPassword = process.env.LABTOOLS_ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error('[admin/auth] LABTOOLS_ADMIN_PASSWORD not set');
      return NextResponse.json(
        { error: 'Admin authentication not configured' },
        { status: 500 }
      );
    }

    if (password === adminPassword) {
      clearFailedAttempts(ip);

      // Generate a simple session token (in production, use proper JWT)
      const token = Buffer.from(`admin:${Date.now()}:${crypto.randomUUID()}`).toString('base64');

      return NextResponse.json({
        success: true,
        token,
        expiresIn: 24 * 60 * 60 * 1000 // 24 hours
      });
    }

    recordFailedAttempt(ip);
    const record = failedAttempts.get(ip);
    const remaining = MAX_ATTEMPTS - (record?.count || 0);

    return NextResponse.json(
      { error: 'Invalid password', attemptsRemaining: remaining },
      { status: 401 }
    );
  } catch (error) {
    console.error('[admin/auth] Error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
