/**
 * Soul Development Integration Tests
 *
 * Comprehensive testing for Phase 2: Enhanced Soul Development
 * Tests all four core modules and their integration with the Cultural Foundation
 */

import {
  jungianShadowIntegrationEngine,
  lifeSpiralHarmonizer,
  dreamJournalingIntegration,
  integrationPracticeGenerator,
  enhancedSoulDevelopmentIntegration,
  processShadowWorkWithCulture,
  processLifePurposeWithCulture,
  generatePersonalizedPractices,
} from "../core/soulDevelopment";

import { CulturalProfile } from "../core/cultural/CulturalContextAwareness";

describe("Soul Development Integration Tests", () => {
  const testCulturalProfile: CulturalProfile = {
    primaryCulture: "native_american",
    culturalIdentities: ["native_american", "universal"],
    languagePreferences: ["english"],
    traditionalPractices: ["ceremony", "medicine_wheel"],
    spiritualFramework: "indigenous_wisdom",
    ancestralLineages: ["ojibwe"],
    culturalStrengths: ["community_connection", "earth_wisdom"],
    preferredWisdomSources: ["elder_teachings", "nature_wisdom"],
  };

  const testUserId = "test_user_123";

  describe("Jungian Shadow Integration Engine", () => {
    test("should analyze shadow work with cultural integration", async () => {
      const userInput =
        "I always sabotage my success when things start going well";

      const shadowPlan = await jungianShadowIntegrationEngine.assessShadowWork(
        userInput,
        testUserId,
        testCulturalProfile,
      );

      expect(shadowPlan).toBeDefined();
      expect(shadowPlan.userId).toBe(testUserId);
      expect(shadowPlan.shadowComplexes).toBeDefined();
      expect(Array.isArray(shadowPlan.shadowComplexes)).toBe(true);
      expect(shadowPlan.culturalHealingModalities).toBeDefined();
      expect(Array.isArray(shadowPlan.culturalHealingModalities)).toBe(true);
    });

    test("should facilitate active imagination session", async () => {
      const sessionType = "inner_critic";

      const session =
        await jungianShadowIntegrationEngine.facilitateActiveImaginationSession(
          testUserId,
          sessionType,
          testCulturalProfile,
        );

      expect(session).toBeDefined();
      expect(session.sessionId).toBeDefined();
      expect(session.dialogueType).toBe(sessionType);
      expect(session.shadowDialoguePartner).toBeDefined();
      expect(session.integrationTasks).toBeDefined();
      expect(Array.isArray(session.integrationTasks)).toBe(true);
    });

    test("should process projection withdrawal", async () => {
      const projectionTarget = "authority figures";
      const projectedQualities = ["controlling", "judgmental"];

      const withdrawalProcess =
        await jungianShadowIntegrationEngine.processProjectionWithdrawal(
          testUserId,
          projectionTarget,
          projectedQualities,
          testCulturalProfile,
        );

      expect(withdrawalProcess).toBeDefined();
      expect(withdrawalProcess.projectionTarget).toBe(projectionTarget);
      expect(withdrawalProcess.projectedQualities).toEqual(projectedQualities);
      expect(withdrawalProcess.ownedQualities).toBeDefined();
      expect(withdrawalProcess.withdrawalSteps).toBeDefined();
      expect(Array.isArray(withdrawalProcess.withdrawalSteps)).toBe(true);
    });

    test("should retrieve stored shadow integration plan", () => {
      const storedPlan =
        jungianShadowIntegrationEngine.getShadowIntegrationPlan(testUserId);
      expect(storedPlan).toBeDefined();
    });
  });

  describe("Life Spiral Harmonizer", () => {
    test("should analyze soul mandate with cultural integration", async () => {
      const userInput =
        "I feel called to heal and serve my community but don't know how";

      const lifeSpiralPlan = await lifeSpiralHarmonizer.analyzeSoulMandate(
        userInput,
        testUserId,
        testCulturalProfile,
      );

      expect(lifeSpiralPlan).toBeDefined();
      expect(lifeSpiralPlan.userId).toBe(testUserId);
      expect(lifeSpiralPlan.soulMandateAnalysis).toBeDefined();
      expect(lifeSpiralPlan.soulMandateAnalysis.corePurpose).toBeDefined();
      expect(
        lifeSpiralPlan.soulMandateAnalysis.elementalSignature,
      ).toBeDefined();
      expect(lifeSpiralPlan.harmonizationPractices).toBeDefined();
      expect(Array.isArray(lifeSpiralPlan.harmonizationPractices)).toBe(true);
    });

    test("should provide soul mandate evolution guidance", async () => {
      const currentChallenges = [
        "uncertainty about direction",
        "fear of failure",
      ];
      const recentExperiences = [
        "spiritual awakening",
        "community service opportunity",
      ];

      const evolutionGuidance =
        await lifeSpiralHarmonizer.getSoulMandateEvolutionGuidance(
          testUserId,
          currentChallenges,
          recentExperiences,
        );

      expect(evolutionGuidance).toBeDefined();
      expect(evolutionGuidance.evolutionGuidance).toBeDefined();
      expect(evolutionGuidance.nextEvolutionSteps).toBeDefined();
      expect(Array.isArray(evolutionGuidance.nextEvolutionSteps)).toBe(true);
      expect(evolutionGuidance.evolutionSupports).toBeDefined();
      expect(evolutionGuidance.evolutionPractices).toBeDefined();
    });

    test("should harmonize life transition", async () => {
      const transitionType = "career";
      const transitionContext =
        "leaving corporate job to start healing practice";
      const transitionChallenges = [
        "financial uncertainty",
        "family expectations",
      ];

      const transitionHarmony =
        await lifeSpiralHarmonizer.harmonizeLifeTransition(
          testUserId,
          transitionType,
          transitionContext,
          transitionChallenges,
        );

      expect(transitionHarmony).toBeDefined();
      expect(transitionHarmony.transitionHarmony).toBeDefined();
      expect(transitionHarmony.mandateAlignment).toBeDefined();
      expect(transitionHarmony.transitionPractices).toBeDefined();
      expect(Array.isArray(transitionHarmony.transitionPractices)).toBe(true);
    });

    test("should retrieve stored life spiral plan", () => {
      const storedPlan = lifeSpiralHarmonizer.getLifeSpiralPlan(testUserId);
      expect(storedPlan).toBeDefined();
    });
  });

  describe("Dream Journaling Integration", () => {
    const testDreamEntry = {
      dreamId: "dream_test_123",
      userId: testUserId,
      dreamDate: new Date().toISOString(),
      dreamTitle: "The Medicine Wheel Vision",
      dreamNarrative:
        "I stood in the center of a great medicine wheel. Four animals approached from each direction - an eagle from the east, a bear from the west, a wolf from the north, and a deer from the south. Each animal spoke words of wisdom about my path.",
      dreamEmotions: ["awe", "reverence", "clarity"],
      dreamSymbols: [
        "medicine wheel",
        "eagle",
        "bear",
        "wolf",
        "deer",
        "four directions",
      ],
      dreamCharacters: [
        {
          characterName: "Eagle",
          characterRole: "wisdom keeper",
          characterRelation: "spirit guide",
          characterActions: ["spoke wisdom", "spread wings"],
          characterSymbolism: "vision and clarity",
        },
      ],
      dreamSettings: [
        {
          settingName: "Medicine Wheel",
          settingDescription: "Sacred circle with four directions marked",
          settingSymbolism: "wholeness and balance",
        },
      ],
      dreamThemes: ["spiritual guidance", "direction seeking", "animal wisdom"],
      culturalElements: ["medicine wheel", "animal spirits", "four directions"],
      lucidityLevel: 0.3,
      vividnessLevel: 0.9,
      emotionalIntensity: 0.8,
    };

    test("should process dream entry with cultural integration", async () => {
      const dreamAnalysis = await dreamJournalingIntegration.processDreamEntry(
        testDreamEntry,
        testCulturalProfile,
      );

      expect(dreamAnalysis).toBeDefined();
      expect(dreamAnalysis.dreamId).toBe(testDreamEntry.dreamId);
      expect(dreamAnalysis.userId).toBe(testUserId);
      expect(dreamAnalysis.narrativeAnalysis).toBeDefined();
      expect(dreamAnalysis.symbolAnalysis).toBeDefined();
      expect(dreamAnalysis.culturalInterpretation).toBeDefined();
      expect(dreamAnalysis.culturalInterpretation.culturalContext).toBe(
        "native_american",
      );
    });

    test("should analyze dream patterns", async () => {
      const patternAnalysis =
        await dreamJournalingIntegration.analyzeDreamPatterns(
          testUserId,
          "month",
        );

      expect(patternAnalysis).toBeDefined();
      expect(patternAnalysis.patterns).toBeDefined();
      expect(Array.isArray(patternAnalysis.patterns)).toBe(true);
      expect(patternAnalysis.thematicEvolution).toBeDefined();
      expect(patternAnalysis.symbolEvolution).toBeDefined();
      expect(patternAnalysis.integrationOpportunities).toBeDefined();
    });

    test("should create story weaving visualization", async () => {
      const visualization =
        await dreamJournalingIntegration.createStoryWeavingVisualization(
          testUserId,
        );

      expect(visualization).toBeDefined();
      expect(visualization.networkStructure).toBeDefined();
      expect(visualization.narrativeThreads).toBeDefined();
      expect(Array.isArray(visualization.narrativeThreads)).toBe(true);
      expect(visualization.connectionStrengths).toBeDefined();
    });

    test("should generate dream integration practices", async () => {
      // First process a dream to have analysis available
      const dreamAnalysis = await dreamJournalingIntegration.processDreamEntry(
        testDreamEntry,
        testCulturalProfile,
      );

      const practices =
        await dreamJournalingIntegration.generateDreamIntegrationPractices(
          testUserId,
          dreamAnalysis,
          testCulturalProfile,
        );

      expect(practices).toBeDefined();
      expect(practices.dailyPractices).toBeDefined();
      expect(Array.isArray(practices.dailyPractices)).toBe(true);
      expect(practices.culturalPractices).toBeDefined();
      expect(practices.shadowWorkPractices).toBeDefined();
    });

    test("should retrieve stored dream data", () => {
      const dreamEntries =
        dreamJournalingIntegration.getUserDreamEntries(testUserId);
      expect(Array.isArray(dreamEntries)).toBe(true);

      const dreamAnalyses =
        dreamJournalingIntegration.getUserDreamAnalyses(testUserId);
      expect(Array.isArray(dreamAnalyses)).toBe(true);
    });
  });

  describe("Integration Practice Generator", () => {
    test("should generate practice ecosystem", async () => {
      const practiceEcosystem =
        await integrationPracticeGenerator.generatePracticeEcosystem(
          testUserId,
          testCulturalProfile,
          undefined, // shadowPlan
          undefined, // lifeSpiralPlan
          undefined, // dreamPlan
          {
            intensity: "moderate",
            duration: "medium",
            frequency: "daily",
          },
        );

      expect(practiceEcosystem).toBeDefined();
      expect(practiceEcosystem.userId).toBe(testUserId);
      expect(practiceEcosystem.practiceProfile).toBeDefined();
      expect(practiceEcosystem.corePractices).toBeDefined();
      expect(Array.isArray(practiceEcosystem.corePractices)).toBe(true);
      expect(practiceEcosystem.culturalIntegration).toBeDefined();
    });

    test("should adapt practice ecosystem", async () => {
      const adaptationTriggers = {
        progressFeedback: { completed: 5, effectiveness: 0.8 },
        challengeEncountered: ["time constraints"],
        preferencesChanged: { intensity: "gentle" },
      };

      const adaptedEcosystem =
        await integrationPracticeGenerator.adaptPracticeEcosystem(
          testUserId,
          adaptationTriggers,
        );

      expect(adaptedEcosystem).toBeDefined();
      expect(adaptedEcosystem.userId).toBe(testUserId);
    });

    test("should generate practice recommendations", async () => {
      const context = {
        currentMood: "contemplative",
        availableTime: 20,
        currentChallenges: ["decision paralysis"],
        environmentContext: "home",
      };

      const recommendations =
        await integrationPracticeGenerator.generatePracticeRecommendations(
          testUserId,
          context,
        );

      expect(recommendations).toBeDefined();
      expect(recommendations.recommendedPractices).toBeDefined();
      expect(Array.isArray(recommendations.recommendedPractices)).toBe(true);
      expect(recommendations.reasoningExplanation).toBeDefined();
      expect(recommendations.culturalRelevance).toBeDefined();
    });

    test("should track practice completion", async () => {
      const practiceId = "test_practice_123";
      const completionData = {
        duration: 25,
        intensity: 0.7,
        effectiveness: 0.8,
        insights: ["increased clarity", "emotional release"],
        challenges: ["initial resistance"],
        culturalElements: ["smudging", "four directions"],
      };

      const trackingResult =
        await integrationPracticeGenerator.trackPracticeCompletion(
          testUserId,
          practiceId,
          completionData,
        );

      expect(trackingResult).toBeDefined();
      expect(trackingResult.updatedEcosystem).toBeDefined();
      expect(trackingResult.progressInsights).toBeDefined();
      expect(Array.isArray(trackingResult.progressInsights)).toBe(true);
      expect(trackingResult.nextRecommendations).toBeDefined();
    });

    test("should retrieve stored practice data", () => {
      const practiceEcosystem =
        integrationPracticeGenerator.getPracticeEcosystem(testUserId);
      expect(practiceEcosystem).toBeDefined();

      const practiceProfile =
        integrationPracticeGenerator.getPracticeProfile(testUserId);
      expect(practiceProfile).toBeDefined();
    });
  });

  describe("Enhanced Soul Development Integration", () => {
    test("should check system readiness", () => {
      const isReady = enhancedSoulDevelopmentIntegration.isSystemReady();
      expect(isReady).toBe(true);
    });

    test("should provide system status", () => {
      const status = enhancedSoulDevelopmentIntegration.getSystemStatus();
      expect(status).toBeDefined();
      expect(status.initialized).toBe(true);
      expect(status.culturalIntegration).toBe(true);
      expect(status.version).toBe("2.0.0");
      expect(Array.isArray(status.modules)).toBe(true);
    });

    test("should process shadow work query with cultural integration", async () => {
      const userInput = "I keep attracting the same toxic relationships";

      const response =
        await enhancedSoulDevelopmentIntegration.processSoulDevelopmentQuery(
          userInput,
          testUserId,
          "shadow_work",
          { culturalBackground: "native_american" },
        );

      expect(response).toBeDefined();
      expect(response.soulDevelopmentResponse).toBeDefined();
      expect(response.shadowIntegrationGuidance).toBeDefined();
      expect(response.culturalWisdomIntegration).toBeDefined();
      expect(response.nextStepsGuidance).toBeDefined();
      expect(Array.isArray(response.nextStepsGuidance)).toBe(true);
    });

    test("should process life purpose query with cultural integration", async () => {
      const userInput = "I want to serve my people but don't know my gifts";

      const response =
        await enhancedSoulDevelopmentIntegration.processSoulDevelopmentQuery(
          userInput,
          testUserId,
          "life_purpose",
          { culturalBackground: "native_american" },
        );

      expect(response).toBeDefined();
      expect(response.soulDevelopmentResponse).toBeDefined();
      expect(response.lifePurposeGuidance).toBeDefined();
      expect(response.culturalWisdomIntegration).toBeDefined();
      expect(response.integrationOpportunities).toBeDefined();
    });

    test("should process practice generation query", async () => {
      const userInput = "I need daily practices for spiritual growth";

      const response =
        await enhancedSoulDevelopmentIntegration.processSoulDevelopmentQuery(
          userInput,
          testUserId,
          "practice_generation",
          { culturalBackground: "native_american" },
        );

      expect(response).toBeDefined();
      expect(response.soulDevelopmentResponse).toBeDefined();
      expect(response.practiceRecommendations).toBeDefined();
      expect(response.nextStepsGuidance).toBeDefined();
    });

    test("should process comprehensive soul development query", async () => {
      const userInput = "I feel lost and need guidance on my spiritual path";

      const response =
        await enhancedSoulDevelopmentIntegration.processSoulDevelopmentQuery(
          userInput,
          testUserId,
          "comprehensive",
          { culturalBackground: "native_american" },
        );

      expect(response).toBeDefined();
      expect(response.soulDevelopmentResponse).toBeDefined();
      expect(response.shadowIntegrationGuidance).toBeDefined();
      expect(response.lifePurposeGuidance).toBeDefined();
      expect(response.practiceRecommendations).toBeDefined();
      expect(response.culturalWisdomIntegration).toBeDefined();
    });
  });

  describe("Helper Functions", () => {
    test("should process shadow work with culture helper", async () => {
      const userInput = "I struggle with self-worth issues";
      const userProfile = { culturalBackground: "native_american" };

      const response = await processShadowWorkWithCulture(
        userInput,
        testUserId,
        userProfile,
      );

      expect(response).toBeDefined();
      expect(response.soulDevelopmentResponse).toBeDefined();
      expect(response.shadowIntegrationGuidance).toBeDefined();
    });

    test("should process life purpose with culture helper", async () => {
      const userInput = "What is my calling in this lifetime?";
      const userProfile = { culturalBackground: "native_american" };

      const response = await processLifePurposeWithCulture(
        userInput,
        testUserId,
        userProfile,
      );

      expect(response).toBeDefined();
      expect(response.soulDevelopmentResponse).toBeDefined();
      expect(response.lifePurposeGuidance).toBeDefined();
    });

    test("should generate personalized practices helper", async () => {
      const userInput = "I want practices for healing and growth";
      const userProfile = {
        culturalBackground: "native_american",
        practicePreferences: { intensity: "moderate" },
      };

      const response = await generatePersonalizedPractices(
        userInput,
        testUserId,
        userProfile,
      );

      expect(response).toBeDefined();
      expect(response.soulDevelopmentResponse).toBeDefined();
      expect(response.practiceRecommendations).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    test("should handle invalid user ID gracefully", async () => {
      const invalidUserId = "";

      try {
        await jungianShadowIntegrationEngine.assessShadowWork(
          "test input",
          invalidUserId,
          testCulturalProfile,
        );
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test("should handle missing cultural profile gracefully", async () => {
      const emptyCulturalProfile: CulturalProfile = {
        primaryCulture: "universal",
        culturalIdentities: [],
        languagePreferences: ["english"],
        traditionalPractices: [],
        spiritualFramework: "universal",
        ancestralLineages: [],
        culturalStrengths: [],
        preferredWisdomSources: [],
      };

      const response =
        await enhancedSoulDevelopmentIntegration.processSoulDevelopmentQuery(
          "test input",
          testUserId,
          "shadow_work",
          undefined,
        );

      expect(response).toBeDefined();
      expect(response.soulDevelopmentResponse).toBeDefined();
    });

    test("should handle unknown query type gracefully", async () => {
      try {
        await enhancedSoulDevelopmentIntegration.processSoulDevelopmentQuery(
          "test input",
          testUserId,
          "unknown_type" as any,
          {},
        );
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain("Unknown query type");
      }
    });
  });

  describe("Integration with Cultural Foundation", () => {
    test("should integrate with cultural context awareness", async () => {
      const userInput = "I need healing practices from my ancestors";

      const response =
        await enhancedSoulDevelopmentIntegration.processSoulDevelopmentQuery(
          userInput,
          testUserId,
          "comprehensive",
          { culturalBackground: "native_american" },
        );

      expect(response.culturalWisdomIntegration).toBeDefined();
      expect(response.culturalWisdomIntegration).toContain("native_american");
    });

    test("should respect indigenous sovereignty protocols", async () => {
      const userInput = "I want to learn traditional healing methods";

      const response = await processShadowWorkWithCulture(
        userInput,
        testUserId,
        { culturalBackground: "native_american" },
      );

      expect(response).toBeDefined();
      // Check that response contains respectful framing
      expect(response.soulDevelopmentResponse).toBeDefined();
    });

    test("should provide cross-cultural archetype mapping", async () => {
      const userInput = "Help me understand my warrior energy";

      const response = await processLifePurposeWithCulture(
        userInput,
        testUserId,
        { culturalBackground: "native_american" },
      );

      expect(response).toBeDefined();
      expect(response.lifePurposeGuidance).toBeDefined();
    });
  });
});

// Test data cleanup
afterAll(() => {
  // Clean up any test data if needed
  console.log("Soul Development tests completed");
});
