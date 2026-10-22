/**
 * WS-TIERS-R5 — offline-research signed R20 checkpoint verifier.
 *
 * This is NOT a production checkpoint authority, WORM implementation or
 * key-custody solution. The signed checkpoint must come from a separately
 * operated, externally anchored monotonic source; a restorable DB cannot
 * self-certify its own high-water mark.
 *
 * The production Writer entitlement remains fail CLOSED in
 * pilotR20Authority.ts. This module only specifies/verifies proposed receipts.
 */
import { createPublicKey, timingSafeEqual, verify } from 'node:crypto';
import {
  R20_MAX_LIFETIME_MS,
  verifyTwoIndependentR20Receipts,
  type R20PinnedSigner,
  type R20SignedReceipt,
  type R20VerificationRequest,
} from './pilotR20ReceiptProtocol';

export const R20_CHECKPOINT_AUDIENCE = 'soullab.writers-studio.r20-checkpoint.v1' as const;

export type R20CheckpointClaims = Readonly<{
  version: 1;
  audience: typeof R20_CHECKPOINT_AUDIENCE;
  issuer: string;
  keyId: string;
  memberId: string;
  grantId: string;
  state: 'active' | 'revoked' | 'absent';
  epochA: number;
  epochB: number;
  checkpointSequence: number;
  nonce: string;
  issuedAtMs: number;
  expiresAtMs: number;
}>;

export type R20SignedCheckpoint = Readonly<{
  claims: R20CheckpointClaims;
  signature: string;
}>;

export type R20CheckpointTrust = Readonly<{
  issuer: string;
  keyId: string;
  publicKeyPem: string;
  /** Must be externally held and current, never read from restored Writer DB. */
  minimumSequence: number;
}>;

export type R20TripleRequest = Readonly<{
  memberId: string;
  grantId: string;
  nonce: string;
  nowMs: number;
  signerA: R20PinnedSigner;
  signerB: R20PinnedSigner;
  checkpointTrust: R20CheckpointTrust;
}>;

const CLAIM_FIELDS: readonly (keyof R20CheckpointClaims)[] = [
  'version', 'audience', 'issuer', 'keyId', 'memberId', 'grantId',
  'state', 'epochA', 'epochB', 'checkpointSequence', 'nonce',
  'issuedAtMs', 'expiresAtMs',
];

export function r20CheckpointBytes(claims: R20CheckpointClaims): Buffer {
  return Buffer.from(
    'SOULLAB_WRITER_R20_CHECKPOINT_ED25519_V1\n'
      + JSON.stringify(CLAIM_FIELDS.map((field) => claims[field])),
    'utf8',
  );
}

export class PilotR20CheckpointRefused extends Error {
  constructor() {
    super('pilot_r20_checkpoint_refused');
    this.name = 'PilotR20CheckpointRefused';
  }
}

function equal(a: string, b: string): boolean {
  const left = Buffer.from(a, 'utf8');
  const right = Buffer.from(b, 'utf8');
  return left.length === right.length && timingSafeEqual(left, right);
}
function exactKeys(value: object, expected: readonly string[]): boolean {
  const keys = Object.keys(value);
  return keys.length === expected.length && keys.every((key) => expected.includes(key));
}
function validUuid(value: unknown): value is string {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
function validNonce(value: unknown): value is string {
  return typeof value === 'string'
    && /^[A-Za-z0-9_-]{43}$/.test(value)
    && Buffer.from(value, 'base64url').length === 32
    && Buffer.from(value, 'base64url').toString('base64url') === value;
}
function decodedSignature(value: unknown): Buffer | null {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{86}$/.test(value)) return null;
  const bytes = Buffer.from(value, 'base64url');
  return bytes.length === 64 && bytes.toString('base64url') === value ? bytes : null;
}
function safePositive(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0;
}
/**
 * Validate a signed checkpoint independently of member-grant state.
 * Important: this verifies its PRESENTATION, not its storage durability.
 */
