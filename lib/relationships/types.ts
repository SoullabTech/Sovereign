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

/** Matches the 10 canonical tones used across check-ins and labtools. */
export type RelationshipTone =
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

/** Rupture state — broad, honest, never diagnostic. */
export type RuptureState = 'none' | 'strained' | 'ruptured' | 'unclear';

/**
 * Counterpart label — a generic category, never a name. If the member has
 * an explicit relationship record, `relationshipId` is used instead.
 */
export type CounterpartLabel =
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
  | 'unspecified';

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
}

/** Below this confidence we do not persist — too noisy to be useful. */
export const SIGNAL_CONFIDENCE_THRESHOLD = 0.4;

/** Canonical tones (matches CheckInFlow + relational-field labtool). */
export const CANONICAL_TONES: readonly RelationshipTone[] = [
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

/** Canonical counterpart labels. */
export const CANONICAL_COUNTERPART_LABELS: readonly CounterpartLabel[] = [
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
] as const;
