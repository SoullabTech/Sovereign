/**
 * Revoke Invite API
 *
 * Allows members to revoke pending invites they created.
 * Returns the invite slot back to the member.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, inviteId } = body;

    if (!memberId || !inviteId) {
      return NextResponse.json(
        { error: 'Member ID and Invite ID are required' },
        { status: 400 }
      );
    }

    // Get the invite and verify ownership
    const inviteResult = await query(
      `SELECT id, passkey, status, created_by
       FROM invites
       WHERE id = $1`,
      [inviteId]
    );

    if (inviteResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invite not found' },
        { status: 404 }
      );
    }

    const invite = inviteResult.rows[0];

    // Verify ownership
    if (invite.created_by !== memberId) {
      return NextResponse.json(
        { error: 'You can only revoke your own invites' },
        { status: 403 }
      );
    }

    // Check if invite can be revoked
    if (invite.status !== 'pending') {
      return NextResponse.json(
        { error: `Cannot revoke an invite that is ${invite.status}` },
        { status: 400 }
      );
    }

    // Revoke the invite
    await query(
      `UPDATE invites SET status = 'revoked' WHERE id = $1`,
      [inviteId]
    );

    // Return the invite slot to the member
    await query(
      `UPDATE members SET invites_remaining = invites_remaining + 1 WHERE id = $1`,
      [memberId]
    );

    // Get updated count
    const memberResult = await query(
      `SELECT invites_remaining FROM members WHERE id = $1`,
      [memberId]
    );

    console.log(`[Invites] Revoked invite ${invite.passkey} by member ${memberId}`);

    return NextResponse.json({
      success: true,
      message: 'Invite revoked successfully',
      invitesRemaining: memberResult.rows[0]?.invites_remaining,
    });

  } catch (error) {
    console.error('[Invites] Revoke error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke invite' },
      { status: 500 }
    );
  }
}
