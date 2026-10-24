/**
 * WS-TIERS-R8 — Class A REVIEW CANDIDATE, NOT A PRODUCTION R20 ADAPTER.
 *
 * External authority mints/seals a STABLE grant ID before any member DB write.
 * A signed short-lived receipt must be bound to verified actor, member,
 * idempotency operation and independently trusted signer/high-water sequence.
 *
 * This module is NOT imported by the live grant routes. Real R20 custody is
 * unprovisioned: lib/writersStudio/pilotR20Authority.ts still FAILS CLOSED.
 * Fixture tests must never be taken as permission to admit real writers.
 */
import { createPublicKey, timingSafeEqual, verify } from 'node:crypto';

export const R8_AUDIENCE = 'soullab.writer-beta.r20.mutation.v1' as const;
export type R8Action = 'issued' | 'accepted' | 'revoked';

export type R8MutationIntent = Readonly<{
  action: R8Action;
  memberId: string;
  actorId: string;
  operationId: string;
  /** Verified member-derived commitment; never a raw member-supplied label. */
  subjectCommitment: string;
  /** The same previously sealed grant for accept and revoke. */
  expectedGrantId?: string;
}>;

export type R8MutationClaims = Readonly<{
  version: 1;
  audience: typeof R8_AUDIENCE;
  issuer: string;
  keyId: string;
  memberId: string;
  actorId: string;
  operationId: string;
  subjectCommitment: string;
  action: R8Action;
  grantId: string;
  sequence: number;
  issuedAtMs: number;
  expiresAtMs: number;
}>;

export type R8MutationReceipt = Readonly<{
  claims: R8MutationClaims;
  signature: string;
}>;

export type R8TrustedSigner = Readonly<{
  issuer: string;
  keyId: string;
  publicKeyPem: string;
  /** Provided by a DIFFERENT, verified latest trust domain, not writer DB. */
  minimumSequence: number;
}>;

export class R8MutationRefused extends Error {
  constructor() {
    super('writer_pilot_r20_mutation_refused');
    this.name = 'R8MutationRefused';
  }
}

