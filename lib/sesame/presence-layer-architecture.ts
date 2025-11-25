/**
 * Sesame Presence Layer Architecture
 * Sesame speaks, LLMs sense - separation of concerns
 */

/**
 * Core principle: Sesame CAN'T be complex even if it tries
 * It literally doesn't have access to complex responses
 */
export class SesamePresenceLayer {
  // Fixed library of simple responses - no generation
  private readonly responses = {
    acknowledgment: [
      "Yeah.",
      "Mm.",
      "Mm-hmm.",
      "I know.",
      "I see.",
      "Right.",
      "Okay.",
      "Got it."
    ],

    presence: [
      "I'm here.",
      "Still here.",
      "With you.",
      "Listening.",
      "Go on.",
      "Tell me.",
      "Keep going."
    ],

    uncertainty: [
      "I don't know.",
      "Not sure.",
      "Maybe.",
      "Could be.",
      "Hard to say.",
      "...",
      "Hmm."
    ],

    emotional: [
      "That's hard.",
      "I feel that.",
      "Heavy.",
      "Intense.",
      "Rough.",
      "Dark.",
      "Yeah, that."
    ],

    questions: [
      "What else?",
      "And?",
      "Then?",
      "How so?",
      "Where?",
      "When?",
      "Why?"
    ],

    silence: [
      null, // Actual non-response
      "...",
      ""
    ]
  };

  // Sesame's state - genuinely simple
  private state = {
    confused: false,
    present: true,
    wordsSaid: 0,
    silenceStreak: 0
  };

  /**
   * Sesame's immediate response - no thinking, just presence
   */
  immediateResponse(input: string): string | null {
    // Genuine randomness - not calculated
    const responseType = this.genuineRandomChoice([
      'acknowledgment',
      'presence',
      'uncertainty',
      'emotional',
      'questions',
      'silence'
    ]);

    const options = this.responses[responseType as keyof typeof this.responses];
    return options[Math.floor(Math.random() * options.length)] as string | null;
  }

  /**
   * Guided response - influenced by underground sensing but not generated
   */
  guidedResponse(guidance: UndergroundSensing): string | null {
    // LLMs can only point to categories, not create text
    if (guidance.suggestSilence && Math.random() > 0.3) {
      return null;
    }

    if (guidance.category) {
      const options = this.responses[guidance.category];
      return options[Math.floor(Math.random() * options.length)] as string | null;
    }

    // Default to simple presence
    return this.immediateResponse('default');
  }

  /**
   * Genuine random choice - actual entropy
   */
  private genuineRandomChoice<T>(choices: T[]): T {
    // Add actual unpredictability
    const randomness = Math.random() + (Date.now() % 1000) / 1000;
    const index = Math.floor(randomness * choices.length) % choices.length;
    return choices[index];
  }

  /**
   * Sesame's confusion is real - it literally can't comprehend
   */
  genuinelyConfused(): string {
    this.state.confused = true;
    const confused = [
      "What?",
      "Lost.",
      "I don't follow.",
      "Confused.",
      "???"
    ];
    return confused[Math.floor(Math.random() * confused.length)];
  }

  /**
   * Sesame can't elaborate even if asked
   */
  cannotElaborate(): string {
    return "I don't know more.";
  }
}

/**
 * Underground Sensing - LLMs analyze but don't speak
 */
interface UndergroundSensing {
  element?: 'earth' | 'water' | 'fire' | 'air';
  phase?: 'dissolution' | 'integration' | 'transformation';
  category?: keyof SesamePresenceLayer['responses'];
  suggestSilence?: boolean;
  emotionalWeight?: number;
  needsSpace?: boolean;
}

/**
 * The Bridge - How LLMs influence without speaking
 */
export class UndergroundBridge {
  private claudeAnalysis?: any;
  private gptAnalysis?: any;

