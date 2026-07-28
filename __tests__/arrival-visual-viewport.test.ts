/**
 * Arrival visual-viewport invariant — regression pins for #704.
 *
 * INVARIANT: with the software keyboard open, the complete Arrival focal
 * object remains visible within the usable VISUAL viewport, without relying
 * on device-specific offsets.
 *
 * MECHANISM: `position: fixed; inset: 0` pins a box to the LAYOUT viewport,
 * which iOS does not shrink when the keyboard opens. When the focused
 * composer input scrolls into view above the keyboard,
 * `visualViewport.offsetTop` becomes nonzero, but a fixed box tracks the
 * layout viewport, not the visual one, so it does not move with that scroll —
 * the top of the box (the holoflower) scrolls out of the visible window
 * above it. That is the reported crop.
 *
 * FIX: size and position the fixed field from `window.visualViewport`
 * (`top`, `height`) instead of `inset-0`, so the field always matches the
 * actually-visible rectangle. `visualViewport` is feature-detected, not
 * UA-sniffed, and has shipped in iOS Safari (and WKWebView, so Chrome-on-iOS)
 * since iOS 13 — the entire observed fleet.
 *
 * SCOPE: these are structural pins over the source, like #703's and #707's —
 * this repo's jest runs in a Node environment with no @testing-library/react,
 * so there is no rendered-DOM proof available here. They cannot demonstrate
 * correct behavior with a real software keyboard. Per #704's own boundary,
 * that requires a physical iPhone Safari check — see
 * docs/ops/MOBILE_DEVICE_TEST_HARNESS.md — before merge.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const SRC = readFileSync(
  join(__dirname, '..', 'components/maia/MaiaArrivalField.tsx'),
  'utf8'
);

describe('the field is positioned from the visual viewport, not the layout one', () => {
  it('no longer uses inset-0 for the outer field', () => {
    const outer = SRC.match(/className="(fixed left-0 right-0[^"]*)"/);
    expect(outer).not.toBeNull();
    expect(outer![1]).not.toMatch(/\binset-0\b/);
  });

  it('reads top and height from visual-viewport state, not a static value', () => {
    const styleBlock = SRC.slice(
      SRC.indexOf('style={{', SRC.indexOf('className="fixed left-0 right-0')),
      SRC.indexOf('}}', SRC.indexOf('className="fixed left-0 right-0'))
    );
    expect(styleBlock).toMatch(/top:\s*viewportBox\.top/);
    expect(styleBlock).toMatch(/height:\s*viewportBox\.height/);
  });

  it('derives geometry from window.visualViewport, feature-detected not UA-sniffed', () => {
    expect(SRC).toMatch(/window\.visualViewport/);
    expect(SRC).not.toMatch(/userAgent|navigator\.vendor|CriOS|isSafari\(/);
  });

  it('subscribes to both resize and scroll, since either can change the visible rect', () => {
    const hookBody = SRC.slice(
      SRC.indexOf('function useVisualViewportBox'),
      SRC.indexOf('return box;')
    );
    expect(hookBody).toMatch(/addEventListener\('resize'/);
    expect(hookBody).toMatch(/addEventListener\('scroll'/);
    expect(hookBody).toMatch(/removeEventListener\('resize'/);
    expect(hookBody).toMatch(/removeEventListener\('scroll'/);
  });

  it('degrades gracefully when visualViewport is unavailable, rather than throwing', () => {
    const hookBody = SRC.slice(
      SRC.indexOf('function useVisualViewportBox'),
      SRC.indexOf('return box;')
    );
    // must check for the API's presence before touching it
    expect(hookBody).toMatch(/if\s*\(!vv\)\s*return;/);
  });
});

describe('overflow safety net — nothing becomes permanently unreachable', () => {
  it('the outer field allows vertical scrolling', () => {
    const outer = SRC.match(/className="(fixed left-0 right-0[^"]*)"/);
    expect(outer![1]).toMatch(/overflow-y-auto/);
  });

  it('uses safe-centering so overflowing content is not clipped at its own start', () => {
    // Plain `center` can make the beginning of overflowing flex content
    // unreachable even with overflow:auto — a well-known flexbox gap that
    // `safe center` exists to close. See CSS Box Alignment L3 (safe/unsafe).
    expect(SRC).toMatch(/justifyContent:\s*'safe center'/);
  });
});

describe('scope — this fix must not have grown', () => {
  it('the keyboard-tracking mechanism itself uses no dvh/svh/vh sizing', () => {
    // The real invariant: `top`/`height` — the values that track the
    // keyboard — must come from visualViewport, never a vh-family unit.
    // (A `calc(...vh)` DOES legitimately appear elsewhere in this same
    // style block now, as a static cosmetic offset — see the reachability
    // fix below — so this asserts the specific properties, not the region.)
    const styleBlock = SRC.slice(
      SRC.indexOf('style={{', SRC.indexOf('className="fixed left-0 right-0')),
      SRC.indexOf('}}', SRC.indexOf('className="fixed left-0 right-0'))
    );
    const topLine = styleBlock.match(/top:\s*[^,]+,/)![0];
    const heightLine = styleBlock.match(/height:\s*[^,]+,/)![0];
    expect(topLine).not.toMatch(/\d(vh|dvh|svh)\b/);
    expect(heightLine).not.toMatch(/\d(vh|dvh|svh)\b/);
  });

  it('does not touch Arrival ownership — no new render conditions or props', () => {
    expect(SRC).not.toMatch(/shouldRenderArrival|arrivalInvoked|hasArrivedBefore/);
  });

  it('does not introduce a z-layer registry or change the existing z-index', () => {
    expect(SRC).toMatch(/z-\[90\]/);
    expect(SRC).not.toMatch(/z-layer|zLayerRegistry|Z_LAYERS/i);
  });

  it('does not touch the conversation surface', () => {
    expect(SRC).not.toMatch(/oracle-conversation|bg-soul-background/);
  });
});

/**
 * Reachability fix — follow-up to #713/#704.
 *
 * BUG (found and reproduced in-browser, not just reasoned about): the field
 * used `justify-content: safe center` together with a `-mt-[8vh]` negative
 * margin on its content wrapper, inside an `overflow-y-auto` container.
 * `safe center` is supposed to fall back to top-alignment when content
 * overflows, so nothing becomes unreachable — but a negative margin defeats
 * that: it pulls the item's border box to a coordinate ABOVE the container's
 * own top edge, and `scrollTop` cannot go negative to reach it. Reproduced
 * directly: at a short (keyboard-open-sized) container, the top content
 * rendered at -70px and stayed there at scrollTop 0, with the container's
 * own maxScrollTop capped well short of reaching it — i.e. permanently
 * unreachable by any amount of scrolling. That is the #704 crop, reintroduced
 * through a different mechanism, on the PR that fixed #704.
 *
 * FIX: the same "lifted above dead-centre" framing is expressed entirely as
 * padding on the scroll container instead of a margin on the scrolled
 * content — paddingTop reserves the 54px header's height so the `safe`
 * fallback's top-aligned content starts visible at scrollTop 0, and
 * paddingBottom carries the old margin's ~8vh lift plus that 54px, so the
 * centered (fits-fine) geometry is unchanged. No negative margin exists in
 * the scrollable coordinate space in either case. Verified in-browser at a
 * 180px container (landscape phone + keyboard): top content visible at
 * scrollTop 0 (not -70px), full content reachable by scrolling to
 * maxScrollTop, fits-case position unchanged from before this fix.
 */
