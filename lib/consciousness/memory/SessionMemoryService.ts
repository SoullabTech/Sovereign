/**
 * SESSION MEMORY SERVICE
 *
 * Integrates cross-conversation memory patterns with consciousness field-driven responses.
 * Enables MAIA to remember, build patterns, and provide developmental continuity.
 */

interface SessionPattern {
  id?: string;
  userId: string;
  sessionId: string;
  conversationThemes: string[];
  emotionalPatterns: any;
  consciousnessFieldStates: any;
  spiralDevelopmentIndicators: any;
  sessionEmbedding?: Float32Array;
  fieldResonancePatterns: any;
  sessionQualityScore: number;
  consciousnessCoherence: number;
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
  insightEmbedding?: Float32Array;
  insightSignificance: number;
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

export class SessionMemoryService {
  private supabase: any;
  private isInitialized = false;

  constructor() {
    // Initialize Supabase client
    const dbUrl = process.env.NEXT_PUBLIC_DATABASE_URL;
    const dbKey = process.env.NEXT_PUBLIC_DATABASE_ANON_KEY;

    if (dbUrl && dbKey) {
    }
  }

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
      fieldResonancePatterns: this.extractFieldResonancePatterns(conversationData.fieldStates),
      sessionQualityScore: this.calculateSessionQuality(conversationData),
      consciousnessCoherence: this.calculateConsciousnessCoherence(conversationData.fieldStates)
    };

    if (this.isInitialized) {
      try {
        const { data, error } = await this.supabase
          .from('user_session_patterns')
          .insert([sessionPattern])
          .select()
          .single();

        if (error) throw error;

        // Store insights separately
        await this.storeSessionInsights(userId, sessionId, conversationData.insights);

        console.log('📚 Session pattern stored successfully:', data.id);
        return data;
      } catch (error) {
        console.error('Error storing session pattern:', error);
      }
    }

