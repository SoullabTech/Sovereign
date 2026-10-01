/**
 * HOUSE-STUDIO-CIRCULATION-01R1 · H1 — arrival through a governed crossing.
 *
 *   explicit Work  >  member choice  >  existing Studio fallback
 *
 * Recency is an algorithmic substitute for relationship; the House already
 * supplied the relationship. Each law runs against the real resolver AND a
 * named wrong implementation, which must die on it.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  resolveStudioArrival,
  studioArrivalFromHouse,
  type ArrivalManuscript,
  type HeldManuscriptsPhase,
  type StudioArrival,
} from '../situatedWork';
import type { LivingWork, LivingWorksPhase } from '../useLivingWorks';

const work = (id: string, manuscripts: string[]): LivingWork => ({
  id, title: `Work ${id}`, purpose: null, form: null, stage: null, manuscriptState: null,
  createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
  expressions: manuscripts.map((m) => ({ expressionType: 'manuscript', expressionId: m, declaredAt: '2026-01-01T00:00:00Z' })),
  materials: [],
});

type Resolver = (
  wp: LivingWorksPhase, works: readonly LivingWork[],
  hp: HeldManuscriptsPhase, held: readonly ArrivalManuscript[], w: string | null,
) => StudioArrival;

// Held list is in RECENCY order (as useCurrentManuscript returns it): NEWEST first.
const HELD: ArrivalManuscript[] = [
  { id: 'NEWEST', title: 'Newest writing' },
  { id: 'B', title: 'Introduction' },
  { id: 'A', title: 'Chapter 10 — The Alchemical Self' },
  { id: 'C', title: 'Future revision notes' },
];
const EA = work('EA', ['A', 'B', 'C']);     // declared A, B, C
const SOLO = work('SOLO', ['A']);
const EMPTY = work('EMPTY', []);
const GHOST = work('GHOST', ['DELETED']);    // declaration outlived its manuscript
const WORKS = [EA, SOLO, EMPTY, GHOST];

const LAWS: Record<string, (r: Resolver) => boolean> = {
  'A1-one-manuscript-named-not-chosen-by-recency': (r) => {
    const a = r('ready', WORKS, 'ready', HELD, 'SOLO');
    return a.kind === 'one' && a.manuscript.id === 'A';
  },
  'A2-several-offered-all-in-declaration-order': (r) => {
    const a = r('ready', WORKS, 'ready', HELD, 'EA');
    return a.kind === 'several' && a.manuscripts.map((m) => m.id).join() === 'A,B,C';
  },
  'A3-no-manuscript-creates-nothing': (r) => {
    const held = [...HELD];
    const a = r('ready', WORKS, 'ready', held, 'EMPTY');
    return a.kind === 'no-manuscript' && held.length === HELD.length;
  },
  'A4-unowned-work-confers-nothing-and-discloses-nothing': (r) => {
    const a = r('ready', WORKS, 'ready', HELD, 'FOREIGN');
    return a.kind === 'fallback' && Object.keys(a).join() === 'kind';
  },
  'A5-unheld-manuscript-never-offered': (r) => {
    const a = r('ready', WORKS, 'ready', HELD, 'GHOST');
    return a.kind === 'no-manuscript';
  },
  'A6-nothing-carried-leaves-studio-unchanged': (r) =>
    r('ready', WORKS, 'ready', HELD, null).kind === 'fallback',
  'A7-no-verdict-before-declarations-read': (r) =>
    r('loading', WORKS, 'ready', HELD, 'EA').kind === 'unknown' &&
    r('ready', WORKS, 'loading', HELD, 'EA').kind === 'unknown',
  // Real-stack walk, 2026-09-30: a signed-out member arriving with work= was held
  // on "Opening…" forever. A FAILED read is not a pending one.
  'A8-failed-read-defers-to-studio-never-hangs': (r) =>
    r('unauthorized', WORKS, 'ready', HELD, 'EA').kind === 'fallback' &&
    r('error', WORKS, 'ready', HELD, 'EA').kind === 'fallback' &&
    r('ready', WORKS, 'unauthorized', HELD, 'EA').kind === 'fallback',
  // A failed manuscripts read must never masquerade as an empty Work (which
  // would offer Begin this Work and create a duplicate).
  'A9-failed-manuscripts-read-is-not-an-empty-work': (r) =>
    r('ready', WORKS, 'error', [], 'EA').kind === 'fallback' &&
    r('ready', WORKS, 'none', [], 'EMPTY').kind === 'no-manuscript',
};

const recencyPick: Resolver = (wp, works, hp, held, w) => {
  const a = resolveStudioArrival(wp, works, hp, held, w);
  if (a.kind === 'one' || a.kind === 'several') {
    return { kind: 'one', work: a.work, manuscript: held[0] }; // "the most recent is the current book"
  }
  return a;
};

const CANDIDATES: Record<string, { resolver: Resolver; dies: string }> = {
  'DA1-recency-substitutes-for-relationship': { resolver: recencyPick, dies: 'A1-one-manuscript-named-not-chosen-by-recency' },
  'DA2-first-preselected': {
    resolver: (...args) => {
      const a = resolveStudioArrival(...args);
      return a.kind === 'several' ? { kind: 'one', work: a.work, manuscript: a.manuscripts[0] } : a;
    },
    dies: 'A2-several-offered-all-in-declaration-order',
  },
  'DA2b-resorted-by-recency': {
    resolver: (...args) => {
      const a = resolveStudioArrival(...args);
      if (a.kind !== 'several') return a;
      const rank = (id: string) => HELD.findIndex((h) => h.id === id);
      return { ...a, manuscripts: [...a.manuscripts].sort((x, y) => rank(x.id) - rank(y.id)) };
    },
    dies: 'A2-several-offered-all-in-declaration-order',
  },
  'DA3-silent-creation': {
    resolver: (wp, works, hp, held, w) => {
      const a = resolveStudioArrival(wp, works, hp, held, w);
      if (a.kind !== 'no-manuscript') return a;
      const made = { id: 'NEW', title: null };
      (held as ArrivalManuscript[]).push(made);
      return { kind: 'one', work: a.work, manuscript: made };
    },
    dies: 'A3-no-manuscript-creates-nothing',
  },
  'DA4-refusal-discloses': {
    resolver: (wp, works, hp, held, w) => {
      const a = resolveStudioArrival(wp, works, hp, held, w);
      return a.kind === 'fallback' && w
        ? ({ kind: 'fallback', refused: w } as unknown as StudioArrival)
        : a;
    },
    dies: 'A4-unowned-work-confers-nothing-and-discloses-nothing',
  },
  'DA5-declaration-trusted-over-holding': {
    resolver: (wp, works, hp, held, w) => {
      const wk = works.find((x) => x.id === w);
      if (wp === 'ready' && hp === 'ready' && wk) {
        const ids = wk.expressions.map((e) => e.expressionId);
        if (ids.length === 1) return { kind: 'one', work: wk, manuscript: { id: ids[0], title: null } };
      }
      return resolveStudioArrival(wp, works, hp, held, w);
    },
    dies: 'A5-unheld-manuscript-never-offered',
  },
  'DA6-arrival-always-on': {
    resolver: (wp, works, hp, held, w) =>
      w ? resolveStudioArrival(wp, works, hp, held, w) : { kind: 'no-manuscript', work: works[0] },
    dies: 'A6-nothing-carried-leaves-studio-unchanged',
  },
  // The shipped H1 behaviour: every non-ready phase reported as `unknown`.
  'DA8-failure-reported-as-pending': {
    resolver: (wp, works, hp, held, w) => {
      if (!w) return { kind: 'fallback' };
      if (wp !== 'ready' || hp === 'loading') return { kind: 'unknown' };
      return resolveStudioArrival(wp, works, hp, held, w);
    },
    dies: 'A8-failed-read-defers-to-studio-never-hangs',
  },
  // The shipped H1 behaviour: a failed manuscripts read treated as an empty pool.
  'DA9-failed-read-as-empty-work': {
    resolver: (wp, works, hp, held, w) => {
      const a = resolveStudioArrival(wp, works, hp === 'error' ? 'ready' : hp, hp === 'error' ? [] : held, w);
      return a;
    },
    dies: 'A9-failed-manuscripts-read-is-not-an-empty-work',
  },
  'DA7-eager-verdict': {
    resolver: (wp, works, hp, held, w) =>
      resolveStudioArrival('ready', works, hp === 'loading' ? 'ready' : hp, held, w),
    dies: 'A7-no-verdict-before-declarations-read',
  },
};

describe('Studio arrival — laws hold on the real resolver', () => {
  for (const [name, law] of Object.entries(LAWS)) {
    it(name, () => expect(law(resolveStudioArrival)).toBe(true));
  }
});

describe('Studio arrival — every defeat candidate dies on its named law', () => {
  for (const [name, { resolver, dies }] of Object.entries(CANDIDATES)) {
    it(`${name} is killed by ${dies}`, () => expect(LAWS[dies](resolver)).toBe(false));
  }
  it('every law kills at least one candidate', () => {
    const killed = new Set(Object.values(CANDIDATES).map((c) => c.dies));
    expect(Object.keys(LAWS).filter((l) => !killed.has(l))).toEqual([]);
  });
});

/* ── Source-level guards on the surfaces ─────────────────────────────────── */

