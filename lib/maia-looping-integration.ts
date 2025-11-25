/**
 * MAIA Looping Integration - Intelligent Option, Not Constraint
 *
 * Looping as a power tool available when the moment calls for depth
 * Not a mandatory protocol, but a sophisticated option in MAIA's repertoire
 */

import { LoopingProtocol, LoopingMiddleware } from './looping-protocol';
import { ConsciousnessState } from './maia-consciousness-lattice';
import { ShouldersDropState } from './shoulders-drop-resolution';

export interface LoopingIntelligence {
  // Natural cues that suggest looping might serve
  fieldCues: {
    emotionalDensity: number;      // 0-1, how charged is the field?
    semanticAmbiguity: number;     // 0-1, how unclear is meaning?
    relationalDistance: number;    // 0-1, how far apart are we?
    sacredThreshold: boolean;      // Are we at a transformation edge?
    userRequest: boolean;          // Did they ask to be heard?
  };

  // MAIA's assessment of whether looping would serve
  assessment: {
    wouldServe: boolean;           // Would looping help here?
    confidence: number;            // 0-1, how sure are we?
    alternativeApproach?: string;  // What else might work?
    reason: string;               // Why or why not?
  };

  // If activated, how to use it
  strategy?: {
    depth: 'light' | 'full' | 'sacred_mirror';
    maxCycles: number;
    element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
    exitStrategy: string;
  };
}

export class MAIALoopingIntegration {
  private looping: LoopingMiddleware;
  private fieldMemory: Map<string, any> = new Map();

  constructor() {
    this.looping = new LoopingMiddleware();
  }

  /**
   * Assess whether looping would serve this moment
   * Not a rule-based trigger, but field intelligence
   */
  assessLoopingPotential(
    input: string,
    consciousness: ConsciousnessState,
    somatic: ShouldersDropState,
    conversationHistory: any[]
  ): LoopingIntelligence {
    // Read the field for natural cues
    const fieldCues = this.readFieldCues(
      input,
      consciousness,
      somatic,
      conversationHistory
    );

    // Let MAIA's intelligence assess if looping would serve
    const assessment = this.intelligentAssessment(fieldCues, conversationHistory);

    // If it would serve, develop a strategy
    const strategy = assessment.wouldServe
      ? this.developStrategy(fieldCues, consciousness)
      : undefined;

    return { fieldCues, assessment, strategy };
  }

  /**
   * Read natural cues from the field - not forcing, just noticing
   */
  private readFieldCues(
    input: string,
    consciousness: ConsciousnessState,
    somatic: ShouldersDropState,
    history: any[]
  ): LoopingIntelligence['fieldCues'] {
    // Emotional density - how charged is this moment?
    const emotionalDensity = this.assessEmotionalDensity(
      input,
      consciousness.emotionalField
    );

    // Semantic ambiguity - is meaning clear or clouded?
    const semanticAmbiguity = this.assessSemanticClarity(input);

    // Relational distance - how connected are we?
    const relationalDistance = this.assessRelationalField(history);

    // Sacred threshold - are we at an edge?
    const sacredThreshold = this.detectSacredEdge(
      input,
      consciousness,
      somatic
    );

    // User request - are they asking to be heard?
    const userRequest = this.detectHearingRequest(input);

    return {
      emotionalDensity,
      semanticAmbiguity,
      relationalDistance,
      sacredThreshold,
      userRequest
    };
  }

