/**
 * Maya Witness Service
 * Integrates looping protocol with sacred mirror paradigm
 * Maintains witness stance while deepening understanding
 */

import {
  LoopingProtocolImpl,
  LoopingState,
  LoopingTriggers,
  LoopingIntensity,
  ElementalSignal,
  ArchetypePattern,
  DepthInference,
  createLoopingProtocol
} from '../protocols/LoopingProtocol';
import { ElementalArchetype } from '../../../web/lib/types/elemental';
import { archetypeService, ArchetypeInsight } from './ArchetypeDetectionService';
import { logger } from '../utils/logger';

export interface WitnessContext {
  userId: string;
  sessionId: string;
  elementalMode: ElementalArchetype;
  loopingIntensity: LoopingIntensity;
  conversationHistory: ConversationTurn[];
  currentState?: LoopingState;
  exchangeCount: number;
  targetExchanges: number; // 3-4 exchange target
}

export interface ConversationTurn {
  role: 'user' | 'maya';
  content: string;
  timestamp: Date;
  elemental?: ElementalArchetype;
  loopIteration?: number;
  convergence?: number;
}

export interface WitnessResponse {
  response: string;
  shouldLoop: boolean;
  loopingState?: LoopingState;
  elementalShift?: ElementalArchetype;
  archetypeDetected?: string;
  nextAction?: 'loop' | 'deepen' | 'transition' | 'complete';
}

/**
 * Main service for Maya's witness paradigm with looping
 */
export class MayaWitnessService {
  private loopingProtocol: LoopingProtocolImpl;

  constructor() {
    this.loopingProtocol = createLoopingProtocol();
  }

  /**
   * Process user input through witness paradigm
   */
  async witness(
    userInput: string,
    context: WitnessContext
  ): Promise<WitnessResponse> {
    // Step 1: Analyze input for triggers
    const triggers = this.analyzeTriggers(userInput, context);

    // Step 2: Detect elemental and archetypal patterns
    const patterns = this.detectPatterns(userInput);

    // Step 3: Determine if looping should activate
    const shouldLoop = this.shouldActivateLooping(triggers, context);

    // Step 4: Process through appropriate pathway
    if (shouldLoop && context.currentState) {
      return this.continueLooping(userInput, context, patterns);
    } else if (shouldLoop) {
      return this.initiateLooping(userInput, context, patterns);
    } else {
      return this.directWitness(userInput, context, patterns);
    }
  }

  /**
   * Analyze input for looping triggers
   */
  private analyzeTriggers(
    input: string,
    context: WitnessContext
  ): LoopingTriggers {
    const lowerInput = input.toLowerCase();

    return {
      emotionalIntensity: this.calculateEmotionalIntensity(input),
      meaningAmbiguity: this.calculateAmbiguity(input, context),
      userCorrection: this.detectCorrection(input),
      essentialityGap: this.calculateEssentialityGap(input, context),
      explicitRequest: this.detectExplicitRequest(input)
    };
  }

  /**
   * Detect elemental and archetypal patterns
   */
  private detectPatterns(input: string): {
    elemental: ElementalSignal;
    archetypal: ArchetypePattern;
  } {
    // Detect archetypes using existing service
    const archetypeInsights = archetypeService.detectArchetypes(input);
    const topArchetype = archetypeInsights[0];

    // Detect elemental signals
    const elementalSignal = this.detectElementalSignal(input);

    return {
      elemental: elementalSignal,
      archetypal: {
        archetype: topArchetype?.archetype.name || 'Unknown',
        confidence: topArchetype?.confidence || 0,
        shadowAspect: topArchetype?.archetype.energy === 'shadow',
        evolutionPhase: this.determineEvolutionPhase(topArchetype)
      }
    };
  }

  /**
   * Determine if looping should activate based on context
   */
  private shouldActivateLooping(
    triggers: LoopingTriggers,
    context: WitnessContext
  ): boolean {
    // Don't loop if we're already near exchange limit
    if (context.exchangeCount >= context.targetExchanges - 1) {
      return false;
    }

    // Don't loop if user has Light intensity preference
    if (context.loopingIntensity === LoopingIntensity.LIGHT &&
        !triggers.explicitRequest &&
        !triggers.userCorrection) {
      return false;
    }

    // Sacred mode always loops until convergence
    if (context.loopingIntensity === LoopingIntensity.SACRED) {
      return true;
    }

    return this.loopingProtocol.shouldActivateLoop(triggers);
  }

