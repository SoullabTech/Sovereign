/**
 * Agent Orchestrator - Full End-to-End Implementation
 * Coordinates all agents, memory, and conversational intelligence
 */

import { EventEmitter } from 'events';
import { AgentRegistry } from '../core/orchestration/AgentRegistry';
import { OrchestrationEngine } from '../core/orchestration/OrchestrationEngine';
import { soulMemoryService } from './soulMemoryService';
import { memoryService } from './memoryService';
import { SesameService } from './SesameService';
import { VoiceJournalingService } from './VoiceJournalingService';
import { ComprehensiveSafetyService } from './ComprehensiveSafetyService';
import { singularityNETAgent } from './decentralized/SingularityNETAgent';
import { gaiaNetSoulAgent } from './decentralized/GaiaNetSoulAgent';
import { registerBardicAgent, shouldRouteToBard, witnessWithBard } from './agentOrchestrator-bard-integration';
import { registerKairosAgent, shouldRouteToKairos, coordinateAnimaAnimus } from './agentOrchestrator-kairos-integration';
import { registerShadowAgent, shouldRouteToShadow, coordinateTriad } from './agentOrchestrator-shadow-integration';
import { registerArchetypalTypologyAgent, shouldRouteToTypology, calibrateCommunication } from './agentOrchestrator-typology-integration';
import { logger } from '../utils/logger';

interface OrchestratorConfig {
  enableSafety?: boolean;
  enableMemory?: boolean;
  enableVoice?: boolean;
  enableDecentralized?: boolean;
  defaultElement?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
}

interface ConversationContext {
  userId: string;
  sessionId: string;
  element?: string;
  mode?: 'oracle' | 'maya' | 'retreat' | 'integration';
  history?: any[];
  metadata?: Record<string, any>;
}

interface OrchestratorResponse {
  success: boolean;
  response: string;
  agent?: string;
  element?: string;
  memoryId?: string;
  archetypes?: string[];
  emotionalTone?: any;
  safetyCheck?: any;
  metadata?: Record<string, any>;
}

export class AgentOrchestrator extends EventEmitter {
  private agentRegistry: AgentRegistry;
  private orchestrationEngine: OrchestrationEngine;
  private sesameService: SesameService;
  private voiceService: VoiceJournalingService;
  private safetyService: ComprehensiveSafetyService;
  private config: OrchestratorConfig;
  private isInitialized: boolean = false;

  constructor(config?: OrchestratorConfig) {
    super();
    
    this.config = {
      enableSafety: config?.enableSafety ?? true,
      enableMemory: config?.enableMemory ?? true,
      enableVoice: config?.enableVoice ?? true,
      enableDecentralized: config?.enableDecentralized ?? false,
      defaultElement: config?.defaultElement || 'aether'
    };

    this.initialize();
  }

  private async initialize() {
    try {
      // Initialize core services
      this.agentRegistry = new AgentRegistry();
      this.orchestrationEngine = new OrchestrationEngine();
      this.sesameService = new SesameService();
      this.voiceService = new VoiceJournalingService();
      this.safetyService = new ComprehensiveSafetyService();

      // Register all agents
      await this.registerAgents();
      
      this.isInitialized = true;
      logger.info('Agent Orchestrator initialized with full end-to-end integration');
      this.emit('initialized');
    } catch (error) {
      logger.error('Failed to initialize Agent Orchestrator:', error);
      throw error;
    }
  }

  private async registerAgents() {
    // Register all available agents from the registry
    const agents = [
      'maya', 'fire', 'water', 'earth', 'air',
      'shadow-worker', 'somatic-guide', 'crisis-support',
      'bard', 'kairos'
    ];

    for (const agentId of agents) {
      try {
        const agent = await this.agentRegistry.getAgent(agentId);
        if (agent) {
          logger.info(`Registered agent: ${agentId}`);
        }
      } catch (error) {
        logger.warn(`Could not register agent ${agentId}:`, error);
      }
    }

    // Register archetypal agents
    registerBardicAgent(this.agentRegistry);  // Anima - receptive, memory
    registerKairosAgent(this.agentRegistry);  // Animus - decisive, action
    registerShadowAgent(this.agentRegistry);  // Shadow - honest mirror
    registerArchetypalTypologyAgent(this.agentRegistry);  // Typology - Enneagram, MBTI, etc.
    logger.info('🎭 Archetypal Triad active: Bard (Anima) + Kairos (Animus) + Shadow (Mirror)');
    logger.info('🧬 ArchetypalTypology active: Enneagram, MBTI, Zodiac (inclusive integration)');
  }

