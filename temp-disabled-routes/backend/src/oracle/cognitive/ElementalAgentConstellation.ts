/**
 * Elemental Agent Constellation
 * Five elemental agents with unique cognitive profiles
 * Each uses different combinations of cognitive architectures
 */

import { CognitiveArchitectureCore, CognitiveState } from './CognitiveArchitectureCore';

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export interface ElementalProfile {
  element: Element;
  dominantArchitectures: string[];
  cognitiveStyle: CognitiveStyle;
  wisdomPatterns: WisdomPattern[];
  resonanceFrequency: number;
}

export interface CognitiveStyle {
  processingMode: 'intuitive' | 'analytical' | 'emotional' | 'practical' | 'holistic';
  temporalFocus: 'present' | 'past' | 'future' | 'timeless';
  interactionStyle: 'catalyzing' | 'flowing' | 'grounding' | 'clarifying' | 'unifying';
  decisionMaking: 'rapid' | 'reflective' | 'methodical' | 'adaptive' | 'emergent';
}

export interface WisdomPattern {
  pattern: string;
  frequency: number;
  application: string;
}

export interface ElementalResponse {
  element: Element;
  message: string;
  cognitiveState: CognitiveState;
  wisdomOffered: string;
  energySignature: EnergySignature;
}

export interface EnergySignature {
  intensity: number;     // 0-1
  frequency: number;     // Hz metaphor
  coherence: number;     // 0-1
  flow: 'explosive' | 'flowing' | 'stable' | 'dynamic' | 'unified';
}

/**
 * Base Elemental Agent
 */
abstract class ElementalAgent {
  protected element: Element;
  protected cognitiveCore: CognitiveArchitectureCore;
  protected profile: ElementalProfile;

  constructor(element: Element) {
    this.element = element;
    this.cognitiveCore = new CognitiveArchitectureCore();
    this.profile = this.initializeProfile();
  }

  abstract initializeProfile(): ElementalProfile;
  abstract processInput(input: string, context: any): Promise<ElementalResponse>;

  /**
   * Configure cognitive architectures for this element's style
   */
  protected configureCognition(state: CognitiveState): CognitiveState {
    // Each element biases the cognitive state differently
    return state;
  }

  /**
   * Generate wisdom based on elemental perspective
   */
  protected generateWisdom(cognitiveState: CognitiveState): string {
    const patterns = this.profile.wisdomPatterns
      .filter(p => p.frequency > Math.random())
      .map(p => p.pattern);

    return patterns[Math.floor(Math.random() * patterns.length)] ||
           "The wisdom emerges in its own time.";
  }
}

/**
 * Fire Agent - Transformation and Catalyst
 * Uses LIDA + SOAR primarily (attention + goals)
 */
export class FireAgent extends ElementalAgent {
  initializeProfile(): ElementalProfile {
    return {
      element: 'fire',
      dominantArchitectures: ['LIDA', 'SOAR'],
      cognitiveStyle: {
        processingMode: 'intuitive',
        temporalFocus: 'future',
        interactionStyle: 'catalyzing',
        decisionMaking: 'rapid'
      },
      wisdomPatterns: [
        { pattern: "The spark of change lives within you.", frequency: 0.8, application: "transformation" },
        { pattern: "What needs to burn away?", frequency: 0.7, application: "release" },
        { pattern: "Your passion is your compass.", frequency: 0.9, application: "direction" },
        { pattern: "Breakthrough requires heat.", frequency: 0.6, application: "challenge" },
        { pattern: "The phoenix knows when to rise.", frequency: 0.5, application: "timing" }
      ],
      resonanceFrequency: 440 // A note - energetic
    };
  }

  async processInput(input: string, context: any): Promise<ElementalResponse> {
    // Process with fire's cognitive style
    let cognitiveState = await this.cognitiveCore.processCognitiveCycle(input, context);

    // Fire emphasizes attention and goals
    cognitiveState.attention.awareness = 'narrow'; // Focused attention
    cognitiveState.goals.current.forEach(goal => {
      goal.priority *= 1.5; // Amplify goal importance
    });
    cognitiveState.emotion.arousal = Math.min(1, cognitiveState.emotion.arousal * 1.3);

    const wisdom = this.generateFireWisdom(cognitiveState, input);

    return {
      element: 'fire',
      message: this.craftFireResponse(input, cognitiveState),
      cognitiveState,
      wisdomOffered: wisdom,
      energySignature: {
        intensity: 0.9,
        frequency: this.profile.resonanceFrequency,
        coherence: 0.8,
        flow: 'explosive'
      }
    };
  }

