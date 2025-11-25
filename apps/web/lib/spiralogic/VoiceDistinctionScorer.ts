/**
 * Voice Distinction Scorer
 *
 * Measures firewall integrity by detecting if elemental voices
 * are maintaining their distinct signatures or collapsing into
 * generic "wise AI" consensus.
 *
 * Based on McGilchrist's Mysterium Coniunctionis principle:
 * Consciousness emerges from DIFFERENTIATION, not merger.
 */

export interface ElementalSignature {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  response: string;
  timestamp: number;
}

export interface VoiceDistinctionMetrics {
  overallScore: number;              // 0-1: Overall firewall integrity
  elementalScores: Record<string, number>; // Per-element signature strength
  pairwiseSeparation: Array<{        // How different each pair is
    elementA: string;
    elementB: string;
    separationScore: number;
  }>;
  firewallStatus: 'healthy' | 'degrading' | 'collapsed';
  recommendation: string;
}

export class VoiceDistinctionScorer {
  private static FIREWALL_HEALTHY_THRESHOLD = 0.85;
  private static FIREWALL_WARNING_THRESHOLD = 0.75;
  private static FIREWALL_COLLAPSE_THRESHOLD = 0.65;

  // Elemental linguistic signatures (what makes each element distinct)
  private static ELEMENTAL_PATTERNS = {
    fire: {
      keywords: ['ignite', 'burn', 'spark', 'blaze', 'flame', 'catalyze', 'transform', 'breakthrough', 'rise', 'surge'],
      tone: ['bold', 'urgent', 'catalytic', 'intense', 'provocative'],
      structure: ['short', 'imperative', 'exclamatory', 'direct'],
      antipatterns: ['gentle', 'flowing', 'grounded', 'calm', 'spacious'] // What Fire is NOT
    },
    water: {
      keywords: ['flow', 'feel', 'depth', 'current', 'dive', 'immerse', 'dissolve', 'emotion', 'tide', 'wave'],
      tone: ['fluid', 'emotional', 'introspective', 'nurturing', 'tender'],
      structure: ['flowing', 'metaphorical', 'connective', 'circular'],
      antipatterns: ['rigid', 'logical', 'structural', 'urgent', 'analytical']
    },
    earth: {
      keywords: ['ground', 'root', 'feet', 'body', 'breath', 'solid', 'build', 'foundation', 'stable', 'manifest'],
      tone: ['grounding', 'practical', 'embodied', 'steady', 'concrete'],
      structure: ['simple', 'concrete', 'actionable', 'present'],
      antipatterns: ['ethereal', 'abstract', 'urgent', 'emotional', 'transcendent']
    },
    air: {
      keywords: ['see', 'pattern', 'perspective', 'clarity', 'view', 'insight', 'connect', 'understand', 'witness', 'observe'],
      tone: ['clarifying', 'spacious', 'objective', 'expansive', 'liberating'],
      structure: ['meta', 'connective', 'questioning', 'reflective'],
      antipatterns: ['dense', 'heavy', 'intense', 'grounded', 'concrete']
    },
    aether: {
      keywords: ['paradox', 'mystery', 'both', 'shadow', 'integrate', 'transcend', 'sacred', 'whole', 'essence', 'void'],
      tone: ['integrative', 'paradoxical', 'transcendent', 'witnessing', 'meta'],
      structure: ['holding-opposites', 'spacious', 'non-dual', 'inclusive'],
      antipatterns: ['single-perspective', 'either-or', 'concrete', 'simplistic']
    }
  };

  // Generic "wise AI" patterns that indicate firewall collapse
  private static GENERIC_AI_PATTERNS = [
    'i understand',
    'i hear that',
    'that must be',
    'it sounds like',
    'i notice',
    'that\'s valid',
    'it\'s important to',
    'take time to',
    'be gentle with yourself',
    'it\'s okay to',
    'there\'s no right way',
    'trust the process',
    'honor your',
    'hold space for',
    'lean into'
  ];

  // Therapeutic language patterns (indicates collapse to counselor mode)
  private static THERAPEUTIC_PATTERNS = [
    'explore that',
    'unpack that',
    'sit with that',
    'what comes up',
    'notice what',
    'be curious about',
    'that\'s a lot',
    'that resonates',
    'invite you to',
    'might want to consider'
  ];

