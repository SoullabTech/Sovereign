export const dynamic = 'force-dynamic';

/**
 * Biometric Session Endpoint
 *
 * POST /api/auth/biometric-session
 *
 * Creates a new session for a member after client-side biometric verification.
 * The biometric check happens on the device (Face ID/Touch ID) which unlocks
 * the member's stored credentials from the iOS Keychain.
 *
 * Security considerations:
 * - This trusts that the client has performed biometric verification
 * - The memberId must exist in the database
 * - Rate limiting should be applied in production
 * - Device trust checks add additional security
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';
import { createSession, setSessionCookie } from '@/lib/auth/serverSessions';

export async function POST(req: NextRequest) {
  try {
    const { memberId, username } = await req.json();

    if (!memberId) {
      return NextResponse.json({ error: 'Missing memberId' }, { status: 400 });
    }

    // Verify member exists
    const memberResult = await query(
      `SELECT id, username, name, preferred_name, onboarded, onboarding_step, tier, roles
       FROM members WHERE id = $1`,
      [memberId]
    );

    if (memberResult.rows.length === 0) {
      console.warn('[BIOMETRIC] Member not found:', memberId);
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const member = memberResult.rows[0];

    // Optional: Verify username matches if provided
    if (username && member.username.toLowerCase() !== username.toLowerCase()) {
      console.warn('[BIOMETRIC] Username mismatch:', username, 'vs', member.username);
      return NextResponse.json({ error: 'Username mismatch' }, { status: 400 });
    }

    // Create a new session
    const session = await createSession({
      memberId: member.id,
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'biometric-auth',
    });

    // Set session cookie
    await setSessionCookie(session.sessionToken, session.expiresAt);

    // Set member ID cookie
    const cookieStore = await cookies();
    cookieStore.set('maia_member_id', member.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: session.expiresAt,
    });

    // Map tier to access level
    let accessTier: 'free' | 'personal' | 'pro' = 'personal';
    if (member.tier) {
      const t = member.tier.toLowerCase();
      if (t === 'pro' || t === 'premium' || t === 'vip') accessTier = 'pro';
      else if (t === 'free' || t === 'guest') accessTier = 'free';
    }

    // Get roles
    const roles = Array.isArray(member.roles) && member.roles.length > 0
      ? member.roles
      : ['member'];

    // Set tier and roles cookies
    cookieStore.set('maia_tier', accessTier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: session.expiresAt,
    });

    cookieStore.set('maia_roles', JSON.stringify(roles), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: session.expiresAt,
    });

    console.log(`[BIOMETRIC] Session created for ${member.id} (${member.username})`);

    return NextResponse.json({
      ok: true,
      member: {
        id: member.id,
        username: member.username,
        name: member.name,
        preferredName: member.preferred_name,
        onboarded: member.onboarded,
        onboardingStep: member.onboarding_step,
        tier: accessTier,
        roles,
      },
      session: {
        token: session.sessionToken,
        expiresAt: session.expiresAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('[BIOMETRIC] Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
