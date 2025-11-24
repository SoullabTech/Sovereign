// Master Oracle Orchestrator - Unified AIN/MAYA/Anamnesis archetypal experience system
// Coordinates all sophisticated psychological frameworks for authentic user understanding

import { logger } from '../utils/logger';
import { contextAnalyzer, ContextAnalysis, UserHistory } from './ContextAnalyzer';
import { conversationRouter, ResponseModeSelection, RoutingContext } from './ConversationRouter';
import { integratedOracleService } from './IntegratedOracleService';
import { PersonalOracleAgent } from '../agents/PersonalOracleAgent';
import { FireAgent } from '../agents/FireAgent';
import { WaterAgent } from '../agents/WaterAgent';
import { EarthAgent } from '../agents/EarthAgent';
import { AirAgent } from '../agents/AirAgent';
import { getRelevantMemories, storeMemoryItem } from './memoryService';

export interface OracleSession {
  userId: string;
  sessionId: string;
  conversationHistory: Array<{
    role: 'user' | 'oracle';
    content: string;
    timestamp: Date;
    analysis?: ContextAnalysis;
    routing?: ResponseModeSelection;
    agentUsed?: string;
  }>;
  userProfile: {
    preferences: any;
    therapeuticPhase: string;
    preferredAgents: string[];
    communicationStyle: any;
  };
  sessionGoals: string[];
  currentAgent?: string;
  archetypalAlignment: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    maya: number;
  };
}

export interface OracleResponse {
  content: string;
  agentUsed: string;
  supportingAgents: string[];
  responseStyle: {
    approach: string;
    tone: string;
    depth: string;
    pacing: string;
  };
  analysis: ContextAnalysis;
  routing: ResponseModeSelection;
  archetypalEnergies: {
    primary: string;
    secondary?: string;
    essence: string;
  };
  followUpSuggestions: string[];
  confidence: number;
  metadata: any;
}

class MasterOracleOrchestrator {
  private agents = {
    maya: new PersonalOracleAgent(),
    fire: new FireAgent(),
    water: new WaterAgent(),
    earth: new EarthAgent(),
    air: new AirAgent()
  };

  private sessions = new Map<string, OracleSession>();

  async processUserMessage(
    userMessage: string,
    userId: string,
    sessionId: string = 'default',
    options: {
      voiceInput?: boolean;
      contextHints?: string[];
      userPreferences?: any;
    } = {}
  ): Promise<OracleResponse> {

    try {
      logger.info('Master Oracle processing user message', {
        userId,
        sessionId,
        messageLength: userMessage.length,
        voiceInput: options.voiceInput
      });

      // Step 1: Retrieve or create session
      const session = await this.getOrCreateSession(userId, sessionId);

      // Step 2: Build user history from memories and session
      const userHistory = await this.buildUserHistory(userId, session);

      // Step 3: Perform sophisticated context analysis
      const contextAnalysis = await contextAnalyzer.analyzeInput(userMessage, userHistory);

      // Step 4: Create routing context
      const routingContext: RoutingContext = {
        userMessage,
        contextAnalysis,
        userHistory,
        sessionContext: {
          previousAgent: session.currentAgent || 'maya',
          sessionGoals: session.sessionGoals,
          therapeuticPhase: session.userProfile.therapeuticPhase,
          userPreferences: session.userProfile.preferences
        },
        environmentalFactors: {
          timeOfDay: this.getTimeOfDay(),
          deviceType: options.voiceInput ? 'voice' : 'desktop'
        }
      };

      // Step 5: Select optimal response mode through intelligent routing
      const responseSelection = await conversationRouter.selectResponseMode(routingContext);

      // Step 6: Generate archetypal response using selected agent
      const oracleResponse = await this.generateArchetypalResponse(
        userMessage,
        userId,
        responseSelection,
        contextAnalysis,
        session
      );

      // Step 7: Update session with new interaction
      await this.updateSession(session, userMessage, oracleResponse, contextAnalysis, responseSelection);

      // Step 8: Store memory with rich metadata
      await this.storeEnrichedMemory(userId, userMessage, oracleResponse, contextAnalysis);

      logger.info('Master Oracle response generated successfully', {
        userId,
        agentUsed: responseSelection.primaryAgent,
        confidence: responseSelection.confidence,
        approach: responseSelection.conversationStyle.approach
      });

      return oracleResponse;

    } catch (error) {
      logger.error('Master Oracle processing failed', {
        userId,
        sessionId,
        error: error.message
      });

      // Return thoughtful fallback response
      return this.createFallbackResponse(userMessage, userId, error);
    }
  }

