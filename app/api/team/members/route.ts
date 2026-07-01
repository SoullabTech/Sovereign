import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { listTeamMembers } from '@/lib/team/DMService';
import { resolveCurrentTeamId, COLAB_TEAM_COOKIE } from '@/lib/team/colabTeams';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const jar = await cookies();
  const cookieTeam = jar.get(COLAB_TEAM_COOKIE)?.value
    ?? request.headers.get('x-colab-team-id')
    ?? null;
  const teamId = await resolveCurrentTeamId(memberId, cookieTeam);
  if (!teamId) return NextResponse.json({ members: [] });

  const members = await listTeamMembers(teamId);
  return NextResponse.json({ members, teamId });
}
