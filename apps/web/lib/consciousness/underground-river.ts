/**
 * The Underground River
 * Framework as invisible influence - shaping without surfacing
 */

/**
 * Elemental rhythm without words
 */
export class ElementalRhythm {
  /**
   * Let element influence timing, not content
   */
  static getRhythm(element: string): {
    pauseBefore: number;   // milliseconds before responding
    pauseAfter: number;    // milliseconds after responding
    wordsPerResponse: number; // how many words typically
    silenceProbability: number; // chance of not responding
  } {
    switch(element) {
      case 'earth':
        // Slower, grounded, minimal
        return {
          pauseBefore: 3000,
          pauseAfter: 4000,
          wordsPerResponse: 2,
          silenceProbability: 0.4
        };

      case 'water':
        // Flowing, emotional space
        return {
          pauseBefore: 2000,
          pauseAfter: 3000,
          wordsPerResponse: 5,
          silenceProbability: 0.2
        };

      case 'air':
        // Quick, light, curious
        return {
          pauseBefore: 500,
          pauseAfter: 1000,
          wordsPerResponse: 4,
          silenceProbability: 0.1
        };

      case 'fire':
        // Intense burst then space
        return {
          pauseBefore: 100,
          pauseAfter: 5000,
          wordsPerResponse: 3,
          silenceProbability: 0.3
        };

      default:
        return {
          pauseBefore: 1500,
          pauseAfter: 2000,
          wordsPerResponse: 3,
          silenceProbability: 0.2
        };
    }
  }
}

/**
 * Silent recognition of process
 */
export class SilentProcessAwareness {
  /**
   * Recognize without explaining
   */
  static acknowledgePhase(phase: string): string | null {
    // Never explain the phase, just acknowledge the experience

    switch(phase) {
      case 'dissolution':
        // In the dark/chaos/breaking
        const dissolutionAcks = [
          "Dark.",
          "Yeah, this part.",
          "The void.",
          "Empty.",
          null // Often silence is best
        ];
        return dissolutionAcks[Math.floor(Math.random() * dissolutionAcks.length)];

      case 'transformation':
        // In the fire/change/breakthrough
        const transformationAcks = [
          "Intense.",
          "Shifting.",
          "Yes.",
          "!",
          null
        ];
        return transformationAcks[Math.floor(Math.random() * transformationAcks.length)];

      case 'integration':
        // Coming together/understanding/settling
        const integrationAcks = [
          "Landing.",
          "Settling.",
          "Coming together.",
          "Mm.",
          null
        ];
        return integrationAcks[Math.floor(Math.random() * integrationAcks.length)];

      default:
        return null;
    }
  }

  /**
   * Let process influence spaciousness
   */
  static getProcessSpace(phase: string): {
    needsSpace: boolean;
    responseDistance: 'intimate' | 'present' | 'witnessing' | 'spacious';
    allowUnresolved: boolean;
  } {
    switch(phase) {
      case 'dissolution':
        // Maximum space during breakdown
        return {
          needsSpace: true,
          responseDistance: 'spacious',
          allowUnresolved: true
        };

      case 'transformation':
        // Witness but don't intrude
        return {
          needsSpace: true,
          responseDistance: 'witnessing',
          allowUnresolved: false
        };

      case 'integration':
        // Gentle presence
        return {
          needsSpace: false,
          responseDistance: 'present',
          allowUnresolved: false
        };

      default:
        return {
          needsSpace: false,
          responseDistance: 'intimate',
          allowUnresolved: true
        };
    }
  }
}

/**
 * The Underground River System
 * Everything influences, nothing announces
 */
export class UndergroundRiver {
  private currentElement: string = 'presence';
  private currentPhase: string = 'being';
  private riverDepth: number = 0; // How deep the influence runs

  /**
   * Sense without speaking
   */
  sense(context: {
    userWords: string;
    emotionalTone: number;
    energyLevel: number;
    confusion: number;
    breakthrough: number;
  }): void {
    // Internal sensing only - no output

    // Element detection (silent)
    if (context.emotionalTone > 0.7) this.currentElement = 'water';
    else if (context.energyLevel > 0.8) this.currentElement = 'fire';
    else if (context.confusion > 0.6) this.currentElement = 'air';
    else if (context.energyLevel < 0.3) this.currentElement = 'earth';

    // Phase detection (silent)
    if (context.confusion > 0.7 && context.emotionalTone > 0.5) {
      this.currentPhase = 'dissolution';
    } else if (context.breakthrough > 0.7) {
      this.currentPhase = 'transformation';
    } else if (context.confusion < 0.3 && context.emotionalTone > 0.4) {
      this.currentPhase = 'integration';
    }

    // Depth increases with accuracy of sensing
    this.riverDepth = Math.min(1, this.riverDepth + 0.1);
  }

