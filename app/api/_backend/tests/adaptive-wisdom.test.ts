// ===============================================
// ADAPTIVE WISDOM ENGINE TESTS
// Testing pattern detection and wisdom adaptation
// ===============================================

import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  jest,
} from "@jest/globals";
import { AdaptiveWisdomEngine } from "../src/core/agents/AdaptiveWisdomEngine.js";
import { SoulMemorySystem } from "../memory/SoulMemorySystem.js";
import type { Memory } from "../memory/SoulMemorySystem.js";

describe("Adaptive Wisdom Engine Tests", () => {
  let wisdomEngine: AdaptiveWisdomEngine;
  let soulMemory: SoulMemorySystem;
  const testUserId = "test-wisdom-user-" + Date.now();

  beforeAll(async () => {
    // Initialize Soul Memory
    soulMemory = new SoulMemorySystem({
      userId: testUserId,
      storageType: "sqlite",
      databasePath: ":memory:",
      memoryDepth: 100,
    });

    await soulMemory.initialize();

    // Initialize Wisdom Engine
    wisdomEngine = new AdaptiveWisdomEngine({
      userId: testUserId,
      soulMemory,
    });
  });

  afterAll(async () => {
    await soulMemory.close();
  });

  describe("Pattern Detection Tests", () => {
    test("Should detect spiritual bypassing patterns", async () => {
      const bypassingExchanges = [
        {
          prompt: "I never get angry anymore, I've transcended that",
          response: "Anger is a natural human emotion...",
        },
        {
          prompt: "Negative emotions are just illusions",
          response: "All emotions serve a purpose...",
        },
        {
          prompt: "I only focus on love and light",
          response: "What shadow aspects might you be avoiding?",
        },
      ];

      // Store exchanges
      for (const exchange of bypassingExchanges) {
        await soulMemory.storeMemory({
          userId: testUserId,
          type: "oracle_exchange",
          content: exchange.prompt,
          oracleResponse: exchange.response,
          element: "aether",
          metadata: {
            pattern: "spiritual_bypassing",
            wisdomApproach: "jung",
          },
        });
      }

      const pattern = await wisdomEngine.detectPattern("spiritual_bypassing");

      expect(pattern).toBeDefined();
      expect(pattern.strength).toBeGreaterThan(0.7);
      expect(pattern.frequency).toBeGreaterThanOrEqual(3);
      expect(pattern.recommendation).toMatch(/shadow|integrate|authentic/i);
    });

    test("Should detect repetitive questioning patterns", async () => {
      const repetitivePrompts = [
        "Why does this keep happening to me?",
        "Why do I always end up here?",
        "Why can't I break this cycle?",
        "Why does this pattern repeat?",
      ];

      for (const prompt of repetitivePrompts) {
        await soulMemory.storeMemory({
          userId: testUserId,
          type: "oracle_exchange",
          content: prompt,
          element: "water",
          emotionalTone: "frustrated",
          metadata: {
            pattern: "victim_consciousness",
          },
        });
      }

      const analysis = await wisdomEngine.analyzeConversationFlow(testUserId);

      expect(analysis.patterns).toContain("victim_consciousness");
      expect(analysis.stuckPoints).toHaveLength(1);
      expect(analysis.recommendedIntervention).toMatch(
        /agency|choice|empower/i,
      );
    });

    test("Should detect growth edges", async () => {
      // Simulate a conversation revealing vulnerability as growth edge
      const vulnerabilityExchanges = [
        {
          content: "I always have to be strong for everyone",
          emotionalTone: "burdened",
        },
        {
          content: "Asking for help feels impossible",
          emotionalTone: "anxious",
        },
        {
          content: "I was taught that needing others is weakness",
          emotionalTone: "sad",
        },
      ];

      for (const exchange of vulnerabilityExchanges) {
        await soulMemory.storeMemory({
          userId: testUserId,
          type: "oracle_exchange",
          content: exchange.content,
          element: "earth",
          emotionalTone: exchange.emotionalTone,
          metadata: {
            theme: "vulnerability",
            pattern: "self_reliance",
          },
        });
      }

      const growthEdge = await wisdomEngine.identifyGrowthEdge(testUserId);

      expect(growthEdge.edge).toBe("vulnerability");
      expect(growthEdge.currentCapacity).toBeLessThan(0.5);
      expect(growthEdge.readiness).toBeGreaterThan(0.6);
      expect(growthEdge.suggestedApproach).toMatch(/gentle|support|safe/i);
    });

    test("Should track archetypal activation patterns", async () => {
      const archetypeSequence = [
        { archetype: "Shadow", content: "Facing my dark side" },
        { archetype: "Shadow", content: "The parts I hide from others" },
        { archetype: "Warrior", content: "I need to fight for this" },
        { archetype: "Warrior", content: "Standing up for myself" },
        { archetype: "Magician", content: "Transforming this energy" },
      ];

      for (const entry of archetypeSequence) {
        await soulMemory.storeMemory({
          userId: testUserId,
          type: "oracle_exchange",
          content: entry.content,
          archetype: entry.archetype,
          element: "fire",
          metadata: {
            archetypeActivation: true,
          },
        });
      }

      const activation = await wisdomEngine.getArchetypalActivation(testUserId);

      expect(activation.dominantArchetype).toBe("Shadow");
      expect(activation.emergingArchetype).toBe("Warrior");
      expect(activation.integrationSuggestion).toBeDefined();
      expect(activation.balanceScore).toBeBetween(0.4, 0.7);
    });
  });

  describe("Wisdom Approach Adaptation Tests", () => {
    test("Should adapt Jung approach for shadow work", async () => {
      const shadowPrompt = "I hate this part of myself";

      const approach = await wisdomEngine.selectWisdomApproach(shadowPrompt, {
        emotionalState: "self-rejection",
        currentArchetype: "Shadow",
        recentThemes: ["self-hatred", "rejection", "shadow"],
      });

      expect(approach.primary).toBe("jung");
      expect(approach.confidence).toBeGreaterThan(0.8);
      expect(approach.reasoning).toMatch(/shadow|integrate|parts/i);
    });

    test("Should adapt Buddha approach for attachment issues", async () => {
      const attachmentPrompt = "I can't let go of how things used to be";

      const approach = await wisdomEngine.selectWisdomApproach(
        attachmentPrompt,
        {
          emotionalState: "clinging",
          currentArchetype: "Seeker",
          recentThemes: ["attachment", "past", "holding on"],
        },
      );

      expect(approach.primary).toBe("buddha");
      expect(approach.confidence).toBeGreaterThan(0.8);
      expect(approach.reasoning).toMatch(/attachment|let go|impermanence/i);
    });

    test("Should blend approaches for complex situations", async () => {
      const complexPrompt =
        "I want to let go but I also need to understand why this happened";

      const approach = await wisdomEngine.selectWisdomApproach(complexPrompt, {
        emotionalState: "confused",
        currentArchetype: "Sage",
        recentThemes: ["understanding", "letting go", "meaning"],
      });

      expect(approach.primary).toBe("hybrid");
      expect(approach.jungWeight).toBeGreaterThan(0.3);
      expect(approach.buddhaWeight).toBeGreaterThan(0.3);
      expect(approach.reasoning).toMatch(/both|integrate|paradox/i);
    });

    test("Should track wisdom approach effectiveness", async () => {
      // Simulate successful Jung approach
      await soulMemory.storeMemory({
        userId: testUserId,
        type: "oracle_exchange",
        content: "The shadow work helped me understand myself",
        element: "water",
        emotionalTone: "grateful",
        metadata: {
          wisdomApproach: "jung",
          effectiveness: 0.9,
          breakthrough: true,
        },
      });

      // Simulate less effective Buddha approach
      await soulMemory.storeMemory({
        userId: testUserId,
        type: "oracle_exchange",
        content: "I'm trying to let go but it's not working",
        element: "air",
        emotionalTone: "frustrated",
        metadata: {
          wisdomApproach: "buddha",
          effectiveness: 0.3,
          stuck: true,
        },
      });

      const effectiveness =
        await wisdomEngine.getApproachEffectiveness(testUserId);

      expect(effectiveness.jung.averageScore).toBeGreaterThan(0.8);
      expect(effectiveness.buddha.averageScore).toBeLessThan(0.5);
      expect(effectiveness.recommendation).toBe("jung");
    });
  });

  describe("Elemental Wisdom Integration Tests", () => {
    test("Should adapt wisdom to elemental resonance", async () => {
      const elements = ["fire", "water", "earth", "air", "aether"] as const;
      const testPrompt = "I feel stuck and need guidance";

      for (const element of elements) {
        const wisdom = await wisdomEngine.generateElementalWisdom(testPrompt, {
          primaryElement: element,
          wisdomApproach: "adaptive",
        });

        // Fire should be activating
        if (element === "fire") {
          expect(wisdom).toMatch(/action|transform|breakthrough|ignite/i);
        }
        // Water should be flowing
        else if (element === "water") {
          expect(wisdom).toMatch(/feel|flow|emotion|intuition/i);
        }
        // Earth should be grounding
        else if (element === "earth") {
          expect(wisdom).toMatch(/ground|stable|practical|manifest/i);
        }
        // Air should be clarifying
        else if (element === "air") {
          expect(wisdom).toMatch(/perspective|clarity|understand|think/i);
        }
        // Aether should be integrative
        else if (element === "aether") {
          expect(wisdom).toMatch(/whole|unity|sacred|cosmic/i);
        }
      }
    });

    test("Should balance elemental wisdom with user needs", async () => {
      // User with fire dominance needing water wisdom
      const context = {
        userElement: "fire" as const,
        emotionalState: "overwhelmed",
        needsBalance: true,
      };

      const wisdom = await wisdomEngine.generateBalancedWisdom(
        "I'm burning out from pushing too hard",
        context,
      );

      expect(wisdom.primaryElement).toBe("water");
      expect(wisdom.response).toMatch(/flow|rest|gentle|cool/i);
      expect(wisdom.balanceReason).toMatch(/cooling|balance|complement/i);
    });
  });

  describe("Memory Coherence Tests", () => {
    test("Should maintain wisdom coherence across sessions", async () => {
      // Store a wisdom theme
      const wisdomTheme = "Learning to receive help";

      await soulMemory.storeMemory({
        userId: testUserId,
        type: "breakthrough",
        content: wisdomTheme,
        element: "water",
        metadata: {
          wisdomTheme: "receptivity",
          sessionId: "session-1",
        },
      });

      // Continue in next session
      const continuedWisdom = await wisdomEngine.continueWisdomThread(
        testUserId,
        "How do I actually start asking for help?",
      );

      expect(continuedWisdom.connectedTheme).toBe("receptivity");
      expect(continuedWisdom.response).toMatch(
        /receive|ask|vulnerable|practice/i,
      );
      expect(continuedWisdom.coherenceScore).toBeGreaterThan(0.8);
    });

    test("Should bridge wisdom across time gaps", async () => {
      // Store old wisdom
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 30); // 30 days ago

      await soulMemory.storeMemory({
        userId: testUserId,
        type: "sacred_moment",
        content: "I realized I am worthy of love",
        element: "aether",
        timestamp: oldDate,
        metadata: {
          wisdomGem: true,
          theme: "self-worth",
        },
      });

      // Test wisdom bridging
      const bridgedWisdom = await wisdomEngine.bridgeWisdomGap(
        testUserId,
        "I'm doubting myself again",
      );

      expect(bridgedWisdom.recalledWisdom).toMatch(/worthy|love/i);
      expect(bridgedWisdom.bridge).toMatch(/remember|realized|journey/i);
      expect(bridgedWisdom.integration).toBeDefined();
    });
  });

  describe("Performance Optimization Tests", () => {
    test("Should cache frequently accessed patterns", async () => {
      const startTime = Date.now();

      // First access (uncached)
      const pattern1 = await wisdomEngine.detectPattern("spiritual_bypassing");
      const firstAccessTime = Date.now() - startTime;

      // Second access (should be cached)
      const cacheStart = Date.now();
      const pattern2 = await wisdomEngine.detectPattern("spiritual_bypassing");
      const cachedAccessTime = Date.now() - cacheStart;

      expect(pattern1).toEqual(pattern2);
      expect(cachedAccessTime).toBeLessThan(firstAccessTime / 2);
    });

    test("Should batch pattern detection efficiently", async () => {
      const patterns = [
        "shadow_work",
        "victim_consciousness",
        "spiritual_bypassing",
      ];

      const batchStart = Date.now();
      const results = await wisdomEngine.detectMultiplePatterns(patterns);
      const batchTime = Date.now() - batchStart;

      expect(Object.keys(results)).toHaveLength(3);
      expect(batchTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe("Edge Case Handling", () => {
    test("Should handle users with no memory history", async () => {
      const newUserId = "brand-new-user-" + Date.now();
      const newEngine = new AdaptiveWisdomEngine({
        userId: newUserId,
        soulMemory,
      });

      const approach = await newEngine.selectWisdomApproach(
        "I'm new here and feeling lost",
        { emotionalState: "uncertain" },
      );

      expect(approach.primary).toBe("guardian"); // Should default to gentle approach
      expect(approach.reasoning).toMatch(/new|gentle|support/i);
    });

    test("Should handle contradictory patterns gracefully", async () => {
      // Store contradictory patterns
      await soulMemory.storeMemory({
        userId: testUserId,
        type: "oracle_exchange",
        content: "I want deep transformation",
        element: "fire",
        metadata: { intent: "transform" },
      });

      await soulMemory.storeMemory({
        userId: testUserId,
        type: "oracle_exchange",
        content: "But I don't want anything to change",
        element: "earth",
        metadata: { intent: "preserve" },
      });

      const analysis = await wisdomEngine.analyzeContradictions(testUserId);

      expect(analysis.hasContradiction).toBe(true);
      expect(analysis.type).toBe("transform_vs_preserve");
      expect(analysis.resolution).toMatch(/both|paradox|explore/i);
    });
  });
});

// Helper function for range testing
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeBetween(min: number, max: number): R;
    }
  }
}

expect.extend({
  toBeBetween(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be between ${min} and ${max}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be between ${min} and ${max}`,
        pass: false,
      };
    }
  },
});
