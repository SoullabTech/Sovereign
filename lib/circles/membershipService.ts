/**
 * Membership Service — Join/leave circles
 *
 * Enforces the revocation cascade:
 * Leaving a circle revokes all member's shared artifacts in that circle.
 */

import { transaction } from '@/lib/db/postgres';
import { getCircleWithMembership } from './circleService';

/**
 * Leave a circle.
 *
 * REVOCATION CASCADE: all member's active shared artifacts
 * in this circle are revoked before membership is set to 'left'.
 */
export async function leaveCircle(circleId: string, memberId: string) {
  // Verify active membership
  await getCircleWithMembership(circleId, memberId);

  await transaction(async (tx) => {
    // Revoke all shares first
    await tx.query(
      `UPDATE shared_artifacts
       SET revoked_at = NOW()
       WHERE circle_id = $1 AND shared_by = $2 AND revoked_at IS NULL`,
      [circleId, memberId]
    );

    // Then mark membership as left
    await tx.query(
      `UPDATE circle_memberships
       SET status = 'left', updated_at = NOW()
       WHERE circle_id = $1 AND member_id = $2 AND status = 'active'`,
      [circleId, memberId]
    );
  });

  return true;
}
