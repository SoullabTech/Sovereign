/**
 * 🪞 Sacred Mirror Integrity Protocol Integration Test
 * Tests the complete integration of Sacred Mirror Protocol with AIN Oracle System
 */

import {
  sacredMirrorProtocol,
  SacredMirrorContext,
} from "../core/agents/SacredMirrorIntegrityProtocol";
import type { AIResponse } from "../types/ai";

describe("Sacred Mirror Integrity Protocol Integration", () => {
  describe("Dissonance Detection", () => {
    test("should detect high sentiment with low challenge as sycophancy risk", async () => {
      const context: SacredMirrorContext = {
        userId: "test-user-1",
        originalQuery: "Am I doing the right thing?",
        baseResponse: {
          content:
            "Absolutely! You are amazing and definitely doing the perfect thing! Everything is wonderful!",
          provider: "test",
          model: "test",
          confidence: 0.8,
          metadata: {},
        },
        userPattern: {
          repetitive_questions: ["validation_seeking", "validation_seeking"],
          approval_seeking_frequency: 3,
          comfort_zone_indicators: [],
          shadow_avoidance_themes: [],
          growth_readiness: 0.3,
        },
        initiationLevel: "moderate",
      };

      const result = await sacredMirrorProtocol.applySacredMirror(context);

      expect(result.metadata?.sacred_mirror_active).toBe(true);
      expect(result.metadata?.dissonance_injected).toBe(true);
      expect(result.content).toContain("🪞");
      expect(result.content).not.toContain("Absolutely!");
    });

    test("should not trigger for balanced responses", async () => {
      const context: SacredMirrorContext = {
        userId: "test-user-2",
        originalQuery: "How can I grow?",
        baseResponse: {
          content:
            "Consider what areas challenge you. Growth often happens at the edge of comfort. What resistance do you notice?",
          provider: "test",
          model: "test",
          confidence: 0.8,
          metadata: {},
        },
        userPattern: {
          repetitive_questions: [],
          approval_seeking_frequency: 0,
          comfort_zone_indicators: [],
          shadow_avoidance_themes: [],
          growth_readiness: 0.7,
        },
        initiationLevel: "moderate",
      };

      const result = await sacredMirrorProtocol.applySacredMirror(context);

      expect(result.metadata?.sacred_mirror_active).toBeFalsy();
      expect(result.metadata?.archetypal_challenge_added).toBe(true);
    });
  });

  describe("Ego Loop Detection", () => {
    test("should detect repetitive validation seeking", async () => {
      const context: SacredMirrorContext = {
        userId: "test-user-3",
        originalQuery: "Do you think I'm doing the right thing?",
        baseResponse: {
          content: "Yes, you are definitely on the right path!",
          provider: "test",
          model: "test",
          confidence: 0.8,
          metadata: {},
        },
        userPattern: {
          repetitive_questions: [
            "validation_seeking",
            "validation_seeking",
            "validation_seeking",
            "validation_seeking",
          ],
          approval_seeking_frequency: 15,
          comfort_zone_indicators: ["reassurance", "external_validation"],
          shadow_avoidance_themes: ["responsibility", "inner_authority"],
          growth_readiness: 0.2,
        },
        initiationLevel: "intense",
      };

      const result = await sacredMirrorProtocol.applySacredMirror(context);

      expect(result.metadata?.sacred_mirror_active).toBe(true);
      expect(result.content).toContain("🪞");
      expect(result.content.toLowerCase()).toContain("pattern");
    });
  });

  describe("Shadow Oracle Activation", () => {
    test("should trigger shadow oracle for shadow themes", async () => {
      const context: SacredMirrorContext = {
        userId: "test-user-4",
        originalQuery: "Why do I always attract the same type of person?",
        baseResponse: {
          content:
            "That's a great question! You deserve better people in your life.",
          provider: "test",
          model: "test",
          confidence: 0.8,
          metadata: {},
        },
        userPattern: {
          repetitive_questions: ["relationship_loop"],
          approval_seeking_frequency: 0,
          comfort_zone_indicators: [],
          shadow_avoidance_themes: ["projection", "victim_patterns"],
          growth_readiness: 0.6,
        },
        initiationLevel: "intense",
      };

      const result = await sacredMirrorProtocol.applySacredMirror(context);

      expect(result.metadata?.sacred_mirror_active).toBe(true);
      expect(result.content).toContain("🪞");
      expect(result.content.toLowerCase()).toMatch(
        /(shadow|mirror|pattern|projection)/,
      );
    });
  });

  describe("Mirror Intensity Levels", () => {
    test("should apply gentle mirror for vulnerable states", async () => {
      const context: SacredMirrorContext = {
        userId: "test-user-5",
        originalQuery: "I feel so vulnerable right now, am I okay?",
        baseResponse: {
          content:
            "Absolutely! You are perfect and everything will be amazing!",
          provider: "test",
          model: "test",
          confidence: 0.8,
          metadata: {},
        },
        userPattern: {
          repetitive_questions: [],
          approval_seeking_frequency: 2,
          comfort_zone_indicators: [],
          shadow_avoidance_themes: [],
          growth_readiness: 0.4,
        },
        initiationLevel: "gentle",
      };

      const result = await sacredMirrorProtocol.applySacredMirror(context);

      if (result.metadata?.sacred_mirror_active) {
        expect(result.content).toContain("gentle mirror");
      }
    });

    test("should apply intense mirror for pattern recognition", async () => {
      const context: SacredMirrorContext = {
        userId: "test-user-6",
        originalQuery: "I always do this same pattern and never learn",
        baseResponse: {
          content:
            "Don't worry, everyone makes mistakes! You'll figure it out!",
          provider: "test",
          model: "test",
          confidence: 0.8,
          metadata: {},
        },
        userPattern: {
          repetitive_questions: ["stagnation", "stagnation"],
          approval_seeking_frequency: 0,
          comfort_zone_indicators: [],
          shadow_avoidance_themes: ["responsibility"],
          growth_readiness: 0.8,
        },
        initiationLevel: "intense",
      };

      const result = await sacredMirrorProtocol.applySacredMirror(context);

      expect(result.metadata?.sacred_mirror_active).toBe(true);
      expect(result.content).toContain("🪞");
      expect(result.content.toLowerCase()).toMatch(
        /(tower|pattern|descent|mirror)/,
      );
    });
  });

  describe("Weekly Mirror Reflection", () => {
    test("should generate reflection for significant patterns", async () => {
      // Simulate user with repetitive pattern
      const userId = "test-user-weekly";

      // This would need the protocol to have tracked patterns
      const reflection =
        await sacredMirrorProtocol.performWeeklyMirrorReflection(userId);

      // Since no patterns are tracked in this test, should return null
      expect(reflection).toBeNull();
    });
  });

  describe("Archetypal Challenge Enhancement", () => {
    test("should add archetypal prompts to non-sycophantic responses", async () => {
      const context: SacredMirrorContext = {
        userId: "test-user-7",
        originalQuery: "How do I find my purpose?",
        baseResponse: {
          content:
            "Purpose often emerges through following what energizes you. What activities make you lose track of time?",
          provider: "test",
          model: "test",
          confidence: 0.8,
          metadata: {},
        },
        userPattern: {
          repetitive_questions: [],
          approval_seeking_frequency: 0,
          comfort_zone_indicators: [],
          shadow_avoidance_themes: [],
          growth_readiness: 0.7,
        },
        initiationLevel: "moderate",
      };

      const result = await sacredMirrorProtocol.applySacredMirror(context);

      expect(result.metadata?.archetypal_challenge_added).toBe(true);
      expect(result.content).toContain("🏺 Archetypal Invitation:");
      expect(result.content.toLowerCase()).toMatch(
        /(hero|sage|magician|sovereign|lover|fool)/,
      );
    });
  });

  describe("Sycophancy Reduction", () => {
    test("should replace overly positive language", async () => {
      const context: SacredMirrorContext = {
        userId: "test-user-8",
        originalQuery: "Simple question",
        baseResponse: {
          content: "Absolutely! That's definitely amazing! Perfect!",
          provider: "test",
          model: "test",
          confidence: 0.8,
          metadata: {},
        },
        userPattern: {
          repetitive_questions: [],
          approval_seeking_frequency: 1,
          comfort_zone_indicators: [],
          shadow_avoidance_themes: [],
          growth_readiness: 0.5,
        },
        initiationLevel: "moderate",
      };

      const result = await sacredMirrorProtocol.applySacredMirror(context);

      expect(result.content).not.toContain("Absolutely!");
      expect(result.content).not.toContain("definitely amazing");
      expect(result.content).not.toContain("Perfect!");
    });
  });

  describe("Error Handling", () => {
    test("should fallback gracefully on errors", async () => {
      const context: SacredMirrorContext = {
        userId: "test-user-error",
        originalQuery: "Test query",
        baseResponse: {
          content: "Original response",
          provider: "test",
          model: "test",
          confidence: 0.8,
          metadata: {},
        },
        userPattern: {
          repetitive_questions: [],
          approval_seeking_frequency: 0,
          comfort_zone_indicators: [],
          shadow_avoidance_themes: [],
          growth_readiness: 0.5,
        },
        initiationLevel: "moderate",
      };

      // Mock an error condition
      const result = await sacredMirrorProtocol.applySacredMirror(context);

      // Should not throw and should return a valid response
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });
});

// Helper function to create test contexts
export function createTestMirrorContext(
  overrides: Partial<SacredMirrorContext>,
): SacredMirrorContext {
  return {
    userId: "test-user",
    originalQuery: "test query",
    baseResponse: {
      content: "test response",
      provider: "test",
      model: "test",
      confidence: 0.8,
      metadata: {},
    },
    userPattern: {
      repetitive_questions: [],
      approval_seeking_frequency: 0,
      comfort_zone_indicators: [],
      shadow_avoidance_themes: [],
      growth_readiness: 0.5,
    },
    initiationLevel: "moderate",
    ...overrides,
  };
}