  /**
   * Initiate a new looping sequence
   */
  private async initiateLooping(
    input: string,
    context: WitnessContext,
    patterns: { elemental: ElementalSignal; archetypal: ArchetypePattern }
  ): Promise<WitnessResponse> {
    // Create initial looping state
    const loopingState: LoopingState = {
      surfaceCapture: input,
      depthInference: {
        elemental: patterns.elemental,
        archetypal: patterns.archetypal,
        essential: this.extractEssential(input, patterns)
      },
      loopCount: 0,
      maxLoops: this.getMaxLoops(context.loopingIntensity),
      convergence: 0.3, // Starting convergence
      elementalMode: context.elementalMode,
      adjustmentHistory: []
    };

    // Generate paraphrase
    const paraphrase = this.loopingProtocol.paraphrase(loopingState);

    // Generate check
    const check = this.loopingProtocol.check(loopingState);

    // Combine for response
    const response = `${paraphrase} ${check}`;

    return {
      response,
      shouldLoop: true,
      loopingState,
      nextAction: 'loop'
    };
  }

  /**
   * Continue an existing looping sequence
   */
  private async continueLooping(
    input: string,
    context: WitnessContext,
    patterns: { elemental: ElementalSignal; archetypal: ArchetypePattern }
  ): Promise<WitnessResponse> {
    const state = context.currentState!;

    // User is providing correction/refinement
    const correctedState = this.loopingProtocol.correct(input, state);

    // Check if we've reached convergence or max loops
    if (correctedState.convergence >= 0.85 ||
        correctedState.loopCount >= correctedState.maxLoops) {
      // Transition to action/exploration
      const transition = this.loopingProtocol.transitionToAction(correctedState);
      return {
        response: transition,
        shouldLoop: false,
        nextAction: 'deepen'
      };
    }

    // Continue looping with refined understanding
    const paraphrase = this.loopingProtocol.paraphrase(correctedState);
    const check = this.loopingProtocol.check(correctedState);

    return {
      response: `${paraphrase} ${check}`,
      shouldLoop: true,
      loopingState: correctedState,
      nextAction: 'loop'
    };
  }

  /**
   * Direct witness response without looping
   */
  private async directWitness(
    input: string,
    context: WitnessContext,
    patterns: { elemental: ElementalSignal; archetypal: ArchetypePattern }
  ): Promise<WitnessResponse> {
    // Generate elemental reflection
    const reflection = this.generateElementalReflection(
      input,
      context.elementalMode,
      patterns
    );

    // Determine next action based on exchange count
    let nextAction: 'loop' | 'deepen' | 'transition' | 'complete' = 'deepen';
    if (context.exchangeCount >= context.targetExchanges - 1) {
      nextAction = 'complete';
    }

    return {
      response: reflection,
      shouldLoop: false,
      archetypeDetected: patterns.archetypal.archetype,
      nextAction
    };
  }

  // Helper methods for trigger analysis

  private calculateEmotionalIntensity(input: string): number {
    const emotionalMarkers = [
      'feel', 'feeling', 'hurt', 'angry', 'sad', 'happy', 'excited',
      'frustrated', 'confused', 'lost', 'overwhelmed', 'anxious',
      'afraid', 'scared', 'lonely', 'depressed', 'joy', 'love'
    ];

    const lowerInput = input.toLowerCase();
    let intensity = 0;

    emotionalMarkers.forEach(marker => {
      if (lowerInput.includes(marker)) {
        intensity += 0.15;
      }
    });

    // Check for exclamation marks and capitals
    if (input.includes('!')) intensity += 0.1;
    if (input === input.toUpperCase() && input.length > 5) intensity += 0.2;

    return Math.min(intensity, 1.0);
  }

  private calculateAmbiguity(input: string, context: WitnessContext): number {
    const ambiguousMarkers = [
      'maybe', 'perhaps', 'sort of', 'kind of', 'i guess',
      'not sure', 'don\'t know', 'confused', 'unclear',
      'something', 'somehow', 'stuff', 'things'
    ];

    const lowerInput = input.toLowerCase();
    let ambiguity = 0;

    ambiguousMarkers.forEach(marker => {
      if (lowerInput.includes(marker)) {
        ambiguity += 0.15;
      }
    });

    // Questions increase ambiguity
    if (input.includes('?')) ambiguity += 0.1;

    return Math.min(ambiguity, 1.0);
  }

  private detectCorrection(input: string): boolean {
    const correctionPhrases = [
      'no, it\'s more like',
      'not quite',
      'actually',
      'no, i mean',
      'that\'s not it',
      'more like',
      'what i meant was',
      'let me clarify'
    ];

    const lowerInput = input.toLowerCase();
    return correctionPhrases.some(phrase => lowerInput.includes(phrase));
  }

  private calculateEssentialityGap(
    input: string,
    context: WitnessContext
  ): number {
    // Simplified calculation - would be more sophisticated in production
    const surfaceWords = input.split(' ').length;
    const hasMetaphor = /like|as if|feels like|seems like/.test(input.toLowerCase());
    const hasDeepMarkers = /really|actually|truly|deeply|core|essence|heart/.test(input.toLowerCase());

    let gap = 0;
    if (surfaceWords > 50) gap += 0.3; // Long input suggests complexity
    if (hasMetaphor) gap += 0.2;
    if (hasDeepMarkers) gap += 0.3;

    return Math.min(gap, 1.0);
  }

