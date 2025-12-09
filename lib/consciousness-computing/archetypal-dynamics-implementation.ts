/**
 * Archetypal Dynamics Layer Implementation
 * "Who's in the room archetypally when this nervous system lights up like this?"
 */

import type { ConsciousnessMatrixV2 } from './matrix-v2-implementation';

export interface ArchetypalDynamics {
  foregroundArchetype: string;
  hiddenArchetype?: string;
  movementDirection: 'regressing' | 'cycling' | 'evolving';
  tensionPoints: string[];
  coherenceWithMatrix: 'aligned' | 'tension' | 'concerning';
  responseAdjustment: string;
  confidence: number;
}

export interface ConsciousnessMatrixV3 {
  matrixV2: ConsciousnessMatrixV2;
  archetypalDynamics: ArchetypalDynamics;
  overallAssessment: string;
  maiasApproach: string;
}

/**
 * Core Archetypal Patterns and Their Language Signatures
 */
const ARCHETYPAL_SIGNATURES = {
  warrior: {
    keywords: ['fight', 'battle', 'push through', 'conquer', 'strength', 'overcome', 'warrior', 'soldier'],
    phrases: ['fighting for', 'pushing myself', 'won\'t give up', 'need to be strong'],
    energy: 'forward-moving, goal-oriented, sometimes exhausting'
  },
  caretaker: {
    keywords: ['help', 'fix', 'take care of', 'responsible for', 'rescue', 'support', 'nurture'],
    phrases: ['always helping', 'taking care of everyone', 'my job to', 'they need me'],
    energy: 'outward-focused, self-sacrificing, sometimes depleted'
  },
  orphan: {
    keywords: ['alone', 'abandoned', 'nobody', 'left out', 'unwanted', 'isolated', 'rejected'],
    phrases: ['all by myself', 'no one understands', 'left behind', 'don\'t belong'],
    energy: 'withdrawn, hurt, seeking belonging'
  },
  mystic: {
    keywords: ['spiritual', 'transcendent', 'connected', 'divine', 'awakening', 'cosmic', 'sacred'],
    phrases: ['spiritual experience', 'feeling connected', 'higher purpose', 'called to'],
    energy: 'expansive, seeking meaning, sometimes ungrounded'
  },
  sage: {
    keywords: ['understand', 'analyze', 'figure out', 'make sense', 'wisdom', 'learn', 'study'],
    phrases: ['trying to understand', 'figure this out', 'need to know', 'makes sense'],
    energy: 'mentally focused, seeking clarity, sometimes overthinking'
  },
  lover: {
    keywords: ['connection', 'heart', 'beauty', 'intimacy', 'love', 'relationship', 'feeling'],
    phrases: ['open my heart', 'deep connection', 'feeling everything', 'love fully'],
    energy: 'emotionally open, seeking connection, sometimes overwhelmed'
  },
  sovereign: {
    keywords: ['control', 'organize', 'lead', 'manage', 'responsibility', 'authority', 'decision'],
    phrases: ['taking charge', 'my responsibility', 'need to control', 'in charge of'],
    energy: 'directive, organizing, sometimes rigid'
  },
  trickster: {
    keywords: ['rebel', 'break rules', 'different', 'shake up', 'chaos', 'play', 'disrupt'],
    phrases: ['shake things up', 'do it differently', 'break the rules', 'why not'],
    energy: 'disruptive, creative, sometimes destabilizing'
  }
};

/**
 * Hidden Archetype Tensions - What's Often Underneath
 */
const HIDDEN_TENSIONS = {
  warrior: ['vulnerable_child', 'exhausted_self', 'gentle_lover'],
  caretaker: ['neglected_self', 'sovereign', 'orphan'],
  orphan: ['hidden_strength', 'sovereign', 'caretaker'],
  mystic: ['practical_self', 'skeptic', 'grounded_earth'],
  sage: ['feeling_heart', 'playful_child', 'mystic'],
  lover: ['protected_self', 'warrior', 'sage'],
  sovereign: ['vulnerable_child', 'servant', 'mystic'],
  trickster: ['serious_self', 'caretaker', 'sovereign']
};

