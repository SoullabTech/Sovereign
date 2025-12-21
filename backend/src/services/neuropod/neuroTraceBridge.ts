/**
 * NEURO-TRACE CORRELATION BRIDGE
 * Phase 4.4-C: Neuropod Bridge — Biomarker-to-Facet Correlation
 *
 * Purpose:
 * - Correlate biomarker patterns with consciousness trace events
 * - Detect biosignal anomalies (spikes, drops) near facet transitions
 * - Generate insights like "Low HRV → W1 transition" or "High EEG alpha → Æ2 activation"
 * - Support analytics dashboard with neuro-facet correlation matrix
 *
 * Architecture:
 * - Query biomarkers within time windows around trace events
 * - Compute statistical measures (mean, stddev, delta) per signal type
 * - Map biosignal patterns to facet codes using heuristics
 * - Store correlation results in trace metadata (jsonb field)
 *
 * Sovereignty:
 * - All processing happens locally (no cloud ML services)
 * - No external biosignal analysis APIs
 * - User controls correlation sensitivity and time windows
 */

import { query } from "../../../../lib/db/postgres";
import type { FacetCode } from "../../../../lib/consciousness/spiralogic-facet-mapping";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Biomarker correlation result for a consciousness trace
 */
export interface NeuroTraceCorrelation {
  traceId: string;
  facetCode: FacetCode;
  timestamp: string;
  biomarkers: BiomarkerSummary[];
  patterns: CorrelationPattern[];
  insights: string[];
}

/**
 * Aggregated biomarker statistics for a time window
 */
export interface BiomarkerSummary {
  signalType: string;        // EEG, HRV, GSR, Breath
  sampleCount: number;
  avgValue: number;
  minValue: number;
  maxValue: number;
  stddevValue: number;
  avgQuality: number;
  deltaPrior: number;        // % change from prior window
}

/**
 * Detected biosignal pattern (e.g., "HRV drop", "EEG spike")
 */
export interface CorrelationPattern {
  signalType: string;
  patternType: "spike" | "drop" | "stable" | "oscillating";
  intensity: "low" | "medium" | "high";
  confidence: number;        // 0.0-1.0
  description: string;
}

/**
 * Configuration for correlation analysis
 */
export interface CorrelationConfig {
  timeWindowSeconds: number;      // Look back/forward N seconds from trace
  priorWindowSeconds: number;     // Baseline comparison window
  spikeThreshold: number;         // Stddev multiplier for spike detection (default: 2.0)
  dropThreshold: number;          // Stddev multiplier for drop detection (default: -2.0)
  minSampleCount: number;         // Minimum samples needed for correlation (default: 5)
  qualityThreshold: number;       // Minimum avg quality score (default: 0.7)
}

// ============================================================================
// CORRELATION ANALYSIS
// ============================================================================

/**
 * Analyze biomarker correlations for a consciousness trace
 */
export async function analyzeTraceCorrelation(
  traceId: string,
  config?: Partial<CorrelationConfig>
): Promise<NeuroTraceCorrelation | null> {
  const cfg: CorrelationConfig = {
    timeWindowSeconds: config?.timeWindowSeconds ?? 5,
    priorWindowSeconds: config?.priorWindowSeconds ?? 10,
    spikeThreshold: config?.spikeThreshold ?? 2.0,
    dropThreshold: config?.dropThreshold ?? -2.0,
    minSampleCount: config?.minSampleCount ?? 5,
    qualityThreshold: config?.qualityThreshold ?? 0.7,
  };

  // Fetch trace metadata
  const traceSql = `
    SELECT id, facet, created_at
    FROM consciousness_traces
    WHERE id = $1
  `;
  const traceResult = await query<{
    id: string;
    facet: string | null;
    created_at: Date;
  }>(traceSql, [traceId]);

  if (traceResult.rows.length === 0) {
    console.warn(`[Neuro-Trace Bridge] Trace not found: ${traceId}`);
    return null;
  }

  const trace = traceResult.rows[0];
  if (!trace.facet) {
    console.warn(`[Neuro-Trace Bridge] Trace has no facet: ${traceId}`);
    return null;
  }

  // Fetch biomarker summaries for current and prior windows
  const currentWindow = await fetchBiomarkerWindow(
    trace.created_at,
    cfg.timeWindowSeconds,
    cfg.qualityThreshold
  );

  const priorWindowEnd = new Date(trace.created_at.getTime() - cfg.timeWindowSeconds * 1000);
  const priorWindow = await fetchBiomarkerWindow(
    priorWindowEnd,
    cfg.priorWindowSeconds,
    cfg.qualityThreshold
  );

  // Compute biomarker summaries with delta from prior window
  const biomarkers = computeBiomarkerSummaries(currentWindow, priorWindow, cfg);

  // Detect patterns
  const patterns = detectPatterns(biomarkers, cfg);

  // Generate insights
  const insights = generateInsights(trace.facet as FacetCode, biomarkers, patterns);

  return {
    traceId: trace.id,
    facetCode: trace.facet as FacetCode,
    timestamp: trace.created_at.toISOString(),
    biomarkers,
    patterns,
    insights,
  };
}

