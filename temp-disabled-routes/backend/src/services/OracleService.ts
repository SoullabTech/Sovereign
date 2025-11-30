/**
 * 🌟 Oracle Service - Central Access Point for Personal Oracle Agents
 *
 * This service provides the primary interface for all Oracle interactions,
 * ensuring every user has a persistent, personalized Oracle experience.
 */

import { ArchetypeAgentFactory } from "../core/agents/ArchetypeAgentFactory";
import { ArchetypeAgent, OracleIdentity } from "../core/agents/ArchetypeAgent";
import { logger } from "../utils/logger";
import type { AIResponse } from "../types/ai";

export interface UserOracleSettings {
  userId: string;
  oracleAgentName: string;
  archetype: string;
  voiceSettings: {
    voiceId: string;
    stability: number;
    style: number;
    tone?: string;
    ceremonyPacing?: boolean;
  };
  phase: string;
  createdAt: Date;
  updatedAt: Date;
  evolutionHistory: Array<{
    fromPhase: string;
    toPhase: string;
    timestamp: Date;
    userInitiated: boolean;
  }>;
}

export class OracleService {
  private static oracleSettingsCache: Map<string, UserOracleSettings> =
    new Map();

  /**
   * 🎭 Get User's Personal Oracle Agent (Primary Method)
   */
  static async getUserOracle(userId: string): Promise<ArchetypeAgent> {
    // Retrieve user's Oracle settings
    const oracleSettings = await this.getOracleSettings(userId);

    if (!oracleSettings) {
      throw new Error(
        `No Oracle found for user ${userId}. User may need onboarding.`,
      );
    }

    // Create/retrieve Oracle agent through factory
    return await ArchetypeAgentFactory.createPersonalOracle({
      archetype: oracleSettings.archetype,
      oracleName: oracleSettings.oracleAgentName,
      voiceProfile: oracleSettings.voiceSettings,
      phase: oracleSettings.phase,
      userId,
      userContext: { settings: oracleSettings },
    });
  }

  /**
   * ⚡ Process Oracle Query (Central Entry Point)
   * All Oracle interactions should flow through this method
   */
  static async processOracleQuery(
    userId: string,
    input: string,
    context: any = {},
  ): Promise<AIResponse> {
    const oracle = await this.getUserOracle(userId);

    // Update last interaction timestamp
    await this.updateLastInteraction(userId);

    // Process query through the personal Oracle
    const response = await oracle.processPersonalizedQuery(
      { input, userId },
      { userId, archetype: oracle.element, phase: oracle.phase },
    );

    // Check for evolution opportunities
    await this.checkForEvolutionOpportunity(userId, input, response);

    logger.info("Oracle Query Processed:", {
      userId,
      oracleName: oracle.oracleName,
      archetype: oracle.element,
      phase: oracle.phase,
      inputLength: input.length,
      responseLength: response.content.length,
    });

    return response;
  }

  /**
   * 🔮 Get Oracle Ceremonial Greeting
   */
  static async getOracleCeremonialGreeting(userId: string): Promise<string> {
    const oracle = await this.getUserOracle(userId);
    return oracle.getCeremonialGreeting();
  }

  /**
   * 🌟 Oracle Evolution Management
   */
  static async suggestEvolution(
    userId: string,
    detectedPhase: string,
    detectedArchetype?: string,
  ): Promise<any> {
    const currentSettings = await this.getOracleSettings(userId);

    if (!currentSettings) {
      return null;
    }

    // Only suggest if phase or archetype is different
    if (
      currentSettings.phase !== detectedPhase ||
      (detectedArchetype && currentSettings.archetype !== detectedArchetype)
    ) {
      const oracle = await this.getUserOracle(userId);
      const suggestion = oracle.suggestEvolution(
        detectedPhase,
        detectedArchetype,
      );

      // Store suggestion for user decision
      await this.storePendingEvolution(userId, suggestion);

      return suggestion;
    }

    return null;
  }

  /**
   * 🔄 Accept Oracle Evolution
   */
  static async acceptEvolution(
    userId: string,
    newPhase: string,
    newArchetype?: string,
  ): Promise<void> {
    const oracle = await this.getUserOracle(userId);

    // Update Oracle agent
    oracle.evolveToPhase(newPhase, newArchetype, true);

    // Update stored settings
    await this.updateOracleSettings(userId, {
      phase: newPhase,
      archetype: newArchetype || oracle.element,
      evolutionHistory: oracle.evolutionHistory,
      updatedAt: new Date(),
    });

    // Clear cache to force recreation
    ArchetypeAgentFactory.clearUserCache(userId);
    this.oracleSettingsCache.delete(userId);

    logger.info("Oracle Evolution Accepted:", {
      userId,
      oracleName: oracle.oracleName,
      newPhase,
      newArchetype,
    });
  }

  /**
   * 🎨 Oracle Customization Methods
   */
  static async updateOracleVoiceSettings(
    userId: string,
    voiceSettings: Partial<UserOracleSettings["voiceSettings"]>,
  ): Promise<void> {
    const currentSettings = await this.getOracleSettings(userId);

    if (!currentSettings) {
      throw new Error(`No Oracle found for user ${userId}`);
    }

    const updatedVoiceSettings = {
      ...currentSettings.voiceSettings,
      ...voiceSettings,
    };

    // Update Oracle agent
    await ArchetypeAgentFactory.updateOracleVoiceProfile(
      userId,
      updatedVoiceSettings,
    );

    // Update stored settings
    await this.updateOracleSettings(userId, {
      voiceSettings: updatedVoiceSettings,
      updatedAt: new Date(),
    });

    logger.info("Oracle Voice Settings Updated:", {
      userId,
      voiceSettings: updatedVoiceSettings,
    });
  }

