/**
 * R20-R8 — member-facing acknowledgment of a *locally removed* manuscript.
 *
 * A successful PostgreSQL transaction and even a finished local Source-vault
 * sweep do NOT prove all-replica permanent erasure. Prior SQL backups and
 * retained NAS recycle material remain reconstructive until independently
 * qualified key retirement and recovery-fence custody is established.
 *
 * This module deliberately has NO "complete" branch, even if a caller supplies
 * an approval-shaped value. Future completion requires a separately reviewed,
 * independently attested server-side protocol, not a Boolean/config toggle.
 */
export type PendingErasureAcknowledgement = Readonly<{
  removed: true;
  erasureStatus: 'pending';
  vaultSweepCompleted: boolean;
  historicalCopiesVerified: false;
  independentSignerCertified: false;
  permanentErasureCertified: false;
}>;

export function acknowledgeLocalManuscriptRemoval(
  vaultSweepCompleted: boolean,
): PendingErasureAcknowledgement {
  if (typeof vaultSweepCompleted !== 'boolean') {
    throw new Error('R20 erasure acknowledgment refused: invalid local sweep evidence');
  }
  return Object.freeze({
    removed: true,
    erasureStatus: 'pending',
    vaultSweepCompleted,
    historicalCopiesVerified: false,
    independentSignerCertified: false,
    permanentErasureCertified: false,
  });
}
