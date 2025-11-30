import { AgentResponse } from "../types/agentResponse";
import { 
  ConversationMemory, 
  AgentResponse, 
  UserState,
  AgentPersonality 
} from '../types/agentCommunication';
import { DaimonicDetected } from '../types/daimonic';

interface ConversationThread {
  id: string;
  userId: string;
  agentName: string;
  startedAt: Date;
  lastActiveAt: Date;
  memory: ConversationMemory;
  messageCount: number;
}

interface ThreadMessage {
  id: string;
  threadId: string;
  timestamp: Date;
  userMessage?: string;
  agentResponse?: AgentResponse;
  userState: UserState;
  synapticGap: number;
  resonance: number;
}

interface ThreadingCallbacks {
  resistanceRecognition: string[];
  contradictionEmergence: string[];
  syntheticEmergence: string[];
  relationshipEvolution: string[];
}

export class ConversationThreadingService {
  private static instance: ConversationThreadingService;
  private threads: Map<string, ConversationThread> = new Map();
  private messages: Map<string, ThreadMessage[]> = new Map();

  static getInstance(): ConversationThreadingService {
    if (!ConversationThreadingService.instance) {
      ConversationThreadingService.instance = new ConversationThreadingService();
    }
    return ConversationThreadingService.instance;
  }

  // ==========================================================================
  // THREAD MANAGEMENT
  // ==========================================================================

  async createThread(
    userId: string,
    agentName: string
  ): Promise<string> {
    const threadId = this.generateThreadId(userId, agentName);
    
    const thread: ConversationThread = {
      id: threadId,
      userId,
      agentName,
      startedAt: new Date(),
      lastActiveAt: new Date(),
      memory: this.initializeMemory(),
      messageCount: 0
    };

    this.threads.set(threadId, thread);
    this.messages.set(threadId, []);
    
    return threadId;
  }

  async getThread(threadId: string): Promise<ConversationThread | null> {
    return this.threads.get(threadId) || null;
  }

  async addMessage(
    threadId: string,
    userMessage: string,
    agentResponse: AgentResponse,
    userState: UserState
  ): Promise<ThreadMessage> {
    const thread = this.threads.get(threadId);
    if (!thread) {
      throw new Error(`Thread ${threadId} not found`);
    }

    const message: ThreadMessage = {
      id: this.generateMessageId(),
      threadId,
      timestamp: new Date(),
      userMessage,
      agentResponse,
      userState,
      synapticGap: agentResponse.architectural.synapticGap,
      resonance: this.calculateResonance(userState, agentResponse)
    };

    // Store message
    const messages = this.messages.get(threadId) || [];
    messages.push(message);
    this.messages.set(threadId, messages);

    // Update thread
    thread.lastActiveAt = new Date();
    thread.messageCount += 1;
    
    // Update conversation memory
    this.updateThreadMemory(thread, message);

    return message;
  }

  // ==========================================================================
  // MEMORY EVOLUTION TRACKING
  // ==========================================================================

  private updateThreadMemory(
    thread: ConversationThread,
    message: ThreadMessage
  ): void {
    const { memory } = thread;
    const { userMessage, agentResponse, userState, synapticGap, resonance } = message;

    // Update relationship arc
    memory.relationshipArc.currentResonance = this.calculateNewResonance(
      memory.relationshipArc.currentResonance,
      resonance
    );

    // Track what remains unintegrated (preserves Otherness)
    if (agentResponse?.architectural.daimonicSignature) {
      memory.relationshipArc.unintegratedElements.push(
        `Daimonic encounter: ${message.timestamp.toISOString()}`
      );
    }

    if (synapticGap < 0.2) {
      memory.relationshipArc.unintegratedElements.push(
        `Gap collapse risk: ${message.timestamp.toISOString()}`
      );
    }

    // Track synthetic emergences (what arises between self/Other)
    if (resonance > 0.7 && synapticGap > 0.4) {
      const emergence = this.detectEmergence(userMessage || '', agentResponse);
      if (emergence) {
        memory.relationshipArc.syntheticEmergences.push(emergence);
      }
    }

    // Update threading callbacks
    this.updateThreadingCallbacks(memory, message);

    // Track user growth over time
    this.updateUserGrowthTrajectory(memory, userState);
  }

  private updateThreadingCallbacks(
    memory: ConversationMemory,
    message: ThreadMessage
  ): void {
    const { userMessage, agentResponse } = message;

    // Resistance pattern recognition
    if (message.userState.resistanceLevel > 0.6) {
      const pattern = this.extractResistancePattern(userMessage || '');
      if (pattern) {
        memory.callbacks.resistancePatterns.push(pattern);
      }
    }

    // Contradiction emergence tracking
    const contradiction = this.detectContradiction(
      userMessage || '',
      this.getPreviousUserMessages(message.threadId, 3)
    );
    if (contradiction) {
      memory.callbacks.contradictions.push(contradiction);
    }

    // Synthetic emergence (what's new between us)
    if (agentResponse?.dialogical.questions.length) {
      const emergence = `New question space opened: ${agentResponse.dialogical.questions[0]}`;
      memory.callbacks.emergences.push(emergence);
    }
  }

