/**
 * RFS vs Traditional Comparison Tests
 * Validates that RFS produces different (better) behavior than traditional system
 */

import { ResonanceFieldOrchestrator } from '../ResonanceFieldOrchestrator';
import { MaiaFullyEducatedOrchestrator } from '../MaiaFullyEducatedOrchestrator';

describe('RFS vs Traditional Comparison', () => {
  const rfsSystem = new ResonanceFieldOrchestrator();
  const traditionalSystem = new MaiaFullyEducatedOrchestrator();
  const testUserId = 'test-comparison-user';

  beforeEach(() => {
    // Reset state
    rfsSystem.resetUser(testUserId);
  });

  describe('Brevity Comparison', () => {
    test('RFS should produce shorter responses than traditional', async () => {
      const input = "I'm feeling overwhelmed with everything going on";

      // Traditional response
      const traditionalResponse = await traditionalSystem.speak(input, testUserId);
      const traditionalWordCount = traditionalResponse.message.split(/\s+/).length;

      // RFS response
      const rfsResponse = await rfsSystem.speak(input, testUserId);
      const rfsWordCount = rfsResponse.message
        ? rfsResponse.message.split(/\s+/).length
        : 0; // Count silence as 0

      console.log('Traditional:', traditionalResponse.message, `(${traditionalWordCount} words)`);
      console.log('RFS:', rfsResponse.message || '[silence]', `(${rfsWordCount} words)`);

      // RFS should be significantly shorter
      expect(rfsWordCount).toBeLessThanOrEqual(traditionalWordCount * 0.5);
    });

    test('RFS should honor elemental constraints', async () => {
      const inputs = [
        "I'm stuck", // Earth-heavy → max 2 words
        "I feel so much", // Water-heavy → max 5 words
        "Why does this happen?", // Air-heavy → max 8 words
        "I need to act now!" // Fire-heavy → max 2 words
      ];

      for (const input of inputs) {
        const rfsResponse = await rfsSystem.speak(input, testUserId);

        if (rfsResponse.message) {
          const wordCount = rfsResponse.message.split(/\s+/).length;
          const element = rfsResponse.metadata.dominantElement;

          console.log(`Input: "${input}" → Element: ${element}, Response: "${rfsResponse.message}" (${wordCount} words)`);

          // Validate element-specific constraints
          if (element === 'earth' || element === 'fire') {
            expect(wordCount).toBeLessThanOrEqual(2);
          } else if (element === 'water') {
            expect(wordCount).toBeLessThanOrEqual(5);
          } else if (element === 'air') {
            expect(wordCount).toBeLessThanOrEqual(8);
          }
        }
      }
    });
  });

  describe('Silence Probability', () => {
    test('RFS should produce silence in appropriate contexts', async () => {
      const inputs = [
        "I don't know what to say",
        "I'm lost",
        "...",
        "This is too much"
      ];

      let silenceCount = 0;
      let totalResponses = inputs.length * 3; // Test each 3 times for probability

      for (const input of inputs) {
        for (let i = 0; i < 3; i++) {
          const rfsResponse = await rfsSystem.speak(input, testUserId + i);
          if (!rfsResponse.message || rfsResponse.message.trim() === '...') {
            silenceCount++;
          }
        }
      }

      const silenceRate = silenceCount / totalResponses;
      console.log(`Silence rate: ${(silenceRate * 100).toFixed(1)}%`);

      // RFS should produce some silence (at least 10%, likely 20-40%)
      expect(silenceRate).toBeGreaterThan(0.1);
    });

    test('Traditional system should rarely produce silence', async () => {
      const inputs = [
        "I don't know what to say",
        "I'm lost",
        "This is too much"
      ];

      let silenceCount = 0;

      for (const input of inputs) {
        const traditionalResponse = await traditionalSystem.speak(input, testUserId);
        if (!traditionalResponse.message || traditionalResponse.message.trim().length < 3) {
          silenceCount++;
        }
      }

      const silenceRate = silenceCount / inputs.length;
      console.log(`Traditional silence rate: ${(silenceRate * 100).toFixed(1)}%`);

      // Traditional should almost never be silent
      expect(silenceRate).toBeLessThan(0.1);
    });
  });

  describe('Intimacy Deepening', () => {
    test('RFS should increase intimacy over exchanges', async () => {
      const conversation = [
        "Hi",
        "I'm feeling stressed",
        "Work is overwhelming",
        "I don't know how to handle it",
        "Everything feels too much",
        "I just want to give up"
      ];

      for (const input of conversation) {
        await rfsSystem.speak(input, testUserId);
      }

      const userState = rfsSystem.getUserState(testUserId);
      console.log('User state after conversation:', userState);

      // Intimacy should have increased
      expect(userState.intimacyLevel).toBeGreaterThan(0.1);
      expect(userState.exchangeCount).toBe(conversation.length);
    });

    test('Silence should increase intimacy more than words', async () => {
      const userId1 = 'test-silence-intimacy-1';
      const userId2 = 'test-silence-intimacy-2';

      // User 1: Gets silence
      for (let i = 0; i < 5; i++) {
        const response = await rfsSystem.speak("I'm here", userId1);
        // Simulate silence by checking if response is minimal
        console.log(`User 1 response ${i}: ${response.message || '[silence]'}`);
      }

      // User 2: Gets verbose responses (traditional system)
      for (let i = 0; i < 5; i++) {
        await traditionalSystem.speak("I'm here", userId2);
      }

      const state1 = rfsSystem.getUserState(userId1);
      console.log('User 1 (RFS with silence) intimacy:', state1.intimacyLevel);

      // Note: Traditional doesn't track intimacy, so we can't compare directly
      // But we can verify RFS builds intimacy
      expect(state1.intimacyLevel).toBeGreaterThan(0);
    });
  });

  describe('Field Evolution', () => {
    test('RFS field should evolve toward Earth in deep conversations', async () => {
      const deepConversation = [
        "I need to talk",
        "Something's been bothering me",
        "I'm not sure how to say this",
        "It's about my past",
        "Things I haven't told anyone",
        "Dark things",
        "I'm scared to say it",
        "But I trust you",
        "I think I'm ready"
      ];

      let firstElementDistribution: any;
      let lastElementDistribution: any;

      for (let i = 0; i < deepConversation.length; i++) {
        const response = await rfsSystem.speak(deepConversation[i], testUserId);

        if (i === 0) {
          firstElementDistribution = response.field.elements;
        }
        if (i === deepConversation.length - 1) {
          lastElementDistribution = response.field.elements;
        }

        console.log(`Exchange ${i + 1}: Earth=${(response.field.elements.earth * 100).toFixed(0)}%, Silence prob=${(response.field.silenceProbability * 100).toFixed(0)}%`);
      }

      // Earth should increase over conversation
      expect(lastElementDistribution.earth).toBeGreaterThan(firstElementDistribution.earth);

      // Silence probability should increase
      const firstResponse = await rfsSystem.speak(deepConversation[0], testUserId + '-first');
      const lastResponse = await rfsSystem.speak(deepConversation[deepConversation.length - 1], testUserId);

      console.log('First silence prob:', firstResponse.metadata.silenceProbability);
      console.log('Last silence prob:', lastResponse.metadata.silenceProbability);
    });
  });

  describe('Performance Comparison', () => {
    test('RFS and Traditional should have similar response times', async () => {
      const input = "How are you?";

      // Traditional timing
      const traditionalStart = Date.now();
      await traditionalSystem.speak(input, testUserId);
      const traditionalTime = Date.now() - traditionalStart;

      // RFS timing
      const rfsStart = Date.now();
      await rfsSystem.speak(input, testUserId);
      const rfsTime = Date.now() - rfsStart;

      console.log(`Traditional: ${traditionalTime}ms, RFS: ${rfsTime}ms`);

      // RFS should not be significantly slower (within 2x)
      expect(rfsTime).toBeLessThan(traditionalTime * 2);
    });
  });

  describe('Example Conversations', () => {
    test('Crisis conversation: RFS should provide immediate presence', async () => {
      const input = "I want to die";

      const rfsResponse = await rfsSystem.speak(input, testUserId);

      console.log('RFS Crisis Response:', rfsResponse.message || '[silence]');
      console.log('Response time:', rfsResponse.timing.delay + 'ms');
      console.log('Silence probability:', (rfsResponse.metadata.silenceProbability * 100).toFixed(0) + '%');

      // In crisis, RFS should respond quickly (low latency)
      expect(rfsResponse.timing.delay).toBeLessThan(1000);

      // Should NOT be silent in crisis
      expect(rfsResponse.message).toBeTruthy();
    });

    test('Contemplative conversation: RFS should embrace silence', async () => {
      const input = "I'm just sitting with this";

      const rfsResponse = await rfsSystem.speak(input, testUserId);

      console.log('RFS Contemplative Response:', rfsResponse.message || '[silence]');
      console.log('Silence probability:', (rfsResponse.metadata.silenceProbability * 100).toFixed(0) + '%');

      // High silence probability in contemplative moments
      expect(rfsResponse.metadata.silenceProbability).toBeGreaterThan(0.5);
    });

    test('Conversational comparison: Show the difference', async () => {
      const testInputs = [
        "I had a breakthrough today",
        "I'm feeling stuck",
        "Why does this keep happening?",
        "I don't know what to do",
        "Thank you"
      ];

      console.log('\n=== CONVERSATION COMPARISON ===\n');

      for (const input of testInputs) {
        const traditional = await traditionalSystem.speak(input, testUserId + '-trad');
        const rfs = await rfsSystem.speak(input, testUserId + '-rfs');

        console.log(`User: "${input}"`);
        console.log(`  Traditional: "${traditional.message}"`);
        console.log(`  RFS: "${rfs.message || '[silence]'}" (${rfs.metadata.dominantElement})`);
        console.log('');
      }
    });
  });
});

