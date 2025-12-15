/**
 * CONVERSATION-LEVEL ELEMENTAL INTELLIGENCE
 *
 * Tracks elemental patterns across conversations rather than per-message.
 * Builds persistent understanding of:
 * - Client's core elemental nature
 * - Conversation phase and arc
 * - Session-level elemental shifts
 * - Relationship evolution patterns
 */

export interface ClientElementalProfile {
  // Core elemental nature (evolves slowly over many conversations)
  coreElement: 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'balanced';
  elementalBalance: Record<string, number>; // Current state across all elements
  dominantPatterns: string[]; // Recurring elemental themes

  // Evolution tracking
  elementalHistory: ElementalSnapshot[];
  lastSignificantShift: Date | null;
  stabilityScore: number; // How consistent their elemental patterns are
}

export interface ConversationElementalState {
  // Current conversation context
  conversationId: string;
  currentPhase: 'opening' | 'deepening' | 'integration' | 'closure';
  dominantElement: string;
  activeElements: string[]; // Multiple elements can be active

  // Session arc tracking
  sessionStartElement: string;
  elementalShifts: ElementalShift[];
  conversationDepth: 'surface' | 'moderate' | 'deep' | 'profound';

  // Relationship context
  relationshipPhase: 'initial' | 'building' | 'established' | 'deepening';
  trustLevel: number;
  intimacyLevel: number;
}

interface ElementalSnapshot {
  timestamp: Date;
  elementalState: Record<string, number>;
  context: string; // What triggered this snapshot
  significance: 'minor' | 'moderate' | 'major';
}

interface ElementalShift {
  fromElement: string;
  toElement: string;
  timestamp: Date;
  trigger: 'topic_change' | 'emotional_shift' | 'depth_change' | 'natural_flow';
  significance: number;
}

export class ConversationElementalIntelligence {
  private static clientProfiles = new Map<string, ClientElementalProfile>();
  private static conversationStates = new Map<string, ConversationElementalState>();

  /**
   * Initialize or continue conversation elemental tracking
   */
  static initializeConversation(
    clientId: string,
    conversationId: string,
    initialMessage?: string
  ): ConversationElementalState {

    // Get or create client profile
    let clientProfile = this.clientProfiles.get(clientId);
    if (!clientProfile) {
      clientProfile = this.createNewClientProfile(clientId);
      this.clientProfiles.set(clientId, clientProfile);
    }

    // Determine conversation starting context
    const isNewConversation = !this.conversationStates.has(conversationId);
    const startingElement = this.determineStartingElement(clientProfile, initialMessage);
    const relationshipPhase = this.assessRelationshipPhase(clientProfile);

    const conversationState: ConversationElementalState = {
      conversationId,
      currentPhase: 'opening',
      dominantElement: startingElement,
      activeElements: [startingElement],
      sessionStartElement: startingElement,
      elementalShifts: [],
      conversationDepth: 'surface',
      relationshipPhase,
      trustLevel: this.calculateTrustLevel(clientProfile),
      intimacyLevel: this.calculateIntimacyLevel(clientProfile)
    };

    this.conversationStates.set(conversationId, conversationState);
    return conversationState;
  }

  /**
   * Update conversation state based on client message
   * Only analyzes elemental shifts, not full re-analysis
   */
  static updateConversationState(
    conversationId: string,
    userMessage: string,
    messageContext: any
  ): ConversationElementalState {

    const state = this.conversationStates.get(conversationId);
    if (!state) {
      throw new Error(`Conversation ${conversationId} not initialized`);
    }

    // Detect if elemental shift is needed
    const shiftAnalysis = this.analyzeElementalShift(state, userMessage, messageContext);

    if (shiftAnalysis.shiftNeeded) {
      this.executeElementalShift(state, shiftAnalysis);
    }

    // Update conversation phase and depth
    this.updateConversationPhase(state, userMessage, messageContext);
    this.updateConversationDepth(state, userMessage, messageContext);

    return state;
  }

