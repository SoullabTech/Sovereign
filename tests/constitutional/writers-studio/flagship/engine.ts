/**
 * THE ENGINE SEAM.
 *
 * ⭐ Each defeat candidate replaces ONE DECISION on an identical substrate. That
 * is deliberate and it narrows the claim: lethality proved this way is
 * DECISION-LEVEL, ⛔ not implementation-independent. Eight standalone
 * implementations would yield unclassified collateral and WEAKER evidence.
 */

import {
  availableEvents, gesturesToWriting, initialState, transition, TRANSITIONS,
  type AlternativeSet, type EventType, type Outcome, type PhaseName, type Place,
  type Reasoning, type StudioEvent, type StudioState,
} from '../../../../lib/writersStudio/studio/machine';
import type { CapabilityId } from '../../../../lib/writersStudio/studio/capability';

export interface Engine {
  readonly name: string;
  readonly transitions: Readonly<Record<PhaseName, readonly EventType[]>>;
  initialState(place: Place, coverage?: number): StudioState;
  transition(state: StudioState, event: StudioEvent): Outcome;
  availableEvents(state: StudioState): readonly EventType[];
  gesturesToWriting(phase: PhaseName): number;
  capabilityOf(event: EventType): CapabilityId;
  /** What the room would offer as alternatives. A candidate may make it ranked. */
  makeAlternatives(): AlternativeSet;
  /** What the room would offer as reasoning at a coverage level. */
  makeReasoning(coverage: number): Reasoning;
}

/** ⭐ Mirrors the machine's private table. The suite asserts they agree, so a
 *  drift between the seam and the machine is itself a failure, ⛔ not a silent
 *  divergence that lets a candidate be judged against the wrong graph. */
export const CAPABILITY_OF: Readonly<Record<EventType, CapabilityId>> = {
  HOLD_PASSAGE: 'passage.hold',
  RELEASE: 'manuscript.read',
  TALK: 'observation.read',
  ASK_WHY: 'observation.reasoning',
  DISAGREE: 'observation.challenge',
  ASK_TEACHING: 'observation.teaching',
  BACK_TO_CONVERSATION: 'observation.read',
  REQUEST_ALTERNATIVES: 'alternatives.offer',
  SELECT_ALTERNATIVE: 'alternatives.offer',
  READ_IN_CONTEXT: 'alternatives.read-in-context',
  BACK_TO_ALTERNATIVES: 'alternatives.offer',
  APPLY: 'revision.apply',
  UNDO: 'revision.undo',
  RETURN_TO_WRITING: 'manuscript.read',
  OPEN_OVERLAY: 'manuscript.read',
  CLOSE_OVERLAY: 'manuscript.read',
  NAVIGATE_TO: 'manuscript.read',
  ARRIVE_AT_PASSAGE: 'observation.read',
  BACK_ALONG_TRAIL: 'manuscript.read',
};

/** The four directions from the D0 prototype. ⛔ No default. ⛔ No winner. */
export function referenceAlternatives(): AlternativeSet {
  return {
    items: [
      { id: 'embodied', name: 'More embodied',
        text: 'The atoms that form our bodies were forged in the hearts of dying stars.',
        rationale: 'Moves from a passive construction to a located one.' },
      { id: 'quieter', name: 'Quieter ending',
        text: 'The atoms that form our bodies were forged in stars.',
        rationale: 'Removes one word; the cadence lands earlier.' },
      { id: 'cadence', name: 'Closer to your original cadence',
        text: 'The atoms that form our bodies were themselves forged within stars.',
        rationale: 'Keeps your preposition and adds the reflexive you use elsewhere.' },
      { id: 'mine', name: 'Keep mine', text: null,
        rationale: 'Your sentence stands. Nothing is applied and the conversation stays open.' },
    ],
  };
}

export function referenceReasoning(_coverage: number): Reasoning {
  /* ⭐ Coverage is accepted and DELIBERATELY UNUSED for the permanent limits.
     The two permanent non-conclusions are unconditional; only the three
     dischargeable ones could ever depend on coverage. */
  return {
    text: 'The sentence carries a fact the paragraph has already implied twice.',
    limits: ['author-intent', 'reader-effect', 'outside-coverage'],
  };
}

export const REFERENCE: Engine = {
  name: 'REFERENCE',
  transitions: TRANSITIONS,
  initialState,
  transition,
  availableEvents,
  gesturesToWriting,
  capabilityOf: (e) => CAPABILITY_OF[e],
  makeAlternatives: referenceAlternatives,
  makeReasoning: referenceReasoning,
};
