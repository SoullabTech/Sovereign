/**
 * Membership Service — Join/leave circles
 *
 * Enforces the revocation cascade: leaving a Circle revokes ALL of that
 * member's live Circle-side representations there — shared artifacts AND
 * structured-inquiry responses — atomically, before membership standing changes.
 */

import { transaction, type TransactionClient } from '@/lib/db/postgres';
import { getCircleWithMembership } from './circleService';
import { tombstoneMemberResponsesInCircle } from './inquiryService';

/**
 * Leave a circle.
 *
 * REVOCATION CASCADE: all member's active shared artifacts
 * in this circle are revoked before membership is set to 'left'.
 */
export async function leaveCircleWithClient(
  tx: TransactionClient,
  circleId: string,
  memberId: string,
): Promise<void> {
  // Revoke all shares first. Account erasure reuses this exact lifecycle inside
  // its own transaction; it may not reproduce a weaker copy of Circle law.
  await tx.query(
    `UPDATE shared_artifacts
     SET revoked_at = NOW()
     WHERE circle_id = $1 AND shared_by = $2 AND revoked_at IS NULL`,
    [circleId, memberId],
  );

  // Then tombstone authored response payload while retaining the historical fact.
  await tombstoneMemberResponsesInCircle(tx, circleId, memberId);

  // Identity standing ends only after both representation surfaces are inert.
  await tx.query(
    `UPDATE circle_memberships
     SET status = 'left', updated_at = NOW()
     WHERE circle_id = $1 AND member_id = $2 AND status = 'active'`,
    [circleId, memberId],
  );
}

export async function leaveCircle(circleId: string, memberId: string) {
  // Preserve the ordinary route's existing authorization/active-membership gate.
  await getCircleWithMembership(circleId, memberId);
  await transaction(async (tx) => leaveCircleWithClient(tx, circleId, memberId));
  return true;
}
