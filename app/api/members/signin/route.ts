export const dynamic = 'force-static';

/**
 * Sign in existing member
 * Validates username/password, creates server-side session, sets httpOnly cookie
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';
import crypto, { createHash } from 'crypto';

function hashPassword(password: string): string {
  const salt = process.env.PASSWORD_SALT || 'maia-sovereign-salt';
  return createHash('sha256').update(password + salt).digest('hex');
}

function newSessionToken(): string {
  return crypto.randomBytes(32).toString('hex'); // 64 chars
}

function sessionExpiresAt(days = 30): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    console.log(`[MEMBERS] Sign in attempt: ${username}`);

    // Find member by username (case-insensitive)
    const result = await query(
      'SELECT id, passkey, username, password_hash, name, preferred_name, onboarded, onboarding_step, tier, roles FROM members WHERE LOWER(username) = LOWER($1)',
      [username]
    );

    if (result.rows.length === 0) {
      console.log(`[MEMBERS] Sign in failed: user not found - ${username}`);
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const member = result.rows[0];

    // Verify password
    const passwordHash = hashPassword(password);
    if (passwordHash !== member.password_hash) {
      console.log(`[MEMBERS] Sign in failed: wrong password - ${username}`);
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Update last sign in
    await query(
      'UPDATE members SET last_sign_in = NOW() WHERE id = $1',
      [member.id]
    );

    // Create server-side session
    const token = newSessionToken();
    const expiresAt = sessionExpiresAt(30);

    await query(
      `INSERT INTO auth_sessions (member_id, session_token, expires_at, revoked)
       VALUES ($1, $2, $3, FALSE)`,
      [member.id, token, expiresAt.toISOString()]
    );

    // Set httpOnly cookie (server-owned, not spoofable)
    const cookieStore = await cookies();
    cookieStore.set('maia_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });

    // Set tier cookie for middleware access checks
    cookieStore.set('maia_tier', member.tier || 'free', {
      httpOnly: false, // Readable by client for UI gating
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });

    // Set roles cookie for middleware access checks
    const roles = Array.isArray(member.roles) ? member.roles : ['member'];
    cookieStore.set('maia_roles', JSON.stringify(roles), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });

    // Set member ID cookie for API calls
    cookieStore.set('maia_member_id', member.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });

    console.log(`[MEMBERS] Sign in success: ${username} (${member.id}) tier=${member.tier} roles=${roles.join(',')}`);

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        username: member.username,
        name: member.name,
        preferredName: member.preferred_name || member.name,
        onboarded: member.onboarded,
        onboardingStep: member.onboarding_step
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MEMBERS] Sign in error: ${message}`);
    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 }
    );
  }
}
