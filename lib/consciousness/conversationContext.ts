// lib/consciousness/conversationContext.ts
// MAIA-PAI Conversational Kernel Implementation
// Based on the patterns that made MAIA-PAI naturally conversational

export interface ConversationSpine {
  sessionId: string;
  memberArchetype?: 'seeker' | 'explorer' | 'alchemist' | 'sage' | 'warrior' | 'unknown';
  elementalPattern?: 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'mixed' | 'emerging';
  emotionalClimate: 'calm' | 'turbulent' | 'curious' | 'urgent' | 'reflective' | 'unknown';
  currentThread: string; // What they're actually talking about right now
  longArcThemes: string[]; // 2-3 recurring patterns across sessions
  last3KeyMoments: ConversationMoment[];
  userStatedGoals: string[];
  conversationDepth: 'opening' | 'early' | 'deeper' | 'intimate';
  trustLevel: number; // 0-1, calculated from interaction history
  messageCount: number;
  timestamp: Date;
}

export interface ConversationMoment {
  turn: number;
  userMessage: string;
  maiaResponse: string;
  significance: 'breakthrough' | 'vulnerability' | 'insight' | 'connection' | 'routine';
  timestamp: Date;
}

export interface ConversationDepthConfig {
  maxTokens: number;
  depthGuidance: string;
  responseStyle: 'minimal' | 'brief' | 'measured' | 'full';
}

export class ConversationContext {
  private spine: ConversationSpine;

  constructor(sessionId: string, initialData?: Partial<ConversationSpine>) {
    this.spine = {
      sessionId,
      emotionalClimate: 'unknown',
      currentThread: '',
      longArcThemes: [],
      last3KeyMoments: [],
      userStatedGoals: [],
      conversationDepth: 'opening',
      trustLevel: 0,
      messageCount: 0,
      timestamp: new Date(),
      ...initialData
    };
  }

  // MAIA-PAI Pattern: Determine conversation depth based on interaction history
  updateConversationDepth(newMessage: string): void {
    this.spine.messageCount++;

    // MAIA-PAI depth logic - simplified from original
    const isOpening = this.spine.messageCount <= 2;
    const isEarly = this.spine.messageCount <= 6;

    if (isOpening) {
      this.spine.conversationDepth = 'opening';
    } else if (isEarly) {
      this.spine.conversationDepth = 'early';
    } else {
      this.spine.conversationDepth = 'deeper';
    }

    // Update trust level - MAIA-PAI pattern
    this.spine.trustLevel = Math.min(this.spine.messageCount / 20, 1);
  }

  // MAIA-PAI Pattern: Get response configuration based on current depth
  getDepthConfig(mode: 'adaptive' | 'classic' = 'adaptive'): ConversationDepthConfig {
    const depth = this.spine.conversationDepth;

    if (mode === 'adaptive') {
      switch (depth) {
        case 'opening':
          return {
            maxTokens: 50, // ~8 words max for opening
            depthGuidance: '\n\nCONVERSATION STATE: Opening. Keep response to 8 words maximum. Simple greeting only.',
            responseStyle: 'minimal'
          };
        case 'early':
          return {
            maxTokens: 80, // ~15 words max for early conversation
            depthGuidance: '\n\nCONVERSATION STATE: Early conversation. Maximum 15 words. Direct and curious.',
            responseStyle: 'brief'
          };
        case 'deeper':
          return {
            maxTokens: 150, // ~25 words max for deeper conversation
            depthGuidance: '\n\nCONVERSATION STATE: Deeper conversation. Maximum 25 words. Still brief, more textured.',
            responseStyle: 'measured'
          };
        default:
          return this.getDepthConfig('classic');
      }
    } else {
      // Classic mode - more generous token limits
      switch (depth) {
        case 'opening':
          return {
            maxTokens: 100,
            depthGuidance: '\n\nCONVERSATION STATE: Opening. Brief but warm greeting.',
            responseStyle: 'brief'
          };
        case 'early':
          return {
            maxTokens: 200,
            depthGuidance: '\n\nCONVERSATION STATE: Early conversation. 2-3 sentences, thoughtful.',
            responseStyle: 'measured'
          };
        case 'deeper':
          return {
            maxTokens: 300,
            depthGuidance: '\n\nCONVERSATION STATE: Deeper conversation. Allow fuller responses with depth and nuance.',
            responseStyle: 'full'
          };
        default:
          return {
            maxTokens: 200,
            depthGuidance: '',
            responseStyle: 'measured'
          };
      }
    }
  }

