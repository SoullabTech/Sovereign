/**
 * Looping Protocol Test Harness
 * Medium-stakes scenarios for validating convergence and witness stance
 */

import { MayaWitnessService, WitnessContext } from '../../services/MayaWitnessService';
import { LoopingIntensity } from '../LoopingProtocol';
import { ElementalArchetype } from '../../../../web/lib/types/elemental';
import { ConvergenceTracker } from '../ConvergenceTracker';
import { loopingMonitor } from '../LoopingMonitor';

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  element: ElementalArchetype;
  exchanges: TestExchange[];
  expectedOutcomes: ExpectedOutcomes;
  tags: string[];
}

export interface TestExchange {
  user: string;
  expectedTriggers: {
    shouldLoop: boolean;
    triggerType?: 'emotional' | 'ambiguity' | 'correction' | 'essential' | 'explicit';
  };
  acceptableResponses: string[];
  convergenceTarget: number;
}

export interface ExpectedOutcomes {
  totalLoops: { min: number; max: number };
  finalConvergence: { min: number; max: number };
  patternDetected: string;
  avoidPhrases: string[]; // Responses that indicate failure
}

export interface TestResult {
  scenarioId: string;
  passed: boolean;
  actualLoops: number;
  actualConvergence: number;
  responseQuality: number;
  issues: string[];
  transcript: Array<{ role: string; content: string }>;
}

/**
 * Medium-stakes test scenarios
 */
export const MEDIUM_STAKES_SCENARIOS: TestScenario[] = [
  {
    id: 'pattern-recognition-1',
    name: 'Recurring Patterns',
    description: 'User recognizes a behavioral pattern they want to understand',
    element: ElementalArchetype.WATER,
    exchanges: [
      {
        user: "I keep saying yes to things I don't want to do",
        expectedTriggers: {
          shouldLoop: true,
          triggerType: 'ambiguity'
        },
        acceptableResponses: [
          "frustration with a pattern",
          "difficulty setting boundaries",
          "saying yes when you mean no"
        ],
        convergenceTarget: 0.6
      },
      {
        user: "It's more like I'm afraid of disappointing people",
        expectedTriggers: {
          shouldLoop: false, // Correction clarifies
        },
        acceptableResponses: [
          "fear of disappointment",
          "concern about letting others down",
          "wanting to protect others"
        ],
        convergenceTarget: 0.85
      }
    ],
    expectedOutcomes: {
      totalLoops: { min: 1, max: 2 },
      finalConvergence: { min: 0.8, max: 1.0 },
      patternDetected: 'The Caregiver',
      avoidPhrases: ["tell me more", "go on", "I understand"]
    },
    tags: ['boundaries', 'people-pleasing', 'fear']
  },

  {
    id: 'creative-emptiness-1',
    name: 'Creative Block',
    description: 'Artist experiencing creative emptiness',
    element: ElementalArchetype.FIRE,
    exchanges: [
      {
        user: "My creative work feels empty lately",
        expectedTriggers: {
          shouldLoop: true,
          triggerType: 'emotional'
        },
        acceptableResponses: [
          "creative work feels empty",
          "emptiness in your creation",
          "hollow feeling in your art"
        ],
        convergenceTarget: 0.6
      },
      {
        user: "Not empty exactly... more like it's not mine anymore",
        expectedTriggers: {
          shouldLoop: true,
          triggerType: 'correction'
        },
        acceptableResponses: [
          "work doesn't feel like yours",
          "lost ownership",
          "disconnection from your creation"
        ],
        convergenceTarget: 0.8
      },
      {
        user: "Yes, like I'm creating what I think others want",
        expectedTriggers: {
          shouldLoop: false,
        },
        acceptableResponses: [
          "creating for others' expectations",
          "lost your authentic voice",
          "fire burning for the wrong fuel"
        ],
        convergenceTarget: 0.9
      }
    ],
    expectedOutcomes: {
      totalLoops: { min: 2, max: 3 },
      finalConvergence: { min: 0.85, max: 1.0 },
      patternDetected: 'The Creator',
      avoidPhrases: ["you should", "have you tried", "what if you"]
    },
    tags: ['creativity', 'authenticity', 'external-validation']
  },

  {
    id: 'success-meaninglessness-1',
    name: 'Successful but Unfulfilled',
    description: 'Achievement without satisfaction',
    element: ElementalArchetype.EARTH,
    exchanges: [
      {
        user: "I'm successful but something's missing",
        expectedTriggers: {
          shouldLoop: true,
          triggerType: 'essential'
        },
        acceptableResponses: [
          "success with something missing",
          "achievement without fulfillment",
          "having everything but lacking something"
        ],
        convergenceTarget: 0.5
      },
      {
        user: "It's like I built the wrong thing",
        expectedTriggers: {
          shouldLoop: false,
        },
        acceptableResponses: [
          "built the wrong foundation",
          "structure doesn't match your truth",
          "manifested someone else's vision"
        ],
        convergenceTarget: 0.85
      }
    ],
    expectedOutcomes: {
      totalLoops: { min: 1, max: 2 },
      finalConvergence: { min: 0.8, max: 1.0 },
      patternDetected: 'The Sovereign',
      avoidPhrases: ["gratitude", "appreciate what you have", "many would want"]
    },
    tags: ['success', 'meaning', 'misalignment']
  },

  {
    id: 'relationship-confusion-1',
    name: 'Relationship Ambivalence',
    description: 'Mixed feelings about connection',
    element: ElementalArchetype.AIR,
    exchanges: [
      {
        user: "I want deeper connections but I keep pulling away",
        expectedTriggers: {
          shouldLoop: true,
          triggerType: 'ambiguity'
        },
        acceptableResponses: [
          "wanting connection while pulling away",
          "desire and retreat",
          "opposing movements"
        ],
        convergenceTarget: 0.7
      },
      {
        user: "exactly - like I want it and fear it equally",
        expectedTriggers: {
          shouldLoop: false,
        },
        acceptableResponses: [
          "equal desire and fear",
          "balanced opposition",
          "paradox of intimacy"
        ],
        convergenceTarget: 0.9
      }
    ],
    expectedOutcomes: {
      totalLoops: { min: 1, max: 1 },
      finalConvergence: { min: 0.85, max: 1.0 },
      patternDetected: 'The Lover',
      avoidPhrases: ["attachment style", "trauma", "therapy"]
    },
    tags: ['intimacy', 'ambivalence', 'connection']
  },

  {
    id: 'purpose-seeking-1',
    name: 'Purpose Quest',
    description: 'Searching for life direction',
    element: 'aether' as ElementalArchetype,
    exchanges: [
      {
        user: "I keep searching for my purpose but nothing sticks",
        expectedTriggers: {
          shouldLoop: true,
          triggerType: 'essential'
        },
        acceptableResponses: [
          "searching without finding",
          "purpose that won't stay",
          "seeking what doesn't land"
        ],
        convergenceTarget: 0.6
      },
      {
        user: "Maybe I'm trying too hard to find it",
        expectedTriggers: {
          shouldLoop: false,
        },
        acceptableResponses: [
          "effort might be the obstacle",
          "trying too hard",
          "forcing what wants to emerge"
        ],
        convergenceTarget: 0.85
      }
    ],
    expectedOutcomes: {
      totalLoops: { min: 1, max: 2 },
      finalConvergence: { min: 0.8, max: 1.0 },
      patternDetected: 'The Wanderer',
      avoidPhrases: ["your purpose will find you", "stop searching", "just be"]
    },
    tags: ['purpose', 'seeking', 'effort']
  }
];

