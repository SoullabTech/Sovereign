/**
 * F1a-F1e / F1o - THE CAPABILITY BOUNDARY, BEHAVIORALLY.
 *
 * NO SOURCE SCANS HERE. Every assertion runs the real `discloseUnder` and
 * observes what it did - in particular whether the load closure was ever
 * invoked. That distinction is the architecture: under procedural discipline an
 * unauthorized read fails a check; under architecture C it never reaches the
 * query at all.
 */

import {
  discloseUnder, mintDisclosureAuthority, readDisclosed,
  type DisclosureAuthority, type DisclosureLocus,
} from '../disclosureAuthority';

const MEMBER = 'member-1';
const WORK = 'work-1';
const SECTION: DisclosureLocus = { scopeKind: 'section', sectionRef: 'sec-A' };

/** A load that records whether it was ever reached. */
function countingLoad(text: string | null = 'the authored characters') {
  const calls = { n: 0 };
  return { calls, load: async () => { calls.n += 1; return text; } };
}

const grant = (locus: DisclosureLocus = SECTION, memberId = MEMBER, workRef = WORK) =>
  mintDisclosureAuthority({ memberId, workRef, locus });

describe('F1a - ABSENCE: no capability, no load', () => {
  it('refuses an unminted object and never reaches the query', async () => {
    const { calls, load } = countingLoad();
    // A plausible forgery: right shape, right values, wrong provenance.
    const forged = { grant: { memberId: MEMBER, workRef: WORK, locus: SECTION }, spent: false };

    const out = await discloseUnder(
      forged as unknown as DisclosureAuthority,
      { memberId: MEMBER, workRef: WORK, locus: SECTION },
      load,
    );

    expect(out).toEqual({ kind: 'refused', reason: 'not_minted' });
    // THE LOAD WAS NEVER CALLED. Not "called and discarded".
    expect(calls.n).toBe(0);
  });
});

describe('F1b/F1c - the authorized path, and its fail-closed shape', () => {
  it('discloses under a matching capability and yields readable content', async () => {
    const { calls, load } = countingLoad('here are the words');
    const out = await discloseUnder(grant(), { memberId: MEMBER, workRef: WORK, locus: SECTION }, load);

    expect(out.kind).toBe('disclosed');
    if (out.kind !== 'disclosed') throw new Error('unreachable');
    expect(readDisclosed(out.content)).toBe('here are the words');
    expect(calls.n).toBe(1);
  });

  it('returns unavailable - not disclosed content - when the material cannot be read', async () => {
    const { load } = countingLoad(null);
    const out = await discloseUnder(grant(), { memberId: MEMBER, workRef: WORK, locus: SECTION }, load);
    expect(out).toEqual({ kind: 'unavailable' });
  });

  it('refuses to read anything it did not seal', () => {
    // The downstream half: a hand-made object cannot masquerade as disclosed prose.
    expect(() => readDisclosed({ text: 'smuggled' } as never)).toThrow(/not disclosed content/);
  });
});

