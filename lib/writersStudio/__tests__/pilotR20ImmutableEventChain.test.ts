import {
  R20_CHAIN_GENESIS, R20_CHAIN_PURPOSE, R20ChainRefused,
  r20ChainHash, verifyR20AnchoredChain,
  type R20ChainAction, type R20ChainCore, type R20ChainEvent,
  type R20TrustedHead,
} from '../pilotR20ImmutableEventChain';

const grantA = '11111111-1111-4111-8111-111111111111';
const grantB = '22222222-2222-4222-8222-222222222222';
const grantC = '33333333-3333-4333-8333-333333333333';
const subjectA = 'a'.repeat(64);
const subjectB = 'b'.repeat(64);
const clock = 1_795_000_000_000;

function append(
  prior: readonly R20ChainEvent[],
  grantId: string,
  action: R20ChainAction,
  subjectCommitment = subjectA,
  override: Partial<R20ChainCore> = {},
): R20ChainEvent[] {
  const core: R20ChainCore = {
    version: 1,
    purpose: R20_CHAIN_PURPOSE,
    sequence: prior.length + 1,
    grantId,
    action,
    subjectCommitment,
    occurredAtMs: clock - 20_000 + prior.length * 1000,
    previousHash: prior.length ? prior[prior.length - 1].eventHash : R20_CHAIN_GENESIS,
    ...override,
  };
  return [...prior, { ...core, eventHash: r20ChainHash(core) }];
}

function sample(): R20ChainEvent[] {
  let chain: R20ChainEvent[] = [];
  chain = append(chain, grantA, 'issued');
  chain = append(chain, grantA, 'accepted');
  chain = append(chain, grantB, 'issued', subjectB);
  chain = append(chain, grantB, 'accepted', subjectB);
  return chain;
}
function anchor(chain: readonly R20ChainEvent[]): R20TrustedHead {
  return { lastSequence: chain.length, lastHash: chain[chain.length - 1].eventHash };
}
function verify(chain: readonly R20ChainEvent[], head = anchor(chain)) {
  return verifyR20AnchoredChain(chain, head, clock);
}
const refused = (action: () => unknown) => expect(action).toThrow(R20ChainRefused);

