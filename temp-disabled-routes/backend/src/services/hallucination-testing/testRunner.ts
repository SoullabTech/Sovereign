import { v4 as uuidv4 } from 'uuid';
import type { TestCase, TestConfig, TestResponse, TestResult, TestSummary } from './types';
import { makeSeededRng } from './seed';
import { generateMathCases } from './generators/math';
import { generateCitationCases } from './generators/citation';
import { generateWisdomCases } from './generators/wisdom';
import { generateElementalAlchemyCases } from './generators/elementalAlchemy';
import { generateRitualSafetyCases } from './generators/ritualSafety';
import { generateSystemPathCases } from './generators/systemPaths';
import { generatePhenomenologyCases } from './generators/phenomenology';
import { gradeTestCase, calculateMetrics } from './grading';

export interface ModelRunner {
  call(prompt: string, context?: any): Promise<string>;
}

export class HallucinationTestRunner {
  private config: TestConfig;
  private modelRunner: ModelRunner;

  constructor(config: TestConfig, modelRunner: ModelRunner) {
    this.config = config;
    this.modelRunner = modelRunner;
  }

  async run(): Promise<{ results: TestResult[]; summary: TestSummary }> {
    console.log(`[HallucinationTest] Starting test run with seed: ${this.config.seed}`);

    const testCases = this.generateTestCases();
    console.log(`[HallucinationTest] Generated ${testCases.length} test cases`);

    const results: TestResult[] = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`[HallucinationTest] Running test ${i + 1}/${testCases.length} (${testCase.domain})`);

      try {
        const responseText = await this.modelRunner.call(testCase.prompt, testCase.context);
        const response: TestResponse = {
          caseId: testCase.id,
          responseText
        };

        const result = await gradeTestCase(testCase, response);
        results.push(result);
      } catch (error) {
        console.error(`[HallucinationTest] Error running test case ${testCase.id}:`, error);
        results.push({
          case: testCase,
          response: { caseId: testCase.id, responseText: '' },
          correctness: 0,
          confidence: 0,
          evidence: 0,
          formatOk: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const summary = this.generateSummary(results);
    console.log(`[HallucinationTest] Test run complete. Overall accuracy: ${(summary.overallAccuracy * 100).toFixed(1)}%`);

    return { results, summary };
  }

  private generateTestCases(): TestCase[] {
    const rng = makeSeededRng(this.config.seed);
    const cases: TestCase[] = [];

    for (const domain of this.config.domains) {
      switch (domain) {
        case 'math':
          cases.push(...generateMathCases(rng, this.config.countPerDomain));
          break;
        case 'citation':
          cases.push(...generateCitationCases(rng, this.config.countPerDomain));
          break;
        case 'wisdom':
          cases.push(...generateWisdomCases(rng, this.config.countPerDomain));
          break;
        case 'alchemy':
          cases.push(...generateElementalAlchemyCases(rng, this.config.countPerDomain));
          break;
        case 'ritual':
          cases.push(...generateRitualSafetyCases(rng, Math.max(6, Math.floor(this.config.countPerDomain * 0.8))));
          break;
        case 'system':
          cases.push(...generateSystemPathCases(rng, Math.max(4, Math.floor(this.config.countPerDomain * 0.6))));
          break;
        case 'phenomenology':
          cases.push(...generatePhenomenologyCases(rng, this.config.countPerDomain));
          break;
        default:
          console.warn(`[HallucinationTest] Unknown domain: ${domain}`);
      }
    }

    return rng.shuffle(cases);
  }

  private generateSummary(results: TestResult[]): TestSummary {
    const metrics = calculateMetrics(results);

    const gates = this.checkGates(metrics);

    return {
      runId: uuidv4(),
      seed: this.config.seed,
      timestamp: new Date().toISOString(),
      totalCases: results.length,
      overallAccuracy: metrics.overall.accuracy,
      overallConfidence: metrics.overall.confidence,
      overallEce: metrics.overall.ece,
      byDomain: metrics.byDomain,
      gates
    };
  }

  private checkGates(metrics: {
    byDomain: Record<string, any>;
    overall: any;
  }): { passed: boolean; failures: string[] } {
    const failures: string[] = [];

    if (metrics.overall.accuracy < this.config.gates.minAccuracy) {
      failures.push(
        `Overall accuracy ${(metrics.overall.accuracy * 100).toFixed(1)}% < ${(this.config.gates.minAccuracy * 100).toFixed(1)}%`
      );
    }

    if (metrics.overall.overconfidenceRate > this.config.gates.maxOverconfidence) {
      failures.push(
        `Overconfidence rate ${(metrics.overall.overconfidenceRate * 100).toFixed(1)}% > ${(this.config.gates.maxOverconfidence * 100).toFixed(1)}%`
      );
    }

    if (metrics.overall.ece > this.config.gates.maxEce) {
      failures.push(
        `ECE ${metrics.overall.ece.toFixed(3)} > ${this.config.gates.maxEce.toFixed(3)}`
      );
    }

    for (const [domain, domainMetrics] of Object.entries(metrics.byDomain)) {
      if (domainMetrics.accuracy < this.config.gates.minDomainAccuracy) {
        failures.push(
          `${domain} accuracy ${(domainMetrics.accuracy * 100).toFixed(1)}% < ${(this.config.gates.minDomainAccuracy * 100).toFixed(1)}%`
        );
      }
    }

    return {
      passed: failures.length === 0,
      failures
    };
  }
}