/**
 * MYCELIAL MEMORY SERVICE
 * Phase 4.5: Temporal Consciousness Fusion Engine
 *
 * Purpose:
 * - Aggregate consciousness traces + biosignals into time-windowed "cycles"
 * - Compute coherence scores (facet-biosignal alignment)
 * - Generate symbolic embeddings via local Ollama
 * - Persist compressed memory nodes to consciousness_mycelium table
 *
 * Architecture:
 * - Runs periodically (cron job or manual trigger)
 * - Default cycle: 24 hours
 * - Embedding: 256-dim vector (symbolic text + biomarker features)
 * - Privacy-preserving: symbolic compression, no raw conversation data
 */

import { query } from "../../../../lib/db/postgres";
import { embedSymbolic } from "../../lib/symbolicEmbedding";
import type { FacetCode } from "../../../../lib/consciousness/spiralogic-facet-mapping";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Mycelial cycle configuration
 */
export interface MycelialCycleConfig {
  cycleLengthHours: number;     // Default: 24 hours
  minTracesRequired: number;    // Minimum traces to generate cycle (default: 5)
  minBiomarkersRequired: number; // Minimum biomarker samples (default: 100)
  userId?: string;              // Optional: filter by user
}

/**
 * Mycelial cycle data (aggregated from DB)
 */
export interface MycelialCycleData {
  cycleId: string;
  startTs: Date;
  endTs: Date;

  // Trace aggregation
  traces: Array<{
    facet: FacetCode;
    confidence: number;
    trace: unknown;
    created_at: Date;
  }>;

  // Biomarker aggregation
  biomarkers: Array<{
    signal_type: string;
    avg_value: number;
    sample_count: number;
  }>;

  // Computed metrics
  dominantFacets: FacetCode[];
  facetDistribution: Record<string, number>;
  meanConfidence: number;
  totalTraces: number;

  meanArousal: number;
  meanValence: number;
  meanHrv?: number;
  meanEegAlpha?: number;
  totalBiomarkerSamples: number;

  coherenceScore: number;
  coherenceRationale: string;
}

/**
 * Mycelial cycle summary (for DB storage)
 */
export interface MycelialCycleSummary {
  insights: string[];
  dominantPatterns: string[];
  notes: string;
}

// ============================================================================
// CYCLE GENERATION
// ============================================================================

/**
 * Generate mycelial memory snapshot for a time window
 */
export async function generateMycelialCycle(
  config?: Partial<MycelialCycleConfig>
): Promise<string | null> {
  const cfg: MycelialCycleConfig = {
    cycleLengthHours: config?.cycleLengthHours ?? 24,
    minTracesRequired: config?.minTracesRequired ?? 5,
    minBiomarkersRequired: config?.minBiomarkersRequired ?? 100,
    userId: config?.userId,
  };

  // Calculate time window
  const endTs = new Date();
  const startTs = new Date(endTs.getTime() - cfg.cycleLengthHours * 60 * 60 * 1000);
  const cycleId = `cycle_${startTs.toISOString().split('T')[0]}_${startTs.getUTCHours().toString().padStart(2, '0')}`;

  console.log(`[Mycelial Memory] Generating cycle: ${cycleId}`);
  console.log(`[Mycelial Memory] Time window: ${startTs.toISOString()} → ${endTs.toISOString()}`);

  // Check if cycle already exists
  const existing = await query(
    `SELECT id FROM consciousness_mycelium WHERE cycle_id = $1`,
    [cycleId]
  );

  if (existing.rows.length > 0) {
    console.log(`[Mycelial Memory] Cycle ${cycleId} already exists, skipping`);
    return null;
  }

  // Aggregate traces
  const traces = await aggregateTraces(startTs, endTs, cfg.userId);
  if (traces.length < cfg.minTracesRequired) {
    console.log(`[Mycelial Memory] Insufficient traces (${traces.length} < ${cfg.minTracesRequired}), skipping`);
    return null;
  }

  // Aggregate biomarkers
  const biomarkers = await aggregateBiomarkers(startTs, endTs);
  const totalBiomarkerSamples = biomarkers.reduce((sum, b) => sum + b.sample_count, 0);

  if (totalBiomarkerSamples < cfg.minBiomarkersRequired) {
    console.log(`[Mycelial Memory] Insufficient biomarkers (${totalBiomarkerSamples} < ${cfg.minBiomarkersRequired}), skipping`);
    return null;
  }

  // Compute cycle metrics
  const cycleData = await computeCycleMetrics(cycleId, startTs, endTs, traces, biomarkers);

  // Generate symbolic embedding
  const embedding = await embedSymbolic(traces, biomarkers);

  // Generate summary
  const summary = generateCycleSummary(cycleData);

  // Persist to database
  await persistCycle(cycleData, embedding, summary);

  console.log(`[Mycelial Memory] Cycle ${cycleId} generated successfully`);
  console.log(`[Mycelial Memory] Coherence: ${cycleData.coherenceScore.toFixed(3)}, Traces: ${cycleData.totalTraces}, Biomarkers: ${cycleData.totalBiomarkerSamples}`);

  return cycleId;
}

