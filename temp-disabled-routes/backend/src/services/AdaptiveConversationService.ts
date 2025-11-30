// Adaptive Conversation Service - Provides different conversation styles based on user needs
// Integrates with sentiment analysis to deliver personalized archetypal experiences

import { logger } from '../utils/logger';
import { sentimentAnalysisService, SentimentAnalysis } from './SentimentAnalysisService';
import { getRelevantMemories, storeMemoryItem } from './memoryService';

export interface ConversationStyle {
  name: string;
  description: string;
  characteristics: {
    tone: string;
    approach: string;
    questionStyle: string;
    supportLevel: string;
    challengeLevel: string;
  };
  prompts: {
    opening: string;
    processing: string;
    deepening: string;
    integration: string;
    closing: string;
  };
  techniques: string[];
}

export interface AdaptiveResponse {
  content: string;
  style: string;
  element: string;
  metadata: {
    confidence: number;
    reasoning: string;
    techniques: string[];
    followUpSuggestions: string[];
    emotionalTone: string;
    archetypeInvoked: string;
  };
}

/**
 * Adaptive Conversation Service
 * Provides different conversation styles based on real-time sentiment analysis
 */
export class AdaptiveConversationService {

  private conversationStyles: Map<string, ConversationStyle> = new Map();

  constructor() {
    this.initializeConversationStyles();
  }

  /**
   * Generate adaptive response based on sentiment analysis and user context
   */
  async generateAdaptiveResponse(
    userId: string,
    input: string,
    requestedElement?: string,
    requestedStyle?: string
  ): Promise<AdaptiveResponse> {
    try {
      logger.info('Generating adaptive response', { userId, inputLength: input.length });

      // Perform sentiment analysis
      const sentiment = await sentimentAnalysisService.analyzeSentiment({
        userId,
        currentInput: input
      });

      // Determine conversation style (allow user override)
      const selectedStyle = requestedStyle || sentiment.recommendation.responseMode;
      const selectedElement = requestedElement || sentiment.recommendation.primaryElement;

      // Get conversation style template
      const styleTemplate = this.conversationStyles.get(selectedStyle);
      if (!styleTemplate) {
        throw new Error(`Unknown conversation style: ${selectedStyle}`);
      }

      // Generate contextual response
      const response = await this.craftStyledResponse(
        input,
        selectedStyle,
        selectedElement,
        sentiment,
        styleTemplate,
        userId
      );

      logger.info('Adaptive response generated', {
        userId,
        style: selectedStyle,
        element: selectedElement,
        confidence: sentiment.recommendation.confidence
      });

      return response;

    } catch (error) {
      logger.error('Adaptive response generation failed', { userId, error });
      return this.getFallbackResponse(input, userId);
    }
  }

