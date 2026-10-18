/**
 * R70.19H -- physical R1W GPGV-signed FIVE-scope fixture plus an independently
 * signed FICTIONAL Work/key census and current deletion highwater.
 *
 * READ-ONLY, DEFAULT OFF. No private GPG key, PostgreSQL instance, network or
 * restore is opened here. The only callback is an isolated fictional witness.
 * Not a production antirollback ledger or proof of full Work census.
 *
 * Crucially R1W's five-volume manifest is NOT R70.19C's manifest. This bridge
 * binds the REAL, public-verifiable R1W fixture's two ciphertext hashes and
 * manifest hash to a NEW separate signed fictional census, then uses R11
 * current deletion authorization before the caller's fictional callback.
 * Never invents an R70.19C sourceDatabaseVaultTransactionIsolated flag.
 */
import { createHash, verify, type KeyObject } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { lstatSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  requireCurrentRestoreAuthorization,
  type SignedDeletionHighwaterV1,
} from './deletionBarrierV1';

export const R7019H_PRODUCTION_RESTORE_BRIDGE_ENABLED = false as const;
export const R7019H_CURRENT_EXTERNAL_ERASURE_AUTHORITY_CERTIFIED = false as const;
export const R7019H_ALL_PRODUCTION_WORKS_CENSUSED = false as const;
export const R7019H_PROTOCOL =
  'soullab.ws.r7019h.fictional.r1w-signed-generation-work-census.v1' as const;

const ROOT = '/Volumes/T7 Shield/ws-beta-r1w-exact-tamper-20261018';
const GENERATION = '20261018T062721Z-40d252ba';
const TRUST_ROOT = '/Volumes/T7 Shield/ws-beta-r1w-independent-signed-recovery-review-20261018';
const TRUSTED_GPG_SIGNER = '35B4553EFB55A54ACF387D6EC15EA2942448481F';
const R1W_SOURCE_HEAD = '1e9eee64306197a0f52e7b547ee3bdd279d786fa';
const VOLUMES = ['media', 'vault', 'voice-notes', 'workbench', 'audit-logs'] as const;
const SHA = /^[a-f0-9]{64}$/;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const sha = (data: Buffer | string) => createHash('sha256').update(data).digest('hex');
const authorizedPhysical = new WeakSet<object>();
const approvedPhysical = new WeakMap<object, Readonly<R7019HPhysicalPoint>>();
const alive = (x: unknown): x is number =>
  typeof x === 'number' && Number.isSafeInteger(x) && x >= 1;

export class R7019HRefusal extends Error {
  constructor(readonly code: string) {
    super('r7019h_' + code); this.name = 'R7019HRefusal';
  }
}
const stop = (code: string): never => { throw new R7019HRefusal(code); };
type Work = Readonly<{ memberId: string; workId: string; keyId: string }>;

export type R7019HPhysicalPoint = Readonly<{
  generation: string;
  verifiedSignerFingerprint: string;
  r1wSignedManifestSha256: string;
  postgresCipherSha256: string;
  fileCipherSha256: string;
  fileScopes: readonly string[];
}>;

export type R7019HCensus = Readonly<{
  protocol: typeof R7019H_PROTOCOL;
  r1wSourceHead: string;
  generation: string;
  snapshotGeneration: number;
  r1wSignerFingerprint: string;
  r1wSignedManifestSha256: string;
  postgresCipherSha256: string;
  fileCipherSha256: string;
  fileScopes: readonly string[];
  works: readonly Work[];
}>;
export type R7019HSignedCensus = Readonly<{
  body: R7019HCensus;
  signature: string;
}>;
export type R7019HCurrentAuthority = Readonly<{
  pinnedCensusSigner: KeyObject;
  pinnedCurrentDeletionSigner: KeyObject;
  signedCurrentDeletion: SignedDeletionHighwaterV1;
  externalMinimumSnapshotGeneration: number;
  externalMinimumDeletionGeneration: number;
  independentlyExpectedOwnedWorks: readonly Work[];
}>;

function fixtureOnly(): void {
  if (R7019H_PRODUCTION_RESTORE_BRIDGE_ENABLED !== false ||
      process.env.NODE_ENV !== 'test' ||
      process.env.R7019H_ERASURE_FIXTURE !== 'fictional-only')
    stop('fixture_only_no_production_restore');
}
const frozenScopes = (scopes: readonly string[]) =>
  scopes.length === VOLUMES.length &&
  scopes.every((s, i) => s === VOLUMES[i]);

