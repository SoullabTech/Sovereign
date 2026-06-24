/**
 * Practitioner-attribution guard — regression tests.
 *
 * Bridge-verification finding 2026-06-24: practitioner attribution was
 * double-stored (facilitator_id column + provenance.practitioner_id jsonb), the
 * loader read only the column, and 9/10 practitioner_observation atoms carried
 * attribution only in the jsonb → they would have surfaced as "a practitioner
 * observed…" with nothing backing them.
 *
 * Canonical decision (Kelly): `facilitator_id` is canonical runtime attribution;
 * `provenance` is audit history. These tests lock the two guards that enforce it:
 *   1. the loader excludes unattributed practitioner atoms (PRACTITIONER_ATTRIBUTION_GUARD)
 *   2. keepSource (member-keep path) refuses to write practitioner atoms at all
 */
import {
  PRACTITIONER_ATTRIBUTION_GUARD,
  formatAtomsForPrompt,
  type MemoryAtomSnapshot,
} from '../memoryAtomsLoader';
import { keepSource } from '../../psyche/portfolio';
import type { KeepGestureInput } from '../../psyche/types';

function snapshot(overrides: Partial<MemoryAtomSnapshot> = {}): MemoryAtomSnapshot {
  return {
    id: 'atom-1',
    title: 'untitled',
    body: null,
    primaryRegister: null,
    registers: [],
    elementalLenses: [],
    status: 'active',
    keptAt: new Date('2026-06-01T00:00:00Z'),
    returnPreference: 'contextual_doorway',
    sourceType: 'idea',
    isBreakthrough: false,
    markedBreakthroughAt: null,
    epistemologicalStatus: null,
    facilitatorId: null,
    ...overrides,
  };
}

describe('PRACTITIONER_ATTRIBUTION_GUARD (loader eligibility)', () => {
  it('requires facilitator_id for practitioner_observation atoms', () => {
    expect(PRACTITIONER_ATTRIBUTION_GUARD).toContain('practitioner_observation');
    expect(PRACTITIONER_ATTRIBUTION_GUARD).toContain('facilitator_id IS NOT NULL');
  });

  it('leaves non-practitioner atoms unaffected (disjunction on source_type)', () => {
    expect(PRACTITIONER_ATTRIBUTION_GUARD).toMatch(
      /source_type\s*<>\s*'practitioner_observation'\s+OR/,
    );
  });
});

describe('keepSource refuses to write practitioner atoms', () => {
  it('rejects sourceType=practitioner_observation (must use the facilitated With-Me path)', async () => {
    const input: KeepGestureInput = {
      memberId: 'member-1',
      sourceType: 'practitioner_observation',
      sourceId: 'src-1',
      title: 'noticed something',
      body: null,
    };
    await expect(keepSource('member-1', input)).rejects.toThrow(/With-Me|facilitator/i);
  });
});

describe('formatAtomsForPrompt rendering discipline', () => {
  it('renders an attributed practitioner atom under PRACTITIONER OBSERVATIONS with epistemic framing', () => {
    const out = formatAtomsForPrompt([
      snapshot({
        sourceType: 'practitioner_observation',
        title: 'a pattern in session',
        body: 'observed text',
        facilitatorId: 'facilitator-1',
        epistemologicalStatus: 'observed',
      }),
    ]);
    expect(out).toContain('# PRACTITIONER OBSERVATIONS');
    expect(out).toMatch(/A practitioner observed/i);
    expect(out).not.toContain('# MEMBER-PLACED PORTFOLIO');
  });

  it('keeps member atoms in the member section, never the practitioner section', () => {
    const out = formatAtomsForPrompt([snapshot({ sourceType: 'idea', title: 'a thought' })]);
    expect(out).toContain('# MEMBER-PLACED PORTFOLIO');
    expect(out).not.toContain('# PRACTITIONER OBSERVATIONS');
  });
});