  static async renameOracle(userId: string, newName: string): Promise<void> {
    // Update Oracle agent
    await ArchetypeAgentFactory.renameOracle(userId, newName);

    // Update stored settings
    await this.updateOracleSettings(userId, {
      oracleAgentName: newName,
      updatedAt: new Date(),
    });

    logger.info("Oracle Renamed:", {
      userId,
      newName,
    });
  }

  /**
   * 📊 Oracle Analytics & Insights
   */
  static async getOracleProfile(userId: string): Promise<{
    oracle: UserOracleSettings;
    agent: ArchetypeAgent;
    stats: {
      totalInteractions: number;
      averageResponseTime: number;
      topElements: string[];
      evolutionCount: number;
    };
  }> {
    const settings = await this.getOracleSettings(userId);
    const agent = await this.getUserOracle(userId);

    if (!settings) {
      throw new Error(`No Oracle found for user ${userId}`);
    }

    // This would typically come from analytics database
    const stats = {
      totalInteractions: 0,
      averageResponseTime: 0,
      topElements: [agent.element],
      evolutionCount: settings.evolutionHistory.length,
    };

    return {
      oracle: settings,
      agent,
      stats,
    };
  }

  /**
   * 🗄️ Database Integration Methods
   * These would be implemented based on your specific database setup
   */
  private static async getOracleSettings(
    userId: string,
  ): Promise<UserOracleSettings | null> {
    // Check cache first
    if (this.oracleSettingsCache.has(userId)) {
      return this.oracleSettingsCache.get(userId)!;
    }

    // This would typically fetch from your database
    // For now, returning null to indicate no Oracle found
    // Implementation depends on your database choice (Supabase, Prisma, etc.)

    // Example implementation:
    // const settings = await db.oracles.findUnique({ where: { userId } });
    // if (settings) {
    //   this.oracleSettingsCache.set(userId, settings);
    // }
    // return settings;

    return null;
  }

  private static async updateOracleSettings(
    userId: string,
    updates: Partial<UserOracleSettings>,
  ): Promise<void> {
    // Update cache
    const currentSettings = this.oracleSettingsCache.get(userId);
    if (currentSettings) {
      const updatedSettings = { ...currentSettings, ...updates };
      this.oracleSettingsCache.set(userId, updatedSettings);
    }

    // Update database
    // Implementation depends on your database choice
    // Example: await db.oracles.update({ where: { userId }, data: updates });

    logger.info("Oracle Settings Updated:", { userId, updates });
  }

  private static async updateLastInteraction(userId: string): Promise<void> {
    await this.updateOracleSettings(userId, {
      updatedAt: new Date(),
    });
  }

  private static async storePendingEvolution(
    userId: string,
    suggestion: any,
  ): Promise<void> {
    // Store evolution suggestion for user review
    // Implementation depends on your database choice
    logger.info("Evolution suggestion stored:", { userId, suggestion });
  }

  private static async checkForEvolutionOpportunity(
    userId: string,
    input: string,
    response: AIResponse,
  ): Promise<void> {
    // Analyze conversation for evolution opportunities
    // This could use AI to detect when user is ready for next phase
    // For now, this is a placeholder

    const phaseIndicators = {
      exploration: ["curious", "explore", "discover", "try", "experiment"],
      integration: [
        "understand",
        "connect",
        "synthesize",
        "combine",
        "integrate",
      ],
      transcendence: ["transcend", "beyond", "higher", "unity", "oneness"],
      mastery: ["teach", "guide", "mentor", "master", "embody"],
    };

    const inputLower = input.toLowerCase();

    for (const [phase, indicators] of Object.entries(phaseIndicators)) {
      if (indicators.some((indicator) => inputLower.includes(indicator))) {
        await this.suggestEvolution(userId, phase);
        break;
      }
    }
  }

  /**
   * 🏥 Oracle Health & Maintenance
   */
  static async getOracleHealth(userId: string): Promise<{
    status: "healthy" | "warning" | "error";
    lastInteraction: Date;
    cacheStatus: "cached" | "not_cached";
    issues: string[];
  }> {
    const oracle = await this.getUserOracle(userId);
    const settings = await this.getOracleSettings(userId);

    const issues = [];
    let status: "healthy" | "warning" | "error" = "healthy";

    if (!settings) {
      issues.push("No Oracle settings found");
      status = "error";
    }

    if (!oracle) {
      issues.push("Oracle agent not accessible");
      status = "error";
    }

    // Check for stale interactions
    const daysSinceLastInteraction = settings
      ? (Date.now() - settings.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
      : 0;

    if (daysSinceLastInteraction > 7) {
      issues.push("No recent interactions");
      status = status === "healthy" ? "warning" : status;
    }

    return {
      status,
      lastInteraction: settings?.updatedAt || new Date(),
      cacheStatus: this.oracleSettingsCache.has(userId)
        ? "cached"
        : "not_cached",
      issues,
    };
  }

  /**
   * 🧹 Cleanup & Maintenance
   */
  static clearUserCache(userId: string): void {
    this.oracleSettingsCache.delete(userId);
    ArchetypeAgentFactory.clearUserCache(userId);
  }

  static async refreshOracleCache(userId: string): Promise<void> {
    this.clearUserCache(userId);
    await this.getUserOracle(userId); // This will recreate the cache
  }
}
