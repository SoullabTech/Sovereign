/**
 * Register Local User API
 *
 * Allows users with existing local data to create a server account
 * without needing a passkey. This enables cross-device sync for
 * users who've been using the app locally.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, name, explorerId } = body;

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: 'Password must be at least 4 characters' },
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
      `INSERT INTO members (id, username, password_hash, name, passkey, onboarded, onboarding_step, created_at)
       VALUES ($1, $2, $3, $4, $5, true, 'complete', NOW())`,
      [memberId, normalizedUsername, passwordHash, name || username, passkey]
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

    return NextResponse.json({
      success: true,
      member: {
        id: memberId,
        username: normalizedUsername,
        name: name || username,
        passkey,
        onboarded: true,
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
