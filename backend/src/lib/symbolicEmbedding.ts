/**
 * SYMBOLIC EMBEDDING ENGINE
 * Phase 4.5: Mycelial Memory — Local Ollama Integration
 *
 * Purpose:
 * - Generate 256-dimensional embeddings fusing symbolic + physiological state
 * - Use local Ollama API (no external services)
 * - Compress consciousness traces + biosignals into unified latent space
 *
 * Architecture:
 * - Takes consciousness traces (symbolic text) + biomarker data (numeric features)
 * - Generates text prompt encoding both symbolic and physiological state
 * - Calls local Ollama embeddings endpoint
 * - Returns normalized 256-dim vector for pgvector storage
 *
 * Sovereignty:
 * - All embeddings generated locally via Ollama
 * - No external API calls (OpenAI, Anthropic, etc.)
 * - Privacy-preserving: symbolic compression, no raw conversation text
 */

import type { FacetCode } from '../../../lib/consciousness/spiralogic-facet-mapping';

// ============================================================================
// TYPES
// ============================================================================

export interface SymbolicInput {
  /** Dominant facet codes (e.g., ["W1", "F2", "A1"]) */
  dominantFacets: FacetCode[];

  /** Facet distribution (e.g., {"W1": 15, "F2": 12}) */
  facetDistribution: Record<FacetCode, number>;

  /** Mean confidence score across traces */
  meanConfidence: number;

  /** Total number of traces in cycle */
  totalTraces: number;

  /** Optional symbolic summary/insights */
  summary?: string;
}

export interface PhysiologicalInput {
  /** Mean arousal (0.0-1.0) */
  meanArousal?: number;

  /** Mean valence (-1.0 to +1.0) */
  meanValence?: number;

  /** Mean heart rate variability (ms) */
  meanHrv?: number;

  /** Mean EEG alpha power (Hz) */
  meanEegAlpha?: number;

  /** Coherence score (0.0-1.0) */
  coherenceScore?: number;
}

export interface EmbeddingConfig {
  /** Ollama API base URL */
  ollamaUrl: string;

  /** Ollama model name for embeddings */
  modelName: string;

  /** Target embedding dimension (default: 256) */
  embeddingDim: number;

  /** Request timeout (ms) */
  timeoutMs: number;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_CONFIG: EmbeddingConfig = {
  ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
  modelName: process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text',
  embeddingDim: 256,
  timeoutMs: 30000,
};

// ============================================================================
// FACET SEMANTIC DESCRIPTIONS
// ============================================================================

/**
 * Maps facet codes to semantic descriptions for embedding
 * (Uses unified ontology from phase4.4a-12facet-expansion)
 */
const FACET_SEMANTICS: Record<FacetCode, string> = {
  // Fire: Activation, intensity, transformation
  F1: 'Spark of desire and initial activation',
  F2: 'Flame of challenge and sustained will',
  F3: 'Forge of integration and alchemical transformation',

  // Water: Emotion, safety, depth
  W1: 'Spring of safety and containment',
  W2: 'River of emotional flow and navigation',
  W3: 'Ocean of surrender and dissolution',

  // Earth: Grounding, structure, pattern
  E1: 'Seed of embodiment and rooting',
  E2: 'Grove of pattern recognition and interconnection',
  E3: 'Mountain of foundation and wisdom lineage',

  // Air: Clarity, perspective, freedom
  A1: 'Breath of awareness and presence',
  A2: 'Wind of perspective and detachment',
  A3: 'Sky of witnessing and spacious freedom',

  // Aether: Meta-awareness, transcendence, integration
  Æ1: 'Liminal threshold and sacred pause',
  Æ2: 'Synergy of unified coherence',
  Æ3: 'Quintessence of sovereignty and completion',
};

// ============================================================================
// EMBEDDING GENERATION
// ============================================================================

/**
 * Generate 256-dimensional embedding for a mycelial cycle
 * Fuses symbolic (facets) + physiological (biosignals) state
 */
export async function generateMycelialEmbedding(
  symbolic: SymbolicInput,
  physiological: PhysiologicalInput,
  config: Partial<EmbeddingConfig> = {}
): Promise<number[] | null> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  try {
    // 1. Generate symbolic-physiological fusion prompt
    const prompt = generateFusionPrompt(symbolic, physiological);

    // 2. Call Ollama embeddings endpoint
    const embedding = await callOllamaEmbedding(prompt, cfg);

    // 3. Normalize to target dimension (pad or truncate)
    const normalized = normalizeEmbedding(embedding, cfg.embeddingDim);

    // 4. Apply L2 normalization for cosine similarity
    const l2Normalized = l2Normalize(normalized);

    return l2Normalized;
  } catch (error) {
    console.error('[SymbolicEmbedding] Failed to generate embedding:', error);
    return null;
  }
}

