/**
 * TEAM PERMISSIONS
 *
 * Role-based access control for Studio teams.
 * Provides helpers for checking team membership and permissions.
 *
 * Role hierarchy (highest to lowest):
 * - owner: Full control, can delete team, manage all settings
 * - admin: Can manage members, edit all content
 * - member: Can create and edit own content
 * - viewer: Read-only access
 */

import { query } from '@/lib/db/postgres';

// Types
export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface Team {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  role?: TeamRole;
  member_count?: number;
}

export interface TeamMember {
  id: string;
  team_id: string;
  member_id: string;
  role: TeamRole;
  invited_by: string | null;
  joined_at: string;
  // Joined fields
  name?: string;
  email?: string;
  username?: string;
}

// Role hierarchy for permission checks
const ROLE_HIERARCHY: Record<TeamRole, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

/**
 * Get a member's role in a team
 */
export async function getTeamRole(memberId: string, teamId: string): Promise<TeamRole | null> {
  const result = await query(
    `SELECT role FROM studio_team_members WHERE member_id = $1 AND team_id = $2`,
    [memberId, teamId]
  );

  return result.rows[0]?.role || null;
}

/**
 * Check if a member has at least the specified role level
 */
export async function hasTeamRole(
  memberId: string,
  teamId: string,
  minRole: TeamRole
): Promise<boolean> {
  const role = await getTeamRole(memberId, teamId);
  if (!role) return false;

  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minRole];
}

/**
 * Require a minimum role level, throw error if not met
 */
export async function requireTeamRole(
  memberId: string,
  teamId: string,
  minRole: TeamRole
): Promise<TeamRole> {
  const role = await getTeamRole(memberId, teamId);

  if (!role) {
    throw new Error('Not a member of this team');
  }

  if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[minRole]) {
    throw new Error(`Insufficient permissions. Required: ${minRole}, has: ${role}`);
  }

  return role;
}

/**
 * Get all teams a member belongs to
 */
export async function getMemberTeams(memberId: string): Promise<Team[]> {
  const result = await query(
    `SELECT
      t.id, t.name, t.description, t.owner_id, t.settings, t.created_at, t.updated_at,
      tm.role,
      (SELECT COUNT(*) FROM studio_team_members WHERE team_id = t.id) as member_count
    FROM studio_teams t
    JOIN studio_team_members tm ON t.id = tm.team_id
    WHERE tm.member_id = $1
    ORDER BY t.name`,
    [memberId]
  );

  return result.rows;
}

/**
 * Get team details by ID
 */
export async function getTeamById(teamId: string, memberId?: string): Promise<Team | null> {
  const result = await query(
    `SELECT
      t.id, t.name, t.description, t.owner_id, t.settings, t.created_at, t.updated_at,
      ${memberId ? 'tm.role,' : ''}
      (SELECT COUNT(*) FROM studio_team_members WHERE team_id = t.id) as member_count
    FROM studio_teams t
    ${memberId ? 'LEFT JOIN studio_team_members tm ON t.id = tm.team_id AND tm.member_id = $2' : ''}
    WHERE t.id = $1`,
    memberId ? [teamId, memberId] : [teamId]
  );

  return result.rows[0] || null;
}

/**
 * Get all members of a team
 */
export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const result = await query(
    `SELECT
      tm.id, tm.team_id, tm.member_id, tm.role, tm.invited_by, tm.joined_at,
      m.name, m.email, m.username
    FROM studio_team_members tm
    JOIN members m ON tm.member_id = m.id
    WHERE tm.team_id = $1
    ORDER BY
      CASE tm.role
        WHEN 'owner' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'member' THEN 3
        WHEN 'viewer' THEN 4
      END,
      tm.joined_at`,
    [teamId]
  );

  return result.rows;
}

/**
 * Remove a member from a team (membership removal, not account deletion).
 * Also removes them from all DM threads scoped to that team so they no
 * longer appear in the DM roster or have access to thread history.
 */
export async function removeTeamMember(teamId: string, memberId: string): Promise<void> {
  // Remove from DM threads scoped to this team
  await query(
    `DELETE FROM team_dm_members
     WHERE member_id = $1
       AND dm_thread_id IN (
         SELECT id FROM team_dm_threads WHERE team_id = $2
       )`,
    [memberId, teamId]
  );
  // Remove Co-Lab enrollment — the member account itself is untouched
  await query(
    `DELETE FROM studio_team_members WHERE team_id = $1 AND member_id = $2`,
    [teamId, memberId]
  );
}

/**
 * Check if member can perform action on content owned by another member
 */
export async function canEditTeamContent(
  actorId: string,
  teamId: string,
  contentOwnerId: string
): Promise<boolean> {
  const role = await getTeamRole(actorId, teamId);
  if (!role) return false;

  // Owners and admins can edit anything
  if (role === 'owner' || role === 'admin') return true;

  // Members can only edit their own content
  if (role === 'member') return actorId === contentOwnerId;

  // Viewers can't edit
  return false;
}

/**
 * Check if member can delete content in a team
 */
export async function canDeleteTeamContent(
  actorId: string,
  teamId: string,
  contentOwnerId: string
): Promise<boolean> {
  // Same rules as editing
  return canEditTeamContent(actorId, teamId, contentOwnerId);
}

/**
 * Permission matrix helper for UI
 */
export const ROLE_PERMISSIONS = {
  viewer: {
    view: true,
    create: false,
    editOwn: false,
    editAll: false,
    delete: false,
    manageMembers: false,
    manageSettings: false,
  },
  member: {
    view: true,
    create: true,
    editOwn: true,
    editAll: false,
    delete: false,
    manageMembers: false,
    manageSettings: false,
  },
  admin: {
    view: true,
    create: true,
    editOwn: true,
    editAll: true,
    delete: true,
    manageMembers: true,
    manageSettings: false,
  },
  owner: {
    view: true,
    create: true,
    editOwn: true,
    editAll: true,
    delete: true,
    manageMembers: true,
    manageSettings: true,
  },
} as const;
