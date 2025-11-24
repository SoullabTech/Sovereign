// Personal Oracle Agent - Central orchestrator for all user interactions
// This is the main interface between users and the Spiralogic Oracle System

import { logger } from "../../utils/logger";
import {
  successResponse,
  errorResponse,
  asyncErrorHandler,
  generateRequestId,
} from "../../utils/sharedUtilities";
import { AgentRegistry } from "../../core/factories/AgentRegistry";
import { astrologyService } from "../../services/astrologyService";
import { journalingService } from "../../services/journalingService";
import { assessmentService } from "../../services/assessmentService";
import {
  getRelevantMemories,
  storeMemoryItem,
} from "../../services/memoryService";
import { logOracleInsight } from "../../utils/oracleLogger";
import type { StandardAPIResponse } from "../../utils/sharedUtilities";

export interface PersonalOracleQuery {
  input: string;
  userId: string;
  sessionId?: string;
  targetElement?: "fire" | "water" | "earth" | "air" | "aether";
  context?: {
    previousInteractions?: number;
    userPreferences?: Record<string, any>;
    currentPhase?: string;
  };
}

export interface PersonalOracleResponse {
  message: string;
  element: string;
  archetype: string;
  confidence: number;
  metadata: {
    sessionId?: string;
    symbols?: string[];
    phase?: string;
    recommendations?: string[];
    nextSteps?: string[];
  };
}

export interface PersonalOracleSettings {
  name?: string;
  voice?: string;
  persona?: "warm" | "formal" | "playful";
  preferredElements?: string[];
  interactionStyle?: "brief" | "detailed" | "comprehensive";
}

/**
 * Personal Oracle Agent - The heart of user interaction
 * Orchestrates all elemental agents and provides personalized guidance
 */
export class PersonalOracleAgent {
  private agentRegistry: AgentRegistry;

  // User settings cache
  private userSettings: Map<string, PersonalOracleSettings> = new Map();

  constructor() {
    this.agentRegistry = new AgentRegistry();

    logger.info("Personal Oracle Agent initialized with AgentRegistry");
  }

  /**
   * Main consultation method - processes user queries through elemental routing
   */
  public async consult(
    query: PersonalOracleQuery,
  ): Promise<StandardAPIResponse<PersonalOracleResponse>> {
    const requestId = generateRequestId();

    return asyncErrorHandler(async () => {
      logger.info("Personal Oracle consultation started", {
        userId: query.userId,
        requestId,
        hasTargetElement: !!query.targetElement,
      });

      // Get user context and preferences
      const userSettings = await this.getUserSettings(query.userId);
      const memories = await getRelevantMemories(query.userId, query.input, 5);

      // Determine which elemental agent to use
      const targetElement =
        query.targetElement ||
        (await this.detectOptimalElement(query.input, memories, userSettings));

      // Get response from the appropriate elemental agent
      const elementalResponse = await this.getElementalResponse(
        targetElement,
        query,
        memories,
      );

      // Enhance response with personalization
      const personalizedResponse = await this.personalizeResponse(
        elementalResponse,
        userSettings,
        query.userId,
      );

      // Store interaction in memory
      await this.storeInteraction(query, personalizedResponse, requestId);

      logger.info("Personal Oracle consultation completed", {
        userId: query.userId,
        requestId,
        element: targetElement,
        confidence: personalizedResponse.confidence,
      });

      return successResponse(personalizedResponse, requestId);
    })();
  }

  /**
   * Update user settings and preferences
   */
  public async updateSettings(
    userId: string,
    settings: PersonalOracleSettings,
  ): Promise<StandardAPIResponse<PersonalOracleSettings>> {
    const requestId = generateRequestId();

    return asyncErrorHandler(async () => {
      logger.info("Updating Personal Oracle settings", { userId, requestId });

      // Store settings (this would integrate with your database)
      this.userSettings.set(userId, {
        ...this.userSettings.get(userId),
        ...settings,
      });

      // TODO: Persist to database
      // await this.persistUserSettings(userId, settings);

      logger.info("Personal Oracle settings updated", { userId, requestId });
      return successResponse(settings, requestId);
    })();
  }

  /**
   * Get current user settings
   */
  public async getSettings(
    userId: string,
  ): Promise<StandardAPIResponse<PersonalOracleSettings>> {
    const requestId = generateRequestId();

    const settings = await this.getUserSettings(userId);
    return successResponse(settings, requestId);
  }

