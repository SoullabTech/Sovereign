import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { hashPassword } from '@/lib/auth/passwordUtils';
import { createSession, setSessionCookie, setAccessCookies } from '@/lib/auth/serverSessions';
import { resolveTeamIdForInviter, addMemberToTeam } from '@/lib/team/teamMembership';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const body = await request.json().catch(() => ({}));
  const { name, username, password } = body as Record<string, string>;

  if (!name?.trim() || !username?.trim() || !password?.trim()) {
    return NextResponse.json({ error: 'Name, username, and password are required' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const usernameClean = username.trim().toLowerCase();
  if (!/^[a-z0-9_-]{3,30}$/.test(usernameClean)) {
    return NextResponse.json({ error: 'Username must be 3-30 characters: letters, numbers, _ or -' }, { status: 400 });
  }

  // Validate invite
  const inviteResult = await query<{
    id: string;
    email: string;
    invited_by: string | null;
    accepted_at: string | null;
    team_id: string | null;
    role: string | null;
    expires_at: string;
  }>(
    `SELECT id, email, invited_by, accepted_at, expires_at, team_id, role
       FROM team_invites WHERE token = $1`,
    [token]
  );

  const invite = inviteResult.rows[0];
  if (!invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
  if (invite.accepted_at) return NextResponse.json({ error: 'This invite has already been used' }, { status: 409 });
  if (new Date(invite.expires_at) < new Date()) return NextResponse.json({ error: 'This invite has expired' }, { status: 410 });

  // Check username availability
  const taken = await query(`SELECT 1 FROM members WHERE LOWER(username) = $1`, [usernameClean]);
  if (taken.rows[0]) return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });

  // Generate a unique passkey for this invite-created account
  const passkey = `SOULLAB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const passwordHash = await hashPassword(password);

  // Create member — mark onboarded=true so they skip the onboarding flow
  const memberResult = await query<{ id: string }>(
    `INSERT INTO members (passkey, username, password_hash, name, email, onboarded, onboarding_step, roles)
     VALUES ($1, $2, $3, $4, $5, true, 'complete', ARRAY['member']::text[])
     RETURNING id`,
    [passkey, usernameClean, passwordHash, name.trim(), invite.email]
  );

  const memberId = memberResult.rows[0].id;

  // Accept the invite
  await query(
    `UPDATE team_invites SET accepted_at = NOW(), accepted_by = $1 WHERE id = $2`,
    [memberId, invite.id]
  );

  /* COLAB-BETA-01 — join the Co-Lab the INVITE names, not one inferred from
     the inviter. resolveTeamIdForInviter() falls back to the oldest studio_team,
     so a tester invited to a new cohort could land in the original shared
     workspace. Inference is kept only for legacy invites (team_id NULL) so old
     links do not dead-end. Still best-effort and non-fatal: a failure here must
     not cost the member the account they just created. */
  const teamId = invite.team_id ?? (await resolveTeamIdForInviter(invite.invited_by));
  const invitedRole = (['owner', 'admin', 'member', 'viewer'] as const)
    .find((r) => r === invite.role) ?? 'member';
  if (teamId) await addMemberToTeam(teamId, memberId, invitedRole);

  // Create session
  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const userAgent = request.headers.get('user-agent') || undefined;

  try {
    const session = await createSession({ memberId, ipAddress: clientIP, userAgent });
    await setSessionCookie(session.sessionToken, session.expiresAt);
    await setAccessCookies(memberId, 'free', ['member'], session.expiresAt);
  } catch (err) {
    console.error('[InviteRegister] Session creation failed:', err);
  }

  return NextResponse.json({ ok: true, memberId });
}
