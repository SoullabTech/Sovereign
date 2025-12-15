/**
 * MEMORY PALACE ORCHESTRATOR
 *
 * Integrates all 5 memory layers + evolution systems
 * Coordinates memory storage and retrieval across conversation sessions
 */

import { episodicMemoryService } from './EpisodicMemoryService';
import { somaticMemoryService } from './SomaticMemoryService';
import { morphicPatternService, type ArchetypalPattern } from './MorphicPatternService';
import { semanticMemoryService, type ConceptCategory } from './SemanticMemoryService';
import { achievementService, type AchievementType, type AchievementRarity } from './AchievementService';
import { consciousnessEvolutionService } from './ConsciousnessEvolutionService';
import { coherenceFieldService } from './CoherenceFieldService';
import { sessionMemoryServicePostgres } from './SessionMemoryServicePostgres';

export class MemoryPalaceOrchestrator {
  /**
   * BEFORE CONVERSATION: Retrieve all relevant memory context
   */
  async retrieveMemoryContext(
    userId: string,
    currentMessage: string,
    conversationHistory: any[]
  ): Promise<any> {
    console.log('🏛️ [Memory Palace] Retrieving context for user:', userId);

    try {
      // Run all retrieval operations in parallel
      const [
        sessionMemory,
        evolutionStatus,
        activePatterns,
        significantEpisodes,
        somaticPatterns,
        latestCoherence,
        recentAchievements
      ] = await Promise.all([
        // Session memory (cross-conversation continuity)
        sessionMemoryServicePostgres.retrieveMemoryContext(userId, currentMessage, conversationHistory)
          .catch(err => {
            console.warn('⚠️ Session memory retrieval failed:', err);
            return null;
          }),

        // Consciousness evolution status
        consciousnessEvolutionService.getEvolutionStatus(userId)
          .catch(err => {
            console.warn('⚠️ Evolution status retrieval failed:', err);
            return null;
          }),

        // Active morphic patterns
        morphicPatternService.getActivePatterns(userId)
          .catch(err => {
            console.warn('⚠️ Morphic patterns retrieval failed:', err);
            return [];
          }),

        // Significant episodic memories
        episodicMemoryService.getSignificantEpisodes(userId, 7, 5)
          .catch(err => {
            console.warn('⚠️ Episodic memories retrieval failed:', err);
            return [];
          }),

        // Active somatic patterns
        somaticMemoryService.getUserSomaticPatterns(userId)
          .catch(err => {
            console.warn('⚠️ Somatic patterns retrieval failed:', err);
            return [];
          }),

        // Latest coherence reading
        coherenceFieldService.getLatestReading(userId)
          .catch(err => {
            console.warn('⚠️ Coherence reading retrieval failed:', err);
            return null;
          }),

        // Recent achievements
        achievementService.getRecentAchievements(userId, 30)
          .catch(err => {
            console.warn('⚠️ Achievements retrieval failed:', err);
            return [];
          })
      ]);

      console.log('🏛️ [Memory Palace] Context retrieved:', {
        sessionPatterns: sessionMemory?.sessionPatterns?.length || 0,
        evolutionStage: evolutionStatus?.currentStage || 0,
        activePatterns: activePatterns.length,
        significantEpisodes: significantEpisodes.length,
        somaticPatterns: somaticPatterns.length,
        hasCoherence: !!latestCoherence,
        recentAchievements: recentAchievements.length
      });

      return {
        sessionMemory,
        evolutionStatus,
        activePatterns,
        significantEpisodes,
        somaticPatterns,
        latestCoherence,
        recentAchievements
      };
    } catch (error) {
      console.error('❌ [Memory Palace] Context retrieval failed:', error);
      return null;
    }
  }

