import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { resolveTeamIdForInviter, addMemberToTeam, isTeamMember } from '@/lib/team/teamMembership';

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

// DELETE /api/team/invite/[token] — revoke by id or token (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminCheck = await query(
    `SELECT 1 FROM members WHERE id = $1 AND ('team_admin' = ANY(roles) OR 'admin' = ANY(roles))`,
    [memberId]
  );
  if (!adminCheck.rows[0]) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // token param may be a UUID id or a hex token — match either
  const result = await query(
    `DELETE FROM team_invites WHERE (id::text = $1 OR token = $1) AND accepted_at IS NULL RETURNING id`,
    [token]
  );

  if (!result.rows[0]) return NextResponse.json({ error: 'Invite not found or already accepted' }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const invite = await query<{
    id: string; email: string | null; accepted_at: string | null; expires_at: string;
    team_id: string | null; role: string | null; invited_by: string | null;
  }>(
    `SELECT id, email, accepted_at, expires_at, team_id, role, invited_by
       FROM team_invites WHERE token = $1`,
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

  /* COLAB-BETA-01 — accepting an invitation is how a person JOINS a Co-Lab.
     Before this, acceptance only stamped accepted_at: the invite was consumed
     and the member belonged to nothing, so a tester who followed their link
     landed in an account with no workspace. Membership is added here, to the
     team the invite names and with the role it carries.

     Legacy invites (team_id NULL, created before this migration) fall back to
     the inviter's team so old links do not dead-end. A row that resolves to no
     team is reported, not silently swallowed — an accepted invite that joined
     nothing is exactly the failure this replaces. */
  /* E · The token is not the only credential. Without this, possession of a
     link plus ANY authenticated account consumes the invite — a forwarded email
     lets the wrong person take the seat, and the intended invitee's link is
     already spent. The signed-in member's email must match the invite's. */
  const claimant = await query<{ email: string | null }>(
    `SELECT email FROM members WHERE id = $1`,
    [memberId]
  );
  const claimantEmail = (claimant.rows[0]?.email ?? '').trim().toLowerCase();
  if (!claimantEmail || claimantEmail !== (row.email ?? '').trim().toLowerCase()) {
    return NextResponse.json(
      { error: 'This invitation was sent to a different email address' },
      { status: 403 }
    );
  }

  /* F · Membership is FAIL-CLOSED, and it happens BEFORE the invite is consumed.
     Membership is what an invitation promises, so it is no longer best-effort:
     if the member cannot be placed in the Co-Lab, the invite stays unspent and
     the link still works. Ordering matters — stamping accepted_at first would
     burn the token on a failure.

     `joined` reports an OBSERVED membership. It previously reported
     Boolean(destination), which only proved a team id had been resolved;
     addMemberToTeam() returns false for both a swallowed failure and an
     existing membership, so its return value cannot answer the question either. */
  const destination = row.team_id ?? (await resolveTeamIdForInviter(row.invited_by));
  const role = (['owner', 'admin', 'member', 'viewer'] as const).find((r) => r === row.role) ?? 'member';
  if (!destination) {
    return NextResponse.json(
      { error: 'This invitation names no Co-Lab — ask for a new invite' },
      { status: 409 }
    );
  }
  await addMemberToTeam(destination, memberId, role);
  const joined = await isTeamMember(destination, memberId);
  if (!joined) {
    return NextResponse.json(
      { error: 'Could not add you to the Co-Lab — your invite is still valid, please try again' },
      { status: 500 }
    );
  }

  await query(
    `UPDATE team_invites SET accepted_at = NOW(), accepted_by = $1 WHERE id = $2`,
    [memberId, row.id]
  );

  return NextResponse.json({ ok: true, teamId: destination, joined });
}
