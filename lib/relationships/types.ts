/**
 * Relational Context Bridge — type definitions
 *
 * Light coupling layer between the Relationships system (/relationships) and
 * MAIA's oracle. Mirrors the shape and intent of Event Arc's ActiveEventContext.
 *
 * Principle: signal, not payload. The bridge transfers a way of seeing,
 * not the underlying data.
 *
 * See: memory/project_relational_context_bridge.md
 *
 * Also defines the shared `RelationshipSignal` type used by /maia's
 * RelationshipFieldCard and the labtools. See sections below.
 */

export type RelationshipRealm = 'outer' | 'inner' | 'transpersonal';

/**
 * Four modes — each mapped to one of the doorways on /relationships/[id].
 * The doorway is the prior; tone classifier biases inference if entries
 * drift from the doorway. No LLM inference. Deterministic.
 *
 *   "Start with what is on your mind" → reflective
 *   "Add a person"                    → interpersonal
 *   "Meet an inner figure"            → archetypal
 *   "Let patterns emerge"             → pattern
 */
export type RelationalMode =
  | 'reflective'
  | 'interpersonal'
  | 'archetypal'
  | 'pattern';

/**
 * The interpretive bridge that makes MAIA respond with relational awareness.
 * Compact by design — signal, not payload.
 *
 * NOTE: relationshipLabel is present in context for traceability and natural
 * reference *if the user names it first*. MAIA must NEVER volunteer it.
 * Themes / tensions / continuity signals are orientation, not vocabulary.
 *
 * Mirrors the shape and intent of ActiveEventContext.
 */
export interface ActiveRelationalContext {
  relationshipId: string;
  relationshipLabel: string | null;
  realm: RelationshipRealm;
  bondType: string | null;
  mode: RelationalMode;
  /** dominant_pattern + developmental_theme + recent pattern_hints. Max 3. */
  salientThemes: string[];
  /** active_signals filtered for tension keywords. Max 3. */
  currentTensions: string[];
  /** Recent entry kinds in time order, most recent first. Max 5. */
  continuitySignals: string[];
}

// ═════════════════════════════════════════════════════════════════════════════
// RELATIONSHIP SIGNAL (Phase 2 — live field card)
//
// Used by:
//   - `lib/relationships/detectRelationalSignal.ts` (auto-detection)
//   - `app/api/maia/relational-signal/route.ts`
//   - `components/maia/RelationshipFieldCard.tsx`
//   - the three relational labtools (manual signals on save)
//
// v1 scope is deliberately narrow: we describe *what is noticed*, not *who
// the person is*. We never store inferred attachment style, pathology, or
// personality verdicts. See CLAUDE.md §Sovereignty Invariants.
// ═════════════════════════════════════════════════════════════════════════════

// [Relational Layer — Phase 2 + Phase 4]
/**
 * Canonical tones used across the field card, detector, check-ins, and the
 * Relational Field entry flow.
 *
 * Phase 2 canonical set: `open | warm | active | quiet | fragile | distant |
 * contracted | tense | unresolved | unclear` (used by the background
 * detector and CheckInFlow).
 *
 * Phase 4 entry-flow additions: `tender | strained | conflicted | heavy |
 * shut_down` — drawn from the Relational Field spec. Append-only union
 * so the substrate stays stable and readers handle the full range.
 */
/**
 * Tones the background detector currently has authority to INFER from a
 * member's language. `TONE_LANGUAGE` in detectRelationalSignal.ts is typed
 * against this, not against the full union.
 *
 * ⚠️ This is an authority boundary, not a claim about what is knowable. It
 * says: *this detector has no authority to derive these tones today.* A future
 * ruling may create a different detector, a practitioner interpretation layer,
 * or a member-confirmed inference pathway. The narrow type does not prevent
 * that; it prevents it happening by accident — e.g. as a side effect of making
 * a build green.
 */
export type DetectableTone =
  | 'open'
  | 'warm'
  | 'active'
  | 'quiet'
  | 'fragile'
  | 'distant'
  | 'contracted'
  | 'tense'
  | 'unresolved'
  | 'unclear';