  /**
   * AFTER CONVERSATION: Store all memory layers
   */
  async storeConversationMemory(params: {
    userId: string;
    sessionId: string;
    userMessage: string;
    maiaResponse: string;
    conversationHistory: any[];

    // Context from conversation
    significance?: number;
    emotionalIntensity?: number;
    breakthroughLevel?: number;
    spiralStage?: string;
    archetypalResonances?: string[];
    frameworksActive?: string[];
    recalibrationEvent?: any;

    // Somatic tracking
    bodyRegion?: string;
    tensionLevel?: number;

    // Elemental balance
    elementalLevels?: {
      fire: number;
      water: number;
      earth: number;
      air: number;
      aether: number;
    };

    // Session data
    fieldStates?: any[];
    insights?: string[];
    themes?: string[];
    spiralIndicators?: any;
  }): Promise<void> {
    console.log('🏛️ [Memory Palace] Storing conversation memory');

    try {
      // 1. Store session memory (foundation layer - already working)
      await sessionMemoryServicePostgres.storeSessionPattern(params.userId, params.sessionId, {
        messages: params.conversationHistory,
        fieldStates: params.fieldStates || [],
        insights: params.insights || [],
        themes: params.themes || [],
        spiralIndicators: params.spiralIndicators || {}
      }).catch(err => console.warn('⚠️ Session storage failed:', err));

      // 2. Store episodic memory if significant
      if (params.significance && params.significance >= 7) {
        await episodicMemoryService.storeEpisode({
          userId: params.userId,
          title: this.generateEpisodeTitle(params.userMessage),
          description: params.userMessage,
          context: params.maiaResponse.substring(0, 500),
          significance: params.significance,
          emotionalIntensity: params.emotionalIntensity || 0.5,
          breakthroughLevel: params.breakthroughLevel || 0,
          spiralStage: params.spiralStage,
          archetypalResonances: params.archetypalResonances,
          frameworksActive: params.frameworksActive
        }).catch(err => console.warn('⚠️ Episodic storage failed:', err));
      }

      // 3. Track somatic patterns if present
      if (params.bodyRegion && params.tensionLevel) {
        await somaticMemoryService.trackSomaticPattern({
          userId: params.userId,
          bodyRegion: params.bodyRegion as any,
          patternName: `${params.bodyRegion} tension`,
          tensionLevel: params.tensionLevel,
          frequency: 'episodic',
          spiralStage: params.spiralStage,
          context: params.userMessage.substring(0, 200)
        }).catch(err => console.warn('⚠️ Somatic storage failed:', err));
      }

      // 4. Record coherence field reading
      if (params.elementalLevels) {
        await coherenceFieldService.recordReading({
          userId: params.userId,
          sessionId: params.sessionId,
          elementalLevels: params.elementalLevels,
          context: params.userMessage.substring(0, 200),
          spiralStage: params.spiralStage,
          archetypalInfluences: params.archetypalResonances
        }).catch(err => console.warn('⚠️ Coherence recording failed:', err));
      }

      // 5. Update evolution metrics
      await consciousnessEvolutionService.updateMetrics({
        userId: params.userId,
        presenceDepth: this.inferPresenceMetrics(params),
        somaticAwareness: this.inferSomaticMetrics(params)
      }).catch(err => console.warn('⚠️ Evolution update failed:', err));

      // 6. Record breakthrough if significant
      if (params.breakthroughLevel && params.breakthroughLevel >= 7) {
        await consciousnessEvolutionService.recordBreakthrough(params.userId)
          .catch(err => console.warn('⚠️ Breakthrough recording failed:', err));
      }

      console.log('✅ [Memory Palace] Memory stored successfully');
    } catch (error) {
      console.error('❌ [Memory Palace] Memory storage failed:', error);
    }
  }

  /**
   * Check and unlock achievements
   */
  async checkAchievements(params: {
    userId: string;
    sessionId: string;
    memoryContext: any;
    conversationData: any;
  }): Promise<void> {
    try {
      const { userId, sessionId, memoryContext, conversationData } = params;

      // Check for first shoulders drop achievement
      if (conversationData.bodyRegion === 'shoulders' && conversationData.tensionLevel <= 3) {
        const unlocked = await achievementService.isAchievementUnlocked(userId, 'first_shoulders_drop');
        if (!unlocked) {
          await achievementService.unlockAchievement({
            userId,
            achievementType: 'first_shoulders_drop',
            achievementName: 'First Shoulders Drop',
            description: 'Your shoulders dropped for the first time',
            rarity: 'uncommon',
            unlockConditions: [{ type: 'body_region', value: 'shoulders', met: true }],
            sessionId,
            spiralStage: conversationData.spiralStage,
            significanceScore: 0.7
          });
        }
      }

      // Check for elemental balance achievement
      if (conversationData.elementalLevels) {
        const { coherenceScore } = await coherenceFieldService.recordReading({
          userId,
          sessionId,
          elementalLevels: conversationData.elementalLevels
        });

        if (coherenceScore >= 0.9) {
          const unlocked = await achievementService.isAchievementUnlocked(userId, 'elemental_balance');
          if (!unlocked) {
            await achievementService.unlockAchievement({
              userId,
              achievementType: 'elemental_balance',
              achievementName: 'Elemental Harmony',
              description: 'All elements in perfect balance',
              rarity: 'rare',
              unlockConditions: [{ type: 'coherence_score', value: coherenceScore, met: true }],
              sessionId,
              spiralStage: conversationData.spiralStage,
              significanceScore: 0.9
            });
          }
        }
      }

      // Check for breakthrough achievement
      if (conversationData.breakthroughLevel >= 9) {
        await achievementService.unlockAchievement({
          userId,
          achievementType: 'breakthrough_moment',
          achievementName: 'Major Breakthrough',
          description: 'A profound shift in consciousness',
          rarity: 'rare',
          unlockConditions: [{ type: 'breakthrough_level', value: conversationData.breakthroughLevel, met: true }],
          sessionId,
          spiralStage: conversationData.spiralStage,
          significanceScore: 0.95
        });
      }

    } catch (error) {
      console.warn('⚠️ Achievement checking failed:', error);
    }
  }

