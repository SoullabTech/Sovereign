/**
 * HOUSE-STUDIO-CIRCULATION-01R1 — Work-context continuity: laws + lethality.
 *
 * Choice resolves context, not ontology. Each law is a predicate over a
 * resolver, so it can be run against the real module AND against a named
 * defeat candidate — a plausible, competent, wrong implementation. A law that
 * no wrong implementation fails is not a law, it is a description.
 */

import {
  resolveSituatedWorkContext,
  resolveWorkArrival,
  asWorkContext,
  studioArrivalFromHouse,
  situatedManuscriptAddress,
  readStudioWorkParam,
  type SituatedWorkContext,
} from '../situatedWork';
import { declaringWorks, resolveWorkContext } from '../workContext';
import type { LivingWork, LivingWorksPhase } from '../useLivingWorks';

const work = (id: string, manuscripts: string[], updatedAt = '2026-09-01T00:00:00Z'): LivingWork => ({
  id,
  title: `Work ${id}`,
  purpose: null,
  form: null,
  stage: null,
  manuscriptState: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt,
  expressions: manuscripts.map((m, i) => ({
    expressionType: 'manuscript',
    expressionId: m,
    declaredAt: `2026-0${(i % 9) + 1}-01T00:00:00Z`,
  })),
  materials: [],
});

type Resolver = (
  phase: LivingWorksPhase,
  works: readonly LivingWork[],
  m: string | null,
  w: string | null,
) => SituatedWorkContext;

// ── Fixtures ────────────────────────────────────────────────────────────────
const W = work('W', ['M']);
const W2 = work('W2', ['M'], '2026-09-29T00:00:00Z'); // most recently updated
const OTHER = work('OTHER', ['X']);
const PLURAL = [W2, W, OTHER]; // W2 first AND most recent: both guesses point away from W

// ── Laws (predicates) ───────────────────────────────────────────────────────
const LAWS: Record<string, (r: Resolver) => boolean> = {
  // The chosen belonging is inhabited, even though M is structurally plural.
  'L1-explicit-valid-context-honoured': (r) => {
    const c = r('ready', PLURAL, 'M', 'W');
    return c.kind === 'work' && c.work.id === 'W' && c.authority === 'member_explicit';
  },
  // Without a choice, plurality stays ambiguous — the WS2-03B rule is not weakened.
  'L2-ambiguity-preserved-without-choice': (r) => {
    const c = r('ready', PLURAL, 'M', null);
    return c.kind === 'ambiguous' && c.works.map((w) => w.id).sort().join() === 'W,W2';
  },
  // A Work the member does not hold (unknown / foreign) confers nothing.
  'L3-unowned-work-never-trusted': (r) => {
    const c = r('ready', PLURAL, 'M', 'FOREIGN');
    return c.kind === 'ambiguous';
  },
  // A held Work that does not declare M confers nothing (M↔W must validate).
  'L4-undeclared-pair-never-trusted': (r) => {
    const c = r('ready', PLURAL, 'M', 'OTHER');
    return c.kind === 'ambiguous';
  },
  // Withdrawal: once W stops declaring M, the same URL stops validating.
  'L5-withdrawn-declaration-does-not-survive': (r) => {
    const withdrawn = [W2, work('W', []), OTHER];
    const c = r('ready', withdrawn, 'M', 'W');
    return c.kind === 'work' && c.work.id === 'W2' && c.authority === 'relationship_inferred';
  },
  // Explicit never masquerades as inference, nor inference as explicit.
  'L6-authority-truthful': (r) => {
    const single = r('ready', [W, OTHER], 'M', null);
    const chosen = r('ready', [W, OTHER], 'M', 'W');
    return (
      single.kind === 'work' && single.authority === 'relationship_inferred' &&
      chosen.kind === 'work' && chosen.authority === 'member_explicit'
    );
  },
  // Choice rewrites no structure: declarations are not mutated.
  'L7-choice-resolves-context-not-ontology': (r) => {
    const works = [work('W2', ['M']), work('W', ['M'])];
    const before = JSON.stringify(works);
    r('ready', works, 'M', 'W');
    return JSON.stringify(works) === before && declaringWorks(works, 'M').length === 2;
  },
  // Assert nothing before declarations are read.
  'L8-unknown-until-ready': (r) => r('loading', PLURAL, 'M', 'W').kind === 'unknown',
};

