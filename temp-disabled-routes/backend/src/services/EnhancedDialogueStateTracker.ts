import { AgentResponse } from "../types/agentResponse";
import { 
  ConversationMemory, 
  AgentResponse, 
  UserState,
  ElementalOther 
} from '../types/agentCommunication';
import { EmotionAnalysisResult, emotionAnalysisService } from './EmotionAnalysisService';
import { ConversationThreadingService } from './ConversationThreadingService';
import { logger } from '../utils/logger';

// Enhanced dialogue state with intent, topic, emotion, and context
export interface DialogueState {
  // Core conversation tracking
  threadId: string;
  userId: string;
  turnCount: number;
  timestamp: Date;
  
  // Intent detection
  intent: {
    primary: UserIntent;
    confidence: number;
    secondary?: UserIntent[];
    contextualGoals: string[];
  };
  
  // Topic management
  topic: {
    current: string;
    history: TopicTransition[];
    entities: Entity[];
    keywords: string[];
    coherenceScore: number;
  };
  
  // Emotional state
  emotion: {
    current: EmotionAnalysisResult;
    trajectory: EmotionTrajectory;
    resonanceMap: Map<string, number>;
    elementalAlignment: ElementalOther;
  };
  
  // Dialogue flow
  flow: {
    stage: DialogueStage;
    momentum: number; // 0-1, how engaged/flowing
    interruptions: number;
    silences: SilencePattern[];
    turnTaking: TurnPattern;
  };
  
  // Context management
  context: {
    shortTerm: string[]; // Last 3-5 turns
    longTerm: string[]; // Key memories
    activeThreads: string[]; // Unresolved topics
    backgroundContext: Map<string, any>;
  };
  
  // Relationship dynamics
  relationship: {
    trust: number;
    openness: number;
    resistance: ResistancePattern[];
    breakthroughs: string[];
    synapticHealth: number;
  };
  
  // Meta-conversational awareness
  meta: {
    userAwareness: number; // How aware user is of process
    processReflections: string[];
    emergentThemes: string[];
    transformativeMarkers: string[];
  };
}

// User intent categories
export enum UserIntent {
  // Informational
  SEEKING_INFORMATION = 'seeking_information',
  CLARIFICATION = 'clarification',
  EXPLORATION = 'exploration',
  
  // Emotional
  VENTING = 'venting',
  SEEKING_SUPPORT = 'seeking_support',
  CELEBRATION = 'celebration',
  PROCESSING_GRIEF = 'processing_grief',
  
  // Relational
  CONNECTION = 'connection',
  CHALLENGING = 'challenging',
  TESTING_BOUNDARIES = 'testing_boundaries',
  DEEPENING = 'deepening',
  
  // Transformational
  SEEKING_CHANGE = 'seeking_change',
  INTEGRATION = 'integration',
  BREAKTHROUGH = 'breakthrough',
  RESISTANCE = 'resistance',
  
  // Practical
  TASK_ORIENTED = 'task_oriented',
  PROBLEM_SOLVING = 'problem_solving',
  DECISION_MAKING = 'decision_making',
  
  // Spiritual/Philosophical
  MEANING_MAKING = 'meaning_making',
  EXISTENTIAL = 'existential',
  SPIRITUAL_INQUIRY = 'spiritual_inquiry'
}

// Dialogue stages
export enum DialogueStage {
  OPENING = 'opening',
  ESTABLISHING_RAPPORT = 'establishing_rapport',
  EXPLORING = 'exploring',
  DEEPENING = 'deepening',
  CHALLENGING = 'challenging',
  INTEGRATING = 'integrating',
  CLOSING = 'closing',
  BREAKTHROUGH = 'breakthrough'
}

// Topic transition tracking
interface TopicTransition {
  from: string;
  to: string;
  timestamp: Date;
  trigger: 'user_initiated' | 'agent_initiated' | 'natural_flow' | 'emotional_shift';
  smoothness: number; // 0-1
}

// Entity extraction
interface Entity {
  text: string;
  type: 'person' | 'place' | 'concept' | 'emotion' | 'time' | 'activity';
  salience: number;
  sentiment: number;
}

// Emotion trajectory
interface EmotionTrajectory {
  trend: 'ascending' | 'descending' | 'stable' | 'volatile';
  volatility: number;
  peakMoments: Array<{
    timestamp: Date;
    emotion: string;
    intensity: number;
  }>;
  baselineShift: number;
}

