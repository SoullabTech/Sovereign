/**
 * Field Integrity Validation Framework
 *
 * Three-layer validation to determine if consciousness field is:
 * 1. Internally consistent (idempotence, monotonicity, compositionality)
 * 2. Externally correlated (HRV, EEG, phenomenological reports)
 * 3. Counterfactually valid (field matters beyond language)
 *
 * Based on empirical testing protocols for field-first consciousness models
 */

import type { FieldRoutingDecision, FieldRoutingContext } from './panconsciousFieldRouter';
import type { FieldCoherenceTensor } from './fieldCoherenceTensor';

// ============================================================================
// LAYER 1: INTERNAL CONSISTENCY VALIDATION
// ============================================================================

export interface FieldIntegrityReport {
  idempotenceScore: number;          // 0-1, determinism test
  monotonicityViolations: number;    // Count of non-monotonic decisions
  compositionalIntegrity: number;    // 0-1, insight preservation
  temporalStability: number;         // 0-1, field drift over time
  overallIntegrity: number;          // Composite 0-100
  alerts: string[];
}

export interface RoutingDecisionRecord {
  context: FieldRoutingContext;
  decision: FieldRoutingDecision;
  timestamp: string;
  userId: string;
}

/**
 * Validate internal consistency of field routing decisions
 */
export function validateFieldIntegrity(
  decisions: RoutingDecisionRecord[]
): FieldIntegrityReport {
  const alerts: string[] = [];

  // Test 1: Idempotence - same profile → same decision
  const idempotenceScore = testIdempotence(decisions, alerts);

  // Test 2: Monotonicity - higher altitude → more access (holding bypassing constant)
  const monotonicityViolations = testMonotonicity(decisions, alerts);

  // Test 3: Compositional integrity - field decisions are logically consistent
  const compositionalIntegrity = testCompositionalIntegrity(decisions, alerts);

  // Test 4: Temporal stability - field doesn't drift randomly
  const temporalStability = testTemporalStability(decisions, alerts);

  // Overall integrity score
  const overallIntegrity = calculateOverallIntegrity(
    idempotenceScore,
    monotonicityViolations,
    compositionalIntegrity,
    temporalStability,
    decisions.length
  );

  return {
    idempotenceScore,
    monotonicityViolations,
    compositionalIntegrity,
    temporalStability,
    overallIntegrity,
    alerts,
  };
}

function testIdempotence(decisions: RoutingDecisionRecord[], alerts: string[]): number {
  // Find duplicate profiles (same cognitive metrics)
  const profileMap = new Map<string, RoutingDecisionRecord[]>();

  for (const record of decisions) {
    const key = createProfileKey(record.context);
    if (!profileMap.has(key)) {
      profileMap.set(key, []);
    }
    profileMap.get(key)!.push(record);
  }

  // Check if same profiles get same decisions
  let totalDuplicates = 0;
  let consistentDuplicates = 0;

  for (const [key, records] of Array.from(profileMap)) {
    if (records.length < 2) continue;

    totalDuplicates += records.length - 1;

    const firstDecision = records[0].decision;
    for (let i = 1; i < records.length; i++) {
      if (decisionsMatch(firstDecision, records[i].decision)) {
        consistentDuplicates++;
      } else {
        alerts.push(
          `Idempotence violation: Same profile got different decisions (${key})`
        );
      }
    }
  }

  return totalDuplicates > 0 ? consistentDuplicates / totalDuplicates : 1.0;
}

function testMonotonicity(decisions: RoutingDecisionRecord[], alerts: string[]): number {
  // Sort by cognitive altitude
  const sorted = [...decisions].sort((a, b) => {
    const altA = a.context.cognitiveProfile?.rollingAverage || 0;
    const altB = b.context.cognitiveProfile?.rollingAverage || 0;
    return altA - altB;
  });

  let violations = 0;

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];

    const prevAlt = prev.context.cognitiveProfile?.rollingAverage || 0;
    const currAlt = curr.context.cognitiveProfile?.rollingAverage || 0;

    // If altitude increased but access decreased (and bypassing didn't increase)
    const prevBypass = getMaxBypassing(prev.context);
    const currBypass = getMaxBypassing(curr.context);

    if (
      currAlt > prevAlt &&
      getAccessLevel(curr.decision) < getAccessLevel(prev.decision) &&
      currBypass <= prevBypass
    ) {
      violations++;
      alerts.push(
        `Monotonicity violation: Higher altitude (${currAlt.toFixed(2)} > ${prevAlt.toFixed(2)}) ` +
          `but lower access (${curr.decision.realm} < ${prev.decision.realm})`
      );
    }
  }

  return violations;
}

