/**
 * Voice-response mute reachable on mobile — Issue 2 of the 2026-07-24
 * texting-experience audit.
 *
 * BUG: `enableVoiceInChat` (does MAIA's reply include spoken audio, or
 * text-only) already existed, fully wired — state, localStorage
 * persistence, and the `shouldSpeak` gate that actually silences her — but
 * its only always-visible control was a `hidden md:block` pill in
 * MaiaTopBar, invisible on every phone. A second path existed in
 * ModernTextInput's "+" tools menu, but that can't show current state at a
 * glance without opening the menu — doesn't satisfy "visible state clearly
 * distinguishes text only from text + voice."
 *
 * FIX: a new, always-glanceable icon button in the composer row (beside
 * the existing input-mode switch), visible below the `md` breakpoint,
 * complementing (not replacing) the existing desktop-only pill — same
 * `enableVoiceInChat` state, same localStorage key, same `shouldSpeak`
 * gate, untouched.
 *
 * PLACEMENT: not arbitrary — this file already documents the precedent.
 * The input-mode switch was moved out of MaiaTopBar into this exact
 * composer row for the same reason ("founder ruling, 2026-07-23": a
 * control that acts on the composer belongs beside the composer, not in
 * the top bar's identity/global-utilities cluster). This fix follows that
 * established pattern rather than inventing new floating geometry.
 *
 * SCOPE: OracleConversation.tsx only. No VoiceInteractionBar changes, no
 * transcript/keyboard-clearance changes, no change to shouldSpeak itself.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const SRC = readFileSync(
  join(__dirname, '..', 'components/OracleConversation.tsx'),
  'utf8'
);

function composerRowBlock(): string {
  const start = SRC.indexOf('{/* Input-mode switch — relocated from the top bar');
  const end = SRC.indexOf('<ModernTextInput', start);
  return SRC.slice(start, end);
}

describe('voice-response mute button — reachable on mobile', () => {
  it('is visible below the md breakpoint (not desktop-only)', () => {
    const block = composerRowBlock();
    // The button itself carries md:hidden (visible on mobile, hidden on
    // desktop) — the inverse of the pre-existing pill's hidden md:block,
    // so together they cover every width with no overlap.
    expect(block).toMatch(/className=\{`md:hidden flex min-w-\[44px\] min-h-\[44px\]/);
  });

  it('meets the 44x44 minimum hit target', () => {
    const block = composerRowBlock();
    expect(block).toMatch(/min-w-\[44px\] min-h-\[44px\]/);
  });

  it('distinguishes text-only from text+voice visually, not just by title', () => {
    const block = composerRowBlock();
    expect(block).toMatch(/<Volume2\b/);
    expect(block).toMatch(/<VolumeX\b/);
    expect(block).toMatch(/aria-pressed=\{enableVoiceInChat\}/);
  });

  it('reuses the existing enableVoiceInChat state and localStorage key — no new state', () => {
    const block = composerRowBlock();
    expect(block).toMatch(/setEnableVoiceInChat\(newValue\)/);
    expect(block).toMatch(/localStorage\.setItem\('enableVoiceInChat', JSON\.stringify\(newValue\)\)/);
  });

  it('does not touch the pre-existing desktop pill in MaiaTopBar\'s cluster', () => {
    // The old control (hidden md:block, in the OracleConversation JSX
    // separate from the composer row) is untouched — this fix is additive.
    expect(SRC).toMatch(/hidden md:block fixed right-4 md:right-20 z-below-nav/);
  });

  it('sits inside the composer row, not as new floating/fixed geometry', () => {
    const block = composerRowBlock();
    // No position:fixed, no new top/bottom/left/right offsets introduced —
    // it's a normal flex child of the existing row.
    expect(block).not.toMatch(/\bfixed\b/);
    expect(block).not.toMatch(/style=\{\{/);
  });
});

describe('scope — shouldSpeak gating is unchanged', () => {
  it('still gates on enableVoiceInChat exactly as before', () => {
    expect(SRC).toMatch(
      /shouldSpeak = !usedStreamingAudio && \(!showChatInterface \|\| \(showChatInterface && voiceEnabled && maiaReady && enableVoiceInChat\)\);/
    );
  });
});
