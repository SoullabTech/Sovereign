export const dynamic = 'force-static';

/**
 * Register Local User API
 *
 * Allows users with existing local data to create a server account
 * without needing a passkey. This enables cross-device sync for
 * users who've been using the app locally.
 *
 * Security features are controlled by betaConfig:
 * - During beta: simplified registration (short passwords, no email required)
 * - After beta: full security enforcement
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { betaConfig, validatePassword, validateEmail } from '@/lib/auth/betaConfig';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const body = await request.json();
    const { username, password, email, name, explorerId } = body;

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Use betaConfig for password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Use betaConfig for email validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }

    const normalizedUsername = username.toLowerCase().trim();

    // Check if username already exists
    const existingUser = await query(
      'SELECT id FROM members WHERE username = $1',
      [normalizedUsername]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Username already taken. Please choose another.' },
        { status: 409 }
      );
    }

    // Generate member ID and passkey
    const memberId = crypto.randomUUID();
    const passkey = `SOULLAB-${normalizedUsername.toUpperCase()}`;

    // Hash password
    const passwordHash = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');

    // Create member
    await query(
      `INSERT INTO members (id, username, password_hash, name, email, passkey, onboarded, onboarding_step, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, 'complete', NOW())`,
      [memberId, normalizedUsername, passwordHash, name || username, email || null, passkey]
    );

    console.log(`[RegisterLocal] Created account for ${normalizedUsername} (${memberId})`);

    // If explorerId provided, migrate data
    if (explorerId && explorerId !== memberId) {
      try {
        // Call the migration endpoint internally
        const migrationResponse = await fetch(new URL('/api/members/migrate-data', request.url), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            oldUserId: explorerId,
            newUserId: memberId,
          }),
        });

        if (migrationResponse.ok) {
          const result = await migrationResponse.json();
          console.log(`[RegisterLocal] Migrated ${result.totalMigrated} records for ${normalizedUsername}`);
        }
      } catch (migrationError) {
        console.warn('[RegisterLocal] Migration failed, but account created:', migrationError);
        // Don't fail the registration if migration fails
      }
    }

    // Send verification email if email provided and verification is required
    let verificationSent = false;
    if (email && betaConfig.requireEmailVerification) {
      try {
        const verificationResponse = await fetch(new URL('/api/members/send-verification', request.url), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId, email }),
        });

        if (verificationResponse.ok) {
          verificationSent = true;
          console.log(`[RegisterLocal] Verification email sent to ${email}`);
        }
      } catch (verificationError) {
        console.warn('[RegisterLocal] Verification email failed, but account created:', verificationError);
      }
    }

    return NextResponse.json({
      success: true,
      member: {
        id: memberId,
        username: normalizedUsername,
        name: name || username,
        email: email || null,
        passkey,
        onboarded: true,
        emailVerificationRequired: betaConfig.requireEmailVerification,
        emailVerificationSent: verificationSent,
      },
    });

  } catch (error) {
    console.error('[RegisterLocal] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
