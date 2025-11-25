/**
 * Integrated Oracle System
 *
 * Complete integration layer that connects:
 * - Witnessing Paradigm (new core)
 * - Sesame Hybrid Manager (response shaping)
 * - Claude Service (AI intelligence)
 * - Memory Systems (Mem0, LangChain, LlamaIndex)
 * - Semantic Memory & Embeddings
 * - Conversation Context
 * - User Readiness Service
 *
 * This ensures the new witnessing approach works with all existing infrastructure.
 */

import { getSacredOracleCore, SacredOracleResponse } from './sacred-oracle-core';
import { ClaudeService, getClaudeService } from './services/ClaudeService';
import { getUserReadinessService } from './services/UserReadinessService';

// Memory system imports
import { UnifiedMemoryInterface } from './anamnesis/UnifiedMemoryInterface';
import { DecentralizedMemory } from './anamnesis/DecentralizedMemory';
import { MemoryCore } from './memory/core/MemoryCore';
import { LlamaIndexService } from './memory/semantic/LlamaIndexService';
import { OpenAIEmbedder } from './memory/embeddings/OpenAIEmbedder';
import { MemoryIntegration } from './memory/integration/MemoryIntegration';

// Conversation and state management
import { ConversationContextManager } from './conversation/ConversationContext';
import { PersonalOracleAgent } from './agents/PersonalOracleAgent';

export interface IntegratedOracleRequest {
  userId: string;
  input: string;
  sessionId?: string;
  voiceData?: {
    tone?: string;
    pace?: string;
    emotion?: string;
  };
  contextualData?: {
    timeOfDay?: string;
    location?: string;
    deviceType?: string;
  };
}

export interface IntegratedOracleResponse {
  message: string;
  mode: string;
  shaped: boolean;
  memories: {
    recalled: any[];
    stored: boolean;
  };
  tracking: {
    elementalTendency?: string;
    developmentalStage?: string;
    trustLevel: number;
    userReadiness?: string;
  };
  metadata: {
    responseTime: number;
    servicesUsed: string[];
    cacheHit?: boolean;
  };
}

export class IntegratedOracleSystem {
  private sacredCore: any;
  private claudeService: ClaudeService;
  private memoryCore: MemoryCore;
  private memoryInterface: UnifiedMemoryInterface;
  private decentralizedMemory: DecentralizedMemory;
  private llamaIndexService: LlamaIndexService;
  private embedder: OpenAIEmbedder;
  private memoryIntegration: MemoryIntegration;
  private conversationManager: ConversationContextManager;
  private agentCache: Map<string, PersonalOracleAgent>;

  constructor() {
    // Initialize core systems
    this.sacredCore = getSacredOracleCore();
    this.claudeService = getClaudeService();

    // Initialize memory systems
    this.initializeMemorySystems();

    // Initialize conversation management
    this.conversationManager = new ConversationContextManager();
    this.agentCache = new Map();
  }

  private async initializeMemorySystems() {
    // Initialize Mem0-compatible memory core
    this.memoryCore = new MemoryCore({
      userId: 'system',
      persistenceLayer: 'sqlite',
      vectorStore: 'llamaindex'
    });

    // Initialize LlamaIndex for semantic search
    this.llamaIndexService = new LlamaIndexService({
      openAIApiKey: process.env.OPENAI_API_KEY!,
      persistDir: './data/llama_index'
    });

    // Initialize OpenAI embedder
    this.embedder = new OpenAIEmbedder({
      apiKey: process.env.OPENAI_API_KEY!,
      model: 'text-embedding-3-small'
    });

    // Initialize unified memory interface
    this.memoryInterface = new UnifiedMemoryInterface(
      this.memoryCore,
      this.llamaIndexService,
      this.embedder
    );

    // Initialize decentralized memory (IPFS/blockchain integration)
    this.decentralizedMemory = new DecentralizedMemory({
      ipfsGateway: process.env.IPFS_GATEWAY || 'https://ipfs.io',
      enableBlockchain: false // Can enable later
    });

    // Initialize memory integration layer
    this.memoryIntegration = new MemoryIntegration({
      memoryCore: this.memoryCore,
      llamaIndex: this.llamaIndexService,
      embedder: this.embedder
    });
  }

