/**
 * H1-R2 — a Work with several manuscripts has no implicit manuscript identity.
 *
 * Ported as BEHAVIOURAL LAW onto the canonical H1 lineage
 * (HOUSE-STUDIO-CIRCULATION-01R1, #1536) — not as branch ancestry. House
 * arrival is already governed by situatedWork.ts; these laws cover what #1536
 * leaves to the ordinary Studio: Home cards, the Continue hero, and the mode
 * bar when no Work is carried.
 *
 * Lethality first: every law is run against the real module AND against a
 * named defeat candidate (a plausible wrong implementation). Each candidate
 * must die on its named law; the real module must survive all of them.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  arrivalFor,
  manuscriptIdOf,
  manuscriptIdsOf,
  manuscriptsForWork,
  manuscriptsInOrder,
  modeEntryTarget,
  type ModeEntryTarget,
} from '../homeState';
import { resolveStudioArrival } from '../situatedWork';
import type { LivingWork, WorkExpression } from '../useLivingWorks';
import type { CurrentManuscript } from '../useCurrentManuscript';

const expr = (id: string): WorkExpression => ({
  expressionType: 'manuscript',
  expressionId: id,
  declaredAt: '2026-01-01T00:00:00Z',
});

const work = (id: string, ids: string[]): LivingWork => ({
  id,
  title: id,
  purpose: null,
  form: 'Book',
  stage: 'writing',
  manuscriptState: 'existing-manuscript',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
  expressions: ids.map(expr),
  materials: [],
});

const ms = (id: string, activity: string | null, written = true): CurrentManuscript => ({
  id,
  title: id,
  createdAt: '2026-01-01T00:00:00Z',
  sectionCount: 1,
  charCount: 1000,
  keepCount: 0,
  lastMemberDraftActivityAt: activity,
  draftCharCount: 1000,
  hasDraftWriting: written,
  hasWriting: written,
  hasCurrentMemberContribution: written,
});

/* ── the module surface under test, and its wrong twins ─────────────────── */

interface Impl {
  manuscriptIdOf: (w: LivingWork) => string | null;
  manuscriptsForWork: (w: LivingWork, m: readonly CurrentManuscript[]) => CurrentManuscript[];
  arrivalFor: typeof arrivalFor;
  modeEntryTarget: (resume: LivingWork | null, m: readonly CurrentManuscript[]) => ModeEntryTarget;
  manuscriptsInOrder: (ids: readonly string[], m: readonly CurrentManuscript[]) => CurrentManuscript[];
}

const real: Impl = { manuscriptIdOf, manuscriptsForWork, arrivalFor, modeEntryTarget, manuscriptsInOrder };

/** The canonical definition before this port: the first manuscript expression. */
const firstPick = (w: LivingWork) =>
  w.expressions.find((e) => e.expressionType === 'manuscript')?.expressionId ?? null;

const candidates: Record<string, { impl: Impl; dies: string }> = {
  'DM-1 first-pick identity': {
    impl: { ...real, manuscriptIdOf: firstPick },
    dies: 'MM-L1-several-have-no-identity',
  },
  'DM-2 raw expression count (no de-duplication)': {
    impl: {
      ...real,
      manuscriptIdOf: (w) => {
        const ids = w.expressions.filter((e) => e.expressionType === 'manuscript').map((e) => e.expressionId);
        return ids.length === 1 ? ids[0]! : null;
      },
    },
    dies: 'MM-L2-one-declared-twice-is-still-one',
  },
  'DM-3 recency-ordered choices': {
    impl: {
      ...real,
      manuscriptsForWork: (w, m) =>
        [...manuscriptsForWork(w, m)].sort((a, b) =>
          (b.lastMemberDraftActivityAt ?? '').localeCompare(a.lastMemberDraftActivityAt ?? '')),
    },
    dies: 'MM-L3-choices-in-declared-order',
  },
  'DM-4 first-manuscript eligibility': {
    impl: {
      ...real,
      arrivalFor: (works, manuscripts) =>
        arrivalFor(
          works.map((w) => ({ ...w, expressions: w.expressions.slice(0, 1) })),
          manuscripts,
        ),
    },
    dies: 'MM-L4-writing-in-any-manuscript-makes-the-work-continuable',
  },
  'DM-5 mode bar falls back to the most recent manuscript': {
    impl: {
      ...real,
      modeEntryTarget: (resume, m) => {
        const t = modeEntryTarget(resume, m);
        return t.kind === 'choose' && m[0] ? { kind: 'open', manuscriptId: m[0].id } : t;
      },
    },
    dies: 'MM-L5-ordinary-entry-asks-when-several',
  },
  'DM-6 mode bar offers every manuscript even when the Continue Work is known': {
    impl: {
      ...real,
      modeEntryTarget: (resume, m) => {
        const t = modeEntryTarget(resume, m);
        return t.kind === 'choose' ? { kind: 'choose', manuscriptIds: m.map((x) => x.id) } : t;
      },
    },
    dies: 'MM-L6-choice-is-scoped-to-the-continue-work',
  },
  'DM-7 chooser rendered by filtering the recency-ordered list (the defect the walk found)': {
    impl: { ...real, manuscriptsInOrder: (ids, m) => m.filter((x) => ids.includes(x.id)) },
    dies: 'MM-L7-rendered-chooser-keeps-the-given-order',
  },
};

/* ── the laws ───────────────────────────────────────────────────────────── */

const TWO = work('W2', ['m-first', 'm-second']);
const ONE = work('W1', ['m-solo']);
const DUP = work('Wd', ['m-solo', 'm-solo']);