  /**
   * Get user's interaction history summary
   */
  public async getInteractionSummary(
    userId: string,
    days: number = 30,
  ): Promise<StandardAPIResponse<any>> {
    const requestId = generateRequestId();

    return asyncErrorHandler(async () => {
      const memories = await getRelevantMemories(userId, "", 50); // Get recent memories

      // Analyze patterns
      const elementalPattern = this.analyzeElementalPattern(memories);
      const recentThemes = this.extractRecentThemes(memories);
      const progressIndicators = this.identifyProgressIndicators(memories);

      const summary = {
        totalInteractions: memories.length,
        elementalDistribution: elementalPattern,
        recentThemes,
        progressIndicators,
        recommendedNextSteps: await this.generateRecommendations(
          userId,
          memories,
        ),
      };

      return successResponse(summary, requestId);
    })();
  }

  // Private helper methods

  private async getUserSettings(
    userId: string,
  ): Promise<PersonalOracleSettings> {
    // Check cache first
    if (this.userSettings.has(userId)) {
      return this.userSettings.get(userId)!;
    }

    // Default settings for new users
    const defaultSettings: PersonalOracleSettings = {
      name: "Oracle",
      voice: "wise_guide",
      persona: "warm",
      preferredElements: [],
      interactionStyle: "detailed",
    };

    this.userSettings.set(userId, defaultSettings);
    return defaultSettings;
  }

  private async detectOptimalElement(
    input: string,
    memories: any[],
    settings: PersonalOracleSettings,
  ): Promise<"fire" | "water" | "earth" | "air" | "aether"> {
    const lower = input.toLowerCase();

    // Keyword-based element detection with user preference weighting
    const scores = {
      fire: this.calculateElementScore(
        lower,
        ["passion", "energy", "action", "motivation", "drive", "power"],
        settings,
        "fire",
      ),
      water: this.calculateElementScore(
        lower,
        ["emotion", "feeling", "flow", "intuition", "healing", "cleansing"],
        settings,
        "water",
      ),
      earth: this.calculateElementScore(
        lower,
        ["ground", "practical", "stable", "foundation", "security", "growth"],
        settings,
        "earth",
      ),
      air: this.calculateElementScore(
        lower,
        ["think", "idea", "communicate", "clarity", "inspiration", "freedom"],
        settings,
        "air",
      ),
      aether: 0.3, // Base score for universal wisdom
    };

    // Factor in recent elemental usage to encourage balance
    const recentPattern = this.analyzeElementalPattern(memories.slice(0, 10));
    for (const element in scores) {
      if (recentPattern[element] > 0.6) {
        scores[element] *= 0.7; // Slight penalty for overused elements
      }
    }

    const bestElement = Object.keys(scores).reduce((a, b) =>
      scores[a] > scores[b] ? a : b,
    ) as any;
    return bestElement;
  }

  private calculateElementScore(
    input: string,
    keywords: string[],
    settings: PersonalOracleSettings,
    element: string,
  ): number {
    let score = keywords.reduce((sum, keyword) => {
      return sum + (input.includes(keyword) ? 1 : 0);
    }, 0);

    // Boost score if user prefers this element
    if (settings.preferredElements?.includes(element)) {
      score *= 1.3;
    }

    return score;
  }

  private async getElementalResponse(
    element: string,
    query: PersonalOracleQuery,
    memories: any[],
  ): Promise<PersonalOracleResponse> {
    // Get agent from registry
    const agent = this.agentRegistry.createAgent(element);

    // Call the elemental agent
    const response = await agent.processQuery(query.input);

    return {
      message: response.content,
      element,
      archetype: response.metadata?.archetype || "Unknown",
      confidence: response.confidence,
      metadata: {
        sessionId: query.sessionId,
        symbols: response.metadata?.symbols || [],
        phase: response.metadata?.phase,
        recommendations: response.metadata?.reflections || [],
        nextSteps: [],
      },
    };
  }

