export const dynamic = 'force-dynamic';

/**
 * Refresh Session & Redirect
 *
 * GET /api/auth/refresh-and-redirect?next=/stellium
 *
 * Refreshes tier/roles cookies from database then redirects to `next`.
 * Use this when middleware blocks access due to stale cookies.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';
import { ACCESS_CONTEXT_COOKIE, signAccessContext } from '@/lib/auth/accessContext';

interface SessionRow {
  member_id: string;
  expires_at: Date;
  revoked: boolean;
}

interface MemberRow {
  id: string;
  tier: string;
  roles: string[];
}

const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get('next') || '/maia';

  // Use Host header to determine the correct base URL
  // (request.nextUrl.origin returns internal Docker address like 0.0.0.0:3000)
  const host = request.headers.get('host') || 'soullab.life';
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = `${protocol}://${host}`;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('maia_session')?.value;

    if (!token) {
      // No session - redirect to signin
      return NextResponse.redirect(new URL(`/signin?next=${encodeURIComponent(next)}`, baseUrl));
    }

    // Validate session
    const sessionResult = await query<SessionRow>(
      `SELECT member_id, expires_at, revoked
       FROM auth_sessions
       WHERE session_token = $1`,
      [token]
    );

    if (sessionResult.rows.length === 0 || sessionResult.rows[0].revoked) {
      return NextResponse.redirect(new URL(`/signin?next=${encodeURIComponent(next)}&reason=invalid_session`, baseUrl));
    }

    const session = sessionResult.rows[0];
    const expiresAt = new Date(session.expires_at);

    if (expiresAt < new Date()) {
      return NextResponse.redirect(new URL(`/signin?next=${encodeURIComponent(next)}&reason=expired_session`, baseUrl));
    }

    // Get fresh member data
    const memberResult = await query<MemberRow>(
      `SELECT id,
              COALESCE(tier, 'free') as tier,
              COALESCE(roles, ARRAY['member']::TEXT[]) as roles
       FROM members WHERE id = $1`,
      [session.member_id]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.redirect(new URL(`/signin?next=${encodeURIComponent(next)}&reason=member_not_found`, baseUrl));
    }

    const member = memberResult.rows[0];

    // Create redirect response and set cookies
    const response = NextResponse.redirect(new URL(next, baseUrl));

    response.cookies.set('maia_member_id', member.id, {
      ...COOKIE_OPTIONS,
      httpOnly: true,
      expires: expiresAt,
    });

    response.cookies.set('maia_tier', member.tier, {
      ...COOKIE_OPTIONS,
      httpOnly: true,
      expires: expiresAt,
    });

    response.cookies.set('maia_roles', JSON.stringify(member.roles), {
      ...COOKIE_OPTIONS,
      httpOnly: true,
      expires: expiresAt,
    });

    // Signed access context (AUTH-BOUNDARY-01B). This route exists precisely to
    // re-derive tier/roles from the member record, so it is also the natural
    // place for an existing unsigned session to acquire a signed context without
    // re-authenticating — the migration path out of the compat window.
    const signedCtx = await signAccessContext({
      sub: member.id,
      roles: member.roles,
      tier: member.tier,
    });
    if (signedCtx) {
      response.cookies.set(ACCESS_CONTEXT_COOKIE, signedCtx, {
        ...COOKIE_OPTIONS,
        httpOnly: true,
        expires: expiresAt,
      });
    }

    console.log(`[RefreshRedirect] Refreshed cookies for member ${member.id}: tier=${member.tier} roles=${member.roles.join(',')} signedCtx=${signedCtx ? 'issued' : 'none'}`);

    return response;
  } catch (error) {
    console.error('[RefreshRedirect] Error:', error);
    return NextResponse.redirect(new URL(`/signin?next=${encodeURIComponent(next)}&reason=error`, baseUrl));
  }
}
