/**
 * WS2-05B step 3 - the no-second-copy guard, and the legitimate field that
 * proved a name-only version of it was broken.
 */

import { assertNoProse } from '../proposalStore';

describe('assertNoProse', () => {
  it('refuses a manuscript-content field holding text', () => {
    expect(assertNoProse({ observations: [{ body: 'the member wrote this' }] }))
      .toBe('$.observations[0].body');
    expect(assertNoProse({ excerpt: 'a passage' })).toBe('$.excerpt');
    expect(assertNoProse({ prompt: 'here is the whole chapter' })).toBe('$.prompt');
  });

  it('refuses an array of text under such a field', () => {
    expect(assertNoProse({ bodies: ['chapter one', 'chapter two'] })).toBe('$.bodies');
  });

  it('permits coverage.bodies, which records WHICH bodies were read', () => {
    /* The case that broke the first version: a name-only guard rejected every
       legitimate proposal, because this field is ids and a mode, not prose. */
    expect(assertNoProse({
      coverage: { headings: 'all', bodies: { mode: 'selected', sectionIds: ['a', 'b'] }, passes: 2 },
    })).toBeNull();
  });

  it('still looks inside such an object', () => {
    expect(assertNoProse({ bodies: { mode: 'all', text: 'smuggled' } })).toBe('$.bodies.text');
  });

  it('permits a reading that only describes the Work', () => {
    expect(assertNoProse({
      account: 'Two movements.',
      units: [{ title: 'Fire', rationale: 'the vocabulary concentrates here', evidenceRefs: ['x'] }],
    })).toBeNull();
  });
});

/**
 * WS2-05B-8B-02b. The editorial letter rides inside `interpretation`, which is
 * jsonb and frozen by the same trigger as everything else in the reading - so
 * it needs no column and no migration. What it does need is to survive the
 * no-second-copy guard: `thesis`, `explanation` and `strongestFindings` are
 * MAIA's words about the Work, and a guard that read them as the Work would
 * refuse every reading made under the new contract.
 */
describe('the editorial letter passes the no-second-copy guard', () => {
  const synthesis = {
    thesis: 'The scheme in the contents list is not the one the writing follows.',
    strongestFindings: ['The body runs as five elemental movements.'],
    questionsForAuthor: [{
      label: 'Where does the first element begin?',
      explanation: 'The last section of the opening could as reasonably open it.',
      sectionIds: ['sec-a', 'sec-b'],
    }],
  };

  it('permits a synthesis, which is commentary rather than the Work', () => {
    expect(assertNoProse({ editorialSynthesis: synthesis })).toBeNull();
  });

  it('permits an editorial label on a unit', () => {
    expect(assertNoProse({ units: [{ title: null, editorialLabel: 'Fire' }] })).toBeNull();
  });

  /* And the guard still catches the thing it is for, even when it arrives
     dressed as part of the letter. */
  it('still refuses prose smuggled inside the letter', () => {
    expect(assertNoProse({ editorialSynthesis: { ...synthesis, excerpt: 'a whole chapter' } }))
      .toBe('$.editorialSynthesis.excerpt');
  });
});
