/**
 * `writing.wholeWork` — the Writer's Studio Free / Pro line (founder ruling 2026-11-11: build Pro on the entitlement layer,
 * beta testers exempt, no separation until the switch is turned on).
 */
const query = jest.fn();
const beta = jest.fn();
jest.mock('@/lib/db/postgres', () => ({ query: (...a: unknown[]) => query(...a) }));
jest.mock('@/lib/writersStudio/betaAccessServer', () => ({ writersStudioBetaAccess: (...a: unknown[]) => beta(...a) }));

import { decideWholeWork, proGateEnabled, resolveWholeWork } from '@/lib/auth/wholeWorkEntitlement';

const ON = { WS_PRO_GATE_ENABLED: 'true' };
const notPilot = { eligible: false, basis: 'not_in_pilot' } as const;

beforeEach(() => { query.mockReset(); beta.mockReset(); });

describe('the switch', () => {
  it('opens only on exactly "true"', () => {
    expect(proGateEnabled(ON)).toBe(true);
    for (const v of [undefined, '', 'false', '1', 'TRUE', 'yes', ' true']) {
      expect(proGateEnabled({ WS_PRO_GATE_ENABLED: v })).toBe(false);
    }
  });
});

describe('the decision', () => {
  it('⭐ gate off: everyone holds it, whatever their tier (the beta period)', () => {
    for (const tier of ['free', 'personal', 'pro', null]) {
      expect(decideWholeWork({ gateOn: false, pilot: notPilot, tier })).toEqual({ entitled: true, basis: 'gate_off' });
    }
  });
  it('⭐ gate on: a pilot beta tester or founder keeps it on a free tier', () => {
    expect(decideWholeWork({ gateOn: true, pilot: { eligible: true, basis: 'active_beta_tester' }, tier: 'free' }))
      .toEqual({ entitled: true, basis: 'active_beta_tester' });
    expect(decideWholeWork({ gateOn: true, pilot: { eligible: true, basis: 'founder_witness' }, tier: null }))
      .toEqual({ entitled: true, basis: 'founder_witness' });
  });
  it('gate on: Pro holds it; Free, Personal and an unknown tier do not', () => {
    expect(decideWholeWork({ gateOn: true, pilot: notPilot, tier: 'pro' })).toEqual({ entitled: true, basis: 'pro_tier' });
    for (const tier of ['free', 'personal', null, 'PRO', 'studio_pro']) {
      expect(decideWholeWork({ gateOn: true, pilot: notPilot, tier })).toEqual({ entitled: false, basis: 'not_pro' });
    }
  });
});

describe('server resolution', () => {
  it('⭐ gate off reads nothing from the database', async () => {
    expect(await resolveWholeWork('m1', {})).toEqual({ entitled: true, basis: 'gate_off' });
    expect(beta).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
  });
  it('gate on: a pilot member is answered without reading the tier', async () => {
    beta.mockResolvedValue({ eligible: true, basis: 'active_beta_tester' });
    expect((await resolveWholeWork('m1', ON)).entitled).toBe(true);
    expect(query).not.toHaveBeenCalled();
  });
  it('gate on: reads members.tier for this member only', async () => {
    beta.mockResolvedValue(notPilot);
    query.mockResolvedValue({ rows: [{ tier: 'pro' }] });
    expect(await resolveWholeWork('m1', ON)).toEqual({ entitled: true, basis: 'pro_tier' });
    expect(query).toHaveBeenCalledWith(expect.stringContaining('FROM members WHERE id = $1'), ['m1']);
    query.mockResolvedValue({ rows: [{ tier: 'free' }] });
    expect((await resolveWholeWork('m1', ON)).entitled).toBe(false);
    query.mockResolvedValue({ rows: [] });
    expect((await resolveWholeWork('m1', ON)).entitled).toBe(false);
  });
  it('⭐ gate on: a failed lookup throws; an outage is never read as "not Pro"', async () => {
    beta.mockRejectedValue(new Error('db down'));
    await expect(resolveWholeWork('m1', ON)).rejects.toThrow('db down');
    beta.mockResolvedValue(notPilot);
    query.mockRejectedValue(new Error('db down'));
    await expect(resolveWholeWork('m1', ON)).rejects.toThrow('db down');
  });
});

