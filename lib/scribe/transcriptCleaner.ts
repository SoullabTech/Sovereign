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

// ===========================================================================
// Synthesis-time cleaning (segment-level)
// ---------------------------------------------------------------------------
// Restored 2026-04-26 from 1302c9c41~1 — these were dropped accidentally
// inside the #163 client-portal merge. Test spec lives at
// __tests__/session-review.test.ts.
//
// Different concern from the phantom-prefix code above:
//   - Phantom-prefix code: WebSpeech hallucination cleanup at the *text* level
//   - Below: deduplication / silence / quality scoring at the *segment* level
// They coexist in this file because they share the cleaning domain.
// ===========================================================================

import type { TranscriptSegment } from './sessionReviewMode';

const SIMILARITY_THRESHOLD = 0.70; // word-overlap fraction to treat two segments as near-identical
const MIN_MEANINGFUL_LENGTH = 8;   // chars — shorter than this = probably silence/noise token

function wordOverlap(a: string, b: string): number {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean);
  const wa = normalize(a);
  const wb = normalize(b);
  if (!wa.length || !wb.length) return 0;
  const setB = new Set(wb);
  const overlap = wa.filter((w) => setB.has(w)).length;
  return overlap / Math.max(wa.length, wb.length);
}

/**
 * Pre-persistence guard: should this newly transcribed segment be rejected as a
 * phantom duplicate or silence-text artifact before being INSERTed?
 *
 * Phase A.2 dedup-comparator fix (2026-05-16, Kelly): the prior token-overlap
 * comparator (`wordOverlap >= 0.70`) was collapsing *structurally parallel*
 * utterances. "This is the second sentence of the test." vs "This is the third
 * sentence of the test." share 7/8 words = 0.875 overlap and were falsely
 * dropped as duplicates — even though "second"/"third" makes them semantically
 * distinct utterances. The comparator was treating identity as lexical
 * similarity instead of as exact replay.
 *
 * Real duplicate cases this guard MUST still catch:
 *   - Exact normalized replay (WebSpeech phantom repetition).
 *   - Whisper previousTail re-emission where a later chunk's text is a
 *     normalized word-prefix of an already-persisted segment, or vice versa
 *     (e.g. "This is the third sentence." precedes "This is the third sentence
 *     of the test.").
 *
 * Real distinct cases this guard MUST NOT collapse:
 *   - Parallel utterances differing in a single content word
 *     ("second"/"third", "Monday"/"Tuesday", "first"/"second"/"third").
 *
 * Comparator: normalized exact-match OR one string is a word-aligned prefix
 * of the other. No token-set overlap. No Jaccard threshold. Word-aligned
 * prefix means the split happens at a space boundary in the normalized form,
 * so a mid-word truncation like "this is the third sent" does not falsely
 * match "I sent it yesterday".
 *
 * Returns true when the segment should be rejected: short-enough-to-be-
 * silence/noise, exact replay of a recent segment, or a word-prefix replay
 * of a recent segment.
 */
export function isLikelyPhantomDuplicate(
  newText: string,
  recentTexts: string[],
): boolean {
  const a = normalizeForReplayCheck(newText);
  if (!a) return true;
  if (a.length < MIN_MEANINGFUL_LENGTH) return true;
  for (const recent of recentTexts) {
    const b = normalizeForReplayCheck(recent);
    if (!b) continue;
    if (a === b) return true;
    if (isWordPrefix(a, b)) return true;
    if (isWordPrefix(b, a)) return true;
  }
  return false;
}

/**
 * Normalize for the replay comparator: lowercase, strip non-alphanumerics,
 * collapse whitespace. Produces a single space-separated word string suitable
 * for `===` equality and `startsWith(... + ' ')` prefix checks.
 */
