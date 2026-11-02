/**
 * ASTRO-PRO-04 (#1893) — Pro access stays founder-only until the
 * 'tester-grant' phase is chosen, and even then admits only audited grants.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
import { proMemberAllowed, proPreviewEnabled } from '../lib/astrology/proAccess';

const FOUNDER = '11111111-1111-4111-8111-111111111111';
const TESTER = '22222222-2222-4222-8222-222222222222';
const founderOnly = { ASTRO_PRO_PREVIEW_ENABLED: 'true', ASTRO_PRO_ACCESS_PHASE: 'founder-only', ASTRO_PRO_FOUNDER_MEMBER_ID: FOUNDER };
const testerGrant = { ...founderOnly, ASTRO_PRO_ACCESS_PHASE: 'tester-grant' };
const granted = async () => true;
const notGranted = async () => false;
const lookupFails = async () => { throw new Error('db down'); };

describe('Astrology Pro access', () => {
  it('is closed with no configuration (production today)', async () => {
    expect(proPreviewEnabled({})).toBe(false);
    expect(await proMemberAllowed(FOUNDER, {}, granted)).toBe(false);
    expect(await proMemberAllowed(TESTER, {}, granted)).toBe(false);
  });

  it('refuses an unknown phase or an invalid founder identity', async () => {
    expect(proPreviewEnabled({ ...founderOnly, ASTRO_PRO_ACCESS_PHASE: 'open' })).toBe(false);
    expect(proPreviewEnabled({ ...founderOnly, ASTRO_PRO_FOUNDER_MEMBER_ID: 'founder' })).toBe(false);
    expect(proPreviewEnabled({ ...founderOnly, ASTRO_PRO_PREVIEW_ENABLED: 'yes' })).toBe(false);
  });

  it('founder-only admits the founder and ignores grants', async () => {
    expect(await proMemberAllowed(FOUNDER, founderOnly, notGranted)).toBe(true);
    expect(await proMemberAllowed(TESTER, founderOnly, granted)).toBe(false);
  });

  it('never admits through an allowlist or cohort setting', async () => {
    const widened = { ...founderOnly, ASTRO_PRO_PREVIEW_ALLOWED_MEMBERS: TESTER, ASTRO_PRO_BETA_TESTER_COHORT: TESTER };
    expect(await proMemberAllowed(TESTER, widened, notGranted)).toBe(false);
    expect(await proMemberAllowed(TESTER, { ...widened, ASTRO_PRO_ACCESS_PHASE: 'tester-grant' }, notGranted)).toBe(false);
  });

  it('tester-grant admits the founder and members with an active grant only', async () => {
    expect(await proMemberAllowed(FOUNDER, testerGrant, notGranted)).toBe(true);
    expect(await proMemberAllowed(TESTER, testerGrant, granted)).toBe(true);
    expect(await proMemberAllowed(TESTER, testerGrant, notGranted)).toBe(false);
  });

  it('fails closed when the grant lookup errors or the identity is missing', async () => {
    expect(await proMemberAllowed(TESTER, testerGrant, lookupFails)).toBe(false);
    expect(await proMemberAllowed(null, testerGrant, granted)).toBe(false);
    expect(await proMemberAllowed('not-a-uuid', testerGrant, granted)).toBe(false);
  });

  it('every Pro entry point uses the single access decision', () => {
    for (const file of ['app/astrology/pro-preview/page.tsx', 'app/api/astrology/pro/my-chart/route.ts']) {
      const src = readFileSync(path.join(__dirname, '..', file), 'utf8');
      expect(src).toContain("from '@/lib/astrology/proAccess'");
      expect(src).not.toMatch(/founderPreview(Enabled|MemberAllowed)\(/);
    }
  });

  it('the grant log is append-only and erased with its member', () => {
    const sql = readFileSync(
      path.join(__dirname, '..', 'database/migrations/20261101000002_astro_pro_tester_grants.sql'), 'utf8');
    expect(sql).toMatch(/REFERENCES members\(id\) ON DELETE CASCADE/);
    expect(sql).toMatch(/BEFORE UPDATE OR DELETE ON astro_pro_tester_grant_events/);
    expect(sql).toMatch(/BEFORE TRUNCATE ON astro_pro_tester_grant_events/);
  });
});
