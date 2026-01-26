/**
 * TTS Adapter Tests — Sovereignty Invariants
 *
 * The adapter must NEVER change meaning; only pacing/format.
 * These tests ensure prosody shaping doesn't corrupt MAIA's words.
 */

import {
  applyProsodyToText,
  mapProsodyToSpeed,
  applyFullProsody,
} from '../ttsAdapter';
import type { ProsodyHints } from '@/src/types/voice';

// ─────────────────────────────────────────────────────────────────────────────
// Test Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract semantic content: letters, digits, and word boundaries.
 * Ignores whitespace variations and allowed punctuation shaping.
 */
function extractWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[…—]/g, ' ') // Treat shaping punctuation as whitespace
    .replace(/[.!?,;:'"]+/g, '') // Strip all punctuation from words
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

/**
 * Assert that shaping didn't change the actual words.
 * Allows: whitespace, punctuation, "Okay." lead-in for ritual.
 */
function assertSameWords(
  original: string,
  shaped: string,
  allowedAdditions: string[] = []
): void {
  const originalWords = extractWords(original);
  let shapedWords = extractWords(shaped);

  // Remove allowed additions (like "Okay" for ritual)
  for (const addition of allowedAdditions) {
    const idx = shapedWords.indexOf(addition.toLowerCase());
    if (idx !== -1) {
      shapedWords = [...shapedWords.slice(0, idx), ...shapedWords.slice(idx + 1)];
    }
  }

  expect(shapedWords).toEqual(originalWords);
}

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

const neutralHints: ProsodyHints = {
  energy: 'neutral',
  warmth: 'neutral',
  pace: 'normal',
  clarity: 'normal',
  emphasis: 'none',
  pauseMs: { beforeSentence: 40, afterSentence: 60 },
};

const expressiveHints: ProsodyHints = {
  energy: 'calm',
  warmth: 'warm',
  pace: 'normal',
  clarity: 'normal',
  emphasis: 'selective',
  pauseMs: { beforeSentence: 80, afterSentence: 180 },
};

const ceremonialHints: ProsodyHints = {
  energy: 'grounded',
  warmth: 'very_warm',
  pace: 'slow',
  clarity: 'soft',
  emphasis: 'strong',
  pauseMs: { beforeSentence: 200, afterSentence: 500 },
  intentTag: 'ritual',
};

const regulateHints: ProsodyHints = {
  energy: 'grounded',
  warmth: 'warm',
  pace: 'slow',
  clarity: 'soft',
  emphasis: 'none',
  pauseMs: { beforeSentence: 100, afterSentence: 240 },
  intentTag: 'regulate',
};

// ─────────────────────────────────────────────────────────────────────────────
// Core Invariant: No Semantic Change
// ─────────────────────────────────────────────────────────────────────────────

describe('ttsAdapter sovereignty', () => {
  describe('applyProsodyToText preserves meaning', () => {
    const testPhrases = [
      'Hello.',
      'I hear you.',
      'That sounds difficult, but you handled it well.',
      'Take a breath. Feel your feet on the ground. Notice what arises.',
      'The work you are doing matters.',
    ];

    it('neutral hints: no word changes', () => {
      for (const phrase of testPhrases) {
        const shaped = applyProsodyToText(phrase, neutralHints);
        assertSameWords(phrase, shaped);
      }
    });

    it('expressive hints: no word changes', () => {
      for (const phrase of testPhrases) {
        const shaped = applyProsodyToText(phrase, expressiveHints);
        assertSameWords(phrase, shaped);
      }
    });

    it('ceremonial hints: no word changes (except allowed "Okay" lead-in)', () => {
      for (const phrase of testPhrases) {
        const shaped = applyProsodyToText(phrase, ceremonialHints);
        assertSameWords(phrase, shaped, ['okay']);
      }
    });

    it('regulate hints: no word changes', () => {
      for (const phrase of testPhrases) {
        const shaped = applyProsodyToText(phrase, regulateHints);
        assertSameWords(phrase, shaped);
      }
    });
  });

  describe('guardrails prevent over-shaping', () => {
    it('caps consecutive newlines at 2', () => {
      const hints: ProsodyHints = {
        ...ceremonialHints,
        pauseMs: { beforeSentence: 200, afterSentence: 500 },
      };
      const input = 'First sentence. Second sentence. Third sentence.';
      const shaped = applyProsodyToText(input, hints);
      expect(shaped).not.toMatch(/\n{3,}/);
    });

    it('does not double lead-in if text starts with conversational opener', () => {
      const input = 'Okay, let me think about that.';
      const shaped = applyProsodyToText(input, ceremonialHints);
      // Should not have "Okay.\nOkay,"
      expect(shaped.match(/okay/gi)?.length ?? 0).toBeLessThanOrEqual(1);
    });

    it('does not add lead-in for very short text', () => {
      const input = 'I see.';
      const shaped = applyProsodyToText(input, ceremonialHints);
      // Short text (<80 chars) should not get "Okay.\n" prefix
      expect(shaped).not.toMatch(/^Okay\.\n/);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Speed Bounds
// ─────────────────────────────────────────────────────────────────────────────

describe('mapProsodyToSpeed bounds', () => {
  const baseSpeed = 0.95;

  it('stays within reasonable bounds for all hint combinations', () => {
    const allHints = [neutralHints, expressiveHints, ceremonialHints, regulateHints];

    for (const hints of allHints) {
      const speed = mapProsodyToSpeed(baseSpeed, hints);
      expect(speed).toBeGreaterThanOrEqual(0.8);
      expect(speed).toBeLessThanOrEqual(1.1);
    }
  });

  it('ritual intent slows down', () => {
    const speed = mapProsodyToSpeed(baseSpeed, ceremonialHints);
    expect(speed).toBeLessThan(baseSpeed);
  });

  it('regulate intent slows down', () => {
    const speed = mapProsodyToSpeed(baseSpeed, regulateHints);
    expect(speed).toBeLessThan(baseSpeed);
  });

  it('brisk pace speeds up (within bounds)', () => {
    const briskHints: ProsodyHints = { ...neutralHints, pace: 'brisk' };
    const speed = mapProsodyToSpeed(baseSpeed, briskHints);
    expect(speed).toBeGreaterThan(baseSpeed);
    expect(speed).toBeLessThanOrEqual(1.08);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Full Pipeline
// ─────────────────────────────────────────────────────────────────────────────

describe('applyFullProsody', () => {
  it('returns shaped text, adjusted speed, and null SSML (no provider support)', () => {
    const result = applyFullProsody(
      'Take a moment. Breathe.',
      0.95,
      ceremonialHints
    );

    expect(result.text).toBeDefined();
    expect(typeof result.speed).toBe('number');
    expect(result.ssml).toBeNull(); // No SSML provider yet
  });

  it('preserves meaning through full pipeline', () => {
    const original = 'The truth is, you already know what you need.';
    const result = applyFullProsody(original, 0.95, ceremonialHints);
    assertSameWords(original, result.text, ['okay']);
  });
});