function normalizeForReplayCheck(s: string): string {
  if (!s) return '';
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * True when `short` is a word-aligned prefix of `long` in the normalized form.
 * The boundary requirement prevents mid-word false positives ("sent" inside
 * "sentence"). Identical strings are not a "prefix" in this sense — handle
 * `a === b` separately.
 */
function isWordPrefix(short: string, long: string): boolean {
  if (long.length <= short.length) return false;
  return long.startsWith(short + ' ');
}

export interface TranscriptQualityMetrics {
  totalSegments: number;
  uniqueSegments: number;
  repeatedPhraseRate: number;   // 0–1: fraction of segments that are near-duplicates
  lowConfidenceCount: number;   // segments with transcriptionConfidence < threshold
  silenceCount: number;         // segments with text shorter than MIN_MEANINGFUL_LENGTH
  estimatedCleanliness: number; // 0–1 composite score (1 = clean)
  dominant_phrase?: string;     // most-repeated phrase if rate > 0.3
}

export function computeQualityMetrics(
  segments: TranscriptSegment[]
): TranscriptQualityMetrics {
  const total = segments.length;
  if (total === 0) {
    return {
      totalSegments: 0,
      uniqueSegments: 0,
      repeatedPhraseRate: 0,
      lowConfidenceCount: 0,
      silenceCount: 0,
      estimatedCleanliness: 1,
    };
  }

  let repeatedCount = 0;
  let silenceCount = 0;

  for (let i = 1; i < segments.length; i++) {
    const sim = wordOverlap(segments[i].text, segments[i - 1].text);
    if (sim >= SIMILARITY_THRESHOLD) repeatedCount++;
    if (segments[i].text.trim().length < MIN_MEANINGFUL_LENGTH) silenceCount++;
  }
  if (segments[0]?.text.trim().length < MIN_MEANINGFUL_LENGTH) silenceCount++;

  const repeatedPhraseRate = repeatedCount / total;
  const silenceRate = silenceCount / total;

  const phraseCounts: Record<string, number> = {};
  for (const seg of segments) {
    const key = seg.text.trim().toLowerCase().slice(0, 60);
    phraseCounts[key] = (phraseCounts[key] || 0) + 1;
  }
  const sortedPhrases = Object.entries(phraseCounts).sort((a, b) => b[1] - a[1]);
  const dominant_phrase =
    sortedPhrases[0] && sortedPhrases[0][1] > 2 ? sortedPhrases[0][0] : undefined;

  const estimatedCleanliness = Math.max(
    0,
    1 - repeatedPhraseRate * 0.6 - silenceRate * 0.4
  );

  return {
    totalSegments: total,
    uniqueSegments: total - repeatedCount,
    repeatedPhraseRate,
    lowConfidenceCount: 0, // confidence not stored on TranscriptSegment type currently
    silenceCount,
    estimatedCleanliness,
    dominant_phrase,
  };
}

export interface CleanedTranscript {
  segments: TranscriptSegment[];
  removedCount: number;
  qualityMetrics: TranscriptQualityMetrics;
}

/**
 * Clean a raw transcript for use in synthesis prompts.
 * Does NOT modify stored records — operates on in-memory copies.
 *
 * Rules applied in order:
 *   1. Strip silence / noise tokens (< MIN_MEANINGFUL_LENGTH chars)
 *   2. Remove adjacent near-duplicate segments (overlap > SIMILARITY_THRESHOLD)
 *   3. Collapse runs of the same phrase into a single annotated occurrence
 */
export function cleanForSynthesis(
  rawSegments: TranscriptSegment[]
): CleanedTranscript {
  const qualityMetrics = computeQualityMetrics(rawSegments);
  const originalCount = rawSegments.length;

  const cleaned = rawSegments.filter(
    (seg) => seg.text.trim().length >= MIN_MEANINGFUL_LENGTH
  );

  const deduped: TranscriptSegment[] = [];
  let runCount = 1;
  let lastText = '';

  for (const seg of cleaned) {
    const sim = wordOverlap(seg.text, lastText);

    if (sim >= SIMILARITY_THRESHOLD) {
      runCount++;
    } else {
      if (runCount > 2 && deduped.length > 0) {
        const last = deduped[deduped.length - 1];
        deduped[deduped.length - 1] = {
          ...last,
          text: `${last.text} [×${runCount} — phrase repeated across ${runCount} consecutive segments]`,
        };
      }
      deduped.push({ ...seg });
      lastText = seg.text;
      runCount = 1;
    }
  }

  if (runCount > 2 && deduped.length > 0) {
    const last = deduped[deduped.length - 1];
    deduped[deduped.length - 1] = {
      ...last,
      text: `${last.text} [×${runCount} — phrase repeated across ${runCount} consecutive segments]`,
    };
  }

  return {
    segments: deduped,
    removedCount: originalCount - deduped.length,
    qualityMetrics,
  };
}

/**
 * Returns a short metadata block to prepend to review prompts,
 * giving the AI context about transcript quality.
 */
export function buildQualityHeader(
  metrics: TranscriptQualityMetrics,
  removedCount: number
): string {
  const lines: string[] = [
    `## Transcript Quality Report`,
    `- Raw segments: ${metrics.totalSegments}`,
    `- After deduplication: ${metrics.totalSegments - removedCount} (${removedCount} removed)`,
    `- Estimated cleanliness: ${(metrics.estimatedCleanliness * 100).toFixed(0)}%`,
    `- Repeated-phrase rate: ${(metrics.repeatedPhraseRate * 100).toFixed(0)}%`,
  ];

  if (metrics.dominant_phrase && metrics.repeatedPhraseRate > 0.3) {
    lines.push(`- Dominant repeated phrase: "${metrics.dominant_phrase}" — this is a Whisper transcription artifact, not actual content`);
  }

  if (metrics.estimatedCleanliness < 0.5) {
    lines.push(`\n> ⚠️ This transcript has significant noise. Work with the clear segments and markers. Do not over-interpret fragmented or repeated text.`);
  }

  return lines.join('\n');
}
