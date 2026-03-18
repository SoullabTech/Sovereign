export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';

function correlationId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * POST /api/nostr/channels/:channelId/join
 *
 * Joins the current member to an eligible channel.
 * Only open channels (cohort) can be joined via this endpoint.
 * Closed channels (practitioners, retreat, alumni) require admin assignment.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: { channelId: string } }
) {
  const cid = correlationId();
  const headers = { 'X-Correlation-ID': cid };

  const session = await getCurrentSession();
  const memberId = session?.memberId ?? null;

  if (!memberId) {
    return NextResponse.json(
      { error: 'Session required', correlationId: cid },
      { status: 401, headers }
    );
  }

  const { channelId } = params;

  if (!channelId || !/^[a-z0-9_-]{1,64}$/.test(channelId)) {
    return NextResponse.json(
      { error: 'Invalid channel ID', correlationId: cid },
      { status: 400, headers }
    );
  }

  try {
    // Verify channel exists and is open
    const channelResult = await query(
      'SELECT id, channel_type, is_open FROM nostr_channels WHERE id = $1',
      [channelId]
    );

    if (channelResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Channel not found', correlationId: cid },
        { status: 404, headers }
      );
    }

    const channel = channelResult.rows[0];

    // Verify member has Nostr key
    const memberResult = await query(
      'SELECT nostr_pubkey, is_practitioner, roles FROM members WHERE id = $1',
      [memberId]
    );

    if (!memberResult.rows[0]?.nostr_pubkey) {
      return NextResponse.json(
        { error: 'Sovereign messaging not set up', correlationId: cid },
        { status: 403, headers }
      );
    }

    const member = memberResult.rows[0];
    const isPractitioner =
      member.is_practitioner || (member.roles ?? []).includes('practitioner');

    // Gate closed channels
    if (!channel.is_open) {
      // Practitioners can join practitioners channel
      if (channel.channel_type === 'practitioners' && !isPractitioner) {
        return NextResponse.json(
          { error: 'Practitioners channel requires verified practitioner status', correlationId: cid },
          { status: 403, headers }
        );
      }
      // Retreat and alumni require explicit invitation
      if (channel.channel_type === 'retreat' || channel.channel_type === 'alumni') {
        return NextResponse.json(
          { error: 'This channel requires an invitation', correlationId: cid },
          { status: 403, headers }
        );
      }
    }

    // Upsert membership
    await query(
      `INSERT INTO nostr_channel_memberships (channel_id, member_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [channelId, memberId]
    );

    return NextResponse.json({ ok: true, channelId, correlationId: cid }, { headers });

  } catch (err) {
    console.error(`[Nostr Channels Join] ${cid}`, err);
    return NextResponse.json(
      { error: 'Database error', correlationId: cid },
      { status: 503, headers }
    );
  }
}
