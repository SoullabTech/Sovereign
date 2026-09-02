/**
 * Memory Orchestrator — Types
 *
 * A compact contract for the runtime memory coordination layer.
 *
 * The orchestrator sits between route-level memory loading and final prompt
 * assembly. It decides which memory sources matter for a given turn, what
 * role each plays, how strongly they should influence the response, whether
 * contradiction with prior state is present, and whether the current turn
 * looks like a reinforcement/consolidation candidate.
 *
 * First version is stateless, synchronous, and pure. No DB reads. The caller
 * (route handler) is responsible for gathering inputs and passing them in.
 *
 * Phase 2 readiness flags (semantic / somatic / morphic) are preparatory
 * only — they flag candidacy for future retrieval layers without running any
 * semantic/body/cycle logic yet.
 */

import type { ExclusionReason } from '../participationGate';

/** Known memory sources the orchestrator can select from. */
export type MemorySource =
  | 'conversation_history'
  | 'developmental_memory'
  | 'spiral_state'
  | 'relationship_anamnesis'
  | 'theme_signals'
  | 'member_live_context'
  // Phase 2 placeholders — not yet active
  | 'semantic_memory'
  | 'somatic_memory'
  | 'morphic_pattern';

/** Role a source plays on this turn. */
export type MemorySourceRole =
  | 'continuity'          // session-level arc carrier
  | 'directional_prime'   // subtle shape-setter (e.g. stored developmental pattern)
  | 'state_context'       // current elemental/phase context
  | 'relational_field'    // interpersonal field/stance context
  | 'pattern_cue'         // thematic/participatory signal
  // Phase 2 role placeholders
  | 'semantic_echo'
  | 'embodied_context'
  | 'archetypal_echo';

/** Overall influence strength the plan suggests for this turn. */
export type MemoryInfluenceStrength = 'none' | 'low' | 'medium' | 'high';

/**
 * Minimal shape for a developmental memory snapshot passed to the
 * orchestrator. Only the fields the orchestrator actually uses — not the
 * full DB row. Callers can shape their own row into this.
 */
/**
 * Fields common to a developmental memory snapshot regardless of whether it may
 * participate. Deliberately carries NOTHING that could compose into a prompt.
 */
export interface DevelopmentalMemoryBase {
  id: string;
  memory_type?: string | null;
  facet_code?: string | null;
  significance: number;
  formed_at: string | Date;
}

/**
 * A snapshot the participation gate ADMITTED. This is the only shape that
 * carries `directional_cue`.
 */
export interface AdmittedDevelopmentalMemory extends DevelopmentalMemoryBase {
  participation: 'admitted';
  /** Distilled directional cue. Present ONLY on an admitted snapshot. */
  directional_cue?: string | null;
}

/**
 * A snapshot the participation gate EXCLUDED. It has no `directional_cue`
 * field at all — not a null one, not an optional one. Absent.
 */
export interface ExcludedDevelopmentalMemory extends DevelopmentalMemoryBase {
  participation: 'excluded';
  exclusionReason: ExclusionReason;
}

/**
 * P3 (MIPA Phase 0) — THE COMPOSER CANNOT REACH AN EXCLUDED CUE.
 *
 * This is a discriminated union, not a flag. `snapshot.directional_cue` does
 * not typecheck until `snapshot.participation === 'admitted'` has narrowed it,
 * because the excluded arm has no such property. The hostile-fork mutation
 *
 *     composer += developmentalMemory.directional_cue
 *
 * therefore fails to compile rather than failing a review — which is the
 * difference between Grade A and Grade C.
 *
 * The previous shape carried `directional_cue?: string | null` unconditionally,
 * and the only thing standing between it and the prompt was an adjacent
 * instruction telling the model not to reference it.
 */
export type DevelopmentalMemorySnapshot =
  | AdmittedDevelopmentalMemory
  | ExcludedDevelopmentalMemory;

