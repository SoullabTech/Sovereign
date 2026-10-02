import { composeTwoLayerMigrationRebind, type BaseMigrationReview, type DeltaReview, type CompositeObservation } from '../../../scripts/migration-custody-composition-core';

const P = [
  { path: 'database/migrations/1.sql', sha256: 'a'.repeat(64) },
  { path: 'database/migrations/2.sql', sha256: 'b'.repeat(64) },
];
const baseTarget = 'a'.repeat(40);
const liveTarget = 'b'.repeat(40);
const deltaHash = 'c'.repeat(64);
const changed = ['app/home/page.tsx','lib/house/preferencesStore.ts'];

function fixture() {
  const base: BaseMigrationReview = {
    admitted: true, targetReaderCommit: baseTarget, pending: P,
    allPrefixesCompatible: true, reviewSha256: 'd'.repeat(64),
  };
  const delta: DeltaReview = {
    approved: true, compatible: true, allPrefixesCompatible: true,
    baseTargetCommit: baseTarget, targetReaderCommit: liveTarget,
    reviewSha256: deltaHash, expectedReviewSha256: deltaHash,
    migrationBytes: P, changedPaths: changed, witnessedPaths: changed,
  };
  const observed: CompositeObservation = {
    liveReaderCommit: liveTarget, targetReaderCommit: liveTarget,
    pending: P, deltaBaseIsAncestor: true,
  };
  return { base, delta, observed };
}

function expectRefusal(name: string, mutate: (x: ReturnType<typeof fixture>) => void, code: string) {
  const x = fixture(); mutate(x);
  const out = composeTwoLayerMigrationRebind(x.base, x.delta, x.observed);
  if (out.kind !== 'refused' || out.code !== code)
    throw new Error(`${name}: expected ${code}, got ${JSON.stringify(out)}`);
  console.log('DEAD', name, '->', code);
}

const good = fixture();
const pass = composeTwoLayerMigrationRebind(good.base, good.delta, good.observed);
if (pass.kind !== 'applies' || pass.migrations !== 2 || pass.deltaFiles !== 2)
  throw new Error('lawful composition did not apply');
console.log('PASS lawful two-layer composition');

expectRefusal('unadmitted base', x => { x.base.admitted=false; }, 'BASE_REVIEW_NOT_ADMITTED');
expectRefusal('base prefix missing', x => { x.base.allPrefixesCompatible=false; }, 'BASE_PREFIX_ATTESTATION_MISSING');
expectRefusal('delta not approved', x => { x.delta.approved=false; }, 'DELTA_REVIEW_NOT_APPROVED');
expectRefusal('delta incompatible', x => { x.delta.compatible=false; }, 'DELTA_NOT_COMPATIBLE');
expectRefusal('delta prefix missing', x => { x.delta.allPrefixesCompatible=false; }, 'DELTA_PREFIX_ATTESTATION_MISSING');
expectRefusal('review substitution', x => { x.delta.reviewSha256='e'.repeat(64); }, 'DELTA_REVIEW_SUBSTITUTED');
expectRefusal('wrong delta base', x => { x.delta.baseTargetCommit='f'.repeat(40); }, 'DELTA_BASE_MISMATCH');
expectRefusal('wrong delta target', x => { x.delta.targetReaderCommit='f'.repeat(40); }, 'DELTA_TARGET_MISMATCH');
expectRefusal('not descendant', x => { x.observed.deltaBaseIsAncestor=false; }, 'DELTA_NOT_DESCENDANT');
expectRefusal('migration touched in delta', x => {
  x.delta.changedPaths=[...changed,'database/migrations/1.sql'];
  x.delta.witnessedPaths=x.delta.changedPaths;
}, 'DELTA_MIGRATION_PATH_CHANGED');
expectRefusal('missing changed-file witness', x => { x.delta.witnessedPaths=['app/home/page.tsx']; }, 'DELTA_COVERAGE_MISSING');
expectRefusal('migration byte changed', x => {
  x.delta.migrationBytes=[P[0]!,{...P[1]!,sha256:'9'.repeat(64)}];
}, 'MIGRATION_BYTES_CHANGED');
expectRefusal('partial-prefix drift', x => { x.observed.pending=[P[1]!]; }, 'PENDING_PREFIX_DRIFT');
expectRefusal('wrong live reader', x => { x.observed.liveReaderCommit='0'.repeat(40); }, 'LIVE_READER_MISMATCH');

console.log('MATRIX PASS · 14/14 defeat candidates dead');
