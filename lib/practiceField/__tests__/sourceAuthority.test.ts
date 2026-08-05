/**
 * Permission compiler — synthetic-material tests.
 *
 * All fixtures are invented ("Dr. Synthetic") — no Larry-shaped content, no
 * Larry-specific naming. The schema is universal; these tests prove the
 * compiler behaves identically for any practitioner's provenance graph.
 *
 * Spec: docs/governance/PRACTITIONER_FIELD_AUTHORITY_SCHEMA.md Part 1 (§1.1
 * validation rule), compiled by lib/practiceField/sourceAuthority.ts.
 */
import { describe, it, expect } from '@jest/globals';
import {
  compileSourceComposability,
  compileFieldCorpusComposability,
  type PractitionerSourceInput,
} from '@/lib/practiceField/sourceAuthority';

function source(overrides: Partial<PractitionerSourceInput> & { id: string }): PractitionerSourceInput {
  return {
    source_type: 'authored_framework',
    source_relationship_state: 'unknown',
    source_relationship_kind: null,
    derived_from: [],
    validated_by: null,
    validated_at: null,
    status: 'discovered',
    ...overrides,
  };
}

describe('compileSourceComposability — state gate (missing ⊥ negative provenance)', () => {
  it('blocks state=unknown as an absence, not a claim', () => {
    const s = source({
      id: 'src-unknown',
      status: 'ratified',
      source_relationship_state: 'unknown',
    });
    const result = compileSourceComposability(s, [s]);
    expect(result).toEqual({ composable: false, reason: 'unknown_provenance' });
  });

  it('blocks state=asserted — a claim recorded but not confirmed by the source practitioner', () => {
    const s = source({
      id: 'src-asserted',
      status: 'ratified',
      source_relationship_state: 'asserted',
      source_relationship_kind: 'primary',
    });
    const result = compileSourceComposability(s, [s]);
    expect(result.composable).toBe(false);
    expect(result.reason).toBe('not_validated');
  });

  it('unknown and asserted are distinct reasons, never collapsed', () => {
    const unknown = source({ id: 'a', status: 'ratified', source_relationship_state: 'unknown' });
    const asserted = source({
      id: 'b',
      status: 'ratified',
      source_relationship_state: 'asserted',
      source_relationship_kind: 'primary',
    });
    expect(compileSourceComposability(unknown, [unknown]).reason).not.toBe(
      compileSourceComposability(asserted, [asserted]).reason
    );
  });
});

describe('compileSourceComposability — primary sources', () => {
  it('composes: Dr. Synthetic\'s own authored framework, ratified + validated', () => {
    // Title kept only in the test's comment for readability — the
    // compiler's input shape has no `title` field.
    const s = source({
      id: 'src-primary-1',
      status: 'ratified',
      source_relationship_state: 'validated',
      source_relationship_kind: 'primary',
      validated_by: 'member-dr-synthetic',
      validated_at: '2026-08-05T00:00:00Z',
    });
    const result = compileSourceComposability(s, [s]);
    expect(result).toEqual({ composable: true });
  });

  it('blocks a primary source that has not been ratified yet, even if validated', () => {
    const s = source({
      id: 'src-primary-unratified',
      status: 'reviewed',
      source_relationship_state: 'validated',
      source_relationship_kind: 'primary',
      validated_by: 'member-dr-synthetic',
      validated_at: '2026-08-05T00:00:00Z',
    });
    const result = compileSourceComposability(s, [s]);
    expect(result.composable).toBe(false);
    expect(result.reason).toBe('not_ratified');
  });
});

