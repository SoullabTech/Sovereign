/**
 * Automated Test Runner for Looping Protocol
 * Executes both scripted and live sandbox testing modes
 */

import { LoopingTestHarness, MEDIUM_STAKES_SCENARIOS } from './LoopingTestHarness';
import { BoundaryTestRunner, BOUNDARY_TEST_CASES, SEMANTIC_EQUIVALENTS } from './LoopingBoundaryTests';
import { loopingMonitor } from '../LoopingMonitor';
import { ElementalArchetype } from '../../../../web/lib/types/elemental';

export interface TestMode {
  type: 'scripted' | 'sandbox' | 'automated' | 'live';
  description: string;
}

export interface TestSession {
  id: string;
  mode: TestMode;
  startTime: Date;
  endTime?: Date;
  results: any;
  metrics: TestMetrics;
}

export interface TestMetrics {
  totalTests: number;
  passed: number;
  failed: number;
  avgConvergence: number;
  avgLoops: number;
  falsePositives: number;
  falseNegatives: number;
  oscillations: number;
  timeToConvergence: number[]; // milliseconds per convergence
}

/**
 * Main test runner orchestrating all test types
 */
export class LoopingTestRunner {
  private harness: LoopingTestHarness;
  private boundaryRunner: BoundaryTestRunner;
  private sessions: TestSession[] = [];
  private currentSession?: TestSession;

  constructor() {
    this.harness = new LoopingTestHarness();
    this.boundaryRunner = new BoundaryTestRunner();
  }

  /**
   * Run complete test suite
   */
  async runFullSuite(): Promise<{
    summary: any;
    scripted: any;
    boundaries: any;
    semantics: any;
    recommendations: string[];
  }> {
    console.log('🔄 Starting Looping Protocol Test Suite...\n');

    // Start test session
    this.startSession('automated');

    // Run scripted scenarios
    console.log('📝 Running scripted medium-stakes scenarios...');
    const scriptedResults = await this.runScriptedTests();

    // Run boundary tests
    console.log('\n🔍 Testing activation boundaries...');
    const boundaryResults = await this.runBoundaryTests();

    // Run semantic consistency tests
    console.log('\n🔤 Testing semantic equivalents...');
    const semanticResults = await this.runSemanticTests();

    // Generate comprehensive report
    const summary = this.generateSummary(scriptedResults, boundaryResults, semanticResults);
    const recommendations = this.generateRecommendations(summary);

    // End session
    this.endSession({ scriptedResults, boundaryResults, semanticResults });

    console.log('\n✅ Test suite complete!\n');
    this.printSummary(summary);

    return {
      summary,
      scripted: scriptedResults,
      boundaries: boundaryResults,
      semantics: semanticResults,
      recommendations
    };
  }

  /**
   * Run scripted test scenarios
   */
  async runScriptedTests(): Promise<any> {
    const results = await this.harness.runAllScenarios();

    // Print results
    console.log(`  ✓ Scenarios tested: ${results.results.length}`);
    console.log(`  ✓ Pass rate: ${(results.summary.passRate * 100).toFixed(1)}%`);
    console.log(`  ✓ Avg convergence: ${(results.summary.avgConvergence * 100).toFixed(1)}%`);
    console.log(`  ✓ Avg loops: ${results.summary.avgLoops.toFixed(1)}`);

    return results;
  }

  /**
   * Run boundary activation tests
   */
  async runBoundaryTests(): Promise<any> {
    const results = [];

    for (const testCase of BOUNDARY_TEST_CASES) {
      const result = await this.boundaryRunner.testBoundaryCase(testCase);
      results.push({
        testCase: testCase.id,
        category: testCase.category,
        passed: result.passed,
        issues: result.issues
      });
    }

    const passRate = results.filter(r => r.passed).length / results.length;

    console.log(`  ✓ Boundary cases tested: ${results.length}`);
    console.log(`  ✓ Pass rate: ${(passRate * 100).toFixed(1)}%`);
    console.log(`  ✓ Should-loop accuracy: ${this.calculateCategoryAccuracy(results, 'should_loop')}%`);
    console.log(`  ✓ Should-not-loop accuracy: ${this.calculateCategoryAccuracy(results, 'should_not_loop')}%`);

    return results;
  }

  /**
   * Run semantic consistency tests
   */
  async runSemanticTests(): Promise<any> {
    const results = [];

    for (const [groupName, group] of Object.entries(SEMANTIC_EQUIVALENTS)) {
      const result = await this.boundaryRunner.testSemanticConsistency(
        groupName,
        [group.core, ...group.variants]
      );

      results.push({
        group: groupName,
        consistent: result.consistent,
        expectedBehavior: group.shouldLoop ? 'trigger' : 'no-trigger',
        variations: result.variations
      });
    }

    const consistencyRate = results.filter(r => r.consistent).length / results.length;

    console.log(`  ✓ Semantic groups tested: ${results.length}`);
    console.log(`  ✓ Consistency rate: ${(consistencyRate * 100).toFixed(1)}%`);

    return results;
  }

