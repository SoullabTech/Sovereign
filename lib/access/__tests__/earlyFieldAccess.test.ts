/**
 * EARLY-FIELD-01 — controlled cohort admission to the early Living Field
 * instrument. Laws + lethality.
 *
 * Each law is a predicate over a decision function, run against the real one
 * AND a named defeat candidate that must die on it. The two structural
 * candidates (client-only gate, cosmetic rollback) are about WHERE the gate
 * lives, so they are killed by source guards applied to a mutated copy of the
 * real source — proving the guard would catch the wrong architecture.
 */

import fs from 'node:fs';
import path from 'node:path';
import { decideEarlyField, parseCohort, type EarlyFieldConfig } from '../earlyFieldAccess';
import { matchRule, checkAccess } from '@/config/accessMatrix';

const A = '11111111-1111-4111-8111-111111111111'; // cohort member
const B = '22222222-2222-4222-8222-222222222222'; // authenticated, not in cohort
const LAB = '33333333-3333-4333-8333-333333333333'; // lab member only

const OPEN: EarlyFieldConfig = { enabled: 'true', memberIds: `${A}` };

/** Candidates may take extra inputs the real decision deliberately lacks. */
type Decide = (
  session: string | null | undefined,
  config: EarlyFieldConfig,
  extra?: { claimedMemberId?: string; labIds?: string[] },
) => boolean;

const real: Decide = (s, c) => decideEarlyField(s, c);

const LAWS: Record<string, (d: Decide) => boolean> = {
  'E1-explicit-cohort-member-admitted-when-open': (d) => d(A, OPEN) === true,
  'E2-fails-closed-on-untrusted-configuration': (d) =>
    [
      { enabled: undefined, memberIds: A },
      { enabled: 'false', memberIds: A },
      { enabled: 'TRUE', memberIds: A },
      { enabled: '1', memberIds: A },
      { enabled: 'true', memberIds: undefined },
      { enabled: 'true', memberIds: '' },
      { enabled: 'true', memberIds: ' , ' },
      { enabled: 'true', memberIds: `${A},not-a-uuid` }, // malformed ⇒ whole list untrusted
    ].every((c) => d(A, c) === false),
  'E3-identity-is-the-session-never-a-claim': (d) =>
    d(B, OPEN, { claimedMemberId: A }) === false && d(A, OPEN) === true,
  'E4-lab-membership-confers-nothing-here': (d) =>
    d(LAB, OPEN, { labIds: [LAB] }) === false,
  'E5-rollback-closes-for-the-whole-cohort': (d) =>
    d(A, { enabled: 'false', memberIds: A }) === false,
  'E6-no-broad-exposure-while-cohort-mode-active': (d) => d(B, OPEN) === false,
  'E7-unauthenticated-never-admitted': (d) =>
    d(null, OPEN) === false && d(undefined, OPEN) === false && d('', OPEN) === false,
};

const CANDIDATES: Record<string, { decide: Decide; dies: string }> = {
  'DC2-fail-open-configuration': {
    decide: (s, c) => {
      if (!s) return false;
      const cohort = parseCohort(c.memberIds);
      return cohort ? c.enabled === 'true' && cohort.has(s) : true; // no list ⇒ everyone
    },
    dies: 'E2-fails-closed-on-untrusted-configuration',
  },
  'DC3-identity-confusion': {
    decide: (s, c, x) => decideEarlyField(x?.claimedMemberId ?? s, c),
    dies: 'E3-identity-is-the-session-never-a-claim',
  },
  'DC4-shared-lab-authority': {
    decide: (s, c, x) => (!!s && (x?.labIds ?? []).includes(s) && c.enabled === 'true') || decideEarlyField(s, c),
    dies: 'E4-lab-membership-confers-nothing-here',
  },
  'DC5-rollback-cosmetic-only': {
    decide: (s, c) => decideEarlyField(s, { ...c, enabled: 'true' }),
    dies: 'E5-rollback-closes-for-the-whole-cohort',
  },
  'DC6-broad-exposure': {
    decide: (s, c) => !!s && c.enabled === 'true',
    dies: 'E6-no-broad-exposure-while-cohort-mode-active',
  },
  'DC7-anonymous-admitted': {
    decide: (s, c) => (s ? decideEarlyField(s, c) : c.enabled === 'true'),
    dies: 'E7-unauthenticated-never-admitted',
  },
  'DC8-admits-nobody': {
    decide: () => false,
    dies: 'E1-explicit-cohort-member-admitted-when-open',
  },
};

describe('EARLY-FIELD-01 — laws hold on the real decision', () => {
  for (const [name, law] of Object.entries(LAWS)) {
    it(name, () => expect(law(real)).toBe(true));
  }
});

describe('EARLY-FIELD-01 — every defeat candidate dies on its named law', () => {
  for (const [name, { decide, dies }] of Object.entries(CANDIDATES)) {
    it(`${name} is killed by ${dies}`, () => expect(LAWS[dies](decide)).toBe(false));
  }
  it('every law kills at least one candidate', () => {
    const killed = new Set(Object.values(CANDIDATES).map((c) => c.dies));
    expect(Object.keys(LAWS).filter((l) => !killed.has(l))).toEqual([]);
  });
});

/* ── Structural guards: where the gate lives ─────────────────────────────── */

const ROOT = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const code = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const DASHBOARD = 'components/maia/living-field/PersonalLivingFieldDashboard.tsx';
const HOOK = 'components/maia/living-field/useEarlyFieldAdmission.ts';
const ROUTE = 'app/api/early-field/admission/route.ts';
const MODULE = 'lib/access/earlyFieldAccess.ts';

