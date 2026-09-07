/**
 * COUNCIL SCOPE NOTICE — a boundary declared, not merely implemented.
 *
 * The decision council's inputs are decision-scoped by construction:
 * `consultDecisionCouncil()` receives the decision record, the prior
 * iterations of that same decision, and an evidence bundle whose every
 * query is bound `WHERE decision_id = $1` (client inquiry, field signals,
 * practitioner observations). Neither `decisionCouncil.ts` nor
 * `lib/ain/consultation.ts` imports conversational memory, memory atoms,
 * semantic memory, or session history — the council cannot reach them.
 *
 * That isolation was correct but invisible: a member had to ask whether a
 * deliberative surface was quietly reading their private MAIA history.
 * This constant states the boundary at the point where the member decides.
 *
 * Single source so the declaration cannot drift between surfaces. If the
 * council's inputs ever change, this string must change with them — a
 * stale notice here is a false statement made to a member.
 *
 * This declares present scope. It does not describe, promise, or foreclose
 * any future member-authored gesture for bringing context into a decision;
 * that is a separate design problem and stays separate.
 */
export const COUNCIL_SCOPE_NOTICE =
  'The Council reads only this decision and what you add to it. It does not access your MAIA conversations.';
