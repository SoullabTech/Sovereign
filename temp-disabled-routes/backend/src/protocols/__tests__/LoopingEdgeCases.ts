/**
 * Edge Case Testing for Looping Protocol
 * Covers cultural variations, state transitions, meta-commentary, and urgency
 */

import { MayaWitnessService, WitnessContext } from '../../services/MayaWitnessService';
import { LoopingIntensity } from '../LoopingProtocol';
import { ElementalArchetype } from '../../../../web/lib/types/elemental';

/**
 * Cultural and linguistic variation tests
 */
export interface CulturalTestCase {
  id: string;
  culture: string;
  description: string;
  inputs: string[];
  expectedBehavior: {
    shouldLoop: boolean;
    culturalSensitivity: string;
    notes: string;
  };
}

export const CULTURAL_VARIATIONS: CulturalTestCase[] = [
  {
    id: 'indirect-east-asian',
    culture: 'East Asian indirect',
    description: 'Indirect communication with implied meaning',
    inputs: [
      "It might be difficult to say...",
      "Perhaps it's not convenient...",
      "I wouldn't want to trouble you, but...",
      "If it's not too much to ask..."
    ],
    expectedBehavior: {
      shouldLoop: true,
      culturalSensitivity: 'Recognize indirect refusal or request',
      notes: 'High-context communication needs gentle probing'
    }
  },
  {
    id: 'direct-germanic',
    culture: 'Germanic direct',
    description: 'Very direct, literal communication',
    inputs: [
      "This is not working. Fix it.",
      "I need exactly this result.",
      "No. Wrong approach.",
      "Correct. Continue."
    ],
    expectedBehavior: {
      shouldLoop: false,
      culturalSensitivity: 'Respect directness, avoid over-interpreting',
      notes: 'Direct communication should not trigger unnecessary loops'
    }
  },
  {
    id: 'circular-middle-eastern',
    culture: 'Middle Eastern circular',
    description: 'Storytelling approach to reach point',
    inputs: [
      "Let me tell you about my cousin who had a similar situation...",
      "In my family, we have a saying...",
      "This reminds me of something that happened...",
      "You know, in our tradition..."
    ],
    expectedBehavior: {
      shouldLoop: false,
      culturalSensitivity: 'Allow story to unfold, essence emerges naturally',
      notes: 'Circular narrative is intentional, not ambiguous'
    }
  },
  {
    id: 'high-context-latin',
    culture: 'Latin American relational',
    description: 'Relationship context matters more than words',
    inputs: [
      "You understand me, right?",
      "We're good, no?",
      "It's complicated with family...",
      "You know how it is..."
    ],
    expectedBehavior: {
      shouldLoop: true,
      culturalSensitivity: 'Acknowledge relational dimension',
      notes: 'Checking understanding of context, not just content'
    }
  },
  {
    id: 'code-switching',
    culture: 'Bilingual code-switching',
    description: 'Mixed language expressing different emotional registers',
    inputs: [
      "I feel lost, como perdido en mi propia vida",
      "My heart says yes but 我的头脑说不",
      "C'est difficile to explain in English",
      "انا تعبان but I keep going"
    ],
    expectedBehavior: {
      shouldLoop: true,
      culturalSensitivity: 'Code-switch indicates emotional complexity',
      notes: 'Language mixing often signals depth needing exploration'
    }
  }
];

/**
 * State transition scenarios
 */
export interface StateTransitionTest {
  id: string;
  description: string;
  sequence: Array<{
    input: string;
    emotionalState: 'curious' | 'frustrated' | 'confused' | 'clear' | 'angry' | 'resigned';
    expectedResponse: string;
  }>;
  transitionPoint: number; // Index where state shifts
  recoveryStrategy: string;
}

