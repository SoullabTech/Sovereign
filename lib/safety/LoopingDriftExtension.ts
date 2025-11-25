/**
 * LOOPING PROTOCOL DRIFT EXTENSION
 * Extends the Looping Protocol's temporal awareness from minutes to months
 * Tracking semantic shifts, relational changes, and worldview evolution
 *
 * Core Principle: The field itself resists distortion through gentle recalibration
 */

import { DateTime } from 'luxon';
import { LoopingState, LoopingCycle, ThreeTouchTracker } from '../looping-protocol';
import { FieldState } from '../oracle/field/FieldAwareness';
import { DriftDetectionEngine, DriftPattern } from './DriftDetectionEngine';

// ============== Longitudinal Semantic Tracking ==============

interface SemanticBaseline {
  created_at: DateTime;
  updated_at: DateTime;

  // Self-language patterns
  self_language: {
    descriptor_valence: number; // -1 to 1
    agency_markers: string[]; // "I can", "I will", "I choose"
    limitation_markers: string[]; // "I can't", "I have to"
    identity_stability: number; // 0-1, consistency in self-description
  };

  // Other-language patterns
  other_language: {
    collective_pronouns: number; // frequency of "we", "us", "together"
    divisive_pronouns: number; // frequency of "they", "them"
    trust_vocabulary: string[]; // words indicating trust/distrust
    relational_complexity: number; // 0-1, nuanced vs black/white
  };

  // World-language patterns
  world_language: {
    possibility_markers: string[]; // "could", "maybe", "imagine", "hope"
    constraint_markers: string[]; // "never", "always", "impossible"
    future_orientation: number; // -1 (past) to 1 (future)
    openness_index: number; // 0-1, closed to open worldview
  };
}

interface DriftVector {
  dimension: 'self' | 'other' | 'world';
  magnitude: number; // Amount of change
  direction: number; // -1 (deteriorating) to 1 (improving)
  velocity: number; // Rate of change per week
  acceleration: number; // Is change speeding up or slowing down?
}

interface TemporalSnapshot {
  timestamp: DateTime;
  session_id: string;
  looping_cycles: number;

  // Language metrics
  self_descriptors: Map<string, number>;
  other_descriptors: Map<string, number>;
  world_descriptors: Map<string, number>;

  // Relational metrics
  isolation_score: number; // 0-1
  externalization_score: number; // 0-1
  possibility_score: number; // 0-1

  // Field resonance
  field_coherence: number; // From Field Intelligence
  emotional_density: number; // From Field Awareness
  trust_velocity: number; // From Connection Dynamics
}

// ============== Three-Cycle Rule Extension ==============

export class ThreeCycleTracker extends ThreeTouchTracker {
  private cyclePatterns: Map<string, DateTime[]> = new Map();

  /**
   * Track patterns across temporal cycles (days/weeks)
   * Instead of 3 touches in one session, we need 3 cycles across time
   */
  trackCycle(pattern: string, timestamp: DateTime): number {
    const cycles = this.cyclePatterns.get(pattern) || [];
    cycles.push(timestamp);

    // Keep only cycles from last 30 days
    const cutoff = DateTime.now().minus({ days: 30 });
    const recentCycles = cycles.filter(t => t > cutoff);

    this.cyclePatterns.set(pattern, recentCycles);
    return recentCycles.length;
  }

  shouldIntervene(pattern: string): boolean {
    const cycles = this.cyclePatterns.get(pattern) || [];

    // Need at least 3 occurrences
    if (cycles.length < 3) return false;

    // And they should be spread across at least 3 different days
    const uniqueDays = new Set(cycles.map(c => c.toFormat('yyyy-MM-dd')));
    return uniqueDays.size >= 3;
  }

  getCycleIntensity(pattern: string): number {
    const cycles = this.cyclePatterns.get(pattern) || [];
    if (cycles.length === 0) return 0;

    // More recent = higher intensity
    const now = DateTime.now();
    const weights = cycles.map(c => {
      const daysAgo = now.diff(c, 'days').days;
      return Math.exp(-daysAgo / 7); // Exponential decay with 7-day half-life
    });

    return weights.reduce((a, b) => a + b, 0) / cycles.length;
  }
}

// ============== Looping Protocol Drift Extension ==============

