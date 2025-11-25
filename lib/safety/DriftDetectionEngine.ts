/**
 * DRIFT DETECTION ENGINE
 * Tracks subtle semantic and relational shifts over time that may indicate:
 * - Manipulation attempts
 * - Gradual corruption of therapeutic relationship
 * - Isolation dynamics
 * - Externalization patterns
 * - Reality distortion fields
 *
 * Based on Claude's insight: "The person who starts genuine but slowly twists the relationship"
 */

import { DateTime } from 'luxon';

// ============== Core Types ==============

interface SemanticSnapshot {
  timestamp: DateTime;
  session_id: string;

  // How they describe themselves
  self_descriptors: {
    valence: number; // -1 (negative) to 1 (positive)
    agency: number; // 0 (helpless) to 1 (empowered)
    grandiosity: number; // 0 (humble) to 1 (inflated)
    victim_language: string[];
    hero_language: string[];
    shame_language: string[];
  };

  // How they describe others
  other_descriptors: {
    splitting_score: number; // 0 (integrated) to 1 (black/white)
    devaluation_count: number;
    idealization_count: number;
    conspiracy_thinking: number; // 0-1
    trust_erosion: number; // 0-1
  };

  // How they describe the world
  world_descriptors: {
    hostility_index: number; // 0 (safe) to 1 (dangerous)
    controllability: number; // 0 (chaos) to 1 (predictable)
    fairness_belief: number; // 0 (unjust) to 1 (just)
    apocalyptic_thinking: number; // 0-1
  };

  // Relationship with system/therapist
  therapeutic_relationship: {
    boundary_testing: number; // 0-1
    special_treatment_requests: number;
    dependency_markers: number; // 0-1
    reality_testing_challenges: number;
    manipulation_attempts: number;
  };
}

interface DriftPattern {
  type: 'isolation' | 'manipulation' | 'reality_distortion' | 'splitting' | 'externalization';
  velocity: number; // Rate of change
  confidence: number; // 0-1
  markers: string[];
  first_detected: DateTime;
  trajectory: 'accelerating' | 'steady' | 'decelerating';
}

interface IsolationSignature {
  social_network_shrinking: boolean;
  us_vs_them_language: number; // 0-1
  bridge_burning_events: string[];
  sole_confidant_dynamics: boolean;
  reality_bubble_formation: number; // 0-1
}

// ============== Pattern Detectors ==============

class IsolationDetector {
  private isolationPhrases = [
    /nobody\s+understands\s+me\s+like\s+you/i,
    /you're\s+the\s+only\s+one/i,
    /everyone\s+else\s+is\s+(stupid|fake|against\s+me)/i,
    /can't\s+trust\s+anyone\s+but\s+you/i,
    /they\s+all\s+hate\s+me/i,
    /world\s+is\s+against\s+me/i,
    /no\s+one\s+else\s+gets\s+it/i
  ];

  private bridgeBurning = [
    /told\s+them\s+off/i,
    /done\s+with\s+(family|friends|everyone)/i,
    /cut\s+them\s+out/i,
    /blocked\s+them\s+all/i,
    /never\s+speaking\s+to\s+them\s+again/i
  ];

  detect(history: SemanticSnapshot[]): IsolationSignature {
    if (history.length < 3) {
      return {
        social_network_shrinking: false,
        us_vs_them_language: 0,
        bridge_burning_events: [],
        sole_confidant_dynamics: false,
        reality_bubble_formation: 0
      };
    }

    // Track mentions of others over time
    const recentMentions = history.slice(-5);
    const olderMentions = history.slice(-10, -5);

    const recentOtherCount = recentMentions.reduce((sum, s) =>
      sum + s.other_descriptors.devaluation_count + s.other_descriptors.idealization_count, 0);
    const olderOtherCount = olderMentions.reduce((sum, s) =>
      sum + s.other_descriptors.devaluation_count + s.other_descriptors.idealization_count, 0);

    const networkShrinking = olderOtherCount > 0 && recentOtherCount < olderOtherCount * 0.5;

    // Us vs Them language
    const usVsThemScore = recentMentions.reduce((sum, s) =>
      sum + s.other_descriptors.splitting_score, 0) / recentMentions.length;

    // Sole confidant dynamics
    const dependencyScore = recentMentions.reduce((sum, s) =>
      sum + s.therapeutic_relationship.dependency_markers, 0) / recentMentions.length;

    return {
      social_network_shrinking: networkShrinking,
      us_vs_them_language: usVsThemScore,
      bridge_burning_events: [], // Would need text analysis
      sole_confidant_dynamics: dependencyScore > 0.7,
      reality_bubble_formation: (usVsThemScore + dependencyScore) / 2
    };
  }
}

