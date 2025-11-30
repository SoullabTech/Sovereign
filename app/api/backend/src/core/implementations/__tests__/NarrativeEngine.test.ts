/**
 * NarrativeEngine Unit Tests
 * 
 * Tests the delegated narrative shaping logic with stage-aware transformations,
 * mastery voice polish, and crisis response handling. Includes comprehensive
 * tests for consistent response patterns across Oracle relationship stages.
 */

import { NarrativeEngine } from '../NarrativeEngine';
import type { OracleStageConfig } from '../../types/oracleStateMachine';
import type { PersonaPrefs } from '../../../personas/prefs';
import type { Intent } from '../../../personas/intent';

// Mock data for testing
const createMockPersonaPrefs = (overrides: Partial<PersonaPrefs> = {}): PersonaPrefs => ({
  worldview: 'balanced',
  formality: 'warm',
  metaphysics_confidence: 0.6,
  voice_enabled: true,
  ...overrides
});

const createMockStageConfig = (stage: string, overrides: any = {}): OracleStageConfig => ({
  stage: stage as any,
  displayName: `${stage} Stage`,
  description: `Test ${stage} configuration`,
  tone: {
    formality: 0.5,
    directness: 0.6,
    challenge_comfort: 0.5,
    metaphysical_openness: 0.7,
    vulnerability_sharing: 0.3,
    ...overrides.tone
  },
  disclosure: {
    archetype_visibility: 0.5,
    uncertainty_admission: 0.3,
    multiple_perspectives: false,
    collective_field_access: false,
    shadow_work_depth: 0.5,
    ...overrides.disclosure
  },
  orchestration: {
    agent_cooperation: 'single',
    response_length: 'moderate',
    interaction_mode: 'directive',
    complexity_level: 0.7,
    personalization_depth: 0.5,
    ...overrides.orchestration
  },
  voice: {
    character_consistency: 0.8,
    emotional_attunement: 0.7,
    wisdom_transmission: 'instructional',
    presence_quality: 'maternal',
    ...overrides.voice
  },
  advancement: {
    required_capacity_signals: ['trust'],
    minimum_threshold: 0.5,
    session_count_minimum: 3,
    stability_window_days: 7,
    override_possible: false,
    ...overrides.advancement
  },
  safety: {
    fallback_triggers: ['overwhelm_detected'],
    monitoring_intensity: 'moderate',
    intervention_threshold: 0.5,
    recovery_requirement: 0.7,
    ...overrides.safety
  }
});

