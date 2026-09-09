/**
 * WS-WHOLE-MANUSCRIPT-01 · F-1 — falsifiers for what stays mounted.
 *
 * The rule these exist for, in one sentence: the section holding the caret is
 * never evicted for being off-screen. A fast scroll or a layout shift must not
 * be able to remove the editor a writer is typing into.
 */

import {
  evictedIndices, mountedIndices, windowRange, type WindowInput,
} from '../sectionWindow';

const at = (over: Partial<WindowInput> = {}): WindowInput => ({
  total: 262, firstVisible: 100, lastVisible: 104, overscan: 2, focusedIndex: null, ...over,
});

describe('the geometric window', () => {
  it('covers the viewport plus overscan on both sides', () => {
    expect(windowRange(at())).toEqual({ from: 98, to: 106 });
  });

  it('never runs past either end of the manuscript', () => {
    expect(windowRange(at({ firstVisible: 0, lastVisible: 1 }))).toEqual({ from: 0, to: 3 });
    expect(windowRange(at({ firstVisible: 260, lastVisible: 261 }))).toEqual({ from: 258, to: 261 });
  });

  it('is empty for a manuscript with no sections', () => {
    expect(windowRange(at({ total: 0 }))).toEqual({ from: 0, to: -1 });
    expect(mountedIndices(at({ total: 0 })).size).toBe(0);
  });

  it('mounts a window, not the book', () => {
    /* The whole point: 262 sections, nine editors. */
    expect(mountedIndices(at()).size).toBe(9);
  });
});

describe('⭐ the focused section is pinned', () => {
  it('stays mounted when the writer scrolls far away from it', () => {
    /* Typing in section 3, scrolled to section 100. Geometry says evict; focus
       says the caret is in there. Focus wins. */
    const mounted = mountedIndices(at({ focusedIndex: 3 }));
    expect(mounted.has(3)).toBe(true);
    expect(mounted.has(100)).toBe(true);
    /* Non-contiguous on purpose: exactly one distant editor is kept alive. */
    expect(mounted.size).toBe(10);
  });

  it('is never returned as an eviction, however the window moves', () => {
    const before = [...mountedIndices(at({ focusedIndex: 3, firstVisible: 3, lastVisible: 7 }))];
    /* A jump the length of the book, in one frame. */
    const leaving = evictedIndices(before, at({ focusedIndex: 3, firstVisible: 200, lastVisible: 204 }));
    expect(leaving).not.toContain(3);
    expect(leaving.length).toBeGreaterThan(0);
  });

  it('releases the pin once focus moves on', () => {
    /* Blur is what lets it go — and by then its body has been captured. */
    const before = [...mountedIndices(at({ focusedIndex: 3, firstVisible: 3, lastVisible: 7 }))];
    expect(evictedIndices(before, at({ focusedIndex: null, firstVisible: 200, lastVisible: 204 })))
      .toContain(3);
  });

  it('ignores a focused index that is not a section', () => {
    expect(mountedIndices(at({ focusedIndex: -1 })).has(-1)).toBe(false);
    expect(mountedIndices(at({ focusedIndex: 9_999 })).has(9_999)).toBe(false);
  });
});

describe('evictions are the capture list', () => {
  it('names every mounted index the next window drops, in order', () => {
    const before = [98, 99, 100, 101, 102, 103, 104, 105, 106];
    const leaving = evictedIndices(before, at({ firstVisible: 103, lastVisible: 107 }));
    expect(leaving).toEqual([98, 99, 100]);
  });

  it('names nothing when the window has not moved', () => {
    const before = [...mountedIndices(at())];
    expect(evictedIndices(before, at())).toEqual([]);
  });

  it('names everything when the window jumps clear of the old one', () => {
    const before = [0, 1, 2, 3];
    /* Each of these must be captured before its editor unmounts — which is why
       this is a named list the caller walks, not a filter buried in a render. */
    expect(evictedIndices(before, at({ firstVisible: 200, lastVisible: 204 }))).toEqual([0, 1, 2, 3]);
  });
});