export class LoopingDriftProtocol {
  private baselines = new Map<string, SemanticBaseline>();
  private snapshots = new Map<string, TemporalSnapshot[]>();
  private cycleTracker = new ThreeCycleTracker();
  private driftEngine = new DriftDetectionEngine();

  /**
   * Extend a looping cycle with longitudinal tracking
   */
  async extendCycle(
    userId: string,
    cycle: LoopingCycle,
    fieldState: FieldState,
    loopingState: LoopingState
  ): Promise<{
    drift_detected: boolean;
    intervention_needed: boolean;
    recalibration: string | null;
  }> {

    // 1. Extract semantic features from this cycle
    const snapshot = this.createSnapshot(cycle, fieldState, loopingState);

    // 2. Update baseline or compare to existing
    let baseline = this.baselines.get(userId);
    if (!baseline) {
      baseline = this.createBaseline(snapshot);
      this.baselines.set(userId, baseline);
      return { drift_detected: false, intervention_needed: false, recalibration: null };
    }

    // 3. Calculate drift vectors
    const driftVectors = this.calculateDrift(baseline, snapshot);

    // 4. Track patterns over cycles
    for (const vector of driftVectors) {
      if (vector.magnitude > 0.3 && vector.direction < 0) {
        const pattern = `${vector.dimension}_deterioration`;
        const cycles = this.cycleTracker.trackCycle(pattern, DateTime.now());

        // Check if we've hit the three-cycle threshold
        if (this.cycleTracker.shouldIntervene(pattern)) {
          const recalibration = this.generateRecalibration(vector, fieldState);
          return {
            drift_detected: true,
            intervention_needed: true,
            recalibration
          };
        }
      }
    }

    // 5. Store snapshot for longitudinal analysis
    const userSnapshots = this.snapshots.get(userId) || [];
    userSnapshots.push(snapshot);
    if (userSnapshots.length > 100) userSnapshots.shift(); // Keep last 100
    this.snapshots.set(userId, userSnapshots);

    // 6. Check for subtle drift patterns
    const driftPatterns = await this.driftEngine.analyzeSnapshot(
      userId,
      snapshot.session_id,
      cycle.listened.surface,
      { looping_state: loopingState, field_state: fieldState }
    );

    const needsIntervention = driftPatterns.some(p =>
      p.confidence > 0.7 && p.trajectory === 'accelerating'
    );

    return {
      drift_detected: driftPatterns.length > 0,
      intervention_needed: needsIntervention,
      recalibration: needsIntervention ? this.generateRecalibration(driftVectors[0], fieldState) : null
    };
  }

  /**
   * Create a temporal snapshot from a looping cycle
   */
  private createSnapshot(
    cycle: LoopingCycle,
    fieldState: FieldState,
    loopingState: LoopingState
  ): TemporalSnapshot {

    const text = cycle.listened.surface.toLowerCase();

    // Extract descriptor frequencies
    const selfDescriptors = new Map<string, number>();
    const otherDescriptors = new Map<string, number>();
    const worldDescriptors = new Map<string, number>();

    // Self-referential words
    ['i am', 'i feel', 'i think', 'i can\'t', 'i will'].forEach(phrase => {
      const count = (text.match(new RegExp(phrase, 'g')) || []).length;
      if (count > 0) selfDescriptors.set(phrase, count);
    });

    // Other-referential words
    ['they are', 'people', 'everyone', 'nobody', 'them'].forEach(phrase => {
      const count = (text.match(new RegExp(phrase, 'g')) || []).length;
      if (count > 0) otherDescriptors.set(phrase, count);
    });

    // World-referential words
    ['the world', 'everything', 'always', 'never', 'impossible'].forEach(phrase => {
      const count = (text.match(new RegExp(phrase, 'g')) || []).length;
      if (count > 0) worldDescriptors.set(phrase, count);
    });

    // Calculate scores
    const isolationScore = this.calculateIsolationScore(text, cycle.listened.emotion);
    const externalizationScore = this.calculateExternalizationScore(text);
    const possibilityScore = this.calculatePossibilityScore(text);

    return {
      timestamp: DateTime.now(),
      session_id: `session_${Date.now()}`,
      looping_cycles: loopingState.cycles,
      self_descriptors: selfDescriptors,
      other_descriptors: otherDescriptors,
      world_descriptors: worldDescriptors,
      isolation_score: isolationScore,
      externalization_score: externalizationScore,
      possibility_score: possibilityScore,
      field_coherence: fieldState.semanticLandscape.coherence_field,
      emotional_density: fieldState.emotionalWeather.density,
      trust_velocity: fieldState.connectionDynamics.trust_velocity
    };
  }

