/**
 * REFLECTIVE AGENT SERVICE
 * Phase 4.6: Reflective Agentics — Self-Dialogue Engine
 *
 * Purpose:
 * - Generate reflective narratives by comparing current cycle to similar past cycles
 * - Compute facet and biosignal deltas across time
 * - Determine meta-layer (Aether) resonance codes
 * - Persist reflections to consciousness_reflections table
 *
 * Architecture:
 * - Queries mycelial memory for nearest cycle (vector similarity)
 * - Computes deltas (facets, coherence, biosignals)
 * - Synthesizes narrative via reflectiveNarrative library
 * - Saves reflection with full context
 *
 * Sovereignty:
 * - All narrative generation via local Ollama (no cloud APIs)
 * - Database queries via local PostgreSQL only
 * - Privacy-preserving symbolic summaries
 */

import { getClient } from '../../../../lib/db/postgres';
import { generateReflectiveNarrative } from '../../lib/reflectiveNarrative';
import type { FacetCode } from '../../../../lib/consciousness/spiralogic-facet-mapping';

// ============================================================================
// TYPES
// ============================================================================

export interface MycelialCycle {
  id: string;
  cycleId: string;
  startTs: Date;
  endTs: Date;
  dominantFacets: FacetCode[];
  facetDistribution: Record<FacetCode, number>;
  meanConfidence: number;
  totalTraces: number;
  meanArousal?: number;
  meanValence?: number;
  meanHrv?: number;
  meanEegAlpha?: number;
  totalBiomarkerSamples: number;
  coherenceScore: number;
  coherenceRationale?: string;
  summary: any;
  embedding?: number[];
}

export interface FacetDeltas {
  added: FacetCode[];      // Facets in current but not prior
  removed: FacetCode[];    // Facets in prior but not current
  stable: FacetCode[];     // Facets in both current and prior
}

export interface BiosignalDeltas {
  arousal?: number;        // Current - Prior
  valence?: number;
  hrv?: number;
  eegAlpha?: number;
}

export interface MetaLayerContext {
  code: 'Æ1' | 'Æ2' | 'Æ3' | null;
  trigger: string;
  confidence: number;
}

export interface Reflection {
  id: string;
  currentCycleId: string;
  priorCycleId: string | null;
  similarityScore: number;
  coherenceDelta: number;
  metaLayerCode: string | null;
  metaLayerTrigger: string | null;
  facetDeltas: FacetDeltas;
  biosignalDeltas: BiosignalDeltas;
  reflectionText: string;
  insights: string[];
  createdAt: Date;
}

// ============================================================================
// CORE REFLECTION GENERATION
// ============================================================================

/**
 * Generate a reflective narrative for the most recent mycelial cycle
 */
export async function generateReflection(
  options: {
    cycleId?: string;                // Optional: specific cycle ID (defaults to most recent)
    similarityThreshold?: number;    // Minimum similarity to trigger reflection (default: 0.7)
    maxDaysBetween?: number;         // Maximum days between cycles (default: 30)
  } = {}
): Promise<Reflection | null> {
  const { similarityThreshold = 0.7, maxDaysBetween = 30 } = options;

  const client = await getClient();

  try {
    // 1. Get current cycle
    const currentCycle = await (options.cycleId
      ? getCycleById(options.cycleId, client)
      : getMostRecentCycle(client));

    if (!currentCycle) {
      console.log('[ReflectiveAgent] No cycles available for reflection');
      return null;
    }

    if (!currentCycle.embedding) {
      console.log('[ReflectiveAgent] Current cycle has no embedding');
      return null;
    }

    // 2. Find most similar prior cycle
    const priorCycle = await findSimilarCycle(
      currentCycle.id,
      currentCycle.embedding,
      similarityThreshold,
      maxDaysBetween,
      client
    );

    if (!priorCycle) {
      console.log(`[ReflectiveAgent] No similar prior cycle found (threshold: ${similarityThreshold})`);
      return null;
    }

    // 3. Compute deltas
    const facetDeltas = computeFacetDeltas(currentCycle.dominantFacets, priorCycle.dominantFacets);
    const biosignalDeltas = computeBiosignalDeltas(currentCycle, priorCycle);
    const coherenceDelta = currentCycle.coherenceScore - priorCycle.coherenceScore;

    // 4. Determine meta-layer context
    const metaLayer = determineMetaLayer(facetDeltas, coherenceDelta, priorCycle.similarity);

    // 5. Generate narrative
    const narrative = await generateReflectiveNarrative({
      current: currentCycle,
      prior: priorCycle,
      facetDeltas,
      biosignalDeltas,
      coherenceDelta,
      metaLayer,
    });

    // 6. Persist reflection
    const reflection = await saveReflection({
      currentCycleId: currentCycle.id,
      priorCycleId: priorCycle.id,
      similarityScore: priorCycle.similarity,
      coherenceDelta,
      metaLayerCode: metaLayer.code,
      metaLayerTrigger: metaLayer.trigger,
      facetDeltas,
      biosignalDeltas,
      reflectionText: narrative.text,
      insights: narrative.insights,
    }, client);

    console.log(`[ReflectiveAgent] Reflection generated: ${reflection.id}`);
    return reflection;

  } finally {
    client.release();
  }
}

