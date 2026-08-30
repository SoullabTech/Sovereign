import {
  containSituatedProfile,
  summarizeContainmentForLog,
  SITUATED_DEEP_CONTAINMENT_REASON,
} from '../situatedProfileContainment';

/**
 * SITUATED-WORK-DEEP-01.
 *
 * A situated Writer's Studio exchange may not execute a tier that silently
 * drops the context the interface says is present.
 */

describe('the containment truth table', () => {
  it('situated + computed FAST → FAST', () => {
    const c = containSituatedProfile('FAST', true);
    expect(c.executed).toBe('FAST');
    expect(c.contained).toBe(false);
  });

  it('situated + computed CORE → CORE', () => {
    const c = containSituatedProfile('CORE', true);
    expect(c.executed).toBe('CORE');
    expect(c.contained).toBe(false);
  });

  it('situated + computed DEEP → CORE', () => {
    const c = containSituatedProfile('DEEP', true);
    expect(c.executed).toBe('CORE');
    expect(c.contained).toBe(true);
    expect(c.reason).toBe(SITUATED_DEEP_CONTAINMENT_REASON);
  });

  it('UNSITUATED + computed DEEP → DEEP, untouched', () => {
    // Ordinary MAIA routing is bit-for-bit unchanged. This unit contains one
    // narrow case; it does not cap DEEP.
    const c = containSituatedProfile('DEEP', false);
    expect(c.executed).toBe('DEEP');
    expect(c.contained).toBe(false);
    expect(c.reason).toBeUndefined();
  });

  it('leaves unsituated FAST and CORE alone as well', () => {
    for (const p of ['FAST', 'CORE'] as const) {
      expect(containSituatedProfile(p, false).executed).toBe(p);
    }
  });
});

describe('containment cannot be reached without server verification', () => {
  it('never triggers on a falsy situated flag, whatever the profile', () => {
    // The caller derives the flag from the SERVER-BUILT addendum, which the
    // route assigns after the `...meta` spread and leaves undefined whenever
    // the work id failed to resolve against the member's own row. A forged or
    // foreign id therefore arrives here as false.
    for (const p of ['FAST', 'CORE', 'DEEP']) {
      expect(containSituatedProfile(p, false).contained).toBe(false);
    }
  });

  it('is the only path to a contained result', () => {
    // There is no other way to produce contained:true — no default, no
    // environment flag, no override field.
    expect(containSituatedProfile('DEEP', true).contained).toBe(true);
    expect(containSituatedProfile('deep', true).contained).toBe(false); // exact match only
  });
});

describe('an unfamiliar tier is passed through, never reshaped', () => {
  it('leaves RCN and BETWEEN alone even when situated', () => {
    // Silently reshaping a tier this module does not know is how a narrow
    // containment becomes a broad one.
    for (const p of ['RCN', 'BETWEEN', 'UNKNOWN']) {
      const c = containSituatedProfile(p, true);
      expect(c.executed).toBe(p);
      expect(c.contained).toBe(false);
    }
  });
});

describe('both facts survive, so the containment stays visible', () => {
  it('never reports that the router chose CORE', () => {
    const c = containSituatedProfile('DEEP', true);
    // The whole point: a containment that overwrote `computed` would become
    // invisible debt and telemetry would misreport the router's intent.
    expect(c.computed).toBe('DEEP');
    expect(c.executed).toBe('CORE');
    expect(summarizeContainmentForLog(c)).toEqual({
      computedProfile: 'DEEP',
      executedProfile: 'CORE',
      contained: true,
      reason: SITUATED_DEEP_CONTAINMENT_REASON,
    });
  });

  it('reports no reason when nothing was contained', () => {
    expect(summarizeContainmentForLog(containSituatedProfile('DEEP', false))).toEqual({
      computedProfile: 'DEEP',
      executedProfile: 'DEEP',
      contained: false,
    });
  });
});
