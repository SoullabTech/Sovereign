import { generateKeyPairSync, sign } from 'node:crypto';
import {
  R20_WRITER_AUDIENCE, createR20Nonce, r20ReceiptBytes,
  verifyTwoIndependentR20Receipts, PilotR20ReceiptRefused,
  type R20Claims, type R20SignedReceipt, type R20PinnedSigner,
  type R20VerificationRequest,
} from '../pilotR20ReceiptProtocol';

const writer = '11111111-1111-4111-8111-111111111111';
const grant = '22222222-2222-4222-8222-222222222222';
const other = '33333333-3333-4333-8333-333333333333';
const clock = 1_795_000_000_000;

const a = generateKeyPairSync('ed25519');
const b = generateKeyPairSync('ed25519');
const publicPem = (pair: typeof a) =>
  pair.publicKey.export({ type: 'spki', format: 'pem' }).toString('utf8');

const pinnedA: R20PinnedSigner = {
  issuer: 'fixture-r20-authority', keyId: 'fixture-a',
  publicKeyPem: publicPem(a), minimumEpoch: 1,
};
const pinnedB: R20PinnedSigner = {
  issuer: 'fixture-independent-witness', keyId: 'fixture-b',
  publicKeyPem: publicPem(b), minimumEpoch: 1,
};

function claims(pinned: R20PinnedSigner, nonce: string, overrides: Partial<R20Claims> = {}): R20Claims {
  return {
    version: 1,
    audience: R20_WRITER_AUDIENCE,
    issuer: pinned.issuer,
    keyId: pinned.keyId,
    memberId: writer,
    grantId: grant,
    status: 'active',
    epoch: 1,
    nonce,
    issuedAtMs: clock,
    expiresAtMs: clock + 15_000,
    ...overrides,
  };
}

function signed(c: R20Claims, pair: typeof a): R20SignedReceipt {
  return { claims: c, signature: sign(null, r20ReceiptBytes(c), pair.privateKey).toString('base64url') };
}

function fixture() {
  const nonce = createR20Nonce();
  const request: R20VerificationRequest = {
    memberId: writer, grantId: grant, nonce,
    nowMs: clock + 1000, signerA: pinnedA, signerB: pinnedB,
  };
  return {
    request,
    first: signed(claims(pinnedA, nonce), a),
    second: signed(claims(pinnedB, nonce), b),
  };
}
const denied = (fn: () => unknown) => expect(fn).toThrow(PilotR20ReceiptRefused);