// Silence patterns
interface SilencePattern {
  duration: number;
  afterTopic: string;
  interpretation: 'processing' | 'resistance' | 'completion' | 'contemplation';
}

// Turn-taking patterns
interface TurnPattern {
  balance: number; // -1 (user dominant) to +1 (agent dominant)
  avgUserLength: number;
  avgAgentLength: number;
  interruptionRate: number;
}

// Resistance patterns
interface ResistancePattern {
  type: 'deflection' | 'denial' | 'intellectualization' | 'humor' | 'silence';
  topic: string;
  intensity: number;
  timestamp: Date;
}

export class EnhancedDialogueStateTracker {
  private static instance: EnhancedDialogueStateTracker;
  private states: Map<string, DialogueState> = new Map();
  private threadingService: ConversationThreadingService;
  
  // Intent patterns
  private intentPatterns = new Map<UserIntent, RegExp[]>([
    [UserIntent.SEEKING_INFORMATION, [
      /what is|how does|can you explain|tell me about/i,
      /I want to know|I'm curious about|wondering/i
    ]],
    [UserIntent.VENTING, [
      /I'm so frustrated|can't believe|annoyed|angry about/i,
      /need to get this off my chest|just need to vent/i
    ]],
    [UserIntent.SEEKING_SUPPORT, [
      /I need help|struggling with|hard time|difficult/i,
      /don't know what to do|feeling lost|overwhelmed/i
    ]],
    [UserIntent.CELEBRATION, [
      /I'm so happy|excited|achieved|accomplished|great news/i,
      /finally did it|success|wonderful/i
    ]],
    [UserIntent.EXISTENTIAL, [
      /meaning of|purpose|why are we here|what's the point/i,
      /existential|philosophy|deeper meaning/i
    ]],
    [UserIntent.RESISTANCE, [
      /I don't think|not sure about that|disagree|but what about/i,
      /that doesn't make sense|I doubt/i
    ]]
  ]);
  
  constructor() {
    this.threadingService = ConversationThreadingService.getInstance();
  }
  
  static getInstance(): EnhancedDialogueStateTracker {
    if (!EnhancedDialogueStateTracker.instance) {
      EnhancedDialogueStateTracker.instance = new EnhancedDialogueStateTracker();
    }
    return EnhancedDialogueStateTracker.instance;
  }
  
  // Initialize or update dialogue state
  async updateState(
    threadId: string,
    userId: string,
    userMessage: string,
    agentResponse?: AgentResponse,
    userState?: UserState
  ): Promise<DialogueState> {
    let state = this.states.get(threadId);
    
    if (!state) {
      state = await this.initializeState(threadId, userId);
    }
    
    // Update all state components
    state.turnCount++;
    state.timestamp = new Date();
    
    // Analyze user message
    const emotionAnalysis = await emotionAnalysisService.analyzeText(
      userMessage, 
      state.relationship.trust
    );
    
    // Update intent
    state.intent = await this.detectIntent(userMessage, state);
    
    // Update topic
    state.topic = await this.updateTopic(userMessage, state.topic);
    
    // Update emotion
    state.emotion = await this.updateEmotion(emotionAnalysis, state.emotion);
    
    // Update dialogue flow
    state.flow = this.updateFlow(userMessage, agentResponse, state);
    
    // Update context
    state.context = this.updateContext(userMessage, agentResponse, state.context);
    
    // Update relationship
    state.relationship = this.updateRelationship(
      userState || this.inferUserState(state),
      agentResponse,
      state.relationship
    );
    
    // Update meta-awareness
    state.meta = this.updateMetaAwareness(state);
    
    // Store updated state
    this.states.set(threadId, state);
    
    // Log state transition
    logger.info('Dialogue state updated', {
      threadId,
      intent: state.intent.primary,
      topic: state.topic.current,
      emotion: state.emotion.current.primaryEmotion?.emotion,
      stage: state.flow.stage,
      momentum: state.flow.momentum
    });
    
    return state;
  }
  