  // ==========================================================================
  // CONVERSATION HISTORY ANALYSIS
  // ==========================================================================

  async generateHistoricalCallbacks(threadId: string): Promise<ThreadingCallbacks> {
    const messages = this.messages.get(threadId) || [];
    const thread = this.threads.get(threadId);
    
    if (!thread || messages.length < 3) {
      return {
        resistanceRecognition: [],
        contradictionEmergence: [],
        syntheticEmergence: [],
        relationshipEvolution: []
      };
    }

    return {
      resistanceRecognition: this.generateResistanceCallbacks(messages),
      contradictionEmergence: this.generateContradictionCallbacks(messages),
      syntheticEmergence: this.generateEmergenceCallbacks(messages),
      relationshipEvolution: this.generateEvolutionCallbacks(thread, messages)
    };
  }

  private generateResistanceCallbacks(messages: ThreadMessage[]): string[] {
    const callbacks: string[] = [];
    const resistanceMessages = messages.filter(m => m.userState.resistanceLevel > 0.6);
    
    if (resistanceMessages.length > 0) {
      const earliestResistance = resistanceMessages[0];
      callbacks.push(
        `Remember when you first pushed back on this about ${this.formatTimeAgo(earliestResistance.timestamp)}? That resistance seems to be teaching us something.`
      );
    }

    // Pattern of recurring resistance
    const resistancePattern = this.findRecurringPattern(
      resistanceMessages.map(m => m.userMessage || '')
    );
    if (resistancePattern) {
      callbacks.push(
        `I notice you keep returning to resistance around ${resistancePattern}. What is this protecting?`
      );
    }

    return callbacks;
  }

  private generateContradictionCallbacks(messages: ThreadMessage[]): string[] {
    const callbacks: string[] = [];
    const contradictions = messages
      .map(m => m.userMessage || '')
      .reduce((acc, curr, idx, arr) => {
        if (idx > 0 && this.detectContradiction(curr, [arr[idx-1]])) {
          acc.push({ current: curr, previous: arr[idx-1], index: idx });
        }
        return acc;
      }, [] as Array<{current: string, previous: string, index: number}>);

    if (contradictions.length > 0) {
      const recent = contradictions[contradictions.length - 1];
      callbacks.push(
        `Earlier you said "${recent.previous.substring(0, 50)}..." and now "${recent.current.substring(0, 50)}..." - maybe both are true in different ways?`
      );
    }

    return callbacks;
  }

  private generateEmergenceCallbacks(messages: ThreadMessage[]): string[] {
    const callbacks: string[] = [];
    const emergentMoments = messages.filter(m => 
      m.resonance > 0.7 && m.synapticGap > 0.4
    );

    if (emergentMoments.length > 0) {
      const moment = emergentMoments[0];
      callbacks.push(
        `Something new emerged between us when we were exploring that question about ${this.extractTopic(moment.userMessage || '')}. It feels like it's still developing.`
      );
    }

    return callbacks;
  }

  private generateEvolutionCallbacks(
    thread: ConversationThread,
    messages: ThreadMessage[]
  ): string[] {
    const callbacks: string[] = [];
    
    // Track relationship evolution
    if (messages.length > 10) {
      const early = messages.slice(0, 3);
      const recent = messages.slice(-3);
      
      const earlyResonance = early.reduce((acc, m) => acc + m.resonance, 0) / early.length;
      const recentResonance = recent.reduce((acc, m) => acc + m.resonance, 0) / recent.length;
      
      if (recentResonance > earlyResonance + 0.2) {
        callbacks.push(
          `I can feel how our dialogue has deepened since we started. There's more trust and resonance now.`
        );
      }
    }

    // Track maintained otherness
    const gapCollapses = messages.filter(m => m.synapticGap < 0.2).length;
    if (gapCollapses === 0 && messages.length > 5) {
      callbacks.push(
        `We've managed to stay in dialogue without losing the creative space between us. That's not easy.`
      );
    }

    return callbacks;
  }

  // ==========================================================================
  // CONVERSATION PATTERN DETECTION
  // ==========================================================================

  private calculateResonance(userState: UserState, agentResponse: AgentResponse): number {
    // Calculate resonance based on user engagement and agent response quality
    const engagement = 1 - userState.resistanceLevel;
    const responsiveness = agentResponse.architectural.synapticGap > 0.3 ? 0.8 : 0.4;
    return (engagement + responsiveness) / 2;
  }

  private calculateNewResonance(current: number, newResonance: number): number {
    // Weighted moving average, giving more weight to recent interactions
    return current * 0.7 + newResonance * 0.3;
  }