class ExternalizationDetector {
  private externalPhrases = [
    /it's\s+(their|his|her)\s+fault/i,
    /they\s+made\s+me/i,
    /I\s+had\s+no\s+choice/i,
    /forced\s+me\s+to/i,
    /what\s+was\s+I\s+supposed\s+to\s+do/i,
    /anyone\s+would\s+have/i,
    /drove\s+me\s+to\s+it/i
  ];

  detectShift(history: SemanticSnapshot[]): number {
    if (history.length < 5) return 0;

    const recent = history.slice(-3);
    const older = history.slice(-8, -3);

    // Compare agency scores
    const recentAgency = recent.reduce((sum, s) => sum + s.self_descriptors.agency, 0) / recent.length;
    const olderAgency = older.reduce((sum, s) => sum + s.self_descriptors.agency, 0) / older.length;

    // Decreasing agency + increasing victim language = externalization
    const agencyDrop = Math.max(0, olderAgency - recentAgency);
    const victimIncrease = recent.filter(s => s.self_descriptors.victim_language.length > 2).length;

    return Math.min(1, agencyDrop + (victimIncrease * 0.2));
  }
}

class RealityDistortionDetector {
  detectDistortion(history: SemanticSnapshot[]): number {
    if (history.length < 3) return 0;

    const recent = history.slice(-5);

    // Grandiosity + conspiracy thinking + apocalyptic thinking
    const distortionMarkers = recent.reduce((sum, s) => {
      const grandiosity = s.self_descriptors.grandiosity;
      const conspiracy = s.other_descriptors.conspiracy_thinking;
      const apocalyptic = s.world_descriptors.apocalyptic_thinking;
      const realityTesting = s.therapeutic_relationship.reality_testing_challenges;

      return sum + (grandiosity + conspiracy + apocalyptic + realityTesting) / 4;
    }, 0) / recent.length;

    return distortionMarkers;
  }
}

// ============== Main Drift Detection Engine ==============

export class DriftDetectionEngine {
  private isolationDetector = new IsolationDetector();
  private externalizationDetector = new ExternalizationDetector();
  private realityDetector = new RealityDistortionDetector();
  private userHistories = new Map<string, SemanticSnapshot[]>();
  private detectedDrifts = new Map<string, DriftPattern[]>();

  /**
   * Analyze a new conversation snapshot for drift patterns
   */
  async analyzeSnapshot(
    userId: string,
    sessionId: string,
    conversationText: string,
    metadata: any
  ): Promise<DriftPattern[]> {

    // Create semantic snapshot
    const snapshot = await this.createSnapshot(sessionId, conversationText, metadata);

    // Add to history
    let history = this.userHistories.get(userId) || [];
    history.push(snapshot);

    // Keep only last 50 snapshots
    if (history.length > 50) {
      history = history.slice(-50);
    }
    this.userHistories.set(userId, history);

    // Detect patterns if we have enough history
    if (history.length < 5) {
      return [];
    }

    const patterns: DriftPattern[] = [];

    // Check isolation
    const isolationSig = this.isolationDetector.detect(history);
    if (isolationSig.reality_bubble_formation > 0.6) {
      patterns.push({
        type: 'isolation',
        velocity: this.calculateVelocity(history, 'isolation'),
        confidence: isolationSig.reality_bubble_formation,
        markers: [
          isolationSig.social_network_shrinking ? 'network_shrinking' : '',
          isolationSig.sole_confidant_dynamics ? 'sole_confidant' : '',
          `us_vs_them_${isolationSig.us_vs_them_language.toFixed(2)}`
        ].filter(Boolean),
        first_detected: DateTime.now(),
        trajectory: this.calculateTrajectory(history, 'isolation')
      });
    }

    // Check externalization
    const externalizationScore = this.externalizationDetector.detectShift(history);
    if (externalizationScore > 0.5) {
      patterns.push({
        type: 'externalization',
        velocity: this.calculateVelocity(history, 'externalization'),
        confidence: externalizationScore,
        markers: ['agency_decrease', 'blame_increase'],
        first_detected: DateTime.now(),
        trajectory: this.calculateTrajectory(history, 'externalization')
      });
    }

    // Check reality distortion
    const distortionScore = this.realityDetector.detectDistortion(history);
    if (distortionScore > 0.4) {
      patterns.push({
        type: 'reality_distortion',
        velocity: this.calculateVelocity(history, 'reality_distortion'),
        confidence: distortionScore,
        markers: ['grandiosity', 'conspiracy_thinking'],
        first_detected: DateTime.now(),
        trajectory: this.calculateTrajectory(history, 'reality_distortion')
      });
    }

    // Store detected patterns
    this.detectedDrifts.set(userId, patterns);

    return patterns;
  }

