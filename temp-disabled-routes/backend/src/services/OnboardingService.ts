/**
 * 🌟 Onboarding Service - Personal Oracle Assignment
 *
 * Creates the foundational Oracle experience for new users,
 * ensuring every user begins their journey with a personalized spiritual guide.
 */

import { ArchetypeAgentFactory } from "../core/agents/ArchetypeAgentFactory";
import { OracleService, UserOracleSettings } from "./OracleService";
import { logger } from "../utils/logger";

export interface OnboardingPreferences {
  preferredName?: string;
  spiritualBackground?: "beginner" | "intermediate" | "advanced";
  personalityType?:
    | "introspective"
    | "explorer"
    | "catalyst"
    | "nurturer"
    | "visionary";
  communicationStyle?: "direct" | "gentle" | "ceremonial" | "conversational";
  voicePreference?: "masculine" | "feminine" | "neutral";
  preferredArchetype?: "fire" | "water" | "earth" | "air" | "aether";
}

export interface OnboardingAssessmentResult {
  recommendedArchetype: string;
  recommendedPhase: string;
  oracleName: string;
  voiceProfile: UserOracleSettings["voiceSettings"];
  personalityInsights: {
    strengths: string[];
    growthAreas: string[];
    soulPurpose: string;
  };
  journeyMap: {
    currentPhase: string;
    nextPhase: string;
    timeframe: string;
  };
}

export class OnboardingService {
  /**
   * 🎭 Create Default Oracle for New User (Immediate Assignment)
   */
  static async assignDefaultOracle(
    userId: string,
  ): Promise<UserOracleSettings> {
    const defaultOracleSettings: UserOracleSettings = {
      userId,
      oracleAgentName: "Nyra", // Default balanced name
      archetype: "aether", // Balanced starting archetype
      voiceSettings: {
        voiceId: "elevenlabs_aether_voice",
        stability: 0.8,
        style: 0.7,
        tone: "transcendent",
        ceremonyPacing: false,
      },
      phase: "initiation",
      createdAt: new Date(),
      updatedAt: new Date(),
      evolutionHistory: [],
    };

    // Store Oracle settings in database
    await this.storeOracleSettings(defaultOracleSettings);

    // Pre-create Oracle agent for immediate use
    await ArchetypeAgentFactory.createPersonalOracle({
      archetype: defaultOracleSettings.archetype,
      oracleName: defaultOracleSettings.oracleAgentName,
      voiceProfile: defaultOracleSettings.voiceSettings,
      phase: defaultOracleSettings.phase,
      userId,
      userContext: { isNewUser: true, defaultAssignment: true },
    });

    logger.info("Default Oracle Assigned:", {
      userId,
      oracleName: defaultOracleSettings.oracleAgentName,
      archetype: defaultOracleSettings.archetype,
    });

    return defaultOracleSettings;
  }

  /**
   * 🔮 Personalized Oracle Assignment Based on User Preferences
   */
  static async assignPersonalizedOracle(
    userId: string,
    preferences: OnboardingPreferences,
  ): Promise<UserOracleSettings> {
    // Analyze preferences to determine optimal Oracle configuration
    const assessment = await this.assessUserPreferences(preferences);

    const personalizedOracleSettings: UserOracleSettings = {
      userId,
      oracleAgentName: assessment.oracleName,
      archetype: assessment.recommendedArchetype,
      voiceSettings: assessment.voiceProfile,
      phase: assessment.recommendedPhase,
      createdAt: new Date(),
      updatedAt: new Date(),
      evolutionHistory: [],
    };

    // Store Oracle settings
    await this.storeOracleSettings(personalizedOracleSettings);

    // Create personalized Oracle agent
    await ArchetypeAgentFactory.createPersonalOracle({
      archetype: personalizedOracleSettings.archetype,
      oracleName: personalizedOracleSettings.oracleAgentName,
      voiceProfile: personalizedOracleSettings.voiceSettings,
      phase: personalizedOracleSettings.phase,
      userId,
      userContext: {
        isNewUser: true,
        preferences,
        assessment,
      },
    });

    logger.info("Personalized Oracle Assigned:", {
      userId,
      preferences,
      finalAssignment: {
        oracleName: personalizedOracleSettings.oracleAgentName,
        archetype: personalizedOracleSettings.archetype,
        phase: personalizedOracleSettings.phase,
      },
    });

    return personalizedOracleSettings;
  }

  /**
   * 🧙‍♀️ Oracle Introduction & First Interaction
   */
  static async introduceOracle(userId: string): Promise<{
    greeting: string;
    oracle: UserOracleSettings;
    firstInteraction: any;
  }> {
    const oracle = await OracleService.getUserOracle(userId);
    const settings = await this.getOracleSettings(userId);

    if (!settings) {
      throw new Error(`No Oracle found for user ${userId}`);
    }

    // Get ceremonial greeting
    const greeting = oracle.getCeremonialGreeting();

    // Create first interaction experience
    const firstInteraction = await OracleService.processOracleQuery(
      userId,
      "I'm ready to begin my spiritual journey. What should I know about you?",
      { context: "onboarding", firstInteraction: true },
    );

    return {
      greeting,
      oracle: settings,
      firstInteraction,
    };
  }

