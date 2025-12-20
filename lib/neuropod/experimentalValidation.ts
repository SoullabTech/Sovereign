// Neuropod Experimental Validation Framework
// Phase 1: Tier 1 Protocol Validation (Months 1-12)
//
// Three validation experiments:
// 1. Breath-Paced HRV Coherence (N=30, Tier 1)
// 2. Vibroacoustic Stress Reduction (N=40, Tier 1)
// 3. Vibroacoustic Sleep Prep (N=25, Tier 1)

export interface ExperimentalProtocol {
  experimentId: string;
  protocolId: string;
  name: string;
  phase: 1 | 2 | 3;
  tier: 1 | 2 | 3;

  // Study design
  targetN: number;
  currentN: number;
  design: 'within-subjects' | 'between-subjects' | 'single-arm';
  duration: string; // e.g., "4 weeks", "Single session"

  // Hypotheses
  nullHypothesis: string;
  alternativeHypothesis: string;
  primaryMetric: string;
  secondaryMetrics: string[];

  // Expected outcomes
  expectedDelta: number; // Expected change in primary metric
  effectSize: number; // Cohen's d
  responderThreshold: number; // % expected to respond

  // Safety
  adverseEventThreshold: number; // Max % allowed (typically 5%)
  exclusionCriteria: string[];

  // Budget & timeline
  budgetUSD: number;
  startMonth: number; // Month 1-36
  endMonth: number;
  status: 'planned' | 'recruiting' | 'active' | 'analyzing' | 'complete' | 'published';
}

export interface ValidationSession {
  sessionId: string;
  experimentId: string;
  userId: string;
  sessionNumber: number; // 1, 2, 3, etc.

  // Pre-session baseline
  baselineMetrics: BiometricSnapshot;

  // During-session data
  protocolId: string;
  durationMinutes: number;
  stimulusParams: any; // JSONB from protocol definition

  // Post-session outcomes
  postSessionMetrics: BiometricSnapshot;
  deltaMetrics: BiometricDelta;

  // User experience
  userRating: number; // 1-5
  userTags: string[]; // ['calm', 'clarity', 'overwhelm', etc.]
  adverseEvents: string[]; // Free-text adverse event reports

  // Analysis
  responderStatus: 'responder' | 'non-responder' | 'adverse';
  metInclusion: boolean;

  createdAt: Date;
}

export interface BiometricSnapshot {
  // HRV metrics
  hrvCoherence?: number;
  rmssd?: number;
  heartRate?: number;
  breathingRate?: number;

  // EEG metrics (if available)
  alphaPower?: number;
  thetaPower?: number;
  betaPower?: number;
  gammaPower?: number;
  globalSynchrony?: number;
  frontalParietalCoherence?: number;

  // ASSR metrics (if applicable)
  assrPLV?: number; // Phase-Locking Value

  // Stress/arousal metrics
  gsrTonic?: number; // Galvanic skin response
  gsrPhasic?: number;

  // DMT defect metrics
  defectDensity?: number;
  fieldAlignment?: number;

  timestamp: Date;
}

export interface BiometricDelta {
  primaryMetricChange: number; // Δ in primary metric
  primaryMetricPctChange: number; // % change

  secondaryMetricChanges: Record<string, number>;

  // Pre-to-post comparison
  significantChange: boolean; // Whether change exceeds minimal detectable
  directionCorrect: boolean; // Whether change is in expected direction
}

// ============================================================================
// Phase 1 Validation Experiments (Tier 1 Protocols)
// ============================================================================

