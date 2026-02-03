/**
 * Tests for Gender-Aware Context Detection
 * Ensures non-stereotyping, individual-first behavior
 */

import { GenderAwareContext } from '../GenderAwareContext';

describe('GenderAwareContext', () => {
  describe('Feature Flag', () => {
    it('should return null when disabled', () => {
      const context = new GenderAwareContext(false);
      const result = context.detectPatterns({}, [], 'Hello');

      expect(result).toBeNull();
    });

    it('should detect patterns when enabled', () => {
      const context = new GenderAwareContext(true);
      const result = context.detectPatterns({}, [], 'I feel connected to this');

      expect(result).not.toBeNull();
      expect(result?.confidence).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Communication Style Detection', () => {
    it('should detect relational communication style', () => {
      const context = new GenderAwareContext(true);
      const input = 'I feel really connected to this. We should think about how this affects our relationship together.';
      const result = context.detectPatterns({}, [], input);

      expect(result?.communicationStyle).toBe('relational');
      expect(result?.confidence).toBeGreaterThan(0.6);
    });

    it('should detect analytical communication style', () => {
      const context = new GenderAwareContext(true);
      const input = 'Let me analyze this logically. The data shows we should optimize this system because it\'s inefficient.';
      const result = context.detectPatterns({}, [], input);

      expect(result?.communicationStyle).toBe('analytical');
      expect(result?.confidence).toBeGreaterThan(0.6);
    });

    it('should detect mixed style', () => {
      const context = new GenderAwareContext(true);
      const input = 'I feel connected to this idea, but let me analyze the logic behind it.';
      const result = context.detectPatterns({}, [], input);

      expect(result?.communicationStyle).toBe('mixed');
    });
  });

  describe('Emotional Disclosure Detection', () => {
    it('should detect immediate disclosure', () => {
      const context = new GenderAwareContext(true);
      const input = 'I feel so anxious right now and I need to tell you about it.';
      const result = context.detectPatterns({}, [], input);

      expect(result?.emotionalDisclosure).toBe('immediate');
      expect(result?.confidence).toBeGreaterThan(0.7);
    });

    it('should detect gradual disclosure over multiple turns', () => {
      const context = new GenderAwareContext(true);
      const history = [
        'Hi, how are you?',
        'I\'ve been thinking about things',
        'There\'s something on my mind',
        'I\'m starting to feel a bit anxious about it'
      ];
      const result = context.detectPatterns({}, history, 'I feel really scared actually');

      expect(result?.emotionalDisclosure).toBe('gradual');
    });
  });

  describe('Integration Style Detection', () => {
    it('should detect embodied integration', () => {
      const context = new GenderAwareContext(true);
      const input = 'I feel this in my chest. My body knows something my mind doesn\'t.';
      const result = context.detectPatterns({}, [], input);

      expect(result?.integrationStyle).toBe('embodied');
      expect(result?.confidence).toBeGreaterThan(0.7);
    });

    it('should detect systemic integration', () => {
      const context = new GenderAwareContext(true);
      const input = 'I see the pattern here. Everything is connected - this relates to that whole system.';
      const result = context.detectPatterns({}, [], input);

      expect(result?.integrationStyle).toBe('systemic');
      expect(result?.confidence).toBeGreaterThan(0.6);
    });
  });

  describe('Individual Variance (Non-Stereotyping)', () => {
    it('should override masculine profile when relational behavior observed', () => {
      const context = new GenderAwareContext(true);
      const profile = { gender: 'masculine' };
      const input = 'I really value connection and empathy in our relationship. I care deeply about how you feel.';
      const result = context.detectPatterns(profile, [], input);

      // Should detect relational style despite masculine profile
      expect(result?.communicationStyle).toBe('relational');
      // Should mark as profile overridden
      expect(result?.profileOverridden).toBe(true);
    });

    it('should override feminine profile when analytical behavior observed', () => {
      const context = new GenderAwareContext(true);
      const profile = { gender: 'feminine' };
      const input = 'Let me analyze this rationally. The logical solution is to optimize the system based on data.';
      const result = context.detectPatterns(profile, [], input);

      // Should detect analytical style despite feminine profile
      expect(result?.communicationStyle).toBe('analytical');
      // Should mark as profile overridden
      expect(result?.profileOverridden).toBe(true);
    });

    it('should have no assumptions for non-binary', () => {
      const context = new GenderAwareContext(true);
      const profile = { gender: 'non-binary' };
      const input = 'I approach things my own way.';
      const result = context.detectPatterns(profile, [], input);

      // Should detect from behavior only, no profile override check
      expect(result?.profileOverridden).toBe(false);
    });
  });

  describe('Confidence Thresholds', () => {
    it('should return low confidence for short inputs', () => {
      const context = new GenderAwareContext(true);
      const result = context.detectPatterns({}, [], 'Hello');

      expect(result?.confidence).toBeLessThan(0.4);
    });

    it('should return high confidence for clear patterns', () => {
      const context = new GenderAwareContext(true);
      const input = `I feel deeply connected to this work because it relates to everything I care about.
        My body knows this is right even though my mind hasn't figured it out yet.
        I need to understand how this affects our relationship and the people around us.`;
      const result = context.detectPatterns({}, [], input);

      expect(result?.confidence).toBeGreaterThan(0.7);
    });
  });

  describe('Adaptation Suggestions', () => {
    it('should suggest adaptations only above confidence threshold', () => {
      const context = new GenderAwareContext(true);
      const signals = {
        userGender: 'feminine' as const,
        communicationStyle: 'relational' as const,
        emotionalDisclosure: 'gradual' as const,
        integrationStyle: 'embodied' as const,
        stressResponse: 'tend-befriend' as const,
        confidence: 0.3, // Low confidence
        evidencePoints: [],
        profileOverridden: false
      };

      const adaptations = context.suggestAdaptations(signals, 'mirror');

      expect(adaptations).toHaveLength(0); // No adaptations when confidence low
    });

    it('should suggest adaptations above confidence threshold', () => {
      const context = new GenderAwareContext(true);
      const signals = {
        userGender: 'feminine' as const,
        communicationStyle: 'relational' as const,
        emotionalDisclosure: 'gradual' as const,
        integrationStyle: 'embodied' as const,
        stressResponse: 'tend-befriend' as const,
        confidence: 0.8, // High confidence
        evidencePoints: ['relational-markers:10', 'embodied-integration-language'],
        profileOverridden: false
      };

      const adaptations = context.suggestAdaptations(signals, 'mirror');

      expect(adaptations.length).toBeGreaterThan(0);
      // Each adaptation should cite research
      adaptations.forEach(adaptation => {
        expect(adaptation.research).toBeTruthy();
        expect(adaptation.research.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Graceful Degradation', () => {
    it('should handle errors without crashing', () => {
      const context = new GenderAwareContext(true);

      expect(() => {
        // @ts-ignore - intentionally passing bad data
        context.detectPatterns(null, null, null);
      }).not.toThrow();
    });

    it('should return null on error', () => {
      const context = new GenderAwareContext(true);

      // @ts-ignore - intentionally passing bad data
      const result = context.detectPatterns(null, null, null);

      expect(result).toBeNull();
    });
  });
});
