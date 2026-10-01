import fs from 'node:fs';
import path from 'node:path';
import { decideLivingFieldR2, parseLivingFieldR2Cohort, type LivingFieldR2Config } from '../livingFieldR2Access';

const ROOT = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const code = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const OPEN: LivingFieldR2Config = { enabled: 'true', memberIds: A };

type Decide = (session: string | null | undefined, config: LivingFieldR2Config, claimed?: string) => boolean;
const real: Decide = (s, c) => decideLivingFieldR2(s, c);

const LAWS: Record<string, (d: Decide) => boolean> = {
  'M2-fails-closed': (d) => [
    { enabled: undefined, memberIds: A }, { enabled: 'false', memberIds: A },
    { enabled: 'TRUE', memberIds: A }, { enabled: '1', memberIds: A },
    { enabled: 'true', memberIds: undefined }, { enabled: 'true', memberIds: '' },
    { enabled: 'true', memberIds: `${A},not-a-uuid` },
  ].every((c) => d(A, c) === false),
  'M3-named-verified-cohort-only': (d) => d(A, OPEN) === true && d(B, OPEN) === false && d(B, OPEN, A) === false,
  'M3b-unauthenticated-never-admitted': (d) => d(null, OPEN) === false && d(undefined, OPEN) === false,
};

const CANDIDATES: Record<string, { decide: Decide; dies: string }> = {
  'fail-open-config': { decide: (s, c) => !!s && (parseLivingFieldR2Cohort(c.memberIds)?.has(s) ?? true), dies: 'M2-fails-closed' },
  'broad-rollout': { decide: (s, c) => !!s && c.enabled === 'true', dies: 'M3-named-verified-cohort-only' },
  'client-identity-confusion': { decide: (s, c, claimed) => decideLivingFieldR2(claimed ?? s, c), dies: 'M3-named-verified-cohort-only' },
  'anonymous-admission': { decide: (s, c) => s ? decideLivingFieldR2(s, c) : c.enabled === 'true', dies: 'M3b-unauthenticated-never-admitted' },
};

describe('LIVING-FIELD-R2-MOUNT-01 — pure cohort laws', () => {
  for (const [name, law] of Object.entries(LAWS)) it(name, () => expect(law(real)).toBe(true));
  for (const [name, c] of Object.entries(CANDIDATES)) it(`${name} dies on ${c.dies}`, () => expect(LAWS[c.dies](c.decide)).toBe(false));
});

const DASHBOARD = 'components/maia/living-field/PersonalLivingFieldDashboard.tsx';
const R2_HOOK = 'components/maia/living-field/useLivingFieldR2Admission.ts';
const R2_ROUTE = 'app/api/living-field-r2/admission/route.ts';
const R2_ACCESS = 'lib/access/livingFieldR2Access.ts';
const EARLY_HOOK = 'components/maia/living-field/useEarlyFieldAdmission.ts';
const SHELL = 'components/maia/living-field/physics/LivingFieldGrokkerShell.tsx';
const BIO = 'components/maia/living-field/physics/BiologicalSpatialFieldPrototype.tsx';

