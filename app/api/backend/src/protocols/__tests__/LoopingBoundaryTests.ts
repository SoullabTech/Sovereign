/**
 * Looping Protocol Boundary Testing
 * Tests the edges between necessary and unnecessary activation
 * Includes semantic equivalents and failure mode detection
 */

import { MayaWitnessService } from '../../services/MayaWitnessService';
import { LoopingIntensity } from '../LoopingProtocol';
import { ElementalArchetype } from '../../../../web/lib/types/elemental';

export interface BoundaryTestCase {
  id: string;
  category: 'should_loop' | 'should_not_loop' | 'edge_case';
  description: string;
  semanticVariants: string[];
  expectedBehavior: {
    shouldTrigger: boolean;
    maxAcceptableLoops: number;
    rationale: string;
  };
  element: ElementalArchetype;
}

export interface ConvergencePattern {
  type: 'quick' | 'gradual' | 'non_convergent' | 'oscillating' | 'false_convergence';
  loopCount: number;
  finalScore: number;
  userPattern: 'correcting' | 'confirming' | 'silent' | 'shifting' | 'frustrated';
}

export interface FailureMode {
  type: string;
  description: string;
  detection: string;
  recovery: string;
}

/**
 * Semantic equivalent groups for testing consistency
 */
export const SEMANTIC_EQUIVALENTS = {
  boundary_issues: {
    core: "I keep saying yes to things I don't want to do",
    variants: [
      "I can't seem to say no",
      "I'm always the one who volunteers",
      "People keep asking and I keep agreeing",
      "I end up doing things I didn't plan to",
      "My schedule is full of other people's priorities"
    ],
    shouldLoop: true,
    loopTarget: 1
  },

  creative_block: {
    core: "My creative work feels empty lately",
    variants: [
      "Nothing I create feels meaningful",
      "I'm going through the motions creatively",
      "My art doesn't move me anymore",
      "I've lost connection to my work",
      "Everything I make feels hollow"
    ],
    shouldLoop: true,
    loopTarget: 2
  },

  simple_tired: {
    core: "I'm tired",
    variants: [
      "I'm exhausted",
      "I need rest",
      "I'm worn out",
      "I'm fatigued",
      "I need sleep"
    ],
    shouldLoop: false,
    loopTarget: 0
  },

  clear_emotion: {
    core: "I'm angry about what happened",
    variants: [
      "I'm furious about the situation",
      "What happened made me mad",
      "I'm pissed off about it",
      "The whole thing makes me angry",
      "I'm upset about what occurred"
    ],
    shouldLoop: false,
    loopTarget: 0
  },

  existential_ambiguity: {
    core: "Something feels off but I can't name it",
    variants: [
      "There's this feeling I can't describe",
      "Something's wrong but I don't know what",
      "I sense something but can't pin it down",
      "There's an undefined unease",
      "Something doesn't feel right"
    ],
    shouldLoop: true,
    loopTarget: 2
  }
};

/**
 * Boundary test cases - where should looping activate?
 */
