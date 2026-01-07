// Production requires force-dynamic for database access
export const dynamic = 'force-dynamic';


/**
 * Sign in existing member
 * Validates username/password and returns member data
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { createHash } from 'crypto';

// Simple password hashing (must match register)
function hashPassword(password: string): string {
  const salt = process.env.PASSWORD_SALT || 'maia-sovereign-salt';
  return createHash('sha256').update(password + salt).digest('hex');
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

    // Find member by username (case-insensitive)
    const result = await query(
      'SELECT id, passkey, username, password_hash, name, preferred_name, onboarded, onboarding_step FROM members WHERE LOWER(username) = LOWER($1)',
      [username]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const member = result.rows[0];

    // Verify password
    const passwordHash = hashPassword(password);
    if (passwordHash !== member.password_hash) {
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
    console.error('[MEMBERS] Sign in error:', error);
    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 }
    );
  }
}
