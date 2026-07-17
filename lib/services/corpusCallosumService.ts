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
 *
 * [ROUTING-INVARIANT] (context vs cause):
 *
 * - origin_route: set at the HTTP boundary; describes WHY this run exists (causal key).
 * - processing_profile: set at the HTTP boundary OR computed by core; describes HOW it was processed.
 *
 * CONTRACT:
 * - These values flow inward as explicit parameters.
 * - They are NEVER inferred from ambient state (session_id, internal sid_*, call stack, etc.).
 *
 * Observability note:
 * - Correlation IDs (request_id/trace_id) are WITNESSES, not DRIVERS.
 *   They must never influence behavior.
 */

import { query, queryOne } from '../db/postgres';
import { TurnPosture, contentWritable } from '../sanctuary/turnPosture';

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
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'shadow';
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
  // Route/profile tracing for filtering
  originRoute?: string;        // e.g. "/api/sovereign/app/maia", "/api/between/chat"
  processingProfile?: string;  // "FAST" | "CORE" | "DEEP" | "BETWEEN"
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
  // Route/profile tracing for filtering
  originRoute?: string;        // e.g. "/api/sovereign/app/maia", "/api/between/chat"
  processingProfile?: string;  // "FAST" | "CORE" | "DEEP" | "BETWEEN"
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
export async function logAgentRun(input: AgentRunInput, posture: TurnPosture): Promise<string | null> {
  // SANCTUARY (S1, boundary-enforced): agent_runs rows carry content
  // (input_summary/output_text). Sanctuary or missing posture refuses the
  // write here at the service, regardless of caller. SANC-20260614-01.
  if (!contentWritable(posture, 'corpusCallosum.logAgentRun', input?.sessionId)) {
    return null;
  }
  try {
    const result = await queryOne<{ id: string }>(
      `INSERT INTO agent_runs (
        session_id, turn_id, user_id, req_id,
        agent_name, element, epistemic_mode, phase, source,
        input_summary, output_text, output_json,
        latency_ms, status, error,
        confidence, intensity, inhibited_by, meta,
        origin_route, processing_profile
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
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
        input.originRoute ?? null,
        input.processingProfile ?? null,
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
export async function logIntegrationPass(input: IntegrationPassInput, posture: TurnPosture): Promise<string | null> {
  // SANCTUARY (S1, boundary-enforced): integration_passes rows carry content
  // (inputs/final_text). Same refusal contract as logAgentRun.
  if (!contentWritable(posture, 'corpusCallosum.logIntegrationPass', input?.sessionId)) {
    return null;
  }
  try {
    const result = await queryOne<{ id: string }>(
      `INSERT INTO integration_passes (
        session_id, turn_id, user_id, req_id,
        bridge_agent, inputs, agent_run_ids, integration_method,
        tensions_named, reconciliations, paradoxes_held,
        final_text, coherence_score, depth_score, confidence,
        elemental_mode, meta,
        origin_route, processing_profile
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
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
        input.originRoute ?? null,
        input.processingProfile ?? null,
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

  // Route/profile tracing for filtering
  originRoute?: string;        // e.g. "/api/sovereign/app/maia", "/api/between/chat"
  processingProfile?: string;  // "FAST" | "CORE" | "DEEP" | "BETWEEN"

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
 * Map element to epistemic mode for corpus callosum tracing
 */
function elementToEpistemicMode(element: string): EpistemicMode {
  const mapping: Record<string, EpistemicMode> = {
    fire: 'structured',    // SOAR - goal-oriented, problem-solving
    water: 'somatic',      // MicroPsi - emotional, felt-sense
    earth: 'structured',   // ACT-R - grounded, rational
    air: 'symbolic',       // LIDA - conscious, cognitive
    aether: 'integrative', // POET - transcendent, synthesis
    shadow: 'relational',  // Shadow - depth, integration
  };
  return mapping[element] ?? 'symbolic';
}

/**
 * Log a complete corpus callosum trace for a turn
 *
 * This is a convenience wrapper that logs:
 * - Atlas classification as structured agent run
 * - MAIA response as symbolic agent run
 * - Elemental agents as parallel agent runs (the REAL corpus callosum!)
 * - Integration pass combining all
 */
export async function logCorpusCallosumTrace(trace: CorpusCallosumTrace, posture: TurnPosture): Promise<{
  atlasRunId: string | null;
  maiaRunId: string | null;
  elementalRunIds: string[];
  integrationId: string | null;
}> {
  const agentRunIds: string[] = [];
  const inputs: IntegrationPassInput['inputs'] = [];
  const elementalRunIds: string[] = [];

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
      originRoute: trace.originRoute,
      processingProfile: trace.processingProfile,
    }, posture);

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
      originRoute: trace.originRoute,
      processingProfile: trace.processingProfile,
    }, posture);

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
      originRoute: trace.originRoute,
      processingProfile: trace.processingProfile,
    }, posture);

    if (wisdomRunId) {
      agentRunIds.push(wisdomRunId);
      inputs.push({
        agentName: 'WisdomRouter',
        epistemicMode: 'relational',
        summary: `Pattern: ${trace.wisdomPatterns.pattern}`,
      });
    }
  }

  // 4) 🔥 Log elemental agents (the REAL parallel processing!)
  if (trace.elementalAgents && trace.elementalAgents.length > 0) {
    // Log each elemental agent as a separate run - this is the corpus callosum
    for (const agent of trace.elementalAgents) {
      const runId = await logAgentRun({
        sessionId: trace.sessionId,
        turnId: trace.turnId,
        userId: trace.userId,
        agentName: agent.agentName,
        element: agent.element,
        epistemicMode: elementToEpistemicMode(agent.element),
        phase: 'elemental-processing',
        source: 'elemental-oracle',
        outputText: agent.wisdom.slice(0, 500), // Truncate for storage
        latencyMs: agent.latencyMs,
        status: agent.status ?? 'ok',
        error: agent.error,
        confidence: agent.intensity, // Use intensity as confidence proxy
        intensity: agent.intensity,
        meta: {
          archetype: agent.archetype,
          cognitiveSystem: agent.cognitiveSystem,
          symbols: agent.symbols,
          fullLength: agent.wisdom.length,
        },
        originRoute: trace.originRoute,
        processingProfile: trace.processingProfile,
      }, posture);

      if (runId) {
        elementalRunIds.push(runId);
        agentRunIds.push(runId);
        inputs.push({
          agentName: agent.agentName,
          element: agent.element,
          epistemicMode: elementToEpistemicMode(agent.element),
          summary: `${agent.archetype ?? agent.element}: ${agent.wisdom.slice(0, 80)}...`,
        });
      }
    }

    console.log(`🧠 [CorpusCallosum] Logged ${elementalRunIds.length} elemental agent runs`);
  }

  // 5) Log integration pass if we have multiple inputs
  let integrationId: string | null = null;
  if (inputs.length >= 2) {
    // Determine tensions between agents
    const tensionsNamed: string[] = [];
    if (inputs.some(i => i.element === 'fire') && inputs.some(i => i.element === 'water')) {
      tensionsNamed.push('fire_water_opposition');
    }
    if (inputs.some(i => i.element === 'earth') && inputs.some(i => i.element === 'air')) {
      tensionsNamed.push('earth_air_grounding_vs_abstraction');
    }
    if (inputs.some(i => i.epistemicMode === 'structured') && inputs.some(i => i.epistemicMode === 'symbolic')) {
      tensionsNamed.push('structured_vs_symbolic');
    }

    integrationId = await logIntegrationPass({
      sessionId: trace.sessionId,
      turnId: trace.turnId,
      userId: trace.userId,
      bridgeAgent: trace.elementalSynthesis ? 'ElementalOracle' : 'CorpusCallosum',
      inputs,
      agentRunIds,
      integrationMethod: trace.elementalSynthesis?.integrationMethod ?? (inputs.length > 1 ? 'weighted_blend' : 'single_voice'),
      tensionsNamed,
      reconciliations: trace.elementalSynthesis?.harmonics?.map(h => `${h.pattern}: ${h.elements.join('+')}`) ?? [],
      paradoxesHeld: tensionsNamed.length > 0 ? ['elemental_oppositions_held'] : [],
      finalText: trace.elementalSynthesis?.synthesis?.slice(0, 200) ?? trace.maiaResponse?.text?.slice(0, 200),
      coherenceScore: trace.elementalSynthesis?.depth ?? (inputs.length > 1 ? 0.8 : 1.0),
      depthScore: trace.elementalSynthesis?.depth,
      confidence: trace.elementalSynthesis ? 0.85 : 0.7,
      elementalMode: (trace.elementalSynthesis?.dominant?.toLowerCase() ?? trace.atlasResult?.element?.toLowerCase()) as any,
      meta: {
        agentCount: inputs.length,
        elementalAgentCount: elementalRunIds.length,
        // Distinguish classical five vs including shadow for semantic clarity
        elementalAgentCountClassical: elementalRunIds.filter((_, i) => {
          const agent = trace.elementalAgents?.[i];
          return agent && agent.element !== 'shadow';
        }).length,
        traceAgentCount: trace.elementalAgents?.length ?? 0, // What the bridge produced
        harmonics: trace.elementalSynthesis?.harmonics,
        totalLatencyMs: trace.elementalSynthesis?.latencyMs,
      },
      originRoute: trace.originRoute,
      processingProfile: trace.processingProfile,
    }, posture);

    if (integrationId) {
      console.log(`🌉 [CorpusCallosum] Integration pass logged: ${inputs.length} agents bridged`);
    }
  }

  return { atlasRunId, maiaRunId, elementalRunIds, integrationId };
}
