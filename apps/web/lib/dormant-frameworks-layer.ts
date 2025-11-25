/**
 * Dormant Frameworks Layer
 *
 * Available tools that remain completely dormant until:
 * 1. User explicitly asks for structure/framework
 * 2. User is drowning in complexity and needs organizing principles
 * 3. Natural conversation flow makes a lens useful (never forced)
 *
 * These are tools for sense-making, not analysis engines running in background.
 */

import { WitnessedPresence } from './sacred-witnessing-core';

export interface FrameworkActivation {
  activated: boolean;
  framework?: 'elemental' | 'archetypal' | 'somatic' | 'systemic' | 'narrative';
  reason?: 'explicit_request' | 'complexity_overwhelm' | 'natural_emergence';
  gentleOffering?: string; // How to offer without imposing
}

export interface ElementalLens {
  dominant?: 'air' | 'fire' | 'water' | 'earth' | 'aether';
  quality?: string;
  medicine?: string; // What this element offers
}

export class DormantFrameworksLayer {
  /**
   * Check if any framework should activate (very conservative)
   */
  checkForActivation(
    input: string,
    presence: WitnessedPresence,
    conversationHistory: string[]
  ): FrameworkActivation {
    // Check for explicit framework requests
    const explicitRequest = this.detectExplicitRequest(input);
    if (explicitRequest) {
      return {
        activated: true,
        framework: explicitRequest,
        reason: 'explicit_request'
      };
    }

    // Check for overwhelming complexity
    const overwhelm = this.detectOverwhelmingComplexity(input, presence);
    if (overwhelm) {
      return {
        activated: true,
        framework: 'elemental', // Simplest organizing principle
        reason: 'complexity_overwhelm',
        gentleOffering: this.createGentleOffering('elemental')
      };
    }

    // Check for natural emergence (very rare)
    const naturalEmergence = this.detectNaturalEmergence(input, conversationHistory);
    if (naturalEmergence) {
      return {
        activated: true,
        framework: naturalEmergence,
        reason: 'natural_emergence',
        gentleOffering: this.createGentleOffering(naturalEmergence)
      };
    }

    // Default: Stay dormant
    return {
      activated: false
    };
  }

  /**
   * Detect explicit requests for framework/structure
   */
  private detectExplicitRequest(input: string): FrameworkActivation['framework'] | null {
    const lowerInput = input.toLowerCase();

    // Elemental requests
    if (lowerInput.match(/element|elemental|fire|water|earth|air|spiralogic/)) {
      return 'elemental';
    }

    // Archetypal requests
    if (lowerInput.match(/archetype|archetypal|pattern|universal/)) {
      return 'archetypal';
    }

    // Somatic requests
    if (lowerInput.match(/body|somatic|felt sense|embodied|sensation/)) {
      return 'somatic';
    }

    // Systems requests
    if (lowerInput.match(/system|systemic|pattern|dynamic|relationship between/)) {
      return 'systemic';
    }

    // Story/narrative requests
    if (lowerInput.match(/story|narrative|journey|myth|hero/)) {
      return 'narrative';
    }

    // General framework requests
    if (lowerInput.match(/framework|structure|organize|make sense|understand.*all/)) {
      return 'elemental'; // Default to elemental as gentlest
    }

    return null;
  }