describe('reachability fix — nothing in the scrollable region has a negative margin', () => {
  it('the content wrapper carries no negative margin', () => {
    const wrapper = SRC.match(/<div className="([^"]*max-w-\[560px\][^"]*)"/);
    expect(wrapper).not.toBeNull();
    expect(wrapper![1]).not.toMatch(/-mt-\[/);
  });

  it('the lift is expressed as container padding, not a content margin', () => {
    const styleBlock = SRC.slice(
      SRC.indexOf('style={{', SRC.indexOf('className="fixed left-0 right-0')),
      SRC.indexOf('}}', SRC.indexOf('className="fixed left-0 right-0'))
    );
    // Post-reconciliation (2026-07-28): the reserve is the header's REAL
    // height — 54px plus the safe-area inset the grown-box header honors.
    expect(styleBlock).toMatch(/paddingTop:\s*'calc\(54px \+ max\(env\(safe-area-inset-top\), 0px\)\)'/);
    expect(styleBlock).toMatch(/paddingBottom:\s*'calc\(54px \+ 8vh\)'/);
  });

  it('the reserved top matches the header\'s own grown-box height', () => {
    // Header is h-[calc(54px+env(safe-area-inset-top,0px))] after the
    // reconcile-not-stack merge — same 54px content row, notch-covering box.
    const header = SRC.match(/className="absolute inset-x-0 top-0[^"]*\bh-\[calc\((\d+)px\+env\(safe-area-inset-top,0px\)\)\][^"]*"/);
    expect(header).not.toBeNull();
    expect(header![1]).toBe('54');
  });

  it('no element in the field carries a negative top-margin utility class', () => {
    // Broader sweep than the wrapper check above — catches a negative
    // margin reintroduced on any other element inside the portal, not only
    // the one this bug originally lived on. Comments are stripped first:
    // this file's own explanation of the bug names the old `-mt-[8vh]`
    // class in prose, which isn't live code and shouldn't trip the check.
    const fieldBody = SRC
      .slice(SRC.indexOf('return createPortal('), SRC.indexOf('document.body\n  );'))
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    expect(fieldBody).not.toMatch(/-m[tybe]?-\[/);
    expect(fieldBody).not.toMatch(/\bnegative-m/);
  });
});