const src = (rel: string) => readFileSync(join(__dirname, '..', '..', '..', rel), 'utf8');
const code = (rel: string) =>
  src(rel).replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

describe('surfaces', () => {
  it('House uses the one doorway builder only for H1-admitted members and otherwise preserves plain Studio entry', () => {
    const house = code('app/house/page.tsx');
    expect(house).toMatch(/const houseStudioH1Admitted = canUseHouseStudioH1\(member\.id\);/);
    expect(house).toMatch(/href=\{houseWritingHref\(houseStudioH1Admitted, work\.id, studioArrivalFromHouse\)\}/);
    expect(house).toMatch(/href=\{houseWritingHref\(houseStudioH1Admitted, null, studioArrivalFromHouse\)\}/);
    expect(studioArrivalFromHouse('x')).not.toMatch(/member|intent|thread|title/i);
  });

  it('the chooser pre-selects nothing and cannot enter before a choice', () => {
    const view = code('app/dev/writers-studio-pc3-live/P4R1WorkArrival.tsx');
    expect(view).toMatch(/useState<string \| null>\(null\)/);
    expect(view).not.toMatch(/defaultChecked/);
    expect(view).toMatch(/disabled=\{busy \|\| chosen === null\}/);
  });

  it('the arrival never falls back to the recency pick', () => {
    const ctl = code('app/dev/writers-studio-pc3-live/P4R1HomeController.tsx');
    const arrivalBlock = ctl.slice(ctl.indexOf('const onArrivalMode'), ctl.indexOf('return (\n    <P4R1HomeView'));
    expect(arrivalBlock.length).toBeGreaterThan(0);
    expect(arrivalBlock).not.toMatch(/manuscripts\[0\]|resumeManuscriptId/);
  });

  it('nothing is created on arrival without the member asking', () => {
    const view = code('app/dev/writers-studio-pc3-live/P4R1WorkArrival.tsx');
    expect(view).not.toMatch(/useEffect/);
    expect(view).toMatch(/onClick=\{\(\) => onBegin\(arrival\.work\.id\)\}/);
  });

  it('the return membrane appears only on from=house and carries nothing back', () => {
    const ret = code('app/writers-studio/StudioHouseReturn.tsx');
    expect(ret).toMatch(/get\('from'\) !== 'house'\) return null/);
    expect(ret).not.toMatch(/work|manuscript|searchParams\.toString/i);
    expect(code('app/writers-studio/layout.tsx')).toMatch(/<StudioHouseReturn \/>/);
  });
});
