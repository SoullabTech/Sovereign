import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getChannelMembers, addChannelMember, removeChannelMember } from '@/lib/team/ChannelService';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

async function isChannelAdminOrTeamAdmin(
  requesterId: string,
  channelId: string
): Promise<boolean> {
  // Check team_admin role
  const teamAdminResult = await query<{ roles: string[] | null }>(
    `SELECT roles FROM members WHERE id = $1`,
    [requesterId]
  );
  const roles = teamAdminResult.rows[0]?.roles ?? [];
  if (Array.isArray(roles) && (roles.includes('team_admin') || roles.includes('admin'))) {
    return true;
  }

  // Check channel owner/admin
  const channelRoleResult = await query<{ role: string }>(
    `SELECT role FROM team_channel_members WHERE channel_id = $1 AND member_id = $2`,
    [channelId, requesterId]
  );
  const role = channelRoleResult.rows[0]?.role;
  return role === 'owner' || role === 'admin';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const requesterId = await getMemberIdFromRequest(request);
  if (!requesterId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { channelId } = await params;

  // Requester must be a member or team admin to list members
  const canView = await isChannelAdminOrTeamAdmin(requesterId, channelId);
  const isMember = canView || (await query(
    `SELECT 1 FROM team_channel_members WHERE channel_id = $1 AND member_id = $2`,
    [channelId, requesterId]
  ).then(r => r.rows.length > 0));

  if (!isMember) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const members = await getChannelMembers(channelId);
  return NextResponse.json({ members });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const requesterId = await getMemberIdFromRequest(request);
  if (!requesterId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { channelId } = await params;

  const allowed = await isChannelAdminOrTeamAdmin(requesterId, channelId);
  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { memberId, role = 'member' } = body;

  if (!memberId) {
    return NextResponse.json({ error: 'memberId is required' }, { status: 400 });
  }

  await addChannelMember(channelId, memberId, requesterId, role);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const requesterId = await getMemberIdFromRequest(request);
  if (!requesterId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { channelId } = await params;

  const allowed = await isChannelAdminOrTeamAdmin(requesterId, channelId);
  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { memberId } = body;

  if (!memberId) {
    return NextResponse.json({ error: 'memberId is required' }, { status: 400 });
  }

  // Cannot remove the channel owner
  const ownerCheck = await query<{ role: string }>(
    `SELECT role FROM team_channel_members WHERE channel_id = $1 AND member_id = $2`,
    [channelId, memberId]
  );
  if (ownerCheck.rows[0]?.role === 'owner') {
    return NextResponse.json({ error: 'Cannot remove channel owner' }, { status: 400 });
  }

  await removeChannelMember(channelId, memberId);
  return NextResponse.json({ ok: true });
}