describe('NarrativeEngine', () => {
  describe('generate()', () => {
    test('should apply basic Maya shaping and stage transformations', () => {
      const rawResponse = "You should listen to the universe's cosmic guidance for your sacred journey.";
      const context = {
        intent: 'guidance' as Intent,
        prefs: createMockPersonaPrefs(),
        emotions: ['curiosity'],
        stageConfig: createMockStageConfig('structured_guide'),
        stageSummary: {}
      };

      const result = NarrativeEngine.generate(rawResponse, context);
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(typeof result).toBe('string');
    });

    test('should handle high formality stage configuration', () => {
      const rawResponse = "You're gonna love this cosmic insight!";
      const context = {
        intent: 'guidance' as Intent,
        prefs: createMockPersonaPrefs(),
        emotions: ['excitement'],
        stageConfig: createMockStageConfig('structured_guide', {
          tone: { formality: 0.9, directness: 0.8, metaphysical_openness: 0.3 }
        }),
        stageSummary: {}
      };

      const result = NarrativeEngine.generate(rawResponse, context);
      
      // High formality should expand contractions
      expect(result).toContain('you are');
      expect(result).not.toContain("you're");
      
      // Low metaphysical openness should reduce mystical language
      expect(result).not.toContain('cosmic');
    });

    test('should handle low directness with softening language', () => {
      const rawResponse = "You should meditate daily. You need to practice mindfulness.";
      const context = {
        intent: 'guidance' as Intent,
        prefs: createMockPersonaPrefs(),
        emotions: ['seeking'],
        stageConfig: createMockStageConfig('dialogical_companion', {
          tone: { formality: 0.5, directness: 0.2, metaphysical_openness: 0.6 }
        }),
        stageSummary: {}
      };

      const result = NarrativeEngine.generate(rawResponse, context);
      
      // Low directness should soften commands
      expect(result).toContain('might consider');
      expect(result).toContain('Perhaps you could');
      expect(result).not.toContain('You should');
      expect(result).not.toContain('You need to');
    });

    test('should add multiple perspectives when enabled', () => {
      const rawResponse = "Meditation is the key to inner peace and spiritual awakening in your journey of self-discovery and consciousness expansion.";
      const context = {
        intent: 'exploration' as Intent,
        prefs: createMockPersonaPrefs(),
        emotions: ['contemplation'],
        stageConfig: createMockStageConfig('transparent_prism', {
          disclosure: { uncertainty_admission: 0.3, multiple_perspectives: true }
        }),
        stageSummary: {}
      };

      const result = NarrativeEngine.generate(rawResponse, context);
      
      expect(result).toContain("another way to see this");
    });

    test('should simplify complexity when configured for low complexity', () => {
      const rawResponse = "The phenomenological investigation of consciousness through embodied practices reveals archetypal patterns, and this synchronistic emergence facilitates transcendent awareness in your spiritual journey.";
      const context = {
        intent: 'learning' as Intent,
        prefs: createMockPersonaPrefs(),
        emotions: ['curiosity'],
        stageConfig: createMockStageConfig('structured_guide', {
          orchestration: { complexity_level: 0.3, interaction_mode: 'directive' }
        }),
        stageSummary: {}
      };

      const result = NarrativeEngine.generate(rawResponse, context);
      
      // Should be simplified from the original
      expect(result.length).toBeLessThan(rawResponse.length);
    });

    test('should apply socratic interaction mode', () => {
      const rawResponse = "Trust your inner wisdom.";
      const context = {
        intent: 'guidance' as Intent,
        prefs: createMockPersonaPrefs(),
        emotions: ['seeking'],
        stageConfig: createMockStageConfig('dialogical_companion', {
          orchestration: { complexity_level: 0.7, interaction_mode: 'socratic' }
        }),
        stageSummary: {}
      };

      // Run multiple times since question addition is probabilistic
      let foundQuestion = false;
      for (let i = 0; i < 10; i++) {
        const result = NarrativeEngine.generate(rawResponse, context);
        if (result.includes("What do you think")) {
          foundQuestion = true;
          break;
        }
      }
      
      expect(foundQuestion).toBe(true);
    });

    test('should apply cocreative interaction mode', () => {
      const rawResponse = "This insight opens new possibilities.";
      const context = {
        intent: 'exploration' as Intent,
        prefs: createMockPersonaPrefs(),
        emotions: ['excitement'],
        stageConfig: createMockStageConfig('cocreative_partner', {
          orchestration: { complexity_level: 0.7, interaction_mode: 'cocreative' }
        }),
        stageSummary: {}
      };

      // Run multiple times since cocreative addition is probabilistic
      let foundCollaboration = false;
      for (let i = 0; i < 10; i++) {
        const result = NarrativeEngine.generate(rawResponse, context);
        if (result.includes("explore this together")) {
          foundCollaboration = true;
          break;
        }
      }
      
      expect(foundCollaboration).toBe(true);
    });

    test('should apply facilitative interaction mode', () => {
      const rawResponse = "I think this approach will help you grow.";
      const context = {
        intent: 'support' as Intent,
        prefs: createMockPersonaPrefs(),
        emotions: ['support'],
        stageConfig: createMockStageConfig('transparent_prism', {
          orchestration: { complexity_level: 0.7, interaction_mode: 'facilitative' }
        }),
        stageSummary: {}
      };

      const result = NarrativeEngine.generate(rawResponse, context);
      
      // Facilitative mode should redirect to user's wisdom
      expect(result).toContain('You might find');
      expect(result).not.toContain('I think');
    });
  });

  describe('polish()', () => {
    test('should apply mastery polish when conditions are met', () => {
      const response = "Your consciousness archetypal synchronicity transcendent ontology phenomenology initiation embodied.";
      const context = {
        polishType: 'mastery' as const,
        stageConfig: createMockStageConfig('transparent_prism'),
        userMetrics: {
          trustLevel: 0.8,
          engagementScore: 0.7
        }
      };

      const result = NarrativeEngine.polish(response, context);
      
      // Should strip jargon
      expect(result).not.toContain('consciousness');
      expect(result).not.toContain('archetypal');
      expect(result).not.toContain('synchronicity');
      expect(result).not.toContain('transcendent');
      expect(result).not.toContain('ontology');
      expect(result).not.toContain('phenomenology');
      expect(result).not.toContain('initiation');
      expect(result).not.toContain('embodied');
      
      // Should contain simplified replacements
      expect(result).toContain('awareness');
      expect(result).toContain('symbolic');
      expect(result).toContain('timing');
      expect(result).toContain('beyond');
      expect(result).toContain('pattern');
      expect(result).toContain('experience');
      expect(result).toContain('beginning');
      expect(result).toContain('felt');
    });

    test('should add gentle open ending in mastery mode', () => {
      const response = "Trust your inner wisdom.";
      const context = {
        polishType: 'mastery' as const,
        stageConfig: createMockStageConfig('transparent_prism'),
        userMetrics: {
          trustLevel: 0.8,
          engagementScore: 0.7
        }
      };

      const result = NarrativeEngine.polish(response, context);
      
      expect(result).toContain('What feels true right now?');
    });

    test('should add micro-pauses in mastery mode', () => {
      const response = "First insight here. Second insight here. Third insight here. Fourth insight here.";
      const context = {
        polishType: 'mastery' as const,
        stageConfig: createMockStageConfig('transparent_prism'),
        userMetrics: {
          trustLevel: 0.8,
          engagementScore: 0.7
        }
      };

      const result = NarrativeEngine.polish(response, context);
      
      // Should add pauses after every 2nd sentence
      expect(result).toContain('...');
    });

    test('should limit sentence length in mastery mode', () => {
      const response = "This is a very long sentence with many words that exceeds the twelve word limit for mastery voice mode.";
      const context = {
        polishType: 'mastery' as const,
        stageConfig: createMockStageConfig('transparent_prism'),
        userMetrics: {
          trustLevel: 0.8,
          engagementScore: 0.7
        }
      };

      const result = NarrativeEngine.polish(response, context);
      
      // Should truncate long sentences
      expect(result).toContain('...');
      expect(result.split(' ').length).toBeLessThan(20); // Much shorter than original
    });

    test('should not apply mastery polish when trust is low', () => {
      const response = "Your consciousness archetypal synchronicity.";
      const context = {
        polishType: 'mastery' as const,
        stageConfig: createMockStageConfig('transparent_prism'),
        userMetrics: {
          trustLevel: 0.6, // Below 0.75 threshold
          engagementScore: 0.7
        }
      };

      const result = NarrativeEngine.polish(response, context);
      
      // Should return unchanged since trust is too low
      expect(result).toBe(response);
    });

    test('should not apply mastery polish when not in transparent_prism stage', () => {
      const response = "Your consciousness archetypal synchronicity.";
      const context = {
        polishType: 'mastery' as const,
        stageConfig: createMockStageConfig('structured_guide'), // Wrong stage
        userMetrics: {
          trustLevel: 0.8,
          engagementScore: 0.7
        }
      };

      const result = NarrativeEngine.polish(response, context);
      
      // Should return unchanged since wrong stage
      expect(result).toBe(response);
    });

    test('should apply crisis polish', () => {
      const response = "This is a very long crisis response that needs to be shortened for safety and grounding purposes, with additional supportive language.";
      const context = {
        polishType: 'crisis' as const
      };

      const result = NarrativeEngine.polish(response, context);
      
      // Should be shortened
      expect(result.length).toBeLessThanOrEqual(150);
      
      // Should add grounding cue
      expect(result).toContain('breath');
    });

    test('should preserve short crisis responses', () => {
      const response = "You're safe. Breathe deeply.";
      const context = {
        polishType: 'crisis' as const
      };

      const result = NarrativeEngine.polish(response, context);
      
      // Should preserve short responses
      expect(result).toContain('safe');
      expect(result).toContain('breathe');
    });

    test('should return unchanged for standard polish type', () => {
      const response = "This is a standard response.";
      const context = {
        polishType: 'standard' as const
      };

      const result = NarrativeEngine.polish(response, context);
      
      expect(result).toBe(response);
    });
  });

  describe('Stage Progression Integration', () => {
    const baseResponse = "Your spiritual journey involves understanding consciousness, archetypal patterns, and synchronistic timing. This sacred work requires embodied wisdom and transcendent awareness through phenomenological experience.";
    const baseContext = {
      intent: 'guidance' as Intent,
      prefs: createMockPersonaPrefs(),
      emotions: ['curiosity', 'seeking'],
      stageSummary: {}
    };

    test('structured_guide stage should be simple and directive', () => {
      const context = {
        ...baseContext,
        stageConfig: createMockStageConfig('structured_guide', {
          tone: { formality: 0.7, directness: 0.8, metaphysical_openness: 0.4 },
          orchestration: { complexity_level: 0.4, interaction_mode: 'directive' }
        })
      };

      const result = NarrativeEngine.generate(baseResponse, context);
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('transparent_prism stage should handle high complexity', () => {
      const context = {
        ...baseContext,
        stageConfig: createMockStageConfig('transparent_prism', {
          tone: { formality: 0.3, directness: 0.3, metaphysical_openness: 0.9 },
          orchestration: { complexity_level: 0.9, interaction_mode: 'facilitative' },
          disclosure: { uncertainty_admission: 0.7, multiple_perspectives: true }
        })
      };

      const result = NarrativeEngine.generate(baseResponse, context);
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('transparent_prism with mastery should be simplified and accessible', () => {
      const context = {
        ...baseContext,
        stageConfig: createMockStageConfig('transparent_prism')
      };

      let shaped = NarrativeEngine.generate(baseResponse, context);
      
      const polished = NarrativeEngine.polish(shaped, {
        polishType: 'mastery',
        stageConfig: context.stageConfig,
        userMetrics: { trustLevel: 0.8, engagementScore: 0.7 }
      });
      
      // Should be processed and contain mastery elements
      expect(typeof polished).toBe('string');
      expect(polished.length).toBeGreaterThan(0);
      expect(polished).toContain('What feels true right now?');
    });
  });

  describe('Crisis Response Handling', () => {
    test('should handle crisis polish effectively', () => {
      const crisisResponse = "This is an extended crisis support response that provides detailed guidance and support for someone experiencing difficult emotions and challenging thoughts that need immediate attention and care.";
      
      const result = NarrativeEngine.polish(crisisResponse, {
        polishType: 'crisis'
      });
      
      expect(result.length).toBeLessThanOrEqual(150);
      expect(result).toContain('breath');
    });

    test('should preserve brief crisis responses', () => {
      const briefCrisisResponse = "Breathe. You're safe here.";
      
      const result = NarrativeEngine.polish(briefCrisisResponse, {
        polishType: 'crisis'
      });
      
      expect(result).toContain('safe');
      expect(result).toContain('Breathe');
    });
  });
});