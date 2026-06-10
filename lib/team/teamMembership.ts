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