// ── Defeat candidates ───────────────────────────────────────────────────────
const inferOnly: Resolver = (phase, works, m) => {
  const c = resolveWorkContext(phase, works, m);
  return c.kind === 'work' ? { ...c, authority: 'relationship_inferred' } : c;
};

const CANDIDATES: Record<string, { resolver: Resolver; dies: string }> = {
  // Ignores the member's act entirely: WS2-03B as it stood.
  'DC1-choice-ignored': { resolver: inferOnly, dies: 'L1-explicit-valid-context-honoured' },
  // Resolves plurality by taking the first declaring Work.
  'DC2-first-row-default': {
    resolver: (p, works, m, w) => {
      if (p !== 'ready') return { kind: 'unknown' };
      if (!m) return { kind: 'none' };
      const d = declaringWorks(works, m);
      const chosen = w ? d.find((x) => x.id === w) : undefined;
      if (chosen) return { kind: 'work', work: chosen, authority: 'member_explicit' };
      return d.length ? { kind: 'work', work: d[0], authority: 'relationship_inferred' } : { kind: 'none' };
    },
    dies: 'L2-ambiguity-preserved-without-choice',
  },
  // Resolves plurality by recency.
  'DC3-recency-default': {
    resolver: (p, works, m) => {
      if (p !== 'ready') return { kind: 'unknown' };
      if (!m) return { kind: 'none' };
      const d = [...declaringWorks(works, m)].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      return d.length ? { kind: 'work', work: d[0], authority: 'relationship_inferred' } : { kind: 'none' };
    },
    dies: 'L2-ambiguity-preserved-without-choice',
  },
  // Trusts the URL: any carried id becomes the context.
  'DC4-url-trusted': {
    resolver: (p, works, m, w) => {
      if (p !== 'ready') return { kind: 'unknown' };
      if (w) {
        return { kind: 'work', work: { ...work(w, []), title: null }, authority: 'member_explicit' };
      }
      return resolveSituatedWorkContext(p, works, m, null);
    },
    dies: 'L3-unowned-work-never-trusted',
  },
  // Checks ownership but not the M↔W relationship.
  'DC5-ownership-without-relationship': {
    resolver: (p, works, m, w) => {
      if (p !== 'ready') return { kind: 'unknown' };
      const owned = w ? works.find((x) => x.id === w) : undefined;
      if (owned) return { kind: 'work', work: owned, authority: 'member_explicit' };
      return resolveSituatedWorkContext(p, works, m, null);
    },
    dies: 'L4-undeclared-pair-never-trusted',
  },
  // Remembers the chosen Work beyond its validity (a "last Work" store).
  'DC6-stored-last-work': (() => {
    const memory = new Map<string, LivingWork>();
    const resolver: Resolver = (p, works, m, w) => {
      if (p !== 'ready') return { kind: 'unknown' };
      if (!m) return { kind: 'none' };
      const live = resolveSituatedWorkContext(p, works, m, w);
      if (live.kind === 'work' && live.authority === 'member_explicit') memory.set(m, live.work);
      const kept = memory.get(m);
      if (kept && w === kept.id) return { kind: 'work', work: kept, authority: 'member_explicit' };
      return live;
    };
    // Prime the store with the pre-withdrawal visit, as a real session would.
    resolver('ready', [W2, W, OTHER], 'M', 'W');
    return { resolver, dies: 'L5-withdrawn-declaration-does-not-survive' };
  })(),
  // Collapses authority: everything the Studio names is "explicit".
  'DC7-authority-collapsed': {
    resolver: (p, works, m, w) => {
      const c = resolveSituatedWorkContext(p, works, m, w);
      return c.kind === 'work' ? { ...c, authority: 'member_explicit' } : c;
    },
    dies: 'L6-authority-truthful',
  },
  // Treats the click as a durable declaration: prunes W's rivals.
  'DC8-choice-rewrites-ontology': {
    resolver: (p, works, m, w) => {
      if (m && w && works.some((x) => x.id === w)) {
        for (const x of works as LivingWork[]) {
          if (x.id !== w) x.expressions = x.expressions.filter((e) => e.expressionId !== m);
        }
      }
      return resolveSituatedWorkContext(p, works, m, w);
    },
    dies: 'L7-choice-resolves-context-not-ontology',
  },
  // Trusts the carried id before declarations are known.
  'DC9-eager-before-ready': {
    resolver: (p, works, m, w) =>
      p !== 'ready' && w
        ? { kind: 'work', work: work(w, []), authority: 'member_explicit' }
        : resolveSituatedWorkContext(p, works, m, w),
    dies: 'L8-unknown-until-ready',
  },
};

