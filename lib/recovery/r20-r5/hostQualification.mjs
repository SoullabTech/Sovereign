/**
 * R20-R5 — signer-host suitability negative filter (read-only, no I/O).
 *
 * Each statement is only a claim. Passing this structural filter NEVER
 * verifies provider ownership, hardware identity, root-key isolation or
 * physical independence. Real witness and signer deployment require a
 * separately authenticated Class A custody record.
 *
 * Does not access hosting accounts, SSH, Tailscale, vault, backups or keys.
 */
const DIGEST = /^[0-9a-f]{64}$/;
const HOST_ID = /^[a-zA-Z0-9._:-]{3,100}$/;
const PURPOSES = new Set([
  'dedicated_signer', 'database_primary', 'database_standby',
  'backup_storage', 'app_runtime', 'developer_workstation',
  'backup_replica', 'recovery_workstation',
]);
const EXPECTED_EVIDENCE = [
  'provider_control', 'ssh_host_identity', 'physical_failure_domain',
  'isolated_administration', 'nonexportable_key_custody',
  'append_only_high_water', 'separate_trust_anchor',
  'authenticated_transport', 'disaster_recovery_rehearsal',
];
const refused = () => ({
  verdict: 'REFUSED',
  productionSignerCertified: false,
  productionSignerDeploymentAuthorized: false,
  proofIsIndependent: false,
});
export function assessR20SignerHost({ candidate, environment }={}) {
  const reasons = new Set();
  const mark = code => reasons.add(code);
  if (!candidate || typeof candidate !== 'object' ||
      Array.isArray(candidate) ||
      !environment || typeof environment !== 'object' ||
      Array.isArray(environment)) {
    return {...refused(), reasons: ['missing_custody_topology']};
  }
  if (!HOST_ID.test(candidate.hostId || '') ||
      typeof candidate.online !== 'boolean' ||
      !Array.isArray(candidate.roles) ||
      candidate.roles.length === 0 ||
      !candidate.roles.every(role => PURPOSES.has(role))) {
    mark('host_identity_or_roles_unverified');
  }
  if (candidate.online !== true) mark('host_unreachable');
  const incompatible = [
    'database_primary', 'database_standby', 'backup_storage',
    'app_runtime', 'backup_replica', 'recovery_workstation',
    'developer_workstation',
  ];
  if (!Array.isArray(candidate.roles) ||
      candidate.roles.includes('dedicated_signer') !== true ||
      candidate.roles.some(r => incompatible.includes(r))) {
    mark('signer_conflicts_with_database_backup_or_workstation_role');
  }

  const requiredDomains = [
    'hostId', 'storageDomain', 'snapshotDomain', 'credentialDomain',
    'signingAdminDomain',
  ];
  if (!requiredDomains.every(k =>
      typeof candidate[k] === 'string' &&
      HOST_ID.test(candidate[k])) ||
      !['hostId','databaseDomain','backupDomain',
        'recoverySnapshotDomain','runtimeAdminDomain'].every(k =>
          typeof environment[k] === 'string' &&
          HOST_ID.test(environment[k]))) {
    mark('failure_domain_inventory_incomplete');
  } else {
    const shared = [
      candidate.hostId === environment.hostId,
      candidate.storageDomain === environment.databaseDomain,
      candidate.storageDomain === environment.backupDomain,
      candidate.snapshotDomain === environment.recoverySnapshotDomain,
      candidate.credentialDomain === environment.runtimeAdminDomain,
      candidate.signingAdminDomain === environment.runtimeAdminDomain,
    ];
    if (shared.some(Boolean)) {
      mark('shared_data_or_administration_failure_domain');
    }
  }

  if (candidate.productionMemberDataPresent !== false ||
      candidate.productionBackupOrReplicaPresent !== false) {
    mark('signer_host_holds_protected_application_data');
  }
  if (candidate.localKeyExportAllowed !== false ||
      candidate.usesRecoveryDriveKey !== false) {
    mark('signer_key_custody_unacceptable');
  }
  if (candidate.publicSigningEndpoint !== false ||
      candidate.mutualTransportAuthenticationProven !== true ||
      candidate.serviceIdentityPinned !== true) {
    mark('peer_identity_or_transport_not_proven');
  }
  if (candidate.highWaterOutsideRestorableHost !== true ||
      candidate.highWaterRollbackDenied !== true ||
      candidate.signerLossRecoveryWitnessed !== true ||
      candidate.keyRotationWitnessed !== true) {
    mark('monotonic_witness_or_recovery_unverified');
  }

  const receipts = candidate.receipts;
  if (!receipts || typeof receipts !== 'object' ||
      Array.isArray(receipts) ||
      Object.keys(receipts).length !== EXPECTED_EVIDENCE.length ||
      !EXPECTED_EVIDENCE.every(category =>
        DIGEST.test(receipts[category] || ''))) {
    mark('complete_signed_custody_evidence_missing');
  }

  const accepted = reasons.size === 0;
  return Object.freeze({
    verdict: accepted ? 'DOCUMENT_REVIEW_ELIGIBLE_ONLY' : 'REFUSED',
    reasons: [...reasons].sort(),
    productionSignerCertified: false,
    productionSignerDeploymentAuthorized: false,
    proofIsIndependent: false,
    attestationSource: 'UNVERIFIED_CALLER_STATEMENTS',
    // A signed SHA in a manifest cannot prove that provider/host reality
    // actually matches it. Review needs direct trust-anchored evidence.
    requiresExternalPhysicalEvidence: true,
  });
}
