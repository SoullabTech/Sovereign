/**
 * PRODUCTION-MIGRATION-CUSTODY-COMPOSITION-01
 * Pure additive two-layer rebind composition.
 * No IO, no deployment authority, no mutation.
 */
import type { PendingMigration } from './migration-compatibility-core';

export type BaseMigrationReview = {
  admitted: boolean;
  targetReaderCommit: string;
  pending: PendingMigration[];
  allPrefixesCompatible: boolean;
  reviewSha256: string;
};

export type DeltaReview = {
  approved: boolean;
  compatible: boolean;
  allPrefixesCompatible: boolean;
  baseTargetCommit: string;
  targetReaderCommit: string;
  reviewSha256: string;
  expectedReviewSha256: string;
  migrationBytes: PendingMigration[];
  changedPaths: string[];
  witnessedPaths: string[];
};

export type CompositeObservation = {
  liveReaderCommit: string;
  targetReaderCommit: string;
  pending: PendingMigration[];
  deltaBaseIsAncestor: boolean;
};

export type RebindRefusalCode =
  | 'BASE_REVIEW_NOT_ADMITTED'
  | 'BASE_PREFIX_ATTESTATION_MISSING'
  | 'DELTA_REVIEW_NOT_APPROVED'
  | 'DELTA_NOT_COMPATIBLE'
  | 'DELTA_PREFIX_ATTESTATION_MISSING'
  | 'DELTA_REVIEW_SUBSTITUTED'
  | 'DELTA_BASE_MISMATCH'
  | 'DELTA_TARGET_MISMATCH'
  | 'DELTA_NOT_DESCENDANT'
  | 'DELTA_MIGRATION_PATH_CHANGED'
  | 'DELTA_COVERAGE_MISSING'
  | 'MIGRATION_BYTES_CHANGED'
  | 'PENDING_PREFIX_DRIFT'
  | 'LIVE_READER_MISMATCH'
  | 'TARGET_MISMATCH';

export type RebindOutcome =
  | { kind: 'applies'; migrations: number; deltaFiles: number }
  | { kind: 'refused'; code: RebindRefusalCode; reason: string };

const refuse = (code: RebindRefusalCode, reason: string): RebindOutcome =>
  ({ kind: 'refused', code, reason });

function samePending(a: PendingMigration[], b: PendingMigration[]): boolean {
  return a.length === b.length &&
    a.every((m, i) => m.path === b[i]?.path && m.sha256 === b[i]?.sha256);
}

export function composeTwoLayerMigrationRebind(
  base: BaseMigrationReview,
  delta: DeltaReview,
  observed: CompositeObservation,
): RebindOutcome {
  if (!base.admitted) return refuse('BASE_REVIEW_NOT_ADMITTED', 'base migration review is not admitted.');
  if (!base.allPrefixesCompatible) return refuse('BASE_PREFIX_ATTESTATION_MISSING', 'base review does not attest every committed prefix.');
  if (!delta.approved) return refuse('DELTA_REVIEW_NOT_APPROVED', 'delta review is not approved.');
  if (!delta.compatible) return refuse('DELTA_NOT_COMPATIBLE', 'delta review does not attest compatibility.');
  if (!delta.allPrefixesCompatible) return refuse('DELTA_PREFIX_ATTESTATION_MISSING', 'delta review does not attest every committed prefix.');
  if (delta.reviewSha256 !== delta.expectedReviewSha256)
    return refuse('DELTA_REVIEW_SUBSTITUTED', 'delta review bytes do not match the frozen expected review hash.');
  if (delta.baseTargetCommit !== base.targetReaderCommit)
    return refuse('DELTA_BASE_MISMATCH', 'delta review does not begin at the base review target.');
  if (delta.targetReaderCommit !== observed.targetReaderCommit)
    return refuse('DELTA_TARGET_MISMATCH', 'delta review target does not match the observed target.');
  if (!observed.deltaBaseIsAncestor)
    return refuse('DELTA_NOT_DESCENDANT', 'observed target is not a descendant of the reviewed base target.');
  if (delta.changedPaths.some(p => p.startsWith('database/migrations/')))
    return refuse('DELTA_MIGRATION_PATH_CHANGED', 'delta touches the governed migration surface.');
  if (delta.witnessedPaths.length === 0 || delta.changedPaths.some(p => !delta.witnessedPaths.includes(p)))
    return refuse('DELTA_COVERAGE_MISSING', 'delta review did not witness every changed path.');
  if (!samePending(base.pending, delta.migrationBytes))
    return refuse('MIGRATION_BYTES_CHANGED', 'migration bytes/order differ from the admitted base review.');
  if (!samePending(base.pending, observed.pending))
    return refuse('PENDING_PREFIX_DRIFT', 'live pending set no longer matches the exact reviewed ordered set.');
  if (observed.liveReaderCommit !== observed.targetReaderCommit)
    return refuse('LIVE_READER_MISMATCH', 'live reader is not the exact reviewed target reader.');
  if (observed.targetReaderCommit !== delta.targetReaderCommit)
    return refuse('TARGET_MISMATCH', 'observed target is not the delta review target.');
  return { kind: 'applies', migrations: base.pending.length, deltaFiles: delta.changedPaths.length };
}
