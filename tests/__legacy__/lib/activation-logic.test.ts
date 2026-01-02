// Activation Logic Test Suite - Validates Edge Cases & Conflict Resolution
// Tests the deterministic activation system for production readiness

import { ActivationIntelligence } from '../activation-intelligence';
import { uxConsistencyManager } from '../ux-consistency-manager';
import { ActivationTechnicalReview } from '../activation-technical-review';

describe('Activation Logic Edge Cases', () => {
  let activationIntelligence: ActivationIntelligence;
  let technicalReview: ActivationTechnicalReview;

  beforeEach(() => {
    activationIntelligence = new ActivationIntelligence();
    technicalReview = new ActivationTechnicalReview();
  });

  // === CRISIS DETECTION OVERRIDE SCENARIOS ===
  describe('Crisis Detection Override', () => {
    it('should abort looping protocol mid-process when crisis detected', () => {
      const userId = 'test-user-1';
      const initialInput = "I'm confused about my career direction, can you help me understand?";
      const crisisInput = "Actually, I'm having thoughts of self-harm right now";

      // Step 1: Start looping protocol
      const initialDecisions = activationIntelligence.analyzeActivationNeed(
        userId, initialInput, [], ''
      );
      expect(initialDecisions.find(d => d.feature === 'looping_protocol')?.confidence).toBeGreaterThan(0.7);

      // Step 2: Crisis detected mid-conversation
      const crisisDecisions = activationIntelligence.analyzeActivationNeed(
        userId, crisisInput, [{ content: initialInput, role: 'user' }], ''
      );

      // Validate crisis takes priority
      const crisisFeature = crisisDecisions.find(d => d.feature === 'crisis_detection');
      expect(crisisFeature?.confidence).toBeGreaterThan(0.8);
      expect(crisisFeature?.overridesPrevious).toBe(true);

      // Validate looping is gracefully abandoned
      const loopingFeature = crisisDecisions.find(d => d.feature === 'looping_protocol');
      expect(loopingFeature?.gracefulAbandonment).toBe(true);
      expect(loopingFeature?.abandonmentReason).toContain('crisis detected');
    });

    it('should maintain conversation continuity during crisis override', () => {
      const transitionResult = technicalReview.handleMidConversationTransition(
        ['looping_protocol', 'contemplative_space'],
        ['crisis_detection'],
        'crisis_override'
      );

      expect(transitionResult.transitionMessage).toContain('sensing this is important');
      expect(transitionResult.gracefulDelay).toBe(0); // Immediate for crisis
      expect(transitionResult.preserveUserContext).toBe(true);
    });
  });

  // === CONTEMPLATIVE PAUSES IN URGENT CONTEXTS ===
  describe('Contemplative Space Appropriateness', () => {
    it('should not trigger contemplative pauses during urgent practical discussions', () => {
      const urgentInputs = [
        "My presentation is in 30 minutes and I need help organizing my key points quickly",
        "Emergency - my child is having a meltdown and I need immediate strategies",
        "Quick question - what's the deadline for tax filing?",
        "I'm running late for work, just need a fast answer about interview tips"
      ];

      urgentInputs.forEach(input => {
        const decisions = activationIntelligence.analyzeActivationNeed(
          'test-user', input, [], ''
        );

        const contemplative = decisions.find(d => d.feature === 'contemplative_space');
        expect(contemplative?.confidence).toBeLessThan(0.4);
        expect(contemplative?.rationale).toContain('urgency detected');
      });
    });

    it('should appropriately trigger contemplative pauses for deep processing', () => {
      const contemplativeInputs = [
        "I'm struggling with the meaning of my life and feeling lost",
        "Help me understand why I keep repeating the same relationship patterns",
        "I'm processing grief from my father's death last year",
        "What does it mean to live authentically?"
      ];

      contemplativeInputs.forEach(input => {
        const decisions = activationIntelligence.analyzeActivationNeed(
          'test-user', input, [], ''
        );

        const contemplative = decisions.find(d => d.feature === 'contemplative_space');
        expect(contemplative?.confidence).toBeGreaterThan(0.6);
        expect(contemplative?.rationale).toContain('emotional processing' || 'complex concepts');
      });
    });
  });

  // === FEATURE CONFLICT RESOLUTION ===
  describe('Feature Conflict Resolution', () => {
    it('should resolve looping protocol vs contemplative space conflicts', () => {
      const conflictInput = "I'm confused about my purpose and need to think deeply about this";

      const rawDecisions = activationIntelligence.analyzeActivationNeed(
        'test-user', conflictInput, [], ''
      );

      // Both features would trigger
      const looping = rawDecisions.find(d => d.feature === 'looping_protocol');
      const contemplative = rawDecisions.find(d => d.feature === 'contemplative_space');
      expect(looping?.confidence).toBeGreaterThan(0.6);
      expect(contemplative?.confidence).toBeGreaterThan(0.6);

      // Conflict resolution should choose higher priority
      const resolvedDecisions = technicalReview.resolveFeatureConflicts(rawDecisions);
      const finalFeatures = resolvedDecisions.map(d => d.feature);

      // Should not have both high-intensity features simultaneously
      if (finalFeatures.includes('looping_protocol')) {
        const contemplativeResolved = resolvedDecisions.find(d => d.feature === 'contemplative_space');
        expect(contemplativeResolved?.confidence).toBeLessThan(0.5);
        expect(contemplativeResolved?.adjustmentReason).toContain('conflict with looping_protocol');
      }
    });

    it('should maintain elemental attunement during all conflicts', () => {
      const highConflictScenario = [
        { feature: 'looping_protocol', confidence: 0.9 },
        { feature: 'crisis_detection', confidence: 0.8 },
        { feature: 'contemplative_space', confidence: 0.7 },
        { feature: 'elemental_attunement', confidence: 1.0 }
      ];

      const resolved = technicalReview.resolveFeatureConflicts(
        highConflictScenario.map(s => ({
          ...s,
          rationale: 'test',
          userVisible: false,
          gracefulEntry: true
        }))
      );

      // Elemental attunement should always survive conflict resolution
      const elemental = resolved.find(d => d.feature === 'elemental_attunement');
      expect(elemental?.confidence).toBe(1.0);
      expect(resolved.length).toBeGreaterThan(0);
    });
  });

  // === MID-CONVERSATION TIER TRANSITIONS ===
  describe('Mid-Conversation Transitions', () => {
    it('should smoothly transition from elegant to complete oracle', () => {
      const conversationHistory = [
        { content: "Hi there!", role: 'user' },
        { content: "Hello! How can I help?", role: 'assistant' }
      ];

      const deepInput = "Actually, I'm going through a spiritual crisis and questioning everything";

      const decisions = activationIntelligence.analyzeActivationNeed(
        'test-user', deepInput, conversationHistory, ''
      );

      const transition = uxConsistencyManager.planFeatureTransition(
        [], // Previously no features (elegant oracle)
        decisions.map(d => d.feature),
        'test-user'
      );

      expect(transition.fromState).toBe('instant');
      expect(transition.toState).toBe('deep_processing');
      expect(transition.transitionMessage).toBeDefined();
      expect(transition.gracefulDelay).toBeGreaterThan(0);
    });

    it('should handle rapid context switching gracefully', () => {
      const rapidSwitchScenario = [
        { input: "Help me understand consciousness", expectedTier: 'complete' },
        { input: "Actually, quick question - what time is it?", expectedTier: 'elegant' },
        { input: "Back to consciousness - what does it mean?", expectedTier: 'complete' }
      ];

      let previousFeatures: string[] = [];

      rapidSwitchScenario.forEach((scenario, index) => {
        const decisions = activationIntelligence.analyzeActivationNeed(
          'test-user', scenario.input, [], ''
        );

        const currentFeatures = decisions.map(d => d.feature);
        const transition = uxConsistencyManager.planFeatureTransition(
          previousFeatures,
          currentFeatures,
          'test-user'
        );

        // Should not create jarring transitions
        expect(transition.gracefulDelay).toBeLessThan(1000);

        if (index > 0) {
          expect(transition.transitionMessage).toBeDefined();
        }

        previousFeatures = currentFeatures;
      });
    });
  });

  // === USER CONTROL OVERRIDE SCENARIOS ===
  describe('User Control Overrides', () => {
    it('should respect user preference for faster responses', () => {
      const userPreference = { preferredStyle: 'direct', processingTolerance: 0.3 };

      // Update user profile to prefer direct communication
      activationIntelligence.updateUserProfile(
        'direct-user',
        [],
        0.8,
        'helpful'
      );

      const complexInput = "Help me understand the deeper meaning of existence";
      const decisions = activationIntelligence.analyzeActivationNeed(
        'direct-user', complexInput, [], ''
      );

      // Should reduce feature activation due to user preference
      const looping = decisions.find(d => d.feature === 'looping_protocol');
      expect(looping?.confidence).toBeLessThan(0.6); // Reduced from default
      expect(looping?.rationale).toContain('adjusted for direct communication style');
    });

    it('should allow manual tier override', () => {
      const manualOverride = technicalReview.processManualOverride(
        'test-user',
        'elegant', // User wants elegant tier only
        ['looping_protocol', 'contemplative_space'] // System suggested complex features
      );

      expect(manualOverride.finalFeatures).toEqual(['elemental_attunement']);
      expect(manualOverride.overrideReason).toContain('user preference');
      expect(manualOverride.respectUserChoice).toBe(true);
    });
  });

  // === PERFORMANCE & RELIABILITY ===
  describe('Performance Edge Cases', () => {
    it('should handle activation decision timeout gracefully', () => {
      const timeoutTest = technicalReview.processWithTimeout(
        () => activationIntelligence.analyzeActivationNeed('test-user', 'test input', [], ''),
        500 // 500ms timeout
      );

      expect(timeoutTest.decisions).toBeDefined();
      expect(timeoutTest.processingTime).toBeLessThan(600);
      expect(timeoutTest.fallbackUsed).toBe(false);
    });

    it('should provide reliable fallbacks when activation fails', () => {
      // Simulate activation intelligence failure
      const mockFailingIntelligence = {
        analyzeActivationNeed: () => { throw new Error('Analysis failed'); }
      };

      const fallback = technicalReview.handleActivationFailure('test-user', 'test input');

      expect(fallback.features).toEqual(['elemental_attunement']); // Safe default
      expect(fallback.fallbackReason).toContain('activation analysis failed');
      expect(fallback.gracefulDegradation).toBe(true);
    });
  });

  // === DEBUGGING SUPPORT ===
  describe('Debugging & Monitoring', () => {
    it('should provide detailed activation reasoning', () => {
      const input = "I'm feeling overwhelmed and need deeper understanding";
      const decisions = activationIntelligence.analyzeActivationNeed('test-user', input, [], '');

      decisions.forEach(decision => {
        expect(decision.rationale).toBeDefined();
        expect(decision.rationale.length).toBeGreaterThan(10);
        expect(decision.confidence).toBeGreaterThan(0);
        expect(decision.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('should track decision history for analysis', () => {
      const debugInfo = technicalReview.getDebugInfo('test-user');

      expect(debugInfo.recentDecisions).toBeDefined();
      expect(debugInfo.conflictResolutions).toBeDefined();
      expect(debugInfo.userProfileUpdates).toBeDefined();
      expect(debugInfo.performanceMetrics).toBeDefined();
    });
  });
});