/**
 * WS-TIERS-R3 — independent R20 revocation authority integration boundary.
 *
 * A mutable grants row, even with an UPDATE guard, is not a durable
 * revocation authority: an old full-cluster backup can restore it to accepted.
 *
 * This module deliberately fails closed until an independently administered,
 * signed, current R20 receipt source is reviewed and connected.
 * DO NOT replace this with a boolean env flag or a test-only allowlist.
 *
 * Accepted receipts must be tied to BOTH the verified member and the stable
 * grant_id, checked against a separate non-rollbackable revocation floor, and
 * refused when the R20 service is unreachable/stale or cannot validate a
 * signature/epoch. No private manuscript or contact data is sent to R20.
 */
export class PilotR20AuthorityUnavailable extends Error {
  constructor() {
    super('pilot_r20_authority_not_provisioned');
    this.name = 'PilotR20AuthorityUnavailable';
  }
}

export async function requireIndependentPilotR20Grant(
  _input: Readonly<{ memberId: string; grantId: string }>,
): Promise<void> {
  // No trusted external verifier exists on this branch.
  // An admitted DB row therefore CANNOT become operational Pro yet.
  throw new PilotR20AuthorityUnavailable();
}
