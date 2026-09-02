/**
 * WS2-07 prerequisite — the ruled save contract, proven without a database.
 *
 * Every refusal in this contract is decided by a pure function, so a defect in
 * it is a unit-test failure rather than a 500 a member discovers. The database
 * round-trip triggers remain the backstop; nothing here relies on reaching them.
 */

import {
  composeDraftSlices, planConversion, validateSectionSave, flattenSections,
  type SourceSection,
} from '../draftSections';

const src = (heading: string | null, body: string): SourceSection => ({ heading, body });

/* The composition the draft route has always used, kept here verbatim as the
   oracle. If composeDraftSlices ever drifts from it, these tests fail rather
   than the conversion silently partitioning a different string. */
function legacyComposeDraftText(sections: readonly SourceSection[]): string {
  const parts: string[] = [];
  for (const s of sections) {
    const heading = s.heading?.trim();
    if (heading) { parts.push(heading); parts.push(''); }
    parts.push(s.body);
    parts.push('');
  }
  return parts.join('\n');
}

describe('composeDraftSlices', () => {
  const cases: { name: string; sections: SourceSection[] }[] = [
    { name: 'one section with a heading', sections: [src('Chapter One', 'It began.')] },
    { name: 'one section, no heading', sections: [src(null, 'It began.')] },
    { name: 'two sections', sections: [src('One', 'a'), src('Two', 'b')] },
    { name: 'mixed headings', sections: [src('One', 'a'), src(null, 'b'), src('Three', 'c')] },
    { name: 'empty body', sections: [src('One', ''), src('Two', 'b')] },
    { name: 'whitespace-only heading is dropped', sections: [src('   ', 'a'), src('Two', 'b')] },
    { name: 'multi-line bodies', sections: [src('One', 'a\n\nb'), src('Two', 'c\nd')] },
    { name: 'fourteen sections', sections: Array.from({ length: 14 }, (_, i) => src(`H${i}`, `body ${i}`)) },
  ];

  it.each(cases)('slices concatenate to the content: $name', ({ sections }) => {
    const { content, slices } = composeDraftSlices(sections);
    expect(slices.join('')).toBe(content);
  });

  it.each(cases)('composes exactly what the draft route always composed: $name', ({ sections }) => {
    expect(composeDraftSlices(sections).content).toBe(legacyComposeDraftText(sections));
  });

  it.each(cases)('produces one slice per source section: $name', ({ sections }) => {
    expect(composeDraftSlices(sections).slices).toHaveLength(sections.length);
  });

  it('the last slice ends with a single newline, the others with a blank line', () => {
    /* The non-uniform boundary this module exists to get right. Hand-deriving it
       is what would put every section id one character out of place. */
    const { slices } = composeDraftSlices([src('One', 'a'), src('Two', 'b')]);
    expect(slices[0]).toBe('One\n\na\n\n');
    expect(slices[1]).toBe('Two\n\nb\n');
  });

  it('handles a single section, where first and last are the same slice', () => {
    const { content, slices } = composeDraftSlices([src('One', 'a')]);
    expect(slices).toEqual([content]);
  });
});

describe('planConversion — lossless means mechanically exact', () => {
  const sections = [src('One', 'a'), src('Two', 'b')];

  it('converts when the draft is byte-identical to its source partition', () => {
    const { content } = composeDraftSlices(sections);
    const plan = planConversion(content, sections);
    expect(plan.status).toBe('lossless');
    if (plan.status === 'lossless') expect(plan.slices.join('')).toBe(content);
  });

  it('REFUSES an edited draft rather than re-partitioning it', () => {
    const { content } = composeDraftSlices(sections);
    const plan = planConversion(content + ' and then more', sections);
    expect(plan.status).toBe('refused');
    if (plan.status === 'refused') expect(plan.refusal).toBe('boundary_confirmation_required');
  });

  it('REFUSES a one-character difference — no tolerance, no similarity', () => {
    const { content } = composeDraftSlices(sections);
    const plan = planConversion(content.replace('a', 'A'), sections);
    expect(plan.status).toBe('refused');
  });

  it('REFUSES a difference that is invisible on screen', () => {
    /* A trailing space. Any similarity-based rule would call this the same
       document; byte comparison does not, which is the point. */
    const { content } = composeDraftSlices(sections);
    const plan = planConversion(content + ' ', sections);
    expect(plan.status).toBe('refused');
  });

  it('REFUSES a canonically-equivalent but differently-encoded draft', () => {
    /* "é" as one code point vs "e" + combining accent. Normalizing before
       comparison would let a partition off by an invisible character call
       itself exact. */
    const composed = [src('One', 'café')];
    const decomposed = composeDraftSlices(composed).content.normalize('NFD');
    const plan = planConversion(decomposed, composed);
    expect(plan.status).toBe('refused');
  });

  it('REFUSES a manuscript with no source sections', () => {
    const plan = planConversion('anything', []);
    expect(plan.status).toBe('refused');
  });
});

