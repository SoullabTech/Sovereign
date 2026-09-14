/**
 * STEP 2 · the authorization contract's falsifiers.
 *
 * ⭐ Several of these assert an ABSENCE — no wording field, no head lookup, no
 * inspection-only state. ⛔ An absence asserted in a comment is a promise; here
 * it is a test that fails when the absence ends.
 */
import {
  authorize, guardStillHolds, occurrences, recordExecution, resolveGuard,
  type ExecutionGuard, type WorkStateReading,
} from '../contract';
import type { ProposalChain, ProposalVersion } from '@/lib/manuscript/proposalChain/contract';

const CHAIN: ProposalChain = {
  id: 'c1', memberId: 'm1',
  locus: {
    workId: 'w1', draftId: 'd1',
    /* ⭐ DELIBERATELY STALE. The Work below is at 41. */
    baseVersion: 40,
    targetSectionId: 's1', expectedText: ', fixated',
  },
  openedAt: '2026-09-14T10:00:00.000Z',
};

const v = (id: string, author: 'maia' | 'member', supersedes: string | null, text: string):
  ProposalVersion => ({
    id, chainId: 'c1', supersedes, replacementText: text, author,
    authoredAt: '2026-09-14T10:00:00.000Z',
  });

/* ⚠️ NON-ALTERNATING on purpose, carried from Step 1: an alternating fixture
   cannot discriminate an implementation that infers from position. */
const VERSIONS = [
  v('v1', 'maia', null, ', held'),
  v('v2', 'maia', 'v1', ', steady'),
  v('v3', 'member', 'v2', ''),
  v('v4', 'member', 'v3', ', still'),
];

const READING: WorkStateReading = {
  workId: 'w1', draftId: 'd1', version: 41, sectionId: 's1',
  textAtTarget: 'He was there, fixated, and the river ran.',
};

const guardOf = (r = READING): ExecutionGuard => {
  const g = resolveGuard(CHAIN, r);
  if (!g.ok) throw new Error(`fixture guard failed: ${g.reason}`);
  return g.guard;
};

const authOf = (versionId = 'v2') => {
  const a = authorize({
    id: 'a1', memberId: 'm1', chain: CHAIN, versions: VERSIONS,
    versionId, guard: guardOf(), authorizedAt: '2026-09-14T11:00:00.000Z',
  });
  if (!a.ok) throw new Error(`fixture authorize failed: ${a.reason}`);
  return a.authorization;
};

describe('⛔ what an authorization CANNOT carry', () => {
  test('⭐⭐ no field a replacement, rationale or author could travel in', () => {
    const keys = Object.keys(authOf()).sort();
    expect(keys).toEqual([
      'acceptedAt', 'authorizedAt', 'guard', 'id', 'memberId',
      'proposalChainId', 'proposalVersionId', 'resultingVersion',
    ]);
    /* The authorization names v2; v2's wording is NOWHERE on it. */
    expect(JSON.stringify(authOf())).not.toContain(', steady');
  });

  test('⭐⭐ no inspection-only state — existence IS the permission', () => {
    const flat = JSON.stringify(authOf()).toLowerCase();
    expect(flat).not.toContain('inspection');
    expect(flat).not.toContain('execution_authority');
    expect(flat).not.toContain('executionauthority');
  });

  test('⛔ the module exports no way to authorize a chain without a version', () => {
    const surface = Object.keys(require('../contract')).sort();
    expect(surface.filter((k) => /head|latest|current|newest/i.test(k))).toEqual([]);
  });
});