  /**
   * Run sandbox mode for live testing
   */
  async runSandboxMode(
    testerId: string,
    scenarios: string[] = ['pattern-recognition-1', 'creative-emptiness-1']
  ): Promise<void> {
    console.log(`\n🎮 SANDBOX MODE - Tester: ${testerId}\n`);
    console.log('Instructions:');
    console.log('- Respond naturally to Maya\'s checks');
    console.log('- Try corrections like "No, it\'s more like..."');
    console.log('- Test edge cases and unexpected responses\n');

    this.startSession('sandbox');

    for (const scenarioId of scenarios) {
      const scenario = MEDIUM_STAKES_SCENARIOS.find(s => s.id === scenarioId);
      if (!scenario) continue;

      console.log(`\n📋 Scenario: ${scenario.name}`);
      console.log(`Description: ${scenario.description}`);
      console.log(`Element: ${scenario.element}\n`);

      // This would integrate with actual interactive testing
      // For now, we simulate with the test harness
      const result = await this.harness.runScenario(scenario);

      console.log('\nTranscript:');
      result.transcript.forEach(turn => {
        console.log(`${turn.role.toUpperCase()}: ${turn.content}`);
      });

      console.log(`\nConvergence: ${(result.actualConvergence * 100).toFixed(1)}%`);
      console.log(`Loops: ${result.actualLoops}`);
    }

    this.endSession({});
  }

  /**
   * Live A/B testing mode
   */
  async runABTest(
    groupA: { threshold: number; intensity: string },
    groupB: { threshold: number; intensity: string },
    sampleSize: number = 100
  ): Promise<{
    groupA: TestMetrics;
    groupB: TestMetrics;
    winner: 'A' | 'B' | 'tie';
    confidence: number;
  }> {
    console.log(`\n🧪 A/B TEST MODE - Sample size: ${sampleSize}\n`);

    // This would integrate with actual user sessions
    // For now, we simulate with test scenarios

    const groupAMetrics = await this.simulateGroup('A', groupA, sampleSize / 2);
    const groupBMetrics = await this.simulateGroup('B', groupB, sampleSize / 2);

    // Determine winner based on key metrics
    const scoreA = this.calculateGroupScore(groupAMetrics);
    const scoreB = this.calculateGroupScore(groupBMetrics);

    const winner = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'tie';
    const confidence = Math.abs(scoreA - scoreB) / Math.max(scoreA, scoreB);

    return {
      groupA: groupAMetrics,
      groupB: groupBMetrics,
      winner,
      confidence
    };
  }

  // Helper methods

  private startSession(mode: TestMode['type']): void {
    this.currentSession = {
      id: `test-${Date.now()}`,
      mode: { type: mode, description: this.getModeDescription(mode) },
      startTime: new Date(),
      results: {},
      metrics: this.initializeMetrics()
    };
    this.sessions.push(this.currentSession);
  }

  private endSession(results: any): void {
    if (this.currentSession) {
      this.currentSession.endTime = new Date();
      this.currentSession.results = results;
    }
  }

  private getModeDescription(mode: TestMode['type']): string {
    const descriptions = {
      scripted: 'Pre-defined scenarios with expected outcomes',
      sandbox: 'Interactive testing with human testers',
      automated: 'Full automated test suite',
      live: 'Production environment with real users'
    };
    return descriptions[mode];
  }

  private initializeMetrics(): TestMetrics {
    return {
      totalTests: 0,
      passed: 0,
      failed: 0,
      avgConvergence: 0,
      avgLoops: 0,
      falsePositives: 0,
      falseNegatives: 0,
      oscillations: 0,
      timeToConvergence: []
    };
  }

  private calculateCategoryAccuracy(results: any[], category: string): string {
    const categoryResults = results.filter(r => r.category === category);
    if (categoryResults.length === 0) return '0';

    const passed = categoryResults.filter(r => r.passed).length;
    return ((passed / categoryResults.length) * 100).toFixed(1);
  }