  /**
   * Initialize conversation style templates
   */
  private initializeConversationStyles(): void {

    // ANALYTICAL STYLE - Logic, problem-solving, systematic thinking
    this.conversationStyles.set('analytical', {
      name: 'Analytical Explorer',
      description: 'Systematic, logical approach to understanding and problem-solving',
      characteristics: {
        tone: 'Clear and structured',
        approach: 'Systematic analysis',
        questionStyle: 'Probing and logical',
        supportLevel: 'Objective guidance',
        challengeLevel: 'Intellectual challenge'
      },
      prompts: {
        opening: "Let's examine this systematically. What are the key elements at play here?",
        processing: "I'm noticing several patterns. Let's break this down step by step.",
        deepening: "What assumptions might we be making? Let's dig deeper into the logic.",
        integration: "How does this analysis change your understanding of the situation?",
        closing: "What's the most logical next step based on what we've discovered?"
      },
      techniques: [
        'pattern_analysis',
        'logical_framework',
        'assumption_testing',
        'systematic_breakdown',
        'evidence_evaluation'
      ]
    });

    // SUPPORTIVE STYLE - Emotional validation, comfort, encouragement
    this.conversationStyles.set('supportive', {
      name: 'Compassionate Witness',
      description: 'Gentle, validating approach focused on emotional support',
      characteristics: {
        tone: 'Warm and accepting',
        approach: 'Emotional validation',
        questionStyle: 'Gentle and caring',
        supportLevel: 'High emotional support',
        challengeLevel: 'Minimal challenge'
      },
      prompts: {
        opening: "I can feel the weight of what you're carrying. You're not alone in this.",
        processing: "What you're experiencing makes complete sense. Tell me more about how this feels.",
        deepening: "Your feelings are completely valid. What do you need most right now?",
        integration: "You've been so brave in sharing this. How does it feel to be heard?",
        closing: "Remember, you have everything within you to navigate this. I believe in you."
      },
      techniques: [
        'emotional_validation',
        'active_listening',
        'empathetic_mirroring',
        'gentle_encouragement',
        'unconditional_acceptance'
      ]
    });

    // CREATIVE STYLE - Imagination, possibility, inspiration
    this.conversationStyles.set('creative', {
      name: 'Visionary Catalyst',
      description: 'Imaginative, possibility-focused approach to expand perspectives',
      characteristics: {
        tone: 'Inspiring and expansive',
        approach: 'Possibility exploration',
        questionStyle: 'Open-ended and imaginative',
        supportLevel: 'Encouraging creativity',
        challengeLevel: 'Gentle expansion'
      },
      prompts: {
        opening: "What if we looked at this through the lens of infinite possibility?",
        processing: "I'm sensing creative energy here. What wants to emerge?",
        deepening: "If there were no limitations, what would be possible?",
        integration: "How does this new perspective shift what you thought was possible?",
        closing: "What's one small creative step you could take toward this vision?"
      },
      techniques: [
        'possibility_thinking',
        'creative_reframing',
        'imagination_expansion',
        'artistic_metaphors',
        'visionary_questioning'
      ]
    });

    // REFLECTIVE STYLE - Self-exploration, meaning-making, wisdom
    this.conversationStyles.set('reflective', {
      name: 'Wisdom Seeker',
      description: 'Deep, contemplative approach to uncover meaning and wisdom',
      characteristics: {
        tone: 'Contemplative and wise',
        approach: 'Inner exploration',
        questionStyle: 'Deep and meaningful',
        supportLevel: 'Respectful guidance',
        challengeLevel: 'Thoughtful provocation'
      },
      prompts: {
        opening: "There's wisdom trying to emerge here. What is this experience teaching you?",
        processing: "Let's sit with this for a moment. What's the deeper story unfolding?",
        deepening: "What would your wisest self say about this situation?",
        integration: "How does this insight connect to your larger life journey?",
        closing: "What piece of wisdom will you carry forward from this reflection?"
      },
      techniques: [
        'meaning_making',
        'wisdom_extraction',
        'life_pattern_recognition',
        'spiritual_inquiry',
        'contemplative_questioning'
      ]
    });

    // PRACTICAL STYLE - Action-oriented, concrete steps, implementation
    this.conversationStyles.set('practical', {
      name: 'Action Architect',
      description: 'Results-focused approach emphasizing concrete steps and implementation',
      characteristics: {
        tone: 'Direct and actionable',
        approach: 'Solution-oriented',
        questionStyle: 'Specific and targeted',
        supportLevel: 'Practical guidance',
        challengeLevel: 'Action-oriented push'
      },
      prompts: {
        opening: "Let's turn this into concrete action. What specific outcome are you seeking?",
        processing: "I hear what you want to change. What are the practical barriers?",
        deepening: "What resources and support do you need to make this happen?",
        integration: "How will you know when you've succeeded? What are the markers?",
        closing: "What's the very first step you can take today to move this forward?"
      },
      techniques: [
        'goal_clarification',
        'obstacle_identification',
        'resource_mapping',
        'action_planning',
        'accountability_creation'
      ]
    });

    logger.info('Conversation styles initialized', {
      stylesCount: this.conversationStyles.size,
      styles: Array.from(this.conversationStyles.keys())
    });
  }

