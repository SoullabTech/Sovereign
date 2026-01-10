// Production requires force-dynamic for database access
export const dynamic = 'force-dynamic';


/**
 * Check if passkey exists in database
 * Used to determine if user is new or returning
 *
 * Checks both:
 * - Registered members (returning users)
 * - Valid invite passkeys (new users with invite)
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export async function POST(request: NextRequest) {
  try {
    const { passkey } = await request.json();

    if (!passkey) {
      return NextResponse.json(
        { error: 'Passkey required' },
        { status: 400 }
      );
    }

    const normalizedPasskey = passkey.toUpperCase();

    // Check if passkey exists in members table (returning user)
    const memberResult = await query(
      'SELECT id, username, name, onboarded, onboarding_step FROM members WHERE passkey = $1',
      [normalizedPasskey]
    );

    if (memberResult.rows.length > 0) {
      const member = memberResult.rows[0];
      return NextResponse.json({
        exists: true,
        isInvite: false,
        onboarded: member.onboarded,
        onboardingStep: member.onboarding_step,
        username: member.username,
        name: member.name
      });
    }

    // Check if this is a valid invite passkey (new user with invite)
    const inviteResult = await query(
      `SELECT i.id, i.status, i.expires_at, i.intended_name, m.username as inviter_username, m.name as inviter_name
       FROM invites i
       JOIN members m ON i.created_by = m.id
       WHERE i.passkey = $1`,
      [normalizedPasskey]
    );

    if (inviteResult.rows.length > 0) {
      const invite = inviteResult.rows[0];

      // Check if invite is valid
      if (invite.status !== 'pending') {
        return NextResponse.json({
          exists: false,
          isInvite: true,
          inviteStatus: invite.status,
          error: `This invite has already been ${invite.status}`
        });
      }

      // Check if expired
      if (new Date(invite.expires_at) < new Date()) {
        return NextResponse.json({
          exists: false,
          isInvite: true,
          inviteStatus: 'expired',
          error: 'This invite has expired'
        });
      }

      // Valid invite - user can register with this passkey
      return NextResponse.json({
        exists: false,
        isInvite: true,
        inviteStatus: 'valid',
        inviterName: invite.inviter_name,
        inviterUsername: invite.inviter_username,
        intendedName: invite.intended_name,
      });
    }

    return NextResponse.json({ exists: false, isInvite: false });
  } catch (error) {
    console.error('[MEMBERS] Check passkey error:', error);
    return NextResponse.json(
      { error: 'Failed to check passkey' },
      { status: 500 }
    );
  }
}
