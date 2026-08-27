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

  // ── VOICE-TTS-LEAK-01A ──────────────────────────────────────────────────
  //
  // An UNTERMINATED fence and everything after it. Streaming produces this
  // routinely: the response is chunked by sentence, so a chunk can open a
  // fence whose closing delimiter lands in a later chunk — and the paired
  // rules above cannot match what has no closing half yet.
  //
  // Verified against the merged #1115 behaviour before this rule existed:
  //   "Here it is: ```js\nconst secret = 1;"  ->  "Here it is: ```js const secret = 1;"
  // Both the delimiter and the code body were spoken. The orphan-fence rule
  // above does not catch it, because that fence is not alone on its line.
  //
  // The tail is dropped rather than trimmed to the fence: everything after an
  // opening delimiter is code until proven otherwise, and speaking it is the
  // failure being prevented.
  text = text.replace(/(?:```|~~~)[\s\S]*$/g, ' ');

  // Indented code blocks — four or more leading spaces, or a tab. Markdown's
  // other way of writing code, and #1115 handled only the fenced form:
  //   "Run it:\n\n    rm -rf /tmp/cache\n\nDone."  ->  "Run it: rm -rf /tmp/cache Done."
  //
  // ⛔ Requires a blank line before the block, which is what markdown itself
  // requires. Without that guard this rule would eat ordinary wrapped prose
  // that happens to be indented — and over-stripping MAIA's speech is the
  // worse defect: silence heard as composure.
  text = text.replace(/(\n[ \t]*\n)(?:(?:[ ]{4,}|\t)[^\n]*\n?)+/g, '$1');

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
