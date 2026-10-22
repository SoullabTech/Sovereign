/**
 * WS-TIERS-R8 — fictional seal-before-member-DB transaction proof.
 * Test port only. NO production grant routes import this candidate.
 * Ephemeral local signing key, in-memory witness, no real member or writing.
 */
import { createHash, generateKeyPairSync, randomUUID, sign } from 'node:crypto';
import {
  R8_AUDIENCE,
  R8MutationRefused, coordinateR8SealedMutation,
  r8MutationBytes, verifyR8Mutation,
  type R8Action, type R8MutationIntent, type R8MutationClaims,
  type R8MutationReceipt, type R8TrustedSigner, type R8VerifiedMutation,
} from '../pilotR20MutationCandidate';

const founder = '11111111-1111-4111-8111-111111111111';
const writerA = '22222222-2222-4222-8222-222222222222';
const writerB = '33333333-3333-4333-8333-333333333333';
const writerC = '44444444-4444-4444-8444-444444444444';
const time = 1_795_000_000_000;
const commitmentFor = (id: string) =>
  createHash('sha256').update('fictional-one-way-commit:' + id).digest('hex');

const keys = generateKeyPairSync('ed25519');
const otherKeys = generateKeyPairSync('ed25519');
const trust: R8TrustedSigner = {
  issuer: 'fictional-r20-external-journal',
  keyId: 'fictional-signer-v1',
  publicKeyPem: keys.publicKey.export({ type: 'spki', format: 'pem' }).toString('utf8'),
  minimumSequence: 1,
};

const intent = (
  action: R8Action, memberId: string, grantId?: string, operationId = randomUUID(),
): R8MutationIntent => ({
  action,
  memberId,
  actorId: action === 'accepted' ? memberId : founder,
  operationId,
  subjectCommitment: commitmentFor(memberId),
  ...(grantId ? { expectedGrantId: grantId } : {}),
});

type State = 'issued' | 'accepted' | 'revoked';
type Journal = {
  grantId: string;
  memberId: string;
  subjectCommitment: string;
  state: State;
  issuedBy: string;
  lastSequence: number;
};
type StoredReceipt = { intent: R8MutationIntent; claims: R8MutationClaims };

class FakeIndependentR20 {
  private readonly grants = new Map<string, Journal>();
  private readonly operationIds = new Map<string, StoredReceipt>();
  private sequence = 0;
  private seats = 0;

  get issuedSeats(): number { return this.seats; }
  get numberOfEvents(): number { return this.sequence; }
  get stateA(): State | undefined { return this.grants.get(writerA)?.state; }
  get stateB(): State | undefined { return this.grants.get(writerB)?.state; }

  async seal(expected: R8MutationIntent, nowMs: number): Promise<R8MutationReceipt> {
    const old = this.operationIds.get(expected.operationId);
    if (old) {
      if (JSON.stringify(old.intent) !== JSON.stringify(expected)) {
        throw new R8MutationRefused();
      }
      // A terminal later revocation supersedes ALL older approvals and
      // acceptances. Even a previously signed idempotency key is no longer
      // eligible for a new short-lived "issued"/"accepted" receipt.
      if (this.grants.get(expected.memberId)?.state === 'revoked'
        && expected.action !== 'revoked') throw new R8MutationRefused();
      // Reaffirm the SAME irreversible operation ID/grant generation under a
      // new short-lived signature; no new journal event or seat is created.
      return this.signed({ ...old.claims, issuedAtMs: nowMs, expiresAtMs: nowMs + 15000 });
    }
    const prior = this.grants.get(expected.memberId);
    if (expected.action === 'issued') {
      if (prior || this.seats >= 2 || expected.actorId !== founder) {
        throw new R8MutationRefused();
      }
    } else if (expected.action === 'accepted') {
      if (!prior || prior.state !== 'issued' || prior.grantId !== expected.expectedGrantId
        || prior.memberId !== expected.actorId) throw new R8MutationRefused();
    } else {
      if (!prior || prior.state === 'revoked' || prior.grantId !== expected.expectedGrantId
        || expected.actorId !== founder) throw new R8MutationRefused();
    }

    const grantId = prior?.grantId ?? randomUUID();
    const sequence = ++this.sequence;
    if (expected.action === 'issued') {
      this.seats++;
      this.grants.set(expected.memberId, {
        grantId, memberId: expected.memberId,
        subjectCommitment: expected.subjectCommitment,
        state: 'issued', issuedBy: expected.actorId, lastSequence: sequence,
      });
    } else if (prior) {
      prior.state = expected.action;
      prior.lastSequence = sequence;
    }
    const claims: R8MutationClaims = {
      version: 1, audience: R8_AUDIENCE,
      issuer: trust.issuer, keyId: trust.keyId,
      memberId: expected.memberId, actorId: expected.actorId,
      operationId: expected.operationId,
      subjectCommitment: expected.subjectCommitment,
      action: expected.action, grantId, sequence,
      issuedAtMs: nowMs, expiresAtMs: nowMs + 15000,
    };
    this.operationIds.set(expected.operationId, { intent: expected, claims });
    return this.signed(claims);
  }