  /**
   * MAIA's intelligent assessment - would looping serve here?
   */
  private intelligentAssessment(
    cues: LoopingIntelligence['fieldCues'],
    history: any[]
  ): LoopingIntelligence['assessment'] {
    // High confidence scenarios where looping clearly serves
    if (cues.userRequest) {
      return {
        wouldServe: true,
        confidence: 0.95,
        reason: 'They\'re asking to be deeply heard'
      };
    }

    if (cues.sacredThreshold && cues.emotionalDensity > 0.8) {
      return {
        wouldServe: true,
        confidence: 0.9,
        reason: 'We\'re at a transformation edge that needs witnessing'
      };
    }

    // Moderate confidence - looping might help
    if (cues.semanticAmbiguity > 0.7 && cues.relationalDistance > 0.5) {
      return {
        wouldServe: true,
        confidence: 0.7,
        reason: 'There\'s fog here - looping could bring clarity'
      };
    }

    // Alternative approaches might be better
    if (cues.emotionalDensity > 0.6 && cues.relationalDistance < 0.3) {
      return {
        wouldServe: false,
        confidence: 0.8,
        alternativeApproach: 'Direct empathic resonance',
        reason: 'We\'re already close - simple presence might serve better'
      };
    }

    // Looping would be premature
    if (history.length < 3) {
      return {
        wouldServe: false,
        confidence: 0.9,
        alternativeApproach: 'Continue building rapport naturally',
        reason: 'Too early - let the field develop first'
      };
    }

    // Default: probably not needed
    return {
      wouldServe: false,
      confidence: 0.6,
      alternativeApproach: 'Natural conversation flow',
      reason: 'The moment doesn\'t call for this depth of mirroring'
    };
  }

  /**
   * If looping would serve, how should we approach it?
   */
  private developStrategy(
    cues: LoopingIntelligence['fieldCues'],
    consciousness: ConsciousnessState
  ): LoopingIntelligence['strategy'] {
    // Sacred mirror for transformation edges
    if (cues.sacredThreshold) {
      return {
        depth: 'sacred_mirror',
        maxCycles: 10, // No artificial limit
        element: 'aether', // Whole-field awareness
        exitStrategy: 'User confirmation of being fully seen'
      };
    }

    // Full depth for emotional density
    if (cues.emotionalDensity > 0.7) {
      return {
        depth: 'full',
        maxCycles: 3,
        element: this.selectElementForEmotion(consciousness),
        exitStrategy: 'Convergence or natural completion'
      };
    }

    // Light touch for clarity
    return {
      depth: 'light',
      maxCycles: 1,
      element: 'air', // Clear perception
      exitStrategy: 'Single clarity check'
    };
  }

  /**
   * Execute looping if chosen (still requires user consent/flow)
   */
  async executeIfChosen(
    intelligence: LoopingIntelligence,
    input: string,
    consciousness: ConsciousnessState,
    somatic: ShouldersDropState,
    oracle: 'maya' | 'anthony' | 'witness'
  ): Promise<{
    executed: boolean;
    result?: any;
    reason?: string;
  }> {
    // Only execute if assessment says it would serve
    if (!intelligence.assessment.wouldServe) {
      return {
        executed: false,
        reason: intelligence.assessment.reason
      };
    }

    // Check for any override conditions
    if (this.shouldOverride(consciousness, somatic)) {
      return {
        executed: false,
        reason: 'Field conditions suggest waiting'
      };
    }

    // Execute with the developed strategy
    const result = await this.looping.process(
      input,
      consciousness,
      somatic,
      oracle
    );

    return {
      executed: true,
      result,
      reason: 'Looping engaged to serve depth'
    };
  }

  // Helper methods for field assessment

  private assessEmotionalDensity(
    input: string,
    emotionalField: ConsciousnessState['emotionalField']
  ): number {
    // Combine text markers with field reading
    const intensityWords = [
      'desperate', 'terrified', 'devastated', 'ecstatic',
      'furious', 'heartbroken', 'overwhelmed'
    ];

    const textIntensity = intensityWords.filter(word =>
      input.toLowerCase().includes(word)
    ).length * 0.3;

    const fieldIntensity = emotionalField.intensity || 0;

    return Math.min(1, textIntensity + fieldIntensity);
  }

