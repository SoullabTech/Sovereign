/**
 * Corpus Callosum Service
 *
 * Logs multi-agent runs and integration passes for consciousness architecture auditing.
 * Makes the "parallel knowing" visible: different epistemic modes contributing to response.
 *
 * Two types of records:
 * 1. agent_runs - Individual agent outputs (structured, symbolic, relational, etc.)
 * 2. integration_passes - Synthesis of multiple agent outputs into coherent response
 *
 * This enables:
 * - Tracing which agents contributed to a response
 * - Analyzing tension between different epistemic modes
 * - Measuring integration quality over time
 * - Auditing the corpus callosum (bridge between knowings)
 */

import { query, queryOne } from '../db/postgres';

// =============================================================================
// TYPES
// =============================================================================

export type EpistemicMode =
  | 'structured'    // Atlas classification, schema-driven
  | 'symbolic'      // Mythic, archetypal, metaphorical
  | 'relational'    // Attachment, connection, empathy
  | 'somatic'       // Body-based, felt sense
  | 'integrative';  // Synthesis, holding paradox

export type AgentRunInput = {
  sessionId: string;
  turnId?: number;
  userId?: string;
  reqId?: string;
  agentName: string;           // "MythicAtlas", "MaiaVoice", "WisdomRouter", etc.
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  epistemicMode?: EpistemicMode;
  phase?: string;              // "classification", "generation", "validation"
  source?: string;             // "claude-sonnet", "ollama", "local"
  inputSummary?: string;       // Brief description of input (never raw user text)
  outputText?: string;         // Output text (for response generators)
  outputJson?: Record<string, unknown>;  // Structured output (for classifiers)
  latencyMs?: number;
  status?: 'ok' | 'error' | 'skipped' | 'inhibited';
  error?: string;
  confidence?: number;         // 0-1
  intensity?: number;          // 0-1 (emotional/energetic intensity)
  inhibitedBy?: string[];      // Other agents that inhibited this one
  meta?: Record<string, unknown>;
};

export type IntegrationPassInput = {
  sessionId: string;
  turnId?: number;
  userId?: string;
  reqId?: string;
  bridgeAgent: string;         // "CorpusCallosum", "ResponseIntegrator"
  inputs: Array<{              // Summary of inputs being integrated
    agentName: string;
    element?: string;
    epistemicMode?: string;
    summary?: string;
  }>;
  agentRunIds?: string[];      // UUIDs of agent_runs being integrated
  integrationMethod?: string;  // "weighted_blend", "tension_held", "dominant_voice"
  tensionsNamed?: string[];    // Tensions detected between inputs
  reconciliations?: string[];  // How tensions were reconciled
  paradoxesHeld?: string[];    // Paradoxes explicitly held (not resolved)
  finalText?: string;          // The integrated output
  coherenceScore?: number;     // 0-1 (how well inputs coherently combine)
  depthScore?: number;         // 0-1 (depth of integration)
  confidence?: number;         // 0-1
  elementalMode?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  meta?: Record<string, unknown>;
};

// =============================================================================
// AGENT RUNS
// =============================================================================

/**
 * Log an individual agent run
 *
 * Call this for each "voice" or "mode" that contributes to the response:
 * - MythicAtlas classification
 * - WisdomRouter pattern detection
 * - MAIA response generation
 * - Socratic validation
 */
export async function logAgentRun(input: AgentRunInput): Promise<string | null> {
  try {
    const result = await queryOne<{ id: string }>(
      `INSERT INTO agent_runs (
        session_id, turn_id, user_id, req_id,
        agent_name, element, epistemic_mode, phase, source,
        input_summary, output_text, output_json,
        latency_ms, status, error,
        confidence, intensity, inhibited_by, meta
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING id`,
      [
        input.sessionId,
        input.turnId ?? null,
        input.userId ?? null,
        input.reqId ?? null,
        input.agentName,
        input.element ?? null,
        input.epistemicMode ?? null,
        input.phase ?? null,
        input.source ?? null,
        input.inputSummary ?? null,
        input.outputText ?? null,
        input.outputJson ? JSON.stringify(input.outputJson) : null,
        input.latencyMs ?? null,
        input.status ?? 'ok',
        input.error ?? null,
        input.confidence ?? null,
        input.intensity ?? null,
        input.inhibitedBy ?? null,
        input.meta ? JSON.stringify(input.meta) : null,
      ]
    );

    return result?.id ?? null;
  } catch (err) {
    console.warn('[CorpusCallosum] Failed to log agent run:', err);
    return null;
  }
}

