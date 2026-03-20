import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

async function requireAdmin(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return null;
  const r = await query(
    `SELECT id FROM members WHERE id = $1 AND ('team_admin' = ANY(roles) OR 'admin' = ANY(roles))`,
    [memberId]
  );
  return r.rows.length > 0 ? memberId : null;
}

// GET all members with team stats
export async function GET(request: NextRequest) {
  const adminId = await requireAdmin(request);
  if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const result = await query(
    `SELECT
       m.id,
       m.name,
       m.email,
       m.username,
       m.roles,
       m.tier,
       m.created_at,
       m.last_sign_in,
       CASE WHEN p.last_seen_at > NOW() - INTERVAL '2 minutes' THEN 'online'
            WHEN p.last_seen_at > NOW() - INTERVAL '10 minutes' THEN 'away'
            ELSE 'offline' END AS status,
       (SELECT COUNT(*) FROM team_messages WHERE sender_id = m.id)::int AS message_count
     FROM members m
     LEFT JOIN team_presence p ON p.member_id = m.id
     ORDER BY m.name ASC`,
    []
  );
  return NextResponse.json({ members: result.rows });
}

// PATCH toggle team_admin role
export async function PATCH(request: NextRequest) {
  const adminId = await requireAdmin(request);
  if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { memberId, makeAdmin } = await request.json();
  if (!memberId) return NextResponse.json({ error: 'memberId required' }, { status: 400 });

  if (makeAdmin) {
    await query(
      `UPDATE members SET roles = array_append(roles, 'team_admin') WHERE id = $1 AND NOT ('team_admin' = ANY(roles))`,
      [memberId]
    );
  } else {
    await query(
      `UPDATE members SET roles = array_remove(roles, 'team_admin') WHERE id = $1`,
      [memberId]
    );
  }

  const r = await query(`SELECT id, name, roles FROM members WHERE id = $1`, [memberId]);
  return NextResponse.json({ member: r.rows[0] });
}