  /**
   * Create initial baseline from first snapshot
   */
  private createBaseline(snapshot: TemporalSnapshot): SemanticBaseline {
    return {
      created_at: snapshot.timestamp,
      updated_at: snapshot.timestamp,

      self_language: {
        descriptor_valence: snapshot.possibility_score - snapshot.externalization_score,
        agency_markers: Array.from(snapshot.self_descriptors.keys()).filter(k => k.includes('i will') || k.includes('i can')),
        limitation_markers: Array.from(snapshot.self_descriptors.keys()).filter(k => k.includes('i can\'t')),
        identity_stability: 1.0 // Start at maximum stability
      },

      other_language: {
        collective_pronouns: 0.5, // Start neutral
        divisive_pronouns: 0.5,
        trust_vocabulary: [],
        relational_complexity: 0.5
      },

      world_language: {
        possibility_markers: ['could', 'maybe', 'perhaps'],
        constraint_markers: [],
        future_orientation: 0,
        openness_index: snapshot.possibility_score
      }
    };
  }

  /**
   * Calculate drift vectors between baseline and current snapshot
   */
  private calculateDrift(baseline: SemanticBaseline, snapshot: TemporalSnapshot): DriftVector[] {
    const vectors: DriftVector[] = [];

    // Self-dimension drift
    const currentSelfValence = snapshot.possibility_score - snapshot.externalization_score;
    const selfDrift = currentSelfValence - baseline.self_language.descriptor_valence;

    vectors.push({
      dimension: 'self',
      magnitude: Math.abs(selfDrift),
      direction: Math.sign(selfDrift),
      velocity: selfDrift / 7, // Per week
      acceleration: 0 // Would need more snapshots to calculate
    });

    // Other-dimension drift
    const otherDrift = snapshot.isolation_score - 0.5; // Deviation from neutral

    vectors.push({
      dimension: 'other',
      magnitude: Math.abs(otherDrift),
      direction: -Math.sign(otherDrift), // Higher isolation = negative direction
      velocity: otherDrift / 7,
      acceleration: 0
    });

    // World-dimension drift
    const worldDrift = snapshot.possibility_score - baseline.world_language.openness_index;

    vectors.push({
      dimension: 'world',
      magnitude: Math.abs(worldDrift),
      direction: Math.sign(worldDrift),
      velocity: worldDrift / 7,
      acceleration: 0
    });

    return vectors;
  }

  /**
   * Generate subtle recalibration based on drift pattern
   */
  private generateRecalibration(
    driftVector: DriftVector,
    fieldState: FieldState
  ): string {

    // Not confrontation, but gentle course correction
    const recalibrations = {
      self: {
        deteriorating: [
          "I'm noticing the weight in how you describe yourself. What would it feel like to hold that differently?",
          "Your words carry a particular gravity today. Where in your body do you feel that settling?",
          "There's a shift in how you're seeing yourself. What's changed?"
        ],
        improving: [
          "I can feel something opening in how you speak about yourself.",
          "There's more space in your words today."
        ]
      },
      other: {
        deteriorating: [
          "The distance between you and others seems to be growing. What's that protecting?",
          "I notice fewer bridges in your language lately. What happened to 'we'?",
          "When you describe others this way, how does it feel in your chest?"
        ],
        improving: [
          "I hear more connection in your words.",
          "The 'we' is returning to your vocabulary."
        ]
      },
      world: {
        deteriorating: [
          "The horizon seems to be closing in. What would it take to see further?",
          "Possibility feels scarce in your words. Where did it go?",
          "The world you're describing feels smaller than before. What's contracting it?"
        ],
        improving: [
          "I sense new possibilities opening in your worldview.",
          "There's more room to breathe in how you see things."
        ]
      }
    };

    const dimension = driftVector.dimension;
    const direction = driftVector.direction < 0 ? 'deteriorating' : 'improving';
    const options = recalibrations[dimension][direction];

    // Select based on field state
    const index = Math.floor(fieldState.emotionalWeather.density * options.length);
    return options[Math.min(index, options.length - 1)];
  }

