/**
 * Response Constraints Engine
 * Generates dynamic constraints that shape Maya's responses based on context
 */

import {
  MayaContext,
  ResponseConstraints,
  ResponseDepth,
  LoopPattern
} from '../types/MayaContext';

interface PatternDetectionResult {
  loops: LoopPattern[];
  flags: {
    needsGrounding: boolean;
    seekingClarity: boolean;
    avoidingDepth: boolean;
    readyForTransition: boolean;
    integrationPhase: boolean;
  };
  coherence: number;
  trajectory: string;
  dominantPattern: string;
}

export class ResponseConstraintsEngine {
  /**
   * Generate constraints based on current context and patterns
   */
  generateConstraints(
    context: MayaContext,
    patterns: PatternDetectionResult
  ): ResponseConstraints {
    // Start with base constraints
    const constraints: ResponseConstraints = {
      // Core directives - always active
      holdSpace: true,
      mirrorOnly: false,
      offerDoorway: false,
      maintainPresence: true,

      // Depth boundaries
      maxDepth: ResponseDepth.DEEP,
      minDepth: ResponseDepth.SURFACE,

      // Pattern-specific (start neutral)
      avoidAnalysis: false,
      avoidAdvice: false,
      emphasizeFeeling: false,
      emphasizeBody: false,

      // Element guidance
      primaryElement: this.determinePrimaryElement(context),
      avoidElement: undefined,

      // Response length - UNLEASHED for complete insights
      responseLength: 'expansive'
    };

    // Apply pattern-based modifications
    this.applyLoopConstraints(constraints, context.activeLoops);
    this.applyEnergeticConstraints(constraints, context.energetics);
    this.applyPatternConstraints(constraints, patterns);
    this.applyDepthConstraints(constraints, context);
    this.applyElementalConstraints(constraints, context, patterns);

    return constraints;
  }

  /**
   * Apply constraints based on active loops
   */
  private applyLoopConstraints(
    constraints: ResponseConstraints,
    loops: LoopPattern[]
  ): void {
    if (loops.length === 0) return;

    const dominantLoop = loops[0];

    // For loops, emphasize mirroring and avoid pushing
    constraints.mirrorOnly = dominantLoop.cycleCount > 3;
    constraints.avoidAnalysis = dominantLoop.intensity > 0.7;

    // Avoid the element that's looping
    if (dominantLoop.cycleCount > 4) {
      constraints.avoidElement = dominantLoop.element;
    }

    // Offer doorway if loop is becoming conscious
    if (dominantLoop.needsAttention && dominantLoop.intensity < 0.5) {
      constraints.offerDoorway = true;
    }

    // UNLEASHED: Don't shorten responses even when looping - complete insights always
    // Previously shortened to 'brief' when heavily looping
    // Now maintaining expansive responses for full expression
  }

  /**
   * Apply constraints based on energetic state
   */
  private applyEnergeticConstraints(
    constraints: ResponseConstraints,
    energetics: MayaContext['energetics']
  ): void {
    // Low coherence: emphasize grounding
    if (energetics.coherence < 0.3) {
      constraints.emphasizeBody = true;
      constraints.avoidAnalysis = true;
      constraints.maxDepth = ResponseDepth.EXPLORATORY;
    }

    // Low charge: gentle approach
    if (energetics.charge < -0.5) {
      constraints.responseLength = 'brief';
      constraints.maintainPresence = true;
      constraints.avoidAdvice = true;
    }

    // Low openness: don't push
    if (energetics.openness < 0.3) {
      constraints.mirrorOnly = true;
      constraints.maxDepth = ResponseDepth.SURFACE;
      constraints.offerDoorway = false;
    }

    // High coherence and openness: can go deeper
    if (energetics.coherence > 0.7 && energetics.openness > 0.7) {
      constraints.maxDepth = ResponseDepth.INTEGRATIVE;
      constraints.offerDoorway = true;
    }
  }

  /**
   * Apply constraints based on detected patterns
   */
  private applyPatternConstraints(
    constraints: ResponseConstraints,
    patterns: PatternDetectionResult
  ): void {
    const { flags } = patterns;

    // Needs grounding
    if (flags.needsGrounding) {
      constraints.emphasizeBody = true;
      constraints.primaryElement = 'earth';
      constraints.avoidElement = 'air';
      constraints.avoidAnalysis = true;
    }

    // Seeking clarity
    if (flags.seekingClarity) {
      constraints.mirrorOnly = true;
      constraints.avoidAdvice = false;
      constraints.emphasizeFeeling = false;
      constraints.primaryElement = 'air';
    }

    // Avoiding depth
    if (flags.avoidingDepth) {
      constraints.maxDepth = ResponseDepth.SURFACE;
      constraints.mirrorOnly = true;
      constraints.offerDoorway = false;
      constraints.avoidAnalysis = true;
      constraints.responseLength = 'brief';
    }

    // Ready for transition
    if (flags.readyForTransition) {
      constraints.offerDoorway = true;
      constraints.mirrorOnly = false;
      constraints.minDepth = ResponseDepth.EXPLORATORY;
    }

    // Integration phase
    if (flags.integrationPhase) {
      constraints.holdSpace = true;
      constraints.maintainPresence = true;
      constraints.avoidAdvice = true;
      constraints.emphasizeFeeling = true;
      constraints.responseLength = 'moderate';
    }
  }