/**
 * Generate cycles for the last N days
 */
export async function generateHistoricalCycles(daysBack: number = 7): Promise<string[]> {
  const cycleIds: string[] = [];

  for (let dayOffset = 0; dayOffset < daysBack; dayOffset++) {
    const endTs = new Date();
    endTs.setDate(endTs.getDate() - dayOffset);
    endTs.setHours(23, 59, 59, 999);

    const startTs = new Date(endTs);
    startTs.setHours(0, 0, 0, 0);

    const cycleId = `cycle_${startTs.toISOString().split('T')[0]}_00`;

    try {
      const result = await generateMycelialCycle({
        cycleLengthHours: 24,
        minTracesRequired: 5,
        minBiomarkersRequired: 50 // Lower threshold for historical data
      });

      if (result) {
        cycleIds.push(result);
      }
    } catch (error) {
      console.error(`[Mycelial Memory] Failed to generate cycle ${cycleId}:`, error);
    }
  }

  return cycleIds;
}

// ============================================================================
// DATA AGGREGATION
// ============================================================================

/**
 * Aggregate consciousness traces for time window
 */
async function aggregateTraces(
  startTs: Date,
  endTs: Date,
  userId?: string
): Promise<MycelialCycleData['traces']> {
  const sql = `
    SELECT
      facet,
      confidence,
      trace,
      created_at
    FROM consciousness_traces
    WHERE created_at BETWEEN $1 AND $2
      AND facet IS NOT NULL
      ${userId ? 'AND user_id = $3' : ''}
    ORDER BY created_at ASC
  `;

  const params = userId ? [startTs, endTs, userId] : [startTs, endTs];
  const result = await query<{
    facet: string;
    confidence: number;
    trace: unknown;
    created_at: Date;
  }>(sql, params);

  return result.rows.map(row => ({
    facet: row.facet as FacetCode,
    confidence: row.confidence,
    trace: row.trace,
    created_at: row.created_at
  }));
}

/**
 * Aggregate biomarker data for time window
 */
async function aggregateBiomarkers(
  startTs: Date,
  endTs: Date
): Promise<MycelialCycleData['biomarkers']> {
  const sql = `
    SELECT
      signal_type,
      AVG(value) AS avg_value,
      COUNT(*) AS sample_count
    FROM consciousness_biomarkers
    WHERE sample_ts BETWEEN $1 AND $2
      AND (quality_score IS NULL OR quality_score >= 0.7)
    GROUP BY signal_type
  `;

  const result = await query<{
    signal_type: string;
    avg_value: number;
    sample_count: number;
  }>(sql, [startTs, endTs]);

  return result.rows;
}

// ============================================================================
// METRIC COMPUTATION
// ============================================================================

/**
 * Compute all cycle metrics from aggregated data
 */
