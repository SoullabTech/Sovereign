/**
 * repairPriority Unit Tests
 *
 * Verifies that the three failure classes map to the correct priority tier,
 * and that the tiers are mutually exclusive and exhaustive.
 */

import { repairPriority, NodeProvenanceStats } from '../elementNodeGenerator';

function makeStats(overrides: Partial<NodeProvenanceStats> = {}): NodeProvenanceStats {
  const base: NodeProvenanceStats = {
    total: 10,
    canonical: 10,
    legacyCoerced: 0,
    coercedFromAetherSingleton: 0,
    coercedFromInvalidString: 0,
    coercedFromEmptyOrNull: 0,
    ...overrides,
  };
  // Keep total and canonical consistent with overrides
  const coerced = base.coercedFromAetherSingleton + base.coercedFromInvalidString + base.coercedFromEmptyOrNull;
  return {
    ...base,
    legacyCoerced: coerced,
    canonical: base.total - coerced,
  };
}

describe('repairPriority: clean', () => {
  it('returns clean when no coercion occurred', () => {
    expect(repairPriority(makeStats())).toBe('clean');
  });

  it('returns clean for empty node set', () => {
    expect(repairPriority(makeStats({ total: 0 }))).toBe('clean');
  });
});

describe('repairPriority: medium', () => {
  it('returns medium when only aether singleton coercions exist', () => {
    expect(repairPriority(makeStats({ coercedFromAetherSingleton: 2 }))).toBe('medium');
  });

  it('returns medium for single aether singleton coercion', () => {
    expect(repairPriority(makeStats({ coercedFromAetherSingleton: 1 }))).toBe('medium');
  });
});

describe('repairPriority: high', () => {
  it('returns high when coercedFromEmptyOrNull > 0', () => {
    expect(repairPriority(makeStats({ coercedFromEmptyOrNull: 1 }))).toBe('high');
  });

  it('returns high when coercedFromInvalidString > 0', () => {
    expect(repairPriority(makeStats({ coercedFromInvalidString: 1 }))).toBe('high');
  });

  it('high overrides medium — emptyOrNull + aetherSingleton → still high', () => {
    expect(repairPriority(makeStats({
      coercedFromEmptyOrNull: 1,
      coercedFromAetherSingleton: 3,
    }))).toBe('high');
  });

  it('high overrides medium — invalidString + aetherSingleton → still high', () => {
    expect(repairPriority(makeStats({
      coercedFromInvalidString: 1,
      coercedFromAetherSingleton: 2,
    }))).toBe('high');
  });

  it('returns high when all three coercion classes present', () => {
    expect(repairPriority(makeStats({
      coercedFromAetherSingleton: 1,
      coercedFromInvalidString: 1,
      coercedFromEmptyOrNull: 1,
    }))).toBe('high');
  });
});

describe('repairPriority: priority ordering invariant', () => {
  it('high > medium > clean ordering is strict', () => {
    const high   = repairPriority(makeStats({ coercedFromEmptyOrNull: 1 }));
    const medium = repairPriority(makeStats({ coercedFromAetherSingleton: 1 }));
    const clean  = repairPriority(makeStats());

    // Verify the semantic ordering is correct
    expect(high).toBe('high');
    expect(medium).toBe('medium');
    expect(clean).toBe('clean');

    // Verify they are all distinct
    expect(new Set([high, medium, clean]).size).toBe(3);
  });
});
