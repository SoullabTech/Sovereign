/**
 * Hybrid A/B System - Build and Test Parallel to Current Maia
 * Launch ready for Monday with full testing
 */

import { MaiaWithClaudeWisdom } from './claude-wisdom-layer';
import { SesamePresenceLayer } from '../sesame/presence-layer-architecture';

/**
 * The A/B Testing Configuration
 */
export interface ABConfig {
  enabled: boolean;
  mode: 'current' | 'hybrid' | 'split';
  splitPercentage: number; // What % gets hybrid
  testUsers: string[]; // Specific users for testing
  launchDate: Date;
  metrics: {
    trackSimplicity: boolean;
    trackEngagement: boolean;
    trackSilenceComfort: boolean;
  };
}

/**
 * The Hybrid System - Ready to Test
 */
export class HybridMaiaSystem {
  private config: ABConfig;
  private hybrid: MaiaWithClaudeWisdom;
  private sesame: SesamePresenceLayer;
  private metrics: MetricsCollector;

  constructor() {
    this.config = {
      enabled: false, // Start disabled
      mode: 'current',
      splitPercentage: 0,
      testUsers: [], // Add test user IDs here
      launchDate: new Date('2024-12-02'), // Monday launch
      metrics: {
        trackSimplicity: true,
        trackEngagement: true,
        trackSilenceComfort: true
      }
    };

    this.hybrid = new MaiaWithClaudeWisdom();
    this.sesame = new SesamePresenceLayer();
    this.metrics = new MetricsCollector();
  }

  /**
   * Main entry point - routes to appropriate system
   */
  async respond(
    userInput: string,
    context: any,
    userId?: string
  ): Promise<{
    response: string | null;
    system: 'current' | 'hybrid';
    timing?: any;
  }> {
    // Check if we should use hybrid
    const useHybrid = this.shouldUseHybrid(userId);

    if (useHybrid) {
      // Use new hybrid system
      const result = await this.hybrid.respond(userInput, context);

      // Track metrics
      this.metrics.track('hybrid_response', {
        wordCount: result.response?.split(' ').length || 0,
        wasNull: result.response === null,
        timing: result.timing
      });

      return {
        response: result.response,
        system: 'hybrid',
        timing: result.timing
      };
    }

    // Use current system (will be replaced with actual current Maia call)
    return {
      response: await this.getCurrentMaiaResponse(userInput, context),
      system: 'current'
    };
  }

  /**
   * Determine if user should get hybrid system
   */
  private shouldUseHybrid(userId?: string): boolean {
    // Not enabled yet
    if (!this.config.enabled) return false;

    // Specific test users
    if (userId && this.config.testUsers.includes(userId)) {
      return true;
    }

    // Split testing
    if (this.config.mode === 'split') {
      return Math.random() < (this.config.splitPercentage / 100);
    }

    // Full hybrid mode
    return this.config.mode === 'hybrid';
  }

  /**
   * Placeholder for current Maia system
   */
  private async getCurrentMaiaResponse(input: string, context: any): Promise<string> {
    // This will call the existing Maia system
    // For now, return placeholder
    return "Current Maia response";
  }

  /**
   * Enable hybrid for testing
   */
  enableForTesting(userIds: string[]) {
    this.config.enabled = true;
    this.config.mode = 'split';
    this.config.testUsers = userIds;
    this.config.splitPercentage = 0; // Only specific users
    console.log('🧪 Hybrid system enabled for testing:', userIds);
  }

  /**
   * Gradual rollout control
   */
  setRolloutPercentage(percentage: number) {
    this.config.splitPercentage = percentage;
    this.config.mode = 'split';
    console.log(`📊 Hybrid rollout at ${percentage}%`);
  }

  /**
   * Full launch on Monday
   */
  launchHybrid() {
    const now = new Date();
    if (now >= this.config.launchDate) {
      this.config.enabled = true;
      this.config.mode = 'hybrid';
      this.config.splitPercentage = 100;
      console.log('🚀 HYBRID SYSTEM FULLY LAUNCHED');
      return true;
    }
    console.log('📅 Launch scheduled for Monday');
    return false;
  }

  /**
   * Get current metrics for comparison
   */
  getMetrics() {
    return this.metrics.getComparison();
  }
}

/**
 * Metrics Collection for A/B Testing
 */
class MetricsCollector {
  private data: {
    current: any[];
    hybrid: any[];
  } = {
    current: [],
    hybrid: []
  };

  track(event: string, data: any) {
    const entry = {
      event,
      timestamp: new Date(),
      ...data
    };

    if (data.system === 'hybrid') {
      this.data.hybrid.push(entry);
    } else {
      this.data.current.push(entry);
    }
  }

  getComparison() {
    return {
      current: {
        avgWordCount: this.averageWordCount(this.data.current),
        silenceRate: this.silenceRate(this.data.current),
        responses: this.data.current.length
      },
      hybrid: {
        avgWordCount: this.averageWordCount(this.data.hybrid),
        silenceRate: this.silenceRate(this.data.hybrid),
        responses: this.data.hybrid.length
      },
      improvement: {
        simplicityGain: this.calculateSimplicityGain(),
        presenceQuality: this.calculatePresenceQuality()
      }
    };
  }

