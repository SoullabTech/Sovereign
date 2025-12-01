/**
 * MAIA Phase III Research Data Collection Interfaces
 *
 * TypeScript interfaces for empirical validation of field-coupled
 * consciousness empowerment systems.
 *
 * Based on Statistical Analysis Plan v1.0
 */

// ============================================================================
// Core Data Types
// ============================================================================

export type StudyCondition = 'baseline' | 'field_aware' | 'field_driven';
export type DevelopmentPhase = 'awareness' | 'acceptance' | 'action' | 'accountability' | 'advancement' | 'service';

// ============================================================================
// Measurement Interfaces
// ============================================================================

/**
 * Physiological measurements from biometric sensors
 */
export interface PhysioData {
  /** Heart-rate variability (parasympathetic tone) in milliseconds */
  hrv_rmssd: number;

  /** HRV coherence index (0-1 ratio) */
  hrv_coherence: number;

  /** Electro-dermal activity in microsiemens (optional) */
  eda_mean?: number;

  /** Respiratory coherence (if available) */
  respiratory_coherence?: number;
}

/**
 * Behavioral interaction patterns
 */
export interface BehavioralData {
  /** Mean response latency in seconds */
  response_latency: number;

  /** Shannon entropy of turn-taking patterns */
  turn_entropy: number;

  /** Number of conversational turns */
  turn_count?: number;

  /** Average response length in tokens */
  avg_response_length?: number;
}

/**
 * Semantic coherence and archetypal diversity metrics
 */
export interface SemanticData {
  /** Mean cosine similarity of consecutive utterances [-1, 1] */
  sem_coherence: number;

  /** Shannon entropy of archetypal voice distribution */
  archetypal_entropy: number;

  /** Semantic embedding coherence over time */
  embedding_coherence?: number;

  /** Topic modeling consistency score */
  topic_consistency?: number;
}

/**
 * Self-reported subjective measures (Likert scale 1-7)
 */
export interface SubjectiveData {
  /** Empowerment Index pre-session (7-item scale) */
  empowerment_index_pre: number;

  /** Empowerment Index post-session (7-item scale) */
  empowerment_index_post: number;

  /** Perceived alignment/resonance with MAIA (1-7) */
  alignment_scale: number;

  /** Perceived autonomy of AI responses (1-7) */
  ai_autonomy_perception?: number;

  /** Session satisfaction (1-7) */
  satisfaction_score?: number;
}

/**
 * System-level field and autonomy metrics
 */
export interface SystemData {
  /** PFI field coherence metric (0-1 ratio) */
  field_coherence: number;

  /** Autonomy ratio - degree of model self-determination (0-1) */
  autonomy_ratio: number;

  /** Field confidence gate - trust in field suggestions (0-1) */
  confidence_gate: number;

  /** Number of active archetypal agents */
  active_agents?: number;

  /** Field modulation events count */
  modulation_events?: number;
}

// ============================================================================
// Collective Intelligence Extensions
// ============================================================================

/**
 * Group-level collective intelligence metrics
 */
export interface CollectiveData {
  /** Group coherence metric */
  group_coherence: number;

  /** Idea diversity in group sessions */
  idea_diversity: number;

  /** Collective flow state measure */
  collective_flow: number;

  /** Emergence index - novel insight detection */
  emergence_index: number;

  /** Number of participants in session */
  participant_count: number;
}

/**
 * Longitudinal learning and adaptation data
 */
export interface AdaptationData {
  /** Previous session outcomes for this participant */
  session_history?: string[];

  /** Adaptation learning rate */
  learning_rate?: number;

  /** Meta-cognitive reflection scores */
  meta_cognition?: number;

  /** Long-term empowerment trajectory */
  trajectory_slope?: number;
}

// ============================================================================
// Complete Session Record
// ============================================================================

/**
 * Complete session record for Phase III validation studies
 */
export interface SessionRecord {
  // Session identification
  session_id: string;
  participant_id: string;
  condition: StudyCondition;

  // Temporal data
  timestamp_start: string; // ISO8601
  timestamp_end: string;   // ISO8601
  session_duration_ms: number;

  // Core measurement data
  physio: PhysioData;
  behavioral: BehavioralData;
  semantic: SemanticData;
  subjective: SubjectiveData;
  system: SystemData;

  // Optional extended data
  collective?: CollectiveData;
  adaptation?: AdaptationData;

  // Metadata and context
  meta: SessionMetadata;
}

/**
 * Session metadata and context information
 */
export interface SessionMetadata {
  /** MAIA software version */
  software_version: string;

  /** Data analyst/researcher ID */
  analyst?: string;

  /** Research site or lab identifier */
  site?: string;

