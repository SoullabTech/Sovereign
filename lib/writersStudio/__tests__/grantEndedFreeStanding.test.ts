/**
 * Falsifiers for "a beta grant ends → the writer keeps the Free Studio, never Pro".
 * Founder rulings 2026-11-13 on #1800 (expiry removes only Pro; a revoke keeps Free too; meter MAIA, never Works).
 * Design: docs/programme/WRITERS-STUDIO_GRANT_EXPIRY_FREE_STUDIO_DESIGN_2026-11-13.md (PR #2263), §5. F-numbers match.
 */
const query = jest.fn();
jest.mock('@/lib/db/postgres', () => ({ query: (...a: unknown[]) => query(...a) }));

import { decideBetaGrant } from '../betaGrants';
import {
  betaAccessFromStanding,
  decideStanding,
  writersStudioBetaAccess,
  writersStudioStanding,
} from '../betaAccessServer';
import { decideWriterStudioPlan } from '../planPolicy';
import { decideWholeWork, resolveWholeWork } from '@/lib/auth/wholeWorkEntitlement';

const DAY = 86_400_000;
const past = new Date(Date.now() - DAY);
const future = new Date(Date.now() + 30 * DAY);
const expired = decideBetaGrant({ action: 'grant', expires_at: past });
const revoked = decideBetaGrant({ action: 'revoke', expires_at: null, occurred_at: past });
const active = decideBetaGrant({ action: 'extend', expires_at: future });
const none = decideBetaGrant(null);
const base = { founder: false, legacyBeta: false, mode: 'dated' as const, gateOn: true };

const ON = { WS_BETA_GRANT_MODE: 'dated', WS_PRO_GATE_ENABLED: 'true' };

/** Roster query answers {beta, founder}; grant query the latest event; tier query the tier. */
function db(roster: { beta: boolean; founder: boolean }, latest: object | null, tier: string | null = 'free') {
  query.mockImplementation(async (sql: string) => {
    if (sql.includes('writers_studio_beta_grant_events')) return { rows: latest ? [latest] : [] };
    if (sql.includes('SELECT tier')) return { rows: [{ tier }] };
    return { rows: [roster] };
  });
}

const savedEnv = { ...process.env };
beforeEach(() => {
  query.mockReset();
  delete process.env.WS_BETA_GRANT_MODE;
  delete process.env.WS_PRO_GATE_ENABLED;
});
afterAll(() => { process.env = savedEnv; });

describe('F1 · an expired grant keeps the Free Studio', () => {
  it('is admitted on Free with the end date', () => {
    expect(decideStanding({ ...base, grant: expired })).toEqual({
      admitted: true, plan: 'free', basis: 'grant_lapsed', endedAt: past.toISOString(),
    });
  });
  it('end to end through the server read', async () => {
    db({ beta: false, founder: false }, { action: 'grant', expires_at: past, occurred_at: new Date(past.getTime() - DAY) });
    await expect(writersStudioStanding('m1', ON)).resolves.toMatchObject({ admitted: true, plan: 'free', basis: 'grant_lapsed' });
  });
});

describe('F2 · an ended grant never keeps Pro', () => {
  it('is not beta Pro', () => {
    expect(betaAccessFromStanding(decideStanding({ ...base, grant: expired }))).toEqual({ eligible: false, basis: 'not_in_pilot' });
    expect(betaAccessFromStanding(decideStanding({ ...base, grant: revoked }))).toEqual({ eligible: false, basis: 'not_in_pilot' });
  });
  it('the plan carries no Pro-only feature', () => {
    const plan = decideWriterStudioPlan(decideStanding({ ...base, grant: expired }));
    expect(plan).toMatchObject({ plan: 'free', admitted: true, pilotEligible: false, complimentary: false });
    expect(plan.included.advanced_review).toBe(false);
    expect(plan.included.whole_work_continuity).toBe(false);
    expect(plan.included.expanded_maia).toBe(false);
  });
  it('⭐ does not hold writing.wholeWork with the Pro gate on (tier free)', async () => {
    process.env.WS_BETA_GRANT_MODE = 'dated';
    db({ beta: false, founder: false }, { action: 'grant', expires_at: past });
    await expect(resolveWholeWork('m1', { WS_PRO_GATE_ENABLED: 'true' })).resolves.toEqual({ entitled: false, basis: 'not_pro' });
  });
});

describe('F3 · never Free without a Pro line', () => {
  it('⭐ with the Pro gate off, an ended grant stays out (as before this change)', () => {
    expect(decideStanding({ ...base, gateOn: false, grant: expired })).toEqual({ admitted: false, plan: null, basis: 'not_in_pilot' });
    expect(decideStanding({ ...base, gateOn: false, grant: revoked })).toEqual({ admitted: false, plan: null, basis: 'not_in_pilot' });
  });
  it('only exactly "true" turns the gate on', async () => {
    for (const v of [undefined, '1', 'TRUE', 'yes']) {
      db({ beta: false, founder: false }, { action: 'grant', expires_at: past });
      await expect(writersStudioStanding('m1', { WS_BETA_GRANT_MODE: 'dated', WS_PRO_GATE_ENABLED: v }))
        .resolves.toMatchObject({ admitted: false });
    }
  });
});

