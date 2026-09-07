export const dynamic = 'force-dynamic';

/**
 * List Invites API
 *
 * Returns all invites created by a member with their status.
 */

import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ invites: [], inviteTree: [], stats: {}, member: {} });
  }
  try {
    /* IDENTITY IS SERVER-DERIVED. `?memberId=` previously selected WHOSE
       invites — passkeys, intended names and emails, personal notes, and the
       invite tree — were returned. It no longer carries authority. */
    const memberId = await getMemberIdFromRequest(request);

    if (!memberId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // First expire old invites
    await query(`
      UPDATE invites
      SET status = 'expired'
      WHERE status = 'pending' AND expires_at < NOW()
    `);

    // Get member info
    const memberResult = await query(
      `SELECT id, username, invites_remaining, can_invite_after, invite_tier
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

    // Get all invites created by this member
    const invitesResult = await query(
      `SELECT
         i.id,
         i.passkey,
         i.intended_name,
         i.intended_email,
         i.status,
         i.expires_at,
         i.created_at,
         i.redeemed_at,
         i.personal_note,
         m.username as redeemed_by_username,
         m.name as redeemed_by_name
       FROM invites i
       LEFT JOIN members m ON i.redeemed_by = m.id
       WHERE i.created_by = $1
       ORDER BY i.created_at DESC`,
      [memberId]
    );

    // Get invite tree (who this member invited, and who they invited)
    const inviteTreeResult = await query(
      `WITH RECURSIVE invite_tree AS (
         -- Direct invites
         SELECT
           m.id,
           m.username,
           m.name,
           m.created_at,
           m.invited_by,
           1 as depth
         FROM members m
         WHERE m.invited_by = $1

         UNION ALL

         -- Recursive: invites by those people
         SELECT
           m.id,
           m.username,
           m.name,
           m.created_at,
           m.invited_by,
           t.depth + 1
         FROM members m
         JOIN invite_tree t ON m.invited_by = t.id
         WHERE t.depth < 3  -- Limit depth to prevent infinite recursion
       )
       SELECT * FROM invite_tree ORDER BY depth, created_at DESC`,
      [memberId]
    );

    // Calculate stats
    const stats = {
      total: invitesResult.rows.length,
      pending: invitesResult.rows.filter(i => i.status === 'pending').length,
      redeemed: invitesResult.rows.filter(i => i.status === 'redeemed').length,
      expired: invitesResult.rows.filter(i => i.status === 'expired').length,
      revoked: invitesResult.rows.filter(i => i.status === 'revoked').length,
    };

    // Check if can invite
    const canInvite = member.invites_remaining > 0 &&
      (!member.can_invite_after || new Date(member.can_invite_after) <= new Date());

    const canInviteIn = member.can_invite_after && new Date(member.can_invite_after) > new Date()
      ? Math.ceil((new Date(member.can_invite_after).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;

    return NextResponse.json({
      invites: invitesResult.rows,
      inviteTree: inviteTreeResult.rows,
      stats,
      member: {
        invitesRemaining: member.invites_remaining,
        canInvite,
        canInviteIn,
        tier: member.invite_tier,
      },
    });

  } catch (error) {
    console.error('[Invites] List error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invites' },
      { status: 500 }
    );
  }
}
