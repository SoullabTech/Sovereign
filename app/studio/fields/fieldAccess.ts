import { query } from '@/lib/db/postgres';

/**
 * Can this authenticated practitioner-member read this specific member's shared field?
 *
 * The identity translation is load-bearing:
 *   session actor = members.id
 *   practitioner_clients.practitioner_id = practitioners.id
 *
 * A generic practitioner role is never enough. The requested member must be the
 * client in a live relationship owned by the authenticated practitioner's practice.
 */
export async function mayPractitionerViewMemberField(
  actorMemberId: string,
  targetMemberId: string,
): Promise<boolean> {
  if (!actorMemberId || !targetMemberId) return false;

  const result = await query(
    `SELECT 1
       FROM practitioner_clients pc
       JOIN practitioners p ON p.id = pc.practitioner_id
      WHERE p.member_id = $1
        AND p.status = 'active'
        AND pc.member_id = $2
        AND pc.relationship_status IN ('active', 'paused')
      LIMIT 1`,
    [actorMemberId, targetMemberId],
  );

  return (result.rowCount ?? result.rows.length) > 0;
}
