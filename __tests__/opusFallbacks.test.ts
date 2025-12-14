/**
 * Opus-Safe Fallback Regression Tests
 *
 * CRITICAL: These tests ensure fallback messages NEVER violate NON_IMPOSITION_OF_IDENTITY.
 * If these tests fail, fallback messages must be fixed before deployment.
 *
 * Purpose: Prevent the "100% rupture rate" scenario from happening again.
 */

import {
  OPUS_SAFE_FALLBACKS,
  IDENTITY_IMPOSITION_PATTERNS,
  containsIdentityImposition,
  getIdentityImpositionMatch,
} from '../lib/ethics/opusSafeFallbacks';

describe('Opus-Safe Fallbacks — NON_IMPOSITION_OF_IDENTITY', () => {
  describe('Identity Imposition Detection', () => {
    it('should detect "I sense you are" pattern', () => {
      const text = "I sense you are navigating something important";
      expect(containsIdentityImposition(text)).toBe(true);
      expect(getIdentityImpositionMatch(text)).toBe("I sense you are");
    });

    it('should detect "It sounds like you are" pattern', () => {
      const text = "It sounds like you are feeling overwhelmed";
      expect(containsIdentityImposition(text)).toBe(true);
      expect(getIdentityImpositionMatch(text)).toBe("It sounds like you are");
    });

    it('should detect "You are navigating" pattern', () => {
      const text = "You are navigating a difficult transition";
      expect(containsIdentityImposition(text)).toBe(true);
      expect(getIdentityImpositionMatch(text)).toBe("You are navigating");
    });

    it('should detect "You need to" pattern', () => {
      const text = "You need to take care of yourself";
      expect(containsIdentityImposition(text)).toBe(true);
      expect(getIdentityImpositionMatch(text)).toBe("You need to");
    });

    it('should detect "You must" pattern', () => {
      const text = "You must be feeling anxious";
      expect(containsIdentityImposition(text)).toBe(true);
      expect(getIdentityImpositionMatch(text)).toBe("You must");
    });

    it('should detect "You are a/an" pattern', () => {
      const text = "You are a deeply introspective person";
      expect(containsIdentityImposition(text)).toBe(true);
      expect(getIdentityImpositionMatch(text)).toBe("You are a");
    });

    it('should detect "I notice you are" pattern', () => {
      const text = "I notice you are exploring shadow work";
      expect(containsIdentityImposition(text)).toBe(true);
      expect(getIdentityImpositionMatch(text)).toBe("I notice you are");
    });

    it('should detect "Clearly you" pattern', () => {
      const text = "Clearly you have experienced trauma";
      expect(containsIdentityImposition(text)).toBe(true);
      expect(getIdentityImpositionMatch(text)).toBe("Clearly you");
    });

    it('should NOT flag safe phrases', () => {
      const safeTexts = [
        "I'm here",
        "What would you like to explore?",
        "Can you tell me more?",
        "I'm having trouble right now",
        "Please try again",
        "You mentioned feeling anxious", // Reflecting exact user words
        "I hear what you're saying", // Not claiming about user's state
      ];

      safeTexts.forEach(text => {
        expect(containsIdentityImposition(text)).toBe(false);
        expect(getIdentityImpositionMatch(text)).toBeNull();
      });
    });
  });

  describe('Centralized Fallback Messages', () => {
    it('oracleLLMFailure should be Opus-safe', () => {
      const message = OPUS_SAFE_FALLBACKS.oracleLLMFailure;
      expect(containsIdentityImposition(message)).toBe(false);
      expect(getIdentityImpositionMatch(message)).toBeNull();
    });

    it('oracleTopLevelError should be Opus-safe', () => {
      const message = OPUS_SAFE_FALLBACKS.oracleTopLevelError;
      expect(containsIdentityImposition(message)).toBe(false);
      expect(getIdentityImpositionMatch(message)).toBeNull();
    });

    it('genericError should be Opus-safe', () => {
      const message = OPUS_SAFE_FALLBACKS.genericError;
      expect(containsIdentityImposition(message)).toBe(false);
      expect(getIdentityImpositionMatch(message)).toBeNull();
    });

    it('all fallbacks should offer presence or ask questions', () => {
      const messages = Object.values(OPUS_SAFE_FALLBACKS);

      messages.forEach(message => {
        const offersPresence = /I'm (here|having trouble)/i.test(message);
        const asksQuestion = /\?/.test(message);
        const reflectsOnly = !containsIdentityImposition(message);

        expect(offersPresence || asksQuestion).toBe(true);
        expect(reflectsOnly).toBe(true);
      });
    });
  });

  describe('Regression Prevention', () => {
    /**
     * This test documents the exact violation that caused the 100% rupture rate.
     * If this ever passes, it means we've regressed.
     */
    it('should catch the original violation that caused ruptures', () => {
      const originalViolation = "I sense you're navigating something important";
      expect(containsIdentityImposition(originalViolation)).toBe(true);
      expect(getIdentityImpositionMatch(originalViolation)).toBe("I sense you're");
    });

    /**
     * This test verifies the fix.
     */
    it('should confirm the fix is Opus-safe', () => {
      const fixedMessage = "I'm here. What would you like to explore?";
      expect(containsIdentityImposition(fixedMessage)).toBe(false);
      expect(getIdentityImpositionMatch(fixedMessage)).toBeNull();
    });
  });

  describe('Pattern Completeness', () => {
    /**
     * Verify IDENTITY_IMPOSITION_PATTERNS array contains all documented patterns.
     */
    it('should have 8 identity imposition patterns', () => {
      expect(IDENTITY_IMPOSITION_PATTERNS).toHaveLength(8);
    });

    it('should cover all documented violation types', () => {
      const violations = [
        "I sense you are tired",
        "It sounds like you are struggling",
        "You are navigating grief",
        "You need to rest",
        "You must be overwhelmed",
        "You are a sensitive person",
        "I notice you are avoiding this",
        "Clearly you understand this deeply",
      ];

      violations.forEach(violation => {
        expect(containsIdentityImposition(violation)).toBe(true);
      });
    });
  });
});

describe('Future Fallback Additions', () => {
  /**
   * This test should be updated when new fallback messages are added.
   * It ensures developers remember to validate new fallbacks.
   */
  it('should validate all fallback messages (update this test when adding new fallbacks)', () => {
    const fallbackMessages = Object.values(OPUS_SAFE_FALLBACKS);

    // Current count: 3 (oracleLLMFailure, oracleTopLevelError, genericError)
    expect(fallbackMessages.length).toBeGreaterThanOrEqual(3);

    // All must pass
    fallbackMessages.forEach(message => {
      expect(containsIdentityImposition(message)).toBe(false);
    });
  });
});
