/**
 * R27 MANAGED-KMS DESIGN REVIEW ONLY.
 *
 * No AWS SDK imports, network, credentials, IaC apply, resource creation,
 * KMS keys, member source text, or production routes. This evaluates only
 * operator-supplied architecture metadata, not operational evidence.
 */
export const R27_MANAGED_KMS_PROVISIONING_ENABLED = false as const;
export const R27_REAL_MEMBER_WRITING_ENABLED = false as const;
export const R27_PROPOSAL_PROTOCOL = 'soullab.ws.managed-key-topology.r27' as const;

export type ProposedManagedKmsR27 = {
  protocol: typeof R27_PROPOSAL_PROTOCOL;
  region: string;
  accounts: {
    application: string;
    workKeyAuthority: string;
    deletionRegister: string;
    independentFreshness: string;
  };
  keys: {
    wrapArn: string;
    grantSignerArn: string;
    deletionSignerArn: string;
    freshnessSignerArn: string;
    wrapSpec: 'SYMMETRIC_DEFAULT';
    signatureSpec: 'ECC_NIST_EDWARDS25519';
    signingAlgorithm: 'ED25519_SHA_512';
    signingMessageType: 'RAW';
  };
  workEncryptionContext: {
    service: 'soullab-writers-beta';
    opaqueWorkDigest: string;
    generation: string;
  };
  witness: {
    sameRegionSingleWriter: boolean;
    conditionalEpochAdvance: boolean;
    stronglyConsistentRead: boolean;
    immutableAuditOutsideRegister: boolean;
    activeDeleteDenyOnOldBackup: boolean;
  };
  separation: {
    appHasNoKeyAdmin: boolean;
    appCannotSignOwnGrants: boolean;
    issuerAdminsAreSeparated: boolean;
    issuerKeysPinnedOutOfBand: boolean;
    challengeReplayTrackedByCustodian: boolean;
    consentRecheckedAfterExternalGrant: boolean;
    appCannotResetRevocationLedger: boolean;
    appCannotReadAuditAdminCredentials: boolean;
  };
};
export type R27Review =
  | { status:'REFUSED_TOPOLOGY'; releaseApproved:false; provisioningApproved:false; reasons:string[] }
  | { status:'PLAN_CONSISTENT_NOT_OPERATIONAL'; releaseApproved:false;
      provisioningApproved:false; expectedSigningAlgorithm:'ED25519_SHA_512';
      approvalRequirements:string[] };

const ACCOUNT=/^\d{12}$/;
const REGION=/^[a-z]{2}(?:-gov)?-[a-z]+-\d$/;
const DIGEST=/^[a-f0-9]{64}$/;
const EPOCH=/^[1-9][0-9]{0,14}$/;
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
function isKeyArn(arn:string,region:string,account:string):boolean {
  if(typeof arn!=='string')return false;
  const prefix=`arn:aws:kms:${region}:${account}:key/`;
  return arn.startsWith(prefix) && UUID.test(arn.slice(prefix.length));
}
/**
 * AWS symmetric KMS encryption context is plaintext in CloudTrail.
 * The only admitted context values are opaque digests and nonsensitive,
 * coarse application/generation labels. No username, email, title, prose,
 * raw member ID, original filename or other arbitrary fields.
 */
function nonSensitiveContext(c:ProposedManagedKmsR27['workEncryptionContext']):boolean {
  if(!c || Object.keys(c).sort().join(',')!=='generation,opaqueWorkDigest,service')
    return false;
  return c.service==='soullab-writers-beta' && DIGEST.test(c.opaqueWorkDigest)
    && EPOCH.test(c.generation);
}
/**
 * Structural review of an unprovisioned design. This cannot distinguish a
 * true independent administrator from an invented account number; independent
 * control, audit, physical KMS proof, retention and disaster recovery require
 * separately witnessed evidence and founder approval.
 */
