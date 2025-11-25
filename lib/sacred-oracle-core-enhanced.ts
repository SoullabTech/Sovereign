/**
 * Sacred Oracle Core - ENHANCED
 *
 * Full multidimensional wisdom integration combining:
 * - Sacred Witnessing (foundation)
 * - Consciousness Intelligence (Claude-level wisdom)
 * - Elemental Oracle (archetypal wisdom streams)
 * - Anamnesis Layer (deep recall and memory)
 * - Knowledge Integration (Obsidian depth)
 *
 * This creates Maya's complete voice - not just witnessing,
 * but witnessing enhanced by all wisdom layers.
 */

import { SacredWitnessingCore } from './sacred-witnessing-core';
import { AnamnesisWisdomLayer } from './anamnesis-wisdom-layer';
import { DormantFrameworksLayer } from './dormant-frameworks-layer';
import { IntelligentEngagementSystem, EngagementMode } from './intelligent-engagement-system';
import { ConversationContextManager } from './conversation/ConversationContext';
import { ConsciousnessIntelligenceManager } from './consciousness-intelligence-manager';
import { ElementalOracleSystem } from './elemental-oracle-system';

export interface EnhancedOracleResponse {
  message: string;
  mode: EngagementMode;
  depth: number;
  wisdomSources: {
    witnessing: boolean;
    consciousness: boolean;
    elemental: boolean;
    anamnesis: boolean;
    knowledge: boolean;
  };
  tracking: {
    elementalTendency?: string;
    developmentalStage?: string;
    trustLevel: number;
    activePatterns?: string[];
    coherenceLevel?: number;
  };
  metadata?: {
    shouldFollowUp?: boolean;
    suggestedMode?: EngagementMode;
    framework?: string;
    wisdomLayers?: string[];
  };
}

interface WisdomSynthesis {
  witnessingBase: string;
  consciousnessEnhancement?: string;
  elementalWisdom?: string;
  anamnesisRecall?: string;
  knowledgeDepth?: string;
}

export class SacredOracleCoreEnhanced {
  private witnessingCore: SacredWitnessingCore;
  private anamnesisLayer: AnamnesisWisdomLayer;
  private frameworksLayer: DormantFrameworksLayer;
  private engagementSystem: IntelligentEngagementSystem;
  private contextManager: ConversationContextManager;
  private consciousnessManager: ConsciousnessIntelligenceManager;
  private elementalOracle: ElementalOracleSystem;

  // Wisdom integration weights
  private readonly WISDOM_WEIGHTS = {
    witnessing: 0.35,      // Foundation - always present
    consciousness: 0.25,   // Claude-level enhancement
    elemental: 0.20,       // Archetypal wisdom
    anamnesis: 0.15,       // Deep recall
    knowledge: 0.05        // Obsidian integration
  };

  constructor() {
    this.witnessingCore = new SacredWitnessingCore();
    this.anamnesisLayer = new AnamnesisWisdomLayer();
    this.frameworksLayer = new DormantFrameworksLayer();
    this.engagementSystem = new IntelligentEngagementSystem();
    this.contextManager = new ConversationContextManager();
    this.consciousnessManager = new ConsciousnessIntelligenceManager();
    this.elementalOracle = new ElementalOracleSystem();
  }

