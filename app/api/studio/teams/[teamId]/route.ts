/**
 * STUDIO TEAM API
 *
 * GET: Get team details
 * PATCH: Update team (admin+)
 * DELETE: Delete team (owner only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { getTeamById, requireTeamRole } from '@/lib/auth/teamPermissions';

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

    // Verify membership and get team
    const team = await getTeamById(teamId, memberId);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if (!team.role) {
      return NextResponse.json({ error: 'Not a member of this team' }, { status: 403 });
    }

    return NextResponse.json({ team });
  } catch (error) {
    console.error('[Team API] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId } = await params;

    // Require admin role to update team
    try {
      await requireTeamRole(memberId, teamId, 'admin');
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, settings } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (settings !== undefined) {
      // Only owner can update settings
      try {
        await requireTeamRole(memberId, teamId, 'owner');
        updates.push(`settings = $${paramIndex++}`);
        values.push(JSON.stringify(settings));
      } catch (e) {
        return NextResponse.json(
          { error: 'Only the team owner can update settings' },
          { status: 403 }
        );
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(teamId);

    await query(
      `UPDATE studio_teams SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    const team = await getTeamById(teamId, memberId);

    return NextResponse.json({ success: true, team });
  } catch (error) {
    console.error('[Team API] PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId } = await params;

    // Only owner can delete team
    try {
      await requireTeamRole(memberId, teamId, 'owner');
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 403 });
    }

    await query(`DELETE FROM studio_teams WHERE id = $1`, [teamId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Team API] DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
