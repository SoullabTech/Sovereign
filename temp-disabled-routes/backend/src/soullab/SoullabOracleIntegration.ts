/**
 * Soullab Oracle Integration
 * Bridges the consciousness research system with the existing Oracle infrastructure
 */

import { personalOracleAgent } from '../agents/PersonalOracleAgent';
import { consciousnessEngine } from './ConsciousnessResearchEngine';
import { logger } from '../utils/logger';
import type {
  ArchetypeVoice,
  ExplorationSession,
  ResonancePattern,
  ConsciousnessMap
} from './types';
import type { PersonalOracleQuery, PersonalOracleResponse } from '../agents/PersonalOracleAgent';

export class SoullabOracleIntegration {
  private activeArchetypes: Map<string, ArchetypeVoice> = new Map();
  private sessionMapping: Map<string, string> = new Map(); // userId -> sessionId

  /**
   * Process query through Soullab consciousness exploration
   * Integrates with existing PersonalOracleAgent infrastructure
   */
  async processWithArchetype(
    query: PersonalOracleQuery,
    archetype?: ArchetypeVoice
  ): Promise<PersonalOracleResponse> {
    const userId = query.userId;

    // If no archetype specified, use user's current or default to Maya
    const selectedArchetype = archetype || this.activeArchetypes.get(userId) || 'MAYA';

    // Check if user has active exploration session
    let sessionId = this.sessionMapping.get(userId);

    if (!sessionId) {
      // Start new exploration session
      const session = await consciousnessEngine.startExploration(
        userId,
        selectedArchetype,
        query.input
      );
      sessionId = session.sessionId;
      this.sessionMapping.set(userId, sessionId);
      this.activeArchetypes.set(userId, selectedArchetype);

      logger.info('Started new Soullab exploration', {
        userId,
        archetype: selectedArchetype,
        sessionId
      });

      // Return the archetype's introduction
      return {
        message: session.archetypeResponse,
        element: this.mapArchetypeToElement(selectedArchetype),
        archetype: selectedArchetype,
        confidence: 0.9,
        metadata: {
          sessionId,
          soullab: true,
          archetype: selectedArchetype,
          phase: 'exploration',
          recommendations: [],
          nextSteps: []
        }
      };
    }

    // Process through exploration engine
    const result = await consciousnessEngine.processExploration(
      sessionId,
      query.input
    );

    // Check for suggested archetype switch
    if (result.suggestedArchetypeSwitch && result.suggestedArchetypeSwitch !== selectedArchetype) {
      logger.info('Archetype switch suggested', {
        userId,
        from: selectedArchetype,
        to: result.suggestedArchetypeSwitch
      });
    }

    // Track breakthrough moments
    if (result.breakthroughDetected) {
      logger.info('Breakthrough moment detected!', {
        userId,
        archetype: selectedArchetype,
        sessionId
      });
    }

    // Build PersonalOracleResponse
    const response: PersonalOracleResponse = {
      message: result.response,
      element: this.mapArchetypeToElement(selectedArchetype),
      archetype: selectedArchetype,
      confidence: result.breakthroughDetected ? 0.95 : 0.85,
      metadata: {
        sessionId,
        soullab: true,
        archetype: selectedArchetype,
        phase: 'exploration',
        breakthroughDetected: result.breakthroughDetected,
        suggestedArchetype: result.suggestedArchetypeSwitch,
        resonanceUpdate: result.resonanceUpdate,
        recommendations: [],
        nextSteps: []
      }
    };

    return response;
  }

  /**
   * Switch to a different archetype mid-session
   */
  async switchArchetype(
    userId: string,
    newArchetype: ArchetypeVoice,
    transitionMessage?: string
  ): Promise<PersonalOracleResponse> {
    const currentArchetype = this.activeArchetypes.get(userId);

    // Start new session with new archetype
    const session = await consciousnessEngine.startExploration(
      userId,
      newArchetype,
      transitionMessage || `I'd like to explore with ${newArchetype} now`
    );

    this.sessionMapping.set(userId, session.sessionId);
    this.activeArchetypes.set(userId, newArchetype);

    logger.info('Archetype switched', {
      userId,
      from: currentArchetype,
      to: newArchetype
    });

    return {
      message: session.archetypeResponse,
      element: this.mapArchetypeToElement(newArchetype),
      archetype: newArchetype,
      confidence: 0.9,
      metadata: {
        sessionId: session.sessionId,
        soullab: true,
        archetype: newArchetype,
        phase: 'exploration',
        switchedFrom: currentArchetype,
        recommendations: [],
        nextSteps: []
      }
    };
  }

  /**
   * Get user's consciousness map
   */
  async getUserConsciousnessMap(userId: string): Promise<ConsciousnessMap> {
    return consciousnessEngine.generateConsciousnessMap(userId);
  }

  /**
   * Get user's research impact
   */
  async getUserResearchImpact(userId: string): Promise<any> {
    return consciousnessEngine.getResearchImpact(userId);
  }

  /**
   * Map archetype to elemental energy
   */
  private mapArchetypeToElement(archetype: ArchetypeVoice): string {
    const mapping: Record<ArchetypeVoice, string> = {
      MAYA: 'earth',         // Grounded zen
      ALAN_WATTS: 'air',     // Intellectual playfulness
      MARCUS: 'earth',       // Stoic grounding
      RUMI: 'fire',         // Passionate mysticism
      CARL_JUNG: 'water',   // Deep emotional patterns
      FRED_ROGERS: 'water'  // Emotional acceptance
    };

    return mapping[archetype] || 'aether';
  }

  /**
   * Get recommended archetype based on user state
   */
  async recommendArchetype(
    userId: string,
    currentState?: string
  ): Promise<ArchetypeVoice> {
    // Get user's resonance pattern
    const map = await consciousnessEngine.generateConsciousnessMap(userId);

    if (currentState) {
      // Map emotional states to archetypes
      const stateMapping: Record<string, ArchetypeVoice> = {
        stressed: 'MARCUS',
        anxious: 'MAYA',
        confused: 'ALAN_WATTS',
        sad: 'FRED_ROGERS',
        searching: 'CARL_JUNG',
        joyful: 'RUMI'
      };

      return stateMapping[currentState.toLowerCase()] || 'MAYA';
    }

    // Return user's primary resonance
    const primary = Object.entries(map.visualization.archetypeDistribution || {})
      .sort(([,a], [,b]) => (b?.score || 0) - (a?.score || 0))[0];

    return (primary?.[0] as ArchetypeVoice) || 'MAYA';
  }

  /**
   * Initialize Soullab for new user
   */
  async initializeUser(userId: string): Promise<any> {
    return consciousnessEngine.initializeResearcher(userId);
  }
}

// Export singleton instance
export const soullabIntegration = new SoullabOracleIntegration();