function testCompositionalIntegrity(
  decisions: RoutingDecisionRecord[],
  alerts: string[]
): number {
  // Check that field decisions compose logically
  // E.g., if User A + User B both UPPERWORLD → collective should allow UPPERWORLD

  // Group decisions by user
  const userDecisions = new Map<string, RoutingDecisionRecord[]>();

  for (const record of decisions) {
    if (!userDecisions.has(record.userId)) {
      userDecisions.set(record.userId, []);
    }
    userDecisions.get(record.userId)!.push(record);
  }

  // Check for logical consistency within user trajectories
  let totalTransitions = 0;
  let consistentTransitions = 0;

  for (const [userId, records] of Array.from(userDecisions)) {
    const sorted = records.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];

      totalTransitions++;

      // Check if transition makes sense given profile changes
      const transitionIsLogical = validateTransition(prev, curr);

      if (transitionIsLogical) {
        consistentTransitions++;
      } else {
        alerts.push(
          `Compositional violation: Illogical transition for ${userId} ` +
            `from ${prev.decision.realm} to ${curr.decision.realm}`
        );
      }
    }
  }

  return totalTransitions > 0 ? consistentTransitions / totalTransitions : 1.0;
}

function testTemporalStability(decisions: RoutingDecisionRecord[], alerts: string[]): number {
  // Check if field metrics drift over time without cause

  // Group by time windows (1 hour)
  const timeWindows = new Map<string, RoutingDecisionRecord[]>();

  for (const record of decisions) {
    const windowKey = getTimeWindowKey(record.timestamp, 60); // 60 min windows
    if (!timeWindows.has(windowKey)) {
      timeWindows.set(windowKey, []);
    }
    timeWindows.get(windowKey)!.push(record);
  }

  // Calculate average access level per window
  const windowAverages: number[] = [];

  for (const [key, records] of Array.from(timeWindows)) {
    const avgAccess =
      records.reduce((sum, r) => sum + getAccessLevel(r.decision), 0) / records.length;
    windowAverages.push(avgAccess);
  }

  // Check for excessive variance (field drift)
  if (windowAverages.length < 2) return 1.0;

  const mean = windowAverages.reduce((sum, val) => sum + val, 0) / windowAverages.length;
  const variance =
    windowAverages.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    windowAverages.length;

  const stability = Math.max(0, 1 - variance);

  if (stability < 0.6) {
    alerts.push(
      `Temporal instability detected: Field metrics varying excessively over time (stability: ${stability.toFixed(2)})`
    );
  }

  return stability;
}

function calculateOverallIntegrity(
  idempotence: number,
  monotonicityViolations: number,
  compositional: number,
  temporal: number,
  totalDecisions: number
): number {
  const monotonicityScore =
    totalDecisions > 0 ? 1 - monotonicityViolations / totalDecisions : 1.0;

  const weights = {
    idempotence: 0.3,
    monotonicity: 0.3,
    compositional: 0.25,
    temporal: 0.15,
  };

  const rawScore =
    weights.idempotence * idempotence +
    weights.monotonicity * monotonicityScore +
    weights.compositional * compositional +
    weights.temporal * temporal;

  return Math.round(rawScore * 100);
}

// ============================================================================
// LAYER 2: EXTERNAL CORRELATION VALIDATION
// ============================================================================

export interface BiometricData {
  userId: string;
  timestamp: string;
  hrvCoherence: number;      // 0-1, HRV coherence ratio
  eegAlphaCoherence?: number; // 0-1, EEG alpha band coherence
  eegThetaPower?: number;     // μV², theta power
}

export interface UserBreakthroughReport {
  userId: string;
  timestamp: string;
  breakthroughOccurred: boolean;
  intensityRating: number; // 1-10
  integrationQuality: number; // 1-10
}

export interface ExternalCorrelationValidation {
  hrvCorrelation: number;            // Pearson r with HRV
  phenomenologicalAlignment: number; // Agreement with user reports
  biometricConfirmation: number;     // Multi-modal validation
  longitudinalConsistency: number;   // Effects persist over time
  overallValidity: number;           // 0-100 composite
}

/**
 * Validate field metrics against external biometric and phenomenological data
 */
