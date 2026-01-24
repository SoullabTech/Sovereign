// Production requires force-dynamic for database access
export const dynamic = 'force-dynamic';

/**
 * Register new member
 * Called after passkey validation during onboarding
 *
 * ROBUST DESIGN:
 * - Works even if invites table doesn't exist
 * - SOULLAB-* passkeys always accepted (admin passkeys)
 * - Falls back gracefully on missing columns
 * - Detailed error logging for debugging
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { hashPassword } from '@/lib/auth/passwordUtils';

// Check if passkey is an admin passkey (always allowed)
function isAdminPasskey(passkey: string): boolean {
  const adminPrefixes = ['SOULLAB-', 'MAIA-', 'PIONEER-', 'FOUNDING-'];
  return adminPrefixes.some(prefix => passkey.toUpperCase().startsWith(prefix));
}

// Safe query that returns empty result on table/column errors
async function safeQuery(sql: string, params: unknown[] = []): Promise<{ rows: Record<string, unknown>[]; rowCount: number | null; error?: string }> {
  try {
    const result = await query(sql, params);
    return { rows: result.rows, rowCount: result.rowCount };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    // Log but don't throw - return empty result
    if (message.includes('does not exist') || message.includes('column')) {
      console.warn(`[MEMBERS] Query skipped (missing table/column): ${message}`);
      return { rows: [], rowCount: 0, error: message };
    }
    throw error; // Re-throw unexpected errors
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { passkey, username, password, name, email, preferredName } = body;

    console.log(`[MEMBERS] Registration attempt: passkey=${passkey}, username=${username}`);

    if (!passkey || !username || !password) {
      console.log('[MEMBERS] Missing required fields');
      return NextResponse.json(
        { error: 'Passkey, username, and password required' },
        { status: 400 }
      );
    }

    const normalizedPasskey = passkey.toUpperCase().trim();
    // Preserve user's chosen casing for display, trim whitespace only
    const cleanUsername = username.trim();

    // Validate passkey format for admin passkeys
    if (!isAdminPasskey(normalizedPasskey)) {
      console.log(`[MEMBERS] Invalid passkey format: ${normalizedPasskey}`);
      return NextResponse.json(
        { error: 'Invalid passkey format. Contact support for a valid passkey.' },
        { status: 400 }
      );
    }

    // Check if passkey already registered
    const existing = await safeQuery(
      'SELECT id FROM members WHERE passkey = $1',
      [normalizedPasskey]
    );

    if (existing.rows.length > 0) {
      console.log(`[MEMBERS] Passkey already registered: ${normalizedPasskey}`);
      return NextResponse.json(
        { error: 'This passkey has already been used. If this is you, try signing in instead.' },
        { status: 409 }
      );
    }

    // Check if username already taken (case-insensitive)
    const existingUsername = await safeQuery(
      'SELECT id FROM members WHERE LOWER(username) = LOWER($1)',
      [cleanUsername]
    );

    if (existingUsername.rows.length > 0) {
      console.log(`[MEMBERS] Username already taken: ${cleanUsername}`);
      return NextResponse.json(
        { error: 'Username already taken. Please choose a different one.' },
        { status: 409 }
      );
    }

    // Check invites table (optional - might not exist)
    let inviterId: string | null = null;
    let inviteId: string | null = null;

    const inviteResult = await safeQuery(
      `SELECT id, created_by, status, expires_at FROM invites WHERE passkey = $1`,
      [normalizedPasskey]
    );

    if (!inviteResult.error && inviteResult.rows.length > 0) {
      const invite = inviteResult.rows[0];

      if (invite.status !== 'pending') {
        return NextResponse.json(
          { error: `This invite has already been ${invite.status}` },
          { status: 400 }
        );
      }

      if (invite.expires_at && new Date(invite.expires_at as string) < new Date()) {
        // Conditional guard: only expire if still pending (defensive, matches list route pattern)
        await safeQuery('UPDATE invites SET status = $1 WHERE id = $2 AND status = $3', ['expired', invite.id, 'pending']);
        return NextResponse.json(
          { error: 'This invite has expired. Please request a new one.' },
          { status: 400 }
        );
      }

      inviterId = invite.created_by as string | null;
      inviteId = invite.id as string;
    }
    // If no invite found but it's an admin passkey, that's fine - continue

    // Hash password with bcrypt
    const passwordHash = await hashPassword(password);
    const displayName = name || username;

    // Try full insert first (with all columns)
    let result = await safeQuery(
      `INSERT INTO members (
         passkey, username, password_hash, name, email, onboarding_step
       )
       VALUES ($1, $2, $3, $4, $5, 'test-elemental')
       RETURNING id, username, name, onboarded, onboarding_step, created_at`,
      [normalizedPasskey, cleanUsername, passwordHash, displayName, email]
    );

    if (result.error) {
      console.error(`[MEMBERS] Insert failed: ${result.error}`);
      return NextResponse.json(
        { error: 'Registration failed. Please try again or contact support.' },
        { status: 500 }
      );
    }

    if (result.rows.length === 0) {
      console.error('[MEMBERS] Insert returned no rows');
      return NextResponse.json(
        { error: 'Registration failed. Please try again.' },
        { status: 500 }
      );
    }

    const member = result.rows[0];
    console.log(`[MEMBERS] Successfully registered: ${cleanUsername} (${member.id})`);

    // Try to update invite status (optional - might fail if table missing)
    // Conditional WHERE prevents double-redemption race condition
    if (inviteId) {
      const updateResult = await safeQuery(
        `UPDATE invites
         SET status = 'redeemed', redeemed_by = $1, redeemed_at = NOW()
         WHERE id = $2 AND status = 'pending'`,
        [member.id, inviteId]
      );

      if (!updateResult.error && updateResult.rowCount === 1) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[MEMBERS] Invite redeemed: ${inviteId}`);
        }
      } else if (!updateResult.error && updateResult.rowCount === 0) {
        // Race condition: invite was already redeemed between check and update
        // Member was still created, but invite might have been used by another request
        // Always warn (even in prod) - this is a "should rarely happen" sentinel
        console.warn(`[MEMBERS] Race sentinel [redeem]: invite=${inviteId.slice(0, 8)}... state changed before update`);
      }
    }

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        username: member.username,
        name: member.name,
        onboarded: member.onboarded,
        onboardingStep: member.onboarding_step,
      }
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : '';
    console.error(`[MEMBERS] Register error: ${message}`);
    console.error(`[MEMBERS] Stack: ${stack}`);

    return NextResponse.json(
      { error: 'Registration failed. Please try again or contact support.' },
      { status: 500 }
    );
  }
}