describe('F4 · a member never admitted stays out', () => {
  it('in every mode and gate state', () => {
    for (const mode of ['legacy', 'transition', 'dated'] as const) {
      for (const gateOn of [true, false]) {
        expect(decideStanding({ founder: false, legacyBeta: false, mode, gateOn, grant: mode === 'legacy' ? null : none }))
          .toEqual({ admitted: false, plan: null, basis: 'not_in_pilot' });
      }
    }
  });
  it('a member tier of pro does not open the Studio', async () => {
    db({ beta: false, founder: false }, null, 'pro');
    await expect(writersStudioStanding('m1', ON)).resolves.toMatchObject({ admitted: false });
  });
});

describe('F5 · a revoked grant keeps Free (founder ruling 2026-11-13, "Yes, keep Free")', () => {
  it('is admitted on Free, labelled revoked, with when', () => {
    expect(decideStanding({ ...base, grant: revoked })).toEqual({
      admitted: true, plan: 'free', basis: 'grant_revoked', endedAt: past.toISOString(),
    });
  });
});

describe('F6 · legacy mode is exactly today', () => {
  it('never reads the grant log; an ended grant changes nothing', async () => {
    db({ beta: false, founder: false }, { action: 'grant', expires_at: past });
    await expect(writersStudioStanding('m1', { WS_PRO_GATE_ENABLED: 'true' })).resolves.toMatchObject({ admitted: false });
    db({ beta: true, founder: false }, { action: 'revoke', expires_at: null });
    await expect(writersStudioStanding('m1', { WS_PRO_GATE_ENABLED: 'true' }))
      .resolves.toEqual({ admitted: true, plan: 'pro', basis: 'active_beta_tester' });
    expect(query.mock.calls.filter(([s]) => String(s).includes('writers_studio_beta_grant_events'))).toHaveLength(0);
  });
});

describe('F7 · transition: the legacy flag never lifts an ended grant back to Pro', () => {
  it('legacy=true + expired grant → Free, not Pro', () => {
    expect(decideStanding({ ...base, mode: 'transition', legacyBeta: true, grant: expired }))
      .toMatchObject({ admitted: true, plan: 'free', basis: 'grant_lapsed' });
  });
  it('legacy=true + no grant history → Pro as before', () => {
    expect(decideStanding({ ...base, mode: 'transition', legacyBeta: true, grant: none }))
      .toEqual({ admitted: true, plan: 'pro', basis: 'active_beta_tester' });
  });
  it('dated: legacy=true + no history → out', () => {
    expect(decideStanding({ ...base, legacyBeta: true, grant: none })).toMatchObject({ admitted: false });
  });
});

describe('F9 · an outage is never read as a standing', () => {
  it('a failed grant lookup throws', async () => {
    query.mockImplementation(async (sql: string) => {
      if (String(sql).includes('writers_studio_beta_grant_events')) throw new Error('db down');
      return { rows: [{ beta: false, founder: false }] };
    });
    await expect(writersStudioStanding('m1', ON)).rejects.toThrow('db down');
  });
  it('a failed roster lookup throws', async () => {
    query.mockRejectedValue(new Error('db down'));
    await expect(writersStudioStanding('m1', ON)).rejects.toThrow('db down');
  });
});

describe('F10 · founder/CTO witness is unchanged', () => {
  it('is Pro in every mode and reads no grant', async () => {
    for (const mode of ['legacy', 'transition', 'dated']) {
      db({ beta: false, founder: true }, { action: 'revoke', expires_at: null });
      await expect(writersStudioStanding('m1', { WS_BETA_GRANT_MODE: mode, WS_PRO_GATE_ENABLED: 'true' }))
        .resolves.toEqual({ admitted: true, plan: 'pro', basis: 'founder_witness' });
    }
    expect(query.mock.calls.filter(([s]) => String(s).includes('writers_studio_beta_grant_events'))).toHaveLength(0);
  });
});

describe('F11 · an extend after the end restores Pro', () => {
  it('active again', () => {
    expect(decideStanding({ ...base, grant: active })).toMatchObject({ admitted: true, plan: 'pro', basis: 'dated_beta_grant' });
  });
});

describe('F12 · the 2026-11-11 tier ruling still applies, and only to Pro', () => {
  it('an ended grant + members.tier pro → Free standing + writing.wholeWork', async () => {
    process.env.WS_BETA_GRANT_MODE = 'dated';
    db({ beta: false, founder: false }, { action: 'grant', expires_at: past }, 'pro');
    await expect(resolveWholeWork('m1', { WS_PRO_GATE_ENABLED: 'true' })).resolves.toEqual({ entitled: true, basis: 'pro_tier' });
    await expect(writersStudioStanding('m1', ON)).resolves.toMatchObject({ plan: 'free' });
  });
  it('an ended grant + tier personal → no wholeWork', () => {
    expect(decideWholeWork({ gateOn: true, pilot: { eligible: false, basis: 'not_in_pilot' }, tier: 'personal' }).entitled).toBe(false);
  });
});

describe('beta Pro answer is unchanged for everyone else', () => {
  it('writersStudioBetaAccess still reports active dated grants with expiry', async () => {
    process.env.WS_BETA_GRANT_MODE = 'dated';
    process.env.WS_PRO_GATE_ENABLED = 'true';
    db({ beta: false, founder: false }, { action: 'grant', expires_at: future });
    await expect(writersStudioBetaAccess('m1')).resolves.toEqual({ eligible: true, basis: 'dated_beta_grant', expiresAt: future.toISOString() });
  });
});
