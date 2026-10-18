/**
 * Reflect E010 — founder-session-only, read-only responding-reader status.
 *
 * Does NOT read protected .env files, shell/Docker, members, or DB feature
 * settings; does NOT permit enabling, revoking, or emergency Caddy operations.
 * Shared LABTOOLS_ADMIN_PASSWORD is explicitly not sufficient for this route.
 */
import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/admin/adminAuth';
import { observeReflectReader } from '@/lib/proStudio/reflectAdminRuntimeStatus';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PRIVATE_NO_STORE = {
  'Cache-Control': 'private, no-store, no-cache, max-age=0, must-revalidate',
  Pragma: 'no-cache',
  Vary: 'Cookie, X-Session-Token',
  'X-Robots-Tag': 'noindex, nofollow',
};

export async function GET(req: NextRequest) {
  try {
    // A live member cookie has precedence over a possibly stale token stored
    // by another signed-in account on the same browser. The shared admin
    // helper normally prefers the header; narrow that behavior to this
    // founder-only endpoint without changing the platform-wide helper.
    // Keeping checkAdminAuth in the path also retains its attempt audit.
    let authRequest = req;
    if (req.cookies.get('maia_session')?.value && req.headers.has('x-session-token')) {
      const cookieFirstHeaders = new Headers(req.headers);
      cookieFirstHeaders.delete('x-session-token');
      authRequest = new NextRequest(req.url, {
        method: 'GET',
        headers: cookieFirstHeaders,
      });
    }
    const admin = await checkAdminAuth(authRequest, ['founder']);
    // checkAdminAuth also accepts a shared-password fallback. For this sensitive
    // release-status view, insist on an independently verified member session.
    if (!admin.authed || admin.via !== 'member' || admin.role !== 'founder'
        || typeof admin.memberId !== 'string' || !admin.memberId) {
      return NextResponse.json(
        { error: 'Verified founder member session required' },
        { status: 403, headers: PRIVATE_NO_STORE },
      );
    }

    const observation = observeReflectReader(
      process.env.PRO_STUDIO_REFLECT_BETA_ENABLED,
      process.env.PRO_STUDIO_REFLECT_BETA_MEMBER_IDS,
    );
    return NextResponse.json(
      { observation, observedAt: new Date().toISOString() },
      { status: 200, headers: PRIVATE_NO_STORE },
    );
  } catch {
    // Fail closed without leaking environment, member identity or auth detail.
    return NextResponse.json(
      { error: 'Reflect observation unavailable' },
      { status: 503, headers: PRIVATE_NO_STORE },
    );
  }
}

// No write methods. Next.js handles POST/PUT/PATCH/DELETE as 405.