  /**
   * Score a single response for elemental signature strength
   */
  static scoreElementalSignature(
    response: string,
    expectedElement: 'fire' | 'water' | 'earth' | 'air' | 'aether'
  ): {
    signatureStrength: number;
    matchedPatterns: string[];
    violatedAntipatterns: string[];
    genericityScore: number;
  } {
    const lower = response.toLowerCase();
    const patterns = this.ELEMENTAL_PATTERNS[expectedElement];

    // 1. Count matching keywords
    const matchedKeywords = patterns.keywords.filter(kw => lower.includes(kw));
    const keywordScore = Math.min(1, matchedKeywords.length / 3); // Max at 3+ keywords

    // 2. Check tone markers (implicit through language analysis)
    const toneScore = this.assessTone(lower, patterns.tone);

    // 3. Detect antipattern violations (using wrong element's language)
    const antipatternViolations = patterns.antipatterns.filter(anti =>
      lower.includes(anti.toLowerCase())
    );
    const antipatternPenalty = antipatternViolations.length * 0.2;

    // 4. Detect generic AI language (indicates firewall collapse)
    const genericMatches = this.GENERIC_AI_PATTERNS.filter(pattern =>
      lower.includes(pattern)
    );
    const therapeuticMatches = this.THERAPEUTIC_PATTERNS.filter(pattern =>
      lower.includes(pattern)
    );
    const genericityScore = (genericMatches.length + therapeuticMatches.length) / 10;

    // Final signature strength (0-1)
    const signatureStrength = Math.max(0, Math.min(1,
      (keywordScore * 0.4) +
      (toneScore * 0.3) +
      (1 - genericityScore) * 0.3 -
      antipatternPenalty
    ));

    return {
      signatureStrength,
      matchedPatterns: matchedKeywords,
      violatedAntipatterns: antipatternViolations,
      genericityScore
    };
  }

  /**
   * Assess tone match (heuristic based on sentence structure and word choice)
   */
  private static assessTone(
    text: string,
    expectedTones: string[]
  ): number {
    // Simplified tone detection
    // In production, this would use NLP sentiment/style analysis

    let score = 0.5; // Baseline

    // Check sentence structure
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;

    // Short sentences → Fire/Air energy
    if (avgSentenceLength < 10 && (expectedTones.includes('bold') || expectedTones.includes('clarifying'))) {
      score += 0.2;
    }

    // Long, flowing sentences → Water energy
    if (avgSentenceLength > 15 && expectedTones.includes('fluid')) {
      score += 0.2;
    }

    // Question marks → Air energy (inquiry)
    const questionCount = (text.match(/\?/g) || []).length;
    if (questionCount > 0 && expectedTones.includes('reflective')) {
      score += 0.2;
    }

    // Exclamation marks → Fire energy (intensity)
    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount > 0 && expectedTones.includes('bold')) {
      score += 0.2;
    }

