// Enhanced Sentiment Analysis Service for Multi-Agent Oracle Routing
// Provides sophisticated analysis to route users to the most appropriate agent experience

import { logger } from '../utils/logger';
import { getRelevantMemories } from './memoryService';

export interface SentimentAnalysis {
  // Primary emotional states
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    trust: number;
    anticipation: number;
    disgust: number;
  };

  // Conversation intent categories
  intent: {
    analytical: number;      // Logical thinking, problem-solving
    supportive: number;      // Emotional support, validation
    creative: number;        // Brainstorming, inspiration
    reflective: number;      // Self-exploration, meaning-making
    practical: number;       // Action planning, concrete steps
  };

  // Elemental alignments based on archetypal needs
  elementalAlignment: {
    fire: number;           // Catalyst, action, transformation
    water: number;          // Healing, emotions, flow
    earth: number;          // Grounding, practical, stable
    air: number;            // Clarity, communication, insight
    aether: number;         // Integration, transcendence, unity
  };

  // Context indicators
  context: {
    urgency: number;        // How urgent/immediate the need feels
    depth: number;          // How deep/surface level the sharing is
    clarity: number;        // How clear vs confused the person seems
    energy: number;         // Overall energy level (low to high)
    openness: number;       // Receptivity to guidance/challenge
  };

  // Recommendation for routing
  recommendation: {
    primaryElement: 'fire' | 'water' | 'earth' | 'air' | 'aether';
    secondaryElement?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
    responseMode: 'analytical' | 'supportive' | 'creative' | 'reflective' | 'practical';
    confidence: number;
    reasoning: string;
  };
}

export interface ConversationContext {
  userId: string;
  currentInput: string;
  conversationHistory?: any[];
  userProfile?: {
    preferredElements?: string[];
    communicationStyle?: string;
    pastPatterns?: any[];
  };
}

/**
 * Advanced Sentiment Analysis Service using multiple detection methods
 */
export class SentimentAnalysisService {

  /**
   * Main analysis method - combines multiple approaches for robust sentiment detection
   */
  async analyzeSentiment(context: ConversationContext): Promise<SentimentAnalysis> {
    const { userId, currentInput } = context;

    try {
      logger.info('Starting sentiment analysis', { userId, inputLength: currentInput.length });

      // Get conversation history for pattern analysis
      const memories = await getRelevantMemories(userId, currentInput, 5);

      // Run multiple analysis approaches
      const emotionalAnalysis = this.analyzeEmotionalContent(currentInput);
      const intentAnalysis = this.analyzeConversationIntent(currentInput);
      const elementalAnalysis = this.analyzeElementalAlignment(currentInput, memories);
      const contextAnalysis = this.analyzeContext(currentInput, memories);
      const userPatternAnalysis = this.analyzeUserPatterns(currentInput, memories);

      // Generate final recommendation
      const recommendation = this.generateRecommendation(
        emotionalAnalysis,
        intentAnalysis,
        elementalAnalysis,
        contextAnalysis,
        userPatternAnalysis
      );

      const analysis: SentimentAnalysis = {
        emotions: emotionalAnalysis,
        intent: intentAnalysis,
        elementalAlignment: elementalAnalysis,
        context: contextAnalysis,
        recommendation
      };

      logger.info('Sentiment analysis completed', {
        userId,
        primaryElement: recommendation.primaryElement,
        responseMode: recommendation.responseMode,
        confidence: recommendation.confidence
      });

      return analysis;

    } catch (error) {
      logger.error('Sentiment analysis failed', { userId, error });

      // Return fallback analysis
      return this.getFallbackAnalysis();
    }
  }

