/**
 * Unified Oracle Service
 * Consolidates PersonalOracleAgent, EnhancedPersonalOracleAgent, and related services
 * into a single, coherent oracle conversation management system
 */

import { 
  IOracleService, 
  IUserService,
  INarrativeService,
  IMemoryService,
  IAnalyticsService,
  IDaimonicService,
  IEventBusService,
  ServiceTokens,
  ConversationContext,
  OracleResponse,
  ConversationEntry,
  ArchetypeInsight,
  EmotionalState,
  DomainEvent
} from '../core/ServiceTokens';
import { ServiceContainer } from '../core/ServiceContainer';

export interface OracleConfiguration {
  maxContextLength: number;
  defaultModel: string;
  enableVoiceResponse: boolean;
  enableDaimonicEncounters: boolean;
  enableEmotionalAnalysis: boolean;
  responseTimeout: number;
}

export interface ConversationState {
  userId: string;
  sessionId: string;
  messageCount: number;
  archetypeActivation: Record<string, number>;
  emotionalHistory: EmotionalState[];
  activeThemes: string[];
  lastInteraction: Date;
}

export interface MessageProcessor {
  process(message: string, context: ConversationContext): Promise<ProcessedMessage>;
}

export interface ProcessedMessage {
  cleanedText: string;
  emotionalState: EmotionalState;
  archetypeActivation: Record<string, number>;
  themes: string[];
  intents: string[];
}

export interface ResponseGenerator {
  generate(message: ProcessedMessage, context: ConversationContext): Promise<OracleResponse>;
}

export class UnifiedOracleService implements IOracleService {
  private conversationStates = new Map<string, ConversationState>();
  private messageProcessors: MessageProcessor[] = [];
  private responseGenerators: ResponseGenerator[] = [];

  constructor(
    private container: ServiceContainer,
    private config: OracleConfiguration
  ) {
    this.initializeProcessors();
    this.initializeGenerators();
  }

  /**
   * Process a user message and generate an oracle response
   */
  async processMessage(
    userId: string, 
    message: string, 
    context?: ConversationContext
  ): Promise<OracleResponse> {
    try {
      // Get or create conversation state
      let conversationState = this.conversationStates.get(userId);
      if (!conversationState) {
        conversationState = await this.initializeConversationState(userId);
      }

      // Get full conversation context
      const fullContext = context || await this.buildConversationContext(userId);
      
      // Process the message through all processors
      const processedMessage = await this.processMessageThroughPipeline(message, fullContext);
      
      // Update conversation state
      await this.updateConversationState(userId, processedMessage);
      
      // Generate response through all generators
      const response = await this.generateResponseThroughPipeline(processedMessage, fullContext);
      
      // Store conversation entry
      await this.storeConversationEntry(userId, message, response);
      
      // Publish events for analytics and daimonic encounters
      await this.publishConversationEvents(userId, processedMessage, response);
      
      return response;
      
    } catch (error) {
      console.error('Oracle processing error:', error);
      
      // Fallback response
      return {
        text: "I sense there&apos;s something profound you wish to explore, though the connection feels momentarily unclear. Perhaps you could share more about what&apos;s on your heart?",
        emotionalResonance: undefined,
        archetypeInsights: [],
        suggestedActions: ['Try rephrasing your question', 'Share more context about your situation']
      };
    }
  }