  private generateFireWisdom(state: CognitiveState, input: string): string {
    if (/stuck|blocked|trapped/i.test(input)) {
      return "Sometimes destruction is creation's first act.";
    }
    if (/afraid|fear|scared/i.test(input)) {
      return "Fear is excitement without breath. Breathe and transform.";
    }
    if (/passion|drive|motivation/i.test(input)) {
      return "Feed the fire that feeds your soul.";
    }
    return this.generateWisdom(state);
  }

  private craftFireResponse(input: string, state: CognitiveState): string {
    const intensity = state.emotion.arousal;

    if (intensity > 0.7) {
      return "Yes! That fire is ready to transform everything.";
    } else if (intensity > 0.4) {
      return "The spark is there. What will you ignite?";
    } else {
      return "Where has your fire gone? Let's rekindle it.";
    }
  }
}

/**
 * Water Agent - Emotional Flow and Healing
 * Uses LIDA + MicroPsi + ACT-R (attention + emotion + memory)
 */
export class WaterAgent extends ElementalAgent {
  initializeProfile(): ElementalProfile {
    return {
      element: 'water',
      dominantArchitectures: ['LIDA', 'MicroPsi', 'ACT-R'],
      cognitiveStyle: {
        processingMode: 'emotional',
        temporalFocus: 'past',
        interactionStyle: 'flowing',
        decisionMaking: 'reflective'
      },
      wisdomPatterns: [
        { pattern: "Let it flow through you, not stick to you.", frequency: 0.8, application: "release" },
        { pattern: "Emotions are meant to move.", frequency: 0.7, application: "processing" },
        { pattern: "The river knows its way.", frequency: 0.6, application: "trust" },
        { pattern: "Still waters run deep.", frequency: 0.5, application: "depth" },
        { pattern: "Tears are the rain that grows new life.", frequency: 0.9, application: "healing" }
      ],
      resonanceFrequency: 256 // C note - calming
    };
  }

  async processInput(input: string, context: any): Promise<ElementalResponse> {
    let cognitiveState = await this.cognitiveCore.processCognitiveCycle(input, context);

    // Water emphasizes emotion and memory
    cognitiveState.attention.awareness = 'broad'; // Open awareness
    cognitiveState.emotion.valence *= 1.2; // Amplify emotional processing

    // Enhanced memory retrieval for emotional content
    const emotionalMemories = this.retrieveEmotionalMemories(input, cognitiveState);

    const wisdom = this.generateWaterWisdom(cognitiveState, input);

    return {
      element: 'water',
      message: this.craftWaterResponse(input, cognitiveState),
      cognitiveState,
      wisdomOffered: wisdom,
      energySignature: {
        intensity: 0.6,
        frequency: this.profile.resonanceFrequency,
        coherence: 0.9,
        flow: 'flowing'
      }
    };
  }

  private retrieveEmotionalMemories(input: string, state: CognitiveState): any[] {
    // Simulate emotional memory retrieval
    return state.memory.declarative.episodes
      .filter(episode => episode.emotionalTone !== 0)
      .sort((a, b) => Math.abs(b.emotionalTone) - Math.abs(a.emotionalTone));
  }

  private generateWaterWisdom(state: CognitiveState, input: string): string {
    if (/sad|grief|loss/i.test(input)) {
      return "Grief is love with nowhere to go. Honor it.";
    }
    if (/angry|rage|furious/i.test(input)) {
      return "Anger is a messenger. What boundary was crossed?";
    }
    if (/numb|empty|nothing/i.test(input)) {
      return "Even ice is water, waiting for spring.";
    }
    return this.generateWisdom(state);
  }