describe('F1d - MISMATCH: a genuine capability for the wrong thing', () => {
  const cases: ReadonlyArray<readonly [string, { memberId: string; workRef: string; locus: DisclosureLocus }, string]> = [
    ['wrong member', { memberId: 'member-2', workRef: WORK, locus: SECTION }, 'member_mismatch'],
    ['wrong Work', { memberId: MEMBER, workRef: 'work-2', locus: SECTION }, 'work_mismatch'],
    ['wrong scope kind', { memberId: MEMBER, workRef: WORK, locus: { scopeKind: 'whole_work' } }, 'scope_kind_mismatch'],
    ['wrong section', { memberId: MEMBER, workRef: WORK, locus: { scopeKind: 'section', sectionRef: 'sec-B' } }, 'locus_mismatch'],
  ];

  it.each(cases)('%s -> refused, and the query is never reached', async (_name, request, reason) => {
    const { calls, load } = countingLoad();
    // GENUINELY MINTED. Provenance is not the failing half - applicability is.
    const out = await discloseUnder(grant(), request, load);

    expect(out).toEqual({ kind: 'refused', reason });
    expect(calls.n).toBe(0);
  });

  it('refuses a passage whose offsets differ, though its section matches', async () => {
    const authorized: DisclosureLocus = { scopeKind: 'passage', sectionRef: 'sec-A', range: { start: 10, end: 20 } };
    const { calls, load } = countingLoad();
    const out = await discloseUnder(
      grant(authorized),
      { memberId: MEMBER, workRef: WORK, locus: { scopeKind: 'passage', sectionRef: 'sec-A', range: { start: 10, end: 21 } } },
      load,
    );
    expect(out).toEqual({ kind: 'refused', reason: 'locus_mismatch' });
    expect(calls.n).toBe(0);
  });
});

describe('F1e - REUSE: one shot', () => {
  it('a spent capability cannot authorize a second load', async () => {
    const authority = grant();
    const first = countingLoad();
    expect((await discloseUnder(authority, { memberId: MEMBER, workRef: WORK, locus: SECTION }, first.load)).kind)
      .toBe('disclosed');

    const second = countingLoad();
    const out = await discloseUnder(authority, { memberId: MEMBER, workRef: WORK, locus: SECTION }, second.load);

    expect(out).toEqual({ kind: 'refused', reason: 'spent' });
    expect(second.calls.n).toBe(0);
  });

  it('is spent even when the load failed - a failed crossing leaves no reusable authority', async () => {
    const authority = grant();
    expect((await discloseUnder(authority, { memberId: MEMBER, workRef: WORK, locus: SECTION }, async () => null)).kind)
      .toBe('unavailable');

    const retry = countingLoad();
    const out = await discloseUnder(authority, { memberId: MEMBER, workRef: WORK, locus: SECTION }, retry.load);
    expect(out).toEqual({ kind: 'refused', reason: 'spent' });
    expect(retry.calls.n).toBe(0);
  });
});

describe('F1o - EVIDENCE-SET EXACTNESS: membership, not position', () => {
  const set = (members: string[]): DisclosureLocus => ({ scopeKind: 'evidence_set', members });
  const A = 'section A', C = 'section C', G = 'passage G 0 10';

  const attempt = async (authorized: string[], requested: string[]) => {
    const { calls, load } = countingLoad();
    const out = await discloseUnder(
      grant(set(authorized)), { memberId: MEMBER, workRef: WORK, locus: set(requested) }, load,
    );
    return { out, called: calls.n };
  };

  it('GREEN - same members, different order: ordering is not authority', async () => {
    const { out, called } = await attempt([A, C], [C, A]);
    expect(out.kind).toBe('disclosed');
    expect(called).toBe(1);
  });

  it('RED - duplicate multiplicity changed: [A,C] does not authorize [A,A,C]', async () => {
    // THE MULTISET RULING DOING REAL WORK. A `new Set()` implementation passes
    // every other case in this block and fails only here - which is why this
    // assertion exists. Nothing in the evidence contract forbids an observation
    // resting on the same reference twice.
    const { out, called } = await attempt([A, C], [A, A, C]);
    expect(out).toEqual({ kind: 'refused', reason: 'locus_mismatch' });
    expect(called).toBe(0);
  });

  it.each([
    ['an added member', [A, C], [A, C, G]],
    ['a removed member', [A, C, G], [A, C]],
    ['a substituted member', [A, C], [A, G]],
    ["another observation's set", [A, C], [G]],
  ])('RED - %s -> refused, query never reached', async (_n, authorized, requested) => {
    const { out, called } = await attempt(authorized, requested);
    expect(out).toEqual({ kind: 'refused', reason: 'locus_mismatch' });
    expect(called).toBe(0);
  });
});
