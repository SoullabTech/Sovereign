/**
 * Field Monitor Recorder — fire-and-forget per-turn telemetry.
 *
 * Records unified subsystem activity for every oracle turn.
 * Pattern: same as oracleUsageLoggingService.ts — never blocks, never throws.
 *
 * No user text is stored. Structure only.
 */

import { query } from '@/lib/db/postgres';

export interface FieldMonitorEvent {
  requestId: string;
  memberId?: string;
  sessionId?: string;

  // Spiralogic
  element?: string;
  phase?: number;
  motion?: string;
  intensity?: number;

  // Frameworks
  frameworksActive?: string[];

  // AIN Shape
  ainShape?: {
    pass: boolean;
    score: number;
    flags: {
      mirror: boolean;
      bridge: boolean;
      permission: boolean;
      nextStep: boolean;
      menuMode: boolean;
    };
  } | null;

  // Opus Axioms
  opus?: {
    isGold: boolean;
    passed: number;
    warnings: number;
    violations: number;
    rupture: boolean;
  };

  // Socratic Validator
  socratic?: {
    decision: string;
    isGold: boolean;
    ruptureCount: number;
    regenerated: boolean;
  } | null;

  // Memory layers (which returned non-null/non-empty data)
  memoryLayers?: {
    session: boolean;
    episodic: boolean;
    somatic: boolean;
    morphic: boolean;
    semantic: boolean;
    coherence: boolean;
    evolution: boolean;
    anamnesis: boolean;
  };

  // Voice
  voice?: {
    element: string;
    archetype: string;
    hysteresis: string;
  };

  // Relational
  relational?: {
    stance: string;
    holdLevel: string;
  };

  // Safety
  fieldSafe?: boolean;
  cognitiveAltitude?: number;

  // Collapse
  dissociationDetected?: boolean;
  breakthroughDetected?: boolean;
  breakthroughType?: string;

  // Performance
  durationMs?: number;
  provider?: string;
  model?: string;
  usedFallback?: boolean;
}

/**
 * Record a field monitor event. Fire-and-forget — never blocks the oracle response.
 */
export async function recordFieldMonitorTurn(e: FieldMonitorEvent): Promise<void> {
  try {
    const frameworks = e.frameworksActive ?? [];
    const ain = e.ainShape;
    const opus = e.opus;
    const soc = e.socratic;
    const mem = e.memoryLayers;
    const voice = e.voice;
    const rel = e.relational;

    await query(
      `INSERT INTO field_monitor_turns (
        request_id, member_id, session_id,
        element, phase, motion, intensity,
        frameworks_active, framework_count,
        ain_pass, ain_score, ain_mirror, ain_bridge, ain_permission, ain_next_step, ain_menu_mode,
        opus_is_gold, opus_passed, opus_warnings, opus_violations, opus_rupture,
        socratic_decision, socratic_is_gold, socratic_rupture_count, socratic_regenerated,
        mem_session, mem_episodic, mem_somatic, mem_morphic, mem_semantic, mem_coherence, mem_evolution, mem_anamnesis,
        voice_element, voice_archetype, voice_hysteresis,
        relational_stance, relational_hold_level,
        field_safe, cognitive_altitude,
        dissociation_detected, breakthrough_detected, breakthrough_type,
        duration_ms, provider, model, used_fallback
      ) VALUES (
        $1, $2, $3,
        $4, $5, $6, $7,
        $8, $9,
        $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21,
        $22, $23, $24, $25,
        $26, $27, $28, $29, $30, $31, $32, $33,
        $34, $35, $36,
        $37, $38,
        $39, $40,
        $41, $42, $43,
        $44, $45, $46, $47
      )`,
      [
        e.requestId,
        e.memberId ?? null,
        e.sessionId ?? null,

        e.element ?? null,
        e.phase ?? null,
        e.motion ?? null,
        e.intensity ?? null,

        frameworks,
        frameworks.length,

        ain?.pass ?? null,
        ain?.score ?? null,
        ain?.flags?.mirror ?? null,
        ain?.flags?.bridge ?? null,
        ain?.flags?.permission ?? null,
        ain?.flags?.nextStep ?? null,
        ain?.flags?.menuMode ?? null,

        opus?.isGold ?? null,
        opus?.passed ?? null,
        opus?.warnings ?? null,
        opus?.violations ?? null,
        opus?.rupture ?? null,

        soc?.decision ?? null,
        soc?.isGold ?? null,
        soc?.ruptureCount ?? null,
        soc?.regenerated ?? null,

        mem?.session ?? false,
        mem?.episodic ?? false,
        mem?.somatic ?? false,
        mem?.morphic ?? false,
        mem?.semantic ?? false,
        mem?.coherence ?? false,
        mem?.evolution ?? false,
        mem?.anamnesis ?? false,

        voice?.element ?? null,
        voice?.archetype ?? null,
        voice?.hysteresis ?? null,

        rel?.stance ?? null,
        rel?.holdLevel ?? null,

        e.fieldSafe ?? null,
        e.cognitiveAltitude ?? null,

        e.dissociationDetected ?? false,
        e.breakthroughDetected ?? false,
        e.breakthroughType ?? null,

        e.durationMs ?? null,
        e.provider ?? null,
        e.model ?? null,
        e.usedFallback ?? false,
      ]
    );
  } catch (err) {
    // Never block the oracle response on telemetry
    console.warn('[field-monitor] Record failed (non-critical):', err);
  }
}
