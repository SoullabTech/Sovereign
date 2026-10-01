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
  ADULT_ACK_KIND,
} from '../adultConfirmation';

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

  it('records the acknowledgment after the member exists', () => {
    const insert = route.indexOf('INSERT INTO members');
    const record = route.indexOf('recordAcknowledgment(');
    expect(record).toBeGreaterThan(insert);
    expect(route).toContain("'registration'");
  });
});

describe('acknowledgments route', () => {
  const route = code('app/api/members/acknowledgments/route.ts');

  it('takes identity from the verified session only, never the body', () => {
    expect(route).toContain('getMemberIdFromRequest(req)');
    expect(route).not.toMatch(/body\.(memberId|member_id|userId)/);
  });

  it('records only the 18+ kind, only on a literal true', () => {
    expect(route).toContain('body.kind !== ADULT_ACK_KIND || body.confirms !== true');
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