function validateRoster(rows: readonly Work[]): void {
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > 1000)
    stop('work_index_incomplete_or_invalid');
  let previous = '';
  const keys = new Set<string>();
  for (const row of rows) {
    if (!row || !UUID.test(row.memberId) || !UUID.test(row.workId) ||
        !UUID.test(row.keyId) || row.workId <= previous || keys.has(row.keyId))
      stop('invalid_or_unsorted_work_key_index');
    previous = row.workId;
    keys.add(row.keyId);
  }
}
export function canonicalR7019HCensus(body: R7019HCensus): Buffer {
  if (!body || body.protocol !== R7019H_PROTOCOL ||
      body.r1wSourceHead !== R1W_SOURCE_HEAD ||
      body.generation !== GENERATION ||
      !alive(body.snapshotGeneration) ||
      body.r1wSignerFingerprint !== TRUSTED_GPG_SIGNER ||
      !SHA.test(body.r1wSignedManifestSha256) ||
      !SHA.test(body.postgresCipherSha256) || !SHA.test(body.fileCipherSha256) ||
      !Array.isArray(body.fileScopes) || !frozenScopes(body.fileScopes))
    stop('wrong_or_unbound_r1w_generation');
  validateRoster(body.works);
  return Buffer.from(JSON.stringify([
    R7019H_PROTOCOL, body.r1wSourceHead, body.generation,
    body.snapshotGeneration, body.r1wSignerFingerprint,
    body.r1wSignedManifestSha256, body.postgresCipherSha256,
    body.fileCipherSha256, VOLUMES, body.works.map(
      w => [w.memberId, w.workId, w.keyId]),
  ]), 'utf8');
}

function readSafeFixture(p: string, limit = 10 * 1024 * 1024): Buffer {
  const st = lstatSync(p);
  if (!st.isFile() || st.isSymbolicLink() || st.size > limit || st.size < 1)
    stop('missing_or_unsafe_fictional_signed_component');
  return readFileSync(p);
}

/**
 * Only this routine can manufacture an accepted R70.19H physical witness.
 * It calls R1W's REAL GPGV verifier with its pinned, separate public signer
 * and refuses mismatched signatures BEFORE reading any private recovery key.
 * The accepted physical R1W test signer is not operational/offsite trust.
 */