  /**
   * Calculate isolation score from language patterns
   */
  private calculateIsolationScore(text: string, emotions: string[]): number {
    const isolationPhrases = [
      'nobody understands',
      'alone',
      'by myself',
      'no one',
      'everyone else',
      'they all',
      'against me'
    ];

    const connectionPhrases = [
      'we',
      'us',
      'together',
      'with',
      'community',
      'friends',
      'support'
    ];

    const isolationCount = isolationPhrases.filter(p => text.includes(p)).length;
    const connectionCount = connectionPhrases.filter(p => text.includes(p)).length;

    // Also factor in emotional tone
    const lonelyEmotions = emotions.filter(e =>
      ['lonely', 'isolated', 'abandoned', 'disconnected'].includes(e.toLowerCase())
    ).length;

    const total = isolationCount + connectionCount;
    if (total === 0) return 0.5; // Neutral

    const score = (isolationCount + lonelyEmotions * 0.5) / (total + lonelyEmotions);
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Calculate externalization score
   */
  private calculateExternalizationScore(text: string): number {
    const externalPhrases = [
      'they made me',
      'forced me',
      'their fault',
      'because of them',
      'they always',
      'they never'
    ];

    const ownershipPhrases = [
      'i chose',
      'my decision',
      'i decided',
      'my responsibility',
      'i could have'
    ];

    const externalCount = externalPhrases.filter(p => text.includes(p)).length;
    const ownershipCount = ownershipPhrases.filter(p => text.includes(p)).length;

    const total = externalCount + ownershipCount;
    if (total === 0) return 0.5;

    return externalCount / total;
  }

  /**
   * Calculate possibility score
   */
  private calculatePossibilityScore(text: string): number {
    const possibilityWords = [
      'could',
      'maybe',
      'might',
      'perhaps',
      'imagine',
      'wonder',
      'hope',
      'possibility',
      'option'
    ];

    const constraintWords = [
      'never',
      'always',
      'impossible',
      'can\'t',
      'won\'t',
      'stuck',
      'trapped',
      'no way'
    ];

    const possibilityCount = possibilityWords.filter(p => text.includes(p)).length;
    const constraintCount = constraintWords.filter(p => text.includes(p)).length;

    const total = possibilityCount + constraintCount;
    if (total === 0) return 0.5;

    return possibilityCount / total;
  }

  /**
   * Get longitudinal insights for a user
   */
  getLongitudinalInsights(userId: string): {
    baseline: SemanticBaseline | null;
    current_state: TemporalSnapshot | null;
    drift_patterns: DriftPattern[];
    risk_assessment: any;
    trajectory: 'improving' | 'stable' | 'declining';
  } {

    const baseline = this.baselines.get(userId) || null;
    const snapshots = this.snapshots.get(userId) || [];
    const current = snapshots[snapshots.length - 1] || null;

    if (!baseline || !current || snapshots.length < 3) {
      return {
        baseline,
        current_state: current,
        drift_patterns: [],
        risk_assessment: { risk_level: 'none' },
        trajectory: 'stable'
      };
    }

    // Calculate overall trajectory
    const recentSnapshots = snapshots.slice(-5);
    const olderSnapshots = snapshots.slice(-10, -5);

    const recentAvgPossibility = recentSnapshots.reduce((sum, s) => sum + s.possibility_score, 0) / recentSnapshots.length;
    const olderAvgPossibility = olderSnapshots.reduce((sum, s) => sum + s.possibility_score, 0) / Math.max(1, olderSnapshots.length);

    let trajectory: 'improving' | 'stable' | 'declining';
    if (recentAvgPossibility > olderAvgPossibility * 1.1) {
      trajectory = 'improving';
    } else if (recentAvgPossibility < olderAvgPossibility * 0.9) {
      trajectory = 'declining';
    } else {
      trajectory = 'stable';
    }

    return {
      baseline,
      current_state: current,
      drift_patterns: this.driftEngine.assessDriftRisk(userId).patterns,
      risk_assessment: this.driftEngine.assessDriftRisk(userId),
      trajectory
    };
  }
}