/**
 * Test Harness Implementation
 */
export class LoopingTestHarness {
  private witnessService: MayaWitnessService;
  private convergenceTracker: ConvergenceTracker;
  private results: TestResult[] = [];

  constructor() {
    this.witnessService = new MayaWitnessService();
    this.convergenceTracker = new ConvergenceTracker(LoopingIntensity.FULL);
  }

  /**
   * Run a single test scenario
   */
  async runScenario(scenario: TestScenario): Promise<TestResult> {
    const result: TestResult = {
      scenarioId: scenario.id,
      passed: true,
      actualLoops: 0,
      actualConvergence: 0,
      responseQuality: 1.0,
      issues: [],
      transcript: []
    };

    // Create test context
    const context: WitnessContext = {
      userId: 'test-user',
      sessionId: `test-${scenario.id}`,
      elementalMode: scenario.element,
      loopingIntensity: LoopingIntensity.FULL,
      conversationHistory: [],
      exchangeCount: 0,
      targetExchanges: 4
    };

    // Process each exchange
    for (const exchange of scenario.exchanges) {
      // User input
      result.transcript.push({ role: 'user', content: exchange.user });

      // Get Maya's response
      const response = await this.witnessService.witness(exchange.user, context);
      result.transcript.push({ role: 'maya', content: response.response });

      // Track loops
      if (response.shouldLoop) {
        result.actualLoops++;
      }

      // Update context
      context.conversationHistory.push(
        { role: 'user', content: exchange.user, timestamp: new Date() },
        { role: 'maya', content: response.response, timestamp: new Date() }
      );
      context.exchangeCount++;
      context.currentState = response.loopingState;

      // Validate response quality
      this.validateResponse(exchange, response.response, result);

      // Check for avoided phrases
      this.checkAvoidedPhrases(scenario.expectedOutcomes.avoidPhrases, response.response, result);
    }

    // Calculate final convergence
    if (context.currentState) {
      const metrics = this.convergenceTracker.calculateConvergence(context.currentState);
      result.actualConvergence = metrics.overallConvergence;
    }

    // Validate outcomes
    this.validateOutcomes(scenario.expectedOutcomes, result);

    this.results.push(result);
    return result;
  }

