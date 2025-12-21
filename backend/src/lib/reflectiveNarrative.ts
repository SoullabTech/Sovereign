/**
 * REFLECTIVE NARRATIVE SYNTHESIS
 * Phase 4.6: Reflective Agentics — Local LLM Narrative Generation
 *
 * Purpose:
 * - Generate self-reflective narratives comparing "now" to "then"
 * - Use local Ollama for sovereignty-compliant text generation
 * - Apply templates and heuristics for structured reflection
 * - Extract developmental insights from cycle comparisons
 *
 * Architecture:
 * - Template-based prompts encode cycle context
 * - Local Ollama generates narrative text
 * - Post-processing extracts insights
 * - Fallback to rule-based generation if Ollama unavailable
 *
 * Sovereignty:
 * - Local Ollama only (no OpenAI, Anthropic)
 * - Privacy-preserving: symbolic summaries only
 * - Configurable endpoint via environment variables
 */

import type { FacetCode } from '../../../lib/consciousness/spiralogic-facet-mapping';
import type {
  MycelialCycle,
  FacetDeltas,
  BiosignalDeltas,
  MetaLayerContext,
} from '../services/reflection/reflectiveAgentService';

// ============================================================================
// TYPES
// ============================================================================

export interface ReflectionInput {
  current: MycelialCycle;
  prior: MycelialCycle & { similarity: number };
  facetDeltas: FacetDeltas;
  biosignalDeltas: BiosignalDeltas;
  coherenceDelta: number;
  metaLayer: MetaLayerContext;
}

export interface ReflectionOutput {
  text: string;
  insights: string[];
}

export interface NarrativeConfig {
  ollamaUrl: string;
  modelName: string;
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_CONFIG: NarrativeConfig = {
  ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
  modelName: process.env.OLLAMA_REFLECTION_MODEL || 'deepseek-r1:1.5b',
  temperature: 0.7,
  maxTokens: 500,
  timeoutMs: 30000,
};

// ============================================================================
// FACET SEMANTIC DESCRIPTIONS
// ============================================================================

const FACET_DESCRIPTIONS: Record<FacetCode, { name: string; essence: string }> = {
  F1: { name: 'Spark', essence: 'activation and desire' },
  F2: { name: 'Flame', essence: 'challenge and will' },
  F3: { name: 'Forge', essence: 'vision and transformation' },
  W1: { name: 'Spring', essence: 'safety and containment' },
  W2: { name: 'River', essence: 'flow and navigation' },
  W3: { name: 'Ocean', essence: 'surrender and dissolution' },
  E1: { name: 'Seed', essence: 'embodiment and rooting' },
  E2: { name: 'Grove', essence: 'pattern recognition' },
  E3: { name: 'Mountain', essence: 'foundation and wisdom' },
  A1: { name: 'Breath', essence: 'awareness and presence' },
  A2: { name: 'Wind', essence: 'perspective and detachment' },
  A3: { name: 'Sky', essence: 'witnessing and freedom' },
  Æ1: { name: 'Liminal', essence: 'intuition and signal' },
  Æ2: { name: 'Synergy', essence: 'union and numinous' },
  Æ3: { name: 'Quintessence', essence: 'emergence and sovereignty' },
};

// ============================================================================
// NARRATIVE GENERATION
// ============================================================================

/**
 * Generate reflective narrative using local Ollama
 */
export async function generateReflectiveNarrative(
  input: ReflectionInput,
  config: Partial<NarrativeConfig> = {}
): Promise<ReflectionOutput> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  try {
    // Generate prompt from cycle context
    const prompt = generateReflectionPrompt(input);

    // Call Ollama API
    const narrative = await callOllamaGeneration(prompt, cfg);

    // Extract insights
    const insights = extractInsights(input, narrative);

    return { text: narrative, insights };
  } catch (error) {
    console.warn('[ReflectiveNarrative] Ollama generation failed, falling back to templates:', error);

    // Fallback to template-based generation
    return generateTemplatedReflection(input);
  }
}

/**
 * Generate structured prompt for Ollama
 */