const laws: Record<string, (r: Impl) => string | null> = {
  'MM-L1-several-have-no-identity': (r) => {
    const got = r.manuscriptIdOf(TWO);
    return got === null ? null : `two manuscripts resolved to ${got}`;
  },
  'MM-L2-one-declared-twice-is-still-one': (r) => {
    const a = r.manuscriptIdOf(ONE);
    const b = r.manuscriptIdOf(DUP);
    return a === 'm-solo' && b === 'm-solo' ? null : `single=${a} duplicated=${b}`;
  },
  'MM-L3-choices-in-declared-order': (r) => {
    const got = r
      .manuscriptsForWork(TWO, [ms('m-second', '2026-09-29T00:00:00Z'), ms('m-first', '2026-01-01T00:00:00Z'), ms('m-other', null)])
      .map((m) => m.id);
    return JSON.stringify(got) === JSON.stringify(['m-first', 'm-second']) ? null : `got ${JSON.stringify(got)}`;
  },
  'MM-L4-writing-in-any-manuscript-makes-the-work-continuable': (r) => {
    const a = r.arrivalFor([TWO], [ms('m-first', null, false), ms('m-second', '2026-09-29T00:00:00Z', true)]);
    if (a.resume?.id !== 'W2') return `resume=${a.resume?.id ?? 'none'}`;
    if (a.imported.length || a.shelf.some((x) => 'charCount' in x)) return 'a declared manuscript was treated as unclaimed';
    return null;
  },
  'MM-L5-ordinary-entry-asks-when-several': (r) => {
    const noResume = r.modeEntryTarget(null, [ms('m-a', '2026-09-29T00:00:00Z'), ms('m-b', null)]);
    if (noResume.kind !== 'choose') return `no resume, two manuscripts → ${noResume.kind}`;
    const several = r.modeEntryTarget(TWO, [ms('m-first', null), ms('m-second', null), ms('m-x', null)]);
    if (several.kind !== 'choose') return `resume with two → ${several.kind}`;
    const single = r.modeEntryTarget(null, [ms('m-a', null)]);
    if (single.kind !== 'open' || single.manuscriptId !== 'm-a') return `one manuscript → ${JSON.stringify(single)}`;
    const none = r.modeEntryTarget(null, []);
    return none.kind === 'none' ? null : `no manuscripts → ${none.kind}`;
  },
  'MM-L6-choice-is-scoped-to-the-continue-work': (r) => {
    const t = r.modeEntryTarget(TWO, [ms('m-x', null), ms('m-first', null), ms('m-second', null)]);
    return t.kind === 'choose' && JSON.stringify(t.manuscriptIds) === JSON.stringify(['m-first', 'm-second'])
      ? null
      : `got ${JSON.stringify(t)}`;
  },
  'MM-L7-rendered-chooser-keeps-the-given-order': (r) => {
    // `held` arrives newest-first, as the Studio's manuscript list does.
    const held = [ms('m-second', '2026-09-29T00:00:00Z'), ms('m-x', null), ms('m-first', '2026-01-01T00:00:00Z')];
    const got = r.manuscriptsInOrder(['m-first', 'm-second'], held).map((m) => m.id);
    return JSON.stringify(got) === JSON.stringify(['m-first', 'm-second']) ? null : `got ${JSON.stringify(got)}`;
  },
};

describe('H1-R2 — multi-manuscript Works require explicit choice', () => {
  for (const [name, law] of Object.entries(laws)) {
    it(`real module satisfies ${name}`, () => {
      expect(law(real)).toBeNull();
    });
  }

  for (const [name, { impl, dies }] of Object.entries(candidates)) {
    it(`${name} dies on ${dies}`, () => {
      expect(laws[dies]!(impl)).not.toBeNull();
    });
  }

  it('every law kills at least one candidate (no decorative laws)', () => {
    const killers = new Set(Object.values(candidates).map((c) => c.dies));
    for (const name of Object.keys(laws)) expect(killers.has(name)).toBe(true);
  });

  it('manuscriptIdsOf keeps declaration order and removes duplicates', () => {
    expect(manuscriptIdsOf(work('W', ['b', 'a', 'b']))).toEqual(['b', 'a']);
  });

  it('House arrival and ordinary entry agree: same Work, same manuscripts, same order, nothing preselected', () => {
    const held = [ms('m-x', '2026-09-30T00:00:00Z'), ms('m-second', '2026-09-29T00:00:00Z'), ms('m-first', null)];
    const house = resolveStudioArrival('ready', [TWO], 'ready', held, 'W2');
    const ordinary = modeEntryTarget(TWO, held);
    expect(house.kind).toBe('several');
    expect(ordinary.kind).toBe('choose');
    const houseIds = house.kind === 'several' ? house.manuscripts.map((m) => m.id) : [];
    const ordinaryIds = ordinary.kind === 'choose' ? ordinary.manuscriptIds : [];
    expect(houseIds).toEqual(['m-first', 'm-second']);
    expect(ordinaryIds).toEqual(houseIds);
  });

  it('the ordinary mode bar routes through modeEntryTarget and never takes manuscripts[0]', () => {
    const src = fs
      .readFileSync(path.resolve(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1HomeController.tsx'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1');
    expect(src).toMatch(/modeEntryTarget\(arrival\.resume \?\? null, manuscripts\)/);
    expect(src).not.toMatch(/manuscripts\[0\]/);
    expect(src).toMatch(/onChooseManuscript=\{onChooseManuscript\}/);
  });

  it('the Home view renders the mode-bar chooser in the given order, not by filtering the held list', () => {
    const src = fs
      .readFileSync(path.resolve(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1HomeView.tsx'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1');
    expect(src).toMatch(/manuscriptsInOrder\(props\.pendingMode\.manuscriptIds, props\.manuscripts\)/);
    expect(src).not.toMatch(/props\.manuscripts\.filter\(\(m\) => props\.pendingMode/);
  });
});
