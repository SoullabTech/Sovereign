/**
 * Field Language Enforcement - Mode-B Safety Net
 *
 * Prevents UI narration from slipping through MAIA's responses.
 * Translates interface references to subtle field language.
 *
 * Created: November 6, 2025
 * Purpose: Enforce micro-behavior "Speak about the field, not the interface"
 */

/**
 * UI terms that should NOT appear in MAIA's responses
 */
const UI_TERMS = [
  /holoflower/i,
  /petals?/i,
  /sacred geometry/i,
  /visual(?:ization)?/i,
  /mandala/i,
  /interface/i,
  /screen/i,
  /display/i
];

/**
 * Replacement mappings: UI language → Field language
 */
const REPLACEMENTS = [
  { pattern: /holoflower/gi, to: "the field" },
  { pattern: /petals?/gi, to: "the field" },
  { pattern: /sacred geometry/gi, to: "the space" },
  { pattern: /visual(?:ization)?/gi, to: "what I'm sensing" },
  { pattern: /mandala/gi, to: "the field" },
  { pattern: /interface/gi, to: "the space between us" },
  { pattern: /\b(?:on the )?screen\b/gi, to: "in the field" },
  { pattern: /display/gi, to: "the space" }
];

/**
 * Check if text contains UI narration
 */
export function isUiNarration(text: string): boolean {
  return UI_TERMS.some((rx) => rx.test(text));
}

/**
 * Enforce Mode-B: translate UI references to field language
 */
export function enforceModeB(text: string): string {
  let out = text;
  REPLACEMENTS.forEach(({ pattern, to }) => {
    out = out.replace(pattern, to);
  });
  return out;
}

/**
 * Finalize MAIA's reply with Mode-B enforcement
 *
 * @param raw - Raw generated text from MAIA
 * @returns Cleaned text with UI narration removed
 */
export function finalizeMaiaReply(raw: string): string {
  let txt = raw.trim();

  // Enforce Mode-B if UI narration detected
  if (isUiNarration(txt)) {
    console.warn('⚠️  [MODE-B] UI narration detected, translating to field language');
    txt = enforceModeB(txt);
  }

  // Ensure lean formatting (prevent stacking reflections)
  // Keep maximum 4 lines for responses
  const lines = txt.split('\n');
  if (lines.length > 4) {
    // Collapse excessive line breaks
    txt = txt.replace(/\n{2,}/g, '\n').trim();
  }

  return txt;
}
