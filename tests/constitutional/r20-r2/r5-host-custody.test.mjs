import test from 'node:test';
import assert from 'node:assert/strict';
import { assessR20SignerHost as check } from
  '../../../lib/recovery/r20-r5/hostQualification.mjs';

const KEYS = [
  'provider_control','ssh_host_identity','physical_failure_domain',
  'isolated_administration','nonexportable_key_custody',
  'append_only_high_water','separate_trust_anchor',
  'authenticated_transport','disaster_recovery_rehearsal',
];
const base = () => ({
  candidate: {
    hostId: 'fictional-independent-signer',
    online: true,
    roles: ['dedicated_signer'],
    storageDomain: 'signer-encrypted-volume',
    snapshotDomain: 'signer-immutable-zone',
    credentialDomain: 'signer-credential-identity',
    signingAdminDomain: 'signer-privileged-operator',
    productionMemberDataPresent: false,
    productionBackupOrReplicaPresent: false,
    localKeyExportAllowed: false,
    usesRecoveryDriveKey: false,
    publicSigningEndpoint: false,
    mutualTransportAuthenticationProven: true,
    serviceIdentityPinned: true,
    highWaterOutsideRestorableHost: true,
    highWaterRollbackDenied: true,
    signerLossRecoveryWitnessed: true,
    keyRotationWitnessed: true,
    receipts: Object.fromEntries(KEYS.map((k,i) =>
      [k, String(i+1).padStart(64,'0')]),
    ),
  },
  environment: {
    hostId: 'fictional-live-database-server',
    databaseDomain: 'fictional-database-volume',
    backupDomain: 'fictional-nas-backup',
    recoverySnapshotDomain: 'fictional-recovery-snapshots',
    runtimeAdminDomain: 'fictional-app-service-admin',
  },
});
const refuses = (name, mutation, required) => test(name, () => {
  const v=base(); mutation(v);
  const out=check(v);
  assert.equal(out.verdict,'REFUSED');
  assert(out.reasons.includes(required),JSON.stringify(out.reasons));
  assert.equal(out.productionSignerCertified,false);
  assert.equal(out.productionSignerDeploymentAuthorized,false);
});
test('even a complete plausible host certificate is not physical proof or release authority',()=>{
  const out=check(base());
  assert.equal(out.verdict,'DOCUMENT_REVIEW_ELIGIBLE_ONLY');
  assert.equal(out.attestationSource,'UNVERIFIED_CALLER_STATEMENTS');
  assert.equal(out.proofIsIndependent,false);
  assert.equal(out.requiresExternalPhysicalEvidence,true);
  assert.equal(out.productionSignerCertified,false);
  assert.equal(out.productionSignerDeploymentAuthorized,false);
});

refuses('existing standby role makes proposed signing host ineligible even before connection',
  v=>{v.candidate.online=false;v.candidate.roles=['database_standby'];},
  'signer_conflicts_with_database_backup_or_workstation_role');
refuses('making standby accessible does NOT qualify it as independent',
  v=>{v.candidate.roles=['dedicated_signer','database_standby'];},
  'signer_conflicts_with_database_backup_or_workstation_role');
refuses('offline hypothetical signer refused',
  v=>{v.candidate.online=false;},'host_unreachable');
refuses('shared PostgreSQL primary host refused',
  v=>{v.candidate.hostId=v.environment.hostId;},
  'shared_data_or_administration_failure_domain');
refuses('shared backup storage refused',
  v=>{v.candidate.storageDomain=v.environment.backupDomain;},
  'shared_data_or_administration_failure_domain');
refuses('shared database volume refused',
  v=>{v.candidate.storageDomain=v.environment.databaseDomain;},
  'shared_data_or_administration_failure_domain');
refuses('same snapshot/restore authority refused',
  v=>{v.candidate.snapshotDomain=v.environment.recoverySnapshotDomain;},
  'shared_data_or_administration_failure_domain');
refuses('same production service credentials refused',
  v=>{v.candidate.credentialDomain=v.environment.runtimeAdminDomain;},
  'shared_data_or_administration_failure_domain');
refuses('same production administration role refused',
  v=>{v.candidate.signingAdminDomain=v.environment.runtimeAdminDomain;},
  'shared_data_or_administration_failure_domain');
refuses('signer also running the application refused',
  v=>{v.candidate.roles=['dedicated_signer','app_runtime'];},
  'signer_conflicts_with_database_backup_or_workstation_role');
refuses('signer storing member writing refused',
  v=>{v.candidate.productionMemberDataPresent=true;},
  'signer_host_holds_protected_application_data');
refuses('signer housing disaster-recovery replicas refused',
  v=>{v.candidate.productionBackupOrReplicaPresent=true;},
  'signer_host_holds_protected_application_data');
refuses('exportable private signer key refused',
  v=>{v.candidate.localKeyExportAllowed=true;},
  'signer_key_custody_unacceptable');
refuses('reusing encrypted LaCie GPG recovery key refused',
  v=>{v.candidate.usesRecoveryDriveKey=true;},
  'signer_key_custody_unacceptable');
refuses('public signing endpoint refused',
  v=>{v.candidate.publicSigningEndpoint=true;},
  'peer_identity_or_transport_not_proven');
refuses('transport without mutual authentication refused',
  v=>{v.candidate.mutualTransportAuthenticationProven=false;},
  'peer_identity_or_transport_not_proven');
refuses('service identity not pinned refused',
  v=>{v.candidate.serviceIdentityPinned=false;},
  'peer_identity_or_transport_not_proven');
refuses('high-water stored only in restorable signer image refused',
  v=>{v.candidate.highWaterOutsideRestorableHost=false;},
  'monotonic_witness_or_recovery_unverified');
refuses('high-water can be rolled back refused',
  v=>{v.candidate.highWaterRollbackDenied=false;},
  'monotonic_witness_or_recovery_unverified');
refuses('signer-loss recovery not witnessed refused',
  v=>{v.candidate.signerLossRecoveryWitnessed=false;},
  'monotonic_witness_or_recovery_unverified');
refuses('key rotation not independently demonstrated refused',
  v=>{v.candidate.keyRotationWitnessed=false;},
  'monotonic_witness_or_recovery_unverified');
refuses('provider/physical evidence digest missing refused',
  v=>{delete v.candidate.receipts.provider_control;},
  'complete_signed_custody_evidence_missing');
refuses('invalid evidence digest refused',
  v=>{v.candidate.receipts.ssh_host_identity='unverified';},
  'complete_signed_custody_evidence_missing');
refuses('unknown host role refused',
  v=>{v.candidate.roles=['unknown-private-vps-role'];},
  'host_identity_or_roles_unverified');
test('absence of any candidate is refusal rather than assumed independence',()=>{
  const out=check({});
  assert.equal(out.verdict,'REFUSED');
  assert(out.reasons.includes('missing_custody_topology'));
});
