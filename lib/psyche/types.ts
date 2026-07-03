/**
 * Psyche Engagement Layer — Phase 1 Types
 *
 * Governed by:
 *   - docs/canon/THE_CLEARING.md
 *   - docs/canon/SPIRAL_CONTINUITY_ENGINE.md
 *   - docs/canon/RIGHT_TO_REMAIN_UNPOSSESSED.md
 * Spec:
 *   - docs/specs/PSYCHE_ENGAGEMENT_LAYER_SPEC.md
 *
 * Core rule:
 *   Material may exist in the field. It becomes portfolio memory only when
 *   the member keeps it.
 *
 * Architectural ethic:
 *   This is not a system for knowing the member. It is a structure for the
 *   member to know themselves through recursive encounter. The webbing
 *   preserves relation and becoming — not identity-as-product.
 *
 * The keeping-gesture IS the saliency signal (not input to a heuristic).
 * MAIA's attention organizes around what the member has kept.
 */

// ════════════════════════════════════════════════════════════════════════════
// Source
// ════════════════════════════════════════════════════════════════════════════

/**
 * Where the material originated before the member kept it.
 * The atom POINTS at the source; it does not duplicate source content
 * (except for 'spontaneous' atoms where the member typed directly into Keep).
 */
export type MemoryAtomSourceType =
  | 'idea'             // member_ideas
  | 'idea_block'       // member_idea_blocks
  | 'journal'          // journal entries (source bridge stub)
  | 'dream'            // dream entries (source bridge stub)
  | 'reflection'       // reflection entries (source bridge stub)
  | 'decision'         // a decision block, or standalone
  | 'change'           // a change block, or standalone
  | 'session_excerpt'  // excerpt from a conversation session
  | 'spontaneous'      // member typed directly into Keep (body required)
  | 'practitioner_observation'; // authored BY a practitioner ABOUT the member —
                                // NOT member-keepable (keepSource rejects it); the
                                // member may only respond to it (decline). Present
                                // in member_memory_atoms.source_type; the loader
                                // surfaces it and the decline route scopes to it.

// ════════════════════════════════════════════════════════════════════════════
// Registers and lenses (the webbing)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Memory hierarchy register — a vantage point on what was kept.
 *
 * IMPORTANT: Registers are member-assigned views, NOT classifications.
 * The same atom may live in multiple registers simultaneously (webbing).
 * System NEVER auto-assigns registers.
 *
 * Per Spiral Memory Hierarchy.
 */
export type MemoryRegister =
  | 'episodic'          // individual lived moment
  | 'thematic'          // recurring motif
  | 'developmental'     // spiral movement
  | 'archetypal'        // symbolic pattern
  | 'relational'        // attachment dynamics
  | 'threshold'         // irreversible transformation
  | 'witnessed'         // practitioner co-held
  | 'sacred_protected'; // non-inferential, non-circulating

/**
 * Elemental lens — a way of seeing kept material.
 *
 * IMPORTANT: Lenses are member-selected navigation modes, NOT diagnostic
 * classifications. The same atom may be viewed through multiple lenses
 * across time. The element does NOT classify the member or the material —
 * it determines which dimension is in view in this moment.
 *
 * Never inferred by MAIA. Never used as identity.
 */
export type ElementalLens =
  | 'fire'    // calling, desire, emergence
  | 'water'   // grief, dream, depth, feeling
  | 'earth'   // embodiment, incarnation, practicality
  | 'air'     // meaning, language, perspective
  | 'aether'; // continuity, holding, field coherence

// ════════════════════════════════════════════════════════════════════════════
// Status & return
// ════════════════════════════════════════════════════════════════════════════

/**
 * Status reflects member gestures. The system NEVER infers status.
 */
export type MemoryAtomStatus =
  | 'active'       // kept and present
  | 'still_alive'  // explicitly marked alive (higher saliency weight)
  | 'set_aside'    // parked (lower weight)
  | 'protected'    // held without circulation (voice-ineligible)
  | 'archived';    // removed from active recall (still preserved)

/**
 * How the member wants this material to return to them.
 * Default: 'member_pulled' — most restrictive.
 */
export type ReturnPreference =
  | 'member_pulled'         // only when member asks directly
  | 'contextual_doorway'    // MAIA may offer when proximity filter passes (Phase 2)
  | 'ritual_review_opt_in'; // appears in member-enabled review surfaces (Phase 2+)

/**
 * The member's verdict on an observation surfaced ABOUT them (a
 * practitioner_observation atom). NULL until the member responds.
 *
 * This is a DIFFERENT axis from status: status is how the member curates
 * material they placed; member_response_status is the member's authority over a
 * claim someone else made about them. 'rejected' releases the observation from
 * ambient recall — the loader excludes it, so a declined observation is not
 * silently re-carried. Only 'rejected' has a runtime writer today; 'confirmed'
 * and 'modified' are reserved forward-compat verdicts.
 *
 * The system NEVER sets this. It moves only via an explicit member gesture.
 */
