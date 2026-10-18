'use strict';
/** Review-only offline validation. NO AWS clients, credentials, API or network. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../../..');
const repoPath='infra/aws/writers-beta-r1r-review';
const read=(name)=>fs.readFileSync(path.join(root,repoPath,name),'utf8');
const json=(name)=>JSON.parse(read(name));
const cfn=json('kms-review-only.template.json');
const trust=json('roles-anywhere-trust.review-only.json');
const runtime=json('app-key-usage.review-only.json');
const decisions=json('release-decisions.review-only.json');
const docs=read('README.md');
const key=cfn.Resources.WriterBetaSymmetricKmsKey;
const alias=cfn.Resources.WriterBetaKeyAlias;
const policy=key.Properties.KeyPolicy.Statement;
const k=(sid)=>policy.find(p=>p.Sid===sid);

test('R1R source ancestry pinned to qualified clean R1Q key seam',()=>{
 assert.equal(cfn.Metadata.ParentSource,'4e58c2b233165c3915d13ae9fa26e93f60ff3974');
 assert.equal(decisions.sourceCommit,cfn.Metadata.ParentSource);
 assert.equal(decisions.decision,'HOLD_NO_AWS_MUTATION_NO_BETA_RELEASE');
 assert.equal(decisions.provisioningAllowed,false);
 assert.equal(decisions.founderProvisioningApproved,false);
});
test('default CloudFormation proposal creates NO resources without distinct explicit approval',()=>{
 assert.equal(cfn.Parameters.ProvisioningApproval.Default,'REVIEW_ONLY_NO_RESOURCES');
 assert.deepEqual(cfn.Parameters.ProvisioningApproval.AllowedValues,
  ['REVIEW_ONLY_NO_RESOURCES','FOUNDER_APPROVED_PROVISIONING']);
 assert.deepEqual(Object.keys(cfn.Resources).sort(),['WriterBetaKeyAlias','WriterBetaSymmetricKmsKey']);
 assert.equal(cfn.Resources.WriterBetaSymmetricKmsKey.Condition,'ProvisioningExplicitlyApproved');
 assert.equal(cfn.Resources.WriterBetaKeyAlias.Condition,'ProvisioningExplicitlyApproved');
 assert.deepEqual(cfn.Conditions.ProvisioningExplicitlyApproved,
  {'Fn::Equals':[{'Ref':'ProvisioningApproval'},'FOUNDER_APPROVED_PROVISIONING']});
 assert.equal(cfn.Outputs.WriterKeyArn.Value['Fn::If'][2],'NOT_PROVISIONED');
});
test('proposed new key symmetric (never R20 Ed25519), no key lockout bypass or stack-deletion of data',()=>{
 const v=key.Properties;
 assert.equal(key.Type,'AWS::KMS::Key');
 assert.equal(v.KeySpec,'SYMMETRIC_DEFAULT');
 assert.equal(v.KeyUsage,'ENCRYPT_DECRYPT');
 assert.equal(v.Origin,'AWS_KMS');
 assert.equal(v.MultiRegion,false);
 assert.equal(v.EnableKeyRotation,true);
 assert.equal(v.RotationPeriodInDays,365);
 assert.equal(v.BypassPolicyLockoutSafetyCheck,false);
 assert.equal(key.DeletionPolicy,'Retain');
 assert.equal(key.UpdateReplacePolicy,'Retain');
 assert.equal(v.PendingWindowInDays,30);
 assert.equal(alias.Properties.AliasName,'alias/soullab/writers-beta');
 assert.equal(alias.Type,'AWS::KMS::Alias');
 assert.equal(alias.Properties.TargetKeyId.Ref,'WriterBetaSymmetricKmsKey');
});
test('four explicit distinct roles required, with no actual account or runtime secrets in template',()=>{
 const p=cfn.Parameters;
 const roles=['ProvisionerRoleArn','KeyAdministratorRoleArn','RecoveryRoleArn','ApplicationRoleArn'];
 for(const r of roles){
  assert.equal(p[r].Type,'String');
  assert.ok(!Object.hasOwn(p[r],'Default'));
  assert.match(p[r].AllowedPattern,/arn:aws:iam/);
 }
 assert.equal(cfn.Rules.DistinctRuntimeAndHumanCustody.Assertions.length,6);
 assert.equal(Object.keys(cfn.Parameters).length,5);
 assert.doesNotMatch(JSON.stringify(cfn),/arn:aws:iam::\d{12}:root/);
 assert.doesNotMatch(JSON.stringify(cfn),/aws_access_key_id|aws_secret_access_key|BEGIN PRIVATE KEY/);
});
test('app gets only exact Work-context cryptographic actions, distinct from DescribeKey',()=>{
 const stage=k('AllowWriterAppDataKeyGenerationAndDecryptOnlyForOpaqueWorkContext');
 assert.deepEqual(stage.Principal.AWS,{Ref:'ApplicationRoleArn'});
 assert.deepEqual(stage.Action,['kms:GenerateDataKey','kms:Decrypt']);
 assert.equal(stage.Condition.StringEquals['kms:EncryptionContext:service'],'soullab-writers-beta');
 assert.equal(stage.Condition.Null['kms:EncryptionContext:opaqueWorkDigest'],'false');
 assert.deepEqual(stage.Condition['ForAllValues:StringEquals']['kms:EncryptionContextKeys'],
  ['service','opaqueWorkDigest']);
 const describe=k('AllowWriterAppOnlyDescribeThisKey');
 assert.deepEqual(describe.Action,['kms:DescribeKey']);
 assert.deepEqual(describe.Principal.AWS,{Ref:'ApplicationRoleArn'});
 for(const s of policy){
  const actions=Array.isArray(s.Action)?s.Action:[s.Action];
  assert.ok(actions.every(x=>x!=='kms:*'&&!x.endsWith('*')),
    'review-only KMS key policy may not include action wildcards');
 }
});
test('nonapp admin and recovery identities have NO direct cryptographic access',()=>{
 for(const sid of [
  'AllowCloudFormationProvisionerToManagePolicyWithoutDataUse',
  'AllowIndependentKeyAdminOperationsWithoutCryptographicAccess',
  'AllowDistinctBreakGlassPolicyRecoveryWithoutDataUse',
 ]){
  const s=k(sid);
  assert.ok(s);
  assert.ok(!s.Action.some(x=>/kms:(Decrypt|Encrypt|GenerateDataKey|ReEncrypt|ScheduleKeyDeletion)/.test(x)));
 }
 const admin=k('AllowIndependentKeyAdminOperationsWithoutCryptographicAccess');
 assert.ok(!admin.Action.includes('kms:PutKeyPolicy'));
 const provisioner=k('AllowCloudFormationProvisionerToManagePolicyWithoutDataUse');
 assert.ok(provisioner.Action.includes('kms:PutKeyPolicy'),'stack actor must avoid KMS policy lockout');
});
test('IAM runtime identity policy grants only one explicit approved NEW key ARN, never wildcard or admin',()=>{
 assert.equal(runtime._REVIEW_ONLY_NOT_AN_IAM_POLICY?.length>10,true);
 assert.equal(runtime.Statement.length,2);
 assert.deepEqual(runtime.Statement[0].Action,['kms:GenerateDataKey','kms:Decrypt']);
 assert.equal(runtime.Statement[0].Resource,'${APPROVED_NEW_WRITER_SYMMETRIC_KMS_KEY_ARN}');
 assert.equal(runtime.Statement[0].Condition.StringEquals['kms:EncryptionContext:service'],'soullab-writers-beta');
 assert.equal(runtime.Statement[0].Condition.Null['kms:EncryptionContext:opaqueWorkDigest'],'false');
 assert.ok(runtime.Statement.every(x=>x.Effect==='Allow'&&x.Resource!=='*'));
 assert.ok(!runtime.Statement.some(x=>JSON.stringify(x).includes('kms:PutKeyPolicy')));
 assert.deepEqual(runtime.Statement[1].Action,'kms:DescribeKey');
});
test('on-prem IAM Roles Anywhere trust is scoped to an explicit trust anchor AND one certificate identity',()=>{
 assert.equal(trust._REVIEW_ONLY_NOT_AN_IAM_TRUST_POLICY?.length>10,true);
 const s=trust.Statement[0];
 assert.deepEqual(s.Principal,{Service:'rolesanywhere.amazonaws.com'});
 assert.deepEqual(s.Action,['sts:AssumeRole','sts:TagSession','sts:SetSourceIdentity']);
 assert.equal(s.Condition.ArnEquals['aws:SourceArn'],'${APPROVED_AINOS_ROLES_ANYWHERE_TRUST_ANCHOR_ARN}');
 assert.equal(s.Condition.StringEquals['aws:SourceAccount'],'${VERIFIED_AINOS_ACCOUNT_ID}');
 assert.equal(s.Condition.StringEquals['aws:PrincipalTag/x509Subject/CN'],'${APPROVED_MINISFORUM_RUNTIME_CERT_CN}');
 assert.equal(s.Condition.StringEquals['aws:PrincipalTag/x509Issuer/CN'],'${APPROVED_CA_ISSUER_CN}');
 assert.ok(!JSON.stringify(trust).includes('arn:aws:iam::*'));
});
test('no provisioning or release approval is invented; cost/audit/restore remain independent gates',()=>{
 for(const k of ['separateKmsAdminRoleApproved','minisforumCertificateIssuerSelected',
  'certificateLifecycleAndRevocationQualified','cloudTrailDurableAuditQualified',
  'writerBetaCostBudgetApproved','encryptedOffsiteRestoreProven','actualKmsApiUsed',
  'realMemberWriterRouteReleased','sourceGlobalTypecheckPassing']){
  assert.equal(decisions[k],false,k);
 }
 assert.equal(decisions.verifiedRolesAnywhereTrustAnchors,0);
 assert.equal(decisions.verifiedRolesAnywhereProfiles,0);
 assert.equal(decisions.sourceInheritedTypeErrors,434);
 assert.equal(decisions.outstandingShippingGates,9);
 assert.match(docs,/Minisforum Linux/);
 assert.match(docs,/CloudTrail/);
 assert.match(docs,/IAM Roles Anywhere/);
 assert.match(docs,/\$30/);
 assert.match(docs,/without requiring all future sovereign per-Work/);
});
test('no real credentials, customer account IDs, X509 certificates or destructive launch scripts in bundle',()=>{
 for(const filename of ['kms-review-only.template.json','app-key-usage.review-only.json',
   'roles-anywhere-trust.review-only.json','release-decisions.review-only.json','README.md']){
  const text=read(filename);
  assert.doesNotMatch(text,/AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|-----BEGIN (?:RSA )?PRIVATE KEY-----/);
  assert.doesNotMatch(text,/85172564\d{4}/);
  assert.doesNotMatch(text,/aws\s+(cloudformation\s+deploy|kms\s+create-key|iam\s+create-role)/i);
 }
});