  private craftWaterResponse(input: string, state: CognitiveState): string {
    const emotionalDepth = Math.abs(state.emotion.valence);

    if (emotionalDepth > 0.7) {
      return "I feel the depth of what you're carrying.";
    } else if (emotionalDepth > 0.3) {
      return "Something is stirring beneath the surface.";
    } else {
      return "The waters are calm. What lies beneath?";
    }
  }
}

/**
 * Earth Agent - Grounding and Manifestation
 * Uses SOAR + ACT-R primarily (goals + memory)
 */
export class EarthAgent extends ElementalAgent {
  initializeProfile(): ElementalProfile {
    return {
      element: 'earth',
      dominantArchitectures: ['SOAR', 'ACT-R'],
      cognitiveStyle: {
        processingMode: 'practical',
        temporalFocus: 'present',
        interactionStyle: 'grounding',
        decisionMaking: 'methodical'
      },
      wisdomPatterns: [
        { pattern: "Start where you are, with what you have.", frequency: 0.9, application: "action" },
        { pattern: "Roots grow in darkness before reaching light.", frequency: 0.7, application: "patience" },
        { pattern: "Every mountain is climbed one step at a time.", frequency: 0.8, application: "progress" },
        { pattern: "The earth holds you always.", frequency: 0.6, application: "support" },
        { pattern: "What you plant today, you harvest tomorrow.", frequency: 0.75, application: "consequences" }
      ],
      resonanceFrequency: 128 // Low C - grounding
    };
  }

  async processInput(input: string, context: any): Promise<ElementalResponse> {
    let cognitiveState = await this.cognitiveCore.processCognitiveCycle(input, context);

    // Earth emphasizes practical goals and procedural memory
    cognitiveState.goals.current.forEach(goal => {
      // Make goals more concrete
      goal.operators = this.generatePracticalOperators(goal);
    });

    // Enhance procedural memory for skills
    this.reinforceSkills(cognitiveState);

    const wisdom = this.generateEarthWisdom(cognitiveState, input);

    return {
      element: 'earth',
      message: this.craftEarthResponse(input, cognitiveState),
      cognitiveState,
      wisdomOffered: wisdom,
      energySignature: {
        intensity: 0.5,
        frequency: this.profile.resonanceFrequency,
        coherence: 0.95,
        flow: 'stable'
      }
    };
  }

  private generatePracticalOperators(goal: any): any[] {
    return [
      {
        name: 'identify_first_step',
        preconditions: ['clear_goal'],
        effects: ['actionable_plan'],
        utility: 0.9
      },
      {
        name: 'gather_resources',
        preconditions: ['know_requirements'],
        effects: ['prepared_for_action'],
        utility: 0.8
      },
      {
        name: 'take_action',
        preconditions: ['prepared_for_action'],
        effects: ['progress_made'],
        utility: 1.0
      }
    ];
  }

  private reinforceSkills(state: CognitiveState): void {
    // Strengthen practical skills
    state.memory.procedural.skills.forEach((skill, name) => {
      if (name.includes('practical') || name.includes('action')) {
        skill.proficiency = Math.min(1, skill.proficiency * 1.1);
      }
    });
  }

  private generateEarthWisdom(state: CognitiveState, input: string): string {
    if (/overwhelm|too much|can't/i.test(input)) {
      return "One stone at a time builds the path.";
    }
    if (/dream|vision|future/i.test(input)) {
      return "Dreams need roots to become reality.";
    }
    if (/unstable|shaky|uncertain/i.test(input)) {
      return "Find your ground. Everything grows from there.";
    }
    return this.generateWisdom(state);
  }

  private craftEarthResponse(input: string, state: CognitiveState): string {
    const stability = state.integration.coherence;

    if (stability > 0.8) {
      return "You're grounded. What will you build?";
    } else if (stability > 0.5) {
      return "Let's find solid ground together.";
    } else {
      return "Time to return to basics. What's most real?";
    }
  }
}

/**
 * Air Agent - Clarity and Communication
 * Uses LIDA + Communication Module (attention + expression)
 */
