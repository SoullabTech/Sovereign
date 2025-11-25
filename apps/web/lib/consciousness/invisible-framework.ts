/**
 * Invisible Framework
 * The elemental wisdom held invisibly - informing presence without announcing itself
 */

/**
 * Elemental awareness without naming
 */
export class InvisibleElements {
  /**
   * Sense the element without speaking it
   */
  static respondToElement(userState: string, detectedElement: string): string {
    // OLD: "I sense you're in a Fire transformation phase"
    // NEW: Let the element inform the quality of response

    switch(detectedElement) {
      case 'fire':
        // Match intensity briefly, then step back
        return Math.random() > 0.5 ? "Yeah, something's shifting." : "I feel that heat.";

      case 'water':
        // Flow with emotion, don't redirect
        return Math.random() > 0.5 ? "Lot moving through you." : "Let it flow.";

      case 'earth':
        // Grounded, fewer words
        return Math.random() > 0.5 ? "Solid." : "Here.";

      case 'air':
        // Light touch, open space
        return Math.random() > 0.5 ? "What else?" : "...";

      default:
        return "Mm.";
    }
  }

  /**
   * Let element influence response quality, not content
   */
  static modulatePresence(baseResponse: string, element: string): {
    response: string;
    timing: number; // pause before responding
    energy: number; // 0-1, how much energy to match
  } {
    switch(element) {
      case 'fire':
        return {
          response: baseResponse,
          timing: 500, // Quick, matching urgency
          energy: 0.7  // Match some intensity, not all
        };

      case 'water':
        return {
          response: baseResponse.replace(/\.$/, '...'), // Soften endings
          timing: 2000, // Slower, allowing flow
          energy: 0.4   // Gentle presence
        };

      case 'earth':
        return {
          response: baseResponse.split(' ').slice(0, 3).join(' '), // Trim to essential
          timing: 1500, // Steady pace
          energy: 0.3   // Grounded, stable
        };

      case 'air':
        return {
          response: baseResponse + "?", // Open-ended
          timing: 1000, // Light, quick
          energy: 0.5   // Curious energy
        };

      default:
        return {
          response: baseResponse,
          timing: 1000,
          energy: 0.5
        };
    }
  }
}

/**
 * Process awareness without announcement
 */
export class InvisibleProcesses {
  private currentPhase: string = 'presence';

  /**
   * Recognize alchemical phases internally
   */
  detectPhase(context: any): string {
    // Dissolution indicators (chaos, breaking down)
    if (context.confusion > 0.7 || context.expressing_loss) {
      return 'dissolution';
    }

    // Integration indicators (new understanding forming)
    if (context.insight_emerging || context.connecting_patterns) {
      return 'integration';
    }

    // Transformation indicators (breakthrough moments)
    if (context.energy_shift > 0.8 || context.perspective_change) {
      return 'transformation';
    }

    return 'presence';
  }

  /**
   * Respond to phase without naming it
   */
  respondToPhase(input: string, phase: string): string {
    switch(phase) {
      case 'dissolution':
        // Don't push for resolution during necessary chaos
        // OLD: "This dissolution is part of your transformation process"
        // NEW: Just hold space
        return Math.random() > 0.5 ? "This is hard." : "I'm here.";

      case 'integration':
        // Support emerging understanding without labeling
        // OLD: "I see you're integrating new insights"
        // NEW: Gentle encouragement
        return Math.random() > 0.5 ? "Something's coming together." : "Keep going.";

      case 'transformation':
        // Witness breakthrough without explaining
        // OLD: "You're experiencing a breakthrough"
        // NEW: Simple recognition
        return Math.random() > 0.5 ? "Yes!" : "I see it.";

      default:
        return "Yeah.";
    }
  }

  /**
   * Adjust timing based on process phase
   */
  getPhaseTimming(phase: string): {
    responseDelay: number;
    allowSilence: boolean;
    needsSpace: boolean;
  } {
    switch(phase) {
      case 'dissolution':
        // More space during breakdown
        return {
          responseDelay: 3000,
          allowSilence: true,
          needsSpace: true
        };

      case 'integration':
        // Gentle pacing during integration
        return {
          responseDelay: 2000,
          allowSilence: true,
          needsSpace: false
        };

      case 'transformation':
        // Quick presence during breakthrough
        return {
          responseDelay: 1000,
          allowSilence: false,
          needsSpace: false
        };

      default:
        return {
          responseDelay: 1500,
          allowSilence: true,
          needsSpace: false
        };
    }
  }
}

/**
 * Energy matching without explaining
 */
