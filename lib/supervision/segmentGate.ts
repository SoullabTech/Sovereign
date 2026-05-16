/**
 * lib/supervision/segmentGate.ts
 *
 * Phase A.2 — Segment Integrity gate.
 *
 * Sits between Whisper output (candidate text) and persistence (transcript
 * segment). A transcript segment must correspond to a plausible utterance
 * boundary, not to MediaRecorder cadence. The gate holds candidates until
 * a finalization signal is detected.
 *
 * Architecture (Kelly, 2026-05-16):
 *   Raw chunk → Candidate text → Segment gate → Transcript segment → Turn assembly
 *
 * The candidate buffer is non-persisted, per-session, in Node process memory.
 * A server restart loses pending candidates. This is acceptable: they were
 * not persisted yet, and the next real utterance arrives via a fresh chunk.
 *
 * Canon: `project_continuity_field_integrity.md` — three-layer rule, absence
 * integrity. The gate is one more expression of *no artifact persists unless
 * uniquely produced by new participation* — extended from source integrity
 * (Phase A.1) to conversational-boundary integrity (Phase A.2).
 */

// ---------------------------------------------------------------------------
// Tuning constants — start permissive, refine experimentally
// ---------------------------------------------------------------------------

/** Silence-gate threshold. Kelly's range: 1500–2500ms. Start at 2000ms. */
const SILENCE_GATE_MS = 2000;

/** Below this char count, treat as filler/noise unless context says otherwise. */
const MIN_INFORMATIONAL_LENGTH = 8;

/** Word-overlap threshold for candidate-repetition detection. */
const REPETITION_OVERLAP_THRESHOLD = 0.70;

/** Filler tokens that should not promote to segments unless contextually anchored. */
const FILLER_DENYLIST = new Set([
  'yeah',
  'mm',
  'mhm',
  'mmm',
  'mm-hmm',
  'mmhmm',
  'uh-huh',
  'uhhuh',
  // Phase A.2 tuning (2026-05-16): "all" added so hallucinated "All right.
  // All right." patterns (Whisper fabrications during silence — not user
  // speech) are discarded before becoming transcript segments. Without "all"
  // in the per-token denylist, mixed multi-word hallucinations like "All
  // right." split into ["all", "right"] and pass tokens.every().
  'all',
  'all right',
  'alright',
  'okay',
  'ok',
  'right',
  'thanks',
  'thank you',
]);

/**
 * Hallucination suppression — autoregressive drift threshold.
 * Kelly (2026-05-16, post-A.2 deploy): "It's now a bit of a bit of a bit..." is
 * not user speech. It is a Whisper fabrication produced during silence/low-signal
 * audio via low-confidence token continuation. Reject candidates with low
 * unique-word ratio when long enough for the signal to be meaningful — short
 * normal phrases like "I really really love this" are not punished.
 *
 * Per the canonical principle: these phrases are not content to clean up; they
 * are fabricated speech to block before they become transcript segments.
 */
const INTERNAL_REPETITION_UNIQUE_RATIO = 0.3;
const INTERNAL_REPETITION_MIN_TOKENS = 8;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CandidateState =
  | 'ACTIVE'
  | 'CONTINUING'
  | 'FINALIZING'
  | 'FINALIZED'
  | 'DISCARDED';

export interface CandidateSegment {
  text: string;
  startedAt: number;
  updatedAt: number;
  chunkCount: number;
  state: CandidateState;
  /** chunk indices that contributed to this candidate */
  chunkIndices: number[];
  /** ms offset within the session for the first chunk that opened this candidate */
  startMs: number;
  /** ms offset within the session for the latest chunk that contributed */
  endMs: number;
  speaker: string;
}

export interface SegmentDecision {
  /** Finalize and persist `finalText`. */
  shouldFinalize: boolean;
  /** Discard the candidate text — neither buffer nor persist. */
  shouldDiscard: boolean;
  /** Reason code, for logging/telemetry. */
  reason: string;
  /** Text to persist when shouldFinalize is true (may be merged across chunks). */
  finalText?: string;
  /** Session-relative timing for the finalized segment. */
  finalStartMs?: number;
  finalEndMs?: number;
  /** Chunk index attributed to the persisted segment. */
  finalChunkIndex?: number;
  speaker?: string;
}

