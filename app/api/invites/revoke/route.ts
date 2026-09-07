export const dynamic = 'force-dynamic';

/**
 * Revoke Invite API
 *
 * Allows members to revoke pending invites they created.
 * Returns the invite slot back to the member.
 */

import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inviteId } = body;

    /* IDENTITY IS SERVER-DERIVED. Ownership below is `invite.created_by ===
       memberId`; while `memberId` came from the body, that comparison proved
       only that the caller could name the owner. */
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!inviteId) {
      return NextResponse.json(
        { ok: false, code: 'MISSING_PARAMS', error: 'Member ID and Invite ID are required' },
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
        { ok: false, code: 'NOT_FOUND', error: 'Invite not found' },
        { status: 404 }
      );
    }

    const invite = inviteResult.rows[0];

    // Verify ownership
    if (invite.created_by !== memberId) {
      return NextResponse.json(
        { ok: false, code: 'FORBIDDEN', error: 'You can only revoke your own invites' },
        { status: 403 }
      );
    }

    // Handle already-terminal states before attempting UPDATE
    const status = invite.status as string;

    // Already revoked → idempotent success (no log, no state change)
    if (status === 'revoked') {
      const memberResult = await query(
        `SELECT invites_remaining FROM members WHERE id = $1`,
        [memberId]
      );
      return NextResponse.json({
        ok: true,
        alreadyRevoked: true,
        invitesRemaining: memberResult.rows[0]?.invites_remaining,
      });
    }

    // Already redeemed → cannot revoke a used invite
    if (status === 'redeemed') {
      return NextResponse.json(
        { ok: false, code: 'ALREADY_USED', error: 'Cannot revoke an invite that has been used' },
        { status: 409 }
      );
    }

    // Already expired → idempotent success (no log, leave history untouched)
    if (status === 'expired') {
      const memberResult = await query(
        `SELECT invites_remaining FROM members WHERE id = $1`,
        [memberId]
      );
      return NextResponse.json({
        ok: true,
        alreadyExpired: true,
        invitesRemaining: memberResult.rows[0]?.invites_remaining,
      });
    }

    // Conditional UPDATE: only revoke if still pending (prevents race conditions)
    const revokeResult = await query(
      `UPDATE invites SET status = 'revoked'
       WHERE id = $1 AND status = 'pending'`,
      [inviteId]
    );

    if (revokeResult.rowCount === 0) {
      // Race condition: status changed between SELECT and UPDATE
      // Re-fetch to determine actual state
      const recheckResult = await query(
        `SELECT status FROM invites WHERE id = $1`,
        [inviteId]
      );
      const newStatus = recheckResult.rows[0]?.status;

      // Another request revoked it first → idempotent success (no log)
      if (newStatus === 'revoked') {
        const memberResult = await query(
          `SELECT invites_remaining FROM members WHERE id = $1`,
          [memberId]
        );
        return NextResponse.json({
          ok: true,
          alreadyRevoked: true,
          invitesRemaining: memberResult.rows[0]?.invites_remaining,
        });
      }

      if (newStatus === 'redeemed') {
        return NextResponse.json(
          { ok: false, code: 'ALREADY_USED', error: 'Invite was used before it could be revoked' },
          { status: 409 }
        );
      }

      // Unknown state change
      return NextResponse.json(
        { ok: false, code: 'STATE_CHANGED', error: `Invite state changed to: ${newStatus}` },
        { status: 409 }
      );
    }

    // Successfully revoked: return the invite slot to the member
    await query(
      `UPDATE members SET invites_remaining = invites_remaining + 1 WHERE id = $1`,
      [memberId]
    );

    // Get updated count
    const memberResult = await query(
      `SELECT invites_remaining FROM members WHERE id = $1`,
      [memberId]
    );

    // Log only when we actually changed state (dev-only, truncated for privacy)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Invites] Revoked [revoke]: invite=${inviteId.slice(0, 8)}...`);
    }

    return NextResponse.json({
      ok: true,
      invitesRemaining: memberResult.rows[0]?.invites_remaining,
    });

  } catch (error) {
    console.error('[Invites] Revoke error:', error);
    return NextResponse.json(
      { ok: false, code: 'INTERNAL_ERROR', error: 'Failed to revoke invite' },
      { status: 500 }
    );
  }
}