/**
 * Minimal shape for a spiral state snapshot. Matches what loadSpiralState
 * already returns in the oracle route.
 */
export interface SpiralStateSnapshot {
  dominant_element?: string | null;
  phase?: number | null;
  motion?: string | null;
  intensity?: number | null;
  relational_phase?: number | null;
}

/**
 * Minimal shape for a theme signal snapshot (member_theme_signals row).
 * Only the fields the orchestrator uses.
 */
/** Fields common to a theme signal regardless of participation. */
export interface ThemeSignalBase {
  theme: string;
  signal_type?: string;
  resonance_strength?: number | null;
  element?: string | null;
  detected_at?: string | Date;
}

/** A theme signal the participation gate admitted. */
export interface AdmittedThemeSignal extends ThemeSignalBase {
  participation: 'admitted';
}

/** A theme signal the participation gate excluded. */
export interface ExcludedThemeSignal extends ThemeSignalBase {
  participation: 'excluded';
  exclusionReason: ExclusionReason;
}

/**
 * P3 — theme signals are machine inference about the member (scored
 * `resonance_strength`, no provenance trail to what produced it). They compose
 * no content today, but presence alone is still participation: an uncertified
 * inference shaping tone is what the invariant excludes.
 */
export type ThemeSignalSnapshot = AdmittedThemeSignal | ExcludedThemeSignal;

/**
 * Input accepted by buildMemoryInfluencePlan.
 *
 * All fields are optional — the orchestrator handles missing inputs
 * gracefully so it can be called from routes with different context shapes.
 */
export interface MemoryOrchestratorInput {
  /** Current user message. Required in practice even if typed optional. */
  message: string;
  /** userId/memberId if known — not used for DB reads in first version. */
  userId?: string | null;
  /** In-session conversation history array (format agnostic). */
  conversationHistory?: unknown[];
  /** Most recent / significant developmental memories if route pre-loaded them. */
  recentDevelopmentalMemories?: DevelopmentalMemorySnapshot[];
  /** Current spiral state if route pre-loaded it (via loadSpiralState). */
  spiralState?: SpiralStateSnapshot | null;
  /** Whether route has an active relationship anamnesis / essence present. */
  hasRelationshipAnamnesis?: boolean;
  /** Recent theme signals if route pre-loaded them. */
  recentThemeSignals?: ThemeSignalSnapshot[];
  /** Whether route has active memberLiveContext present. */
  hasMemberLiveContext?: boolean;
  /** Whether route has active event arc context present. */
  hasActiveEventContext?: boolean;
  /** Whether route has active relational context present. */
  hasActiveRelationalContext?: boolean;
}

/**
 * Output plan produced by buildMemoryInfluencePlan.
 *
 * The plan is consumed by prompt assembly — `promptBlock` is the compact
 * string appended into the final system prompt. Other fields are
 * informational and available for telemetry / logging.
 */
export interface MemoryInfluencePlan {
  /** Whether any memory influence should be applied at all. */
  shouldUseMemory: boolean;
  /** Ordered list of selected sources. */
  selectedSources: MemorySource[];
  /** Per-source role assignment. */
  sourceRoles: Partial<Record<MemorySource, MemorySourceRole>>;
  /** Overall influence strength signal. */
  influenceStrength: MemoryInfluenceStrength;
  /** True if current message contradicts prior stabilized direction. */
  contradictionDetected: boolean;
  /** True if current turn looks like a consolidation/deepening moment. */
  reinforcementCandidate: boolean;
  /** Phase 2 readiness — current message looks like it could benefit from semantic retrieval. */
  semanticCandidate: boolean;
  /** Phase 2 readiness — current message contains user-reported body state language. */
  somaticCandidate: boolean;
  /** Phase 2 readiness — current message references recurrence/cycle/archetypal motif. */
  morphicCandidate: boolean;
  /** Human-readable reasoning trace (compact). */
  reasoning: string[];
  /** Compact prompt block appended to final system prompt (may be empty). */
  promptBlock: string;
}
