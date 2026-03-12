export const dynamic = 'force-dynamic';

/**
 * Register via Email (Magic Link Path)
 *
 * No passkey required. Used when a new tester enters via magic link.
 * Creates account with onboarded: false so normal onboarding continues.
 *
 * POST /api/members/register-email
 * Body: { email, username, password, name }
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { hashPassword } from '@/lib/auth/passwordUtils';
import {
  checkRateLimit,
  getClientIP,
  buildRateLimitHeaders
} from '@/lib/auth/rateLimiter';

const ENDPOINT = '/api/members/register-email';

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  const rateLimitResult = await checkRateLimit(clientIP, 'ip', ENDPOINT);
  if (!rateLimitResult.allowed) {
    const headers = buildRateLimitHeaders(rateLimitResult);
    return NextResponse.json(
      { error: 'Too many registration attempts. Please try again later.' },
      { status: 429, headers }
    );
  }

  try {
    const { email, username, password, name } = await request.json();

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'Email, username, and password required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanUsername = username.trim();

    // Verify this email had a recent magic link token (within 30 minutes)
    const tokenCheck = await query(
      `SELECT id FROM magic_link_tokens
       WHERE email = $1 AND used = true
         AND COALESCE(used_at, created_at) > NOW() - INTERVAL '30 minutes'
       LIMIT 1`,
      [normalizedEmail]
    ).catch((err: unknown) => {
      console.warn('[register-email] magic_link_tokens query failed (table may not exist):', err instanceof Error ? err.message : err);
      return { rows: [] };
    });

    if (tokenCheck.rows.length === 0) {
      console.warn(`[register-email] Unverified email attempt: ${normalizedEmail}`);
      return NextResponse.json(
        { error: 'Email not verified. Please use the magic link sent to your email.' },
        { status: 403 }
      );
    }

    // Check username uniqueness
    const existingUsername = await query(
      'SELECT id FROM members WHERE LOWER(username) = LOWER($1)',
      [cleanUsername]
    );
    if (existingUsername.rows.length > 0) {
      return NextResponse.json(
        { error: 'Username already taken. Please choose a different one.' },
        { status: 409 }
      );
    }

    // Check email uniqueness
    const existingEmail = await query(
      'SELECT id FROM members WHERE email = $1',
      [normalizedEmail]
    );
    if (existingEmail.rows.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Try signing in instead.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const displayName = name?.trim() || cleanUsername;
    // Generate a synthetic passkey so the column constraint is satisfied
    const syntheticPasskey = `EMAIL-${cleanUsername.toUpperCase()}-${Date.now()}`;

    const result = await query(
      `INSERT INTO members (passkey, username, password_hash, name, email, onboarding_step)
       VALUES ($1, $2, $3, $4, $5, 'faq')
       RETURNING id, username, name, onboarded, onboarding_step`,
      [syntheticPasskey, cleanUsername, passwordHash, displayName, normalizedEmail]
    );

    const member = result.rows[0];
    console.log(`[register-email] Created: ${cleanUsername} (${member.id})`);

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        username: member.username,
        name: member.name,
        onboarded: member.onboarded,
        onboardingStep: member.onboarding_step,
      },
    });

  } catch (error) {
    console.error('[register-email] Error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
