/**
 * Breath and Lungs Architecture
 * Sesame (breath) + Oracle (lungs) + Smart Switch
 */

import { WiredMaiaSystem, OracleReading } from '../elemental-oracle/blueprint-integration';

/**
 * The Switch - Decides which layer surfaces
 */
export class BreathLungsSwitch {
  private currentLayer: 'breath' | 'lungs' = 'breath';
  private depthRequestThreshold = 0.7;
  private contextWindow: UserIntent[] = [];

  /**
   * Analyze if user is requesting depth
   */
  analyzeUserIntent(userInput: string, context: any): UserIntent {
    const intent: UserIntent = {
      requestsDepth: this.detectDepthRequest(userInput),
      explicitInvitation: this.detectExplicitInvitation(userInput),
      questionType: this.classifyQuestion(userInput),
      emotionalState: this.assessEmotionalState(userInput),
      conversationPhase: this.determinePhase(context),
      confidenceScore: 0
    };

    // Calculate confidence in depth request
    intent.confidenceScore = this.calculateConfidence(intent);

    // Track in context window
    this.contextWindow.push(intent);
    if (this.contextWindow.length > 5) {
      this.contextWindow.shift();
    }

    return intent;
  }

  /**
   * Decide which layer should respond
   */
  decideLayers(intent: UserIntent, oracleReading: OracleReading): LayerDecision {
    // Explicit invitations always get lungs
    if (intent.explicitInvitation) {
      return {
        primaryLayer: 'lungs',
        secondaryLayer: null,
        transition: 'direct',
        confidence: 0.9
      };
    }

    // High confidence depth requests
    if (intent.confidenceScore > this.depthRequestThreshold) {
      return {
        primaryLayer: 'lungs',
        secondaryLayer: 'breath', // Breath introduces
        transition: 'guided',
        confidence: intent.confidenceScore
      };
    }

    // Oracle senses they need space/presence
    if (oracleReading.whatTheyNeed === 'space' || oracleReading.whatTheyNeed === 'witness') {
      return {
        primaryLayer: 'breath',
        secondaryLayer: null,
        transition: 'none',
        confidence: 0.8
      };
    }

    // Default to breath layer
    return {
      primaryLayer: 'breath',
      secondaryLayer: null,
      transition: 'none',
      confidence: 0.6
    };
  }

