import {
  R27_REAL_MEMBER_RELEASE_FROM_FIXTURE,
  reviewOldBackupEvidenceR27,
  type R27SyntheticReceipt,
} from '../oldBackupReleaseGateR27';

function evidence(change:Partial<R27SyntheticReceipt>={}):R27SyntheticReceipt {
  return {
    status:'R26_BACKUP_CUSTODY_POLICY_REFUSAL_PASS_RAW_KEY_ERASURE_UNPROVEN',
    checks:Array.from({length:13},(_,i)=>'fictional check '+(i+1)),
    negatives:[
      'new lease for retired Work refused',
      'unused pre-deletion lease rejected',
      'old backup high-water refused',
      'current revoked Work refused',
    ],
    unsafeRetainedKeyCanDecryptOldBackup:true,
    sidecarStopped:true,fixtureRemoved:true,backupRemoved:true,
    productionTouched:false,realMembersTouched:false,realKmsInstalled:false,
    error:null,testedGitHead:'5b1666983df84a099bf45bd32bdf1ad8a1ea8df8',...change,
  };
}
describe('R27 old-backup defeat must never be promoted to deletion release',()=>{
  it('statically disallows any real-writer grant from fixture evidence',()=>{
    expect(R27_REAL_MEMBER_RELEASE_FROM_FIXTURE).toBe(false);
  });
  it('holds even when every synthetic test passes and a retained key decrypts',()=>{
    const verdict=reviewOldBackupEvidenceR27(evidence());
    expect(verdict).toMatchObject({
      protocol:'soullab.ws.synthetic-backup-revocation.r27',
      verdict:'HOLD',canAdmitRealWriters:false,
      canClaimIrreversibleErasure:false,canCertifyIndependentKeyCustody:false,
      reason:'observed_retained_key_offline_decryption',
      reportedSyntheticChecks:13,offlineDecryptionObserved:true,
    });
  });
  it('does not infer real key erasure merely because no bypass was detected',()=>{
    const result=reviewOldBackupEvidenceR27(
      evidence({unsafeRetainedKeyCanDecryptOldBackup:false}));
    expect(result.verdict).toBe('HOLD');
    expect(result.reason).toBe('historical_key_absence_not_independently_proven');
    expect(result.canClaimIrreversibleErasure).toBe(false);
  });
  it('refuses missing, malformed and unversioned fixture evidence',()=>{
    for(const data of [undefined,null,42,{},'pass',[],{
      ...evidence(),extraField:'promote-to-live',
    }, {...evidence(),checks:'all pass'},{...evidence(),negatives:[null]}]){
      const result=reviewOldBackupEvidenceR27(data);
      expect(result.verdict).toBe('HOLD');
      expect(result.reason).toBe('invalid_or_unverifiable_receipt');
    }
  });
  it('refuses any incomplete synthetic cleanup',()=>{
    for(const field of ['sidecarStopped','fixtureRemoved','backupRemoved'] as const){
      const result=reviewOldBackupEvidenceR27(evidence({[field]:false}));
      expect(result).toMatchObject({
        verdict:'HOLD',reason:'incomplete_fixture_cleanup',
        canAdmitRealWriters:false,
      });
    }
  });
  it('never accepts a claimed real member, live KMS installation or production mutation',()=>{
    for(const field of ['productionTouched','realMembersTouched','realKmsInstalled'] as const){
      const result=reviewOldBackupEvidenceR27(evidence({[field]:true}));
      expect(result).toMatchObject({
        verdict:'HOLD',reason:'fixture_test_not_accepted',
        canClaimIrreversibleErasure:false,
      });
    }
  });
  it('requires exact synthetic-test receipt state and negative controls',()=>{
    for(const change of [
      {status:'PASS_PRODUCTION_RELEASE'},
      {status:'GO'},
      {checks:['only one test']},
      {negatives:['only one control']},
      {error:'simulated crash'},
    ]){
      const result=reviewOldBackupEvidenceR27(evidence(change));
      expect(result.reason).toBe('fixture_test_not_accepted');
      expect(result.verdict).toBe('HOLD');
    }
  });
});
