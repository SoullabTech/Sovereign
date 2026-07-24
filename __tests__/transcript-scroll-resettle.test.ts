/**
 * Transcript scroll re-settle after keyboard-driven viewport changes —
 * Issue 1 of the 2026-07-24 texting-experience audit.
 *
 * MECHANISM: the pre-existing auto-scroll effect only re-runs on
 * `[messages]`. If a reply streams in while the keyboard is open, it
 * settles against that moment's keyboard-constrained container height.
 * When the keyboard later closes, `bottom: 260px`/`220px` (unchanged by
 * this fix) resolves against the taller closed-keyboard viewport and the
 * container grows — but nothing re-runs the scroll, so the stale
 * scrollTop leaves the reply stranded near the top with dead space
 * beneath it. Device-confirmed via a still sequence: keyboard open ->
 * reply arrives -> keyboard dismissed via the QuickType checkmark -> reply
 * remains scrolled high with room to spare below it.
 *
 * This is a stale-scroll correction, not another keyboard-offset fix like
 * #722/#713 — no positioning geometry changes here.
 *
 * GUARD: re-settling only happens if the member was already at/near the
 * bottom, tracked continuously via onScroll (not measured at resize time,
 * since by then the container may already reflect the new geometry).
 *
 * SCOPE: OracleConversation.tsx only. No change to bottom: 260px/220px,
 * the composer, voice controls, or #722's VoiceInteractionBar keyboard
 * inset logic.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const SRC = readFileSync(
  join(__dirname, '..', 'components/OracleConversation.tsx'),
  'utf8'
);

function resettleEffectBlock(): string {
  const start = SRC.indexOf('// Re-settle the transcript after keyboard-driven viewport changes');
  const end = SRC.indexOf('}, []);', start) + '}, []);'.length;
  return SRC.slice(start, end);
}

function messagesEffectBlock(): string {
  const start = SRC.indexOf('// Auto-scroll to latest message');
  const end = SRC.indexOf('}, [messages]);', start) + '}, [messages]);'.length;
  return SRC.slice(start, end);
}

function scrollContainerBlock(): string {
  const start = SRC.indexOf('<div className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide"');
  const end = SRC.indexOf('<AnimatePresence>', start);
  return SRC.slice(start, end);
}

describe('existing message-triggered auto-scroll — unchanged', () => {
  it('still fires smooth scrollIntoView keyed only on [messages]', () => {
    const block = messagesEffectBlock();
    expect(block).toMatch(/messagesEndRef\.current\?\.scrollIntoView\(\{ behavior: 'smooth' \}\)/);
    expect(block).toMatch(/\}, \[messages\]\);/);
  });
});

describe('visualViewport resize listener — re-settles bottom-anchored transcript', () => {
  it('subscribes to window.visualViewport resize', () => {
    const block = resettleEffectBlock();
    expect(block).toMatch(/window\.visualViewport/);
    expect(block).toMatch(/vv\.addEventListener\('resize', handleViewportResize\)/);
  });

  it('guards against a missing visualViewport (early return)', () => {
    const block = resettleEffectBlock();
    expect(block).toMatch(/if \(!vv\) return;/);
  });

  it('schedules exactly one pending rAF, cancelling any previous one', () => {
    const block = resettleEffectBlock();
    expect(block).toMatch(/if \(pendingFrame !== null\) cancelAnimationFrame\(pendingFrame\)/);
    expect(block).toMatch(/pendingFrame = requestAnimationFrame\(resettle\)/);
  });

  it('uses behavior: "auto" for the resize correction, not "smooth"', () => {
    const block = resettleEffectBlock();
    expect(block).toMatch(/messagesEndRef\.current\?\.scrollIntoView\(\{ behavior: 'auto' \}\)/);
    // The whole block should have exactly one scrollIntoView call, and it
    // must not be the smooth variant reserved for genuinely new messages.
    expect(block).not.toMatch(/behavior: 'smooth'/);
  });

  it('does not re-settle when the member was not near the bottom', () => {
    const block = resettleEffectBlock();
    // Matches both the original single-line guard and the diagnostic
    // build's multi-line form (guard + debug breadcrumb + return) — the
    // invariant under test is that a non-near-bottom state exits before
    // calling scrollIntoView, not the exact line shape.
    const guardIndex = block.search(/if \(!wasNearBottomRef\.current\)/);
    expect(guardIndex).toBeGreaterThan(-1);
    const guardBlock = block.slice(guardIndex, block.indexOf('return;', guardIndex) + 'return;'.length);
    expect(guardBlock).toMatch(/return;$/);
  });

  it('removes the listener and cancels any pending frame on cleanup', () => {
    const block = resettleEffectBlock();
    const cleanupStart = block.lastIndexOf('return () => {');
    const cleanup = block.slice(cleanupStart);
    expect(cleanup).toMatch(/vv\.removeEventListener\('resize', handleViewportResize\)/);
    expect(cleanup).toMatch(/if \(pendingFrame !== null\) cancelAnimationFrame\(pendingFrame\)/);
  });

  it('runs once on mount ([] dependency array), not per-render', () => {
    const block = resettleEffectBlock();
    expect(block.trimEnd()).toMatch(/\}, \[\]\);$/);
  });
});

describe('near-bottom tracking — continuous, not measured at resize time', () => {
  it('defines a 40-80px tolerance threshold', () => {
    expect(SRC).toMatch(/NEAR_BOTTOM_THRESHOLD_PX = (4[0-9]|5[0-9]|6[0-9]|7[0-9]|80);/);
  });

  it('the scroll container updates wasNearBottomRef via onScroll, not state', () => {
    const block = scrollContainerBlock();
    expect(block).toMatch(/onScroll=\{/);
    expect(block).toMatch(
      /wasNearBottomRef\.current =\s*\n?\s*el\.scrollHeight - el\.scrollTop - el\.clientHeight <= NEAR_BOTTOM_THRESHOLD_PX/
    );
    // A ref write, not a setState call — must not trigger a re-render on
    // every scroll tick.
    expect(block).not.toMatch(/setWasNearBottom/);
  });

  it('defaults to true (first open / empty transcript still auto-settles)', () => {
    expect(SRC).toMatch(/const wasNearBottomRef = useRef\(true\);/);
  });
});

describe('scope guards', () => {
  it('does not change the #703/#709 bottom clearance geometry', () => {
    expect(SRC).toMatch(/bottom: showChatInterface \? '260px' : '220px',/);
  });

  it('does not touch VoiceInteractionBar or its #722 keyboard-inset hook', () => {
    expect(SRC).not.toMatch(/useKeyboardBottomInset/);
  });

  it('does not introduce any new position: fixed geometry', () => {
    const block = resettleEffectBlock();
    expect(block).not.toMatch(/position:\s*['"]?fixed/);
  });
});
