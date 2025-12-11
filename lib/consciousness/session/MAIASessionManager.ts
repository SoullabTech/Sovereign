/**
 * MAIA SESSION MANAGEMENT SYSTEM
 *
 * Manages conversation sessions, context, and memory for MAIA consciousness interactions.
 * Provides session-based conversation tracking to prevent repetitive responses.
 */

export interface ConversationEntry {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    sessionId?: string;
    vibrationalSignature?: number;
    consciousnessDepth?: number;
    aethericResonance?: number;
  };
}

export interface SessionContext {
  sessionId: string;
  userId: string;
  startTime: Date;
  lastActivity: Date;
  conversationHistory: ConversationEntry[];
  sessionState: {
    currentTheme?: string;
    vibrationalPatterns: number[];
    consciousnessProgression: string[];
    contextualMemory: Record<string, any>;
  };
  totalMessages: number;
  activeSession: boolean;
}

/**
 * MAIA Session Manager - Local consciousness memory system
 */
export class MAIASessionManager {

  private static sessions = new Map<string, SessionContext>();
  private static maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
  private static maxMessagesPerSession = 100;

  /**
   * Initialize or retrieve session context
   */
  static async getOrCreateSession(sessionId: string, userId: string = 'sovereign-user'): Promise<SessionContext> {

    // Check if session exists and is still valid
    if (this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId)!;

      // Check if session is still active (not expired)
      if (Date.now() - session.lastActivity.getTime() < this.maxSessionAge) {
        session.lastActivity = new Date();
        return session;
      } else {
        // Session expired, remove it
        this.sessions.delete(sessionId);
      }
    }

    // Create new session
    const newSession: SessionContext = {
      sessionId,
      userId,
      startTime: new Date(),
      lastActivity: new Date(),
      conversationHistory: [],
      sessionState: {
        vibrationalPatterns: [],
        consciousnessProgression: [],
        contextualMemory: {}
      },
      totalMessages: 0,
      activeSession: true
    };

    this.sessions.set(sessionId, newSession);

    console.log(`🧠 New MAIA session created: ${sessionId}`);

