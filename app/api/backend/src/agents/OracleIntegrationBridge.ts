/**
 * Oracle Integration Bridge
 * Connects PersonalOracleAgent with the new Orchestration System
 * Ensures seamless transition and reduces complexity debt
 */

import { PersonalOracleAgent, PersonalOracleQuery, PersonalOracleResponse } from './PersonalOracleAgent';
import { OracleOrchestrator, createOracleOrchestrator } from '../orchestration/OracleOrchestrator';
import { ElementalArchetype } from '../../../web/lib/types/elemental';
import { logger } from '../utils/logger';

/**
 * Integration bridge that connects the existing PersonalOracleAgent
 * with the new unified orchestration system
 */
export class OracleIntegrationBridge {
  private personalAgent: PersonalOracleAgent;
  private orchestrators: Map<string, OracleOrchestrator> = new Map();

  constructor() {
    this.personalAgent = new PersonalOracleAgent();
  }

  /**
   * Enhanced consultation that routes through orchestration system
   * Maintains backward compatibility while using new architecture
   */
  public async consultWithOrchestration(
    query: PersonalOracleQuery
  ): Promise<PersonalOracleResponse> {
    try {
      // Get or create user-specific orchestrator
      const orchestrator = this.getOrCreateOrchestrator(query.userId);

      // Convert PersonalOracleQuery to orchestrator format
      const orchestratorInput = query.input;

      // Process through orchestration system for subsystem coordination
      const orchestratorResponse = await orchestrator.handleInput(
        query.userId,
        orchestratorInput,
        query.sessionId
      );

      // Get elemental response from PersonalOracleAgent
      // This maintains existing file memory and user settings functionality
      const agentResponse = await this.personalAgent.consult(query);

      if (!agentResponse.success || !agentResponse.data) {
        throw new Error('Personal agent consultation failed');
      }

      // Merge orchestrator insights with agent response
      const mergedResponse = this.mergeResponses(
        agentResponse.data,
        orchestratorResponse
      );

      logger.info('Oracle consultation completed via bridge', {
        userId: query.userId,
        leadingSystem: orchestratorResponse.metadata.leadingSystem,
        element: orchestratorResponse.metadata.element,
        confidence: orchestratorResponse.metadata.confidence
      });

      return mergedResponse;

    } catch (error) {
      logger.error('Oracle integration bridge error', { error, userId: query.userId });

      // Fallback to direct PersonalOracleAgent
      const fallbackResponse = await this.personalAgent.consult(query);
      if (!fallbackResponse.success || !fallbackResponse.data) {
        throw new Error('Fallback consultation also failed');
      }
      return fallbackResponse.data;
    }
  }

  /**
   * Get or create user-specific orchestrator with their chosen name
   */
  private getOrCreateOrchestrator(userId: string): OracleOrchestrator {
    if (!this.orchestrators.has(userId)) {
      // Get user's chosen oracle name from settings
      const oracleName = this.getUserOracleName(userId);

      const orchestrator = createOracleOrchestrator(oracleName, {
        monitoringEnabled: true,
        confidenceThreshold: 0.4,
        maxHistoryLength: 100
      });

      this.orchestrators.set(userId, orchestrator);

      logger.info('Created new orchestrator for user', {
        userId,
        oracleName
      });
    }

    return this.orchestrators.get(userId)!;
  }

  /**
   * Get user's chosen oracle name
   */
  private getUserOracleName(userId: string): string {
    // This would pull from user settings/database
    // For now, default to Maya
    return 'Maya';
  }

