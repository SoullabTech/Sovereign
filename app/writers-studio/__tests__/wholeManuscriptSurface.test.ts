/**
 * WS-WHOLE-MANUSCRIPT-01 — the surface's two orderings, as a source contract.
 *
 * ⚠️ WHAT THIS IS. The decisions live in pure modules with real falsifiers
 * (sectionWindow, sectionBoundary, manuscriptViewPreference). What cannot be
 * proven without a browser is the ORDER in which this component calls them —
 * and both orders were named by the founder precisely because React makes them
 * easy to get subtly wrong. So they are pinned as a source contract, which
 * proves the ordering is written, not that a browser honours it. The browser's
 * part is the witness's.
 *
 * ⛔ Comments are stripped first — C21, 2026-09-07.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** From a named declaration to the end of its callback. Anchored so a slice
 *  cannot silently become empty and turn an assertion into a no-op. */
const block = (src: string, start: string, end: string): string => {
  const from = src.indexOf(start);
  if (from < 0) throw new Error(`block start not found: ${start}`);
  const to = src.indexOf(end, from);
  if (to < 0) throw new Error(`block end not found: ${end}`);
  return src.slice(from, to + end.length);
};

const strip = (code: string) =>
  code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const SRC = strip(readFileSync(
  join(__dirname, '..', 'canvas', 'WholeManuscriptSurface.tsx'), 'utf8'));

describe('capture precedes the window state change', () => {
  it('captures every eviction BEFORE setVisible, not in a cleanup', () => {
    const commit = block(SRC, 'const commitWindow =', 'setVisible(next);');
    expect(commit).toContain('evictedIndices(mounted, nextInput)');
    expect(commit.indexOf('writing.captureForUnmount(')).toBeGreaterThan(-1);
    expect(commit.indexOf('writing.captureForUnmount('))
      .toBeLessThan(commit.indexOf('setVisible(next)'));
  });

  it('reads the LIVE editor value, never component state', () => {
    /* State may already have moved on; the node still holds what the writer
       can see. */
    expect(SRC).toMatch(/writing\.captureForUnmount\(section\.id, field\.value\)/);
  });

  it('does not satisfy the invariant with an unmount cleanup', () => {
    /* A cleanup runs when React has already decided. There must be no
       useEffect whose return captures. */
    expect(SRC).not.toMatch(/return \(\) => \{[\s\S]{0,200}captureForUnmount/);
  });
});

describe('the rail mounts before it scrolls', () => {
  it('commits the window around the destination, then asks for the scroll', () => {
    /* Ends at the scroll REQUEST, not at the first onJumpHandled — that one
       belongs to the unknown-section early return, and anchoring there sliced
       the block short of the code under test. */
    const jump = block(SRC, 'if (!jumpTo) return;', 'setPendingScroll(jumpTo);');
    expect(jump).toContain('commitWindow({ first: i, last: i })');
    expect(jump.indexOf('commitWindow({ first: i, last: i })'))
      .toBeLessThan(jump.indexOf('setPendingScroll(jumpTo)'));
  });

  it('never scrolls to a node that does not exist yet', () => {
    const layout = block(SRC, 'useLayoutEffect(', 'setPendingScroll(null);');
    expect(layout).toMatch(/if \(!node\) return;/);
    expect(layout.indexOf('if (!node) return;')).toBeLessThan(layout.indexOf('scrollIntoView'));
  });
});

describe('the structural guarantees the view may not quietly drop', () => {
  it('uses independent editors, never one giant contenteditable', () => {
    /* A single editable document over 262 section nodes would reopen the
       selection and topology ambiguity F-2 and F-5 closed. */
    expect(SRC).not.toContain('contentEditable');
    expect(SRC).toContain('<textarea');
  });

  it('refuses a boundary gesture only when the predicate says so', () => {
    const handler = block(SRC, 'const onKeyDown =', 'setNote(BOUNDARY_NOTE);');
    expect(handler).toContain('isBoundaryGesture({');
    expect(handler).toMatch(/\)\) return;[\s\S]*e\.preventDefault\(\)/);
    /* No structural act follows the refusal — no merge, no command, no mutation. */
    for (const forbidden of ['merge', 'split', 'reorder', 'topology']) {
      expect(`handler performs ${forbidden}: ${handler.toLowerCase().includes(forbidden)}`)
        .toBe(`handler performs ${forbidden}: false`);
    }
  });

  it('edits through the per-section path, so section identity is kept', () => {
    expect(SRC).toMatch(/writing\.editSection\(section\.id, e\.target\.value\)/);
  });
});