describe('WS R6 content-free externally anchored append-only event chain', () => {
  test('two fictional grants can be issued and accepted with a pinned, gap-free chain', () => {
    const chain = sample();
    const r = verify(chain);
    expect(r.lastSequence).toBe(4);
    expect(r.seatsEverIssued).toBe(2);
    expect(r.grants).toEqual([
      { grantId: grantA, subjectCommitment: subjectA, state: 'accepted' },
      { grantId: grantB, subjectCommitment: subjectB, state: 'accepted' },
    ]);
    expect(Object.isFrozen(r)).toBe(true);
    expect(Object.isFrozen(r.grants)).toBe(true);
  });

  test('revocation is terminal and never releases an issued canary seat', () => {
    const chain = append(sample(), grantA, 'revoked');
    const r = verify(chain);
    expect(r.seatsEverIssued).toBe(2);
    expect(r.grants.find((g) => g.grantId === grantA)?.state).toBe('revoked');
    refused(() => verify(append(chain, grantC, 'issued')));
    refused(() => verify(append(chain, grantA, 'accepted')));
    refused(() => verify(append(chain, grantA, 'issued')));
    refused(() => verify(append(chain, grantA, 'revoked')));
  });

  test('the same writer cannot take both initial canary seats under different grant UUIDs', () => {
    const first = append([], grantA, 'issued', subjectA);
    refused(() => verify(append(first, grantB, 'issued', subjectA)));
    // Different member commitments retain the separate two-writer canary.
    expect(verify(append(first, grantB, 'issued', subjectB)).seatsEverIssued).toBe(2);
  });

  test('a third distinct canary issue is denied even without revocation', () => {
    refused(() => verify(append(sample(), grantC, 'issued')));
  });

  test('writer consent cannot be invented without a prior issued grant', () => {
    refused(() => verify(append([], grantA, 'accepted')));
    refused(() => verify(append([], grantA, 'revoked')));
  });

  test('subject commitment cannot change when accepting or revoking grant', () => {
    refused(() => verify(append(
      append([], grantA, 'issued'), grantA, 'accepted', subjectB,
    )));
  });

  test('replayed acceptance cannot renew an already accepted grant', () => {
    const chain = append(append([], grantA, 'issued'), grantA, 'accepted');
    refused(() => verify(append(chain, grantA, 'accepted')));
  });

  test('a removed final revocation is caught by the independently verified head', () => {
    const current = append(sample(), grantA, 'revoked');
    const preservedHead = anchor(current);
    refused(() => verify(current.slice(0, -1), preservedHead));
  });

  test('a removed middle event cannot be hidden by adjusting local sequence alone', () => {
    const chain = sample();
    const modified = chain.filter((event) => event.sequence !== 2);
    refused(() => verify(modified, anchor(chain)));
  });

  test('a reordered or duplicated event is refused', () => {
    const chain = sample();
    refused(() => verify([chain[1], chain[0], chain[2], chain[3]]));
    refused(() => verify([chain[0], chain[0], chain[2], chain[3]]));
  });

  test('mutating prose-like extra fields cannot be silently ignored', () => {
    const chain = sample();
    const edited = [
      { ...chain[0], manuscript_excerpt: 'This must never enter the authority ledger' },
      ...chain.slice(1),
    ] as R20ChainEvent[];
    refused(() => verify(edited));
  });

  test('wrong subject, action or grant-ID mutation is refused', () => {
    const chain = sample();
    for (const change of [
      { subjectCommitment: subjectB },
      { action: 'revoked' as R20ChainAction },
      { grantId: grantC },
    ]) {
      const edited = [{ ...chain[0], ...change }, ...chain.slice(1)];
      refused(() => verify(edited));
    }
  });

  test('even a recomputed edited hash chain is refused against the external head', () => {
    const chain = sample();
    const alternate: R20ChainEvent[] = [];
    for (const event of chain) {
      const { eventHash: _ignored, ...core } = event;
      const modified = {
        ...core,
        ...(event.sequence === 2 ? { occurredAtMs: event.occurredAtMs + 250 } : {}),
        previousHash: alternate.length
          ? alternate[alternate.length - 1].eventHash : R20_CHAIN_GENESIS,
      };
      alternate.push({ ...modified, eventHash: r20ChainHash(modified) });
    }
    expect(verify(alternate, anchor(alternate)).seatsEverIssued).toBe(2);
    refused(() => verify(alternate, anchor(chain)));
  });

  test('a false head hash, wrong sequence, or unknown anchor property is refused', () => {
    const chain = sample();
    refused(() => verify(chain, { ...anchor(chain), lastHash: 'a'.repeat(64) }));
    refused(() => verify(chain, { ...anchor(chain), lastSequence: 3 }));
    const anchorWithExtra = { ...anchor(chain), secret: 'not allowed' };
    refused(() => verify(chain, anchorWithExtra));
  });

  test('gaps, invalid digest formats and future timestamps are refused', () => {
    const chain = sample();
    refused(() => verify([{ ...chain[0], sequence: 2 }, ...chain.slice(1)]));
    refused(() => verify([{ ...chain[0], eventHash: 'not-a-hash' }, ...chain.slice(1)]));
    refused(() => verify([{ ...chain[0], previousHash: 'not-a-hash' }, ...chain.slice(1)]));
    refused(() => verify([{ ...chain[0], occurredAtMs: clock + 5000 }, ...chain.slice(1)]));
  });

  test('missing ledger or unbounded ledger length is refused', () => {
    refused(() => verifyR20AnchoredChain([], {
      lastSequence: 0, lastHash: R20_CHAIN_GENESIS,
    }, clock));
    const chain = sample();
    const excessive = Array.from({ length: 2050 }, (_, i) =>
      ({ ...chain[0], sequence: i + 1 }));
    refused(() => verifyR20AnchoredChain(
      excessive, { lastSequence: excessive.length, lastHash: chain[0].eventHash }, clock,
    ));
  });

  test('a stale prefix with its OWN stale anchor can pass; independent latest-head custody is mandatory', () => {
    const current = append(sample(), grantA, 'revoked');
    const prefix = current.slice(0, -1);
    // Negative architectural result: hashing does NOT prove the head is current.
    const old = verify(prefix, anchor(prefix));
    expect(old.grants.find((g) => g.grantId === grantA)?.state).toBe('accepted');
    refused(() => verify(prefix, anchor(current)));
  });
});
