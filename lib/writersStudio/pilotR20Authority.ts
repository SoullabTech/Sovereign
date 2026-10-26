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

/**
 * R7 — authorization-changing writes MUST be sealed externally BEFORE any
 * locally committed effect. A boolean environment flag cannot mint authority.
 *
 * For a future approved implementation, 'approve' must generate a stable
 * grant generation ID before the external seal, then carry that SAME ID
 * transactionally into the member DB. Accept/revoke must seal against that
 * generation and the writer's current account. Crash/retry and irreversible
 * event reconciliation need independent Class A approval.
 *
 * Current source has NO trusted signer or monotonic head, so it refuses ALL
 * mutations, even if WRITER_PILOT_GRANT_WRITES_ENABLED='1'. No bypass flag.
 */
export type PilotR20MutationIntent = Readonly<{
  action: 'approve' | 'accept' | 'revoke';
  memberId: string;
  actorId: string;
}>;

export async function requireIndependentPilotR20MutationReceipt(
  _intent: PilotR20MutationIntent,
): Promise<void> {
  throw new PilotR20AuthorityUnavailable();
}