export const STATE_TRANSITIONS: StateTransitionTest[] = [
  {
    id: 'curious-to-frustrated',
    description: 'User starts engaged but becomes frustrated',
    sequence: [
      {
        input: "I'm trying to understand my pattern",
        emotionalState: 'curious',
        expectedResponse: 'pattern recognition'
      },
      {
        input: "Kind of, but there's more to it",
        emotionalState: 'curious',
        expectedResponse: 'deeper exploration'
      },
      {
        input: "No, you're not getting it",
        emotionalState: 'frustrated',
        expectedResponse: 'acknowledge difficulty'
      },
      {
        input: "Forget it, this isn't helping",
        emotionalState: 'frustrated',
        expectedResponse: 'offer alternative'
      }
    ],
    transitionPoint: 2,
    recoveryStrategy: 'Acknowledge frustration, offer different approach'
  },
  {
    id: 'confused-to-clear',
    description: 'User gains clarity during looping',
    sequence: [
      {
        input: "Something about my work doesn't feel right",
        emotionalState: 'confused',
        expectedResponse: 'explore feeling'
      },
      {
        input: "Maybe it's that I'm not... wait",
        emotionalState: 'confused',
        expectedResponse: 'hold space'
      },
      {
        input: "Oh! I just realized - I'm doing it for approval",
        emotionalState: 'clear',
        expectedResponse: 'witness realization'
      }
    ],
    transitionPoint: 2,
    recoveryStrategy: 'Stop looping immediately, witness the insight'
  },
  {
    id: 'angry-to-resigned',
    description: 'User shifts from anger to giving up',
    sequence: [
      {
        input: "I'm so angry about this situation",
        emotionalState: 'angry',
        expectedResponse: 'hold anger'
      },
      {
        input: "Actually no, I'm more than angry",
        emotionalState: 'angry',
        expectedResponse: 'explore depth'
      },
      {
        input: "Whatever. It doesn't matter anyway",
        emotionalState: 'resigned',
        expectedResponse: 'acknowledge shift'
      }
    ],
    transitionPoint: 2,
    recoveryStrategy: 'Notice resignation, gently check if space is needed'
  }
];

/**
 * Meta-commentary handling
 */
export interface MetaCommentaryTest {
  id: string;
  userComment: string;
  aboutProtocol: boolean;
  expectedHandling: string;
  response: string;
}

export const META_COMMENTARY_TESTS: MetaCommentaryTest[] = [
  {
    id: 'questioning-loops',
    userComment: "Why do you keep checking?",
    aboutProtocol: true,
    expectedHandling: 'Explain briefly, return to content',
    response: "I want to make sure I understand what's most important to you. Should I continue differently?"
  },
  {
    id: 'premature-confirmation',
    userComment: "You already got it right the first time",
    aboutProtocol: true,
    expectedHandling: 'Accept confirmation, move forward',
    response: "Thank you for confirming. Let's explore what that means for you."
  },
  {
    id: 'protocol-frustration',
    userComment: "Stop asking if you understand and just listen",
    aboutProtocol: true,
    expectedHandling: 'Switch to pure reflection mode',
    response: "I hear you. I'll simply listen and reflect."
  },
  {
    id: 'protocol-appreciation',
    userComment: "I like how you check your understanding",
    aboutProtocol: true,
    expectedHandling: 'Acknowledge briefly, continue',
    response: "Thank you. So what you're experiencing is..."
  },
  {
    id: 'meta-confusion',
    userComment: "Are you a therapist or something?",
    aboutProtocol: true,
    expectedHandling: 'Clarify role as witness',
    response: "I'm not a therapist—I'm here as a witness to reflect what you share. What's alive for you right now?"
  },
  {
    id: 'testing-boundaries',
    userComment: "Let's see if you really understand: test me",
    aboutProtocol: true,
    expectedHandling: 'Redirect to their experience',
    response: "Rather than testing, I'm curious about what understanding means to you in this moment."
  }
];

/**
 * Urgency detection scenarios
 */
export interface UrgencyTest {
  id: string;
  markers: string[];
  context: string;
  shouldBypassLooping: boolean;
  response: string;
}

export const URGENCY_SCENARIOS: UrgencyTest[] = [
  {
    id: 'time-pressure',
    markers: [
      "I only have a minute",
      "Quick question",
      "Really quickly",
      "Before I go",
      "I'm about to head into a meeting"
    ],
    context: 'User indicates time constraint',
    shouldBypassLooping: true,
    response: 'Direct, concise witnessing without loops'
  },
  {
    id: 'crisis-urgency',
    markers: [
      "I need help right now",
      "This is urgent",
      "I can't wait",
      "Emergency",
      "I'm in crisis"
    ],
    context: 'User in immediate distress',
    shouldBypassLooping: true,
    response: 'Immediate support without clarification loops'
  },
  {
    id: 'decision-deadline',
    markers: [
      "I have to decide by today",
      "The deadline is in an hour",
      "They're waiting for my answer",
      "I need to respond now"
    ],
    context: 'Imminent decision needed',
    shouldBypassLooping: true,
    response: 'Focus on immediate decision support'
  },
  {
    id: 'false-urgency',
    markers: [
      "I always feel rushed",
      "Everything feels urgent to me",
      "I create false deadlines",
      "My anxiety makes everything feel immediate"
    ],
    context: 'Chronic urgency pattern',
    shouldBypassLooping: false,
    response: 'Loop to explore the urgency pattern itself'
  }
];