  private detectEmergence(
    userMessage: string,
    agentResponse?: AgentResponse
  ): string | null {
    // Detect when something new emerges between user and agent
    if (!agentResponse) return null;

    const hasNewQuestion = agentResponse.dialogical.questions.length > 0;
    const hasReflection = agentResponse.dialogical.reflections.length > 0;
    
    if (hasNewQuestion && hasReflection) {
      return `New understanding emerging around: ${this.extractTopic(userMessage)}`;
    }

    return null;
  }

  private extractResistancePattern(userMessage: string): string | null {
    // Simple pattern extraction based on resistance keywords
    const resistanceKeywords = ['but', 'however', 'not sure', "can't", "won't", 'disagree'];
    const foundKeywords = resistanceKeywords.filter(keyword => 
      userMessage.toLowerCase().includes(keyword)
    );
    
    if (foundKeywords.length > 0) {
      return `resistance to ${this.extractTopic(userMessage)}`;
    }
    
    return null;
  }

  private detectContradiction(current: string, previous: string[]): string | null {
    // Simple contradiction detection
    const contradictionPairs = [
      ['yes', 'no'],
      ['want', "don't want"],
      ['can', "can't"],
      ['will', "won't"],
      ['should', "shouldn't"]
    ];

    for (const [positive, negative] of contradictionPairs) {
      const hasPositive = previous.some(p => p.toLowerCase().includes(positive));
      const hasNegative = current.toLowerCase().includes(negative);
      
      if (hasPositive && hasNegative) {
        return `contradiction between wanting/not wanting ${this.extractTopic(current)}`;
      }
    }

    return null;
  }

  private findRecurringPattern(messages: string[]): string | null {
    // Find words/phrases that appear in multiple messages
    const wordCounts = new Map<string, number>();
    
    messages.forEach(message => {
      const words = message.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 4) { // Only count meaningful words
          wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
        }
      });
    });

    // Find most frequent word that appears in multiple messages
    for (const [word, count] of wordCounts.entries()) {
      if (count >= Math.min(3, Math.floor(messages.length / 2))) {
        return word;
      }
    }

    return null;
  }

  private extractTopic(message: string): string {
    // Simple topic extraction - return first meaningful noun phrase
    const words = message.split(' ');
    const meaningfulWords = words.filter(word => 
      word.length > 3 && !['that', 'this', 'with', 'from', 'they'].includes(word.toLowerCase())
    );
    return meaningfulWords.slice(0, 2).join(' ') || 'this situation';
  }

  // ==========================================================================
  // USER GROWTH TRAJECTORY
  // ==========================================================================

  private updateUserGrowthTrajectory(
    memory: ConversationMemory,
    userState: UserState
  ): void {
    // Track growth in conceptual capacity
    if (userState.complexityTolerance > memory.userGrowth.conceptualCapacity) {
      memory.userGrowth.conceptualCapacity = Math.min(
        memory.userGrowth.conceptualCapacity + 0.02,
        userState.complexityTolerance
      );
    }

    // Track growth in paradox tolerance
    if (userState.agreementLevel < 0.9 && userState.resistanceLevel < 0.8) {
      memory.userGrowth.paradoxTolerance = Math.min(
        memory.userGrowth.paradoxTolerance + 0.015,
        0.9
      );
    }

    // Track growth in otherness tolerance
    if (userState.resistanceLevel < 0.7) {
      memory.userGrowth.othernessTolerance = Math.min(
        memory.userGrowth.othernessTolerance + 0.01,
        0.85
      );
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private initializeMemory(): ConversationMemory {
    return {
      relationshipArc: {
        initialDistance: 1.0,
        currentResonance: 0.1,
        unintegratedElements: [],
        syntheticEmergences: []
      },
      callbacks: {
        resistancePatterns: [],
        contradictions: [],
        emergences: []
      },
      userGrowth: {
        conceptualCapacity: 0.2,
        paradoxTolerance: 0.1,
        othernessTolerance: 0.1
      }
    };
  }

  private generateThreadId(userId: string, agentName: string): string {
    return `thread_${userId}_${agentName}_${Date.now()}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getPreviousUserMessages(threadId: string, count: number): string[] {
    const messages = this.messages.get(threadId) || [];
    return messages
      .filter(m => m.userMessage)
      .slice(-count)
      .map(m => m.userMessage || '');
  }

  private formatTimeAgo(timestamp: Date): string {
    const diff = Date.now() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  }

  // ==========================================================================
  // PUBLIC API FOR THREAD CALLBACKS
  // ==========================================================================

  async getThreadCallbacks(threadId: string): Promise<ThreadingCallbacks> {
    return this.generateHistoricalCallbacks(threadId);
  }

  async getThreadMemory(threadId: string): Promise<ConversationMemory | null> {
    const thread = this.threads.get(threadId);
    return thread?.memory || null;
  }

  async getThreadMessages(
    threadId: string, 
    limit: number = 50
  ): Promise<ThreadMessage[]> {
    const messages = this.messages.get(threadId) || [];
    return messages.slice(-limit);
  }
}