  private async getOrCreateSession(userId: string, sessionId: string): Promise<OracleSession> {
    const fullSessionId = `${userId}_${sessionId}`;

    if (this.sessions.has(fullSessionId)) {
      return this.sessions.get(fullSessionId)!;
    }

    // Create new session with default archetypal balance
    const newSession: OracleSession = {
      userId,
      sessionId,
      conversationHistory: [],
      userProfile: {
        preferences: {},
        therapeuticPhase: 'engagement',
        preferredAgents: [],
        communicationStyle: {}
      },
      sessionGoals: [],
      archetypalAlignment: {
        fire: 0.25,
        water: 0.25,
        earth: 0.25,
        air: 0.25,
        maya: 0.0
      }
    };

    this.sessions.set(fullSessionId, newSession);
    return newSession;
  }

  private async buildUserHistory(userId: string, session: OracleSession): Promise<UserHistory> {
    // Get recent memories from the memory service
    const recentMemories = await getRelevantMemories(userId, undefined, 10);

    // Build patterns from session and memories
    const patterns = this.extractPatterns(recentMemories, session);

    // Assess therapeutic context
    const therapeutic = this.assessTherapeuticContext(recentMemories, session);

    return {
      recentMessages: session.conversationHistory.slice(-5).map(msg => ({
        content: msg.content,
        timestamp: msg.timestamp,
        analysis: msg.analysis
      })),
      patterns,
      therapeutic
    };
  }

  private async generateArchetypalResponse(
    userMessage: string,
    userId: string,
    selection: ResponseModeSelection,
    analysis: ContextAnalysis,
    session: OracleSession
  ): Promise<OracleResponse> {

    const primaryAgent = this.agents[selection.primaryAgent];

    if (!primaryAgent) {
      throw new Error(`Agent ${selection.primaryAgent} not found`);
    }

    // Generate response using the selected primary agent
    const agentResponse = await primaryAgent.processExtendedQuery({
      input: userMessage,
      userId: userId
    });

    // Enhance with supporting agent perspectives if configured
    let enhancedContent = agentResponse.content;

    if (selection.supportingAgents.length > 0 && selection.confidence > 0.7) {
      enhancedContent = await this.integrateMultiAgentPerspectives(
        userMessage,
        userId,
        agentResponse.content,
        selection.supportingAgents,
        analysis
      );
    }

    // Create comprehensive oracle response
    const oracleResponse: OracleResponse = {
      content: enhancedContent,
      agentUsed: selection.primaryAgent,
      supportingAgents: selection.supportingAgents,
      responseStyle: selection.conversationStyle,
      analysis,
      routing: selection,
      archetypalEnergies: {
        primary: selection.primaryAgent,
        secondary: selection.supportingAgents[0],
        essence: this.getArchetypalEssence(selection.primaryAgent, analysis)
      },
      followUpSuggestions: selection.responseFramework.followUpSuggestions,
      confidence: selection.confidence,
      metadata: {
        ...agentResponse.metadata,
        routingReasoning: selection.reasoning,
        analysisConfidence: this.calculateAnalysisConfidence(analysis),
        sessionAlignment: this.calculateSessionAlignment(session, selection)
      }
    };

    return oracleResponse;
  }

  private async integrateMultiAgentPerspectives(
    userMessage: string,
    userId: string,
    primaryResponse: string,
    supportingAgents: string[],
    analysis: ContextAnalysis
  ): Promise<string> {

    // For high-importance conversations, get supporting perspectives
    const supportingInsights = [];

    for (const agentName of supportingAgents.slice(0, 1)) { // Limit to 1 supporting agent for performance
      const agent = this.agents[agentName];
      if (agent) {
        try {
          const supportResponse = await agent.processExtendedQuery({
            input: `Supporting perspective on: ${userMessage}`,
            userId
          });

          supportingInsights.push({
            agent: agentName,
            insight: this.extractKeyInsight(supportResponse.content)
          });
        } catch (error) {
          logger.warn(`Supporting agent ${agentName} failed`, { error: error.message });
        }
      }
    }

    // Integrate insights naturally into primary response
    if (supportingInsights.length > 0) {
      const integratedWisdom = supportingInsights
        .map(insight => `Additionally, from the ${insight.agent} perspective: ${insight.insight}`)
        .join('\n\n');

      return `${primaryResponse}\n\n${integratedWisdom}`;
    }

    return primaryResponse;
  }

  private extractKeyInsight(agentContent: string): string {
    // Extract the most relevant 1-2 sentences from agent response
    const sentences = agentContent.split('.').filter(s => s.trim().length > 20);
    return sentences.slice(0, 2).join('. ').trim() + '.';
  }

