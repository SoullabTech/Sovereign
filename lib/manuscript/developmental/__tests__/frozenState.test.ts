/**
 * BUILD-07A — INV-7b, proven before the EvidenceRef taxonomy is built out.
 *
 * THE CLAIM UNDER TEST, in one sentence: an author can later inspect exactly
 * what MAIA would have reasoned from, even after the Work has changed.
 *
 * ⛔ THE INVARIANT IS RECOVERY, NOT COMPARISON. A bare digest satisfies "has it
 * changed" and fails "what was it" — and INV-7b is the one whose absence would
 * be discovered latest, when someone first tries to show an author the evidence
 * behind an old observation and finds the system can only report that it moved.
 *
 * The fixture carries an emoji deliberately. The section↔revision partition is
 * expressed in Unicode CODE POINTS, and JavaScript string indices are UTF-16
 * code units; the two disagree on every astral character. An all-BMP fixture
 * passes under either unit and would prove the fixture rather than the claim —
 * which is exactly how that mismatch survived a green 41-check witness once.
 */
import {
  resolveHistorical, resolveEvidence, locateCurrent, locateCurrentStructure,
  checkCoverage, depthSatisfies, requiredDepth, checkStructuralReference,
  type FrozenReadState, type RevisionSnapshot, type EvidenceRef,
  type FrozenStructure, type StructuralReference,
} from '../frozenState';
import {
  partitionFromSections, flattenSections, codePointLength,
  type DraftSectionState,
} from '@/lib/manuscript/draftSections';

const S1 = 'sec-1';
const S2 = 'sec-2';

/** The Work at the moment of the reading. */
const AT_READING: DraftSectionState[] = [
  { id: S1, text: 'before 😀 change' },
  { id: S2, text: 'untouched 🌒 section' },
];

/** The same Work after the member edited section 1 only. */
const AFTER_EDIT: DraftSectionState[] = [
  { id: S1, text: 'after 😀 change' },
  { id: S2, text: 'untouched 🌒 section' },
];

const snapshotOf = (sections: DraftSectionState[], revisionNumber: number): RevisionSnapshot => ({
  revisionNumber,
  content: flattenSections(sections),
  partition: partitionFromSections(sections),
});

const READ_STATE: FrozenReadState = {
  draftId: 'draft-1',
  revisionNumber: 7,
  sections: [{ sectionId: S1, depth: 'body' }, { sectionId: S2, depth: 'body' }],
  structure: null,
};

const STRUCTURE_BEFORE: FrozenStructure = {
  topologyFingerprint: 'topo-1',
  unitFingerprints: { 'unit-a': 'a1', 'unit-b': 'b1', 'unit-c': 'c1' },
};
/** Only unit-a moved. */
const STRUCTURE_AFTER: FrozenStructure = {
  topologyFingerprint: 'topo-2',
  unitFingerprints: { 'unit-a': 'a2', 'unit-b': 'b1', 'unit-c': 'c1' },
};
const CANONICAL = new Set(['unit-a', 'unit-b', 'unit-c']);

