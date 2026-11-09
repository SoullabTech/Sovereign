/**
 * ⭐ STANDING FOUNDER RULE FOR DEVELOP (stated repeatedly; recorded 2026-11-09: "this is not a new design request but one I have to
 * continually ask for"): EVERY capability on the Develop stage must be reachable by asking MAIA, as an offer the writer clicks
 * (a Design 1B studio action), or IS itself a way of talking to her. A capability that is not is a DEFECT against the rule, not
 * optional scope.
 *
 * This registry is the acceptance check. `developAskable.test.ts` fails when a control appears on the stage or in its conversation that
 * is not listed here, or when a listed offer is not a real Work-conversation action. Defects are listed openly, never hidden.
 */
import type { StudioActionId } from './studioActions';

export type Reach =
  | { kind: 'offer'; action: StudioActionId }          // MAIA may offer it; the writer's click performs it
  | { kind: 'conversation' }                           // the control is itself a way of asking her
  | { kind: 'defect'; note: string };                  // not reachable through her yet: a defect against the rule

export type DevelopCapability = {
  readonly key: string;
  readonly what: string;
  /** the data-attributes of the stage/conversation controls that perform it (the test checks every control is listed somewhere) */
  readonly controls: readonly string[];
  readonly reach: Reach;
};

export const DEVELOP_CAPABILITIES: readonly DevelopCapability[] = [
  { key: 'ask-about-selection', what: 'talk about words selected in the chapter', controls: ['data-develop-ask-about'], reach: { kind: 'conversation' } },
  { key: 'ways-in', what: 'starter questions', controls: ['data-develop-starters'], reach: { kind: 'conversation' } },
  { key: 'reorient', what: 'Where are we?', controls: ['data-reorient-work', 'data-reorientation-confirm'], reach: { kind: 'conversation' } },
  { key: 'presentation', what: 'change how the Studio looks, by asking in words', controls: ['data-maia-presentation-confirm'], reach: { kind: 'conversation' } },
  { key: 'resume-conversation', what: 'continue an earlier conversation', controls: ['data-discovery'], reach: { kind: 'conversation' } },
  { key: 'send', what: 'ask MAIA', controls: ['data-maia-composer'], reach: { kind: 'conversation' } },
  { key: 'correct-maia', what: 'correct MAIA’s understanding', controls: ['data-maia-correction'], reach: { kind: 'conversation' } },
  { key: 'read-chapter', what: 'MAIA reads the chapter', controls: [], reach: { kind: 'offer', action: 'read-chapter' } },
  { key: 'grant-reading', what: 'let MAIA read saved chapter / work', controls: ['data-develop-holdings'], reach: { kind: 'offer', action: 'grant-reading' } },
  { key: 'make-plan', what: 'make a plan', controls: ['data-develop-plan-start'], reach: { kind: 'offer', action: 'make-plan' } },
  { key: 'note-settled', what: 'note a settled decision', controls: ['data-note-settled', 'data-note-settled-confirm'], reach: { kind: 'offer', action: 'note-settled' } },
  { key: 'open-in-write', what: 'work on the passage in Write (Edit in Write, passage desk)', controls: ['data-develop-edit-in-write'], reach: { kind: 'offer', action: 'open-desk' } },
  { key: 'editorial-pass', what: 'more ways to explore / editorial pass', controls: [], reach: { kind: 'offer', action: 'editorial-pass' } },
  { key: 'new-conversation', what: 'start a new conversation', controls: ['data-start-fresh-work-conversation'], reach: { kind: 'offer', action: 'new-conversation' } },
  { key: 'revoke-reading', what: 'stop MAIA reading saved work', controls: ['data-develop-holdings'], reach: { kind: 'defect', note: 'no offer to revoke; only under More' } },
  { key: 'edit-plan', what: 'change, resolve, set aside or remove a plan step', controls: ['data-develop-plan-step'], reach: { kind: 'defect', note: 'only under More' } },
  { key: 'work-on-step', what: 'open a plan step at the passage desk', controls: ['data-develop-plan-work'], reach: { kind: 'defect', note: 'open-desk covers a discussed passage, not a plan step' } },
  { key: 'delete-plan', what: 'delete the plan', controls: ['data-develop-plan-delete'], reach: { kind: 'defect', note: 'only under More' } },
  { key: 'withdraw-settled', what: 'withdraw a settled decision', controls: ['data-develop-holdings'], reach: { kind: 'defect', note: 'only under More' } },
  { key: 'book-kind', what: 'say what kind of book this is', controls: ['data-develop-kind'], reach: { kind: 'defect', note: 'only under More' } },
  { key: 'change-chapter', what: 'move to another chapter', controls: ['data-develop-chapter-select', 'data-develop-ribbon'], reach: { kind: 'defect', note: 'Design 1B left out "go to section" (headings are not unique); needs section ids MAIA is given' } },
  { key: 'recurring-words', what: 'show words that recur across chapters', controls: ['data-develop-threads'], reach: { kind: 'defect', note: 'only under More' } },
  { key: 'what-she-read', what: 'see the chapters she read, in place', controls: ['data-develop-excerpt'], reach: { kind: 'defect', note: 'the line beside the conversation says which; reading them in place is only under More' } },
  { key: 'keeps', what: 'offer a kept passage into the conversation', controls: ['data-keeps-toggle', 'data-keeps-chooser'], reach: { kind: 'defect', note: 'only behind the conversation’s More' } },
  { key: 'open-in-maia', what: 'continue in MAIA', controls: ['data-open-in-maia'], reach: { kind: 'defect', note: 'only behind the conversation’s More' } },
  { key: 'focus', what: 'focus the conversation', controls: ['data-maia-focus-toggle'], reach: { kind: 'defect', note: 'layout control; whether it counts as a capability is the founder’s call' } },
  { key: 'close-conversation', what: 'close the conversation', controls: ['data-close-conversation'], reach: { kind: 'defect', note: 'layout control; whether it counts as a capability is the founder’s call' } },
  { key: 'more', what: 'the one quiet More on the stage and in the conversation', controls: ['data-develop-more', 'data-conversation-more'], reach: { kind: 'defect', note: 'the doorway to everything above that is still a defect' } },
];

export const DEVELOP_ASKABLE_DEFECTS = DEVELOP_CAPABILITIES.filter((c) => c.reach.kind === 'defect');
