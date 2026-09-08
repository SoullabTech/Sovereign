/**
 * WS-WHOLE-MANUSCRIPT-01 · F-2 — falsifiers for the section edge.
 *
 * Pure, and deliberately written before any DOM. This is the one place the
 * Whole Manuscript build could silently violate W-2 (section identity survives
 * editing): a Backspace that merged two canonical sections would repartition a
 * member's book with no explicit act anywhere.
 */

import { BOUNDARY_NOTE, isBoundaryGesture, type BoundaryProbe } from '../sectionBoundary';

const at = (over: Partial<BoundaryProbe>): BoundaryProbe => ({
  key: 'Backspace', selectionStart: 5, selectionEnd: 5, valueLength: 20, ...over,
});

describe('F-2 · the two gestures that would cross an edge', () => {
  it('Backspace with the caret at the very start is a boundary gesture', () => {
    expect(isBoundaryGesture(at({ key: 'Backspace', selectionStart: 0, selectionEnd: 0 }))).toBe(true);
  });

  it('Delete with the caret at the very end is a boundary gesture', () => {
    expect(isBoundaryGesture(at({ key: 'Delete', selectionStart: 20, selectionEnd: 20 }))).toBe(true);
  });

  it('an empty section is at both edges at once', () => {
    /* Nothing inside to delete, so either key would have to reach outside. */
    expect(isBoundaryGesture(at({ key: 'Backspace', selectionStart: 0, selectionEnd: 0, valueLength: 0 }))).toBe(true);
    expect(isBoundaryGesture(at({ key: 'Delete', selectionStart: 0, selectionEnd: 0, valueLength: 0 }))).toBe(true);
  });
});

describe('F-2 · ordinary editing is never refused', () => {
  it('Backspace anywhere but the start is ordinary', () => {
    expect(isBoundaryGesture(at({ key: 'Backspace', selectionStart: 1, selectionEnd: 1 }))).toBe(false);
    expect(isBoundaryGesture(at({ key: 'Backspace', selectionStart: 20, selectionEnd: 20 }))).toBe(false);
  });

  it('Delete anywhere but the end is ordinary', () => {
    expect(isBoundaryGesture(at({ key: 'Delete', selectionStart: 0, selectionEnd: 0 }))).toBe(false);
    expect(isBoundaryGesture(at({ key: 'Delete', selectionStart: 19, selectionEnd: 19 }))).toBe(false);
  });

  it('a selection with a range is ordinary editing wherever it sits', () => {
    /* It deletes what it covers and stops there. Refusing here would block a
       writer from deleting the first sentence of a section. */
    expect(isBoundaryGesture(at({ key: 'Backspace', selectionStart: 0, selectionEnd: 8 }))).toBe(false);
    expect(isBoundaryGesture(at({ key: 'Delete', selectionStart: 12, selectionEnd: 20 }))).toBe(false);
    /* Including a selection covering the whole section. */
    expect(isBoundaryGesture(at({ key: 'Backspace', selectionStart: 0, selectionEnd: 20 }))).toBe(false);
  });

  it('no other key is ever a boundary gesture', () => {
    for (const key of ['a', 'Enter', 'Tab', 'ArrowLeft', 'ArrowUp', 'Home', 'PageUp', 'Escape', 'x']) {
      expect(`${key} at offset 0 refuses: ${isBoundaryGesture(at({ key, selectionStart: 0, selectionEnd: 0 }))}`)
        .toBe(`${key} at offset 0 refuses: false`);
    }
  });

  it('a control that cannot report its caret is left alone', () => {
    /* Refusing on a guess would block ordinary editing in a control we cannot
       read. Silence is the safer failure here — the worst case is one merge
       gesture reaching a section edge, which the editors' separateness
       already prevents structurally. */
    expect(isBoundaryGesture(at({ selectionStart: null, selectionEnd: null }))).toBe(false);
    expect(isBoundaryGesture(at({ selectionStart: 0, selectionEnd: null }))).toBe(false);
  });
});

describe('F-2 · modifiers do not open a second door', () => {
  it('the same keys at the same edge are the same gesture, however they were pressed', () => {
    /* Alt+Backspace deletes a word, Meta+Backspace deletes to line start. At
       offset 0 both ask for the same forbidden thing. The predicate takes no
       modifier input at all, so there is no branch for one to slip through. */
    expect(Object.keys(at({}))).toEqual(['key', 'selectionStart', 'selectionEnd', 'valueLength']);
    expect(isBoundaryGesture(at({ key: 'Backspace', selectionStart: 0, selectionEnd: 0 }))).toBe(true);
  });
});

describe('F-2 · what the writer is told', () => {
  it('is one plain line, in their language', () => {
    expect(BOUNDARY_NOTE).toBe('Sections stay separate here.');
    for (const jargon of ['topology', 'canonical', 'section id', 'merge', 'error', 'invalid']) {
      expect(`note says "${jargon}": ${BOUNDARY_NOTE.toLowerCase().includes(jargon)}`)
        .toBe(`note says "${jargon}": false`);
    }
  });
});