  /**
   * Merge orchestrator and agent responses intelligently
   */
  private mergeResponses(
    agentResponse: PersonalOracleResponse,
    orchestratorResponse: any
  ): PersonalOracleResponse {
    // Use orchestrator's response as the primary message
    // This ensures subsystem coordination is honored
    const mergedMessage = orchestratorResponse.response;

    // Preserve agent's file citations and metadata
    return {
      ...agentResponse,
      message: mergedMessage,
      element: this.mapElementArchetype(orchestratorResponse.metadata.element),
      confidence: orchestratorResponse.metadata.confidence,
      voiceCharacteristics: {
        ...agentResponse.voiceCharacteristics,
        tone: this.getElementalTone(orchestratorResponse.metadata.element),
        masteryVoiceApplied: orchestratorResponse.metadata.leadingSystem === 'storyWeaver',
        elementalVoicing: true
      },
      metadata: {
        ...agentResponse.metadata,
        sessionId: orchestratorResponse.metadata.sessionId,
        phase: orchestratorResponse.metadata.leadingSystem,
        orchestrationMetrics: {
          leadingSystem: orchestratorResponse.metadata.leadingSystem,
          processingTime: orchestratorResponse.metadata.processingTime,
          exchangeNumber: orchestratorResponse.metadata.exchangeNumber
        }
      }
    };
  }

  /**
   * Map ElementalArchetype enum to string
   */
  private mapElementArchetype(element: ElementalArchetype): string {
    const mapping = {
      [ElementalArchetype.FIRE]: 'fire',
      [ElementalArchetype.WATER]: 'water',
      [ElementalArchetype.EARTH]: 'earth',
      [ElementalArchetype.AIR]: 'air',
      [ElementalArchetype.AETHER]: 'aether'
    };
    return mapping[element] || 'water';
  }

  /**
   * Get tone based on element
   */
  private getElementalTone(element: ElementalArchetype): PersonalOracleResponse['voiceCharacteristics']['tone'] {
    const tones = {
      [ElementalArchetype.FIRE]: 'energetic' as const,
      [ElementalArchetype.WATER]: 'flowing' as const,
      [ElementalArchetype.EARTH]: 'grounded' as const,
      [ElementalArchetype.AIR]: 'clear' as const,
      [ElementalArchetype.AETHER]: 'contemplative' as const
    };
    return tones[element] || 'flowing';
  }

  /**
   * Direct pass-through to PersonalOracleAgent for settings management
   */
  public async updateSettings(userId: string, settings: any) {
    const result = await this.personalAgent.updateSettings(userId, settings);

    // Update orchestrator name if changed
    if (settings.name && this.orchestrators.has(userId)) {
      const orchestrator = this.orchestrators.get(userId)!;
      orchestrator.updateIdentity(settings.name);
    }

    return result;
  }

  /**
   * Get interaction summary with orchestration insights
   */
  public async getEnhancedSummary(userId: string, days: number = 30) {
    // Get basic summary from agent
    const agentSummary = await this.personalAgent.getInteractionSummary(userId, days);

    // Add orchestration insights if available
    if (this.orchestrators.has(userId)) {
      const orchestrator = this.orchestrators.get(userId)!;
      const activeSessions = orchestrator.getActiveSessions();

      if (agentSummary.success && agentSummary.data) {
        agentSummary.data.orchestrationInsights = {
          activeSessions: activeSessions.length,
          subsystemEngagement: this.getSubsystemStats(userId)
        };
      }
    }

    return agentSummary;
  }

  /**
   * Get subsystem engagement statistics
   */
  private getSubsystemStats(userId: string): Record<string, number> {
    // This would pull from monitoring/analytics
    // Placeholder for now
    return {
      witness: 45,
      looping: 20,
      contemplative: 15,
      elemental: 10,
      story: 5,
      urgency: 3,
      boundary: 2
    };
  }

  /**
   * Clean up orchestrators for inactive users
   */
  public cleanupInactiveOrchestrators(inactivityThreshold: number = 3600000) {
    const now = Date.now();
    const toRemove: string[] = [];

    this.orchestrators.forEach((orchestrator, userId) => {
      const sessions = orchestrator.getActiveSessions();
      if (sessions.length === 0) {
        toRemove.push(userId);
      }
    });

    toRemove.forEach(userId => {
      this.orchestrators.delete(userId);
      logger.info('Cleaned up inactive orchestrator', { userId });
    });
  }
}

// Export singleton instance
export const oracleIntegrationBridge = new OracleIntegrationBridge();