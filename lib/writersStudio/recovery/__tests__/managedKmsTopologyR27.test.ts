import {
  R27_MANAGED_KMS_PROVISIONING_ENABLED,
  R27_REAL_MEMBER_WRITING_ENABLED,
  R27_PROPOSAL_PROTOCOL,
  reviewManagedKmsPlanR27,
  type ProposedManagedKmsR27,
} from '../managedKmsTopologyR27';

const uuid=(last:string)=>`12345678-1234-4234-8234-${last.padStart(12,'0')}`;
function proposal():ProposedManagedKmsR27 {
  const region='us-east-1';
  const accounts={
    application:'111111111111',
    workKeyAuthority:'222222222222',
    deletionRegister:'333333333333',
    independentFreshness:'444444444444',
  };
  const arn=(account:string,last:string)=>
    `arn:aws:kms:${region}:${account}:key/${uuid(last)}`;
  return {
    protocol:R27_PROPOSAL_PROTOCOL,
    region,
    accounts,
    keys:{
      wrapArn:arn(accounts.workKeyAuthority,'1'),
      grantSignerArn:arn(accounts.workKeyAuthority,'2'),
      deletionSignerArn:arn(accounts.deletionRegister,'3'),
      freshnessSignerArn:arn(accounts.independentFreshness,'4'),
      wrapSpec:'SYMMETRIC_DEFAULT',
      signatureSpec:'ECC_NIST_EDWARDS25519',
      signingAlgorithm:'ED25519_SHA_512',
      signingMessageType:'RAW',
    },
    workEncryptionContext:{
      service:'soullab-writers-beta',
      opaqueWorkDigest:'a'.repeat(64),
      generation:'1',
    },
    witness:{
      sameRegionSingleWriter:true,
      conditionalEpochAdvance:true,
      stronglyConsistentRead:true,
      immutableAuditOutsideRegister:true,
      activeDeleteDenyOnOldBackup:true,
    },
    separation:{
      appHasNoKeyAdmin:true,
      appCannotSignOwnGrants:true,
      issuerAdminsAreSeparated:true,
      issuerKeysPinnedOutOfBand:true,
      challengeReplayTrackedByCustodian:true,
      consentRecheckedAfterExternalGrant:true,
      appCannotResetRevocationLedger:true,
      appCannotReadAuditAdminCredentials:true,
    },
  };
}
const inspect=(p:unknown)=>reviewManagedKmsPlanR27(p);
const deny=(p:unknown,reason:string)=>{
  const result=inspect(p);
  expect(result.status).toBe('REFUSED_TOPOLOGY');
  expect(result.releaseApproved).toBe(false);
  expect(result.provisioningApproved).toBe(false);
  if(result.status==='REFUSED_TOPOLOGY')
    expect(result.reasons).toContain(reason);
};
describe('R27 managed KMS preflight design only — zero live resources',()=>{
  it('cannot ever provision services or admit writers',()=>{
    expect(R27_MANAGED_KMS_PROVISIONING_ENABLED).toBe(false);
    expect(R27_REAL_MEMBER_WRITING_ENABLED).toBe(false);
    const result=inspect(proposal());
    expect(result.status).toBe('PLAN_CONSISTENT_NOT_OPERATIONAL');
    expect(result.releaseApproved).toBe(false);
    expect(result.provisioningApproved).toBe(false);
  });
  it('refuses missing or unreviewed design',()=>{
    deny(null,'missing_reviewable_topology');
    deny({},'wrong_proposal_protocol');
  });
  it('requires four distinct proposed administrators / account identifiers',()=>{
    const p=proposal();
    p.accounts.independentFreshness=p.accounts.deletionRegister;
    deny(p,'no_verified_separate_account_design');
    const q=proposal();
    (q.accounts as unknown as Record<string,unknown>).sharedAdminPassword='unsafe';
    deny(q,'no_verified_separate_account_design');
  });
  it('requires KMS ARNs pinned to the correct account and region',()=>{
    const p=proposal();
    p.keys.grantSignerArn=p.keys.wrapArn;
    deny(p,'key_arn_role_region_or_account_mismatch');
    const q=proposal();
    q.keys.deletionSignerArn=q.keys.deletionSignerArn.replace('333333333333','222222222222');
    deny(q,'key_arn_role_region_or_account_mismatch');
    const r=proposal();
    r.keys.freshnessSignerArn=r.keys.freshnessSignerArn.replace('us-east-1','eu-west-1');
    deny(r,'key_arn_role_region_or_account_mismatch');
  });
  it('does not allow RSA/ECDSA/digest-mode or a changed spec without review',()=>{
    const p=proposal();
    (p.keys as unknown as Record<string,unknown>).signingAlgorithm='RSASSA_PSS_SHA_256';
    deny(p,'unsupported_signing_or_encryption_algorithm');
    const q=proposal();
    q.keys.signingMessageType='DIGEST' as never;
    deny(q,'unsupported_signing_or_encryption_algorithm');
    const r=proposal();
    r.keys.signatureSpec='ECC_NIST_P256' as never;
    deny(r,'unsupported_signing_or_encryption_algorithm');
  });
  it('refuses sensitive identifiers and words as encryption-context values',()=>{
    const p=proposal();
    (p.workEncryptionContext as unknown as Record<string,unknown>).manuscriptTitle='A real title';
    deny(p,'potentially_sensitive_kms_encryption_context');
    const q=proposal();
    q.workEncryptionContext.opaqueWorkDigest='member.name@domain.example';
    deny(q,'potentially_sensitive_kms_encryption_context');
    const r=proposal();
    r.workEncryptionContext.generation='0';
    deny(r,'potentially_sensitive_kms_encryption_context');
  });
  it('refuses eventual reads and nonconditional, shared-controlled revocation',()=>{
    for(const field of Object.keys(proposal().witness)){
      const p=proposal();
      (p.witness as unknown as Record<string,unknown>)[field]=false;
      deny(p,'insufficient_monotonic_deletion_design');
    }
  });
  it('refuses app administrative control or missing second session/consent check',()=>{
    for(const field of Object.keys(proposal().separation)){
      const p=proposal();
      (p.separation as unknown as Record<string,unknown>)[field]=false;
      deny(p,'administrative_or_consent_race_boundary_missing');
    }
  });
  it('requires exact operation and signer spec keys without extra hidden policy fields',()=>{
    const p=proposal();
    (p.keys as unknown as Record<string,unknown>).allowAll='kms:*';
    deny(p,'incomplete_kms_key_design');
    const q=proposal();
    delete (q.keys as unknown as Record<string,unknown>).signingMessageType;
    deny(q,'incomplete_kms_key_design');
  });
  it('never converts a complete *description* into proof of real independence',()=>{
    const x=inspect(proposal());
    expect(x.releaseApproved).toBe(false);
    expect(x.provisioningApproved).toBe(false);
    expect(x).not.toHaveProperty('operationalKmsConnected');
    expect(x).not.toHaveProperty('acceptedMemberCount');
    if(x.status==='PLAN_CONSISTENT_NOT_OPERATIONAL')
      expect(x.approvalRequirements).toContain(
        'founder_explicit_provisioning_and_later_distinct_deployment_go');
  });
});