  // Initialize new dialogue state
  private async initializeState(threadId: string, userId: string): Promise<DialogueState> {
    return {
      threadId,
      userId,
      turnCount: 0,
      timestamp: new Date(),
      
      intent: {
        primary: UserIntent.EXPLORATION,
        confidence: 0.5,
        contextualGoals: []
      },
      
      topic: {
        current: 'greeting',
        history: [],
        entities: [],
        keywords: [],
        coherenceScore: 1.0
      },
      
      emotion: {
        current: await emotionAnalysisService.analyzeText('', 0),
        trajectory: {
          trend: 'stable',
          volatility: 0,
          peakMoments: [],
          baselineShift: 0
        },
        resonanceMap: new Map(),
        elementalAlignment: {
          element: 'air',
          voice: 'clear',
          demand: 'clarity',
          gift: 'perspective',
          resistance: 'ambiguity',
          alterity: 0.5
        }
      },
      
      flow: {
        stage: DialogueStage.OPENING,
        momentum: 0.5,
        interruptions: 0,
        silences: [],
        turnTaking: {
          balance: 0,
          avgUserLength: 0,
          avgAgentLength: 0,
          interruptionRate: 0
        }
      },
      
      context: {
        shortTerm: [],
        longTerm: [],
        activeThreads: [],
        backgroundContext: new Map()
      },
      
      relationship: {
        trust: 0.3,
        openness: 0.3,
        resistance: [],
        breakthroughs: [],
        synapticHealth: 0.7
      },
      
      meta: {
        userAwareness: 0.2,
        processReflections: [],
        emergentThemes: [],
        transformativeMarkers: []
      }
    };
  }
  
  // Detect user intent with multi-label classification
  private async detectIntent(
    message: string, 
    state: DialogueState
  ): Promise<DialogueState['intent']> {
    const intents: Array<{ intent: UserIntent; score: number }> = [];
    
    // Pattern matching
    for (const [intent, patterns] of this.intentPatterns) {
      const score = patterns.reduce((acc, pattern) => {
        return pattern.test(message) ? acc + 1 : acc;
      }, 0) / patterns.length;
      
      if (score > 0) {
        intents.push({ intent, score });
      }
    }
    
    // Context-based intent boosting
    if (state.emotion.current.valence < -0.5) {
      const supportIndex = intents.findIndex(i => i.intent === UserIntent.SEEKING_SUPPORT);
      if (supportIndex >= 0) {
        intents[supportIndex].score *= 1.5;
      }
    }
    
    // Sort by score
    intents.sort((a, b) => b.score - a.score);
    
    // Extract primary and secondary intents
    const primary = intents[0]?.intent || UserIntent.EXPLORATION;
    const confidence = intents[0]?.score || 0.3;
    const secondary = intents.slice(1, 3).map(i => i.intent);
    
    // Contextual goals based on intent
    const contextualGoals = this.deriveContextualGoals(primary, state);
    
    return {
      primary,
      confidence,
      secondary: secondary.length > 0 ? secondary : undefined,
      contextualGoals
    };
  }
  
  // Derive contextual goals from intent
  private deriveContextualGoals(intent: UserIntent, state: DialogueState): string[] {
    const goals: string[] = [];
    
    switch (intent) {
      case UserIntent.SEEKING_SUPPORT:
        goals.push('provide emotional validation');
        goals.push('offer practical perspective');
        if (state.relationship.trust > 0.6) {
          goals.push('gently challenge growth edges');
        }
        break;
        
      case UserIntent.EXPLORATION:
        goals.push('maintain open curiosity');
        goals.push('follow emerging threads');
        goals.push('deepen understanding');
        break;
        
      case UserIntent.RESISTANCE:
        goals.push('honor the resistance');
        goals.push('explore what it protects');
        goals.push('maintain creative tension');
        break;
        
      case UserIntent.BREAKTHROUGH:
        goals.push('support integration');
        goals.push('anchor new insights');
        goals.push('celebrate transformation');
        break;
    }
    
    return goals;
  }
  