  private async personalizeResponse(
    response: PersonalOracleResponse,
    settings: PersonalOracleSettings,
    userId: string,
  ): Promise<PersonalOracleResponse> {
    // Adjust response based on user preferences
    let personalizedMessage = response.message;

    // Apply persona styling
    if (settings.persona === "formal") {
      personalizedMessage = this.makeMoreFormal(personalizedMessage);
    } else if (settings.persona === "playful") {
      personalizedMessage = this.makeMorePlayful(personalizedMessage);
    }

    // Add personal touch with user's preferred name
    if (settings.name && settings.name !== "Oracle") {
      personalizedMessage = personalizedMessage.replace(
        /Oracle/gi,
        settings.name,
      );
    }

    // Adjust length based on interaction style
    if (settings.interactionStyle === "brief") {
      personalizedMessage = this.makeBriefResponse(personalizedMessage);
    } else if (settings.interactionStyle === "comprehensive") {
      personalizedMessage = await this.expandResponse(
        personalizedMessage,
        response.element,
      );
    }

    return {
      ...response,
      message: personalizedMessage,
    };
  }

  private async storeInteraction(
    query: PersonalOracleQuery,
    response: PersonalOracleResponse,
    requestId: string,
  ): Promise<void> {
    try {
      await storeMemoryItem(query.userId, response.message, {
        query: query.input,
        element: response.element,
        archetype: response.archetype,
        sessionId: query.sessionId,
        requestId,
        symbols: response.metadata.symbols,
        phase: response.metadata.phase,
        sourceAgent: "personal-oracle-agent",
        confidence: response.confidence,
      });

      await logOracleInsight({
        anon_id: query.userId,
        archetype: response.archetype,
        element: response.element,
        insight: {
          message: response.message,
          raw_input: query.input,
          requestId,
        },
        emotion: response.confidence,
        phase: response.metadata.phase || "guidance",
        context: [],
      });
    } catch (error) {
      logger.error("Failed to store interaction", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: query.userId,
        requestId,
      });
      // Don't throw - storage failure shouldn't break the user experience
    }
  }

  // Analysis helper methods

  private analyzeElementalPattern(memories: any[]): Record<string, number> {
    const pattern = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };

    memories.forEach((memory) => {
      const element = memory.element || "aether";
      if (pattern[element] !== undefined) {
        pattern[element]++;
      }
    });

    const total = memories.length || 1;
    Object.keys(pattern).forEach((key) => {
      pattern[key] = pattern[key] / total;
    });

    return pattern;
  }

  private extractRecentThemes(memories: any[]): string[] {
    // Extract symbols and recurring themes from recent memories
    const themes = new Map<string, number>();

    memories.slice(0, 10).forEach((memory) => {
      const symbols = memory.metadata?.symbols || [];
      symbols.forEach((symbol: string) => {
        themes.set(symbol, (themes.get(symbol) || 0) + 1);
      });
    });

    return Array.from(themes.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([theme]) => theme);
  }

  private identifyProgressIndicators(memories: any[]): any[] {
    // Analyze progression patterns in user's spiritual journey
    return []; // TODO: Implement sophisticated progress analysis
  }

  private async generateRecommendations(
    userId: string,
    memories: any[],
  ): Promise<string[]> {
    // Generate personalized next steps based on user's journey
    return [
      "Continue your current spiritual practice",
      "Explore the element that has been less active recently",
      "Consider journaling your recent insights",
    ];
  }

  // Response styling helpers

  private makeMoreFormal(message: string): string {
    return message
      .replace(/\bI feel\b/gi, "I sense")
      .replace(/\byou're\b/gi, "you are")
      .replace(/\bcan't\b/gi, "cannot");
  }

  private makeMorePlayful(message: string): string {
    return message + " ✨";
  }

  private makeBriefResponse(message: string): string {
    const sentences = message.split(". ");
    return sentences.slice(0, 2).join(". ") + (sentences.length > 2 ? "." : "");
  }

  private async expandResponse(
    message: string,
    element: string,
  ): Promise<string> {
    // Add element-specific wisdom or additional context
    return (
      message +
      `\n\nAs we explore this ${element} energy together, remember that growth comes from embracing both the light and shadow aspects of your journey.`
    );
  }

  // Integration Service Methods for Step 2 API Gateway

  public async getAstrologyReading(
    query: any,
  ): Promise<StandardAPIResponse<any>> {
    return await astrologyService.getAstrologyReading(query);
  }

  public async processJournalRequest(
    query: any,
  ): Promise<StandardAPIResponse<any>> {
    return await journalingService.processJournalRequest(query);
  }

  public async processAssessment(
    query: any,
  ): Promise<StandardAPIResponse<any>> {
    return await assessmentService.processAssessment(query);
  }
}

// Export singleton instance
export const personalOracleAgent = new PersonalOracleAgent();