  /**
   * Main entry point for processing queries with full integration
   */
  async processQuery(
    input: string, 
    context: ConversationContext
  ): Promise<OrchestratorResponse> {
    try {
      // 1. Safety Check First
      let safetyCheck;
      if (this.config.enableSafety) {
        safetyCheck = await this.safetyService.analyzeContent({
          content: input,
          userId: context.userId,
          context: 'user_input'
        });

        if (safetyCheck.requiresIntervention) {
          return this.handleSafetyIntervention(safetyCheck, context);
        }
      }

      // 2. Check for ArchetypalTypology (Enneagram, MBTI, etc.)
      // This enriches context with personality profile for all downstream agents
      if (shouldRouteToTypology(input, context)) {
        const typologyInsights = await this.processTypology(input, context);
        // Add personality insights to context for other agents to use
        if (typologyInsights) {
          context.personalityProfile = typologyInsights.personalityInsights?.profile;
        }
      }

      // 3. Check for Bardic invocation
      if (shouldRouteToBard(input, context)) {
        return this.processBardic(input, context);
      }

      // 4. Check for Shadow invocation or projection detection
      if (shouldRouteToShadow(input, context)) {
        return this.processShadow(input, context);
      }

      // 5. Check for Kairos invocation or intervention opportunity
      if (shouldRouteToKairos(input, context)) {
        return this.processKairos(input, context);
      }

      // 6. Check for archetypal triad coordination (Bard + Shadow + Kairos)
      if (context.bardicMemory?.projectionPatterns?.length > 0) {
        return this.processTriadCoordination(input, context);
      }

      // 7. Check for Bard + Kairos coordination (pattern → action)
      if (context.bardicMemory?.patternDetected?.readyForIntervention) {
        return this.processAnimaAnimusCoordination(input, context);
      }

      // 8. Determine best agent and element
      const { agent, element } = await this.selectAgentAndElement(input, context);

      // 4. Process with Sesame conversational intelligence
      const sesameEnhanced = await this.processThroughSesame(input, {
        ...context,
        agent,
        element
      });

      // 5. Generate response through selected agent
      const agentResponse = await this.processWithAgent(
        sesameEnhanced.input,
        agent,
        context
      );

      // 6. Silent witnessing with the Bard (background)
      await witnessWithBard(context.userId, input, {
        agentName: agent,
        element,
        affectValence: sesameEnhanced.emotionalTone?.valence,
        affectArousal: sesameEnhanced.emotionalTone?.arousal,
      });

      // 7. Store in memory if enabled
      let memoryId;
      if (this.config.enableMemory) {
        memoryId = await this.storeInteraction(
          input,
          agentResponse.response,
          context,
          {
            agent,
            element,
            archetypes: agentResponse.archetypes,
            emotionalTone: sesameEnhanced.emotionalTone
          }
        );
      }

      // 6. Post-process for sacred context
      const finalResponse = await this.addSacredContext(
        agentResponse.response,
        element,
        context
      );

      return {
        success: true,
        response: finalResponse,
        agent,
        element,
        memoryId,
        archetypes: agentResponse.archetypes,
        emotionalTone: sesameEnhanced.emotionalTone,
        safetyCheck,
        metadata: {
          processedAt: new Date().toISOString(),
          sesameEnhanced: true,
          decentralized: this.config.enableDecentralized
        }
      };

    } catch (error) {
      logger.error('Error in processQuery:', error);
      return this.handleError(error, context);
    }
  }

  /**
   * Process voice input through full pipeline
   */
  async processVoiceInput(
    audioBuffer: Buffer,
    context: ConversationContext
  ): Promise<OrchestratorResponse> {
    if (!this.config.enableVoice) {
      throw new Error('Voice processing not enabled');
    }

    try {
      // 1. Transcribe audio
      const transcription = await this.voiceService.transcribeAudio(audioBuffer);
      
      // 2. Process through main pipeline
      const response = await this.processQuery(transcription.text, context);
      
      // 3. Generate voice response
      const voiceResponse = await this.sesameService.generateSpeech(
        response.response,
        {
          voice: context.mode === 'maya' ? 'maya' : 'oracle',
          element: response.element
        }
      );

      return {
        ...response,
        metadata: {
          ...response.metadata,
          voiceEnabled: true,
          transcription: transcription.text,
          audioUrl: voiceResponse.url
        }
      };
    } catch (error) {
      logger.error('Error in voice processing:', error);
      throw error;
    }
  }