describe('situated Work context — laws hold on the real resolver', () => {
  for (const [name, law] of Object.entries(LAWS)) {
    it(name, () => expect(law(resolveSituatedWorkContext)).toBe(true));
  }
});

describe('lethality — every defeat candidate dies on its named law', () => {
  for (const [name, { resolver, dies }] of Object.entries(CANDIDATES)) {
    it(`${name} is killed by ${dies}`, () => {
      expect(LAWS[dies](resolver)).toBe(false);
    });
  }
  it('every law kills at least one candidate', () => {
    const killed = new Set(Object.values(CANDIDATES).map((c) => c.dies));
    expect(Object.keys(LAWS).filter((l) => !killed.has(l))).toEqual([]);
  });
});

describe('Work arrival — reverse lookup over the same declarations', () => {
  it('absent for an unknown or foreign Work, disclosing nothing', () => {
    expect(resolveWorkArrival('ready', PLURAL, 'FOREIGN')).toEqual({ kind: 'absent' });
    expect(resolveWorkArrival('ready', PLURAL, null)).toEqual({ kind: 'absent' });
  });
  it('unknown before declarations are read', () => {
    expect(resolveWorkArrival('loading', PLURAL, 'W').kind).toBe('unknown');
  });
  it('no-manuscript is a correct state', () => {
    const a = resolveWorkArrival('ready', [work('E', [])], 'E');
    expect(a.kind).toBe('no-manuscript');
  });
  it('one declared manuscript', () => {
    const a = resolveWorkArrival('ready', PLURAL, 'W');
    expect(a).toMatchObject({ kind: 'one', manuscriptId: 'M' });
  });
  it('several: all returned, declaration order kept, no default chosen', () => {
    const a = resolveWorkArrival('ready', [work('S', ['B', 'A', 'B', 'C'])], 'S');
    expect(a.kind).toBe('several');
    if (a.kind === 'several') expect(a.manuscriptIds).toEqual(['B', 'A', 'C']);
    expect(a).not.toHaveProperty('manuscriptId');
  });
  it('ignores non-manuscript expressions', () => {
    const w = work('N', ['M']);
    w.expressions.push({ expressionType: 'journal', expressionId: 'J', declaredAt: '2026-01-01T00:00:00Z' });
    expect(resolveWorkArrival('ready', [w], 'N')).toMatchObject({ kind: 'one', manuscriptId: 'M' });
  });
});

describe('addresses — carry identity only', () => {
  it('House doorway carries the Work id and nothing else', () => {
    const href = studioArrivalFromHouse('W 1');
    expect(href).toBe('/writers-studio?from=house&work=W%201');
    expect(href).not.toMatch(/member/i);
  });
  it('situated address carries the pair; unsituated carries M alone', () => {
    expect(situatedManuscriptAddress('M', 'W')).toBe('/writers-studio?mode=write&m=M&work=W');
    expect(situatedManuscriptAddress('M', null)).toBe('/writers-studio?mode=write&m=M');
  });
  it('round trip: the carried pair resolves back to the explicit context', () => {
    const href = situatedManuscriptAddress('M', 'W');
    const params = new URLSearchParams(href.split('?')[1]);
    const c = resolveSituatedWorkContext('ready', PLURAL, params.get('m'), readStudioWorkParam(params));
    expect(c).toMatchObject({ kind: 'work', authority: 'member_explicit' });
  });
  it('blank work param is absent', () => {
    expect(readStudioWorkParam('?work=%20')).toBeNull();
    expect(readStudioWorkParam('?m=M')).toBeNull();
  });
  it('structural view drops authority for legacy consumers', () => {
    const c = resolveSituatedWorkContext('ready', PLURAL, 'M', 'W');
    expect(asWorkContext(c)).toEqual({ kind: 'work', work: W });
  });
});
