// ===============================================
// PERFORMANCE BENCHMARKS
// Ensuring production scalability
// ===============================================

import { describe, test, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { PersonalOracleAgent } from '../src/core/agents/PersonalOracleAgent.js';
import { AdaptiveWisdomEngine } from '../src/core/agents/AdaptiveWisdomEngine.js';
import { SoulMemorySystem } from '../memory/SoulMemorySystem.js';

describe('Performance Benchmarks', () => {
  let oracle: PersonalOracleAgent;
  let wisdomEngine: AdaptiveWisdomEngine;
  let soulMemory: SoulMemorySystem;
  const testUserId = 'perf-test-user-' + Date.now();

  beforeAll(async () => {
    soulMemory = new SoulMemorySystem({
      userId: testUserId,
      storageType: 'sqlite',
      databasePath: ':memory:',
      memoryDepth: 1000
    });

    await soulMemory.initialize();

    oracle = new PersonalOracleAgent({
      userId: testUserId,
      oracleName: 'Performance Oracle',
      mode: 'daily'
    });

    wisdomEngine = new AdaptiveWisdomEngine({
      userId: testUserId,
      soulMemory
    });

    await oracle.connectToSoulMemory(soulMemory);
    await oracle.connectToWisdomEngine(wisdomEngine);
  });

  afterAll(async () => {
    await soulMemory.close();
  });

  describe('Oracle Response Performance', () => {
    test('Should respond to simple prompts within 2 seconds', async () => {
      const simplePrompts = [
        "How are you?",
        "I need guidance",
        "What should I focus on today?",
        "Help me understand myself",
        "I'm feeling confused"
      ];

      for (const prompt of simplePrompts) {
        const startTime = Date.now();
        const response = await oracle.respondToPrompt(prompt);
        const responseTime = Date.now() - startTime;

        expect(response).toBeDefined();
        expect(response.length).toBeGreaterThan(20);
        expect(responseTime).toBeLessThan(2000); // 2 seconds max
      }
    });

    test('Should handle complex prompts within 5 seconds', async () => {
      const complexPrompts = [
        "I'm struggling with the paradox of wanting deep transformation while also fearing change, and I notice this pattern showing up in my relationships where I get close to someone but then sabotage it when they want more intimacy. How do I work with this shadow pattern?",
        "My father was both abusive and loving, and I'm finding that I've internalized his voice as both my inner critic and my motivation. I want to honor the good he gave me while healing from the harm, but I don't know how to separate these aspects.",
        "I keep having dreams about flying over dark water, and when I try to land, the ground disappears. I've been doing shadow work for months, and I feel like these dreams are trying to tell me something about my spiritual bypassing patterns."
      ];

      for (const prompt of complexPrompts) {
        const startTime = Date.now();
        const response = await oracle.respondToPrompt(prompt);
        const responseTime = Date.now() - startTime;

        expect(response).toBeDefined();
        expect(response.length).toBeGreaterThan(50);
        expect(responseTime).toBeLessThan(5000); // 5 seconds max for complex prompts
      }
    });

    test('Should maintain response quality under concurrent load', async () => {
      const concurrentPrompts = Array(10).fill(0).map((_, i) =>
        `Concurrent test prompt ${i}: Help me understand my patterns`
      );

      const startTime = Date.now();

      const responses = await Promise.all(
        concurrentPrompts.map(prompt => oracle.respondToPrompt(prompt))
      );

      const totalTime = Date.now() - startTime;

      expect(responses).toHaveLength(10);
      expect(responses.every(r => r.length > 20)).toBe(true);
      expect(totalTime).toBeLessThan(15000); // 15 seconds for 10 concurrent requests

      // Responses should be unique (not cached duplicates)
      const uniqueResponses = new Set(responses);
      expect(uniqueResponses.size).toBeGreaterThan(5); // At least some variation
    });
  });

  describe('Memory System Performance', () => {
    test('Should store memories at high throughput', async () => {
      const memoryCount = 100;
      const memories = Array(memoryCount).fill(0).map((_, i) => ({
        userId: testUserId,
        type: 'journal_entry' as const,
        content: `Performance test memory ${i} with varied content about transformation and growth`,
        element: (['fire', 'water', 'earth', 'air', 'aether'] as const)[i % 5],
        emotionalTone: (['peaceful', 'curious', 'excited', 'anxious', 'grateful'] as const)[i % 5]
      }));

      const startTime = Date.now();

      await Promise.all(
        memories.map(memory => soulMemory.storeMemory(memory))
      );

      const storageTime = Date.now() - startTime;

      expect(storageTime).toBeLessThan(10000); // 10 seconds for 100 memories
      console.log(`Stored ${memoryCount} memories in ${storageTime}ms (${(storageTime/memoryCount).toFixed(2)}ms per memory)`);
    });

    test('Should retrieve memories efficiently with large datasets', async () => {
      // Ensure we have a substantial dataset
      const additionalMemories = 200;
      const memories = Array(additionalMemories).fill(0).map((_, i) => ({
        userId: testUserId,
        type: 'oracle_exchange' as const,
        content: `Large dataset memory ${i}`,
        element: (['fire', 'water', 'earth', 'air', 'aether'] as const)[i % 5]
      }));

      await Promise.all(
        memories.map(memory => soulMemory.storeMemory(memory))
      );

      // Test retrieval performance
      const retrievalTests = [
        { limit: 10, maxTime: 500 },
        { limit: 50, maxTime: 1000 },
        { limit: 100, maxTime: 2000 }
      ];

      for (const test of retrievalTests) {
        const startTime = Date.now();
        const retrieved = await soulMemory.retrieveMemories(testUserId, {
          limit: test.limit
        });
        const retrievalTime = Date.now() - startTime;

        expect(retrieved).toHaveLength(test.limit);
        expect(retrievalTime).toBeLessThan(test.maxTime);
        console.log(`Retrieved ${test.limit} memories in ${retrievalTime}ms`);
      }
    });

    test('Should perform semantic search efficiently', async () => {
      const searchQueries = [
        'transformation and growth',
        'shadow work and integration',
        'emotional patterns and healing',
        'relationships and boundaries',
        'dreams and spiritual insights'
      ];

      for (const query of searchQueries) {
        const startTime = Date.now();
        const results = await soulMemory.semanticSearch(testUserId, query, {
          topK: 10
        });
        const searchTime = Date.now() - startTime;

        expect(results).toBeDefined();
        expect(results.length).toBeGreaterThan(0);
        expect(searchTime).toBeLessThan(3000); // 3 seconds max for semantic search
        console.log(`Semantic search for "${query}" took ${searchTime}ms, found ${results.length} results`);
      }
    });

    test('Should handle memory depth limits efficiently', async () => {
      const limitedMemory = new SoulMemorySystem({
        userId: testUserId + '-limited',
        storageType: 'sqlite',
        databasePath: ':memory:',
        memoryDepth: 100
      });

      await limitedMemory.initialize();

      // Store more than the limit
      const startTime = Date.now();
      for (let i = 0; i < 150; i++) {
        await limitedMemory.storeMemory({
          userId: testUserId + '-limited',
          type: 'journal_entry',
          content: `Limited memory test ${i}`,
          element: 'air'
        });
      }
      const pruningTime = Date.now() - startTime;

      // Should maintain limit
      const allMemories = await limitedMemory.retrieveMemories(testUserId + '-limited');
      expect(allMemories.length).toBeLessThanOrEqual(100);
      expect(pruningTime).toBeLessThan(5000); // Pruning should be efficient

      await limitedMemory.close();
    });
  });

  describe('Wisdom Engine Performance', () => {
    test('Should detect patterns efficiently with large memory sets', async () => {
      // Create patterns in the data
      const patterns = ['shadow_work', 'spiritual_bypassing', 'victim_consciousness'];

      for (const pattern of patterns) {
        for (let i = 0; i < 20; i++) {
          await soulMemory.storeMemory({
            userId: testUserId,
            type: 'oracle_exchange',
            content: `Pattern test for ${pattern} number ${i}`,
            element: 'water',
            metadata: { pattern }
          });
        }
      }

      // Test pattern detection speed
      for (const pattern of patterns) {
        const startTime = Date.now();
        const detected = await wisdomEngine.detectPattern(pattern);
        const detectionTime = Date.now() - startTime;

        expect(detected).toBeDefined();
        expect(detected.strength).toBeGreaterThan(0.5);
        expect(detectionTime).toBeLessThan(2000); // 2 seconds max
        console.log(`Pattern detection for "${pattern}" took ${detectionTime}ms`);
      }
    });

    test('Should batch process multiple patterns efficiently', async () => {
      const patterns = ['shadow_work', 'spiritual_bypassing', 'victim_consciousness', 'death_rebirth', 'inner_child'];

      const startTime = Date.now();
      const results = await wisdomEngine.detectMultiplePatterns(patterns);
      const batchTime = Date.now() - startTime;

      expect(Object.keys(results)).toHaveLength(patterns.length);
      expect(batchTime).toBeLessThan(5000); // 5 seconds for batch processing
      console.log(`Batch pattern detection took ${batchTime}ms for ${patterns.length} patterns`);
    });

    test('Should cache wisdom selections for improved performance', async () => {
      const testPrompt = "I'm struggling with shadow integration";
      const context = { emotionalState: 'anxious', currentArchetype: 'Shadow' };

      // First selection (uncached)
      const startTime1 = Date.now();
      const selection1 = await wisdomEngine.selectWisdomApproach(testPrompt, context);
      const firstTime = Date.now() - startTime1;

      // Second selection (should be faster due to caching)
      const startTime2 = Date.now();
      const selection2 = await wisdomEngine.selectWisdomApproach(testPrompt, context);
      const cachedTime = Date.now() - startTime2;

      expect(selection1.primary).toBe(selection2.primary);
      expect(cachedTime).toBeLessThan(firstTime / 2); // Cached should be much faster
      console.log(`Wisdom selection: first ${firstTime}ms, cached ${cachedTime}ms`);
    });
  });

  describe('Oracle Mode Performance', () => {
    test('Should switch modes efficiently', async () => {
      const modes = ['alchemist', 'buddha', 'sage', 'mystic', 'guardian', 'tao'] as const;

      for (const mode of modes) {
        const startTime = Date.now();
        const result = await oracle.switchMode(mode);
        const switchTime = Date.now() - startTime;

        expect(result.success).toBe(true);
        expect(switchTime).toBeLessThan(500); // 500ms max for mode switch
        console.log(`Mode switch to ${mode} took ${switchTime}ms`);
      }
    });

    test('Should maintain mode-specific responses efficiently', async () => {
      const testPrompt = "Help me understand my anger";
      const modes = ['alchemist', 'buddha', 'guardian'] as const;

      for (const mode of modes) {
        await oracle.switchMode(mode);

        const startTime = Date.now();
        const response = await oracle.respondToPrompt(testPrompt);
        const responseTime = Date.now() - startTime;

        expect(response).toBeDefined();
        expect(responseTime).toBeLessThan(3000); // 3 seconds max
        console.log(`${mode} mode response took ${responseTime}ms`);
      }
    });
  });

  describe('Memory Load Stress Tests', () => {
    test('Should handle high-volume conversation history', async () => {
      const conversationSize = 500;
      const conversations = [];

      // Generate large conversation history
      const startGeneration = Date.now();
      for (let i = 0; i < conversationSize; i++) {
        conversations.push(soulMemory.storeMemory({
          userId: testUserId,
          type: 'oracle_exchange',
          content: `Conversation ${i}: This is a meaningful exchange about personal growth and transformation`,
          element: (['fire', 'water', 'earth', 'air', 'aether'] as const)[i % 5],
          emotionalTone: (['peaceful', 'curious', 'excited', 'anxious', 'grateful'] as const)[i % 5]
        }));
      }

      await Promise.all(conversations);
      const generationTime = Date.now() - startGeneration;
      console.log(`Generated ${conversationSize} conversations in ${generationTime}ms`);

      // Test oracle response with large history
      const startResponse = Date.now();
      const response = await oracle.respondToPrompt("Reflecting on our entire journey together, what wisdom emerges?");
      const responseTime = Date.now() - startResponse;

      expect(response).toBeDefined();
      expect(response.length).toBeGreaterThan(30);
      expect(responseTime).toBeLessThan(8000); // 8 seconds max despite large history
      console.log(`Oracle response with ${conversationSize} history took ${responseTime}ms`);
    });

    test('Should maintain transformation tracking with extensive data', async () => {
      const milestones = 50;

      // Create extensive transformation journey
      const startTime = Date.now();
      for (let i = 0; i < milestones; i++) {
        await soulMemory.storeMemory({
          userId: testUserId,
          type: 'transformation_milestone',
          content: `Transformation milestone ${i}`,
          element: 'aether',
          transformationMarker: true,
          spiralPhase: (['initiation', 'descent', 'revelation', 'return'] as const)[i % 4],
          metadata: {
            milestoneName: `Milestone ${i}`,
            integrationLevel: Math.random()
          }
        });
      }

      // Test journey analysis performance
      const analysisStart = Date.now();
      const journey = await soulMemory.getTransformationJourney(testUserId);
      const analysisTime = Date.now() - analysisStart;

      expect(journey.milestones.length).toBeGreaterThanOrEqual(milestones);
      expect(analysisTime).toBeLessThan(3000); // 3 seconds max for journey analysis
      console.log(`Transformation journey analysis with ${milestones} milestones took ${analysisTime}ms`);
    });
  });

  describe('System Resource Monitoring', () => {
    test('Should not exhibit memory leaks during extended operation', async () => {
      const initialMemory = process.memoryUsage();

      // Simulate extended operation
      for (let i = 0; i < 100; i++) {
        await oracle.respondToPrompt(`Extended operation test ${i}`);

        // Occasional mode switches
        if (i % 10 === 0) {
          await oracle.switchMode((['alchemist', 'buddha', 'sage'] as const)[i % 3]);
        }
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      console.log(`Memory increase after 100 operations: ${(memoryIncrease / (1024 * 1024)).toFixed(2)}MB`);
    });

    test('Should handle cleanup efficiently', async () => {
      const cleanupStart = Date.now();

      // Test various cleanup operations
      await soulMemory.cleanup();
      await oracle.clearTemporaryState();
      await wisdomEngine.clearCache();

      const cleanupTime = Date.now() - cleanupStart;

      expect(cleanupTime).toBeLessThan(2000); // 2 seconds max for cleanup
      console.log(`System cleanup took ${cleanupTime}ms`);
    });
  });

  describe('Production Readiness Benchmarks', () => {
    test('Should meet production SLA requirements', async () => {
      const slaTests = [
        { operation: 'Simple oracle response', maxTime: 1500 },
        { operation: 'Memory storage', maxTime: 200 },
        { operation: 'Memory retrieval', maxTime: 500 },
        { operation: 'Mode switch', maxTime: 300 },
        { operation: 'Pattern detection', maxTime: 1000 }
      ];

      for (const test of slaTests) {
        const startTime = Date.now();

        switch (test.operation) {
          case 'Simple oracle response':
            await oracle.respondToPrompt("Hello");
            break;
          case 'Memory storage':
            await soulMemory.storeMemory({
              userId: testUserId,
              type: 'journal_entry',
              content: 'SLA test',
              element: 'air'
            });
            break;
          case 'Memory retrieval':
            await soulMemory.retrieveMemories(testUserId, { limit: 10 });
            break;
          case 'Mode switch':
            await oracle.switchMode('sage');
            break;
          case 'Pattern detection':
            await wisdomEngine.detectPattern('shadow_work');
            break;
        }

        const operationTime = Date.now() - startTime;

        expect(operationTime).toBeLessThan(test.maxTime);
        console.log(`${test.operation}: ${operationTime}ms (SLA: ${test.maxTime}ms)`);
      }
    });

    test('Should handle concurrent users efficiently', async () => {
      const userCount = 10;
      const usersPromises = [];

      for (let i = 0; i < userCount; i++) {
        const userId = `concurrent-user-${i}-${Date.now()}`;
        usersPromises.push(simulateUserSession(userId));
      }

      const startTime = Date.now();
      await Promise.all(usersPromises);
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(20000); // 20 seconds for 10 concurrent users
      console.log(`${userCount} concurrent user sessions completed in ${totalTime}ms`);
    });
  });

// Helper function for concurrent user simulation
async function simulateUserSession(userId: string): Promise<void> {
    const userMemory = new SoulMemorySystem({
      userId,
      storageType: 'sqlite',
      databasePath: ':memory:',
      memoryDepth: 100
    });

    await userMemory.initialize();

    const userOracle = new PersonalOracleAgent({
      userId,
      oracleName: 'Concurrent Oracle',
      mode: 'daily'
    });

    await userOracle.connectToSoulMemory(userMemory);

    // Simulate user interactions
    await userOracle.respondToPrompt("Hello, I\'m new here");
    await userOracle.switchMode('alchemist');
    await userOracle.respondToPrompt("Help me with shadow work");

    await userMemory.close();
  }
});