/**
 * Archetypal Dynamics Detector
 */
export class ArchetypalDynamicsDetector {

  detectArchetypalDynamics(
    userMessage: string,
    matrixV2: ConsciousnessMatrixV2
  ): ArchetypalDynamics {
    const text = userMessage.toLowerCase();

    // Detect foreground archetype
    const foregroundArchetype = this.detectForegroundArchetype(text);

    // Detect hidden/counter-archetype
    const hiddenArchetype = this.detectHiddenArchetype(text, foregroundArchetype);

    // Assess movement direction
    const movementDirection = this.assessMovementDirection(text, matrixV2);

    // Identify tension points
    const tensionPoints = this.identifyTensionPoints(text, foregroundArchetype, hiddenArchetype);

    // Assess coherence with Matrix v2
    const coherenceWithMatrix = this.assessMatrixCoherence(foregroundArchetype, matrixV2);

    // Generate response adjustment
    const responseAdjustment = this.generateResponseAdjustment(
      foregroundArchetype,
      hiddenArchetype,
      movementDirection,
      matrixV2
    );

    // Calculate confidence based on signal strength
    const confidence = this.calculateConfidence(text, foregroundArchetype);

    return {
      foregroundArchetype,
      hiddenArchetype,
      movementDirection,
      tensionPoints,
      coherenceWithMatrix,
      responseAdjustment,
      confidence
    };
  }

  private detectForegroundArchetype(text: string): string {
    const scores: Record<string, number> = {};

    // Score each archetype based on keyword/phrase matches
    Object.entries(ARCHETYPAL_SIGNATURES).forEach(([archetype, signature]) => {
      let score = 0;

      // Keyword matches
      signature.keywords.forEach(keyword => {
        if (text.includes(keyword)) score += 1;
      });

      // Phrase matches (weighted higher)
      signature.phrases.forEach(phrase => {
        if (text.includes(phrase)) score += 2;
      });

      scores[archetype] = score;
    });

    // Find highest scoring archetype
    const topArchetype = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)[0];

