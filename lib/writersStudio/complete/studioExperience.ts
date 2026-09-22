/**
 * JARVIS-WRITERS-STUDIO-COMPLETE-01 / B1
 *
 * Pure flagship interaction machine.
 *
 * This is intentionally small. It does not decide cognition, authorship,
 * ranking, coverage, or persistence. It names the member-visible relationship
 * between manuscript, conversation, proposal review, application, and review.
 *
 * A UI may render these states many ways. It may not invent transitions that
 * bypass the guards here.
 */

export type StudioView =
  | 'manuscript'
  | 'conversation'
  | 'alternatives'
  | 'context'
  | 'applied'
  | 'review';

export interface StudioPlace {
  manuscriptId: string;
  sectionId: string | null;
  /** Exact code-point range when the member has held a passage. */
  range: { start: number; end: number } | null;
}

export interface ProposalRef {
  versionId: string;
  /** Place identity the proposal belongs to. */
  sectionId: string;
}

export interface ReviewRef {
  readingId: string;
  observationKey: string;
}

export interface StudioExperienceState {
  view: StudioView;
  place: StudioPlace;
  /** Durable relationship identity when one exists. */
  threadId: string | null;
  /** Unsaved writer words must survive view changes. */
  conversationDraft: string;
  proposal: ProposalRef | null;
  /** Exact proposal the writer has actually read in manuscript context. */
  reviewedVersionId: string | null;
  /** Exact authorization returned by a successful application. */
  applicationAuthorizationId: string | null;
  review: ReviewRef | null;
}

export type StudioExperienceEvent =
  | { type: 'OPEN_MANUSCRIPT'; place: StudioPlace }
  | { type: 'HOLD_PASSAGE'; place: StudioPlace; threadId?: string | null }
  | { type: 'OPEN_CONVERSATION'; threadId?: string | null }
  | { type: 'SET_CONVERSATION_DRAFT'; text: string }
  | { type: 'OFFER_PROPOSAL'; proposal: ProposalRef }
  | { type: 'SHOW_ALTERNATIVES' }
  | { type: 'SELECT_ALTERNATIVE'; proposal: ProposalRef }
  | { type: 'READ_IN_CONTEXT' }
  | { type: 'APPLY'; authorizationId: string }
  | { type: 'UNDO' }
  | { type: 'OPEN_REVIEW'; review?: ReviewRef | null }
  | { type: 'OPEN_FINDING'; place: StudioPlace; review: ReviewRef; threadId?: string | null }
  | { type: 'RETURN_TO_MANUSCRIPT' }
  | { type: 'CHANGE_PLACE'; place: StudioPlace };

export type TransitionRefusal =
  | 'passage_required'
  | 'proposal_required'
  | 'proposal_wrong_place'
  | 'context_review_required'
  | 'application_required';

export interface TransitionResult {
  accepted: boolean;
  state: StudioExperienceState;
  refusal?: TransitionRefusal;
}
export function initialStudioExperience(place: StudioPlace): StudioExperienceState {
  return {
    view: 'manuscript',
    place,
    threadId: null,
    conversationDraft: '',
    proposal: null,
    reviewedVersionId: null,
    applicationAuthorizationId: null,
    review: null,
  };
}

function samePlace(a: StudioPlace, b: StudioPlace): boolean {
  return a.manuscriptId === b.manuscriptId
    && a.sectionId === b.sectionId
    && a.range?.start === b.range?.start
    && a.range?.end === b.range?.end;
}

function passageHeld(place: StudioPlace): boolean {
  return Boolean(
    place.sectionId
    && place.range
    && place.range.end > place.range.start,
  );
}

function reject(
  state: StudioExperienceState,
  refusal: TransitionRefusal,
): TransitionResult {
  return { accepted: false, state, refusal };
}

function accept(state: StudioExperienceState): TransitionResult {
  return { accepted: true, state };
}

