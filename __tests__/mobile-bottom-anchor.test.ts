/**
 * Mobile bottom-anchor layout for short conversations — second, independent
 * mechanism of Issue 1 (2026-07-24 texting-experience audit). Separate
 * branch from the near-bottom-guard recency fix — different mechanism,
 * different acceptance condition, no shared code.
 *
 * MECHANISM: even a perfectly-working scroll-to-bottom correction cannot
 * move content down when `scrollHeight <= clientHeight` — there is no
 * scroll range. The message list is a normal top-down flowing block, so a
 * short conversation just sits at its natural top-anchored position. On a
 * tall desktop viewport that reads as ordinary spacious layout; on a
 * keyboard-shrunk mobile viewport (~230px tall) it reads as "stuck near
 * the top with a gap before the composer." This is a layout question, not
 * a scroll-timing one — it would reproduce even with the guard fix fully
 * applied, any time a reply is short relative to the visible box height.
 *
 * FIX: the message-list wrapper becomes `min-h-full flex flex-col
 * justify-end` below the `md` breakpoint. `min-height`, not a fixed
 * `height` — with a fixed height, a flex column with
 * justify-content:flex-end can hide overflowing content at the START once
 * messages exceed the available space (a known flex/overflow
 * interaction). With min-height, once content grows past 100% the box
 * simply grows past it too — there is no leftover space left to push to
 * the top, so normal document order and the parent's normal
 * overflow-y:auto scrolling take over exactly as before.
 *
 * VERIFIED LIVE (local dev, this exact branch) before writing these
 * pins:
 * - Short conversation (2 turns), mobile viewport: reply settles directly
 *   above the composer, empty space above near the jewel — not the
 *   reverse.
 * - Long conversation (5 turns, content exceeds the box):
 *   scrollHeight(1230) > clientHeight(376) confirms a real scroll range
 *   exists; scrollTop = 0 correctly reveals the very first message in
 *   proper order (`hasHelloText: true`) — no content trapped by the
 *   known flex/justify-end/overflow pitfall.
 * - Desktop (resized, JULY): computed `display: block`, `min-height:
 *   0px` — the md: overrides neutralized the mobile-only rule.
 *
 * UPDATE 2026-08-22 (founder): the desktop carve-out above is REMOVED.
 * July's premise — that top-anchoring "reads fine on a tall desktop
 * viewport" — did not hold: at 1440x900 a two-turn conversation left a
 * measured 496px gap between the newest reply and the composer. Desktop
 * now shares the bottom-anchor (no md:block / md:min-h-0), and the
 * trailing reserve became conditional at desktop too (see
 * transcript-reserve-overflow.test.ts). Harness measurements, short
 * transcript: desktop 1440x900 496px -> 44px, 1280x800 252px -> 44px;
 * mobile 390x844 unchanged at 36px in every case; long transcripts
 * unchanged at both widths, first message still reachable at scrollTop 0.
 *
 * SCOPE: OracleConversation.tsx only, the message-list wrapper div.
 * No change to the scroll container itself, the #731/#739 guard
 * mechanism, bottom: 260px/220px geometry, or the composer.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const SRC = readFileSync(
  join(__dirname, '..', 'components/OracleConversation.tsx'),
  'utf8'
);

function messageListWrapperBlock(): string {
  const start = SRC.indexOf('{messages.length > 0 && (');
  const end = SRC.indexOf('>', SRC.indexOf('MOBILE BOTTOM-ANCHOR', start)) + 1;
  return SRC.slice(start, end);
}

// The className attribute value only — excludes the prose comment that
// documents the pb-48/md:pb-60 history, which would otherwise false-match
// any regex just checking whether those strings appear anywhere nearby.
function messageListWrapperClassName(): string {
  const block = messageListWrapperBlock();
  const classStart = block.indexOf('className="') + 'className="'.length;
  const classEnd = block.indexOf('"', classStart);
  return block.slice(classStart, classEnd);
}

describe('mobile bottom-anchor — short conversations settle at the bottom', () => {
  it('the message-list wrapper uses min-h-full, not h-full (avoids trapping overflow)', () => {
    const block = messageListWrapperClassName();
    expect(block).toMatch(/\bmin-h-full\b/);
    expect(block).not.toMatch(/(?<!min-)h-full\b/);
  });

  it('is a flex column bottom-anchored at every width', () => {
    const block = messageListWrapperClassName();
    expect(block).toMatch(/\bflex\b/);
    expect(block).toMatch(/\bflex-col\b/);
    expect(block).toMatch(/\bjustify-end\b/);
  });

  it('does NOT revert to block flow on desktop — the anchor now applies at every width (founder 2026-08-22)', () => {
    // SUPERSEDES the previous pin ("explicitly reverts to plain block
    // flow on desktop"). July scoped this fix below md because a short
    // reply "reads fine on a tall desktop viewport" — device evidence
    // since says otherwise: at 1440x900 a two-turn conversation left a
    // measured 496px void between the newest reply and the composer,
    // the same defect class the mobile fix removed. The min-height
    // reasoning documented above is breakpoint-independent (it degrades
    // to normal flow the moment content exceeds the box), so the
    // override is removed rather than duplicated per breakpoint.
    const block = messageListWrapperClassName();
    expect(block).not.toMatch(/\bmd:block\b/);
    expect(block).not.toMatch(/\bmd:min-h-0\b/);
  });

  it('keeps min-h-full unqualified so the anchor survives at desktop widths', () => {
    // Guards the specific regression path: re-adding any md:min-h-*
    // override would silently restore top-anchoring on desktop while
    // leaving every other assertion in this file green.
    const block = messageListWrapperClassName();
    expect(block).toMatch(/\bmin-h-full\b/);
    expect(block).not.toMatch(/\bmd:min-h-/);
  });

  it('preserves the top clearance classes (no regression to #703/#709)', () => {
    const block = messageListWrapperClassName();
    expect(block).toMatch(/pt-\[10\.5rem\]/);
    expect(block).toMatch(/md:pt-\[12rem\]/);
  });

  it('no longer carries a constant pb-48/md:pb-60 — that became a conditional reserve (see transcript-reserve-overflow.test.ts)', () => {
    // Superseded by the founder-reserve-vs-breathing-gap split: a constant
    // reserve on this wrapper double-reserves footer clearance once
    // justify-end is already bottom-anchoring short conversations. space-y-3
    // moved with the messages into their own intrinsic-content wrapper.
    const block = messageListWrapperClassName();
    expect(block).not.toMatch(/\bpb-48\b/);
    expect(block).not.toMatch(/\bmd:pb-60\b/);
  });
});

describe('scope guards', () => {
  it('does not touch the scroll container itself (overflow-y-auto div)', () => {
    const start = SRC.indexOf('<div className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide"');
    const end = SRC.indexOf('<AnimatePresence>', start);
    const scrollContainerBlock = SRC.slice(start, end);
    expect(scrollContainerBlock).not.toMatch(/justify-end/);
    expect(scrollContainerBlock).not.toMatch(/flex-col/);
  });

  it('does not modify the #731/#739 near-bottom guard mechanism (may coexist, must not overlap)', () => {
    // #739 may or may not be merged into this branch depending on merge
    // order — assert non-interference rather than absence, so this test
    // is meaningful either way. If #739's guard is present, it must be
    // untouched by this branch's edits (no bottom-anchor-specific
    // conditionals wrapping it, no shared variable names).
    if (SRC.includes('lastUserScrollAtRef')) {
      expect(SRC).toMatch(/const lastUserScrollAtRef = useRef\(0\);/);
      expect(SRC).toMatch(/const recentDeliberateScrollAway = !wasNearBottomRef\.current && scrollAwayMs < RECENT_USER_SCROLL_MS;/);
    }
    // Either way, this branch's own wrapper block must not reference the
    // guard's variables — the two mechanisms are independent.
    expect(messageListWrapperBlock()).not.toMatch(/lastUserScrollAtRef|RECENT_USER_SCROLL_MS|wasNearBottomRef/);
  });

  it('does not change the transcript/composer clearance geometry (measured, with the #703/#709 px as fallback)', () => {
    // See the matching guard in transcript-reserve-overflow.test.ts: the
    // clearance is derived from the live composer now, and the fixed
    // 260/220 values remain only as the pre-measurement fallback.
    expect(SRC).toMatch(/bottom: composerClearancePx != null/);
    expect(SRC).toMatch(/: \(showChatInterface \? '260px' : '220px'\),/);
  });

  it('does not touch VoiceInteractionBar or its #722 keyboard-inset hook', () => {
    expect(SRC).not.toMatch(/useKeyboardBottomInset/);
  });
});