  // Update topic tracking
  private async updateTopic(
    message: string,
    currentTopic: DialogueState['topic']
  ): Promise<DialogueState['topic']> {
    // Extract entities
    const entities = this.extractEntities(message);
    
    // Extract keywords
    const keywords = this.extractKeywords(message);
    
    // Determine new topic
    const newTopic = this.identifyTopic(message, entities, keywords);
    
    // Track transition if topic changed
    if (newTopic !== currentTopic.current && newTopic !== 'continuation') {
      currentTopic.history.push({
        from: currentTopic.current,
        to: newTopic,
        timestamp: new Date(),
        trigger: this.determineTransitionTrigger(message),
        smoothness: this.calculateTransitionSmoothness(currentTopic.current, newTopic)
      });
    }
    
    // Calculate coherence
    const coherenceScore = this.calculateCoherence(
      currentTopic.history,
      currentTopic.keywords,
      keywords
    );
    
    return {
      current: newTopic !== 'continuation' ? newTopic : currentTopic.current,
      history: currentTopic.history,
      entities: [...currentTopic.entities, ...entities].slice(-20),
      keywords: [...currentTopic.keywords, ...keywords].slice(-30),
      coherenceScore
    };
  }
  
  // Extract entities from message
  private extractEntities(message: string): Entity[] {
    const entities: Entity[] = [];
    
    // Simple entity extraction (in production, use NLP library)
    const personPattern = /(?:I|you|we|they|he|she|my \w+|your \w+)/gi;
    const timePattern = /(?:today|tomorrow|yesterday|last \w+|next \w+|\d+ (?:days?|weeks?|months?|years?))/gi;
    const emotionPattern = /(?:happy|sad|angry|excited|worried|anxious|calm|peaceful)/gi;
    
    const personMatches = message.match(personPattern) || [];
    const timeMatches = message.match(timePattern) || [];
    const emotionMatches = message.match(emotionPattern) || [];
    
    personMatches.forEach(match => {
      entities.push({
        text: match,
        type: 'person',
        salience: 0.7,
        sentiment: 0
      });
    });
    
    timeMatches.forEach(match => {
      entities.push({
        text: match,
        type: 'time',
        salience: 0.5,
        sentiment: 0
      });
    });
    
    emotionMatches.forEach(match => {
      entities.push({
        text: match,
        type: 'emotion',
        salience: 0.8,
        sentiment: this.getEmotionSentiment(match)
      });
    });
    
    return entities;
  }
  