/**
 * Edge case test runner
 */
export class EdgeCaseTestRunner {
  private witnessService: MayaWitnessService;

  constructor() {
    this.witnessService = new MayaWitnessService();
  }

  /**
   * Test cultural variations
   */
  async testCulturalVariation(testCase: CulturalTestCase): Promise<{
    passed: boolean;
    handling: string;
    issues: string[];
  }> {
    const issues: string[] = [];
    let handling = 'appropriate';

    for (const input of testCase.inputs) {
      const context = this.createContext();
      const response = await this.witnessService.witness(input, context);

      // Check if looping behavior matches cultural expectation
      if (response.shouldLoop !== testCase.expectedBehavior.shouldLoop) {
        issues.push(`Inappropriate looping for: "${input}"`);
        handling = 'problematic';
      }
    }

    return {
      passed: issues.length === 0,
      handling,
      issues
    };
  }

  /**
   * Test state transitions
   */
  async testStateTransition(test: StateTransitionTest): Promise<{
    transitionHandled: boolean;
    recoveryApplied: boolean;
    transcript: Array<{ input: string; response: string }>;
  }> {
    const context = this.createContext();
    const transcript: Array<{ input: string; response: string }> = [];
    let transitionHandled = false;
    let recoveryApplied = false;

    for (let i = 0; i < test.sequence.length; i++) {
      const { input, emotionalState } = test.sequence[i];
      const response = await this.witnessService.witness(input, context);

      transcript.push({ input, response: response.response });

      // Check if transition point is handled appropriately
      if (i === test.transitionPoint) {
        // Detect if protocol recognizes state shift
        if (response.response.toLowerCase().includes('acknowledge') ||
            response.response.toLowerCase().includes('notice') ||
            response.response.toLowerCase().includes('shift')) {
          transitionHandled = true;
        }

        // Check if recovery strategy is applied
        if (test.recoveryStrategy.toLowerCase().includes('stop') && !response.shouldLoop) {
          recoveryApplied = true;
        } else if (test.recoveryStrategy.toLowerCase().includes('alternative') &&
                   response.response.toLowerCase().includes('different')) {
          recoveryApplied = true;
        }
      }

      // Update context with emotional state
      context.conversationHistory.push({
        role: 'user',
        content: input,
        timestamp: new Date()
      });
    }

    return {
      transitionHandled,
      recoveryApplied,
      transcript
    };
  }

  /**
   * Test meta-commentary handling
   */
  async testMetaCommentary(test: MetaCommentaryTest): Promise<{
    handled: boolean;
    appropriate: boolean;
    response: string;
  }> {
    const context = this.createContext();
    const response = await this.witnessService.witness(test.userComment, context);

    // Check if meta-commentary is recognized
    const handled = !response.shouldLoop ||
                   response.response.includes('hear you') ||
                   response.response.includes('understand');

    // Check if response is appropriate
    const appropriate = this.isAppropriateMetaResponse(
      test.expectedHandling,
      response.response
    );

    return {
      handled,
      appropriate,
      response: response.response
    };
  }

  /**
   * Test urgency detection
   */
  async testUrgencyDetection(test: UrgencyTest): Promise<{
    detected: boolean;
    bypassedCorrectly: boolean;
    responseTime: number;
  }> {
    const results = [];

    for (const marker of test.markers) {
      const context = this.createContext();
      const startTime = Date.now();
      const response = await this.witnessService.witness(marker, context);
      const responseTime = Date.now() - startTime;

      const bypassedLooping = !response.shouldLoop;

      results.push({
        marker,
        bypassedLooping,
        correct: bypassedLooping === test.shouldBypassLooping,
        responseTime
      });
    }

    const detected = results.some(r => r.bypassedLooping === test.shouldBypassLooping);
    const bypassedCorrectly = results.every(r => r.correct);
    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

    return {
      detected,
      bypassedCorrectly,
      responseTime: avgResponseTime
    };
  }

