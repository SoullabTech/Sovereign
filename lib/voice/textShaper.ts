/**
 * Text Shaper — pre-speech transformation for MAIA voice.
 *
 * Transforms LLM output into speakable form before TTS synthesis.
 * This is where "robo voice" dies — not at the model level.
 *
 * Rules:
 *   - Break long sentences into speakable clauses
 *   - Remove markdown artifacts
 *   - Reduce parentheticals
 *   - Convert bullet-heavy output into spoken lines
 *   - Fix TTS pronunciation issues
 *   - Preserve meaning, not punctuation literalism
 *
 * Example:
 *   Input:  "You're not actually confused so much as split between two loyalties,
 *            and because both matter, you keep converting the conflict into analysis."
 *   Output: "You're not actually confused.
 *            You're split between two loyalties.
 *            And because both matter, you keep converting the conflict into analysis."
 *
 * See: docs/maia-voice-spec-v1.md § Speech Shaping Rules
 */

// ── Markdown Cleanup ──────────────────────────────────────────────────────────

function stripMarkdown(text: string): string {
  let t = text;
  // Bold
  t = t.replace(/\*\*([^*]+)\*\*/g, '$1');
  // Italic
  t = t.replace(/\*([^*]+)\*/g, '$1');
  t = t.replace(/_([^_]+)_/g, '$1');
  // Links: [text](url) → text
  t = t.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Inline code
  t = t.replace(/`([^`]+)`/g, '$1');
  // Headers (# lines)
  t = t.replace(/^#{1,6}\s+/gm, '');
  // Horizontal rules
  t = t.replace(/^[-*_]{3,}\s*$/gm, '');
  return t;
}

// ── List Conversion ───────────────────────────────────────────────────────────

function convertListsToSpokenForm(text: string): string {
  // Convert bullet points to spoken sentences
  const lines = text.split('\n');
  const result: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Bullet or numbered list item
    const listMatch = trimmed.match(/^(?:[-*+]|\d+\.)\s+(.+)/);
    if (listMatch) {
      let item = listMatch[1].trim();
      // Ensure it ends with punctuation
      if (!/[.!?]$/.test(item)) {
        item += '.';
      }
      result.push(item);
    } else if (trimmed) {
      result.push(trimmed);
    }
  }

  return result.join(' ');
}

// ── Parenthetical Reduction ──────────────────────────────────────────────────

function reduceParentheticals(text: string): string {
  // Short parentheticals (< 40 chars): collapse into clause
  // Long parentheticals: remove entirely (they confuse spoken delivery)
  return text.replace(/\(([^)]+)\)/g, (_match, inner: string) => {
    if (inner.length < 40) {
      return `, ${inner},`;
    }
    return '';
  });
}

// ── TTS Pronunciation Fixes ──────────────────────────────────────────────────

function fixPronunciation(text: string): string {
  let t = text;
  t = t.replace(/\be\.g\.\s*/gi, 'for example, ');
  t = t.replace(/\bi\.e\.\s*/gi, 'that is, ');
  t = t.replace(/\betc\.\s*/gi, 'and so on. ');
  t = t.replace(/\bvs\.?\s*/gi, 'versus ');
  t = t.replace(/\bw\/\s*/gi, 'with ');
  t = t.replace(/\bw\/o\s*/gi, 'without ');
  // Ellipsis normalization (3+ dots → pause marker, not literal)
  t = t.replace(/\.{3,}/g, '. ');
  // Em dash → pause
  t = t.replace(/\s*—\s*/g, '. ');
  t = t.replace(/\s*–\s*/g, ', ');
  return t;
}

// ── Sentence Breaking ────────────────────────────────────────────────────────

const CLAUSE_BREAK_WORDS = /\b(and because|but because|and so|but then|and then|so that|which means|because)\b/gi;
const LONG_SENTENCE_THRESHOLD = 120; // chars

/**
 * Break a single long sentence into shorter speakable clauses.
 * Only breaks sentences that exceed the threshold.
 */
function breakLongSentence(sentence: string): string[] {
  if (sentence.length <= LONG_SENTENCE_THRESHOLD) {
    return [sentence];
  }

  // Try breaking at conjunctive phrases first
  const parts = sentence.split(CLAUSE_BREAK_WORDS).filter(Boolean);
  if (parts.length > 1) {
    return reassembleClauses(parts);
  }

  // Try breaking at commas for very long sentences
  if (sentence.length > 180) {
    const commaParts = sentence.split(/,\s+/);
    if (commaParts.length >= 3) {
      return reassembleAtCommas(commaParts);
    }
  }

  return [sentence];
}

/**
 * Reassemble clause parts into complete sentences.
 * Conjunctive words get prepended to the clause they introduce.
 */
function reassembleClauses(parts: string[]): string[] {
  const result: string[] = [];
  let current = '';

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // If this is a conjunctive word, prepend it to the next clause
    if (CLAUSE_BREAK_WORDS.test(trimmed)) {
      CLAUSE_BREAK_WORDS.lastIndex = 0; // reset regex state
      current += ` ${trimmed}`;
    } else if (current) {
      current += ` ${trimmed}`;
      result.push(cleanClause(current));
      current = '';
    } else {
      current = trimmed;
    }
  }

  if (current.trim()) {
    result.push(cleanClause(current));
  }

  return result.filter(Boolean);
}

/**
 * Reassemble comma-separated parts into groups of 2-3.
 */
function reassembleAtCommas(parts: string[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const chunk = parts.slice(i, i + 2).join(', ');
    result.push(cleanClause(chunk));
  }
  return result;
}

function cleanClause(clause: string): string {
  let c = clause.trim();
  // Remove leading conjunctions that got orphaned
  c = c.replace(/^(and|but|or|so)\s+/i, (match) => {
    // Keep it — natural spoken language starts sentences with conjunctions
    return match;
  });
  // Ensure ends with punctuation
  if (c && !/[.!?]$/.test(c)) {
    c += '.';
  }
  return c;
}

// ── Whitespace Normalization ─────────────────────────────────────────────────

function normalizeWhitespace(text: string): string {
  return text
    .replace(/\n{3,}/g, '\n\n')     // Collapse multiple newlines
    .replace(/[ \t]+/g, ' ')         // Collapse spaces/tabs
    .replace(/ \n/g, '\n')           // Trailing space before newline
    .trim();
}

// ── Main Export ──────────────────────────────────────────────────────────────

/**
 * Shape raw LLM text into speakable form for TTS.
 *
 * Does NOT add prosody markers — that's the Kokoro prosody adapter's job.
 * This only transforms the text itself for better speech delivery.
 */
export function shapeForSpeech(rawText: string): string {
  let text = rawText;

  // Step 1: Normalize whitespace
  text = normalizeWhitespace(text);

  // Step 2: Strip markdown
  text = stripMarkdown(text);

  // Step 3: Convert lists to spoken form
  text = convertListsToSpokenForm(text);

  // Step 4: Fix pronunciation
  text = fixPronunciation(text);

  // Step 5: Reduce parentheticals
  text = reduceParentheticals(text);

  // Step 6: Split into sentences and break long ones
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  const shaped = sentences.flatMap(s => breakLongSentence(s));

  // Step 7: Final cleanup
  return shaped
    .map(s => s.trim())
    .filter(Boolean)
    .join(' ');
}

/**
 * Split shaped text into individual sentence chunks for per-chunk synthesis.
 */
export function splitIntoChunks(shapedText: string): string[] {
  return shapedText
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
}