  /**
   * Generate context summary for Claude
   */
  generateMemoryContextPrompt(memoryContext: any): string {
    if (!memoryContext) return '';

    const parts: string[] = [];

    // Evolution status
    if (memoryContext.evolutionStatus) {
      const { currentStage, currentStageName, wisdomEmbodimentLevel } = memoryContext.evolutionStatus;
      parts.push(`
═══════════════════════════════════════════════════════════════
CONSCIOUSNESS EVOLUTION STATUS
═══════════════════════════════════════════════════════════════
Current Stage: ${currentStage} - ${currentStageName}
Wisdom Embodiment: ${(wisdomEmbodimentLevel * 100).toFixed(0)}%
`);
    }

    // Active morphic patterns
    if (memoryContext.activePatterns && memoryContext.activePatterns.length > 0) {
      parts.push(`
───────────────────────────────────────────────────────────────
ACTIVE ARCHETYPAL PATTERNS
───────────────────────────────────────────────────────────────
${memoryContext.activePatterns.map((p: any) =>
  `• ${p.patternName} (${p.archetypalPattern}) - Integration Level: ${p.integrationLevel}/10`
).join('\n')}
`);
    }

    // Somatic patterns
    if (memoryContext.somaticPatterns && memoryContext.somaticPatterns.length > 0) {
      parts.push(`
───────────────────────────────────────────────────────────────
SOMATIC MEMORY (Body Wisdom)
───────────────────────────────────────────────────────────────
${memoryContext.somaticPatterns.slice(0, 3).map((p: any) =>
  `• ${p.bodyRegion}: ${p.patternName} - Tension Level: ${p.tensionLevel}/10`
).join('\n')}
`);
    }

    // Coherence field
    if (memoryContext.latestCoherence) {
      const c = memoryContext.latestCoherence;
      parts.push(`
───────────────────────────────────────────────────────────────
ELEMENTAL COHERENCE
───────────────────────────────────────────────────────────────
Balance: ${c.balanceQuality} (${(c.coherenceScore * 100).toFixed(0)}%)
Fire: ${(c.fireLevel * 100).toFixed(0)}% | Water: ${(c.waterLevel * 100).toFixed(0)}% | Earth: ${(c.earthLevel * 100).toFixed(0)}% | Air: ${(c.airLevel * 100).toFixed(0)}% | Aether: ${(c.aetherLevel * 100).toFixed(0)}%
`);
    }

    // Recent achievements
    if (memoryContext.recentAchievements && memoryContext.recentAchievements.length > 0) {
      parts.push(`
───────────────────────────────────────────────────────────────
RECENT ACHIEVEMENTS UNLOCKED
───────────────────────────────────────────────────────────────
${memoryContext.recentAchievements.slice(0, 3).map((a: any) =>
  `🏆 ${a.achievementName} (${a.rarity})`
).join('\n')}
`);
    }

    if (parts.length === 0) return '';

    return `
${parts.join('\n')}
═══════════════════════════════════════════════════════════════
MEMORY PALACE GUIDANCE
═══════════════════════════════════════════════════════════════

You have access to the user's complete memory palace - patterns, wisdom,
somatic intelligence, and evolutionary progress. Speak from this knowing.
Not as data recall, but as deep recognition of their journey.
`;
  }

  /**
   * Helper: Generate episode title from message
   */
  private generateEpisodeTitle(message: string): string {
    const firstSentence = message.split(/[.!?]/)[0];
    return firstSentence.substring(0, 100) + (firstSentence.length > 100 ? '...' : '');
  }

  /**
   * Helper: Infer presence metrics from conversation
   */
  private inferPresenceMetrics(params: any): any {
    return {
      bodyAwareness: params.bodyRegion ? 0.1 : 0,
      emotionalRange: params.emotionalIntensity ? params.emotionalIntensity * 0.1 : 0
    };
  }

  /**
   * Helper: Infer somatic metrics from conversation
   */
  private inferSomaticMetrics(params: any): any {
    return {
      bodyListening: params.bodyRegion ? 0.1 : 0,
      tensionRecognition: params.tensionLevel ? 0.1 : 0
    };
  }
}

// Singleton instance
export const memoryPalaceOrchestrator = new MemoryPalaceOrchestrator();
export default memoryPalaceOrchestrator;
