import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { listTeamMembers } from '@/lib/team/DMService';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

/**
 * Resolve effective teamId — same logic as channels route.
 */
async function resolveTeamId(
  memberId: string,
  requestedTeamId: string | null
): Promise<{ teamId: string } | { error: string; status: number }> {
  if (requestedTeamId) {
    const access = await query(
      `SELECT 1 FROM studio_team_members WHERE team_id = $1 AND member_id = $2`,
      [requestedTeamId, memberId]
    );
    if (!access.rows.length) {
      return { error: 'Forbidden: not a member of this team', status: 403 };
    }
    return { teamId: requestedTeamId };
  }

  const memberTeam = await query<{ team_id: string }>(
    `SELECT team_id FROM studio_team_members WHERE member_id = $1 ORDER BY joined_at ASC LIMIT 1`,
    [memberId]
  );
  if (memberTeam.rows[0]) {
    return { teamId: memberTeam.rows[0].team_id };
  }

  const fallback = await query<{ id: string }>(
    `SELECT id FROM studio_teams ORDER BY created_at ASC LIMIT 1`
  );
  if (fallback.rows[0]) {
    return { teamId: fallback.rows[0].id };
  }

  return { error: 'No team available', status: 500 };
}

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const requestedTeamId = request.nextUrl.searchParams.get('teamId');
  const resolved = await resolveTeamId(memberId, requestedTeamId);
  if ('error' in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const members = await listTeamMembers(resolved.teamId);
  return NextResponse.json({ members, teamId: resolved.teamId });
}