    return topArchetype[1] > 0 ? topArchetype[0] : 'undefined';
  }

  private detectHiddenArchetype(text: string, foregroundArchetype: string): string | undefined {
    if (foregroundArchetype === 'undefined') return undefined;

    // Look for signs of tension or what's missing
    const possibleHidden = HIDDEN_TENSIONS[foregroundArchetype] || [];

    // Check for language suggesting what's underneath
    const hiddenSignals = [
      'but', 'however', 'secretly', 'part of me', 'underneath',
      'really want', 'wish i could', 'if only', 'scared to'
    ];

    const hasHiddenLanguage = hiddenSignals.some(signal => text.includes(signal));

    if (!hasHiddenLanguage) return undefined;

    // Simple heuristic: first possible hidden archetype
    // In production, this would be more sophisticated
    return possibleHidden[0];
  }

  private assessMovementDirection(
    text: string,
    matrixV2: ConsciousnessMatrixV2
  ): 'regressing' | 'cycling' | 'evolving' {

    // Regressing indicators
    const regressingSignals = [
      'falling back', 'old patterns', 'can\'t help', 'always do this',
      'same old', 'here we go again', 'back to square one'
    ];

    // Evolving indicators
    const evolvingSignals = [
      'growing', 'changing', 'new way', 'learning', 'different',
      'expanding', 'ready for', 'becoming', 'transformation'
    ];

    // Cycling indicators
    const cyclingSignals = [
      'keep doing', 'stuck', 'same thing', 'over and over',
      'pattern', 'cycle', 'repeat', 'again and again'
    ];

    if (regressingSignals.some(signal => text.includes(signal)) ||
        matrixV2.edgeRisk === 'active') {
      return 'regressing';
    }

    if (evolvingSignals.some(signal => text.includes(signal)) &&
        matrixV2.realityContact === 'grounded') {
      return 'evolving';
    }

    return 'cycling';
  }

  private identifyTensionPoints(
    text: string,
    foregroundArchetype: string,
    hiddenArchetype?: string
  ): string[] {
    const tensions = [];

    // Common archetypal tensions
    const tensionPatterns = {
      'warrior + vulnerable_child': 'exhaustion from being strong',
      'caretaker + neglected_self': 'resentment from self-sacrifice',
      'mystic + practical_self': 'difficulty grounding insights',
      'sage + feeling_heart': 'over-intellectualizing emotions'
    };

    const combinedPattern = `${foregroundArchetype} + ${hiddenArchetype}`;
    const tension = tensionPatterns[combinedPattern];

    if (tension) tensions.push(tension);

    // Language-based tension detection
    if (text.includes('exhausted') && foregroundArchetype === 'warrior') {
      tensions.push('warrior burnout');
    }

    if (text.includes('resentful') && foregroundArchetype === 'caretaker') {
      tensions.push('caretaker depletion');
    }

    return tensions;
  }

  private assessMatrixCoherence(
    foregroundArchetype: string,
    matrixV2: ConsciousnessMatrixV2
  ): 'aligned' | 'tension' | 'concerning' {

    // Aligned patterns
    const alignedPatterns = [
      // Warrior + activated system = natural match
      foregroundArchetype === 'warrior' && matrixV2.bodyState === 'tense',
      // Orphan + collapsed state = coherent withdrawal
      foregroundArchetype === 'orphan' && matrixV2.bodyState === 'collapsed',
      // Mystic + high symbolic charge = natural expansion
      foregroundArchetype === 'mystic' && matrixV2.symbolicCharge === 'archetypal'
    ];

    // Concerning patterns (archetype amplifying destabilization)
    const concerningPatterns = [
      // Warrior + fragmented reality = manic grandiosity risk
      foregroundArchetype === 'warrior' && matrixV2.realityContact === 'fraying',
      // Mystic + flooding symbols + literalist = spiritual psychosis risk
      foregroundArchetype === 'mystic' &&
        matrixV2.symbolicCharge === 'flooding' &&
        matrixV2.playfulness === 'literalist',
      // Orphan + crisis = compounding isolation
      foregroundArchetype === 'orphan' && matrixV2.edgeRisk === 'active'
    ];

    if (concerningPatterns.some(pattern => pattern)) {
      return 'concerning';
    }

    if (alignedPatterns.some(pattern => pattern)) {
      return 'aligned';
    }

    return 'tension';
  }

  private generateResponseAdjustment(
    foregroundArchetype: string,
    hiddenArchetype: string | undefined,
    movementDirection: string,
    matrixV2: ConsciousnessMatrixV2
  ): string {

    const adjustments = [];

    // Archetypal response adjustments
    switch (foregroundArchetype) {
      case 'warrior':
        if (matrixV2.bodyState === 'collapsed') {
          adjustments.push('Honor the warrior\'s effort, invite rest');
        } else {
          adjustments.push('Speak directly to warrior strength');
        }
        break;
      case 'orphan':
        adjustments.push('Emphasize companionship and belonging');
        break;
      case 'caretaker':
        adjustments.push('Address self-care and boundary needs');
        break;
      case 'mystic':
        if (matrixV2.realityContact === 'fraying') {
          adjustments.push('Ground spiritual experience in body/practical');
        } else {
          adjustments.push('Support integration of spiritual insights');
        }
        break;
    }

    // Hidden archetype adjustments
    if (hiddenArchetype) {
      adjustments.push(`Gently invite contact with hidden ${hiddenArchetype} energy`);
    }

    // Movement direction adjustments
    switch (movementDirection) {
      case 'regressing':
        adjustments.push('Stabilize before exploring patterns');
        break;
      case 'evolving':
        adjustments.push('Support forward movement with grounding');
        break;
      case 'cycling':
        adjustments.push('Gently illuminate the pattern without judgment');
        break;
    }

    return adjustments.join('; ');
  }

  private calculateConfidence(text: string, foregroundArchetype: string): number {
    if (foregroundArchetype === 'undefined') return 0.2;

    const signature = ARCHETYPAL_SIGNATURES[foregroundArchetype];
    if (!signature) return 0.3;

    const matches = signature.keywords.filter(keyword => text.includes(keyword)).length +
                   signature.phrases.filter(phrase => text.includes(phrase)).length * 2;

    return Math.min(0.9, 0.4 + (matches * 0.1));
  }
}