/**
 * Changing authored place must invalidate proposal-review authority.
 *
 * Conversation draft is intentionally preserved. Losing the writer's unsent
 * words merely because the UI moved is the conversation-fragmentation defect.
 */
function movePlace(
  state: StudioExperienceState,
  place: StudioPlace,
): StudioExperienceState {
  if (samePlace(state.place, place)) return { ...state, place };
  return {
    ...state,
    place,
    view: 'manuscript',
    proposal: null,
    reviewedVersionId: null,
    applicationAuthorizationId: null,
    review: null,
  };
}
export function transitionStudioExperience(
  state: StudioExperienceState,
  event: StudioExperienceEvent,
): TransitionResult {
  switch (event.type) {
    case 'OPEN_MANUSCRIPT':
      return accept(initialStudioExperience(event.place));

    case 'CHANGE_PLACE':
      return accept(movePlace(state, event.place));

    case 'HOLD_PASSAGE':
      if (!passageHeld(event.place)) return reject(state, 'passage_required');
      return accept({
        ...movePlace(state, event.place),
        view: 'conversation',
        threadId: event.threadId ?? state.threadId,
      });

    case 'OPEN_CONVERSATION':
      if (!passageHeld(state.place)) return reject(state, 'passage_required');
      return accept({
        ...state,
        view: 'conversation',
        threadId: event.threadId ?? state.threadId,
      });

    case 'SET_CONVERSATION_DRAFT':
      return accept({ ...state, conversationDraft: event.text });

    case 'OFFER_PROPOSAL':
      if (!state.place.sectionId) return reject(state, 'passage_required');
      if (event.proposal.sectionId !== state.place.sectionId) {
        return reject(state, 'proposal_wrong_place');
      }
      return accept({
        ...state,
        view: 'alternatives',
        proposal: event.proposal,
        reviewedVersionId: null,
        applicationAuthorizationId: null,
      });

    case 'SHOW_ALTERNATIVES':
      if (!state.proposal) return reject(state, 'proposal_required');
      return accept({ ...state, view: 'alternatives' });

    case 'SELECT_ALTERNATIVE':
      if (!state.place.sectionId) return reject(state, 'passage_required');
      if (event.proposal.sectionId !== state.place.sectionId) {
        return reject(state, 'proposal_wrong_place');
      }
      return accept({
        ...state,
        view: 'alternatives',
        proposal: event.proposal,
        reviewedVersionId: null,
        applicationAuthorizationId: null,
      });

    case 'READ_IN_CONTEXT':
      if (!state.proposal) return reject(state, 'proposal_required');
      if (state.proposal.sectionId !== state.place.sectionId) {
        return reject(state, 'proposal_wrong_place');
      }
      return accept({
        ...state,
        view: 'context',
        reviewedVersionId: state.proposal.versionId,
      });
    case 'APPLY':
      if (!state.proposal) return reject(state, 'proposal_required');
      if (state.proposal.sectionId !== state.place.sectionId) {
        return reject(state, 'proposal_wrong_place');
      }
      if (state.reviewedVersionId !== state.proposal.versionId) {
        return reject(state, 'context_review_required');
      }
      return accept({
        ...state,
        view: 'applied',
        applicationAuthorizationId: event.authorizationId,
      });

    case 'UNDO':
      if (!state.applicationAuthorizationId) {
        return reject(state, 'application_required');
      }
      return accept({
        ...state,
        view: 'conversation',
        applicationAuthorizationId: null,
        reviewedVersionId: null,
      });

    case 'OPEN_REVIEW':
      return accept({
        ...state,
        view: 'review',
        review: event.review ?? state.review,
      });

    case 'OPEN_FINDING':
      if (!passageHeld(event.place)) return reject(state, 'passage_required');
      return accept({
        ...movePlace(state, event.place),
        view: 'conversation',
        review: event.review,
        threadId: event.threadId ?? state.threadId,
      });

    case 'RETURN_TO_MANUSCRIPT':
      return accept({
        ...state,
        view: 'manuscript',
      });
  }
}
