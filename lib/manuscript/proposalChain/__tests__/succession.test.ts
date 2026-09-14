/**
 * STEP 1 · the falsifiers.
 *
 * ⭐⭐ THE ACCEPTANCE QUESTIONS, and every test below serves one of them:
 *
 *   Can we reconstruct, WITHOUT INFERENCE, exactly who authored every staged
 *   formulation, what it succeeded, which locus it belongs to, and which exact
 *   version — if any — was ultimately authorized?
 *
 *   Can a later MAIA revision exist without making the earlier MAIA
 *   formulation disappear, or making Kelly appear to have authored MAIA's
 *   revision?
 *
 * ⛔ The second is the one the mutable `reviewed` blob of
 * `manuscript_structure_proposals` cannot answer, and it is why this substrate
 * is new rather than an extension of that object.
 */
import {
  appendVersion, authorizes, authorship, headOf, lineage, predecessorOf,
  rootOf, validateChain,
} from '../succession';
import type {
  ProposalChain, ProposalVersion, VersionAuthor,
} from '../contract';

const CHAIN: ProposalChain = {
  id: 'chain-A',
  memberId: 'member-1',
  locus: {
    workId: 'work-1',
    draftId: 'draft-1',
    baseVersion: 40,
    targetSectionId: 'sec-23',
    expectedText: ', fixated',
  },
  openedAt: '2026-09-14T09:00:00Z',
};

const v = (
  id: string, supersedes: string | null, author: VersionAuthor,
  over: Partial<ProposalVersion> = {},
): ProposalVersion => ({
  id, chainId: 'chain-A', supersedes, author,
  replacementText: `text-${id}`,
  authoredAt: '2026-09-14T09:00:00Z',
  ...over,
});

/** MAIA v1 → Kelly v2 → MAIA v3 → Kelly v4. */
const FOUR = [
  v('v1', null, 'maia'),
  v('v2', 'v1', 'member'),
  v('v3', 'v2', 'maia'),
  v('v4', 'v3', 'member'),
];

describe('⭐⭐ the four answers, none of them inferred', () => {
  it('who authored every formulation', () => {
    expect(authorship(FOUR)).toEqual(['maia', 'member', 'maia', 'member']);
  });

  it('⭐⭐ and authorship is READ, not inferred from position', () => {
    /**
     * ⚠️ THE CANONICAL FIXTURE CANNOT PROVE THIS, and its first mutation run
     * showed it. `MAIA → Kelly → MAIA → Kelly` alternates perfectly, so an
     * implementation that simply returned "maia for even, member for odd"
     * passed every assertion above. A fixture homogeneous with the defect
     * cannot detect it — the FOCUS-W3 lesson, in a new material.
     *
     * ⭐ The discriminating case is also a real one, and the model permits it
     * deliberately: MAIA offering a second wording before the writer responds,
     * or the writer producing two of their own in a row. There is no
     * consecutive-same-author refusal, and there should not be — two
     * formulations from one author are two formulations, not an overwrite.
     */
    const consecutive = [
      v('a', null, 'maia'),
      v('b', 'a', 'maia'),
      v('c', 'b', 'member'),
      v('d', 'c', 'member'),
      v('e', 'd', 'maia'),
    ];
    expect(validateChain(CHAIN, consecutive).ok).toBe(true);
    expect(authorship(consecutive))
      .toEqual(['maia', 'maia', 'member', 'member', 'maia']);
  });

  it('what each one succeeded', () => {
    expect(predecessorOf(FOUR[3], FOUR)?.id).toBe('v3');
    expect(predecessorOf(FOUR[2], FOUR)?.id).toBe('v2');
    expect(predecessorOf(FOUR[0], FOUR)).toBeNull();
  });

  it('which locus it belongs to', () => {
    /* ⭐ The locus is the CHAIN's. No version carries one, so no version can
       disagree with another about where it lives. */
    expect(CHAIN.locus.targetSectionId).toBe('sec-23');
    expect(CHAIN.locus.expectedText).toBe(', fixated');
    for (const ver of FOUR) {
      expect(ver).not.toHaveProperty('targetSectionId');
      expect(ver).not.toHaveProperty('expectedText');
      expect(ver).not.toHaveProperty('baseVersion');
    }
  });

  it('which exact version was authorized', () => {
    const a = authorizes(CHAIN, FOUR, { chainId: 'chain-A', versionId: 'v4' });
    expect(a.ok && a.value.id).toBe('v4');
    expect(a.ok && a.value.author).toBe('member');
  });

  it('⭐⭐ a later MAIA revision does not erase the earlier one, nor reattribute it', () => {
    const ids = lineage(FOUR).map((x) => x.id);
    expect(ids).toEqual(['v1', 'v2', 'v3', 'v4']);
    /* Both MAIA formulations survive, distinctly. */
    const maia = FOUR.filter((x) => x.author === 'maia').map((x) => x.id);
    expect(maia).toEqual(['v1', 'v3']);
    /* ⛔ And Kelly did not author MAIA's revision. */
    expect(FOUR.find((x) => x.id === 'v3')!.author).toBe('maia');
  });

  it('⛔ order comes from succession, not from the clock', () => {
    /* Same instant on every version, and a LATER timestamp on the root. A
       substrate that sorted by time would reverse this chain. */
    const skewed = [
      v('v1', null, 'maia', { authoredAt: '2026-09-14T23:59:00Z' }),
      v('v2', 'v1', 'member', { authoredAt: '2026-09-14T09:00:00Z' }),
      v('v3', 'v2', 'maia', { authoredAt: '2026-09-14T09:00:00Z' }),
    ];
    expect(lineage(skewed).map((x) => x.id)).toEqual(['v1', 'v2', 'v3']);
  });
});

