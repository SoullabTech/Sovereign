// Production requires force-dynamic for database access
export const dynamic = 'force-dynamic';


/**
 * Register new member
 * Called after passkey validation during onboarding
 *
 * Supports both:
 * - Admin-issued passkeys (SOULLAB-TESTER, etc.)
 * - Member-created invite passkeys (SOULLAB-AURORA-123, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { createHash } from 'crypto';
import {
  calculateCanInviteAfter,
  getInitialInvites,
  getTierForPasskey,
} from '@/lib/auth/inviteConfig';

// Simple password hashing (for production, use bcrypt)
function hashPassword(password: string): string {
  const salt = process.env.PASSWORD_SALT || 'maia-sovereign-salt';
  return createHash('sha256').update(password + salt).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { passkey, username, password, name, email, preferredName } = await request.json();

    if (!passkey || !username || !password) {
      return NextResponse.json(
        { error: 'Passkey, username, and password required' },
        { status: 400 }
      );
    }

    const normalizedPasskey = passkey.toUpperCase();

    // Check if passkey already exists as a member
    const existing = await query(
      'SELECT id FROM members WHERE passkey = $1',
      [normalizedPasskey]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Passkey already registered' },
        { status: 409 }
      );
    }

    // Check if this is a member-created invite
    let inviterId: string | null = null;
    let inviteId: string | null = null;

    const inviteResult = await query(
      `SELECT id, created_by, status, expires_at
       FROM invites
       WHERE passkey = $1`,
      [normalizedPasskey]
    );

    if (inviteResult.rows.length > 0) {
      const invite = inviteResult.rows[0];

      // Check invite status
      if (invite.status !== 'pending') {
        return NextResponse.json(
          { error: `This invite has already been ${invite.status}` },
          { status: 400 }
        );
      }

      // Check if expired
      if (new Date(invite.expires_at) < new Date()) {
        // Mark as expired
        await query('UPDATE invites SET status = $1 WHERE id = $2', ['expired', invite.id]);
        return NextResponse.json(
          { error: 'This invite has expired. Please request a new one.' },
          { status: 400 }
        );
      }

      inviterId = invite.created_by;
      inviteId = invite.id;
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

    // Determine tier based on passkey (founding passkeys get VIP treatment)
    const tier = getTierForPasskey(normalizedPasskey);
    const canInviteAfter = calculateCanInviteAfter(tier);
    const initialInvites = getInitialInvites(tier);

    if (tier === 'founding') {
      console.log(`[MEMBERS] Founding passkey detected: ${normalizedPasskey} - granting 100 invites`);
    }

    const result = await query(
      `INSERT INTO members (
         passkey, username, password_hash, name, preferred_name, email,
         onboarding_step, invited_by, invites_remaining, can_invite_after, invite_tier
       )
       VALUES ($1, $2, $3, $4, $5, $6, 'test-elemental', $7, $8, $9, $10)
       RETURNING id, username, name, preferred_name, onboarded, onboarding_step, created_at`,
      [
        normalizedPasskey,
        username.toLowerCase(),
        passwordHash,
        name || username,
        preferredName || name || username,
        email,
        inviterId,
        initialInvites,
        canInviteAfter,
        tier
      ]
    );

    const member = result.rows[0];

    // If this was an invite, mark it as redeemed
    if (inviteId) {
      await query(
        `UPDATE invites SET status = 'redeemed', redeemed_by = $1, redeemed_at = NOW() WHERE id = $2`,
        [member.id, inviteId]
      );

      // Log the invite chain
      const inviterResult = await query('SELECT username FROM members WHERE id = $1', [inviterId]);
      const inviterUsername = inviterResult.rows[0]?.username;
      console.log(`[MEMBERS] ${member.username} joined via invite from ${inviterUsername}`);
    }

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        username: member.username,
        name: member.name,
        preferredName: member.preferred_name,
        onboarded: member.onboarded,
        onboardingStep: member.onboarding_step,
        invitedBy: inviterId,
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
