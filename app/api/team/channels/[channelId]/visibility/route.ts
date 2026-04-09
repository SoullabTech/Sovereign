// SoulComms — Channel visibility toggle (public ⇄ private)
//
// PATCH /api/team/channels/[channelId]/visibility
//   body: { isPrivate: boolean }
//
// Auth: requester must be channel owner/admin OR global team_admin/admin.
// On public→private, seeds team_channel_members with active participants
// (sender of ≥1 message) + creator + requester (as owner).
// On private→public, flips the flag and preserves the existing roster.
//
// System channels (general, announcements) are refused at the service layer.

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { setChannelVisibility } from '@/lib/team/ChannelService';
import { isChannelAdminOrTeamAdmin } from '@/lib/team/permissions';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const requesterId = await getMemberIdFromRequest(request);
  if (!requesterId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { channelId } = await params;

  const allowed = await isChannelAdminOrTeamAdmin(requesterId, channelId);
  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: { isPrivate?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof body.isPrivate !== 'boolean') {
    return NextResponse.json(
      { error: 'isPrivate must be a boolean' },
      { status: 400 }
    );
  }

  try {
    const result = await setChannelVisibility(channelId, body.isPrivate, requesterId);

    if (!result.ok) {
      switch (result.code) {
        case 'NOT_FOUND':
          return NextResponse.json({ error: 'not_found' }, { status: 404 });
        case 'SYSTEM_CHANNEL':
          return NextResponse.json(
            { error: 'system_channel', message: result.message },
            { status: 400 }
          );
        case 'ALREADY_IN_TARGET_STATE':
          return NextResponse.json(
            { error: 'already_in_target_state' },
            { status: 400 }
          );
      }
    }

    console.log('[team-channel] visibility-changed', {
      channelId,
      slug: result.slug,
      newState: result.isPrivate ? 'private' : 'public',
      changedBy: requesterId,
      seededMemberCount: result.seededMemberCount,
    });

    return NextResponse.json({
      ok: true,
      isPrivate: result.isPrivate,
      seededMemberCount: result.seededMemberCount,
    });
  } catch (err) {
    console.error('[team-channel] visibility flip failed', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