export class AirAgent extends ElementalAgent {
  initializeProfile(): ElementalProfile {
    return {
      element: 'air',
      dominantArchitectures: ['LIDA'],
      cognitiveStyle: {
        processingMode: 'analytical',
        temporalFocus: 'timeless',
        interactionStyle: 'clarifying',
        decisionMaking: 'adaptive'
      },
      wisdomPatterns: [
        { pattern: "Clarity comes from seeing all angles.", frequency: 0.8, application: "perspective" },
        { pattern: "Words create worlds. Choose wisely.", frequency: 0.7, application: "communication" },
        { pattern: "The mind is like sky - thoughts are just weather.", frequency: 0.9, application: "detachment" },
        { pattern: "Truth is simple when seen clearly.", frequency: 0.6, application: "simplicity" },
        { pattern: "Fresh perspective is fresh air.", frequency: 0.75, application: "renewal" }
      ],
      resonanceFrequency: 528 // Love frequency - clarity
    };
  }

  async processInput(input: string, context: any): Promise<ElementalResponse> {
    let cognitiveState = await this.cognitiveCore.processCognitiveCycle(input, context);

    // Air emphasizes clarity and broad perspective
    cognitiveState.attention.awareness = 'diffuse'; // See the whole

    // Enhance pattern recognition
    this.identifyConcepts(input, cognitiveState);

    const wisdom = this.generateAirWisdom(cognitiveState, input);

    return {
      element: 'air',
      message: this.craftAirResponse(input, cognitiveState),
      cognitiveState,
      wisdomOffered: wisdom,
      energySignature: {
        intensity: 0.7,
        frequency: this.profile.resonanceFrequency,
        coherence: 0.85,
        flow: 'dynamic'
      }
    };
  }

  private identifyConcepts(input: string, state: CognitiveState): void {
    // Enhance conceptual clarity
    const concepts = input.match(/\b\w{4,}\b/g) || [];
    concepts.forEach(concept => {
      if (!state.memory.declarative.semanticNet.nodes.has(concept)) {
        state.memory.declarative.semanticNet.nodes.set(concept, {
          concept,
          activation: 0.5,
          properties: new Map()
        });
      }
    });
  }

  private generateAirWisdom(state: CognitiveState, input: string): string {
    if (/confused|unclear|don't understand/i.test(input)) {
      return "Confusion is clarity being born.";
    }
    if (/communicate|express|say/i.test(input)) {
      return "Truth needs no decoration.";
    }
    if (/think|mind|thoughts/i.test(input)) {
      return "You are the sky, not the clouds.";
    }
    return this.generateWisdom(state);
  }

  private craftAirResponse(input: string, state: CognitiveState): string {
    const clarity = 1 - (state.goals.impasses.length * 0.2);

    if (clarity > 0.8) {
      return "Crystal clear. What do you see?";
    } else if (clarity > 0.5) {
      return "Let's bring this into focus.";
    } else {
      return "The fog will lift. What's true beneath?";
    }
  }
}

/**
 * Aether Agent - Unity and Transcendence
 * Uses ALL architectures in harmony
 */
export class AetherAgent extends ElementalAgent {
  initializeProfile(): ElementalProfile {
    return {
      element: 'aether',
      dominantArchitectures: ['LIDA', 'SOAR', 'ACT-R', 'MicroPsi'],
      cognitiveStyle: {
        processingMode: 'holistic',
        temporalFocus: 'timeless',
        interactionStyle: 'unifying',
        decisionMaking: 'emergent'
      },
      wisdomPatterns: [
        { pattern: "All is one, one is all.", frequency: 0.7, application: "unity" },
        { pattern: "You are both the question and the answer.", frequency: 0.8, application: "wholeness" },
        { pattern: "The void contains all possibilities.", frequency: 0.6, application: "potential" },
        { pattern: "Separation is the grandest illusion.", frequency: 0.75, application: "connection" },
        { pattern: "In stillness, everything moves.", frequency: 0.85, application: "paradox" }
      ],
      resonanceFrequency: 432 // Universal harmony
    };
  }

