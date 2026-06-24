/**
 * Corpus Callosum Service
 *
 * Logs multi-agent runs and integration passes for consciousness architecture auditing.
 * Makes the "parallel knowing" visible: different epistemic modes contributing to response.
 *
 * Two types of records:
 * 1. agent_runs - Individual agent outputs (structured, symbolic, relational, etc.)
 * 2. integration_passes - DIAGNOSTIC TRACE of which agents ran together on a turn.
 *    record_type='trace_observation' (the live default): observational only. The
 *    member-facing answer is single-authored by MaiaVoice; this row does NOT author it.
 *    record_type='synthesis' is RESERVED for a future path that genuinely merges voices and
 *    must pass the accountability merge-gate before serving a member
 *    (see docs/specs/SYNTHESIS_MERGE_GATE_SPEC_2026-06-07.md — Clause A/B).
 *
 * This enables:
 * - Tracing which agents ran on a response (co-presence, not authorship)
 * - Auditing the corpus callosum substrate (which voices fired, when)
 * NOTE: a trace_observation does NOT measure integration quality or resolve tension — those
 * fields are reserved for record_type='synthesis' and left NULL for traces (Clause A).
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
  // 'trace_observation' (default) = diagnostic record of which agents ran; does NOT author the
  // member-facing answer. 'synthesis' = a genuine voice-merge that authored the answer and MUST
  // satisfy the merge-gate (docs/specs/SYNTHESIS_MERGE_GATE_SPEC_2026-06-07.md).
  recordType?: 'trace_observation' | 'synthesis';
  bridgeAgent: string;         // "CorpusCallosum", "ElementalOracle"
  inputs: Array<{              // Which agents ran (trace) / were integrated (synthesis)
    agentName: string;
    element?: string;
    epistemicMode?: string;
    summary?: string;
  }>;
  agentRunIds?: string[];      // UUIDs of the agent_runs this record references
  integrationMethod?: string;  // synthesis: "weighted_blend"|"tension_held"|"dominant_voice"; trace: "classifier_trace"
  // The fields below are SYNTHESIS EVIDENCE. For record_type='trace_observation' they are left
  // NULL on purpose (Clause A): a trace observes, it does not synthesize. Populate them ONLY on
  // record_type='synthesis', where the merge-gate requires them to be real (not template).
  tensionsNamed?: string[];    // tensions actually detected & adjudicated (synthesis only)
  reconciliations?: string[];  // how named tensions were resolved (synthesis only)
  paradoxesHeld?: string[];    // paradoxes explicitly held, not resolved (synthesis only)
  finalText?: string;          // member-facing synthesized text — set ONLY when it EQUALS what the member saw (synthesis only)
  coherenceScore?: number;     // 0-1, measured integration coherence (synthesis only)
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
export async function logAgentRun(input: AgentRunInput): Promise<string | null> {
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
 * Log an integration_passes row.
 *
 * Defaults to record_type='trace_observation' — a diagnostic record of which agents ran on a
 * turn. It does NOT author the member-facing response (that is MaiaVoice, single-author).
 * record_type='synthesis' is reserved for a genuine voice-merge and must satisfy the
 * accountability merge-gate (docs/specs/SYNTHESIS_MERGE_GATE_SPEC_2026-06-07.md) before serving.
 */
export async function logIntegrationPass(input: IntegrationPassInput): Promise<string | null> {
  try {
    const result = await queryOne<{ id: string }>(
      `INSERT INTO integration_passes (
        session_id, turn_id, user_id, req_id,
        bridge_agent, inputs, agent_run_ids, integration_method,
        tensions_named, reconciliations, paradoxes_held,
        final_text, coherence_score, depth_score, confidence,
        elemental_mode, meta,
        origin_route, processing_profile,
        record_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
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
        input.recordType ?? 'trace_observation',
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
 * Log a complete corpus callosum TRACE for a turn (record_type='trace_observation').
 *
 * Convenience wrapper that records, as agent_runs, which voices ran:
 * - Atlas classification (structured)
 * - MAIA response (symbolic) — the single author of the member-facing answer
 * - Elemental agents (parallel classifiers)
 * plus one integration_passes row of record_type='trace_observation' that references them.
 *
 * OBSERVATIONAL ONLY. It does not synthesize the response and does not populate
 * synthesis-evidence fields (Clause A — docs/specs/SYNTHESIS_MERGE_GATE_SPEC_2026-06-07.md).
 */
export async function logCorpusCallosumTrace(trace: CorpusCallosumTrace): Promise<{
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
      originRoute: trace.originRoute,
      processingProfile: trace.processingProfile,
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
      originRoute: trace.originRoute,
      processingProfile: trace.processingProfile,
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
      });

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

  // 5) Log a TRACE OBSERVATION if 2+ agents ran.
  //
  // CLAUSE A (docs/specs/SYNTHESIS_MERGE_GATE_SPEC_2026-06-07.md): this is
  // record_type='trace_observation', NOT a synthesis. The member-facing answer is
  // single-authored by MaiaVoice. We therefore leave the synthesis-evidence fields
  // (tensionsNamed / reconciliations / paradoxesHeld / finalText / coherenceScore / depthScore /
  // confidence) NULL — populating them with template/fabricated values would misrepresent a
  // trace as a merge. Element co-presence is recorded honestly in meta as co-presence flags
  // (which opposing voices ran together), NOT as detected or resolved tensions.
  let integrationId: string | null = null;
  if (inputs.length >= 2) {
    const coPresenceFlags: string[] = [];
    if (inputs.some(i => i.element === 'fire') && inputs.some(i => i.element === 'water')) {
      coPresenceFlags.push('fire_water_copresent');
    }
    if (inputs.some(i => i.element === 'earth') && inputs.some(i => i.element === 'air')) {
      coPresenceFlags.push('earth_air_copresent');
    }
    if (inputs.some(i => i.epistemicMode === 'structured') && inputs.some(i => i.epistemicMode === 'symbolic')) {
      coPresenceFlags.push('structured_symbolic_copresent');
    }

    integrationId = await logIntegrationPass({
      sessionId: trace.sessionId,
      turnId: trace.turnId,
      userId: trace.userId,
      recordType: 'trace_observation',
      bridgeAgent: trace.elementalSynthesis ? 'ElementalOracle' : 'CorpusCallosum',
      inputs,
      agentRunIds,
      integrationMethod: 'classifier_trace',
      // Synthesis-evidence fields intentionally left undefined (NULL) for trace_observation:
      tensionsNamed: undefined,
      reconciliations: undefined,
      paradoxesHeld: undefined,
      finalText: undefined,        // a trace does not author the member-facing text
      coherenceScore: undefined,   // no integration is measured on a trace
      depthScore: undefined,
      confidence: undefined,       // fabricated confidence removed (Clause A)
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
        coPresenceFlags, // honest: which opposing voices ran together (NOT adjudicated tensions)
        // The elemental classifier's own status line — kept for diagnostics, NOT member-facing text:
        observationSummary: trace.elementalSynthesis?.synthesis?.slice(0, 200) ?? null,
        harmonics: trace.elementalSynthesis?.harmonics,
        totalLatencyMs: trace.elementalSynthesis?.latencyMs,
      },
      originRoute: trace.originRoute,
      processingProfile: trace.processingProfile,
    });

    if (integrationId) {
      console.log(`🔎 [CorpusCallosum] Trace observation logged: ${inputs.length} agents ran (record_type=trace_observation, not a synthesis)`);
    }
  }

  return { atlasRunId, maiaRunId, elementalRunIds, integrationId };
}