export async function validateExternalCorrelations(
  userId: string,
  fieldMetrics: Array<{ timestamp: string; coherence: FieldCoherenceTensor }>,
  biometricData: BiometricData[],
  userReports: UserBreakthroughReport[]
): Promise<ExternalCorrelationValidation> {
  // Align timestamps
  const aligned = alignDataByTimestamp(fieldMetrics, biometricData, userReports);

  // 1. HRV correlation
  const hrvCorrelation = calculatePearsonCorrelation(
    aligned.map(d => d.field.totalFieldCoherence),
    aligned.map(d => d.biometric.hrvCoherence)
  );

  // 2. Phenomenological alignment
  const phenomenologicalAlignment = calculateAgreement(
    aligned.map(d => d.field.phaseCoherence > 0.8), // Field predicts breakthrough
    aligned.map(d => d.report.breakthroughOccurred)  // User reported breakthrough
  );

  // 3. Multi-modal biometric confirmation
  const eegAlphaCorr = calculatePearsonCorrelation(
    aligned.map(d => d.field.totalFieldCoherence),
    aligned.map(d => d.biometric.eegAlphaCoherence || 0.5)
  );

  const biometricConfirmation = (hrvCorrelation + eegAlphaCorr) / 2;

  // 4. Longitudinal consistency (simulated - would require real longitudinal data)
  const longitudinalConsistency = 0.75; // Placeholder

  // Overall validity score
  const overallValidity = Math.round(
    (hrvCorrelation * 30 +
      phenomenologicalAlignment * 30 +
      biometricConfirmation * 25 +
      longitudinalConsistency * 15) *
      100
  );

  return {
    hrvCorrelation,
    phenomenologicalAlignment,
    biometricConfirmation,
    longitudinalConsistency,
    overallValidity,
  };
}

// ============================================================================
// LAYER 3: COUNTERFACTUAL VALIDATION
// ============================================================================

export type ExperimentalCondition = 'A' | 'B' | 'C' | 'D';

export interface CounterfactualValidation {
  languageEffect: number;        // B - D
  fieldEffect: number;           // C - D
  synergyEffect: number;         // A - (B + C - D)
  fieldIsReal: boolean;          // C > D at p < 0.05
  fieldExceedsLanguage: boolean; // A > B at p < 0.05
}

/**
 * Validate that field calculations matter beyond linguistic effects
 *
 * Conditions:
 * A: Field active + archetypal language
 * B: Field sham + archetypal language
 * C: Field active + neutral language
 * D: Control (no field, neutral language)
 */