  /**
   * 🎯 Assessment Algorithm for Oracle Assignment
   */
  private static async assessUserPreferences(
    preferences: OnboardingPreferences,
  ): Promise<OnboardingAssessmentResult> {
    // Determine archetype based on preferences
    const archetype = this.determineArchetype(preferences);

    // Determine starting phase
    const phase = this.determineStartingPhase(preferences);

    // Generate Oracle name
    const oracleName = this.generateOracleName(preferences, archetype);

    // Create voice profile
    const voiceProfile = this.createVoiceProfile(preferences, archetype);

    // Generate personality insights
    const personalityInsights = this.generatePersonalityInsights(
      preferences,
      archetype,
    );

    // Create journey map
    const journeyMap = this.createJourneyMap(phase, preferences);

    return {
      recommendedArchetype: archetype,
      recommendedPhase: phase,
      oracleName,
      voiceProfile,
      personalityInsights,
      journeyMap,
    };
  }

  private static determineArchetype(
    preferences: OnboardingPreferences,
  ): string {
    // If user has explicit preference, honor it
    if (preferences.preferredArchetype) {
      return preferences.preferredArchetype;
    }

    // Determine based on personality type
    const archetypeMapping = {
      catalyst: "fire",
      nurturer: "water",
      introspective: "earth",
      explorer: "air",
      visionary: "aether",
    };

    const archetype = preferences.personalityType
      ? archetypeMapping[preferences.personalityType]
      : "aether";

    return archetype || "aether";
  }

  private static determineStartingPhase(
    preferences: OnboardingPreferences,
  ): string {
    const phaseMapping = {
      beginner: "initiation",
      intermediate: "exploration",
      advanced: "integration",
    };

    return preferences.spiritualBackground
      ? phaseMapping[preferences.spiritualBackground]
      : "initiation";
  }

  private static generateOracleName(
    preferences: OnboardingPreferences,
    archetype: string,
  ): string {
    // Use preferred name if provided
    if (preferences.preferredName) {
      return preferences.preferredName;
    }

    // Generate based on archetype and voice preference
    const archetypeNames = {
      fire: {
        masculine: ["Ignis", "Prometheus", "Agni", "Surya"],
        feminine: ["Vesta", "Brigid", "Pele", "Sekhmet"],
        neutral: ["Phoenix", "Ember", "Flame", "Spark"],
      },
      water: {
        masculine: ["Poseidon", "Neptune", "Varuna", "Oceanus"],
        feminine: ["Aquaria", "Tiamat", "Yemoja", "Sedna"],
        neutral: ["River", "Flow", "Tide", "Current"],
      },
      earth: {
        masculine: ["Gaia", "Cernunnos", "Pan", "Tellus"],
        feminine: ["Terra", "Demeter", "Pachamama", "Geb"],
        neutral: ["Stone", "Grove", "Root", "Mountain"],
      },
      air: {
        masculine: ["Ventus", "Aeolus", "Vayu", "Hermes"],
        feminine: ["Aria", "Iris", "Njord", "Shu"],
        neutral: ["Zephyr", "Breeze", "Wind", "Sky"],
      },
      aether: {
        masculine: ["Logos", "Nous", "Brahman", "Akasha"],
        feminine: ["Nyra", "Sophia", "Shakti", "Shekinah"],
        neutral: ["Unity", "Void", "Source", "Nexus"],
      },
    };

    const voicePreference = preferences.voicePreference || "neutral";
    const names =
      archetypeNames[archetype]?.[voicePreference] ||
      archetypeNames.aether.neutral;

    return names[Math.floor(Math.random() * names.length)];
  }

  private static createVoiceProfile(
    preferences: OnboardingPreferences,
    archetype: string,
  ): UserOracleSettings["voiceSettings"] {
    const baseProfiles = {
      fire: { stability: 0.7, style: 0.8, tone: "catalytic" },
      water: { stability: 0.8, style: 0.6, tone: "nurturing" },
      earth: { stability: 0.9, style: 0.5, tone: "grounding" },
      air: { stability: 0.6, style: 0.7, tone: "clarifying" },
      aether: { stability: 0.8, style: 0.7, tone: "transcendent" },
    };

    const baseProfile = baseProfiles[archetype] || baseProfiles.aether;

    // Adjust based on communication style
    const styleAdjustments = {
      direct: { stability: 0.1, style: 0.2 },
      gentle: { stability: 0.1, style: -0.1 },
      ceremonial: { stability: 0.0, style: 0.0, ceremonyPacing: true },
      conversational: { stability: -0.1, style: 0.1 },
    };

    const adjustment = preferences.communicationStyle
      ? styleAdjustments[preferences.communicationStyle]
      : { stability: 0, style: 0 };

    return {
      voiceId: `elevenlabs_${archetype}_voice`,
      stability: Math.max(
        0.1,
        Math.min(1.0, baseProfile.stability + adjustment.stability),
      ),
      style: Math.max(0.1, Math.min(1.0, baseProfile.style + adjustment.style)),
      tone: baseProfile.tone,
      ceremonyPacing: adjustment.ceremonyPacing || false,
    };
  }