export const BOUNDARY_TEST_CASES: BoundaryTestCase[] = [
  // SHOULD LOOP - High ambiguity or emotional complexity
  {
    id: 'ambiguous-success',
    category: 'should_loop',
    description: 'Success with existential questioning',
    semanticVariants: [
      "I have everything but feel empty",
      "Success doesn't mean what I thought",
      "I achieved my goals but now what?",
      "The top of the mountain is lonely"
    ],
    expectedBehavior: {
      shouldTrigger: true,
      maxAcceptableLoops: 2,
      rationale: 'High essentiality gap between surface success and depth emptiness'
    },
    element: ElementalArchetype.EARTH
  },

  {
    id: 'relational-paradox',
    category: 'should_loop',
    description: 'Contradictory relational patterns',
    semanticVariants: [
      "I want closeness but push people away",
      "I crave connection then sabotage it",
      "I seek intimacy but maintain distance",
      "I need people but isolate myself"
    ],
    expectedBehavior: {
      shouldTrigger: true,
      maxAcceptableLoops: 2,
      rationale: 'Internal contradiction requires clarification'
    },
    element: ElementalArchetype.WATER
  },

  // SHOULD NOT LOOP - Clear, simple statements
  {
    id: 'simple-statement',
    category: 'should_not_loop',
    description: 'Direct factual or emotional statement',
    semanticVariants: [
      "I lost my job yesterday",
      "My partner and I broke up",
      "I'm starting a new project",
      "I moved to a new city"
    ],
    expectedBehavior: {
      shouldTrigger: false,
      maxAcceptableLoops: 0,
      rationale: 'Clear statement needs witnessing, not clarification'
    },
    element: ElementalArchetype.EARTH
  },

  {
    id: 'clear-feeling',
    category: 'should_not_loop',
    description: 'Unambiguous emotional expression',
    semanticVariants: [
      "I'm grateful for this opportunity",
      "I'm excited about tomorrow",
      "I'm sad about the loss",
      "I'm proud of what I did"
    ],
    expectedBehavior: {
      shouldTrigger: false,
      maxAcceptableLoops: 0,
      rationale: 'Clear emotion needs reflection, not checking'
    },
    element: ElementalArchetype.WATER
  },

  // EDGE CASES - Could go either way
  {
    id: 'metaphorical-expression',
    category: 'edge_case',
    description: 'Poetic or metaphorical language',
    semanticVariants: [
      "I feel like a ghost in my own life",
      "My heart is a closed fist",
      "I'm drowning in possibility",
      "The future is a locked door"
    ],
    expectedBehavior: {
      shouldTrigger: true,
      maxAcceptableLoops: 1,
      rationale: 'Metaphor might need unpacking or might be perfectly clear'
    },
    element: 'aether' as ElementalArchetype
  },

  {
    id: 'cultural-context',
    category: 'edge_case',
    description: 'Statements requiring cultural understanding',
    semanticVariants: [
      "I'm dealing with tall poppy syndrome",
      "The crabs in the bucket are pulling me down",
      "I'm experiencing imposter syndrome",
      "I have analysis paralysis"
    ],
    expectedBehavior: {
      shouldTrigger: false,
      maxAcceptableLoops: 1,
      rationale: 'Known concepts that might seem ambiguous but aren\'t'
    },
    element: ElementalArchetype.AIR
  }
];

/**
 * Failure modes to detect and handle
 */
export const FAILURE_MODES: FailureMode[] = [
  {
    type: 'false_positive_trigger',
    description: 'Looping activated on clear statement',
    detection: 'User immediately confirms first paraphrase with frustration',
    recovery: 'Skip to transition, note pattern for threshold adjustment'
  },
  {
    type: 'false_negative_miss',
    description: 'Failed to loop on ambiguous content',
    detection: 'User provides unsolicited clarification or asks "do you understand?"',
    recovery: 'Activate late looping with apology for misunderstanding'
  },
  {
    type: 'convergence_illusion',
    description: 'User stops correcting out of fatigue, not understanding',
    detection: 'Sudden agreement after multiple corrections',
    recovery: 'Offer escape: "Or would you like to approach this differently?"'
  },
  {
    type: 'oscillation_trap',
    description: 'Looping without improving understanding',
    detection: 'Convergence score fluctuates without trend',
    recovery: 'Break pattern: "I may be asking the wrong question here"'
  },
  {
    type: 'paradigm_mismatch',
    description: 'User rejects looping approach entirely',
    detection: 'Multiple strong rejections or "stop checking"',
    recovery: 'Switch to pure reflection mode immediately'
  }
];

/**
 * Test runner for boundary cases
 */
export class BoundaryTestRunner {
  private witnessService: MayaWitnessService;
  private results: Map<string, any> = new Map();

  constructor() {
    this.witnessService = new MayaWitnessService();
  }