describe('R20 dual independent signed receipt — candidate only', () => {
  test('a fresh pair of distinct signer decisions admits the exact fictional grant', () => {
    const { request, first, second } = fixture();
    expect(verifyTwoIndependentR20Receipts(first, second, request)).toBeUndefined();
  });

  test('an accepted historical grant with a signed revoked verdict is refused', () => {
    const { request, first } = fixture();
    const revoked = signed(claims(pinnedB, request.nonce, { status: 'revoked', epoch: 3 }), b);
    denied(() => verifyTwoIndependentR20Receipts(first, revoked, request));
  });

  test('an absent grant is refused rather than silently treated as Free-to-Pro eligible', () => {
    const { request, first } = fixture();
    const absent = signed(claims(pinnedB, request.nonce, { status: 'absent', epoch: 0 }), b);
    denied(() => verifyTwoIndependentR20Receipts(first, absent, request));
  });

  test('a stale previous challenge is refused even with a genuine old signature', () => {
    const { request, first, second } = fixture();
    denied(() => verifyTwoIndependentR20Receipts(first, second, { ...request, nonce: createR20Nonce() }));
  });

  test.each([
    ['member mismatch', { memberId: other }],
    ['grant mismatch', { grantId: other }],
    ['untrusted issuer', { issuer: 'fake' }],
    ['untrusted key identifier', { keyId: 'fake' }],
    ['audience confusion', { audience: 'other-audience' }],
    ['different nonce', { nonce: createR20Nonce() }],
    ['expired', { expiresAtMs: clock - 1 }],
    ['future-dated', { issuedAtMs: clock + 50_000, expiresAtMs: clock + 60_000 }],
    ['oversized lifetime', { expiresAtMs: clock + 120_000 }],
    ['sequence regression', { epoch: 1 }],
  ])('refuses otherwise genuinely signed %s claims when mismatched', (label, changes) => {
    const { request, first } = fixture();
    const altered = signed(claims(pinnedB, request.nonce, changes as Partial<R20Claims>), b);
    const selected = label === 'sequence regression'
      ? { ...request, signerB: { ...pinnedB, minimumEpoch: 2 } } : request;
    denied(() => verifyTwoIndependentR20Receipts(first, altered, selected));
  });

  test('signature corruption cannot elevate a valid denial to approval', () => {
    const { request, first, second } = fixture();
    const corrupted: R20SignedReceipt = {
      claims: { ...second.claims, status: 'active' },
      signature: first.signature,
    };
    denied(() => verifyTwoIndependentR20Receipts(first, corrupted, request));
  });

  test('swapped issuer key is not a separate trustworthy signature', () => {
    const { request, first, second } = fixture();
    denied(() => verifyTwoIndependentR20Receipts(first, second, {
      ...request,
      signerB: { ...pinnedB, publicKeyPem: pinnedA.publicKeyPem },
    }));
  });

  test('two votes from the same key, issuer or key ID are not independent', () => {
    const { request, first, second } = fixture();
    for (const signerB of [
      { ...pinnedB, publicKeyPem: pinnedA.publicKeyPem },
      { ...pinnedB, issuer: pinnedA.issuer },
      { ...pinnedB, keyId: pinnedA.keyId },
    ]) {
      denied(() => verifyTwoIndependentR20Receipts(first, second, { ...request, signerB }));
    }
  });

  test('one Ed25519 key with differently formatted PEM cannot count as two authorities', () => {
    const { request, first } = fixture();
    const reformatted = pinnedA.publicKeyPem.replace(/\n/g, '\r\n');
    expect(reformatted).not.toBe(pinnedA.publicKeyPem);
    const disguisedSecondSigner = {
      ...pinnedB,
      publicKeyPem: reformatted,
    };
    const second = signed(
      claims(disguisedSecondSigner, request.nonce), a,
    );
    denied(() => verifyTwoIndependentR20Receipts(
      first, second, {
        ...request, signerB: disguisedSecondSigner,
      },
    ));
  });

  test('unexpected fields must not escape the signed canonical claim set', () => {
    const { request, first, second } = fixture();
    const extended = {
      ...second, claims: { ...second.claims, extra: 'unknown' },
    };
    denied(() => verifyTwoIndependentR20Receipts(
      first, extended as unknown as R20SignedReceipt, request,
    ));
  });

  test('two independently rolled-back signers can BOTH falsely authorize without an external epoch floor', () => {
    const { request } = fixture();
    // Both old signer states still own valid signing keys, so each can sign
    // the current challenge despite using historical (pre-revocation) epoch.
    const oldA = signed(claims(pinnedA, request.nonce, { epoch: 1 }), a);
    const oldB = signed(claims(pinnedB, request.nonce, { epoch: 1 }), b);
    expect(verifyTwoIndependentR20Receipts(oldA, oldB, request)).toBeUndefined();

    // An independently preserved monotonic revocation checkpoint *must*
    // outlive both signers' restored databases.
    const protectedRequest = {
      ...request,
      signerA: { ...request.signerA, minimumEpoch: 2 },
      signerB: { ...request.signerB, minimumEpoch: 2 },
    };
    denied(() => verifyTwoIndependentR20Receipts(oldA, oldB, protectedRequest));
  });

  test('one rolled-back signer is denied by an independently current revoked signer', () => {
    const { request } = fixture();
    const oldA = signed(claims(pinnedA, request.nonce, { epoch: 1 }), a);
    const revokedB = signed(claims(pinnedB, request.nonce, {
      epoch: 2, status: 'revoked',
    }), b);
    denied(() => verifyTwoIndependentR20Receipts(oldA, revokedB, request));
  });

  test('expired signed decisions never permit Pro', () => {
    const { request, first, second } = fixture();
    denied(() => verifyTwoIndependentR20Receipts(
      first, second, { ...request, nowMs: clock + 20_000 },
    ));
  });

  test('invalid challenge and malformed signature are refused', () => {
    const { request, first, second } = fixture();
    denied(() => verifyTwoIndependentR20Receipts(first, second, {
      ...request, nonce: 'abc',
    }));
    denied(() => verifyTwoIndependentR20Receipts(
      first, { ...second, signature: 'invalid' }, request,
    ));
  });

  test('refusal messages contain no account or grant identifiers', () => {
    const { request, first, second } = fixture();
    try {
      verifyTwoIndependentR20Receipts(first, { ...second, signature: 'invalid' }, request);
    } catch (error) {
      expect(String(error)).not.toContain(writer);
      expect(String(error)).not.toContain(grant);
    }
  });
});