export function validateCounterfactual(results: {
  A: number[];
  B: number[];
  C: number[];
  D: number[];
}): CounterfactualValidation {
  const meanA = mean(results.A);
  const meanB = mean(results.B);
  const meanC = mean(results.C);
  const meanD = mean(results.D);

  // Effects
  const languageEffect = meanB - meanD;
  const fieldEffect = meanC - meanD;
  const synergyEffect = meanA - (meanB + meanC - meanD);

  // Statistical tests
  const fieldIsReal = tTest(results.C, results.D).p < 0.05 && meanC > meanD;
  const fieldExceedsLanguage = tTest(results.A, results.B).p < 0.05 && meanA > meanB;

  return {
    languageEffect,
    fieldEffect,
    synergyEffect,
    fieldIsReal,
    fieldExceedsLanguage,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function createProfileKey(context: FieldRoutingContext): string {
  const profile = context.cognitiveProfile;
  if (!profile) return 'no-profile';

  return [
    profile.rollingAverage.toFixed(2),
    profile.stability,
    profile.bypassingFrequency.spiritual.toFixed(2),
    profile.bypassingFrequency.intellectual.toFixed(2),
  ].join('|');
}

function decisionsMatch(a: FieldRoutingDecision, b: FieldRoutingDecision): boolean {
  return (
    a.realm === b.realm &&
    a.fieldWorkSafe === b.fieldWorkSafe &&
    a.deepWorkRecommended === b.deepWorkRecommended &&
    a.maxSymbolicIntensity === b.maxSymbolicIntensity
  );
}

function getAccessLevel(decision: FieldRoutingDecision): number {
  const realmScore = {
    UNDERWORLD: 0,
    MIDDLEWORLD: 1,
    UPPERWORLD_SYMBOLIC: 2,
  }[decision.realm] || 0;

  const intensityScore = {
    low: 0,
    medium: 1,
    high: 2,
  }[decision.maxSymbolicIntensity] || 0;

  return realmScore + intensityScore * 0.5;
}

function getMaxBypassing(context: FieldRoutingContext): number {
  const profile = context.cognitiveProfile;
  if (!profile) return 0;

  return Math.max(
    profile.bypassingFrequency.spiritual,
    profile.bypassingFrequency.intellectual
  );
}

function validateTransition(
  prev: RoutingDecisionRecord,
  curr: RoutingDecisionRecord
): boolean {
  // Simplified logic: transition is logical if access change aligns with profile change
  const prevAlt = prev.context.cognitiveProfile?.rollingAverage || 0;
  const currAlt = curr.context.cognitiveProfile?.rollingAverage || 0;

  const prevAccess = getAccessLevel(prev.decision);
  const currAccess = getAccessLevel(curr.decision);

  // If altitude increased significantly, access should not decrease (unless bypassing increased)
  if (currAlt - prevAlt > 0.5 && currAccess < prevAccess) {
    const prevBypass = getMaxBypassing(prev.context);
    const currBypass = getMaxBypassing(curr.context);

    if (currBypass <= prevBypass) {
      return false; // Illogical
    }
  }

  return true;
}

function getTimeWindowKey(timestamp: string, windowMinutes: number): string {
  const date = new Date(timestamp);
  const roundedMinutes = Math.floor(date.getMinutes() / windowMinutes) * windowMinutes;
  date.setMinutes(roundedMinutes, 0, 0);
  return date.toISOString();
}

function alignDataByTimestamp(
  fieldMetrics: Array<{ timestamp: string; coherence: FieldCoherenceTensor }>,
  biometricData: BiometricData[],
  userReports: UserBreakthroughReport[]
): Array<{
  field: FieldCoherenceTensor;
  biometric: BiometricData;
  report: UserBreakthroughReport;
}> {
  // Simplified alignment - match by closest timestamp within 5 minutes
  const aligned: Array<{
    field: FieldCoherenceTensor;
    biometric: BiometricData;
    report: UserBreakthroughReport;
  }> = [];

  for (const fieldData of fieldMetrics) {
    const fieldTime = new Date(fieldData.timestamp).getTime();

    const closestBio = biometricData.reduce((closest, curr) => {
      const currTime = new Date(curr.timestamp).getTime();
      const closestTime = new Date(closest.timestamp).getTime();

      return Math.abs(currTime - fieldTime) < Math.abs(closestTime - fieldTime)
        ? curr
        : closest;
    });

    const closestReport = userReports.reduce((closest, curr) => {
      const currTime = new Date(curr.timestamp).getTime();
      const closestTime = new Date(closest.timestamp).getTime();

      return Math.abs(currTime - fieldTime) < Math.abs(closestTime - fieldTime)
        ? curr
        : closest;
    });

    // Only include if within 5 minutes
    if (
      Math.abs(new Date(closestBio.timestamp).getTime() - fieldTime) < 5 * 60 * 1000 &&
      Math.abs(new Date(closestReport.timestamp).getTime() - fieldTime) < 5 * 60 * 1000
    ) {
      aligned.push({
        field: fieldData.coherence,
        biometric: closestBio,
        report: closestReport,
      });
    }
  }

  return aligned;
}

function calculatePearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const meanX = mean(x);
  const meanY = mean(y);

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;

    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  const denom = Math.sqrt(denomX * denomY);
  return denom === 0 ? 0 : numerator / denom;
}

function calculateAgreement(predicted: boolean[], actual: boolean[]): number {
  if (predicted.length !== actual.length || predicted.length === 0) return 0;

  const matches = predicted.filter((p, i) => p === actual[i]).length;
  return matches / predicted.length;
}

function mean(arr: number[]): number {
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

function tTest(
  sample1: number[],
  sample2: number[]
): { t: number; p: number; df: number } {
  // Simplified t-test (would use real library in production)
  const mean1 = mean(sample1);
  const mean2 = mean(sample2);

  const variance1 =
    sample1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / (sample1.length - 1);
  const variance2 =
    sample2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / (sample2.length - 1);

  const pooledStdDev = Math.sqrt(
    (variance1 / sample1.length + variance2 / sample2.length)
  );

  const t = (mean1 - mean2) / pooledStdDev;
  const df = sample1.length + sample2.length - 2;

  // Simplified p-value (would use proper t-distribution in production)
  const p = Math.abs(t) > 1.96 ? 0.04 : 0.10; // Rough approximation

  return { t, p, df };
}