  /**
   * Detect when someone is drowning in complexity
   */
  private detectOverwhelmingComplexity(input: string, presence: WitnessedPresence): boolean {
    const overwhelmIndicators = [
      input.length > 500, // Very long, potentially rambling
      (input.match(/and/gi) || []).length > 10, // Many conjunctions
      input.match(/everything|all of it|so much|too much|overwhelming/i),
      input.match(/I don't know where to start|lost in|drowning|spinning/i),
      presence.quality === 'uncertain' && presence.movement === 'searching',
      (input.match(/\?/g) || []).length > 5 // Many questions
    ];

    return overwhelmIndicators.filter(Boolean).length >= 3;
  }

  /**
   * Detect natural emergence of framework need
   */
  private detectNaturalEmergence(
    input: string,
    conversationHistory: string[]
  ): FrameworkActivation['framework'] | null {
    // Look for patterns in recent conversation
    const recentContext = conversationHistory.slice(-3).join(' ').toLowerCase();

    // Elemental emergence
    if (recentContext.match(/transform|alchemize|transmute|change/)) {
      if (input.match(/fire|burn|heat|passion|intensity/i)) {
        return 'elemental';
      }
    }

    // Archetypal emergence
    if (recentContext.match(/pattern|recurring|always|never/)) {
      if (input.match(/why does this keep|same thing|pattern/i)) {
        return 'archetypal';
      }
    }

    // Somatic emergence
    if (recentContext.match(/feel|body|sensation|tight|heavy|light/)) {
      if (input.match(/in my body|physically|sensation/i)) {
        return 'somatic';
      }
    }

    return null;
  }

  /**
   * Create a gentle offering of framework without imposing
   */
  private createGentleOffering(framework: string): string {
    const offerings = {
      elemental: 'Would it help to look at this through the lens of the elements?',
      archetypal: 'There might be an archetypal pattern here, if you\'re interested in exploring that.',
      somatic: 'We could explore what your body knows about this, if that feels helpful.',
      systemic: 'Would it help to map the system you\'re navigating?',
      narrative: 'Sometimes seeing our story from a mythic perspective can help. Would that be useful?'
    };

    return offerings[framework as keyof typeof offerings] || 'Would a framework help organize what you\'re experiencing?';
  }

  /**
   * Apply elemental lens (only when activated)
   */
  applyElementalLens(input: string, presence: WitnessedPresence): ElementalLens {
    const lowerInput = input.toLowerCase();

    // Air: Mental, thoughts, perspective
    if (lowerInput.match(/think|thought|mind|idea|understand|analyze|perspective/)) {
      return {
        dominant: 'air',
        quality: 'mental clarity and perspective',
        medicine: 'stepping back to see the whole'
      };
    }

    // Fire: Transformation, passion, action
    if (lowerInput.match(/change|transform|passionate|angry|intense|action|do/)) {
      return {
        dominant: 'fire',
        quality: 'transformative energy',
        medicine: 'burning away what no longer serves'
      };
    }

    // Water: Emotions, flow, intuition
    if (lowerInput.match(/feel|emotion|intuition|flow|tears|sad|grief/)) {
      return {
        dominant: 'water',
        quality: 'emotional depth and flow',
        medicine: 'allowing feelings to move through'
      };
    }

    // Earth: Grounding, practical, material
    if (lowerInput.match(/ground|practical|real|solid|stable|body|physical/)) {
      return {
        dominant: 'earth',
        quality: 'grounded presence',
        medicine: 'finding solid ground'
      };
    }

    // Aether: Integration, spiritual, unity
    if (lowerInput.match(/spiritual|soul|meaning|purpose|whole|unity|connection/)) {
      return {
        dominant: 'aether',
        quality: 'unified awareness',
        medicine: 'seeing the sacred whole'
      };
    }

    // Default: Mixed elements
    return {
      quality: 'multiple elements dancing',
      medicine: 'finding balance'
    };
  }

  /**
   * Create elemental reflection (when framework is active)
   */
  createElementalReflection(lens: ElementalLens): string {
    if (!lens.dominant) {
      return `I notice ${lens.quality} here. ${lens.medicine} might be helpful.`;
    }

    const reflections = {
      air: `There's a lot of ${lens.dominant} energy here - ${lens.quality}. The medicine might be ${lens.medicine}.`,
      fire: `I feel the ${lens.dominant} element strongly - ${lens.quality}. Perhaps ${lens.medicine} is what's needed.`,
      water: `The ${lens.dominant} element is flowing through this - ${lens.quality}. ${lens.medicine} could bring relief.`,
      earth: `${lens.dominant.charAt(0).toUpperCase() + lens.dominant.slice(1)} energy is present - ${lens.quality}. ${lens.medicine} might help.`,
      aether: `This touches the ${lens.dominant} realm - ${lens.quality}. ${lens.medicine} is possible.`
    };

    return reflections[lens.dominant] || `I notice ${lens.quality}. ${lens.medicine} might serve.`;
  }

  /**
   * Apply archetypal lens (only when activated)
   */
  applyArchetypalLens(input: string, presence: WitnessedPresence): string {
    const lowerInput = input.toLowerCase();

    // Detect archetypal patterns
    if (lowerInput.match(/keep happening|always|never|pattern/)) {
      return 'You\'re noticing a pattern. What archetype might be playing out here?';
    }

    if (lowerInput.match(/stuck|trapped|prison|can't escape/)) {
      return 'This has the quality of an initiation. What is asking to be transformed?';
    }

    if (lowerInput.match(/lost|searching|journey|path/)) {
      return 'You\'re in the wandering phase of the journey. What are you seeking?';
    }

    if (lowerInput.match(/death|ending|loss|grief/)) {
      return 'Something is completing its cycle. What new beginning does this ending make possible?';
    }

    return 'There\'s an archetypal dimension to this. What universal story are you living?';
  }

  /**
   * Apply somatic lens (only when activated)
   */
  applySomaticLens(input: string): string {
    const lowerInput = input.toLowerCase();

    // Body location mentions
    if (lowerInput.match(/chest|heart/)) {
      return 'Your heart/chest is speaking. What does it need?';
    }

    if (lowerInput.match(/stomach|gut|belly/)) {
      return 'Your gut knows something. What is its wisdom?';
    }

    if (lowerInput.match(/throat/)) {
      return 'Something wants to be expressed. What needs to be spoken?';
    }

    if (lowerInput.match(/head/)) {
      return 'There\'s activation in your head. Would grounding help?';
    }

    // Sensation qualities
    if (lowerInput.match(/tight|tense|constricted/)) {
      return 'Where there\'s tightness, something is being held. What wants to soften?';
    }

    if (lowerInput.match(/heavy|weight|burden/)) {
      return 'Your body is carrying weight. What would it be like to set it down?';
    }

    if (lowerInput.match(/light|free|open/)) {
      return 'Your body knows freedom. How can you follow that opening?';
    }

    return 'Your body has wisdom here. What is it telling you?';
  }

  /**
   * Check if framework should deactivate
   */
  shouldDeactivate(
    input: string,
    frameworkUseCount: number
  ): boolean {
    // Deactivate if user shows disinterest
    if (input.toLowerCase().match(/don't need|no thanks|just listen|stop/)) {
      return true;
    }

    // Deactivate after brief use (2-3 exchanges)
    if (frameworkUseCount > 3) {
      return true;
    }

    // Deactivate if conversation becomes very light
    if (input.match(/haha|lol|😊|😄|anyway|nevermind/)) {
      return true;
    }

    return false;
  }

  /**
   * Generate a bridge back to pure witnessing
   */
  createDeactivationBridge(): string {
    const bridges = [
      'Let\'s return to simply being with what is.',
      'Coming back to just witnessing...',
      'Releasing the framework now, returning to presence.',
      'Let\'s set aside the lens and just be here.',
      'Thank you for exploring that. What else is present?'
    ];

    return bridges[Math.floor(Math.random() * bridges.length)];
  }
}

// Lazy-loading singleton pattern
let _dormantFrameworks: DormantFrameworksLayer | null = null;

export const getDormantFrameworks = (): DormantFrameworksLayer => {
  if (!_dormantFrameworks) {
    _dormantFrameworks = new DormantFrameworksLayer();
  }
  return _dormantFrameworks;
};