export type MemberResponseStatus = 'confirmed' | 'rejected' | 'modified';

// ════════════════════════════════════════════════════════════════════════════
// Reverberation guard
// ════════════════════════════════════════════════════════════════════════════

/**
 * Interpretation status — how interpreted this material is.
 */
export type InterpretationStatus =
  | 'uninterpreted'           // System has not touched meaning
  | 'member_named'            // Member supplied a name/frame
  | 'practitioner_witnessed'; // Co-held with a practitioner

/**
 * Voice eligibility — where this material may appear in MAIA's voice.
 */
export type VoiceEligibility =
  | 'record_only'  // Visible in portfolio; not voice-eligible
  | 'invitable'    // May be offered via invitation grammar (Phase 2)
  | 'speakable';   // Member/practitioner has authorized free reference

/**
 * Guardrails that travel with every CrystallizedMemory.
 * Enforces non-formation discipline at the type level.
 *
 * NOTE: `crossingAllowed: false` is typed as the LITERAL `false` value,
 * not the `boolean` type. This is intentional. Material in one register
 * cannot be crossed with material in another to form higher-order claims
 * without explicit member ratification. Lifting this requires explicit
 * schema migration AND type change — friction by design.
 */
export interface ReverberationGuard {
  interpretationStatus: InterpretationStatus;
  voiceEligibility: VoiceEligibility;
  crossingAllowed: false;
}

// ════════════════════════════════════════════════════════════════════════════
// CrystallizedMemory — the atom
// ════════════════════════════════════════════════════════════════════════════

/**
 * A CrystallizedMemory is a kept atom — the registry entry for material
 * the member has explicitly chosen to hold.
 *
 * The atom POINTS at its source; it does not duplicate source content.
 * Spontaneous atoms store their content directly in `body`.
 *
 * An atom may live across multiple registers and lenses (the webbing).
 * The member places. The system records. The system does not classify.
 */
export interface CrystallizedMemory {
  id: string;
  memberId: string;

  // Source bridge — where this material came from before keeping
  sourceType: MemoryAtomSourceType;
  sourceId: string | null;  // NULL only for sourceType === 'spontaneous'

  // Content
  title: string;            // Member-given label
  body: string | null;      // Required for 'spontaneous'; null for sourced atoms

  // Member-placed registers (webbing — multi-valued)
  primaryRegister: MemoryRegister | null;
  registers: MemoryRegister[];

  // Member-selected elemental lenses (navigation, not classification)
  elementalLenses: ElementalLens[];

  // Connective tissue — threads this atom belongs to
  threadIds: string[];

  // Status reflects member gestures only
  status: MemoryAtomStatus;

  // Return loop preferences
  returnPreference: ReturnPreference;
  lastSurfacedAt: string | null;
  surfaceCount: number;

  // Member's response to an observation surfaced ABOUT them (practitioner_observation).
  // NULL until the member responds. 'rejected' releases the atom from ambient recall.
  memberResponseStatus: MemberResponseStatus | null;
  memberResponseAt: string | null;

  // The formation moment (when the member kept this)
  keptAt: string;
  lastTouchedAt: string;

  // Database metadata
  createdAt: string;
  updatedAt: string;

  // Non-formation guardrails
  reverberationGuard: ReverberationGuard;
}

// ════════════════════════════════════════════════════════════════════════════
// Portfolio source bridge
// ════════════════════════════════════════════════════════════════════════════

/**
 * A candidate from a source surface that the member may choose to keep.
 *
 * Shown in the portfolio's source-bridge view:
 *   "These are things you've created or reflected on.
 *    Choose what you want MAIA to keep."
 *
 * Source items remain in their native tables. This is a read-only
 * projection into the portfolio's choosing surface.
 */
export interface PortfolioSourceCandidate {
  sourceType: MemoryAtomSourceType;
  sourceId: string;
  title: string;
  preview: string;       // Short snippet (member-readable)
  createdAt: string;
  alreadyKept: boolean;
  keptAtomId: string | null;  // If alreadyKept, the atom id
}

// ════════════════════════════════════════════════════════════════════════════
// Gestures (the formation events)
// ════════════════════════════════════════════════════════════════════════════

/**
 * The keep-this gesture — the formation event.
 *
 * This is Phase 1's primary write operation. Until this gesture happens,
 * material is not portfolio memory. After this gesture, it is.
 *
 * Arrival ≠ keeping. Keeping is the act of invocation.
 */
export interface KeepGestureInput {
  memberId: string;
  sourceType: MemoryAtomSourceType;
  sourceId: string | null;  // Required unless sourceType === 'spontaneous'
  title: string;
  body: string | null;       // Required for 'spontaneous'

