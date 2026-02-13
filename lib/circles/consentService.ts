/**
 * Consent Service — Manage sharing consent for circles
 *
 * Enforces the revocation cascade:
 * If consent is revoked (manual -> not_now), all active shared
 * artifacts for that member in that circle are revoked.
 */

import { query } from '@/lib/db/postgres';
import { getCircleWithMembership } from './circleService';
import type { ConsentMode } from './types';

/**
 * Set consent mode for a member in a circle.
 *
 * REVOCATION CASCADE: if consentMode is not 'manual',
 * all member's active shares in this circle are revoked.
 */
export async function setConsent(
  circleId: string,
  memberId: string,
  consentMode: ConsentMode
) {
  const { membership } = await getCircleWithMembership(circleId, memberId);

  const result = await query(
    `UPDATE circle_memberships
     SET consent_mode = $1, consented_at = NOW()
     WHERE id = $2
     RETURNING id`,
    [consentMode, membership.id]
  );

  if (result.rows.length === 0) {
    throw new Error('FORBIDDEN');
  }

  // Revocation cascade: if not manual, revoke all active shares
  if (consentMode !== 'manual') {
    await query(
      `UPDATE shared_artifacts
       SET revoked_at = NOW()
       WHERE circle_id = $1 AND shared_by = $2 AND revoked_at IS NULL`,
      [circleId, memberId]
    );
  }

  return true;
}