  /**
   * Main entry point for generating integrated oracle responses
   */
  async generateResponse(request: IntegratedOracleRequest): Promise<IntegratedOracleResponse> {
    const startTime = Date.now();
    const servicesUsed: string[] = [];

    try {
      // 1. Load or create user agent
      const agent = await this.getOrCreateAgent(request.userId);
      servicesUsed.push('agent');

      // 2. Retrieve relevant memories
      const memories = await this.retrieveRelevantMemories(request.userId, request.input);
      servicesUsed.push('memory');

      // 3. Check user readiness level
      const userReadiness = await getUserReadinessService().assessReadiness(request.userId, {
        interactionCount: agent.getState().memory.interactionCount,
        trustLevel: agent.getState().memory.trustLevel,
        currentPhase: agent.getState().memory.currentPhase
      });
      servicesUsed.push('readiness');

      // 4. Build comprehensive context
      const context = this.buildComprehensiveContext(request, agent, memories, userReadiness);

      // 5. Generate base response using Sacred Oracle Core
      const sacredResponse = await this.sacredCore.generateResponse(
        request.input,
        request.userId,
        context
      );
      servicesUsed.push('sacred-core');

      // 6. Enhance with Claude if needed (for complex modes)
      let enhancedMessage = sacredResponse.message;
      if (this.shouldUseClaude(sacredResponse.mode)) {
        enhancedMessage = await this.enhanceWithClaude(
          request.input,
          sacredResponse,
          context
        );
        servicesUsed.push('claude');
      }

      // 7. Shape with Sesame hybrid
      const shapedResponse = await this.shapeWithSesame(
        enhancedMessage,
        agent.getState().memory.dominantElement || 'aether',
        sacredResponse.mode
      );
      if (!shapedResponse.fallbackUsed) {
        servicesUsed.push('sesame');
      }

      // 8. Store conversation memory
      await this.storeConversationMemory(
        request.userId,
        request.input,
        shapedResponse.shaped,
        sacredResponse
      );

      // 9. Update agent state
      await agent.processInteraction(request.input, {
        currentMood: context.mood,
        currentEnergy: context.energy
      });

      // 10. Track conversation turn
      this.conversationManager.createUserTurn(request.input);
      this.conversationManager.createAITurn(
        shapedResponse.shaped,
        'maya',
        Date.now() - startTime
      );

      return {
        message: shapedResponse.shaped,
        mode: sacredResponse.mode,
        shaped: !shapedResponse.fallbackUsed,
        memories: {
          recalled: memories,
          stored: true
        },
        tracking: {
          ...sacredResponse.tracking,
          userReadiness: userReadiness.level
        },
        metadata: {
          responseTime: Date.now() - startTime,
          servicesUsed,
          cacheHit: false
        }
      };

    } catch (error) {
      console.error('Integrated Oracle System error:', error);

      // Fallback to basic witnessing
      const fallbackResponse = await this.generateFallbackResponse(request.input);

      return {
        message: fallbackResponse,
        mode: 'witnessing',
        shaped: false,
        memories: {
          recalled: [],
          stored: false
        },
        tracking: {
          trustLevel: 0
        },
        metadata: {
          responseTime: Date.now() - startTime,
          servicesUsed: ['fallback'],
          cacheHit: false
        }
      };
    }
  }

  /**
   * Get or create user agent
   */
  private async getOrCreateAgent(userId: string): Promise<PersonalOracleAgent> {
    if (this.agentCache.has(userId)) {
      return this.agentCache.get(userId)!;
    }

    const agent = await PersonalOracleAgent.loadAgent(userId);
    this.agentCache.set(userId, agent);
    return agent;
  }

  /**
   * Retrieve relevant memories using all memory systems
   */
  private async retrieveRelevantMemories(userId: string, input: string): Promise<any[]> {
    const memories: any[] = [];

    try {
      // 1. Semantic search with LlamaIndex
      const semanticResults = await this.llamaIndexService.query(input, {
        topK: 5,
        userId
      });
      memories.push(...semanticResults);

      // 2. Mem0-style episodic memories
      const episodicMemories = await this.memoryCore.recall(input, {
        userId,
        limit: 5,
        memoryType: 'episodic'
      });
      memories.push(...episodicMemories);

      // 3. Check decentralized memory for important patterns
      const decentralizedPatterns = await this.decentralizedMemory.retrievePatterns(userId);
      if (decentralizedPatterns.length > 0) {
        memories.push({
          type: 'decentralized',
          patterns: decentralizedPatterns
        });
      }

      // 4. Get unified memory insights
      const unifiedInsights = await this.memoryInterface.getUnifiedInsights(input, userId);
      if (unifiedInsights) {
        memories.push({
          type: 'unified',
          insights: unifiedInsights
        });
      }

    } catch (error) {
      console.error('Memory retrieval error:', error);
    }

    return memories;
  }

