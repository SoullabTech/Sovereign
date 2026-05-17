/**
 * Phase A.2 audio-side tuning — silence-hallucination guard tests.
 *
 * Verifies the upstream rejection of Whisper-fabricated coherent dialogue
 * from silent/low-signal audio, using Whisper's own no_speech_prob signal.
 *
 * Test cases (Kelly, 2026-05-16):
 *   - high no_speech_prob + coherent hallucinated text → reject
 *   - low no_speech_prob + real sentence → allow
 *   - borderline value → follow configured threshold
 *   - no no_speech_prob present → do not break existing flow
 */
import {
  computeAverageNoSpeechProb,
  isSilenceHallucination,
  NO_SPEECH_PROB_THRESHOLD,
} from '../silenceHallucinationGuard';

describe('computeAverageNoSpeechProb', () => {
  it('returns null for undefined segments', () => {
    expect(computeAverageNoSpeechProb(undefined)).toBeNull();
  });

  it('returns null for null segments', () => {
    expect(computeAverageNoSpeechProb(null)).toBeNull();
  });

  it('returns null for empty segments array', () => {
    expect(computeAverageNoSpeechProb([])).toBeNull();
  });

  it('returns null when no segment exposes no_speech_prob', () => {
    expect(
      computeAverageNoSpeechProb([
        { /* no no_speech_prob */ },
        { /* no no_speech_prob */ },
      ]),
    ).toBeNull();
  });

  it('returns the single value when one segment has no_speech_prob', () => {
    expect(computeAverageNoSpeechProb([{ no_speech_prob: 0.8 }])).toBeCloseTo(0.8);
  });

  it('returns the average across multiple segments', () => {
    const avg = computeAverageNoSpeechProb([
      { no_speech_prob: 0.4 },
      { no_speech_prob: 0.6 },
      { no_speech_prob: 0.8 },
    ]);
    expect(avg).toBeCloseTo(0.6);
  });

  it('ignores segments without no_speech_prob and averages only the present ones', () => {
    const avg = computeAverageNoSpeechProb([
      { no_speech_prob: 0.9 },
      { /* missing */ },
      { no_speech_prob: 0.5 },
    ]);
    expect(avg).toBeCloseTo(0.7);
  });

  it('ignores non-finite values (NaN, Infinity)', () => {
    const avg = computeAverageNoSpeechProb([
      { no_speech_prob: 0.5 },
      { no_speech_prob: NaN },
      { no_speech_prob: 0.7 },
    ]);
    expect(avg).toBeCloseTo(0.6);
  });
});

describe('isSilenceHallucination — Kelly\'s four test-gate cases', () => {
  it('case 1: high no_speech_prob + coherent hallucinated text → reject', () => {
    // Whisper produces "What are you guys doing?" from silence, flagging
    // no_speech_prob=0.85. The text looks legitimate but the audio wasn't.
    expect(isSilenceHallucination(0.85)).toBe(true);
  });

  it('case 2: low no_speech_prob + real sentence → allow (do not reject)', () => {
    // Real speech audio: Whisper confident it heard speech (no_speech_prob=0.15).
    expect(isSilenceHallucination(0.15)).toBe(false);
  });

  it('case 3a: borderline at threshold → do not reject (strict >)', () => {
    expect(isSilenceHallucination(NO_SPEECH_PROB_THRESHOLD)).toBe(false);
  });

  it('case 3b: borderline just above threshold → reject', () => {
    expect(isSilenceHallucination(NO_SPEECH_PROB_THRESHOLD + 0.01)).toBe(true);
  });

  it('case 4: no no_speech_prob present (null) → do not break flow, defer to text gate', () => {
    expect(isSilenceHallucination(null)).toBe(false);
  });
});

describe('isSilenceHallucination — threshold override', () => {
  it('respects a custom threshold when provided', () => {
    // With threshold 0.4, a probability of 0.5 should now reject.
    expect(isSilenceHallucination(0.5, 0.4)).toBe(true);
    expect(isSilenceHallucination(0.3, 0.4)).toBe(false);
  });

  it('null input still defers regardless of threshold', () => {
    expect(isSilenceHallucination(null, 0.1)).toBe(false);
  });
});

describe('telemetry-guided tuning (2026-05-16): threshold lowered 0.6 → 0.5', () => {
  // Live production telemetry showed Whisper producing "Thank you very much."
  // (a classic silence-hallucination from training data) with
  // no_speech_prob ≈ 0.549 — just below the prior 0.6 threshold. Lowering
  // to 0.5 catches this family.

  it('rejects "Thank you very much" silence-hallucination at no_speech_prob=0.549', () => {
    expect(isSilenceHallucination(0.549)).toBe(true);
  });

  it('rejects at exactly 0.51 (above new 0.5 threshold)', () => {
    expect(isSilenceHallucination(0.51)).toBe(true);
  });

  it('still accepts low-confidence real speech at no_speech_prob=0.4', () => {
    // Quieter real speech may have nsp around 0.3–0.4. Acceptable region.
    expect(isSilenceHallucination(0.4)).toBe(false);
  });

  it('threshold constant is now 0.5', () => {
    expect(NO_SPEECH_PROB_THRESHOLD).toBe(0.5);
  });
});

describe('integration — Whisper response shape', () => {
  it('end-to-end: hallucinated segments with high no_speech_prob produce a rejection', () => {
    // Simulates the Whisper verbose_json shape the stream handler receives.
    const whisperSegments = [
      { start: 0, end: 2.5, text: "What are you guys doing?", no_speech_prob: 0.85 },
      { start: 2.5, end: 5.0, text: "She doesn't want to come back.", no_speech_prob: 0.78 },
    ];
    const avg = computeAverageNoSpeechProb(whisperSegments);
    expect(avg).not.toBeNull();
    expect(isSilenceHallucination(avg)).toBe(true);
  });

  it('end-to-end: real speech segments with low no_speech_prob are not rejected', () => {
    const whisperSegments = [
      { start: 0, end: 2.5, text: "This is sentence one.", no_speech_prob: 0.12 },
      { start: 2.5, end: 5.0, text: "This is sentence two.", no_speech_prob: 0.18 },
    ];
    const avg = computeAverageNoSpeechProb(whisperSegments);
    expect(avg).not.toBeNull();
    expect(isSilenceHallucination(avg)).toBe(false);
  });

  it('end-to-end: Whisper response without no_speech_prob field defers to text gate', () => {
    const whisperSegments = [
      { start: 0, end: 2.5, text: "Some text", confidence: 0.9 },
      { start: 2.5, end: 5.0, text: "More text", confidence: 0.88 },
    ];
    const avg = computeAverageNoSpeechProb(whisperSegments);
    expect(avg).toBeNull();
    expect(isSilenceHallucination(avg)).toBe(false);
  });
});