  private averageWordCount(data: any[]): number {
    if (data.length === 0) return 0;
    const total = data.reduce((sum, d) => sum + (d.wordCount || 0), 0);
    return total / data.length;
  }

  private silenceRate(data: any[]): number {
    if (data.length === 0) return 0;
    const silences = data.filter(d => d.wasNull).length;
    return silences / data.length;
  }

  private calculateSimplicityGain(): number {
    const currentAvg = this.averageWordCount(this.data.current);
    const hybridAvg = this.averageWordCount(this.data.hybrid);

    if (currentAvg === 0) return 0;
    return ((currentAvg - hybridAvg) / currentAvg) * 100;
  }

  private calculatePresenceQuality(): number {
    // Measure quality of presence (lower word count + appropriate silence)
    const hybridSilence = this.silenceRate(this.data.hybrid);
    const hybridBrevity = 1 - (this.averageWordCount(this.data.hybrid) / 20);

    return (hybridSilence * 0.3 + hybridBrevity * 0.7) * 100;
  }
}

/**
 * Testing Interface - For Development
 */
export class HybridTester {
  private system: HybridMaiaSystem;

  constructor() {
    this.system = new HybridMaiaSystem();
  }

  /**
   * Test single interaction
   */
  async testResponse(input: string): Promise<{
    current: string | null;
    hybrid: string | null;
    comparison: any;
  }> {
    // Get both responses
    const currentResp = await this.system.respond(input, {}, 'test-current');

    // Force hybrid for comparison
    this.system.enableForTesting(['test-hybrid']);
    const hybridResp = await this.system.respond(input, {}, 'test-hybrid');

    return {
      current: currentResp.response,
      hybrid: hybridResp.response,
      comparison: {
        currentWords: currentResp.response?.split(' ').length || 0,
        hybridWords: hybridResp.response?.split(' ').length || 0,
        hybridTiming: hybridResp.timing
      }
    };
  }

  /**
   * Run test scenarios
   */
  async runTestSuite(): Promise<TestResults> {
    const scenarios = [
      "I can't do this anymore",
      "Everything's falling apart",
      "Tell me what to do",
      "I'm so confused",
      "Why does this keep happening?",
      "I feel lost",
      "Nothing makes sense",
      "I'm scared"
    ];

    const results: any[] = [];

    for (const input of scenarios) {
      const test = await this.testResponse(input);
      results.push({
        input,
        ...test
      });
    }

    return {
      scenarios: results,
      summary: this.summarizeResults(results),
      ready: this.assessReadiness(results)
    };
  }

  private summarizeResults(results: any[]): any {
    // Calculate average improvements
    return {
      avgWordReduction: this.calculateAvgWordReduction(results),
      silenceIncrease: this.calculateSilenceIncrease(results),
      simplicityScore: this.calculateSimplicityScore(results)
    };
  }

  private calculateAvgWordReduction(results: any[]): number {
    const reductions = results.map(r =>
      ((r.comparison.currentWords - r.comparison.hybridWords) / r.comparison.currentWords) * 100
    );
    return reductions.reduce((a, b) => a + b, 0) / reductions.length;
  }

  private calculateSilenceIncrease(results: any[]): number {
    const silences = results.filter(r => r.hybrid === null).length;
    return (silences / results.length) * 100;
  }

  private calculateSimplicityScore(results: any[]): number {
    // Score based on achieving "Her" qualities
    let score = 0;

    results.forEach(r => {
      // Points for brevity
      if (r.comparison.hybridWords <= 3) score += 2;
      else if (r.comparison.hybridWords <= 5) score += 1;

      // Points for appropriate silence
      if (r.hybrid === null && r.input.includes('scared')) score += 2;

      // Points for simple acknowledgment
      if (['Yeah.', 'Mm.', 'I know.'].includes(r.hybrid)) score += 1;
    });

    return (score / (results.length * 3)) * 100; // Normalize to 100
  }

  private assessReadiness(results: any[]): {
    ready: boolean;
    reasons: string[];
  } {
    const summary = this.summarizeResults(results);
    const reasons: string[] = [];
    let ready = true;

    if (summary.avgWordReduction < 50) {
      reasons.push('Word reduction not sufficient');
      ready = false;
    }

    if (summary.simplicityScore < 70) {
      reasons.push('Simplicity score too low');
      ready = false;
    }

    if (summary.silenceIncrease < 20) {
      reasons.push('Not enough comfortable silence');
      ready = false;
    }

    if (ready) {
      reasons.push('System achieves "Her" quality targets');
      reasons.push('Ready for Monday launch');
    }

    return { ready, reasons };
  }
}

/**
 * Test Results Interface
 */
interface TestResults {
  scenarios: any[];
  summary: {
    avgWordReduction: number;
    silenceIncrease: number;
    simplicityScore: number;
  };
  ready: {
    ready: boolean;
    reasons: string[];
  };
}

/**
 * Export for testing and launch
 */
export {
  HybridMaiaSystem,
  HybridTester,
  ABConfig,
  TestResults
};

export default HybridMaiaSystem;