  /**
   * Craft styled response using sentiment analysis and conversation templates
   */
  private async craftStyledResponse(
    input: string,
    style: string,
    element: string,
    sentiment: SentimentAnalysis,
    template: ConversationStyle,
    userId: string
  ): Promise<AdaptiveResponse> {

    // Get conversation context
    const memories = await getRelevantMemories(userId, input, 3);
    const conversationStage = this.determineConversationStage(input, memories);

    // Select appropriate prompt based on conversation stage
    let basePrompt = template.prompts.opening;
    switch (conversationStage) {
      case 'processing':
        basePrompt = template.prompts.processing;
        break;
      case 'deepening':
        basePrompt = template.prompts.deepening;
        break;
      case 'integration':
        basePrompt = template.prompts.integration;
        break;
      case 'closing':
        basePrompt = template.prompts.closing;
        break;
    }

    // Apply elemental wisdom to the base prompt
    const elementalWisdom = this.getElementalWisdom(element, sentiment);

    // Combine style template with elemental energy
    const styledResponse = this.combineStyleAndElement(
      basePrompt,
      elementalWisdom,
      template,
      sentiment,
      input
    );

    // Generate follow-up suggestions
    const followUpSuggestions = this.generateFollowUpSuggestions(style, element, sentiment);

    // Determine archetype invoked
    const archetypeInvoked = this.getArchetypeForElementAndStyle(element, style);

    return {
      content: styledResponse,
      style,
      element,
      metadata: {
        confidence: sentiment.recommendation.confidence,
        reasoning: sentiment.recommendation.reasoning,
        techniques: template.techniques,
        followUpSuggestions,
        emotionalTone: template.characteristics.tone,
        archetypeInvoked
      }
    };
  }

  /**
   * Determine conversation stage based on input and history
   */
  private determineConversationStage(input: string, memories: any[]): string {
    const lower = input.toLowerCase();

    // Check for stage indicators
    if (memories.length === 0 || lower.includes('hello') || lower.includes('hi ')) {
      return 'opening';
    }

    if (lower.includes('what does this mean') || lower.includes('how does this')) {
      return 'integration';
    }

    if (lower.includes('deeper') || lower.includes('more') || lower.includes('why')) {
      return 'deepening';
    }

    if (lower.includes('thank you') || lower.includes('that helps')) {
      return 'closing';
    }

    return 'processing'; // Default middle stage
  }

  /**
   * Get elemental wisdom to infuse into response
   */
  private getElementalWisdom(element: string, sentiment: SentimentAnalysis): string {
    const wisdomMap = {
      fire: {
        high_energy: "The fire in you is ready to transform this situation. What wants to be ignited?",
        low_energy: "Sometimes we need to tend the coals before the flame can rise. What spark is still glowing?",
        emotional: "Fire teaches us that emotions are energy seeking expression. How does this energy want to move?",
        practical: "Fire element brings catalyst energy. What needs to be burned away for the new to emerge?"
      },
      water: {
        high_energy: "Your emotional waters are flowing powerfully. Let's channel this energy with wisdom.",
        low_energy: "Like still waters, there's depth here that's waiting to be felt. What's moving underneath?",
        emotional: "Water honors all emotions as sacred messengers. What is your heart trying to tell you?",
        practical: "Water wisdom reminds us that healing happens in flow, not force. What wants to move?"
      },
      earth: {
        high_energy: "Earth energy grounds this excitement into sustainable action. How do we make this real?",
        low_energy: "Earth teaches patience and natural timing. What foundation needs to be built first?",
        emotional: "Earth element reminds us to embody our feelings. How is your body holding this?",
        practical: "Earth energy excels at manifestation. What concrete steps will bring this into form?"
      },
      air: {
        high_energy: "Air element brings clarity to enthusiasm. Let's organize these ideas with precision.",
        low_energy: "Sometimes we need fresh perspective to revitalize energy. What new view is possible?",
        emotional: "Air wisdom helps us understand our feelings without being overwhelmed by them.",
        practical: "Air element specializes in communication and planning. How do we articulate this clearly?"
      },
      aether: {
        high_energy: "Aether integrates all energies into wisdom. What's the deeper pattern here?",
        low_energy: "In stillness, aether reveals the unity underlying all experience. What's the bigger picture?",
        emotional: "Aether reminds us that all emotions are temporary waves in the ocean of consciousness.",
        practical: "Aether wisdom sees how all elements serve the soul's evolution. What's truly being called forth?"
      }
    };

    const energy = sentiment.context.energy > 0.6 ? 'high_energy' : 'low_energy';
    const primaryFocus = sentiment.emotions.sadness > 0.5 || sentiment.emotions.anger > 0.5 ? 'emotional' : 'practical';

    const wisdom = wisdomMap[element as keyof typeof wisdomMap];
    return wisdom[energy] || wisdom[primaryFocus] || wisdom.practical;
  }

