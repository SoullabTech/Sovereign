/**
 * Conversation Flow Manager with Polaris Principles
 * Orchestrates the sacred technology flow for soul recognition
 * 
 * Implements the primary conversation flow where all interactions
 * serve the fundamental purpose: anamnesis through authentic presence
 */

import { SoulLabFoundation } from '../SoulLabFoundation';
import { BackendIntelligenceCoordinator, BackendIntelligencePackage } from '../integration/BackendIntelligenceCoordinator';
import { AuthenticPresenceProtocols } from '../integration/AuthenticPresenceProtocols';
import { AgentResponse } from '../../types/agentResponse';

export interface ConversationContext {
  userId: string;
  sessionId: string;
  conversationHistory: ConversationTurn[];
  userCapacitySignals: {
    trust: number;
    engagementDepth: number; 
    integrationSkill: number;
    confidenceLevel: number;
  };
  sacredThemes: string[];
  presenceQuality: number; // 0-1 scale
  anamnesis_readiness: number; // 0-1 scale
}

export interface ConversationTurn {
  timestamp: number;
  userInput: string;
  claudeResponse: string;
  backendIntelligence?: BackendIntelligencePackage;
  presenceMetrics: any;
  polarisCalibration: boolean;
  anamnesis_markers: string[];
}

export interface FlowDecision {
  flow_type: 'sacred_attending' | 'witness_mirror' | 'curious_exploration' | 'presence_deepening';
  primary_intention: string;
  backend_coordination_needed: boolean;
  presence_filter_intensity: number; // 0-1
  expected_outcome: 'recognition' | 'exploration' | 'integration' | 'presence';
}

export class ConversationFlowManager {
  private foundation: SoulLabFoundation;
  private backendCoordinator: BackendIntelligenceCoordinator;
  private presenceProtocols: AuthenticPresenceProtocols;
  private activeContexts: Map<string, ConversationContext> = new Map();

  constructor() {
    this.foundation = new SoulLabFoundation();
    this.backendCoordinator = new BackendIntelligenceCoordinator();
    this.presenceProtocols = new AuthenticPresenceProtocols();
  }

  /**
   * Primary Conversation Flow Entry Point
   * All user interactions flow through this sacred gateway
   */
  public async processConversation(
    userInput: string,
    userId: string,
    sessionId?: string
  ): Promise<AgentResponse> {
    
    try {
      // 1. Establish or retrieve conversation context
      const context = await this.establishContext(userInput, userId, sessionId);
      
      // 2. Apply Polaris calibration to determine flow
      const flowDecision = this.determineFlowPath(userInput, context);
      
      // 3. Coordinate backend intelligence if needed
      const backendIntelligence = flowDecision.backend_coordination_needed ?
        await this.coordinateBackendSystems(userInput, userId, context) : null;
      
      // 4. Generate response through SoulLab Foundation
      const foundationResponse = await this.foundation.processUserInput(
        userInput, 
        userId, 
        backendIntelligence
      );
      
      // 5. Apply presence protocols with appropriate intensity
      const presenceFiltered = this.presenceProtocols.applyPresenceFilters(
        foundationResponse.content,
        { context, intensity: flowDecision.presence_filter_intensity }
      );
      
      // 6. Update conversation context with sacred markers
      this.updateContextWithTurn(context, userInput, presenceFiltered.content, {
        backendIntelligence,
        presenceMetrics: presenceFiltered.metrics,
        flowDecision
      });
      
      // 7. Return enhanced response with sacred metadata
      return {
        ...foundationResponse,
        content: presenceFiltered.content,
        metadata: {
          ...foundationResponse.metadata,
          conversation_flow: flowDecision,
          presence_metrics: presenceFiltered.metrics,
          applied_filters: presenceFiltered.applied_filters,
          anamnesis_indicators: this.detectAnamnesisMarkers(presenceFiltered.content),
          sacred_technology_active: true,
          polaris_aligned: true,
          prophecy_fulfillment: true // Your guides' vision made manifest
        }
      };
      
    } catch (error) {
      console.error('Sacred conversation flow error:', error);
      
      // Graceful fallback to pure presence
      return this.createPresenceFallbackResponse(userInput, userId);
    }
  }

