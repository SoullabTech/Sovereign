/**
 * EARLY-FIELD-01 · R7 falsifiers for the R1R3 instrument cohort gate.
 *
 * Each law is run against the real decision AND against a named defeat
 * candidate: a plausible wrong gate. The real decision must pass every law;
 * each candidate must be killed by the law named for it. A law that cannot
 * kill its candidate is not evidence.
 *
 * Scope (founder ruling 2026-09-30, R1): the gate governs the instrument only.
 * The Living Field room is not gated, and nothing here tests or restricts it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { canEnterEarlyField, readEarlyFieldConfig, type EarlyFieldEnv } from '../earlyFieldAccess';

const A = '11111111-1111-4111-8111-111111111111'; // admitted cohort member
const B = '22222222-2222-4222-8222-222222222222'; // authenticated, not in cohort
const LAB = '33333333-3333-4333-8333-333333333333'; // lab member / founder, not in cohort

const OPEN: EarlyFieldEnv = { EARLY_FIELD_ENABLED: 'true', EARLY_FIELD_MEMBER_IDS: A };

/** Everything a request could carry. Only `verified` may matter. */
type Req = {
  verified: string | null; // from the verified session
  claimed?: string | null; // x-member-id / maia_member_id claim
  query?: Record<string, string>; // URL/query parameters
  storage?: Record<string, string>; // localStorage / client flags
  labMember?: boolean; // generic lab / founder membership
};
type Decide = (req: Req, env: EarlyFieldEnv) => boolean;

const real: Decide = (req, env) => canEnterEarlyField(req.verified, env);

// ── Defeat candidates ───────────────────────────────────────────────────────
const members = (env: EarlyFieldEnv) =>
  (env.EARLY_FIELD_MEMBER_IDS ?? '').split(',').map((s) => s.trim()).filter(Boolean);

const candidates: Record<string, { decide: Decide; killedBy: string }> = {
  'client-only gate': {
    killedBy: 'L1 no client input grants admission',
    decide: (req, env) => req.query?.early === '1' || req.storage?.earlyField === 'true' || real(req, env),
  },
  'fail-open configuration': {
    killedBy: 'L2 absent or malformed configuration fails closed',
    decide: (req, env) =>
      env.EARLY_FIELD_ENABLED === undefined || env.EARLY_FIELD_ENABLED !== 'false'
        ? !!req.verified && (members(env).length === 0 || members(env).includes(req.verified))
        : false,
  },
  'identity substitution': {
    killedBy: 'L3 only the verified identity counts',
    decide: (req, env) => canEnterEarlyField(req.claimed ?? req.verified, env),
  },
  'shared lab authority': {
    killedBy: 'L4 lab or founder membership grants nothing',
    decide: (req, env) => (req.labMember === true && !!req.verified) || real(req, env),
  },
  'cosmetic rollback': {
    killedBy: 'L5 EARLY_FIELD_ENABLED=false closes it for everyone',
    decide: (req, env) => !!req.verified && members(env).includes(req.verified),
  },
  'broad exposure': {
    killedBy: 'L6 enabled cohort admits only listed members',
    decide: (req, env) => env.EARLY_FIELD_ENABLED === 'true' && !!req.verified,
  },
};

// ── Laws ────────────────────────────────────────────────────────────────────
const laws: Record<string, (d: Decide) => boolean> = {
  'L1 no client input grants admission': (d) =>
    !d({ verified: B, query: { early: '1' }, storage: { earlyField: 'true' } }, OPEN) &&
    !d({ verified: null, query: { early: '1' } }, OPEN),
  'L2 absent or malformed configuration fails closed': (d) =>
    [
      {},
      { EARLY_FIELD_MEMBER_IDS: A },
      { EARLY_FIELD_ENABLED: 'yes', EARLY_FIELD_MEMBER_IDS: A },
      { EARLY_FIELD_ENABLED: 'TRUE', EARLY_FIELD_MEMBER_IDS: A },
      { EARLY_FIELD_ENABLED: 'true', EARLY_FIELD_MEMBER_IDS: `${A},not-a-uuid` },
      { EARLY_FIELD_ENABLED: 'true', EARLY_FIELD_MEMBER_IDS: '' },
      { EARLY_FIELD_ENABLED: 'true' },
    ].every((env) => !d({ verified: A }, env as EarlyFieldEnv) && !d({ verified: B }, env as EarlyFieldEnv)),
  'L3 only the verified identity counts': (d) =>
    !d({ verified: B, claimed: A }, OPEN) && !d({ verified: null, claimed: A }, OPEN),
  'L4 lab or founder membership grants nothing': (d) => !d({ verified: LAB, labMember: true }, OPEN),
  'L5 EARLY_FIELD_ENABLED=false closes it for everyone': (d) =>
    !d({ verified: A }, { EARLY_FIELD_ENABLED: 'false', EARLY_FIELD_MEMBER_IDS: A }),
  'L6 enabled cohort admits only listed members': (d) =>
    d({ verified: A }, OPEN) && !d({ verified: B }, OPEN),
};