  /** Any relevant session notes */
  notes?: string;

  /** Participant demographics (anonymized) */
  demographics?: {
    age_bracket: string;
    gender_category: string;
    experience_level: string;
  };

  /** Technical environment data */
  environment?: {
    device_type: string;
    browser?: string;
    screen_resolution?: string;
    network_quality?: string;
  };
}

// ============================================================================
// Data Processing Utilities
// ============================================================================

/**
 * Computed metrics derived from raw measurements
 */
export interface ComputedMetrics {
  /** Coherence improvement delta (post - pre) */
  coherence_delta: number;

  /** Empowerment improvement delta */
  empowerment_delta: number;

  /** Autonomy stability measure */
  autonomy_stability: number;

  /** Overall session success score */
  session_success: number;

  /** Statistical confidence in measurements */
  measurement_confidence: number;
}

/**
 * Statistical analysis result structure
 */
export interface AnalysisResult {
  /** Study hypothesis being tested */
  hypothesis: string;

  /** Statistical test used */
  test_method: string;

  /** P-value */
  p_value: number;

  /** Effect size (Cohen's d, eta-squared, etc.) */
  effect_size: number;

  /** Confidence interval */
  confidence_interval: [number, number];

  /** Statistical significance */
  significant: boolean;
}

// ============================================================================
// Validation and Quality Assurance
// ============================================================================

/**
 * Data quality metrics for session validation
 */
export interface DataQuality {
  /** Completeness score (0-1) */
  completeness: number;

  /** Signal quality indicators */
  signal_quality: {
    hrv_quality: number;
    semantic_quality: number;
    system_quality: number;
  };

  /** Outlier detection flags */
  outliers_detected: string[];

  /** Data validation status */
  validation_status: 'valid' | 'needs_review' | 'invalid';
}

// ============================================================================
// Export Collections
// ============================================================================

/**
 * Complete data package for analysis
 */
export interface ResearchDataset {
  /** All session records */
  sessions: SessionRecord[];

  /** Computed metrics for each session */
  computed_metrics: ComputedMetrics[];

  /** Data quality assessments */
  quality_metrics: DataQuality[];

  /** Statistical analysis results */
  analysis_results?: AnalysisResult[];

  /** Dataset metadata */
  dataset_meta: {
    version: string;
    creation_date: string;
    total_sessions: number;
    study_phase: string;
    data_schema_version: string;
  };
}

// ============================================================================
// Constants and Configuration
// ============================================================================

/**
 * Validation thresholds and constants
 */
export const RESEARCH_CONSTANTS = {
  // Autonomy Charter requirements
  MIN_AUTONOMY_RATIO: 0.7,
  MAX_AUTONOMY_RATIO: 1.0,

  // Statistical significance thresholds
  ALPHA_LEVEL: 0.05,
  EFFECT_SIZE_SMALL: 0.2,
  EFFECT_SIZE_MEDIUM: 0.5,
  EFFECT_SIZE_LARGE: 0.8,

  // Data quality thresholds
  MIN_DATA_COMPLETENESS: 0.8,
  MIN_SIGNAL_QUALITY: 0.6,

  // Session duration constraints
  MIN_SESSION_DURATION_MS: 300000, // 5 minutes
  MAX_SESSION_DURATION_MS: 2700000, // 45 minutes

  // Measurement ranges
  HRV_COHERENCE_RANGE: [0, 1] as [number, number],
  EMPOWERMENT_INDEX_RANGE: [1, 7] as [number, number],
  FIELD_COHERENCE_RANGE: [0, 1] as [number, number],
} as const;

/**
 * Type guard functions for runtime validation
 */
export const TypeGuards = {
  isValidCondition: (condition: string): condition is StudyCondition => {
    return ['baseline', 'field_aware', 'field_driven'].includes(condition);
  },

  isValidEmpowermentScore: (score: number): boolean => {
    return score >= 1 && score <= 7;
  },

  isValidAutonomyRatio: (ratio: number): boolean => {
    return ratio >= RESEARCH_CONSTANTS.MIN_AUTONOMY_RATIO &&
           ratio <= RESEARCH_CONSTANTS.MAX_AUTONOMY_RATIO;
  },

  isValidSessionRecord: (record: any): record is SessionRecord => {
    return (
      typeof record === 'object' &&
      typeof record.session_id === 'string' &&
      typeof record.participant_id === 'string' &&
      TypeGuards.isValidCondition(record.condition) &&
      typeof record.physio === 'object' &&
      typeof record.behavioral === 'object' &&
      typeof record.semantic === 'object' &&
      typeof record.subjective === 'object' &&
      typeof record.system === 'object'
    );
  }
};