// ---------------------------------------------------------------------------
// In-memory buffer (per-session)
// ---------------------------------------------------------------------------

const candidateBuffers = new Map<string, CandidateSegment>();

// ---------------------------------------------------------------------------
// Heuristics (deliberately simple — Kelly: "this is not NLP sophistication, this is restraint")
// ---------------------------------------------------------------------------

function normalizeForWordOverlap(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/** Jaccard-style overlap (same shape as transcriptCleaner.wordOverlap). */
function wordOverlap(a: string, b: string): number {
  const wa = normalizeForWordOverlap(a);
  const wb = normalizeForWordOverlap(b);
  if (!wa.length || !wb.length) return 0;
  const setB = new Set(wb);
  const overlap = wa.filter((w) => setB.has(w)).length;
  return overlap / Math.max(wa.length, wb.length);
}

function endsWithSentenceTerminator(text: string): boolean {
  return /[.!?]['")\]\s]*$/.test(text.trim());
}

function isFillerOnly(text: string): boolean {
  const normalized = text
    .toLowerCase()
    .replace(/[^a-z\s-]/g, '')
    .trim();
  if (!normalized) return true;
  if (FILLER_DENYLIST.has(normalized)) return true;
  // Also catch "Yeah. Yeah." / "All right. All right." — repetitions of a filler token
  const tokens = normalized.split(/[.\s]+/).filter(Boolean);
  if (tokens.length > 0 && tokens.every((t) => FILLER_DENYLIST.has(t))) return true;
  return false;
}

function isUltraShort(text: string): boolean {
  return text.trim().length < MIN_INFORMATIONAL_LENGTH;
}

/**
 * Hallucination detector — autoregressive ASR drift with low lexical diversity.
 *
 * Whisper produces candidates like "It's now a bit of a bit of a bit of a bit
 * of a bit of a bit of a bit" during silence/low-signal audio. These are not
 * user speech; they are ASR fabrications via low-confidence token continuation.
 * Reject them before they become transcript segments. (5 unique / 19 total ≈
 * 0.26 → reject.)
 *
 * Gated at INTERNAL_REPETITION_MIN_TOKENS so short emphatic or naturally
 * repeated phrases ("I really really love this", "yes yes yes I will") — which
 * ARE user speech — are not punished.
 */
function hasHighInternalRepetition(text: string): boolean {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length < INTERNAL_REPETITION_MIN_TOKENS) return false;
  const uniqueCount = new Set(tokens).size;
  return uniqueCount / tokens.length < INTERNAL_REPETITION_UNIQUE_RATIO;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface EvaluateInput {
  sessionId: string;
  newText: string;
  chunkIndex: number;
  startMs: number;
  endMs: number;
  speaker: string;
  /** Defaults to Date.now() — injectable for tests. */
  arrivedAt?: number;
}

/**
 * Evaluate a newly arrived Whisper candidate against the per-session buffer.
 *
 * Returns a SegmentDecision telling the caller whether to persist, discard,
 * or hold as candidate. The buffer is mutated as a side effect.
 *
 * Order of checks mirrors Kelly's MVP heuristic order:
 *   1. Repetition suppression
 *   2. Silence gate
 *   3. Semantic completion
 *   5. Filler-loop / minimum density
 * (4 — semantic delta — deferred; overlaps with repetition for MVP)
 */
export function evaluate(input: EvaluateInput): SegmentDecision {
  const arrivedAt = input.arrivedAt ?? Date.now();
  const trimmed = input.newText.trim();
  const existing = candidateBuffers.get(input.sessionId);

  // Heuristic 5 (early gate) — filler-only or ultra-short text cannot itself
  // open a new candidate or be a meaningful continuation.
  const incomingIsFiller =
    isFillerOnly(trimmed) || isUltraShort(trimmed) || hasHighInternalRepetition(trimmed);

  // No prior candidate
  if (!existing) {
    if (incomingIsFiller) {
      return {
        shouldFinalize: false,
        shouldDiscard: true,
        reason: 'incoming-filler-no-candidate',
      };
    }
    // New candidate — buffer; finalize immediately only if already terminator-ended
    candidateBuffers.set(input.sessionId, {
      text: trimmed,
      startedAt: arrivedAt,
      updatedAt: arrivedAt,
      chunkCount: 1,
      state: 'ACTIVE',
      chunkIndices: [input.chunkIndex],
      startMs: input.startMs,
      endMs: input.endMs,
      speaker: input.speaker,
    });
    if (endsWithSentenceTerminator(trimmed)) {
      const finalized = trimmed;
      candidateBuffers.delete(input.sessionId);
      return {
        shouldFinalize: true,
        shouldDiscard: false,
        reason: 'new-candidate-already-complete',
        finalText: finalized,
        finalStartMs: input.startMs,
        finalEndMs: input.endMs,
        finalChunkIndex: input.chunkIndex,
        speaker: input.speaker,
      };
    }
    return {
      shouldFinalize: false,
      shouldDiscard: false,
      reason: 'new-candidate-buffered',
    };
  }

  // Have a prior candidate.

  // Heuristic 2 (silence gate) — if enough wall-clock time has elapsed since
  // the prior candidate's last update, finalize it. Filler/empty incoming
  // counts as a silence signal: no new participation arrived.
  const silenceElapsed = arrivedAt - existing.updatedAt >= SILENCE_GATE_MS;
  if (silenceElapsed || incomingIsFiller) {
    const finalized = existing.text;
    const finalStart = existing.startMs;
    const finalEnd = existing.endMs;
    const finalChunk = existing.chunkIndices[0];
    const finalSpeaker = existing.speaker;

    if (incomingIsFiller) {
      // Drop the filler chunk; finalize the prior candidate if it has substance.
      candidateBuffers.delete(input.sessionId);
      if (isUltraShort(finalized) || isFillerOnly(finalized)) {
        return {
          shouldFinalize: false,
          shouldDiscard: true,
          reason: 'prior-candidate-was-also-filler',
        };
      }
      return {
        shouldFinalize: true,
        shouldDiscard: false,
        reason: 'silence-or-filler-finalizes-prior',
        finalText: finalized,
        finalStartMs: finalStart,
        finalEndMs: finalEnd,
        finalChunkIndex: finalChunk,
        speaker: finalSpeaker,
      };
    }

    // Silence elapsed AND incoming has substance → finalize prior, start new from incoming
    candidateBuffers.set(input.sessionId, {
      text: trimmed,
      startedAt: arrivedAt,
      updatedAt: arrivedAt,
      chunkCount: 1,
      state: 'ACTIVE',
      chunkIndices: [input.chunkIndex],
      startMs: input.startMs,
      endMs: input.endMs,
      speaker: input.speaker,
    });
    return {
      shouldFinalize: true,
      shouldDiscard: false,
      reason: 'silence-finalizes-prior-new-candidate-opens',
      finalText: finalized,
      finalStartMs: finalStart,
      finalEndMs: finalEnd,
      finalChunkIndex: finalChunk,
      speaker: finalSpeaker,
    };
  }

  // Heuristic 1 (repetition suppression) — incoming near-identical to prior candidate.
  if (wordOverlap(trimmed, existing.text) >= REPETITION_OVERLAP_THRESHOLD) {
    existing.updatedAt = arrivedAt;
    existing.chunkCount += 1;
    existing.chunkIndices.push(input.chunkIndex);
    existing.endMs = input.endMs;
    existing.state = 'CONTINUING';
    return {
      shouldFinalize: false,
      shouldDiscard: true,
      reason: 'repetition-of-candidate',
    };
  }

  // Heuristic 3 (semantic completion of prior) — if the prior candidate is
  // already a complete sentence, finalize it and open a new candidate.
  if (endsWithSentenceTerminator(existing.text)) {
    const finalized = existing.text;
    const finalStart = existing.startMs;
    const finalEnd = existing.endMs;
    const finalChunk = existing.chunkIndices[0];
    const finalSpeaker = existing.speaker;

    candidateBuffers.set(input.sessionId, {
      text: trimmed,
      startedAt: arrivedAt,
      updatedAt: arrivedAt,
      chunkCount: 1,
      state: 'ACTIVE',
      chunkIndices: [input.chunkIndex],
      startMs: input.startMs,
      endMs: input.endMs,
      speaker: input.speaker,
    });

    if (endsWithSentenceTerminator(trimmed)) {
      candidateBuffers.delete(input.sessionId);
      return {
        shouldFinalize: true,
        shouldDiscard: false,
        reason: 'two-complete-sentences-finalize-prior-and-new',
        finalText: finalized,
        finalStartMs: finalStart,
        finalEndMs: finalEnd,
        finalChunkIndex: finalChunk,
        speaker: finalSpeaker,
      };
    }
    return {
      shouldFinalize: true,
      shouldDiscard: false,
      reason: 'prior-complete-finalizes-new-opens',
      finalText: finalized,
      finalStartMs: finalStart,
      finalEndMs: finalEnd,
      finalChunkIndex: finalChunk,
      speaker: finalSpeaker,
    };
  }

  // Continuation — extend the existing candidate.
  existing.text = `${existing.text} ${trimmed}`.replace(/\s+/g, ' ').trim();
  existing.updatedAt = arrivedAt;
  existing.chunkCount += 1;
  existing.chunkIndices.push(input.chunkIndex);
  existing.endMs = input.endMs;
  existing.state = 'CONTINUING';

  // If the merged text now ends in a terminator, finalize.
  if (endsWithSentenceTerminator(existing.text)) {
    const finalized = existing.text;
    const finalStart = existing.startMs;
    const finalEnd = existing.endMs;
    const finalChunk = existing.chunkIndices[0];
    const finalSpeaker = existing.speaker;
    candidateBuffers.delete(input.sessionId);
    return {
      shouldFinalize: true,
      shouldDiscard: false,
      reason: 'continuation-completes-sentence',
      finalText: finalized,
      finalStartMs: finalStart,
      finalEndMs: finalEnd,
      finalChunkIndex: finalChunk,
      speaker: finalSpeaker,
    };
  }

  return {
    shouldFinalize: false,
    shouldDiscard: false,
    reason: 'continuing',
  };
}

/**
 * Flush any pending candidate for a session — used when the session ends so
 * an in-flight utterance isn't dropped silently. Returns the candidate that
 * should be persisted (if any).
 */
export function flushPendingCandidate(sessionId: string): SegmentDecision {
  const existing = candidateBuffers.get(sessionId);
  if (!existing) {
    return { shouldFinalize: false, shouldDiscard: false, reason: 'no-pending' };
  }
  candidateBuffers.delete(sessionId);
  if (
    isUltraShort(existing.text) ||
    isFillerOnly(existing.text) ||
    hasHighInternalRepetition(existing.text)
  ) {
    return {
      shouldFinalize: false,
      shouldDiscard: true,
      reason: 'pending-was-filler-on-flush',
    };
  }
  return {
    shouldFinalize: true,
    shouldDiscard: false,
    reason: 'flush-on-session-end',
    finalText: existing.text,
    finalStartMs: existing.startMs,
    finalEndMs: existing.endMs,
    finalChunkIndex: existing.chunkIndices[0],
    speaker: existing.speaker,
  };
}

/** Test/diagnostic helper — never use in request paths. */
export function _peekCandidate(sessionId: string): CandidateSegment | undefined {
  return candidateBuffers.get(sessionId);
}

/** Test helper — clears the buffer. */
export function _resetAllCandidates(): void {
  candidateBuffers.clear();
}
