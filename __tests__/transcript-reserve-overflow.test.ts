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

// The reserve's className is a template literal whose two branches are
// double-quoted class strings. Extract them positionally (overflowing
// first, non-overflowing second) rather than splitting on `?`/`:` —
// Tailwind's own breakpoint colon (md:h-60) would be mistaken for the
// ternary separator.
function reserveBranches(block: string): [string, string] {
  // Read the className VALUE only. The element carries a prose comment
  // that quotes the historical h-48/md:h-60 values, and scraping the
  // whole block would false-match those instead of the live classes —
  // the same trap the original suite documented for pb-48/md:pb-60.
  const cls = block.match(/className=\{`([^`]*)`\}/);
  expect(cls).not.toBeNull();
  const branches = [...cls![1].matchAll(/"([^"]*)"/g)].map(m => m[1]);
  expect(branches).toHaveLength(2);
  return [branches[0], branches[1]];
}

function mobileHeightToken(branch: string): string | undefined {
  return branch.split(/\s+/).find(t => /^h-\d+$/.test(t));
}

function desktopHeightToken(branch: string): string | undefined {
  return branch.split(/\s+/).find(t => /^md:h-\d+$/.test(t));
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
    const start = SRC.indexOf('// Re-observe whenever the transcript mounts/unmounts');
    const end = SRC.indexOf('}, [messages.length > 0]);', start) + '}, [messages.length > 0]);'.length;
    const block = SRC.slice(start, end);
    expect(block).toMatch(/new ResizeObserver\(\(\) => recomputeContentOverflow\(\)\)/);
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
  it('keeps the full founder reserve (md:h-60) when overflowing, a small breathing gap when not', () => {
    const block = reserveDivBlock();
    const [overflowingBranch, nonOverflowingBranch] = reserveBranches(block);
    expect(overflowingBranch).toMatch(/\bmd:h-60\b/);
    expect(nonOverflowingBranch).not.toMatch(/\bmd:h-60\b/);
  });

  it('mobile uses the small h-6 reserve in BOTH branches (2026-07-28 reading-window fix, unchanged)', () => {
    const block = reserveDivBlock();
    const [overflowingBranch, nonOverflowingBranch] = reserveBranches(block);
    // Mobile base class, i.e. the unprefixed h-* token in each branch.
    expect(mobileHeightToken(overflowingBranch)).toBe('h-6');
    expect(mobileHeightToken(nonOverflowingBranch)).toBe('h-6');
  });

  it('desktop is bottom-anchored too, so a short reply gets a small desktop reserve (founder 2026-08-22)', () => {
    // SUPERSEDES the previous pin ("desktop keeps md:h-60 in BOTH
    // branches"). That pin encoded the July decision to scope the
    // bottom-anchor fix to mobile only (md:block md:min-h-0 on the
    // wrapper). With desktop now sharing the anchor, an unconditional
    // md:h-60 would re-open the very gap justify-end just closed: a
    // short desktop reply measured 496px above the composer at
    // 1440x900. The large reserve is now earned by overflow, not by
    // breakpoint — shortness vs. overflow is the governing distinction
    // at every width.
    const block = reserveDivBlock();
    const [, nonOverflowingBranch] = reserveBranches(block);
    const desktop = desktopHeightToken(nonOverflowingBranch);
    expect(desktop).toBeDefined();
    // Small, but not collapsed to nothing: the reply must still breathe.
    const rem = Number(desktop!.replace('md:h-', ''));
    expect(rem).toBeGreaterThanOrEqual(6);   // >= 24px
    expect(rem).toBeLessThanOrEqual(12);     // <= 48px  (founder band)
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
  it('does not change the transcript/composer clearance geometry (measured, with the #703/#709 px as fallback)', () => {
    // The clearance became DERIVED from the live composer's measured top
    // edge after this suite was written; the old fixed 260/220 values
    // survive only as the pre-measurement fallback. Pin the mechanism as
    // it actually is now, so this guard fails on real drift rather than
    // failing permanently against superseded source text.
    expect(SRC).toMatch(/bottom: composerClearancePx != null/);
    expect(SRC).toMatch(/: \(showChatInterface \? '260px' : '220px'\),/);
    expect(SRC).toMatch(/const TRANSCRIPT_COMPOSER_GAP_PX = 12;/);
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
