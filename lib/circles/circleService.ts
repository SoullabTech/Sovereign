/**
 * Circle Service — CRUD operations for circles
 *
 * All queries enforce member_id scoping.
 * Uses lib/db/postgres.ts (NOT Supabase).
 */

import { query, queryOne, transaction } from '@/lib/db/postgres';
import type { CircleRow, CircleMembershipRow } from './types';

/**
 * List all circles where member has active membership
 */
export async function listMyCircles(memberId: string) {
  const result = await query(
    `SELECT
      c.id, c.name, c.description, c.created_at,
      cm.role, cm.consent_mode
    FROM circle_memberships cm
    JOIN circles c ON c.id = cm.circle_id
    WHERE cm.member_id = $1 AND cm.status = 'active'
    ORDER BY cm.created_at DESC`,
    [memberId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    myRole: row.role,
    consentMode: row.consent_mode,
  }));
}

/**
 * Create circle + auto-membership (creator becomes helper)
 */
export async function createCircle(
  memberId: string,
  name: string,
  description?: string | null
) {
  return transaction(async (client) => {
    const circleResult = await client.query(
      `INSERT INTO circles (created_by, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, created_at`,
      [memberId, name, description ?? null]
    );

    const circle = circleResult.rows[0];

    await client.query(
      `INSERT INTO circle_memberships (circle_id, member_id, role, status, consent_mode, consented_at)
       VALUES ($1, $2, 'helper', 'active', 'manual', NOW())`,
      [circle.id, memberId]
    );

    return circle as CircleRow;
  });
}

/**
 * Get circle + membership for a specific member.
 * Throws 'FORBIDDEN' if member is not an active member.
 */
export async function getCircleWithMembership(
  circleId: string,
  memberId: string
): Promise<{ circle: CircleRow; membership: CircleMembershipRow }> {
  const membership = await queryOne<CircleMembershipRow>(
    `SELECT id, circle_id, member_id, role, status, consent_mode, consented_at, created_at, updated_at
     FROM circle_memberships
     WHERE circle_id = $1 AND member_id = $2`,
    [circleId, memberId]
  );

  if (!membership || membership.status !== 'active') {
    throw new Error('FORBIDDEN');
  }

  const circle = await queryOne<CircleRow>(
    `SELECT id, created_by, name, description, visibility, invite_enabled, created_at, updated_at
     FROM circles
     WHERE id = $1`,
    [circleId]
  );

  if (!circle) {
    throw new Error('NOT_FOUND');
  }

  return { circle, membership };
}

/**
 * List active members of a circle.
 * Requires requesting member to be an active member.
 */
export async function listCircleMembers(
  circleId: string,
  requestingMemberId: string
) {
  // Membership gate
  await getCircleWithMembership(circleId, requestingMemberId);

  const result = await query(
    `SELECT cm.member_id, cm.role, cm.status, cm.created_at, m.name
     FROM circle_memberships cm
     LEFT JOIN members m ON m.id = cm.member_id
     WHERE cm.circle_id = $1 AND cm.status = 'active'
     ORDER BY cm.created_at ASC`,
    [circleId]
  );

  return result.rows;
}