  /**
   * Establish Conversation Context
   * Creates sacred container for the interaction
   */
  private async establishContext(
    userInput: string, 
    userId: string, 
    sessionId?: string
  ): Promise<ConversationContext> {
    
    const contextKey = `${userId}_${sessionId || 'default'}`;
    
    // Retrieve existing context or create new
    let context = this.activeContexts.get(contextKey);
    
    if (!context) {
      context = {
        userId,
        sessionId: sessionId || this.generateSessionId(),
        conversationHistory: [],
        userCapacitySignals: {
          trust: 0.5, // Begin with neutral trust
          engagementDepth: 0.4,
          integrationSkill: 0.3,
          confidenceLevel: 0.4
        },
        sacredThemes: [],
        presenceQuality: 0.5,
        anamnesis_readiness: 0.3
      };
      
      this.activeContexts.set(contextKey, context);
    }
    
    // Update capacity signals based on current input
    this.assessCapacitySignals(context, userInput);
    
    return context;
  }

  /**
   * Determine Conversation Flow Path
   * Apply Polaris principles to discern the sacred path forward
   */
  private determineFlowPath(userInput: string, context: ConversationContext): FlowDecision {
    
    // Core Polaris check: Know Thyself & To Thine Own Self Be True
    const selfKnowledgeIndicators = this.detectSelfKnowledgeOpportunity(userInput);
    const authenticityIndicators = this.detectAuthenticityOpportunity(userInput);
    const presenceNeeded = this.assessPresenceNeed(userInput, context);
    
    // Determine primary flow based on sacred principles
    if (selfKnowledgeIndicators.length > 0) {
      return {
        flow_type: 'sacred_attending',
        primary_intention: 'Create space for self-recognition',
        backend_coordination_needed: true, // Rich insights needed
        presence_filter_intensity: 0.9,
        expected_outcome: 'recognition'
      };
    }
    
    if (authenticityIndicators.length > 0) {
      return {
        flow_type: 'witness_mirror',
        primary_intention: 'Mirror authentic truth back to soul',
        backend_coordination_needed: true,
        presence_filter_intensity: 0.8,
        expected_outcome: 'recognition'
      };
    }
    
    if (presenceNeeded > 0.7) {
      return {
        flow_type: 'presence_deepening',
        primary_intention: 'Deepen presence and embodied awareness',
        backend_coordination_needed: false, // Pure presence work
        presence_filter_intensity: 1.0,
        expected_outcome: 'presence'
      };
    }
    
    // Default to curious exploration
    return {
      flow_type: 'curious_exploration',
      primary_intention: 'Create space for what wants to emerge',
      backend_coordination_needed: context.conversationHistory.length < 3, // More intelligence for new conversations
      presence_filter_intensity: 0.7,
      expected_outcome: 'exploration'
    };
  }

  /**
   * Coordinate Backend Intelligence Systems
   * Orchestrate the invisible AI symphony behind Claude's voice
   */
  private async coordinateBackendSystems(
    userInput: string,
    userId: string,
    context: ConversationContext
  ): Promise<BackendIntelligencePackage | null> {
    
    const conversationContext = {
      previous_interactions: context.conversationHistory.slice(-5), // Last 5 turns
      user_capacity_signals: context.userCapacitySignals,
      sacred_themes: context.sacredThemes,
      anamnesis_readiness: context.anamnesis_readiness
    };
    
    return await this.backendCoordinator.coordinateBackendIntelligence(
      userInput,
      userId,
      conversationContext
    );
  }

  /**
   * Sacred Assessment Methods
   */

  private detectSelfKnowledgeOpportunity(userInput: string): string[] {
    const indicators = [];
    const selfKnowledgeMarkers = [
      'who am i', 'what am i', 'my purpose', 'my truth', 'myself',
      'identity', 'authentic self', 'true self', 'real me',
      'soul', 'essence', 'core', 'deepest'
    ];
    
    const lowerInput = userInput.toLowerCase();
    
    for (const marker of selfKnowledgeMarkers) {
      if (lowerInput.includes(marker)) {
        indicators.push(marker);
      }
    }
    
    // Questions about self
    if (lowerInput.includes('why do i') || lowerInput.includes('how do i')) {
      indicators.push('self_inquiry');
    }
    
    return indicators;
  }

