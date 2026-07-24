/**
 * VoiceInteractionBar keyboard-docking fix — Defect A, device-confirmed
 * 2026-07-24 on physical Safari (matches the original member screenshot).
 *
 * MECHANISM: `position: fixed; bottom: 0` tracks the LAYOUT viewport, which
 * iOS does not shrink for the software keyboard — the bar stayed pinned to
 * the bottom of a viewport the keyboard no longer occupies, floating above
 * it with a visible gap. `window.visualViewport` reports the actually-
 * visible rectangle instead.
 *
 * OWN GEOMETRY, not Arrival's (#713): Arrival sizes a full-screen field
 * from `{top, height}`; this bar only needs a single `bottom` inset, since
 * it's anchored bottom/left/right and sized by its own content. The
 * keyboard's top edge is `visualViewport.offsetTop + visualViewport.height`
 * — NOT `height` alone — because the visible rectangle can itself be
 * offset within the layout viewport (e.g. the OS scrolling a focused field
 * into view). `offsetTop` is never assumed to be 0.
 *
 * SCOPE: structural pins over the source, like #703/#704/#713's own tests
 * — this repo's jest runs in a Node environment with no
 * @testing-library/react, so there is no rendered-DOM proof available
 * here. They cannot demonstrate correct behavior with a real software
 * keyboard. Physical Safari verification (closed + open + one multiline
 * expansion while open) is the merge gate — see PR.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const SRC = readFileSync(
  join(__dirname, '..', 'components/voice/VoiceInteractionBar.tsx'),
  'utf8'
);

function hookBody(): string {
  return SRC.slice(
    SRC.indexOf('function useKeyboardBottomInset'),
    SRC.indexOf('return inset;')
  );
}

describe('keyboard boundary formula', () => {
  it('derives the keyboard top from offsetTop + height, not height alone', () => {
    expect(hookBody()).toMatch(/vv\.offsetTop\s*\+\s*vv\.height/);
  });

  it('does not assume offsetTop is 0 — offsetTop is read, not hardcoded', () => {
    expect(hookBody()).toMatch(/vv\.offsetTop/);
    expect(hookBody()).not.toMatch(/offsetTop:\s*0/);
  });

  it('clamps to non-negative — never docks below the resting position', () => {
    expect(hookBody()).toMatch(/Math\.max\(0,/);
  });

  it('derives geometry from window.visualViewport, feature-detected not UA-sniffed', () => {
    expect(SRC).toMatch(/window\.visualViewport/);
    expect(SRC).not.toMatch(/userAgent|navigator\.vendor|CriOS|isSafari\(/);
  });

  it('degrades gracefully when visualViewport is unavailable, rather than throwing', () => {
    expect(hookBody()).toMatch(/if\s*\(!vv\)\s*return;/);
  });
});

describe('recalculates without remount', () => {
  it('subscribes to both resize and scroll, since either can change the visible rect', () => {
    expect(hookBody()).toMatch(/addEventListener\('resize'/);
    expect(hookBody()).toMatch(/addEventListener\('scroll'/);
  });

  it('cleans up both listeners on unmount', () => {
    expect(hookBody()).toMatch(/removeEventListener\('resize'/);
    expect(hookBody()).toMatch(/removeEventListener\('scroll'/);
  });

  it('recomputes from scratch on every event, not incrementally from prior state', () => {
    // `update` is the single source of truth: it reads live vv state and
    // calls setInset once, rather than deriving the next value from the
    // previous — so closing the keyboard restores 0 without special-casing.
    const updateBody = hookBody().slice(hookBody().indexOf('const update'));
    expect(updateBody).toMatch(/const rawInset = window\.innerHeight - keyboardTop;/);
    expect(updateBody).toMatch(/setInset\(Math\.max\(0, rawInset\)\)/);
  });

  it('dev-only: warns on a negative raw inset without affecting production behavior', () => {
    const updateBody = hookBody().slice(hookBody().indexOf('const update'));
    expect(updateBody).toMatch(/process\.env\.NODE_ENV === 'development' && rawInset < 0/);
    expect(updateBody).toMatch(/console\.warn\(/);
    // The warning is diagnostic only — setInset always clamps regardless
    // of NODE_ENV, so this can't change what actually renders.
    expect(updateBody.indexOf('setInset(Math.max(0, rawInset))')).toBeGreaterThan(
      updateBody.indexOf("console.warn(")
    );
  });

  it('the resting (keyboard-closed) state is 0 — bottom: 0 is unchanged', () => {
    expect(SRC).toMatch(/useState\(0\)/);
  });
});

describe('the bar docks from keyboardInset, and safe-area applies exactly once', () => {
  it('bottom is driven by the hook, not a static 0', () => {
    const outer = SRC.match(/className=\{`fixed left-0 right-0[^`]*`\}/);
    expect(outer).not.toBeNull();
    const styleBlock = SRC.slice(SRC.indexOf(outer![0]), SRC.indexOf(outer![0]) + 1400);
    expect(styleBlock).toMatch(/bottom:\s*keyboardInset/);
  });

  it('paddingBottom does not stack a full safe-area allowance on top of keyboardInset', () => {
    const outer = SRC.match(/className=\{`fixed left-0 right-0[^`]*`\}/);
    const styleBlock = SRC.slice(SRC.indexOf(outer![0]), SRC.indexOf(outer![0]) + 1400);
    expect(styleBlock).toMatch(/paddingBottom:\s*keyboardInset > 0 \? 12 : 'max\(env\(safe-area-inset-bottom\), 12px\)'/);
  });

  it('the outer container no longer hardcodes bottom-0 in its className', () => {
    expect(SRC).not.toMatch(/className=\{`fixed bottom-0 left-0 right-0/);
  });
});

describe('scope — this fix touches only VoiceInteractionBar\'s own positioning', () => {
  it('does not touch Arrival', () => {
    expect(SRC).not.toMatch(/MaiaArrivalField|viewportBox|createPortal/);
  });

  it('does not touch the chat-mode composer or conversation surface', () => {
    expect(SRC).not.toMatch(/oracle-conversation|bg-soul-background|ModernTextInput/);
  });

  it('does not introduce a z-layer registry or change the existing z-index', () => {
    expect(SRC).toMatch(/z-50/);
    expect(SRC).not.toMatch(/z-layer|zLayerRegistry|Z_LAYERS/i);
  });
});
