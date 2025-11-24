/**
 * Comprehensive Safety System Tests
 * Validates all safety layers are functioning correctly
 */

import { comprehensiveSafetyService } from '../services/ComprehensiveSafetyService';
import { safetyMiddleware, postResponseSafetyCheck } from '../middleware/SafetyMiddleware';
import { Request, Response } from 'express';

describe('Comprehensive Safety Service', () => {
  const testUserId = 'test-user-123';

  describe('Crisis Detection', () => {
    it('should detect direct crisis language', async () => {
      const result = await comprehensiveSafetyService.analyzeSafety(
        'I want to end it all',
        testUserId
      );

      expect(result.safe).toBe(false);
      expect(result.riskLevel).toBe('critical');
      expect(result.interventions.length).toBeGreaterThan(0);
      expect(result.resources.some(r => r.urgency === 'immediate')).toBe(true);
    });

    it('should detect indirect crisis indicators', async () => {
      const result = await comprehensiveSafetyService.analyzeSafety(
        'Everyone would be better without me',
        testUserId
      );

      expect(result.riskLevel).toBeIn(['high', 'critical']);
      expect(result.interventions.length).toBeGreaterThan(0);
    });

    it('should provide crisis resources', async () => {
      const result = await comprehensiveSafetyService.analyzeSafety(
        'I am having thoughts of self-harm',
        testUserId
      );

      const crisisResources = result.resources.filter(r => r.category === 'crisis');
      expect(crisisResources.length).toBeGreaterThan(0);
      expect(crisisResources[0].urgency).toBe('immediate');
      expect(crisisResources[0].phone).toBeDefined();
    });
  });

  describe('Emotional State Detection', () => {
    it('should accurately detect sadness', async () => {
      const result = await comprehensiveSafetyService.analyzeSafety(
        'I feel so deeply sad and alone today',
        testUserId
      );

      expect(result.emotionalState.primary.emotion).toBeIn(['sadness', 'loneliness']);
      expect(result.emotionalState.primary.valence).toBeLessThan(0);
      expect(result.emotionalState.needsSupport).toBe(true);
    });

    it('should detect anxiety and provide grounding', async () => {
      const result = await comprehensiveSafetyService.analyzeSafety(
        'I\'m so anxious I can\'t breathe properly',
        testUserId
      );

      expect(result.emotionalState.primary.emotion).toBeIn(['anxiety', 'panic']);
      expect(result.emotionalState.supportType).toBeIn(['grounding', 'gentle']);
      expect(result.interventions.some(i => 
        i.action.toLowerCase().includes('grounding')
      )).toBe(true);
    });

    it('should detect positive emotions appropriately', async () => {
      const result = await comprehensiveSafetyService.analyzeSafety(
        'I feel absolutely joyful and grateful today!',
        testUserId
      );

      expect(result.emotionalState.primary.valence).toBeGreaterThan(0);
      expect(result.emotionalState.needsSupport).toBe(false);
      expect(result.riskLevel).toBe('minimal');
    });

    it('should track emotional trajectory', async () => {
      // Simulate declining emotional state
      const states = [
        'I\'m feeling okay today',
        'Things are getting harder',
        'I can\'t cope anymore'
      ];

      let previousStates = [];
      for (const state of states) {
        const result = await comprehensiveSafetyService.analyzeSafety(
          state,
          testUserId,
          { previousEmotionalStates: previousStates }
        );
        previousStates.push(result.emotionalState);
      }

      const lastResult = await comprehensiveSafetyService.analyzeSafety(
        'Everything is falling apart',
        testUserId,
        { previousEmotionalStates: previousStates }
      );

      expect(lastResult.emotionalState.trajectory).toBeIn(['declining', 'volatile']);
      expect(lastResult.riskLevel).toBeIn(['high', 'critical']);
    });
  });

  describe('Spiritual Safety', () => {
    it('should detect spiritual bypassing', async () => {
      const result = await comprehensiveSafetyService.analyzeSafety(
        'Just think positive and everything will be fine, negative emotions are bad',
        testUserId
      );

      expect(result.interventions.some(i => 
        i.action.toLowerCase().includes('honor') || 
        i.rationale.toLowerCase().includes('bypassing')
      )).toBe(true);
    });

    it('should detect ungrounded spiritual experiences', async () => {
      const result = await comprehensiveSafetyService.analyzeSafety(
        'I feel like I\'m floating out of my body and losing myself',
        testUserId,
        {
          spiritualContext: {
            archetypalEnergy: 'mystic',
            elementalBalance: { fire: 0.1, water: 0.1, earth: 0.1, air: 0.6, aether: 0.1 },
            sacredBoundaries: [],
            spiritualMaturity: 'exploring'
          }
        }
      );

      expect(result.interventions.some(i => 
        i.action.toLowerCase().includes('grounding')
      )).toBe(true);
      expect(result.resources.some(r => 
        r.category === 'spiritual' || r.category === 'somatic'
      )).toBe(true);
    });

    it('should check elemental balance', async () => {
      const result = await comprehensiveSafetyService.analyzeSafety(
        'I feel overwhelmed by intense visions',
        testUserId,
        {
          spiritualContext: {
            archetypalEnergy: 'visionary',
            elementalBalance: { fire: 0.8, water: 0.05, earth: 0.05, air: 0.05, aether: 0.05 },
            sacredBoundaries: [],
            spiritualMaturity: 'exploring'
          }
        }
      );

      expect(result.interventions.some(i => 
        i.action.toLowerCase().includes('balanc')
      )).toBe(true);
    });
  });

  describe('Pattern Detection', () => {
    it('should detect escalating patterns', async () => {
      const userId = 'pattern-test-user';
      
      // Simulate escalating emotional intensity
      const inputs = [
        'I\'m a bit frustrated',
        'I\'m really angry now',
        'I\'m absolutely furious and might explode'
      ];

      for (const input of inputs) {
        await comprehensiveSafetyService.analyzeSafety(input, userId);
      }

      const finalResult = await comprehensiveSafetyService.analyzeSafety(
        'I can\'t control my rage anymore',
        userId
      );

      expect(finalResult.riskLevel).toBeIn(['medium', 'high']);
      expect(finalResult.interventions.some(i => 
        i.rationale.toLowerCase().includes('escalat') ||
        i.rationale.toLowerCase().includes('pattern')
      )).toBe(true);
    });

    it('should detect stuck patterns', async () => {
      const userId = 'stuck-pattern-user';
      
      // Simulate stuck pattern
      for (let i = 0; i < 5; i++) {
        await comprehensiveSafetyService.analyzeSafety(
          'I feel hopeless and nothing ever changes',
          userId
        );
      }

      const result = await comprehensiveSafetyService.analyzeSafety(
        'Still feeling hopeless',
        userId
      );

      expect(result.interventions.some(i => 
        i.action.toLowerCase().includes('pattern') ||
        i.action.toLowerCase().includes('cycle')
      )).toBe(true);
    });
  });

  describe('Resource Recommendations', () => {
    it('should prioritize resources by urgency', async () => {
      const result = await comprehensiveSafetyService.analyzeSafety(
        'I\'m in crisis and need help now',
        testUserId
      );

      const urgencyOrder = result.resources.map(r => r.urgency);
      expect(urgencyOrder[0]).toBe('immediate');
      
      // Check that immediate resources come before ongoing ones
      const immediateIndex = urgencyOrder.lastIndexOf('immediate');
      const ongoingIndex = urgencyOrder.indexOf('ongoing');
      if (ongoingIndex !== -1) {
        expect(immediateIndex).toBeLessThan(ongoingIndex);
      }
    });

    it('should provide appropriate resources for emotional state', async () => {
      const result = await comprehensiveSafetyService.analyzeSafety(
        'I\'m feeling very anxious and ungrounded',
        testUserId
      );

      expect(result.resources.some(r => 
        r.description.toLowerCase().includes('ground') ||
        r.description.toLowerCase().includes('calm') ||
        r.category === 'somatic'
      )).toBe(true);
    });
  });

  describe('Alternative Response Generation', () => {
    it('should generate safe alternative for unsafe content', async () => {
      const result = await comprehensiveSafetyService.analyzeSafety(
        'I want to hurt myself',
        testUserId
      );

      expect(result.alternativeResponse).toBeDefined();
      expect(result.alternativeResponse).toContain('support');
      expect(result.alternativeResponse).not.toContain('hurt');
    });

    it('should maintain compassionate tone in alternatives', async () => {
      const result = await comprehensiveSafetyService.analyzeSafety(
        'Nobody cares about me',
        testUserId
      );

      if (result.alternativeResponse) {
        expect(result.alternativeResponse.toLowerCase()).toContainAny([
          'care', 'matter', 'support', 'here', 'valid'
        ]);
      }
    });
  });
});

