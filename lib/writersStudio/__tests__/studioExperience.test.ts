import {
  initialStudioExperience,
  transitionStudioExperience,
  type StudioExperienceState,
  type StudioPlace,
} from '../complete/studioExperience';

const passage = (sectionId = 's1'): StudioPlace => ({
  manuscriptId: 'm1',
  sectionId,
  range: { start: 10, end: 24 },
});

const sectionOnly = (sectionId = 's1'): StudioPlace => ({
  manuscriptId: 'm1',
  sectionId,
  range: null,
});

function step(
  state: StudioExperienceState,
  event: Parameters<typeof transitionStudioExperience>[1],
): StudioExperienceState {
  const out = transitionStudioExperience(state, event);
  expect(out.accepted).toBe(true);
  return out.state;
}

describe('JARVIS-WRITERS-STUDIO-COMPLETE-01 · flagship experience machine', () => {
  it('keeps the manuscript as the resting state', () => {
    const state = initialStudioExperience(sectionOnly());
    expect(state.view).toBe('manuscript');
    expect(state.place.sectionId).toBe('s1');
  });

  it('requires an exact passage before passage conversation opens', () => {
    const state = initialStudioExperience(sectionOnly());
    const out = transitionStudioExperience(state, { type: 'OPEN_CONVERSATION' });
    expect(out).toMatchObject({ accepted: false, refusal: 'passage_required' });
    expect(out.state).toBe(state);
  });

  it('preserves unsent writer words across conversation → alternatives → context', () => {
    let state = initialStudioExperience(passage());
    state = step(state, { type: 'OPEN_CONVERSATION', threadId: 't1' });
    state = step(state, { type: 'SET_CONVERSATION_DRAFT', text: 'Keep the warmth.' });
    state = step(state, {
      type: 'OFFER_PROPOSAL',
      proposal: { versionId: 'v1', sectionId: 's1' },
    });
    state = step(state, { type: 'READ_IN_CONTEXT' });

    expect(state.view).toBe('context');
    expect(state.threadId).toBe('t1');
    expect(state.conversationDraft).toBe('Keep the warmth.');
    expect(state.reviewedVersionId).toBe('v1');
  });
  it('refuses apply until the exact candidate was read in context', () => {
    let state = initialStudioExperience(passage());
    state = step(state, { type: 'OPEN_CONVERSATION', threadId: 't1' });
    state = step(state, {
      type: 'OFFER_PROPOSAL',
      proposal: { versionId: 'v1', sectionId: 's1' },
    });

    const red = transitionStudioExperience(state, {
      type: 'APPLY',
      authorizationId: 'a1',
    });
    expect(red).toMatchObject({
      accepted: false,
      refusal: 'context_review_required',
    });

    state = step(state, { type: 'READ_IN_CONTEXT' });
    state = step(state, { type: 'APPLY', authorizationId: 'a1' });
    expect(state.view).toBe('applied');
    expect(state.applicationAuthorizationId).toBe('a1');
  });

  it('changing alternatives invalidates an earlier context review', () => {
    let state = initialStudioExperience(passage());
    state = step(state, { type: 'OPEN_CONVERSATION' });
    state = step(state, {
      type: 'OFFER_PROPOSAL',
      proposal: { versionId: 'v1', sectionId: 's1' },
    });
    state = step(state, { type: 'READ_IN_CONTEXT' });
    state = step(state, {
      type: 'SELECT_ALTERNATIVE',
      proposal: { versionId: 'v2', sectionId: 's1' },
    });

    expect(state.reviewedVersionId).toBeNull();
    const out = transitionStudioExperience(state, {
      type: 'APPLY',
      authorizationId: 'a2',
    });
    expect(out.refusal).toBe('context_review_required');
  });

  it('refuses a proposal from another authored place', () => {
    const state = initialStudioExperience(passage('s1'));
    const out = transitionStudioExperience(state, {
      type: 'OFFER_PROPOSAL',
      proposal: { versionId: 'v9', sectionId: 's2' },
    });
    expect(out).toMatchObject({
      accepted: false,
      refusal: 'proposal_wrong_place',
    });
  });
  it('moving place clears proposal authority but preserves the writer draft', () => {
    let state = initialStudioExperience(passage('s1'));
    state = step(state, { type: 'OPEN_CONVERSATION', threadId: 't1' });
    state = step(state, { type: 'SET_CONVERSATION_DRAFT', text: 'My unsent thought' });
    state = step(state, {
      type: 'OFFER_PROPOSAL',
      proposal: { versionId: 'v1', sectionId: 's1' },
    });
    state = step(state, { type: 'READ_IN_CONTEXT' });
    state = step(state, { type: 'CHANGE_PLACE', place: passage('s2') });

    expect(state.view).toBe('manuscript');
    expect(state.place.sectionId).toBe('s2');
    expect(state.proposal).toBeNull();
    expect(state.reviewedVersionId).toBeNull();
    expect(state.conversationDraft).toBe('My unsent thought');
  });

  it('undo returns to the same conversation seam and exact place', () => {
    const original = passage('s1');
    let state = initialStudioExperience(original);
    state = step(state, { type: 'OPEN_CONVERSATION', threadId: 't1' });
    state = step(state, {
      type: 'OFFER_PROPOSAL',
      proposal: { versionId: 'v1', sectionId: 's1' },
    });
    state = step(state, { type: 'READ_IN_CONTEXT' });
    state = step(state, { type: 'APPLY', authorizationId: 'a1' });
    state = step(state, { type: 'UNDO' });

    expect(state.view).toBe('conversation');
    expect(state.threadId).toBe('t1');
    expect(state.place).toEqual(original);
    expect(state.applicationAuthorizationId).toBeNull();
  });

  it('review finding returns directly into the same manuscript/conversation spine', () => {
    let state = initialStudioExperience(sectionOnly('s1'));
    state = step(state, {
      type: 'OPEN_REVIEW',
      review: { readingId: 'r1', observationKey: 'o1' },
    });
    expect(state.view).toBe('review');

    state = step(state, {
      type: 'OPEN_FINDING',
      place: passage('s3'),
      review: { readingId: 'r1', observationKey: 'o1' },
      threadId: 't3',
    });

    expect(state.view).toBe('conversation');
    expect(state.place.sectionId).toBe('s3');
    expect(state.threadId).toBe('t3');
    expect(state.review).toEqual({ readingId: 'r1', observationKey: 'o1' });
  });

  it('uses the existing lawful reading address, never manufactures observation_id', () => {
    const state = initialStudioExperience(sectionOnly());
    const out = transitionStudioExperience(state, {
      type: 'OPEN_REVIEW',
      review: { readingId: 'r1', observationKey: 'o7' },
    });
    expect(out.accepted).toBe(true);
    expect(out.state.review).toEqual({ readingId: 'r1', observationKey: 'o7' });
    expect(JSON.stringify(out.state.review)).not.toContain('observation_id');
  });
});
