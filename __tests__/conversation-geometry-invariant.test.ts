/**
 * Conversation geometry invariant — regression pins for #703.
 *
 * THE INVARIANT
 *   1. The conversation shell must NOT establish a containing block for its
 *      position:fixed descendants. "Fixed" must mean viewport-fixed.
 *   2. The conversation area is defined by its CLEARANCES, not by a computed
 *      height: it begins below the jewel and ends above the composer.
 *
 * WHAT BROKE IT
 *   `.bg-soul-background` animates `filter` (hearthlight). A non-`none` filter
 *   makes an element the containing block for every fixed descendant — the same
 *   rule as `transform`. The shell is min-h-screen (100vh) but starts 48px below
 *   the viewport top, so its box overhangs the bottom by 48px and fixed children
 *   resolved against 48…100vh+48.
 *
 *   Separately, the conversation area set top AND height AND bottom. With all
 *   three on a fixed element, CSS ignores `bottom`, so the composer clearance
 *   never applied — and the two disagreed (at 932px: top+bottom implies 496px,
 *   `calc(100vh - 300px)` gave 632px).
 *
 * MEASURED, before → after, identical at 375×667 / 375×812 / 430×932:
 *   gap below composer   −4  →  44
 *   transcript overlap    57  →  −79
 *   Both constant across device height, before and after: 100vh cancels out of
 *   both expressions. A fix that made them vary with viewport height would be
 *   wrong for the same reason the bug was.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..');
const shell = readFileSync(join(ROOT, 'components/OracleConversation.tsx'), 'utf8');
const css = readFileSync(join(ROOT, 'app/globals.css'), 'utf8');

describe('invariant 1 — the shell is not a containing block for fixed descendants', () => {
  it('does not carry the filter-animating background class', () => {
    const m = shell.match(/<div className="oracle-conversation[^"]*"/);
    expect(m).not.toBeNull();
    expect(m![0]).not.toMatch(/bg-soul-background/);
  });

  it('renders the breathing background as a separate layer instead', () => {
    expect(shell).toMatch(/className="bg-soul-background absolute inset-0/);
  });

  it('uses only position properties that are safe for fixed descendants', () => {
    // position:relative does NOT establish a containing block for fixed;
    // transform / filter / perspective / contain / will-change DO.
    const m = shell.match(/<div className="oracle-conversation[^"]*"/);
    expect(m![0]).toMatch(/\brelative\b/);
    expect(m![0]).not.toMatch(/\btransform\b|\bfilter\b|\bperspective\b|\bcontain-/);
  });

  it('keeps hearthlight animating filter — the reason the class must stay off the shell', () => {
    // If this ever stops animating `filter`, the constraint above can be relaxed.
    // Until then it is load-bearing, so pin it.
    expect(css).toMatch(/@keyframes hearthlight[\s\S]*?filter: brightness/);
    expect(css).toMatch(/\.bg-soul-background\s*\{[^}]*animation: hearthlight/);
  });
});

describe('invariant 2 — the conversation area is defined by clearances', () => {
  /** The inline style object of the `fixed top-44` conversation area. */
  const styleBlock = (() => {
    const anchor = shell.indexOf('fixed top-44');
    expect(anchor).toBeGreaterThan(-1);
    const start = shell.indexOf('style={{', anchor);
    return shell.slice(start, shell.indexOf('}}>', start));
  })();

  it('sets bottom, so the composer clearance is authoritative', () => {
    expect(styleBlock).toMatch(/bottom: showChatInterface \? '260px' : '220px'/);
  });

  it('does not also set height or maxHeight — that is what made bottom inert', () => {
    expect(styleBlock).not.toMatch(/\bheight:/);
    expect(styleBlock).not.toMatch(/\bmaxHeight:/);
  });

  it('derives no geometry from viewport units on this surface', () => {
    // 100vh cancelled out of the ORIGINAL bug's expressions too — measurement
    // showed viewport units were never implicated on this surface. Check the
    // actual CSS property VALUES (not prose in nearby comments) for a vh/dvh/svh
    // unit: `calc(100vh - 300px)` used to appear as a `height`/`maxHeight` value.
    const propValues = [...styleBlock.matchAll(/:\s*(?:'([^']*)'|`([^`]*)`)/g)]
      .map(m => m[1] ?? m[2]);
    for (const v of propValues) {
      expect(v).not.toMatch(/\d(vh|dvh|svh)\b/);
    }
  });
});

describe('scope — this fix stays geometric, not viewport-tracking', () => {
  // #703 was a viewport-COUPLED geometry bug: the conversation surface's box
  // resolved against a viewport-relative height. The fix's whole point is that
  // this surface's geometry is FIXED — a top clearance (`top-44`) and a bottom
  // clearance in px — decoupled from live viewport/keyboard height.
  //
  // The later mobile-keyboard work legitimately reads `window.visualViewport`.
  // Its history (git log -S visualViewport -- components/OracleConversation.tsx):
  //   b7a0036b5  re-settle bottom-anchored conversation after viewport changes
  //   c7eca8f3f  temporary on-screen scroll/viewport diagnostic (?debugScroll=1)
  //   10fe69a17  stale scroll-away can no longer permanently veto resettle
  // Those reads serve exactly two purposes: re-settling SCROLL position after
  // the keyboard opens/closes (scrollIntoView + content-overflow recompute),
  // and printing numbers in the ?debugScroll=1 diagnostic strip. Neither feeds
  // visualViewport into this surface's inline geometry — the resettle effect's
  // own comment is explicit: "the `bottom: 260px` geometry itself is
  // untouched." That is the line this scope test holds: visualViewport may
  // drive SCROLL (and diagnostics), never surface GEOMETRY.
  //
  // (Originally this asserted `visualViewport` appeared NOWHERE in the file — a
  // blunt proxy for "no viewport-tracking was added", correct when #703 had
  // just refuted a visualViewport-based mechanism for the clearance bug. That
  // refutation was mechanism-specific, not surface-eternal: once the sanctioned
  // scroll-resettle work landed, the blanket proxy went stale and began failing
  // against correct code. The assertion below is re-scoped to the actual
  // regression it was guarding: geometry, not scroll.)

  /** The inline style object of the `fixed top-44` conversation surface. */
  const styleBlock = (() => {
    const anchor = shell.indexOf('fixed top-44');
    const start = shell.indexOf('style={{', anchor);
    return shell.slice(start, shell.indexOf('}}>', start));
  })();

  it('does not derive the conversation surface geometry from visualViewport', () => {
    // Allowed anywhere: visualViewport → scrollIntoView / overflow recompute.
    // Forbidden here: visualViewport feeding any inline style VALUE on this
    // surface — that would re-couple the box to live keyboard/viewport height,
    // the exact #703 class of bug.
    expect(styleBlock).not.toMatch(/visualViewport/);
  });

  it('adds no dvh/svh units to the conversation surface', () => {
    const anchor = shell.indexOf('fixed top-44');
    const region = shell.slice(anchor - 2000, anchor + 2000);
    expect(region).not.toMatch(/dvh|svh/);
  });
});
