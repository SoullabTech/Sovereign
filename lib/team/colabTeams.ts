// Co-Lab team scoping helpers.
//
// Constitutional invariant: No invisible commons. Every write action belongs to
// a specific Co-Lab whose membership is explicit. The "default workspace" is a
// legacy artifact — it is NOT a commons that all signed-in members may write into.
//
// Sovereignty rules enforced here:
//   - canActInTeam: requires an explicit role in the team — no default bypass.
//   - resolveCurrentTeamId: routes a member to THEIR OWN Co-Lab, never silently
//     to another practitioner's workspace.
//   - ensureOwnCoLab: creates a Co-Lab for a member on first use so they always
//     land in their own workspace, not someone else's.
//   - getColabTeams: returns only teams the member explicitly belongs to.

import { query } from '@/lib/db/postgres';
import { getMemberTeams, getTeamById, getTeamRole, type Team } from '@/lib/auth/teamPermissions';

export { COLAB_TEAM_COOKIE } from './colabConstants';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Ensure the member has their own Co-Lab. If they already belong to one or
 * more teams, return the earliest one. If not, create a new Co-Lab named after
 * them and add them as owner. This replaces the old "fall back to the default
 * workspace" pattern — members are always routed to their own workspace, never
 * silently into someone else's.
 */
export async function ensureOwnCoLab(memberId: string): Promise<string> {
  // Prefer a team they OWN. Being a member of someone else's Co-Lab (e.g. Team
  // Soullab) does not qualify — that is a shared space, not their own workspace.
  const owned = await query<{ team_id: string }>(
    `SELECT team_id FROM studio_team_members
     WHERE member_id = $1 AND role = 'owner'
     ORDER BY joined_at ASC, team_id ASC
     LIMIT 1`,
    [memberId]
  );
  if (owned.rows[0]) return owned.rows[0].team_id;

  // No team found — create one. Name it after the member.
  const memberRow = await query<{ name: string }>(
    `SELECT name FROM members WHERE id = $1`,
    [memberId]
  );
  const displayName = memberRow.rows[0]?.name ?? 'My';
  const teamName = `${displayName}'s Co-Lab`;

  const created = await query<{ id: string }>(
    `INSERT INTO studio_teams (name, owner_id) VALUES ($1, $2) RETURNING id`,
    [teamName, memberId]
  );
  const teamId = created.rows[0].id;

  await query(
    `INSERT INTO studio_team_members (team_id, member_id, role, invited_by)
     VALUES ($1, $2, 'owner', $2)
     ON CONFLICT DO NOTHING`,
    [teamId, memberId]
  );

  return teamId;
}

/**
 * The default Co-Lab workspace id (earliest-created team), or null. Retained
 * for migration and audit purposes — it is NOT a write-fallback for arbitrary
 * members. Use ensureOwnCoLab for routing.
 */
export async function getDefaultTeamId(): Promise<string | null> {
  const r = await query<{ id: string }>(
    `SELECT id FROM studio_teams ORDER BY created_at ASC, id ASC LIMIT 1`
  );
  return r.rows[0]?.id ?? null;
}

/**
 * The platform admin/ops workspace — where #bugs and #bug-log channels live.
 * Resolved via the is_admin_workspace flag (migration 20260630000007), which
 * explicitly marks Team Soullab rather than relying on creation order.
 * Falls back to getDefaultTeamId() if no team is flagged (pre-migration safety).
 */
export async function getAdminTeamId(): Promise<string | null> {
  const r = await query<{ id: string }>(
    `SELECT id FROM studio_teams WHERE is_admin_workspace = true LIMIT 1`
  );
  return r.rows[0]?.id ?? getDefaultTeamId();
}

/**
 * Teams shown in the Co-Lab switcher: only teams this member explicitly belongs
 * to. If they belong to none, ensureOwnCoLab creates one first. The member's own
 * team (where they are owner) is sorted first.
 */
export async function getColabTeams(memberId: string): Promise<Team[]> {
  let mine = await getMemberTeams(memberId);

  if (mine.length === 0) {
    // No teams yet — create and return their own Co-Lab.
    await ensureOwnCoLab(memberId);
    mine = await getMemberTeams(memberId);
  }

  return [...mine].sort((a, b) => {
    // Owner's team first, then alphabetically.
    const aOwner = (a as any).role === 'owner';
    const bOwner = (b as any).role === 'owner';
    if (aOwner && !bOwner) return -1;
    if (!aOwner && bOwner) return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Resolve which team to act in.
 *
 * - If a valid teamId is supplied and the member has an explicit role in it,
 *   use that team.
 * - Otherwise, route the member to their own Co-Lab (creating one if needed).
 *
 * No member is ever silently routed into another practitioner's workspace.
 */
export async function resolveCurrentTeamId(
  memberId: string,
  requestedTeamId?: string | null
): Promise<string | null> {
  if (requestedTeamId && UUID_RE.test(requestedTeamId)) {
    const role = await getTeamRole(memberId, requestedTeamId);
    if (role) return requestedTeamId;
  }

  // Fall through: route to the member's own Co-Lab.
  return ensureOwnCoLab(memberId);
}

/**
 * May this member write into this team?
 * Requires an explicit role — no default-team bypass.
 * "No invisible commons." Every write action requires explicit membership.
 */
export async function canActInTeam(memberId: string, teamId: string): Promise<boolean> {
  return (await getTeamRole(memberId, teamId)) !== null;
}

/**
 * May this member read public channels from this team?
 * Reads are slightly more permissive than writes: a member who has been
 * explicitly invited to a team (any role) may read its public channels.
 * For the default/legacy workspace, reads remain open so existing #general
 * content stays visible until a community Co-Lab is explicitly configured.
 *
 * This is the ONLY remaining default-team accommodation, and it is read-only.
 */
export async function canReadTeam(memberId: string, teamId: string): Promise<boolean> {
  const role = await getTeamRole(memberId, teamId);
  if (role) return true;

  // Temporary accommodation: the legacy default workspace is readable by all
  // signed-in members until a community Co-Lab is explicitly configured.
  // This does NOT grant write access (canActInTeam is separate).
  const defaultId = await getDefaultTeamId();
  return teamId === defaultId;
}
