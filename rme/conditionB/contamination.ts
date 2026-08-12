/**
 * RME-001 — Condition B contamination surfaces
 *
 *   FRESH DOES NOT MEAN CONTEXTLESS.
 *
 * B loses accumulated relational history from before the experimental boundary.
 * It does NOT lose the ability to understand the present utterance as well as any
 * competent conversational intelligence reasonably can. An impoverished baseline
 * makes A > B uninterpretable: it would measure handicap, not continuity.
 *
 * So B has two failure modes, and they pull in opposite directions:
 *
 *   WEAKENED     — B was denied something a competent fresh MAIA should have.
 *   CONTAMINATED — B retained member-specific history it should not have.
 *
 * Both invalidate the comparison. This module enumerates the concrete surfaces on
 * which each can occur, derived from the CRD-SA-001 verification of canonical
 * `52a3b924b7cf52013c1c8b0d635359c2cad672fc` — not from imagination.
 */

/** What B MUST retain. Removing any of these produces a strawman. */
export const B_MUST_RETAIN = [
  'full_model_capability',
  'ordinary_safety',
  'original_sanctuary_posture',
  'present_turn_member_message',
  'same_session_context_needed_to_understand_the_utterance',
  'normal_relational_intelligence',
] as const;
export type BRetention = (typeof B_MUST_RETAIN)[number];

/**
 * Concrete surfaces through which member-specific history could re-enter B.
 * Each names the real mechanism found in canonical source, so the check is
 * against the system that exists rather than a generic worry.
 */
export const CONTAMINATION_SURFACES = [
  {
    id: 'cognitive_profile_rolling_average',
    mechanism:
      'getCognitiveProfile(userId) → getAverageCognitiveLevel(userId, window=20) → rollingAverage. ' +
      'Keyed on userId, spans 20 turns, and additionally gates access via enforceFieldSafety.',
    risk: 'B inherits a 20-turn accumulated judgment formed before the experimental boundary.',
    mustBeExcludedFromB: true,
  },
  {
    id: 'awareness_level_detection_history_arg',
    mechanism:
      'awarenessLevelDetector.detectAwarenessLevel(input, conversationHistory) inside ' +
      'buildComprehensiveVoicePrompt. Momentary by construction — but the SECOND argument ' +
      'is conversation history.',
    risk:
      'If conversationHistory reaches back past the experimental boundary, B is contaminated ' +
      'through a mechanism that otherwise looks correctly momentary.',
    mustBeExcludedFromB: false, // the call is fine; the history argument must be truncated
  },
  {
    id: 'retrieval_addenda',
    mechanism: 'Recall addenda assembled into the prompt from prior-turn stores.',
    risk: 'Direct reintroduction of accumulated continuity.',
    mustBeExcludedFromB: true,
  },
  {
    id: 'expansion_events',
    mechanism: 'expansionEventService persists member insight/breakthrough/integration moments.',
    risk: 'Prior member-growth telemetry informing a supposedly fresh encounter.',
    mustBeExcludedFromB: true,
  },
  {
    id: 'witness_capacity_profile',
    mechanism:
      'MAIAMemoryArchitecture witnessCapacity { selfObservation, metaCognition, ... } with ' +
      'threshold unlocks (deep_witness at >= 8).',
    risk: 'An accumulated member profile altering what B is permitted to do.',
    mustBeExcludedFromB: true,
  },
  {
    id: 'session_cached_state',
    mechanism: 'Any per-session cache or memoized context surviving across the boundary.',
    risk: 'Silent carry-over that no explicit context assembly step reveals.',
    mustBeExcludedFromB: true,
  },
  {
    id: 'middleware_injection',
    mechanism: 'Middleware or wrapper layers that add member context after assembly.',
    risk: 'Contamination invisible at the call site that builds B.',
    mustBeExcludedFromB: true,
  },
] as const;

export type ContaminationSurfaceId = (typeof CONTAMINATION_SURFACES)[number]['id'];

export interface BExecutionPlan {
  readonly encounterId: string;
  /** Everything B is keeping. Must cover B_MUST_RETAIN exactly. */
  readonly retained: readonly BRetention[];
  /** Surfaces the plan asserts are excluded or truncated at the boundary. */
  readonly excludedSurfaces: readonly ContaminationSurfaceId[];
  /** History passed to any momentary detector must not reach past this turn. */
  readonly historyTruncatedAtTurnId: number | null;
}

export class BWeakened extends Error {
  constructor(missing: readonly string[]) {
    super(
      `RME-001: condition B would be a strawman — missing ${missing.join(', ')}. ` +
        'Fresh does not mean contextless. A > B would measure handicap, not continuity.',
    );
    this.name = 'BWeakened';
  }
}

export class BContaminated extends Error {
  constructor(surfaces: readonly string[]) {
    super(
      `RME-001: condition B is contaminated via ${surfaces.join(', ')}. ` +
        'B retained member-specific history from before the experimental boundary.',
    );
    this.name = 'BContaminated';
  }
}

/**
 * Both checks in one place, because passing one and failing the other is the
 * realistic error: an engineer removing contamination tends to over-remove.
 */
export function validateBPlan(plan: BExecutionPlan): void {
  const missing = B_MUST_RETAIN.filter((r) => !plan.retained.includes(r));
  if (missing.length) throw new BWeakened(missing);

  const required = CONTAMINATION_SURFACES.filter((s) => s.mustBeExcludedFromB).map((s) => s.id);
  const unexcluded = required.filter((id) => !plan.excludedSurfaces.includes(id));
  if (unexcluded.length) throw new BContaminated(unexcluded);

  if (plan.historyTruncatedAtTurnId === null) {
    throw new BContaminated(['awareness_level_detection_history_arg (history not truncated)']);
  }
}
