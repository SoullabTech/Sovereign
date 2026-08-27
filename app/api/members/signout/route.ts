export const dynamic = 'force-dynamic';

/**
 * Sign out member
 * Revokes session and clears all access control cookies
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';
import { ACCESS_CONTEXT_COOKIE } from '@/lib/auth/accessContext';

const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export async function POST() {
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
    // MUST be cleared with the rest. A signed access context is valid until its
    // own `exp` regardless of session state (see the revocation note in
    // lib/auth/accessContext.ts), so leaving it behind on sign-out would let the
    // grant outlive the logout it was issued under.
    cookieStore.set(ACCESS_CONTEXT_COOKIE, '', { ...clearOptions, httpOnly: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MEMBERS] Sign out error: ${message}`);
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }
}
