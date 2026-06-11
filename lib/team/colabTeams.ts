// Co-Lab team scoping helpers.
//
// Co-Lab (/team) channels are scoped to a team (studio_teams). The "current team"
// is held in a cookie so both the server channel page and the client sidebar agree
// on which workspace is in view without a URL change. The default workspace = the
// earliest-created team; everyone can see its PUBLIC channels (preserves today's
// "everyone sees #general" even for members not explicitly enrolled). New teams are
// real workspaces — only their members see them.

import { query } from '@/lib/db/postgres';
import { getMemberTeams, getTeamById, getTeamRole, type Team } from '@/lib/auth/teamPermissions';

// Re-exported so server callers can keep a single import site; the value lives in
// a client-safe module (no `pg`) for use by client components.
export { COLAB_TEAM_COOKIE } from './colabConstants';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The default Co-Lab workspace id (earliest-created team), or null if no teams
 * exist. The `id` tiebreak keeps this deterministic when two teams share a
 * created_at (e.g. seeded in one transaction) — without it the default could
 * flip between an empty team and the populated one across requests.
 */
export async function getDefaultTeamId(): Promise<string | null> {
  const r = await query<{ id: string }>(
    `SELECT id FROM studio_teams ORDER BY created_at ASC, id ASC LIMIT 1`
  );
  return r.rows[0]?.id ?? null;
}

/**
 * Teams shown in the Co-Lab switcher: the member's teams, plus the default
 * workspace if they aren't explicitly a member of it. Default workspace first,
 * then the rest alphabetically.
 */
export async function getColabTeams(memberId: string): Promise<Team[]> {
  const [mine, defaultId] = await Promise.all([getMemberTeams(memberId), getDefaultTeamId()]);

  let teams = mine;
  if (defaultId && !mine.some(t => t.id === defaultId)) {
    const def = await getTeamById(defaultId);
    if (def) teams = [def, ...mine];
  }

  return [...teams].sort((a, b) => {
    if (a.id === defaultId) return -1;
    if (b.id === defaultId) return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Resolve which team to act in. Honors the cookie/param only if the member may
 * use that team (it appears in their switcher); otherwise falls back to the
 * default workspace. Returns null only when no team exists at all.
 */
export async function resolveCurrentTeamId(
  memberId: string,
  requestedTeamId?: string | null
): Promise<string | null> {
  const defaultId = await getDefaultTeamId();

  if (requestedTeamId && UUID_RE.test(requestedTeamId)) {
    if (requestedTeamId === defaultId) return requestedTeamId;
    // Non-default team: only if the member actually belongs to it.
    const role = await getTeamRole(memberId, requestedTeamId);
    if (role) return requestedTeamId;
  }

  return defaultId;
}

/**
 * May this member create content (a channel) in this team?
 * - Default workspace: any signed-in member (preserves today's global behavior).
 * - Other teams: members only.
 */
export async function canActInTeam(memberId: string, teamId: string): Promise<boolean> {
  const defaultId = await getDefaultTeamId();
  if (teamId === defaultId) return true;
  return (await getTeamRole(memberId, teamId)) !== null;
}
