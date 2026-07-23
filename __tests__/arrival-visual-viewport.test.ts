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
  it('adds no dvh/svh/vh-based sizing to the fixed field', () => {
    const outerRegion = SRC.slice(
      SRC.indexOf('function useVisualViewportBox'),
      SRC.indexOf('{/* Compact header')
    );
    // The pre-existing `-mt-[8vh]` cosmetic framing offset further down the
    // file is untouched by this fix and out of this region on purpose.
    expect(outerRegion).not.toMatch(/\d(vh|dvh|svh)\b/);
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
