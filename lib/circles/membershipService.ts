/**
 * Membership Service — Join/leave circles
 *
 * Enforces the revocation cascade: leaving a Circle revokes ALL of that
 * member's live Circle-side representations there — shared artifacts AND
 * structured-inquiry responses — atomically, before membership standing changes.
 */

import { transaction } from '@/lib/db/postgres';
import { getCircleWithMembership } from './circleService';
import { tombstoneMemberResponsesInCircle } from './inquiryService';

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

    // Then tombstone live inquiry responses (founder ruling C, 2026-09-07).
    // Ending membership ends the eligibility of that member's Circle-side
    // representations to remain in the field. Without this the response stays
    // visible and the former member cannot withdraw it — withdrawResponse()
    // requires an active membership, so nobody could remove it.
    await tombstoneMemberResponsesInCircle(tx as any, circleId, memberId);

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
