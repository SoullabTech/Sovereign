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