  private signed(claims: R8MutationClaims): R8MutationReceipt {
    return {
      claims,
      signature: sign(null, r8MutationBytes(claims), keys.privateKey).toString('base64url'),
    };
  }
}

type LocalGrant = { grantId: string; subjectCommitment: string; state: State };
class FakeMemberDb {
  private readonly members = new Map<string, LocalGrant>();
  private readonly operationKeys = new Map<string, string>();
  private count = 0;
  failNext = false;
  calls = 0;

  get issuedSeats(): number { return this.count; }
  get stateA(): State | undefined { return this.members.get(writerA)?.state; }
  get stateB(): State | undefined { return this.members.get(writerB)?.state; }
  get grantA(): string | undefined { return this.members.get(writerA)?.grantId; }

  /** Fictional owner-requested local-grant cleanup, NOT manuscript deletion. */
  deleteLocalGrantForFixture(memberId: string): void {
    this.members.delete(memberId);
    // Historical canary issuance cannot be unspent by local row cleanup.
  }

  async applySealedMutation(verified: R8VerifiedMutation): Promise<'applied' | 'replayed'> {
    this.calls++;
    if (this.failNext) {
      this.failNext = false;
      throw new Error('fictional_member_database_unavailable');
    }
    const fingerprint = [
      verified.action, verified.memberId, verified.actorId,
      verified.grantId, verified.subjectCommitment,
    ].join('|');
    const priorOperation = this.operationKeys.get(verified.operationId);
    if (priorOperation !== undefined) {
      if (priorOperation !== fingerprint) throw new R8MutationRefused();
      return 'replayed';
    }
    const current = this.members.get(verified.memberId);
    if (verified.action === 'issued') {
      if (current || this.count >= 2 || verified.actorId !== founder) {
        throw new R8MutationRefused();
      }
      this.members.set(verified.memberId, {
        grantId: verified.grantId,
        subjectCommitment: verified.subjectCommitment,
        state: 'issued',
      });
      this.count++;
    } else {
      if (!current || current.grantId !== verified.grantId
        || current.subjectCommitment !== verified.subjectCommitment) {
        throw new R8MutationRefused();
      }
      if (verified.action === 'accepted') {
        if (current.state !== 'issued' || verified.actorId !== verified.memberId) {
          throw new R8MutationRefused();
        }
        current.state = 'accepted';
      } else {
        if (current.state === 'revoked' || verified.actorId !== founder) {
          throw new R8MutationRefused();
        }
        current.state = 'revoked';
      }
    }
    this.operationKeys.set(verified.operationId, fingerprint);
    return 'applied';
  }
}

let witness: FakeIndependentR20;
let memberDb: FakeMemberDb;
beforeEach(() => {
  witness = new FakeIndependentR20();
  memberDb = new FakeMemberDb();
});

const run = (i: R8MutationIntent, nowMs = time) =>
  coordinateR8SealedMutation(i, witness, memberDb, trust, nowMs);