describe('validateSectionSave', () => {
  const ids = ['s1', 's2', 's3'];
  const ok = (over: { id: string; text: string }[]) => ({ sections: over });

  it('accepts a complete, ordered payload', () => {
    const r = validateSectionSave(
      ok([{ id: 's1', text: 'a' }, { id: 's2', text: 'b' }, { id: 's3', text: 'c' }]), ids);
    expect(r.ok).toBe(true);
  });

  it('refuses a content-only save against a converted draft', () => {
    const r = validateSectionSave({ content: 'the whole thing' }, ids);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.refusal).toBe('section_state_required');
  });

  it('refuses a payload carrying BOTH content and sections', () => {
    const r = validateSectionSave(
      { content: 'x', sections: [{ id: 's1', text: 'a' }] }, ids);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.refusal).toBe('ambiguous_write_authority');
  });

  it('OMISSION IS NOT A DELETION — a short list is refused, and says so', () => {
    const r = validateSectionSave(ok([{ id: 's1', text: 'a' }, { id: 's2', text: 'b' }]), ids);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.refusal).toBe('topology_change_requires_explicit_command');
      expect(r.detail).toContain('Omission is not a deletion');
      expect(r.detail).toContain('s3');
    }
  });

  it('refuses a reordered payload', () => {
    const r = validateSectionSave(
      ok([{ id: 's2', text: 'b' }, { id: 's1', text: 'a' }, { id: 's3', text: 'c' }]), ids);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.refusal).toBe('topology_change_requires_explicit_command');
  });

  it('refuses a duplicated id', () => {
    const r = validateSectionSave(
      ok([{ id: 's1', text: 'a' }, { id: 's1', text: 'b' }, { id: 's3', text: 'c' }]), ids);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.refusal).toBe('topology_change_requires_explicit_command');
  });

  it('refuses an id that does not belong to this draft', () => {
    const r = validateSectionSave(
      ok([{ id: 's1', text: 'a' }, { id: 'someone-elses', text: 'b' }, { id: 's3', text: 'c' }]), ids);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.refusal).toBe('unknown_section_id');
  });

  it('refuses an added id — a new section is a topology change', () => {
    const r = validateSectionSave(
      ok([{ id: 's1', text: 'a' }, { id: 's2', text: 'b' }, { id: 's3', text: 'c' },
          { id: 's4', text: 'd' }]), ids);
    expect(r.ok).toBe(false);
    /* Caught as unknown before it can be counted as a topology change; either
       refusal is honest, and neither writes. */
    if (!r.ok) expect(['unknown_section_id', 'topology_change_requires_explicit_command'])
      .toContain(r.refusal);
  });

  it('asserts text rather than coercing it — a missing text is refused, not emptied', () => {
    const r = validateSectionSave(
      { sections: [{ id: 's1' }, { id: 's2', text: 'b' }, { id: 's3', text: 'c' }] }, ids);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.refusal).toBe('section_state_required');
  });

  it('accepts an empty section text — an empty section is a real position', () => {
    const r = validateSectionSave(
      ok([{ id: 's1', text: '' }, { id: 's2', text: 'b' }, { id: 's3', text: 'c' }]), ids);
    expect(r.ok).toBe(true);
  });

  it('every refusal writes nothing — the function is pure and returns a value', () => {
    const before = [...ids];
    validateSectionSave({ content: 'x' }, ids);
    validateSectionSave(ok([{ id: 'nope', text: 'a' }]), ids);
    expect(ids).toEqual(before);
  });
});

describe('flattenSections', () => {
  it('is the exact concatenation, with no separator invented', () => {
    expect(flattenSections([{ id: 'a', text: 'One\n\na\n\n' }, { id: 'b', text: 'Two\n\nb\n' }]))
      .toBe('One\n\na\n\nTwo\n\nb\n');
  });

  it('round-trips a converted draft: compose → slice → flatten', () => {
    const sections = [src('One', 'a'), src(null, 'b'), src('Three', 'c')];
    const { content, slices } = composeDraftSlices(sections);
    const state = slices.map((text, i) => ({ id: `s${i}`, text }));
    expect(flattenSections(state)).toBe(content);
  });

  it('an ordinary edit changes content but preserves the flattening invariant', () => {
    const sections = [src('One', 'a'), src('Two', 'b')];
    const { slices } = composeDraftSlices(sections);
    const state = slices.map((text, i) => ({ id: `s${i}`, text }));
    const edited = state.map((s, i) => i === 0 ? { ...s, text: s.text.replace('a', 'a much longer passage') } : s);
    expect(flattenSections(edited)).toBe(edited.map((s) => s.text).join(''));
    expect(edited.map((s) => s.id)).toEqual(state.map((s) => s.id));
  });
});
