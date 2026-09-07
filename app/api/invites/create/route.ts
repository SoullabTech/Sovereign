export const dynamic = 'force-dynamic';

/**
 * Create Invite API
 *
 * Allows members to generate invite passkeys for others.
 * Respects cooling periods and invite limits.
 */

import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import {
  generateInvitePasskey,
  calculateInviteExpiration,
} from '@/lib/auth/inviteConfig';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { intendedName, intendedEmail, personalNote } = body;

    /* IDENTITY IS SERVER-DERIVED. This route previously read `memberId` from
       the request body and used it to spend that member's invite allowance —
       with no session check, on a route the access matrix never mapped. A bare
       member id is a CLAIM, not authority, and member UUIDs reach clients. */
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get member info and check eligibility
    const memberResult = await query(
      `SELECT id, username, name, invites_remaining, can_invite_after, invite_tier
       FROM members WHERE id = $1`,
      [memberId]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    const member = memberResult.rows[0];

    // Check cooling period
    if (member.can_invite_after && new Date(member.can_invite_after) > new Date()) {
      const daysLeft = Math.ceil(
        (new Date(member.can_invite_after).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return NextResponse.json(
        {
          error: `You can start inviting in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
          canInviteAfter: member.can_invite_after,
        },
        { status: 403 }
      );
    }

    // Check remaining invites
    if (member.invites_remaining <= 0) {
      return NextResponse.json(
        { error: 'You have no invites remaining' },
        { status: 403 }
      );
    }

    // Generate unique passkey (retry if collision)
    let passkey: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      passkey = generateInvitePasskey();
      const existing = await query(
        'SELECT id FROM invites WHERE passkey = $1 UNION SELECT id FROM members WHERE passkey = $1',
        [passkey]
      );
      if (existing.rows.length === 0) break;
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Failed to generate unique passkey. Please try again.' },
        { status: 500 }
      );
    }

    const expiresAt = calculateInviteExpiration();

    // Create the invite
    await query(
      `INSERT INTO invites (passkey, created_by, intended_name, intended_email, personal_note, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [passkey, memberId, intendedName || null, intendedEmail || null, personalNote || null, expiresAt]
    );

    // Decrement remaining invites
    await query(
      'UPDATE members SET invites_remaining = invites_remaining - 1 WHERE id = $1',
      [memberId]
    );

    console.log(`[Invites] ${member.username} created invite ${passkey} for ${intendedName || 'unknown'}`);

    return NextResponse.json({
      success: true,
      invite: {
        passkey,
        intendedName,
        intendedEmail,
        expiresAt,
        createdBy: member.username,
      },
      invitesRemaining: member.invites_remaining - 1,
    });

  } catch (error) {
    console.error('[Invites] Create error:', error);
    return NextResponse.json(
      { error: 'Failed to create invite' },
      { status: 500 }
    );
  }
}
