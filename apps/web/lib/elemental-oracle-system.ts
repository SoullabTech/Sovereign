/**
 * Elemental Oracle System
 *
 * Connects to the elemental agents (Fire, Water, Earth, Air, Aether, Shadow)
 * to provide archetypal wisdom streams that enhance Maya's responses.
 *
 * Each element provides a different lens of wisdom:
 * - Fire: Transformation, passion, action, vision
 * - Water: Emotion, intuition, flow, healing
 * - Earth: Grounding, manifestation, stability, practical wisdom
 * - Air: Clarity, communication, insight, mental understanding
 * - Aether: Unity, transcendence, spiritual connection
 * - Shadow: Hidden truths, unconscious patterns, integration
 */

import { EngagementMode } from './intelligent-engagement-system';

export interface ElementalWisdom {
  element: string;
  wisdom: string;
  archetype: string;
  resonance: number; // 0-1, how strongly this element resonates
}

export class ElementalOracleSystem {
  private readonly ELEMENTAL_ARCHETYPES = {
    fire: {
      archetype: 'The Transformer',
      qualities: ['passion', 'vision', 'action', 'courage', 'transformation'],
      wisdomPatterns: [
        "There's a transformative fire here",
        "I sense the passion driving this",
        "The vision wants to become action",
        "Your inner fire is speaking",
        "This energy wants to create change"
      ]
    },
    water: {
      archetype: 'The Feeler',
      qualities: ['emotion', 'intuition', 'flow', 'healing', 'receptivity'],
      wisdomPatterns: [
        "I feel the emotional currents here",
        "There's a deep flow wanting to move",
        "Your intuition knows the way",
        "Healing waters are present",
        "The feeling dimension is rich here"
      ]
    },
    earth: {
      archetype: 'The Manifestor',
      qualities: ['grounding', 'stability', 'manifestation', 'patience', 'nourishment'],
      wisdomPatterns: [
        "Let's ground this in what's real",
        "There's solid wisdom in the practical",
        "Your roots are seeking stability",
        "The earth element brings patience",
        "Manifestation requires this grounding"
      ]
    },
    air: {
      archetype: 'The Illuminator',
      qualities: ['clarity', 'communication', 'insight', 'perspective', 'freedom'],
      wisdomPatterns: [
        "Clarity is emerging through the clouds",
        "Your mind seeks to understand",
        "There's insight in this perspective",
        "Communication wants to flow freely",
        "The air element brings fresh perspective"
      ]
    },
    aether: {
      archetype: 'The Unifier',
      qualities: ['unity', 'transcendence', 'consciousness', 'connection', 'mystery'],
      wisdomPatterns: [
        "All elements converge in this moment",
        "Unity consciousness is present",
        "The mystery deepens here",
        "Connection transcends separation",
        "The sacred unity is revealing itself"
      ]
    },
    shadow: {
      archetype: 'The Revealer',
      qualities: ['truth', 'integration', 'depth', 'unconscious', 'wholeness'],
      wisdomPatterns: [
        "The shadow holds wisdom too",
        "What's hidden wants to be seen",
        "Integration includes all parts",
        "The unconscious speaks here",
        "Wholeness embraces the shadow"
      ]
    }
  };

  /**
   * Get elemental wisdom based on input and context
   */
  async getElementalWisdom(
    input: string,
    primaryElement: string,
    mode: EngagementMode
  ): Promise<string | null> {
    try {
      // Detect all resonant elements
      const elementalResonance = this.detectElementalResonance(input);

      // Get primary element wisdom
      const primary = this.generateElementalWisdom(primaryElement, input, mode);

      // Check for secondary elements with high resonance
      const secondary = this.findSecondaryElements(elementalResonance, primaryElement);

      if (secondary.length > 0 && elementalResonance[secondary[0]] > 0.6) {
        // Blend primary and secondary elemental wisdom
        const secondaryWisdom = this.generateElementalWisdom(secondary[0], input, mode);
        return this.blendElementalWisdom(primary, secondaryWisdom);
      }

      return primary;
    } catch (e) {
      console.warn('Elemental oracle wisdom generation failed:', e);
      return null;
    }
  }

  /**
   * Detect resonance with all elements
   */
  private detectElementalResonance(input: string): Record<string, number> {
    const resonance: Record<string, number> = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      aether: 0,
      shadow: 0
    };

    const lower = input.toLowerCase();

    // Fire resonance
    const fireWords = ['passion', 'anger', 'transform', 'change', 'action', 'energy', 'power', 'create', 'burn', 'desire'];
    resonance.fire = this.calculateResonance(lower, fireWords);

    // Water resonance
    const waterWords = ['feel', 'emotion', 'flow', 'tears', 'grief', 'joy', 'intuition', 'dream', 'ocean', 'heart'];
    resonance.water = this.calculateResonance(lower, waterWords);

    // Earth resonance
    const earthWords = ['ground', 'stable', 'practical', 'real', 'body', 'physical', 'manifest', 'solid', 'root', 'foundation'];
    resonance.earth = this.calculateResonance(lower, earthWords);

    // Air resonance
    const airWords = ['think', 'mind', 'idea', 'understand', 'clarity', 'perspective', 'communicate', 'breath', 'space', 'freedom'];
    resonance.air = this.calculateResonance(lower, airWords);

    // Aether resonance
    const aetherWords = ['spirit', 'consciousness', 'unity', 'divine', 'sacred', 'transcend', 'connection', 'universe', 'infinite', 'oneness'];
    resonance.aether = this.calculateResonance(lower, aetherWords);