/**
 * Tones that reach the system only because a member SELECTED them in the
 * Relational Field entry flow. Declared, never derived. Adding one of these
 * to the detector's lexicon would convert a member's declaration into a
 * system inference.
 */
export type DeclaredTone =
  | 'tender'
  | 'strained'
  | 'conflicted'
  | 'heavy'
  | 'shut_down';

/**
 * Both are legitimate tones; they differ in epistemic source, not validity.
 * Storage, readers, and the field card handle the full union.
 */
export type RelationshipTone = DetectableTone | DeclaredTone;

/** Rupture state — broad, honest, never diagnostic. */
export type RuptureState = 'none' | 'strained' | 'ruptured' | 'unclear';

// [Relational Layer — Phase 2 + Phase 4]
/**
 * Counterpart label — a generic category, never a name. If the member has
 * an explicit relationship record, `relationshipId` is used instead.
 *
 * Phase 2 set: specific person-type labels used by the detector when it
 * can infer from pronoun/kinship language.
 *
 * Phase 4 additions: neutral "what kind of field" labels used by the
 * Relational Field entry flow so the system supports any relational
 * atmosphere, not just named people. `self` and `unnamed_field` are
 * first-class so the labtool works even when there is no other to name.
 */
/**
 * Counterpart labels the background detector has authority to INFER from a
 * member's language. Same authority boundary as DetectableTone — see its note.
 */
export type DetectableCounterpartLabel =
  | 'partner'
  | 'family'
  | 'mother'
  | 'father'
  | 'child'
  | 'sibling'
  | 'friend'
  | 'professional'
  | 'ex'
  | 'inner'
  | 'unspecified'
  // ⚠️ `person` sits here because the SHIPPED detector already infers it —
  // "Patch B" in detectRelationalSignal.ts assigns it when a named entity plus
  // interaction is present and no canonical label matched. This records
  // existing behavior; it does not authorize it. It is the weakest possible
  // reading ("someone is present"), not a claim about what the relationship
  // is — but it IS an entry-flow label being derived, and the boundary
  // deserves a ruling. See docs/governance/RELATIONAL_INFERENCE_AUTHORITY_DEBT.md
  | 'person';

/**
 * Neutral entry-flow labels that reach the system only because a member
 * SELECTED them in the Relational Field labtool. Declared, never derived —
 * `self` and `unnamed_field` especially: inferring those from language would
 * be the system naming what a relationship IS to someone.
 */
export type DeclaredCounterpartLabel =
  | 'group'
  | 'situation'
  | 'self'
  | 'unnamed_field';

export type CounterpartLabel = DetectableCounterpartLabel | DeclaredCounterpartLabel;

/** Source of the signal — was it detected or explicitly offered? */
export type SignalSource = 'maia_conversation' | 'labtool_manual';

/**
 * Dynamic tag — a named pattern the member has recognized (via Dynamics Map)
 * or that the light detector heuristically surfaced. Matches the ids in
 * RELATIONSHIP_PATTERNS in `relationshipResources.ts`.
 */
export type DynamicTag =
  | 'pursue-withdraw'
  | 'over-under-function'
  | 'projection-loop'
  | 'triangulation'
  | 'parts-polarization'
  | 'protest-withdrawal'
  | 'differentiation-crisis'
  | 'nervous-system-mismatch';

// [Relational Layer — Phase 4]
/**
 * Movement cue — "what feels most active in the field right now."
 * Surfaced only in the Relational Field entry flow. Descriptive, not
 * diagnostic. Persisted in `member_relational_signals.movement_cue` via
 * migration 20260409000012_relational_signal_movement_cue.sql.
 *
 * The six values match the DB CHECK constraint exactly and map 1:1 to
 * the six options in the labtool's movement picker.
 */
export type MovementCue =
  | 'moving_toward'
  | 'pulling_away'
  | 'trying_to_fix'
  | 'feeling_blamed'
  | 'repeating_something'
  | 'not_sure';

/**
 * A row persisted to `member_relational_signals`. Powers the field card.
 * Intentionally lightweight: never a clinical record, never a verdict.
 */
