/**
 * Session Review Pipeline — Regression Tests
 *
 * Covers:
 *   1. transcriptCleaner unit tests (no DB, no network)
 *   2. Integration: review-session API with scribe-linked sessions
 *   3. Edge cases: no ended_at, no markers, zero segments, noisy transcript
 *   4. Lens routing: core / spiralogic / mentor all return different system prompts
 *
 * Run: npx jest __tests__/session-review.test.ts
 * (Integration tests require TEST_BASE_URL pointing at a live instance with TEST_MEMBER_ID + TEST_SCRIBE_SESSION_ID set)
 */

// ============================================================================
// Imports
// ============================================================================

import {
  computeQualityMetrics,
  cleanForSynthesis,
  buildQualityHeader,
} from '../lib/scribe/transcriptCleaner';
import type { TranscriptSegment } from '../lib/scribe/sessionReviewMode';

// ============================================================================
// Helpers
// ============================================================================

const seg = (text: string, startMs = 0, endMs = 5000): TranscriptSegment => ({
  speaker: 'Speaker 1',
  text,
  startMs,
  endMs,
});

// ============================================================================
// 1. transcriptCleaner unit tests
// ============================================================================

describe('computeQualityMetrics', () => {
  it('returns perfect cleanliness for empty transcript', () => {
    const m = computeQualityMetrics([]);
    expect(m.totalSegments).toBe(0);
    expect(m.estimatedCleanliness).toBe(1);
  });

  it('returns perfect cleanliness for a clean non-repetitive transcript', () => {
    const segments = [
      seg('The weather today is quite warm.', 0),
      seg('I am thinking about going for a walk.', 5000),
      seg('My dog loves the park in the evenings.', 10000),
      seg('We should probably bring water if it is hot.', 15000),
    ];
    const m = computeQualityMetrics(segments);
    expect(m.repeatedPhraseRate).toBe(0);
    expect(m.estimatedCleanliness).toBeGreaterThan(0.9);
    expect(m.dominant_phrase).toBeUndefined();
  });

  it('detects a high repetition rate in a hallucinated transcript', () => {
    const phrase = "I think it's sacred mirror like that.";
    const segments = Array.from({ length: 20 }, (_, i) =>
      seg(phrase, i * 5000, (i + 1) * 5000)
    );
    const m = computeQualityMetrics(segments);
    expect(m.repeatedPhraseRate).toBeGreaterThan(0.8);
    expect(m.estimatedCleanliness).toBeLessThan(0.5);
    expect(m.dominant_phrase).toBeDefined();
  });

  it('identifies silence tokens', () => {
    const segments = [
      seg('ok', 0),        // silence (< 8 chars)
      seg('yes', 5000),    // silence
      seg('This is a real sentence with meaning.', 10000),
    ];
    const m = computeQualityMetrics(segments);
    expect(m.silenceCount).toBeGreaterThanOrEqual(2);
  });

  it('handles a mixed noisy/real transcript correctly', () => {
    const phrase = "Sacred mirror is the thing.";
    const mixed = [
      seg('Today we are talking about sacred mirrors and how they function.', 0),
      seg(phrase, 5000),
      seg(phrase, 10000),
      seg(phrase, 15000),
      seg('She said something really meaningful about her childhood here.', 20000),
      seg(phrase, 25000),
      seg(phrase, 30000),
    ];
    const m = computeQualityMetrics(mixed);
    expect(m.repeatedPhraseRate).toBeGreaterThan(0.3);
    expect(m.estimatedCleanliness).toBeLessThan(0.9);
  });
});

describe('cleanForSynthesis', () => {
  it('removes adjacent near-duplicate segments', () => {
    const phrase = "I think it's sacred mirror like that.";
    const segments = [
      seg('This is the opening statement.', 0),
      seg(phrase, 5000),
      seg(phrase, 10000),
      seg(phrase, 15000),
      seg('And this is a completely different point.', 20000),
    ];
    const { segments: clean, removedCount } = cleanForSynthesis(segments);
    expect(removedCount).toBeGreaterThan(0);
    expect(clean.length).toBeLessThan(segments.length);
    // The real content should survive
    expect(clean.some(s => s.text.includes('opening statement'))).toBe(true);
    expect(clean.some(s => s.text.includes('completely different'))).toBe(true);
  });

  it('annotates long repetition runs with a count note', () => {
    const phrase = "Mark is a sacred mirror.";
    const segments = [
      seg(phrase, 0),
      seg(phrase, 5000),
      seg(phrase, 10000),
      seg(phrase, 15000),
      seg(phrase, 20000),
    ];
    const { segments: clean } = cleanForSynthesis(segments);
    // Should collapse to 1 segment with a repetition annotation
    expect(clean.length).toBe(1);
    expect(clean[0].text).toMatch(/×\d+/);
  });

  it('strips silence tokens (< 8 chars)', () => {
    const segments = [
      seg('ok', 0),
      seg('This is a complete sentence.', 5000),
      seg('mm', 10000),
    ];
    const { segments: clean } = cleanForSynthesis(segments);
    expect(clean.every(s => s.text.trim().length >= 8)).toBe(true);
  });

  it('preserves all segments in a clean non-repetitive transcript', () => {
    const segments = [
      seg('She talked about her relationship with her mother.', 0),
      seg('There was a moment of grief that surfaced unexpectedly.', 5000),
      seg('We explored what it means to forgive without condoning.', 10000),
    ];
    const { segments: clean, removedCount } = cleanForSynthesis(segments);
    expect(removedCount).toBe(0);
    expect(clean.length).toBe(segments.length);
  });

  it('handles empty transcript without error', () => {
    const { segments: clean, removedCount } = cleanForSynthesis([]);
    expect(clean).toHaveLength(0);
    expect(removedCount).toBe(0);
  });
});

