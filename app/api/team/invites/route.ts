import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Admin only
  const adminCheck = await query(
    `SELECT 1 FROM member_roles WHERE member_id = $1 AND role IN ('admin', 'team_admin')`,
    [memberId]
  );
  if (!adminCheck.rows[0]) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const result = await query<{
    id: string;
    email: string;
    role: string;
    message: string | null;
    expires_at: string;
    created_at: string;
    invited_by_name: string | null;
    invited_by_username: string;
  }>(
    `SELECT ti.id, ti.email, ti.role, ti.message, ti.expires_at, ti.created_at,
            m.name AS invited_by_name, m.username AS invited_by_username
     FROM team_invites ti
     JOIN members m ON m.id = ti.invited_by
     WHERE ti.accepted_at IS NULL AND ti.expires_at > NOW()
     ORDER BY ti.created_at DESC`
  );

  const invites = result.rows.map(row => ({
    id: row.id,
    email: row.email,
    role: row.role,
    message: row.message,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    invitedByName: row.invited_by_name || row.invited_by_username,
  }));

  return NextResponse.json({ invites });
}