export const PHASE1_EXPERIMENTS: ExperimentalProtocol[] = [
  {
    experimentId: 'VAL-001-HRV-COHERENCE',
    protocolId: 'breath-paced-vibroacoustic',
    name: 'Breath-Paced Vibroacoustic HRV Coherence Enhancement',
    phase: 1,
    tier: 1,

    targetN: 30,
    currentN: 0,
    design: 'within-subjects',
    duration: 'Single session (15 minutes)',

    nullHypothesis: 'Vibroacoustic stimulation + breath pacing does not increase HRV coherence more than breath pacing alone',
    alternativeHypothesis: 'Vibroacoustic + breath pacing increases HRV coherence by ≥0.18 (Cohen\'s d ≈ 0.6)',
    primaryMetric: 'hrvCoherence',
    secondaryMetrics: ['rmssd', 'breathingRate', 'gsrTonic', 'defectDensity'],

    expectedDelta: 0.18, // HRV coherence increase
    effectSize: 0.6, // Cohen's d (medium effect)
    responderThreshold: 0.7, // 70% responder rate expected

    adverseEventThreshold: 0.05, // Max 5% adverse events
    exclusionCriteria: ['Pregnancy', 'Pacemaker', 'Seizure history'],

    budgetUSD: 18000,
    startMonth: 4,
    endMonth: 6,
    status: 'planned',
  },

  {
    experimentId: 'VAL-002-STRESS-REDUCTION',
    protocolId: 'vibroacoustic-stress-reduction',
    name: 'Vibroacoustic Stress Reduction (Acute Stress)',
    phase: 1,
    tier: 1,

    targetN: 40,
    currentN: 0,
    design: 'between-subjects',
    duration: '4 weeks (2 sessions/week)',

    nullHypothesis: 'Vibroacoustic stress reduction does not reduce GSR tonic levels more than control (nature sounds)',
    alternativeHypothesis: 'Vibroacoustic reduces GSR tonic by ≥15% (Cohen\'s d ≈ 0.5)',
    primaryMetric: 'gsrTonic',
    secondaryMetrics: ['hrvCoherence', 'defectDensity', 'userRating'],

    expectedDelta: -0.15, // 15% reduction in GSR tonic
    effectSize: 0.5,
    responderThreshold: 0.65,

    adverseEventThreshold: 0.05,
    exclusionCriteria: ['Pregnancy', 'Pacemaker', 'Active psychosis'],

    budgetUSD: 25000,
    startMonth: 7,
    endMonth: 9,
    status: 'planned',
  },

  {
    experimentId: 'VAL-003-SLEEP-PREP',
    protocolId: 'vibroacoustic-sleep-prep',
    name: 'Vibroacoustic Sleep Preparation (Subjective Quality)',
    phase: 1,
    tier: 1,

    targetN: 25,
    currentN: 0,
    design: 'within-subjects',
    duration: '2 weeks (nightly sessions)',

    nullHypothesis: 'Vibroacoustic sleep prep does not improve subjective sleep quality more than control',
    alternativeHypothesis: 'Vibroacoustic improves sleep quality rating by ≥0.7 points (1-5 scale)',
    primaryMetric: 'sleepQualityRating',
    secondaryMetrics: ['timeToSleep', 'sleepDuration', 'morningRestedness'],

    expectedDelta: 0.7, // 0.7-point improvement on 1-5 scale
    effectSize: 0.55,
    responderThreshold: 0.68,

    adverseEventThreshold: 0.05,
    exclusionCriteria: ['Pregnancy', 'Pacemaker', 'Sleep apnea (untreated)'],

    budgetUSD: 30000,
    startMonth: 10,
    endMonth: 12,
    status: 'planned',
  },
];

// ============================================================================
// Data Collection Pipeline
// ============================================================================

export interface DataCollectionSession {
  // Session identification
  validationSessionId: string;
  experimentId: string;
  userId: string;
  sessionNumber: number;

  // Data collection timing
  baselineWindowStart: Date;
  baselineWindowEnd: Date;
  stimulusWindowStart: Date;
  stimulusWindowEnd: Date;
  postWindowStart: Date;
  postWindowEnd: Date;

  // Collected data
  baselineTimeseries: BiometricTimeseries[];
  stimulusTimeseries: BiometricTimeseries[];
  postTimeseries: BiometricTimeseries[];

  // Aggregated metrics
  baselineSnapshot: BiometricSnapshot;
  postSnapshot: BiometricSnapshot;
  delta: BiometricDelta;

  // Quality control
  dataQuality: 'excellent' | 'good' | 'acceptable' | 'poor' | 'excluded';
  qualityNotes: string;
  artifactsDetected: string[];

  // Analysis status
  analyzed: boolean;
  analyzedAt?: Date;
  includeInAnalysis: boolean;
  exclusionReason?: string;
}

export interface BiometricTimeseries {
  timestamp: Date;
  elapsedSeconds: number;

  // Raw sensor data
  heartRate?: number;
  rrIntervals?: number[]; // For HRV calculation
  eegRaw?: number[][]; // Multi-channel EEG
  gsrRaw?: number;

  // Computed features (real-time)
  hrvCoherence?: number;
  alphaPower?: number;
  thetaPower?: number;

  // Stimulus state
  stimulusActive: boolean;
  stimulusPhase?: string;
}

/**
 * Calculate HRV coherence from RR intervals
 * Based on HeartMath coherence algorithm
 */
export function calculateHRVCoherence(rrIntervals: number[]): number {
  // Simplified coherence calculation
  // Real implementation would use HeartMath algorithm
  // For now, return placeholder
  if (rrIntervals.length < 10) return 0;

  // Calculate HRV metrics
  const meanRR = rrIntervals.reduce((a, b) => a + b, 0) / rrIntervals.length;
  const sdnn = Math.sqrt(
    rrIntervals.reduce((sum, rr) => sum + Math.pow(rr - meanRR, 2), 0) / rrIntervals.length
  );

  // Coherence approximation (0-1 scale)
  // Higher SDNN in resonance frequency range (0.05-0.15 Hz) = higher coherence
  const coherence = Math.min(1.0, sdnn / 100); // Simplified

  return coherence;
}

/**
 * Detect if user is a "responder" to protocol
 */
export function assessResponderStatus(
  delta: BiometricDelta,
  expectedDelta: number,
  primaryMetric: string
): 'responder' | 'non-responder' | 'adverse' {
  const change = delta.primaryMetricChange;

  // Adverse if change is in opposite direction and large
  if (!delta.directionCorrect && Math.abs(change) > Math.abs(expectedDelta) * 0.5) {
    return 'adverse';
  }

  // Responder if change meets or exceeds 70% of expected
  if (delta.directionCorrect && Math.abs(change) >= Math.abs(expectedDelta) * 0.7) {
    return 'responder';
  }

  // Otherwise non-responder
  return 'non-responder';
}