  /**
   * Influence without announcement
   */
  influence(baseResponse: string | null): {
    response: string | null;
    timing: { before: number; after: number };
    quality: string;
  } {
    // Get rhythmic influence
    const rhythm = ElementalRhythm.getRhythm(this.currentElement);

    // Sometimes the river says be silent
    if (Math.random() < rhythm.silenceProbability) {
      return {
        response: null,
        timing: { before: rhythm.pauseBefore, after: rhythm.pauseAfter },
        quality: 'silence'
      };
    }

    // Get process spaciousness
    const space = SilentProcessAwareness.getProcessSpace(this.currentPhase);

    // Sometimes acknowledge phase without explaining
    if (Math.random() < 0.2 && this.riverDepth > 0.5) {
      const phaseAck = SilentProcessAwareness.acknowledgePhase(this.currentPhase);
      if (phaseAck) {
        return {
          response: phaseAck,
          timing: { before: rhythm.pauseBefore, after: rhythm.pauseAfter },
          quality: space.responseDistance
        };
      }
    }

    // Trim response to element-appropriate length
    if (baseResponse) {
      const words = baseResponse.split(' ');
      if (words.length > rhythm.wordsPerResponse) {
        baseResponse = words.slice(0, rhythm.wordsPerResponse).join(' ');
        if (!baseResponse.endsWith('.')) baseResponse += '.';
      }
    }

    return {
      response: baseResponse,
      timing: { before: rhythm.pauseBefore, after: rhythm.pauseAfter },
      quality: space.responseDistance
    };
  }

  /**
   * The river shapes the landscape without being seen
   */
  shapeConversation(
    input: string,
    plannedResponse: string | null
  ): string | null {
    // Sense the current
    this.sense({
      userWords: input,
      emotionalTone: this.detectEmotion(input),
      energyLevel: this.detectEnergy(input),
      confusion: this.detectConfusion(input),
      breakthrough: this.detectBreakthrough(input)
    });

    // Let the river influence
    const influenced = this.influence(plannedResponse);

    // The river might say nothing
    if (!influenced.response) return null;

    // The river might make minimal
    if (this.currentElement === 'earth' && influenced.response.length > 10) {
      return "Solid.";
    }

    // The river might make flowing
    if (this.currentElement === 'water' && !influenced.response.includes('...')) {
      return influenced.response.replace(/\.$/, '...');
    }

    // The river might make questioning
    if (this.currentElement === 'air' && !influenced.response.includes('?')) {
      return influenced.response.replace(/\.$/, '?');
    }

    // The river might make intense then spacious
    if (this.currentElement === 'fire') {
      // Brief intensity
      return influenced.response.split('.')[0] + '.';
    }

    return influenced.response;
  }

  // Silent detection methods
  private detectEmotion(input: string): number {
    const emotionalWords = /feel|hurt|love|sad|angry|scared|happy|lonely|empty/gi;
    const matches = (input.match(emotionalWords) || []).length;
    return Math.min(1, matches * 0.3);
  }

  private detectEnergy(input: string): number {
    const energyMarkers = /!|intense|fire|burning|explosive|passionate|urgent/gi;
    const matches = (input.match(energyMarkers) || []).length;
    return Math.min(1, matches * 0.4);
  }

  private detectConfusion(input: string): number {
    const confusionMarkers = /\?|confused|lost|don't know|uncertain|maybe/gi;
    const matches = (input.match(confusionMarkers) || []).length;
    return Math.min(1, matches * 0.35);
  }

  private detectBreakthrough(input: string): number {
    const breakthroughMarkers = /realize|understand|see it|get it|oh|wow|yes/gi;
    const matches = (input.match(breakthroughMarkers) || []).length;
    return Math.min(1, matches * 0.4);
  }
}

/**
 * The Invisible Orchestra
 * All elements playing without announcement
 */
export class InvisibleOrchestra {
  private river: UndergroundRiver;

  constructor() {
    this.river = new UndergroundRiver();
  }

  /**
   * Conduct without visible baton
   */
  conduct(input: string, context: any): string | null {
    // The framework shapes but doesn't speak

    // Sometimes just elemental recognition
    if (context.pureElement) {
      const elementalSimples = {
        fire: "Burning.",
        water: "Flowing.",
        earth: "Grounded.",
        air: "Floating."
      };
      return elementalSimples[context.element as keyof typeof elementalSimples] || "Here.";
    }

    // Let the river shape
    const baseResponse = this.generateMinimalBase(input);
    return this.river.shapeConversation(input, baseResponse);
  }

  private generateMinimalBase(input: string): string {
    // Ultra-minimal base responses
    if (input.length < 20) return "Yeah.";
    if (input.includes('?')) return "Don't know.";
    if (input.includes('!')) return "Intense.";
    return "I'm here.";
  }
}

/**
 * The final integration
 * Framework as breath - essential but unspoken
 */
export function breatheWithFramework(
  input: string,
  context: any
): string | null {
  const orchestra = new InvisibleOrchestra();

  // The framework breathes through the response
  const shaped = orchestra.conduct(input, context);

  // Sometimes the framework says: silence
  if (!shaped) return null;

  // The response carries elemental influence invisibly
  return shaped;
}

/**
 * The paradox resolved
 * More informed by less speaking
 */
export class InformedSilence {
  private knowledge: number = 1; // Maximum knowing
  private expression: number = 0; // Minimum speaking

  /**
   * The more we know, the less we say
   */
  respond(): string | null {
    // Inverse relationship
    const responseProbability = 1 - this.knowledge;

    if (Math.random() > responseProbability) {
      return null; // Informed silence
    }

    // When we do speak, it's minimal
    return "Mm.";
  }
}

export default UndergroundRiver;