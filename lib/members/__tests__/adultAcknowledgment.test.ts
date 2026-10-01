/**
 * MEMBER-ADULT-ACK-01 falsifiers.
 *
 * Founder ruling 2026-10-01: youth closed; every registration must carry the
 * member's own 18+ confirmation; the confirmation is an append-only record.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  decideAdultRegistration,
  parseBirthDate,
  hasAdultConfirmation,
  withAdultAcknowledgment,
  ADULT_ACK_KIND,
  ADULT_ACK_COOKIE_VALUE,
} from '../adultConfirmation';
import { decideAcknowledgmentGate, createCachedAcknowledgmentGate } from '../acknowledgmentGate';
import { ACCESS_RULES, checkAccess } from '../../../config/accessMatrix';

const read = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');
const code = (rel: string) =>
  read(rel).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*--.*$/gm, '').replace(/^\s*\/\/.*$/gm, '');

const NOW = new Date(Date.UTC(2026, 9, 1)); // 2026-10-01

describe('registration age rule', () => {
  it('refuses without the confirmation', () => {
    expect(decideAdultRegistration({ confirmsAdult: undefined, now: NOW })).toEqual({
      ok: false,
      reason: 'adult_confirmation_required',
    });
    expect(decideAdultRegistration({ confirmsAdult: false, now: NOW }).ok).toBe(false);
  });

  it('accepts only a literal true, never a truthy stand-in', () => {
    for (const v of ['true', 1, 'yes', {}, []]) {
      expect(decideAdultRegistration({ confirmsAdult: v, now: NOW }).ok).toBe(false);
    }
    expect(decideAdultRegistration({ confirmsAdult: true, now: NOW })).toEqual({ ok: true });
  });

  it('an adult birth date cannot stand in for the confirmation', () => {
    expect(
      decideAdultRegistration({ confirmsAdult: false, birthDate: '1970-01-01', now: NOW }).ok,
    ).toBe(false);
  });

  it('an under-18 birth date refuses even when confirmed', () => {
    expect(
      decideAdultRegistration({ confirmsAdult: true, birthDate: '2010-05-05', now: NOW }),
    ).toEqual({ ok: false, reason: 'under_18' });
  });

  it('the 18th birthday is the boundary, to the day', () => {
    expect(
      decideAdultRegistration({ confirmsAdult: true, birthDate: '2008-10-02', now: NOW }).ok,
    ).toBe(false);
    expect(
      decideAdultRegistration({ confirmsAdult: true, birthDate: '2008-10-01', now: NOW }).ok,
    ).toBe(true);
  });

  it('refuses an unreadable or impossible birth date rather than ignoring it', () => {
    for (const d of ['10/01/2000', '2001-02-30', 'tomorrow', '2030-01-01', 42]) {
      expect(decideAdultRegistration({ confirmsAdult: true, birthDate: d, now: NOW })).toEqual({
        ok: false,
        reason: 'invalid_birth_date',
      });
    }
    expect(parseBirthDate('2000-02-29')).toEqual({ y: 2000, m: 2, d: 29 });
  });
});

describe('register route', () => {
  const route = code('app/api/members/register/route.ts');

  it('decides the age rule before admission, so a refusal spends no invite', () => {
    const decide = route.indexOf('decideAdultRegistration(');
    const admit = route.indexOf('resolveAdmission(');
    expect(decide).toBeGreaterThan(-1);
    expect(admit).toBeGreaterThan(decide);
  });

  it('writes the acknowledgment in the same statement as the member', () => {
    expect(route).toContain('withAdultAcknowledgment(');
    expect(route).not.toContain('recordAcknowledgment(');
  });
});

describe('acknowledgments route', () => {
  const route = code('app/api/members/acknowledgments/route.ts');

  it('takes identity from the verified session only, never the body', () => {
    expect(route).toContain('getMemberIdFromRequest(req)');
    expect(route).not.toMatch(/body\.(memberId|member_id|userId)/);
  });

  it('records only allow-listed kinds, only on a literal true', () => {
    expect(route).toContain('RECORDABLE_ACKNOWLEDGMENTS.find((r) => r.kind === body.kind)');
    expect(route).toContain("!recordable || body.confirms !== true");
    expect(route).toContain("'sign_in_prompt'");
  });
});

describe('member_acknowledgments migration', () => {
  const sql = code('database/migrations/20261001000001_member_acknowledgments.sql');

  it('refuses UPDATE, direct DELETE and TRUNCATE', () => {
    expect(sql).toMatch(/BEFORE UPDATE ON member_acknowledgments/);
    expect(sql).toMatch(/BEFORE DELETE ON member_acknowledgments/);
    expect(sql).toMatch(/BEFORE TRUNCATE ON member_acknowledgments/);
  });

  it('lets the member row cascade, so erasure is never blocked', () => {
    expect(sql).toMatch(/REFERENCES members\(id\) ON DELETE CASCADE/);
    expect(sql).toMatch(/IF EXISTS \(SELECT 1 FROM members WHERE id = OLD\.member_id\)/);
  });

  it('backfills nothing: absence means not acknowledged', () => {
    expect(sql).not.toMatch(/INSERT INTO member_acknowledgments/);
  });

  it('admits the kind the code records', () => {
    expect(sql).toContain(`'${ADULT_ACK_KIND}'`);
  });
});

describe('youth path closed', () => {
  it('the constant is false', () => {
    expect(code('lib/youth/youthAvailability.ts')).toMatch(/YOUTH_PATH_OPEN = false/);
  });

  it('onboarding routes any youth tier away before youth onboarding', () => {
    const page = code('app/onboarding/page.tsx');
    const closed = page.indexOf('isYouthTier && !YOUTH_PATH_OPEN');
    const youth = page.indexOf("'/onboarding/youth'");
    expect(closed).toBeGreaterThan(-1);
    expect(youth).toBeGreaterThan(closed);
  });

  it('the youth page redirects even on direct URL', () => {
    expect(code('app/onboarding/youth/page.tsx')).toMatch(
      /if \(!YOUTH_PATH_OPEN\) \{\s*router\.replace\(YOUTH_CLOSED_ROUTE\)/,
    );
  });
});

describe('MAIA conversation gate (server enforcement)', () => {
  it('lets a member through only with nothing missing', () => {
    expect(decideAcknowledgmentGate([])).toEqual({ ok: true });
  });

  it('refuses a member missing the 18+ acknowledgment', () => {
    const d = decideAcknowledgmentGate([{ kind: 'adult_18_plus', version: 1 }]);
    expect(d.ok).toBe(false);
    if (!d.ok) {
      expect(d.status).toBe(403);
      expect(d.body.code).toBe('ACKNOWLEDGMENT_REQUIRED');
    }
  });

  it('fails closed when the record cannot be read', () => {
    const d = decideAcknowledgmentGate(new Error('relation does not exist'));
    expect(d.ok).toBe(false);
    if (!d.ok) expect(d.status).toBe(503);
  });

  for (const [route, idVar] of [
    ['app/api/sovereign/app/maia/list/route.ts', 'userId'],
    ['app/api/sovereign/app/maia/route.ts', 'memberId'],
  ] as const) {
    it(`${route} gates a signed-in member before cognition`, () => {
      const src = code(route);
      const gate = src.indexOf(`acknowledgmentGateForMember(${idVar})`);
      expect(gate).toBeGreaterThan(-1);
      expect(src.indexOf('getMaiaResponse(')).toBeGreaterThan(gate);
    });
  }

  it('the client never answers in MAIA\'s name on a refusal', () => {
    const oc = code('components/OracleConversation.tsx');
    const branch = oc.indexOf("ackErr?.code === 'ACKNOWLEDGMENT_REQUIRED'");
    const fallback = oc.indexOf('generatePresenceFallback({', branch);
    const ret = oc.indexOf('return;', branch);
    expect(branch).toBeGreaterThan(-1);
    expect(ret).toBeGreaterThan(branch);
    expect(fallback).toBeGreaterThan(ret);
  });
});

describe('migration lock-timeout shape (#1622 lint)', () => {
  it('opens with BEGIN; then SET LOCAL lock_timeout', () => {
    expect(code('database/migrations/20261001000001_member_acknowledgments.sql')).toMatch(
      /^\s*BEGIN;\s*SET LOCAL lock_timeout = '\d+s';/,
    );
  });
});

describe('acknowledgment cache (one DB hiccup must not take MAIA down)', () => {
  const quiet = () => {};
  it('a member once seen satisfied survives a later read failure', async () => {
    let fail = false;
    let reads = 0;
    const g = createCachedAcknowledgmentGate({
      readMissing: async () => { reads++; if (fail) throw new Error('db down'); return []; },
      requiredSignature: () => 'adult_18_plus@1',
      onReadError: quiet,
    });
    expect(await g.check('m1')).toEqual({ ok: true });
    fail = true;
    expect(await g.check('m1')).toEqual({ ok: true });
    expect(reads).toBe(1);
  });

  it('a missing acknowledgment is never cached: confirming takes effect next turn', async () => {
    let missing = [{ kind: 'adult_18_plus' as const, version: 1 }];
    const g = createCachedAcknowledgmentGate({
      readMissing: async () => missing,
      requiredSignature: () => 'adult_18_plus@1',
    });
    expect((await g.check('m2')).ok).toBe(false);
    missing = [];
    expect((await g.check('m2')).ok).toBe(true);
  });

  it('a refused member stays refused on the next turn', async () => {
    const g = createCachedAcknowledgmentGate({
      readMissing: async () => [{ kind: 'adult_18_plus' as const, version: 1 }],
      requiredSignature: () => 'adult_18_plus@1',
    });
    expect((await g.check('m5')).ok).toBe(false);
    expect((await g.check('m5')).ok).toBe(false);
  });

  it('a failed read is not remembered as satisfied', async () => {
    let fail = true;
    const g = createCachedAcknowledgmentGate({
      readMissing: async () => { if (fail) throw new Error('db down'); return [{ kind: 'adult_18_plus' as const, version: 1 }]; },
      requiredSignature: () => 'adult_18_plus@1',
      onReadError: quiet,
    });
    expect((await g.check('m6')).ok).toBe(false);
    fail = false;
    expect((await g.check('m6')).ok).toBe(false);
  });

  it('an unverified member is still refused when the read fails', async () => {
    const g = createCachedAcknowledgmentGate({
      readMissing: async () => { throw new Error('db down'); },
      requiredSignature: () => 'adult_18_plus@1',
      onReadError: quiet,
    });
    const d = await g.check('m3');
    expect(d.ok).toBe(false);
    if (!d.ok) expect(d.status).toBe(503);
  });

  it('adding a requirement re-checks members already cached', async () => {
    let sig = 'adult_18_plus@1';
    let reads = 0;
    const g = createCachedAcknowledgmentGate({
      readMissing: async () => { reads++; return []; },
      requiredSignature: () => sig,
    });
    await g.check('m4');
    sig = 'adult_18_plus@1,maia_not_monitored@1';
    await g.check('m4');
    expect(reads).toBe(2);
  });

  it('stays bounded', async () => {
    const g = createCachedAcknowledgmentGate({
      readMissing: async () => [],
      requiredSignature: () => 's',
      max: 3,
    });
    for (const id of ['a', 'b', 'c', 'd', 'e']) await g.check(id);
    expect(g.size()).toBe(3);
  });
});

describe('guests do not reach MAIA conversation', () => {
  for (const path of ['/api/sovereign/app/maia', '/api/sovereign/app/maia/list']) {
    it(`${path} refuses an unauthenticated request at the proxy`, () => {
      expect(checkAccess(path, 'free', [], false).allowed).toBe(false);
    });
  }
  it('no public rule shadows /api/sovereign', () => {
    expect(ACCESS_RULES.some((r) => r.public && r.prefix && '/api/sovereign/app/maia'.startsWith(r.prefix))).toBe(false);
  });
});

describe('every account-creation route with a member INSERT', () => {
  const GATED = [
    'app/api/members/register/route.ts',
    'app/api/members/register-email/route.ts',
    'app/api/auth/signin/google/callback/route.ts',
    'app/api/auth/google/native-callback/route.ts',
    'app/api/auth/signin/apple/callback/route.ts',
    'app/api/auth/apple/native-callback/route.ts',
    'app/api/members/register-local/route.ts',
    'app/api/members/enter/route.ts',
    'app/api/team/invite/[token]/register/route.ts',
    'app/api/now-what/register/route.ts',
  ];
  for (const p of GATED) {
    it(`${p} requires the confirmation and wraps every member INSERT`, () => {
      const src = code(p);
      expect(src.includes('decideAdultRegistration(') || src.includes('hasAdultConfirmation(')).toBe(true);
      const wrapped = src.split('withAdultAcknowledgment(').length - 1;
      const inserts = (src.match(/INSERT INTO members\b/g) || []).length;
      expect(inserts).toBeGreaterThan(0);
      expect(inserts - wrapped).toBe(0);
    });
  }

  it('covers every API route that inserts a member', () => {
    const { execSync } = require('child_process') as typeof import('child_process');
    const found = execSync(
      "git grep -l 'INSERT INTO members' -- 'app/api/**/*.ts' ':!**/__tests__/**'",
      { encoding: 'utf8' },
    ).trim().split('\n').filter(Boolean).sort();
    expect(found).toEqual([...GATED].sort());
  });

  it('all live registration forms send the adult confirmation', () => {
    for (const p of [
      'components/auth/UnifiedAuth.tsx',
      'components/auth/SyncAccountPrompt.tsx',
      'components/team/InviteAcceptClient.tsx',
      'app/now-what/arrive/page.tsx',
    ]) {
      expect(code(p)).toContain('confirmsAdult');
    }
  });

  it('accepts only a literal true flag or the current-version cookie', () => {
    expect(hasAdultConfirmation({ confirmsAdult: true }, undefined)).toBe(true);
    expect(hasAdultConfirmation(null, ADULT_ACK_COOKIE_VALUE)).toBe(true);
    for (const v of [false, 'true', 1, 'yes', undefined, null]) {
      expect(hasAdultConfirmation({ confirmsAdult: v }, undefined)).toBe(false);
    }
    expect(hasAdultConfirmation(null, 'adult_18_plus@0')).toBe(false);
    expect(hasAdultConfirmation(null, null)).toBe(false);
  });

  it('the wrapper writes the acknowledgment from the created row, in one statement', () => {
    const { sql, params } = withAdultAcknowledgment('INSERT INTO members (a) VALUES ($1) RETURNING id', ['x']);
    expect(sql).toMatch(/^WITH m AS \(INSERT INTO members/);
    expect(sql).toContain("SELECT id, $2, $3, 'registration' FROM m");
    expect(sql.trim().endsWith('SELECT * FROM m')).toBe(true);
    expect(params).toEqual(['x', ADULT_ACK_KIND, 1]);
  });
});
