/** R5 checkpoint negative controls. All keys/accounts are fictional and in memory. */
import { generateKeyPairSync, sign } from 'node:crypto';
import {
  R20_WRITER_AUDIENCE, createR20Nonce, r20ReceiptBytes,
  type R20Claims, type R20SignedReceipt, type R20PinnedSigner,
} from '../pilotR20ReceiptProtocol';
import {
  R20_CHECKPOINT_AUDIENCE,
  r20CheckpointBytes, verifyR20Checkpoint,
  verifyR20WithIndependentCheckpoint, PilotR20CheckpointRefused,
  type R20CheckpointClaims, type R20CheckpointTrust,
  type R20SignedCheckpoint, type R20TripleRequest,
} from '../pilotR20CheckpointProtocol';

const subject = '11111111-1111-4111-8111-111111111111';
const grant = '22222222-2222-4222-8222-222222222222';
const stranger = '33333333-3333-4333-8333-333333333333';
const at = 1_795_000_000_000;
const pairA = generateKeyPairSync('ed25519');
const pairB = generateKeyPairSync('ed25519');
const pairC = generateKeyPairSync('ed25519');
const publicPem = (pair: typeof pairA) =>
  pair.publicKey.export({ format: 'pem', type: 'spki' }).toString('utf8');
const signerA: R20PinnedSigner = {
  issuer: 'r20-fixture-a', keyId: 'r20-key-a',
  publicKeyPem: publicPem(pairA), minimumEpoch: 1,
};
const signerB: R20PinnedSigner = {
  issuer: 'r20-fixture-b', keyId: 'r20-key-b',
  publicKeyPem: publicPem(pairB), minimumEpoch: 1,
};
const checkpointTrust: R20CheckpointTrust = {
  issuer: 'sealed-floor-fixture', keyId: 'r20-checkpoint-key',
  publicKeyPem: publicPem(pairC), minimumSequence: 1,
};

function request(): R20TripleRequest {
  return {
    memberId: subject, grantId: grant, nonce: createR20Nonce(),
    nowMs: at + 1000, signerA, signerB, checkpointTrust,
  };
}
function claim(
  source: R20PinnedSigner, nonce: string, extra: Partial<R20Claims> = {},
): R20Claims {
  return {
    version: 1, audience: R20_WRITER_AUDIENCE,
    issuer: source.issuer, keyId: source.keyId,
    memberId: subject, grantId: grant, nonce,
    status: 'active', epoch: 1,
    issuedAtMs: at, expiresAtMs: at + 15_000, ...extra,
  };
}
function signed(source: R20Claims, pair: typeof pairA): R20SignedReceipt {
  return {
    claims: source,
    signature: sign(null, r20ReceiptBytes(source), pair.privateKey).toString('base64url'),
  };
}
function floor(
  nonce: string, extra: Partial<R20CheckpointClaims> = {},
): R20CheckpointClaims {
  return {
    version: 1, audience: R20_CHECKPOINT_AUDIENCE,
    issuer: checkpointTrust.issuer, keyId: checkpointTrust.keyId,
    memberId: subject, grantId: grant, nonce,
    state: 'active', epochA: 1, epochB: 1,
    checkpointSequence: 1, issuedAtMs: at, expiresAtMs: at + 15_000,
    ...extra,
  };
}
function signedCheckpoint(
  value: R20CheckpointClaims, pair: typeof pairC = pairC,
): R20SignedCheckpoint {
  return {
    claims: value,
    signature: sign(null, r20CheckpointBytes(value), pair.privateKey).toString('base64url'),
  };
}
function fixture() {
  const req = request();
  return {
    req,
    first: signed(claim(req.signerA, req.nonce), pairA),
    second: signed(claim(req.signerB, req.nonce), pairB),
    checkpoint: signedCheckpoint(floor(req.nonce)),
  };
}
function denied(task: () => unknown) {
  expect(task).toThrow(PilotR20CheckpointRefused);
}