const CORE_FIELDS: readonly (keyof R8MutationClaims)[] = [
  'version', 'audience', 'issuer', 'keyId', 'memberId', 'actorId',
  'operationId', 'subjectCommitment', 'action', 'grantId', 'sequence',
  'issuedAtMs', 'expiresAtMs',
];
const BRANDED_VERIFIED = Symbol('R8_SEALED_AND_VERIFIED');
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HEX = /^[a-f0-9]{64}$/;
function exactKeys(value: object, fields: readonly string[]): boolean {
  const keys = Object.keys(value);
  return keys.length === fields.length && keys.every((key) => fields.includes(key));
}
function safeCompare(left: string, right: string): boolean {
  const a = Buffer.from(left, 'utf8');
  const b = Buffer.from(right, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Domain-separated, canonical, versioned signed fields. */
export function r8MutationBytes(claims: R8MutationClaims): Buffer {
  return Buffer.from(
    'SOULLAB_WRITER_BETA_R20_MUTATION_ED25519_V1\n'
      + JSON.stringify(CORE_FIELDS.map((key) => claims[key])),
    'utf8',
  );
}

export type R8VerifiedMutation = Readonly<R8MutationClaims & {
  [BRANDED_VERIFIED]: true;
}>;

/**
 * This verifies the proof's signature and its binding to the exact authenticated
 * request. The signer trust and minimum sequence MUST come from independently
 * protected current custody; they are test inputs here, not implementation.
 */
export function verifyR8Mutation(
  receipt: R8MutationReceipt,
  expected: R8MutationIntent,
  trust: R8TrustedSigner,
  nowMs: number,
): R8VerifiedMutation {
  try {
    if (!expected || !trust || !receipt || typeof receipt !== 'object'
      || !exactKeys(receipt, ['claims', 'signature'])
      || !receipt.claims || typeof receipt.claims !== 'object'
      || !exactKeys(receipt.claims, CORE_FIELDS)) throw new R8MutationRefused();
    const c = receipt.claims;
    const needExistingGrant = expected.action !== 'issued';
    if (!UUID.test(expected.memberId) || !UUID.test(expected.actorId)
      || !UUID.test(expected.operationId) || !HEX.test(expected.subjectCommitment)
      || !['issued', 'accepted', 'revoked'].includes(expected.action)
      || (needExistingGrant && !UUID.test(expected.expectedGrantId ?? ''))
      || (!needExistingGrant && expected.expectedGrantId !== undefined)
      || c.version !== 1 || c.audience !== R8_AUDIENCE
      || c.issuer !== trust.issuer || c.keyId !== trust.keyId
      || c.action !== expected.action || !UUID.test(c.grantId)
      || !safeCompare(c.memberId, expected.memberId)
      || !safeCompare(c.actorId, expected.actorId)
      || !safeCompare(c.operationId, expected.operationId)
      || !safeCompare(c.subjectCommitment, expected.subjectCommitment)
      || (needExistingGrant && !safeCompare(c.grantId, expected.expectedGrantId!))
      || !Number.isSafeInteger(c.sequence) || c.sequence <= 0
      || !Number.isSafeInteger(trust.minimumSequence)
      || trust.minimumSequence <= 0 || c.sequence < trust.minimumSequence
      || !Number.isSafeInteger(nowMs)
      || !Number.isSafeInteger(c.issuedAtMs)
      || !Number.isSafeInteger(c.expiresAtMs)
      || c.issuedAtMs > nowMs + 2000
      || c.expiresAtMs <= nowMs
      || c.expiresAtMs <= c.issuedAtMs
      || c.expiresAtMs - c.issuedAtMs > 30_000) {
      throw new R8MutationRefused();
    }
    if (typeof receipt.signature !== 'string'
      || !/^[A-Za-z0-9_-]{86}$/.test(receipt.signature)) {
      throw new R8MutationRefused();
    }
    const signature = Buffer.from(receipt.signature, 'base64url');
    if (signature.length !== 64
      || signature.toString('base64url') !== receipt.signature) {
      throw new R8MutationRefused();
    }
    const publicKey = createPublicKey(trust.publicKeyPem);
    if (publicKey.asymmetricKeyType !== 'ed25519'
      || !verify(null, r8MutationBytes(c), publicKey, signature)) {
      throw new R8MutationRefused();
    }
    return Object.freeze({
      ...c,
      [BRANDED_VERIFIED]: true as const,
    });
  } catch {
    // Never disclose member IDs, grant UUIDs, receipts or signer bytes.
    throw new R8MutationRefused();
  }
}

export type R8SealAuthorityPort = Readonly<{
  seal(intent: R8MutationIntent, nowMs: number): Promise<R8MutationReceipt>;
}>;
export type R8ScopedWriterDbPort = Readonly<{
  applySealedMutation(
    checked: R8VerifiedMutation,
  ): Promise<'applied' | 'replayed'>;
}>;

/**
 * Review-only choreography. The witness must seal and independently verify
 * before the local DB receives a scoped write. A failure MUST propagate,
 * never be converted to success. External event remains sealed on a failed
 * DB write; retries must recover its same canonical grant ID and event.
 *
 * The trust parameter is fixture-only, NOT a public injection point or
 * approved production verifier; never use in live routes before Class A.
 */
export async function coordinateR8SealedMutation(
  intent: R8MutationIntent,
  witness: R8SealAuthorityPort,
  scopedDb: R8ScopedWriterDbPort,
  trust: R8TrustedSigner,
  nowMs: number,
): Promise<Readonly<{
  grantId: string;
  operationId: string;
  sequence: number;
  status: 'applied' | 'replayed';
}>> {
  // Refuse malformed requests BEFORE the signer or DB are contacted.
  const needGrant = intent.action !== 'issued';
  if (!UUID.test(intent.memberId)
    || !UUID.test(intent.actorId)
    || !UUID.test(intent.operationId)
    || !HEX.test(intent.subjectCommitment)
    || !['issued', 'accepted', 'revoked'].includes(intent.action)
    || (needGrant && !UUID.test(intent.expectedGrantId ?? ''))
    || (!needGrant && intent.expectedGrantId !== undefined)) {
    throw new R8MutationRefused();
  }
  const signed = await witness.seal(intent, nowMs);
  const checked = verifyR8Mutation(signed, intent, trust, nowMs);
  const status = await scopedDb.applySealedMutation(checked);
  if (status !== 'applied' && status !== 'replayed') {
    throw new R8MutationRefused();
  }
  return Object.freeze({
    grantId: checked.grantId,
    operationId: checked.operationId,
    sequence: checked.sequence,
    status,
  });
}