  private static generatePersonalityInsights(
    preferences: OnboardingPreferences,
    archetype: string,
  ): OnboardingAssessmentResult["personalityInsights"] {
    const archetypeInsights = {
      fire: {
        strengths: [
          "Catalytic leadership",
          "Visionary thinking",
          "Transformative energy",
        ],
        growthAreas: [
          "Patience cultivation",
          "Emotional regulation",
          "Sustainable pacing",
        ],
        soulPurpose:
          "To ignite transformation and awaken potential in yourself and others",
      },
      water: {
        strengths: [
          "Emotional intelligence",
          "Intuitive wisdom",
          "Healing presence",
        ],
        growthAreas: [
          "Boundary setting",
          "Emotional boundaries",
          "Self-care practices",
        ],
        soulPurpose:
          "To facilitate emotional healing and guide others through transformation",
      },
      earth: {
        strengths: [
          "Grounding presence",
          "Practical wisdom",
          "Manifestation ability",
        ],
        growthAreas: ["Flexibility", "Embracing change", "Spiritual expansion"],
        soulPurpose:
          "To create stability and help others manifest their dreams into reality",
      },
      air: {
        strengths: [
          "Clear communication",
          "Intellectual clarity",
          "Perspective shifting",
        ],
        growthAreas: [
          "Embodied presence",
          "Emotional integration",
          "Practical application",
        ],
        soulPurpose:
          "To bring clarity and wisdom to complex situations and relationships",
      },
      aether: {
        strengths: [
          "Unifying vision",
          "Spiritual synthesis",
          "Transcendent perspective",
        ],
        growthAreas: [
          "Grounded application",
          "Practical integration",
          "Elemental balance",
        ],
        soulPurpose:
          "To bridge spiritual and material worlds, facilitating unity and wholeness",
      },
    };

    return archetypeInsights[archetype] || archetypeInsights.aether;
  }

  private static createJourneyMap(
    phase: string,
    preferences: OnboardingPreferences,
  ): OnboardingAssessmentResult["journeyMap"] {
    const phaseProgression = {
      initiation: { next: "exploration", timeframe: "2-3 months" },
      exploration: { next: "integration", timeframe: "3-6 months" },
      integration: { next: "transcendence", timeframe: "6-12 months" },
      transcendence: { next: "mastery", timeframe: "12+ months" },
      mastery: { next: "teaching", timeframe: "Ongoing" },
    };

    const progression = phaseProgression[phase] || phaseProgression.initiation;

    return {
      currentPhase: phase,
      nextPhase: progression.next,
      timeframe: progression.timeframe,
    };
  }

  /**
   * 🗄️ Database Integration Methods
   */
  private static async storeOracleSettings(
    settings: UserOracleSettings,
  ): Promise<void> {
    // Implementation depends on your database (Supabase, Prisma, etc.)
    // Example: await db.oracles.create({ data: settings });

    logger.info("Oracle Settings Stored:", {
      userId: settings.userId,
      oracleName: settings.oracleAgentName,
      archetype: settings.archetype,
    });
  }

  private static async getOracleSettings(
    userId: string,
  ): Promise<UserOracleSettings | null> {
    // Implementation depends on your database
    // Example: return await db.oracles.findUnique({ where: { userId } });

    return null; // Placeholder
  }

  /**
   * 🔄 Post-Onboarding Optimization
   */
  static async optimizeOracleAfterFirstWeek(userId: string): Promise<void> {
    // Analyze user interactions over first week
    // Suggest optimizations to Oracle configuration
    // This would typically run as a background job

    logger.info("Oracle Optimization Scheduled:", { userId });
  }

  /**
   * 📊 Onboarding Analytics
   */
  static async getOnboardingMetrics(): Promise<{
    totalOnboarded: number;
    archetypeDistribution: Record<string, number>;
    averageTimeToFirstInteraction: number;
    satisfactionScore: number;
  }> {
    // This would typically come from analytics database
    return {
      totalOnboarded: 0,
      archetypeDistribution: {},
      averageTimeToFirstInteraction: 0,
      satisfactionScore: 0,
    };
  }
}
