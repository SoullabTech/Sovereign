// SoulComms — Visibility flip preview
//
// GET /api/team/channels/[channelId]/visibility/preview
//
// Returns the count of members who would retain access if this channel
// were converted from public to private RIGHT NOW. Used by the toggle
// modal to show consequences before the user clicks confirm.
//
// CRITICAL: this endpoint MUST use the same getActiveParticipants helper
// that setChannelVisibility uses. Drift between preview and mutation is
// the one bug we cannot ship.

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getActiveParticipants } from '@/lib/team/getActiveParticipants';
import { isChannelAdminOrTeamAdmin } from '@/lib/team/permissions';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const requesterId = await getMemberIdFromRequest(request);
  if (!requesterId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { channelId } = await params;

  // Only owners/admins can see the preview — the count is essentially
  // a read of the member list, which is itself admin-gated.
  const allowed = await isChannelAdminOrTeamAdmin(requesterId, channelId);
  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const channelRow = await query<{ slug: string; is_private: boolean }>(
    `SELECT slug, is_private FROM team_channels WHERE id = $1`,
    [channelId]
  );
  if (!channelRow.rows[0]) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const participants = await getActiveParticipants(channelId);

  // The mutation will also include the requester. Mirror that here so
  // the count the user sees matches what they'll get.
  const wouldHaveAccess = new Set([...participants, requesterId]);

  return NextResponse.json({
    slug: channelRow.rows[0].slug,
    isPrivate: channelRow.rows[0].is_private,
    participantCount: wouldHaveAccess.size,
  });
}