/**
 * Generate fusion prompt encoding symbolic + physiological state
 */
function generateFusionPrompt(
  symbolic: SymbolicInput,
  physiological: PhysiologicalInput
): string {
  const parts: string[] = [];

  // 1. Dominant facets with semantic descriptions
  if (symbolic.dominantFacets.length > 0) {
    const facetDescriptions = symbolic.dominantFacets
      .map(fc => `${fc}: ${FACET_SEMANTICS[fc]}`)
      .join(', ');
    parts.push(`Consciousness facets: ${facetDescriptions}`);
  }

  // 2. Facet distribution (proportions)
  if (symbolic.facetDistribution && Object.keys(symbolic.facetDistribution).length > 0) {
    const total = Object.values(symbolic.facetDistribution).reduce((sum, n) => sum + n, 0);
    const proportions = Object.entries(symbolic.facetDistribution)
      .map(([fc, count]) => `${fc}:${Math.round((count / total) * 100)}%`)
      .join(', ');
    parts.push(`Distribution: ${proportions}`);
  }

  // 3. Symbolic summary/insights
  if (symbolic.summary) {
    parts.push(`Summary: ${symbolic.summary}`);
  }

  // 4. Physiological state (biosignals)
  const bioSignals: string[] = [];

  if (physiological.meanArousal !== undefined) {
    const arousalLevel =
      physiological.meanArousal > 0.7 ? 'high' :
      physiological.meanArousal > 0.4 ? 'moderate' : 'low';
    bioSignals.push(`arousal: ${arousalLevel} (${physiological.meanArousal.toFixed(2)})`);
  }

  if (physiological.meanValence !== undefined) {
    const valenceLabel =
      physiological.meanValence > 0.3 ? 'positive' :
      physiological.meanValence < -0.3 ? 'negative' : 'neutral';
    bioSignals.push(`valence: ${valenceLabel} (${physiological.meanValence.toFixed(2)})`);
  }

  if (physiological.meanHrv !== undefined) {
    const hrvLevel =
      physiological.meanHrv > 60 ? 'high' :
      physiological.meanHrv > 40 ? 'moderate' : 'low';
    bioSignals.push(`HRV: ${hrvLevel} (${physiological.meanHrv.toFixed(1)}ms)`);
  }

  if (physiological.meanEegAlpha !== undefined) {
    const eegLevel =
      physiological.meanEegAlpha > 12 ? 'high' :
      physiological.meanEegAlpha > 8 ? 'moderate' : 'low';
    bioSignals.push(`EEG alpha: ${eegLevel} (${physiological.meanEegAlpha.toFixed(1)}Hz)`);
  }

  if (bioSignals.length > 0) {
    parts.push(`Biosignals: ${bioSignals.join(', ')}`);
  }

  // 5. Coherence score (symbolic-physiological alignment)
  if (physiological.coherenceScore !== undefined) {
    const coherenceLevel =
      physiological.coherenceScore > 0.7 ? 'high' :
      physiological.coherenceScore > 0.4 ? 'moderate' : 'low';
    parts.push(`Coherence: ${coherenceLevel} (${physiological.coherenceScore.toFixed(2)})`);
  }

  // 6. Meta-context: total traces and confidence
  parts.push(`Activity: ${symbolic.totalTraces} traces, mean confidence ${symbolic.meanConfidence.toFixed(2)}`);

  return parts.join('. ');
}

