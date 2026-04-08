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