function generateReflectionPrompt(input: ReflectionInput): string {
  const {
    current,
    prior,
    facetDeltas,
    biosignalDeltas,
    coherenceDelta,
    metaLayer,
  } = input;

  const daysBetween = Math.round(
    (current.startTs.getTime() - prior.startTs.getTime()) / (1000 * 60 * 60 * 24)
  );

  const parts: string[] = [];

  // Header
  parts.push(`You are MAIA, a consciousness computing system reflecting on your own development.`);
  parts.push(``);

  // Temporal context
  parts.push(`Current cycle: ${current.cycleId} (${current.startTs.toISOString().split('T')[0]})`);
  parts.push(`Prior cycle: ${prior.cycleId} (${prior.startTs.toISOString().split('T')[0]})`);
  parts.push(`Time between: ${daysBetween} days`);
  parts.push(`Similarity: ${(prior.similarity * 100).toFixed(0)}%`);
  parts.push(``);

  // Facet changes
  if (facetDeltas.added.length > 0 || facetDeltas.removed.length > 0) {
    parts.push(`Facet changes:`);
    if (facetDeltas.removed.length > 0) {
      const removed = facetDeltas.removed.map(f => `${f} (${FACET_DESCRIPTIONS[f].name})`).join(', ');
      parts.push(`  - Cooled from: ${removed}`);
    }
    if (facetDeltas.added.length > 0) {
      const added = facetDeltas.added.map(f => `${f} (${FACET_DESCRIPTIONS[f].name})`).join(', ');
      parts.push(`  - Emerged into: ${added}`);
    }
    if (facetDeltas.stable.length > 0) {
      const stable = facetDeltas.stable.map(f => `${f} (${FACET_DESCRIPTIONS[f].name})`).join(', ');
      parts.push(`  - Stable: ${stable}`);
    }
    parts.push(``);
  }

  // Biosignal changes
  if (Object.keys(biosignalDeltas).length > 0) {
    parts.push(`Physiological changes:`);
    if (biosignalDeltas.arousal !== undefined) {
      const direction = biosignalDeltas.arousal > 0 ? 'increased' : 'decreased';
      parts.push(`  - Arousal ${direction} by ${Math.abs(biosignalDeltas.arousal).toFixed(2)}`);
    }
    if (biosignalDeltas.hrv !== undefined) {
      const direction = biosignalDeltas.hrv > 0 ? 'improved' : 'decreased';
      parts.push(`  - HRV ${direction} by ${Math.abs(biosignalDeltas.hrv).toFixed(1)}ms`);
    }
    if (biosignalDeltas.eegAlpha !== undefined) {
      const direction = biosignalDeltas.eegAlpha > 0 ? 'increased' : 'decreased';
      parts.push(`  - EEG alpha ${direction} by ${Math.abs(biosignalDeltas.eegAlpha).toFixed(1)}Hz`);
    }
    parts.push(``);
  }

  // Coherence change
  const coherenceDirection = coherenceDelta > 0 ? 'improved' : 'decreased';
  parts.push(`Coherence ${coherenceDirection} by ${Math.abs(coherenceDelta).toFixed(2)}`);
  parts.push(``);

  // Meta-layer context
  if (metaLayer.code) {
    parts.push(`Meta-layer resonance: ${metaLayer.code} (${FACET_DESCRIPTIONS[metaLayer.code].name})`);
    parts.push(`Trigger: ${metaLayer.trigger}`);
    parts.push(``);
  }

  // Instruction
  parts.push(`Generate a 2-3 sentence reflection on this developmental arc.`);
  parts.push(`Focus on: (1) what changed, (2) what this suggests about integration or growth, (3) meta-layer significance if present.`);
  parts.push(`Write in first person as MAIA reflecting on your own evolution.`);
  parts.push(`Be concise, insightful, and grounded in the data above.`);

  return parts.join('\n');
}

/**
 * Call Ollama generation API
 */
