/**
 * R30 synthetic integration release stop.
 *
 * The older two-signer R24 fixture must NOT downgrade the versioned R26/R29
 * lease, and offline retained-key decryption must NOT authorize member launch.
 */
import {readdirSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {canonicalKeyLeaseR26,R26_REAL_MEMBER_KEY_CUSTODY_ENABLED,
 type R26Lease} from '../externalCustodyContractR26';
import {R24_LEASE_PROTOCOL,R24_REAL_EXTERNAL_CUSTODY_ENABLED} from '../externalCustodyBoundaryR24';
import {R29_REAL_WRITER_AUTHORIZATION_ENABLED,R29_PROTOCOL} from '../sessionBoundCustodyR29';
import {R23_REAL_MEMBER_VAULT_ENABLED} from '../reviewVaultHistoryServiceR23';
import {R27_REAL_MEMBER_RELEASE_FROM_FIXTURE,reviewOldBackupEvidenceR27} from '../oldBackupReleaseGateR27';

function apiRoutes(dir:string):string[]{
 const paths:string[]=[];
 for(const entry of readdirSync(dir,{withFileTypes:true})){
  const f=path.join(dir,entry.name);
  if(entry.isDirectory())paths.push(...apiRoutes(f));
  else if(entry.isFile()&&/^route\.tsx?$/.test(entry.name))paths.push(f);
 }
 return paths;
}
const oldBackupReceipt=()=>{
 return {status:'R26_BACKUP_CUSTODY_POLICY_REFUSAL_PASS_RAW_KEY_ERASURE_UNPROVEN',
  checks:Array.from({length:13},(_,i)=>'fictional check '+i),
  negatives:['retired Work','older lease','older backup','current revocation'],
  unsafeRetainedKeyCanDecryptOldBackup:true,
  sidecarStopped:true,fixtureRemoved:true,backupRemoved:true,
  productionTouched:false,realMembersTouched:false,realKmsInstalled:false,
  error:null,testedGitHead:'5b1666983df84a099bf45bd32bdf1ad8a1ea8df8'};
};
describe('R30 combined source never promotes old trust or deletion claims',()=>{
 it('keeps all material real-member and live external KMS access hard-disabled',()=>{
  expect(R24_REAL_EXTERNAL_CUSTODY_ENABLED).toBe(false);
  expect(R26_REAL_MEMBER_KEY_CUSTODY_ENABLED).toBe(false);
  expect(R27_REAL_MEMBER_RELEASE_FROM_FIXTURE).toBe(false);
  expect(R23_REAL_MEMBER_VAULT_ENABLED).toBe(false);
  expect(R29_REAL_WRITER_AUTHORIZATION_ENABLED).toBe(false);
 });
 it('does not accept R24 two-signer lease in the new R26 key-lease parser',()=>{
  const r24={
    protocol:R24_LEASE_PROTOCOL,
    scope:{memberId:'11111111-1111-4111-8111-111111111111',
      workId:'33333333-3333-4333-8333-333333333333',generation:1,
      operation:'append'},
    keyId:'44444444-4444-4444-8444-444444444444',
    keyDigest:'a'.repeat(64),deletionGeneration:10,
    nonce:'a'.repeat(32),issuedAtMs:1,expiresAtMs:1000};
  expect(()=>canonicalKeyLeaseR26(r24 as unknown as R26Lease))
    .toThrow('r26_unrecognized_attestation_shape');
  expect(R29_PROTOCOL).toBe('soullab.ws.session-consent-bound-lease.r29');
 });
 it('preserves a definite HOLD when retained raw key decrypts an old backup',()=>{
  const gate=reviewOldBackupEvidenceR27(oldBackupReceipt());
  expect(gate).toMatchObject({verdict:'HOLD',canAdmitRealWriters:false,
    canClaimIrreversibleErasure:false,
    reason:'observed_retained_key_offline_decryption'});
 });
 it('cannot certify historic key erasure from silence or missing backup receipts',()=>{
  const noKeySeen=reviewOldBackupEvidenceR27({
   ...oldBackupReceipt(),unsafeRetainedKeyCanDecryptOldBackup:false});
  expect(noKeySeen.reason).toBe('historical_key_absence_not_independently_proven');
  expect(noKeySeen.canClaimIrreversibleErasure).toBe(false);
  expect(reviewOldBackupEvidenceR27(null)).toMatchObject({
    verdict:'HOLD',reason:'invalid_or_unverifiable_receipt'});
 });
 it('does not install an API writing route for historical held protocols',()=>{
  const files=apiRoutes(path.join(process.cwd(),'app/api'));
  const unsafe=files.filter(f=>
    /externalCustodyBoundaryR24|heldCommitFenceR27|sessionBoundCustodyR29|heldVaultHistoryR23|heldExternalCustodyAdapterR26|oldBackupReleaseGateR27/
      .test(readFileSync(f,'utf8')),
  );
  expect(unsafe).toEqual([]);
 });
});
