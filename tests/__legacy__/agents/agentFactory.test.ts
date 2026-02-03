/**
 * Unit tests for agentFactory functions
 * Ensures factories always return valid, complete AgentState objects
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createDefaultAgentState,
  createDefaultAgentMemory,
  createDefaultAgentPersonality,
  evolvePersonality,
  determinePhase,
  calculateTrustProgression,
  detectDominantElement
} from '../agentFactory';
import type { AgentState, AgentMemory, AgentPersonality } from '../types';

describe('agentFactory', () => {
  const TEST_USER_ID = 'test-user-123';

  describe('createDefaultAgentState', () => {
    it('should create a complete AgentState with no missing fields', () => {
      const state = createDefaultAgentState(TEST_USER_ID);

      // Check top-level properties
      expect(state).toHaveProperty('id');
      expect(state).toHaveProperty('name');
      expect(state).toHaveProperty('personality');
      expect(state).toHaveProperty('memory');
      expect(state).toHaveProperty('currentContext');
      expect(state).toHaveProperty('evolutionStage');
      expect(state).toHaveProperty('realityAwareness');

      // Validate ID format
      expect(state.id).toMatch(/^oracle-test-user-123-\d+$/);
      expect(state.name).toBe('Your Oracle');
      expect(state.evolutionStage).toBe(1);
    });

    it('should create valid currentContext with all required fields', () => {
      const state = createDefaultAgentState(TEST_USER_ID);
      const context = state.currentContext;

      expect(context.timeOfDay).toMatch(/^(morning|afternoon|evening|night)$/);
      expect(context.conversationDepth).toBe(0);
      expect(context.conversationState).toBe('casual');
      expect(context.emotionalLoad).toBe(0);

      // Check realityLayers
      expect(context.realityLayers).toHaveProperty('physical');
      expect(context.realityLayers).toHaveProperty('emotional');
      expect(context.realityLayers).toHaveProperty('mental');
      expect(context.realityLayers).toHaveProperty('spiritual');
    });

    it('should create valid realityAwareness structure', () => {
      const state = createDefaultAgentState(TEST_USER_ID);
      const awareness = state.realityAwareness;

      // Check innerWorld
      expect(awareness.innerWorld.currentFocus).toBe('discovering');
      expect(awareness.innerWorld.shadowWork).toEqual([]);
      expect(awareness.innerWorld.gifts).toEqual([]);
      expect(awareness.innerWorld.wounds).toEqual([]);

      // Check outerWorld
      expect(awareness.outerWorld.challenges).toEqual([]);
      expect(awareness.outerWorld.opportunities).toEqual([]);
      expect(awareness.outerWorld.relationships).toEqual([]);
      expect(awareness.outerWorld.purpose).toBe('emerging');

      // Check bridgePoints
      expect(awareness.bridgePoints).toEqual([]);
    });

    it('should accept custom name parameter', () => {
      const customName = 'Maya';
      const state = createDefaultAgentState(TEST_USER_ID, customName);
      expect(state.name).toBe(customName);
    });
  });

  describe('createDefaultAgentMemory', () => {
    it('should create complete AgentMemory with all fields', () => {
      const memory = createDefaultAgentMemory(TEST_USER_ID);

      // Check all required fields exist
      expect(memory.userId).toBe(TEST_USER_ID);
      expect(memory.userRole).toBe('student');
      expect(memory.certificationLevel).toBe(0);
      expect(memory.firstMeeting).toBeInstanceOf(Date);
      expect(memory.lastInteraction).toBeInstanceOf(Date);
      expect(memory.interactionCount).toBe(0);
      expect(memory.conversationHistory).toEqual([]);
      expect(memory.currentConversationThread).toEqual([]);
    });

    it('should initialize dominantElement and shadowElement as undefined', () => {
      const memory = createDefaultAgentMemory(TEST_USER_ID);

      // These should start undefined (not missing)
      expect(memory).toHaveProperty('dominantElement');
      expect(memory).toHaveProperty('shadowElement');
      expect(memory.dominantElement).toBeUndefined();
      expect(memory.shadowElement).toBeUndefined();
    });

    it('should initialize energyPatterns as empty object', () => {
      const memory = createDefaultAgentMemory(TEST_USER_ID);
      expect(memory.energyPatterns).toEqual({});

      // Should be able to add time-of-day patterns
      memory.energyPatterns.morning = 'dense';
      expect(memory.energyPatterns.morning).toBe('dense');
    });

    it('should have valid soulSignature with all properties', () => {
      const memory = createDefaultAgentMemory(TEST_USER_ID);
      const signature = memory.soulSignature;

      expect(signature.frequency).toBe(432);
      expect(signature.color).toBe('violet');
      expect(signature.tone).toBe('A');
      expect(signature.geometry).toBe('spiral');
    });

    it('should have valid polarisState', () => {
      const memory = createDefaultAgentMemory(TEST_USER_ID);
      const polaris = memory.polarisState;

      expect(polaris.selfAwareness).toBe(50);
      expect(polaris.otherAwareness).toBe(50);
      expect(polaris.sharedFocus).toBe('presence');
      expect(polaris.harmonicResonance).toBe(0);
      expect(polaris.spiralDirection).toBe('stable');
      expect(polaris.rotationSpeed).toBe(1);
    });
  });

  describe('createDefaultAgentPersonality', () => {
    it('should create valid personality with all traits', () => {
      const personality = createDefaultAgentPersonality();

      expect(personality.archetype).toBe('oracle');
      expect(personality.voiceTone).toBe('gentle');

      // Check all traits are numbers
      expect(personality.traits.warmth).toBe(70);
      expect(personality.traits.directness).toBe(50);
      expect(personality.traits.challenge).toBe(30);
      expect(personality.traits.intuition).toBe(60);
      expect(personality.traits.playfulness).toBe(40);

      // Check communication style
      expect(personality.communicationStyle).toContain('curious');
      expect(personality.communicationStyle).toContain('reflective');
      expect(personality.communicationStyle).toContain('supportive');
      expect(personality.communicationStyle).toContain('insightful');
    });
  });

  describe('evolvePersonality', () => {
    let basePersonality: AgentPersonality;

    beforeEach(() => {
      basePersonality = createDefaultAgentPersonality();
    });

    it('should increase challenge when user embraces challenges', () => {
      const evolved = evolvePersonality(basePersonality, 'embraces', 10);
      expect(evolved.traits.challenge).toBe(31); // 30 + 1
    });

    it('should decrease challenge and increase warmth when user resists', () => {
      const evolved = evolvePersonality(basePersonality, 'resists', 10);
      expect(evolved.traits.challenge).toBe(29); // 30 - 1
      expect(evolved.traits.warmth).toBe(71); // 70 + 1
    });

    it('should evolve archetype to challenger after 50 interactions with high challenge', () => {
      basePersonality.traits.challenge = 65;
      const evolved = evolvePersonality(basePersonality, 'embraces', 51);
      expect(evolved.archetype).toBe('challenger');
    });

    it('should evolve archetype to nurturer after 50 interactions with high warmth', () => {
      basePersonality.traits.warmth = 85;
      const evolved = evolvePersonality(basePersonality, 'gradual', 51);
      expect(evolved.archetype).toBe('nurturer');
    });

    it('should not exceed trait bounds', () => {
      basePersonality.traits.challenge = 99;
      const evolved = evolvePersonality(basePersonality, 'embraces', 10);
      expect(evolved.traits.challenge).toBe(100); // Capped at 100

      basePersonality.traits.challenge = 1;
      const evolved2 = evolvePersonality(basePersonality, 'resists', 10);
      expect(evolved2.traits.challenge).toBe(0); // Floored at 0
    });
  });

  describe('determinePhase', () => {
    it('should return correct phase based on interaction count', () => {
      expect(determinePhase(0)).toBe('meeting');
      expect(determinePhase(3)).toBe('meeting');
      expect(determinePhase(6)).toBe('discovering');
      expect(determinePhase(16)).toBe('deepening');
      expect(determinePhase(31)).toBe('transforming');
      expect(determinePhase(51)).toBe('integrating');
      expect(determinePhase(100)).toBe('integrating');
    });
  });

  describe('calculateTrustProgression', () => {
    it('should increase trust based on interaction quality', () => {
      expect(calculateTrustProgression(50, 'positive')).toBe(52);
      expect(calculateTrustProgression(50, 'neutral')).toBe(51);
      expect(calculateTrustProgression(50, 'challenging')).toBe(50.5);
    });

    it('should cap trust at 100', () => {
      expect(calculateTrustProgression(99, 'positive')).toBe(100);
      expect(calculateTrustProgression(100, 'positive')).toBe(100);
    });
  });

  describe('detectDominantElement', () => {
    it('should detect fire element from fire keywords', () => {
      const keywords = ['passion', 'energy', 'creative drive'];
      const element = detectDominantElement(keywords, {});
      expect(element).toBe('fire');
    });

    it('should detect water element from water keywords', () => {
      const keywords = ['emotion', 'feeling', 'intuitive flow'];
      const element = detectDominantElement(keywords, {});
      expect(element).toBe('water');
    });

    it('should return undefined when no elemental keywords found', () => {
      const keywords = ['hello', 'world', 'test'];
      const element = detectDominantElement(keywords, {});
      expect(element).toBeUndefined();
    });

    it('should handle mixed elements by returning highest scoring', () => {
      const keywords = ['passion', 'energy', 'emotion']; // 2 fire, 1 water
      const element = detectDominantElement(keywords, {});
      expect(element).toBe('fire');
    });
  });

  describe('TypeScript compilation safety', () => {
    it('should allow assignment of factory output to typed variables', () => {
      // This test ensures TypeScript compilation works correctly
      const state: AgentState = createDefaultAgentState(TEST_USER_ID);
      const memory: AgentMemory = createDefaultAgentMemory(TEST_USER_ID);
      const personality: AgentPersonality = createDefaultAgentPersonality();

      // If this compiles, our types are aligned
      expect(state).toBeDefined();
      expect(memory).toBeDefined();
      expect(personality).toBeDefined();
    });
  });
});