  /**
   * Get conversation history for a user
   */
  async getConversationHistory(userId: string, limit: number = 10): Promise<ConversationEntry[]> {
    const memoryService = await this.container.resolve(ServiceTokens.MemoryService);
    const memories = await memoryService.retrieveMemories(userId, '', limit);
    
    return memories
      .filter(memory => memory.metadata.type === 'conversation')
      .map(memory => ({
        id: memory.id,
        userId: memory.userId,
        message: memory.metadata.message || '',
        response: memory.content,
        timestamp: memory.createdAt,
        metadata: memory.metadata
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Generate archetypal insights for a user
   */
  async generateInsights(userId: string, timeframe: string = '30d'): Promise<ArchetypeInsight[]> {
    const analyticsService = await this.container.resolve(ServiceTokens.AnalyticsService);
    const narrativeService = await this.container.resolve(ServiceTokens.NarrativeService);
    
    // Get raw analytics data
    const insights = await analyticsService.getArchetypeInsights(userId, timeframe);
    
    // Enhance with narrative context
    const conversationState = this.conversationStates.get(userId);
    if (conversationState) {
      // Add contextual information from recent conversations
      insights.forEach(insight => {
        const recentActivation = conversationState!.archetypeActivation[insight.archetype] || 0;
        insight.strength = Math.max(insight.strength, recentActivation);
      });
    }
    
    return insights;
  }

  /**
   * Initialize conversation state for a new user session
   */
  private async initializeConversationState(userId: string): Promise<ConversationState> {
    const userService = await this.container.resolve(ServiceTokens.UserService);
    const user = await userService.getCurrentUser(userId);
    
    const state: ConversationState = {
      userId,
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      messageCount: 0,
      archetypeActivation: {
        Hero: 0,
        Sage: 0,
        Creator: 0,
        Lover: 0,
        Seeker: 0,
        Shadow: 0
      },
      emotionalHistory: [],
      activeThemes: user?.profile?.oracle?.archetypeFocus || [],
      lastInteraction: new Date()
    };
    
    this.conversationStates.set(userId, state);
    return state;
  }

  /**
   * Build full conversation context
   */
  private async buildConversationContext(userId: string): Promise<ConversationContext> {
    const memoryService = await this.container.resolve(ServiceTokens.MemoryService);
    const existingContext = await memoryService.getConversationContext(userId);
    
    const conversationState = this.conversationStates.get(userId);
    
    return {
      ...existingContext,
      userId,
      activeThemes: conversationState?.activeThemes || existingContext.activeThemes || []
    };
  }

  /**
   * Process message through all processors
   */
  private async processMessageThroughPipeline(
    message: string, 
    context: ConversationContext
  ): Promise<ProcessedMessage> {
    let result: ProcessedMessage = {
      cleanedText: message,
      emotionalState: { valence: 0, arousal: 0, dominance: 0, confidence: 0 },
      archetypeActivation: {},
      themes: [],
      intents: []
    };

    for (const processor of this.messageProcessors) {
      result = await processor.process(result.cleanedText, context);
    }

    return result;
  }

  /**
   * Generate response through all generators
   */
  private async generateResponseThroughPipeline(
    message: ProcessedMessage, 
    context: ConversationContext
  ): Promise<OracleResponse> {
    // Use the first generator that can handle this message type
    // In future versions, this could be more sophisticated routing
    const generator = this.responseGenerators[0];
    return await generator.generate(message, context);
  }

  /**
   * Update conversation state based on processed message
   */
  private async updateConversationState(userId: string, message: ProcessedMessage): Promise<void> {
    const state = this.conversationStates.get(userId);
    if (!state) return;

    state.messageCount++;
    state.lastInteraction = new Date();
    
    // Update archetype activation
    Object.entries(message.archetypeActivation).forEach(([archetype, activation]) => {
      state.archetypeActivation[archetype] = 
        (state.archetypeActivation[archetype] + activation) / 2; // Moving average
    });

    // Update emotional history (keep last 10)
    state.emotionalHistory.push(message.emotionalState);
    if (state.emotionalHistory.length > 10) {
      state.emotionalHistory.shift();
    }

    // Update active themes
    state.activeThemes = [
      ...new Set([...state.activeThemes, ...message.themes])
    ].slice(0, 5); // Keep top 5 themes
  }

  /**
   * Store conversation entry in memory
   */
  private async storeConversationEntry(
    userId: string, 
    message: string, 
    response: OracleResponse
  ): Promise<void> {
    const memoryService = await this.container.resolve(ServiceTokens.MemoryService);
    
    await memoryService.storeMemory(userId, {
      id: `conv_${Date.now()}`,
      userId,
      content: response.text,
      metadata: {
        type: 'conversation',
        message,
        emotionalResonance: response.emotionalResonance,
        archetypeInsights: response.archetypeInsights,
        audioUrl: response.audioUrl,
        timestamp: new Date().toISOString()
      },
      createdAt: new Date()
    });
  }

  /**
   * Publish conversation events for analytics and other services
   */
  private async publishConversationEvents(
    userId: string,
    message: ProcessedMessage,
    response: OracleResponse
  ): Promise<void> {
    const eventBus = await this.container.resolve(ServiceTokens.EventBusService);
    
    // Conversation event
    await eventBus.publish({
      id: `conv_${Date.now()}`,
      type: 'conversation.completed',
      userId,
      data: {
        messageLength: message.cleanedText.length,
        responseLength: response.text.length,
        emotionalState: message.emotionalState,
        archetypeActivation: message.archetypeActivation,
        themes: message.themes,
        hasDaimonicEncounter: !!response.daimonicEncounter
      },
      timestamp: new Date()
    });

    // Daimonic encounter event (if applicable)
    if (response.daimonicEncounter) {
      await eventBus.publish({
        id: `daimonic_${Date.now()}`,
        type: 'daimonic.encounter.triggered',
        userId,
        data: {
          encounterId: response.daimonicEncounter.id,
          archetype: response.daimonicEncounter.archetype,
          trigger: message.cleanedText
        },
        timestamp: new Date()
      });
    }
  }

  /**
   * Initialize message processors
   */
  private initializeProcessors(): void {
    this.messageProcessors = [
      new TextCleaningProcessor(),
      new EmotionalAnalysisProcessor(this.container),
      new ArchetypeDetectionProcessor(this.container),
      new ThemeExtractionProcessor(),
      new IntentDetectionProcessor()
    ];
  }

  /**
   * Initialize response generators  
   */
  private initializeGenerators(): void {
    this.responseGenerators = [
      new ContextualOracleResponseGenerator(this.container, this.config)
    ];
  }

  /**
   * Dispose of the service and cleanup resources
   */
  async dispose(): Promise<void> {
    this.conversationStates.clear();
    this.messageProcessors = [];
    this.responseGenerators = [];
  }
}

// Message Processors

class TextCleaningProcessor implements MessageProcessor {
  async process(message: string, context: ConversationContext): Promise<ProcessedMessage> {
    const cleanedText = message
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s.,!?;:'"()-]/g, ''); // Remove special characters but keep punctuation
    
    return {
      cleanedText,
      emotionalState: { valence: 0, arousal: 0, dominance: 0, confidence: 0 },
      archetypeActivation: {},
      themes: [],
      intents: []
    };
  }
}

class EmotionalAnalysisProcessor implements MessageProcessor {
  constructor(private container: ServiceContainer) {}

  async process(message: string, context: ConversationContext): Promise<ProcessedMessage> {
    // Simplified emotional analysis - in production would use ML models
    const emotionalKeywords = {
      positive: ['happy', 'joy', 'love', 'excited', 'grateful', 'peaceful', 'calm'],
      negative: ['sad', 'angry', 'frustrated', 'worried', 'anxious', 'depressed'],
      high_arousal: ['excited', 'angry', 'anxious', 'thrilled', 'panicked'],
      low_arousal: ['calm', 'peaceful', 'tired', 'bored', 'relaxed'],
      high_dominance: ['confident', 'powerful', 'in control', 'determined'],
      low_dominance: ['helpless', 'submissive', 'overwhelmed', 'powerless']
    };

    let valence = 0;
    let arousal = 0.5;
    let dominance = 0.5;
    
    const words = message.toLowerCase().split(/\s+/);
    
    // Simple keyword matching (would be replaced with proper NLP)
    emotionalKeywords.positive.forEach(keyword => {
      if (words.includes(keyword)) valence += 0.2;
    });
    
    emotionalKeywords.negative.forEach(keyword => {
      if (words.includes(keyword)) valence -= 0.2;
    });
    
    emotionalKeywords.high_arousal.forEach(keyword => {
      if (words.includes(keyword)) arousal += 0.1;
    });
    
    emotionalKeywords.low_arousal.forEach(keyword => {
      if (words.includes(keyword)) arousal -= 0.1;
    });

    // Normalize values
    valence = Math.max(-1, Math.min(1, valence));
    arousal = Math.max(0, Math.min(1, arousal));
    dominance = Math.max(0, Math.min(1, dominance));

    return {
      cleanedText: message,
      emotionalState: {
        valence,
        arousal,
        dominance,
        confidence: 0.7 // Simplified confidence score
      },
      archetypeActivation: {},
      themes: [],
      intents: []
    };
  }
}

class ArchetypeDetectionProcessor implements MessageProcessor {
  constructor(private container: ServiceContainer) {}

  async process(message: string, context: ConversationContext): Promise<ProcessedMessage> {
    // Simplified archetype detection based on keywords
    const archetypeKeywords = {
      Hero: ['challenge', 'overcome', 'fight', 'victory', 'courage', 'battle', 'conquer'],
      Sage: ['wisdom', 'understand', 'learn', 'teach', 'knowledge', 'insight', 'truth'],
      Creator: ['create', 'build', 'make', 'art', 'design', 'innovate', 'express'],
      Lover: ['love', 'connect', 'relationship', 'heart', 'feel', 'emotion', 'care'],
      Seeker: ['search', 'find', 'quest', 'journey', 'explore', 'discover', 'meaning'],
      Shadow: ['dark', 'hidden', 'fear', 'reject', 'deny', 'suppress', 'avoid']
    };

    const archetypeActivation: Record<string, number> = {};
    const words = message.toLowerCase().split(/\s+/);

    Object.entries(archetypeKeywords).forEach(([archetype, keywords]) => {
      let activation = 0;
      keywords.forEach(keyword => {
        if (words.includes(keyword)) {
          activation += 0.15;
        }
      });
      archetypeActivation[archetype] = Math.min(1, activation);
    });

    return {
      cleanedText: message,
      emotionalState: { valence: 0, arousal: 0, dominance: 0, confidence: 0 },
      archetypeActivation,
      themes: [],
      intents: []
    };
  }
}

class ThemeExtractionProcessor implements MessageProcessor {
  async process(message: string, context: ConversationContext): Promise<ProcessedMessage> {
    // Simple theme extraction based on common patterns
    const themePatterns = [
      { pattern: /relationship|love|connection/i, theme: 'relationships' },
      { pattern: /work|career|job/i, theme: 'career' },
      { pattern: /family|parent|child/i, theme: 'family' },
      { pattern: /health|body|physical/i, theme: 'health' },
      { pattern: /money|financial|wealth/i, theme: 'finances' },
      { pattern: /spiritual|soul|meaning/i, theme: 'spirituality' },
      { pattern: /creative|art|express/i, theme: 'creativity' },
      { pattern: /fear|anxiety|worry/i, theme: 'anxiety' },
      { pattern: /growth|change|transform/i, theme: 'transformation' }
    ];

    const themes: string[] = [];
    themePatterns.forEach(({ pattern, theme }) => {
      if (pattern.test(message)) {
        themes.push(theme);
      }
    });

    return {
      cleanedText: message,
      emotionalState: { valence: 0, arousal: 0, dominance: 0, confidence: 0 },
      archetypeActivation: {},
      themes,
      intents: []
    };
  }
}

class IntentDetectionProcessor implements MessageProcessor {
  async process(message: string, context: ConversationContext): Promise<ProcessedMessage> {
    const intentPatterns = [
      { pattern: /what should i|how do i|help me/i, intent: 'seeking_advice' },
      { pattern: /tell me about|explain|what is/i, intent: 'seeking_information' },
      { pattern: /i feel|i&apos;m feeling|i am/i, intent: 'sharing_emotion' },
      { pattern: /i want|i need|i wish/i, intent: 'expressing_desire' },
      { pattern: /thank|grateful|appreciate/i, intent: 'expressing_gratitude' },
      { pattern: /\?/g, intent: 'asking_question' }
    ];

    const intents: string[] = [];
    intentPatterns.forEach(({ pattern, intent }) => {
      if (pattern.test(message)) {
        intents.push(intent);
      }
    });

    return {
      cleanedText: message,
      emotionalState: { valence: 0, arousal: 0, dominance: 0, confidence: 0 },
      archetypeActivation: {},
      themes: [],
      intents
    };
  }
}

// Response Generators

class ContextualOracleResponseGenerator implements ResponseGenerator {
  constructor(
    private container: ServiceContainer,
    private config: OracleConfiguration
  ) {}

  async generate(message: ProcessedMessage, context: ConversationContext): Promise<OracleResponse> {
    const narrativeService = await this.container.resolve(ServiceTokens.NarrativeService);
    const daimonicService = await this.container.resolve(ServiceTokens.DaimonicService);
    
    // Generate base response using narrative service
    const personalStats = {
      userId: context.userId,
      timeframe: '7d',
      totalSessions: 10,
      archetypeGrowth: message.archetypeActivation,
      emotionalAverage: message.emotionalState,
      insights: message.themes
    };
    
    const narrative = await narrativeService.generatePersonalNarrative(context.userId, personalStats);
    
    // Check for daimonic encounter
    let daimonicEncounter = null;
    if (this.config.enableDaimonicEncounters) {
      daimonicEncounter = await daimonicService.checkForEncounter(
        context.userId, 
        message.cleanedText, 
        message.emotionalState
      );
    }
    
    // Generate archetypal insights
    const archetypeInsights = Object.entries(message.archetypeActivation)
      .filter(([, activation]) => activation > 0.3)
      .map(([archetype, strength]) => ({
        archetype,
        strength,
        growth: strength * 100,
        themes: message.themes,
        guidance: `Your ${archetype} energy is particularly active right now.`
      }));

    return {
      text: narrative.fullText || this.generateFallbackResponse(message, context),
      emotionalResonance: {
        current: message.emotionalState,
        trend: 'stable' as const,
        insights: [`Your emotional state shows ${message.emotionalState.valence > 0 ? 'positive' : 'challenging'} energy`]
      },
      archetypeInsights,
      daimonicEncounter: daimonicEncounter || undefined,
      suggestedActions: this.generateSuggestedActions(message, context)
    };
  }

  private generateFallbackResponse(message: ProcessedMessage, context: ConversationContext): string {
    const templates = [
      "I sense there&apos;s something profound stirring within you. Tell me more about what you&apos;re experiencing.",
      "Your words carry weight and meaning. What would you like to explore further?",
      "I&apos;m here to journey with you through whatever is emerging. How can we go deeper?",
      "There&apos;s wisdom in what you're sharing. What feels most important for you right now?"
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateSuggestedActions(message: ProcessedMessage, context: ConversationContext): string[] {
    const actions: string[] = [];
    
    if (message.intents.includes('seeking_advice')) {
      actions.push('Explore your options more deeply', 'Consider what your intuition is telling you');
    }
    
    if (message.emotionalState.valence < -0.3) {
      actions.push('Practice self-compassion', 'Connect with supportive people');
    }
    
    if (Object.values(message.archetypeActivation).some(v => v > 0.5)) {
      actions.push('Journal about your archetypal insights', 'Meditate on your inner wisdom');
    }
    
    return actions.length > 0 ? actions : ['Continue exploring your thoughts and feelings'];
  }
}