// ============================================================================
// DATABASE QUERIES
// ============================================================================

async function getMostRecentCycle(client: any): Promise<MycelialCycle | null> {
  const result = await client.query(
    `SELECT
       id,
       cycle_id AS "cycleId",
       start_ts AS "startTs",
       end_ts AS "endTs",
       dominant_facets AS "dominantFacets",
       facet_distribution AS "facetDistribution",
       mean_confidence AS "meanConfidence",
       total_traces AS "totalTraces",
       mean_arousal AS "meanArousal",
       mean_valence AS "meanValence",
       mean_hrv AS "meanHrv",
       mean_eeg_alpha AS "meanEegAlpha",
       total_biomarker_samples AS "totalBiomarkerSamples",
       coherence_score AS "coherenceScore",
       coherence_rationale AS "coherenceRationale",
       summary,
       embedding
     FROM consciousness_mycelium
     ORDER BY start_ts DESC
     LIMIT 1`
  );

  return result.rows.length > 0 ? result.rows[0] : null;
}

async function getCycleById(cycleId: string, client: any): Promise<MycelialCycle | null> {
  const result = await client.query(
    `SELECT
       id,
       cycle_id AS "cycleId",
       start_ts AS "startTs",
       end_ts AS "endTs",
       dominant_facets AS "dominantFacets",
       facet_distribution AS "facetDistribution",
       mean_confidence AS "meanConfidence",
       total_traces AS "totalTraces",
       mean_arousal AS "meanArousal",
       mean_valence AS "meanValence",
       mean_hrv AS "meanHrv",
       mean_eeg_alpha AS "meanEegAlpha",
       total_biomarker_samples AS "totalBiomarkerSamples",
       coherence_score AS "coherenceScore",
       coherence_rationale AS "coherenceRationale",
       summary,
       embedding
     FROM consciousness_mycelium
     WHERE id = $1`,
    [cycleId]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
}

async function findSimilarCycle(
  currentId: string,
  currentEmbedding: number[],
  similarityThreshold: number,
  maxDaysBetween: number,
  client: any
): Promise<(MycelialCycle & { similarity: number }) | null> {
  const embeddingStr = `[${currentEmbedding.join(',')}]`;

  const result = await client.query(
    `SELECT
       id,
       cycle_id AS "cycleId",
       start_ts AS "startTs",
       end_ts AS "endTs",
       dominant_facets AS "dominantFacets",
       facet_distribution AS "facetDistribution",
       mean_confidence AS "meanConfidence",
       total_traces AS "totalTraces",
       mean_arousal AS "meanArousal",
       mean_valence AS "meanValence",
       mean_hrv AS "meanHrv",
       mean_eeg_alpha AS "meanEegAlpha",
       total_biomarker_samples AS "totalBiomarkerSamples",
       coherence_score AS "coherenceScore",
       coherence_rationale AS "coherenceRationale",
       summary,
       embedding,
       1 - (embedding <=> $1::vector) AS similarity
     FROM consciousness_mycelium
     WHERE id != $2
       AND embedding IS NOT NULL
       AND start_ts >= NOW() - INTERVAL '${maxDaysBetween} days'
       AND 1 - (embedding <=> $1::vector) >= $3
     ORDER BY embedding <=> $1::vector
     LIMIT 1`,
    [embeddingStr, currentId, similarityThreshold]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
}

async function saveReflection(
  data: {
    currentCycleId: string;
    priorCycleId: string | null;
    similarityScore: number;
    coherenceDelta: number;
    metaLayerCode: string | null;
    metaLayerTrigger: string | null;
    facetDeltas: FacetDeltas;
    biosignalDeltas: BiosignalDeltas;
    reflectionText: string;
    insights: string[];
  },
  client: any
): Promise<Reflection> {
  const result = await client.query(
    `INSERT INTO consciousness_reflections (
       current_cycle_id,
       prior_cycle_id,
       similarity_score,
       coherence_delta,
       meta_layer_code,
       meta_layer_trigger,
       facet_deltas,
       biosignal_deltas,
       reflection_text,
       insights
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING
       id,
       current_cycle_id AS "currentCycleId",
       prior_cycle_id AS "priorCycleId",
       similarity_score AS "similarityScore",
       coherence_delta AS "coherenceDelta",
       meta_layer_code AS "metaLayerCode",
       meta_layer_trigger AS "metaLayerTrigger",
       facet_deltas AS "facetDeltas",
       biosignal_deltas AS "biosignalDeltas",
       reflection_text AS "reflectionText",
       insights,
       created_at AS "createdAt"`,
    [
      data.currentCycleId,
      data.priorCycleId,
      data.similarityScore,
      data.coherenceDelta,
      data.metaLayerCode,
      data.metaLayerTrigger,
      JSON.stringify(data.facetDeltas),
      JSON.stringify(data.biosignalDeltas),
      data.reflectionText,
      JSON.stringify(data.insights),
    ]
  );

  return result.rows[0];
}

// ============================================================================
// DELTA COMPUTATION
// ============================================================================

function computeFacetDeltas(current: FacetCode[], prior: FacetCode[]): FacetDeltas {
  const currentSet = new Set(current);
  const priorSet = new Set(prior);

  const added = current.filter((f) => !priorSet.has(f));
  const removed = prior.filter((f) => !currentSet.has(f));
  const stable = current.filter((f) => priorSet.has(f));

  return { added, removed, stable };
}

function computeBiosignalDeltas(current: MycelialCycle, prior: MycelialCycle): BiosignalDeltas {
  const deltas: BiosignalDeltas = {};

  if (current.meanArousal !== undefined && prior.meanArousal !== undefined) {
    deltas.arousal = current.meanArousal - prior.meanArousal;
  }

  if (current.meanValence !== undefined && prior.meanValence !== undefined) {
    deltas.valence = current.meanValence - prior.meanValence;
  }

  if (current.meanHrv !== undefined && prior.meanHrv !== undefined) {
    deltas.hrv = current.meanHrv - prior.meanHrv;
  }

  if (current.meanEegAlpha !== undefined && prior.meanEegAlpha !== undefined) {
    deltas.eegAlpha = current.meanEegAlpha - prior.meanEegAlpha;
  }

  return deltas;
}

// ============================================================================
// META-LAYER DETERMINATION
// ============================================================================

function determineMetaLayer(
  facetDeltas: FacetDeltas,
  coherenceDelta: number,
  similarity: number
): MetaLayerContext {
  // Æ1: Intuition / Signal (low similarity, high change)
  if (similarity < 0.75 || Math.abs(coherenceDelta) > 0.3) {
    return {
      code: 'Æ1',
      trigger: 'Significant state change detected',
      confidence: 1 - similarity,
    };
  }

  // Æ3: Emergence / Creative (high similarity, positive coherence)
  if (similarity > 0.85 && coherenceDelta > 0.15) {
    return {
      code: 'Æ3',
      trigger: 'High resonance with developmental improvement',
      confidence: similarity * coherenceDelta,
    };
  }

  // Æ2: Union / Numinous (high similarity, stable coherence)
  if (similarity > 0.8 && Math.abs(coherenceDelta) < 0.1) {
    return {
      code: 'Æ2',
      trigger: 'Resonance with stable integration',
      confidence: similarity,
    };
  }

  // No meta-layer activation
  return {
    code: null,
    trigger: 'Below meta-layer activation threshold',
    confidence: 0,
  };
}

// ============================================================================
// QUERY HELPERS
// ============================================================================

/**
 * Get all reflections for a specific cycle
 */
export async function getReflectionsForCycle(cycleId: string): Promise<Reflection[]> {
  const client = await getClient();

  try {
    const result = await client.query(
      `SELECT
         id,
         current_cycle_id AS "currentCycleId",
         prior_cycle_id AS "priorCycleId",
         similarity_score AS "similarityScore",
         coherence_delta AS "coherenceDelta",
         meta_layer_code AS "metaLayerCode",
         meta_layer_trigger AS "metaLayerTrigger",
         facet_deltas AS "facetDeltas",
         biosignal_deltas AS "biosignalDeltas",
         reflection_text AS "reflectionText",
         insights,
         created_at AS "createdAt"
       FROM consciousness_reflections
       WHERE current_cycle_id = $1
       ORDER BY created_at DESC`,
      [cycleId]
    );

    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Get recent reflections across all cycles
 */
export async function getRecentReflections(limit: number = 10): Promise<Reflection[]> {
  const client = await getClient();

  try {
    const result = await client.query(
      `SELECT
         id,
         current_cycle_id AS "currentCycleId",
         prior_cycle_id AS "priorCycleId",
         similarity_score AS "similarityScore",
         coherence_delta AS "coherenceDelta",
         meta_layer_code AS "metaLayerCode",
         meta_layer_trigger AS "metaLayerTrigger",
         facet_deltas AS "facetDeltas",
         biosignal_deltas AS "biosignalDeltas",
         reflection_text AS "reflectionText",
         insights,
         created_at AS "createdAt"
       FROM consciousness_reflections
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  } finally {
    client.release();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  generateReflection,
  getReflectionsForCycle,
  getRecentReflections,
};