describe('compileSourceComposability — derived_from_primary', () => {
  it('composes: a summary validated-derived from a validated, ratified primary source', () => {
    const primary = source({
      id: 'primary-1',
      status: 'ratified',
      source_relationship_state: 'validated',
      source_relationship_kind: 'primary',
      validated_by: 'member-dr-synthetic',
      validated_at: '2026-08-05T00:00:00Z',
    });
    const summary = source({
      id: 'summary-1',
      source_type: 'derived_summary',
      status: 'ratified',
      source_relationship_state: 'validated',
      source_relationship_kind: 'derived_from_primary',
      derived_from: ['primary-1'],
      validated_by: 'member-dr-synthetic',
      validated_at: '2026-08-05T00:05:00Z',
    });
    const result = compileSourceComposability(summary, [primary, summary]);
    expect(result).toEqual({ composable: true });
  });

  it('compile FAILS (never downgrades) when derived_from names an interpretation', () => {
    // This is the shape of the 2026-08-03 incident, reproduced with fully
    // synthetic material: a summary claims derivation from a primary
    // framework, but the named source is actually a reading OF the work.
    const interpretation = source({
      id: 'interp-1',
      status: 'ratified',
      source_relationship_state: 'validated',
      source_relationship_kind: 'interpretation',
      validated_by: 'member-dr-synthetic',
      validated_at: '2026-08-05T00:00:00Z',
    });
    const summary = source({
      id: 'summary-bad',
      source_type: 'derived_summary',
      status: 'ratified',
      source_relationship_state: 'validated',
      source_relationship_kind: 'derived_from_primary',
      derived_from: ['interp-1'],
      validated_by: 'member-dr-synthetic',
      validated_at: '2026-08-05T00:05:00Z',
    });
    const result = compileSourceComposability(summary, [interpretation, summary]);
    expect(result.composable).toBe(false);
    expect(result.reason).toBe('invalid_derivation');
    // Never downgrades to some weaker-but-passing outcome.
    expect(result.composable).not.toBe(true);
  });

  it('compile FAILS when derived_from names a selection', () => {
    const selection = source({
      id: 'selection-1',
      status: 'ratified',
      source_relationship_state: 'validated',
      source_relationship_kind: 'selection',
      validated_by: 'member-dr-synthetic',
      validated_at: '2026-08-05T00:00:00Z',
    });
    const summary = source({
      id: 'summary-bad-2',
      source_type: 'derived_summary',
      status: 'ratified',
      source_relationship_state: 'validated',
      source_relationship_kind: 'derived_from_primary',
      derived_from: ['selection-1'],
      validated_by: 'member-dr-synthetic',
      validated_at: '2026-08-05T00:05:00Z',
    });
    const result = compileSourceComposability(summary, [selection, summary]);
    expect(result.composable).toBe(false);
    expect(result.reason).toBe('invalid_derivation');
  });

  it('compile FAILS when derived_from names an unresolvable id', () => {
    const summary = source({
      id: 'summary-orphan',
      source_type: 'derived_summary',
      status: 'ratified',
      source_relationship_state: 'validated',
      source_relationship_kind: 'derived_from_primary',
      derived_from: ['does-not-exist'],
      validated_by: 'member-dr-synthetic',
      validated_at: '2026-08-05T00:05:00Z',
    });
    const result = compileSourceComposability(summary, [summary]);
    expect(result.composable).toBe(false);
    expect(result.reason).toBe('invalid_derivation');
  });

  it('propagates a block from an unratified primary parent to its derived summary', () => {
    const unratifiedPrimary = source({
      id: 'primary-unratified',
      status: 'discovered',
      source_relationship_state: 'validated',
      source_relationship_kind: 'primary',
      validated_by: 'member-dr-synthetic',
      validated_at: '2026-08-05T00:00:00Z',
    });
    const summary = source({
      id: 'summary-inherits-block',
      source_type: 'derived_summary',
      status: 'ratified',
      source_relationship_state: 'validated',
      source_relationship_kind: 'derived_from_primary',
      derived_from: ['primary-unratified'],
      validated_by: 'member-dr-synthetic',
      validated_at: '2026-08-05T00:05:00Z',
    });
    const result = compileSourceComposability(summary, [unratifiedPrimary, summary]);
    expect(result.composable).toBe(false);
    expect(result.reason).toBe('invalid_derivation');
  });
});

describe('compileSourceComposability — withdrawn / rejected', () => {
  it('blocks a rejected source with reason "rejected", distinct from not_ratified', () => {
    const s = source({
      id: 'src-rejected',
      status: 'rejected',
      source_relationship_state: 'validated',
      source_relationship_kind: 'primary',
      validated_by: 'member-dr-synthetic',
      validated_at: '2026-08-05T00:00:00Z',
    });
    const result = compileSourceComposability(s, [s]);
    expect(result).toEqual({ composable: false, reason: 'rejected' });
  });

  it('blocks a discovered (not-yet-reviewed) source distinctly from a rejected one', () => {
    const discovered = source({
      id: 'src-discovered',
      status: 'discovered',
      source_relationship_state: 'validated',
      source_relationship_kind: 'primary',
      validated_by: 'member-dr-synthetic',
      validated_at: '2026-08-05T00:00:00Z',
    });
    const rejected = source({
      id: 'src-rejected-2',
      status: 'rejected',
      source_relationship_state: 'validated',
      source_relationship_kind: 'primary',
      validated_by: 'member-dr-synthetic',
      validated_at: '2026-08-05T00:00:00Z',
    });
    expect(compileSourceComposability(discovered, [discovered]).reason).toBe('not_ratified');
    expect(compileSourceComposability(rejected, [rejected]).reason).toBe('rejected');
  });
});

