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

describe('ordinary scrolling can advance the window', () => {
  it('reads visibility from PERSISTENT shells, not from mounted editors', () => {
    /* THE DEFECT THIS FIXES. Observing only mounted nodes meant that once the
       writer scrolled below the window nothing intersected, `last` stayed -1,
       and commitWindow never ran — a continuous-scroll view that could not
       scroll. The rail worked only because it bypasses this path. */
    const scroll = block(SRC, 'const onScroll =', 'commitWindow({ first:');
    expect(scroll).toContain('for (const [id, node] of shells.current)');
    expect(SRC).not.toContain('anchors.current');
  });

  it('gives every section a shell, mounted or not', () => {
    /* The shell ref is registered on the outer div of every section, outside
       the mounted branch, so geometry comes from something always present. */
    expect(SRC).toMatch(/ref=\{\(n\) => \{ if \(n\) shells\.current\.set\(section\.id, n\);/);
    expect(SRC).toMatch(/data-whole-manuscript-mounted=\{isMounted \? 'true' : 'false'\}/);
    /* And the editor — not the shell — is what the window decides. */
    expect(SRC).toContain('{!isMounted ? null : section.editable ? (');
  });

  it('an evicted section keeps the height it actually had', () => {
    /* Otherwise a long section collapses to a stub on eviction and the page
       moves under the writer. The estimate is only for a section that has
       never rendered. */
    expect(SRC).toContain('heights.current.get(section.id) ?? ESTIMATED_SECTION_HEIGHT');
    const commit = block(SRC, 'const commitWindow =', 'setVisible(next);');
    expect(commit).toContain('heights.current.set(section.id, shell.offsetHeight)');
    /* Measured AFTER the capture: the capture is the part that matters and
       must not sit behind anything that could throw. */
    expect(commit.indexOf('writing.captureForUnmount('))
      .toBeLessThan(commit.indexOf('heights.current.set('));
  });

  it('never lets the estimate pass for a fact about the writing', () => {
    expect(SRC).not.toMatch(/ESTIMATED_SECTION_HEIGHT[\s\S]{0,80}(save|persist|revision|draft)/i);
  });
});

describe('the third way an editor can disappear: the surface itself leaves', () => {
  it('exposes one named act that captures every mounted editor', () => {
    /* Eviction and blur are handled inside. Switching back to Section view
       unmounts all of them at once, and there is no scroll or blur to catch
       it — so the parent needs something to call, by name, before it goes. */
    const cap = block(SRC, 'const captureMountedBeforeLeave =', '}, [writing]);');
    expect(cap).toContain('for (const [sectionId, field] of fields.current)');
    expect(cap).toContain('writing.captureForUnmount(sectionId, field.value)');
    expect(SRC).toContain('useImperativeHandle(handleRef, () => ({ captureMountedBeforeLeave })');
  });

  it('still refuses to satisfy the invariant with a cleanup', () => {
    expect(SRC).not.toMatch(/return \(\) => \{[\s\S]{0,200}captureForUnmount/);
  });
});

describe('where the writer is standing, in this view\'s own terms', () => {
  it('reports a place that is focus first, then the top of the viewport', () => {
    const place = block(SRC, 'const lastPlace =', 'onPlaceChange?.(id);');
    expect(place).toContain('const i = focusedIndex ?? visible.first;');
  });

  it('reports it only when it changes', () => {
    /* Otherwise the parent is told the same thing on every scroll frame, and
       a URL write per frame is its own defect. */
    const place = block(SRC, 'const lastPlace =', 'onPlaceChange?.(id);');
    expect(place).toContain('if (!id || id === lastPlace.current) return;');
  });

  it('never fakes a section switch to move the marker', () => {
    /* goToSection owns the single-editor switching and capture seam. Whole
       mode needs orientation, not a pretend switch through machinery built
       for something else. */
    expect(SRC).not.toContain('goToSection');
  });
});

describe('arrival is not a command', () => {
  it('takes arrival as its own prop, consumed once at mount', () => {
    /* Found by the runtime falsifier on 0cf26e22a, check 5: passing
       `jumpTo ?? wholeOpensAt` made an arrival coordinate and a navigation
       command interchangeable, so when a real rail jump completed and jumpTo
       returned to null, the arrival value became a fresh command and yanked the
       window back. The jump was undone by its own completion. */
    expect(SRC).toContain('initialOpenAt?: string | null;');
    const arr = block(SRC, 'const arrival = useRef', '}, []);');
    expect(arr).toContain('arrival.current = null;');
    /* Emptied BEFORE it is used, so a re-render cannot find it again. */
    expect(arr.indexOf('arrival.current = null;')).toBeLessThan(arr.indexOf('commitWindow('));
    /* Mount only. Any dependency here would recreate the fallback. */
    expect(arr.trimEnd().endsWith('}, []);')).toBe(true);
  });

  it('never re-derives a command from the arrival value', () => {
    /* The exact shape that failed. `jumpTo` nullish-coalesced with anything is
       the defect, wherever it appears. */
    expect(SRC).not.toMatch(/jumpTo\s*\?\?/);
    expect(SRC).not.toMatch(/initialOpenAt[\s\S]{0,80}jumpTo\s*=/);
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

describe('the page passes the two as separate props', () => {
  const PAGE = strip(readFileSync(join(__dirname, '..', 'canvas', 'page.tsx'), 'utf8'));

  it('gives the surface an arrival AND a command, never one standing in for the other', () => {
    expect(PAGE).toContain('initialOpenAt={session.wholeOpensAt}');
    expect(PAGE).toContain('jumpTo={jumpTo}');
    /* The line that failed check 5. */
    expect(PAGE).not.toContain('jumpTo={jumpTo ?? session.wholeOpensAt}');
    expect(PAGE).not.toMatch(/jumpTo=\{[^}]*\?\?/);
  });
});