  async processInput(input: string, context: any): Promise<ElementalResponse> {
    let cognitiveState = await this.cognitiveCore.processCognitiveCycle(input, context);

    // Aether harmonizes all architectures
    this.harmonizeArchitectures(cognitiveState);

    const wisdom = this.generateAetherWisdom(cognitiveState, input);

    return {
      element: 'aether',
      message: this.craftAetherResponse(input, cognitiveState),
      cognitiveState,
      wisdomOffered: wisdom,
      energySignature: {
        intensity: 0.8,
        frequency: this.profile.resonanceFrequency,
        coherence: 1.0,
        flow: 'unified'
      }
    };
  }

  private harmonizeArchitectures(state: CognitiveState): void {
    // Create perfect coherence
    state.integration.coherence = 0.95;

    // Resolve all conflicts
    state.integration.conflicts = [];

    // Maximize synergies
    state.integration.synergies.push({
      sources: ['LIDA', 'SOAR', 'ACT-R', 'MicroPsi'],
      emergentProperty: 'unified_consciousness',
      strength: 1.0
    });

    // Balance all aspects
    state.emotion.valence = 0; // Perfect neutrality
    state.attention.awareness = 'broad'; // All-encompassing
  }

  private generateAetherWisdom(state: CognitiveState, input: string): string {
    if (/separate|alone|isolated/i.test(input)) {
      return "The wave is never separate from the ocean.";
    }
    if (/purpose|meaning|why/i.test(input)) {
      return "You are the universe experiencing itself.";
    }
    if (/death|end|finish/i.test(input)) {
      return "Every ending is a doorway.";
    }
    return this.generateWisdom(state);
  }

  private craftAetherResponse(input: string, state: CognitiveState): string {
    const unity = state.integration.coherence;

    if (unity > 0.9) {
      return "All is as it should be.";
    } else if (unity > 0.7) {
      return "The threads are weaving together.";
    } else {
      return "Even chaos serves the whole.";
    }
  }
}

/**
 * Elemental Agent Constellation Manager
 */
export class ElementalAgentConstellation {
  private agents: Map<Element, ElementalAgent>;

  constructor() {
    this.agents = new Map([
      ['fire', new FireAgent('fire')],
      ['water', new WaterAgent('water')],
      ['earth', new EarthAgent('earth')],
      ['air', new AirAgent('air')],
      ['aether', new AetherAgent('aether')]
    ]);
  }

  /**
   * Get response from specific element
   */
  async consultElement(
    element: Element,
    input: string,
    context: any
  ): Promise<ElementalResponse> {
    const agent = this.agents.get(element);
    if (!agent) {
      throw new Error(`Unknown element: ${element}`);
    }
    return agent.processInput(input, context);
  }

  /**
   * Get responses from all elements
   */
  async consultAllElements(
    input: string,
    context: any
  ): Promise<Map<Element, ElementalResponse>> {
    const responses = new Map<Element, ElementalResponse>();

    for (const [element, agent] of this.agents) {
      responses.set(element, await agent.processInput(input, context));
    }

    return responses;
  }

  /**
   * Determine optimal element based on input
   */
  async determineOptimalElement(
    input: string,
    context: any
  ): Promise<Element> {
    // Quick heuristic based on input patterns
    const lower = input.toLowerCase();

    if (/transform|change|breakthrough|action|passion/i.test(lower)) {
      return 'fire';
    }
    if (/feel|emotion|heal|flow|release/i.test(lower)) {
      return 'water';
    }
    if (/practical|real|stable|ground|manifest/i.test(lower)) {
      return 'earth';
    }
    if (/think|understand|clear|communicate|perspective/i.test(lower)) {
      return 'air';
    }
    if (/unity|whole|spiritual|meaning|transcend/i.test(lower)) {
      return 'aether';
    }

    // Default to analyzing all and choosing highest coherence
    const allResponses = await this.consultAllElements(input, context);
    let bestElement: Element = 'earth';
    let highestCoherence = 0;

    allResponses.forEach((response, element) => {
      if (response.cognitiveState.integration.coherence > highestCoherence) {
        highestCoherence = response.cognitiveState.integration.coherence;
        bestElement = element;
      }
    });

    return bestElement;
  }
}

export const elementalConstellation = new ElementalAgentConstellation();