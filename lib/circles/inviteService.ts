/**
 * Invite Service — Manage circle invite tokens
 *
 * Regenerating an invite revokes all previous tokens.
 * Only the circle creator can generate invites.
 */

import { query, queryOne } from '@/lib/db/postgres';
import type { CircleInviteRow } from './types';

function makeInviteToken(): string {
  return `${crypto.randomUUID().replaceAll('-', '')}${crypto.randomUUID().replaceAll('-', '')}`.slice(0, 48);
}

/**
 * Regenerate invite token for a circle.
 * Revokes all existing tokens. Only the circle creator can do this.
 */
export async function regenerateInvite(circleId: string, memberId: string) {
  // Verify the member is the circle creator
  const circle = await queryOne(
    `SELECT id, created_by FROM circles WHERE id = $1`,
    [circleId]
  );

  if (!circle || circle.created_by !== memberId) {
    throw new Error('FORBIDDEN');
  }

  // Revoke all existing tokens
  await query(
    `UPDATE circle_invites
     SET revoked_at = NOW()
     WHERE circle_id = $1 AND revoked_at IS NULL`,
    [circleId]
  );

  // Create new token
  const token = makeInviteToken();

  const result = await queryOne<CircleInviteRow>(
    `INSERT INTO circle_invites (circle_id, created_by, token)
     VALUES ($1, $2, $3)
     RETURNING token, created_at`,
    [circleId, memberId, token]
  );

  return result;
}

/**
 * Join a circle using an invite token.
 * Validates token is not revoked. Creates or updates membership.
 */
export async function joinWithInvite(
  token: string,
  memberId: string,
  consentMode: 'manual' | 'not_now'
) {
  const invite = await queryOne<CircleInviteRow>(
    `SELECT circle_id, revoked_at FROM circle_invites WHERE token = $1`,
    [token]
  );

  if (!invite || invite.revoked_at) {
    throw new Error('INVALID_INVITE');
  }

  // Upsert membership (INSERT or UPDATE if they were previously a member)
  await query(
    `INSERT INTO circle_memberships (circle_id, member_id, role, status, consent_mode, consented_at)
     VALUES ($1, $2, 'member', 'active', $3, NOW())
     ON CONFLICT (circle_id, member_id)
     DO UPDATE SET status = 'active', consent_mode = $3, consented_at = NOW()`,
    [invite.circle_id, memberId, consentMode]
  );

  return invite.circle_id as string;
}