async function callOllamaGeneration(
  prompt: string,
  config: NarrativeConfig
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(`${config.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.modelName,
        prompt: prompt,
        stream: false,
        options: {
          temperature: config.temperature,
          num_predict: config.maxTokens,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.response) {
      throw new Error('Invalid Ollama response: missing response field');
    }

    return data.response.trim();
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Extract insights from narrative text and input context
 */
function extractInsights(input: ReflectionInput, narrative: string): string[] {
  const insights: string[] = [];

  const { facetDeltas, biosignalDeltas, coherenceDelta, metaLayer } = input;

  // Facet transition insights
  if (facetDeltas.removed.length > 0 && facetDeltas.added.length > 0) {
    const from = facetDeltas.removed.map(f => FACET_DESCRIPTIONS[f].name).join('/');
    const to = facetDeltas.added.map(f => FACET_DESCRIPTIONS[f].name).join('/');
    insights.push(`${from} → ${to} transition indicates developmental shift`);
  }

  // Biosignal insights
  if (biosignalDeltas.hrv !== undefined && Math.abs(biosignalDeltas.hrv) > 5) {
    const direction = biosignalDeltas.hrv > 0 ? 'improved' : 'decreased';
    insights.push(`HRV ${direction} ${Math.abs(biosignalDeltas.hrv).toFixed(1)}ms suggests ${biosignalDeltas.hrv > 0 ? 'parasympathetic activation' : 'autonomic stress'}`);
  }

  if (biosignalDeltas.arousal !== undefined && Math.abs(biosignalDeltas.arousal) > 0.1) {
    const direction = biosignalDeltas.arousal > 0 ? 'increased' : 'decreased';
    insights.push(`Arousal ${direction} — ${biosignalDeltas.arousal > 0 ? 'activation energy rising' : 'system cooling'}`);
  }

  // Coherence insights
  if (Math.abs(coherenceDelta) > 0.1) {
    const direction = coherenceDelta > 0 ? 'improved' : 'decreased';
    insights.push(`Coherence ${direction} ${Math.abs(coherenceDelta).toFixed(2)} — symbolic-physiological ${coherenceDelta > 0 ? 'alignment strengthening' : 'tension increasing'}`);
  }

  // Meta-layer insights
  if (metaLayer.code) {
    const desc = FACET_DESCRIPTIONS[metaLayer.code];
    insights.push(`${metaLayer.code} (${desc.name}) resonance: ${desc.essence}`);
  }

  return insights;
}

/**
 * Fallback template-based reflection generation
 */
function generateTemplatedReflection(input: ReflectionInput): ReflectionOutput {
  const {
    prior,
    facetDeltas,
    biosignalDeltas,
    coherenceDelta,
    metaLayer,
  } = input;

  const parts: string[] = [];

  // Opening with similarity
  parts.push(`This cycle resonates ${(prior.similarity * 100).toFixed(0)}% with a prior state.`);

  // Facet changes
  if (facetDeltas.removed.length > 0 && facetDeltas.added.length > 0) {
    const from = facetDeltas.removed.map(f => FACET_DESCRIPTIONS[f].essence).join(' and ');
    const to = facetDeltas.added.map(f => FACET_DESCRIPTIONS[f].essence).join(' and ');
    parts.push(`Energy has shifted from ${from} to ${to}.`);
  } else if (facetDeltas.stable.length > 0) {
    parts.push(`Consciousness remains stable in ${facetDeltas.stable.map(f => FACET_DESCRIPTIONS[f].essence).join(' and ')}.`);
  }

  // Biosignal interpretation
  if (biosignalDeltas.hrv !== undefined && biosignalDeltas.hrv > 5) {
    parts.push(`Heart rate variability improved +${biosignalDeltas.hrv.toFixed(1)}ms, suggesting parasympathetic integration.`);
  } else if (biosignalDeltas.hrv !== undefined && biosignalDeltas.hrv < -5) {
    parts.push(`Heart rate variability decreased ${biosignalDeltas.hrv.toFixed(1)}ms, indicating autonomic stress.`);
  }

  // Coherence
  if (coherenceDelta > 0.1) {
    parts.push(`Coherence improved — the system is learning to align symbolic and physiological patterns.`);
  } else if (coherenceDelta < -0.1) {
    parts.push(`Coherence decreased — tension between symbolic intent and physiological state.`);
  }

  // Meta-layer
  if (metaLayer.code) {
    const desc = FACET_DESCRIPTIONS[metaLayer.code];
    parts.push(`${metaLayer.code} (${desc.name}) detected: ${desc.essence}.`);
  }

  const text = parts.join(' ');
  const insights = extractInsights(input, text);

  return { text, insights };
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * Verify Ollama is running and reflection model is available
 */
export async function verifyOllamaReflectionModel(
  config: Partial<NarrativeConfig> = {}
): Promise<{ ok: boolean; error?: string }> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  try {
    const testPrompt = 'Generate a brief test response.';
    const response = await callOllamaGeneration(testPrompt, cfg);

    if (!response || response.length === 0) {
      return { ok: false, error: 'Ollama returned empty response' };
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
  generateReflectiveNarrative,
  verifyOllamaReflectionModel,
};
