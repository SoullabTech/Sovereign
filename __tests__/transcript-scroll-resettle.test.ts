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
 * beneath it.
 *
 * GUARD, corrected after device evidence: the first version tracked only
 * a boolean ("was the member near the bottom last time onScroll fired"),
 * with no expiry. A real device capture showed this boolean going false
 * once — from a single scroll-up — then staying false for 5+ minutes
 * across THREE separate keyboard open/close cycles, silently skipping
 * every one of them (`vv-resize-SKIPPED` fired three times over +293s,
 * +295s, +312s, with identical box geometry each time). Switching to a
 * "measure fresh instead of trusting the ref" approach would NOT have
 * fixed this: the container's own scrollTop/scrollHeight/clientHeight do
 * not change when the keyboard opens or closes — only visualViewport
 * does — so a fresh read at resize time reaches the exact same
 * "not near bottom" verdict the stale ref already had. The real question
 * is whether an old scroll-away should stay authoritative forever. It
 * should not.
 *
 * ACCEPTANCE CONDITION: a deliberate, RECENT scroll-away must still be
 * respected (reading back through history while typing shouldn't get
 * yanked to the bottom), but it must not permanently disable
 * keyboard-resize correction across later keyboard cycles once it goes
 * stale.
 *
 * MECHANISM FOR THE FIX: two independent signals instead of one boolean —
 * current position (`wasNearBottomRef`, via `onScroll`, unchanged) and
 * *when the member last actually touched the scroll surface themselves*
 * (`lastUserScrollAtRef`, via `touchstart`/`wheel` — deliberately NOT the
 * `scroll` event, since programmatic `scrollIntoView` calls also fire
 * `scroll` and must not be mistaken for member intent). A scroll-away
 * only blocks correction while BOTH conditions hold: still away from
 * bottom, AND that state is recent.
 *
 * SCOPE: OracleConversation.tsx only. No change to bottom: 260px/220px,
 * the composer, voice controls, or #722's VoiceInteractionBar keyboard
 * inset logic. Independent of the separate mobile bottom-anchor layout
 * fix (different branch, different mechanism, different acceptance
 * condition).
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
  it('still fires a smooth auto-scroll keyed only on [messages]', () => {
    // #739/#741's own scrollIntoView call moved inside the shared
    // beginAutoScroll helper (see transcript-auto-scroll-settle.test.ts) —
    // this pins that the messages effect still requests 'smooth', not that
    // scrollIntoView is called directly from this effect body.
    const block = messagesEffectBlock();
    expect(block).toMatch(/beginAutoScroll\('smooth', `messages-effect\(count=\$\{messages\.length\}\)`\)/);
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

  it('uses "auto" for the resize correction, not "smooth"', () => {
    // Same relocation as the messages-effect pin above: the scrollIntoView
    // call itself now lives inside beginAutoScroll (auto-scroll-settle
    // mechanism); this pins that the resize path still requests 'auto'.
    const block = resettleEffectBlock();
    expect(block).toMatch(/beginAutoScroll\('auto', `vv-resize\(scrollAwayMs=\$\{scrollAwayMs\}\)`\)/);
    expect(block).not.toMatch(/beginAutoScroll\('smooth'/);
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

describe('recency + source guard — a scroll-away is not a permanent veto', () => {
  it('only skips when the scroll-away is BOTH not-near-bottom AND recent', () => {
    const block = resettleEffectBlock();
    expect(block).toMatch(
      /const recentDeliberateScrollAway = !wasNearBottomRef\.current && scrollAwayMs < RECENT_USER_SCROLL_MS;/
    );
    expect(block).toMatch(/if \(recentDeliberateScrollAway\) \{/);
  });

  it('computes scrollAwayMs from a real elapsed-time measurement, not a fixed flag', () => {
    const block = resettleEffectBlock();
    expect(block).toMatch(/const scrollAwayMs = Date\.now\(\) - lastUserScrollAtRef\.current;/);
  });

  it('resettles (does not skip) once the scroll-away goes stale, even with wasNearBottomRef still false', () => {
    // The literal defect this branch fixes: three keyboard cycles over 5+
    // minutes all skipped on an old scroll-away. The guard's condition
    // must include a time bound, or a stale false blocks forever.
    expect(SRC).toMatch(/RECENT_USER_SCROLL_MS = 10_000;/);
    const block = resettleEffectBlock();
    // The skip branch must return early; the fallthrough (stale or
    // already-near-bottom) must reach scrollIntoView unconditionally.
    const skipIdx = block.indexOf('if (recentDeliberateScrollAway) {');
    const returnIdx = block.indexOf('return;', skipIdx);
    const afterSkipBlock = block.slice(returnIdx, block.indexOf('scrollIntoView'));
    expect(afterSkipBlock).not.toMatch(/if \(!wasNearBottomRef\.current\)/); // no second unconditional veto
  });

  it('does not conflate the recency threshold with the near-bottom pixel threshold', () => {
    // Two independent constants for two independent signals.
    expect(SRC).toMatch(/NEAR_BOTTOM_THRESHOLD_PX = (4[0-9]|5[0-9]|6[0-9]|7[0-9]|80);/);
    expect(SRC).toMatch(/RECENT_USER_SCROLL_MS = 10_000;/);
  });
});

describe('lastUserScrollAtRef — sourced from genuine gestures, not programmatic scroll', () => {
  function markUserScrollIntentBlock(): string {
    const start = SRC.indexOf('const markUserScrollIntent = (source: string');
    const end = SRC.indexOf('\n  };', start) + '\n  };'.length;
    return SRC.slice(start, end);
  }

  it('is updated via markUserScrollIntent on pointerdown, touchstart, AND wheel — not on the scroll event', () => {
    const block = scrollContainerBlock();
    expect(block).toMatch(/onPointerDown=\{\(e\) => \{/);
    expect(block).toMatch(/onTouchStart=\{\(e\) => \{/);
    expect(block).toMatch(/onWheel=\{\(e\) => \{/);
    const pointerBlock = block.slice(block.indexOf('onPointerDown'), block.indexOf('onTouchStart'));
    const touchBlock = block.slice(block.indexOf('onTouchStart'), block.indexOf('onWheel'));
    const wheelBlock = block.slice(block.indexOf('onWheel'));
    expect(pointerBlock).toMatch(/markUserScrollIntent\('pointerdown', e\.target\)/);
    expect(touchBlock).toMatch(/markUserScrollIntent\('touchstart', e\.target\)/);
    expect(wheelBlock).toMatch(/markUserScrollIntent\('wheel', e\.target\)/);
  });

  it('the onScroll handler itself does not write lastUserScrollAtRef (would count our own scrollIntoView as user intent)', () => {
    const block = scrollContainerBlock();
    const onScrollStart = block.indexOf('onScroll={');
    const onScrollEnd = block.indexOf('onPointerDown');
    const onScrollBlock = block.slice(onScrollStart, onScrollEnd);
    expect(onScrollBlock).not.toMatch(/lastUserScrollAtRef/);
  });

  it('markUserScrollIntent writes the timestamp unconditionally, before the debug-only early return', () => {
    // Device evidence: scrollAwayMs=1784921085077 (a raw Date.now(), not
    // an elapsed time) proved lastUserScrollAtRef never left its default
    // 0 — the recency mechanism was defective regardless of debugScroll.
    // The timestamp write must not be gated behind the diagnostic flag.
    const block = markUserScrollIntentBlock();
    const writeIdx = block.indexOf('lastUserScrollAtRef.current = Date.now();');
    const guardIdx = block.indexOf('if (!scrollDebugEnabled) return;');
    expect(writeIdx).toBeGreaterThan(-1);
    expect(guardIdx).toBeGreaterThan(-1);
    expect(writeIdx).toBeLessThan(guardIdx);
  });

  it('logs a USER-SCROLL-INTENT marker comparing event.target against the ref (ownership-mismatch diagnostic)', () => {
    const block = markUserScrollIntentBlock();
    expect(block).toMatch(/USER-SCROLL-INTENT\(\$\{source\}, sameElement=\$\{sameElement\}\)/);
    expect(block).toMatch(/const sameElement = targetEl === refEl;/);
    // Reads event.target (where the gesture started), not currentTarget
    // (always the listener's own node) — the actual diagnostic value.
    expect(block).toMatch(/target: EventTarget \| null/);
  });
});

describe('near-bottom tracking — continuous, not measured at resize time', () => {
  it('the scroll container updates wasNearBottomRef via onScroll, not state', () => {
    const block = scrollContainerBlock();
    expect(block).toMatch(/onScroll=\{/);
    expect(block).toMatch(
      /wasNearBottomRef\.current =\s*\n?\s*el\.scrollHeight - el\.scrollTop - el\.clientHeight <= NEAR_BOTTOM_THRESHOLD_PX/
    );
    expect(block).not.toMatch(/setWasNearBottom/);
  });

  it('defaults to true (first open / empty transcript still auto-settles)', () => {
    expect(SRC).toMatch(/const wasNearBottomRef = useRef\(true\);/);
  });

  it('lastUserScrollAtRef defaults to 0 (no recent scroll at mount, so an initial away-from-bottom is never treated as recent)', () => {
    expect(SRC).toMatch(/const lastUserScrollAtRef = useRef\(0\);/);
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

  it('does not touch the mobile bottom-anchor layout question (separate branch)', () => {
    // justify-end/flex-end exist elsewhere in this file for unrelated UI —
    // scoped to the scroll container and its resettle effect specifically,
    // where a bottom-anchor layout change would actually land.
    expect(scrollContainerBlock()).not.toMatch(/justify-content:\s*flex-end|justify-end/);
    expect(resettleEffectBlock()).not.toMatch(/justify-content:\s*flex-end|justify-end/);
  });
});
