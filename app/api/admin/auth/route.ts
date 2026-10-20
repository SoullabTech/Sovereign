/**
 * Admin Authentication API
 *
 * GET  - Check if current member session has admin access (used by client pages to skip password gate)
 * POST - Validate admin password (shared password fallback)
 *
 * Password stored in LABTOOLS_ADMIN_PASSWORD env var
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth, adminRequestIp, auditAdminPasswordLogin } from '@/lib/admin/adminAuth';

export const dynamic = 'force-dynamic';

// Simple rate limiting - track failed attempts
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

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

export async function GET(req: NextRequest) {
  const result = await checkAdminAuth(req);
  if (!result.authed) {
    // 200 not 401 — client just checks the boolean
    return NextResponse.json({ isAdmin: false });
  }
  return NextResponse.json({ isAdmin: true, via: result.via, role: result.role });
}

export async function POST(req: NextRequest) {
  const ip = adminRequestIp(req);

  // Check rate limit
  if (isRateLimited(ip)) {
    await auditAdminPasswordLogin(req, false);
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
      await auditAdminPasswordLogin(req, false);
      return NextResponse.json(
        { error: 'Admin authentication not configured' },
        { status: 500 }
      );
    }

    if (password === adminPassword) {
      // Retain the existing response contract; the returned token is not a
      // verified server session and confers no independent authority.
      const token = Buffer.from(`admin:${Date.now()}:${crypto.randomUUID()}`).toString('base64');

      await auditAdminPasswordLogin(req, true);
      clearFailedAttempts(ip);

      return NextResponse.json({
        success: true,
        token,
        expiresIn: 24 * 60 * 60 * 1000 // 24 hours
      });
    }

    recordFailedAttempt(ip);
    await auditAdminPasswordLogin(req, false);
    const record = failedAttempts.get(ip);
    const remaining = MAX_ATTEMPTS - (record?.count || 0);

    return NextResponse.json(
      { error: 'Invalid password', attemptsRemaining: remaining },
      { status: 401 }
    );
  } catch {
    // Never include a malformed password payload in error logs.
    await auditAdminPasswordLogin(req, false);
    console.error('[admin/auth] Invalid or failed password-authentication request');
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