/** The instrument renders only behind the server-derived admission, on one path. */
function dashboardGateHolds(src: string): boolean {
  const c = code(src);
  const renders = c.match(/<LivingFieldInstrument\b/g) ?? [];
  return (
    renders.length === 1 &&
    /\{earlyFieldAdmitted && <LivingFieldInstrument \/>\}/.test(c) &&
    /const earlyFieldAdmitted = useEarlyFieldAdmission\(\)/.test(c)
  );
}

/** The hook reflects the server only: no URL, storage or cookie authority. */
function hookReflectsServerOnly(src: string): boolean {
  const c = code(src);
  return (
    /apiFetch\('\/api\/early-field\/admission'/.test(c) &&
    /useState\(false\)/.test(c) &&
    /body\?\.admitted === true/.test(c) &&
    !/localStorage|sessionStorage|document\.cookie|useSearchParams|location\.search/.test(c)
  );
}

/** The route decides from the session alone. */
function routeTrustsSessionOnly(src: string): boolean {
  const c = code(src);
  return (
    /getMemberIdFromRequest\(request\)/.test(c) &&
    /canEnterEarlyField\(memberId\)/.test(c) &&
    !/searchParams|request\.json|x-member-id|headers\.get|cookies\(/.test(c)
  );
}

describe('EARLY-FIELD-01 — structural guards on the real source', () => {
  it('dashboard: one render path, behind server-derived admission', () =>
    expect(dashboardGateHolds(read(DASHBOARD))).toBe(true));
  it('hook: starts closed, opens only on admitted === true, reads no client authority', () =>
    expect(hookReflectsServerOnly(read(HOOK))).toBe(true));
  it('route: session is the only identity; no query, body or claimed id', () =>
    expect(routeTrustsSessionOnly(read(ROUTE))).toBe(true));
  it('authority is separate: the module imports neither lab nor founder access', () =>
    expect(code(read(MODULE))).not.toMatch(/labAccess|founderAuth|FOUNDER_MEMBER_IDS|LAB_ACCESS_MEMBER_IDS/));
  it('the instrument is reachable through no other mount or route', () => {
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
        const rel = path.join(dir, e.name);
        if (e.isDirectory()) { if (!/node_modules|__tests__|\.next/.test(rel)) walk(rel); }
        else if (/\.tsx?$/.test(e.name) && /LivingFieldInstrument\b/.test(read(rel))) hits.push(rel);
      }
    };
    walk('app'); walk('components');
    expect(hits.sort()).toEqual(
      [DASHBOARD, 'components/maia/living-field/LivingFieldInstrument.tsx'].sort(),
    );
  });
});

describe('EARLY-FIELD-01 — structural defeat candidates are caught', () => {
  it('DC1 client-only gate (instrument rendered unconditionally) is caught', () => {
    const mutant = read(DASHBOARD).replace('{earlyFieldAdmitted && <LivingFieldInstrument />}', '<LivingFieldInstrument />');
    expect(dashboardGateHolds(mutant)).toBe(false);
  });
  it('DC1b client-derived admission (URL flag) is caught', () => {
    const mutant = read(HOOK).replace("const [admitted, setAdmitted] = useState(false);",
      "const [admitted, setAdmitted] = useState(new URLSearchParams(location.search).has('early'));");
    expect(hookReflectsServerOnly(mutant)).toBe(false);
  });
  it('DC5b cosmetic rollback (a second, ungated render path) is caught', () => {
    const mutant = read(DASHBOARD).replace('{earlyFieldAdmitted && <LivingFieldInstrument />}',
      '{earlyFieldAdmitted && <LivingFieldInstrument />}{!earlyFieldAdmitted && <LivingFieldInstrument />}');
    expect(dashboardGateHolds(mutant)).toBe(false);
  });
  it('DC3b route trusting a claimed id is caught', () => {
    const mutant = read(ROUTE).replace('canEnterEarlyField(memberId)',
      "canEnterEarlyField(request.headers.get('x-member-id') ?? memberId)");
    expect(routeTrustsSessionOnly(mutant)).toBe(false);
  });
});

/* ── Merge-bar item 6: the access matrix really protects the admission route ── */


describe('EARLY-FIELD-01 — /api/early-field/admission is behind the authenticated boundary', () => {
  const PATH = '/api/early-field/admission';

  it('resolves to its own exact, non-public rule (no broader prefix decides it)', () => {
    const rule = matchRule(PATH);
    expect(rule?.exact).toBe(PATH);
    expect(rule?.public).not.toBe(true);
    expect(rule?.minTier).toBe('free');
  });

  it('refuses an unauthenticated caller at the proxy, before the handler runs', () => {
    const r = checkAccess(PATH, 'free', [], false);
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe('unauthenticated');
  });

  it('admits an authenticated member of any tier to ASK (the answer is still the handler’s)', () => {
    expect(checkAccess(PATH, 'free', [], true).allowed).toBe(true);
  });

  it('a matrix that marked the route public would be caught', () => {
    const matrix = read('config/accessMatrix.ts');
    const mutant = matrix.replace(
      "{ exact: '/api/early-field/admission', minTier: 'free',",
      "{ exact: '/api/early-field/admission', public: true, minTier: 'free',",
    );
    expect(mutant).not.toBe(matrix); // the mutation applied
    const line = (src: string) => src.split('\n').find((l) => l.includes("exact: '/api/early-field/admission'")) ?? '';
    expect(/public:\s*true/.test(line(matrix))).toBe(false);
    expect(/public:\s*true/.test(line(mutant))).toBe(true);
  });
});
