import {
  CAPABILITY_AUTHORITY_IDS,
  CAPABILITY_AUTHORITY_REGISTRY,
  LEGACY_CAPABILITY_LEDGER,
  O3_RUNTIME_ELIGIBILITY,
  validateCapabilityAuthorityRegistry,
  type CapabilityAuthorityDescriptor,
} from '../capabilityAuthorityRegistry';

const EXPECTED_IDS = [
  'journal.create',
  'journal.save',
  'journal.dream',
  'astrology.reading',
  'astrology.transit.current',
  'astrology.transit.personal',
  'wisdom.open',
  'wisdom.surface',
  'wisdom.text.open',
  'relationship.reflect',
  'shadow.open',
  'studio.choose',
  'studio.writer.open',
  'studio.personal.open',
  'studio.pro.open',
  'booking.practitioner.request',
  'studio.session.create',
  'pattern.detect',
] as const;

function cloneRegistry(): CapabilityAuthorityDescriptor[] {
  return JSON.parse(JSON.stringify(CAPABILITY_AUTHORITY_REGISTRY));
}
describe('Capability Authority Registry v2 — O3 inert admission', () => {
  test('admits the exact 18 O2R4 identities in order', () => {
    expect(CAPABILITY_AUTHORITY_IDS).toEqual(EXPECTED_IDS);
    expect(CAPABILITY_AUTHORITY_REGISTRY.map(d => d.id)).toEqual(EXPECTED_IDS);
    expect(new Set(CAPABILITY_AUTHORITY_IDS).size).toBe(18);
  });

  test('canonical registry passes its pure structural validator', () => {
    expect(validateCapabilityAuthorityRegistry()).toEqual([]);
  });

  test('every descriptor remains runtime-ineligible under O3', () => {
    expect(CAPABILITY_AUTHORITY_REGISTRY.every(
      d => d.runtimeEligibility === O3_RUNTIME_ELIGIBILITY
    )).toBe(true);
  });

  test('gate standing distribution is preserved', () => {
    const counts = CAPABILITY_AUTHORITY_REGISTRY.reduce<Record<string, number>>(
      (acc, d) => {
        acc[d.authorityGateStanding] = (acc[d.authorityGateStanding] ?? 0) + 1;
        return acc;
      },
      {}
    );
    expect(counts).toEqual({
      PARTIAL: 5,
      COMPLETE: 6,
      UNRESOLVED: 6,
      WITHHELD: 1,
    });
  });
  test('the six unresolved authority gates remain verbatim', () => {
    const unknowns = CAPABILITY_AUTHORITY_REGISTRY
      .flatMap(d => d.authority.unknownRefs)
      .sort();

    expect(unknowns).toEqual([
      'UNKNOWN:booking-external-effect-policy',
      'UNKNOWN:current-shadow-constitution',
      'UNKNOWN:personal-studio-product-status',
      'UNKNOWN:pro-studio-entitlement-policy',
      'UNKNOWN:source-rights-policy',
      'UNKNOWN:writers-studio-entitlement-policy',
    ]);
  });

  test('pattern.detect remains withheld and not member-invokable', () => {
    const pattern = CAPABILITY_AUTHORITY_REGISTRY.find(
      d => d.id === 'pattern.detect'
    );
    expect(pattern?.lifecycle).toBe('WITHHELD');
    expect(pattern?.authorityGateStanding).toBe('WITHHELD');
    expect(pattern?.consent).toBe('NOT_MEMBER_INVOKABLE');
  });

  test('legacy compatibility ledger contains no alias/successor authority', () => {
    for (const entry of LEGACY_CAPABILITY_LEDGER) {
      expect(entry).not.toHaveProperty('successorId');
      expect(entry).not.toHaveProperty('alias');
      expect(entry).not.toHaveProperty('mapsTo');
    }
  });
});
describe('Capability Authority Registry v2 — falsifiers', () => {
  test('COMPLETE cannot carry an unknown authority gate', () => {
    const candidate = cloneRegistry();
    const target = candidate.find(d => d.authorityGateStanding === 'COMPLETE')!;
    (target.authority.unknownRefs as string[]).push('UNKNOWN:injected');

    expect(validateCapabilityAuthorityRegistry(candidate)).toContain(
      target.id + ':COMPLETE_HAS_OPEN_GATE'
    );
  });

  test('PARTIAL must carry a named gap and no unknown authority', () => {
    const candidate = cloneRegistry();
    const target = candidate.find(d => d.authorityGateStanding === 'PARTIAL')!;
    (target.authority as { gapRefs: string[] }).gapRefs = [];

    expect(validateCapabilityAuthorityRegistry(candidate)).toContain(
      target.id + ':PARTIAL_GATE_SHAPE_INVALID'
    );
  });

  test('UNRESOLVED must retain an explicit UNKNOWN reference', () => {
    const candidate = cloneRegistry();
    const target = candidate.find(d => d.authorityGateStanding === 'UNRESOLVED')!;
    (target.authority as { unknownRefs: string[] }).unknownRefs = [];

    expect(validateCapabilityAuthorityRegistry(candidate)).toContain(
      target.id + ':UNRESOLVED_WITHOUT_UNKNOWN'
    );
  });
  test('WITHHELD gate cannot be promoted to DECLARED lifecycle', () => {
    const candidate = cloneRegistry();
    const target = candidate.find(d => d.id === 'pattern.detect')!;
    (target as { lifecycle: 'DECLARED' | 'WITHHELD' }).lifecycle = 'DECLARED';

    expect(validateCapabilityAuthorityRegistry(candidate)).toContain(
      'pattern.detect:WITHHELD_LIFECYCLE_MISMATCH'
    );
  });

  test('runtime eligibility cannot be promoted by descriptor metadata', () => {
    const candidate = cloneRegistry();
    const target = candidate[0] as CapabilityAuthorityDescriptor & {
      runtimeEligibility: string;
    };
    target.runtimeEligibility = 'AUTHORIZED';

    expect(validateCapabilityAuthorityRegistry(
      candidate as CapabilityAuthorityDescriptor[]
    )).toContain(target.id + ':RUNTIME_ELIGIBILITY_FORBIDDEN');
  });

  test('ambient authority fields are refused anywhere in a descriptor', () => {
    const candidate = cloneRegistry() as Array<
      CapabilityAuthorityDescriptor & { authorized?: boolean }
    >;
    candidate[0].authorized = true;

    expect(validateCapabilityAuthorityRegistry(candidate)).toContain(
      candidate[0].id + ':AMBIENT_AUTHORITY_FIELD_FORBIDDEN'
    );
  });

  test('gap references must disclose their class', () => {
    const candidate = cloneRegistry();
    const target = candidate.find(d => d.authorityGateStanding === 'PARTIAL')!;
    (target.authority.gapRefs as string[])[0] = 'UNCLASSIFIED_GAP';

    expect(validateCapabilityAuthorityRegistry(candidate)).toContain(
      target.id + ':GAP_REF_PREFIX_INVALID'
    );
  });
});