describe('the head and the root are found, never flagged', () => {
  it('head is the version nobody supersedes', () => {
    expect(headOf(FOUR)?.id).toBe('v4');
    expect(rootOf(FOUR)?.id).toBe('v1');
  });

  it('an empty chain has neither', () => {
    expect(headOf([])).toBeNull();
    expect(rootOf([])).toBeNull();
    expect(lineage([])).toEqual([]);
  });

  it('⭐ order of the array does not decide the answer', () => {
    const shuffled = [FOUR[2], FOUR[0], FOUR[3], FOUR[1]];
    expect(headOf(shuffled)?.id).toBe('v4');
    expect(lineage(shuffled).map((x) => x.id)).toEqual(['v1', 'v2', 'v3', 'v4']);
  });
});

describe('⛔ the refusals', () => {
  const refuse = (versions: readonly ProposalVersion[]) =>
    validateChain(CHAIN, versions);

  it('a version with no explicit author', () => {
    const bad = [{ ...v('v1', null, 'maia'), author: undefined as never }];
    expect(refuse(bad)).toEqual({ ok: false, reason: 'author_missing' });
    const wrong = [{ ...v('v1', null, 'maia'), author: 'system' as never }];
    expect(refuse(wrong)).toEqual({ ok: false, reason: 'author_missing' });
  });

  it('a successor pointing across chains — which is also across loci', () => {
    /* ⭐ A chain IS a locus, so a foreign chain is a foreign locus. There is no
       separate check because there is no way to be in one and not the other. */
    const bad = [v('v1', null, 'maia'), { ...v('v2', 'v1', 'member'), chainId: 'chain-B' }];
    expect(refuse(bad)).toEqual({ ok: false, reason: 'foreign_chain' });
  });

  it('a predecessor that is not in this chain', () => {
    const bad = [v('v1', null, 'maia'), v('v2', 'ghost', 'member')];
    expect(refuse(bad)).toEqual({ ok: false, reason: 'predecessor_unknown' });
  });

  it('duplicate version identity', () => {
    const bad = [v('v1', null, 'maia'), v('v1', null, 'member')];
    expect(refuse(bad)).toEqual({ ok: false, reason: 'duplicate_version' });
  });

  it('two roots for one chain', () => {
    const bad = [v('v1', null, 'maia'), v('v2', null, 'member')];
    expect(refuse(bad)).toEqual({ ok: false, reason: 'multiple_roots' });
  });

  it('no root at all', () => {
    const bad = [v('v1', 'v2', 'maia'), v('v2', 'v1', 'member')];
    expect(refuse(bad)).toEqual({ ok: false, reason: 'no_root' });
  });

  it('a self-predecessor', () => {
    const bad = [v('v1', null, 'maia'), v('v2', 'v2', 'member')];
    expect(refuse(bad)).toEqual({ ok: false, reason: 'self_predecessor' });
  });

  it('⭐ a cycle downstream of a real root', () => {
    /* ⚠️ THIS ASSERTION CONTRADICTED ITS OWN NAME on first run: it expected
       `branched` under a test named "a cycle". The implementation returned
       `cycle` and was right — v3 and v4 supersede each other, so nothing is
       superseded twice and nothing branches; they are simply unreachable from
       the root. The expectation was corrected, not the code. */
    const bad = [
      v('v1', null, 'maia'),
      v('v2', 'v1', 'member'),
      v('v3', 'v4', 'maia'),
      v('v4', 'v3', 'member'),
    ];
    expect(refuse(bad)).toEqual({ ok: false, reason: 'cycle' });
  });

  it('⭐ a chain that is a tree, not a line', () => {
    const bad = [
      v('v1', null, 'maia'),
      v('v2', 'v1', 'member'),
      v('v3', 'v1', 'maia'),
    ];
    expect(refuse(bad)).toEqual({ ok: false, reason: 'branched' });
  });

  it('⭐ an unreachable pair with one root and no branch is a cycle', () => {
    const bad = [
      v('v1', null, 'maia'),
      v('v2', 'v3', 'member'),
      v('v3', 'v2', 'maia'),
    ];
    expect(refuse(bad)).toEqual({ ok: false, reason: 'cycle' });
  });

  it('an authorization naming a version from another chain', () => {
    expect(authorizes(CHAIN, FOUR, { chainId: 'chain-B', versionId: 'v4' }))
      .toEqual({ ok: false, reason: 'authorization_foreign_version' });
    expect(authorizes(CHAIN, FOUR, { chainId: 'chain-A', versionId: 'ghost' }))
      .toEqual({ ok: false, reason: 'authorization_foreign_version' });
  });

  it('⛔ an editorial ruling cannot be a version, by shape', () => {
    /* The ruling reference carries no wording, no rationale and no author, so
       it cannot be mistaken for a formulation. Asserted over the VALUE, since
       the type is erased at runtime and a cast could smuggle one in. */
    const ruling = { decisionChainId: 'decision-1' };
    for (const field of ['replacementText', 'rationale', 'author', 'supersedes']) {
      expect(ruling).not.toHaveProperty(field);
    }
    const governed: ProposalChain = { ...CHAIN, governedBy: ruling };
    expect(validateChain(governed, FOUR).ok).toBe(true);
  });
});

