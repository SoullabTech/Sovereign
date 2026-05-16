/**
 * lib/supervision/silenceHallucinationGuard.ts
 *
 * Phase A.2 audio-side tuning (2026-05-16).
 *
 * Whisper hallucinates coherent conversational speech from silence and
 * low-signal audio. Text-side heuristics (filler denylist, internal-
 * repetition detection) cannot reliably reject these — once the model
 * fabricates grammatical English, lexical signal is gone.
 *
 * Whisper itself flags this in verbose_json output via `no_speech_prob`
 * per segment. This module reads that field and rejects chunks Whisper
 * already considers silence-like, before any candidate enters the
 * text-side segment gate.
 *
 * Kelly (2026-05-16): "This is not a redesign. It is the missing upstream
 * signal for the existing gate."
 *
 * Canon: extension of *no artifact persists unless uniquely produced by
 * new participation* — Whisper's own no_speech_prob is the most direct
 * available signal that no participation occurred.
 */

/**
 * Threshold above which a chunk is presumed silence-hallucination.
 * Whisper convention: > 0.6 indicates the model believes the audio
 * contains no speech. Tunable per the canonical plan.
 */
export const NO_SPEECH_PROB_THRESHOLD = 0.6;

interface SegmentWithNoSpeechProb {
  no_speech_prob?: number;
}

/**
 * Compute the average no_speech_prob across Whisper segments.
 * Returns null when no segment exposes the field — caller must then
 * fall back to text-side gating (do not break the flow).
 */
export function computeAverageNoSpeechProb(
  segments: SegmentWithNoSpeechProb[] | undefined | null,
): number | null {
  if (!segments || segments.length === 0) return null;
  const probs = segments
    .map((s) => s.no_speech_prob)
    .filter((p): p is number => typeof p === 'number' && Number.isFinite(p));
  if (probs.length === 0) return null;
  return probs.reduce((sum, p) => sum + p, 0) / probs.length;
}

/**
 * Decide whether a candidate transcript chunk should be rejected as a
 * silence hallucination based on Whisper's no-speech probability.
 *
 * - null (Whisper didn't expose the field): return false → defer to text gate.
 * - above threshold: return true → reject before reaching the text gate.
 * - at or below threshold: return false → allow text-side evaluation.
 */
export function isSilenceHallucination(
  averageNoSpeechProb: number | null,
  threshold: number = NO_SPEECH_PROB_THRESHOLD,
): boolean {
  if (averageNoSpeechProb === null) return false;
  return averageNoSpeechProb > threshold;
}