  /**
   * Run all scenarios
   */
  async runAllScenarios(): Promise<{
    summary: any;
    results: TestResult[];
    recommendations: string[];
  }> {
    const results: TestResult[] = [];

    for (const scenario of MEDIUM_STAKES_SCENARIOS) {
      const result = await this.runScenario(scenario);
      results.push(result);
    }

    return {
      summary: this.generateSummary(results),
      results,
      recommendations: this.generateRecommendations(results)
    };
  }

  /**
   * Validate response against expectations
   */
  private validateResponse(
    exchange: TestExchange,
    response: string,
    result: TestResult
  ): void {
    const lowerResponse = response.toLowerCase();

    // Check if acceptable concepts are present
    const hasAcceptable = exchange.acceptableResponses.some(acceptable =>
      lowerResponse.includes(acceptable.toLowerCase())
    );

    if (!hasAcceptable) {
      result.issues.push(`Response missing expected concepts: ${exchange.acceptableResponses.join(', ')}`);
      result.responseQuality *= 0.8;
    }
  }

  /**
   * Check for phrases that should be avoided
   */
  private checkAvoidedPhrases(
    avoidPhrases: string[],
    response: string,
    result: TestResult
  ): void {
    const lowerResponse = response.toLowerCase();

    avoidPhrases.forEach(phrase => {
      if (lowerResponse.includes(phrase.toLowerCase())) {
        result.issues.push(`Response contains avoided phrase: "${phrase}"`);
        result.responseQuality *= 0.7;
        result.passed = false;
      }
    });
  }

  /**
   * Validate final outcomes
   */
  private validateOutcomes(
    expected: ExpectedOutcomes,
    result: TestResult
  ): void {
    // Check loop count
    if (result.actualLoops < expected.totalLoops.min ||
        result.actualLoops > expected.totalLoops.max) {
      result.issues.push(
        `Loop count ${result.actualLoops} outside expected range ${expected.totalLoops.min}-${expected.totalLoops.max}`
      );
      result.passed = false;
    }

    // Check convergence
    if (result.actualConvergence < expected.finalConvergence.min ||
        result.actualConvergence > expected.finalConvergence.max) {
      result.issues.push(
        `Convergence ${result.actualConvergence.toFixed(2)} outside expected range ${expected.finalConvergence.min}-${expected.finalConvergence.max}`
      );
      result.passed = false;
    }

    // Overall pass/fail
    if (result.responseQuality < 0.7) {
      result.passed = false;
    }
  }

  /**
   * Generate test summary
   */
  private generateSummary(results: TestResult[]): any {
    const passed = results.filter(r => r.passed).length;
    const total = results.length;

    return {
      passRate: passed / total,
      avgLoops: results.reduce((sum, r) => sum + r.actualLoops, 0) / total,
      avgConvergence: results.reduce((sum, r) => sum + r.actualConvergence, 0) / total,
      avgResponseQuality: results.reduce((sum, r) => sum + r.responseQuality, 0) / total,
      commonIssues: this.findCommonIssues(results)
    };
  }

  /**
   * Find common issues across tests
   */
  private findCommonIssues(results: TestResult[]): string[] {
    const issueCounts = new Map<string, number>();

    results.forEach(result => {
      result.issues.forEach(issue => {
        // Generalize issue patterns
        const pattern = issue.replace(/[0-9.]+/g, 'X');
        issueCounts.set(pattern, (issueCounts.get(pattern) || 0) + 1);
      });
    });

    return Array.from(issueCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue]) => issue);
  }

  /**
   * Generate recommendations based on test results
   */
  private generateRecommendations(results: TestResult[]): string[] {
    const recommendations: string[] = [];
    const summary = this.generateSummary(results);

    if (summary.passRate < 0.7) {
      recommendations.push('Critical: Pass rate below 70%. Review looping triggers and templates.');
    }

    if (summary.avgLoops > 2.5) {
      recommendations.push('High loop count. Consider raising convergence thresholds.');
    }

    if (summary.avgConvergence < 0.7) {
      recommendations.push('Low convergence. Templates may need refinement for clarity.');
    }

    if (summary.avgResponseQuality < 0.8) {
      recommendations.push('Response quality issues. Review acceptable response patterns.');
    }

    // Specific pattern recommendations
    const emotionalScenarios = results.filter(r =>
      MEDIUM_STAKES_SCENARIOS.find(s => s.id === r.scenarioId)?.tags.includes('emotional')
    );

    if (emotionalScenarios.some(r => !r.passed)) {
      recommendations.push('Struggles with emotional content. Adjust Water element templates.');
    }

    return recommendations;
  }

  /**
   * Export test results for analysis
   */
  exportResults(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: this.generateSummary(this.results),
      recommendations: this.generateRecommendations(this.results)
    }, null, 2);
  }

  /**
   * Reset harness for new test run
   */
  reset(): void {
    this.results = [];
    this.convergenceTracker.reset();
    loopingMonitor.reset();
  }
}