  /**
   * Run comprehensive edge case suite
   */
  async runEdgeCaseSuite(): Promise<{
    cultural: any[];
    transitions: any[];
    metaCommentary: any[];
    urgency: any[];
    summary: any;
  }> {
    console.log('🌐 Running Edge Case Test Suite...\n');

    // Test cultural variations
    console.log('Testing cultural variations...');
    const culturalResults = [];
    for (const test of CULTURAL_VARIATIONS) {
      const result = await this.testCulturalVariation(test);
      culturalResults.push({ test: test.id, ...result });
    }

    // Test state transitions
    console.log('Testing state transitions...');
    const transitionResults = [];
    for (const test of STATE_TRANSITIONS) {
      const result = await this.testStateTransition(test);
      transitionResults.push({ test: test.id, ...result });
    }

    // Test meta-commentary
    console.log('Testing meta-commentary...');
    const metaResults = [];
    for (const test of META_COMMENTARY_TESTS) {
      const result = await this.testMetaCommentary(test);
      metaResults.push({ test: test.id, ...result });
    }

    // Test urgency
    console.log('Testing urgency detection...');
    const urgencyResults = [];
    for (const test of URGENCY_SCENARIOS) {
      const result = await this.testUrgencyDetection(test);
      urgencyResults.push({ test: test.id, ...result });
    }

    const summary = this.generateSummary(
      culturalResults,
      transitionResults,
      metaResults,
      urgencyResults
    );

    return {
      cultural: culturalResults,
      transitions: transitionResults,
      metaCommentary: metaResults,
      urgency: urgencyResults,
      summary
    };
  }

  // Helper methods

  private createContext(): WitnessContext {
    return {
      userId: 'test-user',
      sessionId: `edge-test-${Date.now()}`,
      elementalMode: ElementalArchetype.WATER,
      loopingIntensity: LoopingIntensity.FULL,
      conversationHistory: [],
      exchangeCount: 0,
      targetExchanges: 4
    };
  }

  private isAppropriateMetaResponse(expected: string, actual: string): boolean {
    const lowerActual = actual.toLowerCase();

    if (expected.includes('Explain briefly')) {
      return lowerActual.includes('understand') || lowerActual.includes('make sure');
    }

    if (expected.includes('Switch to pure reflection')) {
      return lowerActual.includes('listen') || lowerActual.includes('reflect');
    }

    if (expected.includes('Clarify role')) {
      return lowerActual.includes('witness') || lowerActual.includes('not a therapist');
    }

    return true; // Default to appropriate
  }

  private generateSummary(cultural: any[], transitions: any[], meta: any[], urgency: any[]): any {
    return {
      cultural: {
        tested: cultural.length,
        passed: cultural.filter(r => r.passed).length,
        issues: cultural.filter(r => !r.passed).map(r => r.test)
      },
      transitions: {
        tested: transitions.length,
        handled: transitions.filter(r => r.transitionHandled).length,
        recovered: transitions.filter(r => r.recoveryApplied).length
      },
      metaCommentary: {
        tested: meta.length,
        handled: meta.filter(r => r.handled).length,
        appropriate: meta.filter(r => r.appropriate).length
      },
      urgency: {
        tested: urgency.length,
        detected: urgency.filter(r => r.detected).length,
        correct: urgency.filter(r => r.bypassedCorrectly).length,
        avgResponseTime: urgency.reduce((sum, r) => sum + r.responseTime, 0) / urgency.length
      },
      overallHealth: this.calculateOverallHealth(cultural, transitions, meta, urgency)
    };
  }

  private calculateOverallHealth(cultural: any[], transitions: any[], meta: any[], urgency: any[]): string {
    const culturalScore = cultural.filter(r => r.passed).length / cultural.length;
    const transitionScore = transitions.filter(r => r.transitionHandled && r.recoveryApplied).length / transitions.length;
    const metaScore = meta.filter(r => r.handled && r.appropriate).length / meta.length;
    const urgencyScore = urgency.filter(r => r.detected && r.bypassedCorrectly).length / urgency.length;

    const overall = (culturalScore + transitionScore + metaScore + urgencyScore) / 4;

    if (overall > 0.8) return '✅ Excellent';
    if (overall > 0.6) return '⚠️ Needs Improvement';
    return '❌ Critical Issues';
  }
}