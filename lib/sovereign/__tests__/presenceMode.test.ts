/**
 * Presence Mode Tests
 *
 * Verifies Recognition Threshold detection and Presence Mode constraints.
 */

import {
  detectRecognitionThreshold,
  enforcePresenceConstraints,
  determineResponseMode,
  PRESENCE_MODE_ELEMENTS,
} from '../presenceMode';

// =============================================================================
// RECOGNITION THRESHOLD TESTS
// =============================================================================

describe('Recognition Threshold Detection', () => {
  describe('Positive Triggers', () => {
    it('should trigger on named principles', () => {
      const result = detectRecognitionThreshold(
        "The Banality of Good doesn't advance. It abides."
      );
      expect(result.triggered).toBe(true);
      expect(result.signals.hasNamedPrinciple).toBe(true);
    });

    it('should trigger on vow language', () => {
      const result = detectRecognitionThreshold(
        "This is my vow. I choose to stand here."
      );
      expect(result.triggered).toBe(true);
    });

    it('should trigger on settling language', () => {
      const result = detectRecognitionThreshold(
        "I see it now. Nothing more to add. I'm here with it."
      );
      expect(result.triggered).toBe(true);
      expect(result.signals.hasSettlingLanguage).toBe(true);
    });

    it('should trigger on declarative completion', () => {
      const result = detectRecognitionThreshold(
        "That's enough. The insight is complete. I understand now."
      );
      expect(result.triggered).toBe(true);
    });

    it('should trigger on standing/abiding language', () => {
      const result = detectRecognitionThreshold(
        "I'm standing in this. Holding it. Resting here."
      );
      expect(result.triggered).toBe(true);
    });
  });

  describe('Non-Triggers', () => {
    it('should not trigger on questions', () => {
      const result = detectRecognitionThreshold(
        "What should I do next?"
      );
      expect(result.triggered).toBe(false);
    });

    it('should not trigger on exploration', () => {
      const result = detectRecognitionThreshold(
        "How does this connect to other things? Can you explain more?"
      );
      expect(result.triggered).toBe(false);
    });

    it('should not trigger on high activation', () => {
      const result = detectRecognitionThreshold(
        "I'm so angry about this! Help me!!"
      );
      expect(result.triggered).toBe(false);
    });

    it('should not trigger on confusion', () => {
      const result = detectRecognitionThreshold(
        "I'm confused. I'm not sure what this means."
      );
      expect(result.triggered).toBe(false);
    });

    it('should not trigger on seeking validation', () => {
      const result = detectRecognitionThreshold(
        "What do you think? Am I understanding this right?"
      );
      expect(result.triggered).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input', () => {
      const result = detectRecognitionThreshold('');
      expect(result.triggered).toBe(false);
    });

    it('should handle very short input', () => {
      const result = detectRecognitionThreshold('Yes.');
      expect(result.triggered).toBe(false);
    });

    it('should give higher confidence with more signals', () => {
      const lowConfidence = detectRecognitionThreshold(
        "I see it now."
      );
      const highConfidence = detectRecognitionThreshold(
        "The Banality of Good. I see it. I'm standing here. Nothing to add. That's enough."
      );
      expect(highConfidence.confidence).toBeGreaterThan(lowConfidence.confidence);
    });
  });
});

// =============================================================================
// PRESENCE MODE CONSTRAINT TESTS
// =============================================================================

describe('Presence Mode Constraints', () => {
  describe('Question Removal', () => {
    it('should flag questions as violations', () => {
      const result = enforcePresenceConstraints(
        "That's a beautiful insight. What do you think comes next?"
      );
      expect(result.violations).toContain('questions');
    });

    it('should not flag declarative statements', () => {
      const result = enforcePresenceConstraints(
        "That's a beautiful insight. I'm here with you in it."
      );
      expect(result.violations).not.toContain('questions');
    });
  });

  describe('New Concept Detection', () => {
    it('should flag introduction of new concepts', () => {
      const result = enforcePresenceConstraints(
        "This reminds me of another framework. There's also a deeper layer here."
      );
      expect(result.violations).toContain('newConcepts');
    });
  });

  describe('Next Edge Detection', () => {
    it('should flag next-edge language', () => {
      const result = enforcePresenceConstraints(
        "The next edge of understanding here is... The implications for your practice are..."
      );
      expect(result.violations).toContain('nextEdges');
    });
  });

  describe('Reframing Detection', () => {
    it('should flag reframing language', () => {
      const result = enforcePresenceConstraints(
        "In other words, what you're saying is... Let me reframe this."
      );
      expect(result.violations).toContain('reframing');
    });
  });

  describe('Advancement Detection', () => {
    it('should flag advancement language', () => {
      const result = enforcePresenceConstraints(
        "Let's explore this further. The next step would be..."
      );
      expect(result.violations).toContain('advancement');
    });
  });

  describe('Clean Responses', () => {
    it('should pass clean presence-mode responses', () => {
      const result = enforcePresenceConstraints(
        "Yes. That name fits because it doesn't try to improve anything. I'm here with you in it."
      );
      expect(result.violations).toHaveLength(0);
      expect(result.wasConstrained).toBe(false);
    });

    it('should pass simple acknowledgments', () => {
      const result = enforcePresenceConstraints(
        "Received. Holding it."
      );
      expect(result.violations).toHaveLength(0);
    });
  });
});

