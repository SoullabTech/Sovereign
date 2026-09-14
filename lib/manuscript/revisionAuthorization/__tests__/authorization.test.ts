/**
 * STEP 2 · the authorization contract's falsifiers.
 *
 * ⭐ Several of these assert an ABSENCE — no wording field, no head lookup, no
 * inspection-only state. ⛔ An absence asserted in a comment is a promise; here
 * it is a test that fails when the absence ends.
 */
import {
  authorize, guardStillHolds, hydrateAuthorization, occurrences, recordExecution,
  resolveGuard, type ResolvedGuardProof, type RevisionAuthorization,
  type WorkStateReading,
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

const proofOf = (r = READING): ResolvedGuardProof => {
  const g = resolveGuard(CHAIN, r);
  if (!g.ok) throw new Error(`fixture guard failed: ${g.reason}`);
  return g.proof;
};

const authOf = (versionId = 'v2') => {
  const a = authorize({
    id: 'a1', memberId: 'm1', chain: CHAIN, versions: VERSIONS,
    versionId, proof: proofOf(), authorizedAt: '2026-09-14T11:00:00.000Z',
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
    const g = authOf().guard;
    expect(g.baseVersion).toBe(41);
    expect(CHAIN.locus.baseVersion).toBe(40);
  });

  test('⛔⛔ a LocusIdentity cannot be used as a guard — at BOTH levels', () => {
    /* ⚠️ The locus holds every value a guard needs. The first draft of this
       test asserted `a.ok === true` and called the type alone sufficient — a
       cast erases to nothing, so the runtime accepted stale locus values as
       current authority. That is exactly the defect the guard exists to make
       impossible, and it had crept into its own falsifier. */

    // @ts-expect-error — a structurally identical literal is NOT a ResolvedGuardProof
    const compileTime: ResolvedGuardProof = { ...CHAIN.locus, operation: 'replace_exact_text' };
    expect(compileTime).toBeDefined();

    const forged = { ...CHAIN.locus, operation: 'replace_exact_text' as const };
    const a = authorize({
      id: 'a2', memberId: 'm1', chain: CHAIN, versions: VERSIONS, versionId: 'v2',
      proof: forged as unknown as ResolvedGuardProof,
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

  test('a reading of another Work, DRAFT or section refuses', () => {
    expect(resolveGuard(CHAIN, { ...READING, workId: 'w2' }))
      .toEqual({ ok: false, reason: 'work_mismatch' });
    /* ⚠️ The draft check was MISSING until the 2026-09-14 review. The contract
       admitted right-Work · WRONG-DRAFT · right-section, and only the single
       current caller's construction hid it. A contract that is true because of
       who calls it is not true. */
    expect(resolveGuard(CHAIN, { ...READING, draftId: 'd9' }))
      .toEqual({ ok: false, reason: 'draft_mismatch' });
    expect(resolveGuard(CHAIN, { ...READING, sectionId: 's9' }))
      .toEqual({ ok: false, reason: 'section_mismatch' });
  });

  test('⛔ and the draft is checked BEFORE a section that would also mismatch', () => {
    /* Both wrong: the refusal must name the draft, so a caller is told the
       nearest true thing rather than a downstream consequence of it. */
    expect(resolveGuard(CHAIN, { ...READING, draftId: 'd9', sectionId: 's9' }))
      .toEqual({ ok: false, reason: 'draft_mismatch' });
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
      versionId: 'vx', proof: proofOf(), authorizedAt: '2026-09-14T11:00:00.000Z',
    });
    expect(r).toEqual({ ok: false, reason: 'version_foreign_to_chain' });
  });

  test('an unknown version refuses, and another member\'s chain is chain_unknown', () => {
    expect(authorize({
      id: 'a4', memberId: 'm1', chain: CHAIN, versions: VERSIONS, versionId: 'nope',
      proof: proofOf(), authorizedAt: 'x',
    })).toEqual({ ok: false, reason: 'version_unknown' });
    expect(authorize({
      id: 'a5', memberId: 'OTHER', chain: CHAIN, versions: VERSIONS, versionId: 'v2',
      proof: proofOf(), authorizedAt: 'x',
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
    const g = authOf().guard;
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

describe('⭐⭐ the proof is ephemeral; the binding is durable', () => {
  test('the durable authorization round-trips through plain data intact', () => {
    const original = authOf('v3');
    /* ⭐ THE ACTUAL ROUND TRIP — a database gives back plain data, nothing more. */
    const asStored = JSON.parse(JSON.stringify(original));
    const rehydrated = hydrateAuthorization(asStored);
    expect(rehydrated).toEqual(original);
    /* ⛔ And no second reading of the Work was required to get here. */
    expect(rehydrated!.guard.baseVersion).toBe(41);
    expect(rehydrated!.guard.expectedText).toBe(', fixated');
  });

  test('⛔ the proof itself does not survive serialization, by design', () => {
    const p = proofOf();
    /* A proof with a toJSON could be reconstituted from a literal, and a proof
       that can be reconstituted from a literal is not a proof. */
    expect((p as unknown as { toJSON?: unknown }).toJSON).toBeUndefined();
    expect(JSON.parse(JSON.stringify(p)) instanceof Object).toBe(true);
    expect(authorize({
      id: 'aX', memberId: 'm1', chain: CHAIN, versions: VERSIONS, versionId: 'v2',
      proof: JSON.parse(JSON.stringify(p)) as ResolvedGuardProof, authorizedAt: 't',
    })).toEqual({ ok: false, reason: 'malformed' });
  });

  test('⛔⛔ the hydrator cannot manufacture a proof — a stored row cannot authorize', () => {
    const stored = JSON.parse(JSON.stringify(authOf()));
    const rehydrated = hydrateAuthorization(stored)!;
    /* The binding is back. There is no route from it to a new authorizing act. */
    expect(authorize({
      id: 'aY', memberId: 'm1', chain: CHAIN, versions: VERSIONS, versionId: 'v4',
      proof: rehydrated.guard as unknown as ResolvedGuardProof, authorizedAt: 't',
    })).toEqual({ ok: false, reason: 'malformed' });

    const surface = Object.keys(require('../contract'));
    expect(surface.filter((k) => /proof/i.test(k) && k !== 'resolveGuard')).toEqual([]);
  });

  test('a malformed or half-accepted row hydrates as null, never as a partial fact', () => {
    const ok = JSON.parse(JSON.stringify(authOf()));
    expect(hydrateAuthorization({ ...ok, guard: { ...ok.guard, baseVersion: 'x' } })).toBeNull();
    expect(hydrateAuthorization({ ...ok, acceptedAt: 't', resultingVersion: null })).toBeNull();
    expect(hydrateAuthorization({ ...ok, guard: undefined })).toBeNull();
  });
});

describe('⛔⛔ the proof cannot be forged OR tampered with — the runtime claim', () => {
  /* ⚠️ FOUNDER REVIEW: the first implementation held the binding ON the proof
     as a `readonly` field and checked `instanceof`. All three attacks below
     SUCCEEDED against it, while the file's comment claimed they could not.
     Issuance is now a module-private WeakMap. */

  test('P1 · mutating a legitimate proof after resolve cannot alter its binding', () => {
    const proof = proofOf();
    /* ⭐ The attack either THROWS (frozen) or silently does nothing. Both are
       passes; what must never happen is that it takes effect. The first draft
       of this test assumed silence and failed on the throw — the implementation
       was stronger than its own falsifier. */
    const attack = (f: () => void) => { try { f(); } catch { /* frozen */ } };
    attack(() => {
      (proof as unknown as Record<string, unknown>).binding =
        { ...READING, baseVersion: 999, expectedText: 'something else' };
    });
    attack(() => Object.assign(proof as object, { baseVersion: 999 }));

    const a = authorize({
      id: 'p1', memberId: 'm1', chain: CHAIN, versions: VERSIONS, versionId: 'v2',
      proof, authorizedAt: 't',
    });
    expect(a.ok).toBe(true);
    if (!a.ok) return;
    expect(a.authorization.guard.baseVersion).toBe(41);
    expect(a.authorization.guard.expectedText).toBe(', fixated');
  });

  test('P2 · Object.create(getPrototypeOf(realProof)) cannot authorize', () => {
    const real = proofOf();
    const forged = Object.create(Object.getPrototypeOf(real));
    forged.binding = {
      workId: 'w1', draftId: 'd1', baseVersion: 999, targetSectionId: 's1',
      expectedText: 'whatever I like', operation: 'replace_exact_text',
    };
    /* ⭐ It passes `instanceof` — which is exactly why `instanceof` was the
       wrong test — and it is still refused, because the mint never saw it. */
    expect(forged instanceof (real as object).constructor).toBe(true);
    expect(authorize({
      id: 'p2', memberId: 'm1', chain: CHAIN, versions: VERSIONS, versionId: 'v2',
      proof: forged as ResolvedGuardProof, authorizedAt: 't',
    })).toEqual({ ok: false, reason: 'malformed' });
  });

  test('P3 · attacking the proof AFTER authorization cannot alter authorization.guard', () => {
    const proof = proofOf();
    const a = authorize({
      id: 'p3', memberId: 'm1', chain: CHAIN, versions: VERSIONS, versionId: 'v2',
      proof, authorizedAt: 't',
    });
    if (!a.ok) throw new Error('fixture');
    const before = { ...a.authorization.guard };

    const attack = (f: () => void) => { try { f(); } catch { /* frozen */ } };
    attack(() => {
      (proof as unknown as Record<string, unknown>).binding = { baseVersion: 999 };
    });
    attack(() => {
      (a.authorization.guard as unknown as Record<string, unknown>).baseVersion = 999;
    });

    expect({ ...a.authorization.guard }).toEqual(before);
    expect(a.authorization.guard.baseVersion).toBe(41);
  });

  test('⛔ and the proof exposes no binding to read in the first place', () => {
    const proof = proofOf();
    expect((proof as unknown as { binding?: unknown }).binding).toBeUndefined();
    /* ⭐ Nothing reflective reaches the binding: not own keys, not JSON. */
    expect(Object.keys(proof as object)).toEqual([]);
    expect(JSON.stringify(proof)).toBe('{}');
    expect(Object.isFrozen(proof)).toBe(true);
  });
});

describe('⭐ replace_exact_text — the honest primitive', () => {
  test('the guard names a REPLACEMENT, because the fixtures are replacements', () => {
    expect(authOf('v2').guard.operation).toBe('replace_exact_text');
    /* v2 is ", steady" — a replacement, which the old vocabulary called a delete. */
    expect(VERSIONS.find((x) => x.id === 'v2')!.replacementText).toBe(', steady');
  });

  test('⭐ a deletion is the ordinary special case, not a second operation', () => {
    /* v3's replacementText is '' — still replace_exact_text. */
    expect(authOf('v3').guard.operation).toBe('replace_exact_text');
    expect(VERSIONS.find((x) => x.id === 'v3')!.replacementText).toBe('');
  });

  test('⛔ the vocabulary stays closed — no insert/move/merge/split', () => {
    const src = require('fs').readFileSync(
      require('path').join(__dirname, '../contract.ts'), 'utf8');
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '');
    for (const banned of ['insert_', 'move_', 'merge_', 'split_', 'reorder_', 'rename_']) {
      expect(code).not.toContain(banned);
    }
  });
});

describe('⭐⭐ the receipt is whole or absent BY TYPE', () => {
  test('a half-written receipt does not typecheck', () => {
    // @ts-expect-error — acceptedAt without resultingVersion is unrepresentable
    const half: RevisionAuthorization = { ...authOf(), acceptedAt: 't', resultingVersion: null };
    expect(half).toBeDefined();
  });

  test('and a half-written row hydrates as null at runtime too', () => {
    const ok = JSON.parse(JSON.stringify(authOf()));
    expect(hydrateAuthorization({ ...ok, acceptedAt: 't' })).toBeNull();
    expect(hydrateAuthorization({ ...ok, resultingVersion: 42 })).toBeNull();
  });
});
