/**
 * Register new member
 * Called after passkey validation during onboarding
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { createHash } from 'crypto';

// Simple password hashing (for production, use bcrypt)
function hashPassword(password: string): string {
  const salt = process.env.PASSWORD_SALT || 'maia-sovereign-salt';
  return createHash('sha256').update(password + salt).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { passkey, username, password, name, email } = await request.json();

    if (!passkey || !username || !password) {
      return NextResponse.json(
        { error: 'Passkey, username, and password required' },
        { status: 400 }
      );
    }

    // Check if passkey already exists
    const existing = await query(
      'SELECT id FROM members WHERE passkey = $1',
      [passkey.toUpperCase()]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Passkey already registered' },
        { status: 409 }
      );
    }

    // Check if username already exists
    const existingUsername = await query(
      'SELECT id FROM members WHERE username = $1',
      [username.toLowerCase()]
    );

    if (existingUsername.rows.length > 0) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    // Hash password and insert member
    const passwordHash = hashPassword(password);

    const result = await query(
      `INSERT INTO members (passkey, username, password_hash, name, email, onboarding_step)
       VALUES ($1, $2, $3, $4, $5, 'test-elemental')
       RETURNING id, username, name, onboarded, onboarding_step, created_at`,
      [passkey.toUpperCase(), username.toLowerCase(), passwordHash, name || username, email]
    );

    const member = result.rows[0];

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        username: member.username,
        name: member.name,
        onboarded: member.onboarded,
        onboardingStep: member.onboarding_step
      }
    });
  } catch (error) {
    console.error('[MEMBERS] Register error:', error);
    return NextResponse.json(
      { error: 'Failed to register member' },
      { status: 500 }
    );
  }
}