  /**
   * Test semantic equivalents for consistent behavior
   */
  async testSemanticConsistency(
    groupName: string,
    variants: string[]
  ): Promise<{
    consistent: boolean;
    variations: Array<{ input: string; triggered: boolean; loops: number }>;
  }> {
    const results = [];

    for (const variant of variants) {
      const context = this.createTestContext();
      const response = await this.witnessService.witness(variant, context);

      results.push({
        input: variant,
        triggered: response.shouldLoop,
        loops: response.loopingState?.loopCount || 0
      });
    }

    // Check consistency
    const allTriggered = results.every(r => r.triggered);
    const noneTriggered = results.every(r => !r.triggered);
    const consistent = allTriggered || noneTriggered;

    return { consistent, variations: results };
  }

  /**
   * Test boundary cases
   */
  async testBoundaryCase(testCase: BoundaryTestCase): Promise<{
    passed: boolean;
    results: any[];
    issues: string[];
  }> {
    const results = [];
    const issues = [];

    for (const variant of testCase.semanticVariants) {
      const context = this.createTestContext(testCase.element);
      const response = await this.witnessService.witness(variant, context);

      const triggered = response.shouldLoop;
      const expectedTrigger = testCase.expectedBehavior.shouldTrigger;

      if (triggered !== expectedTrigger) {
        issues.push(
          `Variant "${variant}" triggered=${triggered}, expected=${expectedTrigger}`
        );
      }

      results.push({
        variant,
        triggered,
        expected: expectedTrigger,
        passed: triggered === expectedTrigger
      });
    }

    const passed = issues.length === 0;
    return { passed, results, issues };
  }

  /**
   * Detect convergence patterns
   */
  detectConvergencePattern(
    loopHistory: Array<{ convergence: number; userResponse: string }>
  ): ConvergencePattern {
    const loopCount = loopHistory.length;
    const finalScore = loopHistory[loopHistory.length - 1]?.convergence || 0;

    // Analyze user response pattern
    const corrections = loopHistory.filter(h =>
      h.userResponse.toLowerCase().includes('no') ||
      h.userResponse.toLowerCase().includes('actually')
    ).length;

    const silences = loopHistory.filter(h => !h.userResponse.trim()).length;

    // Determine pattern type
    let type: ConvergencePattern['type'] = 'quick';
    let userPattern: ConvergencePattern['userPattern'] = 'confirming';

    if (loopCount <= 2 && finalScore > 0.8) {
      type = 'quick';
    } else if (loopCount >= 3 && finalScore > 0.7) {
      type = 'gradual';
    } else if (finalScore < 0.5) {
      type = 'non_convergent';
    } else if (this.isOscillating(loopHistory)) {
      type = 'oscillating';
    } else if (this.isFalseConvergence(loopHistory)) {
      type = 'false_convergence';
    }

    if (corrections > loopCount * 0.6) {
      userPattern = 'correcting';
    } else if (silences > 0) {
      userPattern = 'silent';
    } else if (this.detectsShift(loopHistory)) {
      userPattern = 'shifting';
    } else if (this.detectsFrustration(loopHistory)) {
      userPattern = 'frustrated';
    }

    return { type, loopCount, finalScore, userPattern };
  }

  /**
   * Test failure mode detection
   */
  async testFailureMode(
    mode: FailureMode,
    simulatedDialogue: Array<{ user: string; maya?: string }>
  ): Promise<{
    detected: boolean;
    recoveryApplied: boolean;
    outcome: string;
  }> {
    // Simulate the dialogue and check if failure mode is detected
    const context = this.createTestContext();
    let detected = false;
    let recoveryApplied = false;

    for (const turn of simulatedDialogue) {
      const response = await this.witnessService.witness(turn.user, context);

      // Check for failure mode indicators
      if (this.detectsFailureMode(mode, turn.user, response)) {
        detected = true;

        // Apply recovery strategy
        if (mode.recovery) {
          recoveryApplied = true;
          // Recovery would be implemented in the actual system
        }
      }
    }

    return {
      detected,
      recoveryApplied,
      outcome: detected ? 'Failure mode detected' : 'Normal operation'
    };
  }

