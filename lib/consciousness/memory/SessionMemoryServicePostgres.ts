/**
 * SESSION MEMORY SERVICE - PostgreSQL Edition
 *
 * Integrates cross-conversation memory patterns using PostgreSQL
 * Replaces Supabase version with direct PostgreSQL queries
 */

import { query, queryOne } from '../../database/postgres';

interface SessionPattern {
  id?: string;
  userId: string;
  sessionId: string;
  conversationThemes: string[];
  emotionalPatterns: any;
  consciousnessFieldStates: any;
  spiralDevelopmentIndicators: any;
  sessionQualityScore: number;
  consciousnessCoherence: number;
  createdAt?: Date;
}

interface ConversationInsight {
  id?: string;
  sessionId: string;
  userId: string;
  insightText: string;
  insightType: 'breakthrough' | 'pattern' | 'connection' | 'realization' | 'growth_edge' | 'integration';
  consciousnessFieldInfluence: any;
  conversationContext: string;
  spiralStageContext?: string;
  insightSignificance: number;
  createdAt?: Date;
}

interface MemoryRetrievalResult {
  sessionPatterns: any[];
  relatedInsights: any[];
  continuityOpportunities: string[];
  spiralDevelopmentContext: any;
  memoryConnections: any[];
}

interface SpiralDevelopmentContext {
  currentPrimaryStage: string;
  currentSecondaryStage?: string;
  growthPatterns: any;
  consciousnessThemes: any;
  fieldResonanceByStage: any;
}

export class SessionMemoryServicePostgres {
  private isInitialized = true; // Always true for PostgreSQL

  // ============================================================================
  // MEMORY STORAGE
  // ============================================================================

  /**
   * Store patterns from a completed conversation session
   */
  async storeSessionPattern(
    userId: string,
    sessionId: string,
    conversationData: {
      messages: any[];
      fieldStates: any[];
      insights: string[];
      themes: string[];
      spiralIndicators: any;
    }
  ): Promise<SessionPattern> {
    const sessionPattern: SessionPattern = {
      userId,
      sessionId,
      conversationThemes: conversationData.themes,
      emotionalPatterns: this.extractEmotionalPatterns(conversationData.messages),
      consciousnessFieldStates: conversationData.fieldStates,
      spiralDevelopmentIndicators: conversationData.spiralIndicators,
      sessionQualityScore: this.calculateSessionQuality(conversationData),
      consciousnessCoherence: this.calculateConsciousnessCoherence(conversationData.fieldStates)
    };

    try {
      const result = await queryOne<SessionPattern>(
        `INSERT INTO user_session_patterns (
          user_id, session_id, conversation_themes, emotional_patterns,
          consciousness_field_states, spiral_development_indicators,
          session_quality_score, consciousness_coherence
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          sessionPattern.userId,
          sessionPattern.sessionId,
          sessionPattern.conversationThemes, // text[] - pg handles array conversion
          sessionPattern.emotionalPatterns, // jsonb - pg handles JSON conversion
          sessionPattern.consciousnessFieldStates, // jsonb - pg handles JSON conversion
          sessionPattern.spiralDevelopmentIndicators, // jsonb - pg handles JSON conversion
          sessionPattern.sessionQualityScore,
          sessionPattern.consciousnessCoherence
        ]
      );

      // Store insights separately
      await this.storeSessionInsights(userId, sessionId, conversationData.insights);

      console.log('📚 Session pattern stored successfully:', result?.id);
      return result || sessionPattern;
    } catch (error) {
      console.error('Error storing session pattern:', error);
      throw error;
    }
  }

  /**
   * Store conversation insights
   */
  async storeSessionInsights(
    userId: string,
    sessionId: string,
    insights: string[]
  ): Promise<ConversationInsight[]> {
    const insightRecords: ConversationInsight[] = insights.map(insight => ({
      sessionId,
      userId,
      insightText: insight,
      insightType: this.classifyInsight(insight),
      consciousnessFieldInfluence: {},
      conversationContext: '',
      insightSignificance: this.calculateInsightSignificance(insight)
    }));

    try {
      const results = await Promise.all(
        insightRecords.map(insight =>
          queryOne<ConversationInsight>(
            `INSERT INTO conversation_insights (
              session_id, user_id, insight_text, insight_type,
              consciousness_field_influence, conversation_context,
              insight_significance
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
              insight.sessionId,
              insight.userId,
              insight.insightText,
              insight.insightType,
              JSON.stringify(insight.consciousnessFieldInfluence),
              insight.conversationContext,
              insight.insightSignificance
            ]
          )
        )
      );

