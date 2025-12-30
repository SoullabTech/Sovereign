// ===============================================
// SOUL MEMORY SYSTEM TESTS
// Testing persistent consciousness storage
// ===============================================

import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import { SoulMemorySystem } from "../memory/SoulMemorySystem.js";
import type {
  Memory,
  MemoryThread,
  ArchetypalPattern,
  TransformationJourney,
} from "../memory/SoulMemorySystem.js";

describe("Soul Memory System Tests", () => {
  let soulMemory: SoulMemorySystem;
  const testUserId = "test-user-" + Date.now(); // Unique user ID for each test run

  beforeAll(async () => {
    soulMemory = new SoulMemorySystem({
      userId: testUserId,
      storageType: "sqlite",
      databasePath: ":memory:",
      memoryDepth: 100,
    });

    await soulMemory.initialize();
  });

  afterAll(async () => {
    await soulMemory.close();
  });

  describe("Memory Storage Tests", () => {
    test("Should store oracle exchanges with full context", async () => {
      const memoryData = {
        userId: testUserId,
        type: "oracle_exchange" as const,
        content: "What is my deepest fear?",
        element: "water" as const,
        oracleResponse: "Let us explore what lies beneath the surface...",
        emotionalTone: "curious",
        shadowContent: true,
        metadata: {
          oracleMode: "alchemist",
          wisdomApproach: "jung",
        },
      };

      const memory = await soulMemory.storeMemory(memoryData);

      expect(memory.id).toBeDefined();
      expect(memory.timestamp).toBeInstanceOf(Date);
      expect(memory.content).toBe(memoryData.content);
      expect(memory.oracleResponse).toBe(memoryData.oracleResponse);

      // Retrieve and verify
      const retrieved = await soulMemory.retrieveMemories(testUserId, {
        type: "oracle_exchange",
        limit: 1,
      });

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].content).toBe("What is my deepest fear?");
      expect(retrieved[0].oracleResponse).toBe(
        "Let us explore what lies beneath the surface...",
      );
      expect(retrieved[0].metadata?.oracleMode).toBe("alchemist");
    });

    test("Should detect and store sacred moments", async () => {
      const sacredMemory = await soulMemory.storeMemory({
        userId: testUserId,
        type: "breakthrough",
        content:
          "I finally understand my pattern! The anger was protecting my vulnerability all along.",
        element: "aether",
        sacredMoment: true,
        transformationMarker: true,
        emotionalTone: "revelation",
        archetype: "Shadow",
        metadata: {
          integrationLevel: 0.8,
          breakthroughType: "shadow_integration",
        },
      });

      expect(sacredMemory.sacredMoment).toBe(true);
      expect(sacredMemory.transformationMarker).toBe(true);

      const sacredMoments = await soulMemory.getSacredMoments(testUserId);
      expect(sacredMoments.length).toBeGreaterThan(0);

      const latestSacred = sacredMoments[sacredMoments.length - 1];
      expect(latestSacred.sacredMoment).toBe(true);
      expect(latestSacred.type).toBe("breakthrough");
    });

    test("Should track archetypal patterns", async () => {
      // Store multiple shadow-related memories
      const shadowMemories = [
        {
          content: "I discovered my shadow in my anger",
          archetype: "Shadow",
        },
        {
          content: "Working with the dark parts of myself",
          archetype: "Shadow",
        },
        {
          content: "Integrating what I rejected",
          archetype: "Shadow",
        },
      ];

      for (const mem of shadowMemories) {
        await soulMemory.storeMemory({
          userId: testUserId,
          type: "shadow_work",
          content: mem.content,
          archetype: mem.archetype,
          element: "water",
          shadowContent: true,
        });
      }

      const patterns = await soulMemory.getActiveArchetypes(testUserId);
      const shadowPattern = patterns.find((p) => p.archetype === "Shadow");

      expect(shadowPattern).toBeDefined();
      expect(shadowPattern!.activationCount).toBeGreaterThanOrEqual(3);
      expect(shadowPattern!.patternStrength).toBeGreaterThan(0);
    });

    test("Should perform semantic search", async () => {
      // Store related memories
      const dreamMemories = [
        {
          content:
            "I dreamt about flying over the ocean with wings made of light",
          type: "dream_record" as const,
        },
        {
          content:
            "The flying dream returned, this time I was teaching others to fly",
          type: "dream_record" as const,
        },
        {
          content: "In meditation I felt like I was floating above my body",
          type: "oracle_exchange" as const,
        },
      ];

      for (const mem of dreamMemories) {
        await soulMemory.storeMemory({
          userId: testUserId,
          type: mem.type,
          content: mem.content,
          element: "air",
        });
      }

      // Search for related memories
      const results = await soulMemory.semanticSearch(
        testUserId,
        "dreams about flying",
        { topK: 5 },
      );

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].content).toMatch(/flying|fly|float/i);
      expect(results[0].score).toBeGreaterThan(0.7); // High relevance
    });

    test("Should create and track memory threads", async () => {
      // Create a series of related memories
      const shadowWorkMemories = [];

      for (let i = 0; i < 3; i++) {
        const memory = await soulMemory.storeMemory({
          userId: testUserId,
          type: "shadow_work",
          content: `Shadow work session ${i + 1}: Exploring anger`,
          element: "fire",
          shadowContent: true,
          archetype: "Shadow",
        });
        shadowWorkMemories.push(memory.id);
      }

      // Create a thread
      const thread = await soulMemory.createMemoryThread({
        userId: testUserId,
        threadName: "Anger Shadow Work Journey",
        threadType: "shadow_work",
        memories: shadowWorkMemories,
        state: {
          phase: "integration",
          progress: 0.7,
          milestones: ["Recognition", "Exploration", "Integration begun"],
        },
      });

      expect(thread.id).toBeDefined();
      expect(thread.memories).toHaveLength(3);
      expect(thread.state.progress).toBe(0.7);

      // Retrieve thread
      const threads = await soulMemory.getMemoryThreads(
        testUserId,
        "shadow_work",
      );
      expect(threads.length).toBeGreaterThan(0);
      expect(threads[0].threadName).toBe("Anger Shadow Work Journey");
    });
  });

  describe("Transformation Journey Tests", () => {
    test("Should track transformation milestones", async () => {
      // Add transformation memories representing a journey
      const milestones = [
        {
          type: "sacred_moment" as const,
          content: "First glimpse of my true nature",
          phase: "initiation" as const,
        },
        {
          type: "breakthrough" as const,
          content: "Shadow integration - embracing my anger",
          phase: "descent" as const,
        },
        {
          type: "integration" as const,
          content: "Living with both light and shadow",
          phase: "return" as const,
        },
      ];

      for (const milestone of milestones) {
        await soulMemory.storeMemory({
          userId: testUserId,
          type: milestone.type,
          content: milestone.content,
          transformationMarker: true,
          element: "aether",
          spiralPhase: milestone.phase,
          metadata: {
            milestoneName: milestone.content,
          },
        });
      }

      const journey = await soulMemory.getTransformationJourney(testUserId);

      expect(journey.milestones.length).toBeGreaterThanOrEqual(3);
      expect(journey.currentPhase).toBeDefined();
      expect(journey.nextSpiralSuggestion).toBeDefined();

      // Check if phases are tracked correctly
      const phases = journey.milestones.map((m) => m.phase);
      expect(phases).toContain("initiation");
      expect(phases).toContain("descent");
      expect(phases).toContain("return");
    });

    test("Should detect transformation patterns", async () => {
      // Simulate a death-rebirth cycle
      const deathRebirthMemories = [
        {
          content: "Everything I knew is falling apart",
          emotionalTone: "despair",
          phase: "descent",
        },
        {
          content: "In the darkness, I found a seed of light",
          emotionalTone: "hope",
          phase: "revelation",
        },
        {
          content: "I am not who I was, I am becoming new",
          emotionalTone: "transformation",
          phase: "return",
        },
      ];

      for (const mem of deathRebirthMemories) {
        await soulMemory.storeMemory({
          userId: testUserId,
          type: "breakthrough",
          content: mem.content,
          element: "aether",
          emotionalTone: mem.emotionalTone,
          spiralPhase: mem.phase as any,
          transformationMarker: true,
          archetype: "Death-Rebirth",
        });
      }

      const patterns = await soulMemory.getActiveArchetypes(testUserId);
      const deathRebirthPattern = patterns.find(
        (p) => p.archetype === "Death-Rebirth",
      );

      expect(deathRebirthPattern).toBeDefined();
      expect(deathRebirthPattern!.patternStrength).toBeGreaterThan(0.5);
    });
  });

  describe("Memory Analysis Tests", () => {
    test("Should analyze emotional patterns over time", async () => {
      const emotionalJourney = [
        { tone: "anxious", content: "Feeling overwhelmed by change" },
        { tone: "curious", content: "What if I explored this differently?" },
        { tone: "hopeful", content: "I see new possibilities emerging" },
        { tone: "empowered", content: "I am creating my reality" },
      ];

      const memoryIds = [];
      for (const entry of emotionalJourney) {
        const memory = await soulMemory.storeMemory({
          userId: testUserId,
          type: "journal_entry",
          content: entry.content,
          emotionalTone: entry.tone,
          element: "water",
        });
        memoryIds.push(memory.id);
      }

      // Analyze emotional progression
      const recentMemories = await soulMemory.retrieveMemories(testUserId, {
        limit: 10,
        includeEmotionalTone: true,
      });

      const emotionalProgression = recentMemories
        .filter((m) => memoryIds.includes(m.id))
        .map((m) => m.emotionalTone);

      // Should show progression from anxious to empowered
      expect(emotionalProgression).toContain("anxious");
      expect(emotionalProgression).toContain("empowered");

      const anxiousIndex = emotionalProgression.indexOf("anxious");
      const empoweredIndex = emotionalProgression.indexOf("empowered");
      expect(empoweredIndex).toBeGreaterThan(anxiousIndex);
    });

    test("Should identify recurring themes", async () => {
      // Store memories with recurring theme
      const theme = "boundaries";
      const boundaryMemories = [
        "I need to set better boundaries with my family",
        "Learning to say no is challenging but necessary",
        "I honored my boundaries today and felt empowered",
        "Boundaries are acts of self-love",
      ];

      for (const content of boundaryMemories) {
        await soulMemory.storeMemory({
          userId: testUserId,
          type: "oracle_exchange",
          content,
          element: "earth",
          metadata: { theme },
        });
      }

      // Search for theme
      const themeResults = await soulMemory.semanticSearch(
        testUserId,
        "boundaries",
        { topK: 10 },
      );

      expect(themeResults.length).toBeGreaterThanOrEqual(4);
      themeResults.forEach((result) => {
        expect(result.content).toMatch(/boundar/i);
      });
    });
  });

  describe("Memory Integration Tests", () => {
    test("Should link oracle responses to user prompts", async () => {
      const exchangeId = "exchange-" + Date.now();

      // Store user prompt
      const promptMemory = await soulMemory.storeMemory({
        userId: testUserId,
        type: "oracle_exchange",
        content: "Why do I keep attracting the same type of partner?",
        element: "water",
        metadata: { exchangeId, role: "user" },
      });

      // Store oracle response
      const responseMemory = await soulMemory.storeMemory({
        userId: testUserId,
        type: "oracle_exchange",
        content:
          "What patterns from your early relationships might you be recreating?",
        element: "water",
        oracleResponse:
          "What patterns from your early relationships might you be recreating?",
        metadata: {
          exchangeId,
          role: "oracle",
          linkedMemoryId: promptMemory.id,
        },
      });

      // Verify linking
      expect(responseMemory.metadata?.linkedMemoryId).toBe(promptMemory.id);
      expect(promptMemory.metadata?.exchangeId).toBe(
        responseMemory.metadata?.exchangeId,
      );
    });

    test("Should track integration progress", async () => {
      const integrationStages = [
        {
          content: "Recognized my pattern of people-pleasing",
          integration: 0.2,
        },
        { content: "Understanding where it came from", integration: 0.4 },
        { content: "Practicing saying no", integration: 0.6 },
        { content: "Feeling comfortable with boundaries", integration: 0.8 },
      ];

      for (const stage of integrationStages) {
        await soulMemory.storeMemory({
          userId: testUserId,
          type: "integration",
          content: stage.content,
          element: "earth",
          metadata: {
            integrationScore: stage.integration,
            pattern: "people-pleasing",
          },
        });
      }

      // Get integration memories
      const integrationMemories = await soulMemory.retrieveMemories(
        testUserId,
        {
          type: "integration",
          limit: 10,
        },
      );

      // Should show progression
      const scores = integrationMemories
        .filter((m) => m.metadata?.pattern === "people-pleasing")
        .map((m) => m.metadata?.integrationScore)
        .filter((s) => s !== undefined);

      expect(Math.max(...scores)).toBeGreaterThanOrEqual(0.8);
      expect(Math.min(...scores)).toBeLessThanOrEqual(0.4);
    });
  });

  describe("Performance and Scalability Tests", () => {
    test("Should handle large memory sets efficiently", async () => {
      const largeTestUserId = "perf-test-user-" + Date.now();
      const perfMemory = new SoulMemorySystem({
        userId: largeTestUserId,
        storageType: "sqlite",
        databasePath: ":memory:",
        memoryDepth: 1000,
      });

      await perfMemory.initialize();

      const startTime = Date.now();

      // Store 100 memories
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          perfMemory.storeMemory({
            userId: largeTestUserId,
            type: "journal_entry",
            content: `Test memory ${i} with various content about transformation and growth`,
            element: ["fire", "water", "earth", "air", "aether"][i % 5] as any,
          }),
        );
      }

      await Promise.all(promises);
      const storeTime = Date.now() - startTime;

      // Storage should be fast
      expect(storeTime).toBeLessThan(5000); // Less than 5 seconds for 100 memories

      // Test retrieval performance
      const retrieveStart = Date.now();
      const retrieved = await perfMemory.retrieveMemories(largeTestUserId, {
        limit: 50,
      });
      const retrieveTime = Date.now() - retrieveStart;

      expect(retrieved).toHaveLength(50);
      expect(retrieveTime).toBeLessThan(1000); // Less than 1 second

      // Test search performance
      const searchStart = Date.now();
      const searchResults = await perfMemory.semanticSearch(
        largeTestUserId,
        "transformation",
        { topK: 10 },
      );
      const searchTime = Date.now() - searchStart;

      expect(searchResults.length).toBeGreaterThan(0);
      expect(searchTime).toBeLessThan(2000); // Less than 2 seconds

      await perfMemory.close();
    });

    test("Should maintain memory depth limits", async () => {
      const limitTestUserId = "limit-test-" + Date.now();
      const limitedMemory = new SoulMemorySystem({
        userId: limitTestUserId,
        storageType: "sqlite",
        databasePath: ":memory:",
        memoryDepth: 10, // Very limited for testing
      });

      await limitedMemory.initialize();

      // Store more than the limit
      for (let i = 0; i < 15; i++) {
        await limitedMemory.storeMemory({
          userId: limitTestUserId,
          type: "journal_entry",
          content: `Memory ${i}`,
          element: "air",
        });
      }

      // Should only keep most recent memories up to depth
      const allMemories = await limitedMemory.retrieveMemories(limitTestUserId);
      expect(allMemories.length).toBeLessThanOrEqual(10);

      // Most recent should be present
      const contents = allMemories.map((m) => m.content);
      expect(contents).toContain("Memory 14");
      expect(contents).not.toContain("Memory 0"); // Oldest should be pruned

      await limitedMemory.close();
    });
  });
});
