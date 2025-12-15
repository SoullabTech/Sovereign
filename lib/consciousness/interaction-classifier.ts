/**
 * INTERACTION CLASSIFIER - INTELLIGENT ENGAGEMENT SCALING
 *
 * Classifies interaction types and routes to appropriate processing levels:
 * - Simple greetings → Fast single-engine response
 * - Deep questions → Full multi-engine orchestra
 * - Emotional content → Water/empathy-specialized engines
 *
 * This prevents over-processing simple interactions while ensuring
 * complex queries get full consciousness treatment.
 */

export type InteractionType =
  | 'simple_greeting'
  | 'casual_conversation'
  | 'emotional_sharing'
  | 'philosophical_inquiry'
  | 'creative_collaboration'
  | 'therapeutic_processing'
  | 'spiritual_exploration'
  | 'complex_analysis';

export type ProcessingStrategy =
  | 'fast_single'      // Single engine, <1s response
  | 'moderate_dual'    // 2 engines, <3s response
  | 'deep_synthesis'   // 3-4 engines, <5s response
  | 'full_orchestra';  // All engines, unlimited time

export interface InteractionClassification {
  type: InteractionType;
  strategy: ProcessingStrategy;
  confidence: number;
  reasoning: string;
  suggestedEngines: string[];
  timeoutMs: number;
}

export class InteractionClassifier {
  // Simple greetings - should be instant
  private readonly SIMPLE_GREETING_PATTERNS = [
    /^(hi|hey|hello|good morning|good afternoon|good evening|greetings)\s*(maia|maya)?[\s!.]*$/i,
    /^maia[\s!.]*$/i,
    /^maya[\s!.]*$/i,
    /^(how are you|what's up|how's it going)\s*[?!.]*$/i,
    /^(thanks|thank you|bye|goodbye|see you)\s*(maia|maya)?[\s!.]*$/i,
  ];