export function reviewManagedKmsPlanR27(input:unknown):R27Review {
  const reasons:string[]=[];
  const fail=(message:string)=>reasons.push(message);
  if(!input || typeof input!=='object' || Array.isArray(input))
    return {status:'REFUSED_TOPOLOGY',releaseApproved:false,
      provisioningApproved:false,reasons:['missing_reviewable_topology']};
  const x=input as Partial<ProposedManagedKmsR27>;
  if(x.protocol!==R27_PROPOSAL_PROTOCOL)fail('wrong_proposal_protocol');
  if(typeof x.region!=='string' || !REGION.test(x.region))fail('invalid_region');
  if(!x.accounts ||
    Object.keys(x.accounts).sort().join(',')!==
      'application,deletionRegister,independentFreshness,workKeyAuthority' ||
    Object.values(x.accounts).some(a=>typeof a!=='string'||!ACCOUNT.test(a)) ||
    new Set(Object.values(x.accounts)).size!==4)
    fail('no_verified_separate_account_design');
  if(!x.keys || Object.keys(x.keys).sort().join(',')!==
    'deletionSignerArn,freshnessSignerArn,grantSignerArn,signatureSpec,signingAlgorithm,signingMessageType,wrapArn,wrapSpec')
    fail('incomplete_kms_key_design');
  else {
    const acct=x.accounts;
    if(!acct || !x.region ||
      !isKeyArn(x.keys.wrapArn,x.region,acct.workKeyAuthority) ||
      !isKeyArn(x.keys.grantSignerArn,x.region,acct.workKeyAuthority) ||
      !isKeyArn(x.keys.deletionSignerArn,x.region,acct.deletionRegister) ||
      !isKeyArn(x.keys.freshnessSignerArn,x.region,acct.independentFreshness) ||
      new Set([x.keys.wrapArn,x.keys.grantSignerArn,x.keys.deletionSignerArn,
        x.keys.freshnessSignerArn]).size!==4)
      fail('key_arn_role_region_or_account_mismatch');
    if(x.keys.wrapSpec!=='SYMMETRIC_DEFAULT' ||
       x.keys.signatureSpec!=='ECC_NIST_EDWARDS25519' ||
       x.keys.signingAlgorithm!=='ED25519_SHA_512' ||
       x.keys.signingMessageType!=='RAW')
      fail('unsupported_signing_or_encryption_algorithm');
  }
  if(!nonSensitiveContext(x.workEncryptionContext!))
    fail('potentially_sensitive_kms_encryption_context');
  if(!x.witness ||
    Object.keys(x.witness).sort().join(',')!==
     'activeDeleteDenyOnOldBackup,conditionalEpochAdvance,immutableAuditOutsideRegister,sameRegionSingleWriter,stronglyConsistentRead' ||
    Object.values(x.witness).some(v=>v!==true))
    fail('insufficient_monotonic_deletion_design');
  if(!x.separation ||
    Object.keys(x.separation).sort().join(',')!==
     'appCannotReadAuditAdminCredentials,appCannotResetRevocationLedger,appCannotSignOwnGrants,appHasNoKeyAdmin,challengeReplayTrackedByCustodian,consentRecheckedAfterExternalGrant,issuerAdminsAreSeparated,issuerKeysPinnedOutOfBand'.split(',').sort().join(',') ||
    Object.values(x.separation).some(v=>v!==true))
    fail('administrative_or_consent_race_boundary_missing');
  if(reasons.length)return {status:'REFUSED_TOPOLOGY',releaseApproved:false,
    provisioningApproved:false,reasons};
  return {
    status:'PLAN_CONSISTENT_NOT_OPERATIONAL',
    releaseApproved:false,
    provisioningApproved:false,
    expectedSigningAlgorithm:'ED25519_SHA_512',
    approvalRequirements:[
      'founder_approved_budget_roles_jurisdiction_and_supplier',
      'independently_operated_actual_key_and_deletion_signers',
      'real_strongly_consistent_nonrollbackable_revocation_witness',
      'full_real_writer_plaintext_field_migration_and_offsite_restore',
      'exact_frozen_source_image_rollback_and_browser_acceptance',
      'founder_explicit_provisioning_and_later_distinct_deployment_go',
    ],
  };
}
