import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { listDMThreads, findOrCreateDMThread } from '@/lib/team/DMService';
import { resolveCurrentTeamId, COLAB_TEAM_COOKIE } from '@/lib/team/colabTeams';

export const dynamic = 'force-dynamic';

async function resolveTeam(memberId: string, request: NextRequest): Promise<string | null> {
  const jar = await cookies();
  const cookieTeam = jar.get(COLAB_TEAM_COOKIE)?.value
    ?? request.headers.get('x-colab-team-id')
    ?? null;
  return resolveCurrentTeamId(memberId, cookieTeam);
}

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const teamId = await resolveTeam(memberId, request);
  if (!teamId) return NextResponse.json({ threads: [] });

  const threads = await listDMThreads(memberId, teamId);
  return NextResponse.json({ threads, teamId });
}

export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const teamId = await resolveTeam(memberId, request);
  if (!teamId) return NextResponse.json({ error: 'No active Co-Lab.' }, { status: 400 });

  const body = await request.json();
  const { targetMemberId } = body;

  if (!targetMemberId || typeof targetMemberId !== 'string') {
    return NextResponse.json({ error: 'targetMemberId required' }, { status: 400 });
  }
  if (targetMemberId === memberId) {
    return NextResponse.json({ error: 'Cannot DM yourself' }, { status: 400 });
  }

  try {
    const dmThreadId = await findOrCreateDMThread(memberId, targetMemberId, teamId);
    return NextResponse.json({ dmThreadId });
  } catch (err: any) {
    if (err?.message?.includes('members of the active Co-Lab')) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    throw err;
  }
}
