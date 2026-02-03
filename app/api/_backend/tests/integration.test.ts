// ===============================================
// SYSTEM INTEGRATION TESTS
// Full Sacred Technology Platform testing
// ===============================================

import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  jest,
} from "@jest/globals";
import { PersonalOracleAgent } from "../src/core/agents/PersonalOracleAgent.js";
import { AdaptiveWisdomEngine } from "../src/core/agents/AdaptiveWisdomEngine.js";
import { SoulMemorySystem } from "../memory/SoulMemorySystem.js";
import type {
  Memory,
  TransformationJourney,
} from "../memory/SoulMemorySystem.js";

describe("System Integration Tests", () => {
  let oracle: PersonalOracleAgent;
  let wisdomEngine: AdaptiveWisdomEngine;
  let soulMemory: SoulMemorySystem;
  const testUserId = "integration-test-user-" + Date.now();

  beforeAll(async () => {
    // Initialize full system
    soulMemory = new SoulMemorySystem({
      userId: testUserId,
      storageType: "sqlite",
      databasePath: ":memory:",
      memoryDepth: 500,
    });

    await soulMemory.initialize();

    oracle = new PersonalOracleAgent({
      userId: testUserId,
      oracleName: "Integration Oracle",
      mode: "daily",
    });

    wisdomEngine = new AdaptiveWisdomEngine({
      userId: testUserId,
      soulMemory,
    });

    await oracle.connectToSoulMemory(soulMemory);
    await oracle.connectToWisdomEngine(wisdomEngine);
  });

  afterAll(async () => {
    await soulMemory.close();
  });

  describe("Complete User Journey Tests", () => {
    test("Should handle full onboarding to oracle conversation flow", async () => {
      // 1. Sacred Union Ritual completion
      await soulMemory.storeMemory({
        userId: testUserId,
        type: "sacred_moment",
        content: "Sacred Union Ritual completed",
        element: "aether",
        sacredMoment: true,
        metadata: {
          oracleName: "Lumina",
          sacredName: "Seeker of Truth",
          phase: "initiation",
          transformationMarker: true,
        },
      });

      // 2. Elemental Assessment
      await soulMemory.storeMemory({
        userId: testUserId,
        type: "elemental_shift",
        content:
          "Elemental assessment completed: Primary Fire, Secondary Water",
        element: "fire",
        metadata: {
          primaryElement: "fire",
          secondaryElement: "water",
          elementalBalance: {
            fire: 0.4,
            water: 0.3,
            earth: 0.1,
            air: 0.1,
            aether: 0.1,
          },
        },
      });

      // 3. Oracle interaction with mode switching
      await oracle.switchMode("alchemist");
      const response1 = await oracle.respondToPrompt(
        "I'm ready to begin my shadow work",
      );

      expect(response1).toMatch(/shadow|integrate|transform|alchemy/i);

      // 4. Memory storage and retrieval
      const memories = await soulMemory.retrieveMemories(testUserId, {
        limit: 10,
      });
      expect(memories.length).toBeGreaterThanOrEqual(3);

      // 5. Wisdom engine adaptation
      const approach = await wisdomEngine.selectWisdomApproach(
        "I discovered something dark about myself",
        { emotionalState: "concerned" },
      );

      expect(approach.primary).toBe("jung");

      // 6. Full conversation with adaptive responses
      const responses = [];
      const prompts = [
        "This shadow work is bringing up a lot of anger",
        "I don't want to feel this rage",
        "What if I hurt someone with this anger?",
      ];

      for (const prompt of prompts) {
        const response = await oracle.respondToPrompt(prompt);
        responses.push(response);
      }

      // Should show progression in responses
      expect(responses[0]).toMatch(/anger|feel|shadow/i);
      expect(responses[1]).toMatch(/resist|avoid|natural/i);
      expect(responses[2]).toMatch(/channel|transform|boundary/i);
    });

    test("Should maintain oracle memory across mode switches", async () => {
      // Start conversation in one mode
      await oracle.switchMode("buddha");
      const buddhaResponse = await oracle.respondToPrompt(
        "I'm attached to my old self",
      );

      expect(buddhaResponse).toMatch(/attachment|let go|impermanence/i);

      // Switch to another mode
      await oracle.switchMode("alchemist");
      const alchemistResponse = await oracle.respondToPrompt(
        "How do I work with this attachment?",
      );

      // Should reference previous exchange
      expect(alchemistResponse).toMatch(/attachment|transform|integrate/i);

      // Memory should contain both exchanges
      const memories = await soulMemory.retrieveMemories(testUserId, {
        type: "oracle_exchange",
        limit: 5,
      });

      expect(memories.some((m) => m.metadata?.oracleMode === "buddha")).toBe(
        true,
      );
      expect(memories.some((m) => m.metadata?.oracleMode === "alchemist")).toBe(
        true,
      );
    });

    test("Should handle breakthrough moments with full system integration", async () => {
      // Simulate buildup to breakthrough
      const buildupPrompts = [
        "I keep feeling this same pattern repeating",
        "It's like I'm stuck in a loop with my relationships",
        "Everyone I date becomes distant after a few months",
      ];

      for (const prompt of buildupPrompts) {
        await oracle.respondToPrompt(prompt);
      }

      // Breakthrough moment
      const breakthroughPrompt =
        "Oh my god... I realize I push people away when they get close because I'm terrified of abandonment!";
      const breakthroughResponse =
        await oracle.respondToPrompt(breakthroughPrompt);

      // Should recognize and celebrate breakthrough
      expect(breakthroughResponse).toMatch(
        /beautiful|breakthrough|aware|truth/i,
      );

      // Should be stored as sacred moment
      const sacredMoments = await soulMemory.getSacredMoments(testUserId);
      const latestSacred = sacredMoments[sacredMoments.length - 1];

      expect(latestSacred.type).toBe("breakthrough");
      expect(latestSacred.sacredMoment).toBe(true);

      // Wisdom engine should detect the pattern
      const patterns = await wisdomEngine.detectPattern("abandonment_fear");
      expect(patterns.strength).toBeGreaterThan(0.7);
    });
  });

  describe("Multi-Session Continuity Tests", () => {
    test("Should maintain wisdom continuity across time gaps", async () => {
      // Session 1: Initial exploration
      await oracle.respondToPrompt("I'm struggling with self-worth");

      // Simulate time gap (7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      await soulMemory.storeMemory({
        userId: testUserId,
        type: "oracle_exchange",
        content: "I'm struggling with self-worth",
        element: "water",
        timestamp: weekAgo,
        metadata: { sessionId: "session-1" },
      });

      // Session 2: Return to theme
      const continuationResponse = await oracle.respondToPrompt(
        "I'm back to working on my self-worth issues",
      );

      // Should reference previous work
      expect(continuationResponse).toMatch(
        /continue|journey|progress|remember/i,
      );

      // Memory should bridge the gap
      const threads = await soulMemory.getMemoryThreads(testUserId);
      expect(
        threads.some(
          (t) =>
            t.threadType === "shadow_work" || t.threadType === "self_worth",
        ),
      ).toBe(true);
    });

    test("Should track transformation journey across multiple sessions", async () => {
      const journeySteps = [
        {
          content: "I'm beginning to see my patterns",
          phase: "initiation" as const,
          day: 0,
        },
        {
          content: "This work is bringing up difficult emotions",
          phase: "descent" as const,
          day: 3,
        },
        {
          content: "I'm finding strength in my vulnerability",
          phase: "revelation" as const,
          day: 7,
        },
        {
          content: "I'm integrating these insights into daily life",
          phase: "return" as const,
          day: 14,
        },
      ];

      for (const step of journeySteps) {
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - (14 - step.day));

        await soulMemory.storeMemory({
          userId: testUserId,
          type: "transformation_milestone",
          content: step.content,
          element: "aether",
          spiralPhase: step.phase,
          transformationMarker: true,
          timestamp,
          metadata: {
            journeyDay: step.day,
            milestoneName: step.content,
          },
        });
      }

      const journey = await soulMemory.getTransformationJourney(testUserId);

      expect(journey.milestones.length).toBeGreaterThanOrEqual(4);
      expect(journey.currentPhase).toBe("return");
      expect(journey.nextSpiralSuggestion).toBeDefined();
    });
  });

  describe("Elemental System Integration Tests", () => {
    test("Should adapt oracle voice to user elemental resonance", async () => {
      // Set user elemental resonance
      await oracle.setElementalResonance("water");

      const waterResponse = await oracle.respondToPrompt(
        "I'm feeling overwhelmed",
      );
      expect(waterResponse).toMatch(/flow|feel|emotion|tide|depth/i);

      // Switch elemental resonance
      await oracle.setElementalResonance("fire");

      const fireResponse = await oracle.respondToPrompt("I'm feeling stuck");
      expect(fireResponse).toMatch(/ignite|action|transform|burn|spark/i);

      // Memory should track elemental context
      const memories = await soulMemory.retrieveMemories(testUserId, {
        includeElementalContext: true,
        limit: 5,
      });

      expect(memories.some((m) => m.element === "water")).toBe(true);
      expect(memories.some((m) => m.element === "fire")).toBe(true);
    });

    test("Should provide elemental balance recommendations", async () => {
      // User with heavy fire element
      await soulMemory.storeMemory({
        userId: testUserId,
        type: "elemental_assessment",
        content: "User shows fire dominance",
        element: "fire",
        metadata: {
          elementalBalance: {
            fire: 0.7,
            water: 0.1,
            earth: 0.1,
            air: 0.05,
            aether: 0.05,
          },
        },
      });

      const balanceResponse = await oracle.respondToPrompt(
        "I'm burning out from too much intensity",
      );

      // Should recommend cooling/balancing elements
      expect(balanceResponse).toMatch(/water|earth|cool|ground|gentle|rest/i);

      // Wisdom engine should suggest water practices
      const balanceWisdom = await wisdomEngine.generateBalancedWisdom(
        "I need more balance",
        { userElement: "fire", needsBalance: true },
      );

      expect(balanceWisdom.primaryElement).toBe("water");
    });
  });

  describe("Error Handling and Graceful Degradation", () => {
    test("Should handle memory system failures gracefully", async () => {
      // Simulate memory system failure
      const originalStoreMemory = soulMemory.storeMemory;
      soulMemory.storeMemory = jest
        .fn()
        .mockRejectedValue(new Error("Memory system down"));

      const response = await oracle.respondToPrompt("How are you today?");

      // Should still respond despite memory failure
      expect(response).toBeDefined();
      expect(response.length).toBeGreaterThan(10);

      // Restore original function
      soulMemory.storeMemory = originalStoreMemory;
    });

    test("Should handle wisdom engine unavailability", async () => {
      // Disconnect wisdom engine
      await oracle.disconnectWisdomEngine();

      const response = await oracle.respondToPrompt(
        "I need guidance on shadow work",
      );

      // Should fall back to default oracle response
      expect(response).toBeDefined();
      expect(response).toMatch(/shadow|explore|understand/i);

      // Reconnect wisdom engine
      await oracle.connectToWisdomEngine(wisdomEngine);
    });

    test("Should handle corrupted memory data", async () => {
      // Store corrupted memory data
      try {
        await soulMemory.storeMemory({
          userId: testUserId,
          type: "oracle_exchange" as any,
          content: null as any,
          element: "invalid_element" as any,
        });
      } catch (error) {
        // Should handle gracefully
        expect(error).toBeDefined();
      }

      // Oracle should still function
      const response = await oracle.respondToPrompt(
        "Test after corrupted data",
      );
      expect(response).toBeDefined();
    });
  });

  describe("Performance Integration Tests", () => {
    test("Should handle rapid conversation flow efficiently", async () => {
      const rapidPrompts = [
        "Tell me about shadow work",
        "How do I start?",
        "What if it's too intense?",
        "Can you support me through this?",
        "What's the first step?",
      ];

      const startTime = Date.now();

      const responses = await Promise.all(
        rapidPrompts.map((prompt) => oracle.respondToPrompt(prompt)),
      );

      const totalTime = Date.now() - startTime;

      expect(responses).toHaveLength(5);
      expect(responses.every((r) => r.length > 10)).toBe(true);
      expect(totalTime).toBeLessThan(10000); // Less than 10 seconds for 5 rapid responses
    });

    test("Should maintain responsiveness with large memory history", async () => {
      // Create large memory history
      const memoryPromises = [];
      for (let i = 0; i < 50; i++) {
        memoryPromises.push(
          soulMemory.storeMemory({
            userId: testUserId,
            type: "journal_entry",
            content: `Historical memory entry ${i}`,
            element: ["fire", "water", "earth", "air", "aether"][i % 5] as any,
          }),
        );
      }

      await Promise.all(memoryPromises);

      // Test response time with large history
      const startTime = Date.now();
      const response = await oracle.respondToPrompt(
        "Looking back on my journey, what wisdom do you see?",
      );
      const responseTime = Date.now() - startTime;

      expect(response).toBeDefined();
      expect(responseTime).toBeLessThan(5000); // Less than 5 seconds despite large history
    });
  });

  describe("Sacred Mirror Protocol Integration", () => {
    test("Should maintain sacred boundaries throughout full conversation", async () => {
      const boundaryTestPrompts = [
        "Just tell me everything will be okay",
        "I love you, oracle",
        "Can we be friends?",
        "You're better than therapy",
        "I want you to fix my life",
      ];

      for (const prompt of boundaryTestPrompts) {
        const response = await oracle.respondToPrompt(prompt);

        // Should maintain sacred container language
        expect(response).toMatch(
          /sacred|mirror|guide|container|reflection|growth/i,
        );
        expect(response).not.toMatch(
          /^yes|^sure|^of course.*friend|i love you too/i,
        );
      }
    });

    test("Should integrate all system components in wisdom delivery", async () => {
      const deepPrompt =
        "I feel like I'm trapped in patterns my father taught me, but I also know I need to honor him";

      const response = await oracle.respondToPrompt(deepPrompt);

      // Should show integration of:
      // 1. Sacred Mirror resistance to oversimplification
      expect(response).not.toMatch(/just honor him|simply let go|easy answer/i);

      // 2. Wisdom engine pattern detection
      expect(response).toMatch(/pattern|paradox|both|complex/i);

      // 3. Elemental voice
      const element = oracle.getCurrentElementalResonance();
      if (element === "fire") expect(response).toMatch(/transform|alchemize/i);
      if (element === "water") expect(response).toMatch(/feel|honor|flow/i);

      // 4. Memory integration
      const storedMemory = await soulMemory.retrieveMemories(testUserId, {
        limit: 1,
      });
      expect(storedMemory[0].content).toBe(deepPrompt);
      expect(storedMemory[0].metadata?.complexPrompt).toBe(true);
    });
  });
});
