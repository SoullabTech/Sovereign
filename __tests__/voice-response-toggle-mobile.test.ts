/**
 * Voice-response mute, made explicit and reachable on mobile — Issue 2 of
 * the 2026-07-24 texting-experience audit.
 *
 * BUG (part 1): `enableVoiceInChat` (does MAIA's reply include spoken
 * audio, or text-only) already existed, fully wired — state, localStorage
 * persistence, and the `shouldSpeak` gate that actually silences her — but
 * its only always-visible control was a `hidden md:block` pill in
 * MaiaTopBar, invisible on every phone. A second path existed in
 * ModernTextInput's "+" tools menu, but that can't show current state at a
 * glance without opening the menu.
 *
 * BUG (part 2, found during review): even where the control WAS visible,
 * the word "Voice" was used for two different things at once — the
 * input-mode switch ("I want to speak") and this response-audio control
 * ("MAIA should speak"). Same word, opposite subject.
 *
 * FIX: a new, always-glanceable, explicit-text button in the composer row
 * ("MAIA voice: On"/"Off"), visible below the `md` breakpoint,
 * complementing (not replacing) the existing desktop-only pill — which is
 * itself relabeled the same way for consistency. The input-mode switch
 * beside it is renamed from the ambiguous "Voice" to "Speak" — a verb
 * naming the action it performs, not a noun that collides with the other
 * control's subject.
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

function desktopPillBlock(): string {
  const start = SRC.indexOf('{/* Voice toggle for chat mode - HIDDEN on mobile');
  const end = SRC.indexOf('</div>', SRC.indexOf('</button>', start));
  return SRC.slice(start, end);
}

describe('mobile response-audio control — reachable and explicit', () => {
  it('is visible below the md breakpoint (not desktop-only)', () => {
    const block = composerRowBlock();
    // md:hidden = visible on mobile, hidden on desktop — the inverse of
    // the pre-existing pill's hidden md:block, so together they cover
    // every width with no overlap.
    expect(block).toMatch(/className=\{`md:hidden flex min-h-\[44px\]/);
  });

  it('meets the 44px minimum height hit target', () => {
    const block = composerRowBlock();
    expect(block).toMatch(/min-h-\[44px\]/);
  });

  it('uses visible text, not an icon alone, to state whose voice this is', () => {
    const block = composerRowBlock();
    expect(block).toMatch(/<Volume2\b/);
    expect(block).toMatch(/<VolumeX\b/);
    expect(block).toMatch(/aria-pressed=\{enableVoiceInChat\}/);
    // The literal visible label — "MAIA voice", not the bare "Voice" the
    // input-mode switch also used to say.
    expect(block).toMatch(/<span>MAIA voice: \{enableVoiceInChat \? 'On' : 'Off'\}<\/span>/);
  });

  it('reuses the existing enableVoiceInChat state and localStorage key — no new state', () => {
    const block = composerRowBlock();
    expect(block).toMatch(/setEnableVoiceInChat\(newValue\)/);
    expect(block).toMatch(/localStorage\.setItem\('enableVoiceInChat', JSON\.stringify\(newValue\)\)/);
  });

  it('sits inside the composer row, not as new floating/fixed geometry', () => {
    const block = composerRowBlock();
    expect(block).not.toMatch(/\bposition:\s*['"]?fixed/);
    expect(block).not.toMatch(/style=\{\{/);
  });
});

describe('input-mode switch — renamed to remove the collision with "MAIA voice"', () => {
  it('reads "Speak", not the ambiguous "Voice"', () => {
    const block = composerRowBlock();
    expect(block).toMatch(/<span>Speak<\/span>/);
    expect(block).not.toMatch(/<span>Voice<\/span>/);
  });

  it('title/aria-label no longer use the bare word "voice"', () => {
    const block = composerRowBlock();
    const buttonStart = block.indexOf('<span>Speak</span>');
    const buttonBlock = block.slice(Math.max(0, buttonStart - 400), buttonStart);
    expect(buttonBlock).not.toMatch(/\bvoice\b/i);
  });

  it('behavior (onClick target) is unchanged', () => {
    const block = composerRowBlock();
    expect(block).toMatch(/onClick=\{\(\) => setShowChatInterface\(false\)\}/);
  });
});

describe('desktop pill — relabeled for coherence, not removed', () => {
  it('still exists, still desktop-only', () => {
    expect(SRC).toMatch(/hidden md:block fixed right-4 md:right-20 z-below-nav/);
  });

  it('uses the same "MAIA voice: On/Off" wording as the new mobile control', () => {
    const block = desktopPillBlock();
    expect(block).toMatch(/<span>MAIA voice: \{enableVoiceInChat \? 'On' : 'Off'\}<\/span>/);
    expect(block).not.toMatch(/'Voice On'|'Voice Off'/);
  });

  it('reuses the same state/persistence — no separate desktop-only state', () => {
    const block = desktopPillBlock();
    expect(block).toMatch(/setEnableVoiceInChat\(newValue\)/);
    expect(block).toMatch(/localStorage\.setItem\('enableVoiceInChat', JSON\.stringify\(newValue\)\)/);
  });
});

describe('scope — shouldSpeak gating and out-of-scope surfaces are unchanged', () => {
  it('shouldSpeak still gates on enableVoiceInChat exactly as before', () => {
    expect(SRC).toMatch(
      /shouldSpeak = !usedStreamingAudio && \(!showChatInterface \|\| \(showChatInterface && voiceEnabled && maiaReady && enableVoiceInChat\)\);/
    );
  });

  it('does not touch VoiceInteractionBar', () => {
    expect(SRC).not.toMatch(/VoiceInteractionBar[\s\S]{0,80}(MAIA voice|enableVoiceInChat)/);
  });
});