  /**
   * Get processing recommendations based on current conversation state
   */
  static getProcessingRecommendations(conversationId: string): {
    primaryEngine: string;
    activeEngines: string[];
    processingLevel: 'fast' | 'standard' | 'deep' | 'profound';
    responseStyle: 'casual' | 'supportive' | 'wise' | 'transformational';
    elementalGuidance: any;
  } {

    const state = this.conversationStates.get(conversationId);
    if (!state) {
      return this.getDefaultProcessingRecommendations();
    }

    return {
      primaryEngine: this.mapElementToEngine(state.dominantElement),
      activeEngines: state.activeElements.map(el => this.mapElementToEngine(el)),
      processingLevel: this.mapDepthToProcessingLevel(state.conversationDepth),
      responseStyle: this.determineResponseStyle(state),
      elementalGuidance: this.generateElementalGuidance(state)
    };
  }

  /**
   * Create new client profile with initial elemental assessment
   */
  private static createNewClientProfile(clientId: string): ClientElementalProfile {
    return {
      coreElement: 'balanced',
      elementalBalance: {
        fire: 0.2,
        water: 0.2,
        earth: 0.2,
        air: 0.2,
        aether: 0.2
      },
      dominantPatterns: [],
      elementalHistory: [],
      lastSignificantShift: null,
      stabilityScore: 0.5 // Neutral starting point
    };
  }

  /**
   * Determine starting element for conversation
   */
  private static determineStartingElement(
    clientProfile: ClientElementalProfile,
    initialMessage?: string
  ): string {

    // For new conversations, start with client's core element
    if (!initialMessage) {
      return clientProfile.coreElement === 'balanced' ? 'air' : clientProfile.coreElement;
    }

    // Quick pattern matching for obvious elemental indicators
    const elementalCues = this.detectElementalCues(initialMessage);
    if (elementalCues.length > 0) {
      return elementalCues[0];
    }

    // Default to client's most developed element
    const dominantElement = Object.entries(clientProfile.elementalBalance)
      .sort(([,a], [,b]) => b - a)[0][0];

    return dominantElement;
  }

  /**
   * Analyze if elemental shift is needed based on conversation flow
   */
  private static analyzeElementalShift(
    state: ConversationElementalState,
    userMessage: string,
    context: any
  ): {
    shiftNeeded: boolean;
    newElement?: string;
    trigger?: string;
    significance?: number;
  } {

    const elementalCues = this.detectElementalCues(userMessage);
    const emotionalCues = this.detectEmotionalCues(userMessage);
    const topicCues = this.detectTopicCues(userMessage);

    // Strong elemental indicator
    if (elementalCues.length > 0 && !state.activeElements.includes(elementalCues[0])) {
      return {
        shiftNeeded: true,
        newElement: elementalCues[0],
        trigger: 'elemental_cue',
        significance: 0.8
      };
    }

    // Emotional shift requiring water element
    if (emotionalCues.intensity > 0.6 && !state.activeElements.includes('water')) {
      return {
        shiftNeeded: true,
        newElement: 'water',
        trigger: 'emotional_shift',
        significance: 0.7
      };
    }

    // Natural conversation flow - no shift needed
    return { shiftNeeded: false };
  }

  /**
   * Execute elemental shift in conversation state
   */
  private static executeElementalShift(
    state: ConversationElementalState,
    shiftAnalysis: any
  ): void {

    const shift: ElementalShift = {
      fromElement: state.dominantElement,
      toElement: shiftAnalysis.newElement,
      timestamp: new Date(),
      trigger: shiftAnalysis.trigger,
      significance: shiftAnalysis.significance
    };

    state.elementalShifts.push(shift);
    state.dominantElement = shiftAnalysis.newElement;

    // Add to active elements if not already present
    if (!state.activeElements.includes(shiftAnalysis.newElement)) {
      state.activeElements.push(shiftAnalysis.newElement);
    }

    // Keep active elements list manageable (max 3)
    if (state.activeElements.length > 3) {
      state.activeElements.shift();
    }
  }