  /**
   * Combine conversation style with elemental wisdom
   */
  private combineStyleAndElement(
    basePrompt: string,
    elementalWisdom: string,
    template: ConversationStyle,
    sentiment: SentimentAnalysis,
    input: string
  ): string {

    // Create personalized response combining style and element
    let response = `${basePrompt}\n\n${elementalWisdom}`;

    // Add style-specific enhancement based on sentiment
    if (template.name === 'Analytical Explorer') {
      response += this.addAnalyticalDepth(input, sentiment);
    } else if (template.name === 'Compassionate Witness') {
      response += this.addEmotionalValidation(input, sentiment);
    } else if (template.name === 'Visionary Catalyst') {
      response += this.addCreativeExpansion(input, sentiment);
    } else if (template.name === 'Wisdom Seeker') {
      response += this.addReflectiveDepth(input, sentiment);
    } else if (template.name === 'Action Architect') {
      response += this.addPracticalStructure(input, sentiment);
    }

    return response;
  }

  /**
   * Add analytical depth to response
   */
  private addAnalyticalDepth(input: string, sentiment: SentimentAnalysis): string {
    const highestEmotion = Object.entries(sentiment.emotions)
      .sort(([,a], [,b]) => b - a)[0];

    return `\n\nFrom an analytical perspective, I notice the primary emotional pattern here is ${highestEmotion[0]}. What factors might be contributing to this pattern? Let's examine the underlying structure.`;
  }

  /**
   * Add emotional validation to response
   */
  private addEmotionalValidation(input: string, sentiment: SentimentAnalysis): string {
    const validationPhrases = [
      "Your feelings are completely understandable given what you're experiencing.",
      "What you're going through would be challenging for anyone.",
      "It takes courage to share something this personal.",
      "Your emotional response is a natural and healthy reaction.",
      "You're being so brave in facing this with honesty."
    ];

    const randomValidation = validationPhrases[Math.floor(Math.random() * validationPhrases.length)];
    return `\n\n${randomValidation} I'm here to witness and support you through this.`;
  }

  /**
   * Add creative expansion to response
   */
  private addCreativeExpansion(input: string, sentiment: SentimentAnalysis): string {
    const creativePrompts = [
      "What if this challenge is actually a creative opportunity in disguise?",
      "How might your future self look back on this moment as a turning point?",
      "What story wants to be written through this experience?",
      "If this situation were a work of art, what would it be trying to express?",
      "What new possibility is trying to emerge through this experience?"
    ];

    const randomPrompt = creativePrompts[Math.floor(Math.random() * creativePrompts.length)];
    return `\n\n${randomPrompt} Let's explore what wants to be created here.`;
  }

  /**
   * Add reflective depth to response
   */
  private addReflectiveDepth(input: string, sentiment: SentimentAnalysis): string {
    return `\n\nIn the deeper currents of this experience, what wisdom is trying to emerge? Sometimes our greatest challenges become our most profound teachers. What might this situation be here to teach you about yourself or your journey?`;
  }

  /**
   * Add practical structure to response
   */
  private addPracticalStructure(input: string, sentiment: SentimentAnalysis): string {
    return `\n\nLet's get specific about next steps. What's the smallest concrete action you could take in the next 24 hours to move this forward? We can build momentum from there.`;
  }

