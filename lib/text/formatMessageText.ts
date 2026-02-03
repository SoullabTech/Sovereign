/**
 * Cleans MAIA output for display/TTS without deleting emphasized words.
 * - Removes stage directions like *smiles gently* or (softly)
 * - Preserves emphasis content: *wants* -> wants, **important** -> important
 * - Preserves meaningful parentheticals: (and I mean that)
 * - Avoids nuking JSON/code-like braces by only stripping short single-line {...} / [...] chunks
 */
export function formatMessageText(text: string): string {
  if (!text) return "";

  // Stage directions: *sighs*, *pauses*, *smiles gently*
  // NOTE: adverbs (softly|gently|...) included here - remove if you want *softly* as emphasis
  const STAGE_DIRECTION_PATTERN =
    /\*(?:sighs?|pauses?|smiles?|nods?|laughs?|thinks?|reflects?|breathes?|whispers?|speaks?|leans?|looks?|takes?)(?:[^*]{0,80})\*/gi;

  // Stage directions: (softly), (smiles gently)
  const PAREN_STAGE_DIRECTION_PATTERN =
    /\(\s*(?:sighs?|pause(?:s|d)?|smiles?|nods?|laughs?|thinks?|reflects?|breathes?|whispers?|speaks?|leans?|looks?|takes|softly|gently|warmly|quietly|slowly|deeply|carefully|thoughtfully)\b[^)]*\)/gi;

  // Strip short bracket meta chunks (like [pause], [thinking])
  const SHORT_BRACKET_META = /\[[^\]\n]{0,40}\]/g;

  // Only strip braces that look like meta tags (no colons/quotes = not JSON)
  // Matches: {thinking}, {pause}, {softly} but NOT {"key": "value"}
  const BRACE_META_TAG = /\{[^}:"'\n]{1,30}\}/g;

  return text
    .replace(STAGE_DIRECTION_PATTERN, "")
    .replace(PAREN_STAGE_DIRECTION_PATTERN, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1") // **word** -> word
    .replace(/\*([^*]+)\*/g, "$1") // *word* -> word
    .replace(SHORT_BRACKET_META, "") // strip short [pause], [thinking]
    .replace(BRACE_META_TAG, "") // strip {thinking} but preserve JSON
    .replace(/\s+/g, " ")
    .trim();
}
