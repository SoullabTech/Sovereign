export const dynamic = 'force-dynamic';

/**
 * Sign in existing member
 * Validates username/password, creates server-side session, sets httpOnly cookie
 * Transparently upgrades legacy SHA256 hashes to bcrypt on successful login
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';
import crypto from 'crypto';
import { verifyPassword, hashPassword } from '@/lib/auth/passwordUtils';

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
      'SELECT id, passkey, username, password_hash, name, preferred_name, onboarded, onboarding_step, tier, roles, password_changed_at FROM members WHERE LOWER(username) = LOWER($1)',
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

    // Verify password (auto-detects bcrypt vs legacy SHA256)
    const { ok, needsUpgrade } = await verifyPassword(password, member.password_hash);
    if (!ok) {
      console.log(`[MEMBERS] Sign in failed: wrong password - member=${member.id.slice(0, 8)}`);
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Transparently upgrade legacy SHA256 hash to bcrypt
    // Race-safe: only upgrade if hash hasn't changed (concurrent login won't flap)
    if (needsUpgrade) {
      const bcryptHash = await hashPassword(password);
      const upgradeResult = await query(
        'UPDATE members SET password_hash = $1, last_sign_in = NOW() WHERE id = $2 AND password_hash = $3',
        [bcryptHash, member.id, member.password_hash]
      );
      if (upgradeResult.rowCount === 1) {
        console.log(`[MEMBERS] Upgraded password hash to bcrypt: member=${member.id.slice(0, 8)}`);
      }
      // rowCount=0 means another process already upgraded - that's fine
    } else {
      // Update last sign in only
      await query(
        'UPDATE members SET last_sign_in = NOW() WHERE id = $1',
        [member.id]
      );
    }

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

    // Check if member has a practitioner profile
    let practitioner: { id: string; slug: string; name: string } | null = null;
    if (roles.includes('practitioner')) {
      const practitionerResult = await query(
        'SELECT id, slug, name FROM practitioners WHERE member_id = $1 LIMIT 1',
        [member.id]
      );
      if (practitionerResult.rows.length > 0) {
        practitioner = practitionerResult.rows[0];
      }
    }

    // Check if password change is needed (beta testers with NULL password_changed_at)
    const needsPasswordChange = member.password_changed_at === null;

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        username: member.username,
        name: member.name,
        preferredName: member.preferred_name || member.name,
        onboarded: member.onboarded,
        onboardingStep: member.onboarding_step
      },
      practitioner: practitioner ? {
        id: practitioner.id,
        slug: practitioner.slug,
        name: practitioner.name
      } : null,
      needsPasswordChange
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