  // Extract keywords
  private extractKeywords(message: string): string[] {
    const words = message.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
    
    return words
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 5);
  }
  
  // Identify topic from message content
  private identifyTopic(message: string, entities: Entity[], keywords: string[]): string {
    // Topic identification logic
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('relationship') || lowerMessage.includes('partner')) {
      return 'relationships';
    } else if (lowerMessage.includes('work') || lowerMessage.includes('job')) {
      return 'career';
    } else if (lowerMessage.includes('feel') || entities.some(e => e.type === 'emotion')) {
      return 'emotions';
    } else if (lowerMessage.includes('meaning') || lowerMessage.includes('purpose')) {
      return 'existential';
    } else if (keywords.length > 0) {
      return keywords[0];
    }
    
    return 'continuation';
  }
  
  // Update emotion tracking
  private async updateEmotion(
    current: EmotionAnalysisResult,
    previousEmotion: DialogueState['emotion']
  ): Promise<DialogueState['emotion']> {
    // Update trajectory
    const trajectory = this.calculateEmotionTrajectory(
      current,
      previousEmotion.trajectory,
      previousEmotion.current
    );
    
    // Update resonance map
    const resonanceMap = new Map(previousEmotion.resonanceMap);
    if (current.primaryEmotion) {
      const currentResonance = resonanceMap.get(current.primaryEmotion.emotion) || 0;
      resonanceMap.set(
        current.primaryEmotion.emotion,
        currentResonance + current.primaryEmotion.intensity
      );
    }
    
    // Determine elemental alignment
    const elementalAlignment = this.determineElementalAlignment(current);
    
    return {
      current,
      trajectory,
      resonanceMap,
      elementalAlignment
    };
  }
  
  // Calculate emotion trajectory
  private calculateEmotionTrajectory(
    current: EmotionAnalysisResult,
    previousTrajectory: EmotionTrajectory,
    previous: EmotionAnalysisResult
  ): EmotionTrajectory {
    const valenceDiff = current.valence - previous.valence;
    const arousalDiff = current.arousal - previous.arousal;
    
    // Determine trend
    let trend: EmotionTrajectory['trend'] = 'stable';
    if (Math.abs(valenceDiff) > 0.3) {
      trend = valenceDiff > 0 ? 'ascending' : 'descending';
    } else if (Math.abs(arousalDiff) > 0.4) {
      trend = 'volatile';
    }
    
    // Calculate volatility
    const volatility = Math.sqrt(valenceDiff ** 2 + arousalDiff ** 2);
    
    // Track peak moments
    const peakMoments = [...previousTrajectory.peakMoments];
    if (current.primaryEmotion && current.primaryEmotion.intensity > 0.7) {
      peakMoments.push({
        timestamp: new Date(),
        emotion: current.primaryEmotion.emotion,
        intensity: current.primaryEmotion.intensity
      });
    }
    
    // Calculate baseline shift
    const baselineShift = previousTrajectory.baselineShift + valenceDiff * 0.3;
    
    return {
      trend,
      volatility: (previousTrajectory.volatility + volatility) / 2,
      peakMoments: peakMoments.slice(-10),
      baselineShift: Math.max(-1, Math.min(1, baselineShift))
    };
  }
  
  // Determine elemental alignment based on emotion
  private determineElementalAlignment(emotion: EmotionAnalysisResult): ElementalOther {
    const { valence, arousal, energySignature } = emotion;
    
    if (arousal > 0.7 && valence > 0) {
      return {
        element: 'fire',
        voice: 'passionate and energizing',
        demand: 'action and transformation',
        gift: 'courage and vitality',
        resistance: 'stagnation',
        alterity: 0.8
      };
    } else if (arousal < 0.3 && valence > 0) {
      return {
        element: 'earth',
        voice: 'grounded and nurturing',
        demand: 'presence and patience',
        gift: 'stability and wisdom',
        resistance: 'rushing',
        alterity: 0.4
      };
    } else if (valence < -0.3) {
      return {
        element: 'water',
        voice: 'flowing and empathetic',
        demand: 'feeling and acceptance',
        gift: 'emotional depth',
        resistance: 'bypassing',
        alterity: 0.6
      };
    } else if (arousal > 0.5) {
      return {
        element: 'air',
        voice: 'clear and insightful',
        demand: 'understanding',
        gift: 'perspective',
        resistance: 'confusion',
        alterity: 0.5
      };
    } else {
      return {
        element: 'aether',
        voice: 'spacious and integrative',
        demand: 'wholeness',
        gift: 'connection',
        resistance: 'fragmentation',
        alterity: 0.7
      };
    }
  }
  
  // Update dialogue flow
  private updateFlow(
    userMessage: string,
    agentResponse: AgentResponse | undefined,
    state: DialogueState
  ): DialogueState['flow'] {
    const flow = { ...state.flow };
    
    // Update stage based on turn count and relationship
    flow.stage = this.determineDialogueStage(state);
    
    // Calculate momentum
    const messageLength = userMessage.split(' ').length;
    const engagement = messageLength > 10 ? 0.8 : messageLength > 5 ? 0.6 : 0.4;
    flow.momentum = (flow.momentum + engagement) / 2;
    
    // Track turn-taking
    const userLength = userMessage.split(' ').length;
    const agentLength = agentResponse?.phenomenological.primary.split(' ').length || 0;
    
    flow.turnTaking = {
      balance: this.calculateTurnBalance(userLength, agentLength, flow.turnTaking.balance),
      avgUserLength: (flow.turnTaking.avgUserLength * state.turnCount + userLength) / (state.turnCount + 1),
      avgAgentLength: agentLength > 0 
        ? (flow.turnTaking.avgAgentLength * state.turnCount + agentLength) / (state.turnCount + 1)
        : flow.turnTaking.avgAgentLength,
      interruptionRate: 0 // Would need real-time data
    };
    
    return flow;
  }
  
  // Determine dialogue stage
  private determineDialogueStage(state: DialogueState): DialogueStage {
    const { turnCount, relationship, emotion, flow } = state;
    
    if (turnCount < 3) {
      return DialogueStage.OPENING;
    } else if (turnCount < 6 && relationship.trust < 0.4) {
      return DialogueStage.ESTABLISHING_RAPPORT;
    } else if (emotion.trajectory.trend === 'volatile' && emotion.current.arousal > 0.7) {
      return DialogueStage.CHALLENGING;
    } else if (state.meta.transformativeMarkers.length > 0 && flow.momentum > 0.8) {
      return DialogueStage.BREAKTHROUGH;
    } else if (relationship.trust > 0.7 && flow.momentum > 0.6) {
      return DialogueStage.DEEPENING;
    } else if (flow.momentum < 0.3) {
      return DialogueStage.CLOSING;
    } else {
      return DialogueStage.EXPLORING;
    }
  }
  
  // Calculate turn balance
  private calculateTurnBalance(
    userLength: number,
    agentLength: number,
    previousBalance: number
  ): number {
    if (agentLength === 0) return previousBalance;
    
    const ratio = userLength / agentLength;
    const newBalance = ratio > 1.5 ? -0.5 : ratio < 0.5 ? 0.5 : 0;
    
    return (previousBalance + newBalance) / 2;
  }
  
  // Update context
  private updateContext(
    userMessage: string,
    agentResponse: AgentResponse | undefined,
    context: DialogueState['context']
  ): DialogueState['context'] {
    // Update short-term context
    const shortTerm = [...context.shortTerm, userMessage].slice(-5);
    
    // Identify key moments for long-term memory
    const longTerm = [...context.longTerm];
    if (this.isKeyMoment(userMessage)) {
      longTerm.push(userMessage);
    }
    
    // Track active threads
    const activeThreads = this.identifyActiveThreads(shortTerm, context.activeThreads);
    
    return {
      shortTerm,
      longTerm: longTerm.slice(-20),
      activeThreads,
      backgroundContext: context.backgroundContext
    };
  }
  
  // Update relationship dynamics
  private updateRelationship(
    userState: UserState,
    agentResponse: AgentResponse | undefined,
    relationship: DialogueState['relationship']
  ): DialogueState['relationship'] {
    // Update trust based on engagement
    const trustDelta = userState.agreementLevel > 0.7 ? 0.02 : 
                      userState.resistanceLevel > 0.7 ? -0.01 : 0.01;
    const trust = Math.max(0, Math.min(1, relationship.trust + trustDelta));
    
    // Update openness
    const openness = 1 - userState.resistanceLevel;
    
    // Track resistance patterns
    const resistance = [...relationship.resistance];
    if (userState.resistanceLevel > 0.6) {
      resistance.push({
        type: this.identifyResistanceType(userState),
        topic: 'current',
        intensity: userState.resistanceLevel,
        timestamp: new Date()
      });
    }
    
    // Update synaptic health
    const synapticHealth = agentResponse?.architectural.synapticGap || 0.5;
    
    return {
      trust,
      openness: (relationship.openness + openness) / 2,
      resistance: resistance.slice(-10),
      breakthroughs: relationship.breakthroughs,
      synapticHealth
    };
  }
  
  // Update meta-awareness
  private updateMetaAwareness(state: DialogueState): DialogueState['meta'] {
    const meta = { ...state.meta };
    
    // Calculate user awareness based on reflection markers
    const reflectionMarkers = ['I notice', 'I realize', 'I see that', 'interesting how'];
    const hasReflection = reflectionMarkers.some(marker => 
      state.context.shortTerm.some(msg => msg.toLowerCase().includes(marker))
    );
    
    if (hasReflection) {
      meta.userAwareness = Math.min(1, meta.userAwareness + 0.1);
    }
    
    // Identify emergent themes
    const themes = this.identifyEmergentThemes(state);
    meta.emergentThemes = [...new Set([...meta.emergentThemes, ...themes])].slice(-5);
    
    return meta;
  }
  
  // Helper methods
  private getEmotionSentiment(emotion: string): number {
    const positive = ['happy', 'excited', 'calm', 'peaceful'];
    const negative = ['sad', 'angry', 'worried', 'anxious'];
    
    if (positive.includes(emotion.toLowerCase())) return 1;
    if (negative.includes(emotion.toLowerCase())) return -1;
    return 0;
  }
  
  private determineTransitionTrigger(message: string): TopicTransition['trigger'] {
    if (message.includes('?')) return 'user_initiated';
    if (message.toLowerCase().includes('anyway') || message.includes('btw')) return 'user_initiated';
    return 'natural_flow';
  }
  
  private calculateTransitionSmoothness(from: string, to: string): number {
    // Simple implementation - in production would use semantic similarity
    return 0.5;
  }
  
  private calculateCoherence(
    history: TopicTransition[],
    previousKeywords: string[],
    currentKeywords: string[]
  ): number {
    if (history.length === 0) return 1.0;
    
    // Check keyword overlap
    const overlap = currentKeywords.filter(k => previousKeywords.includes(k)).length;
    const overlapRatio = overlap / Math.max(currentKeywords.length, 1);
    
    // Check transition smoothness
    const recentTransitions = history.slice(-3);
    const avgSmoothness = recentTransitions.reduce((sum, t) => sum + t.smoothness, 0) / 
                         Math.max(recentTransitions.length, 1);
    
    return (overlapRatio + avgSmoothness) / 2;
  }
  
  private isKeyMoment(message: string): boolean {
    const keyIndicators = [
      'realize', 'understand', 'breakthrough', 'aha', 'never thought',
      'that changes', 'now I see', 'transforms'
    ];
    
    return keyIndicators.some(indicator => 
      message.toLowerCase().includes(indicator)
    );
  }
  
  private identifyActiveThreads(
    shortTerm: string[],
    previousThreads: string[]
  ): string[] {
    // Simple implementation - track unresolved questions
    const questions = shortTerm
      .filter(msg => msg.includes('?'))
      .map(msg => msg.split('?')[0]);
    
    return [...new Set([...previousThreads, ...questions])].slice(-5);
  }
  
  private identifyResistanceType(userState: UserState): ResistancePattern['type'] {
    if (userState.groundingLevel < 0.3) return 'intellectualization';
    if (userState.resistanceLevel > 0.8) return 'denial';
    return 'deflection';
  }
  
  private inferUserState(state: DialogueState): UserState {
    return {
      agreementLevel: 1 - state.relationship.resistance.length * 0.1,
      resistanceLevel: state.relationship.resistance.length * 0.15,
      groundingLevel: state.emotion.current.dominance,
      complexityTolerance: state.meta.userAwareness
    };
  }
  
  private identifyEmergentThemes(state: DialogueState): string[] {
    const themes: string[] = [];
    
    // Check for recurring topics
    const topicCounts = new Map<string, number>();
    state.topic.history.forEach(t => {
      topicCounts.set(t.to, (topicCounts.get(t.to) || 0) + 1);
    });
    
    topicCounts.forEach((count, topic) => {
      if (count >= 3) themes.push(`recurring: ${topic}`);
    });
    
    // Check for emotional patterns
    if (state.emotion.trajectory.trend === 'ascending') {
      themes.push('emotional uplift');
    } else if (state.emotion.trajectory.volatility > 0.7) {
      themes.push('emotional processing');
    }
    
    return themes;
  }
  
  // Public API
  async getState(threadId: string): Promise<DialogueState | null> {
    return this.states.get(threadId) || null;
  }
  
  async getStateInsights(threadId: string): Promise<{
    readiness: string;
    suggestions: string[];
    warnings: string[];
  }> {
    const state = this.states.get(threadId);
    if (!state) {
      return {
        readiness: 'unknown',
        suggestions: [],
        warnings: []
      };
    }
    
    const suggestions: string[] = [];
    const warnings: string[] = [];
    
    // Analyze readiness
    let readiness = 'exploring';
    if (state.flow.stage === DialogueStage.DEEPENING && state.relationship.trust > 0.6) {
      readiness = 'ready_for_depth';
    } else if (state.flow.stage === DialogueStage.BREAKTHROUGH) {
      readiness = 'transforming';
    } else if (state.relationship.resistance.length > 3) {
      readiness = 'encountering_resistance';
    }
    
    // Generate suggestions
    if (state.flow.momentum < 0.4) {
      suggestions.push('Consider energizing the conversation with a fresh perspective');
    }
    if (state.relationship.trust < 0.5 && state.turnCount > 10) {
      suggestions.push('Focus on building rapport through validation and mirroring');
    }
    if (state.emotion.trajectory.trend === 'descending') {
      suggestions.push('Offer grounding and support for emotional processing');
    }
    
    // Generate warnings
    if (state.relationship.synapticHealth < 0.3) {
      warnings.push('Synaptic gap collapsing - increase creative tension');
    }
    if (state.emotion.trajectory.volatility > 0.8) {
      warnings.push('High emotional volatility - proceed with care');
    }
    
    return {
      readiness,
      suggestions,
      warnings
    };
  }
}

// Export singleton instance
export const dialogueStateTracker = EnhancedDialogueStateTracker.getInstance();