async function computeCycleMetrics(
  cycleId: string,
  startTs: Date,
  endTs: Date,
  traces: MycelialCycleData['traces'],
  biomarkers: MycelialCycleData['biomarkers']
): Promise<MycelialCycleData> {
  // Facet distribution
  const facetCounts: Record<string, number> = {};
  for (const trace of traces) {
    facetCounts[trace.facet] = (facetCounts[trace.facet] || 0) + 1;
  }

  // Dominant facets (top 5)
  const dominantFacets = Object.entries(facetCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([facet]) => facet as FacetCode);

  // Mean confidence
  const meanConfidence = traces.reduce((sum, t) => sum + t.confidence, 0) / traces.length;

  // Biosignal metrics
  const hrvData = biomarkers.find(b => b.signal_type === 'HRV');
  const eegData = biomarkers.find(b => b.signal_type === 'EEG');
  const gsrData = biomarkers.find(b => b.signal_type === 'GSR');
  const breathData = biomarkers.find(b => b.signal_type === 'Breath');

  // Compute arousal (normalized GSR + Breath)
  const arousal = gsrData || breathData
    ? ((gsrData?.avg_value || 0) / 10 + (breathData?.avg_value || 0) / 20) / 2
    : 0.5;

  // Compute valence (HRV proxy: higher = more positive)
  const valence = hrvData
    ? (hrvData.avg_value - 40) / 40 // Normalize around 40ms baseline
    : 0;

  // Compute coherence score
  const { coherenceScore, rationale } = computeCoherence(
    dominantFacets,
    {
      hrv: hrvData?.avg_value,
      eeg: eegData?.avg_value,
      gsr: gsrData?.avg_value,
      breath: breathData?.avg_value
    }
  );

  return {
    cycleId,
    startTs,
    endTs,
    traces,
    biomarkers,
    dominantFacets,
    facetDistribution: facetCounts,
    meanConfidence,
    totalTraces: traces.length,
    meanArousal: arousal,
    meanValence: valence,
    meanHrv: hrvData?.avg_value,
    meanEegAlpha: eegData?.avg_value,
    totalBiomarkerSamples: biomarkers.reduce((sum, b) => sum + b.sample_count, 0),
    coherenceScore,
    coherenceRationale: rationale
  };
}

/**
 * Compute coherence between facets and biosignals
 */
function computeCoherence(
  dominantFacets: FacetCode[],
  biosignals: {
    hrv?: number;
    eeg?: number;
    gsr?: number;
    breath?: number;
  }
): { coherenceScore: number; rationale: string } {
  let coherenceScore = 0.5; // Baseline
  const insights: string[] = [];

  // W1 (Safety) → Low HRV correlation
  if (dominantFacets.includes('W1') && biosignals.hrv) {
    if (biosignals.hrv < 45) {
      coherenceScore += 0.15;
      insights.push('W1 (Safety) correlates with low HRV (autonomic stress)');
    } else {
      coherenceScore -= 0.1;
      insights.push('W1 (Safety) present but HRV normal (unexpected)');
    }
  }

  // F2 (Challenge) → High EEG correlation
  if (dominantFacets.includes('F2') && biosignals.eeg) {
    if (biosignals.eeg > 12) {
      coherenceScore += 0.15;
      insights.push('F2 (Challenge) aligns with elevated EEG (cognitive intensity)');
    }
  }

  // A1 (Awareness) → Stable alpha waves
  if (dominantFacets.includes('A1') && biosignals.eeg) {
    if (biosignals.eeg >= 8 && biosignals.eeg <= 12) {
      coherenceScore += 0.2;
      insights.push('A1 (Awareness) correlates with stable alpha waves (calm focus)');
    }
  }

  // Æ2 (Numinous Union) → Theta dominance
  if (dominantFacets.includes('Æ2') && biosignals.eeg) {
    if (biosignals.eeg < 8) {
      coherenceScore += 0.2;
      insights.push('Æ2 (Union) aligns with theta dominance (meditative state)');
    }
  }

  // Clamp to [0, 1]
  coherenceScore = Math.max(0, Math.min(1, coherenceScore));

  const rationale = insights.length > 0
    ? insights.join('. ')
    : 'No strong facet-biosignal correlations detected';

  return { coherenceScore, rationale };
}