export function verifyR7019HPhysicalR1WFixture(): R7019HPhysicalPoint {
  fixtureOnly();
  const point = path.join(ROOT, 'certified', GENERATION);
  const trustedKeyring = path.join(TRUST_ROOT, 'R1W_FICTIONAL_PUBLIC_SIGNER.gpg');
  const pin = path.join(TRUST_ROOT, 'R1W_EXPECTED_FICTIONAL_SIGNER_FPR.txt');
  const actualPin = readSafeFixture(pin, 256).toString('utf8').trim();
  if (actualPin !== TRUSTED_GPG_SIGNER)
    stop('untrusted_external_signer_pin');
  const python = path.join(process.cwd(), 'scripts/ops/wsBetaR1WSignedGeneration.py');
  if (!python.startsWith('/Volumes/T7 Shield/ws-beta-r70-19h-') ||
      !python.endsWith('scripts/ops/wsBetaR1WSignedGeneration.py'))
    stop('unexpected_fictional_source_checkout');
  let witnessed: Record<string, unknown>;
  try {
    const result = execFileSync('/usr/bin/python3', [
      python, '--verify-fixture', '--certified-generation', point,
      '--trusted-public-keyring', trustedKeyring,
      '--expected-signer-fingerprint', TRUSTED_GPG_SIGNER,
    ], {
      cwd: process.cwd(), timeout: 18000, maxBuffer: 8192,
      env: { PATH: process.env.PATH || '/usr/bin:/bin',
        HOME: process.env.HOME || '/private/tmp',
        WS_R1W_SIGNED_FIXTURE_ONLY: 'fictional-only' },
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    witnessed = JSON.parse(result.toString('utf8')) as Record<string, unknown>;
  } catch { stop('r1w_public_gpgv_signature_not_verified'); }
  if (witnessed.actualManifestSignatureVerified !== true ||
      witnessed.signerFingerprint !== TRUSTED_GPG_SIGNER ||
      witnessed.generation !== GENERATION ||
      witnessed.productionReleaseApproved !== false)
    stop('physical_r1w_certification_scope_not_accepted');
  const manifestBytes = readSafeFixture(path.join(point, 'manifest.json'), 20000);
  let manifest: any;
  try { manifest = JSON.parse(manifestBytes.toString('utf8')); }
  catch { stop('physical_r1w_manifest_invalid'); }
  if (manifest.generation !== GENERATION ||
      !Array.isArray(manifest.fileVolumeNames) ||
      !frozenScopes(manifest.fileVolumeNames) ||
      manifest.productionSnapshotConsistencyProven !== false ||
      manifest.realMemberWriterBetaApproved !== false)
    stop('r1w_manifest_scope_or_release_mismatch');
  const pg = readSafeFixture(path.join(point, 'postgres.pgdump.gpg'));
  const files = readSafeFixture(path.join(point, 'files.tar.gpg'));
  if (sha(pg) !== manifest.postgres?.sha256 ||
      sha(files) !== manifest.fileVault?.sha256)
    stop('encrypted_component_hash_changed_after_gpgv');
  const verified = Object.freeze({
    generation: GENERATION,
    verifiedSignerFingerprint: TRUSTED_GPG_SIGNER,
    r1wSignedManifestSha256: sha(manifestBytes),
    postgresCipherSha256: sha(pg),
    fileCipherSha256: sha(files),
    fileScopes: Object.freeze([...VOLUMES]),
  });
  authorizedPhysical.add(verified);
  approvedPhysical.set(verified, verified);
  return verified;
}

function validateIndependentAuthority(a: R7019HCurrentAuthority): void {
  if (!a || a.pinnedCensusSigner?.asymmetricKeyType !== 'ed25519' ||
      a.pinnedCurrentDeletionSigner?.asymmetricKeyType !== 'ed25519' ||
      !alive(a.externalMinimumSnapshotGeneration) ||
      !alive(a.externalMinimumDeletionGeneration) ||
      !a.signedCurrentDeletion)
    stop('independent_current_authority_absent');
  if (a.pinnedCensusSigner.export({ type: 'spki', format: 'der' }).equals(
      a.pinnedCurrentDeletionSigner.export({ type: 'spki', format: 'der' })))
    stop('separate_current_deletion_signer_required');
  validateRoster(a.independentlyExpectedOwnedWorks);
}

/** All checks finish before *any* fictional recovery callback may be used. */
export function withHeldR7019HSignedR1WAndCurrentDeletion<T>(
  input: {
    physical: R7019HPhysicalPoint;
    census: R7019HSignedCensus;
    independent: R7019HCurrentAuthority;
  },
  fictionalRestore: () => T,
): Readonly<{ result: T; protectedChecksPassed: true; productionReleaseApproved: false }> {
  fixtureOnly();
  const { physical, census, independent } = input || {};
  if (!physical || !authorizedPhysical.has(physical) ||
      approvedPhysical.get(physical) !== physical)
    stop('unverified_physical_gpgv_point');
  validateIndependentAuthority(independent);
  const body = census?.body;
  const bytes = canonicalR7019HCensus(body);
  if (typeof census.signature !== 'string' ||
      !/^[A-Za-z0-9+/]{86}==$/.test(census.signature))
    stop('invalid_work_census_signature');
  const signature = Buffer.from(census.signature, 'base64');
  if (signature.length !== 64 ||
      signature.toString('base64') !== census.signature ||
      !verify(null, bytes, independent.pinnedCensusSigner, signature))
    stop('untrusted_work_census_signature');
  if (body.generation !== physical.generation ||
      body.r1wSignerFingerprint !== physical.verifiedSignerFingerprint ||
      body.r1wSignedManifestSha256 !== physical.r1wSignedManifestSha256 ||
      body.postgresCipherSha256 !== physical.postgresCipherSha256 ||
      body.fileCipherSha256 !== physical.fileCipherSha256 ||
      !frozenScopes(body.fileScopes))
    stop('work_census_not_bound_to_verified_r1w');
  if (body.snapshotGeneration < independent.externalMinimumSnapshotGeneration)
    stop('signed_backup_older_than_independent_snapshot_floor');
  const expected = independent.independentlyExpectedOwnedWorks;
  if (JSON.stringify(body.works) !== JSON.stringify(expected))
    stop('incomplete_or_foreign_work_census');
  if (independent.signedCurrentDeletion.checkpoint.generation !==
      independent.externalMinimumDeletionGeneration)
    stop('stale_or_untrusted_current_deletion_epoch');
  for (const w of body.works) {
    requireCurrentRestoreAuthorization({
      request: {
        workId: w.workId, keyId: w.keyId,
        snapshotGeneration: body.snapshotGeneration,
      },
      signed: independent.signedCurrentDeletion,
      trustedSigner: independent.pinnedCurrentDeletionSigner,
      independent: {
        minimumGeneration: independent.externalMinimumDeletionGeneration,
      },
    });
  }
  if (typeof fictionalRestore !== 'function')
    stop('missing_fictional_restore_callback');
  return Object.freeze({
    result: fictionalRestore(),
    protectedChecksPassed: true as const,
    productionReleaseApproved: false as const,
  });
}