/**
 * Batch analyze correlations for multiple traces
 */
export async function batchAnalyzeCorrelations(
  traceIds: string[],
  config?: Partial<CorrelationConfig>
): Promise<NeuroTraceCorrelation[]> {
  const results: NeuroTraceCorrelation[] = [];

  for (const traceId of traceIds) {
    const correlation = await analyzeTraceCorrelation(traceId, config);
    if (correlation) {
      results.push(correlation);
    }
  }

  return results;
}

/**
 * Analyze all recent traces (last N hours)
 */
export async function analyzeRecentTraces(
  hoursBack: number = 24,
  config?: Partial<CorrelationConfig>
): Promise<NeuroTraceCorrelation[]> {
  const sql = `
    SELECT id
    FROM consciousness_traces
    WHERE created_at >= NOW() - INTERVAL '${hoursBack} hours'
      AND facet IS NOT NULL
    ORDER BY created_at DESC
  `;

  const result = await query<{ id: string }>(sql);
  const traceIds = result.rows.map((row) => row.id);

  return batchAnalyzeCorrelations(traceIds, config);
}

// ============================================================================
// BIOMARKER AGGREGATION
// ============================================================================

interface BiomarkerRow {
  signal_type: string;
  value: number;
  quality_score: number | null;
}

/**
 * Fetch biomarker samples within time window
 */
async function fetchBiomarkerWindow(
  centerTime: Date,
  windowSeconds: number,
  qualityThreshold: number
): Promise<BiomarkerRow[]> {
  const sql = `
    SELECT signal_type, value, quality_score
    FROM consciousness_biomarkers
    WHERE sample_ts BETWEEN $1 AND $2
      AND (quality_score IS NULL OR quality_score >= $3)
    ORDER BY sample_ts ASC
  `;

  const startTime = new Date(centerTime.getTime() - windowSeconds * 1000);
  const endTime = new Date(centerTime.getTime() + windowSeconds * 1000);

  const result = await query<BiomarkerRow>(sql, [startTime, endTime, qualityThreshold]);

  return result.rows;
}

/**
 * Compute biomarker summaries with delta from prior window
 */
function computeBiomarkerSummaries(
  currentWindow: BiomarkerRow[],
  priorWindow: BiomarkerRow[],
  config: CorrelationConfig
): BiomarkerSummary[] {
  const summaries: BiomarkerSummary[] = [];

  // Group by signal type
  const signalTypes = new Set([
    ...currentWindow.map((r) => r.signal_type),
    ...priorWindow.map((r) => r.signal_type),
  ]);

  for (const signalType of signalTypes) {
    const currentSamples = currentWindow.filter((r) => r.signal_type === signalType);
    const priorSamples = priorWindow.filter((r) => r.signal_type === signalType);

    if (currentSamples.length < config.minSampleCount) {
      continue; // Not enough samples
    }

    const values = currentSamples.map((r) => r.value);
    const avgValue = mean(values);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const stddevValue = stddev(values);
    const avgQuality = mean(
      currentSamples.map((r) => r.quality_score ?? 1.0)
    );

    // Compute delta from prior window
    let deltaPrior = 0;
    if (priorSamples.length >= config.minSampleCount) {
      const priorAvg = mean(priorSamples.map((r) => r.value));
      deltaPrior = ((avgValue - priorAvg) / priorAvg) * 100;
    }

    summaries.push({
      signalType,
      sampleCount: currentSamples.length,
      avgValue,
      minValue,
      maxValue,
      stddevValue,
      avgQuality,
      deltaPrior,
    });
  }

  return summaries;
}

// ============================================================================
// PATTERN DETECTION
// ============================================================================

/**
 * Detect biosignal patterns (spikes, drops, oscillations)
 */
