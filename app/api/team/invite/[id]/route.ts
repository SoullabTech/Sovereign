import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

// DELETE /api/team/invite/[id] — revoke a pending invite (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check admin
  const adminCheck = await query(
    `SELECT 1 FROM member_roles WHERE member_id = $1 AND role IN ('admin', 'team_admin')`,
    [memberId]
  );
  if (!adminCheck.rows[0]) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const result = await query(
    `DELETE FROM team_invites WHERE id = $1 AND accepted_at IS NULL RETURNING id`,
    [id]
  );

  if (!result.rows[0]) {
    return NextResponse.json({ error: 'Invite not found or already accepted' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