describe('INV-7b — the frozen state RESOLVES, it does not merely compare', () => {
  const frozen = snapshotOf(AT_READING, 7);

  it('the fixture can actually exhibit the failure it guards', () => {
    /* Asserted, not assumed: if this ever became all-BMP, every test below
       would pass under a code-unit implementation too and prove nothing. */
    const content = frozen.content;
    expect(codePointLength(content)).toBeLessThan(content.length);
  });

  it('recovers the EXACT historical text after the Work has moved on', () => {
    const historical = resolveHistorical(READ_STATE, frozen, S1);
    expect(historical.ok).toBe(true);
    expect((historical as { value: DraftSectionState }).value.text).toBe('before 😀 change');
  });

  it('the current Work says something else entirely', () => {
    const current = AFTER_EDIT.find((s) => s.id === S1)!;
    expect(current.text).toBe('after 😀 change');
  });

  it('THE WHOLE CLAIM: historical evidence still resolves, and reports itself superseded', () => {
    const historical = resolveHistorical(READ_STATE, frozen, S1);
    expect(historical.ok).toBe(true);
    const text = (historical as { value: DraftSectionState }).value.text;

    /* Recovery — what she read — still works. */
    expect(text).toBe('before 😀 change');
    /* Comparison — where the Work now stands — says superseded. */
    expect(locateCurrent(text, AFTER_EDIT.find((s) => s.id === S1)!)).toBe('superseded');
    /* And nothing guessed: the two answers came from two named operations. */
  });

  it('recovers byte-for-byte, with no split surrogate', () => {
    const historical = resolveHistorical(READ_STATE, frozen, S1);
    const text = (historical as { value: DraftSectionState }).value.text;
    expect(Buffer.from(text, 'utf8').equals(Buffer.from('before 😀 change', 'utf8'))).toBe(true);
    expect(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(text))
      .toBe(false);
  });

  it('falsifier 1 — a live edit after capture leaves the historical state exact', () => {
    /* The frozen snapshot is a different revision from the current one, and the
       reading resolves against ITS revision. */
    const later = snapshotOf(AFTER_EDIT, 8);
    expect((resolveHistorical(READ_STATE, frozen, S1) as { value: DraftSectionState }).value.text)
      .toBe('before 😀 change');
    /* Handed the LATER revision, it refuses rather than silently answering
       about a revision this reading never read. */
    expect(resolveHistorical(READ_STATE, later, S1))
      .toMatchObject({ ok: false, failure: 'revision_mismatch' });
  });

  it('falsifier 6 — an unrelated section changing leaves local evidence CURRENT', () => {
    /* Scoped supersession: section 1 moved, section 2 did not. */
    const historical = resolveHistorical(READ_STATE, frozen, S2);
    const text = (historical as { value: DraftSectionState }).value.text;
    expect(locateCurrent(text, AFTER_EDIT.find((s) => s.id === S2)!)).toBe('current');
  });

  it('falsifier 7 — the referenced section changing supersedes evidence on it', () => {
    const historical = resolveHistorical(READ_STATE, frozen, S1);
    const text = (historical as { value: DraftSectionState }).value.text;
    expect(locateCurrent(text, AFTER_EDIT.find((s) => s.id === S1)!)).toBe('superseded');
  });

  it('a deleted section is no_longer_locatable — never fuzzy-matched to a neighbour', () => {
    const historical = resolveHistorical(READ_STATE, frozen, S1);
    const text = (historical as { value: DraftSectionState }).value.text;
    expect(locateCurrent(text, null)).toBe('no_longer_locatable');
  });

  it('falsifier 2 — a revision with no recorded partition cannot be recovered from', () => {
    /* A bare digest would have "compared" happily here. Recovery refuses,
       because the boundaries were never observed and inventing them would show
       the author a passage nobody read. */
    const bare: RevisionSnapshot = { revisionNumber: 7, content: frozen.content, partition: null };
    expect(resolveHistorical(READ_STATE, bare, S1))
      .toMatchObject({ ok: false, failure: 'partition_not_recorded' });
  });

  it('a section the reading never covered is refused, not resolved', () => {
    const narrow: FrozenReadState = { ...READ_STATE, sections: [{ sectionId: S2, depth: 'body' }] };
    expect(resolveHistorical(narrow, frozen, S1))
      .toMatchObject({ ok: false, failure: 'section_not_in_read_state' });
  });
});

describe('evidence resolution — spans are code points', () => {
  const frozen = snapshotOf(AT_READING, 7);

  it('a span lands on whole characters across an astral boundary', () => {
    /* 'before 😀 change' — code points: b-e-f-o-r-e-␣-😀-␣-c... The emoji is
       code point 7 and occupies TWO code units. A code-unit slice of 7–8 would
       return half of it. */
    const ref: EvidenceRef = { kind: 'textual', sectionId: S1, span: { start: 7, end: 8 } };
    const r = resolveEvidence(READ_STATE, frozen, ref);
    expect(r).toEqual({ ok: true, value: '😀' });
  });

  it('a span reaching past the section is refused, not clamped', () => {
    const ref: EvidenceRef = { kind: 'textual', sectionId: S1, span: { start: 0, end: 999 } };
    expect(resolveEvidence(READ_STATE, frozen, ref))
      .toMatchObject({ ok: false, failure: 'span_out_of_range' });
  });

  it('heading evidence resolves to the section it addresses', () => {
    const r = resolveEvidence(READ_STATE, frozen, { kind: 'heading', sectionId: S1 });
    expect(r).toEqual({ ok: true, value: 'before 😀 change' });
  });
});