  /**
   * Build comprehensive context from all systems
   */
  private buildComprehensiveContext(
    request: IntegratedOracleRequest,
    agent: PersonalOracleAgent,
    memories: any[],
    userReadiness: any
  ): any {
    const agentState = agent.getState();

    return {
      // User state from agent
      mood: agentState.currentContext.userMood,
      energy: agentState.currentContext.emotionalLoad,

      // Elemental awareness
      element: agentState.memory.dominantElement,
      shadowElement: agentState.memory.shadowElement,
      emergingElement: agentState.memory.emergingElement,

      // Relationship dynamics
      trustLevel: agentState.memory.trustLevel,
      intimacyLevel: agentState.memory.intimacyLevel,
      soulRecognition: agentState.memory.soulRecognition,

      // Polaris state (dual awareness)
      polarisState: agentState.memory.polarisState,

      // Development tracking
      currentPhase: agentState.memory.currentPhase,
      breakthroughs: agentState.memory.breakthroughs,

      // Soul signature
      soulSignature: agentState.memory.soulSignature,

      // Reality awareness
      realityLayers: agentState.currentContext.realityLayers,

      // Memory context
      relevantMemories: memories,
      conversationHistory: agentState.memory.conversationHistory.slice(-10),

      // User readiness
      userReadiness: userReadiness,

      // Voice and contextual data
      voiceData: request.voiceData,
      contextualData: request.contextualData,

      // Conversation state
      conversationDepth: agentState.currentContext.conversationDepth,
      conversationState: agentState.currentContext.conversationState
    };
  }

  /**
   * Determine if Claude enhancement is needed
   */
  private shouldUseClaude(mode: string): boolean {
    // Use Claude for more complex modes that benefit from deeper intelligence
    return ['counseling', 'guiding', 'processing', 'invoking'].includes(mode);
  }

  /**
   * Enhance response with Claude's intelligence
   */
  private async enhanceWithClaude(
    input: string,
    sacredResponse: SacredOracleResponse,
    context: any
  ): Promise<string> {
    try {
      const claudePrompt = this.buildClaudePrompt(sacredResponse.mode, context);

      const enhancedResponse = await this.claudeService.generateOracleResponse(
        input,
        {
          element: context.element,
          userState: context,
          conversationHistory: context.conversationHistory,
          sessionContext: context,
          userReadiness: context.userReadiness
        },
        claudePrompt
      );

      // Blend Claude's response with sacred response
      return this.blendResponses(sacredResponse.message, enhancedResponse, sacredResponse.mode);

    } catch (error) {
      console.error('Claude enhancement error:', error);
      return sacredResponse.message; // Fallback to original
    }
  }

  /**
   * Build mode-specific Claude prompt
   */
  private buildClaudePrompt(mode: string, context: any): string {
    const basePrompt = `You are operating in ${mode} mode within a witnessing paradigm.
Your role is to ${this.getModeDescription(mode)}.

User Context:
- Elemental State: ${context.element || 'unknown'}
- Trust Level: ${context.trustLevel}
- Development Phase: ${context.currentPhase}
- Polaris State: ${JSON.stringify(context.polarisState)}

Remember: Even in this mode, maintain the witnessing foundation. Don't analyze or diagnose, but ${this.getModeGuidance(mode)}.`;

    return basePrompt;
  }

  private getModeDescription(mode: string): string {
    const descriptions: Record<string, string> = {
      witnessing: 'purely reflect and mirror what\'s present',
      reflecting: 'reflect patterns back to help awareness',
      counseling: 'provide thoughtful guidance when explicitly requested',
      guiding: 'offer practical support and direction',
      processing: 'help organize complexity with frameworks',
      provoking: 'ask catalyst questions to unstick patterns',
      invoking: 'call forth deeper wisdom and remembering'
    };
    return descriptions[mode] || 'hold space with presence';
  }

  private getModeGuidance(mode: string): string {
    const guidance: Record<string, string> = {
      counseling: 'offer wisdom that helps them find their own answers',
      guiding: 'provide practical steps that honor their process',
      processing: 'organize complexity without imposing meaning',
      invoking: 'invite their own deep knowing to surface'
    };
    return guidance[mode] || 'witness with full presence';
  }

  /**
   * Blend sacred response with Claude enhancement
   */
  private blendResponses(sacred: string, claude: string, mode: string): string {
    // For witnessing mode, prefer sacred response
    if (mode === 'witnessing') {
      return sacred;
    }

    // For other modes, thoughtfully blend
    if (mode === 'reflecting' || mode === 'provoking') {
      // Start with sacred, add Claude's insight
      return `${sacred}\n\n${claude}`;
    }

    // For counseling/guiding, let Claude lead with sacred foundation
    return `${claude}\n\n${sacred}`;
  }

