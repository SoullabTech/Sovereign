// lib/scribe/transcriptCleaner.ts
// Cleans a raw transcript for synthesis without altering stored records.
//
// Design principles:
//   - Raw transcript in DB is never touched
//   - Cleaning only happens at synthesis time (review-session prompt building)
//   - Quality metrics are computed from the raw segments before cleaning
//   - Cleaning strategy: deduplicate adjacent near-identical segments,
//     collapse obvious repeated-phrase runs, downweight low-confidence segments

import type { TranscriptSegment } from './sessionReviewMode';

// ============================================================================
// Quality Metrics
// ============================================================================

export interface TranscriptQualityMetrics {
  totalSegments: number;
  uniqueSegments: number;
  repeatedPhraseRate: number;   // 0–1: fraction of segments that are near-duplicates
  lowConfidenceCount: number;   // segments with transcriptionConfidence < threshold
  silenceCount: number;         // segments with text shorter than minMeaningfulLength
  estimatedCleanliness: number; // 0–1 composite score (1 = clean)
  dominant_phrase?: string;     // most-repeated phrase if rate > 0.3
}

const SIMILARITY_THRESHOLD = 0.70;   // word-overlap fraction to call two segments near-identical
const MIN_MEANINGFUL_LENGTH = 8;     // chars — shorter than this = probably silence/noise token
const LOW_CONFIDENCE_THRESHOLD = 0.5;

function wordOverlap(a: string, b: string): number {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean);
  const wa = normalize(a);
  const wb = normalize(b);
  if (!wa.length || !wb.length) return 0;
  const setB = new Set(wb);
  const overlap = wa.filter(w => setB.has(w)).length;
  return overlap / Math.max(wa.length, wb.length);
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

  // Adjacent duplicate pass
  for (let i = 1; i < segments.length; i++) {
    const sim = wordOverlap(segments[i].text, segments[i - 1].text);
    if (sim >= SIMILARITY_THRESHOLD) repeatedCount++;
    if (segments[i].text.trim().length < MIN_MEANINGFUL_LENGTH) silenceCount++;
  }
  if (segments[0]?.text.trim().length < MIN_MEANINGFUL_LENGTH) silenceCount++;

  const repeatedPhraseRate = repeatedCount / total;
  const silenceRate = silenceCount / total;

  // Find dominant phrase (most common segment text, normalised)
  const phraseCounts: Record<string, number> = {};
  for (const seg of segments) {
    const key = seg.text.trim().toLowerCase().slice(0, 60);
    phraseCounts[key] = (phraseCounts[key] || 0) + 1;
  }
  const sortedPhrases = Object.entries(phraseCounts).sort((a, b) => b[1] - a[1]);
  const dominant_phrase =
    sortedPhrases[0]?.[1] > 2 ? sortedPhrases[0][0] : undefined;

  // Composite cleanliness: penalise repetition and silence
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

// ============================================================================
// Synthesis Cleaner
// ============================================================================

export interface CleanedTranscript {
  segments: TranscriptSegment[];
  removedCount: number;
  qualityMetrics: TranscriptQualityMetrics;
}

/**
 * Clean a raw transcript for use in synthesis prompts.
 * Does NOT modify the stored records — operates on in-memory copies.
 *
 * Rules applied in order:
 *   1. Strip silence / noise tokens (< MIN_MEANINGFUL_LENGTH chars)
 *   2. Remove adjacent near-duplicate segments (word overlap > SIMILARITY_THRESHOLD)
 *   3. Collapse runs of the same phrase into a single occurrence with a note
 */
export function cleanForSynthesis(
  rawSegments: TranscriptSegment[]
): CleanedTranscript {
  const qualityMetrics = computeQualityMetrics(rawSegments);
  const originalCount = rawSegments.length;

  let cleaned = rawSegments.filter(
    seg => seg.text.trim().length >= MIN_MEANINGFUL_LENGTH
  );

  // Deduplicate adjacent near-identical segments
  const deduped: TranscriptSegment[] = [];
  let runCount = 1;
  let lastText = '';

  for (const seg of cleaned) {
    const sim = wordOverlap(seg.text, lastText);

    if (sim >= SIMILARITY_THRESHOLD) {
      // Still in a repetition run — don't add
      runCount++;
    } else {
      // If we just ended a long run, annotate
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

  // Handle trailing run
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

// ============================================================================
// Metadata Header for Prompts
// ============================================================================

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