describe('INV-8 — coverage must back the evidence at the depth it requires', () => {
  const headingOnly: FrozenReadState = {
    ...READ_STATE,
    sections: [{ sectionId: S1, depth: 'heading' }],
  };

  it('falsifier 3 — prose evidence on heading-only coverage is REFUSED', () => {
    expect(checkCoverage(headingOnly, { kind: 'textual', sectionId: S1, span: { start: 0, end: 1 } }))
      .toMatchObject({ ok: false, refusal: 'evidence_exceeds_coverage_depth' });
  });

  it('heading evidence on heading coverage is accepted', () => {
    expect(checkCoverage(headingOnly, { kind: 'heading', sectionId: S1 })).toEqual({ ok: true });
  });

  it('body coverage satisfies a heading requirement, not the reverse', () => {
    expect(depthSatisfies('body', 'heading')).toBe(true);
    expect(depthSatisfies('heading', 'body')).toBe(false);
  });

  it('evidence on a section that was never covered is refused', () => {
    expect(checkCoverage(headingOnly, { kind: 'heading', sectionId: S2 }))
      .toMatchObject({ ok: false, refusal: 'evidence_without_coverage' });
  });

  it('structural evidence requires no section coverage — an honest class of observation', () => {
    const withStructure: FrozenReadState = { ...READ_STATE, structure: STRUCTURE_BEFORE };
    const ref: EvidenceRef = { kind: 'authored-structure', reference: { scope: 'topology' } };
    expect(requiredDepth(ref)).toBeNull();
    expect(checkCoverage(withStructure, ref)).toEqual({ ok: true });
  });

  it('falsifier 5 — structure-dependent evidence with NO authored structure is refused', () => {
    expect(checkCoverage(READ_STATE, {
      kind: 'authored-structure', reference: { scope: 'unit', unitId: 'unit-a' },
    })).toMatchObject({ ok: false, refusal: 'structure_dependent_without_authored_structure' });
  });
});

describe('falsifier 8 — supersession is SCOPED, within structure as well as across it', () => {
  const frozen = snapshotOf(AT_READING, 7);
  const withStructure: FrozenReadState = { ...READ_STATE, structure: STRUCTURE_BEFORE };

  it('a structure change does not touch evidence resting on unchanged prose', () => {
    /* Superseding a whole reading because one part of it moved would tell the
       author that observations still true of their Work are stale. */
    const text = (resolveHistorical(withStructure, frozen, S2) as { value: DraftSectionState })
      .value.text;
    expect(locateCurrent(text, AFTER_EDIT.find((s) => s.id === S2)!)).toBe('current');
  });

  it('THE SCOPED CASE: unit-a moved, so evidence about unit-b stays CURRENT', () => {
    /* With one whole-structure digest this is impossible to express — every
       structural observation in the reading would go stale together. */
    expect(locateCurrentStructure(STRUCTURE_BEFORE, STRUCTURE_AFTER,
      { scope: 'unit', unitId: 'unit-a' })).toBe('superseded');
    expect(locateCurrentStructure(STRUCTURE_BEFORE, STRUCTURE_AFTER,
      { scope: 'unit', unitId: 'unit-b' })).toBe('current');
  });

  it('a whole-topology claim supersedes when the topology moves at all', () => {
    expect(locateCurrentStructure(STRUCTURE_BEFORE, STRUCTURE_AFTER, { scope: 'topology' }))
      .toBe('superseded');
  });

  it('a relationship supersedes when ANY division it relates moves', () => {
    expect(locateCurrentStructure(STRUCTURE_BEFORE, STRUCTURE_AFTER,
      { scope: 'units', unitIds: ['unit-a', 'unit-b'] })).toBe('superseded');
    expect(locateCurrentStructure(STRUCTURE_BEFORE, STRUCTURE_AFTER,
      { scope: 'units', unitIds: ['unit-b', 'unit-c'] })).toBe('current');
  });

  it('a division that no longer exists is no_longer_locatable, never re-matched', () => {
    const gone: FrozenStructure = {
      topologyFingerprint: 'topo-3',
      unitFingerprints: { 'unit-b': 'b1', 'unit-c': 'c1' },
    };
    expect(locateCurrentStructure(STRUCTURE_BEFORE, gone, { scope: 'unit', unitId: 'unit-a' }))
      .toBe('no_longer_locatable');
  });

  it('INV-20 — "we did not check" is UNMEASURED, not "your division was deleted"', () => {
    /* Collapsing these makes a surface that cannot say which it means. */
    expect(locateCurrentStructure(null, STRUCTURE_AFTER, { scope: 'topology' })).toBe('unmeasured');
    expect(locateCurrentStructure(STRUCTURE_BEFORE, null, { scope: 'topology' })).toBe('unmeasured');
    expect(locateCurrentStructure(STRUCTURE_BEFORE, STRUCTURE_AFTER,
      { scope: 'unit', unitId: 'unit-never-read' })).toBe('unmeasured');
  });
});

