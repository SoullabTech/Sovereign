/**
 * MAIA MindContext Types
 *
 * Type-safe interfaces for threading PFI mind state through response paths.
 * Replaces (meta as any) patterns with explicit, canon-aligned typing.
 *
 * CANON PRINCIPLES (see docs/canon/MAIA_CANON_v1.1.md):
 * - Type safety is part of canon: linguistic/structural integrity prevents drift
 * - No teleology in field names (readiness, not "breakthrough")
 * - autonomyRatio governs articulation assistance, never mind conclusions
 * - All fields serve remembrance, not steering
 */

import type { CognitiveProfile } from '../../consciousness/cognitiveProfileService';

// =============================================================================
// ELEMENT TYPES
// =============================================================================

/** Elemental domains in the Spiralogic system */
export type ElementName = 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';

/** Field realms for routing consciousness work (aligned with FieldRealm in panconsciousFieldRouter) */
export type RealmName = 'MIDDLEWORLD' | 'UPPERWORLD_SYMBOLIC' | 'UNDERWORLD';

/** Source of PFI mind state generation */
/**
 * PFI-REPRESENTATION — ⛔ `pfi_full` RETIRED.
 *
 * The branch it named imports two integration modules, uses neither, logs
 * "Would integrate 50+ systems (pending canon drift tests)", and returns the
 * same routing-derived state with larger constants. Calling that `pfi_full` is
 * precisely the label-over-measurement error this census set out to expose.
 *
 * ⭐⭐ A requested capability is not an achieved capability.
 *
 * `pfi_legacy` is renamed `routing_only`, which is what it actually is.
 */
export type PFISource = 'routing_only' | 'fallback';

/**
 * PFI Mind State - Field-derived pre-language state
 *
 * CANON: This state can influence settling/tone and articulation assistance,
 * but must NEVER steer conclusions, create convergence, or amplify certainty.
 */
export interface PFIMindState {
  // Field-derived state (pre-language)
  /**
   * FIELD-TRUTH-03 — ABSENT when no elemental signal reached PFI, or when the
   * incoming value was not a recognised element.
   *
   * ⭐⭐ A fallback may preserve operational posture. It may not manufacture
   *     observational content. Absence of an elemental reading is not Earth.
   */
  elementalDominance?: ElementName;

  // ── ROUTING DECISIONS ──────────────────────────────────────────────────────
  // What the system DECIDED, not what it measured about the member.
  // ⭐ "We chose the cautious posture" is not the same statement as
  //   "we observed that the member requires the cautious posture."
  fieldWorkSafe: boolean;
  realm: RealmName;
  deepWorkRecommended: boolean;

  /**
   * PFI-REPRESENTATION — why those decisions exist. The router has two meanings
   * and they must not look identical epistemically:
   *   'profile_derived'              a cognitive profile was read
   *   'conservative_policy_default'  no profile; the careful posture was chosen
   */
  routingBasis: RoutingBasis;

  /** What GENERATED this state — distinct from what the routing rested on. */
  source: PFISource;
}

/**
 * ⛔ DELETED BY PFI-REPRESENTATION (2026-09-09), five with zero consumers and
 * three that carried no information beyond a boolean:
 *
 *   elementalBalance 0.6 · resonanceIndex 0.5 · integrationReadiness ·
 *   integrationCoverage 0.2/0.8 · signalQuality 0.7/0.75   — never read
 *   coherenceLevel   fieldWorkSafe ? 0.7 : 0.4             — a boolean in decimals
 *   reactivityIndex  1 - (fieldWorkSafe ? 0.7 : 0.3)       — the same boolean again
 *   autonomyRatio    constant 1.0                          — policy, not observation
 *
 * ⭐⭐ If a number contains no information beyond a boolean, the boolean is the
 *     knowledge and the number is presentation.
 *
 * ⛔ They are NOT kept as optional placeholders. `resonanceIndex?: number` is a
 * vacant socket, and a future implementer would quite reasonably fill it.
 *
 * ⭐⭐ A future capability is not a present data field. Do not preserve the
 *     intention of a future signal by requiring the present system to have a
 *     place to lie about it.
 *
 * The design intent is preserved in the programme record (DESIGN-OWED SIGNALS),
 * not in the executable ontology. A real resonance intelligence will EARN a
 * field from its evidence; it will not inherit a socket.
 *
 * "MAIA retains sovereignty over articulation assistance" remains architectural
 * policy — it belongs in the constitution, not in a per-turn numeric observation.
 */
export type RoutingBasis = 'profile_derived' | 'conservative_policy_default';

/**
 * Conversation Turn - minimal structure for history
 */
export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  userMessage?: string;
  maiaResponse?: string;
}

/**
 * Mind Context - unified context for MAIA's mind generation
 *
 * CANON: This context provides field awareness without steering.
 * It serves recognition, not persuasion.
 */
export interface MindContext {
  // Core inputs for mind generation
  userId: string | null;
  sessionId: string;
  input: string;
  conversationHistory: ConversationTurn[];
  cognitiveProfile: CognitiveProfile | null;

  // Optional PFI mind state (feature-flagged)
  pfiMindState?: PFIMindState;

  // Canon-relevant derived flags (optional; safe scalars only)
  canonFlags?: {
    enemyFrameDetected?: boolean;
    persuasionPressure?: boolean;
    highHeatInput?: boolean;
  };
}

// =============================================================================
// TELEMETRY TYPES
// =============================================================================

/**
 * Canon-compliant telemetry record
 *
 * CONSTRAINTS:
 * - Console-only, no persistence
 * - No raw user text
 * - No engagement proxies (session length, time on platform, share intent)
 * - Only canon-relevant scalars
 */
/**
 * PFI-REPRESENTATION — telemetry reports DECISIONS AND BASIS, never aliases.
 *
 * ⭐ Observation systems are not exempt from truthfulness. Logging
 * `coherence = 0.7` merely ARCHIVES the fiction instead of giving it to
 * cognition — a dashboard can launder a hard-coded mapping just as effectively
 * as a prompt can.
 *
 * Preflight census (exact, whole repo, all file types) found only this type, its
 * emitter, four call sites and one test: no parser, internal or external. The
 * shape therefore changes directly rather than being versioned.
 */
export interface PFITelemetryRecord {
  _tag: 'PFI_TELEMETRY';
  source: PFISource;
  path: 'FAST' | 'CORE' | 'DEEP';
  routingBasis: RoutingBasis;
  fieldWorkSafe: boolean;
  realm: RealmName;
  deepWorkRecommended: boolean;
  /** Whether a real elemental signal reached PFI. Presence, not a fabricated value. */
  elementalSignal: 'present' | 'absent';
  timestamp: number;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Default fallback mind state for when PFI is unavailable
 *
 * CANON: Fallback maintains full autonomy and grounded presence.
 */
export function getDefaultMindState(): PFIMindState {
  return {
    // ⛔ No element, and no invented numbers. Posture only.
    fieldWorkSafe: true,
    realm: 'MIDDLEWORLD',
    deepWorkRecommended: false,
    routingBasis: 'conservative_policy_default',
    source: 'fallback'
  };
}