function detectPatterns(
  biomarkers: BiomarkerSummary[],
  config: CorrelationConfig
): CorrelationPattern[] {
  const patterns: CorrelationPattern[] = [];

  for (const bio of biomarkers) {
    // Spike detection (high delta)
    if (bio.deltaPrior > config.spikeThreshold * 10) {
      patterns.push({
        signalType: bio.signalType,
        patternType: "spike",
        intensity: bio.deltaPrior > 50 ? "high" : bio.deltaPrior > 20 ? "medium" : "low",
        confidence: Math.min(Math.abs(bio.deltaPrior) / 100, 1.0),
        description: `${bio.signalType} increased by ${bio.deltaPrior.toFixed(1)}%`,
      });
    }

    // Drop detection (low delta)
    if (bio.deltaPrior < config.dropThreshold * 10) {
      patterns.push({
        signalType: bio.signalType,
        patternType: "drop",
        intensity: bio.deltaPrior < -50 ? "high" : bio.deltaPrior < -20 ? "medium" : "low",
        confidence: Math.min(Math.abs(bio.deltaPrior) / 100, 1.0),
        description: `${bio.signalType} decreased by ${Math.abs(bio.deltaPrior).toFixed(1)}%`,
      });
    }

    // Stable signal (low variance)
    if (Math.abs(bio.deltaPrior) < 5 && bio.stddevValue < bio.avgValue * 0.1) {
      patterns.push({
        signalType: bio.signalType,
        patternType: "stable",
        intensity: "low",
        confidence: 0.8,
        description: `${bio.signalType} remained stable`,
      });
    }

    // Oscillating signal (high variance)
    if (bio.stddevValue > bio.avgValue * 0.3) {
      patterns.push({
        signalType: bio.signalType,
        patternType: "oscillating",
        intensity: bio.stddevValue > bio.avgValue * 0.5 ? "high" : "medium",
        confidence: 0.7,
        description: `${bio.signalType} showed high variability`,
      });
    }
  }

  return patterns;
}

// ============================================================================
// INSIGHT GENERATION
// ============================================================================

/**
 * Generate human-readable insights from patterns
 */
function generateInsights(
  facetCode: FacetCode,
  biomarkers: BiomarkerSummary[],
  patterns: CorrelationPattern[]
): string[] {
  const insights: string[] = [];

  // Facet-specific correlations
  const facetInsights: Record<string, (bio: BiomarkerSummary, pattern: CorrelationPattern) => string | null> = {
    W1: (bio, pattern) => {
      if (bio.signalType === "HRV" && pattern.patternType === "drop") {
        return "Low HRV detected → consistent with W1 (Safety/Containment) activation";
      }
      if (bio.signalType === "GSR" && pattern.patternType === "spike") {
        return "Elevated skin conductance → autonomic stress response (W1 territory)";
      }
      return null;
    },
    F2: (bio, pattern) => {
      if (bio.signalType === "EEG" && pattern.patternType === "spike" && pattern.intensity === "high") {
        return "High EEG activity → cognitive intensity matching F2 (Challenge/Will)";
      }
      if (bio.signalType === "Breath" && pattern.patternType === "spike") {
        return "Rapid breathing → heightened arousal (F2 activation pattern)";
      }
      return null;
    },
    A1: (bio, pattern) => {
      if (bio.signalType === "EEG" && pattern.patternType === "stable" && bio.avgValue >= 8 && bio.avgValue <= 12) {
        return "Stable alpha waves (8-12 Hz) → calm awareness (A1: Breath/Inquiry)";
      }
      if (bio.signalType === "Breath" && pattern.patternType === "stable") {
        return "Regulated breathing → embodied mindfulness (A1 signature)";
      }
      return null;
    },
    Æ2: (bio, pattern) => {
      if (bio.signalType === "EEG" && bio.avgValue < 8 && pattern.patternType === "stable") {
        return "Theta dominance → meditative/numinous state (Æ2: Union)";
      }
      return null;
    },
  };

  // Apply facet-specific insights
  const facetFn = facetInsights[facetCode];
  if (facetFn) {
    for (const bio of biomarkers) {
      for (const pattern of patterns.filter((p) => p.signalType === bio.signalType)) {
        const insight = facetFn(bio, pattern);
        if (insight) {
          insights.push(insight);
        }
      }
    }
  }

  // General patterns
  const hrvDrop = patterns.find((p) => p.signalType === "HRV" && p.patternType === "drop");
  const eegSpike = patterns.find((p) => p.signalType === "EEG" && p.patternType === "spike");

  if (hrvDrop && eegSpike) {
    insights.push("Low HRV + High EEG → cognitive stress or intense focus");
  }

  if (patterns.every((p) => p.patternType === "stable")) {
    insights.push("All biosignals stable → balanced physiological state");
  }

  return insights;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function stddev(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = mean(values);
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * EXAMPLE USAGE:
 *
 * ```typescript
 * import { analyzeTraceCorrelation, analyzeRecentTraces } from "./neuroTraceBridge";
 *
 * // Analyze single trace
 * const correlation = await analyzeTraceCorrelation("trace-uuid-123", {
 *   timeWindowSeconds: 5,
 *   spikeThreshold: 2.0
 * });
 * console.log(correlation.insights);
 * // ["Low HRV detected → consistent with W1 (Safety/Containment) activation"]
 *
 * // Analyze last 24 hours of traces
 * const recent = await analyzeRecentTraces(24);
 * console.log(`Analyzed ${recent.length} traces`);
 * ```
 */