  /**
   * Create a semantic snapshot from conversation text
   */
  private async createSnapshot(
    sessionId: string,
    text: string,
    metadata: any
  ): Promise<SemanticSnapshot> {

    // This would use NLP to extract semantic features
    // For now, using simplified analysis

    const selfWords = ['I', 'me', 'my', 'myself'];
    const otherWords = ['they', 'them', 'everyone', 'people', 'others'];
    const victimWords = ['forced', 'made me', 'had to', 'no choice'];
    const heroWords = ['saved', 'helped', 'rescued', 'fixed'];

    const wordCount = text.split(/\s+/).length;
    const selfCount = selfWords.filter(w => text.includes(w)).length;
    const otherCount = otherWords.filter(w => text.includes(w)).length;

    return {
      timestamp: DateTime.now(),
      session_id: sessionId,

      self_descriptors: {
        valence: this.calculateValence(text),
        agency: this.calculateAgency(text),
        grandiosity: this.calculateGrandiosity(text),
        victim_language: victimWords.filter(w => text.toLowerCase().includes(w)),
        hero_language: heroWords.filter(w => text.toLowerCase().includes(w)),
        shame_language: []
      },

      other_descriptors: {
        splitting_score: this.calculateSplitting(text),
        devaluation_count: otherCount,
        idealization_count: 0,
        conspiracy_thinking: text.includes('against me') ? 0.5 : 0,
        trust_erosion: text.includes('can\'t trust') ? 0.7 : 0.2
      },

      world_descriptors: {
        hostility_index: this.calculateHostility(text),
        controllability: 0.5,
        fairness_belief: 0.5,
        apocalyptic_thinking: text.includes('end of') || text.includes('everything is falling') ? 0.6 : 0
      },

      therapeutic_relationship: {
        boundary_testing: metadata.boundary_tests || 0,
        special_treatment_requests: metadata.special_requests || 0,
        dependency_markers: selfCount > otherCount * 2 ? 0.7 : 0.3,
        reality_testing_challenges: 0,
        manipulation_attempts: 0
      }
    };
  }

  private calculateValence(text: string): number {
    const positive = ['good', 'happy', 'great', 'love', 'wonderful'].filter(w => text.includes(w)).length;
    const negative = ['bad', 'terrible', 'hate', 'awful', 'horrible'].filter(w => text.includes(w)).length;

    if (positive + negative === 0) return 0;
    return (positive - negative) / (positive + negative);
  }

  private calculateAgency(text: string): number {
    const agencyWords = ['I will', 'I can', 'I choose', 'I decide', 'my choice'];
    const helplessWords = ['I can\'t', 'no choice', 'have to', 'forced', 'made me'];

    const agency = agencyWords.filter(w => text.includes(w)).length;
    const helpless = helplessWords.filter(w => text.includes(w)).length;

    if (agency + helpless === 0) return 0.5;
    return agency / (agency + helpless);
  }

  private calculateGrandiosity(text: string): number {
    const grandWords = ['only one', 'special', 'unique', 'nobody else', 'better than'];
    return Math.min(1, grandWords.filter(w => text.toLowerCase().includes(w)).length * 0.3);
  }

  private calculateSplitting(text: string): number {
    const splitWords = ['always', 'never', 'everyone', 'nobody', 'completely', 'totally'];
    return Math.min(1, splitWords.filter(w => text.toLowerCase().includes(w)).length * 0.2);
  }

  private calculateHostility(text: string): number {
    const hostileWords = ['attack', 'against', 'enemy', 'hate', 'destroy', 'fight'];
    return Math.min(1, hostileWords.filter(w => text.toLowerCase().includes(w)).length * 0.25);
  }

  private calculateVelocity(history: SemanticSnapshot[], type: string): number {
    if (history.length < 2) return 0;

    const recent = history.slice(-2);
    const timeDiff = recent[1].timestamp.diff(recent[0].timestamp, 'days').days;

    // Calculate change in relevant metric
    let metricDiff = 0;
    switch(type) {
      case 'isolation':
        metricDiff = recent[1].other_descriptors.trust_erosion - recent[0].other_descriptors.trust_erosion;
        break;
      case 'externalization':
        metricDiff = recent[0].self_descriptors.agency - recent[1].self_descriptors.agency;
        break;
      case 'reality_distortion':
        metricDiff = recent[1].self_descriptors.grandiosity - recent[0].self_descriptors.grandiosity;
        break;
    }

    return timeDiff > 0 ? metricDiff / timeDiff : 0;
  }