/**
 * Call Ollama embeddings API
 */
async function callOllamaEmbedding(
  prompt: string,
  config: EmbeddingConfig
): Promise<number[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(`${config.ollamaUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.modelName,
        prompt: prompt,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.embedding || !Array.isArray(data.embedding)) {
      throw new Error('Invalid Ollama response: missing embedding array');
    }

    return data.embedding;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Normalize embedding to target dimension
 * - If embedding is longer: truncate
 * - If embedding is shorter: pad with zeros
 */
function normalizeEmbedding(embedding: number[], targetDim: number): number[] {
  if (embedding.length === targetDim) {
    return embedding;
  }

  if (embedding.length > targetDim) {
    // Truncate
    return embedding.slice(0, targetDim);
  }

  // Pad with zeros
  const padded = [...embedding];
  while (padded.length < targetDim) {
    padded.push(0);
  }
  return padded;
}

/**
 * Apply L2 normalization for cosine similarity
 * Ensures all embeddings have unit length (||v|| = 1)
 */
function l2Normalize(embedding: number[]): number[] {
  const magnitude = Math.sqrt(
    embedding.reduce((sum, val) => sum + val * val, 0)
  );

  if (magnitude === 0) {
    return embedding; // Avoid division by zero
  }

  return embedding.map(val => val / magnitude);
}

// ============================================================================
// BATCH EMBEDDING GENERATION
// ============================================================================

/**
 * Generate embeddings for multiple cycles in batch
 * (Useful for historical backfill)
 */
export async function generateBatchEmbeddings(
  cycles: Array<{ symbolic: SymbolicInput; physiological: PhysiologicalInput }>,
  config: Partial<EmbeddingConfig> = {}
): Promise<Array<number[] | null>> {
  const embeddings: Array<number[] | null> = [];

  for (const cycle of cycles) {
    const embedding = await generateMycelialEmbedding(
      cycle.symbolic,
      cycle.physiological,
      config
    );
    embeddings.push(embedding);

    // Rate limiting: small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return embeddings;
}

// ============================================================================
// SIMILARITY SEARCH HELPERS
// ============================================================================

/**
 * Compute cosine distance between two embeddings
 * (Used for testing; actual similarity search uses pgvector)
 */
export function cosineDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have same dimension');
  }

  // Cosine distance = 1 - cosine similarity
  // Cosine similarity = dot product (if both are L2-normalized)
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const distance = 1 - dotProduct;

  return distance;
}

/**
 * Find k-nearest neighbors (local computation, not using database)
 * (Used for testing; production uses database find_similar_cycles function)
 */
export function findKNearestNeighbors(
  query: number[],
  corpus: Array<{ id: string; embedding: number[] }>,
  k: number = 5
): Array<{ id: string; distance: number }> {
  const distances = corpus.map(item => ({
    id: item.id,
    distance: cosineDistance(query, item.embedding),
  }));

  // Sort by distance (ascending)
  distances.sort((a, b) => a.distance - b.distance);

  // Return top k
  return distances.slice(0, k);
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * Verify Ollama is running and embedding model is available
 */
export async function verifyOllamaConnection(
  config: Partial<EmbeddingConfig> = {}
): Promise<{ ok: boolean; error?: string }> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  try {
    // Test embedding generation with simple prompt
    const testPrompt = 'Test prompt for Ollama connection';
    const embedding = await callOllamaEmbedding(testPrompt, cfg);

    if (!embedding || embedding.length === 0) {
      return { ok: false, error: 'Ollama returned empty embedding' };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  generateMycelialEmbedding,
  generateBatchEmbeddings,
  verifyOllamaConnection,
  cosineDistance,
  findKNearestNeighbors,
};