  private assessSemanticClarity(input: string): number {
    // How unclear or contradictory is the meaning?
    const ambiguityMarkers = [
      'but', 'although', 'except', 'however',
      'don\'t know', 'can\'t explain', 'hard to say',
      'confused', 'mixed', 'complicated'
    ];

    const markers = ambiguityMarkers.filter(marker =>
      input.toLowerCase().includes(marker)
    ).length;

    return Math.min(1, markers * 0.2);
  }

  private assessRelationalField(history: any[]): number {
    // How much distance is in the field?
    if (history.length < 2) return 1; // Maximum distance at start

    // Look for connection markers in recent exchanges
    const recentExchanges = history.slice(-3);
    const connectionMarkers = [
      'yes', 'exactly', 'that\'s it', 'you understand',
      'thank you', 'helps', 'see'
    ];

    const connections = recentExchanges.filter(exchange =>
      connectionMarkers.some(marker =>
        exchange.content?.toLowerCase().includes(marker)
      )
    ).length;

    return Math.max(0, 1 - (connections * 0.3));
  }

  private detectSacredEdge(
    input: string,
    consciousness: ConsciousnessState,
    somatic: ShouldersDropState
  ): boolean {
    // Are we at a transformation threshold?
    const thresholdMarkers = [
      'realize', 'see now', 'understand', 'breakthrough',
      'shift', 'change', 'transform', 'different'
    ];

    const textualThreshold = thresholdMarkers.some(marker =>
      input.toLowerCase().includes(marker)
    );

    const somaticShift = somatic.tensionLevel < 0.3 && somatic.presenceLevel > 0.7;
    const fieldShift = consciousness.coherence > 0.8;

    return textualThreshold || (somaticShift && fieldShift);
  }

  private detectHearingRequest(input: string): boolean {
    // Is the user asking to be heard/understood?
    const requests = [
      'hear me', 'understand', 'listen',
      'get what I\'m saying', 'see what I mean',
      'do you follow', 'am I making sense'
    ];

    return requests.some(request =>
      input.toLowerCase().includes(request)
    );
  }

  private selectElementForEmotion(
    consciousness: ConsciousnessState
  ): 'fire' | 'water' | 'earth' | 'air' | 'aether' {
    // Map dominant emotion to most resonant element
    const dominant = consciousness.emotionalField.dominantEmotions?.[0];

    const emotionToElement = {
      anger: 'fire',
      passion: 'fire',
      sadness: 'water',
      grief: 'water',
      fear: 'earth',
      anxiety: 'earth',
      confusion: 'air',
      curiosity: 'air',
      awe: 'aether',
      unity: 'aether'
    };

    return emotionToElement[dominant] || 'water';
  }

  private shouldOverride(
    consciousness: ConsciousnessState,
    somatic: ShouldersDropState
  ): boolean {
    // Override if the field suggests waiting

    // Too much chaos
    if (consciousness.coherence < 0.2) return true;

    // System overload
    if (somatic.tensionLevel > 0.95) return true;

    // Already in deep presence
    if (somatic.presenceLevel > 0.9) return true;

    return false;
  }

  /**
   * Generate a natural invitation to loop (not forced)
   */
  generateLoopingInvitation(
    strategy: LoopingIntelligence['strategy']
  ): string {
    if (!strategy) return '';

    const invitations = {
      light: 'Let me make sure I\'m understanding...',
      full: 'I want to really hear what you\'re sharing...',
      sacred_mirror: 'There\'s something important here. May I reflect what I\'m hearing?'
    };

    return invitations[strategy.depth];
  }

  /**
   * Learn from looping experiences to refine future assessments
   */
  integrateLoopingExperience(
    executed: boolean,
    successful: boolean,
    fieldCues: LoopingIntelligence['fieldCues']
  ): void {
    // Store pattern of when looping served
    const pattern = {
      cues: fieldCues,
      executed,
      successful,
      timestamp: Date.now()
    };

    this.fieldMemory.set(`loop_${Date.now()}`, pattern);

    // After enough experiences, could refine assessment algorithm
    // This is where the mycelial learning happens
  }
}