export function verifyR20Checkpoint(
  receipt: R20SignedCheckpoint,
  request: R20TripleRequest,
): { epochA: number; epochB: number } {
  try {
    const pinned = request.checkpointTrust;
    if (!receipt || typeof receipt !== 'object'
      || !exactKeys(receipt, ['claims', 'signature'])
      || !receipt.claims || typeof receipt.claims !== 'object'
      || !exactKeys(receipt.claims, CLAIM_FIELDS)) {
      throw new PilotR20CheckpointRefused();
    }
    const c = receipt.claims;
    if (c.version !== 1 || c.audience !== R20_CHECKPOINT_AUDIENCE
      || c.issuer !== pinned.issuer || c.keyId !== pinned.keyId
      || c.state !== 'active'
      || !validUuid(c.memberId) || !validUuid(c.grantId)
      || !validUuid(request.memberId) || !validUuid(request.grantId)
      || !equal(c.memberId, request.memberId)
      || !equal(c.grantId, request.grantId)
      || !validNonce(c.nonce) || !equal(c.nonce, request.nonce)
      || !safePositive(c.epochA) || !safePositive(c.epochB)
      || !safePositive(c.checkpointSequence)
      || !safePositive(pinned.minimumSequence)
      || c.checkpointSequence < pinned.minimumSequence
      || !Number.isSafeInteger(c.issuedAtMs)
      || !Number.isSafeInteger(c.expiresAtMs)
      || !Number.isSafeInteger(request.nowMs)
      || c.issuedAtMs > request.nowMs + 2000
      || c.expiresAtMs <= request.nowMs
      || c.expiresAtMs <= c.issuedAtMs
      || c.expiresAtMs - c.issuedAtMs > R20_MAX_LIFETIME_MS) {
      throw new PilotR20CheckpointRefused();
    }
    const signature = decodedSignature(receipt.signature);
    if (!signature) throw new PilotR20CheckpointRefused();
    const key = createPublicKey(pinned.publicKeyPem);
    if (key.asymmetricKeyType !== 'ed25519'
      || !verify(null, r20CheckpointBytes(c), key, signature)) {
      throw new PilotR20CheckpointRefused();
    }
    return { epochA: c.epochA, epochB: c.epochB };
  } catch {
    throw new PilotR20CheckpointRefused();
  }
}

/**
 * Triple authority protocol: external checkpoint first, two existing
 * independent signers second. There is NO public route and NO fallback.
 */
export function verifyR20WithIndependentCheckpoint(
  a: R20SignedReceipt,
  b: R20SignedReceipt,
  checkpoint: R20SignedCheckpoint,
  request: R20TripleRequest,
): void {
  try {
    // Independence of the checkpoint authority must hold on decoded SPKI,
    // not merely on issuer labels or PEM text formatting.
    const keys = [
      createPublicKey(request.signerA.publicKeyPem),
      createPublicKey(request.signerB.publicKeyPem),
      createPublicKey(request.checkpointTrust.publicKeyPem),
    ];
    if (keys.some((key) => key.asymmetricKeyType !== 'ed25519')) {
      throw new PilotR20CheckpointRefused();
    }
    const identities = [
      request.signerA.issuer, request.signerB.issuer, request.checkpointTrust.issuer,
    ];
    const keyIds = [
      request.signerA.keyId, request.signerB.keyId, request.checkpointTrust.keyId,
    ];
    if (new Set(identities).size !== 3 || new Set(keyIds).size !== 3) {
      throw new PilotR20CheckpointRefused();
    }
    const der = keys.map((key) => key.export({ type: 'spki', format: 'der' }) as Buffer);
    for (let i = 0; i < der.length; i += 1) {
      for (let j = i + 1; j < der.length; j += 1) {
        if (der[i].length === der[j].length && timingSafeEqual(der[i], der[j])) {
          throw new PilotR20CheckpointRefused();
        }
      }
    }
    const floor = verifyR20Checkpoint(checkpoint, request);
    const verifiedRequest: R20VerificationRequest = {
      memberId: request.memberId,
      grantId: request.grantId,
      nonce: request.nonce,
      nowMs: request.nowMs,
      signerA: {
        ...request.signerA,
        minimumEpoch: Math.max(request.signerA.minimumEpoch, floor.epochA),
      },
      signerB: {
        ...request.signerB,
        minimumEpoch: Math.max(request.signerB.minimumEpoch, floor.epochB),
      },
    };
    verifyTwoIndependentR20Receipts(a, b, verifiedRequest);
  } catch {
    throw new PilotR20CheckpointRefused();
  }
}