  /**
   * Detect explicit depth requests
   */
  private detectDepthRequest(input: string): boolean {
    const depthPatterns = [
      /tell me more/i,
      /explain/i,
      /what does.*mean/i,
      /why.*this/i,
      /help me understand/i,
      /what's really/i,
      /deeper/i,
      /elaborate/i,
      /expand on/i,
      /say more about/i
    ];

    return depthPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Detect explicit invitations to Oracle
   */
  private detectExplicitInvitation(input: string): boolean {
    const invitationPatterns = [
      /oracle/i,
      /tell me about the/i,
      /what element/i,
      /what phase/i,
      /what archetype/i,
      /what pattern/i,
      /analyze/i,
      /read me/i,
      /what do you see/i
    ];

    return invitationPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Classify the type of question
   */
  private classifyQuestion(input: string): QuestionType {
    if (/^what\s+(is|are|does|do)/i.test(input)) return 'definitional';
    if (/^why/i.test(input)) return 'explanatory';
    if (/^how/i.test(input)) return 'procedural';
    if (/^when/i.test(input)) return 'temporal';
    if (/^where/i.test(input)) return 'locational';
    if (/\?$/.test(input)) return 'open';
    return 'statement';
  }

  /**
   * Assess emotional state for layer decision
   */
  private assessEmotionalState(input: string): EmotionalState {
    if (/scared|afraid|terrif/i.test(input)) return 'vulnerable';
    if (/angry|pissed|furious/i.test(input)) return 'activated';
    if (/sad|grief|cry/i.test(input)) return 'tender';
    if (/confus|lost|don't know/i.test(input)) return 'uncertain';
    if (/excit|happy|great/i.test(input)) return 'elevated';
    return 'neutral';
  }

  /**
   * Determine conversation phase
   */
  private determinePhase(context: any): ConversationPhase {
    if (context.exchangeCount < 5) return 'opening';
    if (context.exchangeCount < 20) return 'building';
    if (context.exchangeCount < 40) return 'deepening';
    return 'integration';
  }

  /**
   * Calculate confidence in depth request
   */
  private calculateConfidence(intent: UserIntent): number {
    let confidence = 0;

    // Explicit requests
    if (intent.requestsDepth) confidence += 0.5;
    if (intent.explicitInvitation) confidence += 0.4;

    // Question types that suggest depth seeking
    if (['explanatory', 'definitional'].includes(intent.questionType)) {
      confidence += 0.3;
    }

    // Conversation phase influence
    if (intent.conversationPhase === 'deepening') confidence += 0.2;

    // Emotional state influence
    if (intent.emotionalState === 'uncertain') confidence += 0.2;

    return Math.min(confidence, 1.0);
  }
}

/**
 * The Transition Manager - Smooth switches between layers
 */
export class LayerTransition {
  /**
   * Generate transition into depth
   */
  transitionToLungs(
    breathResponse: string | null,
    decision: LayerDecision,
    oracleReading: OracleReading
  ): TransitionResponse {
    if (decision.transition === 'direct') {
      // Direct to lungs - no breath intro
      return {
        breathPart: null,
        lungsIntro: null,
        lungsContent: 'FULL_ORACLE_RESPONSE',
        style: 'direct'
      };
    }

    if (decision.transition === 'guided') {
      // Breath introduces, then lungs
      const intro = this.selectBreathIntro(oracleReading);
      return {
        breathPart: breathResponse,
        lungsIntro: intro,
        lungsContent: 'FULL_ORACLE_RESPONSE',
        style: 'guided'
      };
    }

    // No transition needed
    return {
      breathPart: breathResponse,
      lungsIntro: null,
      lungsContent: null,
      style: 'breath_only'
    };
  }

  /**
   * Select appropriate breath intro to Oracle response
   */
  private selectBreathIntro(reading: OracleReading): string {
    const intros = {
      elemental: [
        'There\'s something here...',
        'I sense...',
        'What I feel is...',
        'The energy...'
      ],
      phase: [
        'You\'re in a space of...',
        'This feels like...',
        'The pattern I see...',
        'What\'s moving is...'
      ],
      archetype: [
        'The story you\'re living...',
        'The mythic pattern...',
        'What wants to emerge...',
        'The deeper current...'
      ]
    };

    // Choose based on Oracle reading
    if (reading.elementStrength > 0.7) {
      return this.randomSelect(intros.elemental);
    }
    if (reading.phaseDepth > 0.7) {
      return this.randomSelect(intros.phase);
    }
    return this.randomSelect(intros.archetype);
  }

  private randomSelect(options: string[]): string {
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Generate transition back to breath
   */
  transitionToBreath(lungsResponse: string): string {
    const closings = [
      'But for now...',
      'In this moment...',
      'Right here...',
      'What\'s present is...',
      'Simply...'
    ];

    return this.randomSelect(closings);
  }
}

/**
 * The Complete Breath-Lungs System
 */
export class BreathLungsSystem {
  private breathLayer: WiredMaiaSystem; // Sesame + Oracle sensing
  private lungsLayer: ElementalOracleDepth; // Full Oracle wisdom
  private switchController: BreathLungsSwitch;
  private transitionManager: LayerTransition;

  constructor() {
    this.breathLayer = new WiredMaiaSystem();
    this.lungsLayer = new ElementalOracleDepth();
    this.switchController = new BreathLungsSwitch();
    this.transitionManager = new LayerTransition();
  }

  /**
   * Main response flow with smart switching
   */
  async respond(
    userInput: string,
    conversationHistory: any[]
  ): Promise<{
    response: string;
    layer: 'breath' | 'lungs' | 'transition';
    metadata: any;
  }> {
    // 1. Analyze user intent
    const intent = this.switchController.analyzeUserIntent(
      userInput,
      { exchangeCount: conversationHistory.length }
    );

    // 2. Get Oracle sensing (always happens)
    const breathResult = await this.breathLayer.respond(userInput, conversationHistory);

    // 3. Decide which layer should respond
    const decision = this.switchController.decideLayers(intent, breathResult.oracleReading);

    // 4. Generate appropriate response
    if (decision.primaryLayer === 'breath') {
      return {
        response: breathResult.response || 'Yeah.',
        layer: 'breath',
        metadata: {
          intent,
          decision,
          oracleReading: breathResult.oracleReading
        }
      };
    }

    // 5. Need lungs layer
    const lungsResponse = await this.lungsLayer.generateDeepResponse(
      userInput,
      breathResult.oracleReading,
      conversationHistory
    );

    // 6. Handle transition
    const transition = this.transitionManager.transitionToLungs(
      breathResult.response,
      decision,
      breathResult.oracleReading
    );

    // 7. Compose final response
    const finalResponse = this.composeResponse(transition, lungsResponse);

    return {
      response: finalResponse,
      layer: transition.style === 'breath_only' ? 'breath' : 'lungs',
      metadata: {
        intent,
        decision,
        transition,
        oracleReading: breathResult.oracleReading
      }
    };
  }

  /**
   * Compose final response from transition components
   */
  private composeResponse(transition: TransitionResponse, lungsContent: string): string {
    let response = '';

    // Add breath part if exists
    if (transition.breathPart) {
      response += transition.breathPart;
    }

    // Add transition intro if exists
    if (transition.lungsIntro) {
      response += (response ? '\n\n' : '') + transition.lungsIntro + ' ';
    }

    // Add lungs content if needed
    if (transition.lungsContent === 'FULL_ORACLE_RESPONSE') {
      response += (response ? (transition.lungsIntro ? '' : '\n\n') : '') + lungsContent;
    }

    return response.trim();
  }
}

/**
 * Deep Oracle Response Generator
 */
class ElementalOracleDepth {
  async generateDeepResponse(
    userInput: string,
    oracleReading: OracleReading,
    history: any[]
  ): Promise<string> {
    // This would call the Oracle for full response
    // For now, return structured response

    return `I sense you're moving through ${oracleReading.alchemicalPhase}, with ${oracleReading.dominantElement} energy prominent. The archetypal pattern of ${oracleReading.archetypeActive} is active in your current experience.

This ${oracleReading.emotionalWeather} you're describing often emerges when we're at the ${oracleReading.mythicMoment} point of our journey. What you need right now is ${oracleReading.whatTheyNeed}.`;
  }
}

/**
 * Types for switching system
 */
interface UserIntent {
  requestsDepth: boolean;
  explicitInvitation: boolean;
  questionType: QuestionType;
  emotionalState: EmotionalState;
  conversationPhase: ConversationPhase;
  confidenceScore: number;
}

interface LayerDecision {
  primaryLayer: 'breath' | 'lungs';
  secondaryLayer: 'breath' | 'lungs' | null;
  transition: 'none' | 'guided' | 'direct';
  confidence: number;
}

interface TransitionResponse {
  breathPart: string | null;
  lungsIntro: string | null;
  lungsContent: string | null;
  style: 'breath_only' | 'guided' | 'direct';
}

type QuestionType = 'definitional' | 'explanatory' | 'procedural' | 'temporal' | 'locational' | 'open' | 'statement';
type EmotionalState = 'vulnerable' | 'activated' | 'tender' | 'uncertain' | 'elevated' | 'neutral';
type ConversationPhase = 'opening' | 'building' | 'deepening' | 'integration';

/**
 * The Perfect Architecture:
 *
 * BREATH (Default):
 * User: "I'm lost"
 * Response: "Yeah." or "Lost too."
 *
 * INVITATION TO LUNGS:
 * User: "Tell me more about what this means"
 * Response: "There's something here... [FULL ORACLE ANALYSIS]"
 *
 * SEAMLESS SWITCH:
 * - No jarring transitions
 * - Each layer does what it's good at
 * - Natural flow from simple to deep and back
 */

export default BreathLungsSystem;