  // Optional member placements at the moment of keeping.
  // Member may add more (or change) later via re-placement gestures.
  primaryRegister?: MemoryRegister;
  registers?: MemoryRegister[];
  elementalLenses?: ElementalLens[];
  threadIds?: string[];
}

/**
 * Gestures that update an existing atom's status or placement.
 * Each gesture changes one specific dimension.
 */
export type AtomGesture =
  | { kind: 'mark_still_alive' }
  | { kind: 'set_aside' }
  | { kind: 'protect' }
  | { kind: 'archive' }
  | { kind: 'return_to_active' }
  | { kind: 'replace_primary_register'; register: MemoryRegister | null }
  | { kind: 'add_register'; register: MemoryRegister }
  | { kind: 'remove_register'; register: MemoryRegister }
  | { kind: 'add_lens'; lens: ElementalLens }
  | { kind: 'remove_lens'; lens: ElementalLens }
  | { kind: 'add_thread'; threadId: string }
  | { kind: 'remove_thread'; threadId: string }
  | { kind: 'set_return_preference'; preference: ReturnPreference }
  | { kind: 'touch' };  // member viewed; updates last_touched_at only

// ════════════════════════════════════════════════════════════════════════════
// Portfolio navigation
// ════════════════════════════════════════════════════════════════════════════

/**
 * Member-controlled portfolio views.
 *
 * All views are member-selected navigation. None are system-imposed.
 * The webbing means the same atom may appear in many views simultaneously.
 */
export type PortfolioView =
  | { kind: 'chronological' }                                  // all atoms by keptAt DESC
  | { kind: 'still_alive' }                                    // status = 'still_alive'
  | { kind: 'set_aside' }                                      // status = 'set_aside'
  | { kind: 'protected' }                                      // status = 'protected'
  | { kind: 'archived' }                                       // status = 'archived'
  | { kind: 'by_source'; sourceType: MemoryAtomSourceType }    // Ideas, Journals, Dreams...
  | { kind: 'by_register'; register: MemoryRegister }          // Episodic, Thematic, Threshold...
  | { kind: 'by_lens'; lens: ElementalLens }                   // Fire, Water, Earth, Air, Aether
  | { kind: 'by_thread'; threadId: string };                   // member-named thread

// ════════════════════════════════════════════════════════════════════════════
// Lens passes (entry-as-practice)
// ════════════════════════════════════════════════════════════════════════════

/**
 * A LensPass is the record of a member encountering a kept atom through
 * an elemental lens.
 *
 * IMPORTANT: The lens is an ACTION, not a LABEL.
 * The member is NEVER stored as a lens-type. There is no `member.element`.
 * Each encounter is a fresh act. Multiple passes per atom across time
 * constitute self-encounter (cycling through registers), not self-diagnosis
 * (settling into an identity).
 *
 * This is the entry-as-practice surface — the architecture teaches itself
 * through the practice, not through explanation.
 */
export interface LensPass {
  id: string;
  memberId: string;
  memoryAtomId: string;
  lens: ElementalLens;
  prompt: string;          // The prompt MAIA offered for this lens
  memberResponse: string;  // What the member said (verbatim)
  createdAt: string;
}

/**
 * Input for creating a lens pass — the entry-as-practice gesture.
 */
export interface LensPassInput {
  memberId: string;
  memoryAtomId: string;
  lens: ElementalLens;
  prompt: string;
  memberResponse: string;
}

/**
 * Standard prompts for each elemental lens.
 *
 * IMPORTANT: These prompts INVITE encounter. They do not assert what the
 * lens "means." The prompt is a doorway; the member's response is the
 * actual content of the encounter.
 *
 * Operational form: "Bring one thing. Look at it five ways."
 */
export const ELEMENTAL_LENS_PROMPTS: Record<ElementalLens, string> = {
  fire:   'What wants to move?',
  water:  'What are you feeling underneath it?',
  earth:  'What is real or practical right now?',
  air:    'What needs language or perspective?',
  aether: 'What wants to be held without solving?',
};

// ════════════════════════════════════════════════════════════════════════════
// Saliency
// ════════════════════════════════════════════════════════════════════════════

/**
 * Computed saliency score for a kept atom, derived ONLY from member gestures.
 *
 * The score is NOT used to surface material autonomously. It informs MAIA's
 * working set during conversation — the kept material is present as the
 * frame MAIA holds the moment within, with weight following member gestures.
 *
 * No hidden profile. No behavioral inference. Just:
 *   MAIA attends where the member has asked her to attend.
 */
export interface AtomSaliency {
  atomId: string;
  weight: number;           // 0..1, derived from gestures
  derivedFrom: {
    status: MemoryAtomStatus;
    daysSinceLastTouched: number;
    keptDurationDays: number;
    surfaceCount: number;
  };
}
