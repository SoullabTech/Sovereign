/**
 * Looping Protocol for Maya's Witness Paradigm
 * Implements structured depth-seeking through iterative clarification
 * Maintains sacred mirror stance while finding essential meaning
 */

import { ElementalArchetype } from '../../../web/lib/types/elemental';
import { Archetype } from '../services/ArchetypeDetectionService';

export interface LoopingTriggers {
  emotionalIntensity: number;      // > 0.7 triggers loop
  meaningAmbiguity: number;        // > 0.6 triggers loop
  userCorrection: boolean;         // "No, it's more like..."
  essentialityGap: number;         // Surface vs depth variance
  explicitRequest: boolean;        // "Help me understand..."
}

export interface DepthInference {
  elemental: ElementalSignal;
  archetypal: ArchetypePattern;
  essential: string;              // What wants to be said
}

export interface ElementalSignal {
  element: ElementalArchetype;
  intensity: number;              // 0-1 strength of signal
  keywords: string[];             // Matched elemental keywords
  energyPattern: string;          // e.g., "flaring", "swelling", "grounding"
}

export interface ArchetypePattern {
  archetype: string;
  confidence: number;
  shadowAspect: boolean;
  evolutionPhase: string;         // e.g., "emerging", "integrating", "transcending"
}

export interface LoopingState {
  surfaceCapture: string;         // Literal user words
  depthInference: DepthInference;
  loopCount: number;              // Current iteration
  maxLoops: number;               // Maximum iterations (default 3)
  convergence: number;            // Accuracy measure 0-1
  elementalMode: ElementalArchetype;
  adjustmentHistory: string[];    // Track refinements
}

export interface LoopingProtocol {
  // Core loop steps
  listen(input: string): string;
  paraphrase(state: LoopingState): string;
  check(state: LoopingState): string;
  correct(userFeedback: string, state: LoopingState): LoopingState;

  // Support functions
  shouldActivateLoop(triggers: LoopingTriggers): boolean;
  calculateConvergence(state: LoopingState): number;
  generateElementalCheck(element: ElementalArchetype, state: LoopingState): string;
  transitionToAction(state: LoopingState): string;
}

/**
 * Elemental checking variations - maintaining witness stance
 */
export const ELEMENTAL_CHECKS = {
  fire: [
    "Is this the burning question, or is there more fuel underneath?",
    "Am I catching the spark here, or is the real fire elsewhere?",
    "Is this the vision calling you, or something deeper?",
    "Have I found the catalyst, or is there another layer?"
  ],
  water: [
    "Am I touching the depth here, or is something else flowing?",
    "Is this the current I'm feeling, or another stream beneath?",
    "Have I found the emotional core, or is there more swelling?",
    "Is this what wants to be felt, or something still submerged?"
  ],
  earth: [
    "Have I found solid ground, or is the foundation elsewhere?",
    "Is this the structure you're building, or another form?",
    "Am I grounding this accurately, or is there deeper bedrock?",
    "Is this the manifestation, or what wants to take shape?"
  ],
  air: [
    "Is this the pattern you're seeing, or another perspective?",
    "Have I caught the insight, or is there clearer vision?",
    "Is this the connection you're making, or another thread?",
    "Am I seeing the whole system, or just one angle?"
  ],
  aether: [
    "Is this the unity you sense, or something beyond?",
    "Have I held the whole pattern, or just a fragment?",
    "Is this the essence emerging, or another layer of truth?",
    "Am I witnessing the full spiral, or one turn of it?"
  ]
};

/**
 * Looping intensity preferences
 */
export enum LoopingIntensity {
  LIGHT = 'light',        // Single clarity check only
  FULL = 'full',          // 2-3 cycles to distill essence
  SACRED = 'sacred'       // Loop until user confirms "yes, that's it"
}

/**
 * Configuration for looping behavior
 */
export interface LoopingConfig {
  intensity: LoopingIntensity;
  maxLoops: number;
  convergenceThreshold: number;  // Stop looping when convergence > threshold
  emotionalThreshold: number;    // Activate when emotional intensity > threshold
  ambiguityThreshold: number;    // Activate when meaning ambiguity > threshold
  preservePacing: boolean;       // Maintain conversation flow
  elementalAdaptation: boolean;  // Use element-specific language
}

/**
 * Default configuration
 */
export const DEFAULT_LOOPING_CONFIG: LoopingConfig = {
  intensity: LoopingIntensity.FULL,
  maxLoops: 3,
  convergenceThreshold: 0.85,
  emotionalThreshold: 0.7,
  ambiguityThreshold: 0.6,
  preservePacing: true,
  elementalAdaptation: true
};

/**
 * Main implementation of the Looping Protocol
 */
export class LoopingProtocolImpl implements LoopingProtocol {
  private config: LoopingConfig;

  constructor(config: Partial<LoopingConfig> = {}) {
    this.config = { ...DEFAULT_LOOPING_CONFIG, ...config };
  }

  /**
   * Step 1: Listen - Capture both surface and depth
   */
  listen(input: string): string {
    // This would integrate with existing dual-track processor
    // Left hemisphere: categorize/analyze
    // Right hemisphere: attend to novelty/emotion
    return input; // Simplified for now
  }