describe('R8 sealed-before-SQL and stable grant generation candidate', () => {
  test('external journal mints UUID before local SQL and both identities match', async () => {
    const original = intent('issued', writerA);
    const proof = await run(original);
    expect(proof.status).toBe('applied');
    expect(proof.grantId).toBe(memberDb.grantA);
    expect(proof.sequence).toBe(1);
    expect(witness.issuedSeats).toBe(1);
    expect(memberDb.issuedSeats).toBe(1);
  });

  test('repeated HTTP request uses same operation and grant, without second seat', async () => {
    const original = intent('issued', writerA);
    const first = await run(original);
    const second = await run(original, time + 1000);
    expect(second.status).toBe('replayed');
    expect(second.grantId).toBe(first.grantId);
    expect(second.sequence).toBe(first.sequence);
    expect(witness.issuedSeats).toBe(1);
    expect(memberDb.issuedSeats).toBe(1);
    expect(witness.numberOfEvents).toBe(1);
  });

  test('external issuance remains canonical after a member DB crash and retry', async () => {
    const original = intent('issued', writerA);
    memberDb.failNext = true;
    await expect(run(original)).rejects.toThrow('fictional_member_database_unavailable');
    expect(witness.issuedSeats).toBe(1);
    expect(memberDb.issuedSeats).toBe(0);
    const retry = await run(original, time + 4000);
    expect(retry.status).toBe('applied');
    expect(retry.grantId).toBe(memberDb.grantA);
    expect(witness.numberOfEvents).toBe(1);
  });

  test('a reused operation ID cannot be redirected to another member or actor', async () => {
    const first = intent('issued', writerA);
    await run(first);
    await expect(run(intent('issued', writerB, undefined, first.operationId)))
      .rejects.toThrow(R8MutationRefused);
    expect(memberDb.issuedSeats).toBe(1);
    expect(witness.numberOfEvents).toBe(1);
  });

  test('second operation for same writer cannot mint a second grant generation', async () => {
    await run(intent('issued', writerA));
    await expect(run(intent('issued', writerA))).rejects.toThrow(R8MutationRefused);
    expect(witness.issuedSeats).toBe(1);
  });

  test('only two distinct writers can receive founder-issued pilot grants', async () => {
    const a = await run(intent('issued', writerA));
    const b = await run(intent('issued', writerB));
    expect(a.grantId).not.toBe(b.grantId);
    expect(witness.issuedSeats).toBe(2);
    await expect(run(intent('issued', writerC))).rejects.toThrow(R8MutationRefused);
    expect(memberDb.issuedSeats).toBe(2);
    expect(witness.numberOfEvents).toBe(2);
  });

  test('writer must accept the exact issued grant and local state matches', async () => {
    const issued = await run(intent('issued', writerA));
    const accepted = await run(intent('accepted', writerA, issued.grantId));
    expect(accepted.status).toBe('applied');
    expect(accepted.grantId).toBe(issued.grantId);
    expect(memberDb.stateA).toBe('accepted');
    expect(witness.stateA).toBe('accepted');
  });

  test('a fraudulent writer B cannot accept writer A grant UUID', async () => {
    const issued = await run(intent('issued', writerA));
    await expect(run(intent('accepted', writerB, issued.grantId)))
      .rejects.toThrow(R8MutationRefused);
    expect(memberDb.stateA).toBe('issued');
    expect(memberDb.issuedSeats).toBe(1);
  });

  test('accepting before independent issuance is refused before local SQL', async () => {
    await expect(run(intent('accepted', writerA, randomUUID())))
      .rejects.toThrow(R8MutationRefused);
    expect(memberDb.calls).toBe(0);
  });

  test('acceptance retry after local DB crash does not create a second external event', async () => {
    const issued = await run(intent('issued', writerA));
    const accept = intent('accepted', writerA, issued.grantId);
    memberDb.failNext = true;
    await expect(run(accept)).rejects.toThrow('fictional_member_database_unavailable');
    expect(witness.stateA).toBe('accepted');
    expect(memberDb.stateA).toBe('issued');
    expect((await run(accept, time + 4000)).status).toBe('applied');
    expect(witness.numberOfEvents).toBe(2);
    expect((await run(accept, time + 4500)).status).toBe('replayed');
    expect(memberDb.stateA).toBe('accepted');
  });

  test('external revocation seals BEFORE local SQL, and a DB outage cannot make the grant active again', async () => {
    const issued = await run(intent('issued', writerA));
    await run(intent('accepted', writerA, issued.grantId));
    const revoke = intent('revoked', writerA, issued.grantId);
    memberDb.failNext = true;
    await expect(run(revoke)).rejects.toThrow('fictional_member_database_unavailable');
    expect(witness.stateA).toBe('revoked');
    expect(memberDb.stateA).toBe('accepted');
    await expect(run(intent('accepted', writerA, issued.grantId)))
      .rejects.toThrow(R8MutationRefused);
    const repaired = await run(revoke, time + 3500);
    expect(repaired.status).toBe('applied');
    expect(memberDb.stateA).toBe('revoked');
    expect(witness.numberOfEvents).toBe(3);
    expect((await run(revoke, time + 4500)).status).toBe('replayed');
  });

  test('an old issued/accepted operation ID cannot be re-sealed after a newer revoke', async () => {
    const initial = intent('issued', writerA);
    const issued = await run(initial);
    const accepting = intent('accepted', writerA, issued.grantId);
    await run(accepting);
    const terminal = intent('revoked', writerA, issued.grantId);
    await run(terminal);
    memberDb.deleteLocalGrantForFixture(writerA);
    await expect(run(initial, time + 3000)).rejects.toThrow(R8MutationRefused);
    await expect(run(accepting, time + 4000)).rejects.toThrow(R8MutationRefused);
    expect((await run(terminal, time + 5000)).status).toBe('replayed');
    expect(memberDb.issuedSeats).toBe(1);
    expect(witness.issuedSeats).toBe(1);
  });

  test('a terminal revoked writer cannot issue another grant or occupy a recycled seat', async () => {
    const issuedA = await run(intent('issued', writerA));
    await run(intent('revoked', writerA, issuedA.grantId));
    await run(intent('issued', writerB));
    expect(witness.issuedSeats).toBe(2);
    await expect(run(intent('issued', writerA))).rejects.toThrow(R8MutationRefused);
    await expect(run(intent('issued', writerC))).rejects.toThrow(R8MutationRefused);
  });

  test('a mismatched or absent previously sealed grant ID is never accepted', async () => {
    const issued = await run(intent('issued', writerA));
    await expect(run(intent('accepted', writerA, randomUUID())))
      .rejects.toThrow(R8MutationRefused);
    await expect(run(intent('revoked', writerA, randomUUID())))
      .rejects.toThrow(R8MutationRefused);
    await expect(run(intent('accepted', writerA)))
      .rejects.toThrow(R8MutationRefused);
    await expect(run(intent('issued', writerB, randomUUID())))
      .rejects.toThrow(R8MutationRefused);
    expect(memberDb.grantA).toBe(issued.grantId);
  });

  test('eight concurrent identical requests have exactly one external seal and one local seat', async () => {
    const same = intent('issued', writerA);
    const results = await Promise.all(Array.from({ length: 8 }, () => run(same)));
    expect(results.map((r) => r.grantId)).toEqual(Array(8).fill(results[0].grantId));
    expect(results.filter((r) => r.status === 'applied')).toHaveLength(1);
    expect(results.filter((r) => r.status === 'replayed')).toHaveLength(7);
    expect(witness.numberOfEvents).toBe(1);
    expect(memberDb.issuedSeats).toBe(1);
  });

  test('witness service outage cannot cause even a single local DB call', async () => {
    const outage = {
      seal: async () => { throw new Error('external_r20_offline'); },
    };
    const i = intent('issued', writerA);
    await expect(coordinateR8SealedMutation(i, outage, memberDb, trust, time))
      .rejects.toThrow('external_r20_offline');
    expect(memberDb.calls).toBe(0);
  });

  test('a tampered signed external approval refuses before member DB insertion', async () => {
    const i = intent('issued', writerA);
    const sealed = await witness.seal(i, time);
    const poisoned = {
      seal: async () => ({
        ...sealed,
        claims: { ...sealed.claims, actorId: writerB },
      }),
    };
    await expect(coordinateR8SealedMutation(i, poisoned, memberDb, trust, time))
      .rejects.toThrow(R8MutationRefused);
    expect(memberDb.calls).toBe(0);
  });

  test('an incorrect public key or unsigned receipt is never accepted', async () => {
    const i = intent('issued', writerA);
    const sealed = await witness.seal(i, time);
    const wrongTrust = {
      ...trust,
      publicKeyPem: otherKeys.publicKey.export({
        type: 'spki', format: 'pem',
      }).toString('utf8'),
    };
    expect(() => verifyR8Mutation(sealed, i, wrongTrust, time))
      .toThrow(R8MutationRefused);
    expect(() => verifyR8Mutation({ ...sealed, signature: 'invalid' }, i, trust, time))
      .toThrow(R8MutationRefused);
    expect(memberDb.calls).toBe(0);
  });

  test('signed claims cannot be replayed as another operation ID or actor', async () => {
    const i = intent('issued', writerA);
    const sealed = await witness.seal(i, time);
    expect(() => verifyR8Mutation(sealed, { ...i, operationId: randomUUID() }, trust, time))
      .toThrow(R8MutationRefused);
    expect(() => verifyR8Mutation(sealed, { ...i, actorId: writerB }, trust, time))
      .toThrow(R8MutationRefused);
    expect(() => verifyR8Mutation(sealed, { ...i, memberId: writerB }, trust, time))
      .toThrow(R8MutationRefused);
  });

  test('an accepted grant requires the exact grant generation, never a fresh client UUID', async () => {
    const i = intent('issued', writerA);
    const issued = await witness.seal(i, time);
    const newId = randomUUID();
    expect(() => verifyR8Mutation(issued, { ...i, expectedGrantId: newId }, trust, time))
      .toThrow(R8MutationRefused);
    // An issue should not accept an asserted existing generation either.
    expect(() => verifyR8Mutation(issued, { ...i, expectedGrantId: issued.claims.grantId }, trust, time))
      .toThrow(R8MutationRefused);
  });

  test('stale signed evidence and externally pinned high-water sequence reject rollback', async () => {
    const i = intent('issued', writerA);
    const signedReceipt = await witness.seal(i, time);
    expect(() => verifyR8Mutation(signedReceipt, i, trust, time + 20_000))
      .toThrow(R8MutationRefused);
    expect(() => verifyR8Mutation(signedReceipt, i, {
      ...trust, minimumSequence: 2,
    }, time + 1000)).toThrow(R8MutationRefused);
  });

  test('mismatched signer identity, audience, extra fields and invalid timestamps are refused', async () => {
    const i = intent('issued', writerA);
    const r = await witness.seal(i, time);
    expect(() => verifyR8Mutation(r, i, {
      ...trust, issuer: 'wrong-external-domain',
    }, time)).toThrow(R8MutationRefused);
    for (const change of [
      { audience: 'unrelated-audience' },
      { expiresAtMs: time - 1 },
      { expiresAtMs: time + 120_000 },
      { sequence: 0 },
      { grantId: 'invalid-id' },
    ]) {
      const altered = { ...r, claims: { ...r.claims, ...change } };
      expect(() => verifyR8Mutation(
        altered as R8MutationReceipt, i, trust, time,
      )).toThrow(R8MutationRefused);
    }
    const extended = {
      ...r, claims: { ...r.claims, privateManuscript: 'not permitted' },
    };
    expect(() => verifyR8Mutation(extended as R8MutationReceipt, i, trust, time))
      .toThrow(R8MutationRefused);
  });

  test('generic R8 rejection never echoes a private subject or grant', async () => {
    const i = intent('issued', writerA);
    const r = await witness.seal(i, time);
    try {
      verifyR8Mutation({ ...r, signature: 'invalid' }, i, trust, time);
      throw new Error('fixture refusal expected');
    } catch (e) {
      expect(e).toBeInstanceOf(R8MutationRefused);
      expect(String(e)).not.toContain(writerA);
      expect(String(e)).not.toContain(r.claims.grantId);
    }
  });
});