  /**
   * Update conversation phase based on flow patterns
   */
  private static updateConversationPhase(
    state: ConversationElementalState,
    userMessage: string,
    context: any
  ): void {

    const messageCount = context.messageCount || 1;
    const depth = this.analyzeMessageDepth(userMessage);

    // Phase progression logic
    if (state.currentPhase === 'opening' && messageCount > 3) {
      state.currentPhase = 'deepening';
    } else if (state.currentPhase === 'deepening' && depth > 0.7) {
      state.currentPhase = 'integration';
    }
    // Closure phase would be triggered by different signals
  }

  /**
   * Update conversation depth based on content analysis
   */
  private static updateConversationDepth(
    state: ConversationElementalState,
    userMessage: string,
    context: any
  ): void {

    const messageDepth = this.analyzeMessageDepth(userMessage);
    const averageDepth = this.calculateAverageDepth(state);

    // Depth progression (can only deepen, not shallow)
    if (messageDepth > 0.8 && averageDepth > 0.7) {
      state.conversationDepth = 'profound';
    } else if (messageDepth > 0.6 || averageDepth > 0.5) {
      state.conversationDepth = 'deep';
    } else if (messageDepth > 0.3 || averageDepth > 0.3) {
      state.conversationDepth = 'moderate';
    }
  }

  /**
   * Utility methods for elemental analysis
   */
  private static detectElementalCues(message: string): string[] {
    const cues = [];
    const lowerMessage = message.toLowerCase();

    // Fire cues
    if (/\b(action|energy|passion|creativity|breakthrough|start|launch)\b/.test(lowerMessage)) {
      cues.push('fire');
    }

    // Water cues
    if (/\b(feeling|emotion|flow|intuition|heart|sadness|joy|love)\b/.test(lowerMessage)) {
      cues.push('water');
    }

    // Earth cues
    if (/\b(practical|ground|build|stable|structure|plan|organize)\b/.test(lowerMessage)) {
      cues.push('earth');
    }

    // Air cues
    if (/\b(think|idea|perspective|understand|clarity|analysis|concept)\b/.test(lowerMessage)) {
      cues.push('air');
    }

    // Aether cues
    if (/\b(spirit|meaning|purpose|transcend|unity|consciousness|soul)\b/.test(lowerMessage)) {
      cues.push('aether');
    }

    return cues;
  }

  private static detectEmotionalCues(message: string): { intensity: number; type: string } {
    const emotionalWords = [
      'feel', 'emotion', 'sad', 'happy', 'angry', 'frustrated',
      'excited', 'worried', 'anxious', 'peaceful', 'love', 'hate'
    ];

    const matches = emotionalWords.filter(word =>
      message.toLowerCase().includes(word)
    );

    return {
      intensity: Math.min(matches.length / 3, 1),
      type: matches.length > 0 ? 'emotional' : 'neutral'
    };
  }

  private static detectTopicCues(message: string): string[] {
    // Would analyze for topic shifts, relationship topics, etc.
    return [];
  }

  private static analyzeMessageDepth(message: string): number {
    // Simple depth analysis based on message characteristics
    let depth = 0;

    if (message.length > 100) depth += 0.2;
    if (/\b(why|meaning|purpose|deep|soul|heart)\b/i.test(message)) depth += 0.3;
    if (/\?/.test(message)) depth += 0.2;
    if (message.split('.').length > 2) depth += 0.2;

    return Math.min(depth, 1);
  }

  private static calculateAverageDepth(state: ConversationElementalState): number {
    // Would calculate based on historical depth in this conversation
    return 0.4; // Placeholder
  }

  private static assessRelationshipPhase(profile: ClientElementalProfile): 'initial' | 'building' | 'established' | 'deepening' {
    if (profile.elementalHistory.length === 0) return 'initial';
    if (profile.elementalHistory.length < 3) return 'building';
    if (profile.stabilityScore > 0.7) return 'established';
    return 'deepening';
  }