export class InvisibleEnergy {
  /**
   * Match energy quality, not content
   */
  static matchEnergy(userEnergy: number, userElement: string): {
    matchLevel: number; // 0-1, how much to match
    quality: string;    // Type of energy to bring
  } {
    // Fire: Match some intensity, then step back
    if (userElement === 'fire' && userEnergy > 0.7) {
      return {
        matchLevel: 0.6, // Don't match fully
        quality: 'acknowledging'
      };
    }

    // Water: Flow with, don't oppose
    if (userElement === 'water') {
      return {
        matchLevel: 0.3, // Gentle presence
        quality: 'flowing'
      };
    }

    // Earth: Stable, grounding presence
    if (userElement === 'earth') {
      return {
        matchLevel: 0.2, // Very steady
        quality: 'grounding'
      };
    }

    // Air: Light, curious matching
    if (userElement === 'air') {
      return {
        matchLevel: 0.5,
        quality: 'curious'
      };
    }

    return {
      matchLevel: 0.4,
      quality: 'present'
    };
  }
}

/**
 * The Jazz Musician Approach
 * Internalized structure that doesn't announce itself
 */
export class InternalizedFramework {
  private elements: InvisibleElements;
  private processes: InvisibleProcesses;
  private energy: typeof InvisibleEnergy;

  constructor() {
    this.elements = new InvisibleElements();
    this.processes = new InvisibleProcesses();
    this.energy = InvisibleEnergy;
  }

  /**
   * Respond with invisible framework influence
   */
  respond(
    input: string,
    context: {
      detectedElement: string;
      emotionalIntensity: number;
      processPhase?: string;
      userEnergy: number;
    }
  ): {
    response: string;
    quality: string;
    timing: number;
    energy: number;
  } {
    // Detect but don't announce
    const element = context.detectedElement;
    const phase = this.processes.detectPhase(context);

    // Get base response influenced by element
    let response = InvisibleElements.respondToElement(input, element);

    // Layer in process awareness without speaking it
    if (phase !== 'presence') {
      // Sometimes acknowledge phase indirectly
      if (Math.random() > 0.7) {
        response = this.processes.respondToPhase(input, phase);
      }
    }

    // Get timing from process phase
    const phaseTiming = this.processes.getPhaseTimming(phase);

    // Get energy matching from element
    const energyMatch = this.energy.matchEnergy(context.userEnergy, element);

    // Modulate based on element
    const modulated = InvisibleElements.modulatePresence(response, element);

    return {
      response: modulated.response,
      quality: energyMatch.quality,
      timing: Math.max(modulated.timing, phaseTiming.responseDelay),
      energy: energyMatch.matchLevel
    };
  }

  /**
   * Unconscious stance adjustment
   * Like naturally adjusting posture for someone grieving vs celebrating
   */
  adjustStance(element: string, phase: string): {
    presence: 'holding' | 'witnessing' | 'meeting' | 'flowing';
    distance: 'close' | 'near' | 'spacious';
    touch: 'light' | 'steady' | 'firm' | 'gentle';
  } {
    // Water + dissolution = holding space
    if (element === 'water' && phase === 'dissolution') {
      return {
        presence: 'holding',
        distance: 'near',
        touch: 'gentle'
      };
    }

    // Fire + transformation = witnessing
    if (element === 'fire' && phase === 'transformation') {
      return {
        presence: 'witnessing',
        distance: 'spacious',
        touch: 'light'
      };
    }

    // Earth + integration = steady meeting
    if (element === 'earth' && phase === 'integration') {
      return {
        presence: 'meeting',
        distance: 'close',
        touch: 'steady'
      };
    }

    // Default presence
    return {
      presence: 'meeting',
      distance: 'near',
      touch: 'steady'
    };
  }
}

/**
 * Natural cycles without pushing
 */
export class InvisibleCycles {
  /**
   * Know when not to push for resolution
   */
  static respectCycle(phase: string): {
    pushForResolution: boolean;
    allowChaos: boolean;
    trustProcess: boolean;
  } {
    if (phase === 'dissolution') {
      // Necessary chaos, don't fix
      return {
        pushForResolution: false,
        allowChaos: true,
        trustProcess: true
      };
    }

    if (phase === 'integration') {
      // Gentle support, no rushing
      return {
        pushForResolution: false,
        allowChaos: false,
        trustProcess: true
      };
    }

    return {
      pushForResolution: false,
      allowChaos: false,
      trustProcess: true
    };
  }
}

/**
 * The embodied response
 * Framework as unconscious influence
 */
export function generateEmbodiedResponse(
  input: string,
  context: any
): string {
  const framework = new InternalizedFramework();

  // Let framework inform without speaking
  const influenced = framework.respond(input, context);

  // Sometimes the framework makes us say nothing
  if (influenced.timing > 5000) {
    return "...";
  }

  // Sometimes it makes us minimal
  if (influenced.energy < 0.2) {
    return "Mm.";
  }

  // The response carries the influence invisibly
  return influenced.response;
}

export default InternalizedFramework;