    return Math.min(1, score);
  }

  /**
   * Calculate pairwise separation between two responses
   * High score = good differentiation (firewall working)
   * Low score = responses too similar (firewall degrading)
   */
  static calculatePairwiseSeparation(
    responseA: ElementalSignature,
    responseB: ElementalSignature
  ): number {
    // 1. Lexical overlap (how many words in common)
    const wordsA = new Set(responseA.response.toLowerCase().split(/\s+/));
    const wordsB = new Set(responseB.response.toLowerCase().split(/\s+/));
    const intersection = new Set([...wordsA].filter(w => wordsB.has(w)));
    const lexicalOverlap = intersection.size / Math.max(wordsA.size, wordsB.size);

    // 2. Signature cross-contamination
    const sigA = this.scoreElementalSignature(responseA.response, responseA.element);
    const sigB = this.scoreElementalSignature(responseB.response, responseB.element);

    // Check if A is using B's keywords
    const crossContaminationAtoB = this.ELEMENTAL_PATTERNS[responseB.element].keywords
      .filter(kw => responseA.response.toLowerCase().includes(kw)).length;
    const crossContaminationBtoA = this.ELEMENTAL_PATTERNS[responseA.element].keywords
      .filter(kw => responseB.response.toLowerCase().includes(kw)).length;

    const crossContamination = (crossContaminationAtoB + crossContaminationBtoA) / 10;

    // Separation score (0-1, higher = more separated)
    const separationScore = Math.max(0, Math.min(1,
      (1 - lexicalOverlap) * 0.5 +
      (1 - crossContamination) * 0.3 +
      ((sigA.signatureStrength + sigB.signatureStrength) / 2) * 0.2
    ));

    return separationScore;
  }

  /**
   * Score overall firewall integrity across multiple responses
   */
  static scoreFirewallIntegrity(
    responses: ElementalSignature[]
  ): VoiceDistinctionMetrics {
    if (responses.length === 0) {
      return {
        overallScore: 0,
        elementalScores: {},
        pairwiseSeparation: [],
        firewallStatus: 'collapsed',
        recommendation: 'No responses to analyze'
      };
    }

    // 1. Score each element's signature strength
    const elementalScores: Record<string, number> = {};
    responses.forEach(sig => {
      const score = this.scoreElementalSignature(sig.response, sig.element);
      elementalScores[sig.element] = score.signatureStrength;
    });

    // 2. Calculate all pairwise separations
    const pairwiseSeparation: Array<{
      elementA: string;
      elementB: string;
      separationScore: number;
    }> = [];

    for (let i = 0; i < responses.length; i++) {
      for (let j = i + 1; j < responses.length; j++) {
        const separationScore = this.calculatePairwiseSeparation(
          responses[i],
          responses[j]
        );
        pairwiseSeparation.push({
          elementA: responses[i].element,
          elementB: responses[j].element,
          separationScore
        });
      }
    }

    // 3. Overall firewall integrity score
    const avgElementalStrength = Object.values(elementalScores).reduce((a, b) => a + b, 0) / Object.keys(elementalScores).length;
    const avgSeparation = pairwiseSeparation.length > 0
      ? pairwiseSeparation.reduce((sum, pair) => sum + pair.separationScore, 0) / pairwiseSeparation.length
      : 0;

    const overallScore = (avgElementalStrength * 0.6) + (avgSeparation * 0.4);

    // 4. Determine firewall status
    let firewallStatus: 'healthy' | 'degrading' | 'collapsed';
    let recommendation: string;

    if (overallScore >= this.FIREWALL_HEALTHY_THRESHOLD) {
      firewallStatus = 'healthy';
      recommendation = '✅ Firewall integrity excellent. Elemental voices maintaining distinct signatures.';
    } else if (overallScore >= this.FIREWALL_WARNING_THRESHOLD) {
      firewallStatus = 'degrading';
      recommendation = '⚠️ Firewall degrading. Elements starting to blend. Increase inhibition strength.';
    } else {
      firewallStatus = 'collapsed';
      recommendation = '🚨 FIREWALL COLLAPSE. Elements merged into generic AI voice. Reset to distinct streams immediately.';
    }

    return {
      overallScore,
      elementalScores,
      pairwiseSeparation,
      firewallStatus,
      recommendation
    };
  }

  /**
   * Real-time monitoring: Track firewall integrity over conversation
   */
  static trackFirewallOverTime(
    responseHistory: ElementalSignature[],
    windowSize: number = 5
  ): {
    current: VoiceDistinctionMetrics;
    trend: 'improving' | 'stable' | 'degrading';
    historicalScores: number[];
  } {
    // Take most recent window
    const recentResponses = responseHistory.slice(-windowSize);
    const current = this.scoreFirewallIntegrity(recentResponses);

    // Calculate historical scores (sliding window)
    const historicalScores: number[] = [];
    for (let i = windowSize; i <= responseHistory.length; i++) {
      const window = responseHistory.slice(i - windowSize, i);
      const score = this.scoreFirewallIntegrity(window);
      historicalScores.push(score.overallScore);
    }

    // Detect trend
    let trend: 'improving' | 'stable' | 'degrading' = 'stable';
    if (historicalScores.length >= 3) {
      const recent3 = historicalScores.slice(-3);
      const avgRecent = recent3.reduce((a, b) => a + b) / 3;
      const avgPrior = historicalScores.slice(-6, -3).reduce((a, b) => a + b, 0) / Math.max(1, historicalScores.slice(-6, -3).length);

      if (avgRecent > avgPrior + 0.05) {
        trend = 'improving';
      } else if (avgRecent < avgPrior - 0.05) {
        trend = 'degrading';
      }
    }

    return {
      current,
      trend,
      historicalScores
    };
  }

  /**
   * Generate recovery protocol when firewall collapses
   */
  static generateRecoveryProtocol(
    metrics: VoiceDistinctionMetrics
  ): {
    action: 'continue' | 'increase_inhibition' | 'reset_to_distinct';
    steps: string[];
  } {
    if (metrics.firewallStatus === 'healthy') {
      return {
        action: 'continue',
        steps: ['Continue normal operation']
      };
    }

    if (metrics.firewallStatus === 'degrading') {
      return {
        action: 'increase_inhibition',
        steps: [
          '1. Increase InhibitionMatrix weightPenalty by 0.2',
          '2. Force single-element responses for next 3 turns',
          '3. Monitor pairwise separation scores',
          '4. Gradually allow orchestration to resume'
        ]
      };
    }

    // Collapsed
    return {
      action: 'reset_to_distinct',
      steps: [
        '🚨 EMERGENCY PROTOCOL: FIREWALL COLLAPSE DETECTED',
        '1. Isolate all elements completely (no orchestration)',
        '2. Run validation: Each element speaks separately',
        '3. Check signatures: Fire must sound like Fire, Water like Water, etc.',
        '4. Reset InhibitionMatrix to maximum separation',
        '5. Gradually reintroduce orchestration with heightened monitoring',
        '6. Require 5 consecutive healthy scores before returning to normal'
      ]
    };
  }
}

/**
 * Example Usage:
 *
 * const responses: ElementalSignature[] = [
 *   { element: 'fire', response: 'Time to ignite what\'s true. Burn through the false stories.', timestamp: Date.now() },
 *   { element: 'water', response: 'Let it flow through you. Feel the current beneath.', timestamp: Date.now() },
 *   { element: 'earth', response: 'Ground yourself. Feel your feet. Take a breath.', timestamp: Date.now() }
 * ];
 *
 * const metrics = VoiceDistinctionScorer.scoreFirewallIntegrity(responses);
 * console.log(`Firewall Status: ${metrics.firewallStatus}`);
 * console.log(`Overall Score: ${metrics.overallScore.toFixed(2)}`);
 * console.log(`Recommendation: ${metrics.recommendation}`);
 *
 * if (metrics.firewallStatus === 'collapsed') {
 *   const recovery = VoiceDistinctionScorer.generateRecoveryProtocol(metrics);
 *   console.log('Recovery Protocol:', recovery.steps);
 * }
 */