  private async simulateGroup(
    groupName: string,
    config: any,
    sampleSize: number
  ): Promise<TestMetrics> {
    const metrics = this.initializeMetrics();

    // Simulate running tests with given configuration
    for (let i = 0; i < sampleSize; i++) {
      // Run random scenario with config
      const scenario = MEDIUM_STAKES_SCENARIOS[i % MEDIUM_STAKES_SCENARIOS.length];
      const result = await this.harness.runScenario(scenario);

      metrics.totalTests++;
      if (result.passed) metrics.passed++;
      else metrics.failed++;

      metrics.avgConvergence += result.actualConvergence;
      metrics.avgLoops += result.actualLoops;
    }

    metrics.avgConvergence /= sampleSize;
    metrics.avgLoops /= sampleSize;

    return metrics;
  }

  private calculateGroupScore(metrics: TestMetrics): number {
    // Weighted scoring: convergence > pass rate > efficiency
    return (
      metrics.avgConvergence * 0.4 +
      (metrics.passed / metrics.totalTests) * 0.3 +
      (1 - metrics.avgLoops / 5) * 0.3 // Fewer loops is better
    );
  }

  private generateSummary(scripted: any, boundaries: any, semantics: any): any {
    return {
      overall: {
        testsRun: scripted.results.length + boundaries.length + semantics.length,
        passRate: this.calculateOverallPassRate(scripted, boundaries, semantics),
        avgConvergence: scripted.summary.avgConvergence,
        avgLoops: scripted.summary.avgLoops
      },
      scripted: {
        passRate: scripted.summary.passRate,
        commonIssues: scripted.summary.commonIssues
      },
      boundaries: {
        accuracy: boundaries.filter((r: any) => r.passed).length / boundaries.length,
        problematicCases: boundaries.filter((r: any) => !r.passed).map((r: any) => r.testCase)
      },
      semantics: {
        consistency: semantics.filter((r: any) => r.consistent).length / semantics.length,
        inconsistentGroups: semantics.filter((r: any) => !r.consistent).map((r: any) => r.group)
      }
    };
  }

  private calculateOverallPassRate(scripted: any, boundaries: any, semantics: any): number {
    const scriptedPass = scripted.summary.passRate;
    const boundaryPass = boundaries.filter((r: any) => r.passed).length / boundaries.length;
    const semanticPass = semantics.filter((r: any) => r.consistent).length / semantics.length;

    return (scriptedPass + boundaryPass + semanticPass) / 3;
  }

  private generateRecommendations(summary: any): string[] {
    const recommendations: string[] = [];

    // Overall performance
    if (summary.overall.passRate < 0.7) {
      recommendations.push('⚠️ Critical: Overall pass rate below 70%. Review core protocol logic.');
    }

    // Convergence issues
    if (summary.overall.avgConvergence < 0.6) {
      recommendations.push('📉 Low convergence rate. Consider refining paraphrase templates.');
    }

    if (summary.overall.avgLoops > 2.5) {
      recommendations.push('🔄 High loop count. Increase convergence thresholds or improve checking questions.');
    }

    // Boundary issues
    if (summary.boundaries.accuracy < 0.8) {
      recommendations.push('🎯 Boundary detection needs improvement. Adjust activation triggers.');
    }

    // Semantic consistency
    if (summary.semantics.consistency < 0.9) {
      recommendations.push('🔤 Semantic inconsistency detected. Standardize pattern matching.');
    }

    // Specific improvements
    if (summary.boundaries.problematicCases.length > 0) {
      recommendations.push(`🔍 Review these boundary cases: ${summary.boundaries.problematicCases.join(', ')}`);
    }

    if (summary.semantics.inconsistentGroups.length > 0) {
      recommendations.push(`📝 Fix semantic groups: ${summary.semantics.inconsistentGroups.join(', ')}`);
    }

    return recommendations;
  }

  private printSummary(summary: any): void {
    console.log('═══════════════════════════════════════');
    console.log('         TEST SUITE SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`Overall Pass Rate: ${(summary.overall.passRate * 100).toFixed(1)}%`);
    console.log(`Average Convergence: ${(summary.overall.avgConvergence * 100).toFixed(1)}%`);
    console.log(`Average Loops: ${summary.overall.avgLoops.toFixed(1)}`);
    console.log('───────────────────────────────────────');
    console.log('Scripted Tests:', summary.scripted.passRate ? '✅' : '❌');
    console.log('Boundary Tests:', summary.boundaries.accuracy > 0.8 ? '✅' : '❌');
    console.log('Semantic Tests:', summary.semantics.consistency > 0.9 ? '✅' : '❌');
    console.log('═══════════════════════════════════════');
  }

  /**
   * Export all test data for analysis
   */
  exportTestData(): string {
    return JSON.stringify({
      sessions: this.sessions,
      timestamp: new Date().toISOString(),
      monitoringData: loopingMonitor.exportMetrics()
    }, null, 2);
  }
}

// Export singleton instance
export const testRunner = new LoopingTestRunner();