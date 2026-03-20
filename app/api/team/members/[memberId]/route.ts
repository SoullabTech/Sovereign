import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const viewerId = await getMemberIdFromRequest(request);
  if (!viewerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { memberId } = await params;

  const result = await query<{
    id: string;
    name: string | null;
    preferred_name: string | null;
    username: string;
    bio: string | null;
    timezone: string | null;
    avatar_url: string | null;
    roles: string[] | null;
    tier: string | null;
    is_practitioner: boolean | null;
    practitioner_license_type: string | null;
    created_at: string;
    status: string;
  }>(
    `SELECT
       m.id,
       m.name,
       m.preferred_name,
       m.username,
       m.bio,
       m.timezone,
       m.avatar_url,
       m.roles,
       m.tier,
       m.is_practitioner,
       m.practitioner_license_type,
       m.created_at,
       CASE
         WHEN tp.last_seen_at > NOW() - INTERVAL '2 minutes' THEN 'online'
         WHEN tp.last_seen_at > NOW() - INTERVAL '10 minutes' THEN 'away'
         ELSE 'offline'
       END AS status
     FROM members m
     LEFT JOIN team_presence tp ON tp.member_id = m.id
     WHERE m.id = $1`,
    [memberId]
  );

  if (!result.rows[0]) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ member: result.rows[0] });
}