describe('R5 independent signed checkpoint research contract', () => {
  test('three independently signed active decisions authorize exactly the fixture grant', () => {
    const f = fixture();
    expect(verifyR20WithIndependentCheckpoint(
      f.first, f.second, f.checkpoint, f.req,
    )).toBeUndefined();
  });

  test('signed checkpoint exposes only the exact approved epoch floor', () => {
    const f = fixture();
    expect(verifyR20Checkpoint(f.checkpoint, f.req))
      .toEqual({ epochA: 1, epochB: 1 });
  });

  test('revoked checkpoint refuses two newly signed ACTIVE decisions', () => {
    const f = fixture();
    const stop = signedCheckpoint(floor(f.req.nonce, {
      state: 'revoked', checkpointSequence: 3, epochA: 3, epochB: 3,
    }));
    denied(() => verifyR20WithIndependentCheckpoint(
      f.first, f.second, stop, f.req,
    ));
  });

  test('missing, malformed and absent checkpoint never produce a positive result', () => {
    const f = fixture();
    const absent = signedCheckpoint(floor(f.req.nonce, { state: 'absent' }));
    denied(() => verifyR20WithIndependentCheckpoint(f.first, f.second, absent, f.req));
    denied(() => verifyR20WithIndependentCheckpoint(
      f.first, f.second, null as unknown as R20SignedCheckpoint, f.req,
    ));
    denied(() => verifyR20WithIndependentCheckpoint(
      f.first, f.second, { ...f.checkpoint, signature: 'invalid' }, f.req,
    ));
  });

  test('a verified floor of epoch 3 rejects both signers rolled back to epoch 1', () => {
    const f = fixture();
    const sealedFloor = signedCheckpoint(floor(f.req.nonce, {
      epochA: 3, epochB: 3, checkpointSequence: 3,
    }));
    denied(() => verifyR20WithIndependentCheckpoint(
      f.first, f.second, sealedFloor, f.req,
    ));
  });

  test('after fresh authority epochs 3, matching attested floor 3 can authorize', () => {
    const f = fixture();
    const recentA = signed(claim(f.req.signerA, f.req.nonce, { epoch: 3 }), pairA);
    const recentB = signed(claim(f.req.signerB, f.req.nonce, { epoch: 3 }), pairB);
    const sealedFloor = signedCheckpoint(floor(f.req.nonce, {
      epochA: 3, epochB: 3, checkpointSequence: 3,
    }));
    expect(verifyR20WithIndependentCheckpoint(
      recentA, recentB, sealedFloor, f.req,
    )).toBeUndefined();
  });

  test('a checkpoint signed for another member or grant is refused', () => {
    const f = fixture();
    for (const change of [{ memberId: stranger }, { grantId: stranger }]) {
      const wrong = signedCheckpoint(floor(f.req.nonce, change));
      denied(() => verifyR20WithIndependentCheckpoint(f.first, f.second, wrong, f.req));
    }
  });

  test('nonce replay and future, expired, overlong dates are refused', () => {
    const f = fixture();
    for (const change of [
      { nonce: createR20Nonce() },
      { issuedAtMs: at + 100_000, expiresAtMs: at + 101_000 },
      { expiresAtMs: at },
      { expiresAtMs: at + 100_000 },
    ]) {
      const stale = signedCheckpoint(floor(f.req.nonce, change));
      denied(() => verifyR20WithIndependentCheckpoint(f.first, f.second, stale, f.req));
    }
  });

  test('rollback of the checkpoint sequence below an independently pinned floor is refused', () => {
    const f = fixture();
    denied(() => verifyR20WithIndependentCheckpoint(
      f.first, f.second, f.checkpoint,
      {
        ...f.req,
        checkpointTrust: { ...f.req.checkpointTrust, minimumSequence: 2 },
      },
    ));
  });

  test('checkpoint signer forgery, wrong audience or key alias does not authorize', () => {
    const f = fixture();
    const cases: Partial<R20CheckpointClaims>[] = [
      { audience: 'foreign-audience' as typeof R20_CHECKPOINT_AUDIENCE },
      { keyId: 'foreign-key-id' },
      { issuer: 'foreign-issuer' },
    ];
    for (const change of cases) {
      const bad = signedCheckpoint(floor(f.req.nonce, change));
      denied(() => verifyR20WithIndependentCheckpoint(f.first, f.second, bad, f.req));
    }
    const counterfeit = signedCheckpoint(floor(f.req.nonce), pairA);
    denied(() => verifyR20WithIndependentCheckpoint(
      f.first, f.second, counterfeit, f.req,
    ));
  });

  test('checkpoint signer cannot secretly be one of the two primary keys', () => {
    const f = fixture();
    const disguised = {
      ...f.req.checkpointTrust,
      publicKeyPem: f.req.signerA.publicKeyPem.replace(/\n/g, '\r\n'),
    };
    const checkpointClaim = floor(f.req.nonce, {
      issuer: disguised.issuer, keyId: disguised.keyId,
    });
    const sameKey = signedCheckpoint(checkpointClaim, pairA);
    denied(() => verifyR20WithIndependentCheckpoint(
      f.first, f.second, sameKey,
      { ...f.req, checkpointTrust: disguised },
    ));
  });

  test('all three signers must have distinct issuer and key identifiers', () => {
    const f = fixture();
    for (const source of [
      { issuer: f.req.signerA.issuer },
      { keyId: f.req.signerB.keyId },
    ]) {
      denied(() => verifyR20WithIndependentCheckpoint(
        f.first, f.second, f.checkpoint,
        { ...f.req, checkpointTrust: { ...f.req.checkpointTrust, ...source } },
      ));
    }
  });

  test('signed unknown checkpoint fields and signature alteration refuse admission', () => {
    const f = fixture();
    const unknown = {
      ...f.checkpoint,
      claims: { ...f.checkpoint.claims, unexpected: 'ignore me' },
    };
    denied(() => verifyR20WithIndependentCheckpoint(
      f.first, f.second, unknown as unknown as R20SignedCheckpoint, f.req,
    ));
    const change = {
      ...f.checkpoint,
      claims: { ...f.checkpoint.claims, checkpointSequence: 3 },
    };
    denied(() => verifyR20WithIndependentCheckpoint(
      f.first, f.second, change, f.req,
    ));
  });

  test('a forged floor supplied by the restored Writer database is not accepted', () => {
    const f = fixture();
    const forged = {
      ...f.checkpoint,
      claims: { ...f.checkpoint.claims, epochA: 1, epochB: 1 },
      signature: sign(null, Buffer.from('wrong'), pairA.privateKey).toString('base64url'),
    };
    denied(() => verifyR20WithIndependentCheckpoint(
      f.first, f.second, forged, f.req,
    ));
  });

  test('refusals do not disclose the member or grant identifier', () => {
    const f = fixture();
    try {
      verifyR20WithIndependentCheckpoint(
        f.first, f.second,
        signedCheckpoint(floor(f.req.nonce, { state: 'revoked' })),
        f.req,
      );
      throw new Error('expected refusal');
    } catch (e) {
      expect(e).toBeInstanceOf(PilotR20CheckpointRefused);
      expect(String(e)).not.toContain(subject);
      expect(String(e)).not.toContain(grant);
    }
  });
});
