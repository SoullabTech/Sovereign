// Co-Lab team list for the sidebar switcher.
//
// Returns the teams a member can switch between: their own teams plus the
// default workspace (so everyone always has at least the shared workspace),
// and the currently-resolved team. Team CREATION reuses POST /api/studio/teams.

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getColabTeams, resolveCurrentTeamId, COLAB_TEAM_COOKIE } from '@/lib/team/colabTeams';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const cookieTeamId = request.cookies.get(COLAB_TEAM_COOKIE)?.value ?? null;
  const [teams, currentTeamId] = await Promise.all([
    getColabTeams(memberId),
    resolveCurrentTeamId(memberId, cookieTeamId),
  ]);

  return NextResponse.json({ teams, currentTeamId });
}
