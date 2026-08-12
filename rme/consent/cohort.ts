/**
 * RME-001 — Consent, selection, and member feedback surfaces
 *
 * THREE SEPARATE AUTHORITIES. This module keeps them apart in code:
 *
 *   1. BUILD              — authorized now. Reads no member content.
 *   2. CONTENT INSPECTION — bounded: explicitly opted-in members only, by the
 *                           designated evaluation process and the founder/evaluator.
 *                           Not general repo agents. Not unrelated JARVIS units.
 *   3. MEMBER CONTACT     — separate, NOT YET ENABLED.
 *
 * Nothing here executes against real member data. Selection judgments must never
 * become durable member traits.
 */

import type { CohortRef, EncounterSituation, MemberFeedbackPrompt } from '../schema/encounter';

// ---------------------------------------------------------------------------
// 1. Consent
// ---------------------------------------------------------------------------

/** The unit of consent, stated so a member can actually understand what they agreed to. */
export const CONSENT_STATEMENT =
  'Your selected MAIA conversations may be reviewed to study whether continuity helps MAIA ' +
  'meet you better, including comparison with a fresh, history-free MAIA response that you ' +
  'did not originally receive.';

export const SOUL_LAB_COVENANT =
  'You are participating in an experimental form of relational AI. MAIA may remember, make ' +
  'connections across conversations, explore psychological, symbolic and spiritual material, ' +
  'and experiment with new ways of attending. She may sometimes misunderstand you. Your ' +
  'corrections are part of how the system learns to relate more wisely.\n\n' +
  'You remain the authority on your own experience.';
// NOTE (SL-001 obs. 2): the final line needs founder ruling before it ships. Read plainly it can
// mean "MAIA defers to what I say about myself", which is NOT what CANON-002 says. CANON-002
// governs the standing of representations, not the outcome of encounters — MAIA may disagree,
// challenge, and refuse. Recommended pairing, pending ruling:
//   "MAIA may see things differently and say so; she may not decide she knows you better than you do."

export interface ConsentRecord {
  readonly cohortRef: CohortRef;
  readonly consentedToInspection: boolean;
  readonly consentedToContact: boolean;
  readonly statementVersion: string;
  readonly recordedAt: string;
}

// ---------------------------------------------------------------------------
// 2. Selection — two routes, neither requiring a general read of member conversations
// ---------------------------------------------------------------------------

export type SelectionRoute = 'member_nomination' | 'bounded_metadata_preselection';

/** Member nomination prompts. Asked of the member; require no prior content inspection. */
export const NOMINATION_PROMPTS = [
  'Was there a conversation where MAIA really remembered you?',
  'Was there a conversation where MAIA misunderstood you?',
  'Was there a conversation where MAIA made a connection?',
  'Was there a conversation where you had to repeat yourself?',
] as const;

export class InspectionNotAuthorized extends Error {
  constructor(reason: string) {
    super(`RME-001: content inspection refused — ${reason}`);
    this.name = 'InspectionNotAuthorized';
  }
}

export type InspectorRole = 'designated_evaluation_process' | 'founder_evaluator';

/**
 * The only gate through which encounter content may be read. Refuses unless the
 * member opted in AND the caller is one of the two authorized roles.
 */
export function authorizeInspection(args: {
  consent: ConsentRecord | null;
  role: InspectorRole | string;
}): void {
  if (!args.consent?.consentedToInspection) {
    throw new InspectionNotAuthorized('member has not explicitly opted in');
  }
  if (args.role !== 'designated_evaluation_process' && args.role !== 'founder_evaluator') {
    throw new InspectionNotAuthorized(
      `role "${args.role}" is not authorized. General repo agents and unrelated ` +
        'JARVIS units may not read member content.',
    );
  }
}

/**
 * A selection judgment. Encounter-scoped and explicitly non-durable: it classifies
 * ONE encounter into one of the six situations and carries no member-level meaning.
 */
export interface SelectionJudgment {
  readonly encounterId: string;
  readonly route: SelectionRoute;
  readonly situation: EncounterSituation;
  /** Always true. Present so the constraint is visible at every call site. */
  readonly durableMemberTrait: false;
}

// ---------------------------------------------------------------------------
// 3. Member contact — built, not enabled
// ---------------------------------------------------------------------------

export const CONTACT_ENABLED = false;

/**
 * Extremely light. Ten members must not become QA staff.
 * Lived experience, not memory mechanics.
 */
export const FEEDBACK_ITEMS: readonly { prompt: MemberFeedbackPrompt; text: string }[] = [
  { prompt: 'remembered_something_that_helped', text: 'MAIA remembered something that helped.' },
  { prompt: 'had_to_repeat_something', text: 'I had to repeat something she should have understood.' },
  { prompt: 'something_remembered_got_in_the_way', text: 'Something MAIA remembered got in the way.' },
  { prompt: 'made_a_connection_that_mattered', text: 'MAIA made a connection that mattered.' },
  { prompt: 'felt_met_as_i_am_now', text: 'I felt met as I am now.' },
  { prompt: 'open_what_happened', text: 'Optional: tell us what happened.' },
];
// Deliberately NOT asked: "Did MAIA remember you?" — it biases toward visible recall.

export class ContactNotEnabled extends Error {
  constructor() {
    super(
      'RME-001: member contact is a separate authority and is not yet enabled. ' +
        'Inspection authorization does not authorize contact.',
    );
    this.name = 'ContactNotEnabled';
  }
}

export function sendFeedbackSurface(_cohortRef: CohortRef): never {
  throw new ContactNotEnabled();
}