describe('compileSourceComposability — invalid top-level kind', () => {
  it('blocks a top-level interpretation even when ratified + validated', () => {
    const s = source({
      id: 'src-interp-top',
      status: 'ratified',
      source_relationship_state: 'validated',
      source_relationship_kind: 'interpretation',
      validated_by: 'member-dr-synthetic',
      validated_at: '2026-08-05T00:00:00Z',
    });
    const result = compileSourceComposability(s, [s]);
    expect(result.composable).toBe(false);
    expect(result.reason).toBe('invalid_kind');
  });

  it('blocks a top-level selection even when ratified + validated', () => {
    const s = source({
      id: 'src-selection-top',
      status: 'ratified',
      source_relationship_state: 'validated',
      source_relationship_kind: 'selection',
      validated_by: 'member-dr-synthetic',
      validated_at: '2026-08-05T00:00:00Z',
    });
    const result = compileSourceComposability(s, [s]);
    expect(result.composable).toBe(false);
    expect(result.reason).toBe('invalid_kind');
  });
});

describe('derived_summary inherits the strictest permission of its parents', () => {
  it('one blocked parent among several blocks the whole derived_summary', () => {
    const goodParent = source({
      id: 'parent-good',
      status: 'ratified',
      source_relationship_state: 'validated',
      source_relationship_kind: 'primary',
      validated_by: 'member-dr-synthetic',
      validated_at: '2026-08-05T00:00:00Z',
    });
    const badParent = source({
      id: 'parent-bad',
      status: 'discovered', // not ratified
      source_relationship_state: 'validated',
      source_relationship_kind: 'primary',
      validated_by: 'member-dr-synthetic',
      validated_at: '2026-08-05T00:00:00Z',
    });
    const summary = source({
      id: 'summary-mixed',
      source_type: 'derived_summary',
      status: 'ratified',
      source_relationship_state: 'validated',
      source_relationship_kind: 'derived_from_primary',
      derived_from: ['parent-good', 'parent-bad'],
      validated_by: 'member-dr-synthetic',
      validated_at: '2026-08-05T00:05:00Z',
    });
    const result = compileSourceComposability(summary, [goodParent, badParent, summary]);
    expect(result.composable).toBe(false);
    expect(result.reason).toBe('invalid_derivation');
  });

  it('composes only when every named parent independently composes', () => {
    const parentA = source({
      id: 'parent-a',
      status: 'ratified',
      source_relationship_state: 'validated',
      source_relationship_kind: 'primary',
      validated_by: 'member-dr-synthetic',
      validated_at: '2026-08-05T00:00:00Z',
    });
    const parentB = source({
      id: 'parent-b',
      status: 'ratified',
      source_relationship_state: 'validated',
      source_relationship_kind: 'primary',
      validated_by: 'member-dr-synthetic',
      validated_at: '2026-08-05T00:00:00Z',
    });
    const summary = source({
      id: 'summary-both-good',
      source_type: 'derived_summary',
      status: 'ratified',
      source_relationship_state: 'validated',
      source_relationship_kind: 'derived_from_primary',
      derived_from: ['parent-a', 'parent-b'],
      validated_by: 'member-dr-synthetic',
      validated_at: '2026-08-05T00:05:00Z',
    });
    const result = compileSourceComposability(summary, [parentA, parentB, summary]);
    expect(result).toEqual({ composable: true });
  });
});

describe('compileFieldCorpusComposability — the corpus-level aggregate', () => {
  it('blocks with unknown_provenance when no sources are recorded at all', () => {
    const result = compileFieldCorpusComposability([]);
    expect(result.composable).toBe(false);
    expect(result.reason).toBe('unknown_provenance');
  });

  it('is composable when at least one source in the set fully compiles', () => {
    const primary = source({
      id: 'field-primary',
      status: 'ratified',
      source_relationship_state: 'validated',
      source_relationship_kind: 'primary',
      validated_by: 'member-dr-synthetic',
      validated_at: '2026-08-05T00:00:00Z',
    });
    const unrelatedBlocked = source({
      id: 'field-blocked',
      status: 'discovered',
      source_relationship_state: 'unknown',
      source_relationship_kind: null,
    });
    const result = compileFieldCorpusComposability([primary, unrelatedBlocked]);
    expect(result.composable).toBe(true);
  });

  it('stays false when every source in the set is blocked', () => {
    const a = source({ id: 'a', status: 'discovered', source_relationship_state: 'unknown' });
    const b = source({
      id: 'b',
      status: 'ratified',
      source_relationship_state: 'asserted',
      source_relationship_kind: 'primary',
    });
    const result = compileFieldCorpusComposability([a, b]);
    expect(result.composable).toBe(false);
    expect(result.reason).toBe('no_composable_source');
  });
});