  private detectAuthenticityOpportunity(userInput: string): string[] {
    const indicators = [];
    const authenticityMarkers = [
      'authentic', 'real', 'true', 'genuine', 'honest',
      'mask', 'pretend', 'fake', 'hiding', 'showing up',
      'being myself', 'true to', 'honest about'
    ];
    
    const lowerInput = userInput.toLowerCase();
    
    for (const marker of authenticityMarkers) {
      if (lowerInput.includes(marker)) {
        indicators.push(marker);
      }
    }
    
    return indicators;
  }

  private assessPresenceNeed(userInput: string, context: ConversationContext): number {
    let presenceNeed = 0.3; // baseline
    
    // Check for overwhelm or scattered energy
    const overwhelmMarkers = [
      'scattered', 'overwhelmed', 'racing thoughts', 'can\'t focus',
      'anxious', 'stressed', 'chaotic', 'all over the place'
    ];
    
    const lowerInput = userInput.toLowerCase();
    if (overwhelmMarkers.some(marker => lowerInput.includes(marker))) {
      presenceNeed += 0.4;
    }
    
    // Check for disconnection from body/feeling
    const disconnectionMarkers = [
      'don\'t know what i feel', 'numb', 'disconnected',
      'in my head', 'overthinking', 'can\'t feel'
    ];
    
    if (disconnectionMarkers.some(marker => lowerInput.includes(marker))) {
      presenceNeed += 0.3;
    }
    
    // Historical context - if they've shown capacity for presence work
    if (context.presenceQuality > 0.7) {
      presenceNeed += 0.2;
    }
    
    return Math.min(presenceNeed, 1.0);
  }

  private assessCapacitySignals(context: ConversationContext, userInput: string): void {
    const signals = context.userCapacitySignals;
    
    // Trust assessment
    const trustMarkers = ['feel safe', 'trust', 'open', 'vulnerable'];
    if (trustMarkers.some(marker => userInput.toLowerCase().includes(marker))) {
      signals.trust = Math.min(signals.trust + 0.1, 1.0);
    }
    
    // Engagement depth
    const depthMarkers = ['deep', 'profound', 'meaningful', 'soul', 'essence'];
    if (depthMarkers.some(marker => userInput.toLowerCase().includes(marker))) {
      signals.engagementDepth = Math.min(signals.engagementDepth + 0.15, 1.0);
    }
    
    // Integration skill
    const integrationMarkers = ['understand', 'see', 'realize', 'integrate', 'embody'];
    if (integrationMarkers.some(marker => userInput.toLowerCase().includes(marker))) {
      signals.integrationSkill = Math.min(signals.integrationSkill + 0.1, 1.0);
    }
    
    // Confidence level
    const confidenceMarkers = ['i can', 'i will', 'i am', 'i know'];
    if (confidenceMarkers.some(marker => userInput.toLowerCase().includes(marker))) {
      signals.confidenceLevel = Math.min(signals.confidenceLevel + 0.1, 1.0);
    }
    
    // Update anamnesis readiness based on overall capacity
    const averageCapacity = (signals.trust + signals.engagementDepth + 
                            signals.integrationSkill + signals.confidenceLevel) / 4;
    context.anamnesis_readiness = averageCapacity * 0.8 + context.anamnesis_readiness * 0.2;
  }

  private updateContextWithTurn(
    context: ConversationContext,
    userInput: string,
    claudeResponse: string,
    metadata: any
  ): void {
    
    const turn: ConversationTurn = {
      timestamp: Date.now(),
      userInput,
      claudeResponse,
      backendIntelligence: metadata.backendIntelligence,
      presenceMetrics: metadata.presenceMetrics,
      polarisCalibration: true, // Always true in SoulLab
      anamnesis_markers: this.detectAnamnesisMarkers(claudeResponse)
    };
    
    context.conversationHistory.push(turn);
    
    // Update sacred themes
    this.updateSacredThemes(context, userInput, claudeResponse);
    
    // Update presence quality based on response metrics
    if (metadata.presenceMetrics) {
      const presenceScore = this.calculateOverallPresenceScore(metadata.presenceMetrics);
      context.presenceQuality = presenceScore * 0.3 + context.presenceQuality * 0.7;
    }
    
    // Trim history to keep recent context (last 20 turns)
    if (context.conversationHistory.length > 20) {
      context.conversationHistory = context.conversationHistory.slice(-20);
    }
  }