export interface RelationshipSignal {
  id?: string;
  memberId: string;
  relationshipId?: string | null;
  counterpartLabel?: CounterpartLabel | null;
  tone?: RelationshipTone | null;
  ruptureState?: RuptureState | null;
  dynamicTags?: DynamicTag[];
  frameworksApplied?: string[];
  source: SignalSource;
  confidence?: number | null;
  /**
   * Phase 4: member-selected "what feels most active" from the Relational
   * Field entry flow. Null for Phase 2 detector signals and any labtool
   * path that didn't surface a movement choice.
   */
  movementCue?: MovementCue | null;
  /**
   * Optional join key into `maia_turns.id`. Only populated for
   * `maia_conversation` signals where the route was able to capture
   * the turn id. NEVER stores conversation text itself — the founder
   * review page joins to `maia_turns` at render time.
   */
  sourceTurnId?: number | null;
  createdAt?: string;
}

/**
 * The return of `detectRelationalSignal`. When `detected` is false, consumers
 * skip persistence. Everything is nullable so the detector can partially fill.
 */
export interface DetectedSignal {
  detected: boolean;
  confidence: number;
  counterpartLabel: CounterpartLabel | null;
  tone: RelationshipTone | null;
  ruptureState: RuptureState | null;
  dynamicTags: DynamicTag[];
  frameworksApplied: string[];
  /** Phase 4: detector does not surface movement cues in v1. Always null. */
  movementCue?: MovementCue | null;
}

/** Below this confidence we do not persist — too noisy to be useful. */
export const SIGNAL_CONFIDENCE_THRESHOLD = 0.4;

/**
 * Canonical tones — full union (Phase 2 detector set + Phase 4 entry-flow
 * additions). Downstream consumers should be tolerant to all 15.
 */
export const CANONICAL_TONES: readonly RelationshipTone[] = [
  // Phase 2 detector set
  'open',
  'warm',
  'active',
  'quiet',
  'fragile',
  'distant',
  'contracted',
  'tense',
  'unresolved',
  'unclear',
  // Phase 4 entry-flow additions
  'tender',
  'strained',
  'conflicted',
  'heavy',
  'shut_down',
] as const;

/**
 * Tones surfaced in the Relational Field entry flow (Phase 4 labtool).
 * A strict subset of CANONICAL_TONES. Used by the labtool to render the
 * 10-option picker without exposing the full canonical union.
 */
export const RELATIONAL_FIELD_ENTRY_TONES: readonly RelationshipTone[] = [
  'open',
  'tense',
  'distant',
  'unclear',
  'tender',
  'strained',
  'conflicted',
  'heavy',
  'warm',
  'shut_down',
] as const;

/** Canonical rupture states. */
export const RUPTURE_STATES: readonly RuptureState[] = [
  'none',
  'strained',
  'ruptured',
  'unclear',
] as const;

/** Canonical dynamic tags (matches RELATIONSHIP_PATTERNS ids). */
export const CANONICAL_DYNAMIC_TAGS: readonly DynamicTag[] = [
  'pursue-withdraw',
  'over-under-function',
  'projection-loop',
  'triangulation',
  'parts-polarization',
  'protest-withdrawal',
  'differentiation-crisis',
  'nervous-system-mismatch',
] as const;

/**
 * Canonical counterpart labels — full union (Phase 2 detector set + Phase 4
 * entry-flow neutral labels).
 */
export const CANONICAL_COUNTERPART_LABELS: readonly CounterpartLabel[] = [
  // Phase 2 detector labels
  'partner',
  'family',
  'mother',
  'father',
  'child',
  'sibling',
  'friend',
  'professional',
  'ex',
  'inner',
  'unspecified',
  // Phase 4 entry-flow neutral labels
  'person',
  'group',
  'situation',
  'self',
  'unnamed_field',
] as const;

/**
 * Canonical movement cues (Phase 4). Matches the CHECK constraint in
 * migration 20260409000012_relational_signal_movement_cue.sql exactly.
 */
export const CANONICAL_MOVEMENT_CUES: readonly MovementCue[] = [
  'moving_toward',
  'pulling_away',
  'trying_to_fix',
  'feeling_blamed',
  'repeating_something',
  'not_sure',
] as const;