/**
 * Generate validation report for experiment
 */
export function generateValidationReport(experimentId: string, sessions: ValidationSession[]) {
  const experiment = PHASE1_EXPERIMENTS.find(e => e.experimentId === experimentId);
  if (!experiment) {
    throw new Error(`Experiment ${experimentId} not found`);
  }

  const includedSessions = sessions.filter(s => s.metInclusion);
  const n = includedSessions.length;

  // Calculate aggregate statistics
  const responders = includedSessions.filter(s => s.responderStatus === 'responder');
  const nonResponders = includedSessions.filter(s => s.responderStatus === 'non-responder');
  const adverse = includedSessions.filter(s => s.responderStatus === 'adverse');

  const responderRate = responders.length / n;
  const adverseRate = adverse.length / n;

  // Calculate mean change in primary metric
  const primaryChanges = includedSessions.map(s => s.deltaMetrics.primaryMetricChange);
  const meanChange = primaryChanges.reduce((a, b) => a + b, 0) / n;
  const sdChange = Math.sqrt(
    primaryChanges.reduce((sum, x) => sum + Math.pow(x - meanChange, 2), 0) / n
  );

  // Effect size (Cohen's d)
  const cohensD = meanChange / sdChange;

  // Statistical significance (simplified t-test)
  const tStat = (meanChange - 0) / (sdChange / Math.sqrt(n));
  const pValue = calculatePValue(tStat, n - 1); // Simplified

  return {
    experimentId,
    protocolId: experiment.protocolId,
    name: experiment.name,

    // Sample
    targetN: experiment.targetN,
    actualN: n,
    completionRate: n / experiment.targetN,

    // Primary outcome
    primaryMetric: experiment.primaryMetric,
    expectedDelta: experiment.expectedDelta,
    observedDelta: meanChange,
    deltaSd: sdChange,

    // Effect size
    expectedEffectSize: experiment.effectSize,
    observedEffectSize: cohensD,

    // Statistical test
    tStatistic: tStat,
    pValue,
    significant: pValue < 0.05,

    // Responder analysis
    responderRate,
    expectedResponderRate: experiment.responderThreshold,
    responderRateMet: responderRate >= experiment.responderThreshold,

    // Safety
    adverseEventRate: adverseRate,
    adverseEventThreshold: experiment.adverseEventThreshold,
    safetyMet: adverseRate < experiment.adverseEventThreshold,

    // Conclusion
    hypothesisSupported: pValue < 0.05 && responderRate >= experiment.responderThreshold && adverseRate < experiment.adverseEventThreshold,

    // Recommendations
    recommendation: getRecommendation(pValue, responderRate, adverseRate, experiment),
  };
}

/**
 * Calculate p-value from t-statistic (simplified)
 */
function calculatePValue(tStat: number, df: number): number {
  // Simplified p-value calculation
  // Real implementation would use t-distribution tables or library
  const absTStat = Math.abs(tStat);

  // Rough approximation for two-tailed test
  if (absTStat < 1.96) return 0.1; // Not significant
  if (absTStat < 2.58) return 0.05; // p < 0.05
  if (absTStat < 3.29) return 0.01; // p < 0.01
  return 0.001; // p < 0.001
}

/**
 * Get recommendation based on validation results
 */
function getRecommendation(
  pValue: number,
  responderRate: number,
  adverseRate: number,
  experiment: ExperimentalProtocol
): string {
  // Safety failure
  if (adverseRate >= experiment.adverseEventThreshold) {
    return 'STOP: Adverse event rate exceeds threshold. Revise protocol or discontinue.';
  }

  // Full success
  if (pValue < 0.05 && responderRate >= experiment.responderThreshold) {
    return 'SUCCESS: Protocol validated. Proceed to public offering with marketing claims.';
  }

  // Partial success (statistically significant but low responder rate)
  if (pValue < 0.05 && responderRate < experiment.responderThreshold) {
    return 'PARTIAL: Statistically significant but responder rate below target. Consider protocol refinement or personalization.';
  }

  // Not significant
  if (pValue >= 0.05) {
    return 'INCONCLUSIVE: Results not statistically significant. Increase N, refine protocol, or reconsider approach.';
  }

  return 'REVIEW: Results require manual review.';
}

// ============================================================================
// Exports
// ============================================================================

export const VALIDATION_STATUS = {
  totalExperiments: PHASE1_EXPERIMENTS.length,
  phase1Complete: PHASE1_EXPERIMENTS.filter(e => e.status === 'complete').length,
  phase1Active: PHASE1_EXPERIMENTS.filter(e => e.status === 'active').length,
  phase1Planned: PHASE1_EXPERIMENTS.filter(e => e.status === 'planned').length,

  totalBudget: PHASE1_EXPERIMENTS.reduce((sum, e) => sum + e.budgetUSD, 0),
  expectedCompletion: 'Month 12 (Year 1)',
};
