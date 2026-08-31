/**
 * P0 acceptance witness — the contract's whole purpose is that omitted or
 * unregistered intelligence CANNOT disappear silently.
 *
 * Most of that proof is the typechecker, not this file: `INTELLIGENCE_REGISTRY`
 * and every tier of `TIER_DISPOSITION` are `Record<IntelligenceSourceId, ...>`,
 * so a source added to the union without a registry entry and a declared
 * disposition on all three tiers does not compile. These tests pin the
 * properties a type cannot express, and pin the observed tier gaps so that
 * packet P3 must change them deliberately rather than by drift.
 */

import {
  AUTHORITY_RANKS,
  INTELLIGENCE_REGISTRY,
  TIER_DISPOSITION,
  authorityOf,
  unratifiedTierGaps,
  type IntelligenceSourceId,
  type ProcessingTier,
} from '../intelligenceSources';

const TIERS: ProcessingTier[] = ['FAST', 'CORE', 'DEEP'];
const ALL_SOURCES = Object.keys(INTELLIGENCE_REGISTRY) as IntelligenceSourceId[];

describe('intelligence source registry', () => {
  it('declares a disposition for every source on every tier', () => {
    for (const tier of TIERS) {
      for (const source of ALL_SOURCES) {
        expect(TIER_DISPOSITION[tier][source]).toBeDefined();
      }
    }
  });

  it('has no tier carrying a source the registry does not know', () => {
    for (const tier of TIERS) {
      const declared = Object.keys(TIER_DISPOSITION[tier]);
      expect(declared.sort()).toEqual([...ALL_SOURCES].sort());
    }
  });

  it('requires a consent gate wherever significance is member-declared', () => {
    for (const source of ALL_SOURCES) {
      const spec = INTELLIGENCE_REGISTRY[source];
      if (spec.memberDeclaredSignificance) {
        expect(spec.consentGate).not.toBeNull();
      }
    }
  });

  it('ranks member-declared significance above system inference', () => {
    // The invariant the whole program exists to protect. Significance belongs
    // to the member, never to MAIA.
    for (const source of ALL_SOURCES) {
      const spec = INTELLIGENCE_REGISTRY[source];
      if (spec.memberDeclaredSignificance) {
        expect(authorityOf(source)).toBeLessThan(AUTHORITY_RANKS.system_inferred);
      }
    }
  });

  it('keeps corpus below member-authored experience', () => {
    // MAIA may hold something from Elemental Alchemy that is relevant. She may
    // not use the book to overrule what the person says is happening to them.
    expect(AUTHORITY_RANKS.corpus).toBeGreaterThan(AUTHORITY_RANKS.member_authored);
    expect(AUTHORITY_RANKS.corpus).toBeGreaterThan(AUTHORITY_RANKS.member_declared);
  });

  it('keeps protection above everything', () => {
    const ranks = Object.values(AUTHORITY_RANKS);
    expect(AUTHORITY_RANKS.protection).toBe(Math.min(...ranks));
  });

  it('maps every source to a distinct legacy context key', () => {
    // Guards the P2 byte-identical-prompt witness: two sources sharing a key
    // would make pass-through unprovable.
    const keys = ALL_SOURCES.map((s) => INTELLIGENCE_REGISTRY[s].legacyContextKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('tier inversion is declared, not invisible', () => {
  it('FAST has no unratified gaps (it is the richest tier today)', () => {
    expect(unratifiedTierGaps('FAST')).toEqual([]);
  });

  it('pins the CORE gaps found by the Phase 1 census (finding D7)', () => {
    // Packet P3 closes these. Until then they must not drift silently in
    // either direction — neither quietly widening nor quietly "fixed" outside
    // the packet sequence.
    expect(unratifiedTierGaps('CORE').sort()).toEqual(
      ['developmentalMemory', 'forwardReadiness', 'knowledgeField', 'youthSupport'].sort()
    );
  });

  it('records that DEEP loses the most memory (findings D7 + D8)', () => {
    // The inversion the ruling calls architecturally incorrect: the deeper the
    // tier, the less memory MAIA has.
    const deep = unratifiedTierGaps('DEEP').length;
    const core = unratifiedTierGaps('CORE').length;
    const fast = unratifiedTierGaps('FAST').length;
    expect(deep).toBeGreaterThan(core);
    expect(core).toBeGreaterThan(fast);
  });

  it('shows developmental memory reaching FAST and no deeper', () => {
    expect(TIER_DISPOSITION.FAST.developmentalMemory).toBe('reaches');
    expect(TIER_DISPOSITION.CORE.developmentalMemory).toBe('absent_unratified');
    expect(TIER_DISPOSITION.DEEP.developmentalMemory).toBe('absent_unratified');
  });
});