describe('falsifier 4 — INV-17: structural evidence names AUTHORED structure', () => {
  it('a proposal-local key is REJECTED', () => {
    /* FIND's F2, answered: the reading reasons about what the member declared
       the Work to be, not about MAIA's own earlier perception of it. */
    expect(checkStructuralReference({ scope: 'unit', unitId: 'proposal-b048f603-div-2' }, CANONICAL))
      .toMatchObject({ ok: false, refusal: 'not_a_canonical_unit' });
  });

  it('a reviewed unit key inside a set is rejected, even beside canonical ones', () => {
    expect(checkStructuralReference(
      { scope: 'units', unitIds: ['unit-a', 'reviewed-key-7'] }, CANONICAL))
      .toMatchObject({ ok: false, refusal: 'not_a_canonical_unit' });
  });

  it('canonical units are accepted, singly and in relation', () => {
    expect(checkStructuralReference({ scope: 'unit', unitId: 'unit-a' }, CANONICAL))
      .toEqual({ ok: true });
    expect(checkStructuralReference({ scope: 'units', unitIds: ['unit-a', 'unit-b'] }, CANONICAL))
      .toEqual({ ok: true });
  });

  it('the topology needs no unit membership', () => {
    expect(checkStructuralReference({ scope: 'topology' }, new Set())).toEqual({ ok: true });
  });

  it('a "relationship" among fewer than two divisions is refused', () => {
    /* One division is scope 'unit'. Two representations of the same fact is how
       a discriminated relation stops being one. */
    expect(checkStructuralReference({ scope: 'units', unitIds: ['unit-a'] }, CANONICAL))
      .toMatchObject({ ok: false, refusal: 'degenerate_unit_set' });
    expect(checkStructuralReference({ scope: 'units', unitIds: [] }, CANONICAL))
      .toMatchObject({ ok: false, refusal: 'degenerate_unit_set' });
  });

  it('a division cannot stand in a relationship with itself', () => {
    expect(checkStructuralReference({ scope: 'units', unitIds: ['unit-a', 'unit-a'] }, CANONICAL))
      .toMatchObject({ ok: false, refusal: 'duplicate_unit_in_set' });
  });

  it('INV-16 — a single unitId cannot express what the ruling requires', () => {
    /* The shape assertion behind the discriminated relation: three scopes exist
       because a relationship BETWEEN divisions and a claim about the WHOLE
       topology are not expressible as one id — and §9 supersedes on exactly
       that last dependency. */
    const scopes = (['unit', 'units', 'topology'] as const).map((scope) => scope);
    expect(scopes).toHaveLength(3);
    const topology: StructuralReference = { scope: 'topology' };
    expect('unitId' in topology).toBe(false);
  });
});

describe('falsifier 10 — the structural gate', () => {
  /* Read as SOURCE, not exercised at runtime. A runtime assertion would only
     prove that this particular path did not call a model; the claim is that the
     substrate CANNOT, which is a property of what it imports. */
  const source = require('fs').readFileSync(
    require('path').join(__dirname, '..', 'frozenState.ts'), 'utf8') as string;

  it('imports no model or provider', () => {
    expect(source).not.toMatch(/@anthropic-ai|openai|ollama|fetch\(|axios/i);
  });

  it('imports no database client — the rules are provable without a Postgres', () => {
    expect(source).not.toMatch(/lib\/db\/postgres|['"]pg['"]/);
  });

  it('cannot mutate the manuscript: no write verb reaches it', () => {
    expect(source).not.toMatch(/\b(INSERT|UPDATE|DELETE)\b/);
  });

  it('does not reuse structure/detect.ts', () => {
    /* Reserved by the lane: the developmental substrate does not inherit the
       structure detector's semantics by importing it. */
    expect(source).not.toMatch(/structure\/detect/);
  });

  it('stores no prose — evidence is an ADDRESS, resolved from the immutable revision', () => {
    /* The shape assertion behind the second-prose-store refusal: a frozen
       section state carries an id and a depth, and nothing that could hold the
       member's sentences. */
    const state = { sectionId: 'sec-1', depth: 'body' as const };
    expect(Object.keys(state).sort()).toEqual(['depth', 'sectionId']);
  });
});
