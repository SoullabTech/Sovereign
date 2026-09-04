/**
 * MEMORY-PRODUCER-PARTITION-01 — member.atoms partition.
 *
 * The cut's whole claim is that canonical participant identity becomes truthful while
 * what MAIA receives does not move by one byte. These tests pin both halves, plus the
 * three witness shapes the founder distinguished (member-only / practitioner-only /
 * both), because "canonicalCount increased" would MISS the practitioner-only case —
 * the block changing identity from member to practitioner at count 1.
 */
import { describe, it, expect } from '@jest/globals';
import {
  projectAtomSections,
  joinAtomSections,
  formatAtomsForPrompt,
  ATOM_SECTION_SEPARATOR,
  type MemoryAtomSnapshot,
} from '../../memoryAtomsLoader';
import {
  assertUsablePartition,
  recompose,
  PartitionRefused,
  UNRESOLVED_MIXED_PRODUCERS,
  isUnresolvedMixed,
  type DeclaredPartition,
} from '../partition';
import { candidatesFromLegacyAddenda, compareLegacyToCanonical, type LegacyAddenda } from '../shadow';
import { PRODUCER_REGISTRY, PRODUCER_IDS } from '../producerRegistry';
import type { CanonicalTurn, Participant } from '../types';

function atom(over: Partial<MemoryAtomSnapshot>): MemoryAtomSnapshot {
  return {
    id: 'a1', title: 'A title', body: null, primaryRegister: null, registers: [],
    elementalLenses: [], status: 'active', keptAt: new Date('2026-09-01T00:00:00Z'),
    returnPreference: 'contextual_doorway', sourceType: 'spontaneous', isBreakthrough: false,
    markedBreakthroughAt: null, epistemologicalStatus: null, facilitatorId: null,
    ...over,
  } as MemoryAtomSnapshot;
}

const MEMBER_ATOM = atom({ id: 'm1', title: 'Member kept this', sourceType: 'spontaneous' });
const PRACTITIONER_ATOM = atom({
  id: 'p1', title: 'A facilitator noted this', sourceType: 'practitioner_observation',
  facilitatorId: 'f-123', epistemologicalStatus: 'observed', body: 'Observed in session.',
});

// ── The frozen half: legacy cognition must not move ──────────────────────────

describe('legacy projection is byte-frozen', () => {
  for (const [name, atoms] of [
    ['member only', [MEMBER_ATOM]],
    ['practitioner only', [PRACTITIONER_ATOM]],
    ['both', [MEMBER_ATOM, PRACTITIONER_ATOM]],
    ['empty', []],
  ] as const) {
    it(`${name}: formatAtomsForPrompt === present sections joined by the declared separator`, () => {
      const sections = projectAtomSections(atoms as MemoryAtomSnapshot[]);
      const expected = [sections.memberSection, sections.practitionerSection]
        .filter((s): s is string => typeof s === 'string')
        .join(ATOM_SECTION_SEPARATOR);
      expect(formatAtomsForPrompt(atoms as MemoryAtomSnapshot[])).toBe(expected);
      expect(joinAtomSections(sections)).toBe(expected);
    });
  }

  it('the separator is exactly the newline the block has always used', () => {
    expect(ATOM_SECTION_SEPARATOR).toBe('\n');
  });

  it('sections carry their own material and never the other authorship', () => {
    const s = projectAtomSections([MEMBER_ATOM, PRACTITIONER_ATOM]);
    expect(s.memberSection).toContain('# MEMBER-PLACED PORTFOLIO');
    expect(s.memberSection).toContain('Member kept this');
    expect(s.memberSection).not.toContain('A facilitator noted this');
    expect(s.practitionerSection).toContain('# PRACTITIONER OBSERVATIONS');
    expect(s.practitionerSection).toContain('A facilitator noted this');
    expect(s.practitionerSection).not.toContain('Member kept this');
  });
});

// ── The truthful half: registry identity ─────────────────────────────────────

describe('registry identity', () => {
  it('the practitioner producer is practitioner · authored · situate — NOT placed', () => {
    const spec = PRODUCER_REGISTRY['practitioner.atoms_observations'];
    expect(spec.authoredBy).toBe('practitioner');
    expect(spec.authority).toBe('situate');
    // `placed` would make MIPA assert admittedReason 'member_placed'. No member act
    // places these: return_preference defaults to contextual_doorway and
    // member_response_status is an opt-out verdict with no runtime writer for
    // 'confirmed'. Claiming placement would be a false consent claim.
    expect(spec.participationClass).not.toBe('placed');
    expect(spec.participationClass).toBe('authored');
  });

  it('member.atoms no longer claims to carry practitioner observations', () => {
    expect(PRODUCER_REGISTRY['member.atoms'].reason).not.toMatch(/practitioner/i);
  });

  it('member.atoms keeps `placed`, which is truthful for the member section alone', () => {
    expect(PRODUCER_REGISTRY['member.atoms'].participationClass).toBe('placed');
  });

  it('registry declaration order matches source order (member section renders first)', () => {
    expect(PRODUCER_IDS.indexOf('member.atoms'))
      .toBeLessThan(PRODUCER_IDS.indexOf('practitioner.atoms_observations'));
  });
});

