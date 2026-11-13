/**
 * Writer's Studio dated beta grants (founder rulings 2026-11-13, #1800).
 * Legacy mode must be byte-for-byte today's behaviour; transition and dated modes add the dated grant.
 */
const query = jest.fn();
jest.mock('@/lib/db/postgres', () => ({ query: (...a: unknown[]) => query(...a) }));

import { betaGrantMode, decideBetaGrant } from '../betaGrants';
import { writersStudioBetaAccess } from '../betaAccessServer';
import { decideWriterStudioPlan } from '../planPolicy';

const DAY = 86_400_000;
const future = () => new Date(Date.now() + 30 * DAY);
const past = () => new Date(Date.now() - DAY);
const saved = process.env.WS_BETA_GRANT_MODE;

/** Roster query answers {beta, founder}; grant query answers the latest event (or none). */
function db(roster: { beta: boolean; founder: boolean }, latest: { action: string; expires_at: Date | null } | null) {
  query.mockImplementation(async (sql: string) =>
    sql.includes('writers_studio_beta_grant_events') ? { rows: latest ? [latest] : [] } : { rows: [roster] });
}
const grantReads = () => query.mock.calls.filter(([sql]) => String(sql).includes('writers_studio_beta_grant_events')).length;

beforeEach(() => { query.mockReset(); delete process.env.WS_BETA_GRANT_MODE; });
afterAll(() => { if (saved === undefined) delete process.env.WS_BETA_GRANT_MODE; else process.env.WS_BETA_GRANT_MODE = saved; });

describe('mode switch', () => {
  it('only "transition" and "dated" leave legacy', () => {
    expect(betaGrantMode({ WS_BETA_GRANT_MODE: 'transition' })).toBe('transition');
    expect(betaGrantMode({ WS_BETA_GRANT_MODE: 'dated' })).toBe('dated');
    for (const v of [undefined, '', 'DATED', 'true', 'on', 'legacy', ' dated']) {
      expect(betaGrantMode({ WS_BETA_GRANT_MODE: v })).toBe('legacy');
    }
  });
});

describe('decision', () => {
  it('a grant or extend is active until its expiry; revoke, expired or none are not', () => {
    const f = future();
    expect(decideBetaGrant({ action: 'grant', expires_at: f })).toEqual({ active: true, expiresAt: f });
    expect(decideBetaGrant({ action: 'extend', expires_at: f }).active).toBe(true);
    expect(decideBetaGrant({ action: 'grant', expires_at: past() }).active).toBe(false);
    expect(decideBetaGrant({ action: 'revoke', expires_at: null }).active).toBe(false);
    expect(decideBetaGrant(null).active).toBe(false);
  });
});

describe('legacy mode (default)', () => {
  it('⭐ is exactly today: one roster query, the grant table never read', async () => {
    db({ beta: true, founder: false }, { action: 'revoke', expires_at: null });
    expect(await writersStudioBetaAccess('m1')).toEqual({ eligible: true, basis: 'active_beta_tester' });
    db({ beta: false, founder: false }, { action: 'grant', expires_at: future() });
    expect(await writersStudioBetaAccess('m1')).toEqual({ eligible: false, basis: 'not_in_pilot' });
    expect(grantReads()).toBe(0);
    expect(query).toHaveBeenCalledTimes(2);
  });
});

describe('transition mode', () => {
  beforeEach(() => { process.env.WS_BETA_GRANT_MODE = 'transition'; });
  it('an active dated grant admits, with its expiry', async () => {
    const f = future();
    db({ beta: false, founder: false }, { action: 'grant', expires_at: f });
    expect(await writersStudioBetaAccess('m1')).toEqual({ eligible: true, basis: 'dated_beta_grant', expiresAt: f.toISOString() });
  });
  it('the legacy boolean still admits, so no current tester loses access mid-switch', async () => {
    db({ beta: true, founder: false }, null);
    expect(await writersStudioBetaAccess('m1')).toEqual({ eligible: true, basis: 'active_beta_tester' });
  });
  it('no grant and no boolean: not in pilot', async () => {
    db({ beta: false, founder: false }, { action: 'grant', expires_at: past() });
    expect(await writersStudioBetaAccess('m1')).toEqual({ eligible: false, basis: 'not_in_pilot' });
  });
});

describe('dated mode', () => {
  beforeEach(() => { process.env.WS_BETA_GRANT_MODE = 'dated'; });
  it('⭐ the legacy boolean no longer admits', async () => {
    db({ beta: true, founder: false }, null);
    expect(await writersStudioBetaAccess('m1')).toEqual({ eligible: false, basis: 'not_in_pilot' });
  });
  it('⭐ an expired or revoked grant does not admit', async () => {
    db({ beta: true, founder: false }, { action: 'grant', expires_at: past() });
    expect((await writersStudioBetaAccess('m1')).eligible).toBe(false);
    db({ beta: true, founder: false }, { action: 'revoke', expires_at: null });
    expect((await writersStudioBetaAccess('m1')).eligible).toBe(false);
  });
  it('founder/CTO witness is unchanged and reads no grant', async () => {
    db({ beta: false, founder: true }, null);
    expect(await writersStudioBetaAccess('m1')).toEqual({ eligible: true, basis: 'founder_witness' });
    expect(grantReads()).toBe(0);
  });
  it('⭐ a failed grant lookup throws; an outage is never read as "no grant"', async () => {
    query.mockImplementation(async (sql: string) => {
      if (String(sql).includes('writers_studio_beta_grant_events')) throw new Error('db down');
      return { rows: [{ beta: true, founder: false }] };
    });
    await expect(writersStudioBetaAccess('m1')).rejects.toThrow('db down');
  });
});

describe('plan projection', () => {
  it('a dated grant is complimentary Pro; expiry returns the member to Free (their Works are not touched here)', () => {
    expect(decideWriterStudioPlan({ eligible: true, basis: 'dated_beta_grant', expiresAt: future().toISOString() }))
      .toMatchObject({ plan: 'pro', basis: 'dated_beta_grant', complimentary: true, pilotEligible: true });
    expect(decideWriterStudioPlan({ eligible: false, basis: 'not_in_pilot' })).toMatchObject({ plan: 'free' });
  });
});
