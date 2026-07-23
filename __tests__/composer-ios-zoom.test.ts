/**
 * Composer iOS auto-zoom fix.
 *
 * BUG: iOS Safari auto-zooms the whole page on focus for any text input
 * with a computed font-size under 16px. All three composer text fields in
 * the app were under that threshold — ModernTextInput's textarea (text-sm,
 * 14px per this project's Tailwind theme: `sm: ['0.875rem', ...]`),
 * MaiaArrivalField's input (text-[15px]), and VoiceInteractionBar's input
 * (text-sm, 14px). Since `app/layout.tsx` deliberately never caps zoom
 * (`userScalable: true`, WCAG 1.4.4 — a member with low vision must be able
 * to magnify past whatever the page sets), disabling zoom is not an
 * available fix here. Raising the field's own font-size to >=16px is the
 * only change that stops the *unwanted* auto-zoom without touching a
 * member's own ability to zoom further.
 *
 * `text-[16px]` (an arbitrary-value utility) is used rather than `text-base`
 * deliberately: it compiles to a literal `font-size: 16px`, immune to any
 * future change to the Tailwind theme's rem base or a root font-size
 * override — `text-base` would silently drop below 16px if either changed.
 * Confirmed no such override exists today: no `html`/`body`/`:root`
 * font-size rule in app/globals.css.
 *
 * SCOPE: only these three composer INPUT/TEXTAREA elements are checked.
 * Non-input text-sm usage elsewhere (buttons, labels, transcript copy) is
 * deliberately untouched — the auto-zoom behavior is specific to focusable
 * form fields, not static text.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..');
const MODERN_TEXT_INPUT = readFileSync(join(ROOT, 'components/ui/ModernTextInput.tsx'), 'utf8');
const ARRIVAL_FIELD = readFileSync(join(ROOT, 'components/maia/MaiaArrivalField.tsx'), 'utf8');
const VOICE_BAR = readFileSync(join(ROOT, 'components/voice/VoiceInteractionBar.tsx'), 'utf8');
const GLOBALS_CSS = readFileSync(join(ROOT, 'app/globals.css'), 'utf8');

describe('no root font-size override could silently shrink text-[16px]', () => {
  it('app/globals.css sets no html/body/:root font-size', () => {
    expect(GLOBALS_CSS).not.toMatch(/(html|body|:root)\s*{[^}]*font-size/);
  });
});

/** Extracts only the value of the first className={`...`} after `from`. */
function templateClassNameAfter(src: string, from: number): string {
  const start = src.indexOf('className={`', from);
  const end = src.indexOf('`}', start);
  return src.slice(start, end);
}

/** Extracts only the value of the first className="..." after `from`. */
function stringClassNameAfter(src: string, from: number): string {
  const start = src.indexOf('className="', from) + 'className="'.length;
  const end = src.indexOf('"', start);
  return src.slice(start, end);
}

describe('ModernTextInput.tsx — the primary conversation composer', () => {
  it('the textarea is at least 16px, not text-sm (14px in this theme)', () => {
    const cls = templateClassNameAfter(MODERN_TEXT_INPUT, MODERN_TEXT_INPUT.indexOf('<textarea'));
    expect(cls).toMatch(/text-\[16px\]/);
    expect(cls).not.toMatch(/\btext-sm\b/);
  });
});

describe('MaiaArrivalField.tsx — the Arrival composer', () => {
  it('the message input is at least 16px, not text-[15px]', () => {
    const cls = stringClassNameAfter(ARRIVAL_FIELD, ARRIVAL_FIELD.indexOf('placeholder="Message MAIA'));
    expect(cls).toMatch(/text-\[16px\]/);
    expect(cls).not.toMatch(/text-\[15px\]/);
  });

  it('does not touch the unrelated House-doorway label (also text-[15px])', () => {
    // That label is static hover text, not an input — never part of this
    // bug, and must not be swept up by an overbroad find/replace.
    expect(ARRIVAL_FIELD).toMatch(/text-\[15px\] leading-none/);
  });
});

describe('VoiceInteractionBar.tsx — the voice-mode text-toggle composer', () => {
  it('the text input is at least 16px, not text-sm (14px in this theme)', () => {
    const cls = stringClassNameAfter(VOICE_BAR, VOICE_BAR.indexOf('placeholder="Type a message'));
    expect(cls).toMatch(/text-\[16px\]/);
    expect(cls).not.toMatch(/\btext-sm\b/);
  });

  it('does not touch unrelated text-sm usage elsewhere in the same file', () => {
    // The transcript line and the state-label span are static text, not
    // inputs — correctly untouched by this fix.
    expect(VOICE_BAR).toMatch(/text-sm italic text-stone-300\/75/);
    expect(VOICE_BAR).toMatch(/text-sm font-light truncate/);
  });
});
