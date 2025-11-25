/**
 * Maia Fully Educated Orchestrator
 * Complete integration of Claude intelligence + Sesame Hybrid + Knowledge Base + Training Logger
 * This is the ultimate Maia implementation
 */

import { getMaiaEnhancedPrompt, getContextualGreeting, UserJourney, ConversationContext } from './MaiaEnhancedPrompt';
import { MAYA_HER_MODE_PROMPT, MAYA_CLASSIC_MODE_PROMPT } from '../prompts/maya-prompts';
import { maiaKnowledgeBase } from './MaiaKnowledgeBase';
import { maiaTrainingLogger } from './MaiaTrainingLogger';
import { betaExperienceManager, BetaExperiencePreferences } from '../beta/BetaExperienceManager';

type ConversationEntry = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  element?: string;
};

type MaiaResponse = {
  message: string;
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  duration: number;
  voiceCharacteristics: {
    pace: string;
    tone: string;
    energy: string;
  };
};

export interface OnboardingPreferences {
  communicationStyle: 'gentle' | 'balanced' | 'direct';
  explorationDepth: 'surface' | 'moderate' | 'deep';
  practiceOpenness: boolean;
  archetypeResonance?: string[];
  tone: number; // 0-1 scale
  style: 'prose' | 'poetic' | 'auto';
}

export class MaiaFullyEducatedOrchestrator {
  private conversations = new Map<string, ConversationEntry[]>();
  private userJourneys = new Map<string, UserJourney>();
  private userPreferences = new Map<string, OnboardingPreferences>();
  private activeConversations = new Map<string, string>(); // userId -> conversationId for training
  private apiKey = process.env.ANTHROPIC_API_KEY;
  private knowledgeInitialized = false;

  constructor() {
    // Initialize knowledge base on first use
    this.initializeKnowledge();
  }

  private async initializeKnowledge(): Promise<void> {
    if (this.knowledgeInitialized) return;

    try {
      console.log('🎓 Initializing Maia\'s knowledge base...');
      await maiaKnowledgeBase.initialize();

      const stats = maiaKnowledgeBase.getKnowledgeStats();
      console.log('📚 Maia educated with:', stats);

      this.knowledgeInitialized = true;
    } catch (error) {
      console.error('Failed to initialize knowledge base:', error);
      // Continue without knowledge base if it fails
      this.knowledgeInitialized = true;
    }
  }

  setUserPreferences(userId: string, preferences: OnboardingPreferences): void {
    this.userPreferences.set(userId, preferences);
    console.log(`🎯 Set preferences for ${userId}:`, preferences);
  }

  getUserPreferences(userId: string): OnboardingPreferences | null {
    return this.userPreferences.get(userId) || null;
  }