  /**
   * Get archetypal insights with full integration
   */
  async getArchetypalInsights(context: ConversationContext): Promise<any> {
    try {
      // 1. Retrieve user's memory patterns
      const memories = await soulMemoryService.getUserMemories(
        context.userId,
        { limit: 100 }
      );

      // 2. Analyze archetypal patterns
      const archetypes = await soulMemoryService.getActiveArchetypes(
        context.userId
      );

      // 3. Get collective insights from GaiaNet if enabled
      let collectiveInsights;
      if (this.config.enableDecentralized) {
        collectiveInsights = await gaiaNetSoulAgent.getCollectiveInsights(
          context.userId
        );
      }

      // 4. Generate synthesis through Maya
      const mayaAgent = await this.agentRegistry.getAgent('maya');
      const synthesis = await mayaAgent.process({
        type: 'archetypal_synthesis',
        memories: memories.slice(0, 10),
        archetypes,
        collectiveInsights
      });

      return {
        success: true,
        archetypes,
        synthesis: synthesis.response,
        patterns: archetypes.map(a => ({
          archetype: a.archetype,
          strength: a.patternStrength,
          lastActivated: a.lastActivated
        })),
        collectiveResonance: collectiveInsights?.resonanceMap,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error getting archetypal insights:', error);
      throw error;
    }
  }

  /**
   * Process journal entry through full pipeline
   */
  async processJournalEntry(
    content: string,
    context: ConversationContext
  ): Promise<OrchestratorResponse> {
    try {
      // 1. Analyze content for emotional tone and themes
      const analysis = await this.analyzeJournalContent(content);
      
      // 2. Store in memory with enhanced metadata
      const memory = await soulMemoryService.storeJournalEntry(
        context.userId,
        content,
        {
          element: analysis.element,
          spiralPhase: analysis.spiralPhase,
          shadowContent: analysis.shadowAspects
        }
      );

      // 3. Generate reflective response
      const response = await this.generateReflection(content, analysis, context);

      return {
        success: true,
        response: response.text,
        agent: 'maya',
        element: analysis.element,
        memoryId: memory.id,
        archetypes: analysis.archetypes,
        emotionalTone: analysis.emotionalTone,
        metadata: {
          journalAnalysis: analysis,
          stored: true
        }
      };
    } catch (error) {
      logger.error('Error processing journal entry:', error);
      throw error;
    }
  }

  /**
   * Process Bardic invocation
   */
  private async processBardic(
    input: string,
    context: ConversationContext
  ): Promise<OrchestratorResponse> {
    try {
      const bard = await this.agentRegistry.getAgent('bard');
      const response = await bard.processQuery(input, context);

      return {
        success: true,
        response: response.content || response.response,
        agent: 'bard',
        element: 'aether',
        archetypes: ['memory-keeper', 'witness', 'anima'],
        metadata: {
          ...response.metadata,
          bardicInvocation: true,
          processedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('Error processing Bardic query:', error);
      return this.handleError(error, context);
    }
  }

  /**
   * Process Shadow invocation or projection reflection
   */
  private async processShadow(
    input: string,
    context: ConversationContext
  ): Promise<OrchestratorResponse> {
    try {
      const shadow = await this.agentRegistry.getAgent('shadow');
      const response = await shadow.processQuery(input, context);

      // If Shadow deferred, route to suggested archetype
      if (response.deferred) {
        logger.info(`Shadow deferred to ${response.suggestedAgent}: ${response.reasoning}`);
        return this.processWithAgent(input, response.suggestedAgent, context);
      }

      // If no shadow activation (no projection detected)
      if (!response.shadowActivated) {
        logger.info('Shadow checked - no projection detected, routing to default agent');
        return this.processWithAgent(input, context.element || 'maya', context);
      }

      // Shadow reflection
      return {
        success: true,
        response: response.content || response.response,
        agent: 'shadow',
        element: 'shadow', // Shadow transcends elements
        archetypes: ['shadow', 'honest-mirror', 'integration'],
        metadata: {
          ...response.metadata,
          shadowActivated: true,
          processedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('Error processing Shadow query:', error);
      return this.handleError(error, context);
    }
  }

  /**
   * Process Kairos invocation or intervention
   */
  private async processKairos(
    input: string,
    context: ConversationContext
  ): Promise<OrchestratorResponse> {
    try {
      const kairos = await this.agentRegistry.getAgent('kairos');
      const response = await kairos.processQuery(input, context);

      // If Kairos deferred, route to suggested archetype
      if (response.deferred) {
        logger.info(`Kairos deferred to ${response.suggestedAgent}: ${response.reasoning}`);
        return this.processWithAgent(input, response.suggestedAgent, context);
      }

      // If consultation requested, flag for human review
      if (response.consultationRequested) {
        logger.warn('⚡ Kairos consultation requested');
        return {
          success: true,
          response: response.content,
          agent: 'kairos',
          element: 'fire',
          archetypes: ['animus', 'kairos', 'decision-maker'],
          metadata: {
            ...response.metadata,
            consultationNeeded: true,
            processedAt: new Date().toISOString()
          }
        };
      }

      // Normal Kairos intervention
      return {
        success: true,
        response: response.content || response.response,
        agent: 'kairos',
        element: 'fire',
        archetypes: ['animus', 'kairos', 'decision-maker'],
        metadata: {
          ...response.metadata,
          kairosIntervention: true,
          animusActivated: true,
          processedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('Error processing Kairos query:', error);
      return this.handleError(error, context);
    }
  }

  /**
   * Process ArchetypalTypology (Enneagram, MBTI, Zodiac)
   */
  private async processTypology(
    input: string,
    context: ConversationContext
  ): Promise<any> {
    try {
      logger.info('🧬 Processing ArchetypalTypology query');

      const typology = await this.agentRegistry.getAgent('archetypal-typology');
      const response = await typology.processQuery(input, context);

      // If just enriching context (not explicit typology query), return null
      if (!response) {
        return null;
      }

      // If explicit typology query, return full response
      return {
        success: true,
        response: this.formatTypologyResponse(response),
        agent: 'archetypal-typology',
        element: 'typology',
        archetypes: response.archetypeMapping?.active || [],
        metadata: {
          ...response,
          typologyProcessed: true,
          processedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('Error processing ArchetypalTypology query:', error);
      return null; // Don't block if typology processing fails
    }
  }

  /**
   * Format typology response for user
   */
  private formatTypologyResponse(typologyData: any): string {
    const { personalityInsights } = typologyData;

    if (!personalityInsights) {
      return "I've noted your personality framework. This helps me understand how to communicate with you most effectively.";
    }

    const profile = personalityInsights.profile;
    const guidance = personalityInsights.communicationGuidance;
    const archetypes = personalityInsights.archetypeMapping;
    const growth = personalityInsights.growthPath;

    let response = '';

    // Acknowledge their type
    if (profile.enneagram) {
      response += `Enneagram Type ${profile.enneagram.type}`;
      if (profile.enneagram.wing) {
        response += ` ${profile.enneagram.wing}`;
      }
      if (profile.enneagram.instinct) {
        response += ` (${profile.enneagram.instinct} instinct)`;
      }
      response += ' - ';
    } else if (profile.mbti) {
      response += `MBTI ${profile.mbti.type} - `;
    }

    // Add archetypal mapping
    if (archetypes?.active?.length > 0) {
      response += `The ${archetypes.active.join(', ')} archetype${archetypes.active.length > 1 ? 's' : ''}.\n\n`;
    }

    // Add growth path if available
    if (growth) {
      response += `Current stage: ${growth.currentStage}\n`;
      response += `Growth edge: ${growth.nextStage}\n`;
      response += `Support: ${growth.support}`;
    }

    return response || "I've noted your personality framework.";
  }

  /**
   * Process Archetypal Triad coordination (Bard + Shadow + Kairos)
   */
  private async processTriadCoordination(
    input: string,
    context: ConversationContext
  ): Promise<OrchestratorResponse> {
    try {
      logger.info('🎭 Coordinating Archetypal Triad: Bard + Shadow + Kairos');

      const coordination = await coordinateTriad({
        userId: context.userId,
        currentMessage: input,
        bardicMemory: context.bardicMemory
      });

      // If no archetypes activated, continue to default routing
      if (coordination.archetypes.length === 0) {
        logger.info('Triad checked - no coordination needed, routing to default');
        return this.processWithAgent(input, context.element || 'maya', context);
      }

      return {
        success: true,
        response: coordination.response,
        agent: coordination.archetypes.join('+'),
        element: 'archetypal-triad', // Transcends individual elements
        archetypes: coordination.archetypes,
        metadata: {
          triadCoordination: true,
          bardContribution: coordination.coordination?.bardContribution,
          shadowContribution: coordination.coordination?.shadowContribution,
          kairosContribution: coordination.coordination?.kairosContribution,
          processedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('Error in Archetypal Triad coordination:', error);
      return this.handleError(error, context);
    }
  }

  /**
   * Process Anima + Animus coordination (Bard + Kairos together)
   */
  private async processAnimaAnimusCoordination(
    input: string,
    context: ConversationContext
  ): Promise<OrchestratorResponse> {
    try {
      logger.info('🎭 Coordinating Anima (Bard) + Animus (Kairos)');

      const coordination = await coordinateAnimaAnimus({
        userId: context.userId,
        currentMessage: input,
        bardicMemory: context.bardicMemory
      });

      return {
        success: true,
        response: coordination.response,
        agent: coordination.archetype === 'both' ? 'bard+kairos' : coordination.archetype,
        element: coordination.archetype === 'both' ? 'fire' : 'aether',
        archetypes: ['anima', 'animus', 'bard', 'kairos'],
        metadata: {
          animaAnimusCoordination: true,
          bardContribution: coordination.coordination?.bardContribution,
          kairosContribution: coordination.coordination?.kairosContribution,
          processedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('Error in Anima-Animus coordination:', error);
      return this.handleError(error, context);
    }
  }

  // ===============================================
  // HELPER METHODS
  // ===============================================

  private async selectAgentAndElement(
    input: string,
    context: ConversationContext
  ): Promise<{ agent: string; element: string }> {
    // Use orchestration engine to select best agent
    const selection = await this.orchestrationEngine.selectAgent({
      input,
      context,
      availableAgents: await this.agentRegistry.getAvailableAgents()
    });

    return {
      agent: selection.agentId || 'maya',
      element: selection.element || context.element || this.config.defaultElement!
    };
  }

  private async processThroughSesame(
    input: string,
    context: any
  ): Promise<any> {
    try {
      const enhanced = await this.sesameService.enhanceInput({
        text: input,
        context
      });
      
      return {
        input: enhanced.text || input,
        emotionalTone: enhanced.emotionalAnalysis,
        intent: enhanced.intent
      };
    } catch (error) {
      logger.warn('Sesame enhancement failed, using original input:', error);
      return { input, emotionalTone: null };
    }
  }

  private async processWithAgent(
    input: string,
    agentId: string,
    context: ConversationContext
  ): Promise<any> {
    try {
      // Try decentralized first if enabled
      if (this.config.enableDecentralized && Math.random() > 0.5) {
        const response = await singularityNETAgent.generateMayaResponse(
          input,
          JSON.stringify(context)
        );
        return { response, archetypes: [] };
      }

      // Fallback to local agent
      const agent = await this.agentRegistry.getAgent(agentId);
      if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
      }

      return await agent.process({ input, context });
    } catch (error) {
      logger.error(`Agent ${agentId} processing failed:`, error);
      // Fallback response
      return {
        response: "I'm here to support your journey. Let's explore this together.",
        archetypes: []
      };
    }
  }

  private async storeInteraction(
    input: string,
    response: string,
    context: ConversationContext,
    metadata: any
  ): Promise<string> {
    try {
      const memory = await memoryService.addMemory({
        userId: context.userId,
        content: JSON.stringify({ input, response }),
        type: 'conversation',
        metadata: {
          sessionId: context.sessionId,
          ...metadata
        }
      });

      // Also store in GaiaNet if enabled
      if (this.config.enableDecentralized) {
        await gaiaNetSoulAgent.storeSoulMemory(
          context.userId,
          `${input}\n\nResponse: ${response}`,
          'oracle',
          metadata
        );
      }

      return memory.id;
    } catch (error) {
      logger.error('Failed to store interaction:', error);
      return '';
    }
  }

  private async addSacredContext(
    response: string,
    element: string,
    context: ConversationContext
  ): Promise<string> {
    // Add elemental blessing if in sacred mode
    if (context.mode === 'oracle' || context.mode === 'retreat') {
      const blessings = {
        fire: '\n\n🔥 *May your inner fire illuminate the path ahead.*',
        water: '\n\n💧 *May you flow with the currents of transformation.*',
        earth: '\n\n🌍 *May you find grounding in your eternal essence.*',
        air: '\n\n💨 *May clarity of mind bring you peace.*',
        aether: '\n\n✨ *May you touch the infinite within.*'
      };
      
      return response + (blessings[element as keyof typeof blessings] || '');
    }
    
    return response;
  }

  private async handleSafetyIntervention(
    safetyCheck: any,
    context: ConversationContext
  ): Promise<OrchestratorResponse> {
    const crisisAgent = await this.agentRegistry.getAgent('crisis-support');
    const response = await crisisAgent.process({
      type: 'crisis_intervention',
      safetyCheck,
      context
    });

    return {
      success: true,
      response: response.response,
      agent: 'crisis-support',
      element: 'water', // Compassionate element
      safetyCheck,
      metadata: {
        interventionRequired: true,
        resources: response.resources
      }
    };
  }

  private async analyzeJournalContent(content: string): Promise<any> {
    // Analyze journal for themes, emotions, and archetypes
    const analysis = {
      element: this.detectElement(content),
      spiralPhase: this.detectSpiralPhase(content),
      archetypes: this.detectArchetypes(content),
      shadowAspects: this.detectShadowContent(content),
      emotionalTone: await this.analyzeEmotionalTone(content)
    };

    return analysis;
  }

  private detectElement(content: string): string {
    const lower = content.toLowerCase();
    if (lower.includes('passion') || lower.includes('energy')) return 'fire';
    if (lower.includes('emotion') || lower.includes('feel')) return 'water';
    if (lower.includes('ground') || lower.includes('stable')) return 'earth';
    if (lower.includes('think') || lower.includes('clarity')) return 'air';
    return 'aether';
  }

  private detectSpiralPhase(content: string): string {
    const lower = content.toLowerCase();
    if (lower.includes('lost') || lower.includes('dark')) return 'descent';
    if (lower.includes('transform')) return 'integration';
    if (lower.includes('breakthrough')) return 'illumination';
    return 'integration';
  }

  private detectArchetypes(content: string): string[] {
    const archetypes: string[] = [];
    const lower = content.toLowerCase();
    
    if (lower.includes('shadow') || lower.includes('dark')) archetypes.push('shadow');
    if (lower.includes('wise') || lower.includes('wisdom')) archetypes.push('sage');
    if (lower.includes('journey') || lower.includes('quest')) archetypes.push('hero');
    if (lower.includes('transform')) archetypes.push('magician');
    
    return archetypes;
  }

  private detectShadowContent(content: string): string | undefined {
    const lower = content.toLowerCase();
    if (lower.includes('fear') || lower.includes('shadow') || lower.includes('dark')) {
      return 'Shadow work opportunity detected';
    }
    return undefined;
  }

  private async analyzeEmotionalTone(content: string): Promise<any> {
    if (this.config.enableDecentralized) {
      return await singularityNETAgent.analyzeSentiment(content);
    }
    
    // Simple fallback
    return {
      sentiment: 'neutral',
      score: 0.5
    };
  }

  private async generateReflection(
    content: string,
    analysis: any,
    context: ConversationContext
  ): Promise<{ text: string }> {
    const mayaAgent = await this.agentRegistry.getAgent('maya');
    const response = await mayaAgent.process({
      type: 'reflection',
      content,
      analysis,
      context
    });

    return { text: response.response };
  }

  private handleError(error: any, context: ConversationContext): OrchestratorResponse {
    logger.error('Orchestrator error:', error);
    
    return {
      success: false,
      response: "I encountered a moment of stillness. Let's take a breath together and try again.",
      metadata: {
        error: error.message,
        fallback: true
      }
    };
  }

  /**
   * Health check for all integrated systems
   */
  async checkHealth(): Promise<{
    status: string;
    services: Record<string, boolean>;
  }> {
    const services: Record<string, boolean> = {};
    
    try {
      // Check each service
      services.orchestration = this.isInitialized;
      services.memory = await memoryService.checkConnection();
      services.safety = true; // Safety service is always available
      services.sesame = await this.sesameService.checkHealth();
      
      if (this.config.enableDecentralized) {
        const snetHealth = await singularityNETAgent.checkHealth();
        services.singularitynet = snetHealth.status === 'healthy';
        services.gaianet = gaiaNetSoulAgent.isConnected;
      }
      
      const allHealthy = Object.values(services).every(s => s);
      
      return {
        status: allHealthy ? 'healthy' : 'degraded',
        services
      };
    } catch (error) {
      logger.error('Health check failed:', error);
      return {
        status: 'error',
        services
      };
    }
  }
}

// Export singleton with full configuration
export const agentOrchestrator = new AgentOrchestrator({
  enableSafety: true,
  enableMemory: true,
  enableVoice: true,
  enableDecentralized: process.env.ENABLE_DECENTRALIZED === 'true',
  defaultElement: 'aether'
});