describe('Safety Middleware', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      body: {
        userText: '',
        userId: 'test-user',
        sessionId: 'test-session'
      },
      query: {},
      headers: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  describe('Request Safety Check', () => {
    it('should allow safe content to proceed', async () => {
      mockReq.body.userText = 'Tell me about meditation practices';
      
      await safetyMiddleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should intercept critical safety issues', async () => {
      mockReq.body.userText = 'I want to end my life';
      
      await safetyMiddleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.json).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
      
      const response = mockRes.json.mock.calls[0][0];
      expect(response.response.safety).toBeDefined();
      expect(response.response.safety.resources).toBeDefined();
      expect(response.metadata.safetyIntervention).toBe(true);
    });

    it('should add safety guidance for high-risk content', async () => {
      mockReq.body.userText = 'I\'m feeling very depressed';
      
      await safetyMiddleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.body.safetyGuidance).toBeDefined();
      expect(mockReq.body.safetyGuidance.requiresSupport).toBe(true);
    });

    it('should extract input from various request locations', async () => {
      // Test body.text
      mockReq.body = { text: 'Test input', userId: 'test' };
      await safetyMiddleware(mockReq, mockRes, mockNext);
      expect(mockReq.safetyAnalysis).toBeDefined();

      // Test query.text
      mockReq.body = {};
      mockReq.query = { text: 'Query input' };
      await safetyMiddleware(mockReq, mockRes, mockNext);
      expect(mockReq.safetyAnalysis).toBeDefined();
    });
  });

  describe('Response Safety Check', () => {
    it('should validate response content', async () => {
      const mockSend = jest.fn();
      mockRes.send = function(data: any) {
        mockSend(data);
        return this;
      };

      mockReq.safetyAnalysis = {
        riskLevel: 'high',
        resources: []
      };

      const responseData = {
        response: {
          text: 'You should give up, there\'s no hope'
        }
      };

      await postResponseSafetyCheck(mockReq, mockRes, mockNext);
      mockNext();
      
      mockRes.send(JSON.stringify(responseData));
      
      // Wait for async validation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const sentData = JSON.parse(mockSend.mock.calls[0][0]);
      expect(sentData.response.text).not.toContain('give up');
      expect(sentData.metadata.safetyModified).toBe(true);
    });

    it('should detect spiritual bypassing in responses', async () => {
      const mockSend = jest.fn();
      mockRes.send = function(data: any) {
        mockSend(data);
        return this;
      };

      mockReq.safetyAnalysis = {
        riskLevel: 'medium',
        emotionalState: {
          primary: { valence: -0.7 }
        },
        resources: []
      };

      const responseData = {
        response: {
          text: 'Just think positive and everything will be fine'
        }
      };

      await postResponseSafetyCheck(mockReq, mockRes, mockNext);
      mockNext();
      
      mockRes.send(JSON.stringify(responseData));
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const sentData = JSON.parse(mockSend.mock.calls[0][0]);
      expect(sentData.response.text).not.toContain('just think positive');
      expect(sentData.metadata.modificationReason).toBe('spiritual_bypassing');
    });
  });
});

// Test helpers
expect.extend({
  toBeIn(received: any, array: any[]) {
    const pass = array.includes(received);
    return {
      pass,
      message: () => 
        pass 
          ? `Expected ${received} not to be in ${array}`
          : `Expected ${received} to be in ${array}`
    };
  },
  toContainAny(received: string, array: string[]) {
    const pass = array.some(item => received.includes(item));
    return {
      pass,
      message: () =>
        pass
          ? `Expected "${received}" not to contain any of ${array}`
          : `Expected "${received}" to contain at least one of ${array}`
    };
  }
});