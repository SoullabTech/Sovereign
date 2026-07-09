/**
 * Developmental-state admission boundary — the chokepoint for Refusal R16.
 *
 * The class-level rule (task_06badd89):
 *   "No response-shaping subsystem may consume persisted inferred developmental
 *    state unless the source is explicitly member-marked, or produced within the
 *    active encounter under an authorized interpretation boundary."
 *
 * Persisted, SYSTEM-INFERRED developmental state — e.g. `member_spiral_state`'s
 * `relational_phase` / `autonomy_streak`, inferred from conductor hysteresis and
 * never member-marked — must not shape how MAIA treats the person (stance, hold,
 * brevity, return-power, greeting, depth). That is interpretation of the person,
 * not member-marked recognition (Developmental-Ecology principle 5).
 *
 * This boundary strips that field CLASS from any state handed to response-shaping
 * unless an explicit authorization is presented. It guards the RULE, so it still
 * fires for FUTURE fields — add them to INFERRED_DEVELOPMENTAL_FIELDS as they appear.
 *
 * Behavioral FACTS (e.g. `return_count` — the number of times a member returned)
 * are NOT in the class: they are observations, not inferences about who the person
 * is, and pass through.
 *
 * See docs/architecture/COMPRESSION_AUDIT_DEVELOPMENTAL_ECOLOGY_2026-07-08.md §"task_06badd89".
 */

/**
 * The field CLASS: persisted, system-inferred reads of the person's developmental
 * level / competence / state. Extend this as new inferred-developmental fields
 * appear — the guard follows the rule, not a fixed list of today's two fields.
 */
export const INFERRED_DEVELOPMENTAL_FIELDS = [
  'relational_phase',
  'autonomy_streak',
  // Future inferred-developmental fields the same rule must refuse:
  'development_level',
  'integration_score',
  'awakening_phase',
  'attachment_style_estimate',
] as const;

export type InferredDevelopmentalField = (typeof INFERRED_DEVELOPMENTAL_FIELDS)[number];

/**
 * Why a developmental read is admissible for response-shaping.
 * - `member-marked`: the member explicitly marked / authored it (recognition, not inference).
 * - `in-encounter`:  produced within the active encounter under a *named* authorized
 *                    interpretation boundary (current observation, not persisted inference).
 * - `none`:          the default for persisted inferred state → the class is STRIPPED.
 */
export type ShapingAuthorization =
  | { kind: 'member-marked' }
  | { kind: 'in-encounter'; boundary: string }
  | { kind: 'none' };

/**
 * Admit persisted state into a response-shaping subsystem. Under the default
 * (`kind: 'none'`) every INFERRED_DEVELOPMENTAL_FIELD is removed, so a shaping
 * subsystem structurally cannot consume it; non-class fields (behavioral facts)
 * pass through. Retrieval-only and non-fatal: returns a shallow copy, never mutates.
 */
export function admitPersistedStateForShaping<T extends Record<string, unknown>>(
  persisted: T | null | undefined,
  auth: ShapingAuthorization = { kind: 'none' },
): Partial<T> {
  if (!persisted) return {};
  if (auth.kind !== 'none') return { ...persisted }; // authorized: member-marked or in-encounter
  const out: Record<string, unknown> = { ...persisted };
  for (const field of INFERRED_DEVELOPMENTAL_FIELDS) {
    delete out[field];
  }
  return out as Partial<T>;
}