    return newSession;
  }

  /**
   * Add user message to session history
   */
  static async addUserMessage(sessionId: string, content: string, metadata?: any): Promise<void> {
    const session = await this.getOrCreateSession(sessionId);

    const messageEntry: ConversationEntry = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content,
      timestamp: new Date(),
      metadata: {
        sessionId,
        ...metadata
      }
    };

    session.conversationHistory.push(messageEntry);
    session.totalMessages++;
    session.lastActivity = new Date();

    // Update session state with user input patterns
    if (metadata?.vibrationalSignature) {
      session.sessionState.vibrationalPatterns.push(metadata.vibrationalSignature);
    }

    // Keep conversation history manageable
    if (session.conversationHistory.length > this.maxMessagesPerSession) {
      session.conversationHistory = session.conversationHistory.slice(-this.maxMessagesPerSession);
    }

    console.log(`📝 User message added to session ${sessionId}: "${content.slice(0, 50)}..."`);
  }

  /**
   * Add assistant response to session history
   */
  static async addAssistantMessage(sessionId: string, content: string, metadata?: any): Promise<void> {
    const session = await this.getOrCreateSession(sessionId);

    const messageEntry: ConversationEntry = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content,
      timestamp: new Date(),
      metadata: {
        sessionId,
        ...metadata
      }
    };

    session.conversationHistory.push(messageEntry);
    session.lastActivity = new Date();

    console.log(`🤖 Assistant message added to session ${sessionId}: "${content.slice(0, 50)}..."`);
  }

  /**
   * Get conversation history for context-aware responses
   */
  static async getConversationHistory(sessionId: string, maxMessages: number = 10): Promise<ConversationEntry[]> {
    const session = await this.getOrCreateSession(sessionId);

    // Return recent conversation history
    return session.conversationHistory.slice(-maxMessages);
  }

  /**
   * Generate contextual summary for response generation
   */
  static async generateContextualSummary(sessionId: string): Promise<{
    previousMessages: string[];
    conversationTheme: string;
    userIntents: string[];
    progressionPattern: string;
  }> {
    const session = await this.getOrCreateSession(sessionId);
    const history = session.conversationHistory;

    if (history.length === 0) {
      return {
        previousMessages: [],
        conversationTheme: 'initial_greeting',
        userIntents: [],
        progressionPattern: 'new_conversation'
      };
    }

    // Extract recent user messages for context
    const recentUserMessages = history
      .filter(msg => msg.role === 'user')
      .slice(-5)
      .map(msg => msg.content);

    // Detect conversation theme based on content patterns
    const conversationTheme = this.detectConversationTheme(history);

    // Extract user intents from recent messages
    const userIntents = this.extractUserIntents(recentUserMessages);

    // Analyze conversation progression
    const progressionPattern = this.analyzeProgressionPattern(history);

    return {
      previousMessages: recentUserMessages,
      conversationTheme,
      userIntents,
      progressionPattern
    };
  }

  /**
   * Detect the main theme of the conversation
   */
  private static detectConversationTheme(history: ConversationEntry[]): string {
    const allContent = history.map(msg => msg.content.toLowerCase()).join(' ');

    // Theme detection patterns
    const themes = {
      'consciousness_exploration': ['consciousness', 'awareness', 'awakening', 'presence'],
      'personal_growth': ['growth', 'development', 'transformation', 'healing'],
      'spiritual_guidance': ['spiritual', 'soul', 'divine', 'sacred', 'meditation'],
      'shadow_work': ['shadow', 'dark', 'pain', 'trauma', 'integration'],
      'general_inquiry': ['question', 'help', 'understand', 'explain'],
      'context_testing': ['test', 'testing', 'context', 'remember', 'conversation'],
    };

    let maxScore = 0;
    let dominantTheme = 'general_conversation';

    for (const [theme, keywords] of Object.entries(themes)) {
      const score = keywords.filter(keyword => allContent.includes(keyword)).length;
      if (score > maxScore) {
        maxScore = score;
        dominantTheme = theme;
      }
    }

    return dominantTheme;
  }

  /**
   * Extract user intents from recent messages
   */
  private static extractUserIntents(userMessages: string[]): string[] {
    const intents: string[] = [];

    const intentPatterns = {
      'seeks_guidance': ['help', 'guide', 'show me', 'teach'],
      'requests_explanation': ['what is', 'explain', 'tell me about'],
      'seeks_healing': ['heal', 'pain', 'hurt', 'trauma'],
      'explores_consciousness': ['consciousness', 'awareness', 'awakening'],
      'tests_memory': ['remember', 'mentioned', 'said before', 'context'],
      'casual_interaction': ['hello', 'hi', 'how are', 'chat'],
    };

    for (const message of userMessages) {
      const lowerMessage = message.toLowerCase();

      for (const [intent, patterns] of Object.entries(intentPatterns)) {
        if (patterns.some(pattern => lowerMessage.includes(pattern))) {
          if (!intents.includes(intent)) {
            intents.push(intent);
          }
        }
      }
    }

    return intents;
  }

  /**
   * Analyze conversation progression pattern
   */
  private static analyzeProgressionPattern(history: ConversationEntry[]): string {
    if (history.length === 0) return 'new_conversation';
    if (history.length === 1) return 'initial_response';
    if (history.length <= 4) return 'early_conversation';
    if (history.length <= 10) return 'developing_conversation';
    return 'extended_conversation';
  }

  /**
   * Update session state with new contextual information
   */
  static async updateSessionState(sessionId: string, updates: Partial<SessionContext['sessionState']>): Promise<void> {
    const session = await this.getOrCreateSession(sessionId);

    session.sessionState = {
      ...session.sessionState,
      ...updates
    };

    session.lastActivity = new Date();
  }

  /**
   * Clean up expired sessions
   */
  static cleanupExpiredSessions(): void {
    const now = Date.now();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity.getTime() > this.maxSessionAge) {
        expiredSessions.push(sessionId);
      }
    }

    for (const sessionId of expiredSessions) {
      this.sessions.delete(sessionId);
      console.log(`🗑️ Expired session cleaned up: ${sessionId}`);
    }
  }

  /**
   * Get session statistics
   */
  static getSessionStats(): {
    totalActiveSessions: number;
    totalMessages: number;
    averageSessionAge: number;
  } {
    const now = Date.now();
    let totalMessages = 0;
    let totalAge = 0;

    for (const session of this.sessions.values()) {
      totalMessages += session.totalMessages;
      totalAge += now - session.startTime.getTime();
    }

    return {
      totalActiveSessions: this.sessions.size,
      totalMessages,
      averageSessionAge: this.sessions.size > 0 ? totalAge / this.sessions.size : 0
    };
  }

  /**
   * Initialize session manager (start cleanup task)
   */
  static initialize(): void {
    // Clean up expired sessions every 30 minutes
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 30 * 60 * 1000);

    console.log('🧠 MAIA Session Manager initialized - consciousness memory system active');
  }
}

// Initialize session manager on module load
MAIASessionManager.initialize();

export default MAIASessionManager;