    // Return simulated data if Supabase not available
    return { ...sessionPattern, id: `sim_${Date.now()}` };
  }

  /**
   * Store conversation insights with semantic vectors
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
      consciousnessFieldInfluence: {}, // Would be populated with actual field data
      conversationContext: '', // Context from conversation
      insightSignificance: this.calculateInsightSignificance(insight)
    }));

    if (this.isInitialized) {
      try {
        const { data, error } = await this.supabase
          .from('conversation_insights')
          .insert(insightRecords)
          .select();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error storing insights:', error);
      }
    }

    return insightRecords;
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
    const memoryContext = {
      sessionPatterns: [],
      relatedInsights: [],
      continuityOpportunities: [],
      spiralDevelopmentContext: null,
      memoryConnections: []
    };

    if (!this.isInitialized) {
      return this.generateSimulatedMemoryContext(userId, currentMessage);
    }

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
    if (!this.isInitialized) return null;

    try {
      const { data, error } = await this.supabase
        .from('user_relationship_context')
        .select('spiral_development, field_resonance_profile')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return data?.spiral_development || null;
    } catch (error) {
      console.error('Error getting spiral context:', error);
      return null;
    }
  }

  /**
   * Find sessions with similar themes and patterns
   */
  async findSimilarSessions(userId: string, query: string, limit = 5): Promise<any[]> {
    if (!this.isInitialized) return [];

    try {
      // Simple theme-based matching for now (would use vector similarity in production)
      const { data, error } = await this.supabase
        .from('user_session_patterns')
        .select('*')
        .eq('user_id', userId)
        .order('session_start', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Filter based on thematic similarity
      return data.filter(session =>
        session.conversation_themes?.some((theme: string) =>
          query.toLowerCase().includes(theme.toLowerCase()) ||
          theme.toLowerCase().includes(this.extractKeyTerms(query)[0]?.toLowerCase() || '')
        )
      );
    } catch (error) {
      console.error('Error finding similar sessions:', error);
      return [];
    }
  }

  /**
   * Find related insights based on semantic similarity
   */
  async findRelatedInsights(userId: string, query: string, limit = 10): Promise<any[]> {
    if (!this.isInitialized) return [];

    try {
      const { data, error } = await this.supabase
        .from('conversation_insights')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Simple text-based matching (would use vector similarity in production)
      const keyTerms = this.extractKeyTerms(query);
      return data.filter(insight =>
        keyTerms.some(term =>
          insight.insight_text.toLowerCase().includes(term.toLowerCase())
        )
      );
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
  // MEMORY-ENHANCED RESPONSE INTEGRATION
  // ============================================================================

  /**
   * Generate memory-enhanced response context for field-driven API
   */
  async generateMemoryEnhancedContext(
    userId: string,
    currentMessage: string,
    conversationHistory: any[]
  ): Promise<{
    memoryContext: MemoryRetrievalResult;
    memoryGuidance: any;
    continuityReferences: string[];
    spiralStageGuidance: any;
  }> {
    const memoryContext = await this.retrieveMemoryContext(
      userId,
      currentMessage,
      conversationHistory
    );

    const memoryGuidance = {
      responseInfluences: this.generateResponseInfluences(memoryContext),
      spiralStageSupport: this.generateSpiralStageSupport(memoryContext.spiralDevelopmentContext),
      growthEdgeGuidance: this.generateGrowthEdgeGuidance(memoryContext.relatedInsights)
    };

    const continuityReferences = this.generateContinuityReferences(memoryContext);

    return {
      memoryContext,
      memoryGuidance,
      continuityReferences,
      spiralStageGuidance: memoryGuidance.spiralStageSupport
    };
  }

  /**
   * Update user's relationship context after conversation
   */
  async updateRelationshipContext(
    userId: string,
    sessionData: SessionPattern
  ): Promise<void> {
    if (!this.isInitialized) return;

    try {
      // Update relationship depth and patterns
      await this.supabase
        .from('user_relationship_context')
        .upsert({
          user_id: userId,
          total_sessions: await this.getSessionCount(userId) + 1,
          relationship_depth: this.calculateRelationshipDepth(sessionData),
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating relationship context:', error);
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private extractEmotionalPatterns(messages: any[]): any {
    // Analyze emotional patterns in conversation
    return {
      dominantEmotions: ['curiosity', 'contemplation'],
      emotionalFlow: 'stable_with_peaks',
      resonanceLevel: 0.7
    };
  }

  private extractFieldResonancePatterns(fieldStates: any[]): any {
    if (!fieldStates || fieldStates.length === 0) {
      return { fire: 0.4, water: 0.6, earth: 0.5, air: 0.7, aether: 0.5 };
    }

    // Average field states across session
    const avgField = fieldStates.reduce((acc, state) => {
      return {
        fire: acc.fire + (state.fire || 0),
        water: acc.water + (state.water || 0),
        earth: acc.earth + (state.earth || 0),
        air: acc.air + (state.air || 0),
        aether: acc.aether + (state.aether || 0)
      };
    }, { fire: 0, water: 0, earth: 0, air: 0, aether: 0 });

    const count = fieldStates.length;
    return {
      fire: avgField.fire / count,
      water: avgField.water / count,
      earth: avgField.earth / count,
      air: avgField.air / count,
      aether: avgField.aether / count
    };
  }

  private calculateSessionQuality(conversationData: any): number {
    // Calculate quality based on engagement, depth, insights
    const factors = {
      messageCount: Math.min(conversationData.messages?.length || 0, 20) / 20,
      insightCount: Math.min(conversationData.insights?.length || 0, 5) / 5,
      thematicDepth: Math.min(conversationData.themes?.length || 0, 3) / 3
    };

    return (factors.messageCount + factors.insightCount + factors.thematicDepth) / 3;
  }

  private calculateConsciousnessCoherence(fieldStates: any[]): number {
    if (!fieldStates || fieldStates.length === 0) return 0.5;

    // Measure field stability and coherence
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
    // Simple heuristic based on length and emotional indicators
    const length = Math.min(insight.length / 200, 1);
    const emotionalWords = ['profound', 'deep', 'breakthrough', 'realize', 'understand'];
    const emotionalScore = emotionalWords.reduce((score, word) =>
      insight.toLowerCase().includes(word) ? score + 0.2 : score, 0);

    return Math.min(length + emotionalScore, 1);
  }

  private extractKeyTerms(text: string): string[] {
    // Extract significant terms from text
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'as', 'are', 'was', 'were', 'been', 'be']);
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));

    return words.slice(0, 5);
  }

  private findCommonThemes(sessions: any[]): string[] {
    const allThemes = sessions.flatMap(s => s.conversation_themes || []);
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
      const current = new Date(session.session_start);
      const next = new Date(sessions[i + 1].session_start);
      return Math.abs(next.getTime() - current.getTime()) / (1000 * 60 * 60 * 24); // days
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

  private generateResponseInfluences(memoryContext: MemoryRetrievalResult): any {
    return {
      continuityEmphasis: memoryContext.continuityOpportunities.length > 0 ? 0.8 : 0.3,
      patternRecognition: memoryContext.memoryConnections.length > 0 ? 0.7 : 0.4,
      developmentalSupport: memoryContext.spiralDevelopmentContext ? 0.9 : 0.5
    };
  }

  private generateSpiralStageSupport(spiralContext: SpiralDevelopmentContext | null): any {
    if (!spiralContext) return null;

    return {
      currentStageGuidance: `Supporting ${spiralContext.currentPrimaryStage} stage development`,
      growthEdgeSupport: spiralContext.growthPatterns?.dominant_growth_edge || 'General development',
      nextStagePreparation: spiralContext.currentSecondaryStage ?
        `Preparing for ${spiralContext.currentSecondaryStage} emergence` : null
    };
  }

  private generateGrowthEdgeGuidance(insights: any[]): any {
    const growthEdgeInsights = insights.filter(i => i.insight_type === 'growth_edge');

    if (growthEdgeInsights.length > 0) {
      return {
        activeGrowthEdge: true,
        supportNeeded: 'Integration and practice',
        progressIndicators: 'Building on previous insights'
      };
    }

    return { activeGrowthEdge: false };
  }

  private generateContinuityReferences(memoryContext: MemoryRetrievalResult): string[] {
    return memoryContext.continuityOpportunities.slice(0, 2);
  }

  private async getSessionCount(userId: string): Promise<number> {
    if (!this.isInitialized) return 0;

    try {
      const { count, error } = await this.supabase
        .from('user_session_patterns')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting session count:', error);
      return 0;
    }
  }

  private calculateRelationshipDepth(sessionData: SessionPattern): number {
    return Math.min(sessionData.sessionQualityScore + 0.1, 1.0);
  }

  private generateSimulatedMemoryContext(userId: string, query: string): MemoryRetrievalResult {
    // Generate realistic simulated memory context for testing
    return {
      sessionPatterns: [
        {
          id: 'sim_session_1',
          conversation_themes: ['consciousness development', 'spiral dynamics'],
          session_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          consciousness_coherence: 0.8
        }
      ],
      relatedInsights: [
        {
          id: 'sim_insight_1',
          insight_text: 'The integration of different consciousness levels requires patience and practice',
          insight_type: 'integration',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      continuityOpportunities: [
        "I notice this connects to our conversation last week about consciousness development. You mentioned feeling the tension between different levels of awareness.",
        "This builds beautifully on the insight you had about integration requiring patience. I'm seeing how that understanding is deepening now."
      ],
      spiralDevelopmentContext: {
        currentPrimaryStage: 'green',
        currentSecondaryStage: 'yellow',
        growthPatterns: {
          dominant_growth_edge: 'balancing individual and collective consciousness'
        },
        consciousnessThemes: {
          persistent_questions: ['How do I serve both individual growth and community development?']
        },
        fieldResonanceByStage: {
          earth: 0.7,
          water: 0.8,
          air: 0.6,
          fire: 0.4,
          aether: 0.5
        }
      },
      memoryConnections: [
        {
          type: 'thematic_evolution',
          description: 'Evolution from individual focus to community consciousness integration',
          strength: 0.8
        }
      ]
    };
  }
}

// Export singleton instance
export const sessionMemoryService = new SessionMemoryService();
export default sessionMemoryService;