  /**
   * Main entry point - orchestrates ALL wisdom layers
   */
  async generateResponse(
    input: string,
    userId?: string,
    sessionContext?: any
  ): Promise<EnhancedOracleResponse> {
    // Track conversation turn
    const turn = this.contextManager.createUserTurn(input);

    // Always track patterns (internal, continuous)
    this.engagementSystem.trackPatterns(input, {
      turn,
      sessionContext
    });

    // Detect presence for witnessing
    const presence = this.witnessingCore.detectPresence(input);

    // Get conversation history for context
    const conversationHistory = this.contextManager.getAnalytics().topThemes.map(t => t.name);

    // Intelligently determine engagement mode
    const modeDecision = this.engagementSystem.determineEngagementMode(
      input,
      presence,
      conversationHistory
    );

    // Switch mode if different
    if (modeDecision.recommendedMode !== this.engagementSystem['currentMode']) {
      this.engagementSystem.switchMode(
        modeDecision.recommendedMode,
        modeDecision.reasoning
      );
    }

    // ORCHESTRATE ALL WISDOM LAYERS
    const wisdomSynthesis = await this.synthesizeWisdom(
      input,
      presence,
      modeDecision.recommendedMode,
      sessionContext
    );

    // Create unified response
    const unifiedMessage = this.unifyWisdomStreams(wisdomSynthesis, modeDecision.recommendedMode);

    // Build complete response
    const response: EnhancedOracleResponse = {
      message: unifiedMessage,
      mode: modeDecision.recommendedMode,
      depth: this.calculateDepth(presence, wisdomSynthesis),
      wisdomSources: {
        witnessing: true,
        consciousness: !!wisdomSynthesis.consciousnessEnhancement,
        elemental: !!wisdomSynthesis.elementalWisdom,
        anamnesis: !!wisdomSynthesis.anamnesisRecall,
        knowledge: !!wisdomSynthesis.knowledgeDepth
      },
      tracking: this.buildTracking(sessionContext),
      metadata: this.buildMetadata(modeDecision, wisdomSynthesis)
    };

    // Track AI response
    this.contextManager.createAITurn(response.message, 'maya', Date.now() - turn.timestamp.getTime());

    return response;
  }

  /**
   * Synthesize wisdom from all available layers
   */
  private async synthesizeWisdom(
    input: string,
    presence: any,
    mode: EngagementMode,
    sessionContext: any
  ): Promise<WisdomSynthesis> {
    const synthesis: WisdomSynthesis = {
      witnessingBase: ''
    };

    // 1. WITNESSING FOUNDATION (always active)
    try {
      const witnessingResponse = this.witnessingCore.generateWitnessingResponse(input, presence);
      synthesis.witnessingBase = witnessingResponse.reflection;
    } catch (e) {
      console.warn('Witnessing core failed, using fallback:', e);
      synthesis.witnessingBase = this.generateFallbackWitnessing(input, presence);
    }

    // 2. CONSCIOUSNESS INTELLIGENCE ENHANCEMENT (Claude-level wisdom)
    try {
      const consciousnessResult = await this.consciousnessManager.shapeText(input, {
        temperature: 0.85,
        maxTokens: 200,
        systemRole: 'sacred_witness',
        preserveIntent: true,
        contextWindow: sessionContext,
        baseResponse: synthesis.witnessingBase
      });

      if (consciousnessResult.success) {
        synthesis.consciousnessEnhancement = consciousnessResult.shaped;
      }
    } catch (e) {
      console.warn('Consciousness enhancement failed:', e);
    }

    // 3. ELEMENTAL ORACLE WISDOM (archetypal streams)
    try {
      const elementalTendency = this.detectElementalTendency(input, presence);
      const elementalWisdom = await this.elementalOracle.getElementalWisdom(
        input,
        elementalTendency,
        mode
      );

      if (elementalWisdom) {
        synthesis.elementalWisdom = elementalWisdom;
      }
    } catch (e) {
      console.warn('Elemental oracle failed:', e);
    }

    // 4. ANAMNESIS DEEP RECALL (wisdom memory)
    try {
      // Check if user is seeking wisdom
      const seekingWisdom = this.detectWisdomSeeking(input);

      // Generate anamnesis response using the correct method
      const anamnesisResponse = this.anamnesisLayer.generateAnamnesisResponse(
        input,
        presence,
        seekingWisdom
      );

      if (anamnesisResponse && anamnesisResponse.inquiry) {
        synthesis.anamnesisRecall = anamnesisResponse.inquiry;
      }
    } catch (e) {
      console.warn('Anamnesis layer failed:', e);
    }

    // 5. KNOWLEDGE INTEGRATION (Obsidian depth)
    try {
      // This would integrate with Obsidian knowledge base
      // For now, we'll use conversation analytics for contextual knowledge
      const analytics = this.contextManager.getAnalytics();
      if (analytics && analytics.topThemes && analytics.topThemes.length > 0) {
        const topTheme = analytics.topThemes[0];
        // Only add theme connection if it's relevant and not repetitive
        if (topTheme.count > 2 && Math.random() > 0.7) {
          // Vary the phrasing to avoid repetition
          const phrasings = [
            `This relates to what we've been exploring about ${topTheme.name}.`,
            `I notice this connects with ${topTheme.name}.`,
            `There's a thread here with ${topTheme.name}.`,
            `This touches on ${topTheme.name} in a new way.`
          ];
          synthesis.knowledgeDepth = phrasings[Math.floor(Math.random() * phrasings.length)];
        }
      }
    } catch (e) {
      console.warn('Knowledge integration failed:', e);
    }

    return synthesis;
  }