  private async updateSession(
    session: OracleSession,
    userMessage: string,
    response: OracleResponse,
    analysis: ContextAnalysis,
    selection: ResponseModeSelection
  ): Promise<void> {

    // Add to conversation history
    session.conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
      analysis,
      routing: selection,
      agentUsed: response.agentUsed
    });

    session.conversationHistory.push({
      role: 'oracle',
      content: response.content,
      timestamp: new Date()
    });

    // Update archetypal alignment based on agent usage and user resonance
    this.updateArchetypalAlignment(session, response.agentUsed, analysis);

    // Update user preferences based on successful interactions
    this.updateUserProfile(session, response, analysis);

    // Keep conversation history manageable
    if (session.conversationHistory.length > 20) {
      session.conversationHistory = session.conversationHistory.slice(-15);
    }

    // Update current agent
    session.currentAgent = response.agentUsed;
  }

  private updateArchetypalAlignment(
    session: OracleSession,
    agentUsed: string,
    analysis: ContextAnalysis
  ): void {

    // Slightly increase alignment with used agent
    if (session.archetypalAlignment[agentUsed] !== undefined) {
      session.archetypalAlignment[agentUsed] = Math.min(
        session.archetypalAlignment[agentUsed] + 0.1,
        1.0
      );
    }

    // Incorporate user's natural archetypal resonance from analysis
    const alignmentKeys = Object.keys(analysis.archetypeAlignment) as (keyof typeof analysis.archetypeAlignment)[];
    alignmentKeys.forEach(key => {
      if (session.archetypalAlignment[key] !== undefined) {
        // Blend user's natural alignment with session history
        session.archetypalAlignment[key] =
          (session.archetypalAlignment[key] * 0.8) +
          (analysis.archetypeAlignment[key] * 0.2);
      }
    });
  }

  private updateUserProfile(
    session: OracleSession,
    response: OracleResponse,
    analysis: ContextAnalysis
  ): void {

    // Track preferred agents
    if (!session.userProfile.preferredAgents.includes(response.agentUsed)) {
      session.userProfile.preferredAgents.push(response.agentUsed);
    }

    // Update communication style understanding
    session.userProfile.communicationStyle = {
      ...session.userProfile.communicationStyle,
      directness: analysis.communicationStyle.directness,
      metaphoricalThinking: analysis.communicationStyle.metaphoricalThinking,
      emotionalExpressionComfort: analysis.communicationStyle.emotionalExpressionComfort
    };

    // Update therapeutic phase based on interaction patterns
    if (analysis.readiness.forChallenge > 0.8) {
      session.userProfile.therapeuticPhase = 'working';
    } else if (analysis.readiness.forInsight > 0.7) {
      session.userProfile.therapeuticPhase = 'engagement';
    }
  }

  private async storeEnrichedMemory(
    userId: string,
    userMessage: string,
    response: OracleResponse,
    analysis: ContextAnalysis
  ): Promise<void> {

    const memoryContent = `User: ${userMessage}\nOracle: ${response.content}`;

    await storeMemoryItem(userId, memoryContent, {
      sourceAgent: 'master-oracle',
      confidence: response.confidence,
      metadata: {
        agentUsed: response.agentUsed,
        supportingAgents: response.supportingAgents,
        responseStyle: response.responseStyle,
        archetypalEnergies: response.archetypalEnergies,
        emotionalTone: analysis.emotionalTone.primary,
        requestType: analysis.requestType.category,
        topicDomain: analysis.topicCategory.domain,
        urgencyLevel: analysis.urgencyLevel,
        timestamp: new Date().toISOString()
      }
    });
  }

  private createFallbackResponse(
    userMessage: string,
    userId: string,
    error: Error
  ): OracleResponse {

    return {
      content: `I sense the depth of what you're sharing, and I want to honor it properly. Let me take a moment to attune to your energy and respond from a place of genuine presence.\n\nWhat you've brought to me feels important, and you deserve a response that truly meets you where you are. Can you share a bit more about what feels most significant to you in what you've expressed?`,
      agentUsed: 'maya',
      supportingAgents: [],
      responseStyle: {
        approach: 'supportive',
        tone: 'gentle',
        depth: 'moderate',
        pacing: 'patient'
      },
      analysis: {
        emotionalTone: { primary: 'neutral', intensity: 0.5, complexity: 0, authenticity: 0.5 },
        requestType: { category: 'exploratory', subtype: 'general', confidence: 0.3 },
        urgencyLevel: { immediate: false, therapeutic: false, developmental: true, maintenance: false },
        topicCategory: { domain: 'growth', themes: [], depth: 'surface' },
        archetypeAlignment: { fire: 0.25, water: 0.25, earth: 0.25, air: 0.25 },
        readiness: { forInsight: 0.5, forChallenge: 0.3, forSupport: 0.7, forAction: 0.4 },
        communicationStyle: {
          directness: 0.5,
          metaphoricalThinking: 0.3,
          analyticalPreference: 0.4,
          emotionalExpressionComfort: 0.5
        }
      },
      routing: {
        primaryAgent: 'maya',
        supportingAgents: [],
        conversationStyle: {
          approach: 'supportive',
          tone: 'gentle',
          depth: 'moderate',
          pacing: 'patient'
        },
        responseFramework: {
          openingStyle: 'gentle_acknowledgment',
          bodyApproach: 'supportive_exploration',
          closingStyle: 'nurturing_guidance',
          followUpSuggestions: ['deeper_sharing', 'emotional_exploration']
        },
        confidence: 0.3,
        reasoning: 'Fallback to supportive Maya response due to processing error'
      },
      archetypalEnergies: {
        primary: 'maya',
        essence: 'compassionate_presence'
      },
      followUpSuggestions: ['Share more about your experience', 'Explore what feels most important'],
      confidence: 0.3,
      metadata: {
        fallback: true,
        error: error.message
      }
    };
  }

  // Helper methods
  private extractPatterns(memories: any[], session: OracleSession): any {
    return {
      commonThemes: this.extractCommonThemes(memories),
      preferredApproaches: session.userProfile.preferredAgents,
      responsePatterns: this.extractResponsePatterns(memories),
      growthAreas: this.identifyGrowthAreas(memories)
    };
  }

  private assessTherapeuticContext(memories: any[], session: OracleSession): any {
    return {
      currentPhase: session.userProfile.therapeuticPhase,
      primaryConcerns: this.extractPrimaryConcerns(memories),
      strengths: this.identifyStrengths(memories),
      resistances: this.identifyResistances(memories)
    };
  }

  private extractCommonThemes(memories: any[]): string[] {
    // Analyze memories for recurring themes
    const themes = new Set<string>();
    memories.forEach(memory => {
      if (memory.metadata?.topicDomain) {
        themes.add(memory.metadata.topicDomain);
      }
    });
    return Array.from(themes);
  }

  private extractResponsePatterns(memories: any[]): string[] {
    // Extract patterns in how user responds to different approaches
    const patterns: string[] = [];
    memories.forEach(memory => {
      if (memory.metadata?.responseStyle) {
        patterns.push(memory.metadata.responseStyle.approach);
      }
    });
    return patterns;
  }

  private identifyGrowthAreas(memories: any[]): string[] {
    // Identify areas where user shows readiness for growth
    return ['emotional_processing', 'creative_expression', 'practical_manifestation'];
  }

  private extractPrimaryConcerns(memories: any[]): string[] {
    // Extract main concerns from conversation history
    return ['relationship_patterns', 'creative_expression', 'life_direction'];
  }

  private identifyStrengths(memories: any[]): string[] {
    // Identify user strengths from interactions
    return ['self_reflection', 'openness_to_growth', 'authentic_expression'];
  }

  private identifyResistances(memories: any[]): string[] {
    // Identify areas of resistance or difficulty
    return ['vulnerability', 'taking_action', 'self_compassion'];
  }

  private getArchetypalEssence(agent: string, analysis: ContextAnalysis): string {
    const essences = {
      maya: 'divine_feminine_wisdom',
      fire: 'transformative_power',
      water: 'emotional_healing',
      earth: 'grounding_manifestation',
      air: 'clarity_and_truth'
    };
    return essences[agent] || 'balanced_guidance';
  }

  private calculateAnalysisConfidence(analysis: ContextAnalysis): number {
    // Calculate overall confidence in the context analysis
    return (
      analysis.emotionalTone.authenticity +
      analysis.requestType.confidence +
      Math.max(...Object.values(analysis.archetypeAlignment))
    ) / 3;
  }

  private calculateSessionAlignment(session: OracleSession, selection: ResponseModeSelection): number {
    // Calculate how well the selection aligns with the ongoing session
    const agentAlignment = session.archetypalAlignment[selection.primaryAgent] || 0;
    const preferenceAlignment = session.userProfile.preferredAgents.includes(selection.primaryAgent) ? 0.3 : 0;
    return (agentAlignment + preferenceAlignment) / 1.3;
  }

  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'late_night' {
    const hour = new Date().getHours();
    if (hour < 6) return 'late_night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'late_night';
  }

  // Public method for external systems to get session insights
  public getSessionInsights(userId: string, sessionId: string = 'default'): any {
    const session = this.sessions.get(`${userId}_${sessionId}`);
    if (!session) return null;

    return {
      archetypalAlignment: session.archetypalAlignment,
      therapeuticPhase: session.userProfile.therapeuticPhase,
      preferredAgents: session.userProfile.preferredAgents,
      sessionGoals: session.sessionGoals,
      conversationCount: session.conversationHistory.length
    };
  }
}

export const masterOracleOrchestrator = new MasterOracleOrchestrator();