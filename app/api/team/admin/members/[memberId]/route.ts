import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { removeTeamMember } from '@/lib/auth/teamPermissions';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

async function getAdminTeamId(requesterId: string): Promise<string | null> {
  const r = await query<{ team_id: string }>(
    `SELECT team_id FROM studio_team_members
     WHERE member_id = $1 AND role IN ('owner', 'admin')
     LIMIT 1`,
    [requesterId]
  );
  return r.rows[0]?.team_id ?? null;
}

// DELETE /api/team/admin/members/[memberId]
// Removes a member from the Co-Lab team and their DM thread memberships.
// Does not delete the MAIA account.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const requesterId = await getMemberIdFromRequest(request);
  if (!requesterId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Must be admin or owner in the team
  const teamId = await getAdminTeamId(requesterId);
  if (!teamId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { memberId } = await params;

  // Prevent self-removal
  if (memberId === requesterId) {
    return NextResponse.json({ error: 'Cannot remove yourself from the Studio' }, { status: 400 });
  }

  // Prevent removing the team owner
  const ownerCheck = await query(
    `SELECT 1 FROM studio_team_members WHERE team_id = $1 AND member_id = $2 AND role = 'owner'`,
    [teamId, memberId]
  );
  if (ownerCheck.rows.length) {
    return NextResponse.json({ error: 'Cannot remove the team owner' }, { status: 400 });
  }

  await removeTeamMember(teamId, memberId);
  return NextResponse.json({ ok: true });
}