// ── The contract ─────────────────────────────────────────────────────────────

function partitionFor(atoms: MemoryAtomSnapshot[]): { partition: DeclaredPartition; legacy: string } {
  const s = projectAtomSections(atoms);
  const segments = [
    ...(s.memberSection ? [{ producerId: 'member.atoms' as const, text: s.memberSection }] : []),
    ...(s.practitionerSection
      ? [{ producerId: 'practitioner.atoms_observations' as const, text: s.practitionerSection }]
      : []),
  ];
  return {
    partition: { legacyKey: 'atomsAddendum', separator: ATOM_SECTION_SEPARATOR, segments },
    legacy: joinAtomSections(s),
  };
}

describe('partition contract', () => {
  it('accepts the real partition and recomposes byte-exactly', () => {
    const { partition, legacy } = partitionFor([MEMBER_ATOM, PRACTITIONER_ATOM]);
    expect(() => assertUsablePartition(partition, legacy)).not.toThrow();
    expect(recompose(partition)).toBe(legacy);
  });

  it('refuses a partition that loses a byte', () => {
    const { partition, legacy } = partitionFor([MEMBER_ATOM, PRACTITIONER_ATOM]);
    const truncated = {
      ...partition,
      segments: [partition.segments[0], { ...partition.segments[1], text: partition.segments[1].text.slice(0, -1) }],
    };
    expect(() => assertUsablePartition(truncated, legacy)).toThrow(PartitionRefused);
  });

  it('refuses reordering — canonical renders in registry order, so source order must match', () => {
    const { partition, legacy } = partitionFor([MEMBER_ATOM, PRACTITIONER_ATOM]);
    const swapped = { ...partition, segments: [partition.segments[1], partition.segments[0]] };
    expect(() => assertUsablePartition(swapped, legacy)).toThrow(/registry_order_violation/);
  });

  it('refuses non-adjacent producers even when order increases — a gap splits the block', () => {
    const { partition, legacy } = partitionFor([MEMBER_ATOM, PRACTITIONER_ATOM]);
    // member.relational_context is declared AFTER practitioner.atoms_observations, so
    // {member.atoms, member.relational_context} is increasing but gapped: the canonical
    // renderer would place practitioner.atoms_observations between the two segments.
    const order = PRODUCER_IDS as readonly string[];
    expect(order.indexOf('member.relational_context'))
      .toBeGreaterThan(order.indexOf('practitioner.atoms_observations'));

    const gapped = {
      ...partition,
      segments: [
        partition.segments[0],
        { ...partition.segments[1], producerId: 'member.relational_context' as const },
      ],
    };
    expect(() => assertUsablePartition(gapped, legacy)).toThrow(/registry_adjacency_violation/);
  });

  it('the atoms partition itself is adjacent — no producer is declared between its segments', () => {
    const order = PRODUCER_IDS as readonly string[];
    expect(order.indexOf('practitioner.atoms_observations'))
      .toBe(order.indexOf('member.atoms') + 1);
  });

  it('refuses a repeated producer id — MIPA keys one block per producer', () => {
    const { partition, legacy } = partitionFor([MEMBER_ATOM, PRACTITIONER_ATOM]);
    const dup = { ...partition, segments: [partition.segments[0], partition.segments[0]] };
    expect(() => assertUsablePartition(dup, legacy)).toThrow(/duplicate_producer/);
  });

  it('refuses a segment whose declared authorship has no material — the member_web failure', () => {
    const { partition, legacy } = partitionFor([MEMBER_ATOM, PRACTITIONER_ATOM]);
    const hollow = {
      ...partition,
      segments: [partition.segments[0], { ...partition.segments[1], text: '   ' }],
    };
    expect(() => assertUsablePartition(hollow, legacy)).toThrow(/empty_segment|content_parity/);
  });

  it('the three unresolved producers are recorded as data, not prose', () => {
    expect(Object.keys(UNRESOLVED_MIXED_PRODUCERS).sort()).toEqual([
      'member.episodic_recall',
      'retrieved.conversational_recall',
      'retrieved.member_web',
    ]);
    expect(isUnresolvedMixed('retrieved.member_web')).toBe(true);
    expect(isUnresolvedMixed('member.atoms')).toBe(false);
    expect(isUnresolvedMixed('practitioner.atoms_observations')).toBe(false);
  });
});

// ── The three witness shapes ─────────────────────────────────────────────────

function turnWith(participants: { producerId: string; text: string }[]): CanonicalTurn {
  const admitted = participants.map((p) => ({
    producerId: p.producerId,
    authoredBy: PRODUCER_REGISTRY[p.producerId as keyof typeof PRODUCER_REGISTRY].authoredBy,
    participationClass: PRODUCER_REGISTRY[p.producerId as keyof typeof PRODUCER_REGISTRY].participationClass,
    authority: PRODUCER_REGISTRY[p.producerId as keyof typeof PRODUCER_REGISTRY].authority,
    disposition: 'ADMITTED',
    text: p.text,
  })) as unknown as readonly Participant[];
  return { participation: { admitted } } as unknown as CanonicalTurn;
}