      return results.filter(r => r !== null) as ConversationInsight[];
    } catch (error) {
      console.error('Error storing insights:', error);
      return insightRecords;
    }
  }

  // ============================================================================
  // MEMORY RETRIEVAL
  // ============================================================================

  /**
   * Retrieve memory context for current conversation
   */
  async retrieveMemoryContext(
    userId: string,
    currentMessage: string,
    conversationHistory: any[]
  ): Promise<MemoryRetrievalResult> {
    try {
      // Get user's spiral development context
      const spiralContext = await this.getSpiralDevelopmentContext(userId);

      // Find similar past sessions based on themes
      const similarSessions = await this.findSimilarSessions(userId, currentMessage);

      // Find related insights
      const relatedInsights = await this.findRelatedInsights(userId, currentMessage);

      // Identify continuity opportunities
      const continuityOpportunities = await this.identifyContinuityOpportunities(
        userId,
        currentMessage,
        similarSessions,
        relatedInsights
      );

      // Find pattern connections
      const memoryConnections = await this.findPatternConnections(
        userId,
        similarSessions,
        relatedInsights
      );

      return {
        sessionPatterns: similarSessions,
        relatedInsights,
        continuityOpportunities,
        spiralDevelopmentContext: spiralContext,
        memoryConnections
      };
    } catch (error) {
      console.error('Error retrieving memory context:', error);
      return this.generateSimulatedMemoryContext(userId, currentMessage);
    }
  }

  /**
   * Get user's spiral development context
   */
  async getSpiralDevelopmentContext(userId: string): Promise<SpiralDevelopmentContext | null> {
    try {
      const result = await queryOne<any>(
        `SELECT spiral_development, field_resonance_profile
         FROM user_relationship_context
         WHERE user_id = $1`,
        [userId]
      );

      return result?.spiral_development || null;
    } catch (error) {
      console.error('Error getting spiral context:', error);
      return null;
    }
  }

  /**
   * Find sessions with similar themes
   */
  async findSimilarSessions(userId: string, queryText: string, limit = 5): Promise<any[]> {
    try {
      const keyTerms = this.extractKeyTerms(queryText);

      const sessions = await query<any>(
        `SELECT * FROM user_session_patterns
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [userId, limit * 2] // Get more to filter
      );

      // Filter based on thematic similarity
      return sessions
        .filter(session => {
          const themes = Array.isArray(session.conversation_themes)
            ? session.conversation_themes
            : JSON.parse(session.conversation_themes || '[]');

          return themes.some((theme: string) =>
            queryText.toLowerCase().includes(theme.toLowerCase()) ||
            theme.toLowerCase().includes(keyTerms[0]?.toLowerCase() || '')
          );
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Error finding similar sessions:', error);
      return [];
    }
  }

  /**
   * Find related insights based on content
   */
  async findRelatedInsights(userId: string, queryText: string, limit = 10): Promise<any[]> {
    try {
      const insights = await query<any>(
        `SELECT * FROM conversation_insights
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [userId, limit * 2]
      );

      const keyTerms = this.extractKeyTerms(queryText);
      return insights
        .filter(insight =>
          keyTerms.some(term =>
            insight.insight_text.toLowerCase().includes(term.toLowerCase())
          )
        )
        .slice(0, limit);
    } catch (error) {
      console.error('Error finding related insights:', error);
      return [];
    }
  }

  // ============================================================================
  // PATTERN IDENTIFICATION
  // ============================================================================

  /**
   * Identify opportunities for conversation continuity
   */
  async identifyContinuityOpportunities(
    userId: string,
    currentMessage: string,
    similarSessions: any[],
    relatedInsights: any[]
  ): Promise<string[]> {
    const opportunities: string[] = [];

    // Check for recurring themes
    if (similarSessions.length > 1) {
      const commonThemes = this.findCommonThemes(similarSessions);
      if (commonThemes.length > 0) {
        opportunities.push(
          `I notice this connects to a recurring theme we've explored: ${commonThemes[0]}. This has come up in ${similarSessions.length} of our recent conversations.`
        );
      }
    }

    // Check for pattern evolution
    if (relatedInsights.length > 2) {
      opportunities.push(
        `I'm seeing how this question builds on insights from our previous conversations. You've been developing a deeper understanding of this area over time.`
      );
    }

    // Check for growth edge connections
    const growthEdgePattern = this.identifyGrowthEdgePattern(relatedInsights);
    if (growthEdgePattern) {
      opportunities.push(
        `This feels connected to the growth edge you've been working with - finding new ways to integrate these different aspects of your experience.`
      );
    }

    return opportunities;
  }

  /**
   * Find connections between memory patterns
   */
  async findPatternConnections(
    userId: string,
    sessions: any[],
    insights: any[]
  ): Promise<any[]> {
    const connections: any /* TODO: specify type */[] = [];

    // Temporal pattern connections
    if (sessions.length > 1) {
      const temporalConnection = this.identifyTemporalPatterns(sessions);
      if (temporalConnection) {
        connections.push({
          type: 'temporal',
          description: temporalConnection,
          sessions: sessions.slice(0, 3).map(s => s.id)
        });
      }
    }

    // Thematic evolution connections
    const thematicEvolution = this.identifyThematicEvolution(insights);
    if (thematicEvolution) {
      connections.push({
        type: 'thematic_evolution',
        description: thematicEvolution,
        insights: insights.slice(0, 5).map(i => i.id)
      });
    }

    return connections;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private extractEmotionalPatterns(messages: any[]): any {
    return {
      dominantEmotions: ['curiosity', 'contemplation'],
      emotionalFlow: 'stable_with_peaks',
      resonanceLevel: 0.7
    };
  }

  private calculateSessionQuality(conversationData: any): number {
    const factors = {
      messageCount: Math.min(conversationData.messages?.length || 0, 20) / 20,
      insightCount: Math.min(conversationData.insights?.length || 0, 5) / 5,
      thematicDepth: Math.min(conversationData.themes?.length || 0, 3) / 3
    };

    return (factors.messageCount + factors.insightCount + factors.thematicDepth) / 3;
  }

  private calculateConsciousnessCoherence(fieldStates: any[]): number {
    if (!fieldStates || fieldStates.length === 0) return 0.5;

    return fieldStates.reduce((acc, state, i) => {
      if (i === 0) return 0.5;
      const prev = fieldStates[i - 1];
      const stability = 1 - Math.abs((state.coherence || 0.5) - (prev.coherence || 0.5));
      return acc + stability;
    }, 0) / Math.max(fieldStates.length - 1, 1);
  }

  private classifyInsight(insight: string): ConversationInsight['insightType'] {
    const lowerInsight = insight.toLowerCase();

    if (lowerInsight.includes('breakthrough') || lowerInsight.includes('suddenly')) {
      return 'breakthrough';
    } else if (lowerInsight.includes('pattern') || lowerInsight.includes('notice')) {
      return 'pattern';
    } else if (lowerInsight.includes('connect') || lowerInsight.includes('relate')) {
      return 'connection';
    } else if (lowerInsight.includes('edge') || lowerInsight.includes('challenge')) {
      return 'growth_edge';
    } else if (lowerInsight.includes('integrate') || lowerInsight.includes('together')) {
      return 'integration';
    }

    return 'realization';
  }

  private calculateInsightSignificance(insight: string): number {
    const length = Math.min(insight.length / 200, 1);
    const emotionalWords = ['profound', 'deep', 'breakthrough', 'realize', 'understand'];
    const emotionalScore = emotionalWords.reduce((score, word) =>
      insight.toLowerCase().includes(word) ? score + 0.2 : score, 0);

    return Math.min(length + emotionalScore, 1);
  }

  private extractKeyTerms(text: string): string[] {
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'as', 'are', 'was', 'were', 'been', 'be']);
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));

    return words.slice(0, 5);
  }

  private findCommonThemes(sessions: any[]): string[] {
    const allThemes = sessions.flatMap(s => {
      const themes = s.conversation_themes;
      return Array.isArray(themes) ? themes : JSON.parse(themes || '[]');
    });

    const themeCount = allThemes.reduce((acc, theme) => {
      acc[theme] = (acc[theme] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(themeCount)
      .filter(([_, count]) => count > 1)
      .sort(([_, a], [__, b]) => b - a)
      .map(([theme, _]) => theme);
  }

  private identifyGrowthEdgePattern(insights: any[]): string | null {
    const growthEdgeInsights = insights.filter(i => i.insight_type === 'growth_edge');
    if (growthEdgeInsights.length > 1) {
      return `${growthEdgeInsights.length} growth edge insights identified`;
    }
    return null;
  }

  private identifyTemporalPatterns(sessions: any[]): string | null {
    if (sessions.length < 2) return null;

    const timeSpans = sessions.slice(0, -1).map((session, i) => {
      const current = new Date(session.created_at);
      const next = new Date(sessions[i + 1].created_at);
      return Math.abs(next.getTime() - current.getTime()) / (1000 * 60 * 60 * 24);
    });

    const avgDaysBetween = timeSpans.reduce((a, b) => a + b, 0) / timeSpans.length;

    if (avgDaysBetween < 7) {
      return 'Frequent engagement pattern - weekly conversations';
    } else if (avgDaysBetween < 30) {
      return 'Regular exploration pattern - monthly conversations';
    }

    return null;
  }

  private identifyThematicEvolution(insights: any[]): string | null {
    if (insights.length < 3) return null;

    const recentInsights = insights.slice(0, 3);
    const themes = recentInsights.map(i => i.insight_type);

    if (themes.includes('realization') && themes.includes('integration')) {
      return 'Evolution from realization to integration';
    }

    return null;
  }

  private generateSimulatedMemoryContext(userId: string, query: string): MemoryRetrievalResult {
    return {
      sessionPatterns: [],
      relatedInsights: [],
      continuityOpportunities: [],
      spiralDevelopmentContext: null,
      memoryConnections: []
    };
  }
}

// Export singleton instance
export const sessionMemoryServicePostgres = new SessionMemoryServicePostgres();
export default sessionMemoryServicePostgres;