  /**
   * Analyze emotional content using word patterns and emotional indicators
   */
  private analyzeEmotionalContent(input: string): SentimentAnalysis['emotions'] {
    const lower = input.toLowerCase();

    // Emotional keyword patterns with weights
    const emotionPatterns = {
      joy: {
        keywords: ['happy', 'excited', 'joy', 'wonderful', 'amazing', 'grateful', 'celebration', 'love', 'bliss'],
        phrases: ['feeling great', 'so good', 'really happy'],
        multiplier: 1.0
      },
      sadness: {
        keywords: ['sad', 'depressed', 'down', 'hurt', 'pain', 'loss', 'grief', 'sorrow', 'disappointed'],
        phrases: ['feeling down', 'really sad', 'heartbroken'],
        multiplier: 1.2
      },
      anger: {
        keywords: ['angry', 'furious', 'mad', 'frustrated', 'rage', 'pissed', 'irritated', 'annoyed'],
        phrases: ['so angry', 'really mad', 'fed up'],
        multiplier: 1.1
      },
      fear: {
        keywords: ['afraid', 'scared', 'anxious', 'worried', 'panic', 'terrified', 'nervous', 'frightened'],
        phrases: ['so scared', 'really worried', 'afraid that'],
        multiplier: 1.3
      },
      surprise: {
        keywords: ['surprised', 'shocked', 'amazed', 'unexpected', 'sudden', 'wow'],
        phrases: ['didn\'t expect', 'never thought'],
        multiplier: 0.8
      },
      trust: {
        keywords: ['trust', 'faith', 'believe', 'confident', 'secure', 'safe', 'reliable'],
        phrases: ['I trust', 'feel safe', 'have faith'],
        multiplier: 0.9
      },
      anticipation: {
        keywords: ['excited', 'looking forward', 'can\'t wait', 'anticipating', 'hoping', 'expecting'],
        phrases: ['looking forward to', 'can\'t wait for', 'so excited about'],
        multiplier: 0.9
      },
      disgust: {
        keywords: ['disgusting', 'revolting', 'sick of', 'hate', 'repulsed', 'revolted'],
        phrases: ['sick of', 'can\'t stand', 'makes me sick'],
        multiplier: 1.0
      }
    };

    const emotions: SentimentAnalysis['emotions'] = {
      joy: 0, sadness: 0, anger: 0, fear: 0, surprise: 0, trust: 0, anticipation: 0, disgust: 0
    };

    // Calculate scores for each emotion
    for (const [emotion, patterns] of Object.entries(emotionPatterns)) {
      let score = 0;

      // Check keywords
      for (const keyword of patterns.keywords) {
        if (lower.includes(keyword)) {
          score += 0.3;
        }
      }

      // Check phrases (higher weight)
      for (const phrase of patterns.phrases) {
        if (lower.includes(phrase)) {
          score += 0.5;
        }
      }

      // Apply emotion-specific multiplier
      score *= patterns.multiplier;

      // Normalize to 0-1 range
      emotions[emotion as keyof typeof emotions] = Math.min(score, 1.0);
    }

    return emotions;
  }

  /**
   * Analyze conversation intent - what type of response the user needs
   */
  private analyzeConversationIntent(input: string): SentimentAnalysis['intent'] {
    const lower = input.toLowerCase();

    const intentPatterns = {
      analytical: {
        keywords: ['analyze', 'think', 'understand', 'logic', 'reason', 'problem', 'solution', 'decide', 'choice'],
        phrases: ['help me think', 'what should I', 'how do I', 'what would you'],
        weight: 1.0
      },
      supportive: {
        keywords: ['feel', 'hurt', 'support', 'comfort', 'validate', 'understand', 'listen', 'hear'],
        phrases: ['I need', 'feeling so', 'going through', 'struggling with'],
        weight: 1.2
      },
      creative: {
        keywords: ['create', 'imagine', 'brainstorm', 'inspiration', 'ideas', 'vision', 'dream', 'possibility'],
        phrases: ['what if', 'could I', 'want to create', 'dreaming of'],
        weight: 0.9
      },
      reflective: {
        keywords: ['meaning', 'purpose', 'why', 'deeper', 'soul', 'spiritual', 'journey', 'growth'],
        phrases: ['what does this mean', 'why am I', 'what\'s the point', 'feel like'],
        weight: 1.1
      },
      practical: {
        keywords: ['do', 'action', 'steps', 'plan', 'how', 'when', 'where', 'concrete', 'specific'],
        phrases: ['what steps', 'how to', 'need to do', 'action plan'],
        weight: 1.0
      }
    };

    const intent: SentimentAnalysis['intent'] = {
      analytical: 0, supportive: 0, creative: 0, reflective: 0, practical: 0
    };

    // Calculate intent scores
    for (const [intentType, patterns] of Object.entries(intentPatterns)) {
      let score = 0;

      // Keyword matching
      for (const keyword of patterns.keywords) {
        if (lower.includes(keyword)) {
          score += 0.2;
        }
      }

      // Phrase matching (higher weight)
      for (const phrase of patterns.phrases) {
        if (lower.includes(phrase)) {
          score += 0.4;
        }
      }

      // Apply weight and normalize
      score *= patterns.weight;
      intent[intentType as keyof typeof intent] = Math.min(score, 1.0);
    }

    return intent;
  }