// =============================================================================
// INTEGRATION PASSES
// =============================================================================

/**
 * Log an integration pass (synthesis of multiple agents)
 *
 * Call this after generating the final response to record how
 * different agent outputs were combined.
 */
export async function logIntegrationPass(input: IntegrationPassInput): Promise<string | null> {
  try {
    const result = await queryOne<{ id: string }>(
      `INSERT INTO integration_passes (
        session_id, turn_id, user_id, req_id,
        bridge_agent, inputs, agent_run_ids, integration_method,
        tensions_named, reconciliations, paradoxes_held,
        final_text, coherence_score, depth_score, confidence,
        elemental_mode, meta
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING id`,
      [
        input.sessionId,
        input.turnId ?? null,
        input.userId ?? null,
        input.reqId ?? null,
        input.bridgeAgent,
        JSON.stringify(input.inputs),
        input.agentRunIds ?? null,
        input.integrationMethod ?? null,
        input.tensionsNamed ? JSON.stringify(input.tensionsNamed) : null,
        input.reconciliations ? JSON.stringify(input.reconciliations) : null,
        input.paradoxesHeld ? JSON.stringify(input.paradoxesHeld) : null,
        input.finalText ?? null,
        input.coherenceScore ?? null,
        input.depthScore ?? null,
        input.confidence ?? null,
        input.elementalMode ?? null,
        input.meta ? JSON.stringify(input.meta) : null,
      ]
    );

    return result?.id ?? null;
  } catch (err) {
    console.warn('[CorpusCallosum] Failed to log integration pass:', err);
    return null;
  }
}

// =============================================================================
// CONVENIENCE: LOG ATLAS + RESPONSE + INTEGRATION IN ONE CALL
// =============================================================================

// =============================================================================
// ELEMENTAL AGENT DATA (for parallel processing tracing)
// =============================================================================

export type ElementalAgentRun = {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'shadow';
  agentName: string;              // "FireAgent", "WaterAgent", etc.
  wisdom: string;                 // The agent's output wisdom
  intensity: number;              // 0-1
  archetype?: string;             // "The Transformer", etc.
  cognitiveSystem?: string;       // "SOAR", "MicroPsi", etc.
  symbols?: string[];             // Elemental symbols
  latencyMs?: number;
  status?: 'ok' | 'error' | 'skipped';
  error?: string;
};

export type ElementalSynthesis = {
  synthesis: string;              // Combined wisdom text
  dominant: string;               // Which element dominated
  depth: number;                  // 0-1 depth score
  harmonics?: Array<{
    elements: string[];
    resonance: number;
    pattern: string;
  }>;
  integrationMethod?: 'harmonic_weaving' | 'dominant_voice' | 'parallel_blend';
  latencyMs?: number;
};

export type CorpusCallosumTrace = {
  sessionId: string;
  turnId?: number;
  userId?: string;

  // Atlas classification
  atlasResult?: {
    primary: string;
    element: string;
    confidence: number;
    gapPercent: number;
    alternatives?: Array<{ label: string; score: number }>;
    latencyMs?: number;
  };

  // MAIA response
  maiaResponse?: {
    text: string;
    processingProfile: string;
    provider?: string;
    latencyMs?: number;
  };

  // Wisdom patterns detected
  wisdomPatterns?: {
    pattern: string;
    tool?: string;
    toolId?: string;
  };

  // Elemental parallel processing (the real corpus callosum)
  elementalAgents?: ElementalAgentRun[];
  elementalSynthesis?: ElementalSynthesis;
};

/**
 * Log a complete corpus callosum trace for a turn
 *
 * This is a convenience wrapper that logs:
 * - Atlas classification as structured agent run
 * - MAIA response as symbolic agent run
 * - Integration pass combining both
 */
