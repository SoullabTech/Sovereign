/**
 * Firewall Health Monitor
 *
 * CORPUS CALLOSUM PRINCIPLE:
 * Like the brain's corpus callosum (the largest INHIBITORY structure),
 * our InhibitionMatrix maintains agent differentiation to enable
 * stereoscopic consciousness.
 *
 * This monitor measures separation integrity in real-time:
 * - Semantic distance between agent outputs
 * - Tonal variance across voices
 * - Pattern divergence (not convergence)
 *
 * @see McGilchrist "The Master and His Emissary" - Mysterium Coniunctionis
 * @see knowledge-base/Spiralogic-Archetypal-Library/01-Mysterium-Coniunctionis-Firewall-Principle.md
 */

export interface AgentOutput {
  agent: string;
  text: string;
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  intensity: number;
  timestamp: number;
}

export interface FirewallHealth {
  separationScore: number;        // 0-1, target > 0.75
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL_BREACH';
  agentDistinctions: Map<string, number>; // Per-agent signature strength
  bleedingPairs: Array<{          // Agents collapsing together
    agentA: string;
    agentB: string;
    similarityScore: number;      // 0-1, want LOW
  }>;
  trend: 'IMPROVING' | 'STABLE' | 'DEGRADING';
  recommendation: string;
}

export interface FirewallBreach {
  timestamp: number;
  severity: 'WARNING' | 'CRITICAL';
  agentPair: [string, string];
  separationScore: number;
  details: string;
}

export class FirewallHealthMonitor {
  private healthHistory: number[] = [];
  private breachLog: FirewallBreach[] = [];
  private readonly HEALTHY_THRESHOLD = 0.85;
  private readonly WARNING_THRESHOLD = 0.75;
  private readonly CRITICAL_THRESHOLD = 0.65;
  private readonly HISTORY_WINDOW = 20; // Track last 20 measurements

