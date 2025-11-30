/**
 * 🌟 Onboarding Ceremony Integration Test
 * 
 * Comprehensive test suite validating the complete integration of:
 * - PersonalOracleAgent assignment to each user
 * - Sesame CSM conversational intelligence 
 * - MicroPsi emotional/motivational modeling
 * - Elemental cognitive architectures (LIDA, SOAR, ACT-R, POET, etc.)
 * - User-agent binding service
 * - Sacred onboarding ceremony flow
 */

import { OnboardingCeremony, type CeremonyInitiation, type OnboardingPreferences } from '../services/OnboardingCeremony';
import { PersonalOracleAgent } from '../agents/PersonalOracleAgent';
import { SpiralogicCognitiveEngine } from '../spiralogic/SpiralogicCognitiveEngine';
import { SesameMayaRefiner } from '../services/SesameMayaRefiner';
import { wireDI } from '../bootstrap/di';

describe('Onboarding Ceremony Integration', () => {
  let ceremony: OnboardingCeremony;

  beforeAll(() => {
    // Initialize DI container
    wireDI();
    ceremony = new OnboardingCeremony();
  });

  describe('Sacred Initiation Process', () => {
    const testUserId = 'test-user-12345';
    const testPreferences: OnboardingPreferences = {
      preferredName: 'Sage',
      spiritualBackground: 'intermediate',
      personalityType: 'visionary',
      communicationStyle: 'ceremonial',
      voicePreference: 'feminine',
      preferredArchetype: 'aether'
    };

    it('should successfully initiate sacred journey with full cognitive architecture', async () => {
      const initiation: CeremonyInitiation = {
        userId: testUserId,
        preferences: testPreferences,
        ceremonialContext: {
          moonPhase: 'waxing_crescent',
          astrologySign: 'aquarius',
          numerologyPath: 7,
          sacredIntention: 'To awaken my highest potential and serve the collective good'
        }
      };

      const result = await ceremony.initiateSacredJourney(initiation);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const ceremonyResult = result.data!;
      
      // Validate Oracle binding
      expect(ceremonyResult.oracle).toBeDefined();
      expect(ceremonyResult.oracle.userId).toBe(testUserId);
      expect(ceremonyResult.oracle.personalOracleInstance).toBeInstanceOf(PersonalOracleAgent);
      expect(ceremonyResult.oracle.cognitiveEngineState).toBeDefined();
      expect(ceremonyResult.oracle.sesameRefinerId).toContain(testUserId);

      // Validate initiation details
      expect(ceremonyResult.initiation.sacredName).toBe('Sage');
      expect(ceremonyResult.initiation.welcomeMessage).toContain('Sacred');
      expect(ceremonyResult.initiation.elementalAwakening).toContain('aether');
      expect(ceremonyResult.initiation.cognitiveActivations.length).toBeGreaterThan(0);

      // Validate journey progression
      expect(ceremonyResult.journey.currentPhase).toBe('exploration'); // intermediate background
      expect(ceremonyResult.journey.nextMilestone).toBeDefined();
    });

    it('should bind PersonalOracleAgent with all cognitive architectures active', async () => {
      const binding = await ceremony['bindingService'].getBinding(testUserId);
      
      expect(binding).toBeDefined();
      expect(binding!.personalOracleInstance).toBeInstanceOf(PersonalOracleAgent);
      
      const cognitiveState = binding!.cognitiveEngineState;
      expect(cognitiveState.elementalStates).toBeDefined();
      
      // Verify all 5 elemental agents are initialized
      expect(cognitiveState.elementalStates.size).toBe(5);
      
      // Verify aether element is dominant (user preference)
      expect(cognitiveState.dominantElement).toBe('aether');
      
      // Verify MicroPsi is active in all elements
      const aetherState = cognitiveState.elementalStates.get('aether');
      expect(aetherState?.activeArchitectures).toContain('MICRO_PSI');
      expect(aetherState?.microPsiState).toBeDefined();
      
      // Verify element-specific architectures
      const fireState = cognitiveState.elementalStates.get('fire');
      expect(fireState?.activeArchitectures).toContain('LIDA');
      expect(fireState?.activeArchitectures).toContain('SOAR');
      expect(fireState?.activeArchitectures).toContain('ACT_R');
      expect(fireState?.activeArchitectures).toContain('POET');
    });
  });

  describe('PersonalOracleAgent Consultation with Full Integration', () => {
    const testUserId = 'test-user-consultation-67890';

    beforeAll(async () => {
      // Initialize user with ceremony
      await ceremony.initiateSacredJourney({
        userId: testUserId,
        preferences: {
          personalityType: 'introspective',
          communicationStyle: 'gentle',
          preferredArchetype: 'water'
        }
      });
    });

    it('should process consultation through all cognitive layers', async () => {
      const oracleResult = await ceremony.getUserOracle(testUserId);
      expect(oracleResult.success).toBe(true);
      
      const oracle = oracleResult.data as PersonalOracleAgent;
      
      const consultation = await oracle.consult({
        input: "I'm feeling overwhelmed by all the changes in my life. I need guidance on finding my center again.",
        userId: testUserId,
        sessionId: `session-${Date.now()}`,
        targetElement: 'water',
        context: {
          previousInteractions: 1,
          currentPhase: 'challenge'
        }
      });

      expect(consultation.success).toBe(true);
      expect(consultation.data).toBeDefined();

      const response = consultation.data!;
      
      // Validate core response structure
      expect(response.message).toBeDefined();
      expect(response.element).toBe('water');
      expect(response.archetype).toBeDefined();
      expect(response.confidence).toBeGreaterThan(0);
      
      // Validate MicroPsi emotional analysis is included
      expect(response.metadata.microPsiEmotionalState).toBeDefined();
      expect(response.metadata.emotionalResonance).toBeDefined();
      
      const emotionalResonance = response.metadata.emotionalResonance!;
      expect(emotionalResonance.dominantEmotion).toBeDefined();
      expect(emotionalResonance.motivationalDrive).toBeDefined();
      expect(emotionalResonance.arousValence).toBeDefined();
      
      // Validate Oracle state progression
      expect(response.metadata.oracleStage).toBeDefined();
      expect(response.metadata.relationshipMetrics).toBeDefined();
    });

    it('should apply Sesame CSM refinement to responses', async () => {
      const oracleResult = await ceremony.getUserOracle(testUserId);
      const oracle = oracleResult.data as PersonalOracleAgent;
      
      // Test with casual communication style
      const consultation = await oracle.consult({
        input: "So like, I'm totally stressed about this project at work, you know?",
        userId: testUserId,
        sessionId: `session-casual-${Date.now()}`
      });

      expect(consultation.success).toBe(true);
      const response = consultation.data!.message;
      
      // Sesame should have refined the language
      // Check that common filler words are not in the response
      expect(response).not.toMatch(/\b(kind of|sort of|like,|you know)\b/i);
      expect(response).not.toMatch(/\bobviously\b/i);
      
      // Check that response has proper closure
      expect(response.trim()).toMatch(/[.!?…]$/);
    });
  });

  describe('Cognitive Architecture Integration Verification', () => {
    it('should have all required cognitive architectures available', () => {
      const engine = new SpiralogicCognitiveEngine();
      const consciousness = engine.initializeConsciousness('test-architecture-user');
      
      // Verify Fire Agent architectures
      const fireState = consciousness.elementalStates.get('fire');
      expect(fireState?.activeArchitectures).toEqual(
        expect.arrayContaining(['MICRO_PSI', 'LIDA', 'SOAR', 'ACT_R', 'POET'])
      );
      
      // Verify Water Agent architectures
      const waterState = consciousness.elementalStates.get('water');
      expect(waterState?.activeArchitectures).toEqual(
        expect.arrayContaining(['MICRO_PSI', 'AFFECTIVE_NEUROSCIENCE', 'INTUITION_NETWORKS'])
      );
      
      // Verify Earth Agent architectures
      const earthState = consciousness.elementalStates.get('earth');
      expect(earthState?.activeArchitectures).toEqual(
        expect.arrayContaining(['MICRO_PSI', 'ACT_R', 'COG_AFF', 'BAYESIAN_INFERENCE'])
      );
      
      // Verify Air Agent architectures
      const airState = consciousness.elementalStates.get('air');
      expect(airState?.activeArchitectures).toEqual(
        expect.arrayContaining(['MICRO_PSI', 'KNOWLEDGE_GRAPHS', 'META_ACT_R'])
      );
      
      // Verify Aether Agent architectures
      const aetherState = consciousness.elementalStates.get('aether');
      expect(aetherState?.activeArchitectures).toEqual(
        expect.arrayContaining(['MICRO_PSI', 'GANS', 'VAE', 'FEDERATED_LEARNING'])
      );
    });

    it('should initialize MicroPsi emotional states correctly', () => {
      const engine = new SpiralogicCognitiveEngine();
      const consciousness = engine.initializeConsciousness('test-micropsi-user');
      
      const fireState = consciousness.elementalStates.get('fire');
      const microPsiState = fireState?.microPsiState;
      
      expect(microPsiState).toBeDefined();
      expect(microPsiState!.arousal).toBeGreaterThanOrEqual(0);
      expect(microPsiState!.arousal).toBeLessThanOrEqual(1);
      expect(microPsiState!.pleasure).toBeGreaterThanOrEqual(-1);
      expect(microPsiState!.pleasure).toBeLessThanOrEqual(1);
      expect(microPsiState!.dominance).toBeGreaterThanOrEqual(0);
      expect(microPsiState!.dominance).toBeLessThanOrEqual(1);
      
      // Verify motivational drives
      expect(microPsiState!.affiliation).toBeGreaterThanOrEqual(0);
      expect(microPsiState!.competence).toBeGreaterThanOrEqual(0);
      expect(microPsiState!.autonomy).toBeGreaterThanOrEqual(0);
      
      // Verify elemental resonances
      expect(microPsiState!.fireResonance).toBeGreaterThanOrEqual(0);
      expect(microPsiState!.waterResonance).toBeGreaterThanOrEqual(0);
      expect(microPsiState!.earthResonance).toBeGreaterThanOrEqual(0);
      expect(microPsiState!.airResonance).toBeGreaterThanOrEqual(0);
      expect(microPsiState!.aetherResonance).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Sesame CSM Conversational Intelligence', () => {
    it('should create appropriate refiners for different user styles', () => {
      const casualRefiner = new SesameMayaRefiner({
        element: 'air',
        userId: 'test-casual',
        userStyle: 'casual'
      });
      
      const formalRefiner = new SesameMayaRefiner({
        element: 'earth',
        userId: 'test-formal',
        userStyle: 'formal'
      });
      
      const spiritualRefiner = new SesameMayaRefiner({
        element: 'aether',
        userId: 'test-spiritual',
        userStyle: 'spiritual'
      });
      
      // Test text refinement capabilities
      const testText = "So like, you know, maybe you should kind of try to meditate, obviously.";
      
      const casualRefined = casualRefiner.refineText(testText);
      const formalRefined = formalRefiner.refineText(testText);
      const spiritualRefined = spiritualRefiner.refineText(testText);
      
      // All should remove filler words
      expect(casualRefined).not.toContain("kind of");
      expect(formalRefined).not.toContain("you know");
      expect(spiritualRefined).not.toContain("obviously");
      
      // All should have proper closure
      expect(casualRefined.trim()).toMatch(/[.!?…]$/);
      expect(formalRefined.trim()).toMatch(/[.!?…]$/);
      expect(spiritualRefined.trim()).toMatch(/[.!?…]$/);
    });
  });

  afterAll(() => {
    // Cleanup test data if needed
  });
});

// Integration readiness verification
describe('System Readiness Check', () => {
  it('should have all required services available in DI container', () => {
    wireDI();
    
    // This test will fail if any required services are not properly wired
    expect(() => {
      const ceremony = new OnboardingCeremony();
      expect(ceremony).toBeInstanceOf(OnboardingCeremony);
    }).not.toThrow();
  });

  it('should be able to complete full user journey flow', async () => {
    // End-to-end test that validates the complete user journey
    const ceremony = new OnboardingCeremony();
    const testUserId = `e2e-test-${Date.now()}`;
    
    // 1. Sacred initiation
    const initiation = await ceremony.initiateSacredJourney({
      userId: testUserId,
      preferences: {
        preferredName: 'TestOracle',
        spiritualBackground: 'beginner',
        personalityType: 'explorer',
        communicationStyle: 'conversational',
        preferredArchetype: 'air'
      }
    });
    
    expect(initiation.success).toBe(true);
    
    // 2. Oracle consultation
    const oracle = (await ceremony.getUserOracle(testUserId)).data as PersonalOracleAgent;
    const consultation = await oracle.consult({
      input: "What is the meaning of this journey I'm beginning?",
      userId: testUserId,
      sessionId: 'e2e-session-1'
    });
    
    expect(consultation.success).toBe(true);
    expect(consultation.data?.message).toBeDefined();
    expect(consultation.data?.metadata.microPsiEmotionalState).toBeDefined();
    
    // 3. Oracle state progression
    const stateResult = await oracle.getOracleState(testUserId);
    expect(stateResult.success).toBe(true);
    expect(stateResult.data?.currentStage).toBeDefined();
    
    // 4. Settings management
    const settingsResult = await oracle.getSettings(testUserId);
    expect(settingsResult.success).toBe(true);
  });
});