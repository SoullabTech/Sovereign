/**
 * lib/scribe/transcriptCleaner.ts
 *
 * Detects and removes phantom prefixes from transcript segments.
 *
 * Phantom prefixes occur when WebSpeech API hallucinates a recurring phrase
 * at the start of every recognition window — e.g. "I don't know, like, what
 * is happening in this, you know," repeating verbatim across 1000+ segments.
 *
 * This cleaner normalises by word (ignoring punctuation/case differences),
 * finds a common leading word-sequence shared by >60% of segments, and strips
 * it from every matching segment before the transcript reaches Claude.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeToWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Detection
// ---------------------------------------------------------------------------

/**
 * Analyse an array of transcript texts and return the phantom prefix string
 * (as it appears in the first segment) if one is detected, or null.
 *
 * Algorithm:
 *  1. Normalise the first 20 segments to word arrays
 *  2. Find the longest sequence of leading words shared by ALL of them
 *  3. Require at least 5 shared words (short phrases are probably genuine speech)
 *  4. Reconstruct the raw prefix from texts[0]
 *  5. Verify that >60% of ALL segments start with this normalised prefix
 */
export function detectPhantomPrefix(texts: string[]): string | null {
  if (texts.length < 5) return null;

  const sample = texts.slice(0, Math.min(20, texts.length));
  const wordArrays = sample.map(normalizeToWords);
  const first = wordArrays[0];

  // Find how many leading words ALL sample segments share
  let commonWordCount = 0;
  outer: for (let i = 0; i < first.length; i++) {
    for (const wa of wordArrays.slice(1)) {
      if (wa[i] !== first[i]) break outer;
    }
    commonWordCount = i + 1;
  }

  if (commonWordCount < 5) return null;

  // Reconstruct the raw prefix from texts[0] by consuming commonWordCount words
  const raw = texts[0];
  let charPos = 0;
  let wordsConsumed = 0;

  while (charPos < raw.length && wordsConsumed < commonWordCount) {
    while (charPos < raw.length && !/\w/.test(raw[charPos])) charPos++;
    while (charPos < raw.length && /\w/.test(raw[charPos])) charPos++;
    wordsConsumed++;
  }

  // Consume trailing separators (comma, space) that follow the prefix
  while (charPos < raw.length && /[,\s]/.test(raw[charPos])) charPos++;

  const prefix = raw.slice(0, charPos).trimEnd().replace(/,+\s*$/, '').trimEnd();
  if (prefix.length < 10) return null;

  // Verify prefix appears in >60% of ALL segments
  const normalPrefix = normalizeToWords(prefix).join(' ');
  const matchCount = texts.filter(t => {
    const words = normalizeToWords(t);
    return words.slice(0, commonWordCount).join(' ') === normalPrefix;
  }).length;

  if (matchCount / texts.length < 0.6) return null;

  return prefix;
}

// ---------------------------------------------------------------------------
// Stripping
// ---------------------------------------------------------------------------

/**
 * Strip a known phantom prefix from every segment that starts with it.
 * Returns a new array; originals are not mutated.
 */
export function stripPhantomPrefix(texts: string[], prefix: string): string[] {
  const normalPrefix = normalizeToWords(prefix);
  const wordCount = normalPrefix.length;

  return texts.map(t => {
    const tWords = normalizeToWords(t);
    if (tWords.slice(0, wordCount).join(' ') !== normalPrefix.join(' ')) return t;

    // Walk charPos past wordCount words in the raw text
    let charPos = 0;
    let consumed = 0;
    while (charPos < t.length && consumed < wordCount) {
      while (charPos < t.length && !/\w/.test(t[charPos])) charPos++;
      while (charPos < t.length && /\w/.test(t[charPos])) charPos++;
      consumed++;
    }
    // Skip separator chars that immediately follow the prefix
    while (charPos < t.length && /[,\s]/.test(t[charPos])) charPos++;

    const remainder = t.slice(charPos).trim();
    return remainder || t; // keep original if stripping leaves nothing
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface CleanResult {
  texts: string[];
  phantomRemoved: string | null;
}

/**
 * One-shot: detect phantom prefix, strip it, return cleaned texts plus
 * the detected prefix (or null if none found).
 */
export function cleanTranscriptTexts(texts: string[]): CleanResult {
  const prefix = detectPhantomPrefix(texts);
  if (!prefix) return { texts, phantomRemoved: null };
  return { texts: stripPhantomPrefix(texts, prefix), phantomRemoved: prefix };
}
