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

export async function GET(req: NextRequest) {
  const result = await checkAdminAuth(req);
  if (!result.authed) {
    // 200 not 401 — client just checks the boolean
    return NextResponse.json({ isAdmin: false });
  }
  return NextResponse.json({ isAdmin: true, via: result.via, role: result.role });
}

export async function POST(req: NextRequest) {
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
