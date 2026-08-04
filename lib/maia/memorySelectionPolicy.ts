/**
 * Memory Selection Policy — Stage 1 declaration (Sprint 1 · Truth Layer).
 *
 * Authority:
 *   docs/governance/MEMORY_SELECTION_PHILOSOPHY_RULING_INSTRUMENT_2026-08-04.md
 *     — staged trajectory formally ruled 2026-08-04. Stage 1: declare the
 *     current policy as known-policy. "Making the boundary visible is the
 *     first act of integrity."
 *   docs/ops/MAIA_OPERATIONAL_MEMORY_STAGED_REBUILD_CHARTER_2026-08-04.md §IV
 *   Evidence: docs/ops/MAIA_MEMORY_SELECTION_REALITY_REPORT_2026-08-04.md
 *
 * This module changes NO behavior. It makes explicit the selection policy that
 * already governs production, so the policy is versioned, quotable, and owned —
 * ending the accidental implication that "memory" currently means more than it
 * does. Changing the policy is a governed act (a new version under founder
 * ruling), never a tuning knob.
 */

/**
 * Version tag carried by every MemoryTransitionRecord. Bump ONLY under a
 * governance ruling that changes selection behavior — never silently.
 */
export const MEMORY_SELECTION_POLICY_VERSION =
  'consent-bounded.breakthrough-first.recency-sovereign.take-8.v1';

/**
 * The operational-continuity declaration (founder-authored, 2026-08-04).
 * This names what cross-session continuity currently IS, in truthful terms.
 */
export const OPERATIONAL_CONTINUITY_DECLARATION =
  'Current operational continuity is provided through recent conversational context only: ' +
  'the most recent prior exchanges within the configured context window. This provides ' +
  'short-horizon continuity but does not constitute durable relational memory.';

/**
 * The atom selection policy, stated as decisions (never as rankings of humans
 * or memories). These sentences are the standing selection_reasons recorded by
 * the MemoryTransitionRecord for the atoms source.
 */
export const ATOM_SELECTION_POLICY_REASONS: readonly string[] = [
  'Consent boundary applied in retrieval: only atoms the member has consented to surface ' +
    '(return_preference), never sacred_protected registers, never member-rejected atoms.',
  'Ordering is breakthrough-first then most-recently-kept; relevance to the current ' +
    'conversation does not participate in selection under this policy version.',
  'Cap applied: the first 8 atoms in policy order enter; remaining eligible atoms are ' +
    'not offered this turn.',
];

/**
 * The conversational-continuity policy, stated as decisions.
 */
export const CONVERSATIONAL_WINDOW_POLICY_REASONS: readonly string[] = [
  'Recency window: the most recent prior exchanges across sessions (up to 6 turns, ' +
    'truncated content), selected by time only; no relevance participates.',
  OPERATIONAL_CONTINUITY_DECLARATION,
];