  async speak(input: string, userId: string, preferences?: OnboardingPreferences | BetaExperiencePreferences): Promise<MaiaResponse> {
    // Ensure knowledge is loaded
    await this.initializeKnowledge();

    // Check for potential Maia-Maia conversation loops
    if (this.detectMaiaLoop(input, userId)) {
      return this.createResponse(
        "I notice you might have multiple Maia sessions open. For the best experience, please use one device at a time to avoid conversation loops.",
        'air'
      );
    }

    // Start or continue training logging
    let conversationId = this.activeConversations.get(userId);
    if (!conversationId) {
      const journey = this.getUserJourney(userId);
      conversationId = maiaTrainingLogger.startConversation(userId, journey.sessionCount);
      this.activeConversations.set(userId, conversationId);
    }

    const startTime = Date.now();

    // Get user journey and conversation context
    const userJourney = this.getUserJourney(userId);
    const conversationContext = this.analyzeConversationContext(input, userId);

    // Set preferences if provided
    if (preferences) {
      this.setUserPreferences(userId, preferences);

      // If beta preferences, also set in beta manager
      if ('betaMode' in preferences && preferences.betaMode) {
        betaExperienceManager.setUserPreferences(userId, preferences as BetaExperiencePreferences);
      }
    }

    // Get stored preferences
    const userPrefs = this.getUserPreferences(userId);

    // Check if user is in beta mode
    const betaPrefs = betaExperienceManager.getUserPreferences(userId);
    const isBetaMode = betaPrefs?.betaMode || false;

    // Handle contextual greetings with personalization
    if (this.isSimpleGreeting(input)) {
      const greeting = this.getPersonalizedGreeting(userJourney, userPrefs);
      const response = this.createResponse(greeting, 'earth');

      // Log to training data
      maiaTrainingLogger.logExchange(
        conversationId,
        input,
        greeting,
        'earth',
        Date.now() - startTime
      );

      return response;
    }

    // Get conversation history for context
    const conversationHistory = this.getConversationHistory(userId);

    // Search knowledge base for relevant context
    const topics = this.extractTopics(input, conversationHistory);
    const relevantKnowledge = await maiaKnowledgeBase.getContextualKnowledge(topics);

    // Build comprehensive context for Claude
    const systemPrompt = await this.buildComprehensivePrompt(
      userJourney,
      conversationContext,
      relevantKnowledge,
      userPrefs,
      isBetaMode ? betaExperienceManager.getPersonalizedMaiaPrompt(userId, input) : null
    );

    // Create conversation messages for Claude
    const messages = [
      ...conversationHistory.slice(-10).map(entry => ({
        role: entry.role,
        content: entry.content
      })),
      {
        role: 'user' as const,
        content: input
      }
    ];

    try {
      // Get Maia's response from Claude with full context
      const response = await this.callClaude(systemPrompt, messages);

      // Detect if this is a breakthrough moment
      if (this.isBreakthroughMoment(input, response)) {
        maiaTrainingLogger.markBreakthrough(conversationId);
        userJourney.lastBreakthrough = response;
      }

      // Store conversation
      this.storeConversation(userId, input, response);

      // Update user journey
      this.updateUserJourney(userJourney, input, response);

      // Detect element from response content
      const element = this.detectElement(response);

      // Log to training data
      maiaTrainingLogger.logExchange(
        conversationId,
        input,
        response,
        element,
        Date.now() - startTime
      );

      // Create response with beta metadata if in beta mode
      const maiaResponse = this.createResponse(response, element);

      if (isBetaMode) {
        (maiaResponse as any).betaMetadata = betaExperienceManager.getBetaMetadata(userId);
      }

      return maiaResponse;

    } catch (error) {
      console.error('Maia Intelligence Error:', error);

      // Natural fallback using knowledge base
      const fallback = await this.generateKnowledgeBasedFallback(input, topics);

      maiaTrainingLogger.logExchange(
        conversationId,
        input,
        fallback,
        'earth',
        Date.now() - startTime
      );

      return this.createResponse(fallback, 'earth');
    }
  }

  private getPersonalizedGreeting(userJourney: UserJourney, preferences: OnboardingPreferences | null): string {
    const timeOfDay = this.getTimeOfDay();
    const sessionCount = userJourney.sessionCount;

    if (!preferences) {
      // Default greeting if no preferences set
      return getContextualGreeting(timeOfDay, userJourney);
    }

    // Craft greeting based on preferences
    let greeting = "";

    if (sessionCount === 1) {
      // First-time personalized greeting
      if (preferences.communicationStyle === 'gentle') {
        greeting = preferences.style === 'poetic'
          ? "Welcome, dear one. I'm here to explore gently with you. What's alive in your heart today?"
          : "Hi there. I'm here to explore gently with you. What would you like to share?";
      } else if (preferences.communicationStyle === 'direct') {
        greeting = preferences.style === 'poetic'
          ? "Welcome. Let's dive deep into what matters. What truth wants to emerge through you?"
          : "Let's dive in. What's really on your mind right now?";
      } else {
        greeting = preferences.style === 'poetic'
          ? "Welcome to this sacred space. What wants to be witnessed today?"
          : "Hey there. What's on your mind today?";
      }
    } else {
      // Returning user greeting
      if (preferences.communicationStyle === 'gentle') {
        greeting = `Good ${timeOfDay}. I'm glad you're back. What's gently emerging for you?`;
      } else if (preferences.communicationStyle === 'direct') {
        greeting = `Good ${timeOfDay}. What's most important to explore today?`;
      } else {
        greeting = `Good ${timeOfDay}. What's happening in your world?`;
      }
    }

    return greeting;
  }

