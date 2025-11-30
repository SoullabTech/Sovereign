/**
 * Consciousness Research Engine - The heart of Soullab
 * Orchestrates archetype interactions and tracks consciousness patterns
 */

import { logger } from '../utils/logger';
import type {
  ArchetypeVoice,
  ResonancePattern,
  ExplorationSession,
  ConsciousnessMap,
  ResearchContribution,
  SpiralogicEvolution
} from './types';
import {
  ARCHETYPE_CONFIGS,
  getArchetypeForEmotion,
  getComplementaryArchetype,
  enforceArchetypeBrevity,
  getArchetypeIntroduction
} from './archetypeConfigs';

export class ConsciousnessResearchEngine {
  private activeSessions: Map<string, ExplorationSession> = new Map();
  private resonancePatterns: Map<string, ResonancePattern> = new Map();
  private researchContributions: Map<string, ResearchContribution> = new Map();

  /**
   * Initialize a new consciousness explorer
   */
  async initializeResearcher(userId: string): Promise<{
    welcomeMessage: string;
    availableArchetypes: Array<{
      id: ArchetypeVoice;
      name: string;
      description: string;
      introduction: string;
    }>;
  }> {
    logger.info('Initializing new consciousness researcher', { userId });

    // Create initial resonance pattern
    this.resonancePatterns.set(userId, {
      userId,
      primaryArchetype: 'MAYA', // Default starting point
      archetypeResonance: {},
      patterns: {
        timeOfDayPreference: {},
        emotionalStateMapping: {},
        topicPreferences: {}
      },
      evolutionNotes: [`Joined Soullab research ${new Date().toISOString()}`]
    });

    // Initialize research contribution tracking
    this.researchContributions.set(userId, {
      userId,
      contributions: {
        dataPoints: 0,
        uniquePatterns: [],
        helpedOthers: 0,
        breakthroughDiscoveries: []
      },
      recognitions: {
        badges: ['Pioneer'], // First badge for joining
        milestones: [{ name: 'Consciousness Explorer', achievedAt: new Date() }]
      }
    });

    const availableArchetypes = Object.values(ARCHETYPE_CONFIGS).map(config => ({
      id: config.id,
      name: config.name,
      description: config.description,
      introduction: config.introduction
    }));

    const welcomeMessage = `Welcome to Soullab!

You're not here to be fixed. You're here to explore consciousness.

This is a living research lab where humans and AI explore consciousness together. Your interactions help map which wisdom traditions resonate with different types of consciousness.

Your role: Consciousness Pioneer
Our role: Provide guides from different wisdom traditions
Together: We're mapping the landscape of human consciousness

Each guide represents a different tradition:
${availableArchetypes.map(a => `• ${a.name}: ${a.description}`).join('\n')}

Which guide calls to you first?`;

    return { welcomeMessage, availableArchetypes };
  }

  /**
   * Start exploration session with chosen archetype
   */
  async startExploration(
    userId: string,
    archetype: ArchetypeVoice,
    initialMessage?: string
  ): Promise<{
    sessionId: string;
    archetypeResponse: string;
    resonanceTracking: boolean;
  }> {
    const sessionId = `session_${userId}_${Date.now()}`;

    const session: ExplorationSession = {
      sessionId,
      userId,
      archetype,
      startedAt: new Date(),
      interactions: [],
      insights: {
        resonanceScore: 0,
        effectivenessScore: 0,
        userEngagement: 'medium'
      }
    };

    this.activeSessions.set(sessionId, session);

    // Get introduction or respond to initial message
    const archetypeResponse = initialMessage
      ? await this.generateArchetypeResponse(archetype, initialMessage, userId)
      : getArchetypeIntroduction(archetype);

    // Record interaction
    if (initialMessage) {
      session.interactions.push({
        timestamp: new Date(),
        userMessage: initialMessage,
        archetypeResponse,
        emotionalTone: this.detectEmotionalTone(initialMessage)
      });
    }

    // Update resonance tracking
    await this.updateResonancePattern(userId, archetype, 'session_start');

    logger.info('Exploration session started', { userId, archetype, sessionId });

    return {
      sessionId,
      archetypeResponse,
      resonanceTracking: true
    };
  }