describe('⭐⭐ the guard is resolved from the WORK, never copied from the chain', () => {
  test('the guard carries the READING\'s version, not the chain\'s baseVersion', () => {
    const g = guardOf();
    expect(g.baseVersion).toBe(41);
    expect(CHAIN.locus.baseVersion).toBe(40);
  });

  test('⛔⛔ a LocusIdentity cannot be used as a guard — at BOTH levels', () => {
    /* ⚠️ The locus holds every value a guard needs. The first draft of this
       test asserted `a.ok === true` and called the type alone sufficient — a
       cast erases to nothing, so the runtime accepted stale locus values as
       current authority. That is exactly the defect the guard exists to make
       impossible, and it had crept into its own falsifier. */

    // @ts-expect-error — a structurally identical literal is NOT an ExecutionGuard
    const compileTime: ExecutionGuard = { ...CHAIN.locus, operation: 'delete_exact_text' };
    expect(compileTime).toBeDefined();

    const forged = { ...CHAIN.locus, operation: 'delete_exact_text' as const };
    const a = authorize({
      id: 'a2', memberId: 'm1', chain: CHAIN, versions: VERSIONS, versionId: 'v2',
      guard: forged as unknown as ExecutionGuard,
      authorizedAt: '2026-09-14T11:00:00.000Z',
    });
    expect(a).toEqual({ ok: false, reason: 'malformed' });
  });

  test('the Work no longer holding the expected text refuses', () => {
    const moved = { ...READING, textAtTarget: 'He was there and the river ran.' };
    expect(resolveGuard(CHAIN, moved)).toEqual({ ok: false, reason: 'expected_text_absent' });
  });

  test('⭐ ambiguity refuses — a permission that cannot say WHICH is not one', () => {
    const twice = { ...READING, textAtTarget: 'a, fixated b, fixated c' };
    expect(resolveGuard(CHAIN, twice)).toEqual({ ok: false, reason: 'expected_text_ambiguous' });
  });

  test('a reading of another Work or another section refuses', () => {
    expect(resolveGuard(CHAIN, { ...READING, workId: 'w2' }))
      .toEqual({ ok: false, reason: 'work_mismatch' });
    expect(resolveGuard(CHAIN, { ...READING, sectionId: 's9' }))
      .toEqual({ ok: false, reason: 'section_mismatch' });
  });
});

describe('⭐ an authorization names ONE EXACT VERSION', () => {
  test('a version the member did not choose is not the one recorded', () => {
    expect(authOf('v2').proposalVersionId).toBe('v2');
    expect(authOf('v4').proposalVersionId).toBe('v4');
  });

  test('⭐ authorizing a version that is NOT the head is lawful', () => {
    /* A writer may authorize MAIA's v2 after writing a v4 they abandoned. */
    expect(authOf('v2').proposalVersionId).toBe('v2');
  });

  test('a version from another chain refuses', () => {
    const foreign: ProposalVersion = { ...v('vx', 'maia', null, 'x'), chainId: 'other' };
    const r = authorize({
      id: 'a3', memberId: 'm1', chain: CHAIN, versions: [...VERSIONS, foreign],
      versionId: 'vx', guard: guardOf(), authorizedAt: '2026-09-14T11:00:00.000Z',
    });
    expect(r).toEqual({ ok: false, reason: 'version_foreign_to_chain' });
  });

  test('an unknown version refuses, and another member\'s chain is chain_unknown', () => {
    expect(authorize({
      id: 'a4', memberId: 'm1', chain: CHAIN, versions: VERSIONS, versionId: 'nope',
      guard: guardOf(), authorizedAt: 'x',
    })).toEqual({ ok: false, reason: 'version_unknown' });
    expect(authorize({
      id: 'a5', memberId: 'OTHER', chain: CHAIN, versions: VERSIONS, versionId: 'v2',
      guard: guardOf(), authorizedAt: 'x',
    })).toEqual({ ok: false, reason: 'chain_unknown' });
  });
});

describe('⭐ the execution receipt', () => {
  test('is whole — both fields or neither', () => {
    const a = authOf();
    expect([a.acceptedAt, a.resultingVersion]).toEqual([null, null]);
    const done = recordExecution(a, '2026-09-14T12:00:00.000Z', 42);
    expect(done.ok && [done.authorization.acceptedAt, done.authorization.resultingVersion])
      .toEqual(['2026-09-14T12:00:00.000Z', 42]);
  });

  test('⛔ a permission is single-use', () => {
    const a = authOf();
    const once = recordExecution(a, 't', 42);
    expect(once.ok).toBe(true);
    if (!once.ok) return;
    expect(recordExecution(once.authorization, 't2', 43))
      .toEqual({ ok: false, reason: 'already_accepted' });
  });
});

describe('⭐⭐ RULING 6 · discussable and executable are independent', () => {
  test('the guard lapses when the Work moves', () => {
    const g = guardOf();
    expect(guardStillHolds(g, READING)).toBe(true);
    expect(guardStillHolds(g, { ...READING, version: 42 })).toBe(false);
    expect(guardStillHolds(g, { ...READING, textAtTarget: 'nothing here' })).toBe(false);
  });

  test('⛔ and NOTHING in this module answers whether the proposal is discussable', () => {
    const surface = Object.keys(require('../contract'));
    expect(surface.filter((k) => /discussable|workab|resolveProposalWork/i.test(k))).toEqual([]);
  });
});

describe('occurrences', () => {
  test('counts without overlap and refuses the empty needle', () => {
    expect(occurrences('aaaa', 'aa')).toBe(2);
    expect(occurrences('abc', '')).toBe(0);
  });
});
