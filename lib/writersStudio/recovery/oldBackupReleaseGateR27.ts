/**
 * R27 release-stop assessment for the old-backup key-survival experiment.
 *
 * REVIEW ONLY. This parses non-authoritative, fictional acceptance evidence.
 * It can NEVER authorize real writer admission or claim irreversible deletion.
 * A passing synthetic crypto or restart test is not proof of independent,
 * uncompromised key material or offsite data erasure.
 */
export const R27_REAL_MEMBER_RELEASE_FROM_FIXTURE = false as const;
export const R27_RECEIPT_PROTOCOL = 'soullab.ws.synthetic-backup-revocation.r27' as const;

export type R27HoldReason =
  | 'invalid_or_unverifiable_receipt'
  | 'fixture_test_not_accepted'
  | 'incomplete_fixture_cleanup'
  | 'observed_retained_key_offline_decryption'
  | 'historical_key_absence_not_independently_proven';

export type R27SyntheticReceipt = Readonly<{
  status: string;
  checks: readonly string[];
  negatives: readonly string[];
  unsafeRetainedKeyCanDecryptOldBackup: boolean;
  sidecarStopped: boolean;
  fixtureRemoved: boolean;
  backupRemoved: boolean;
  productionTouched: boolean;
  realMembersTouched: boolean;
  realKmsInstalled: boolean;
  error: string | null;
  testedGitHead?: string; // exact synthetic Git base under review
}>;

export type R27ReleaseStop = Readonly<{
  protocol: typeof R27_RECEIPT_PROTOCOL;
  verdict: 'HOLD';
  canAdmitRealWriters: false;
  canClaimIrreversibleErasure: false;
  canCertifyIndependentKeyCustody: false;
  reason: R27HoldReason;
  reportedSyntheticChecks: number;
  offlineDecryptionObserved: boolean | null;
  status: string;
}>;

function blocked(reason: R27HoldReason, status: string, checks: number,
  bypass: boolean | null): R27ReleaseStop {
  return {
    protocol: R27_RECEIPT_PROTOCOL,verdict:'HOLD',
    canAdmitRealWriters:false,canClaimIrreversibleErasure:false,
    canCertifyIndependentKeyCustody:false,reason,
    reportedSyntheticChecks:checks,offlineDecryptionObserved:bypass,status,
  };
}
function isObject(v:unknown):v is Record<string,unknown> {
  return v!==null && typeof v==='object' && !Array.isArray(v);
}
function shape(v:Record<string,unknown>):v is Record<keyof R27SyntheticReceipt,string|number|boolean|object|null> {
  const fields=['status','checks','negatives','unsafeRetainedKeyCanDecryptOldBackup',
    'sidecarStopped','fixtureRemoved','backupRemoved','productionTouched',
    'realMembersTouched','realKmsInstalled','error'];
  const keys=Object.keys(v).sort().join('|');
  const basic=fields.sort().join('|');
  const withHead=[...fields,'testedGitHead'].sort().join('|');
  return (keys===basic || keys===withHead) &&
    (!('testedGitHead' in v) ||
      (typeof v.testedGitHead==='string' && /^[a-f0-9]{40}$/.test(v.testedGitHead))) &&
    typeof v.status==='string' &&
    Array.isArray(v.checks) &&
    (v.checks as unknown[]).every(x=>typeof x==='string' && x.length>0) &&
    Array.isArray(v.negatives) &&
    (v.negatives as unknown[]).every(x=>typeof x==='string' && x.length>0) &&
    [
      'unsafeRetainedKeyCanDecryptOldBackup','sidecarStopped',
      'fixtureRemoved','backupRemoved','productionTouched',
      'realMembersTouched','realKmsInstalled',
    ].every(field=>typeof v[field]==='boolean') &&
    (v.error===null || typeof v.error==='string');
}
/**
 * An acceptable *synthetic* result is useful for red-team evidence only.
 * No outcome here is GO. Stronger real-world evidence must come through a
 * separately designed, independently verified, future release protocol.
 */
export function reviewOldBackupEvidenceR27(input:unknown):R27ReleaseStop {
  if(!isObject(input) || !shape(input))
    return blocked('invalid_or_unverifiable_receipt','UNVERIFIED',0,null);
  const r=input as unknown as R27SyntheticReceipt;
  const checks=r.checks.length;
  const bypass=r.unsafeRetainedKeyCanDecryptOldBackup;
  if(r.productionTouched || r.realMembersTouched || r.realKmsInstalled ||
      r.error!==null || r.status!==
      'R26_BACKUP_CUSTODY_POLICY_REFUSAL_PASS_RAW_KEY_ERASURE_UNPROVEN' ||
      checks<13 || r.negatives.length<4)
    return blocked('fixture_test_not_accepted',r.status,checks,bypass);
  if(!r.sidecarStopped || !r.fixtureRemoved || !r.backupRemoved)
    return blocked('incomplete_fixture_cleanup',r.status,checks,bypass);
  if(bypass)
    return blocked('observed_retained_key_offline_decryption',r.status,checks,true);
  // A fabricated test that happens not to find a retained key still cannot
  // establish historical key absence across other operators and old backups.
  return blocked('historical_key_absence_not_independently_proven',
    r.status,checks,false);
}