/**
 * Integration with Matrix v2 for Complete Assessment
 */
export class ConsciousnessMatrixV3Assessor {

  assessCompleteSpectrum(userMessage: string): ConsciousnessMatrixV3 {
    // Get Matrix v2 assessment
    const matrixV2Sensor = require('./matrix-v2-implementation').ConsciousnessMatrixV2Sensor;
    const matrixV2Assessment = new matrixV2Sensor().assessFullSpectrum(userMessage);

    // Get archetypal dynamics
    const archetypalDetector = new ArchetypalDynamicsDetector();
    const archetypalDynamics = archetypalDetector.detectArchetypalDynamics(
      userMessage,
      matrixV2Assessment.matrix
    );

    // Generate overall assessment
    const overallAssessment = this.generateOverallAssessment(
      matrixV2Assessment,
      archetypalDynamics
    );

    // Generate MAIA's approach
    const maiasApproach = this.generateMAIAsApproach(
      matrixV2Assessment,
      archetypalDynamics
    );

    return {
      matrixV2: matrixV2Assessment.matrix,
      archetypalDynamics,
      overallAssessment,
      maiasApproach
    };
  }

  private generateOverallAssessment(
    matrixV2: any,
    archetypal: ArchetypalDynamics
  ): string {
    const capacity = matrixV2.overallCapacity;
    const archetype = archetypal.foregroundArchetype;
    const movement = archetypal.movementDirection;
    const coherence = archetypal.coherenceWithMatrix;

    return `${capacity} nervous system with ${archetype} energy ${movement}, ${coherence} coherence`;
  }

  private generateMAIAsApproach(
    matrixV2: any,
    archetypal: ArchetypalDynamics
  ): string {
    let approach = [];

    // Base on Matrix v2 window of tolerance
    switch (matrixV2.windowOfTolerance) {
      case 'within':
        approach.push('Full depth available');
        break;
      case 'hyperarousal':
        approach.push('De-escalation and soothing');
        break;
      case 'hypoarousal':
        approach.push('Safety and grounding only');
        break;
    }

    // Add archetypal sensitivity
    approach.push(archetypal.responseAdjustment);

    // Add coherence considerations
    if (archetypal.coherenceWithMatrix === 'concerning') {
      approach.push('Monitor for escalation, prioritize stabilization');
    }

    return approach.join('; ');
  }
}

/**
 * Enhanced prompt generation with archetypal dynamics
 */
export function enhanceMAIAWithArchetypalDynamics(
  userMessage: string,
  existingPrompt: string
): {
  enhancedPrompt: string;
  fullAssessment: ConsciousnessMatrixV3;
} {
  const assessor = new ConsciousnessMatrixV3Assessor();
  const fullAssessment = assessor.assessCompleteSpectrum(userMessage);

  const enhancedPrompt = `${existingPrompt}

CONSCIOUSNESS MATRIX v3 WITH ARCHETYPAL DYNAMICS:

Nervous System State: ${fullAssessment.overallAssessment}

Archetypal Dynamics:
- Foreground: ${fullAssessment.archetypalDynamics.foregroundArchetype}
- Hidden: ${fullAssessment.archetypalDynamics.hiddenArchetype || 'unclear'}
- Movement: ${fullAssessment.archetypalDynamics.movementDirection}
- Coherence: ${fullAssessment.archetypalDynamics.coherenceWithMatrix}

MAIA's Approach: ${fullAssessment.maiasApproach}

Response Guidance: ${fullAssessment.archetypalDynamics.responseAdjustment}

MAIA responds to both the nervous system state AND the archetypal dynamics,
speaking to the deeper story patterns while honoring current capacity.
`;

  return {
    enhancedPrompt,
    fullAssessment
  };
}