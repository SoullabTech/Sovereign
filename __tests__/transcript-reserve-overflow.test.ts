/**
 * Conditional footer reserve for the mobile bottom-anchor layout — third,
 * independent mechanism of Issue 1 (2026-07-24 texting-experience audit).
 * Separate from #740's bottom-anchor layout itself and from #739/#741's
 * scroll-resettle guard — different mechanism, different acceptance
 * condition, no shared code beyond reading the same viewport/scroll refs.
 *
 * WHY THIS EXISTS: #740 correctly bottom-anchors short conversations, but
 * its trailing `pb-48`/`md:pb-60` (192px/240px) is a founder rule (commit
 * fbf7a7295, 2026-07-23: "the conversation must never end inside the
 * footer's airspace") sized for a LONG thread scrolled to its true end —
 * "footer + utility row + breathing room," deliberately larger than just
 * the composer's own height. Once `justify-end` also owns the SHORT-
 * conversation case, that same constant reserve becomes an unconditional
 * gap between the newest message and the composer even when there's no
 * long thread to protect against. Kelly (founder), 2026-07-24: "as
 * Founder, we still need to consider the UIUX for members on mobile
 * texting MAIA. If they are having a problem reading her responses it is
 * a problem" — member readability outranks the letter of the original
 * rule; the fix is to make the rule apply only where it was meant to.
 *
 * THE FIX: split the reserve into two states instead of one constant.
 * Long/overflowing content keeps the FULL founder reserve at the natural
 * scroll end. Short/non-overflowing content gets a small breathing gap
 * instead. The reserve moves from wrapper padding (`pb-48`, always
 * applied, sits OUTSIDE the flex content box so justify-end can never
 * pack around it) to a conditional trailing flex CHILD (participates in
 * what justify-end actually packs).
 *
 * CRITICAL CORRECTNESS REQUIREMENT (Kelly's explicit implementation
 * note): `contentOverflows` must be measured against INTRINSIC content
 * height — the messages alone, via a dedicated ref that structurally
 * cannot include the reserve div's own height — never against a
 * container whose scrollHeight already contains the reserve. Measuring
 * against a self-inclusive container would let the reserve prove its own
 * necessity (reserve adds height -> content now "overflows" -> reserve
 * stays applied -> ...) or flip-flop right at the boundary. This is why
 * `messageContentIntrinsicRef` wraps ONLY the messages, as a sibling of
 * the reserve div, both children of the flex wrapper — not a parent/child
 * relationship between reserve and the measured node.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const SRC = readFileSync(
  join(__dirname, '..', 'components/OracleConversation.tsx'),
  'utf8'
);

function recomputeFnBlock(): string {
  const start = SRC.indexOf('const recomputeContentOverflow = () => {');
  const end = SRC.indexOf('\n  };', start) + '\n  };'.length;
  return SRC.slice(start, end);
}

function reserveDivBlock(): string {
  // Starts at the actual JSX element, not the preceding prose comment
  // (which itself discusses pb-48/md:pb-60 and would false-match regexes
  // checking for their absence in the real markup).
  const commentIdx = SRC.indexOf('{/* Trailing reserve');
  const start = SRC.indexOf('<div', commentIdx);
  const end = SRC.indexOf('/>', start) + '/>'.length;
  return SRC.slice(start, end);
}

describe('intrinsic content measurement — structurally excludes the reserve', () => {
  it('messageContentIntrinsicRef wraps only the messages, as a sibling of the reserve div (not a parent)', () => {
    const wrapRefIdx = SRC.indexOf('<div ref={messageContentIntrinsicRef}');
    const reserveIdx = SRC.indexOf('{/* Trailing reserve');
    expect(wrapRefIdx).toBeGreaterThan(-1);
    expect(reserveIdx).toBeGreaterThan(wrapRefIdx);
    // The intrinsic wrapper's own closing tag must appear BEFORE the
    // reserve comment — i.e. the reserve is a sibling that comes after,
    // not content measured as part of the same subtree.
    const intrinsicWrapperClose = SRC.indexOf('</div>', SRC.indexOf('{/* Scroll anchor */}', wrapRefIdx));
    expect(intrinsicWrapperClose).toBeGreaterThan(-1);
    expect(intrinsicWrapperClose).toBeLessThan(reserveIdx);
  });

  it('recomputeContentOverflow reads scrollHeight from the intrinsic ref and clientHeight from the viewport ref — two different nodes', () => {
    const block = recomputeFnBlock();
    expect(block).toMatch(/const intrinsic = messageContentIntrinsicRef\.current;/);
    expect(block).toMatch(/const viewport = transcriptScrollElRef\.current;/);
    expect(block).toMatch(/intrinsic\.scrollHeight > viewport\.clientHeight \+ OVERFLOW_EPSILON_PX/);
  });

  it('uses a small epsilon to avoid boundary flip-flop, not an exact equality check', () => {
    expect(SRC).toMatch(/const OVERFLOW_EPSILON_PX = 4;/);
  });

  it('avoids redundant re-renders by only updating state when the overflow verdict actually changes', () => {
    const block = recomputeFnBlock();
    expect(block).toMatch(/setContentOverflows\(prev => \(prev === overflows \? prev : overflows\)\);/);
  });
});

