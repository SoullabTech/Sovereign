import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { listChannels } from '@/lib/team/ChannelService';
import { query } from '@/lib/db/postgres';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * Resolve the effective teamId for a Co-Lab request.
 *
 * Priority:
 *  1. ?teamId= param → validate the member has a studio_team_members row → use it.
 *  2. No param → member's earliest-joined team (by joined_at ASC).
 *  3. No team membership at all → earliest studio_teams row (global fallback).
 *
 * Returns null only when the DB has zero teams (empty env). Returns 403 object
 * when a requested teamId is not accessible to the member.
 */
async function resolveTeamId(
  memberId: string,
  requestedTeamId: string | null
): Promise<{ teamId: string } | { error: string; status: number }> {
  if (requestedTeamId) {
    const access = await query(
      `SELECT 1 FROM studio_team_members WHERE team_id = $1 AND member_id = $2`,
      [requestedTeamId, memberId]
    );
    if (!access.rows.length) {
      return { error: 'Forbidden: not a member of this team', status: 403 };
    }
    return { teamId: requestedTeamId };
  }

  // Default: member's earliest-joined team
  const memberTeam = await query<{ team_id: string }>(
    `SELECT team_id FROM studio_team_members WHERE member_id = $1 ORDER BY joined_at ASC LIMIT 1`,
    [memberId]
  );
  if (memberTeam.rows[0]) {
    return { teamId: memberTeam.rows[0].team_id };
  }

  // Last resort: earliest team in system
  const fallback = await query<{ id: string }>(
    `SELECT id FROM studio_teams ORDER BY created_at ASC LIMIT 1`
  );
  if (fallback.rows[0]) {
    return { teamId: fallback.rows[0].id };
  }

  return { error: 'No team available', status: 500 };
}

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const requestedTeamId = request.nextUrl.searchParams.get('teamId');
  const resolved = await resolveTeamId(memberId, requestedTeamId);
  if ('error' in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const channels = await listChannels(memberId, resolved.teamId);
  return NextResponse.json({ channels, teamId: resolved.teamId });
}

export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { slug, name, description, channelType = 'text', isPrivate = false, teamId: bodyTeamId } = body;

  if (!slug || !name) {
    return NextResponse.json({ error: 'slug and name are required' }, { status: 400 });
  }

  // Resolve team — prefer body.teamId, fall back to member default
  const resolved = await resolveTeamId(memberId, bodyTeamId ?? null);
  if ('error' in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }
  const { teamId } = resolved;

  const slugClean = String(slug).toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const newChannelId = crypto.randomUUID();

  await query(
    `INSERT INTO team_channels (id, slug, name, description, channel_type, is_private, created_by, team_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [newChannelId, slugClean, name, description ?? null, channelType, isPrivate, memberId, teamId]
  );

  // Auto-add creator as owner
  await query(
    `INSERT INTO team_channel_members (channel_id, member_id, role, invited_by)
     VALUES ($1, $2, 'owner', $2)
     ON CONFLICT (channel_id, member_id) DO NOTHING`,
    [newChannelId, memberId]
  );

  const result = await query(
    `SELECT * FROM team_channels WHERE id = $1`,
    [newChannelId]
  );

  return NextResponse.json({ channel: result.rows[0] }, { status: 201 });
}
