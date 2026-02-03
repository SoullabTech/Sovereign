/**
 * STUDIO TEAM MEMBER API
 *
 * PATCH: Update member role (admin+)
 * DELETE: Remove member (admin+ or self)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { requireTeamRole, getTeamRole, TeamRole } from '@/lib/auth/teamPermissions';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; memberId: string }> }
) {
  try {
    const actorId = await getMemberIdFromRequest(request);
    if (!actorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId, memberId: targetMemberId } = await params;

    // Require admin role to change roles
    let actorRole: TeamRole;
    try {
      actorRole = await requireTeamRole(actorId, teamId, 'admin');
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 403 });
    }

    const body = await request.json();
    const { role: newRole } = body;

    // Validate role
    if (!['admin', 'member', 'viewer'].includes(newRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Get target's current role
    const targetRole = await getTeamRole(targetMemberId, teamId);
    if (!targetRole) {
      return NextResponse.json({ error: 'Member not found in team' }, { status: 404 });
    }

    // Can't change owner's role (owner must transfer ownership separately)
    if (targetRole === 'owner') {
      return NextResponse.json(
        { error: 'Cannot change owner role. Transfer ownership instead.' },
        { status: 403 }
      );
    }

    // Admins can only manage members and viewers, not other admins
    if (actorRole === 'admin' && (targetRole === 'admin' || newRole === 'admin')) {
      return NextResponse.json(
        { error: 'Only the team owner can manage admin roles' },
        { status: 403 }
      );
    }

    await query(
      `UPDATE studio_team_members SET role = $1 WHERE team_id = $2 AND member_id = $3`,
      [newRole, teamId, targetMemberId]
    );

    return NextResponse.json({ success: true, role: newRole });
  } catch (error) {
    console.error('[Team Member API] PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; memberId: string }> }
) {
  try {
    const actorId = await getMemberIdFromRequest(request);
    if (!actorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId, memberId: targetMemberId } = await params;

    // Self-removal is always allowed (except for owner)
    const isSelfRemoval = actorId === targetMemberId;

    if (isSelfRemoval) {
      // Check if removing self as owner
      const selfRole = await getTeamRole(actorId, teamId);
      if (selfRole === 'owner') {
        return NextResponse.json(
          { error: 'Team owner cannot leave. Transfer ownership or delete the team.' },
          { status: 403 }
        );
      }
    } else {
      // Require admin role to remove others
      let actorRole: TeamRole;
      try {
        actorRole = await requireTeamRole(actorId, teamId, 'admin');
      } catch (e) {
        return NextResponse.json({ error: (e as Error).message }, { status: 403 });
      }

      // Get target's role
      const targetRole = await getTeamRole(targetMemberId, teamId);
      if (!targetRole) {
        return NextResponse.json({ error: 'Member not found in team' }, { status: 404 });
      }

      // Can't remove owner
      if (targetRole === 'owner') {
        return NextResponse.json({ error: 'Cannot remove team owner' }, { status: 403 });
      }

      // Admins can only remove members and viewers, not other admins
      if (actorRole === 'admin' && targetRole === 'admin') {
        return NextResponse.json(
          { error: 'Only the team owner can remove admins' },
          { status: 403 }
        );
      }
    }

    await query(
      `DELETE FROM studio_team_members WHERE team_id = $1 AND member_id = $2`,
      [teamId, targetMemberId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Team Member API] DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