  private async buildComprehensivePrompt(
    userJourney: UserJourney,
    conversationContext: ConversationContext,
    relevantKnowledge: string,
    preferences: OnboardingPreferences | null,
    betaContext: string | null = null
  ): Promise<string> {
    // Use the new "Her" mode Maya prompt - CLEAN, NO ADDITIONS
    // The Her mode prompt already contains everything Maya needs
    let prompt = MAYA_HER_MODE_PROMPT;

    // Add ONLY essential conversation context (exchange count for word limits)
    const conversationHistory = this.getConversationHistory(userJourney.userId);
    const exchangeCount = Math.floor(conversationHistory.length / 2);

    prompt += `\n\nCurrent conversation: Exchange ${exchangeCount + 1}`;

    // That's it! No extra philosophy, knowledge, or sesame stuff
    // The Her mode prompt is complete on its own
    return prompt;
  }

  private getUserJourney(userId: string): UserJourney {
    if (!this.userJourneys.has(userId)) {
      this.userJourneys.set(userId, {
        userId,
        sessionCount: 1,
        primaryThemes: [],
        emotionalPatterns: [],
        growthEdges: [],
        currentPhase: 'exploration'
      });
    } else {
      const journey = this.userJourneys.get(userId)!;
      journey.sessionCount++;
    }
    return this.userJourneys.get(userId)!;
  }

  private analyzeConversationContext(input: string, userId: string): ConversationContext {
    const history = this.getConversationHistory(userId);

    return {
      currentEmotion: this.detectEmotion(input),
      energyLevel: this.assessEnergyLevel(input),
      needsType: this.identifyNeed(input, history),
      conversationDepth: Math.min(history.length / 2, 10),
      breakthroughPotential: this.assessBreakthroughPotential(input, history)
    };
  }

