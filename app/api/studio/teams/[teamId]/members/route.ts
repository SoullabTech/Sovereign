/**
 * STUDIO TEAM MEMBERS API
 *
 * GET: List team members
 * POST: Invite member (admin+)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { getTeamMembers, requireTeamRole, TeamRole } from '@/lib/auth/teamPermissions';
import crypto from 'crypto';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId } = await params;

    // Verify membership (any role can view members)
    try {
      await requireTeamRole(memberId, teamId, 'viewer');
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 403 });
    }

    const members = await getTeamMembers(teamId);

    // Get pending invites (admin+ only)
    let invites: any[] = [];
    try {
      await requireTeamRole(memberId, teamId, 'admin');
      const inviteResult = await query(
        `SELECT id, email, role, invited_by, created_at, expires_at
         FROM studio_team_invites
         WHERE team_id = $1 AND accepted_at IS NULL AND expires_at > NOW()
         ORDER BY created_at DESC`,
        [teamId]
      );
      invites = inviteResult.rows;
    } catch (e) {
      // Non-admins don't see invites
    }

    return NextResponse.json({ members, invites });
  } catch (error) {
    console.error('[Team Members API] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId } = await params;

    // Require admin role to invite
    try {
      await requireTeamRole(memberId, teamId, 'admin');
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 403 });
    }

    const body = await request.json();
    const { email, role, member_id } = body;

    // Validate role
    if (!['admin', 'member', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // If direct member_id provided, add them directly
    if (member_id) {
      // Check if already a member
      const existingMember = await query(
        `SELECT id FROM studio_team_members WHERE team_id = $1 AND member_id = $2`,
        [teamId, member_id]
      );

      if (existingMember.rows.length > 0) {
        return NextResponse.json({ error: 'Already a team member' }, { status: 409 });
      }

      await query(
        `INSERT INTO studio_team_members (team_id, member_id, role, invited_by)
         VALUES ($1, $2, $3, $4)`,
        [teamId, member_id, role, memberId]
      );

      return NextResponse.json({
        success: true,
        message: 'Member added successfully',
      });
    }

    // Otherwise, create invite by email
    if (!email) {
      return NextResponse.json(
        { error: 'Email or member_id is required' },
        { status: 400 }
      );
    }

    // Check if email already has a pending invite
    const existingInvite = await query(
      `SELECT id FROM studio_team_invites
       WHERE team_id = $1 AND email = $2 AND accepted_at IS NULL AND expires_at > NOW()`,
      [teamId, email]
    );

    if (existingInvite.rows.length > 0) {
      return NextResponse.json({ error: 'Invite already pending for this email' }, { status: 409 });
    }

    // Check if email belongs to an existing member who's already in the team
    const existingMemberByEmail = await query(
      `SELECT m.id FROM members m
       JOIN studio_team_members tm ON m.id = tm.member_id
       WHERE m.email = $1 AND tm.team_id = $2`,
      [email, teamId]
    );

    if (existingMemberByEmail.rows.length > 0) {
      return NextResponse.json({ error: 'This person is already a team member' }, { status: 409 });
    }

    // Create invite
    const token = crypto.randomBytes(32).toString('hex');
    await query(
      `INSERT INTO studio_team_invites (team_id, email, role, invited_by, token)
       VALUES ($1, $2, $3, $4, $5)`,
      [teamId, email, role, memberId, token]
    );

    // TODO: Send invite email with link containing token

    return NextResponse.json({
      success: true,
      message: 'Invite created',
      invite_token: token, // Return token for testing; in production, only send via email
    });
  } catch (error) {
    console.error('[Team Members API] POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