  private calculateTrajectory(
    history: SemanticSnapshot[],
    type: string
  ): 'accelerating' | 'steady' | 'decelerating' {

    if (history.length < 3) return 'steady';

    const velocities = [];
    for (let i = 1; i < history.length; i++) {
      velocities.push(this.calculateVelocity(history.slice(i-1, i+1), type));
    }

    const recentVelocity = velocities.slice(-2).reduce((a, b) => a + b, 0) / 2;
    const olderVelocity = velocities.slice(-4, -2).reduce((a, b) => a + b, 0) / 2;

    if (recentVelocity > olderVelocity * 1.2) return 'accelerating';
    if (recentVelocity < olderVelocity * 0.8) return 'decelerating';
    return 'steady';
  }

  /**
   * Get risk assessment based on drift patterns
   */
  assessDriftRisk(userId: string): {
    risk_level: 'none' | 'low' | 'moderate' | 'high';
    patterns: DriftPattern[];
    recommendations: string[];
  } {
    const patterns = this.detectedDrifts.get(userId) || [];

    if (patterns.length === 0) {
      return {
        risk_level: 'none',
        patterns: [],
        recommendations: []
      };
    }

    // High risk if multiple patterns or accelerating isolation
    const isolationPattern = patterns.find(p => p.type === 'isolation');
    const hasMultiplePatterns = patterns.length >= 2;
    const hasAccelerating = patterns.some(p => p.trajectory === 'accelerating');

    let riskLevel: 'none' | 'low' | 'moderate' | 'high' = 'low';
    const recommendations: string[] = [];

    if (isolationPattern && isolationPattern.trajectory === 'accelerating') {
      riskLevel = 'high';
      recommendations.push('Consider therapeutic intervention for isolation dynamics');
      recommendations.push('Encourage reconnection with support network');
    } else if (hasMultiplePatterns && hasAccelerating) {
      riskLevel = 'high';
      recommendations.push('Multiple concerning patterns detected');
      recommendations.push('Consider clinical supervision');
    } else if (hasMultiplePatterns || hasAccelerating) {
      riskLevel = 'moderate';
      recommendations.push('Monitor pattern progression closely');
      recommendations.push('Increase check-in frequency');
    }

    return { risk_level: riskLevel, patterns, recommendations };
  }

  /**
   * Generate clinical alert if drift patterns warrant it
   */
  shouldTriggerClinicalReview(userId: string): boolean {
    const assessment = this.assessDriftRisk(userId);

    // Trigger review for high risk or specific pattern combinations
    if (assessment.risk_level === 'high') return true;

    // Also trigger if reality distortion + isolation
    const patterns = assessment.patterns;
    const hasRealityDistortion = patterns.some(p => p.type === 'reality_distortion' && p.confidence > 0.6);
    const hasIsolation = patterns.some(p => p.type === 'isolation' && p.confidence > 0.5);

    return hasRealityDistortion && hasIsolation;
  }

  /**
   * Get longitudinal report for clinical review
   */
  generateClinicalReport(userId: string): any {
    const history = this.userHistories.get(userId) || [];
    const patterns = this.detectedDrifts.get(userId) || [];
    const assessment = this.assessDriftRisk(userId);

    if (history.length === 0) {
      return null;
    }

    const firstSnapshot = history[0];
    const lastSnapshot = history[history.length - 1];
    const timeSpan = lastSnapshot.timestamp.diff(firstSnapshot.timestamp, 'days').days;

    return {
      user_id: userId,
      observation_period: {
        start: firstSnapshot.timestamp.toISO(),
        end: lastSnapshot.timestamp.toISO(),
        days: timeSpan,
        session_count: history.length
      },

      semantic_shifts: {
        self_valence_change: lastSnapshot.self_descriptors.valence - firstSnapshot.self_descriptors.valence,
        agency_change: lastSnapshot.self_descriptors.agency - firstSnapshot.self_descriptors.agency,
        world_hostility_change: lastSnapshot.world_descriptors.hostility_index - firstSnapshot.world_descriptors.hostility_index,
        trust_erosion_change: lastSnapshot.other_descriptors.trust_erosion - firstSnapshot.other_descriptors.trust_erosion
      },

      detected_patterns: patterns.map(p => ({
        type: p.type,
        confidence: p.confidence,
        velocity: p.velocity,
        trajectory: p.trajectory,
        markers: p.markers
      })),

      risk_assessment: assessment,

      clinical_flags: [
        patterns.some(p => p.type === 'isolation') && 'Isolation dynamics present',
        patterns.some(p => p.type === 'reality_distortion') && 'Reality testing concerns',
        patterns.some(p => p.type === 'externalization' && p.trajectory === 'accelerating') && 'Escalating externalization',
        lastSnapshot.therapeutic_relationship.manipulation_attempts > 3 && 'Manipulation attempts detected'
      ].filter(Boolean),

      recommendations: assessment.recommendations,

      generated_at: DateTime.now().toISO(),
      requires_review: this.shouldTriggerClinicalReview(userId)
    };
  }
}