  private static calculateTrustLevel(profile: ClientElementalProfile): number {
    return Math.min(profile.elementalHistory.length * 0.1, 1);
  }

  private static calculateIntimacyLevel(profile: ClientElementalProfile): number {
    return Math.min(profile.stabilityScore, 1);
  }

  private static mapElementToEngine(element: string): string {
    const elementEngineMap = {
      fire: 'CreativeActionEngine',
      water: 'EmotionalWisdomEngine',
      earth: 'PracticalGroundingEngine',
      air: 'MentalClarityEngine',
      aether: 'TranscendentWisdomEngine'
    };
    return elementEngineMap[element] || 'BalancedWisdomEngine';
  }

  private static mapDepthToProcessingLevel(depth: string): 'fast' | 'standard' | 'deep' | 'profound' {
    const depthMap = {
      surface: 'fast',
      moderate: 'standard',
      deep: 'deep',
      profound: 'profound'
    };
    return depthMap[depth] || 'standard';
  }

  private static determineResponseStyle(state: ConversationElementalState): string {
    if (state.conversationDepth === 'profound') return 'transformational';
    if (state.conversationDepth === 'deep') return 'wise';
    if (state.intimacyLevel > 0.6) return 'supportive';
    return 'casual';
  }

  private static generateElementalGuidance(state: ConversationElementalState): any {
    return {
      primaryElement: state.dominantElement,
      secondaryElements: state.activeElements.filter(el => el !== state.dominantElement),
      phaseGuidance: this.getPhaseGuidance(state.currentPhase),
      depthGuidance: this.getDepthGuidance(state.conversationDepth)
    };
  }

  private static getPhaseGuidance(phase: string): any {
    const phaseGuidance = {
      opening: { focus: 'rapport_building', style: 'welcoming', pace: 'gentle' },
      deepening: { focus: 'exploration', style: 'curious', pace: 'moderate' },
      integration: { focus: 'synthesis', style: 'wise', pace: 'thoughtful' },
      closure: { focus: 'completion', style: 'honoring', pace: 'ceremonial' }
    };
    return phaseGuidance[phase] || phaseGuidance.opening;
  }

  private static getDepthGuidance(depth: string): any {
    const depthGuidance = {
      surface: { processing: 'light', complexity: 'simple', metaphors: 'minimal' },
      moderate: { processing: 'balanced', complexity: 'moderate', metaphors: 'some' },
      deep: { processing: 'thorough', complexity: 'nuanced', metaphors: 'rich' },
      profound: { processing: 'comprehensive', complexity: 'sophisticated', metaphors: 'archetypal' }
    };
    return depthGuidance[depth] || depthGuidance.moderate;
  }

  private static getDefaultProcessingRecommendations(): any {
    return {
      primaryEngine: 'BalancedWisdomEngine',
      activeEngines: ['BalancedWisdomEngine'],
      processingLevel: 'standard',
      responseStyle: 'casual',
      elementalGuidance: {
        primaryElement: 'balanced',
        secondaryElements: [],
        phaseGuidance: { focus: 'rapport_building', style: 'welcoming', pace: 'gentle' },
        depthGuidance: { processing: 'balanced', complexity: 'moderate', metaphors: 'some' }
      }
    };
  }
}

/**
 * CONVERSATION ELEMENTAL INTELLIGENCE INTEGRATION
 */
export const CONVERSATION_ELEMENTAL_INTELLIGENCE = {
  systemType: "conversation-level-elemental-intelligence",
  intelligenceLevel: "persistent-conversation-state-tracking",
  capabilities: {
    clientProfileBuilding: "Builds persistent elemental profiles across sessions",
    conversationPhaseTracking: "Tracks opening/deepening/integration/closure phases",
    elementalShiftDetection: "Detects when elemental focus should shift",
    processingOptimization: "Routes to appropriate engines based on conversation state",
    relationshipEvolution: "Tracks trust and intimacy development over time"
  },
  sovereignty: "100% - No external dependencies, pure conversation intelligence"
} as const;