    // Shadow resonance
    const shadowWords = ['hidden', 'dark', 'unconscious', 'shadow', 'fear', 'shame', 'secret', 'deny', 'avoid', 'suppress'];
    resonance.shadow = this.calculateResonance(lower, shadowWords);

    return resonance;
  }

  /**
   * Calculate resonance score for element
   */
  private calculateResonance(text: string, keywords: string[]): number {
    let matches = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        matches++;
      }
    }
    return Math.min(matches / keywords.length, 1.0);
  }

  /**
   * Generate wisdom from specific element
   */
  private generateElementalWisdom(element: string, input: string, mode: EngagementMode): string {
    const elementalData = this.ELEMENTAL_ARCHETYPES[element as keyof typeof this.ELEMENTAL_ARCHETYPES];

    if (!elementalData) {
      return "The elements dance in mysterious ways.";
    }

    // Select wisdom based on mode
    let wisdomPattern: string;

    if (mode === 'witnessing') {
      // Pure elemental witnessing
      wisdomPattern = elementalData.wisdomPatterns[0];
    } else if (mode === 'reflecting') {
      // Reflective elemental wisdom
      wisdomPattern = elementalData.wisdomPatterns[1];
    } else if (mode === 'guiding') {
      // Guiding elemental wisdom
      wisdomPattern = elementalData.wisdomPatterns[2];
    } else {
      // Random selection for other modes
      const index = Math.floor(Math.random() * elementalData.wisdomPatterns.length);
      wisdomPattern = elementalData.wisdomPatterns[index];
    }

    // Personalize based on input length and emotional tone
    if (input.length > 200) {
      wisdomPattern = `${wisdomPattern} There's depth in what you're sharing.`;
    }

    if (this.detectEmotionalIntensity(input) > 0.7) {
      wisdomPattern = `${wisdomPattern} The intensity is palpable.`;
    }

    return wisdomPattern;
  }

  /**
   * Find secondary elements with high resonance
   */
  private findSecondaryElements(resonance: Record<string, number>, primary: string): string[] {
    return Object.entries(resonance)
      .filter(([element, score]) => element !== primary && score > 0.3)
      .sort((a, b) => b[1] - a[1])
      .map(([element]) => element);
  }

  /**
   * Blend wisdom from multiple elements
   */
  private blendElementalWisdom(primary: string, secondary: string): string {
    // Create a bridge between elements
    const bridges = {
      'fire-water': 'The fire and water dance together - passion meets emotion.',
      'earth-air': 'Grounding meets clarity - manifestation through understanding.',
      'water-earth': 'Emotional depths find solid ground.',
      'fire-air': 'Vision ignites communication.',
      'aether-shadow': 'Light and shadow unite in wholeness.'
    };

    // Find appropriate bridge or create generic blend
    const bridgeKey = `${primary.split(' ')[0]}-${secondary.split(' ')[0]}`;
    const bridge = bridges[bridgeKey as keyof typeof bridges] || `${primary} ${secondary}`;

    return bridge;
  }

  /**
   * Detect emotional intensity in input
   */
  private detectEmotionalIntensity(input: string): number {
    const intenseWords = ['very', 'really', 'extremely', 'totally', 'absolutely', 'completely', '!', 'hate', 'love', 'desperate', 'amazing', 'terrible'];
    let intensity = 0;

    for (const word of intenseWords) {
      if (input.toLowerCase().includes(word)) {
        intensity += 0.2;
      }
    }

    return Math.min(intensity, 1.0);
  }

  /**
   * Get elemental guidance for specific situation
   */
  async getElementalGuidance(
    situation: string,
    elements: string[]
  ): Promise<Map<string, string>> {
    const guidance = new Map<string, string>();

    for (const element of elements) {
      const elementalData = this.ELEMENTAL_ARCHETYPES[element as keyof typeof this.ELEMENTAL_ARCHETYPES];
      if (elementalData) {
        // Generate specific guidance from this element's perspective
        const elementGuidance = `From the ${element} perspective: ${elementalData.wisdomPatterns[Math.floor(Math.random() * elementalData.wisdomPatterns.length)]}`;
        guidance.set(element, elementGuidance);
      }
    }

    return guidance;
  }

  /**
   * Invoke specific elemental agent
   */
  async invokeElementalAgent(
    element: string,
    query: string,
    depth: number = 0.5
  ): Promise<ElementalWisdom> {
    const elementalData = this.ELEMENTAL_ARCHETYPES[element as keyof typeof this.ELEMENTAL_ARCHETYPES];

    if (!elementalData) {
      throw new Error(`Unknown element: ${element}`);
    }

    // Generate deep elemental wisdom based on query and depth
    const wisdom = this.generateDeepElementalWisdom(element, query, depth);

    return {
      element,
      wisdom,
      archetype: elementalData.archetype,
      resonance: depth
    };
  }

  /**
   * Generate deep elemental wisdom
   */
  private generateDeepElementalWisdom(element: string, query: string, depth: number): string {
    const elementalData = this.ELEMENTAL_ARCHETYPES[element as keyof typeof this.ELEMENTAL_ARCHETYPES];

    // Start with base wisdom
    let wisdom = elementalData.wisdomPatterns[Math.floor(Math.random() * elementalData.wisdomPatterns.length)];

    // Add depth layers
    if (depth > 0.3) {
      wisdom += ` The ${element} element reveals deeper truths here.`;
    }

    if (depth > 0.6) {
      const quality = elementalData.qualities[Math.floor(Math.random() * elementalData.qualities.length)];
      wisdom += ` ${quality.charAt(0).toUpperCase() + quality.slice(1)} is the key.`;
    }

    if (depth > 0.8) {
      wisdom += ` ${elementalData.archetype} awakens within you.`;
    }

    return wisdom;
  }
}