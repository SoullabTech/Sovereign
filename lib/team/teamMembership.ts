import { query } from '@/lib/db/postgres';

/**
 * Resolve which team a person should join when invited, based on who invited them.
 *
 * Co-lab invites (`team_invites`) don't carry a team_id, so we infer the target
 * team from the inviter's own membership. Falls back to the sole existing team in
 * single-team deployments. Returns null if no team can be resolved (membership add
 * is then skipped — the invite still succeeds).
 */
export async function resolveTeamIdForInviter(inviterId: string | null): Promise<string | null> {
  if (inviterId) {
    const res = await query<{ team_id: string }>(
      `SELECT team_id FROM studio_team_members WHERE member_id = $1 ORDER BY joined_at LIMIT 1`,
      [inviterId]
    );
    if (res.rows[0]?.team_id) return res.rows[0].team_id;
  }

  // Fallback: single-team deployment — use the only team that exists.
  const fallback = await query<{ id: string }>(
    `SELECT id FROM studio_teams ORDER BY created_at LIMIT 1`
  );
  return fallback.rows[0]?.id ?? null;
}

/**
 * Idempotently add a member to a team. Returns true if a new row was created,
 * false if they were already a member (or the write failed).
 *
 * Best-effort: never throws. Team membership is non-critical to the invite flow,
 * so a failure here must not break invite/registration.
 */
export async function addMemberToTeam(
  teamId: string,
  memberId: string,
  role: 'owner' | 'admin' | 'member' | 'viewer' = 'member'
): Promise<boolean> {
  try {
    const res = await query(
      `INSERT INTO studio_team_members (team_id, member_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (team_id, member_id) DO NOTHING`,
      [teamId, memberId, role]
    );
    return (res.rowCount ?? 0) > 0;
  } catch (err) {
    console.error('[teamMembership] addMemberToTeam failed:', err);
    return false;
  }
}

/**
 * COLAB-BETA-01 R2 — did this member actually end up in this team?
 *
 * `addMemberToTeam()` returns false for BOTH a swallowed database failure and an
 * already-existing membership, so its return value cannot answer "is this person
 * in the team". For an invitation, membership is the thing being promised, so the
 * promise is checked by observation rather than inferred from a write's return.
 *
 * Throws nothing and swallows nothing: a failure here returns false, and callers
 * that must be fail-closed treat false as "did not join".
 */
export async function isTeamMember(teamId: string, memberId: string): Promise<boolean> {
  try {
    const res = await query<{ member_id: string }>(
      `SELECT member_id FROM studio_team_members WHERE team_id = $1 AND member_id = $2`,
      [teamId, memberId]
    );
    return res.rows.length > 0;
  } catch (err) {
    console.error('[teamMembership] isTeamMember failed:', err);
    return false;
  }
}

/**
 * COLAB-BETA-01 R2 — may this member invite people INTO this team?
 *
 * Membership alone is not enough. The route lets a caller choose the invited
 * role, so a plain member (or a viewer) could otherwise invite someone as an
 * admin. The existing team-management contract already requires admin+ to
 * invite; this states that rule where the invite path can enforce it.
 */
export async function canInviteToTeam(teamId: string, memberId: string): Promise<boolean> {
  try {
    const res = await query<{ role: string }>(
      `SELECT role FROM studio_team_members WHERE team_id = $1 AND member_id = $2`,
      [teamId, memberId]
    );
    const role = res.rows[0]?.role;
    return role === 'owner' || role === 'admin';
  } catch (err) {
    console.error('[teamMembership] canInviteToTeam failed:', err);
    return false;
  }
}
