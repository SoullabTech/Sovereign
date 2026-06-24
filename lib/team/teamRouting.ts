// SoulComms Multi-Team — server-side routing + membership helpers.
//
// SERVER-ONLY. Uses next/headers cookies() and the pg pool. Do NOT import from
// client components (TeamShell/TeamSidebar) — those derive the current team from
// usePathname() and reach this data through team-scoped API routes instead.
//
// These helpers answer the routing-identity questions for M2:
//   - who is the member (session)
//   - does this team exist / does the member belong to it (the 404 gate)
//   - which team should a bare /team or non-team route default to
//   - is an old /team/<channelSlug> URL a legacy link we should redirect

import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';

/** Cookie holding the member's last-active team slug — a default *selector* only,
 *  never the source of channel identity (identity always comes from the URL). */
export const LAST_ACTIVE_TEAM_COOKIE = 'maia_last_team';

export interface TeamRef {
  id: string;
  slug: string;
  name: string;
}

export interface MemberTeam extends TeamRef {
  role: 'owner' | 'admin' | 'member' | 'viewer';
}

/**
 * Resolve the current member id from cookies.
 *
 * ⚠️ SECURITY — PROVISIONAL, NOT HARDENED. This replicates the existing /team
 * inline auth, which trusts `maia_member_id` on existence alone. That cookie is a
 * non-secret identifier, and `maia_session` is frequently the literal placeholder
 * `'active'` (see lib/auth/setSessionCookies.ts), so neither reliably proves an
 * authenticated session — identity is forgeable by setting the cookie to a known
 * member UUID. DO NOT treat the result as an access boundary. Must be replaced
 * with validated-session resolution before M3 access enforcement (see the
 * auth-hardening task). Left inert (nothing imports this) until then.
 */
export async function getSessionMemberId(): Promise<string | null> {
  const cookieStore = await cookies();

  const cookieMemberId = cookieStore.get('maia_member_id')?.value;
  if (cookieMemberId) {
    const result = await query('SELECT id FROM members WHERE id = $1', [cookieMemberId]);
    if (result.rows.length > 0) return cookieMemberId;
  }

  const sessionToken = cookieStore.get('maia_session')?.value;
  if (sessionToken) {
    const result = await query<{ member_id: string }>(
      `SELECT member_id FROM auth_sessions
       WHERE session_token = $1 AND expires_at > NOW() AND revoked = FALSE`,
      [sessionToken]
    );
    if (result.rows.length > 0) return result.rows[0].member_id;
  }

  return null;
}

/** A team by slug, or null. Does not check membership. */
export async function resolveTeamBySlug(slug: string): Promise<TeamRef | null> {
  const result = await query<TeamRef>(
    `SELECT id, slug, name FROM studio_teams WHERE slug = $1`,
    [slug]
  );
  return result.rows[0] ?? null;
}

/** The single source of truth for "does this member belong to this team".
 *  Reused at every backend path in M3 — write it once here. */
export async function isMember(memberId: string, teamId: string): Promise<boolean> {
  const result = await query(
    `SELECT 1 FROM studio_team_members WHERE member_id = $1 AND team_id = $2 LIMIT 1`,
    [memberId, teamId]
  );
  return result.rows.length > 0;
}

/** Teams the member belongs to, for the switcher and default resolution. */
export async function getMemberTeams(memberId: string): Promise<MemberTeam[]> {
  const result = await query<MemberTeam>(
    `SELECT s.id, s.slug, s.name, tm.role
       FROM studio_team_members tm
       JOIN studio_teams s ON s.id = tm.team_id
      WHERE tm.member_id = $1
      ORDER BY s.name ASC`,
    [memberId]
  );
  return result.rows;
}

/** Where a bare /team (or a global route needing a context) should land:
 *  last-active team if the member still belongs to it, else first membership,
 *  else null (member is in no team → empty state). */
export async function getDefaultTeamSlug(memberId: string): Promise<string | null> {
  const teams = await getMemberTeams(memberId);
  if (teams.length === 0) return null;

  const cookieStore = await cookies();
  const last = cookieStore.get(LAST_ACTIVE_TEAM_COOKIE)?.value;
  if (last && teams.some(t => t.slug === last)) return last;

  return teams[0].slug;
}

/** A team's landing channel: prefer #general, else the first non-archived channel. */
export async function getFirstChannelSlug(teamId: string): Promise<string | null> {
  const result = await query<{ slug: string }>(
    `SELECT slug FROM team_channels
      WHERE team_id = $1 AND archived_at IS NULL
      ORDER BY (slug = 'general') DESC, channel_type DESC, name ASC
      LIMIT 1`,
    [teamId]
  );
  return result.rows[0]?.slug ?? null;
}

/** Backward-compat for old flat /team/<channelSlug> URLs (bookmarks, cached,
 *  stored references). If <maybeChannelSlug> is a channel in a team the member
 *  belongs to, return the team-scoped path to redirect to. Prefers the member's
 *  default team when the slug exists in more than one of their teams. */
export async function findLegacyChannelRedirect(
  memberId: string,
  maybeChannelSlug: string
): Promise<string | null> {
  const defaultSlug = await getDefaultTeamSlug(memberId);
  const result = await query<{ team_slug: string }>(
    `SELECT s.slug AS team_slug
       FROM team_channels c
       JOIN studio_teams s ON s.id = c.team_id
       JOIN studio_team_members tm ON tm.team_id = s.id AND tm.member_id = $1
      WHERE c.slug = $2 AND c.archived_at IS NULL
      ORDER BY (s.slug = $3) DESC, s.name ASC
      LIMIT 1`,
    [memberId, maybeChannelSlug, defaultSlug]
  );
  const teamSlug = result.rows[0]?.team_slug;
  return teamSlug ? `/team/${teamSlug}/${maybeChannelSlug}` : null;
}
