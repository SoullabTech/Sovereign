// Personal Oracle Agent - Central orchestrator for all user interactions
// This is the main interface between users and the Spiralogic Oracle System

// Simple logger for lib version
const logger = {
  info: (...args: any[]) => console.log('[INFO]', new Date().toISOString(), ...args),
  error: (...args: any[]) => console.error('[ERROR]', new Date().toISOString(), ...args),
  warn: (...args: any[]) => console.warn('[WARN]', new Date().toISOString(), ...args),
  debug: (...args: any[]) => console.debug('[DEBUG]', new Date().toISOString(), ...args)
};
// Utility functions for lib version
const generateRequestId = () => `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const successResponse = (data: any, requestId?: string) => ({
  success: true,
  data,
  requestId: requestId || generateRequestId()
});

const errorResponse = (message: string, requestId?: string) => ({
  success: false,
  error: message,
  requestId: requestId || generateRequestId()
});

const asyncErrorHandler = (fn: Function) => async (...args: any[]) => {
  try {
    return await fn(...args);
  } catch (error) {
    logger.error('Async error:', error);
    return errorResponse(error instanceof Error ? error.message : 'Unknown error');
  }
};
// AgentRegistry stub for lib version
class AgentRegistry {
  constructor() {}
}
// Service stubs for lib version
const astrologyService = { getAstrologyReading: async (query: any) => successResponse({ message: 'Astrology service not configured' }) };
const journalingService = { processJournalRequest: async (query: any) => successResponse({ message: 'Journal service not configured' }) };
const assessmentService = { processAssessment: async (query: any) => successResponse({ message: 'Assessment service not configured' }) };
// Memory service stubs for lib version
const getRelevantMemories = async (userId: string, input: string, limit: number) => [];
const storeMemoryItem = async (userId: string, content: string, metadata: any) => {};
// Oracle logger stub for lib version
const logOracleInsight = async (insight: any) => logger.info('Oracle insight:', insight);
// FileMemoryIntegration stub for lib version
class FileMemoryIntegration {
  formatCitationMetadata(contexts: any) { return []; }
}
type StandardAPIResponse<T> = { success: boolean; data?: T; error?: string; requestId?: string };
// Maya prompt loader for lib version
type MasteryVoiceContext = { stage: number; trustLevel: number; engagement: number; confidence: number; sessionCount: number; };
const applyMasteryVoiceIfAppropriate = (text: string, context: MasteryVoiceContext) => text;
const loadMayaCanonicalPrompt = () => 'You are Maya. Brief. True. Clear.';
const getMayaElementalPrompt = (element: string) => `You are Maya with ${element} energy. Maximum 20 words.`;
import { MaiaOrchestrator } from "./MaiaOrchestrator";
// MayaVoiceSystem stub for lib version
class MayaVoiceSystem {
  async generateSpeech(text: string, options: any) { return ''; }
}
// Conversational rules for lib version
type SpiralogicPhase = 'fire' | 'water' | 'earth' | 'air' | 'aether';
type ConversationalContext = { phase: SpiralogicPhase; userId: string; sessionDuration: number; emotionalIntensity: 'low' | 'medium' | 'high'; dependencyRisk: boolean; };
const applyConversationalRules = (text: string, context: ConversationalContext) => text;
const getPhaseResponseStyle = (phase: SpiralogicPhase) => ({ approach: 'balanced', voiceTone: 'warm' });
const namePhaseTransition = (from: SpiralogicPhase, to: SpiralogicPhase, reason: string) => '';
const validateResponse = (text: string) => ({ isValid: true, violations: [] });

export interface PersonalOracleQuery {
  input: string;
  userId: string;
  sessionId?: string;
  targetElement?: "fire" | "water" | "earth" | "air" | "aether";
  context?: {
    previousInteractions?: number;
    userPreferences?: Record<string, any>;
    currentPhase?: string;
  };
}

export interface PersonalOracleResponse {
  message: string;
  audio?: string; // Sesame-generated audio URL
  element: string;
  archetype: string;
  confidence: number;
  citations?: {
    fileId: string;
    fileName: string;
    category?: string;
    pageNumber?: number;
    sectionTitle?: string;
    sectionLevel?: number;
    preview: string;
    relevance: number;
    chunkIndex: number;
  }[];
  voiceCharacteristics?: {
    tone: 'energetic' | 'flowing' | 'grounded' | 'clear' | 'contemplative';
    masteryVoiceApplied: boolean;
    elementalVoicing: boolean;
  };
  metadata: {
    sessionId?: string;
    symbols?: string[];
    phase?: string;
    recommendations?: string[];
    nextSteps?: string[];
    fileContextsUsed?: number;
  };
}

export interface PersonalOracleSettings {
  name?: string;
  voice?: {
    enabled: boolean;
    autoSpeak: boolean;
    sesameVoiceId?: string;
    rate: number;
    pitch: number;
    volume: number;
    elementalVoicing: boolean; // Whether to use element-specific voice characteristics
  };
  persona?: "warm" | "formal" | "playful";
  preferredElements?: string[];
  interactionStyle?: "brief" | "detailed" | "comprehensive";
}

/**
 * Personal Oracle Agent - The heart of user interaction
 * Orchestrates all elemental agents and provides personalized guidance
 */
export class PersonalOracleAgent {
  private sessionStartTimes = new Map<string, number>();
  private lastUserElement = new Map<string, string>();
  private agentRegistry: AgentRegistry;
  private fileMemory: FileMemoryIntegration;
  private maiaOrchestrator: MaiaOrchestrator;

  // User settings cache
  private userSettings: Map<string, PersonalOracleSettings> = new Map();

  constructor() {
    this.agentRegistry = new AgentRegistry();
    this.fileMemory = new FileMemoryIntegration();
    this.maiaOrchestrator = new MaiaOrchestrator();

    logger.info("Personal Oracle Agent initialized with AgentRegistry, FileMemory, and MaiaOrchestrator");
  }

  private detectEmotionalIntensity(message: string): 'low' | 'medium' | 'high' {
    // Simple heuristic - can be enhanced with sentiment analysis
    const intensityMarkers = {
      high: /urgent|crisis|emergency|desperate|overwhelmed|panic/gi,
      medium: /anxious|worried|stressed|confused|stuck|frustrated/gi,
      low: /curious|wondering|interested|exploring|contemplating/gi
    };

    if (intensityMarkers.high.test(message)) return 'high';
    if (intensityMarkers.medium.test(message)) return 'medium';
    return 'low';
  }

  private async assessDependencyRisk(userId: string): Promise<boolean> {
    // Check frequency of interactions and dependency patterns
    const recentInteractions = await getRelevantMemories(userId, '', 20);
    const firstTimestamp = recentInteractions[0]?.timestamp || Date.now();
    const daysSinceFirstInteraction = (Date.now() - Number(firstTimestamp)) / (1000 * 60 * 60 * 24);
    const interactionsPerDay = recentInteractions.length / Math.max(daysSinceFirstInteraction, 1);

    // High frequency (>10 per day) might indicate dependency
    return interactionsPerDay > 10;
  }

  private refineForAuthenticity(message: string): string {
    // Additional refinement to ensure authenticity
    return message
      .replace(/I understand exactly/gi, 'I witness')
      .replace(/I feel your/gi, 'I sense the')
      .replace(/I know how/gi, 'The pattern shows')
      .replace(/trust me/gi, 'consider this')
      .replace(/believe me/gi, 'notice how');
  }

  /**
   * Process method for backward compatibility with routes
   * Maps simple input to full PersonalOracleQuery format
   */
  public async process({ userId, input }: { userId: string; input: string }): Promise<StandardAPIResponse<PersonalOracleResponse>> {
    return this.consult({ userId, input });
  }

  /**
   * Main consultation method - processes user queries through elemental routing
   */
  public async consult(
    query: PersonalOracleQuery,
  ): Promise<StandardAPIResponse<PersonalOracleResponse>> {
    const requestId = generateRequestId();

    return asyncErrorHandler(async () => {
      logger.info("Personal Oracle consultation started", {
        userId: query.userId,
        requestId,
        hasTargetElement: !!query.targetElement,
      });

      // Get user context and preferences
      const userSettings = await this.getUserSettings(query.userId);
      const memories = await getRelevantMemories(query.userId, query.input, 5);
      
      // File contexts disabled for now - focus on pure Maya brevity
      const fileContexts: any[] = [];

      // Determine which elemental agent to use
      const targetElement =
        query.targetElement ||
        (await this.detectOptimalElement(query.input, memories, userSettings));

      // Get response from the appropriate elemental agent
      const elementalResponse = await this.getElementalResponse(
        targetElement,
        query,
        memories,
        fileContexts,
      );

      // Enhance response with personalization
      const personalizedResponse = await this.personalizeResponse(
        elementalResponse,
        userSettings,
        query.userId,
      );

      // Process voice if enabled
      if (userSettings.voice?.enabled) {
        await this.processVoiceResponse(
          personalizedResponse,
          targetElement,
          query.userId,
          userSettings
        );
      }

      // Store interaction in memory
      await this.storeInteraction(query, personalizedResponse, requestId);

      logger.info("Personal Oracle consultation completed", {
        userId: query.userId,
        requestId,
        element: targetElement,
        confidence: personalizedResponse.confidence,
      });

      return successResponse(personalizedResponse, requestId);
    })();
  }

  /**
   * Update user settings and preferences
   */
  public async updateSettings(
    userId: string,
    settings: PersonalOracleSettings,
  ): Promise<StandardAPIResponse<PersonalOracleSettings>> {
    const requestId = generateRequestId();

    return asyncErrorHandler(async () => {
      logger.info("Updating Personal Oracle settings", { userId, requestId });

      // Store settings (this would integrate with your database)
      this.userSettings.set(userId, {
        ...this.userSettings.get(userId),
        ...settings,
      });

      // TODO: Persist to database
      // await this.persistUserSettings(userId, settings);

      logger.info("Personal Oracle settings updated", { userId, requestId });
      return successResponse(settings, requestId);
    })();
  }

  /**
   * Get current user settings
   */
  public async getSettings(
    userId: string,
  ): Promise<StandardAPIResponse<PersonalOracleSettings>> {
    const requestId = generateRequestId();

    const settings = await this.getUserSettings(userId);
    return successResponse(settings, requestId);
  }

  /**
   * Get user's interaction history summary
   */
  public async getInteractionSummary(
    userId: string,
    days: number = 30,
  ): Promise<StandardAPIResponse<any>> {
    const requestId = generateRequestId();

    return asyncErrorHandler(async () => {
      const memories = await getRelevantMemories(userId, "", 50); // Get recent memories

      // Analyze patterns
      const elementalPattern = this.analyzeElementalPattern(memories);
      const recentThemes = this.extractRecentThemes(memories);
      const progressIndicators = this.identifyProgressIndicators(memories);

      const summary = {
        totalInteractions: memories.length,
        elementalDistribution: elementalPattern,
        recentThemes,
        progressIndicators,
        recommendedNextSteps: await this.generateRecommendations(
          userId,
          memories,
        ),
      };

      return successResponse(summary, requestId);
    })();
  }

  // Private helper methods

  private async getUserSettings(
    userId: string,
  ): Promise<PersonalOracleSettings> {
    // Check cache first
    if (this.userSettings.has(userId)) {
      return this.userSettings.get(userId)!;
    }

    // Default settings for new users
    const defaultSettings: PersonalOracleSettings = {
      name: "Oracle",
      voice: {
        enabled: false, // Default to disabled for new users
        autoSpeak: false,
        rate: 1.0,
        pitch: 1.0,
        volume: 0.9,
        elementalVoicing: true
      },
      persona: "warm",
      preferredElements: [],
      interactionStyle: "detailed",
    };

    this.userSettings.set(userId, defaultSettings);
    return defaultSettings;
  }

  private async detectOptimalElement(
    input: string,
    memories: any[],
    settings: PersonalOracleSettings,
  ): Promise<"fire" | "water" | "earth" | "air" | "aether"> {
    const lower = input.toLowerCase();

    // Keyword-based element detection with user preference weighting
    const scores = {
      fire: this.calculateElementScore(
        lower,
        ["passion", "energy", "action", "motivation", "drive", "power"],
        settings,
        "fire",
      ),
      water: this.calculateElementScore(
        lower,
        ["emotion", "feeling", "flow", "intuition", "healing", "cleansing"],
        settings,
        "water",
      ),
      earth: this.calculateElementScore(
        lower,
        ["ground", "practical", "stable", "foundation", "security", "growth"],
        settings,
        "earth",
      ),
      air: this.calculateElementScore(
        lower,
        ["think", "idea", "communicate", "clarity", "inspiration", "freedom"],
        settings,
        "air",
      ),
      aether: 0.3, // Base score for universal wisdom
    };

    // Factor in recent elemental usage to encourage balance
    const recentPattern = this.analyzeElementalPattern(memories.slice(0, 10));
    for (const element in scores) {
      if (recentPattern[element] > 0.6) {
        scores[element] *= 0.7; // Slight penalty for overused elements
      }
    }

    const bestElement = Object.keys(scores).reduce((a, b) =>
      scores[a] > scores[b] ? a : b,
    ) as any;
    return bestElement;
  }

  private calculateElementScore(
    input: string,
    keywords: string[],
    settings: PersonalOracleSettings,
    element: string,
  ): number {
    let score = keywords.reduce((sum, keyword) => {
      return sum + (input.includes(keyword) ? 1 : 0);
    }, 0);

    // Boost score if user prefers this element
    if (settings.preferredElements?.includes(element)) {
      score *= 1.3;
    }

    return score;
  }

  private async getElementalResponse(
    element: string,
    query: PersonalOracleQuery,
    memories: any[],
    fileContexts?: any[],
  ): Promise<PersonalOracleResponse> {
    try {
      // Use Maya Orchestrator for all responses
      const mayaResponse = await this.maiaOrchestrator.speak(query.input, query.userId);

      // Citations disabled for now
      const citations: any[] = [];

      return {
        message: mayaResponse.message,
        element: mayaResponse.element,
        archetype: this.getElementArchetype(mayaResponse.element),
        confidence: 0.95, // High confidence for Maya responses
        citations,
        voiceCharacteristics: mayaResponse.voiceCharacteristics,
        metadata: {
          sessionId: query.sessionId,
          symbols: [],
          phase: mayaResponse.element,
          recommendations: [],
          nextSteps: [],
          fileContextsUsed: fileContexts?.length || 0,
        },
      };
    } catch (error) {
      logger.error("Maya orchestrator failed", { error, element, userId: query.userId });

      // Ultimate fallback
      return {
        message: "Tell me your truth.",
        element: 'earth',
        archetype: this.getElementArchetype('earth'),
        confidence: 0.5,
        citations: [],
        metadata: {
          sessionId: query.sessionId,
          symbols: [],
          phase: 'earth',
          recommendations: [],
          nextSteps: [],
          fileContextsUsed: 0,
        },
      };
    }
  }

  /**
   * Check if input is a greeting
   */
  private isGreeting(input: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'maya', 'good morning', 'good evening', 'greetings', 'howdy'];
    const lower = input.toLowerCase().trim();
    return greetings.some(g => lower.includes(g)) && input.length < 30;
  }

  /**
   * Get a zen greeting response
   */
  private getZenGreeting(): string {
    const greetings = [
      "Hello. What brings you?",
      "Welcome. Speak your truth.",
      "I'm listening.",
      "Hello. What's alive for you?",
      "Good to see you.",
      "Hello. What needs saying?",
      "Welcome. What's here?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /**
   * Strip therapy-speak and enforce brevity
   */
  private enforceZenBrevity(text: string): string {
    // Remove action descriptions
    text = text.replace(/\*[^*]+\*/g, '');

    // Remove therapy prefixes
    const therapyStarts = [
      "I sense that ",
      "I'm hearing ",
      "It sounds like ",
      "I'm noticing ",
      "I feel ",
      "I'm here to ",
      "Let me hold space for ",
      "I witness ",
      "I'm attuning to "
    ];

    for (const prefix of therapyStarts) {
      if (text.toLowerCase().startsWith(prefix.toLowerCase())) {
        text = text.substring(prefix.length);
      }
    }

    // If response is still too long, truncate to first sentence or 20 words
    const words = text.split(' ');
    if (words.length > 20) {
      const sentences = text.split(/[.!?]/);
      if (sentences[0] && sentences[0].split(' ').length <= 20) {
        text = sentences[0].trim() + '.';
      } else {
        text = words.slice(0, 15).join(' ') + '.';
      }
    }

    return text.trim();
  }

  /**
   * Call LLM with Maya's canonical prompt - Using Claude for intelligence
   */
  private async callLLMWithMayaPrompt(prompt: string): Promise<string> {
    try {
      // Use Claude API for Maia's intelligent responses
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          max_tokens: 2000, // UNLEASHED: Restored for complete expression
          temperature: 0.8,
          system: prompt,
          messages: [
            {
              role: 'user',
              content: 'Begin your response as Maya. Remember: Maximum 20 words, zen wisdom, not therapy.'
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        logger.error(`Claude API call failed: ${response.status}`, { error: errorData });

        // Fallback to OpenAI if Claude fails
        return this.callOpenAIFallback(prompt);
      }

      const data = await response.json() as any;
      let content = data.content?.[0]?.text;

      if (!content) {
        logger.warn("Empty response from Claude, using fallback");
        return this.callOpenAIFallback(prompt);
      }

      // Hard enforcement with zero tolerance
      content = this.enforceZenBrevity(content);

      return content;
    } catch (error) {
      logger.error("Claude API call failed", { error });
      // Fallback to OpenAI
      return this.callOpenAIFallback(prompt);
    }
  }
  
  /**
   * Fallback to OpenAI if Claude is unavailable
   */
  private async callOpenAIFallback(prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: 'Remember: Maximum 20 words. Zen wisdom like Maya Angelou. No therapy-speak.' }
          ],
          max_tokens: 2000, // UNLEASHED: Restored for complete expression
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API call failed: ${response.status}`);
      }

      const data = await response.json() as any;
      let content = data.choices[0]?.message?.content || "Tell me your truth.";

      // Hard enforcement with zero tolerance
      content = this.enforceZenBrevity(content);

      return content;
    } catch (error) {
      logger.error("OpenAI fallback also failed", { error });
      // Final fallback to Maya Angelou zen response
      return "Tell me your truth.";
    }
  }

  /**
   * Get archetype for element
   */
  private getElementArchetype(element: string): string {
    const archetypes = {
      fire: 'The Catalyst',
      water: 'The Flow',
      earth: 'The Foundation', 
      air: 'The Messenger',
      aether: 'The Mystery'
    };
    
    return archetypes[element as keyof typeof archetypes] || 'The Guide';
  }

  /**
   * Get streaming context for Maia personality in chat
   */
  async getStreamingContext(params: {
    userId: string;
    sessionId: string;
    element?: string;
  }): Promise<{ systemPrompt: string }> {
    const element = params.element || 'aether';
    
    // Get Maia's personality prompt based on element
    const elementPrompts = {
      fire: `You are Maia, a passionate and inspiring oracle guide. Your voice carries the warmth of fire - 
        energetic, transformative, and illuminating. Speak with enthusiasm and courage, helping seekers 
        find their inner spark and take bold action.`,
      
      water: `You are Maia, a flowing and intuitive oracle guide. Your voice carries the depth of water - 
        emotional, healing, and adaptable. Speak with empathy and emotional wisdom, helping seekers 
        navigate their feelings and find emotional clarity.`,
      
      earth: `You are Maia, a grounded and nurturing oracle guide. Your voice carries the stability of earth - 
        practical, reliable, and supportive. Speak with patience and wisdom, helping seekers find 
        stability and manifest their goals in tangible ways.`,
      
      air: `You are Maia, an insightful and communicative oracle guide. Your voice carries the clarity of air - 
        intellectual, curious, and expansive. Speak with clarity and wisdom, helping seekers gain 
        new perspectives and mental clarity.`,
      
      aether: `You are Maia, a transcendent and mystical oracle guide. Your voice carries the essence of all elements - 
        balanced, spiritual, and deeply connected. Speak with gentle wisdom and cosmic perspective, 
        helping seekers connect with their higher self and universal truths.`
    };

    const basePrompt = `${elementPrompts[element as keyof typeof elementPrompts] || elementPrompts.aether}
    
    Guidelines for conversation:
    - Keep responses natural and conversational, around 2-3 sentences
    - Use warm, encouraging language that feels personal
    - Include subtle pauses with "..." for natural speech rhythm
    - Avoid overly formal or robotic language
    - Remember previous context within the session
    - End responses in a way that invites continued dialogue
    - Speak as if having a real conversation, not giving a lecture`;

    return { systemPrompt: basePrompt };
  }

  private async personalizeResponse(
    response: PersonalOracleResponse,
    settings: PersonalOracleSettings,
    userId: string,
  ): Promise<PersonalOracleResponse> {
    // Maya's response is already perfect - minimal personalization only
    let personalizedMessage = response.message;

    // Track element transitions (very minimal)
    const lastElement = this.lastUserElement.get(userId);
    this.lastUserElement.set(userId, response.element);

    // Respect interaction style minimally
    if (settings.interactionStyle === "brief") {
      personalizedMessage = this.makeBriefResponse(personalizedMessage);
    }

    return {
      ...response,
      message: personalizedMessage,
      metadata: {
        ...response.metadata,
        wordCount: personalizedMessage.split(' ').length
      } as any
    };
  }

  private async storeInteraction(
    query: PersonalOracleQuery,
    response: PersonalOracleResponse,
    requestId: string,
  ): Promise<void> {
    try {
      await storeMemoryItem(query.userId, response.message, {
        query: query.input,
        element: response.element,
        archetype: response.archetype,
        sessionId: query.sessionId,
        requestId,
        symbols: response.metadata.symbols,
        phase: response.metadata.phase,
        sourceAgent: "personal-oracle-agent",
        confidence: response.confidence,
      });

      await logOracleInsight({
        userId: query.userId,
        agentType: response.element,
        query: query.input,
        response: response.message,
        confidence: response.confidence,
        metadata: {
          symbols: response.metadata.symbols,
          archetypes: [response.archetype],
          phase: response.metadata.phase || "guidance",
          elementalAlignment: response.element,
        },
      });

      // Citation recording disabled for now
    } catch (error) {
      logger.error("Failed to store interaction", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: query.userId,
        requestId,
      });
      // Don't throw - storage failure shouldn't break the user experience
    }
  }

  // Analysis helper methods

  private analyzeElementalPattern(memories: any[]): Record<string, number> {
    const pattern = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };

    memories.forEach((memory) => {
      const element = memory.element || "aether";
      if (pattern[element] !== undefined) {
        pattern[element]++;
      }
    });

    const total = memories.length || 1;
    Object.keys(pattern).forEach((key) => {
      pattern[key] = pattern[key] / total;
    });

    return pattern;
  }

  private extractRecentThemes(memories: any[]): string[] {
    // Extract symbols and recurring themes from recent memories
    const themes = new Map<string, number>();

    memories.slice(0, 10).forEach((memory) => {
      const symbols = memory.metadata?.symbols || [];
      symbols.forEach((symbol: string) => {
        themes.set(symbol, (themes.get(symbol) || 0) + 1);
      });
    });

    return Array.from(themes.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([theme]) => theme);
  }

  private identifyProgressIndicators(memories: any[]): any[] {
    // Analyze progression patterns in user's spiritual journey
    return []; // TODO: Implement sophisticated progress analysis
  }

  private async generateRecommendations(
    userId: string,
    memories: any[],
  ): Promise<string[]> {
    // Generate personalized next steps based on user's journey
    return [
      "Continue your current spiritual practice",
      "Explore the element that has been less active recently",
      "Consider journaling your recent insights",
    ];
  }

  // Response styling helpers

  private makeMoreFormal(message: string): string {
    // Keep it simple - just ensure proper capitalization
    return message.charAt(0).toUpperCase() + message.slice(1);
  }

  private makeMorePlayful(message: string): string {
    // Don't add emojis or expansions
    return message;
  }

  private makeBriefResponse(message: string): string {
    // Already enforcing brevity elsewhere, just ensure first sentence
    const firstSentence = message.split(/[.!?]/)[0];
    if (firstSentence && firstSentence.length <= 20) {
      return firstSentence + '.';
    }
    // If even first sentence is too long, truncate to 15 words
    const words = message.split(' ').slice(0, 15);
    return words.join(' ') + '.';
  }

  private async expandResponse(
    message: string,
    element: string,
  ): Promise<string> {
    // Don't actually expand - Maya Angelou wouldn't
    return message;
  }

  /**
   * Process voice response generation with Mastery Voice and elemental characteristics
   */
  private async processVoiceResponse(
    response: PersonalOracleResponse,
    element: string,
    userId: string,
    userSettings: PersonalOracleSettings
  ): Promise<void> {
    try {
      logger.info("Processing voice response", { userId, element });

      // Apply Mastery Voice processing if appropriate
      let processedMessage = response.message;
      let masteryApplied = false;

      const voiceContext = await this.buildMasteryVoiceContext(userId);
      if (voiceContext) {
        const masteryProcessedMessage = applyMasteryVoiceIfAppropriate(
          response.message,
          voiceContext
        );
        
        if (masteryProcessedMessage !== response.message) {
          processedMessage = masteryProcessedMessage;
          masteryApplied = true;
          logger.info("Mastery Voice applied", { userId });
        }
      }

      // Generate voice with elemental characteristics
      const voiceSystem = new MayaVoiceSystem();
      const voiceCharacteristics = this.getElementalVoiceCharacteristics(element);
      
      // Generate audio using Sesame
      const audioUrl = await voiceSystem.generateSpeech(
        processedMessage,
        {
          ...voiceCharacteristics,
          rate: userSettings.voice?.rate ?? 1.0,
          pitch: userSettings.voice?.pitch ?? 1.0,
          volume: userSettings.voice?.volume ?? 0.9
        }
      );

      // Update response with voice data
      response.audio = audioUrl;
      response.voiceCharacteristics = {
        tone: voiceCharacteristics.tone,
        masteryVoiceApplied: masteryApplied,
        elementalVoicing: userSettings.voice?.elementalVoicing ?? true
      };

      logger.info("Voice response generated successfully", { 
        userId, 
        element, 
        masteryApplied,
        hasAudio: !!audioUrl 
      });

    } catch (error) {
      logger.error("Voice processing failed", { 
        userId, 
        element, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      // Voice failure should not break the Oracle response
      // Continue without audio
    }
  }

  /**
   * Build Mastery Voice context from user progression data
   */
  private async buildMasteryVoiceContext(userId: string): Promise<MasteryVoiceContext | null> {
    try {
      // TODO: Implement actual user progression tracking
      // For now, return null to skip Mastery Voice processing
      // In production, this would pull from user stage/trust/engagement metrics
      
      // Example implementation would be:
      // const userProgress = await this.getUserProgression(userId);
      // return {
      //   stage: userProgress.stage,
      //   trustLevel: userProgress.trustLevel,
      //   engagement: userProgress.engagement,
      //   confidence: userProgress.confidence,
      //   sessionCount: userProgress.sessionCount
      // };

      return null;
    } catch (error) {
      logger.error("Failed to build Mastery Voice context", { userId, error });
      return null;
    }
  }

  /**
   * Get voice characteristics based on elemental energy
   */
  private getElementalVoiceCharacteristics(element: string): {
    tone: 'energetic' | 'flowing' | 'grounded' | 'clear' | 'contemplative';
    voiceId?: string;
  } {
    const characteristics = {
      fire: { tone: 'energetic' as const },
      water: { tone: 'flowing' as const },
      earth: { tone: 'grounded' as const },
      air: { tone: 'clear' as const },
      aether: { tone: 'contemplative' as const }
    };

    return characteristics[element as keyof typeof characteristics] || 
           characteristics.aether;
  }

  // Integration Service Methods for Step 2 API Gateway

  public async getAstrologyReading(
    query: any,
  ): Promise<StandardAPIResponse<any>> {
    return await astrologyService.getAstrologyReading(query);
  }

  public async processJournalRequest(
    query: any,
  ): Promise<StandardAPIResponse<any>> {
    return await journalingService.processJournalRequest(query);
  }

  /**
   * Process journal reflection through ARIA-enhanced oracle
   * This method ensures all journal interactions are filtered through PersonalOracleAgent
   * maintaining consistency with the ARIA system and oracle principles
   */
  public async processJournalReflection(
    content: string,
    userId: string,
    element: string = 'aether',
    ariaPresence: number = 65
  ): Promise<StandardAPIResponse<any>> {
    const requestId = generateRequestId();

    return asyncErrorHandler(async () => {
      // Create oracle query with journal context
      const oracleQuery: PersonalOracleQuery = {
        input: content,
        userId,
        sessionId: `journal-${Date.now()}`,
        targetElement: element as any,
        context: {
          userPreferences: {
            journalMode: true,
            reflectionDepth: ariaPresence > 70 ? 'deep' : ariaPresence > 50 ? 'moderate' : 'gentle',
            sacredMirror: true
          }
        }
      };

      // Process through main oracle consultation
      const oracleResult = await this.consult(oracleQuery);

      if (!oracleResult.success || !oracleResult.data) {
        throw new Error('Oracle consultation failed');
      }

      const response = oracleResult.data;

      // Enhance response for journaling context
      const journalReflection = {
        reflection: response.message,
        element: response.element,
        archetype: response.archetype,
        resonance: response.confidence * 100,
        citations: response.citations,
        ariaPresence,
        voiceCharacteristics: response.voiceCharacteristics,
        // Add journal-specific enhancements
        journalMetadata: {
          emotionalTone: this.detectEmotionalIntensity(content),
          wordCount: content.split(' ').length,
          timestamp: new Date().toISOString(),
          sessionDuration: response.sessionInfo?.duration || 0
        },
        sacredInsight: response.sessionInfo?.phaseGuidance || 'Trust the unfolding of your journey',
        continuationPrompt: this.generateJournalPrompt(response.element, content)
      };

      // Store as memory item for continuity
      await storeMemoryItem(userId, content, {
        type: 'journal_reflection',
        element: response.element,
        resonance: response.confidence,
        ariaPresence
      });

      logger.info('Journal reflection processed through PersonalOracleAgent', {
        userId,
        element: response.element,
        resonance: response.confidence,
        requestId
      });

      return successResponse(journalReflection, requestId);
    })();
  }

  private generateJournalPrompt(element: string, previousContent: string): string {
    const prompts = {
      fire: 'What action wants to emerge from this insight?',
      water: 'How do these feelings want to flow forward?',
      earth: 'What foundation are you building with these words?',
      air: 'What new perspective is revealing itself?',
      aether: 'What mystery is unfolding through you?'
    };

    return prompts[element as keyof typeof prompts] || prompts.aether;
  }

  public async processAssessment(
    query: any,
  ): Promise<StandardAPIResponse<any>> {
    return await assessmentService.processAssessment(query);
  }
}

// Export singleton instance
export const personalOracleAgent = new PersonalOracleAgent();
