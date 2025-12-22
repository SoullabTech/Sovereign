/**
 * Kauffman Radical Emergence Types
 *
 * Based on Stuart Kauffman's theory of ontological emergence.
 */

export enum EmergenceType {
  /** Epistemological (Weak) Emergence - Novel but derivable */
  E1_WEAK = 'epistemological_weak',

  /** Ontological Emergence - Primitive Birth */
  O1_PRIMITIVE = 'ontological_primitive_birth',

  /** Ontological Emergence - Operator Birth */
  O2_OPERATOR = 'ontological_operator_birth',

  /** Ontological Emergence - Constraint Birth */
  O3_CONSTRAINT = 'ontological_constraint_birth',

  /** Ontological Emergence - Niche Birth (Swim Bladder Test) */
  O4_NICHE = 'ontological_niche_birth',
}

export interface EmergenceClassification {
  /** Emergence type classification */
  type: EmergenceType;

  /** Novelty score (0.0-1.0) */
  novelty_score: number;

  /** Number of new capabilities unlocked */
  adjacent_possible_delta: number;

  /** Classification evidence and reasoning */
  evidence: {
    /** Why this classification was chosen */
    reason: string;

    /** Capabilities that were reused (O4 only) */
    reused_capabilities?: string[];

    /** Debug: Missing capability IDs (should be empty) */
    debug_missing_new_possibilities?: string[];

    /** Additional metadata */
    [key: string]: any;
  };
}

export interface CapabilityUsage {
  /** Capability ID */
  id: string;

  /** Number of times used */
  use_count: number;

  /** When first used */
  first_used_at?: Date;

  /** When last used */
  last_used_at?: Date;

  /** Event index when created */
  created_event_index: number;
}

export interface EmergenceMetrics {
  /** Total emergence events logged */
  total_events: number;

  /** Count of ontological emergence events (O1-O4) */
  ontological_count: number;

  /** Breakdown by emergence type */
  emergence_by_type: Record<string, number>;

  /** Emergence velocity (expansions/second) */
  velocity: number;

  /** Time window for velocity calculation (seconds) */
  velocity_window: number;

  /** Recently confirmed niches (O4) */
  recent_niches: string[];

  /** Number of autocatalytic sets detected */
  autocatalytic_sets: number;
}

/**
 * Kauffman-Clean Validation
 *
 * Healthy emergence ratios:
 * - E1 (Weak): 90-95%
 * - O1-O3 (Ontological): 5-10%
 * - O4 (Niche): < 1%
 */
export function isKauffmanClean(metrics: EmergenceMetrics): boolean {
  if (metrics.total_events < 10) {
    return true; // Too early to judge
  }

  const o4_count = metrics.emergence_by_type['ontological_niche_birth'] || 0;
  const o4_ratio = o4_count / metrics.total_events;

  // O4 should be rare (< 1%)
  if (o4_ratio > 0.01) {
    console.warn('⚠️  O4 ratio too high:', o4_ratio, '(expected < 1%)');
    return false;
  }

  // Velocity should be reasonable (< 10 expansions/second)
  if (metrics.velocity > 10) {
    console.warn('⚠️  Velocity too high:', metrics.velocity, '(expected < 10)');
    return false;
  }

  return true;
}