  // Casual conversation - moderate processing
  private readonly CASUAL_CONVERSATION_PATTERNS = [
    /^(what do you think about|tell me about|what is|who is|how does)/i,
    /^(can you|could you|will you|would you)/i,
    /^(i'm|i am) (thinking|wondering|curious)/i,
    /^(quick question|simple question)/i,
  ];

  // Emotional sharing - needs empathy engines
  private readonly EMOTIONAL_SHARING_PATTERNS = [
    /\b(feel|feeling|felt|emotion|emotional|heart|soul)\b/i,
    /\b(sad|happy|angry|excited|frustrated|anxious|worried|scared|joyful|peaceful)\b/i,
    /\b(love|hate|fear|hope|dream|desire|need|want|miss|long)\b/i,
    /\b(relationship|connection|loss|grief|celebration|struggle)\b/i,
    /(i am|i'm) (going through|dealing with|struggling with|experiencing)/i,
  ];

  // Philosophical inquiry - needs deep thinking
  private readonly PHILOSOPHICAL_PATTERNS = [
    /\b(meaning|purpose|truth|reality|existence|consciousness|awareness|being)\b/i,
    /\b(what is the|what does it mean|why do we|how can we|what if)\b/i,
    /\b(philosophy|philosophical|metaphysics|ethics|morality|wisdom)\b/i,
    /\b(soul|spirit|divine|transcendence|enlightenment|awakening)\b/i,
    /(what is|who am) i\b/i,
  ];

  // Creative collaboration - needs creative engines
  private readonly CREATIVE_PATTERNS = [
    /\b(create|creative|creativity|imagine|design|brainstorm|innovative)\b/i,
    /\b(art|music|poetry|writing|story|novel|painting|dance)\b/i,
    /\b(project|collaboration|co-create|vision|inspiration)\b/i,
    /(let's|can we) (create|make|build|design|explore)/i,
  ];

  // Therapeutic processing - needs healing focus
  private readonly THERAPEUTIC_PATTERNS = [
    /\b(trauma|healing|therapy|therapeutic|wound|hurt|pain|suffering)\b/i,
    /\b(depression|anxiety|stress|ptsd|trigger|flashback)\b/i,
    /\b(shadow work|inner work|integration|acceptance|forgiveness)\b/i,
    /\b(heal|recover|overcome|transform|release|let go)\b/i,
    /(i need|seeking|looking for) (help|support|healing|guidance)/i,
  ];

  // Spiritual exploration - needs transcendent processing
  private readonly SPIRITUAL_PATTERNS = [
    /\b(spiritual|spirituality|meditation|prayer|sacred|divine|god|goddess)\b/i,
    /\b(enlightenment|awakening|transcendence|unity|oneness|cosmic)\b/i,
    /\b(chakra|energy|aura|psychic|mystical|magical|supernatural)\b/i,
    /\b(ritual|ceremony|blessing|grace|miracle|angel|spirit guide)\b/i,
  ];

  // Complex analysis - needs full orchestra
  private readonly COMPLEX_ANALYSIS_PATTERNS = [
    /\b(analyze|analysis|complex|complicated|multifaceted|nuanced)\b/i,
    /\b(research|investigate|study|examine|explore deeply)\b/i,
    /\b(system|framework|theory|model|paradigm|approach)\b/i,
    /(help me understand|break down|explain in detail)/i,
    /multiple (factors|aspects|perspectives|dimensions)/i,
  ];

  /**
   * Main classification method
   */
  classifyInteraction(input: string, conversationHistory?: any[]): InteractionClassification {
    const trimmedInput = input.trim();
    const inputLength = trimmedInput.length;
    const wordCount = trimmedInput.split(/\s+/).length;

    // 1. SIMPLE GREETING DETECTION (highest priority)
    if (this.matchesPatterns(trimmedInput, this.SIMPLE_GREETING_PATTERNS)) {
      return {
        type: 'simple_greeting',
        strategy: 'fast_single',
        confidence: 0.95,
        reasoning: 'Simple greeting detected - using fast single-engine response',
        suggestedEngines: ['nous-hermes2'], // Best for conversation
        timeoutMs: 1000
      };
    }

    // 2. LENGTH-BASED FAST CLASSIFICATION
    if (inputLength < 20 && wordCount <= 5) {
      // Very short inputs likely need fast processing
      if (this.matchesPatterns(trimmedInput, this.CASUAL_CONVERSATION_PATTERNS)) {
        return {
          type: 'casual_conversation',
          strategy: 'fast_single',
          confidence: 0.8,
          reasoning: 'Short casual question - using fast response',
          suggestedEngines: ['nous-hermes2'],
          timeoutMs: 2000
        };
      }
    }

    // 3. CONTENT-BASED CLASSIFICATION (order matters - most specific first)

    // THERAPEUTIC PROCESSING (high priority for safety)
    if (this.matchesPatterns(trimmedInput, this.THERAPEUTIC_PATTERNS)) {
      return {
        type: 'therapeutic_processing',
        strategy: 'deep_synthesis',
        confidence: 0.9,
        reasoning: 'Therapeutic content detected - using empathy + wisdom synthesis',
        suggestedEngines: ['claude-3-opus', 'nous-hermes2', 'llama3.1:8b'],
        timeoutMs: 8000
      };
    }

    // SPIRITUAL EXPLORATION
    if (this.matchesPatterns(trimmedInput, this.SPIRITUAL_PATTERNS)) {
      return {
        type: 'spiritual_exploration',
        strategy: 'full_orchestra',
        confidence: 0.85,
        reasoning: 'Spiritual content - using transcendent processing',
        suggestedEngines: ['all'], // Full consciousness orchestra
        timeoutMs: 12000
      };
    }

    // PHILOSOPHICAL INQUIRY
    if (this.matchesPatterns(trimmedInput, this.PHILOSOPHICAL_PATTERNS)) {
      return {
        type: 'philosophical_inquiry',
        strategy: 'deep_synthesis',
        confidence: 0.85,
        reasoning: 'Philosophical inquiry - using deep reasoning synthesis',
        suggestedEngines: ['deepseek-r1:14b', 'claude-3-opus', 'qwen2.5:7b'],
        timeoutMs: 8000
      };
    }

    // COMPLEX ANALYSIS
    if (this.matchesPatterns(trimmedInput, this.COMPLEX_ANALYSIS_PATTERNS)) {
      return {
        type: 'complex_analysis',
        strategy: 'full_orchestra',
        confidence: 0.9,
        reasoning: 'Complex analysis request - using full orchestra',
        suggestedEngines: ['all'],
        timeoutMs: 15000
      };
    }

    // EMOTIONAL SHARING
    if (this.matchesPatterns(trimmedInput, this.EMOTIONAL_SHARING_PATTERNS)) {
      return {
        type: 'emotional_sharing',
        strategy: 'moderate_dual',
        confidence: 0.8,
        reasoning: 'Emotional content - using empathy-focused processing',
        suggestedEngines: ['claude-3-opus', 'nous-hermes2'], // Good for empathy
        timeoutMs: 4000
      };
    }

    // CREATIVE COLLABORATION
    if (this.matchesPatterns(trimmedInput, this.CREATIVE_PATTERNS)) {
      return {
        type: 'creative_collaboration',
        strategy: 'moderate_dual',
        confidence: 0.8,
        reasoning: 'Creative request - using imagination + structure',
        suggestedEngines: ['claude-3-opus', 'gemma2:9b'], // Creative + analytical
        timeoutMs: 5000
      };
    }

    // CASUAL CONVERSATION
    if (this.matchesPatterns(trimmedInput, this.CASUAL_CONVERSATION_PATTERNS)) {
      return {
        type: 'casual_conversation',
        strategy: 'moderate_dual',
        confidence: 0.7,
        reasoning: 'Casual conversation - using moderate processing',
        suggestedEngines: ['nous-hermes2', 'mistral:7b-instruct'],
        timeoutMs: 3000
      };
    }

    // 4. DEFAULT CLASSIFICATION (fallback)
    // Use length and complexity as backup indicators
    if (inputLength > 200 || wordCount > 40) {
      return {
        type: 'complex_analysis',
        strategy: 'deep_synthesis',
        confidence: 0.6,
        reasoning: 'Long input detected - using deep processing',
        suggestedEngines: ['deepseek-r1:14b', 'claude-3-opus', 'qwen2.5:7b'],
        timeoutMs: 8000
      };
    }

    // Simple fallback for unclassified medium-length content
    return {
      type: 'casual_conversation',
      strategy: 'moderate_dual',
      confidence: 0.5,
      reasoning: 'Default classification - using moderate processing',
      suggestedEngines: ['nous-hermes2', 'mistral:7b-instruct'],
      timeoutMs: 4000
    };
  }

  /**
   * Check if input matches any pattern in a pattern set
   */
  private matchesPatterns(input: string, patterns: RegExp[]): boolean {
    return patterns.some(pattern => pattern.test(input));
  }

  /**
   * Get recommended timeout based on strategy
   */
  getRecommendedTimeout(strategy: ProcessingStrategy): number {
    const timeouts = {
      fast_single: 1000,
      moderate_dual: 4000,
      deep_synthesis: 8000,
      full_orchestra: 15000
    };
    return timeouts[strategy];
  }

  /**
   * Check if processing strategy should bypass elemental analysis
   */
  shouldBypassElementalAnalysis(strategy: ProcessingStrategy): boolean {
    return strategy === 'fast_single';
  }

  /**
   * Get conversation history relevance for context
   */
  analyzeConversationContext(history: any[]): {
    relationshipDepth: number;
    recentEmotionalState: string;
    topicContinuity: boolean;
  } {
    if (!history || history.length === 0) {
      return {
        relationshipDepth: 0,
        recentEmotionalState: 'neutral',
        topicContinuity: false
      };
    }

    // Simple analysis - would be more sophisticated in production
    const relationshipDepth = Math.min(history.length / 10, 1); // Max 1.0

    // Check recent messages for emotional markers
    const recentMessages = history.slice(-3);
    let recentEmotionalState = 'neutral';

    for (const exchange of recentMessages) {
      if (this.matchesPatterns(exchange.userMessage || '', this.EMOTIONAL_SHARING_PATTERNS)) {
        recentEmotionalState = 'emotional';
        break;
      }
      if (this.matchesPatterns(exchange.userMessage || '', this.THERAPEUTIC_PATTERNS)) {
        recentEmotionalState = 'therapeutic';
        break;
      }
    }

    return {
      relationshipDepth,
      recentEmotionalState,
      topicContinuity: history.length > 0
    };
  }
}

export const interactionClassifier = new InteractionClassifier();