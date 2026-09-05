/**
 * WS2-04B — splitting a stored section into what may and may not be edited.
 *
 * Heading identity comes from the Source record, never from looking at the
 * text. The tests that matter are the ones where a guess would have worked and
 * been wrong: a body whose first line looks like a heading, a section with no
 * heading at all, a heading repeated inside the prose.
 */

import { splitStoredSection } from '../saveSection';

describe('splitStoredSection', () => {
  it('separates the composer heading from the body', () => {
    const r = splitStoredSection('Chapter One\n\nThe morning came.\n', 'Chapter One');
    expect(r).toEqual({ headingPrefix: 'Chapter One\n\n', body: 'The morning came.\n' });
  });

  it('a headingless section is all body', () => {
    const r = splitStoredSection('An interlude.\n', null);
    expect(r).toEqual({ headingPrefix: '', body: 'An interlude.\n' });
  });

  it('DOES NOT guess: a body whose first line looks like a heading stays body', () => {
    // the Source says this section has no heading, so its first line is prose
    // no matter how heading-shaped it looks
    const r = splitStoredSection('Chapter One\n\nnot actually a heading\n', null);
    expect(r?.headingPrefix).toBe('');
    expect(r?.body).toBe('Chapter One\n\nnot actually a heading\n');
  });

  it('splits at the FIRST occurrence only — a repeat in the prose is body', () => {
    const r = splitStoredSection('Ch\n\nbody mentioning Ch again\n', 'Ch');
    expect(r?.headingPrefix).toBe('Ch\n\n');
    expect(r?.body).toBe('body mentioning Ch again\n');
  });

  it('handles a heading with a single newline after it', () => {
    const r = splitStoredSection('H\nbody', 'H');
    expect(r).toEqual({ headingPrefix: 'H\n', body: 'body' });
  });

  it('handles a heading with nothing after it', () => {
    expect(splitStoredSection('H', 'H')).toEqual({ headingPrefix: 'H', body: '' });
  });

  it('REFUSES when the slice does not start with the recorded heading', () => {
    // e.g. still scaffolded ("# H"), or a shape this cut does not understand.
    // Refusing is the only honest answer; reinterpreting would edit blind.
    expect(splitStoredSection('# H\n\nbody', 'H')).toBeNull();
    expect(splitStoredSection('something else\n\nbody', 'H')).toBeNull();
  });

  it('a heading that is a prefix of a longer first line does not match', () => {
    expect(splitStoredSection('Chapter Onerous\n\nbody', 'Chapter One')).toBeNull();
  });

  it('round-trips: prefix + body reconstructs the stored slice exactly', () => {
    for (const [text, heading] of [
      ['Chapter One\n\nThe morning came.\n', 'Chapter One'],
      ['An interlude.\n', null],
      ['H\nbody', 'H'],
      ['H', 'H'],
      ['héllo\n\nwörld — ünïcode\n', 'héllo'],
    ] as [string, string | null][]) {
      const r = splitStoredSection(text, heading);
      expect(r).not.toBeNull();
      expect(r!.headingPrefix + r!.body).toBe(text);
    }
  });
});