  /**
   * Unify all wisdom streams into Maya's voice
   */
  private unifyWisdomStreams(synthesis: WisdomSynthesis, mode: EngagementMode): string {
    // Start with witnessing foundation
    let unifiedMessage = synthesis.witnessingBase;

    // Layer in consciousness enhancement if available
    if (synthesis.consciousnessEnhancement) {
      // Don't replace - enhance
      unifiedMessage = this.blendWisdom(unifiedMessage, synthesis.consciousnessEnhancement, 0.4);
    }

    // Weave in elemental wisdom
    if (synthesis.elementalWisdom) {
      unifiedMessage = this.weaveElementalWisdom(unifiedMessage, synthesis.elementalWisdom);
    }

    // Integrate anamnesis recall
    if (synthesis.anamnesisRecall) {
      unifiedMessage = this.integrateRecall(unifiedMessage, synthesis.anamnesisRecall, mode);
    }

    // Add knowledge depth if relevant
    if (synthesis.knowledgeDepth) {
      unifiedMessage = this.addKnowledgeDepth(unifiedMessage, synthesis.knowledgeDepth);
    }

    // Ensure response maintains Maya's voice
    return this.ensureMayaVoice(unifiedMessage, mode);
  }

  /**
   * Blend two wisdom streams intelligently
   */
  private blendWisdom(base: string, enhancement: string, weight: number): string {
    // If enhancement is significantly different and valuable, integrate it
    if (enhancement.length > 50 && !enhancement.includes(base.substring(0, 20))) {
      // Add as expansion rather than replacement
      return `${base} ${enhancement}`;
    }

    // If enhancement refines the base, use the enhancement
    if (enhancement.includes('witness') || enhancement.includes('notice') || enhancement.includes('hear')) {
      return enhancement;
    }

    // Default to base if enhancement doesn't add value
    return base;
  }

  /**
   * Weave elemental wisdom into response
   */
  private weaveElementalWisdom(base: string, elemental: string): string {
    // Elemental wisdom often provides archetypal perspective
    if (elemental.includes('fire') || elemental.includes('transform')) {
      return `${base} There's a transformative energy here.`;
    }
    if (elemental.includes('water') || elemental.includes('flow')) {
      return `${base} I feel the emotional current in this.`;
    }
    if (elemental.includes('earth') || elemental.includes('ground')) {
      return `${base} Let's ground this in what's real.`;
    }
    if (elemental.includes('air') || elemental.includes('clarity')) {
      return `${base} There's clarity wanting to emerge.`;
    }
    return base;
  }

  /**
   * Integrate anamnesis recall
   */
  private integrateRecall(base: string, recall: string, mode: EngagementMode): string {
    if (mode === 'reflecting' || mode === 'counseling') {
      return `${base} This reminds me of what you shared about ${recall}.`;
    }
    return base;
  }

  /**
   * Add knowledge depth where appropriate
   */
  private addKnowledgeDepth(base: string, knowledge: string): string {
    // Only add if it truly deepens the response
    if (knowledge.length > 30 && !base.includes(knowledge.substring(0, 15))) {
      return `${base} ${knowledge}`;
    }
    return base;
  }

