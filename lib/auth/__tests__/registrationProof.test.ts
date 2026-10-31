import {
  RegistrationProofError,
  consumeRegistrationProof,
  issueRegistrationProof,
  lockRegistrationProof,
  normalizeAuthEmail,
  registrationProofDigest,
} from '../registrationProof';

type Row = Record<string, unknown>;

function fakeClient(seed: Partial<Row> = {}) {
  let stored: Row | null = null;
  let consumed = false;
  const calls: Array<{ sql: string; params: unknown[] }> = [];
  const client = {
    async query(sql: string, params: unknown[] = []) {
      calls.push({ sql, params });
      if (sql.includes('INSERT INTO auth_registration_proofs')) {
        stored = {
          id: params[0], challenge_id: params[1], email: params[2], purpose: params[3],
          proof_digest: params[4], expires_at: params[5], consumed_at: null, revoked_at: null,
          ...seed,
        };
        return { rows: [], rowCount: 1 };
      }
      if (sql.includes('FROM auth_registration_proofs')) {
        return { rows: stored ? [stored] : [], rowCount: stored ? 1 : 0 };
      }
      if (sql.includes('UPDATE auth_registration_proofs')) {
        if (consumed) return { rows: [], rowCount: 0 };
        consumed = true;
        if (stored) stored.consumed_at = new Date().toISOString();
        return { rows: [{ id: stored?.id }], rowCount: 1 };
      }
      throw new Error(`unexpected SQL: ${sql}`);
    },
  };
  return { client, calls, getStored: () => stored, resetConsumed: () => { consumed = false; } };
}

describe('AUTH-RETURN-01 registration proof', () => {
  it('normalizes the proof subject email', () => {
    expect(normalizeAuthEmail(' Fiction@Example.Invalid ')).toBe('fiction@example.invalid');
  });

  it('stores only a digest and returns the raw proof once', async () => {
    const db = fakeClient();
    const issued = await issueRegistrationProof(db.client as never, {
      challengeId: '11111111-1111-4111-8111-111111111111',
      email: 'Fiction@Example.Invalid',
      now: new Date('2026-10-28T12:00:00Z'),
    });
    const row = db.getStored();
    expect(issued.proof).toMatch(/^[A-Za-z0-9_-]{40,160}$/);
    expect(row?.email).toBe('fiction@example.invalid');
    expect(row?.proof_digest).toBe(registrationProofDigest(issued.proof));
    expect(JSON.stringify(row)).not.toContain(issued.proof);
  });

  it('consumes once for the exact email and member', async () => {
    const db = fakeClient();
    const issued = await issueRegistrationProof(db.client as never, {
      challengeId: '11111111-1111-4111-8111-111111111111',
      email: 'fiction@example.invalid',
      now: new Date('2026-10-28T12:00:00Z'),
    });
    const result = await consumeRegistrationProof(db.client as never, {
      proof: issued.proof, email: 'FICTION@example.invalid',
      memberId: '22222222-2222-4222-8222-222222222222',
      now: new Date('2026-10-28T12:05:00Z'),
    });
    expect(result.challengeId).toBe('11111111-1111-4111-8111-111111111111');
    const update = db.calls.find(({ sql }) => sql.includes('UPDATE auth_registration_proofs'));
    expect(update?.params[1]).toBe('22222222-2222-4222-8222-222222222222');

    await expect(consumeRegistrationProof(db.client as never, {
      proof: issued.proof, email: 'fiction@example.invalid',
      memberId: '33333333-3333-4333-8333-333333333333',
      now: new Date('2026-10-28T12:06:00Z'),
    })).rejects.toMatchObject({ code: 'REGISTRATION_PROOF_CONSUMED' });
  });

  it('can validate registration authority without consuming it before member creation', async () => {
    const db = fakeClient();
    const issued = await issueRegistrationProof(db.client as never, {
      challengeId: '11111111-1111-4111-8111-111111111111',
      email: 'fiction@example.invalid',
      now: new Date('2026-10-28T12:00:00Z'),
    });
    const locked = await lockRegistrationProof(db.client as never, {
      proof: issued.proof, email: 'fiction@example.invalid',
      now: new Date('2026-10-28T12:01:00Z'),
    });
    expect(locked.challengeId).toBe('11111111-1111-4111-8111-111111111111');
    expect(db.getStored()?.consumed_at).toBeNull();

    await consumeRegistrationProof(db.client as never, {
      proof: issued.proof, email: 'fiction@example.invalid',
      memberId: '22222222-2222-4222-8222-222222222222',
      now: new Date('2026-10-28T12:01:00Z'),
    });
    expect(db.getStored()?.consumed_at).not.toBeNull();
  });

  it('refuses email mismatch, expiry, revocation and malformed proofs', async () => {
    const mismatch = fakeClient();
    const issued = await issueRegistrationProof(mismatch.client as never, {
      challengeId: '11111111-1111-4111-8111-111111111111',
      email: 'fiction@example.invalid',
      now: new Date('2026-10-28T12:00:00Z'),
    });
    await expect(consumeRegistrationProof(mismatch.client as never, {
      proof: issued.proof, email: 'other@example.invalid', memberId: 'member',
      now: new Date('2026-10-28T12:01:00Z'),
    })).rejects.toMatchObject({ code: 'REGISTRATION_PROOF_EMAIL_MISMATCH' });

    const expired = fakeClient({ expires_at: '2026-10-28T12:01:00Z' });
    const expiredProof = await issueRegistrationProof(expired.client as never, {
      challengeId: '11111111-1111-4111-8111-111111111111', email: 'fiction@example.invalid',
      now: new Date('2026-10-28T12:00:00Z'),
    });
    await expect(consumeRegistrationProof(expired.client as never, {
      proof: expiredProof.proof, email: 'fiction@example.invalid', memberId: 'member',
      now: new Date('2026-10-28T12:02:00Z'),
    })).rejects.toMatchObject({ code: 'REGISTRATION_PROOF_EXPIRED' });

    const revoked = fakeClient({ revoked_at: '2026-10-28T12:01:00Z' });
    const revokedProof = await issueRegistrationProof(revoked.client as never, {
      challengeId: '11111111-1111-4111-8111-111111111111', email: 'fiction@example.invalid',
      now: new Date('2026-10-28T12:00:00Z'),
    });
    await expect(consumeRegistrationProof(revoked.client as never, {
      proof: revokedProof.proof, email: 'fiction@example.invalid', memberId: 'member',
      now: new Date('2026-10-28T12:02:00Z'),
    })).rejects.toMatchObject({ code: 'REGISTRATION_PROOF_REVOKED' });

    await expect(consumeRegistrationProof(revoked.client as never, {
      proof: 'short', email: 'fiction@example.invalid', memberId: 'member',
    })).rejects.toBeInstanceOf(RegistrationProofError);
  });
});