  private detectExplicitRequest(input: string): boolean {
    const requestPhrases = [
      'help me understand',
      'what do you mean',
      'can you clarify',
      'i don\'t understand',
      'explain',
      'what are you saying',
      'can you reflect that back'
    ];

    const lowerInput = input.toLowerCase();
    return requestPhrases.some(phrase => lowerInput.includes(phrase));
  }

  // Helper methods for pattern detection

  private detectElementalSignal(input: string): ElementalSignal {
    const elementalKeywords = {
      fire: ['passion', 'burn', 'spark', 'ignite', 'vision', 'transform', 'catalyst', 'action', 'bold', 'courage'],
      water: ['feel', 'flow', 'emotion', 'deep', 'intuitive', 'sensitive', 'vulnerable', 'tears', 'ocean', 'current'],
      earth: ['ground', 'solid', 'practical', 'build', 'foundation', 'stable', 'manifest', 'real', 'concrete', 'structure'],
      air: ['think', 'idea', 'perspective', 'connect', 'pattern', 'clarity', 'insight', 'understand', 'analyze', 'concept'],
      aether: ['whole', 'unity', 'essence', 'spirit', 'transcend', 'sacred', 'divine', 'cosmic', 'infinite', 'eternal']
    };

    const lowerInput = input.toLowerCase();
    let dominantElement: ElementalArchetype = ElementalArchetype.WATER; // Default
    let maxScore = 0;
    let matchedKeywords: string[] = [];

    // Find dominant element
    Object.entries(elementalKeywords).forEach(([element, keywords]) => {
      let score = 0;
      const matches: string[] = [];

      keywords.forEach(keyword => {
        if (lowerInput.includes(keyword)) {
          score++;
          matches.push(keyword);
        }
      });

      if (score > maxScore) {
        maxScore = score;
        dominantElement = element as ElementalArchetype;
        matchedKeywords = matches;
      }
    });

    // Determine energy pattern
    const energyPatterns: Record<ElementalArchetype, string> = {
      fire: 'flaring',
      water: 'swelling',
      earth: 'grounding',
      air: 'circulating',
      aether: 'spiraling'
    };

    return {
      element: dominantElement,
      intensity: Math.min(maxScore / 3, 1.0), // Normalize intensity
      keywords: matchedKeywords,
      energyPattern: energyPatterns[dominantElement]
    };
  }

  private determineEvolutionPhase(insight?: ArchetypeInsight): string {
    if (!insight) return 'dormant';

    if (insight.confidence < 0.4) return 'emerging';
    if (insight.confidence < 0.7) return 'developing';
    if (insight.confidence < 0.9) return 'integrating';
    return 'transcending';
  }

  private extractEssential(
    input: string,
    patterns: { elemental: ElementalSignal; archetypal: ArchetypePattern }
  ): string {
    // This would use more sophisticated NLP in production
    // For now, extract core theme based on patterns

    const themes = {
      'The Hero': 'overcoming challenge',
      'The Sage': 'seeking understanding',
      'The Shadow': 'facing the hidden',
      'The Lover': 'longing for connection',
      'The Creator': 'birthing something new',
      'The Caregiver': 'nurturing what matters',
      'The Trickster': 'transforming through play',
      'The Wanderer': 'searching for meaning',
      'The Sovereign': 'claiming authority',
      'The Innocent': 'trusting the process'
    };

    const archetypeTheme = themes[patterns.archetypal.archetype] || 'exploring experience';
    const elementalQuality = patterns.elemental.energyPattern;

    return `${archetypeTheme} with ${elementalQuality} energy`;
  }

  private getMaxLoops(intensity: LoopingIntensity): number {
    switch (intensity) {
      case LoopingIntensity.LIGHT:
        return 1;
      case LoopingIntensity.FULL:
        return 3;
      case LoopingIntensity.SACRED:
        return 10;
      default:
        return 3;
    }
  }

  private generateElementalReflection(
    input: string,
    element: ElementalArchetype,
    patterns: { elemental: ElementalSignal; archetypal: ArchetypePattern }
  ): string {
    // This would be more sophisticated in production
    // Using templates for now

    const reflections = {
      fire: `I sense the ${patterns.archetypal.archetype} energy ${patterns.elemental.energyPattern} within your words—a catalyst seeking expression.`,
      water: `There's a ${patterns.elemental.energyPattern} quality to what you're sharing—the ${patterns.archetypal.archetype} moving through emotional currents.`,
      earth: `I feel the ${patterns.elemental.energyPattern} foundation of ${patterns.archetypal.archetype} in your expression—something seeking form.`,
      air: `The ${patterns.archetypal.archetype} pattern is ${patterns.elemental.energyPattern} through your thoughts—connections forming new understanding.`,
      aether: `I witness the ${patterns.archetypal.archetype} ${patterns.elemental.energyPattern} through the unified field of your being.`
    };

    return reflections[element] || reflections.aether;
  }
}

// Export singleton instance
export const mayaWitnessService = new MayaWitnessService();