describe('shadow witness — the three atoms shapes', () => {
  it('MEMBER ONLY: no partition declared; ordinary zeroDiff still healthy', () => {
    const legacy: LegacyAddenda = { atomsAddendum: formatAtomsForPrompt([MEMBER_ATOM]) };
    const cands = candidatesFromLegacyAddenda(legacy, {});
    expect(cands.map((c) => c.producerId)).toEqual(['member.atoms']);
    const diff = compareLegacyToCanonical(legacy, turnWith(cands), {});
    expect(diff.zeroDiff).toBe(true);
    expect(diff.expectedPartitionDelta).toEqual([]);
    expect(diff.contentParity).toBeNull();
    expect(diff.unexpectedDiff).toEqual([]);
  });

  it('PRACTITIONER ONLY: identity changes, count stays 1 — the case a count check would miss', () => {
    const { partition, legacy: text } = partitionFor([PRACTITIONER_ATOM]);
    const legacy: LegacyAddenda = { atomsAddendum: text };
    const partitions = { atomsAddendum: partition };
    const cands = candidatesFromLegacyAddenda(legacy, partitions);
    expect(cands.map((c) => c.producerId)).toEqual(['practitioner.atoms_observations']);

    const diff = compareLegacyToCanonical(legacy, turnWith(cands), partitions);
    expect(diff.legacyCount).toBe(1);
    expect(diff.canonicalCount).toBe(1);          // count did NOT rise
    expect(diff.zeroDiff).toBe(false);            // but identity moved
    expect(diff.missingInCanonical).toEqual(['member.atoms']);
    expect(diff.missingInLegacy).toEqual(['practitioner.atoms_observations']);
    expect(diff.contentParity).toBe(true);
    expect(diff.unexpectedDiff).toEqual([]);
  });

  it('BOTH: count rises by exactly the declared delta, content byte-identical', () => {
    const { partition, legacy: text } = partitionFor([MEMBER_ATOM, PRACTITIONER_ATOM]);
    const legacy: LegacyAddenda = { atomsAddendum: text };
    const partitions = { atomsAddendum: partition };
    const cands = candidatesFromLegacyAddenda(legacy, partitions);
    expect(cands.map((c) => c.producerId)).toEqual(['member.atoms', 'practitioner.atoms_observations']);

    const diff = compareLegacyToCanonical(legacy, turnWith(cands), partitions);
    expect(diff.legacyCount).toBe(1);
    expect(diff.canonicalCount).toBe(2);
    expect(diff.contentParity).toBe(true);
    expect(diff.unexpectedDiff).toEqual([]);
    expect(diff.expectedPartitionDelta).toEqual([
      {
        legacyKey: 'atomsAddendum',
        legacyProducer: 'member.atoms',
        canonicalProducers: ['member.atoms', 'practitioner.atoms_observations'],
      },
    ]);
  });

  it('a turn carrying a partitioned producer may NOT report zeroDiff true', () => {
    const { partition, legacy: text } = partitionFor([MEMBER_ATOM, PRACTITIONER_ATOM]);
    const partitions = { atomsAddendum: partition };
    const legacy: LegacyAddenda = { atomsAddendum: text };
    const diff = compareLegacyToCanonical(legacy, turnWith(candidatesFromLegacyAddenda(legacy, partitions)), partitions);
    expect(diff.zeroDiff).toBe(false);
  });

  it('an unrelated producer whose BYTES changed is UNEXPECTED — the narrowing exemption is narrow', () => {
    const { partition, legacy: text } = partitionFor([MEMBER_ATOM, PRACTITIONER_ATOM]);
    const partitions = { atomsAddendum: partition };
    const legacy: LegacyAddenda = { atomsAddendum: text, placeAddendum: 'a place block' };
    const cands = candidatesFromLegacyAddenda(legacy, partitions)
      .map((c) => (c.producerId === 'house.place' ? { ...c, text: 'a DIFFERENT place block' } : c));
    const diff = compareLegacyToCanonical(legacy, turnWith(cands), partitions);
    expect(diff.digestMismatch).toContain('house.place');
    expect(diff.unexpectedDiff).toContain('house.place');
    // member.atoms narrowed legitimately and must NOT appear as unexpected.
    expect(diff.unexpectedDiff).not.toContain('member.atoms');
  });

  it('an unrelated producer missing from canonical is UNEXPECTED, never excused by a partition', () => {
    const { partition, legacy: text } = partitionFor([MEMBER_ATOM, PRACTITIONER_ATOM]);
    const partitions = { atomsAddendum: partition };
    const legacy: LegacyAddenda = { atomsAddendum: text, placeAddendum: 'a place block' };
    const cands = candidatesFromLegacyAddenda(legacy, partitions).filter((c) => c.producerId !== 'house.place');
    const diff = compareLegacyToCanonical(legacy, turnWith(cands), partitions);
    expect(diff.unexpectedDiff).toContain('house.place');
  });
});