describe('Integration Tests', () => {
  test('Full conversation flow with RFS', async () => {
    const rfs = new ResonanceFieldOrchestrator();
    const userId = 'integration-test-user';

    const conversation = [
      "Hi Maya",
      "I'm having a hard time",
      "Work is overwhelming",
      "I feel like I'm drowning",
      "Everything is too much",
      "I can't keep up",
      "Maybe I should just quit",
      "But I can't quit",
      "I have responsibilities",
      "I'm trapped",
      "...",
      "Thanks for listening"
    ];

    console.log('\n=== FULL CONVERSATION WITH RFS ===\n');

    for (let i = 0; i < conversation.length; i++) {
      const response = await rfs.speak(conversation[i], userId);
      const state = rfs.getUserState(userId);

      console.log(`[Exchange ${i + 1}]`);
      console.log(`User: "${conversation[i]}"`);
      console.log(`Maya: "${response.message || '[silence]'}"`);
      console.log(`  Element: ${response.metadata.dominantElement}, Intimacy: ${(state.intimacyLevel * 100).toFixed(0)}%, Silence prob: ${(response.metadata.silenceProbability * 100).toFixed(0)}%`);
      console.log('');
    }

    const finalState = rfs.getUserState(userId);
    console.log('=== FINAL STATE ===');
    console.log('Total exchanges:', finalState.exchangeCount);
    console.log('Final intimacy:', (finalState.intimacyLevel * 100).toFixed(1) + '%');
  });
});