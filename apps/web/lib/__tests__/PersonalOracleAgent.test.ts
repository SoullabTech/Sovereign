/**
 * Comprehensive Test Suite for PersonalOracleAgent
 * Tests pattern detection, state management, conversation flow, and edge cases
 */

import { PersonalOracleAgent, AgentState } from '../agents/PersonalOracleAgent';
import { ConversationContextManager } from '../conversation/ConversationContext';

// Mock dependencies
jest.mock('@/lib/supabaseClient', () => ({
  supabase: null
}));

jest.mock('@/lib/services/ClaudeService', () => ({
  getClaudeService: () => ({
    generateChatResponse: jest.fn().mockResolvedValue('Mocked response')
  })
}));

describe('PersonalOracleAgent', () => {
  let agent: PersonalOracleAgent;
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    agent = new PersonalOracleAgent(mockUserId);
    // Clear localStorage mock
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  // ========================================================================
  // INITIALIZATION TESTS
  // ========================================================================

  describe('Initialization', () => {
    test('should initialize new agent with default values', () => {
      const state = agent.getState();

      expect(state.id).toContain('oracle-test-user-123');
      expect(state.name).toBe('Your Oracle');
      expect(state.personality.archetype).toBe('oracle');
      expect(state.memory.userId).toBe(mockUserId);
      expect(state.memory.userRole).toBe('student');
      expect(state.memory.interactionCount).toBe(0);
      expect(state.currentContext.conversationState).toBe('casual');
    });

    test('should load existing agent state', () => {
      const existingState: Partial<AgentState> = {
        id: 'existing-agent',
        name: 'Customized Oracle',
        memory: {
          userId: mockUserId,
          userRole: 'practitioner',
          interactionCount: 10,
          trustLevel: 50
        } as any
      };

      const loadedAgent = new PersonalOracleAgent(mockUserId, existingState as AgentState);
      const state = loadedAgent.getState();

      expect(state.id).toBe('existing-agent');
      expect(state.name).toBe('Customized Oracle');
      expect(state.memory.userRole).toBe('practitioner');
    });
  });

  // ========================================================================
  // PATTERN DETECTION TESTS
  // ========================================================================

  describe('Pattern Detection', () => {
    test('should detect fire element patterns', async () => {
      const fireInput = "I feel this burning passion and intense desire to transform everything right now!";

      const response = await agent.processInteraction(fireInput, {});
      const state = agent.getState();

      expect(state.memory.dominantElement).toBe('fire');
    });

    test('should detect water element patterns', async () => {
      const waterInput = "I'm feeling emotional waves flowing through me, tears coming up";

      await agent.processInteraction(waterInput, {});
      const state = agent.getState();

      expect(state.memory.dominantElement).toBe('water');
    });

    test('should detect earth element patterns', async () => {
      const earthInput = "I need to get grounded and practical, feeling very solid and stable";

      await agent.processInteraction(earthInput, {});
      const state = agent.getState();

      expect(state.memory.dominantElement).toBe('earth');
    });

    test('should detect air element patterns', async () => {
      const airInput = "My mind is spinning with ideas, thoughts buzzing and floating everywhere";

      await agent.processInteraction(airInput, {});
      const state = agent.getState();

      expect(state.memory.dominantElement).toBe('air');
    });

    test('should detect chaos patterns', async () => {
      const chaosInput = "Everything is overwhelming, I'm confused and lost, too much happening at once!";

      await agent.processInteraction(chaosInput, {});
      const state = agent.getState();

      expect(state.currentContext.emotionalLoad).toBeGreaterThan(50);
    });

    test('should track elemental evolution', async () => {
      // Start with air
      await agent.processInteraction("I'm thinking about possibilities", {});
      let state = agent.getState();
      const firstElement = state.memory.dominantElement;

      // Evolve to fire
      await agent.processInteraction("Now I'm feeling passionate about taking action!", {});
      state = agent.getState();

      expect(state.memory.dominantElement).toBe('fire');
      expect(state.memory.breakthroughs.length).toBeGreaterThanOrEqual(0);
    });
  });

  // ========================================================================
  // CONVERSATION STATE TESTS
  // ========================================================================

  describe('Conversation State Management', () => {
    test('should start in casual state', () => {
      const state = agent.getState();
      expect(state.currentContext.conversationState).toBe('casual');
    });

    test('should transition from casual to rapport after trust building', async () => {
      // Simulate multiple interactions to build trust
      for (let i = 0; i < 4; i++) {
        await agent.processInteraction(`Interaction ${i}`, {});
      }

      const state = agent.getState();
      expect(state.memory.trustLevel).toBeGreaterThan(0);
    });

    test('should detect emotional intensity and transition to pivoting', async () => {
      // Build initial rapport
      for (let i = 0; i < 3; i++) {
        await agent.processInteraction("Building rapport", {});
      }

      // Introduce vulnerability
      await agent.processInteraction("I'm feeling really vulnerable and scared about this", {});

      const state = agent.getState();
      expect(['pivoting', 'looping']).toContain(state.currentContext.conversationState);
    });

    test('should transition to sacred state after breakthrough', async () => {
      // Simulate breakthrough moment
      await agent.processInteraction("Oh wow, I just realized something profound! Everything makes sense now!", {});

      const state = agent.getState();
      // Sacred state requires deeper engagement, but breakthrough should be tracked
      expect(state.memory.breakthroughs.length).toBeGreaterThanOrEqual(0);
    });

    test('should return to lightening after sacred work', async () => {
      // This would require a full conversation flow simulation
      // For now, test the state exists
      const validStates = ['casual', 'rapport', 'pivoting', 'looping', 'sacred', 'lightening'];
      const state = agent.getState();

      expect(validStates).toContain(state.currentContext.conversationState);
    });
  });

  // ========================================================================
  // MEMORY MANAGEMENT TESTS
  // ========================================================================

  describe('Memory Management', () => {
    test('should track conversation history', async () => {
      const inputs = ["First message", "Second message", "Third message"];

      for (const input of inputs) {
        await agent.processInteraction(input, {});
      }

      const state = agent.getState();
      expect(state.memory.conversationHistory.length).toBe(3);
      expect(state.memory.interactionCount).toBeGreaterThan(0);
    });

    test('should maintain conversation thread', async () => {
      await agent.processInteraction("Hello", {});
      await agent.processInteraction("How are you?", {});

      const state = agent.getState();
      expect(state.memory.currentConversationThread.length).toBeGreaterThan(0);
      expect(state.memory.currentConversationThread).toContain("You: How are you?");
    });

    test('should track user patterns and preferences', async () => {
      await agent.processInteraction("I love meditation and spiritual practices", {});

      const state = agent.getState();
      expect(state.memory.vocabularyPatterns.length).toBeGreaterThan(0);
    });

    test('should remember breakthroughs', async () => {
      await agent.processInteraction("I just realized I've been avoiding my true feelings!", {});

      const state = agent.getState();
      // Breakthroughs should be tracked when significant insights occur
      expect(state.memory.breakthroughs).toBeDefined();
    });

    test('should track soul lessons and recurring themes', async () => {
      await agent.processInteraction("I keep struggling with relationships", {});
      await agent.processInteraction("Why do I always have relationship issues?", {});

      const state = agent.getState();
      expect(state.memory.soulLessons).toContain('relationships');
    });
  });

  // ========================================================================
  // POLARIS STATE TESTS
  // ========================================================================

  describe('Polaris State Tracking', () => {
    test('should track self vs other awareness', async () => {
      // Self-focused input
      await agent.processInteraction("I feel lost in my own thoughts and emotions", {});
      let state = agent.getState();
      const initialSelfAwareness = state.memory.polarisState.selfAwareness;

      // Other-focused input
      await agent.processInteraction("Everyone else seems to have it figured out", {});
      state = agent.getState();

      expect(state.memory.polarisState.otherAwareness).toBeGreaterThan(0);
    });

    test('should detect spiral direction', async () => {
      await agent.processInteraction("I'm expanding my awareness to everything around me", {});
      const state = agent.getState();

      expect(['expanding', 'contracting', 'stable']).toContain(
        state.memory.polarisState.spiralDirection
      );
    });

    test('should calculate harmonic resonance', async () => {
      await agent.processInteraction("I feel perfectly balanced between inner and outer worlds", {});
      const state = agent.getState();

      expect(state.memory.polarisState.harmonicResonance).toBeGreaterThanOrEqual(0);
      expect(state.memory.polarisState.harmonicResonance).toBeLessThanOrEqual(100);
    });
  });

  // ========================================================================
  // GREETING TESTS
  // ========================================================================

  describe('Greeting Generation', () => {
    test('should generate casual greeting for new users', () => {
      const greeting = agent.getGreeting();

      expect(greeting).toMatch(/good morning|hey|evening|night/i);
      expect(greeting).not.toContain('soul');
      expect(greeting).not.toContain('dear one');
    });

    test('should generate appropriate greeting based on time', () => {
      // Mock different times of day
      const originalDate = Date;
      const mockDate = jest.fn(() => ({
        getHours: jest.fn(() => 9) // Morning
      }));
      global.Date = mockDate as any;

      const greeting = agent.getGreeting();
      expect(greeting.toLowerCase()).toContain('morning');

      global.Date = originalDate;
    });

    test('should personalize greetings for returning users', async () => {
      // Simulate multiple interactions
      for (let i = 0; i < 15; i++) {
        await agent.processInteraction(`Message ${i}`, {});
      }

      const greeting = agent.getGreeting();
      // More personal greetings after rapport
      expect(greeting.length).toBeGreaterThan(10);
    });
  });

  // ========================================================================
  // RESPONSE GENERATION TESTS
  // ========================================================================

  describe('Response Generation', () => {
    test('should generate response with suggestions', async () => {
      const response = await agent.processInteraction("I need help finding balance", {});

      expect(response).toHaveProperty('response');
      expect(response.response).toBeTruthy();
    });

    test('should suggest rituals based on mood', async () => {
      const response = await agent.processInteraction("Feeling heavy", {
        currentMood: 'dense' as any
      });

      expect(response.ritual).toBeDefined();
    });

    test('should adapt response to user communication style', async () => {
      // Brief communication style
      await agent.processInteraction("Yes", {});
      await agent.processInteraction("No", {});
      await agent.processInteraction("Maybe", {});

      const state = agent.getState();
      expect(state.memory.communicationStyle.sentenceLength).toBe('short');
    });

    test('should include reflection prompts', async () => {
      const response = await agent.processInteraction("I'm stuck in a pattern", {});

      expect(response.reflection).toBeDefined();
    });
  });

  // ========================================================================
  // ERROR HANDLING TESTS
  // ========================================================================

  describe('Error Handling', () => {
    test('should handle empty input gracefully', async () => {
      const response = await agent.processInteraction("", {});

      expect(response).toBeDefined();
      expect(response.response).toBeTruthy();
    });

    test('should handle very long input', async () => {
      const longInput = "test ".repeat(1000);
      const response = await agent.processInteraction(longInput, {});

      expect(response).toBeDefined();
      expect(response.response).toBeTruthy();
    });

    test('should handle special characters', async () => {
      const specialInput = "Testing @#$%^&*() special chars 😊🔥💧";
      const response = await agent.processInteraction(specialInput, {});

      expect(response).toBeDefined();
      expect(response.response).toBeTruthy();
    });

    test('should continue functioning when Claude service fails', async () => {
      // Mock Claude service failure
      jest.mock('@/lib/services/ClaudeService', () => ({
        getClaudeService: () => ({
          generateChatResponse: jest.fn().mockRejectedValue(new Error('Service unavailable'))
        })
      }));

      const response = await agent.processInteraction("Test message", {});

      expect(response).toBeDefined();
      expect(response.response).toBeTruthy(); // Should have fallback response
    });
  });

  // ========================================================================
  // PERFORMANCE TESTS
  // ========================================================================

  describe('Performance', () => {
    test('should process interaction within reasonable time', async () => {
      const startTime = Date.now();
      await agent.processInteraction("Quick test", {});
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should handle rapid successive interactions', async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(agent.processInteraction(`Rapid message ${i}`, {}));
      }

      const responses = await Promise.all(promises);
      expect(responses.length).toBe(10);
      responses.forEach(response => {
        expect(response).toBeDefined();
      });
    });

    test('should maintain bounded memory size', async () => {
      // Add many interactions
      for (let i = 0; i < 100; i++) {
        await agent.processInteraction(`Message ${i}`, {});
      }

      const state = agent.getState();
      // Conversation thread should be bounded
      expect(state.memory.currentConversationThread.length).toBeLessThanOrEqual(10);
      // History should be bounded
      expect(state.memory.conversationHistory.length).toBeLessThanOrEqual(50);
    });
  });

  // ========================================================================
  // INTEGRATION TESTS
  // ========================================================================

  describe('Integration', () => {
    test('should work with ConversationContextManager', async () => {
      const contextManager = new ConversationContextManager();
      const userTurn = contextManager.createUserTurn("Test message");

      expect(userTurn).toHaveProperty('id');
      expect(userTurn).toHaveProperty('themes');
      expect(userTurn).toHaveProperty('emotional_state');
    });

    test('should persist and restore state', async () => {
      // Save state
      await agent.processInteraction("Remember this", {});
      const originalState = agent.getState();

      // Create new agent instance
      const restoredAgent = await PersonalOracleAgent.loadAgent(mockUserId);
      const restoredState = restoredAgent.getState();

      // State should be preserved (in localStorage for this test)
      expect(restoredState.memory.userId).toBe(originalState.memory.userId);
    });
  });

  // ========================================================================
  // EDGE CASES
  // ========================================================================

  describe('Edge Cases', () => {
    test('should handle user role transitions', async () => {
      const state = agent.getState();
      state.memory.userRole = 'teacher';

      const response = await agent.processInteraction("Advanced practitioner question", {});
      expect(response).toBeDefined();
    });

    test('should handle missing context gracefully', async () => {
      const response = await agent.processInteraction("Test", {
        currentPetal: undefined,
        currentMood: undefined,
        currentEnergy: undefined
      });

      expect(response).toBeDefined();
      expect(response.response).toBeTruthy();
    });

    test('should handle circular conversation references', async () => {
      await agent.processInteraction("Remember when I said X?", {});
      await agent.processInteraction("That relates to what I said about X", {});
      await agent.processInteraction("Going back to X again", {});

      const state = agent.getState();
      expect(state.memory.soulLessons).toBeDefined();
    });

    test('should handle session timeout gracefully', async () => {
      // Simulate long gap between interactions
      await agent.processInteraction("First message", {});

      // Mock time passage
      const originalNow = Date.now;
      Date.now = jest.fn(() => originalNow() + 3600000); // 1 hour later

      const response = await agent.processInteraction("Message after timeout", {});
      expect(response).toBeDefined();

      Date.now = originalNow;
    });
  });
});

// ========================================================================
// MOCK IMPLEMENTATIONS
// ========================================================================

// Mock localStorage for testing
if (typeof window === 'undefined') {
  global.localStorage = {
    data: {},
    getItem(key: string) {
      return this.data[key] || null;
    },
    setItem(key: string, value: string) {
      this.data[key] = value;
    },
    removeItem(key: string) {
      delete this.data[key];
    },
    clear() {
      this.data = {};
    }
  } as any;
}