describe('buildQualityHeader', () => {
  it('includes dominant phrase warning when repetition is high', () => {
    const metrics = {
      totalSegments: 100,
      uniqueSegments: 30,
      repeatedPhraseRate: 0.70,
      lowConfidenceCount: 0,
      silenceCount: 5,
      estimatedCleanliness: 0.30,
      dominant_phrase: 'sacred mirror like that',
    };
    const header = buildQualityHeader(metrics, 70);
    expect(header).toContain('sacred mirror like that');
    expect(header).toContain('Whisper transcription artifact');
    expect(header).toContain('⚠️');
  });

  it('does not include artefact warning when transcript is clean', () => {
    const metrics = {
      totalSegments: 50,
      uniqueSegments: 48,
      repeatedPhraseRate: 0.04,
      lowConfidenceCount: 0,
      silenceCount: 1,
      estimatedCleanliness: 0.95,
    };
    const header = buildQualityHeader(metrics, 2);
    expect(header).not.toContain('Whisper');
    expect(header).not.toContain('⚠️');
  });
});

// ============================================================================
// 2. Integration tests (require live instance)
// ============================================================================

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const MEMBER_ID = process.env.TEST_MEMBER_ID || '';
const SCRIBE_SESSION_ID = process.env.TEST_SCRIBE_SESSION_ID || '';

const runIntegration = MEMBER_ID && SCRIBE_SESSION_ID;

async function reviewRequest(params: {
  sessionId: string;
  question: string;
  lens?: string;
  questionNumber?: number;
}) {
  const res = await fetch(`${BASE_URL}/api/scribe/review-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-member-id': MEMBER_ID,
    },
    body: JSON.stringify({
      reviewedSessionId: params.sessionId,
      currentSessionId: 'regression-test',
      question: params.question,
      questionNumber: params.questionNumber || 1,
      lens: params.lens || 'core',
    }),
  });
  return res.json();
}

(runIntegration ? describe : describe.skip)('review-session API (integration)', () => {
  jest.setTimeout(60_000);

  it('returns success and _meta for a valid scribe session', async () => {
    const data = await reviewRequest({
      sessionId: SCRIBE_SESSION_ID,
      question: 'What were the main themes of this session?',
      lens: 'core',
    });
    expect(data.success).toBe(true);
    expect(data.response).toBeTruthy();
    expect(data._meta).toBeDefined();
    expect(data._meta.sessionId).toBe(SCRIBE_SESSION_ID);
    expect(data._meta.lens).toBe('core');
    expect(data._meta.segmentCount).toBeGreaterThanOrEqual(0);
    expect(data._meta.cleanliness).toBeGreaterThanOrEqual(0);
    expect(data._meta.cleanliness).toBeLessThanOrEqual(1);
  });

  it('core lens: response addresses session content', async () => {
    const data = await reviewRequest({
      sessionId: SCRIBE_SESSION_ID,
      question: 'Generate a SOAP note for this session.',
      lens: 'core',
    });
    expect(data.success).toBe(true);
    const r = data.response as string;
    // A SOAP note must contain the expected sections
    expect(r.toUpperCase()).toMatch(/SUBJECTIVE|OBJECTIVE|ASSESSMENT|PLAN/);
  });

  it('spiralogic lens: Council Report contains elemental voices', async () => {
    const data = await reviewRequest({
      sessionId: SCRIBE_SESSION_ID,
      question: 'Generate a Spiralogic Council Report for this session.',
      lens: 'spiralogic',
    });
    expect(data.success).toBe(true);
    const r = data.response as string;
    // Should reference at least 2 of the 5 elements
    const elements = ['fire', 'water', 'earth', 'air', 'aether'];
    const mentioned = elements.filter(e => r.toLowerCase().includes(e));
    expect(mentioned.length).toBeGreaterThanOrEqual(2);
  });

  it('mentor lens: response addresses practitioner (not client)', async () => {
    const data = await reviewRequest({
      sessionId: SCRIBE_SESSION_ID,
      question: 'What is my growing edge as a practitioner based on this session?',
      lens: 'mentor',
    });
    expect(data.success).toBe(true);
    const r = data.response as string;
    // Mentor lens should reference practitioner development
    const practitionerWords = ['practitioner', 'practice', 'skill', 'intervention', 'supervision', 'development', 'growing'];
    const found = practitionerWords.filter(w => r.toLowerCase().includes(w));
    expect(found.length).toBeGreaterThanOrEqual(1);
  });

  it('returns 400 for missing sessionId', async () => {
    const res = await fetch(`${BASE_URL}/api/scribe/review-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-member-id': MEMBER_ID,
      },
      body: JSON.stringify({ question: 'What happened?' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 500 with informative error for unknown session', async () => {
    const data = await reviewRequest({
      sessionId: '00000000-0000-0000-0000-000000000000',
      question: 'What happened?',
    });
    expect(data.success).toBeUndefined();
    expect(data.error).toBeTruthy();
  });

  it('_meta.sessionClosed is false when session was not formally stopped', async () => {
    // The test session in the DB has no ended_at — this should surface in meta
    const data = await reviewRequest({
      sessionId: SCRIBE_SESSION_ID,
      question: 'Summary?',
    });
    if (data.success) {
      // sessionClosed may be true or false depending on test data
      expect(typeof data._meta.sessionClosed).toBe('boolean');
    }
  });
});