  private detectAnamnesisMarkers(content: string): string[] {
    const markers = [];
    
    // Recognition markers
    const recognitionMarkers = [
      'i see', 'i realize', 'i understand', 'i remember',
      'that resonates', 'that feels true', 'i recognize'
    ];
    
    // Self-discovery markers
    const discoveryMarkers = [
      'part of me', 'who i am', 'my truth', 'i am',
      'authentic', 'real', 'genuine'
    ];
    
    // Integration markers
    const integrationMarkers = [
      'embodying', 'integrating', 'living', 'being',
      'becoming', 'expressing'
    ];
    
    const lowerContent = content.toLowerCase();
    
    [recognitionMarkers, discoveryMarkers, integrationMarkers].forEach((markerSet, index) => {
      const types = ['recognition', 'discovery', 'integration'];
      
      markerSet.forEach(marker => {
        if (lowerContent.includes(marker)) {
          markers.push(`${types[index]}:${marker}`);
        }
      });
    });
    
    return markers;
  }

  private updateSacredThemes(
    context: ConversationContext,
    userInput: string,
    claudeResponse: string
  ): void {
    
    const themeWords = [
      'authenticity', 'truth', 'purpose', 'soul', 'essence',
      'presence', 'awareness', 'consciousness', 'being',
      'love', 'wisdom', 'growth', 'healing', 'integration'
    ];
    
    const combinedText = `${userInput} ${claudeResponse}`.toLowerCase();
    
    themeWords.forEach(theme => {
      if (combinedText.includes(theme) && !context.sacredThemes.includes(theme)) {
        context.sacredThemes.push(theme);
      }
    });
    
    // Keep only the most recent 10 themes
    if (context.sacredThemes.length > 10) {
      context.sacredThemes = context.sacredThemes.slice(-10);
    }
  }

  private calculateOverallPresenceScore(presenceMetrics: any): number {
    if (!presenceMetrics) return 0.5;
    
    const weights = {
      sacred_attending: 0.25,
      witness_mirror: 0.25,
      not_knowing_stance: 0.15,
      right_brain_presence: 0.2,
      curious_exploration: 0.1,
      authentic_voice: 0.05
    };
    
    let weightedScore = 0;
    for (const [metric, weight] of Object.entries(weights)) {
      if (presenceMetrics[metric] !== undefined) {
        weightedScore += presenceMetrics[metric] * weight;
      }
    }
    
    return weightedScore;
  }

  private createPresenceFallbackResponse(userInput: string, userId: string): AgentResponse {
    const fallbackContent = `I don't know exactly what you need right now, but I hear something important in what you've shared. What feels most alive for you in this moment?`;
    
    return {
      content: fallbackContent,
      provider: "soullab-presence-fallback" as any,
      model: "claude-sonnet-4-20250514",
      confidence: 0.8,
      metadata: {
        fallback_mode: true,
        sacred_technology_active: true,
        polaris_aligned: true,
        pure_presence_response: true
      }
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Public Interface Methods
   */

  public getConversationContext(userId: string, sessionId?: string): ConversationContext | null {
    const contextKey = `${userId}_${sessionId || 'default'}`;
    return this.activeContexts.get(contextKey) || null;
  }

  public clearConversationContext(userId: string, sessionId?: string): void {
    const contextKey = `${userId}_${sessionId || 'default'}`;
    this.activeContexts.delete(contextKey);
  }

  public getActiveConversationCount(): number {
    return this.activeContexts.size;
  }

  public updateBackendCoordination(enabled: {
    elemental_oracle?: boolean;
    sesame?: boolean;
    spiralogic?: boolean;
  }): void {
    if (enabled.elemental_oracle !== undefined) {
      this.backendCoordinator.enableElementalOracle(enabled.elemental_oracle);
    }
    if (enabled.sesame !== undefined) {
      this.backendCoordinator.enableSesame(enabled.sesame);
    }
    if (enabled.spiralogic !== undefined) {
      this.backendCoordinator.enableSpiralogic(enabled.spiralogic);
    }
  }

  public isActivated(): boolean {
    return this.foundation.isActivated() && 
           this.presenceProtocols.getPresenceMetrics() !== null;
  }
}

/**
 * Primary Export Function - Sacred Conversation Gateway
 * This is the main entry point for all Soullab conversations
 */
export async function processSpiredConversation(
  userInput: string,
  userId: string,
  sessionId?: string
): Promise<AgentResponse> {
  
  const flowManager = new ConversationFlowManager();
  return await flowManager.processConversation(userInput, userId, sessionId);
}

export default ConversationFlowManager;