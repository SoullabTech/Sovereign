import {
  resolveInitialSection, readSectionParam, locationForSection, SECTION_PARAM,
} from '../placeInWork';

const ids = ['a1', 'b2', 'c3'];

describe('resolveInitialSection', () => {
  it('opens the requested section when this draft holds it', () => {
    expect(resolveInitialSection('b2', ids)).toEqual({ sectionId: 'b2', rewriteLocation: false });
  });
  it('falls back to the first section when none was requested', () => {
    expect(resolveInitialSection(null, ids)).toEqual({ sectionId: 'a1', rewriteLocation: false });
  });
  it('does not manufacture a relation for a stale id, and asks to be rewritten', () => {
    expect(resolveInitialSection('gone', ids)).toEqual({ sectionId: 'a1', rewriteLocation: true });
  });
  it('never guesses at a nearby section', () => {
    /* 'b' is a prefix of 'b2'. Nothing here does prefix, fuzzy or positional
       matching, and this is the test that says so. */
    expect(resolveInitialSection('b', ids).sectionId).toBe('a1');
  });
  it('handles a draft with no sections', () => {
    expect(resolveInitialSection('b2', [])).toEqual({ sectionId: null, rewriteLocation: true });
  });
});

describe('readSectionParam', () => {
  it('reads the id', () => expect(readSectionParam('?m=x&s=abc')).toBe('abc'));
  it('is null when absent', () => expect(readSectionParam('?m=x')).toBeNull());
  it('is null when blank', () => expect(readSectionParam('?s=%20')).toBeNull());
  it('survives a malformed query', () => expect(readSectionParam('%%%')).toBeNull());
});

describe('locationForSection', () => {
  it('keeps every other parameter, including the dev-only one', () => {
    const out = locationForSection('/writers-studio/canvas', '?m=work&witnessDelayMs=750', 'b2');
    const p = new URLSearchParams(out.split('?')[1]);
    expect(p.get('m')).toBe('work');
    expect(p.get('witnessDelayMs')).toBe('750');
    expect(p.get(SECTION_PARAM)).toBe('b2');
  });
  it('removes the place when there is none', () => {
    expect(locationForSection('/c', '?m=w&s=old', null)).toBe('/c?m=w');
  });
  it('returns a relative location, never an absolute URL', () => {
    const out = locationForSection('/c', '?m=w', 'a1');
    expect(out.startsWith('/')).toBe(true);
    expect(out).not.toMatch(/^https?:/);
  });
  it('is stable when nothing changed', () => {
    expect(locationForSection('/c', '?m=w&s=a1', 'a1')).toBe('/c?m=w&s=a1');
  });
});