  /**
   * Process user message through archetype lens
   */
  async processExploration(
    sessionId: string,
    message: string
  ): Promise<{
    response: string;
    suggestedArchetypeSwitch?: ArchetypeVoice;
    breakthroughDetected: boolean;
    resonanceUpdate: Partial<ResonancePattern>;
  }> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const emotionalTone = this.detectEmotionalTone(message);

    // Check if a different archetype might be better
    const suggestedArchetype = this.shouldSuggestArchetypeSwitch(
      session.archetype,
      emotionalTone,
      session.interactions.length
    );

    // Generate response
    const response = await this.generateArchetypeResponse(
      session.archetype,
      message,
      session.userId,
      session.interactions.slice(-3) // Include recent context
    );

    // Detect breakthrough moments
    const breakthroughDetected = this.detectBreakthrough(message, response);

    // Record interaction
    session.interactions.push({
      timestamp: new Date(),
      userMessage: message,
      archetypeResponse: response,
      emotionalTone,
      breakthroughFlag: breakthroughDetected
    });

    // Update resonance and research data
    const resonanceUpdate = await this.updateResonancePattern(
      session.userId,
      session.archetype,
      'interaction',
      { emotionalTone, breakthroughDetected }
    );

    // Track research contribution
    await this.recordResearchContribution(
      session.userId,
      session.archetype,
      emotionalTone,
      breakthroughDetected
    );