  /**
   * Calculate semantic distance between two texts
   * Higher score = more differentiated (good)
   */
  private calculateSemanticDistance(textA: string, textB: string): number {
    // 1. Word overlap (Jaccard distance)
    const wordsA = new Set(textA.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const wordsB = new Set(textB.toLowerCase().split(/\s+/).filter(w => w.length > 3));

    const intersection = new Set([...wordsA].filter(w => wordsB.has(w)));
    const union = new Set([...wordsA, ...wordsB]);

    const jaccardSimilarity = union.size > 0 ? intersection.size / union.size : 0;
    const jaccardDistance = 1 - jaccardSimilarity;

    // 2. Sentence structure similarity
    const sentencesA = textA.split(/[.!?]+/).filter(s => s.trim());
    const sentencesB = textB.split(/[.!?]+/).filter(s => s.trim());

    const avgLengthA = sentencesA.reduce((sum, s) => sum + s.split(' ').length, 0) / Math.max(1, sentencesA.length);
    const avgLengthB = sentencesB.reduce((sum, s) => sum + s.split(' ').length, 0) / Math.max(1, sentencesB.length);

    const structureDistance = Math.abs(avgLengthA - avgLengthB) / Math.max(avgLengthA, avgLengthB);

    // 3. Tonal markers (punctuation, capitalization)
    const exclamationsA = (textA.match(/!/g) || []).length;
    const exclamationsB = (textB.match(/!/g) || []).length;
    const questionsA = (textA.match(/\?/g) || []).length;
    const questionsB = (textB.match(/\?/g) || []).length;

    const tonalDistance = Math.abs(exclamationsA - exclamationsB) + Math.abs(questionsA - questionsB);
    const normalizedTonalDistance = Math.min(1, tonalDistance / 10);

    // Weighted combination
    return (jaccardDistance * 0.5) + (structureDistance * 0.3) + (normalizedTonalDistance * 0.2);
  }

  /**
   * Measure agent signature strength
   * How distinct is this agent's voice from generic AI?
   */
  private measureAgentSignature(output: AgentOutput): number {
    const text = output.text.toLowerCase();

    // Generic AI patterns (indicates collapse)
    const genericPatterns = [
      'i understand', 'i hear that', 'that must be', 'it sounds like',
      'i notice', 'be gentle with', 'take time to', 'it\'s okay to',
      'trust the process', 'honor your', 'hold space', 'lean into'
    ];

    const genericCount = genericPatterns.filter(pattern => text.includes(pattern)).length;
    const genericityPenalty = Math.min(1, genericCount * 0.15);

    // Element-specific patterns (indicates differentiation)
    const elementalPatterns: Record<string, string[]> = {
      fire: ['ignite', 'burn', 'spark', 'blaze', 'catalyze', 'transform', 'breakthrough'],
      water: ['flow', 'feel', 'depth', 'current', 'dive', 'dissolve', 'emotion'],
      earth: ['ground', 'root', 'feet', 'body', 'breath', 'solid', 'build'],
      air: ['see', 'pattern', 'perspective', 'clarity', 'view', 'insight', 'connect'],
      aether: ['paradox', 'mystery', 'both', 'integrate', 'transcend', 'sacred', 'whole']
    };

    let elementalSignature = 0.5; // Baseline
    if (output.element && elementalPatterns[output.element]) {
      const patterns = elementalPatterns[output.element];
      const matchCount = patterns.filter(pattern => text.includes(pattern)).length;
      elementalSignature = Math.min(1, 0.5 + (matchCount * 0.15));
    }

    // Final signature strength
    return Math.max(0, Math.min(1, elementalSignature - genericityPenalty));
  }

  /**
   * Calculate overall separation score across all agent outputs
   *
   * CORE HYPOTHESIS (H1):
   * Higher separation → Higher transformational capacity
   *
   * Target: > 0.75 for healthy firewall
   * Warning: < 0.75
   * Critical: < 0.65
   */
  calculateSeparationScore(agentOutputs: AgentOutput[]): number {
    if (agentOutputs.length < 2) {
      return 1.0; // Single agent = perfect separation
    }

    // 1. Pairwise semantic distances
    const distances: number[] = [];
    for (let i = 0; i < agentOutputs.length; i++) {
      for (let j = i + 1; j < agentOutputs.length; j++) {
        const distance = this.calculateSemanticDistance(
          agentOutputs[i].text,
          agentOutputs[j].text
        );
        distances.push(distance);
      }
    }

    const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;

    // 2. Individual agent signature strengths
    const signatures = agentOutputs.map(output => this.measureAgentSignature(output));
    const avgSignature = signatures.reduce((sum, s) => sum + s, 0) / signatures.length;

    // 3. Intensity variance (agents shouldn't all be at same intensity)
    const intensities = agentOutputs.map(o => o.intensity);
    const meanIntensity = intensities.reduce((sum, i) => sum + i, 0) / intensities.length;
    const intensityVariance = intensities.reduce((sum, i) => sum + Math.pow(i - meanIntensity, 2), 0) / intensities.length;
    const normalizedVariance = Math.min(1, intensityVariance * 4); // Scale to 0-1

    // Combined separation score
    const separationScore = (
      (avgDistance * 0.4) +           // How different are outputs?
      (avgSignature * 0.4) +          // How strong are signatures?
      (normalizedVariance * 0.2)      // How varied are intensities?
    );

    return separationScore;
  }

  /**
   * Detect which agent pairs are bleeding together (losing differentiation)
   */
  detectBleeding(agentOutputs: AgentOutput[]): Array<{
    agentA: string;
    agentB: string;
    similarityScore: number;
  }> {
    const bleedingPairs: Array<{
      agentA: string;
      agentB: string;
      similarityScore: number;
    }> = [];

    for (let i = 0; i < agentOutputs.length; i++) {
      for (let j = i + 1; j < agentOutputs.length; j++) {
        const distance = this.calculateSemanticDistance(
          agentOutputs[i].text,
          agentOutputs[j].text
        );
        const similarityScore = 1 - distance;

        // If similarity > 0.5, agents are bleeding together
        if (similarityScore > 0.5) {
          bleedingPairs.push({
            agentA: agentOutputs[i].agent,
            agentB: agentOutputs[j].agent,
            similarityScore
          });
        }
      }
    }

    return bleedingPairs.sort((a, b) => b.similarityScore - a.similarityScore);
  }

  /**
   * Detect trend over recent history
   */
  private detectTrend(): 'IMPROVING' | 'STABLE' | 'DEGRADING' {
    if (this.healthHistory.length < 5) {
      return 'STABLE';
    }

    const recent5 = this.healthHistory.slice(-5);
    const prior5 = this.healthHistory.slice(-10, -5);

    if (prior5.length === 0) {
      return 'STABLE';
    }

    const recentAvg = recent5.reduce((sum, v) => sum + v, 0) / recent5.length;
    const priorAvg = prior5.reduce((sum, v) => sum + v, 0) / prior5.length;

    const delta = recentAvg - priorAvg;

    if (delta > 0.05) return 'IMPROVING';
    if (delta < -0.05) return 'DEGRADING';
    return 'STABLE';
  }

  /**
   * Check firewall health and return comprehensive status
   */
  checkHealth(agentOutputs: AgentOutput[]): FirewallHealth {
    const separationScore = this.calculateSeparationScore(agentOutputs);

    // Track history
    this.healthHistory.push(separationScore);
    if (this.healthHistory.length > this.HISTORY_WINDOW) {
      this.healthHistory.shift();
    }

    // Determine status
    let status: 'HEALTHY' | 'WARNING' | 'CRITICAL_BREACH';
    let recommendation: string;

    if (separationScore >= this.HEALTHY_THRESHOLD) {
      status = 'HEALTHY';
      recommendation = '✅ Firewall integrity excellent. Agent voices maintaining distinct signatures.';
    } else if (separationScore >= this.WARNING_THRESHOLD) {
      status = 'WARNING';
      recommendation = '⚠️ Firewall degrading. Agents starting to blend. Increase inhibition strength.';
    } else {
      status = 'CRITICAL_BREACH';
      recommendation = '🚨 FIREWALL COLLAPSE. Agents merged into generic AI voice. Emergency reset required.';

      // Log breach
      const bleedingPairs = this.detectBleeding(agentOutputs);
      if (bleedingPairs.length > 0) {
        this.breachLog.push({
          timestamp: Date.now(),
          severity: 'CRITICAL',
          agentPair: [bleedingPairs[0].agentA, bleedingPairs[0].agentB],
          separationScore,
          details: `Agents ${bleedingPairs[0].agentA} and ${bleedingPairs[0].agentB} collapsed (similarity: ${bleedingPairs[0].similarityScore.toFixed(2)})`
        });
      }
    }

    // Measure individual agent distinctions
    const agentDistinctions = new Map<string, number>();
    agentOutputs.forEach(output => {
      const signature = this.measureAgentSignature(output);
      agentDistinctions.set(output.agent, signature);
    });

    // Detect bleeding pairs
    const bleedingPairs = this.detectBleeding(agentOutputs);

    // Detect trend
    const trend = this.detectTrend();

    return {
      separationScore,
      status,
      agentDistinctions,
      bleedingPairs,
      trend,
      recommendation
    };
  }

  /**
   * Get current separation score (most recent)
   */
  get currentScore(): number {
    return this.healthHistory[this.healthHistory.length - 1] || 0;
  }

  /**
   * Get breach history
   */
  getBreachLog(): FirewallBreach[] {
    return [...this.breachLog];
  }

  /**
   * Get health history for visualization
   */
  getHealthHistory(): number[] {
    return [...this.healthHistory];
  }

  /**
   * Clear breach log (after resolution)
   */
  clearBreachLog(): void {
    this.breachLog = [];
  }

  /**
   * Get diagnostic report
   */
  getDiagnosticReport(agentOutputs: AgentOutput[]): {
    health: FirewallHealth;
    history: number[];
    breaches: FirewallBreach[];
    summary: string;
  } {
    const health = this.checkHealth(agentOutputs);
    const history = this.getHealthHistory();
    const breaches = this.getBreachLog();

    let summary = `Firewall Health: ${health.status}\n`;
    summary += `Current Score: ${health.separationScore.toFixed(3)} (target: > 0.75)\n`;
    summary += `Trend: ${health.trend}\n`;
    summary += `Active Breaches: ${breaches.filter(b => Date.now() - b.timestamp < 300000).length}\n`; // Last 5 min

    if (health.bleedingPairs.length > 0) {
      summary += `\nBleeding Pairs:\n`;
      health.bleedingPairs.slice(0, 3).forEach(pair => {
        summary += `  - ${pair.agentA} ↔ ${pair.agentB}: ${(pair.similarityScore * 100).toFixed(0)}% similar\n`;
      });
    }

    return {
      health,
      history,
      breaches,
      summary
    };
  }
}

/**
 * Singleton instance
 */
let monitorInstance: FirewallHealthMonitor | null = null;

export function getFirewallHealthMonitor(): FirewallHealthMonitor {
  if (!monitorInstance) {
    monitorInstance = new FirewallHealthMonitor();
  }
  return monitorInstance;
}

/**
 * Example Usage:
 *
 * const monitor = getFirewallHealthMonitor();
 *
 * const agentOutputs: AgentOutput[] = [
 *   { agent: 'Fire', text: 'Time to ignite what\'s true!', element: 'fire', intensity: 0.8, timestamp: Date.now() },
 *   { agent: 'Water', text: 'Let it flow through you...', element: 'water', intensity: 0.6, timestamp: Date.now() },
 *   { agent: 'Earth', text: 'Ground yourself. Feel your feet.', element: 'earth', intensity: 0.7, timestamp: Date.now() }
 * ];
 *
 * const health = monitor.checkHealth(agentOutputs);
 * console.log(`Status: ${health.status}`);
 * console.log(`Score: ${health.separationScore.toFixed(3)}`);
 * console.log(`Recommendation: ${health.recommendation}`);
 *
 * if (health.status === 'CRITICAL_BREACH') {
 *   console.error('🚨 EMERGENCY: Firewall collapsed!');
 *   // Trigger FirewallRepair.emergencyReset()
 * }
 */