describe('recomputation triggers — content changes AND viewport changes', () => {
  it('re-observes on mount/unmount of the transcript via a ResizeObserver on the intrinsic node', () => {
    // The observer callback also renews the auto-scroll settle mechanism
    // (see transcript-auto-scroll-settle.test.ts) — it's a block body now,
    // not a single-expression arrow, but recomputeContentOverflow() still
    // runs unconditionally on every resize.
    const start = SRC.indexOf('// Re-observe whenever the transcript mounts/unmounts');
    const end = SRC.indexOf('}, [messages.length > 0]);', start) + '}, [messages.length > 0]);'.length;
    const block = SRC.slice(start, end);
    expect(block).toMatch(/new ResizeObserver\(\(\) => \{/);
    expect(block).toMatch(/recomputeContentOverflow\(\);/);
    expect(block).toMatch(/observer\.observe\(intrinsic\)/);
    expect(block).toMatch(/return \(\) => observer\.disconnect\(\);/);
  });

  it('the ResizeObserver catches in-place content growth (e.g. streaming text) that the [messages] dependency alone could miss', () => {
    // A streaming reply that mutates message.text without changing the
    // `messages` array reference would not re-run the messages effect —
    // the ResizeObserver watches actual rendered height, not React state
    // identity, so it catches this case regardless of cause.
    expect(SRC).toMatch(/streaming text growing in place/);
    expect(SRC).toMatch(/without changing the `messages` array reference/);
  });

  it('also recomputes on messages effect (new turns) and on visualViewport resize (keyboard changes viewport clientHeight)', () => {
    const messagesEffectStart = SRC.indexOf('// Auto-scroll to latest message');
    const messagesEffectEnd = SRC.indexOf('}, [messages]);', messagesEffectStart) + '}, [messages]);'.length;
    const messagesEffectBlock = SRC.slice(messagesEffectStart, messagesEffectEnd);
    expect(messagesEffectBlock).toMatch(/recomputeContentOverflow\(\);/);

    const resizeHandlerStart = SRC.indexOf('const handleViewportResize = () => {');
    const resizeHandlerEnd = SRC.indexOf('};', resizeHandlerStart) + '};'.length;
    const resizeHandlerBlock = SRC.slice(resizeHandlerStart, resizeHandlerEnd);
    expect(resizeHandlerBlock).toMatch(/recomputeContentOverflow\(\);/);
  });
});

describe('the reserve itself — conditional, aria-hidden, structurally a flex child not padding', () => {
  it('renders h-48 (the full founder reserve) when overflowing, h-6 (breathing gap) when not', () => {
    const block = reserveDivBlock();
    expect(block).toMatch(/contentOverflows\s*\n?\s*\? 'h-48 md:h-60 shrink-0'\s*\n?\s*: 'h-6 md:h-60 shrink-0'/);
  });

  it('desktop keeps md:h-60 in BOTH branches — unaffected by contentOverflows either way', () => {
    const block = reserveDivBlock();
    // Extract the two quoted class strings directly rather than slicing
    // between `?`/`:` — Tailwind's own breakpoint colon (md:h-60) would
    // otherwise be mistaken for the ternary's separator.
    const quoted = [...block.matchAll(/'([^']+)'/g)].map(m => m[1]);
    expect(quoted).toHaveLength(2);
    const [overflowingBranch, nonOverflowingBranch] = quoted;
    expect(overflowingBranch).toMatch(/md:h-60/);
    expect(nonOverflowingBranch).toMatch(/md:h-60/);
  });

  it('is aria-hidden — decorative spacing, not content', () => {
    const block = reserveDivBlock();
    expect(block).toMatch(/aria-hidden="true"/);
  });

  it('does not use padding — it is a flex child, so justify-end packs around it correctly', () => {
    const block = reserveDivBlock();
    expect(block).not.toMatch(/\bpb-/);
    expect(block).not.toMatch(/padding/);
  });
});

describe('scope guards', () => {
  it('does not change the #703/#709 bottom clearance geometry', () => {
    expect(SRC).toMatch(/bottom: showChatInterface \? '260px' : '220px',/);
  });

  it('does not touch VoiceInteractionBar or its #722 keyboard-inset hook', () => {
    expect(SRC).not.toMatch(/useKeyboardBottomInset/);
  });

  it('does not touch the #739/#741 scroll-intent guard mechanism', () => {
    if (SRC.includes('lastUserScrollAtRef')) {
      expect(SRC).toMatch(/const lastUserScrollAtRef = useRef\(0\);/);
    }
    expect(reserveDivBlock()).not.toMatch(/lastUserScrollAtRef|wasNearBottomRef|RECENT_USER_SCROLL_MS/);
    expect(recomputeFnBlock()).not.toMatch(/lastUserScrollAtRef|wasNearBottomRef|RECENT_USER_SCROLL_MS/);
  });
});
