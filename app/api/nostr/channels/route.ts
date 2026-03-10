export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';

function correlationId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * GET /api/nostr/channels
 *
 * Returns the list of channels available to the current member.
 * Eligibility rules:
 *   - cohort:        all registered Nostr members
 *   - practitioners: members with is_practitioner = true
 *   - retreat:       explicit DB membership (facilitator-assigned)
 *   - alumni:        explicit DB membership (admin-assigned)
 *
 * Also indicates whether the member has already joined each channel.
 * Open channels (cohort) are auto-joined on first access via this endpoint.
 */
export async function GET(_req: NextRequest) {
  const cid = correlationId();
  const headers = { 'X-Correlation-ID': cid };

  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json([], { headers });
  }

  const session = await getCurrentSession();
  const memberId = session?.memberId ?? null;

  if (!memberId) {
    return NextResponse.json(
      { error: 'Session required', code: 'NO_SESSION', correlationId: cid },
      { status: 401, headers }
    );
  }

  try {
    // Fetch member's profile to determine eligibility
    const memberResult = await query(
      'SELECT nostr_pubkey, is_practitioner, roles FROM members WHERE id = $1',
      [memberId]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Member not found', correlationId: cid },
        { status: 404, headers }
      );
    }

    const member = memberResult.rows[0];
    const hasNostrKey = !!member.nostr_pubkey;
    const isPractitioner = member.is_practitioner || (member.roles ?? []).includes('practitioner');

    if (!hasNostrKey) {
      // Member hasn't set up sovereign messaging yet — return empty list
      return NextResponse.json([], { headers });
    }

    // Fetch all channels + this member's current memberships
    const result = await query(
      `SELECT
         c.id, c.name, c.about, c.channel_type, c.is_open, c.relay_url,
         m.member_id IS NOT NULL AS joined,
         m.role
       FROM nostr_channels c
       LEFT JOIN nostr_channel_memberships m
         ON m.channel_id = c.id AND m.member_id = $1
       ORDER BY
         CASE c.channel_type
           WHEN 'cohort'        THEN 1
           WHEN 'practitioners' THEN 2
           WHEN 'retreat'       THEN 3
           WHEN 'alumni'        THEN 4
           ELSE 5
         END`,
      [memberId]
    );

    // Determine eligibility and auto-join open channels
    const autoJoins: string[] = [];
    const channels = result.rows.map(row => {
      let eligible = false;

      switch (row.channel_type) {
        case 'cohort':
          eligible = true; // all Nostr members
          break;
        case 'practitioners':
          eligible = isPractitioner;
          break;
        case 'retreat':
        case 'alumni':
          eligible = row.joined as boolean; // only if explicitly added
          break;
        default:
          eligible = row.joined as boolean;
      }

      // Queue auto-join for open eligible channels not yet joined
      if (eligible && row.is_open && !row.joined) {
        autoJoins.push(row.id as string);
      }

      return {
        id: row.id,
        name: row.name,
        about: row.about,
        channelType: row.channel_type,
        isOpen: row.is_open,
        relayUrl: row.relay_url,
        joined: row.joined as boolean,
        eligible,
        role: row.role ?? null,
      };
    });

    // Auto-join open eligible channels (fire-and-forget — don't block response)
    if (autoJoins.length > 0) {
      query(
        `INSERT INTO nostr_channel_memberships (channel_id, member_id)
         SELECT unnest($1::varchar[]), $2
         ON CONFLICT DO NOTHING`,
        [autoJoins, memberId]
      ).catch(err => console.error('[Nostr Channels] auto-join error', err));
    }

    // Return only visible channels (eligible or already joined)
    return NextResponse.json(
      channels.filter(c => c.eligible || c.joined),
      { headers }
    );

  } catch (err) {
    console.error(`[Nostr Channels] ${cid}`, err);
    return NextResponse.json(
      { error: 'Database error', correlationId: cid },
      { status: 503, headers }
    );
  }
}