describe('standalone Writer\'s Studio Pro holding (STUDIO-A-LA-CARTE-01 Phase 1)', () => {
  const BOTH = { WS_PRO_GATE_ENABLED: 'true', STUDIO_HOLDINGS_ENABLED: 'true' };
  const tierThenHolding = (tier: string | null, holding: Array<{ event: string; period_end: Date | null }>) => {
    query.mockImplementation(async (sql: string) =>
      sql.includes('FROM members') ? { rows: [{ tier }] } : { rows: holding });
  };

  it('decision: a holding grants it only after tier, and only when true', () => {
    expect(decideWholeWork({ gateOn: true, pilot: notPilot, tier: 'free', holding: true }))
      .toEqual({ entitled: true, basis: 'studio_holding' });
    expect(decideWholeWork({ gateOn: true, pilot: notPilot, tier: 'free', holding: false }))
      .toEqual({ entitled: false, basis: 'not_pro' });
    expect(decideWholeWork({ gateOn: true, pilot: notPilot, tier: 'pro', holding: true }))
      .toEqual({ entitled: true, basis: 'pro_tier' });
    expect(decideWholeWork({ gateOn: false, pilot: notPilot, tier: 'free', holding: false }))
      .toEqual({ entitled: true, basis: 'gate_off' });
  });

  it('⭐ holdings switch off: exactly one query (the tier), as before this change', async () => {
    beta.mockResolvedValue(notPilot);
    tierThenHolding('free', [{ event: 'granted', period_end: null }]);
    for (const v of [undefined, '', 'false', '1', 'TRUE']) {
      query.mockClear();
      expect(await resolveWholeWork('m1', { WS_PRO_GATE_ENABLED: 'true', STUDIO_HOLDINGS_ENABLED: v }))
        .toEqual({ entitled: false, basis: 'not_pro' });
      expect(query).toHaveBeenCalledTimes(1);
    }
  });

  it('⭐ Pro gate off: holdings are never read even with the holdings switch on', async () => {
    expect(await resolveWholeWork('m1', { STUDIO_HOLDINGS_ENABLED: 'true' })).toEqual({ entitled: true, basis: 'gate_off' });
    expect(query).not.toHaveBeenCalled();
  });

  it('Soullab Pro tier answers without reading holdings', async () => {
    beta.mockResolvedValue(notPilot);
    tierThenHolding('pro', []);
    expect(await resolveWholeWork('m1', BOTH)).toEqual({ entitled: true, basis: 'pro_tier' });
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('both switches on: an active holding grants it; lapsed, revoked, expired or none do not', async () => {
    beta.mockResolvedValue(notPilot);
    const future = new Date(Date.now() + 86_400_000);
    const past = new Date(Date.now() - 86_400_000);
    const cases: Array<[Array<{ event: string; period_end: Date | null }>, boolean]> = [
      [[{ event: 'granted', period_end: null }], true],
      [[{ event: 'renewed', period_end: future }], true],
      [[{ event: 'granted', period_end: past }], false],
      [[{ event: 'lapsed', period_end: null }], false],
      [[{ event: 'revoked', period_end: future }], false],
      [[], false],
    ];
    for (const [rows, entitled] of cases) {
      tierThenHolding('free', rows);
      expect((await resolveWholeWork('m1', BOTH)).entitled).toBe(entitled);
    }
    expect(query).toHaveBeenCalledWith(expect.stringContaining('FROM studio_holding_events'), ['m1', 'studio.writer.pro']);
  });

  it('⭐ both switches on: a failed holdings lookup throws, never "not Pro"', async () => {
    beta.mockResolvedValue(notPilot);
    query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM members')) return { rows: [{ tier: 'free' }] };
      throw new Error('relation "studio_holding_events" does not exist');
    });
    await expect(resolveWholeWork('m1', BOTH)).rejects.toThrow('studio_holding_events');
  });
});