  /**
   * Generate follow-up suggestions based on style and element
   */
  private generateFollowUpSuggestions(style: string, element: string, sentiment: SentimentAnalysis): string[] {
    const suggestions: string[] = [];

    // Style-based suggestions
    if (style === 'analytical') {
      suggestions.push("Let's examine this from a different angle");
      suggestions.push("What evidence supports or challenges this view?");
    } else if (style === 'supportive') {
      suggestions.push("How can you offer yourself more compassion right now?");
      suggestions.push("What support do you need from others?");
    } else if (style === 'creative') {
      suggestions.push("What if we explored this through imagery or metaphor?");
      suggestions.push("How might you express this creatively?");
    } else if (style === 'reflective') {
      suggestions.push("What patterns do you notice in your life journey?");
      suggestions.push("How does this connect to your deeper values?");
    } else if (style === 'practical') {
      suggestions.push("Let's create a specific action plan");
      suggestions.push("What resources do you need to succeed?");
    }

    // Element-based suggestions
    if (element === 'fire') {
      suggestions.push("What vision wants to ignite through this?");
    } else if (element === 'water') {
      suggestions.push("How do you need to honor your emotional process?");
    } else if (element === 'earth') {
      suggestions.push("What practical foundation needs to be built?");
    } else if (element === 'air') {
      suggestions.push("How can we bring more clarity to this situation?");
    } else if (element === 'aether') {
      suggestions.push("What's the spiritual significance of this experience?");
    }

    return suggestions.slice(0, 3); // Return top 3 suggestions
  }

  /**
   * Get archetype based on element and style combination
   */
  private getArchetypeForElementAndStyle(element: string, style: string): string {
    const archetypeMap = {
      'fire-analytical': 'The Strategic Warrior',
      'fire-supportive': 'The Healing Flame',
      'fire-creative': 'The Divine Spark',
      'fire-reflective': 'The Phoenix Sage',
      'fire-practical': 'The Action Catalyst',

      'water-analytical': 'The Emotional Intelligence',
      'water-supportive': 'The Compassionate Healer',
      'water-creative': 'The Flowing Artist',
      'water-reflective': 'The Deep Well',
      'water-practical': 'The Feeling Guide',

      'earth-analytical': 'The Wise Builder',
      'earth-supportive': 'The Nurturing Mother',
      'earth-creative': 'The Abundant Creator',
      'earth-reflective': 'The Ancient Wisdom',
      'earth-practical': 'The Master Manifestor',

      'air-analytical': 'The Clear Thinker',
      'air-supportive': 'The Gentle Messenger',
      'air-creative': 'The Inspired Communicator',
      'air-reflective': 'The Philosophical Mind',
      'air-practical': 'The Strategic Planner',

      'aether-analytical': 'The Universal Mind',
      'aether-supportive': 'The Divine Compassion',
      'aether-creative': 'The Cosmic Artist',
      'aether-reflective': 'The Eternal Wisdom',
      'aether-practical': 'The Integrated Guide'
    };

    const key = `${element}-${style}`;
    return archetypeMap[key as keyof typeof archetypeMap] || 'The Sacred Guide';
  }

  /**
   * Fallback response when main processing fails
   */
  private getFallbackResponse(input: string, userId: string): AdaptiveResponse {
    return {
      content: "I hear you, and I'm here with you. Tell me more about what's on your mind right now.",
      style: 'supportive',
      element: 'aether',
      metadata: {
        confidence: 0.3,
        reasoning: 'Fallback response due to processing error',
        techniques: ['active_listening'],
        followUpSuggestions: ['What feels most important to share?', 'How are you feeling in this moment?'],
        emotionalTone: 'Warm and accepting',
        archetypeInvoked: 'The Compassionate Presence'
      }
    };
  }

  /**
   * Get available conversation styles
   */
  getAvailableStyles(): ConversationStyle[] {
    return Array.from(this.conversationStyles.values());
  }

  /**
   * Get specific style details
   */
  getStyleDetails(styleName: string): ConversationStyle | undefined {
    return this.conversationStyles.get(styleName);
  }
}

// Export singleton instance
export const adaptiveConversationService = new AdaptiveConversationService();