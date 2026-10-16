import { generateKeyPairSync, randomUUID, sign } from 'node:crypto';
import {
  canonicalDeletionPayload, requireCurrentRestoreAuthorization,
  type DeletionHighwaterV1,
} from '../deletionBarrierV1';

const a = '306902ed-21a9-4c01-aa15-984755598218';
const b = '4c0782ca-9074-43ee-9f3c-5f8500026780';
const keyA = '3ac9b90d-8d79-44cf-bf3f-81376d8b7efe';
const keyB = '5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const pair = generateKeyPairSync('ed25519');
const otherPair = generateKeyPairSync('ed25519');
const checkpoint = (overrides: Partial<DeletionHighwaterV1> = {}): DeletionHighwaterV1 => ({
  protocol: 'soullab.ws.deletion-highwater.v1',
  stream: 'writers-studio-beta',
  generation: 17,
  revokedWorks: [a],
  revokedKeyIds: [keyA],
  ...overrides,
});
const signed = (cp = checkpoint(), signer = pair.privateKey) => ({
  checkpoint: cp,
  signature: sign(null, canonicalDeletionPayload(cp), signer).toString('base64'),
});
const req = { workId: b, keyId: keyB, snapshotGeneration: 12 };
const call = (options: {
  cp?: DeletionHighwaterV1; floor?: number; request?: typeof req;
  trustedSigner?: typeof pair.publicKey | null; signingKey?: typeof pair.privateKey;
  signatureOverride?: string;
} = {}) => {
  const record = signed(options.cp, options.signingKey);
  if (options.signatureOverride !== undefined) record.signature = options.signatureOverride;
  return () => requireCurrentRestoreAuthorization({
    request: options.request || req,
    signed: record,
    trustedSigner: options.trustedSigner === undefined ? pair.publicKey : options.trustedSigner,
    independent: options.floor === undefined ? { minimumGeneration: 17 } : { minimumGeneration: options.floor },
  });
};
const refusal = (f: () => unknown, code: string) =>
  expect(f).toThrow(expect.objectContaining({ code }));

describe('R11 deletion barrier: signed checkpoint PLUS independent antirollback floor', () => {
  it('permits only the unrelated surviving Work with currently verified epoch', () => {
    expect(call()()).toBeUndefined();
  });
  it('refuses deleted Work and its separately revoked encryption key', () => {
    refusal(call({ request: { workId: a, keyId: keyB, snapshotGeneration: 12 } }), 'deleted_work_refused');
    refusal(call({ request: { workId: b, keyId: keyA, snapshotGeneration: 12 } }), 'deleted_key_refused');
  });
  it('refuses an older correctly signed checkpoint when external floor advanced', () => {
    refusal(call({ cp: checkpoint({ generation: 16, revokedWorks: [], revokedKeyIds: [] }) }),
      'stale_deletion_checkpoint');
  });
  it('refuses a future snapshot not witnessed by current signer generation', () => {
    refusal(call({ request: { workId: b, keyId: keyB, snapshotGeneration: 18 } }),
      'snapshot_ahead_of_checkpoint');
  });
  it('refuses altered signature, wrong public signer, unsupported asymmetric key', () => {
    refusal(call({ trustedSigner: otherPair.publicKey }), 'deletion_barrier_signature_invalid');
    refusal(call({ signatureOverride: 'not-base64' }), 'invalid_deletion_barrier');
    const record = signed();
    const changed = { ...record, checkpoint: { ...record.checkpoint, revokedWorks: [] } };
    refusal(() => requireCurrentRestoreAuthorization({
      request: req, signed: changed, trustedSigner: pair.publicKey,
      independent: { minimumGeneration: 17 },
    }), 'deletion_barrier_signature_invalid');
  });
  it('requires independently supplied signer and generation: never trusts restored snapshot alone', () => {
    const record = signed();
    refusal(() => requireCurrentRestoreAuthorization({
      request: req, signed: record, trustedSigner: null, independent: { minimumGeneration: 17 },
    }), 'untrusted_deletion_checkpoint');
    refusal(() => requireCurrentRestoreAuthorization({
      request: req, signed: record, trustedSigner: pair.publicKey, independent: null,
    }), 'untrusted_deletion_checkpoint');
    refusal(() => requireCurrentRestoreAuthorization({
      request: req, signed: null, trustedSigner: pair.publicKey, independent: { minimumGeneration: 17 },
    }), 'untrusted_deletion_checkpoint');
  });
  it('refuses forged owner/work/key fields and missing independent epoch', () => {
    refusal(call({ request: { ...req, keyId: 'arbitrary-record' } }), 'invalid_deletion_barrier');
    refusal(call({ floor: 0 }), 'invalid_deletion_barrier');
  });
  it('rejects duplicate or unsorted revocations before signing', () => {
    refusal(() => canonicalDeletionPayload(checkpoint({ revokedWorks: [a, a] })), 'invalid_deletion_barrier');
    refusal(() => canonicalDeletionPayload(checkpoint({ revokedWorks: [b, a] })), 'invalid_deletion_barrier');
    refusal(() => canonicalDeletionPayload(checkpoint({ revokedKeyIds: [randomUUID(), 'not-an-id'] })),
      'invalid_deletion_barrier');
  });
  it('rejects wrong protocol, stream and unsafe epoch', () => {
    refusal(() => canonicalDeletionPayload(checkpoint({ protocol: 'unknown' as DeletionHighwaterV1['protocol'] })),
      'invalid_deletion_barrier');
    refusal(() => canonicalDeletionPayload(checkpoint({ stream: 'production' as DeletionHighwaterV1['stream'] })),
      'invalid_deletion_barrier');
    refusal(() => canonicalDeletionPayload(checkpoint({ generation: Number.MAX_SAFE_INTEGER + 1 })),
      'invalid_deletion_barrier');
  });
});
