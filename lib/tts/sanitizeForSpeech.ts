/**
 * Sanitize MAIA speech input before it reaches a synthesis engine.
 *
 * This is intentionally a PRESENTATION sanitizer, not a meaning rewriter.
 * It removes artifacts that should never be spoken aloud (fenced code,
 * metadata, markdown formatting and URLs) while preserving ordinary prose,
 * including braces, brackets and parentheses.
 */

function isStandaloneJson(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;

  const looksLikeObject = trimmed.startsWith('{') && trimmed.endsWith('}');
  const looksLikeArray = trimmed.startsWith('[') && trimmed.endsWith(']');
  if (!looksLikeObject && !looksLikeArray) return false;

  try {
    const parsed = JSON.parse(trimmed);
    return parsed !== null && typeof parsed === 'object';
  } catch {
    return false;
  }
}

function stripStandaloneJsonLines(input: string): string {
  if (isStandaloneJson(input)) return '';

  return input
    .split('\n')
    .filter((line) => !isStandaloneJson(line))
    .join('\n');
}

function decodeXmlText(input: string): string {
  return input
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&');
}

function escapeXmlText(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const EMOJI_MODIFIER = '\\p{Emoji_Modifier}';
const VARIATION_SELECTOR = '\\uFE0F';
const ZWJ = '\\u200D';

/**
 * One full emoji grapheme: a pictographic base with any presentation selector
 * or skin-tone modifier, plus any ZWJ-joined continuation (family sequences,
 * profession sequences). Matching the whole cluster matters — removing only the
 * base would leave invisible joiners and orphan modifiers in the speech input.
 */
const EMOJI_CLUSTER = new RegExp(
  '(?:' +
    // Flags: a pair of regional indicators.
    '\\p{RI}\\p{RI}' +
    '|' +
    // Keycaps: 0-9, # or * followed by the combining enclosing keycap.
    '[0-9#*]' + VARIATION_SELECTOR + '?\\u20E3' +
    '|' +
    // Pictographic base + optional modifier, plus ZWJ continuations.
    '\\p{Extended_Pictographic}(?:' + VARIATION_SELECTOR + '|' + EMOJI_MODIFIER + ')?' +
    '(?:' + ZWJ + '\\p{Extended_Pictographic}(?:' + VARIATION_SELECTOR + '|' + EMOJI_MODIFIER + ')?)*' +
  ')',
  'gu',
);

/** Joiners and modifiers that can survive on their own after a partial strip. */
const ORPHAN_EMOJI_PARTS = new RegExp(
  '[' + VARIATION_SELECTOR + ZWJ + '\\uFE0E]|' + EMOJI_MODIFIER,
  'gu',
);

/**
 * Remove emoji presentation while leaving language alone.
 *
 * ⛔ Deliberately NOT "strip non-ASCII". Accented Latin, CJK, and every other
 * script are ordinary human speech and must survive untouched. Only
 * pictographic characters and their modifiers are removed.
 */
export function stripEmojiPresentation(input: string): string {
  if (!input) return '';
  return input.replace(EMOJI_CLUSTER, ' ').replace(ORPHAN_EMOJI_PARTS, '');
}

/**
 * Remove non-speakable presentation syntax while preserving semantic prose.
 */
export function sanitizeForSpeech(input: string): string {
  if (!input) return '';

  let text = input;

  // Internal metadata must never become audible.
  text = text.replace(/---SOUL_METADATA---[\s\S]*?---END_METADATA---/gi, ' ');

  // Code blocks are implementation artifacts, not conversational speech.
  text = text.replace(/```[\s\S]*?```/g, ' ');
  text = text.replace(/~~~[\s\S]*?~~~/g, ' ');
  text = text.replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, ' ');
  text = text.replace(/<code\b[^>]*>[\s\S]*?<\/code>/gi, ' ');

  // Remove any orphan fence lines left by malformed/incomplete markdown.
  text = text.replace(/^\s*(?:```|~~~)[^\n]*$/gm, ' ');

  // Whole/standalone JSON artifacts only. Do NOT delete arbitrary {...} or [...]
  // because those forms can be legitimate human prose.
  text = stripStandaloneJsonLines(text);

  // Markdown images/links: retain the human-readable label, drop the target URL.
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1');
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

  // Raw URLs are not useful spoken character-by-character.
  text = text.replace(/https?:\/\/\S+/gi, ' ');

  // Inline code: preserve the words, remove only the presentation delimiters.
  text = text.replace(/`([^`\n]+)`/g, '$1');

  // Common markdown block syntax.
  text = text.replace(/^\s{0,3}#{1,6}\s+/gm, '');
  text = text.replace(/^\s{0,3}>\s?/gm, '');
  text = text.replace(/^\s*(?:[-+*]\s+|\d+[.)]\s+)/gm, '');

  // Common emphasis markers. Preserve their content.
  text = text.replace(/\*\*([^*\n]+)\*\*/g, '$1');
  text = text.replace(/__([^_\n]+)__/g, '$1');
  text = text.replace(/~~([^~\n]+)~~/g, '$1');
  text = text.replace(/(^|[\s(])\*([^*\n]+)\*(?=$|[\s).,!?;:])/g, '$1$2');
  text = text.replace(/(^|[\s(])_([^_\n]+)_(?=$|[\s).,!?;:])/g, '$1$2');

  // Plain-text HTML/XML tags are presentation markup. SSML is handled by the
  // dedicated sanitizer below so allowed synthesis tags can survive there.
  text = text.replace(/<[^>]+>/g, ' ');

  // VOICE-TTS-EMOJI-01: emoji are presentation, not speech. A plain-text
  // engine verbalizes them ("sparkles", "folded hands"), so they are removed
  // rather than translated — naming them would turn this presentation
  // sanitizer into a meaning interpreter, which is exactly what it must not be.
  text = stripEmojiPresentation(text);

  // Normalize spacing after removing presentation artifacts.
  return text.replace(/\s+/g, ' ').trim();
}

const ALLOWED_SSML_TAG = /^<\/?(?:speak|prosody|emphasis)\b[^>]*>$|^<break\b[^>]*\/>$/i;

/**
 * Sanitize text nodes inside SSML while preserving only the small SSML subset
 * generated by MAIA's TTS adapter. This closes the route-level escape where
 * unsanitized source text was embedded in SSML and then preferred by Kokoro.
 */
export function sanitizeSsmlForSpeech(input: string): string {
  if (!input) return '';

  // Remove fenced code before tokenizing tags so a fence cannot survive merely
  // because its body contains escaped markup or line breaks.
  const withoutFences = input
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ');

  const parts = withoutFences.split(/(<[^>]+>)/g);
  const sanitized = parts
    .map((part) => {
      if (!part) return '';
      if (part.startsWith('<')) {
        return ALLOWED_SSML_TAG.test(part) ? part : '';
      }

      // generateSSML escapes model text before embedding it. Decode only the
      // text node, sanitize the human content, then re-escape for valid SSML.
      const cleaned = sanitizeForSpeech(decodeXmlText(part));
      if (!cleaned) return '';

      const leadingSpace = /^\s/.test(part) ? ' ' : '';
      const trailingSpace = /\s$/.test(part) ? ' ' : '';
      return `${leadingSpace}${escapeXmlText(cleaned)}${trailingSpace}`;
    })
    .join('');

  return sanitized.trim();
}

/**
 * Provider-boundary helper: plain text and SSML must both be sanitized before
 * synthesis. Keeping this decision here prevents callers from bypassing the
 * invariant by choosing a different input representation.
 */
export function sanitizeSpeechInput(input: string): string {
  return /<speak\b/i.test(input)
    ? sanitizeSsmlForSpeech(input)
    : sanitizeForSpeech(input);
}

/**
 * Provider-boundary helper for synthesis engines that CANNOT interpret SSML.
 *
 * VOICE-TTS-SSML-01: Kokoro-FastAPI (ghcr.io/remsky/kokoro-fastapi-cpu:v0.2.2)
 * does not parse SSML — it speaks the markup aloud, so a member hears
 * "speak", "prosody rate equals 108 percent", "break time equals 120 MS".
 * Preserving approved SSML tags is correct for a provider that reads them and
 * a defect for one that does not, so the decision belongs to the provider
 * contract rather than to the shared sanitizer.
 *
 * Text nodes get exactly the same treatment as in SSML mode; only the tags are
 * flattened away. Entities are decoded back to their characters so ordinary
 * prose ("R&D", "if x < 10") survives as speech rather than being deleted.
 */
export function sanitizeSpeechInputPlain(input: string): string {
  if (!input) return '';

  if (!/<speak\b/i.test(input)) return sanitizeForSpeech(input);

  const flattened = sanitizeSsmlForSpeech(input)
    .replace(/&nbsp;/gi, ' ')
    // A tag boundary is a word boundary: <break/> between sentences must not
    // fuse the words on either side of it.
    .replace(/<[^>]+>/g, ' ');

  return decodeXmlText(flattened).replace(/\s+/g, ' ').trim();
}