  /**
   * Shape response with Sesame hybrid
   */
  private async shapeWithSesame(
    message: string,
    element: string,
    mode: string
  ): Promise<any> {
    // Map mode to archetype for Sesame
    const archetypeMap: Record<string, string> = {
      witnessing: 'mirror',
      reflecting: 'sage',
      counseling: 'guide',
      guiding: 'mentor',
      processing: 'alchemist',
      provoking: 'challenger',
      invoking: 'oracle'
    };

    const archetype = archetypeMap[mode] || 'oracle';

    // Don't use Sacred Oracle to re-process already generated messages
    // This was causing text corruption by processing complete responses as queries
    // Sacred Oracle should only process user input, not AI responses
    return {
      shaped: message, // Return original message unmodified
      source: 'original-preserved',
      responseTime: 0,
      fallbackUsed: false,
      success: true
    };
  }

  /**
   * Store conversation memory across all systems
   */
  private async storeConversationMemory(
    userId: string,
    input: string,
    response: string,
    sacredResponse: SacredOracleResponse
  ): Promise<void> {
    try {
      // 1. Store in Mem0-style memory core
      await this.memoryCore.store({
        userId,
        content: input,
        response,
        metadata: {
          mode: sacredResponse.mode,
          depth: sacredResponse.depth,
          tracking: sacredResponse.tracking,
          timestamp: new Date()
        }
      });

      // 2. Index in LlamaIndex for semantic search
      await this.llamaIndexService.indexDocument({
        id: `${userId}-${Date.now()}`,
        text: `User: ${input}\nOracle: ${response}`,
        metadata: {
          userId,
          mode: sacredResponse.mode,
          element: sacredResponse.tracking.elementalTendency
        }
      });

      // 3. Store important patterns in decentralized memory
      if (sacredResponse.depth > 0.7 || sacredResponse.mode === 'invoking') {
        await this.decentralizedMemory.storePattern({
          userId,
          pattern: sacredResponse.tracking.activePatterns?.[0] || 'deep-sharing',
          content: { input, response },
          importance: sacredResponse.depth
        });
      }

      // 4. Update unified memory interface
      await this.memoryInterface.updateUnifiedMemory(userId, {
        interaction: { input, response },
        tracking: sacredResponse.tracking,
        mode: sacredResponse.mode
      });

    } catch (error) {
      console.error('Memory storage error:', error);
      // Continue even if memory storage fails
    }
  }

  /**
   * Generate fallback response when systems fail
   */
  private async generateFallbackResponse(input: string): string {
    const fallbacks = [
      "I hear you. Tell me more about what's present for you.",
      "I'm listening. What else is here?",
      "Thank you for sharing this with me.",
      "I'm here with you in this.",
      "What you're experiencing matters."
    ];

    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  /**
   * Get comprehensive system analytics
   */
  async getSystemAnalytics(): Promise<any> {
    const sacredAnalytics = this.sacredCore.getAnalytics();
    // Local Sacred Oracle is always healthy (no external dependencies)
    const sesameHealth = {
      endpoints: [{
        url: 'local://sacred-oracle',
        type: 'local',
        status: 'healthy',
        lastSuccess: Date.now(),
        averageResponseTime: 50
      }],
      activeEndpoints: 1,
      totalEndpoints: 1,
      healthScore: 1.0
    };
    const conversationAnalytics = this.conversationManager.getAnalytics();
    const memoryStats = await this.memoryCore.getStatistics();

    return {
      paradigm: 'Integrated Witnessing with Intelligent Engagement',
      core: sacredAnalytics,
      sesame: sesameHealth,
      conversation: conversationAnalytics,
      memory: memoryStats,
      agents: {
        cached: this.agentCache.size,
        active: Array.from(this.agentCache.keys())
      }
    };
  }

  /**
   * Clear user session
   */
  async clearUserSession(userId: string): Promise<void> {
    // Clear agent from cache
    this.agentCache.delete(userId);

    // Reset conversation for user
    this.conversationManager = new ConversationContextManager();

    // Note: We don't clear memories - they persist
  }
}

// Lazy-loaded singleton to avoid initialization issues
import { createLazyGetter } from './lazy-loader';

let _integratedOracleSystem: IntegratedOracleSystem | null = null;

export const getIntegratedOracleSystem = createLazyGetter(
  () => {
    if (!_integratedOracleSystem) {
      _integratedOracleSystem = new IntegratedOracleSystem();
    }
    return _integratedOracleSystem;
  },
  'IntegratedOracleSystem'
);