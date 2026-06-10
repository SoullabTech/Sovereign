/**
 * Admin request gate (real server-side enforcement).
 *
 * Mutating admin routes (e.g. member lifecycle changes) MUST be gated by this.
 * It validates an admin secret the caller supplies against the configured
 * LABTOOLS_SECRET (falling back to LABTOOLS_ADMIN_PASSWORD) — the same secret the
 * existing app/api/admin/library/videos route enforces.
 *
 * The secret may be sent as:
 *   - `x-admin-secret` request header  (preferred; used by the admin UI)
 *   - `adminSecret` query parameter    (convenience for curl / scripts)
 *
 * NOTE: the token minted by /api/admin/auth is base64(admin:ts:uuid) and is NOT
 * verifiable server-side, so it is deliberately NOT trusted for authorization here.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function configuredSecret(): string | undefined {
  return process.env.LABTOOLS_SECRET || process.env.LABTOOLS_ADMIN_PASSWORD;
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function providedSecret(req: NextRequest): string | null {
  const header = req.headers.get('x-admin-secret');
  if (header) return header;
  try {
    return new URL(req.url).searchParams.get('adminSecret');
  } catch {
    return null;
  }
}

/** True when the request carries a valid admin secret. */
export function isAdminRequest(req: NextRequest): boolean {
  const secret = configuredSecret();
  if (!secret) {
    console.error('[requireAdmin] LABTOOLS_SECRET / LABTOOLS_ADMIN_PASSWORD not configured — denying');
    return false;
  }
  const provided = providedSecret(req);
  return !!provided && safeEqual(provided, secret);
}

/**
 * Returns a 401 NextResponse when the request is NOT an authorized admin, or null
 * when it is. Usage:
 *   const denied = requireAdmin(req);
 *   if (denied) return denied;
 */
export function requireAdmin(req: NextRequest): NextResponse | null {
  if (isAdminRequest(req)) return null;
  const configured = !!configuredSecret();
  return NextResponse.json(
    {
      error: configured
        ? 'Unauthorized — valid admin secret required'
        : 'Admin authentication not configured',
    },
    { status: configured ? 401 : 500 }
  );
}