  /**
   * Analyze elemental alignment based on archetypal needs
   */
  private analyzeElementalAlignment(input: string, memories: any[]): SentimentAnalysis['elementalAlignment'] {
    const lower = input.toLowerCase();

    const elementalPatterns = {
      fire: {
        keywords: ['action', 'passion', 'energy', 'drive', 'motivation', 'stuck', 'catalyst', 'change', 'break'],
        themes: ['transformation', 'breakthrough', 'ignition', 'courage', 'vision'],
        weight: 1.0
      },
      water: {
        keywords: ['emotion', 'feel', 'flow', 'healing', 'hurt', 'sad', 'love', 'heart', 'tears'],
        themes: ['emotional processing', 'grief', 'compassion', 'forgiveness', 'cleansing'],
        weight: 1.1
      },
      earth: {
        keywords: ['practical', 'grounded', 'stable', 'foundation', 'security', 'body', 'physical', 'real'],
        themes: ['manifestation', 'grounding', 'practical steps', 'stability', 'resources'],
        weight: 1.0
      },
      air: {
        keywords: ['think', 'idea', 'clarity', 'understand', 'communication', 'perspective', 'insight'],
        themes: ['understanding', 'communication', 'clarity', 'perspective', 'learning'],
        weight: 0.9
      },
      aether: {
        keywords: ['spiritual', 'soul', 'meaning', 'purpose', 'cosmic', 'universal', 'transcendent'],
        themes: ['integration', 'spiritual growth', 'unity', 'transcendence', 'wisdom'],
        weight: 0.8
      }
    };

    const alignment: SentimentAnalysis['elementalAlignment'] = {
      fire: 0, water: 0, earth: 0, air: 0, aether: 0
    };

    // Analyze current input
    for (const [element, patterns] of Object.entries(elementalPatterns)) {
      let score = 0;

      // Keyword matching
      for (const keyword of patterns.keywords) {
        if (lower.includes(keyword)) {
          score += 0.25;
        }
      }

      // Theme matching
      for (const theme of patterns.themes) {
        if (lower.includes(theme)) {
          score += 0.3;
        }
      }

      // Factor in user's elemental history from memories
      if (memories.length > 0) {
        const pastElementUsage = memories.filter(m => m.element === element).length / memories.length;
        // Slight penalty for overused elements, boost for underused
        if (pastElementUsage > 0.5) {
          score *= 0.8;
        } else if (pastElementUsage < 0.2) {
          score *= 1.2;
        }
      }

      score *= patterns.weight;
      alignment[element as keyof typeof alignment] = Math.min(score, 1.0);
    }

    return alignment;
  }

  /**
   * Analyze context indicators
   */
  private analyzeContext(input: string, memories: any[]): SentimentAnalysis['context'] {
    const lower = input.toLowerCase();
    const length = input.length;

    // Urgency indicators
    const urgencyWords = ['urgent', 'now', 'immediately', 'asap', 'crisis', 'emergency', 'desperate'];
    const urgency = urgencyWords.some(word => lower.includes(word)) ? 0.9 :
                   lower.includes('soon') || lower.includes('quickly') ? 0.6 :
                   lower.includes('when I can') || lower.includes('eventually') ? 0.2 : 0.4;

    // Depth indicators
    const depthWords = ['deep', 'profound', 'meaning', 'soul', 'core', 'essence'];
    const surfaceWords = ['quick', 'simple', 'basic', 'surface'];
    let depth = 0.5;
    if (depthWords.some(word => lower.includes(word))) depth += 0.3;
    if (surfaceWords.some(word => lower.includes(word))) depth -= 0.3;
    if (length > 200) depth += 0.2; // Longer messages tend to be deeper
    depth = Math.max(0, Math.min(depth, 1.0));

    // Clarity indicators
    const confusionWords = ['confused', 'unclear', 'don\'t know', 'not sure', 'maybe'];
    const clarityWords = ['clear', 'certain', 'know', 'understand', 'obvious'];
    let clarity = 0.5;
    if (clarityWords.some(word => lower.includes(word))) clarity += 0.3;
    if (confusionWords.some(word => lower.includes(word))) clarity -= 0.3;
    clarity = Math.max(0, Math.min(clarity, 1.0));

    // Energy indicators
    const highEnergyWords = ['excited', 'amazing', 'fantastic', 'energy', 'vibrant'];
    const lowEnergyWords = ['tired', 'exhausted', 'drained', 'low', 'depleted'];
    let energy = 0.5;
    if (highEnergyWords.some(word => lower.includes(word))) energy += 0.3;
    if (lowEnergyWords.some(word => lower.includes(word))) energy -= 0.3;
    energy = Math.max(0, Math.min(energy, 1.0));

    // Openness indicators
    const openWords = ['open', 'ready', 'willing', 'curious', 'explore'];
    const closedWords = ['can\'t', 'won\'t', 'refuse', 'not ready', 'closed'];
    let openness = 0.6; // Default slightly open
    if (openWords.some(word => lower.includes(word))) openness += 0.3;
    if (closedWords.some(word => lower.includes(word))) openness -= 0.4;
    openness = Math.max(0, Math.min(openness, 1.0));

    return { urgency, depth, clarity, energy, openness };
  }

