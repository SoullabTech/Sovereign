import fs from 'node:fs';
import path from 'node:path';
import {
  decideHouseStudioH1,
  parseHouseStudioH1Cohort,
  type HouseStudioH1Config,
} from '../houseStudioH1Access';
import { checkAccess, matchRule } from '@/config/accessMatrix';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const OPEN: HouseStudioH1Config = { enabled: 'true', memberIds: A };

type Decide = (session: string | null | undefined, config: HouseStudioH1Config, claimed?: string) => boolean;
const real: Decide = (session, config) => decideHouseStudioH1(session, config);

const LAWS: Record<string, (d: Decide) => boolean> = {
  'H1-explicit-member-admitted-when-open': (d) => d(A, OPEN) === true,
  'H2-non-cohort-member-refused': (d) => d(B, OPEN) === false,
  'H3-unauthenticated-refused': (d) => d(null, OPEN) === false && d(undefined, OPEN) === false,
  'H4-config-fails-closed': (d) => [
    { enabled: undefined, memberIds: A },
    { enabled: 'false', memberIds: A },
    { enabled: 'TRUE', memberIds: A },
    { enabled: 'true', memberIds: undefined },
    { enabled: 'true', memberIds: '' },
    { enabled: 'true', memberIds: `${A},bad-id` },
  ].every((c) => d(A, c) === false),
  'H5-client-claim-has-no-authority': (d) => d(B, OPEN, A) === false,
  'H6-rollback-closes': (d) => d(A, { enabled: 'false', memberIds: A }) === false,
};

const CANDIDATES: Record<string, { decide: Decide; dies: string }> = {
  'D1-admit-every-authenticated-member': { decide: (s, c) => !!s && c.enabled === 'true', dies: 'H2-non-cohort-member-refused' },
  'D2-admit-anonymous': { decide: (s, c) => s ? decideHouseStudioH1(s, c) : c.enabled === 'true', dies: 'H3-unauthenticated-refused' },
  'D3-fail-open-config': {
    decide: (s, c) => {
      if (!s) return false;
      const cohort = parseHouseStudioH1Cohort(c.memberIds);
      return cohort ? c.enabled === 'true' && cohort.has(s) : true;
    },
    dies: 'H4-config-fails-closed',
  },
  'D4-trust-client-claim': { decide: (s, c, claimed) => decideHouseStudioH1(claimed ?? s, c), dies: 'H5-client-claim-has-no-authority' },
  'D5-ignore-rollback': { decide: (s, c) => decideHouseStudioH1(s, { ...c, enabled: 'true' }), dies: 'H6-rollback-closes' },
  'D6-admit-nobody': { decide: () => false, dies: 'H1-explicit-member-admitted-when-open' },
};

describe('H1 cohort authority — decision laws', () => {
  for (const [name, law] of Object.entries(LAWS)) it(name, () => expect(law(real)).toBe(true));
  for (const [name, candidate] of Object.entries(CANDIDATES)) {
    it(`${name} dies on ${candidate.dies}`, () => expect(LAWS[candidate.dies](candidate.decide)).toBe(false));
  }
});

const ROOT = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const code = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const ROUTE = 'app/api/house-studio/admission/route.ts';
const HOOK = 'app/writers-studio/useHouseStudioH1WorkClaim.ts';
const HOUSE = 'app/house/page.tsx';
const CONTROLLERS = [
  'app/dev/writers-studio-pc3-live/P4R1HomeController.tsx',
  'app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx',
  'app/dev/writers-studio-pc3-live/P4R1ReviewController.tsx',
  'app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx',
];

describe('H1 cohort authority — structural boundary', () => {
  it('House emits explicit H1 addresses only behind the server decision', () => {
    const src = code(read(HOUSE));
    expect(src).toMatch(/canUseHouseStudioH1\(member\.id\)/);
    // H1 · R2: the same decision, expressed through the governed seam's doorway builder.
    expect(src).toMatch(/const houseStudioH1Admitted = canUseHouseStudioH1\(member\.id\);/);
    expect(src).toMatch(/houseWritingHref\(houseStudioH1Admitted, work\.id, studioArrivalFromHouse\)/);
    expect(src).toMatch(/houseWritingHref\(houseStudioH1Admitted, null, studioArrivalFromHouse\)/);
  });

  // H1 · R2: the hook supplies the admission fact; the arrival comes from the seam.
  it('Studio controllers consume work only through the governed arrival seam', () => {
    for (const file of CONTROLLERS) {
      const src = code(read(file));
      expect(src).toMatch(/useHouseStudioH1WorkClaim\(h1AdmissionNeeded\(params\)\)/);
      expect(src).toMatch(/resolveH1Arrival\(params, h1\)/);
      expect(src).not.toMatch(/readStudioWorkParam|STUDIO_WORK_PARAM|\.get\('work'\)/);
    }
  });

  it('hook reflects the server and has no client-side authority source', () => {
    const src = code(read(HOOK));
    expect(src).toMatch(/apiFetch\('\/api\/house-studio\/admission'/);
    // H1 · R2: the hook settles through the seam, which admits only `admitted === true`.
    expect(src).toMatch(/settleH1Admission\(/);
    expect(code(read('app/writers-studio/h1Arrival.ts'))).toMatch(/\.admitted === true/);
    expect(src).not.toMatch(/localStorage|sessionStorage|document\.cookie|location\.search/);
  });

  it('route derives identity from the verified session only', () => {
    const src = code(read(ROUTE));
    expect(src).toMatch(/getMemberIdFromRequest\(request\)/);
    // H1 · R2: the route's answer comes from the authority's pure response core.
    expect(src).toMatch(/houseStudioH1AdmissionResponse\(memberId\)/);
    expect(src).not.toMatch(/searchParams|request\.json|x-member-id|headers\.get/);
  });

  it('authority remains separate from EARLY-FIELD and lab/founder access', () => {
    const src = code(read('lib/access/houseStudioH1Access.ts'));
    expect(src).not.toMatch(/EARLY_FIELD|earlyFieldAccess|labAccess|founderAuth|FOUNDER_MEMBER_IDS|LAB_ACCESS_MEMBER_IDS/);
  });

  it('closed default is documented', () => {
    expect(read('.env.example')).toMatch(/^HOUSE_STUDIO_H1_ENABLED=false$/m);
  });
});

describe('H1 admission endpoint — access matrix', () => {
  const PATH = '/api/house-studio/admission';
  it('has its own authenticated exact rule', () => {
    const rule = matchRule(PATH);
    expect(rule?.exact).toBe(PATH);
    expect(rule?.public).not.toBe(true);
    expect(rule?.minTier).toBe('free');
  });
  it('proxy refuses unauthenticated callers', () => {
    expect(checkAccess(PATH, 'free', [], false)).toMatchObject({ allowed: false, reason: 'unauthenticated' });
  });
  it('authenticated members may ask; handler still decides admission', () => {
    expect(checkAccess(PATH, 'free', [], true).allowed).toBe(true);
  });
});
