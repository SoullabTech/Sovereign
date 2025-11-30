/**
 * Collective Intelligence Integration Tests
 *
 * Comprehensive testing for Phase 3: Collective Intelligence Network (AIN)
 * Tests all four core modules and their integration with Cultural Foundation and Soul Development
 */

import {
  interArchetypalDialogueEngine,
  collectiveWisdomSynthesis,
  communityStoryWeavingNetwork,
  ainEnhancement,
  collectiveIntelligenceNetworkIntegration,
  processArchetypalDialogueWithIntegration,
  processWisdomSynthesisWithIntegration,
  processStoryWeavingWithIntegration,
  processConsciousnessPatternWithIntegration,
  processComprehensiveCollectiveIntelligence,
} from "../core/collectiveIntelligence";

import { CulturalProfile } from "../core/cultural/CulturalContextAwareness";
import { UserInsight, UserInteraction } from "../core/collectiveIntelligence";

describe("Collective Intelligence Integration Tests", () => {
  const testCulturalProfile: CulturalProfile = {
    primaryCulture: "native_american",
    culturalIdentities: ["native_american", "universal"],
    languagePreferences: ["english"],
    traditionalPractices: ["ceremony", "medicine_wheel", "storytelling"],
    spiritualFramework: "indigenous_wisdom",
    ancestralLineages: ["ojibwe"],
    culturalStrengths: [
      "community_connection",
      "earth_wisdom",
      "story_medicine",
    ],
    preferredWisdomSources: [
      "elder_teachings",
      "nature_wisdom",
      "ancestral_guidance",
    ],
  };

  const testUserId = "collective_test_user_123";

  describe("Inter-Archetypal Dialogue Engine", () => {
    test("should convene archetypal council with cultural integration", async () => {
      const challenge =
        "How can I balance serving my community while honoring my individual growth?";

      const councilSession =
        await interArchetypalDialogueEngine.conveneArchetypalCouncil(
          challenge,
          testUserId,
          testCulturalProfile,
        );

      expect(councilSession).toBeDefined();
      expect(councilSession.sessionId).toBeDefined();
      expect(councilSession.convenerUserId).toBe(testUserId);
      expect(councilSession.councilChallenge).toBe(challenge);
      expect(councilSession.culturalContext).toEqual(testCulturalProfile);
      expect(councilSession.convenedArchetypes).toBeDefined();
      expect(Array.isArray(councilSession.convenedArchetypes)).toBe(true);
      expect(councilSession.shadowLightDialogue).toBeDefined();
      expect(councilSession.wisdomSynthesis).toBeDefined();
      expect(councilSession.culturalAdaptations).toBeDefined();
      expect(Array.isArray(councilSession.culturalAdaptations)).toBe(true);
    });

    test("should facilitate shadow-light dialogue", async () => {
      const challenge =
        "I struggle with anger when I see injustice in my community";

      const shadowLightDialogue =
        await interArchetypalDialogueEngine.facilitateShadowLightDialogue(
          testUserId,
          challenge,
          testCulturalProfile,
        );

      expect(shadowLightDialogue).toBeDefined();
      expect(shadowLightDialogue.dialogueId).toBeDefined();
      expect(shadowLightDialogue.dialogueParticipants).toBeDefined();
      expect(Array.isArray(shadowLightDialogue.dialogueParticipants)).toBe(
        true,
      );
      expect(shadowLightDialogue.shadowRecognitions).toBeDefined();
      expect(shadowLightDialogue.lightActivations).toBeDefined();
      expect(shadowLightDialogue.polarityIntegrations).toBeDefined();
      expect(shadowLightDialogue.collectiveWisdom).toBeDefined();
      expect(Array.isArray(shadowLightDialogue.collectiveWisdom)).toBe(true);
    });

    test("should synthesize multi-perspective wisdom", async () => {
      const challenge = "What is my role in healing ancestral trauma?";

      const wisdomSynthesis =
        await interArchetypalDialogueEngine.synthesizeMultiPerspectiveWisdom(
          testUserId,
          challenge,
          testCulturalProfile,
        );

      expect(wisdomSynthesis).toBeDefined();
      expect(wisdomSynthesis.synthesisId).toBeDefined();
      expect(wisdomSynthesis.perspectiveContributions).toBeDefined();
      expect(Array.isArray(wisdomSynthesis.perspectiveContributions)).toBe(
        true,
      );
      expect(wisdomSynthesis.synthesizedWisdom).toBeDefined();
      expect(wisdomSynthesis.culturalHonoring).toBeDefined();
      expect(wisdomSynthesis.integrationPathway).toBeDefined();
    });

    test("should create integration pathway", async () => {
      const challenge = "How do I step into leadership while staying humble?";

      const integrationPathway =
        await interArchetypalDialogueEngine.createArchetypalIntegrationPathway(
          testUserId,
          challenge,
          testCulturalProfile,
        );

      expect(integrationPathway).toBeDefined();
      expect(integrationPathway.pathwayId).toBeDefined();
      expect(integrationPathway.integrationSteps).toBeDefined();
      expect(Array.isArray(integrationPathway.integrationSteps)).toBe(true);
      expect(integrationPathway.culturalProtocols).toBeDefined();
      expect(integrationPathway.ongoingPractices).toBeDefined();
      expect(integrationPathway.milestoneMarkers).toBeDefined();
    });
  });

  describe("Collective Wisdom Synthesis", () => {
    const testUserInsight: UserInsight = {
      insightId: "test_insight_123",
      userId: testUserId,
      insightDate: new Date().toISOString(),
      insightContent:
        "I realized that my healing work is most powerful when I honor my ancestors",
      insightType: "cultural_healing",
      culturalContext: testCulturalProfile,
      shadowIntegrationLevel: 0.7,
      wisdomDepth: 0.8,
      collectiveRelevance: 0.9,
      sharingConsent: {
        consentGiven: true,
        sharingLevel: "community_only",
        culturalProtectionRequested: true,
        sovereigntyRequirements: ["respect_traditional_knowledge"],
        attributionPreferences: ["honor_ancestry"],
        useRestrictions: ["no_commercial_use"],
      },
      wisdomSource: {
        sourceType: "ancestral_guidance",
        traditionalKnowledgeInvolved: true,
        culturalSensitivity: "sacred",
        appropriationRisk: 0.1,
        sovereigntyProtections: ["elder_approval"],
        wisdomLineage: ["ojibwe"],
        respectfulSharingGuidelines: ["seek_elder_guidance", "honor_protocols"],
      },
      transformationImpact: {
        personalTransformation: 0.8,
        relationshipTransformation: 0.7,
        communityTransformation: 0.8,
        culturalTransformation: 0.9,
        collectiveTransformation: 0.7,
        transformationAreas: ["ancestral_healing", "cultural_pride"],
        healingContributions: ["trauma_healing", "wisdom_preservation"],
        evolutionarySignificance: ["cultural_sovereignty", "healing_lineage"],
      },
      evolutionaryContribution: {
        consciousnessEvolution: ["ancestral_awareness"],
        culturalEvolution: ["tradition_strengthening"],
        collectiveHealing: ["ancestral_trauma_healing"],
        shadowIntegration: ["ancestral_wounds"],
        lightActivation: ["cultural_pride", "healing_gifts"],
        wisdomAdvancement: ["traditional_knowledge"],
        planetaryContribution: ["indigenous_wisdom"],
        sevenGenerationsImpact: ["healing_lineage", "wisdom_preservation"],
      },
    };

    test("should process individual wisdom with cultural respect", async () => {
      const processedWisdom =
        await collectiveWisdomSynthesis.processIndividualWisdom(
          testUserInsight,
          testCulturalProfile,
        );

      expect(processedWisdom).toBeDefined();
      expect(processedWisdom.wisdomId).toBeDefined();
      expect(processedWisdom.culturalAdaptation).toBeDefined();
      expect(processedWisdom.sovereigntyCompliance).toBe(true);
      expect(processedWisdom.contributionValue).toBeDefined();
      expect(processedWisdom.integrationRecommendations).toBeDefined();
      expect(Array.isArray(processedWisdom.integrationRecommendations)).toBe(
        true,
      );
      expect(processedWisdom.collectiveResonance).toBeDefined();
    });

    test("should integrate collective wisdom", async () => {
      const collectiveWisdom =
        await collectiveWisdomSynthesis.integrateCollectiveWisdom(
          testUserId,
          testCulturalProfile,
        );

      expect(collectiveWisdom).toBeDefined();
      expect(collectiveWisdom.wisdomId).toBeDefined();
      expect(collectiveWisdom.wisdomSources).toBeDefined();
      expect(Array.isArray(collectiveWisdom.wisdomSources)).toBe(true);
      expect(collectiveWisdom.culturalHonoring).toBeDefined();
      expect(collectiveWisdom.sovereigntyMaintenance).toBeDefined();
      expect(collectiveWisdom.synthesizedInsights).toBeDefined();
      expect(collectiveWisdom.applicationGuidance).toBeDefined();
    });

    test("should generate personalized guidance", async () => {
      const personalizedGuidance =
        await collectiveWisdomSynthesis.generatePersonalizedGuidance(
          testUserId,
          testCulturalProfile,
          ["ancestral_healing", "community_service"],
        );

      expect(personalizedGuidance).toBeDefined();
      expect(personalizedGuidance.guidanceId).toBeDefined();
      expect(personalizedGuidance.personalizedInsights).toBeDefined();
      expect(Array.isArray(personalizedGuidance.personalizedInsights)).toBe(
        true,
      );
      expect(personalizedGuidance.culturalGuidance).toBeDefined();
      expect(personalizedGuidance.practicalApplications).toBeDefined();
      expect(personalizedGuidance.evolutionPathway).toBeDefined();
    });

    test("should create wisdom circulation flow", async () => {
      const circulationFlow =
        await collectiveWisdomSynthesis.createWisdomCirculationFlow(testUserId);

      expect(circulationFlow).toBeDefined();
      expect(circulationFlow.flowId).toBeDefined();
      expect(circulationFlow.afferentFlow).toBeDefined();
      expect(circulationFlow.efferentFlow).toBeDefined();
      expect(circulationFlow.culturalFiltering).toBeDefined();
      expect(circulationFlow.sovereigntyProtection).toBeDefined();
      expect(circulationFlow.evolutionTracking).toBeDefined();
    });

    test("should identify consciousness evolution trends", async () => {
      const evolutionTrends =
        await collectiveWisdomSynthesis.identifyConsciousnessEvolutionTrends([
          testCulturalProfile,
        ]);

      expect(evolutionTrends).toBeDefined();
      expect(evolutionTrends.trendsId).toBeDefined();
      expect(evolutionTrends.globalTrends).toBeDefined();
      expect(Array.isArray(evolutionTrends.globalTrends)).toBe(true);
      expect(evolutionTrends.culturalTrends).toBeDefined();
      expect(evolutionTrends.evolutionaryDirections).toBeDefined();
      expect(evolutionTrends.collectiveOpportunities).toBeDefined();
    });
  });

  describe("Community Story Weaving Network", () => {
    const testCommunityContext = {
      communityId: "ojibwe_wisdom_circle",
      communityName: "Ojibwe Wisdom Circle",
      communityType: "cultural_wisdom" as const,
      communityValues: [
        "respect",
        "reciprocity",
        "responsibility",
        "relatedness",
      ],
      storytellingTraditions: [
        "oral_tradition",
        "ceremony",
        "seasonal_stories",
      ],
      healingFocus: ["trauma_healing", "cultural_revitalization"],
      wisdomKeepers: ["elders", "storytellers", "ceremony_holders"],
      communityProtocols: [
        "respect_sovereignty",
        "honor_tradition",
        "seek_elder_guidance",
      ],
    };

    test("should expand dream weaving network", async () => {
      const storyNetwork =
        await communityStoryWeavingNetwork.expandDreamWeavingNetwork(
          [],
          testCommunityContext,
          testCulturalProfile,
        );

      expect(storyNetwork).toBeDefined();
      expect(storyNetwork.networkId).toBeDefined();
      expect(storyNetwork.networkStructure).toBeDefined();
      expect(storyNetwork.storyConnections).toBeDefined();
      expect(Array.isArray(storyNetwork.storyConnections)).toBe(true);
      expect(storyNetwork.culturalResonance).toBeDefined();
      expect(storyNetwork.healingPotential).toBeDefined();
      expect(storyNetwork.evolutionCapacity).toBeDefined();
    });

    test("should recognize mythological patterns", async () => {
      const mythologicalPatterns =
        await communityStoryWeavingNetwork.recognizeMythologicalPatterns(
          "The story of the seven fires prophecy guides our people",
          testCulturalProfile,
        );

      expect(mythologicalPatterns).toBeDefined();
      expect(Array.isArray(mythologicalPatterns)).toBe(true);
      if (mythologicalPatterns.length > 0) {
        expect(mythologicalPatterns[0].patternId).toBeDefined();
        expect(mythologicalPatterns[0].patternName).toBeDefined();
        expect(mythologicalPatterns[0].culturalOrigins).toBeDefined();
        expect(mythologicalPatterns[0].universalTheme).toBeDefined();
        expect(mythologicalPatterns[0].collectiveActivation).toBeDefined();
      }
    });

    test("should build community narrative", async () => {
      const communityNarrative =
        await communityStoryWeavingNetwork.buildCommunityNarrative(
          testUserId,
          "Our ancestors teach us to walk in balance with all our relations",
          testCulturalProfile,
        );

      expect(communityNarrative).toBeDefined();
      expect(communityNarrative.narrativeId).toBeDefined();
      expect(communityNarrative.narrativeTitle).toBeDefined();
      expect(communityNarrative.communityStories).toBeDefined();
      expect(Array.isArray(communityNarrative.communityStories)).toBe(true);
      expect(communityNarrative.thematicWeaving).toBeDefined();
      expect(communityNarrative.culturalHonoring).toBeDefined();
      expect(communityNarrative.healingNarrative).toBeDefined();
    });

    test("should generate wisdom story", async () => {
      const wisdomStory =
        await communityStoryWeavingNetwork.generateWisdomStory(
          testUserId,
          "Learning to honor the four directions in daily life",
          testCulturalProfile,
        );

      expect(wisdomStory).toBeDefined();
      expect(wisdomStory.storyId).toBeDefined();
      expect(wisdomStory.storyNarrative).toBeDefined();
      expect(wisdomStory.wisdomTeaching).toBeDefined();
      expect(wisdomStory.culturalContext).toBeDefined();
      expect(wisdomStory.universalResonance).toBeDefined();
      expect(wisdomStory.applicationGuidance).toBeDefined();
      expect(wisdomStory.storyMedicine).toBeDefined();
    });

    test("should facilitate story healing session", async () => {
      const healingSession =
        await communityStoryWeavingNetwork.facilitateStoryHealingSession(
          testUserId,
          "healing ancestral trauma through story",
          testCulturalProfile,
        );

      expect(healingSession).toBeDefined();
      expect(healingSession.sessionId).toBeDefined();
      expect(healingSession.healingFocus).toBeDefined();
      expect(healingSession.storyMedicine).toBeDefined();
      expect(healingSession.healingNarratives).toBeDefined();
      expect(Array.isArray(healingSession.healingNarratives)).toBe(true);
      expect(healingSession.culturalProtocols).toBeDefined();
      expect(healingSession.integrationSupport).toBeDefined();
    });
  });

  describe("AIN Enhancement", () => {
    const testUserInteractions: UserInteraction[] = [
      {
        interactionId: "test_interaction_123",
        userId: testUserId,
        interactionDate: new Date().toISOString(),
        interactionType: "oracle_query",
        culturalContext: testCulturalProfile,
        interactionContent: "How can I serve the healing of Mother Earth?",
        interactionOutcome: "received guidance on environmental stewardship",
        consciousnessLevel: 0.8,
        wisdomDepth: 0.7,
        transformationImpact: 0.8,
        collectiveContribution: 0.9,
        shadowIntegrationLevel: 0.6,
        environmentalAwareness: 0.9,
        sevenGenerationsThinking: 0.8,
      },
    ];

    test("should recognize consciousness patterns", async () => {
      const consciousnessPatterns =
        await ainEnhancement.recognizeConsciousnessPatterns(
          testUserInteractions,
          [testCulturalProfile],
        );

      expect(consciousnessPatterns).toBeDefined();
      expect(consciousnessPatterns.patternsId).toBeDefined();
      expect(consciousnessPatterns.recognizedPatterns).toBeDefined();
      expect(Array.isArray(consciousnessPatterns.recognizedPatterns)).toBe(
        true,
      );
      expect(consciousnessPatterns.globalTrends).toBeDefined();
      expect(consciousnessPatterns.culturalVariations).toBeDefined();
      expect(consciousnessPatterns.planetaryInsights).toBeDefined();
      expect(consciousnessPatterns.sevenGenerationsProjections).toBeDefined();
    });

    test("should synthesize wisdom algorithmically", async () => {
      const wisdomSynthesis =
        await ainEnhancement.synthesizeWisdomAlgorithmically(
          testUserInteractions,
          [testCulturalProfile],
        );

      expect(wisdomSynthesis).toBeDefined();
      expect(wisdomSynthesis.synthesisId).toBeDefined();
      expect(wisdomSynthesis.algorithmicInsights).toBeDefined();
      expect(Array.isArray(wisdomSynthesis.algorithmicInsights)).toBe(true);
      expect(wisdomSynthesis.culturalIntegration).toBeDefined();
      expect(wisdomSynthesis.sovereigntyCompliance).toBe(true);
      expect(wisdomSynthesis.evolutionaryGuidance).toBeDefined();
      expect(wisdomSynthesis.systemOptimizations).toBeDefined();
    });

    test("should generate planetary insights", async () => {
      const consciousnessPatterns =
        await ainEnhancement.recognizeConsciousnessPatterns(
          testUserInteractions,
          [testCulturalProfile],
        );

      const planetaryInsights = await ainEnhancement.generatePlanetaryInsights(
        [testCulturalProfile],
        consciousnessPatterns,
      );

      expect(planetaryInsights).toBeDefined();
      expect(Array.isArray(planetaryInsights)).toBe(true);
      if (planetaryInsights.length > 0) {
        expect(planetaryInsights[0].insightId).toBeDefined();
        expect(planetaryInsights[0].insightContent).toBeDefined();
        expect(planetaryInsights[0].environmentalImplications).toBeDefined();
        expect(planetaryInsights[0].speciesCollaboration).toBeDefined();
        expect(planetaryInsights[0].sevenGenerationsImpact).toBeDefined();
      }
    });

    test("should coordinate community evolution", async () => {
      const evolutionCoordination =
        await ainEnhancement.coordinateCommunityEvolution(
          [testCulturalProfile],
          testUserInteractions,
        );

      expect(evolutionCoordination).toBeDefined();
      expect(evolutionCoordination.coordinationId).toBeDefined();
      expect(evolutionCoordination.evolutionDirection).toBeDefined();
      expect(evolutionCoordination.communitySupports).toBeDefined();
      expect(Array.isArray(evolutionCoordination.communitySupports)).toBe(true);
      expect(evolutionCoordination.culturalProtocols).toBeDefined();
      expect(evolutionCoordination.sevenGenerationsPlanning).toBeDefined();
    });

    test("should adapt cultural protocols", async () => {
      const protocolAdaptation = await ainEnhancement.adaptCulturalProtocols(
        testCulturalProfile,
        "collective_wisdom_sharing",
      );

      expect(protocolAdaptation).toBeDefined();
      expect(protocolAdaptation.adaptationId).toBeDefined();
      expect(protocolAdaptation.culturalProtocols).toBeDefined();
      expect(Array.isArray(protocolAdaptation.culturalProtocols)).toBe(true);
      expect(protocolAdaptation.sovereigntyMaintenance).toBeDefined();
      expect(protocolAdaptation.respectfulIntegration).toBeDefined();
      expect(protocolAdaptation.adaptationGuidance).toBeDefined();
    });
  });

  describe("Collective Intelligence Network Integration", () => {
    test("should check system readiness", () => {
      const isReady = collectiveIntelligenceNetworkIntegration.isSystemReady();
      expect(isReady).toBe(true);
    });

    test("should provide system status", () => {
      const status = collectiveIntelligenceNetworkIntegration.getSystemStatus();
      expect(status).toBeDefined();
      expect(status.initialized).toBe(true);
      expect(status.culturalIntegration).toBe(true);
      expect(status.soulDevelopmentIntegration).toBe(true);
      expect(status.collectiveIntelligenceIntegration).toBe(true);
      expect(status.version).toBe("3.0.0");
      expect(Array.isArray(status.components)).toBe(true);
      expect(status.phaseIntegration).toBeDefined();
    });

    test("should process archetypal dialogue query", async () => {
      const userInput =
        "How can I integrate my shadow while serving my community?";

      const response =
        await collectiveIntelligenceNetworkIntegration.processCollectiveIntelligenceQuery(
          userInput,
          testUserId,
          "archetypal_dialogue",
          { culturalBackground: "native_american" },
        );

      expect(response).toBeDefined();
      expect(response.collectiveIntelligenceResponse).toBeDefined();
      expect(response.archetypalDialogueInsights).toBeDefined();
      expect(response.culturalSovereigntyMaintained).toBe(true);
      expect(response.sevenGenerationsConsidered).toBe(true);
      expect(response.integrationOpportunities).toBeDefined();
      expect(Array.isArray(response.integrationOpportunities)).toBe(true);
    });

    test("should process wisdom synthesis query", async () => {
      const userInput =
        "I want to share my healing knowledge with the community";

      const response =
        await collectiveIntelligenceNetworkIntegration.processCollectiveIntelligenceQuery(
          userInput,
          testUserId,
          "wisdom_synthesis",
          { culturalBackground: "native_american" },
        );

      expect(response).toBeDefined();
      expect(response.collectiveIntelligenceResponse).toBeDefined();
      expect(response.collectiveWisdomFlow).toBeDefined();
      expect(response.culturalSovereigntyMaintained).toBe(true);
      expect(response.sevenGenerationsConsidered).toBe(true);
    });

    test("should process story weaving query", async () => {
      const userInput =
        "I want to weave my dreams into community healing stories";

      const response =
        await collectiveIntelligenceNetworkIntegration.processCollectiveIntelligenceQuery(
          userInput,
          testUserId,
          "story_weaving",
          { culturalBackground: "native_american" },
        );

      expect(response).toBeDefined();
      expect(response.collectiveIntelligenceResponse).toBeDefined();
      expect(response.communityStoryWeaving).toBeDefined();
      expect(response.culturalSovereigntyMaintained).toBe(true);
      expect(response.sevenGenerationsConsidered).toBe(true);
    });

    test("should process consciousness patterns query", async () => {
      const userInput =
        "What consciousness patterns are emerging in our community?";

      const response =
        await collectiveIntelligenceNetworkIntegration.processCollectiveIntelligenceQuery(
          userInput,
          testUserId,
          "consciousness_patterns",
          { culturalBackground: "native_american" },
        );

      expect(response).toBeDefined();
      expect(response.collectiveIntelligenceResponse).toBeDefined();
      expect(response.planetaryConsciousnessInsights).toBeDefined();
      expect(Array.isArray(response.planetaryConsciousnessInsights)).toBe(true);
      expect(response.culturalSovereigntyMaintained).toBe(true);
      expect(response.sevenGenerationsConsidered).toBe(true);
    });

    test("should process comprehensive collective intelligence query", async () => {
      const userInput =
        "I need guidance for my role in planetary healing and collective evolution";

      const response =
        await collectiveIntelligenceNetworkIntegration.processCollectiveIntelligenceQuery(
          userInput,
          testUserId,
          "comprehensive",
          { culturalBackground: "native_american" },
        );

      expect(response).toBeDefined();
      expect(response.collectiveIntelligenceResponse).toBeDefined();
      expect(response.archetypalDialogueInsights).toBeDefined();
      expect(response.collectiveWisdomFlow).toBeDefined();
      expect(response.communityStoryWeaving).toBeDefined();
      expect(response.planetaryConsciousnessInsights).toBeDefined();
      expect(response.culturalSovereigntyMaintained).toBe(true);
      expect(response.sevenGenerationsConsidered).toBe(true);
      expect(response.integrationOpportunities).toBeDefined();
      expect(response.nextEvolutionSteps).toBeDefined();
      expect(response.collectiveHealingPotential).toBeDefined();
    });
  });

  describe("Helper Functions", () => {
    test("should process archetypal dialogue with integration helper", async () => {
      const userInput = "How do I balance warrior and healer energies?";
      const userProfile = { culturalBackground: "native_american" };

      const response = await processArchetypalDialogueWithIntegration(
        userInput,
        testUserId,
        userProfile,
      );

      expect(response).toBeDefined();
      expect(response.collectiveIntelligenceResponse).toBeDefined();
      expect(response.archetypalDialogueInsights).toBeDefined();
    });

    test("should process wisdom synthesis with integration helper", async () => {
      const userInput =
        "I learned a powerful healing practice from my grandmother";
      const userProfile = { culturalBackground: "native_american" };

      const response = await processWisdomSynthesisWithIntegration(
        userInput,
        testUserId,
        userProfile,
      );

      expect(response).toBeDefined();
      expect(response.collectiveIntelligenceResponse).toBeDefined();
      expect(response.collectiveWisdomFlow).toBeDefined();
    });

    test("should process story weaving with integration helper", async () => {
      const userInput = "My dreams are showing me the healing our land needs";
      const userProfile = { culturalBackground: "native_american" };

      const response = await processStoryWeavingWithIntegration(
        userInput,
        testUserId,
        userProfile,
      );

      expect(response).toBeDefined();
      expect(response.collectiveIntelligenceResponse).toBeDefined();
      expect(response.communityStoryWeaving).toBeDefined();
    });

    test("should process consciousness patterns with integration helper", async () => {
      const userInput = "What patterns of awakening are happening globally?";
      const userProfile = { culturalBackground: "native_american" };

      const response = await processConsciousnessPatternWithIntegration(
        userInput,
        testUserId,
        userProfile,
      );

      expect(response).toBeDefined();
      expect(response.collectiveIntelligenceResponse).toBeDefined();
      expect(response.planetaryConsciousnessInsights).toBeDefined();
    });

    test("should process comprehensive collective intelligence helper", async () => {
      const userInput = "Guide me in my role as a bridge between worlds";
      const userProfile = { culturalBackground: "native_american" };

      const response = await processComprehensiveCollectiveIntelligence(
        userInput,
        testUserId,
        userProfile,
      );

      expect(response).toBeDefined();
      expect(response.collectiveIntelligenceResponse).toBeDefined();
      expect(response.archetypalDialogueInsights).toBeDefined();
      expect(response.collectiveWisdomFlow).toBeDefined();
      expect(response.communityStoryWeaving).toBeDefined();
      expect(response.planetaryConsciousnessInsights).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    test("should handle invalid user ID gracefully", async () => {
      const invalidUserId = "";

      try {
        await interArchetypalDialogueEngine.conveneArchetypalCouncil(
          "test challenge",
          invalidUserId,
          testCulturalProfile,
        );
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test("should handle missing cultural profile gracefully", async () => {
      const response =
        await collectiveIntelligenceNetworkIntegration.processCollectiveIntelligenceQuery(
          "test input",
          testUserId,
          "archetypal_dialogue",
          undefined,
        );

      expect(response).toBeDefined();
      expect(response.collectiveIntelligenceResponse).toBeDefined();
    });

    test("should handle unknown query type gracefully", async () => {
      try {
        await collectiveIntelligenceNetworkIntegration.processCollectiveIntelligenceQuery(
          "test input",
          testUserId,
          "unknown_type" as any,
          {},
        );
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain(
          "Unknown collective intelligence query type",
        );
      }
    });
  });

  describe("Integration with Cultural Foundation and Soul Development", () => {
    test("should integrate with cultural context awareness", async () => {
      const userInput = "I need guidance that honors my ancestral ways";

      const response =
        await collectiveIntelligenceNetworkIntegration.processCollectiveIntelligenceQuery(
          userInput,
          testUserId,
          "comprehensive",
          { culturalBackground: "native_american" },
        );

      expect(response.culturalSovereigntyMaintained).toBe(true);
      expect(response.collectiveIntelligenceResponse).toContain(
        "native_american",
      );
    });

    test("should respect indigenous sovereignty protocols", async () => {
      const userInput =
        "I want to share traditional healing knowledge respectfully";

      const response = await processWisdomSynthesisWithIntegration(
        userInput,
        testUserId,
        { culturalBackground: "native_american" },
      );

      expect(response).toBeDefined();
      expect(response.culturalSovereigntyMaintained).toBe(true);
    });

    test("should integrate with soul development insights", async () => {
      const userInput = "How does my shadow work serve the collective healing?";

      const response = await processArchetypalDialogueWithIntegration(
        userInput,
        testUserId,
        { culturalBackground: "native_american" },
      );

      expect(response).toBeDefined();
      expect(response.archetypalDialogueInsights).toBeDefined();
    });

    test("should honor seven generations thinking", async () => {
      const userInput = "What are my responsibilities to future generations?";

      const response = await processConsciousnessPatternWithIntegration(
        userInput,
        testUserId,
        { culturalBackground: "native_american" },
      );

      expect(response).toBeDefined();
      expect(response.sevenGenerationsConsidered).toBe(true);
      expect(response.planetaryConsciousnessInsights).toBeDefined();
    });
  });

  describe("Planetary Consciousness Integration", () => {
    test("should recognize planetary consciousness patterns", async () => {
      const userInput = "How can I serve the healing of Mother Earth?";

      const response = await processComprehensiveCollectiveIntelligence(
        userInput,
        testUserId,
        { culturalBackground: "native_american" },
      );

      expect(response).toBeDefined();
      expect(response.planetaryConsciousnessInsights).toBeDefined();
      expect(response.collectiveHealingPotential).toBeDefined();
      expect(response.sevenGenerationsConsidered).toBe(true);
    });

    test("should integrate environmental awareness", async () => {
      const userInput = "What is my role in environmental stewardship?";

      const response = await processConsciousnessPatternWithIntegration(
        userInput,
        testUserId,
        { culturalBackground: "native_american" },
      );

      expect(response).toBeDefined();
      expect(response.planetaryConsciousnessInsights).toBeDefined();
      if (response.planetaryConsciousnessInsights!.length > 0) {
        expect(
          response.planetaryConsciousnessInsights![0].environmentalImplications,
        ).toBeDefined();
      }
    });

    test("should support species collaboration awareness", async () => {
      const userInput = "How do I learn from the wisdom of animals and plants?";

      const response = await processStoryWeavingWithIntegration(
        userInput,
        testUserId,
        { culturalBackground: "native_american" },
      );

      expect(response).toBeDefined();
      expect(response.communityStoryWeaving).toBeDefined();
      expect(response.sevenGenerationsConsidered).toBe(true);
    });
  });
});

// Test data cleanup
afterAll(() => {
  // Clean up any test data if needed
  console.log("Collective Intelligence tests completed");
});
