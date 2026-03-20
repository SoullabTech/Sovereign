import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

interface InviteRow {
  id: string;
  email: string;
  message: string | null;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
  invited_by_name: string | null;
  invited_by_username: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const result = await query<InviteRow>(
    `SELECT ti.id, ti.email, ti.message, ti.accepted_at, ti.expires_at, ti.created_at,
            m.name AS invited_by_name, m.username AS invited_by_username
     FROM team_invites ti
     JOIN members m ON m.id = ti.invited_by
     WHERE ti.token = $1`,
    [token]
  );

  if (!result.rows[0]) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
  }

  const invite = result.rows[0];
  const expired = new Date(invite.expires_at) < new Date();

  return NextResponse.json({
    id: invite.id,
    email: invite.email,
    message: invite.message,
    inviterName: invite.invited_by_name || invite.invited_by_username,
    acceptedAt: invite.accepted_at,
    expiresAt: invite.expires_at,
    expired,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const invite = await query<{ id: string; accepted_at: string | null; expires_at: string }>(
    `SELECT id, accepted_at, expires_at FROM team_invites WHERE token = $1`,
    [token]
  );

  if (!invite.rows[0]) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
  }

  const row = invite.rows[0];

  if (row.accepted_at) {
    return NextResponse.json({ error: 'This invite has already been used' }, { status: 409 });
  }

  if (new Date(row.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This invite has expired' }, { status: 410 });
  }

  await query(
    `UPDATE team_invites SET accepted_at = NOW(), accepted_by = $1 WHERE id = $2`,
    [memberId, row.id]
  );

  return NextResponse.json({ ok: true });
}
