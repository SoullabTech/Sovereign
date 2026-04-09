// SoulComms — Channel access permissions
// Single source of truth for "can this member access this channel"
// and "can this member administer this channel".
//
// Public channels: anyone signed in.
// Private channels: only members of team_channel_members.
// Admin actions: channel owner/admin OR global team_admin/admin role.

import { query } from '@/lib/db/postgres';

export type AccessReason = 'not_member' | 'not_found';

export interface ChannelAccessResult {
  allowed: boolean;
  reason?: AccessReason;
}

/**
 * Gate for read/write access to a channel.
 *
 * - Public channels (is_private = FALSE): any signed-in member is allowed.
 * - Private channels: requester must have a row in team_channel_members.
 *
 * Use this in every route that reads or writes channel content.
 * Without it, "private" is purely cosmetic — anyone with a channel ID
 * can hit /messages or /stream directly.
 */
export async function requireChannelAccess(
  channelId: string,
  memberId: string
): Promise<ChannelAccessResult> {
  const r = await query<{ is_private: boolean; is_member: boolean }>(
    `SELECT
       tc.is_private,
       EXISTS(
         SELECT 1 FROM team_channel_members
         WHERE channel_id = tc.id AND member_id = $2
       ) AS is_member
     FROM team_channels tc
     WHERE tc.id = $1`,
    [channelId, memberId]
  );

  const row = r.rows[0];
  if (!row) return { allowed: false, reason: 'not_found' };
  if (!row.is_private) return { allowed: true };
  if (row.is_member) return { allowed: true };
  return { allowed: false, reason: 'not_member' };
}

/**
 * Gate for administrative actions on a channel (member management,
 * visibility changes, settings).
 *
 * Allowed if requester is:
 *   - global team_admin / admin (member.roles), OR
 *   - channel owner / admin (team_channel_members.role)
 */
export async function isChannelAdminOrTeamAdmin(
  requesterId: string,
  channelId: string
): Promise<boolean> {
  // Global team admin
  const teamAdminResult = await query<{ roles: string[] | null }>(
    `SELECT roles FROM members WHERE id = $1`,
    [requesterId]
  );
  const roles = teamAdminResult.rows[0]?.roles ?? [];
  if (Array.isArray(roles) && (roles.includes('team_admin') || roles.includes('admin'))) {
    return true;
  }

  // Channel-level owner/admin
  const channelRoleResult = await query<{ role: string }>(
    `SELECT role FROM team_channel_members WHERE channel_id = $1 AND member_id = $2`,
    [channelId, requesterId]
  );
  const role = channelRoleResult.rows[0]?.role;
  return role === 'owner' || role === 'admin';
}