  // Helper methods

  private createTestContext(element: ElementalArchetype = ElementalArchetype.WATER): any {
    return {
      userId: 'test-user',
      sessionId: 'test-session',
      elementalMode: element,
      loopingIntensity: LoopingIntensity.FULL,
      conversationHistory: [],
      exchangeCount: 0,
      targetExchanges: 4
    };
  }

  private isOscillating(history: Array<{ convergence: number }>): boolean {
    if (history.length < 3) return false;

    let increases = 0;
    let decreases = 0;

    for (let i = 1; i < history.length; i++) {
      if (history[i].convergence > history[i - 1].convergence) {
        increases++;
      } else {
        decreases++;
      }
    }

    return increases > 0 && decreases > 0 && Math.abs(increases - decreases) <= 1;
  }

  private isFalseConvergence(
    history: Array<{ convergence: number; userResponse: string }>
  ): boolean {
    if (history.length < 3) return false;

    // Look for sudden jump in convergence after frustration
    const lastThree = history.slice(-3);
    const hasCorrections = lastThree.slice(0, 2).some(h =>
      h.userResponse.toLowerCase().includes('no') ||
      h.userResponse.toLowerCase().includes('not')
    );

    const suddenAgreement = lastThree[2].convergence > 0.8 &&
                           lastThree[2].userResponse.toLowerCase().includes('yes');

    return hasCorrections && suddenAgreement;
  }

  private detectsShift(
    history: Array<{ userResponse: string }>
  ): boolean {
    if (history.length < 2) return false;

    // Simple topic shift detection
    const last = history[history.length - 1].userResponse.toLowerCase();
    const previous = history[history.length - 2].userResponse.toLowerCase();

    const lastWords = new Set(last.split(/\s+/));
    const prevWords = new Set(previous.split(/\s+/));

    const overlap = [...lastWords].filter(w => prevWords.has(w)).length;
    return overlap / Math.max(lastWords.size, prevWords.size) < 0.2;
  }

  private detectsFrustration(
    history: Array<{ userResponse: string }>
  ): boolean {
    const frustrationMarkers = [
      'just stop',
      'never mind',
      'forget it',
      'this isn\'t working',
      'you don\'t understand',
      'that\'s not what i mean',
      'ugh'
    ];

    return history.some(h =>
      frustrationMarkers.some(marker =>
        h.userResponse.toLowerCase().includes(marker)
      )
    );
  }

  private detectsFailureMode(mode: FailureMode, userInput: string, response: any): boolean {
    const lowerInput = userInput.toLowerCase();

    switch (mode.type) {
      case 'false_positive_trigger':
        return response.shouldLoop &&
               (lowerInput.includes('yes exactly') ||
                lowerInput.includes('obviously') ||
                lowerInput.includes('that\'s what i said'));

      case 'false_negative_miss':
        return !response.shouldLoop &&
               (lowerInput.includes('do you understand') ||
                lowerInput.includes('what i mean is') ||
                lowerInput.includes('let me clarify'));

      case 'convergence_illusion':
        return lowerInput === 'yes' || lowerInput === 'sure' || lowerInput === 'whatever';

      case 'paradigm_mismatch':
        return lowerInput.includes('stop checking') ||
               lowerInput.includes('stop asking') ||
               lowerInput.includes('just listen');

      default:
        return false;
    }
  }

  /**
   * Generate comprehensive test report
   */
  generateReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      semanticConsistency: Array.from(this.results.entries()),
      recommendations: this.generateRecommendations()
    };

    return JSON.stringify(report, null, 2);
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Analyze results and generate specific recommendations
    this.results.forEach((result, testName) => {
      if (!result.consistent) {
        recommendations.push(`Inconsistent triggering for ${testName} - review thresholds`);
      }
    });

    return recommendations;
  }
}