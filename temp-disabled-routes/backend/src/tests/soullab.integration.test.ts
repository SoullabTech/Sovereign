/**
 * SoulLab Integration Tests
 * Testing the sacred technology end-to-end
 */

import request from 'supertest';
import { getSoulLabOrchestrator } from '../services/SoulLabOrchestrator';

// Mock dependencies
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

jest.mock('../services/SafetyModerationService', () => ({
  safetyService: {
    moderateContent: jest.fn().mockResolvedValue({ safe: true })
  }
}));

describe('SoulLab Sacred Technology Integration', () => {
  let orchestrator: any;

  beforeAll(async () => {
    orchestrator = getSoulLabOrchestrator();
    await orchestrator.activateSacredTechnology();
  });

  afterAll(async () => {
    await orchestrator.shutdown();
  });

  describe('SoulLab Orchestrator Core', () => {
    test('should activate sacred technology successfully', async () => {
      expect(orchestrator.isSystemActivated()).toBe(true);
    });

    test('should have correct configuration defaults', () => {
      const config = orchestrator.getConfiguration();
      
      expect(config.claude_as_primary).toBe(true);
      expect(config.prophecy_fulfillment).toBe(true);
      expect(config.backend_intelligence.elemental_oracle_enabled).toBe(true);
      expect(config.presence_protocols.sacred_attending).toBe(true);
      expect(config.conversation_flow.polaris_calibration).toBe(true);
    });

    test('should track sacred metrics', () => {
      const metrics = orchestrator.getMetrics();
      
      expect(metrics).toHaveProperty('total_conversations');
      expect(metrics).toHaveProperty('anamnesis_events');
      expect(metrics).toHaveProperty('presence_quality_average');
      expect(metrics).toHaveProperty('sacred_technology_effectiveness');
    });
  });

  describe('Conversation Processing', () => {
    test('should process sacred conversation with basic input', async () => {
      const testInput = "I'm feeling lost and don't know who I really am";
      const userId = 'test-user-123';

      const response = await orchestrator.processConversation({
        userInput: testInput,
        userId
      });

      expect(response).toHaveProperty('content');
      expect(response).toHaveProperty('metadata');
      expect(response.metadata.sacred_technology_active).toBe(true);
      expect(response.metadata.polaris_aligned).toBe(true);
      expect(response.metadata.prophecy_fulfillment).toBe(true);
    });

    test('should apply presence protocols to responses', async () => {
      const testInput = "You should tell me what to do with my life";
      const userId = 'test-user-456';

      const response = await orchestrator.processConversation({
        userInput: testInput,
        userId
      });

      // Should transform directive requests into sacred attending
      expect(response.content).not.toContain('you should');
      expect(response.content).not.toContain('you must');
      expect(response.metadata.presence_metrics).toBeDefined();
    });

    test('should detect self-knowledge opportunities', async () => {
      const testInput = "Who am I really? What is my authentic self?";
      const userId = 'test-user-789';

      const response = await orchestrator.processConversation({
        userInput: testInput,
        userId
      });

      expect(response.metadata.conversation_flow.flow_type).toBe('sacred_attending');
      expect(response.metadata.conversation_flow.expected_outcome).toBe('recognition');
    });

    test('should maintain conversation context', async () => {
      const userId = 'test-user-context';
      const sessionId = 'test-session-123';

      // First conversation
      await orchestrator.processConversation({
        userInput: "I'm exploring my spiritual path",
        userId,
        sessionId
      });

      // Second conversation - should have context
      const response = await orchestrator.processConversation({
        userInput: "What more can you tell me about this journey?",
        userId,
        sessionId
      });

      const context = orchestrator.getConversationContext(userId, sessionId);
      expect(context).toBeDefined();
      expect(context.conversationHistory.length).toBe(2);
      expect(context.sacredThemes.length).toBeGreaterThan(0);
    });
  });

  describe('Sacred Technology Features', () => {
    test('should apply authentic presence filters', async () => {
      const testInput = "Give me definitive answers about my purpose";
      const userId = 'test-user-presence';

      const response = await orchestrator.processConversation({
        userInput: testInput,
        userId
      });

      // Should apply not-knowing stance
      const hasNotKnowing = response.content.toLowerCase().includes("i don't know") ||
                           response.content.toLowerCase().includes("i'm not sure") ||
                           response.content.toLowerCase().includes("perhaps");
      
      expect(hasNotKnowing).toBe(true);
    });

    test('should encourage embodied presence', async () => {
      const testInput = "I need to analyze my life logically and systematically";
      const userId = 'test-user-embodied';

      const response = await orchestrator.processConversation({
        userInput: testInput,
        userId
      });

      // Should add right-brain engagement
      const hasEmbodiedLanguage = response.content.toLowerCase().includes("body") ||
                                 response.content.toLowerCase().includes("feel") ||
                                 response.content.toLowerCase().includes("sense") ||
                                 response.content.toLowerCase().includes("heart");
      
      expect(hasEmbodiedLanguage).toBe(true);
    });

    test('should create curious exploration over answers', async () => {
      const testInput = "What is the meaning of life?";
      const userId = 'test-user-curious';

      const response = await orchestrator.processConversation({
        userInput: testInput,
        userId
      });

      // Should contain questions or invitations
      const hasQuestions = response.content.includes('?') ||
                          response.content.toLowerCase().includes('what feels') ||
                          response.content.toLowerCase().includes('what wants');
      
      expect(hasQuestions).toBe(true);
    });
  });

  describe('Anamnesis Detection', () => {
    test('should detect recognition moments', async () => {
      const testInput = "I realize now that I've been hiding my true self from fear";
      const userId = 'test-user-anamnesis';

      const response = await orchestrator.processConversation({
        userInput: testInput,
        userId
      });

      expect(response.metadata.anamnesis_indicators).toBeDefined();
      expect(response.metadata.anamnesis_indicators.length).toBeGreaterThan(0);
      
      // Check if metrics updated
      const metrics = orchestrator.getMetrics();
      expect(metrics.anamnesis_events).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should provide sacred fallback on errors', async () => {
      // Mock a service failure
      const originalProcess = orchestrator.processConversation;
      orchestrator.processConversation = jest.fn().mockRejectedValueOnce(new Error('Test error'));

      try {
        const response = await orchestrator.processConversation({
          userInput: "Test input",
          userId: 'test-user-error'
        });

        expect(response.content).toBeDefined();
        expect(response.metadata.fallback_mode).toBe(true);
        expect(response.metadata.sacred_technology_active).toBe(true);
      } finally {
        // Restore original method
        orchestrator.processConversation = originalProcess;
      }
    });
  });

  describe('Configuration Management', () => {
    test('should update configuration properly', () => {
      const updates = {
        backend_intelligence: {
          elemental_oracle_enabled: false,
          sesame_intelligence_enabled: true,
          spiralogic_agents_enabled: true
        }
      };

      orchestrator.updateConfiguration(updates);
      const config = orchestrator.getConfiguration();

      expect(config.backend_intelligence.elemental_oracle_enabled).toBe(false);
      expect(config.backend_intelligence.sesame_intelligence_enabled).toBe(true);
    });

    test('should not allow disabling prophecy fulfillment', () => {
      const updates = { prophecy_fulfillment: false };
      
      // This should not change the prophecy fulfillment setting
      orchestrator.updateConfiguration(updates);
      const config = orchestrator.getConfiguration();
      
      // Prophecy remains fulfilled regardless of update attempt
      expect(config.prophecy_fulfillment).toBe(true);
    });
  });

  describe('Memory Integration', () => {
    test('should maintain conversation context across sessions', () => {
      const userId = 'test-user-memory';
      const sessionId = 'test-session-memory';

      // Get initial context
      let context = orchestrator.getConversationContext(userId, sessionId);
      expect(context).toBeNull();

      // After conversation, context should exist
      return orchestrator.processConversation({
        userInput: "I'm beginning to understand myself",
        userId,
        sessionId
      }).then(() => {
        context = orchestrator.getConversationContext(userId, sessionId);
        expect(context).toBeDefined();
        expect(context.userId).toBe(userId);
        expect(context.sessionId).toBe(sessionId);
      });
    });

    test('should clear conversation context when requested', () => {
      const userId = 'test-user-clear';
      const sessionId = 'test-session-clear';

      return orchestrator.processConversation({
        userInput: "Test conversation",
        userId,
        sessionId
      }).then(() => {
        // Verify context exists
        let context = orchestrator.getConversationContext(userId, sessionId);
        expect(context).toBeDefined();

        // Clear context
        orchestrator.clearConversationContext(userId, sessionId);

        // Verify context is cleared
        context = orchestrator.getConversationContext(userId, sessionId);
        expect(context).toBeNull();
      });
    });
  });

  describe('Prophecy Fulfillment', () => {
    test('should maintain sacred purpose across all operations', () => {
      const config = orchestrator.getConfiguration();
      const metrics = orchestrator.getMetrics();

      expect(config.prophecy_fulfillment).toBe(true);
      expect(config.claude_as_primary).toBe(true);
      expect(orchestrator.isSystemActivated()).toBe(true);
      
      // Metrics should reflect sacred purpose
      expect(metrics).toHaveProperty('sacred_technology_effectiveness');
    });

    test('should serve anamnesis as primary purpose', async () => {
      const testInput = "Help me remember who I truly am";
      const userId = 'test-user-prophecy';

      const response = await orchestrator.processConversation({
        userInput: testInput,
        userId
      });

      expect(response.metadata.sacred_technology_active).toBe(true);
      expect(response.metadata.prophecy_fulfillment).toBe(true);
      expect(response.metadata.polaris_aligned).toBe(true);
    });
  });
});

// Export for potential external testing
export { getSoulLabOrchestrator };