  /**
   * Ensure response maintains Maya's authentic voice
   */
  private ensureMayaVoice(message: string, mode: EngagementMode): string {
    // Remove any therapeutic language
    message = message.replace(/you should|you must|you need to/gi, 'you might consider');

    // Ensure witnessing presence
    if (!message.includes('witness') && !message.includes('notice') && !message.includes('hear') && !message.includes('see')) {
      message = `I'm here with what you're sharing. ${message}`;
    }

    // Maintain sacred space
    if (mode === 'witnessing' && message.length < 50) {
      message += ' What else is present?';
    }

    return message;
  }

  /**
   * Calculate response depth based on all factors
   */
  private calculateDepth(presence: any, synthesis: WisdomSynthesis): number {
    let depth = presence.depth || 0.3;

    // Each active wisdom layer adds depth
    if (synthesis.consciousnessEnhancement) depth += 0.15;
    if (synthesis.elementalWisdom) depth += 0.10;
    if (synthesis.anamnesisRecall) depth += 0.10;
    if (synthesis.knowledgeDepth) depth += 0.05;

    return Math.min(depth, 1.0);
  }

  /**
   * Detect if user is seeking wisdom
   */
  private detectWisdomSeeking(input: string): boolean {
    const wisdomIndicators = [
      'what should i', 'what do i', 'how can i', 'why do i',
      'help me', 'I don\'t know', 'confused', 'lost', 'stuck',
      'advice', 'guide', 'wisdom', 'truth', 'understand',
      'meaning', 'purpose', 'should', 'right', 'wrong'
    ];

    const lower = input.toLowerCase();
    return wisdomIndicators.some(indicator => lower.includes(indicator));
  }

  /**
   * Detect elemental tendency in input
   */
  private detectElementalTendency(input: string, presence: any): string {
    const lower = input.toLowerCase();

    if (lower.includes('passion') || lower.includes('anger') || lower.includes('transform')) {
      return 'fire';
    }
    if (lower.includes('feel') || lower.includes('emotion') || lower.includes('flow')) {
      return 'water';
    }
    if (lower.includes('practical') || lower.includes('real') || lower.includes('solid')) {
      return 'earth';
    }
    if (lower.includes('think') || lower.includes('idea') || lower.includes('understand')) {
      return 'air';
    }
    if (lower.includes('spirit') || lower.includes('consciousness') || lower.includes('unity')) {
      return 'aether';
    }

    // Default based on presence quality
    return presence.quality === 'emotional' ? 'water' : 'air';
  }

  /**
   * Build tracking information
   */
  private buildTracking(sessionContext: any): any {
    const analytics = this.engagementSystem.getAnalytics();
    return {
      elementalTendency: analytics.patterns.dominantElement,
      developmentalStage: analytics.patterns.developmentalStage,
      trustLevel: analytics.patterns.trustLevel,
      activePatterns: analytics.patterns.topThemes.map((t: any) => t.theme),
      coherenceLevel: sessionContext?.coherenceLevel || 0.5
    };
  }

  /**
   * Build metadata
   */
  private buildMetadata(modeDecision: any, synthesis: WisdomSynthesis): any {
    const metadata: any = {};

    if (modeDecision.confidence < 0.7 && modeDecision.alternativeModes.length > 0) {
      metadata.suggestedMode = modeDecision.alternativeModes[0];
    }

    // Track which wisdom layers were active
    metadata.wisdomLayers = [];
    if (synthesis.witnessingBase) metadata.wisdomLayers.push('witnessing');
    if (synthesis.consciousnessEnhancement) metadata.wisdomLayers.push('consciousness');
    if (synthesis.elementalWisdom) metadata.wisdomLayers.push('elemental');
    if (synthesis.anamnesisRecall) metadata.wisdomLayers.push('anamnesis');
    if (synthesis.knowledgeDepth) metadata.wisdomLayers.push('knowledge');

    return metadata;
  }

  /**
   * Fallback witnessing response
   */
  private generateFallbackWitnessing(input: string, presence: any): string {
    const responses = [
      "I'm here with what you're sharing.",
      "I witness this with you.",
      "I'm receiving what you're bringing forward.",
      "Something important is present here.",
      "I'm listening to what wants to emerge."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}