describe('⛔ append never replaces', () => {
  it('a version that already exists is refused', () => {
    expect(appendVersion(CHAIN, FOUR, v('v3', 'v4', 'member')))
      .toEqual({ ok: false, reason: 'version_exists' });
  });

  it('⭐ a successor must follow the head, not an earlier version', () => {
    /* Appending onto v2 would fork the chain and produce two candidates for
       "the version the writer chose". */
    expect(appendVersion(CHAIN, FOUR, v('v5', 'v2', 'maia')))
      .toEqual({ ok: false, reason: 'not_successor_of_head' });
  });

  it('a well-formed successor extends the chain and keeps every predecessor', () => {
    const r = appendVersion(CHAIN, FOUR, v('v5', 'v4', 'maia'));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.map((x) => x.id)).toEqual(['v1', 'v2', 'v3', 'v4', 'v5']);
    expect(authorship(r.value)).toEqual(['maia', 'member', 'maia', 'member', 'maia']);
    /* ⛔ The input was not mutated. */
    expect(FOUR).toHaveLength(4);
  });

  it('the first version must be a root', () => {
    expect(appendVersion(CHAIN, [], v('v1', null, 'maia')).ok).toBe(true);
    expect(appendVersion(CHAIN, [], v('v1', 'ghost', 'maia')))
      .toEqual({ ok: false, reason: 'predecessor_unknown' });
  });

  it('a foreign-chain candidate is refused', () => {
    expect(appendVersion(CHAIN, FOUR, { ...v('v5', 'v4', 'maia'), chainId: 'chain-B' }))
      .toEqual({ ok: false, reason: 'foreign_chain' });
  });
});

describe('the censused scenarios', () => {
  it('the writer rejects MAIA and writes their own — v1 survives', () => {
    const r = appendVersion(CHAIN, [v('v1', null, 'maia')], v('v2', 'v1', 'member'));
    expect(r.ok && r.value.map((x) => `${x.id}:${x.author}`))
      .toEqual(['v1:maia', 'v2:member']);
  });

  it('MAIA revises after the writer — and her earlier wording is still readable', () => {
    const after = appendVersion(CHAIN, FOUR.slice(0, 2), v('v3', 'v2', 'maia'));
    expect(after.ok).toBe(true);
    if (!after.ok) return;
    expect(after.value.find((x) => x.id === 'v1')?.replacementText).toBe('text-v1');
  });

  it('⭐ one ruling, three independent chains, three acceptance states', () => {
    const ruling = { decisionChainId: 'campfire' };
    const chains = ['A', 'B', 'C'].map((k) => ({
      ...CHAIN, id: `chain-${k}`, governedBy: ruling,
      locus: { ...CHAIN.locus, targetSectionId: `sec-${k}` },
    }));
    const versionsFor = (k: string) => [
      { ...v(`${k}1`, null, 'maia'), chainId: `chain-${k}` },
      { ...v(`${k}2`, `${k}1`, 'member'), chainId: `chain-${k}` },
    ];

    for (const c of chains) {
      expect(validateChain(c, versionsFor(c.id.slice(-1))).ok).toBe(true);
    }
    /* ⭐ "use A2 · keep mine at B · revise C again" — three states, and no
       object anywhere claims a single acceptance for all three. */
    expect(authorizes(chains[0], versionsFor('A'), { chainId: 'chain-A', versionId: 'A2' }).ok)
      .toBe(true);
    expect(authorizes(chains[1], versionsFor('B'), { chainId: 'chain-B', versionId: 'A2' }).ok)
      .toBe(false);
  });

  it('⛔ a stale Work makes the CHAIN stale, never a version', () => {
    /* The base version is a locus fact. No version carries one, so nothing in
       the succession history can go stale independently of the chain. */
    expect(CHAIN.locus.baseVersion).toBe(40);
    for (const ver of FOUR) expect(ver).not.toHaveProperty('baseVersion');
  });
});
