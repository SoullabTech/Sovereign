export const dynamic = 'force-dynamic';

/**
 * Sign out member
 * Revokes session and clears all access control cookies
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';
import { AuthOriginError, requireSameOriginAuthMutation } from '@/lib/auth/returnDestination';

const NO_STORE = { 'Cache-Control': 'private, no-store' };

const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export async function POST(request: NextRequest) {
  try {
    requireSameOriginAuthMutation(request);
  } catch (error) {
    if (error instanceof AuthOriginError) {
      return NextResponse.json(
        { error: 'Request origin refused', reason: error.code },
        { status: 403, headers: NO_STORE },
      );
    }
    throw error;
  }
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('maia_session')?.value;

    if (token) {
      // Revoke session in database
      await query(
        `UPDATE auth_sessions
         SET revoked = TRUE, revoked_at = NOW(), revoked_reason = 'user_signout'
         WHERE session_token = $1`,
        [token]
      );
    }

    // Clear all access control cookies
    const clearOptions = {
      ...COOKIE_OPTIONS,
      expires: new Date(0),
    };

    cookieStore.set('maia_session', '', { ...clearOptions, httpOnly: true });
    cookieStore.set('maia_member_id', '', { ...clearOptions, httpOnly: true });
    cookieStore.set('maia_tier', '', { ...clearOptions, httpOnly: true });
    cookieStore.set('maia_roles', '', { ...clearOptions, httpOnly: true });

    return NextResponse.json({ success: true }, { headers: NO_STORE });
  } catch {
    console.error('[MEMBERS] Sign out could not be completed');
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500, headers: NO_STORE }
    );
  }
}