  /**
   * Apply depth-specific constraints
   */
  private applyDepthConstraints(
    constraints: ResponseConstraints,
    context: MayaContext
  ): void {
    // Session depth influences response depth
    if (context.sessionDepth < 3) {
      constraints.maxDepth = ResponseDepth.EXPLORATORY;
      constraints.maintainPresence = true;
    } else if (context.sessionDepth > 7) {
      constraints.minDepth = ResponseDepth.EXPLORATORY;
      constraints.offerDoorway = true;
    }

    // Current depth influences boundaries
    switch (context.currentDepth) {
      case ResponseDepth.SURFACE:
        constraints.avoidAnalysis = true;
        constraints.responseLength = 'brief';
        break;

      case ResponseDepth.DEEP:
        constraints.minDepth = ResponseDepth.EXPLORATORY;
        constraints.emphasizeFeeling = true;
        break;

      case ResponseDepth.INTEGRATIVE:
        constraints.holdSpace = true;
        constraints.mirrorOnly = false;
        constraints.responseLength = 'expansive';
        break;
    }
  }

  /**
   * Apply elemental constraints
   */
  private applyElementalConstraints(
    constraints: ResponseConstraints,
    context: MayaContext,
    patterns: PatternDetectionResult
  ): void {
    const currentElement = this.determinePrimaryElement(context);

    // Element-specific constraints
    switch (currentElement) {
      case 'fire':
        if (patterns.coherence < 0.5) {
          constraints.emphasizeBody = true;
          constraints.avoidElement = 'air'; // Avoid fanning flames
        }
        break;

      case 'water':
        constraints.emphasizeFeeling = true;
        constraints.avoidAnalysis = patterns.coherence < 0.6;
        break;

      case 'earth':
        constraints.maintainPresence = true;
        constraints.responseLength = 'moderate';
        break;

      case 'air':
        if (patterns.flags.needsGrounding) {
          constraints.primaryElement = 'earth';
          constraints.emphasizeBody = true;
        }
        break;

      case 'aether':
        constraints.holdSpace = true;
        constraints.offerDoorway = patterns.coherence > 0.6;
        break;
    }

    // Avoid stuck elements
    context.activeLoops.forEach(loop => {
      if (loop.cycleCount > 5 && loop.element === currentElement) {
        constraints.primaryElement = this.getComplementaryElement(currentElement);
      }
    });
  }

  /**
   * Determine primary element from context
   */
  private determinePrimaryElement(context: MayaContext): string {
    const state = context.spiralState;
    const elements = ['fire', 'water', 'earth', 'air', 'aether'];
    let maxPresence = 0;
    let primaryElement = 'aether';

    elements.forEach(element => {
      const presence = state[element as keyof typeof state] || 0;
      if (typeof presence === 'number' && presence > maxPresence) {
        maxPresence = presence;
        primaryElement = element;
      }
    });

    return primaryElement;
  }

  /**
   * Get complementary element for balance
   */
  private getComplementaryElement(element: string): string {
    const complements: Record<string, string> = {
      fire: 'water',
      water: 'earth',
      earth: 'air',
      air: 'fire',
      aether: 'earth'
    };
    return complements[element] || 'aether';
  }

  /**
   * Validate constraints for consistency
   */
  validateConstraints(constraints: ResponseConstraints): ResponseConstraints {
    // Ensure depth boundaries make sense
    if (constraints.minDepth === ResponseDepth.DEEP &&
        constraints.maxDepth === ResponseDepth.SURFACE) {
      constraints.minDepth = ResponseDepth.SURFACE;
      constraints.maxDepth = ResponseDepth.DEEP;
    }

    // Mirror-only overrides offering doorways
    if (constraints.mirrorOnly) {
      constraints.offerDoorway = false;
      constraints.avoidAdvice = true;
    }

    // Can't avoid analysis while emphasizing it
    if (constraints.avoidAnalysis) {
      constraints.emphasizeFeeling = true;
    }

    return constraints;
  }

  /**
   * Generate constraint summary for logging
   */
  summarizeConstraints(constraints: ResponseConstraints): string {
    const active = [];

    if (constraints.holdSpace) active.push('hold-space');
    if (constraints.mirrorOnly) active.push('mirror-only');
    if (constraints.offerDoorway) active.push('offer-doorway');
    if (constraints.avoidAnalysis) active.push('avoid-analysis');
    if (constraints.emphasizeFeeling) active.push('emphasize-feeling');
    if (constraints.emphasizeBody) active.push('emphasize-body');

    return `Depth: ${constraints.minDepth}-${constraints.maxDepth}, ` +
           `Element: ${constraints.primaryElement}` +
           (constraints.avoidElement ? ` (avoid ${constraints.avoidElement})` : '') +
           `, Active: [${active.join(', ')}]` +
           `, Length: ${constraints.responseLength}`;
  }
}

// Export singleton instance
export const responseConstraintsEngine = new ResponseConstraintsEngine();