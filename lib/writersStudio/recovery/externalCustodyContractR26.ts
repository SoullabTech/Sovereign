/**
 * R26 — review-only external key and deletion-freshness admission contract.
 *
 * A signature does not prove that its operator is independent, nor does a
 * signed generation prove nonrollbackable storage. Production MUST supply
 * independently administered pinned public keys, a fresh server-generated
 * challenge, and a separately operated current high-water service.
 *
 * No key/KMS provider is installed. No route, migration or real-writer
 * activation is connected to this module.
 */
import { createHash, verify, type KeyObject } from 'node:crypto';
import {
  canonicalDeletionPayload, requireCurrentRestoreAuthorization,
  type SignedDeletionHighwaterV1, type IndependentGenerationWitness,
} from './deletionBarrierV1';
import { WorkRecoveryRefusal, type WorkEncryptionKey } from './workEnvelopeV1';
import type { TrustedWriterCustodyR23 } from './heldVaultHistoryR23';

export const R26_REAL_MEMBER_KEY_CUSTODY_ENABLED = false as const;
const LEASE = 'soullab.ws.external-work-key-lease.r26' as const;
const FRESH = 'soullab.ws.independent-highwater-witness.r26' as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const SHA = /^[0-9a-f]{64}$/;
const CHALLENGE = /^[0-9a-f]{64}$/;
const PURPOSES = new Set(['append', 'read']);
const MAX_LEASE_MS = 120000;

export type R26Scope = Readonly<{
  memberId: string; workId: string; generation: number;
  keyId: string; purpose: 'append' | 'read';
}>;
export type R26Lease = R26Scope & Readonly<{
  protocol: typeof LEASE; challenge: string;
  issuedAtMs: number; expiresAtMs: number;
  keySha256: string; checkpointSha256: string;
}>;
export type R26Freshness = Readonly<{
  protocol: typeof FRESH; memberId: string; workId: string;
  keyId: string; challenge: string; minimumGeneration: number;
  checkpointSha256: string; issuedAtMs: number; expiresAtMs: number;
}>;
export type R26Signed<T> = Readonly<{ statement: T; signature: string }>;
export type R26TrustRoots = Readonly<{
  // Must be provisioned OUTSIDE app/DB/vault/backup ownership at runtime.
  keyCustodian: KeyObject; deletionAuthority: KeyObject;
  independentFreshness: KeyObject;
}>;
export type R26VerifiedInput = Readonly<{
  scope: R26Scope; serverChallenge: string;
  key: WorkEncryptionKey;
  lease: R26Signed<R26Lease>;
  freshness: R26Signed<R26Freshness>;
  deletion: SignedDeletionHighwaterV1;
  roots: R26TrustRoots;
  nowMs: number; // supplied by trusted server-side clock, never request body
}>;

function refuse(code: string): never { throw new WorkRecoveryRefusal(code); }
function isUuid(v: unknown): v is string {
  return typeof v === 'string' && UUID.test(v);
}
function checkShape(value: unknown, expected: readonly string[]): void {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      Object.keys(value).sort().join('|') !== [...expected].sort().join('|'))
    refuse('r26_unrecognized_attestation_shape');
}
function validateScope(scope: R26Scope): void {
  checkShape(scope, ['memberId','workId','generation','keyId','purpose']);
  if (!isUuid(scope.memberId) || !isUuid(scope.workId) ||
      !isUuid(scope.keyId) || !Number.isSafeInteger(scope.generation) ||
      scope.generation < 1 || !PURPOSES.has(scope.purpose))
    refuse('r26_invalid_custody_scope');
}
function checkTime(issued: number, expires: number, now: number): void {
  if (!Number.isSafeInteger(now) || now <= 0 ||
      !Number.isSafeInteger(issued) || !Number.isSafeInteger(expires) ||
      issued > now + 5000 || issued < now - MAX_LEASE_MS ||
      expires <= now || expires <= issued ||
      expires - issued > MAX_LEASE_MS)
    refuse('r26_stale_or_invalid_external_attestation');
}
function checkIdentifiers(memberId: unknown, workId: unknown, keyId: unknown,
  challenge: unknown, digest: unknown): void {
  if (!isUuid(memberId) || !isUuid(workId) || !isUuid(keyId) ||
      typeof challenge !== 'string' || !CHALLENGE.test(challenge) ||
      typeof digest !== 'string' || !SHA.test(digest))
    refuse('r26_invalid_attestation_identity');
}