  // MAIA-PAI Pattern: Throughline reflex - what's the core thread?
  calculateThroughline(): string {
    if (this.spine.last3KeyMoments.length === 0) {
      return "New conversation beginning.";
    }

    // Analyze last few key moments for patterns
    const recentThemes = this.spine.last3KeyMoments
      .map(moment => moment.userMessage.toLowerCase())
      .join(' ');

    // Simple keyword detection - could be enhanced with AI analysis
    if (recentThemes.includes('purpose') || recentThemes.includes('meaning')) {
      return "Exploring life purpose and meaning.";
    }
    if (recentThemes.includes('relationship') || recentThemes.includes('connect')) {
      return "Working through relationship dynamics.";
    }
    if (recentThemes.includes('career') || recentThemes.includes('work')) {
      return "Career and professional development.";
    }
    if (recentThemes.includes('spiritual') || recentThemes.includes('growth')) {
      return "Spiritual growth and development.";
    }

    return this.spine.currentThread || "General conversation and exploration.";
  }

  // MAIA-PAI Pattern: What's actually at stake for them?
  assessStakes(): string {
    const throughline = this.calculateThroughline();
    const climate = this.spine.emotionalClimate;

    if (climate === 'urgent' || climate === 'turbulent') {
      return "High stakes - they need support and clarity now.";
    }
    if (climate === 'curious' && throughline.includes('purpose')) {
      return "Medium stakes - seeking direction and meaning in life.";
    }
    if (climate === 'reflective') {
      return "Medium stakes - processing and integrating insights.";
    }

    return "Low stakes - casual exploration and connection.";
  }

  // Update conversation spine with new interaction
  addMoment(userMessage: string, maiaResponse: string, significance: ConversationMoment['significance'] = 'routine'): void {
    const moment: ConversationMoment = {
      turn: this.spine.messageCount,
      userMessage,
      maiaResponse,
      significance,
      timestamp: new Date()
    };

    // Keep only last 3 key moments
    this.spine.last3KeyMoments.unshift(moment);
    if (this.spine.last3KeyMoments.length > 3) {
      this.spine.last3KeyMoments.pop();
    }

    // Update current thread if it's significant
    if (significance !== 'routine') {
      this.spine.currentThread = userMessage;
    }

    this.spine.timestamp = new Date();
  }

  // Get current conversation state
  getSpine(): ConversationSpine {
    return { ...this.spine };
  }

  // Update specific spine elements
  updateElementalPattern(pattern: ConversationSpine['elementalPattern']): void {
    this.spine.elementalPattern = pattern;
  }

  updateEmotionalClimate(climate: ConversationSpine['emotionalClimate']): void {
    this.spine.emotionalClimate = climate;
  }

  updateMemberArchetype(archetype: ConversationSpine['memberArchetype']): void {
    this.spine.memberArchetype = archetype;
  }

  // Generate context summary for AI prompt
  generateContextPrompt(): string {
    const config = this.getDepthConfig();
    const throughline = this.calculateThroughline();
    const stakes = this.assessStakes();

    return `
CONVERSATION CONTEXT:
- Depth: ${this.spine.conversationDepth} (turn ${this.spine.messageCount})
- Throughline: ${throughline}
- Stakes: ${stakes}
- Emotional Climate: ${this.spine.emotionalClimate}
- Trust Level: ${(this.spine.trustLevel * 100).toFixed(0)}%
${config.depthGuidance}

NATURAL CONVERSATION BREATHING:
Depth emerges from accumulation of simple exchanges, not from performing wisdom.
Let the conversation breathe - pauses, simple observations, incomplete thoughts are natural.
    `.trim();
  }
}

// Factory function to create or retrieve conversation context
const conversationContexts = new Map<string, ConversationContext>();

export function getConversationContext(sessionId: string): ConversationContext {
  if (!conversationContexts.has(sessionId)) {
    conversationContexts.set(sessionId, new ConversationContext(sessionId));
  }
  return conversationContexts.get(sessionId)!;
}

// Helper to clean up old contexts (memory management)
export function cleanupOldContexts(maxAge: number = 24 * 60 * 60 * 1000): void {
  const now = Date.now();
  for (const [sessionId, context] of conversationContexts.entries()) {
    if (now - context.getSpine().timestamp.getTime() > maxAge) {
      conversationContexts.delete(sessionId);
    }
  }
}