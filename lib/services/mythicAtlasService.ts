// backend
// File: lib/services/mythicAtlasService.ts
/**
 * Mythic Atlas Service Client
 *
 * TypeScript bridge to Python Mythic Atlas classification service.
 * Provides semantic anchoring and uncertainty detection for MAIA.
 *
 * Phase 1: Confidence scoring and deliberation triggers
 * Phase 2: Multi-agent deliberation (when uncertain)
 */

export type AtlasAlternative = {
  label: string;    // "FIRE_1::WARRIOR"
  score: number;    // 0.0-1.0
};

export type AtlasResult = {
  // === CLASSIFICATION ===
  primary: string;       // "FIRE_1::WARRIOR"
  facet: string;         // "FIRE_1"
  archetype: string;     // "WARRIOR"
  element: string;       // "FIRE"
  phase: number;         // 1, 2, 3

  // === CONFIDENCE & DELIBERATION ===
  confidence: number;              // 0.0-1.0 (classification confidence)
  gapPercent: number;              // e.g., 7.6, 29.6 (top-two score gap %)
  deliberationRecommended: boolean; // True when uncertain (< 15% gap or low confidence)

  // === ALTERNATIVES ===
  alternatives: AtlasAlternative[];  // Competing interpretations

  // === OPTIONAL CONTEXT ===
  narrativeContext?: string;
  practiceRecommendations?: string[];
  mythicThemes?: string[];
  sacredGeometry?: Record<string, number>;
};

type GetAtlasContextInput = {
  input: string;
  sessionId?: string;
  // Future: conversationHistory, meta, matrixState, etc.
};

// Environment configuration
const DEFAULT_ATLAS_URL =
  process.env.MYTHIC_ATLAS_URL || 'http://localhost:8000/api/mythic-atlas';

const ATLAS_TIMEOUT_MS = 5000; // 5 second timeout

/**
 * Main function to get Mythic Atlas classification
 *
 * This is the bridge between TypeScript MAIA and Python Mythic Atlas.
 *
 * Flow:
 *   1. Send user input to Python backend
 *   2. Receive classification with confidence scores
 *   3. Check deliberation recommendation
 *   4. Return structured result for MAIA processing
 *
 * Fail-safe: Returns neutral fallback if Python backend unavailable
 */
export async function getMythicAtlasContext(
  params: GetAtlasContextInput
): Promise<AtlasResult> {
  const { input, sessionId } = params;

  console.log(`🧠 [MythicAtlas] Requesting classification...`);
  console.log(`   Input: ${input.substring(0, 100)}${input.length > 100 ? '...' : ''}`);

  try {
    // Call Python FastAPI backend
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ATLAS_TIMEOUT_MS);

    const res = await fetch(DEFAULT_ATLAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input,
        session_id: sessionId ?? null,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(
        `⚠️  [MythicAtlas] Non-OK response: ${res.status} ${res.statusText}`
      );
      throw new Error(`Mythic Atlas HTTP ${res.status}`);
    }

    const data = (await res.json()) as AtlasResult;

    // Validate response shape
    if (!data.primary || !data.facet || !data.element) {
      console.warn('⚠️  [MythicAtlas] Incomplete result:', data);
      throw new Error('Incomplete Mythic Atlas response');
    }

    // Log classification result
    if (data.deliberationRecommended) {
      console.log(`⚠️  [MythicAtlas] UNCERTAIN classification (deliberation recommended):`);
      console.log(`   Primary: ${data.primary}`);
      console.log(`   Confidence: ${(data.confidence * 100).toFixed(1)}%`);
      console.log(`   Gap: ${data.gapPercent.toFixed(1)}%`);
      console.log(`   Alternatives: ${data.alternatives.slice(0, 3).map(a => a.label).join(', ')}`);
    } else {
      console.log(`✅ [MythicAtlas] Confident classification:`);
      console.log(`   Primary: ${data.primary}`);
      console.log(`   Facet: ${data.facet} | Archetype: ${data.archetype}`);
      console.log(`   Confidence: ${(data.confidence * 100).toFixed(1)}%`);
      console.log(`   Gap: ${data.gapPercent.toFixed(1)}%`);
    }

    return data;

  } catch (err) {
    // Fail-safe: log error and return neutral fallback
    if (err instanceof Error && err.name === 'AbortError') {
      console.error(`❌ [MythicAtlas] Request timeout (${ATLAS_TIMEOUT_MS}ms)`);
    } else {
      console.error('❌ [MythicAtlas] Failed to fetch classification:', err);
    }

    console.warn('⚠️  [MythicAtlas] Using fallback neutral result');

    // Return safe fallback that won't break MAIA
    return createFallbackResult();
  }
}

/**
 * Fallback result when Python backend unavailable
 *
 * This ensures MAIA continues functioning even if Mythic Atlas is down.
 * Returns a neutral, low-confidence result that triggers deliberation.
 */
function createFallbackResult(): AtlasResult {
  return {
    primary: 'UNKNOWN::UNKNOWN',
    facet: 'UNKNOWN',
    archetype: 'UNKNOWN',
    element: 'UNKNOWN',
    phase: 0,
    confidence: 0.0,
    gapPercent: 100.0,
    deliberationRecommended: false, // Don't trigger deliberation on errors
    alternatives: [],
    narrativeContext: 'Mythic Atlas classification unavailable (using fallback)',
    practiceRecommendations: ['Connect to Python Mythic Atlas service'],
    mythicThemes: ['System fallback mode'],
  };
}

/**
 * Batch classification (future use)
 *
 * Useful for processing multiple inputs efficiently,
 * e.g., analyzing conversation history patterns.
 */
export async function batchClassify(
  inputs: GetAtlasContextInput[]
): Promise<AtlasResult[]> {
  const BATCH_URL = `${DEFAULT_ATLAS_URL}/batch`;

  try {
    const res = await fetch(BATCH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputs.map(i => ({
        input: i.input,
        session_id: i.sessionId ?? null,
      }))),
    });

    if (!res.ok) {
      throw new Error(`Batch classification failed: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error('❌ [MythicAtlas] Batch classification error:', err);
    // Return fallbacks for all inputs
    return inputs.map(() => createFallbackResult());
  }
}

/**
 * Health check for Mythic Atlas service
 *
 * Useful for startup checks and monitoring.
 */
export async function checkMythicAtlasHealth(): Promise<boolean> {
  try {
    const healthUrl = DEFAULT_ATLAS_URL.replace('/api/mythic-atlas', '/health');
    const res = await fetch(healthUrl, { method: 'GET' });

    if (!res.ok) return false;

    const health = await res.json();
    return health.status === 'healthy';
  } catch {
    return false;
  }
}
