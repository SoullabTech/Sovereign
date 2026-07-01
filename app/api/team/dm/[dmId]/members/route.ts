import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getTeamRole } from '@/lib/auth/teamPermissions';
import { addMemberToDMThread, removeMemberFromDMThread } from '@/lib/team/DMService';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

async function getThreadTeamId(dmThreadId: string): Promise<string | null> {
  const r = await query<{ team_id: string }>(
    `SELECT team_id FROM team_dm_threads WHERE id = $1`,
    [dmThreadId]
  );
  return r.rows[0]?.team_id ?? null;
}

async function requireAdminOrOwner(
  requesterId: string,
  dmThreadId: string
): Promise<NextResponse | null> {
  const teamId = await getThreadTeamId(dmThreadId);
  if (!teamId) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
  const role = await getTeamRole(requesterId, teamId);
  if (role !== 'admin' && role !== 'owner') {
    return NextResponse.json({ error: 'Requires admin or owner role' }, { status: 403 });
  }
  return null;
}

// POST /api/team/dm/[dmId]/members — add a member to the thread
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ dmId: string }> }
) {
  const requesterId = await getMemberIdFromRequest(request);
  if (!requesterId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { dmId } = await params;
  const denied = await requireAdminOrOwner(requesterId, dmId);
  if (denied) return denied;

  const { memberId } = await request.json();
  if (!memberId) return NextResponse.json({ error: 'memberId required' }, { status: 400 });

  await addMemberToDMThread(dmId, memberId);
  return NextResponse.json({ ok: true });
}

// DELETE /api/team/dm/[dmId]/members — remove a member from the thread
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ dmId: string }> }
) {
  const requesterId = await getMemberIdFromRequest(request);
  if (!requesterId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { dmId } = await params;
  const denied = await requireAdminOrOwner(requesterId, dmId);
  if (denied) return denied;

  const { memberId } = await request.json();
  if (!memberId) return NextResponse.json({ error: 'memberId required' }, { status: 400 });

  try {
    await removeMemberFromDMThread(dmId, memberId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to remove member';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
