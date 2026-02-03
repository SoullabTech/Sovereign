/**
 * Conversation Mode Tests
 *
 * Guards against regression in mode normalization and relationship predicates.
 * These are critical for W_REL_EMPTY filtering and tier-aware behavior.
 *
 * @module lib/api/__tests__/conversationMode
 */

import {
  normalizeConversationMode,
  isRelationshipMode,
  assertNeverConversationMode,
  CONVERSATION_MODES,
  type ConversationMode,
} from '../conversationMode';

describe('normalizeConversationMode', () => {
  // ==========================================================================
  // CLIENT LEGACY NAMES → INTERNAL NAMES
  // ==========================================================================

  it('maps "normal" to "dialogue"', () => {
    expect(normalizeConversationMode('normal')).toBe('dialogue');
  });

  it('maps "patient" to "counsel"', () => {
    expect(normalizeConversationMode('patient')).toBe('counsel');
  });

  it('maps "session" to "scribe"', () => {
    expect(normalizeConversationMode('session')).toBe('scribe');
  });

  // ==========================================================================
  // ALREADY NORMALIZED → PASS THROUGH
  // ==========================================================================

  it('passes through "dialogue" unchanged', () => {
    expect(normalizeConversationMode('dialogue')).toBe('dialogue');
  });

  it('passes through "counsel" unchanged', () => {
    expect(normalizeConversationMode('counsel')).toBe('counsel');
  });

  it('passes through "scribe" unchanged', () => {
    expect(normalizeConversationMode('scribe')).toBe('scribe');
  });

  // ==========================================================================
  // EDGE CASES → DEFAULT TO DIALOGUE
  // ==========================================================================

  it('defaults undefined to "dialogue"', () => {
    expect(normalizeConversationMode(undefined)).toBe('dialogue');
  });

  it('defaults null to "dialogue"', () => {
    expect(normalizeConversationMode(null)).toBe('dialogue');
  });

  it('defaults empty string to "dialogue"', () => {
    expect(normalizeConversationMode('')).toBe('dialogue');
  });

  it('defaults unrecognized string to "dialogue"', () => {
    expect(normalizeConversationMode('coach')).toBe('dialogue');
    expect(normalizeConversationMode('unknown')).toBe('dialogue');
    expect(normalizeConversationMode('DIALOGUE')).toBe('dialogue'); // case-sensitive
  });

  // ==========================================================================
  // TYPE SAFETY: Return type is always ConversationMode
  // ==========================================================================

  it('always returns a valid ConversationMode', () => {
    const inputs: (string | null | undefined)[] = [
      'normal', 'patient', 'session',
      'dialogue', 'counsel', 'scribe',
      undefined, null, '', 'garbage',
    ];

    for (const input of inputs) {
      const result = normalizeConversationMode(input);
      expect(CONVERSATION_MODES).toContain(result);
    }
  });
});

describe('isRelationshipMode', () => {
  // ==========================================================================
  // RELATIONSHIP-EXPECTING MODES
  // ==========================================================================

  it('returns true for "counsel" (Care mode)', () => {
    expect(isRelationshipMode('counsel')).toBe(true);
  });

  // ==========================================================================
  // NON-RELATIONSHIP MODES
  // ==========================================================================

  it('returns false for "dialogue" (Talk mode)', () => {
    expect(isRelationshipMode('dialogue')).toBe(false);
  });

  it('returns false for "scribe" (Note mode)', () => {
    expect(isRelationshipMode('scribe')).toBe(false);
  });

  // ==========================================================================
  // BUSINESS INVARIANT: Only counsel expects relationship context
  // ==========================================================================
  // This is the "canary" test. If someone changes which modes are relationship-
  // bearing, this test MUST be updated intentionally — not silently.

  it.each([
    ['dialogue', false],
    ['counsel', true],
    ['scribe', false],
  ] as const)('mode "%s" → relationship-bearing: %s', (mode, expected) => {
    expect(isRelationshipMode(mode)).toBe(expected);
  });

  // ==========================================================================
  // EXHAUSTIVE: All ConversationModes must be handled
  // ==========================================================================

  it('handles all defined ConversationModes without throwing', () => {
    for (const mode of CONVERSATION_MODES) {
      expect(() => isRelationshipMode(mode)).not.toThrow();
    }
  });
});

describe('assertNeverConversationMode', () => {
  it('throws with greppable error code for unexpected values', () => {
    // Force a value past the type system to test runtime guard
    const badValue = 'coach' as unknown as never;

    expect(() => assertNeverConversationMode(badValue)).toThrow(
      '[E_INVARIANT_CONVERSATION_MODE]'
    );
  });

  it('includes the unexpected value in the error message', () => {
    const badValue = 'mystery' as unknown as never;

    expect(() => assertNeverConversationMode(badValue)).toThrow(
      '"mystery"'
    );
  });
});

describe('CONVERSATION_MODES constant', () => {
  it('contains exactly three modes', () => {
    expect(CONVERSATION_MODES).toHaveLength(3);
  });

  it('contains dialogue, counsel, scribe in that order', () => {
    expect(CONVERSATION_MODES).toEqual(['dialogue', 'counsel', 'scribe']);
  });
});