  /**
   * Analyze user patterns from conversation history
   */
  private analyzeUserPatterns(input: string, memories: any[]): any {
    if (!memories || memories.length === 0) {
      return { preferredElements: [], responsiveness: 0.5, growthStage: 'beginning' };
    }

    // Analyze elemental preferences
    const elementCounts = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };
    memories.forEach(memory => {
      if (memory.element && elementCounts.hasOwnProperty(memory.element)) {
        elementCounts[memory.element as keyof typeof elementCounts]++;
      }
    });

    const preferredElements = Object.entries(elementCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([element]) => element);

    // Assess responsiveness based on memory patterns
    const responsiveness = memories.length > 10 ? 0.8 : memories.length > 5 ? 0.6 : 0.4;

    // Assess growth stage
    let growthStage = 'beginning';
    if (memories.length > 20) growthStage = 'developed';
    else if (memories.length > 10) growthStage = 'growing';

    return { preferredElements, responsiveness, growthStage };
  }

  /**
   * Generate final recommendation for agent routing
   */
  private generateRecommendation(
    emotions: SentimentAnalysis['emotions'],
    intent: SentimentAnalysis['intent'],
    elemental: SentimentAnalysis['elementalAlignment'],
    context: SentimentAnalysis['context'],
    patterns: any
  ): SentimentAnalysis['recommendation'] {

    // Find highest scoring elemental alignment
    const sortedElements = Object.entries(elemental)
      .sort(([,a], [,b]) => b - a);

    const primaryElement = sortedElements[0][0] as any;
    const secondaryElement = sortedElements[1][1] > 0.3 ? sortedElements[1][0] as any : undefined;

    // Find highest scoring intent
    const sortedIntents = Object.entries(intent)
      .sort(([,a], [,b]) => b - a);

    const responseMode = sortedIntents[0][0] as any;

    // Calculate confidence based on clarity of signals
    const maxElementalScore = sortedElements[0][1];
    const maxIntentScore = sortedIntents[0][1];
    const confidence = Math.min((maxElementalScore + maxIntentScore) / 2, 1.0);

    // Generate reasoning
    const reasoning = this.generateReasoning(
      primaryElement,
      responseMode,
      emotions,
      context,
      maxElementalScore,
      maxIntentScore
    );

    return {
      primaryElement,
      secondaryElement,
      responseMode,
      confidence,
      reasoning
    };
  }

  /**
   * Generate human-readable reasoning for the recommendation
   */
  private generateReasoning(
    element: string,
    mode: string,
    emotions: SentimentAnalysis['emotions'],
    context: SentimentAnalysis['context'],
    elementScore: number,
    intentScore: number
  ): string {
    const elementDescriptions = {
      fire: 'catalytic energy and transformation',
      water: 'emotional healing and flow',
      earth: 'grounding and practical support',
      air: 'clarity and communication',
      aether: 'integration and spiritual wisdom'
    };

    const modeDescriptions = {
      analytical: 'logical thinking and problem-solving',
      supportive: 'emotional support and validation',
      creative: 'inspiration and possibility exploration',
      reflective: 'deep self-exploration and meaning-making',
      practical: 'concrete steps and action planning'
    };

    let reasoning = `Detected need for ${elementDescriptions[element]} (${Math.round(elementScore * 100)}% alignment) `;
    reasoning += `with ${modeDescriptions[mode]} approach (${Math.round(intentScore * 100)}% intent match). `;

    // Add context-specific insights
    if (context.urgency > 0.7) reasoning += 'High urgency detected. ';
    if (context.depth > 0.7) reasoning += 'Deep processing needs identified. ';
    if (context.openness < 0.3) reasoning += 'Gentle approach recommended due to resistance indicators. ';

    return reasoning;
  }

  /**
   * Fallback analysis when main analysis fails
   */
  private getFallbackAnalysis(): SentimentAnalysis {
    return {
      emotions: {
        joy: 0.1, sadness: 0.1, anger: 0.1, fear: 0.1,
        surprise: 0.1, trust: 0.3, anticipation: 0.3, disgust: 0.1
      },
      intent: {
        analytical: 0.2, supportive: 0.4, creative: 0.2, reflective: 0.3, practical: 0.2
      },
      elementalAlignment: {
        fire: 0.2, water: 0.3, earth: 0.2, air: 0.2, aether: 0.3
      },
      context: {
        urgency: 0.3, depth: 0.4, clarity: 0.3, energy: 0.4, openness: 0.5
      },
      recommendation: {
        primaryElement: 'aether',
        responseMode: 'supportive',
        confidence: 0.4,
        reasoning: 'Fallback to supportive aether response due to analysis failure'
      }
    };
  }
}

// Export singleton instance
export const sentimentAnalysisService = new SentimentAnalysisService();