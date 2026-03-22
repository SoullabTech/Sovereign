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
  const { slug, name, description, channelType = 'text', isPrivate = false } = body;

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

  const result = await query(
    `SELECT * FROM team_channels WHERE slug = $1`,
    [slugClean]
  );

  return NextResponse.json({ channel: result.rows[0] }, { status: 201 });
}
