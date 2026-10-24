/**
 * WS-TIERS-R4: independent signed R20 decision validation candidate.
 * Review-only: production admission stays fail closed.
 */
import {
  createPublicKey, randomBytes, timingSafeEqual, verify,
  type KeyObject,
} from 'node:crypto';

/** Fixture protocol only. No production trust anchor or transport is installed. */
export const R20_WRITER_AUDIENCE = 'soullab.writers-studio.beta-pro.r20.v1' as const;
export const R20_MAX_LIFETIME_MS = 30_000;
export type R20LedgerStatus = 'active' | 'revoked' | 'absent';

export type R20Claims = Readonly<{
  version: 1;
  audience: typeof R20_WRITER_AUDIENCE;
  issuer: string;
  keyId: string;
  memberId: string;
  grantId: string;
  status: R20LedgerStatus;
  epoch: number;
  nonce: string;
  issuedAtMs: number;
  expiresAtMs: number;
}>;

export type R20SignedReceipt = Readonly<{
  claims: R20Claims;
  signature: string;
}>;

export type R20PinnedSigner = Readonly<{
  issuer: string;
  keyId: string;
  publicKeyPem: string;
  minimumEpoch: number;
}>;

export type R20VerificationRequest = Readonly<{
  memberId: string;
  grantId: string;
  nonce: string;
  nowMs: number;
  signerA: R20PinnedSigner;
  signerB: R20PinnedSigner;
}>;

const CLAIM_FIELDS: readonly (keyof R20Claims)[] = [
  'version', 'audience', 'issuer', 'keyId', 'memberId', 'grantId',
  'status', 'epoch', 'nonce', 'issuedAtMs', 'expiresAtMs',
];

export function r20ReceiptBytes(claims: R20Claims): Buffer {
  return Buffer.from(
    'SOULLAB_WRITER_R20_ED25519_V1\n'
      + JSON.stringify(CLAIM_FIELDS.map((field) => claims[field])),
    'utf8',
  );
}

export function createR20Nonce(): string {
  return randomBytes(32).toString('base64url');
}

export class PilotR20ReceiptRefused extends Error {
  constructor() {
    super('pilot_r20_receipt_refused');
    this.name = 'PilotR20ReceiptRefused';
  }
}

function fixedEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, 'utf8');
  const right = Buffer.from(b, 'utf8');
  return left.length === right.length && timingSafeEqual(left, right);
}

function exactKeys(value: object, allowed: readonly string[]): boolean {
  const keys = Object.keys(value);
  return keys.length === allowed.length && keys.every((key) => allowed.includes(key));
}
function validNonce(value: unknown): value is string {
  return typeof value === 'string'
    && /^[A-Za-z0-9_-]{43}$/.test(value)
    && Buffer.from(value, 'base64url').length === 32
    && Buffer.from(value, 'base64url').toString('base64url') === value;
}

function validUuid(value: unknown): value is string {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function decodedSignature(value: unknown): Buffer | null {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{86}$/.test(value)) return null;
  const bytes = Buffer.from(value, 'base64url');
  return bytes.length === 64 && bytes.toString('base64url') === value ? bytes : null;
}

function verifiedOne(
  receipt: R20SignedReceipt,
  pinned: R20PinnedSigner,
  request: R20VerificationRequest,
  publicKey: KeyObject,
): boolean {
  try {
    if (!receipt || typeof receipt !== 'object'
      || !exactKeys(receipt, ['claims', 'signature'])
      || !receipt.claims || typeof receipt.claims !== 'object'
      || !exactKeys(receipt.claims, CLAIM_FIELDS)) return false;
    const c = receipt.claims;
    if (c.version !== 1 || c.audience !== R20_WRITER_AUDIENCE
      || c.issuer !== pinned.issuer || c.keyId !== pinned.keyId
      || c.status !== 'active'
      || !validUuid(c.memberId) || !validUuid(c.grantId)
      || !validUuid(request.memberId) || !validUuid(request.grantId)
      || !fixedEqual(c.memberId, request.memberId)
      || !fixedEqual(c.grantId, request.grantId)
      || !validNonce(c.nonce) || !fixedEqual(c.nonce, request.nonce)
      || !Number.isSafeInteger(c.epoch) || c.epoch < 1
      || !Number.isSafeInteger(pinned.minimumEpoch)
      || c.epoch < pinned.minimumEpoch
      || !Number.isSafeInteger(c.issuedAtMs)
      || !Number.isSafeInteger(c.expiresAtMs)
      || !Number.isSafeInteger(request.nowMs)
      || c.issuedAtMs > request.nowMs + 2000
      || c.expiresAtMs <= request.nowMs
      || c.expiresAtMs <= c.issuedAtMs
      || c.expiresAtMs - c.issuedAtMs > R20_MAX_LIFETIME_MS) return false;
    const signature = decodedSignature(receipt.signature);
    if (!signature) return false;
    return verify(null, r20ReceiptBytes(c), publicKey, signature);
  } catch {
    return false;
  }
}

/** Two independent, short-lived, challenge-bound signed ACTIVE decisions. */
export function verifyTwoIndependentR20Receipts(
  first: R20SignedReceipt,
  second: R20SignedReceipt,
  request: R20VerificationRequest,
): void {
  if (!validNonce(request.nonce)
    || request.signerA.issuer === request.signerB.issuer
    || request.signerA.keyId === request.signerB.keyId
    || request.signerA.publicKeyPem === request.signerB.publicKeyPem) {
    throw new PilotR20ReceiptRefused();
  }
  try {
    const a = createPublicKey(request.signerA.publicKeyPem);
    const b = createPublicKey(request.signerB.publicKeyPem);
    // PEM is only a presentation. Different line endings or equivalent PEM
    // encodings must not let ONE Ed25519 key count as two independent signers.
    const rawA = a.export({ format: 'der', type: 'spki' }) as Buffer;
    const rawB = b.export({ format: 'der', type: 'spki' }) as Buffer;
    if (a.asymmetricKeyType !== 'ed25519'
      || b.asymmetricKeyType !== 'ed25519'
      || (rawA.length === rawB.length && timingSafeEqual(rawA, rawB))
      || !verifiedOne(first, request.signerA, request, a)
      || !verifiedOne(second, request.signerB, request, b)) {
      throw new PilotR20ReceiptRefused();
    }
  } catch {
    throw new PilotR20ReceiptRefused();
  }
}