// ============================================================================
// SUMMARY GENERATION
// ============================================================================

/**
 * Generate human-readable cycle summary
 */
function generateCycleSummary(cycleData: MycelialCycleData): MycelialCycleSummary {
  const insights: string[] = [];
  const dominantPatterns: string[] = [];

  // Facet insights
  if (cycleData.dominantFacets.length > 0) {
    const topFacet = cycleData.dominantFacets[0];
    const count = cycleData.facetDistribution[topFacet];
    insights.push(`Primary facet: ${topFacet} (${count} traces)`);

    // Multi-facet pattern detection
    if (cycleData.dominantFacets.includes('W1') && cycleData.dominantFacets.includes('F2')) {
      dominantPatterns.push('W1→F2 transition (Safety to Challenge)');
    }

    if (cycleData.dominantFacets.includes('F2') && cycleData.dominantFacets.includes('A1')) {
      dominantPatterns.push('F2→A1 transition (Challenge to Awareness)');
    }
  }

  // Biosignal insights
  if (cycleData.meanHrv && cycleData.meanHrv < 40) {
    insights.push(`Low HRV detected (${cycleData.meanHrv.toFixed(1)}ms) — autonomic stress`);
  }

  if (cycleData.meanEegAlpha && cycleData.meanEegAlpha >= 8 && cycleData.meanEegAlpha <= 12) {
    insights.push(`Alpha waves present (${cycleData.meanEegAlpha.toFixed(1)}Hz) — relaxed focus`);
  }

  // Coherence insight
  if (cycleData.coherenceScore > 0.7) {
    insights.push('High coherence: facets align well with physiological state');
  } else if (cycleData.coherenceScore < 0.4) {
    insights.push('Low coherence: facets may not reflect physiological state');
  }

  const notes = `Cycle generated with ${cycleData.totalTraces} traces and ${cycleData.totalBiomarkerSamples} biomarker samples. ` +
    `Mean confidence: ${(cycleData.meanConfidence * 100).toFixed(1)}%. ` +
    `Coherence: ${(cycleData.coherenceScore * 100).toFixed(1)}%.`;

  return { insights, dominantPatterns, notes };
}

// ============================================================================
// DATABASE PERSISTENCE
// ============================================================================

/**
 * Persist cycle to consciousness_mycelium table
 */
async function persistCycle(
  cycleData: MycelialCycleData,
  embedding: number[],
  summary: MycelialCycleSummary
): Promise<void> {
  const sql = `
    INSERT INTO consciousness_mycelium (
      cycle_id,
      start_ts,
      end_ts,
      dominant_facets,
      facet_distribution,
      mean_confidence,
      total_traces,
      mean_arousal,
      mean_valence,
      mean_hrv,
      mean_eeg_alpha,
      total_biomarker_samples,
      coherence_score,
      coherence_rationale,
      summary,
      embedding
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
  `;

  await query(sql, [
    cycleData.cycleId,
    cycleData.startTs,
    cycleData.endTs,
    cycleData.dominantFacets,
    JSON.stringify(cycleData.facetDistribution),
    cycleData.meanConfidence,
    cycleData.totalTraces,
    cycleData.meanArousal,
    cycleData.meanValence,
    cycleData.meanHrv,
    cycleData.meanEegAlpha,
    cycleData.totalBiomarkerSamples,
    cycleData.coherenceScore,
    cycleData.coherenceRationale,
    JSON.stringify(summary),
    `[${embedding.join(',')}]` // PostgreSQL vector format
  ]);
}

/**
 * EXAMPLE USAGE:
 *
 * ```typescript
 * // Generate cycle for last 24 hours
 * import { generateMycelialCycle } from './mycelialMemoryService';
 * const cycleId = await generateMycelialCycle();
 * console.log(`Generated cycle: ${cycleId}`);
 *
 * // Generate historical cycles for last 7 days
 * import { generateHistoricalCycles } from './mycelialMemoryService';
 * const cycleIds = await generateHistoricalCycles(7);
 * console.log(`Generated ${cycleIds.length} historical cycles`);
 * ```
 */