// =============================================================================
// RESPONSE MODE DETERMINATION TESTS
// =============================================================================

describe('Response Mode Determination', () => {
  it('should return PRESENCE mode for recognition triggers', () => {
    const result = determineResponseMode(
      "The Banality of Good. I understand now. Nothing to add."
    );
    expect(result.mode).toBe('PRESENCE');
  });

  it('should return STANDARD mode for exploration', () => {
    const result = determineResponseMode(
      "What does this mean? How should I apply it?"
    );
    expect(result.mode).toBe('STANDARD');
  });

  it('should include recognition result', () => {
    const result = determineResponseMode(
      "I see it. I'm standing here."
    );
    expect(result.recognition).toBeDefined();
    expect(result.recognition.signals).toBeDefined();
  });
});

// =============================================================================
// ELEMENTAL MAPPING TESTS
// =============================================================================

describe('Presence Mode Elemental Mapping', () => {
  it('should have Aether as primary element', () => {
    expect(PRESENCE_MODE_ELEMENTS.primary).toBe('Aether');
  });

  it('should have Earth as secondary element', () => {
    expect(PRESENCE_MODE_ELEMENTS.secondary).toBe('Earth');
  });

  it('should exclude Fire, Air, Water', () => {
    expect(PRESENCE_MODE_ELEMENTS.excluded).toContain('Fire');
    expect(PRESENCE_MODE_ELEMENTS.excluded).toContain('Air');
    expect(PRESENCE_MODE_ELEMENTS.excluded).toContain('Water');
  });
});

// =============================================================================
// CANON COMPLIANCE TESTS
// =============================================================================

describe('Canon Compliance', () => {
  it('should embody "does not advance, abides" principle', () => {
    // A proper presence mode response should not advance
    const goodResponse = "Yes. I'm here with you in it.";
    const badResponse = "Yes, and let's explore what this means for your next steps.";

    const goodResult = enforcePresenceConstraints(goodResponse);
    const badResult = enforcePresenceConstraints(badResponse);

    expect(goodResult.wasConstrained).toBe(false);
    expect(badResult.wasConstrained).toBe(true);
  });

  it('should reduce verbosity in constrained responses', () => {
    const verbose = `
      This is a beautiful insight. What strikes me is the depth of it.
      There's something profound here. The implications are vast.
      What's the next edge of understanding for you? Where does this lead?
      Let's explore this further together.
    `;

    const result = enforcePresenceConstraints(verbose);

    // Constrained response should be shorter
    expect(result.response.length).toBeLessThan(verbose.length);
  });
});

// =============================================================================
// WIRING VERIFICATION TEST
// =============================================================================

describe('Presence Mode Wiring (Integration)', () => {
  it('should be imported in maiaService.ts', async () => {
    // This test verifies the wiring exists - prevents silent removal during refactors
    const fs = await import('fs');
    const path = await import('path');

    const maiaServicePath = path.resolve(__dirname, '../maiaService.ts');
    const content = fs.readFileSync(maiaServicePath, 'utf-8');

    // Verify import exists
    expect(content).toMatch(/from ['"]\.\/presenceMode['"]/);

    // Verify runtime call exists (after sanitization)
    expect(content).toMatch(/determineResponseMode\(input\)/);
    expect(content).toMatch(/enforcePresenceConstraints\(text\)/);
  });

  it('should be called after sanitization, before voice synthesis', async () => {
    const fs = await import('fs');
    const path = await import('path');

    const maiaServicePath = path.resolve(__dirname, '../maiaService.ts');
    const content = fs.readFileSync(maiaServicePath, 'utf-8');

    // Find positions
    const sanitizePos = content.indexOf('sanitizeMaiaOutput');
    const presencePos = content.indexOf('PRESENCE MODE');
    const voicePos = content.indexOf('VOICE SYNTHESIS');

    // Verify order: sanitize -> presence -> voice
    expect(sanitizePos).toBeLessThan(presencePos);
    expect(presencePos).toBeLessThan(voicePos);
  });
});