  /**
   * Step 2: Paraphrase - Reflect through elemental lens
   */
  paraphrase(state: LoopingState): string {
    const { surfaceCapture, depthInference, elementalMode } = state;

    // Generate paraphrase based on elemental mode
    const elementalFraming = this.getElementalFraming(elementalMode);

    // Combine surface understanding with depth inference
    const paraphrase = `${elementalFraming.opener} ${this.distillEssence(surfaceCapture, depthInference)} ${elementalFraming.bridge}`;

    return paraphrase;
  }

  /**
   * Step 3: Check - Non-presumptive validation
   */
  check(state: LoopingState): string {
    if (!this.config.elementalAdaptation) {
      return "Did I catch that, or is there something else?";
    }

    return this.generateElementalCheck(state.elementalMode, state);
  }

  /**
   * Step 4: Correct - Refine based on user feedback
   */
  correct(userFeedback: string, state: LoopingState): LoopingState {
    // Update adjustment history
    state.adjustmentHistory.push(userFeedback);

    // Refine depth inference based on correction
    state.depthInference = this.refineInference(
      state.depthInference,
      userFeedback
    );

    // Update convergence score
    state.convergence = this.calculateConvergence(state);

    // Increment loop count
    state.loopCount++;

    return state;
  }

  /**
   * Determine if looping should activate
   */
  shouldActivateLoop(triggers: LoopingTriggers): boolean {
    // Explicit request always triggers
    if (triggers.explicitRequest) return true;

    // User correction triggers loop
    if (triggers.userCorrection) return true;

    // Check thresholds
    if (triggers.emotionalIntensity > this.config.emotionalThreshold) return true;
    if (triggers.meaningAmbiguity > this.config.ambiguityThreshold) return true;
    if (triggers.essentialityGap > 0.5) return true;

    return false;
  }

  /**
   * Calculate convergence between understanding and user's essential meaning
   */
  calculateConvergence(state: LoopingState): number {
    // Base convergence on adjustment history
    const adjustmentCount = state.adjustmentHistory.length;

    // Each successful loop increases convergence
    let convergence = Math.min(0.3 + (state.loopCount * 0.2), 1.0);

    // Reduce if recent adjustments show significant corrections
    if (adjustmentCount > 0) {
      const lastAdjustment = state.adjustmentHistory[adjustmentCount - 1];
      if (lastAdjustment.toLowerCase().includes("no") ||
          lastAdjustment.toLowerCase().includes("not quite") ||
          lastAdjustment.toLowerCase().includes("more like")) {
        convergence *= 0.7;
      }
    }

    return convergence;
  }

  /**
   * Generate element-specific checking language
   */
  generateElementalCheck(element: ElementalArchetype, state: LoopingState): string {
    const checks = ELEMENTAL_CHECKS[element] || ELEMENTAL_CHECKS.aether;

    // Vary the check based on loop count to avoid repetition
    const checkIndex = Math.min(state.loopCount, checks.length - 1);
    return checks[checkIndex];
  }

  /**
   * Transition from looping to action/exploration
   */
  transitionToAction(state: LoopingState): string {
    const transitions: Record<ElementalArchetype, string> = {
      fire: "Now that we've found the spark—what wants to ignite?",
      water: "With this clarity of feeling—where does it want to flow?",
      earth: "Having grounded this—what wants to take form?",
      air: "Seeing the pattern clearly—what new perspective emerges?",
      aether: "Holding this essence—how does it want to unfold?"
    };

    return transitions[state.elementalMode] || transitions.aether;
  }

  // Private helper methods

  private getElementalFraming(element: ElementalArchetype) {
    const framings = {
      fire: {
        opener: "I'm hearing the spark of",
        bridge: "burning through your words."
      },
      water: {
        opener: "I'm feeling the current of",
        bridge: "flowing beneath the surface."
      },
      earth: {
        opener: "I'm sensing the foundation of",
        bridge: "grounding your experience."
      },
      air: {
        opener: "I'm seeing the pattern of",
        bridge: "connecting through your thoughts."
      },
      aether: {
        opener: "I'm witnessing",
        bridge: "emerging through you."
      }
    };

    return framings[element] || framings.aether;
  }

  private distillEssence(surface: string, depth: DepthInference): string {
    // This would use the depth inference to extract essential meaning
    // Simplified for demonstration
    return depth.essential || surface;
  }

  private refineInference(current: DepthInference, feedback: string): DepthInference {
    // This would use NLP and pattern matching to refine understanding
    // Simplified for demonstration
    return {
      ...current,
      essential: feedback // Update with user's correction
    };
  }
}

/**
 * Factory function to create protocol with user preferences
 */
export function createLoopingProtocol(
  userIntensity?: LoopingIntensity,
  elementalMode?: ElementalArchetype
): LoopingProtocolImpl {
  const config: Partial<LoopingConfig> = {};

  if (userIntensity) {
    switch (userIntensity) {
      case LoopingIntensity.LIGHT:
        config.maxLoops = 1;
        config.convergenceThreshold = 0.6;
        break;
      case LoopingIntensity.SACRED:
        config.maxLoops = 10; // Until user confirms
        config.convergenceThreshold = 0.95;
        break;
    }
  }

  return new LoopingProtocolImpl(config);
}