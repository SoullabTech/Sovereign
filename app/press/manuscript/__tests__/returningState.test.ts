/** @jest-environment jsdom */
import {
  headingAtOffset,
  loadDraftPosition,
  loadLastTab,
  saveDraftPosition,
  saveLastTab,
} from '../returningState';

describe("returningState.headingAtOffset — enumeration over the writer's own headings", () => {
  const text = [
    'Intro line',
    '# Chapter 1',
    'the opening',
    '## A section',
    'more words here',
    '# Chapter 7',
    'where the caret is',
  ].join('\n');

  it('returns the nearest heading at or above the offset', () => {
    const caret = text.indexOf('where the caret is') + 3;
    expect(headingAtOffset(text, caret)).toBe('Chapter 7');
  });

  it('finds a lower-level heading when it is the nearest above', () => {
    const caret = text.indexOf('more words here') + 3;
    expect(headingAtOffset(text, caret)).toBe('A section');
  });

  it('does not look past the offset — a later heading is never chosen', () => {
    const caret = text.indexOf('the opening') + 3; // between Chapter 1 and A section
    expect(headingAtOffset(text, caret)).toBe('Chapter 1');
  });

  it('returns null when no heading precedes the offset', () => {
    const caret = text.indexOf('Intro line') + 2;
    expect(headingAtOffset(text, caret)).toBeNull();
  });

  it('returns null for a draft with no headings at all', () => {
    expect(headingAtOffset('just prose, no headings', 5)).toBeNull();
  });

  it('handles out-of-range offsets without throwing', () => {
    expect(() => headingAtOffset(text, 10_000)).not.toThrow();
    expect(headingAtOffset(text, -5)).toBeNull();
  });
});

describe('returningState — position & tab memory (single work, client-side, observable only)', () => {
  beforeEach(() => window.localStorage.clear());

  it('round-trips a draft position keyed by manuscript', () => {
    saveDraftPosition('m1', { selectionStart: 42, selectionEnd: 50, scrollTop: 300 });
    const p = loadDraftPosition('m1');
    expect(p).toMatchObject({ selectionStart: 42, selectionEnd: 50, scrollTop: 300 });
    expect(typeof p?.savedAt).toBe('number');
  });

  it('keeps positions separate per manuscript', () => {
    saveDraftPosition('m1', { selectionStart: 1, selectionEnd: 1, scrollTop: 0 });
    saveDraftPosition('m2', { selectionStart: 99, selectionEnd: 99, scrollTop: 10 });
    expect(loadDraftPosition('m1')?.selectionStart).toBe(1);
    expect(loadDraftPosition('m2')?.selectionStart).toBe(99);
  });

  it('returns null for an unknown manuscript and for corrupt data', () => {
    expect(loadDraftPosition('nope')).toBeNull();
    window.localStorage.setItem('press:returning:draft:bad', 'not json');
    expect(loadDraftPosition('bad')).toBeNull();
  });

  it('round-trips the last tab (restored only when no deep link)', () => {
    expect(loadLastTab()).toBeNull();
    saveLastTab('draft');
    expect(loadLastTab()).toBe('draft');
  });
});
