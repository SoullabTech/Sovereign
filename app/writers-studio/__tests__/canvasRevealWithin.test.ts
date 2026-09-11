/**
 * The canvas reveals within one scroller and moves nothing else.
 *
 * Founder-witnessed 2026-09-11: switching to Whole manuscript, and selecting a
 * section from the outline, scrolled the whole window — the Studio header and
 * the left rail left the top of the screen. `scrollIntoView` scrolls every
 * scrollable ancestor, the document included.
 */
import * as fs from 'fs';
import * as path from 'path';
import { scrollDelta } from '../canvas/revealWithin';

describe('scrollDelta — the arithmetic, falsifiable without a browser', () => {
  /* jsdom performs no layout and returns zero for every rect, so a DOM-level
     test of the reveal would assert nothing at all. The arithmetic is split
     out precisely so it can be checked for real. */
  const scroller = { top: 100, height: 500 };

  it('start · a node below the fold moves down by its offset', () => {
    expect(scrollDelta({ top: 400, height: 80 }, scroller, 'start')).toBe(300);
  });

  it('start · a node already at the top does not move', () => {
    expect(scrollDelta({ top: 100, height: 80 }, scroller, 'start')).toBe(0);
  });

  it('start · a node above the fold moves UP — a negative delta', () => {
    expect(scrollDelta({ top: 40, height: 80 }, scroller, 'start')).toBe(-60);
  });

  it('center · a node is placed mid-scroller, not at its top', () => {
    /* 300 from the top, minus half the leftover height (500-80)/2 = 210 */
    expect(scrollDelta({ top: 400, height: 80 }, scroller, 'center')).toBe(90);
  });

  it('end · an end-marker is pinned to the scroller bottom, not its top', () => {
    /* The conversation follows its last turn. A zero-height marker at 400 in a
       scroller of 500 must move 300 - 500 = -200, i.e. up, leaving the marker
       at the bottom edge rather than dragging it to the top. */
    expect(scrollDelta({ top: 400, height: 0 }, scroller, 'end')).toBe(-200);
  });

  it('center · a node taller than the scroller still lands at its top edge', () => {
    expect(scrollDelta({ top: 100, height: 900 }, scroller, 'center')).toBe(200);
  });
});

describe('the canvas does not use scrollIntoView', () => {
  /* An API ban, in the manner of `check:no-supabase` — comments stripped first,
     because a file that DOCUMENTS the banned call must not read as the banned
     call returning. That false positive has been paid for once already in this
     repository (C21, the Circles verifier). */
  const dir = path.join(__dirname, '..', 'canvas');
  const strip = (s: string) =>
    s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');

  it('no canvas module scrolls an element by walking its ancestors', () => {
    const offenders = fs.readdirSync(dir)
      .filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'))
      .filter((f) => strip(fs.readFileSync(path.join(dir, f), 'utf8')).includes('scrollIntoView'));
    expect(`modules calling scrollIntoView: ${offenders.join(', ') || 'none'}`)
      .toBe('modules calling scrollIntoView: none');
  });
});
