import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { listChannels } from '@/lib/team/ChannelService';
import { query } from '@/lib/db/postgres';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const channels = await listChannels(memberId);
  return NextResponse.json({ channels });
}

export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { slug, name, description, channelType = 'text', isPrivate = false, memberIds = [] } = body;

  if (!slug || !name) {
    return NextResponse.json({ error: 'slug and name are required' }, { status: 400 });
  }

  const slugClean = String(slug).toLowerCase().replace(/[^a-z0-9-]/g, '-');

  const newChannelId = crypto.randomUUID();

  await query(
    `INSERT INTO team_channels (id, slug, name, description, channel_type, is_private, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [newChannelId, slugClean, name, description ?? null, channelType, isPrivate, memberId]
  );

  // Auto-add creator as owner
  await query(
    `INSERT INTO team_channel_members (channel_id, member_id, role, invited_by)
     VALUES ($1, $2, 'owner', $2)
     ON CONFLICT (channel_id, member_id) DO NOTHING`,
    [newChannelId, memberId]
  );

  // Private channels only: seed the initial roster chosen at creation. The
  // creator is already 'owner' above and is filtered out here. Public channels
  // ignore memberIds entirely — they are visible to every signed-in member, so a
  // roster is meaningless. IDs are validated against `members` (only real members
  // insert) and shape-checked as UUIDs so a malformed payload can't 500 the cast.
  if (isPrivate && Array.isArray(memberIds) && memberIds.length > 0) {
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const seedIds = Array.from(
      new Set(
        memberIds.filter(
          (id: unknown): id is string =>
            typeof id === 'string' && id !== memberId && UUID_RE.test(id)
        )
      )
    );
    if (seedIds.length > 0) {
      await query(
        `INSERT INTO team_channel_members (channel_id, member_id, role, invited_by, joined_at)
         SELECT $1, m.id, 'member', $2, NOW()
           FROM members m
          WHERE m.id = ANY($3::uuid[])
         ON CONFLICT (channel_id, member_id) DO NOTHING`,
        [newChannelId, memberId, seedIds]
      );
    }
  }

  const result = await query(
    `SELECT * FROM team_channels WHERE slug = $1`,
    [slugClean]
  );

  return NextResponse.json({ channel: result.rows[0] }, { status: 201 });
}