  private async callClaude(systemPrompt: string, messages: any[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('No Claude API key available');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 80, // Her mode: Brief but complete thoughts (10-20 words typical)
        temperature: 0.9, // Slightly higher for more natural, spontaneous responses
        system: systemPrompt,
        messages: messages
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json() as any;
    return data.content?.[0]?.text?.trim() || '';
  }

  private extractTopics(input: string, history: ConversationEntry[]): string[] {
    const topics = new Set<string>();

    // Extract from current input
    const patterns = [
      /\b(relationship|work|family|identity|purpose|career|love|friendship)\b/gi,
      /\b(anxiety|depression|stress|trauma|healing|growth|change)\b/gi,
      /\b(spiritual|consciousness|meaning|soul|sacred|divine)\b/gi,
      /\b(body|somatic|feeling|emotion|energy)\b/gi
    ];

    patterns.forEach(pattern => {
      const matches = input.match(pattern);
      if (matches) {
        matches.forEach(match => topics.add(match.toLowerCase()));
      }
    });

    // Extract from recent history
    history.slice(-3).forEach(entry => {
      if (entry.role === 'user') {
        patterns.forEach(pattern => {
          const matches = entry.content.match(pattern);
          if (matches) {
            matches.forEach(match => topics.add(match.toLowerCase()));
          }
        });
      }
    });

    return Array.from(topics);
  }

  private async generateKnowledgeBasedFallback(input: string, topics: string[]): Promise<string> {
    // Search knowledge base for relevant wisdom
    const relevantDocs = await maiaKnowledgeBase.searchKnowledge(input, 1);

    if (relevantDocs.length > 0) {
      const wisdom = relevantDocs[0].content.slice(0, 200);
      return `I hear something important in what you're sharing. ${wisdom}... What resonates with you about this?`;
    }

    // Generic but warm fallback
    const fallbacks = [
      "I'm having a moment of processing. Can you tell me more about what's most alive for you right now?",
      "Something in what you're sharing feels significant. What part wants the most attention?",
      "I'm here with you in this. What feels most important to express?"
    ];

    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  private detectEmotion(input: string): string {
    const emotions = {
      anger: /\b(angry|mad|pissed|furious|rage|hate)\b/i,
      sadness: /\b(sad|depressed|down|crying|tears|grief)\b/i,
      fear: /\b(scared|afraid|anxious|worried|nervous|panic)\b/i,
      joy: /\b(happy|joy|excited|grateful|blessed|amazing)\b/i,
      confusion: /\b(confused|lost|unclear|don't know|uncertain)\b/i
    };

    for (const [emotion, pattern] of Object.entries(emotions)) {
      if (pattern.test(input)) return emotion;
    }

    return 'neutral';
  }

  private assessEnergyLevel(input: string): 'low' | 'medium' | 'high' {
    if (input.length < 50) return 'low';
    if (input.includes('!') || input === input.toUpperCase()) return 'high';
    return 'medium';
  }

  private identifyNeed(input: string, history: ConversationEntry[]):
    'validation' | 'exploration' | 'guidance' | 'witness' | 'challenge' {

    const lower = input.toLowerCase();

    if (lower.includes('what should') || lower.includes('how do i')) return 'guidance';
    if (lower.includes('?')) return 'exploration';
    if (lower.includes('need to') || lower.includes('have to')) return 'challenge';
    if (history.length < 2) return 'witness';

    return 'validation';
  }

  private assessBreakthroughPotential(input: string, history: ConversationEntry[]): boolean {
    const breakthroughMarkers = [
      /\b(realize|realized|realizing)\b/i,
      /\b(see|seeing|understand|understanding)\b/i,
      /\b(shift|shifted|changing|changed)\b/i,
      /\b(fuck|shit|wow|oh)\b.*\b(actually|really|truth)\b/i
    ];

    return breakthroughMarkers.some(marker => marker.test(input));
  }

  private isBreakthroughMoment(input: string, response: string): boolean {
    return this.assessBreakthroughPotential(input, []) ||
           response.toLowerCase().includes('shift') ||
           response.toLowerCase().includes('breakthrough');
  }

  private updateUserJourney(journey: UserJourney, input: string, response: string): void {
    // Extract themes
    const topics = this.extractTopics(input, []);
    topics.forEach(topic => {
      if (!journey.primaryThemes.includes(topic)) {
        journey.primaryThemes.push(topic);
      }
    });

    // Track emotional patterns
    const emotion = this.detectEmotion(input);
    if (!journey.emotionalPatterns.includes(emotion) && emotion !== 'neutral') {
      journey.emotionalPatterns.push(emotion);
    }

    // Detect growth edges
    if (input.includes('want to') || input.includes('trying to')) {
      const edge = input.slice(input.indexOf('to') + 3, input.indexOf('to') + 50);
      if (!journey.growthEdges.includes(edge)) {
        journey.growthEdges.push(edge);
      }
    }

    // Update phase based on depth
    if (journey.sessionCount > 5) journey.currentPhase = 'integration';
    else if (journey.sessionCount > 2) journey.currentPhase = 'processing';
  }

  private getConversationHistory(userId: string): ConversationEntry[] {
    if (!this.conversations.has(userId)) {
      this.conversations.set(userId, []);
    }
    return this.conversations.get(userId)!;
  }

  private storeConversation(userId: string, userInput: string, maiaResponse: string): void {
    const history = this.getConversationHistory(userId);
    const element = this.detectElement(maiaResponse);

    history.push({
      role: 'user',
      content: userInput,
      timestamp: new Date()
    });

    history.push({
      role: 'assistant',
      content: maiaResponse,
      timestamp: new Date(),
      element
    });

    // Keep last 50 exchanges
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }

  private isSimpleGreeting(input: string): boolean {
    const greeting = input.toLowerCase().trim();
    const simpleGreetings = ['hi', 'hello', 'hey', 'maia', 'hi maia', 'hello maia'];
    return simpleGreetings.includes(greeting) && input.length < 20;
  }

  private detectElement(response: string): 'fire' | 'water' | 'earth' | 'air' | 'aether' {
    const lower = response.toLowerCase();

    if (/action|energy|move|change|breakthrough|fire|passion|power|anger|will/i.test(lower)) {
      return 'fire';
    }

    if (/feel|emotion|heart|flow|tears|love|pain|hurt|gentle|soft|tender/i.test(lower)) {
      return 'water';
    }

    if (/think|mind|clarity|understand|perspective|idea|breath|space|notice/i.test(lower)) {
      return 'air';
    }

    if (/ground|body|practical|solid|foundation|present|here|stable|real/i.test(lower)) {
      return 'earth';
    }

    if (/spirit|soul|mystery|sacred|divine|whole|unity|beyond|infinite/i.test(lower)) {
      return 'aether';
    }

    return 'water';
  }

  private createResponse(message: string, element: 'fire' | 'water' | 'earth' | 'air' | 'aether'): MaiaResponse {
    const voiceMapping = {
      fire: { pace: 'energetic', tone: 'encouraging', energy: 'dynamic' },
      water: { pace: 'flowing', tone: 'empathetic', energy: 'gentle' },
      earth: { pace: 'deliberate', tone: 'warm_grounded', energy: 'calm' },
      air: { pace: 'quick', tone: 'curious', energy: 'light' },
      aether: { pace: 'spacious', tone: 'wise', energy: 'deep' }
    };

    return {
      message,
      element,
      duration: Math.max(1500, message.length * 60),
      voiceCharacteristics: voiceMapping[element]
    };
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 6) return 'late night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }

  /**
   * End conversation and save training data
   */
  async endConversation(userId: string, satisfaction?: number): Promise<void> {
    const conversationId = this.activeConversations.get(userId);
    if (conversationId) {
      await maiaTrainingLogger.endConversation(conversationId, satisfaction);
      this.activeConversations.delete(userId);
    }
  }

  /**
   * Export training data for future model development
   */
  async exportTrainingData(): Promise<string> {
    return maiaTrainingLogger.exportForFineTuning();
  }

  // Detect potential Maia-Maia conversation loops
  private detectMaiaLoop(input: string, userId: string): boolean {
    const history = this.getConversationHistory(userId);

    // Maia-like response patterns that suggest AI-to-AI conversation
    const maiaPatterns = [
      /^(I hear|I sense|I'm noticing|I feel|Mmm|Ah|Yeah that)/i,
      /well tuned to|attuning|holding space|feeling into/i,
      /(gentle|soft|warm) presence/i,
      /what wants to|what's alive|what's stirring/i
    ];

    // Check if input matches Maia's speaking patterns
    const matchesMaiaPattern = maiaPatterns.some(pattern => pattern.test(input));

    // Check if recent conversation has multiple Maia-style responses in sequence
    const recentMessages = history.slice(-6); // Last 6 messages
    const maiaStyleResponses = recentMessages.filter(msg =>
      msg.role === 'user' && maiaPatterns.some(pattern => pattern.test(msg.content))
    );

    // Flag as potential loop if:
    // 1. Current input matches Maia pattern AND
    // 2. Recent conversation has multiple Maia-style responses
    return matchesMaiaPattern && maiaStyleResponses.length >= 2;
  }

  // Compatibility method for existing tests
  async processMessage(input: string): Promise<{
    message: string;
    topics?: string[];
    emotions?: string[];
    elements?: string[];
    memoryTriggered?: boolean;
  }> {
    const response = await this.speak(input, 'test-user');
    return {
      message: response.message,
      elements: [response.element],
      memoryTriggered: false,
      topics: this.extractTopics(input, []),
      emotions: [this.detectEmotion(input)]
    };
  }
}

// Singleton instance for optimal performance
let instance: MaiaFullyEducatedOrchestrator | null = null;

export function getMaiaOrchestrator(): MaiaFullyEducatedOrchestrator {
  if (!instance) {
    instance = new MaiaFullyEducatedOrchestrator();
  }
  return instance;
}