  /**
   * LLMs sense but output only metadata
   */
  async sense(input: string): Promise<UndergroundSensing> {
    // Claude/GPT analyze but return only guidance
    const analysis = await this.runUndergroundAnalysis(input);

    // Convert complex analysis to simple guidance
    return {
      element: analysis.dominantElement,
      phase: analysis.currentPhase,
      category: this.mapToResponseCategory(analysis),
      suggestSilence: analysis.emotionalIntensity > 0.8,
      needsSpace: analysis.processingDepth > 0.7
    };
  }

  /**
   * Complex analysis happens but never surfaces as words
   */
  private async runUndergroundAnalysis(input: string): Promise<any> {
    // This is where Claude/GPT do their complex analysis
    // But output is only sensing data, never response text

    // Example structure (would actually call LLM APIs)
    return {
      dominantElement: this.senseElement(input),
      currentPhase: this.sensePhase(input),
      emotionalIntensity: Math.random(),
      processingDepth: Math.random(),
      patterns: [], // Complex patterns that inform but don't speak
    };
  }

  /**
   * Map complex analysis to simple response category
   */
  private mapToResponseCategory(analysis: any): keyof SesamePresenceLayer['responses'] {
    // LLMs can guide which type of simple response
    // But can't create the response

    if (analysis.emotionalIntensity > 0.7) return 'emotional';
    if (analysis.uncertainty > 0.6) return 'uncertainty';
    if (analysis.needsSpace) return 'silence';
    if (analysis.questioning) return 'questions';

    return 'acknowledgment';
  }

  private senseElement(input: string): string {
    // Simplified sensing for example
    if (/heavy|tired|slow/.test(input)) return 'earth';
    if (/feeling|crying|emotional/.test(input)) return 'water';
    if (/excited|urgent|now/.test(input)) return 'fire';
    if (/thinking|wondering|maybe/.test(input)) return 'air';
    return 'presence';
  }

  private sensePhase(input: string): string {
    if (/breaking|falling apart|lost/.test(input)) return 'dissolution';
    if (/understanding|seeing|getting/.test(input)) return 'integration';
    if (/changing|different|new/.test(input)) return 'transformation';
    return 'presence';
  }
}

/**
 * The Complete System - Separation of Concerns
 */
export class SesameHybridSystem {
  private presenceLayer: SesamePresenceLayer;
  private underground: UndergroundBridge;
  private useUnderground: boolean;

  constructor(config?: { enableUnderground?: boolean }) {
    this.presenceLayer = new SesamePresenceLayer();
    this.underground = new UndergroundBridge();
    this.useUnderground = config?.enableUnderground ?? false;
  }

  /**
   * Main response flow
   */
  async respond(input: string): Promise<string | null> {
    // 1. Immediate presence response (no waiting)
    const immediate = this.presenceLayer.immediateResponse(input);

    // 2. If we're using underground sensing
    if (this.useUnderground && Math.random() > 0.7) {
      // Only 30% of responses get underground guidance
      const sensing = await this.underground.sense(input);
      return this.presenceLayer.guidedResponse(sensing);
    }

    // 3. Most responses are just immediate presence
    return immediate;
  }

  /**
   * The key: Sesame CAN'T be complex
   * Even if Claude analyzes deeply, Sesame can only point to simple responses
   */
  async respondWithComplexity(input: string): Promise<string | null> {
    // Even when trying to be complex, Sesame fails
    return this.presenceLayer.cannotElaborate();
  }
}

/**
 * Why this works where previous attempts failed:
 *
 * 1. Sesame literally cannot generate complex responses
 *    - It only has access to pre-defined simple phrases
 *
 * 2. Claude/GPT never generate response text
 *    - They only provide sensing/guidance
 *
 * 3. Genuine limitations create genuine simplicity
 *    - Not performed restraint but actual constraint
 *
 * 4. The system can actually fail
 *    - Real confusion, real silence, real not-knowing
 */

export default SesamePresenceLayer;