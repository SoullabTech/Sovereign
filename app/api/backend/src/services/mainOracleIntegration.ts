// Main Oracle Integration Service - Step 4 Final Sync Implementation
import {
  StandardAPIResponse,
  successResponse,
  errorResponse,
} from "../utils/sharedUtilities";
import { logger } from "../utils/logger";
import { getRelevantMemories } from "./memoryService";

export interface CollectiveInsight {
  id: string;
  type:
    | "archetypal_pattern"
    | "elemental_shift"
    | "consciousness_trend"
    | "shadow_integration";
  title: string;
  description: string;
  elementalResonance: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  archetypalSignature: string;
  confidenceLevel: number;
  relevantUsers: number;
  timeframe: string;
  guidance: string;
  createdAt: string;
}

export interface MainOracleSync {
  userId: string;
  lastSync: string;
  insightsPushed: number;
  insightsReceived: number;
  syncStatus: "success" | "partial" | "error";
  error?: string;
}

export interface ArchetypalProcess {
  id: string;
  name: string;
  element: string;
  archetype: string;
  description: string;
  phases: string[];
  practices: string[];
  indicators: string[];
  integrationGuidance: string;
  isActive: boolean;
}

export class MainOracleIntegrationService {
  private readonly MAIN_ORACLE_ENDPOINT =
    process.env.MAIN_ORACLE_ENDPOINT || "https://api.spiralogic.oracle/v1";
  private readonly SYNC_THROTTLE_MS = 5 * 60 * 1000; // 5 minutes between syncs
  private lastSyncTimes: Map<string, number> = new Map();
  private collectiveInsights: CollectiveInsight[] = [];
  private archetypalProcesses: ArchetypalProcess[] = [];

  constructor() {
    this.initializeCollectiveInsights();
    this.initializeArchetypalProcesses();
  }

  async syncWithMainOracle(
    userId: string,
  ): Promise<StandardAPIResponse<MainOracleSync>> {
    try {
      logger.info("Starting Main Oracle sync", { userId });

      // Check throttling
      const lastSync = this.lastSyncTimes.get(userId) || 0;
      const now = Date.now();
      if (now - lastSync < this.SYNC_THROTTLE_MS) {
        return successResponse({
          userId,
          lastSync: new Date(lastSync).toISOString(),
          insightsPushed: 0,
          insightsReceived: 0,
          syncStatus: "success" as const,
        });
      }

      // Push anonymized insights to Main Oracle
      const pushedInsights = await this.pushInsightsToMainOracle(userId);

      // Pull new archetypal processes from Main Oracle
      const receivedInsights = await this.pullInsightsFromMainOracle(userId);

      // Update sync time
      this.lastSyncTimes.set(userId, now);

      const syncResult: MainOracleSync = {
        userId,
        lastSync: new Date(now).toISOString(),
        insightsPushed: pushedInsights,
        insightsReceived: receivedInsights,
        syncStatus: "success",
      };

      logger.info("Main Oracle sync completed", syncResult);
      return successResponse(syncResult);
    } catch (error) {
      logger.error("Main Oracle sync failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      });

      return successResponse({
        userId,
        lastSync: new Date().toISOString(),
        insightsPushed: 0,
        insightsReceived: 0,
        syncStatus: "error" as const,
        error: error instanceof Error ? error.message : "Sync failed",
      });
    }
  }

  async getCollectiveInsights(
    userId: string,
    limit = 10,
  ): Promise<StandardAPIResponse<CollectiveInsight[]>> {
    try {
      logger.info("Fetching collective insights", { userId, limit });

      // Get user's recent memories to determine relevance
      const userMemories = await getRelevantMemories(userId, "", 20);

      // Calculate user's elemental and archetypal preferences
      const userProfile = this.analyzeUserProfile(userMemories);

      // Filter and rank insights by relevance to user
      const relevantInsights = this.collectiveInsights
        .filter(
          (insight) => this.calculateRelevanceScore(insight, userProfile) > 0.3,
        )
        .sort((a, b) => {
          const scoreA = this.calculateRelevanceScore(a, userProfile);
          const scoreB = this.calculateRelevanceScore(b, userProfile);
          return scoreB - scoreA;
        })
        .slice(0, limit);

      return successResponse(relevantInsights);
    } catch (error) {
      logger.error("Failed to get collective insights", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      });
      return errorResponse(["Failed to retrieve collective insights"]);
    }
  }