/** Stable, domain-separated Ed25519 message for an independent key operator. */
export function canonicalKeyLeaseR26(s: R26Lease): Buffer {
  checkShape(s, ['protocol','memberId','workId','generation','keyId',
    'purpose','challenge','issuedAtMs','expiresAtMs','keySha256','checkpointSha256']);
  if (s.protocol !== LEASE) refuse('r26_invalid_lease_protocol');
  validateScope({memberId:s.memberId,workId:s.workId,generation:s.generation,
    keyId:s.keyId,purpose:s.purpose});
  checkIdentifiers(s.memberId,s.workId,s.keyId,s.challenge,s.checkpointSha256);
  if (typeof s.keySha256 !== 'string' || !SHA.test(s.keySha256))
    refuse('r26_invalid_key_digest');
  if (!Number.isSafeInteger(s.issuedAtMs) || !Number.isSafeInteger(s.expiresAtMs))
    refuse('r26_invalid_attestation_time');
  return Buffer.from(JSON.stringify([LEASE,s.memberId,s.workId,s.generation,
    s.keyId,s.purpose,s.challenge,s.issuedAtMs,s.expiresAtMs,
    s.keySha256,s.checkpointSha256]),'utf8');
}
/** Distinct signature from a current minimum-generation/antirollback operator. */
export function canonicalFreshnessR26(s: R26Freshness): Buffer {
  checkShape(s, ['protocol','memberId','workId','keyId','challenge',
    'minimumGeneration','checkpointSha256','issuedAtMs','expiresAtMs']);
  if (s.protocol !== FRESH) refuse('r26_invalid_freshness_protocol');
  checkIdentifiers(s.memberId,s.workId,s.keyId,s.challenge,s.checkpointSha256);
  if (!Number.isSafeInteger(s.minimumGeneration) || s.minimumGeneration < 1 ||
      !Number.isSafeInteger(s.issuedAtMs) || !Number.isSafeInteger(s.expiresAtMs))
    refuse('r26_invalid_freshness_generation');
  return Buffer.from(JSON.stringify([FRESH,s.memberId,s.workId,s.keyId,
    s.challenge,s.minimumGeneration,s.checkpointSha256,
    s.issuedAtMs,s.expiresAtMs]),'utf8');
}
function checkedEd25519(key: KeyObject | null | undefined): Buffer {
  if (!key || key.type !== 'public' || key.asymmetricKeyType !== 'ed25519')
    refuse('r26_missing_trusted_public_key');
  try { return key.export({format:'der',type:'spki'}) as Buffer; }
  catch { return refuse('r26_invalid_trusted_public_key'); }
}
function distinctRoots(roots: R26TrustRoots): void {
  if (!roots) refuse('r26_trust_roots_unavailable');
  const bytes=[roots.keyCustodian,roots.deletionAuthority,roots.independentFreshness]
    .map(checkedEd25519).map(b=>b.toString('hex'));
  if (new Set(bytes).size !== 3) refuse('r26_collapsed_trust_signers');
}
function checkSignature<T>(signed: R26Signed<T>, bytes: Buffer, root: KeyObject): void {
  const sig=signed?.signature;
  if (typeof sig !== 'string' || !/^[A-Za-z0-9+/]{86}==$/.test(sig))
    refuse('r26_invalid_attestation_signature');
  const raw=Buffer.from(sig,'base64');
  if(raw.length!==64 || raw.toString('base64')!==sig)
    refuse('r26_invalid_attestation_signature');
  try { if(!verify(null,bytes,root,raw)) refuse('r26_signature_refused'); }
  catch(e) { if(e instanceof WorkRecoveryRefusal) throw e;
    refuse('r26_signature_refused'); }
}

/**
 * Testable release design, not a live key-service adapter.
 * Return only a trust bundle acceptable to existing R23 held history.
 * A signed local fake satisfies mathematics, NOT operational independence.
 */
export function verifyExternalCustodyR26(input: R26VerifiedInput): TrustedWriterCustodyR23 {
  if (!input) refuse('r26_missing_attestation');
  validateScope(input.scope);
  distinctRoots(input.roots);
  if (typeof input.serverChallenge !== 'string' ||
      !CHALLENGE.test(input.serverChallenge))
    refuse('r26_missing_server_challenge');
  if (!input.key || input.key.keyId !== input.scope.keyId ||
      !Buffer.isBuffer(input.key.keyBytes) || input.key.keyBytes.length !== 32)
    refuse('r26_invalid_external_work_key');
  if (!input.deletion || !input.deletion.checkpoint)
    refuse('r26_missing_deletion_checkpoint');
  const checkpointSha256=createHash('sha256')
    .update(canonicalDeletionPayload(input.deletion.checkpoint)).digest('hex');
  const keySha256=createHash('sha256').update(input.key.keyBytes).digest('hex');
  const lease=input.lease?.statement;
  const fresh=input.freshness?.statement;
  if (!lease || !fresh) refuse('r26_missing_signed_grant');
  const leaseBytes=canonicalKeyLeaseR26(lease);
  const freshBytes=canonicalFreshnessR26(fresh);
  checkTime(lease.issuedAtMs,lease.expiresAtMs,input.nowMs);
  checkTime(fresh.issuedAtMs,fresh.expiresAtMs,input.nowMs);
  if (lease.memberId!==input.scope.memberId ||
      lease.workId!==input.scope.workId ||
      lease.keyId!==input.scope.keyId ||
      lease.generation!==input.scope.generation ||
      lease.purpose!==input.scope.purpose ||
      lease.challenge!==input.serverChallenge ||
      lease.keySha256!==keySha256 ||
      lease.checkpointSha256!==checkpointSha256)
    refuse('r26_key_lease_scope_mismatch');
  if (fresh.memberId!==input.scope.memberId ||
      fresh.workId!==input.scope.workId ||
      fresh.keyId!==input.scope.keyId ||
      fresh.challenge!==input.serverChallenge ||
      fresh.checkpointSha256!==checkpointSha256)
    refuse('r26_freshness_scope_mismatch');
  checkSignature(input.lease,leaseBytes,input.roots.keyCustodian);
  checkSignature(input.freshness,freshBytes,input.roots.independentFreshness);
  const independent: IndependentGenerationWitness={
    minimumGeneration:fresh.minimumGeneration,
  };
  // This independently verified minimum is applied BEFORE any decrypt/restore.
  requireCurrentRestoreAuthorization({
    request:{workId:input.scope.workId,keyId:input.scope.keyId,
      snapshotGeneration:input.scope.generation},
    signed:input.deletion,trustedSigner:input.roots.deletionAuthority,independent,
  });
  return {key:input.key,signedDeletion:input.deletion,
    trustedSigner:input.roots.deletionAuthority,independent};
}