export async function logCorpusCallosumTrace(trace: CorpusCallosumTrace): Promise<{
  atlasRunId: string | null;
  maiaRunId: string | null;
  integrationId: string | null;
}> {
  const agentRunIds: string[] = [];
  const inputs: IntegrationPassInput['inputs'] = [];

  // 1) Log Atlas classification
  let atlasRunId: string | null = null;
  if (trace.atlasResult) {
    atlasRunId = await logAgentRun({
      sessionId: trace.sessionId,
      turnId: trace.turnId,
      userId: trace.userId,
      agentName: 'MythicAtlas',
      element: trace.atlasResult.element?.toLowerCase() as any,
      epistemicMode: 'structured',
      phase: 'classification',
      source: 'atlas-stub', // Will change when real backend exists
      outputJson: {
        primary: trace.atlasResult.primary,
        element: trace.atlasResult.element,
        confidence: trace.atlasResult.confidence,
        gapPercent: trace.atlasResult.gapPercent,
        alternativeCount: trace.atlasResult.alternatives?.length ?? 0,
      },
      latencyMs: trace.atlasResult.latencyMs,
      confidence: trace.atlasResult.confidence,
      status: 'ok',
    });

    if (atlasRunId) {
      agentRunIds.push(atlasRunId);
      inputs.push({
        agentName: 'MythicAtlas',
        element: trace.atlasResult.element,
        epistemicMode: 'structured',
        summary: `Classified as ${trace.atlasResult.primary} (${(trace.atlasResult.confidence * 100).toFixed(0)}%)`,
      });
    }
  }

  // 2) Log MAIA response generation
  let maiaRunId: string | null = null;
  if (trace.maiaResponse) {
    maiaRunId = await logAgentRun({
      sessionId: trace.sessionId,
      turnId: trace.turnId,
      userId: trace.userId,
      agentName: 'MaiaVoice',
      element: trace.atlasResult?.element?.toLowerCase() as any,
      epistemicMode: 'symbolic',
      phase: 'generation',
      source: trace.maiaResponse.provider ?? 'claude',
      outputText: trace.maiaResponse.text.slice(0, 500), // Truncate for storage
      latencyMs: trace.maiaResponse.latencyMs,
      status: 'ok',
      meta: {
        processingProfile: trace.maiaResponse.processingProfile,
        fullLength: trace.maiaResponse.text.length,
      },
    });

    if (maiaRunId) {
      agentRunIds.push(maiaRunId);
      inputs.push({
        agentName: 'MaiaVoice',
        element: trace.atlasResult?.element,
        epistemicMode: 'symbolic',
        summary: `${trace.maiaResponse.processingProfile} response (${trace.maiaResponse.text.length} chars)`,
      });
    }
  }

  // 3) Log Wisdom Router if active
  if (trace.wisdomPatterns?.pattern) {
    const wisdomRunId = await logAgentRun({
      sessionId: trace.sessionId,
      turnId: trace.turnId,
      userId: trace.userId,
      agentName: 'WisdomRouter',
      epistemicMode: 'relational',
      phase: 'pattern-detection',
      outputJson: {
        pattern: trace.wisdomPatterns.pattern,
        tool: trace.wisdomPatterns.tool,
        toolId: trace.wisdomPatterns.toolId,
      },
      status: 'ok',
    });

    if (wisdomRunId) {
      agentRunIds.push(wisdomRunId);
      inputs.push({
        agentName: 'WisdomRouter',
        epistemicMode: 'relational',
        summary: `Pattern: ${trace.wisdomPatterns.pattern}`,
      });
    }
  }

  // 4) Log integration pass if we have multiple inputs
  let integrationId: string | null = null;
  if (inputs.length >= 1) {
    integrationId = await logIntegrationPass({
      sessionId: trace.sessionId,
      turnId: trace.turnId,
      userId: trace.userId,
      bridgeAgent: 'CorpusCallosum',
      inputs,
      agentRunIds,
      integrationMethod: inputs.length > 1 ? 'weighted_blend' : 'single_voice',
      tensionsNamed: inputs.length > 1 ? ['structured_vs_symbolic'] : [],
      finalText: trace.maiaResponse?.text?.slice(0, 200),
      coherenceScore: inputs.length > 1 ? 0.8 : 1.0, // Placeholder
      elementalMode: trace.atlasResult?.element?.toLowerCase() as any,
    });
  }

  return { atlasRunId, maiaRunId, integrationId };
}