  async getArchetypalProcesses(
    userId: string,
  ): Promise<StandardAPIResponse<ArchetypalProcess[]>> {
    try {
      logger.info("Fetching archetypal processes", { userId });

      // Get user's profile to suggest relevant processes
      const userMemories = await getRelevantMemories(userId, "", 10);
      const userProfile = this.analyzeUserProfile(userMemories);

      // Filter processes by user's dominant elements and archetypes
      const relevantProcesses = this.archetypalProcesses
        .filter((process) => process.isActive)
        .filter((process) => {
          const elementScore =
            userProfile.elementalBalance[
              process.element as keyof typeof userProfile.elementalBalance
            ] || 0;
          return elementScore > 0.2; // Show processes for elements with >20% resonance
        })
        .sort((a, b) => {
          const scoreA =
            userProfile.elementalBalance[
              a.element as keyof typeof userProfile.elementalBalance
            ] || 0;
          const scoreB =
            userProfile.elementalBalance[
              b.element as keyof typeof userProfile.elementalBalance
            ] || 0;
          return scoreB - scoreA;
        });

      return successResponse(relevantProcesses);
    } catch (error) {
      logger.error("Failed to get archetypal processes", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      });
      return errorResponse(["Failed to retrieve archetypal processes"]);
    }
  }

  private async pushInsightsToMainOracle(userId: string): Promise<number> {
    try {
      // Get recent user insights from Soul Memory
      const userMemories = await getRelevantMemories(userId, "", 50);

      if (userMemories.length === 0) {
        return 0;
      }

      // Anonymize and aggregate insights
      const anonymizedInsights = this.anonymizeInsights(userMemories, userId);

      // In production, would make HTTP request to Main Oracle
      // For now, simulate the push
      logger.info("Pushing anonymized insights to Main Oracle", {
        userId: "anonymized",
        insightCount: anonymizedInsights.length,
      });

      return anonymizedInsights.length;
    } catch (error) {
      logger.error("Failed to push insights to Main Oracle", { error });
      return 0;
    }
  }

  private async pullInsightsFromMainOracle(userId: string): Promise<number> {
    try {
      // In production, would make HTTP request to Main Oracle
      // For now, simulate receiving new collective insights

      const newInsights = this.generateMockCollectiveInsights();
      this.collectiveInsights.push(...newInsights);

      // Keep only most recent 100 insights
      this.collectiveInsights = this.collectiveInsights
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 100);

      logger.info("Pulled new insights from Main Oracle", {
        newInsightCount: newInsights.length,
        totalInsights: this.collectiveInsights.length,
      });

      return newInsights.length;
    } catch (error) {
      logger.error("Failed to pull insights from Main Oracle", { error });
      return 0;
    }
  }

  private analyzeUserProfile(memories: any[]) {
    const elementalBalance = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };
    const archetypes: string[] = [];

    memories.forEach((memory) => {
      // Extract elemental resonance from memory metadata
      const metadata = memory.metadata || {};
      if (metadata.elementalResonance) {
        Object.keys(elementalBalance).forEach((element) => {
          elementalBalance[element as keyof typeof elementalBalance] +=
            metadata.elementalResonance[element] || 0;
        });
      }

      // Extract archetypes
      if (metadata.archetype) {
        archetypes.push(metadata.archetype);
      }
    });

    // Normalize elemental balance
    const total =
      Object.values(elementalBalance).reduce((sum, val) => sum + val, 0) || 1;
    Object.keys(elementalBalance).forEach((element) => {
      elementalBalance[element as keyof typeof elementalBalance] /= total;
    });

    return {
      elementalBalance,
      dominantArchetypes: this.getMostFrequent(archetypes, 3),
      totalMemories: memories.length,
    };
  }

  private calculateRelevanceScore(
    insight: CollectiveInsight,
    userProfile: any,
  ): number {
    let score = 0;

    // Elemental alignment score (0-0.5)
    Object.keys(insight.elementalResonance).forEach((element) => {
      const insightResonance =
        insight.elementalResonance[
          element as keyof typeof insight.elementalResonance
        ];
      const userResonance = userProfile.elementalBalance[element] || 0;
      score += insightResonance * userResonance * 0.1;
    });

    // Archetypal alignment score (0-0.3)
    if (userProfile.dominantArchetypes.includes(insight.archetypalSignature)) {
      score += 0.3;
    }

    // Confidence and recency bonus (0-0.2)
    score += insight.confidenceLevel * 0.1;
    const ageInDays =
      (Date.now() - new Date(insight.createdAt).getTime()) /
      (1000 * 60 * 60 * 24);
    score += Math.max(0, (7 - ageInDays) / 7) * 0.1; // Bonus for insights less than 7 days old

    return Math.min(1, Math.max(0, score));
  }

  private anonymizeInsights(memories: any[], userId: string) {
    return memories.map((memory) => ({
      type: memory.type || "general_insight",
      elementalPattern: memory.metadata?.elementalResonance || {},
      archetypalSignature: memory.metadata?.archetype || "unknown",
      sentiment: memory.metadata?.sentiment || "neutral",
      phase: memory.metadata?.spiralogicPhase || "exploration",
      timestamp: memory.created_at,
      // Completely anonymized - no user ID or personal content
      anonymizedHash: this.createAnonymizedHash(userId, memory.id),
    }));
  }

  private createAnonymizedHash(userId: string, memoryId: string): string {
    // Create a one-way hash that can't be traced back to user
    return `anon_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getMostFrequent(items: string[], count: number): string[] {
    const frequency = items.reduce(
      (acc, item) => {
        acc[item] = (acc[item] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([item]) => item);
  }

  private generateMockCollectiveInsights(): CollectiveInsight[] {
    // Generate realistic collective insights for demonstration
    const insights: CollectiveInsight[] = [
      {
        id: `insight_${Date.now()}_1`,
        type: "elemental_shift",
        title: "Rising Water Element Integration",
        description:
          "Collective movement toward deeper emotional intelligence and intuitive wisdom practices.",
        elementalResonance: {
          fire: 0.2,
          water: 0.6,
          earth: 0.1,
          air: 0.05,
          aether: 0.05,
        },
        archetypalSignature: "Healer",
        confidenceLevel: 0.85,
        relevantUsers: 247,
        timeframe: "Last 30 days",
        guidance:
          "This is an optimal time for emotional healing work and developing intuitive capacities.",
        createdAt: new Date().toISOString(),
      },
      {
        id: `insight_${Date.now()}_2`,
        type: "archetypal_pattern",
        title: "Teacher-Student Dynamic Evolution",
        description:
          "Emerging pattern of wisdom-sharing and collaborative learning in spiritual communities.",
        elementalResonance: {
          fire: 0.3,
          water: 0.2,
          earth: 0.1,
          air: 0.35,
          aether: 0.05,
        },
        archetypalSignature: "Teacher",
        confidenceLevel: 0.78,
        relevantUsers: 189,
        timeframe: "Last 21 days",
        guidance:
          "Consider both teaching and learning roles in your current spiritual practice.",
        createdAt: new Date().toISOString(),
      },
    ];

    return insights;
  }

  private initializeCollectiveInsights() {
    // Initialize with some base collective insights
    this.collectiveInsights = [
      {
        id: "base_insight_1",
        type: "consciousness_trend",
        title: "Global Awakening to Elemental Balance",
        description:
          "Increased awareness of the need for elemental balance in personal development.",
        elementalResonance: {
          fire: 0.2,
          water: 0.2,
          earth: 0.2,
          air: 0.2,
          aether: 0.2,
        },
        archetypalSignature: "Sage",
        confidenceLevel: 0.92,
        relevantUsers: 1247,
        timeframe: "Last 90 days",
        guidance:
          "Focus on integrating all elements rather than specializing in one.",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      },
    ];
  }

  private initializeArchetypalProcesses() {
    this.archetypalProcesses = [
      {
        id: "fire_warrior_integration",
        name: "Fire Warrior Integration",
        element: "fire",
        archetype: "Warrior",
        description:
          "Process for integrating the Fire Warrior archetype with balanced action and wise restraint.",
        phases: [
          "Recognition",
          "Channeling",
          "Refinement",
          "Integration",
          "Service",
        ],
        practices: [
          "Dynamic breathwork",
          "Courage cultivation",
          "Action with wisdom",
          "Leadership training",
        ],
        indicators: [
          "Increased confidence",
          "Balanced assertiveness",
          "Natural leadership emergence",
        ],
        integrationGuidance:
          "Balance your fiery nature with earth grounding and water wisdom.",
        isActive: true,
      },
      {
        id: "water_healer_emergence",
        name: "Water Healer Emergence",
        element: "water",
        archetype: "Healer",
        description:
          "Natural emergence of healing capacities through deep emotional intelligence.",
        phases: [
          "Sensitivity",
          "Empathy",
          "Boundaries",
          "Channeling",
          "Service",
        ],
        practices: [
          "Emotional release work",
          "Empathic boundaries",
          "Energy healing",
          "Compassionate presence",
        ],
        indicators: [
          "Increased empathy",
          "Healing presence",
          "Natural counseling abilities",
        ],
        integrationGuidance:
          "Develop strong boundaries while maintaining open heart connection.",
        isActive: true,
      },
    ];
  }
}

export const mainOracleIntegration = new MainOracleIntegrationService();
