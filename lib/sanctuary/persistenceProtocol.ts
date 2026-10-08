/** Sanctuary persistence authorization protocol — pure decision layer.
 * This does NOT grant persistence. Only a server-verified, serialized lease may.
 * The upload hold remains in force until the transactional adapter is admitted.
 */
export type ServerPosture = 'ordinary' | 'sanctuary' | 'unresolved';
export type PersistDecision = 'allow' | 'refuse';
export type PersistEvidence = Readonly<{
  sessionAuthenticated: boolean;
  sessionActive: boolean;
  posture: ServerPosture;
  // Must be derived inside a server-managed exclusion boundary that spans writes.
  exclusivePersistenceLease: boolean;
  // Lease and state revision must be checked while holding the same exclusion boundary.
  leaseRevision: bigint | null;
  postureRevision: bigint | null;
}>;

export function decideSourcePersistence(evidence: PersistEvidence): PersistDecision {
  if (!evidence.sessionAuthenticated || !evidence.sessionActive) return 'refuse';
  if (evidence.posture !== 'ordinary' || !evidence.exclusivePersistenceLease) return 'refuse';
  if (evidence.leaseRevision === null || evidence.postureRevision === null) return 'refuse';
  return evidence.leaseRevision === evidence.postureRevision ? 'allow' : 'refuse';
}

/** Transition requests cannot authorize source writes. An ordinary transition
 * only becomes observable when committed by the server's session state owner.
 * Entering Sanctuary has priority over an unresolved/new ordinary request.
 */
export function resolveTransition(previous: ServerPosture, requested: ServerPosture, committed: boolean): ServerPosture {
  if (!committed) return previous === 'sanctuary' ? 'sanctuary' : 'unresolved';
  if (requested === 'unresolved') return 'sanctuary';
  return requested;
}