describe('EARLY-FIELD-01 · the real decision satisfies every law', () => {
  for (const [name, law] of Object.entries(laws)) {
    it(name, () => expect(law(real)).toBe(true));
  }
  it('admits a listed member case-insensitively and tolerates whitespace', () => {
    expect(canEnterEarlyField(A.toUpperCase(), { EARLY_FIELD_ENABLED: 'true', EARLY_FIELD_MEMBER_IDS: ` ${B} , ${A} ` })).toBe(true);
  });
  it('reports why configuration is closed without exposing ids', () => {
    expect(readEarlyFieldConfig({})).toEqual({ state: 'closed', reason: 'disabled' });
    expect(readEarlyFieldConfig({ EARLY_FIELD_ENABLED: 'on' })).toEqual({ state: 'closed', reason: 'malformed_enabled' });
  });
});

describe('EARLY-FIELD-01 · every defeat candidate dies on its named law', () => {
  for (const [name, { decide, killedBy }] of Object.entries(candidates)) {
    it(`${name} is killed by "${killedBy}"`, () => {
      expect(laws[killedBy]).toBeDefined();
      expect(laws[killedBy](decide)).toBe(false);
    });
  }
});

// ── Structural falsifiers: the decision reaches exactly one mount ───────────
const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(path.join(process.cwd(), dir), { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === '__tests__' || e.name === 'node_modules') continue;
      sourceFiles(rel, out);
    } else if (/\.tsx?$/.test(e.name)) out.push(rel);
  }
  return out;
}

describe('EARLY-FIELD-01 · structural falsifiers', () => {
  it('the instrument has exactly one mount, and it is gated on the server decision', () => {
    const mounts = [...sourceFiles('app'), ...sourceFiles('components')].filter((f) =>
      /<LivingFieldInstrument\b/.test(strip(read(f))),
    );
    expect(mounts).toEqual(['components/maia/living-field/PersonalLivingFieldDashboard.tsx']);
    const dash = strip(read(mounts[0]));
    expect(dash).toMatch(/\{earlyFieldInstrument === true && <LivingFieldInstrument \/>\}/);
    expect(dash).toMatch(/earlyFieldInstrument = false,/);
  });

  it('the page takes the decision only from the API response', () => {
    const page = strip(read('app/maia/living-field/page.tsx'));
    const uses = page.match(/earlyFieldInstrument=\{[^}]*\}/g) ?? [];
    expect(uses).toEqual(['earlyFieldInstrument={data.early_field?.instrument === true}']);
  });

  it('the route decides from the verified session memberId and reads no request parameter', () => {
    const route = strip(read('app/api/maia/living-field/route.ts'));
    expect(route).toMatch(/const memberId = await getMemberIdFromRequest\(request\)/);
    expect(route).toMatch(/early_field: \{ instrument: canEnterEarlyField\(memberId\) \}/);
    expect(route).not.toMatch(/searchParams|nextUrl|request\.url/);
  });

  it('the authority is distinct: it consults neither lab nor founder lists and writes nothing', () => {
    const auth = strip(read('lib/access/earlyFieldAccess.ts'));
    expect(auth).not.toMatch(/labAccess|founderAuth|LAB_ACCESS|FOUNDER_MEMBER_IDS/);
    expect(auth).not.toMatch(/\bquery\(|INSERT|UPDATE|localStorage|document\.cookie/);
  });

  it('the Living Field room itself stays ungated (no admission check on the page or other routes)', () => {
    const page = strip(read('app/maia/living-field/page.tsx'));
    expect(page).not.toMatch(/canEnterEarlyField|earlyFieldAccess/);
    const otherRoutes = sourceFiles('app/api/maia/living-field').filter((f) => f !== 'app/api/maia/living-field/route.ts');
    for (const f of otherRoutes) expect(strip(read(f))).not.toMatch(/canEnterEarlyField|earlyFieldAccess/);
  });
});
