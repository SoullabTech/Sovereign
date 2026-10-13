import test from 'node:test';
import assert from 'node:assert/strict';
import { planArchiveCustody } from '../../../lib/recovery/r20-r2/archiveCustody.mjs';

const H = 'a'.repeat(64);
function evidence() {
  return [
    { id:'fixture-local-sql', class:'postgres', sha256:H,
      coverageSequence:0, contentIntegrityVerified:true },
    { id:'fixture-nas-sql', class:'postgres', sha256:H,
      coverageSequence:0, contentIntegrityVerified:true },
    { id:'fixture-nas-recycled', class:'synology_snapshot',
      sha256:null, coverageSequence:null, contentIntegrityVerified:false },
    { id:'fixture-offsite-unknown', class:'offsite_replica',
      sha256:null, coverageSequence:null, contentIntegrityVerified:false },
  ];
}
const args=()=>({
  archives:evidence(),deletionHighWater:2,
  cleanContinuity:{verified:false,restoreTestPassed:false,coverageSequence:0},
  humanAuthorization:null,
});
test('historical plaintext SQL generations remain potentially contaminated',()=>{
  const p=planArchiveCustody(args());
  assert.equal(p.decisions[0].status,'POTENTIALLY_CONTAMINATED');
  assert.equal(p.decisions[1].status,'POTENTIALLY_CONTAMINATED');
  assert.equal(p.automaticDeletionAuthorized,false);
  assert.equal(p.productionSnapshotsAuthorized,false);
});
test('unverified recycle and offsite copies refuse clean classification',()=>{
  const p=planArchiveCustody(args());
  assert(p.decisions.slice(2).every(x=>x.status==='HELD_UNATTRIBUTED'));
  assert(p.decisions.every(x=>x.deleted===false));
});
test('no clean restore means even a founder review may not request purge',()=>{
  const a=args();
  a.humanAuthorization={
    scope:'EXACT_ARCHIVE_IDS',
    reviewedArchiveIds:['fixture-local-sql'],
    approved:true,
  };
  const p=planArchiveCustody(a);
  assert(p.decisions.every(x=>x.nextAction==='HOLD_AND_REVIEW'));
});
test('fully reviewed fictional purge still cannot delete any archive',()=>{
  const a=args();
  a.cleanContinuity={verified:true,restoreTestPassed:true,coverageSequence:2};
  a.humanAuthorization={
    scope:'EXACT_ARCHIVE_IDS',
    reviewedArchiveIds:['fixture-local-sql'],
    approved:true,
  };
  const p=planArchiveCustody(a);
  assert.equal(p.decisions[0].nextAction,'ELIGIBLE_FOR_SEPARATE_MANUAL_PURGE_REVIEW');
  assert(p.decisions.slice(1).every(x=>x.nextAction==='HOLD_AND_REVIEW'));
  assert(p.decisions.every(x=>x.deleted===false));
});
test('an entirely unknown historical inventory cannot be certified clean',()=>{
  const a=args();a.archives=[{id:'fixture-only-unknown',class:'offsite_replica'}];
  const p=planArchiveCustody(a);
  assert.equal(p.decisions[0].status,'HELD_UNATTRIBUTED');
  assert.equal(p.decisions[0].deleted,false);
});
