/**
 * COUNCIL SCOPE NOTICE — a boundary declared, not merely implemented.
 *
 * Both deliberative Studio surfaces hold the same consent boundary, each by
 * construction rather than by declaration:
 *
 *   DECISION-SCOPED INPUT
 *     POST /api/studio/decisions/[id]/consult → consultDecisionCouncil()
 *     the decision record · prior iterations of that same decision ·
 *     client inquiry, field signals, practitioner observations, each
 *     bound `WHERE decision_id = $1` · optional protocol council bias
 *
 *   CHANGE-SCOPED INPUT
 *     POST /api/studio/changes/[id]/consult → consultChangeCouncil()
 *       → buildChangeQuestion() → AIN consult()
 *     the change record (title · description · type · urgency · state) ·
 *     optional I Ching context · prior iterations of that same change ·
 *     session notes · existing notes · client inquiry, field signals,
 *     practitioner observations, each bound `WHERE change_id = $1` ·
 *     optional protocol council bias · static AIN framing material
 *
 * Neither path — nor the shared `lib/ain/consultation.ts` layer beneath both —
 * imports conversational memory, memory atoms, semantic memory, or any ambient
 * MAIA session loader. The councils cannot reach them.
 *
 * That isolation was correct but invisible: a member had to ask whether a
 * deliberative surface was quietly reading their private MAIA history. The law
 * this file exists to serve:
 *
 *   Isolation by implementation must be declared at the invocation boundary.
 *   A member should know what an intelligence is allowed to know before they
 *   invoke it.
 *
 * Single source so the semantic rule stays centralized and cannot drift between
 * surfaces — subject-aware so the central source is never semantically tied to
 * one Studio object, and never states of a Change something true only of a
 * Decision. If either council's inputs ever change, this sentence must change
 * with them: a stale notice here is a false statement made to a member.
 *
 * "Material explicitly attached to it" rather than "what you add to it": a
 * client inquiry response can be Council input on a Change or Decision without
 * the practitioner having authored it. The wider phrase is the exact one.
 *
 * This declares present scope. It does not describe, promise, or foreclose any
 * future member-authored gesture for bringing context into a decision or change;
 * that remains a separate design problem.
 */

export type CouncilScopeSubject = 'decision' | 'change';

export function councilScopeNotice(subject: CouncilScopeSubject): string {
  return `The Council reads only this ${subject} and material explicitly attached to it. It does not access your MAIA conversations.`;
}