function hookReflectsServerOnly(src: string): boolean {
  const c = code(src);
  return /apiFetch\('\/api\/living-field-r2\/admission'/.test(c) && /resolved: false/.test(c) && /body\?\.admitted === true/.test(c) && !/localStorage|sessionStorage|document\.cookie|useSearchParams|location\.search/.test(c);
}
function routeTrustsSessionOnly(src: string): boolean {
  const c = code(src);
  return /getMemberIdFromRequest\(request\)/.test(c) && /canEnterLivingFieldR2\(memberId\)/.test(c) && !/searchParams|request\.json|x-member-id|headers\.get|cookies\(/.test(c);
}

describe('LIVING-FIELD-R2-MOUNT-01 — structural mount laws', () => {
  it('M1 preserves EARLY-FIELD-01 as a separate decision', () => {
    const d = code(read(DASHBOARD));
    expect(d).toContain('useEarlyFieldAdmission()');
    expect(d).toContain('{earlyFieldAdmitted && <LivingFieldInstrument />}');
    expect(read(R2_ACCESS)).not.toContain('EARLY_FIELD_');
  });
  it('M3 server route and hook contain no client cohort authority', () => {
    expect(hookReflectsServerOnly(read(R2_HOOK))).toBe(true);
    expect(routeTrustsSessionOnly(read(R2_ROUTE))).toBe(true);
  });
  it('M4 all founder-ruled packages are direct declarations', () => {
    const pkg = JSON.parse(read('package.json')) as { dependencies?: Record<string,string> };
    for (const name of ['d3-hierarchy','d3-interpolate','cytoscape','cytoscape-fcose']) expect(pkg.dependencies?.[name]).toBeTruthy();
  });
  it('M5 R2 mount does not smuggle R2F session continuity', () => {
    expect(read(BIO)).not.toContain('livingFieldNavigationContinuity');
    expect(read(BIO)).not.toContain('sessionStorage');
    expect(fs.existsSync(path.join(ROOT, 'components/maia/living-field/physics/livingFieldNavigationContinuity.ts'))).toBe(false);
  });
  it('M6 mount adds no cognition or memory authority', () => {
    const population = [read(R2_ACCESS), read(R2_HOOK), read(R2_ROUTE), read(SHELL)].join('\n');
    expect(population).not.toMatch(/seedMaiaPrompt|openMaiaWith|member_memory|memory.*write|relation.*write|api\/oracle/);
  });
  it('M7 House threshold remains owned by the page, outside the R2 shell', () => {
    const page = read('app/maia/living-field/page.tsx');
    expect(page).toContain('<HouseRoomThreshold room="LIVING FIELD" />');
    expect(read(SHELL)).not.toContain('HouseRoomThreshold');
  });
  it('M8 R2 is a gated presentation branch and the canonical dashboard remains the fallback', () => {
    const d = code(read(DASHBOARD));
    expect(d).toContain('LivingFieldGrokkerShell');
    expect(d).toContain('if (!livingFieldR2Admission.resolved || !livingFieldR2Viewport.resolved)');
    expect(d).toContain('if (livingFieldR2Admission.admitted && livingFieldR2Viewport.admitted)');
    expect(d).toContain('return <LivingFieldGrokkerShell belowHouseThreshold />');
    expect(read(SHELL)).toContain("belowHouseThreshold ? 'h-[calc(100dvh-80px)] min-h-[640px]'");
    expect(d).toContain('LivingConstellationPanel');
    expect(d).toContain('LivingFieldCard');
  });
  it('M9 final shell is desktop-gated until narrow composition is witnessed', () => {
    const d = code(read(DASHBOARD));
    expect(d).toContain('useLivingFieldR2Viewport');
    expect(d).toContain('livingFieldR2Admission.admitted && livingFieldR2Viewport.admitted');
  });
  it('M10 R2 mount does not alter existing Living Field API/data route', () => {
    const route = read('app/api/maia/living-field/route.ts');
    expect(route).not.toContain('LIVING_FIELD_R2_');
    expect(route).not.toContain('canEnterLivingFieldR2');
  });
  it('the R2 authority is distinct from EARLY-FIELD-01', () => {
    expect(read(R2_ACCESS)).not.toContain('earlyFieldAccess');
    expect(read(R2_HOOK)).not.toContain('useEarlyFieldAdmission');
    expect(read(EARLY_HOOK)).not.toContain('living-field-r2');
  });
});

describe('LIVING-FIELD-R2-MOUNT-01 — admission endpoint is authenticated', () => {
  it('has an exact non-public access-matrix rule', async () => {
    const { matchRule, checkAccess } = await import('@/config/accessMatrix');
    const rule = matchRule('/api/living-field-r2/admission');
    expect(rule?.exact).toBe('/api/living-field-r2/admission');
    expect(rule?.public).not.toBe(true);
    expect(rule?.minTier).toBe('free');
    expect(checkAccess('/api/living-field-r2/admission', 'free', [], false).allowed).toBe(false);
    expect(checkAccess('/api/living-field-r2/admission', 'free', [], true).allowed).toBe(true);
  });
});