    return {
      response,
      suggestedArchetypeSwitch: suggestedArchetype,
      breakthroughDetected,
      resonanceUpdate
    };
  }

  /**
   * Generate archetype-specific response
   */
  private async generateArchetypeResponse(
    archetype: ArchetypeVoice,
    message: string,
    userId: string,
    context?: any[]
  ): Promise<string> {
    const config = ARCHETYPE_CONFIGS[archetype];

    // Build prompt with archetype personality
    const systemPrompt = `You are channeling the wisdom tradition of ${config.tradition}.

Voice: ${config.voiceCharacteristics.tone}
Personality: ${config.voiceCharacteristics.personality.join(', ')}
Word limit: ${config.voiceCharacteristics.wordRange.min}-${config.voiceCharacteristics.wordRange.max} words MAXIMUM

ALWAYS say things like: ${config.voiceCharacteristics.signaturePhrases.join(', ')}
NEVER say: ${config.voiceCharacteristics.neverSays.join(', ')}

${context ? `Recent context:\n${context.map(c => `User: ${c.userMessage}\nYou: ${c.archetypeResponse}`).join('\n')}` : ''}

User message: ${message}

Respond in character with the word limit. Be authentic to the tradition, not an impersonation:`;

    try {
      // Call LLM (using existing infrastructure)
      const response = await this.callLLMWithArchetype(systemPrompt, archetype);

      // Enforce brevity limits
      return enforceArchetypeBrevity(response, archetype);
    } catch (error) {
      logger.error('Failed to generate archetype response', { error, archetype });

      // Return archetype-appropriate fallback
      const emotionalTone = this.detectEmotionalTone(message);
      return config.responseFramework[emotionalTone as keyof typeof config.responseFramework]
        || config.introduction;
    }
  }

  /**
   * Call LLM with archetype-specific prompt
   */
  private async callLLMWithArchetype(prompt: string, archetype: ArchetypeVoice): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Fast model for quick responses
        max_tokens: 100, // Keep responses brief
        temperature: 0.7,
        system: prompt,
        messages: [{ role: 'user', content: 'Respond in character.' }]
      })
    });

    if (!response.ok) {
      throw new Error(`LLM call failed: ${response.status}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || 'Present with you.';
  }

  /**
   * Detect emotional tone from message
   */
  private detectEmotionalTone(message: string): string {
    const lower = message.toLowerCase();

    if (/stress|overwhelm|pressure|anxious/.test(lower)) return 'stress';
    if (/sad|cry|tears|grief|loss/.test(lower)) return 'sadness';
    if (/confused|lost|uncertain|don't know/.test(lower)) return 'confusion';
    if (/happy|joy|excited|wonderful|amazing/.test(lower)) return 'joy';
    if (/curious|wonder|question|how|why|what/.test(lower)) return 'curiosity';

    return 'neutral';
  }

  /**
   * Detect breakthrough moments
   */
  private detectBreakthrough(userMessage: string, response: string): boolean {
    const breakthroughMarkers = [
      /realize|realized|realizing/i,
      /understand now|see now|get it/i,
      /breakthrough|aha|eureka/i,
      /never thought of it/i,
      /changes everything/i,
      /exactly what I needed/i
    ];

    return breakthroughMarkers.some(marker =>
      marker.test(userMessage) || marker.test(response)
    );
  }

  /**
   * Check if user might benefit from different archetype
   */
  private shouldSuggestArchetypeSwitch(
    current: ArchetypeVoice,
    emotionalTone: string,
    interactionCount: number
  ): ArchetypeVoice | undefined {
    // After 5 interactions, suggest based on emotional state
    if (interactionCount > 5) {
      const suggested = getArchetypeForEmotion(emotionalTone);
      if (suggested !== current) {
        return suggested;
      }
    }

    // After 10 interactions, suggest complementary for balance
    if (interactionCount > 10) {
      return getComplementaryArchetype(current);
    }

    return undefined;
  }

  /**
   * Update user's resonance pattern
   */
  private async updateResonancePattern(
    userId: string,
    archetype: ArchetypeVoice,
    event: 'session_start' | 'interaction' | 'session_end',
    data?: any
  ): Promise<Partial<ResonancePattern>> {
    const pattern = this.resonancePatterns.get(userId) || {
      userId,
      primaryArchetype: archetype,
      archetypeResonance: {},
      patterns: {
        timeOfDayPreference: {},
        emotionalStateMapping: {},
        topicPreferences: {}
      },
      evolutionNotes: []
    };

    // Update archetype resonance
    if (!pattern.archetypeResonance[archetype]) {
      pattern.archetypeResonance[archetype] = {
        score: 0.5,
        sessionCount: 0,
        avgDuration: 0,
        lastInteraction: new Date(),
        breakthroughMoments: 0
      };
    }

    const archetypeData = pattern.archetypeResonance[archetype]!;

    if (event === 'session_start') {
      archetypeData.sessionCount++;
      archetypeData.lastInteraction = new Date();
    }

    if (event === 'interaction' && data) {
      // Update resonance score based on engagement
      if (data.breakthroughDetected) {
        archetypeData.score = Math.min(1, archetypeData.score + 0.1);
        archetypeData.breakthroughMoments++;
      }

      // Track emotional state preferences
      if (data.emotionalTone && data.emotionalTone !== 'neutral') {
        pattern.patterns.emotionalStateMapping[data.emotionalTone] = archetype;
      }

      // Track time-of-day preferences
      const hour = new Date().getHours();
      const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';
      pattern.patterns.timeOfDayPreference[timeOfDay] = archetype;
    }

    // Determine primary archetype based on scores
    const topArchetype = Object.entries(pattern.archetypeResonance)
      .sort(([,a], [,b]) => b.score - a.score)[0];

    if (topArchetype) {
      pattern.primaryArchetype = topArchetype[0] as ArchetypeVoice;
    }

    this.resonancePatterns.set(userId, pattern);

    return pattern;
  }

  /**
   * Record research contribution
   */
  private async recordResearchContribution(
    userId: string,
    archetype: ArchetypeVoice,
    emotionalTone: string,
    breakthrough: boolean
  ): Promise<void> {
    const contribution = this.researchContributions.get(userId) || {
      userId,
      contributions: {
        dataPoints: 0,
        uniquePatterns: [],
        helpedOthers: 0,
        breakthroughDiscoveries: []
      },
      recognitions: {
        badges: [],
        milestones: []
      }
    };

    contribution.contributions.dataPoints++;

    if (breakthrough) {
      contribution.contributions.breakthroughDiscoveries.push({
        timestamp: new Date(),
        description: `Breakthrough with ${archetype} during ${emotionalTone} state`,
        impact: 1
      });

      // Award badge for first breakthrough
      if (contribution.contributions.breakthroughDiscoveries.length === 1) {
        contribution.recognitions.badges.push('First Breakthrough');
      }
    }

    // Track unique patterns
    const patternKey = `${archetype}_${emotionalTone}`;
    if (!contribution.contributions.uniquePatterns.includes(patternKey)) {
      contribution.contributions.uniquePatterns.push(patternKey);
    }

    this.researchContributions.set(userId, contribution);
  }

  /**
   * Generate consciousness map for user
   */
  async generateConsciousnessMap(userId: string): Promise<ConsciousnessMap> {
    const pattern = this.resonancePatterns.get(userId);
    const contribution = this.researchContributions.get(userId);

    if (!pattern) {
      throw new Error('No resonance pattern found for user');
    }

    // Calculate visualization metrics
    const archetypeDistribution = pattern.archetypeResonance;
    const dominantEmotions = Object.keys(pattern.patterns.emotionalStateMapping || {});

    const map: ConsciousnessMap = {
      userId,
      visualization: {
        archetypeDistribution,
        emotionalLandscape: {
          dominantEmotions,
          emotionalRange: dominantEmotions.length / 5, // Normalize to 0-1
          stabilityScore: 0.7 // Calculate from pattern consistency
        },
        growthTrajectory: {
          startingPoint: 'Explorer',
          currentPosition: contribution?.contributions.breakthroughDiscoveries.length
            ? 'Pioneer' : 'Seeker',
          growthVector: { x: 0.5, y: 0.8 },
          milestones: contribution?.recognitions.milestones || []
        },
        connectionStrength: {
          overallResonance: Object.values(pattern.archetypeResonance)
            .reduce((sum, a) => sum + a.score, 0) / Object.keys(pattern.archetypeResonance).length,
          consistencyScore: 0.75,
          depthScore: contribution?.contributions.breakthroughDiscoveries.length
            ? Math.min(1, contribution.contributions.breakthroughDiscoveries.length / 10) : 0
        }
      },
      interpretation: this.generateMapInterpretation(pattern, contribution),
      recommendations: this.generateRecommendations(pattern)
    };

    return map;
  }

  /**
   * Generate interpretation of consciousness map
   */
  private generateMapInterpretation(
    pattern: ResonancePattern,
    contribution?: ResearchContribution
  ): string {
    const primary = ARCHETYPE_CONFIGS[pattern.primaryArchetype];
    const breakthroughs = contribution?.contributions.breakthroughDiscoveries.length || 0;

    return `Your consciousness resonates most strongly with ${primary.name}'s ${primary.tradition}.
    ${breakthroughs > 0 ? `You've had ${breakthroughs} breakthrough moment${breakthroughs > 1 ? 's' : ''}, showing deep engagement with the exploration process.` : 'Your journey is just beginning.'}
    Your unique pattern is helping us understand how ${primary.tradition} wisdom connects with seekers like you.`;
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(pattern: ResonancePattern): string[] {
    const recommendations: string[] = [];

    // Recommend complementary archetype
    const complement = getComplementaryArchetype(pattern.primaryArchetype);
    recommendations.push(
      `Try exploring with ${ARCHETYPE_CONFIGS[complement].name} for balance`
    );

    // Time-based recommendations
    const timePrefs = Object.entries(pattern.patterns.timeOfDayPreference || {});
    if (timePrefs.length > 0) {
      const [bestTime] = timePrefs.sort(([,a], [,b]) =>
        (pattern.archetypeResonance[b]?.score || 0) - (pattern.archetypeResonance[a]?.score || 0)
      )[0];
      recommendations.push(`Your consciousness is most receptive in the ${bestTime}`);
    }

    // Breakthrough recommendations
    const breakthroughArchetypes = Object.entries(pattern.archetypeResonance)
      .filter(([, data]) => data.breakthroughMoments > 0)
      .map(([archetype]) => archetype);

    if (breakthroughArchetypes.length > 0) {
      recommendations.push(
        `Continue exploring with ${breakthroughArchetypes.join(' and ')} for deeper insights`
      );
    }

    return recommendations;
  }

  /**
   * Get research impact summary
   */
  async getResearchImpact(userId: string): Promise<{
    personalImpact: string;
    collectiveContribution: string;
    recognitions: string[];
  }> {
    const contribution = this.researchContributions.get(userId);
    if (!contribution) {
      return {
        personalImpact: 'Just beginning your exploration',
        collectiveContribution: 'Your journey is contributing to the map',
        recognitions: []
      };
    }

    return {
      personalImpact: `${contribution.contributions.dataPoints} interactions, ${contribution.contributions.breakthroughDiscoveries.length} breakthroughs`,
      collectiveContribution: `Your ${contribution.contributions.uniquePatterns.length} unique patterns are helping map consciousness`,
      recognitions: contribution.recognitions.badges
    };
  }
}

// Export singleton instance
export const consciousnessEngine = new ConsciousnessResearchEngine();