import {
  initialParticipationPreview, transitionParticipationPreview as step, preparePreviewDraft,
  type ParticipationPreviewState, type ParticipationPreviewAction,
} from '../participationPreview';

const initial = () => initialParticipationPreview();
const editing = () => step(initial(), { type: 'begin_preview' });
const ready = () => step(step(editing(), { type: 'choose_activity', value: 'considered_revision' }),
  { type: 'choose_usefulness', value: 'helped' });
const reviewed = () => step(ready(), { type: 'review_preview' });
const invitation = 'wisdom-carrier';

describe('C7B1 participation rehearsal — never real consent or collection', () => {
  it('starts without participation, answers, attribution, or a record', () => {
    expect(initial()).toEqual({ phase: 'invitation' });
    expect(preparePreviewDraft(initial())).toBeNull();
  });
  it('does not preselect attribution, activity, or usefulness on entry', () => {
    expect(editing()).toEqual({ phase: 'editing', activity: null, usefulness: null, invitationId: null });
  });
  it.each<ParticipationPreviewAction>([
    { type: 'choose_activity', value: 'considered_revision' },
    { type: 'choose_usefulness', value: 'helped' },
    { type: 'choose_attribution', invitationId: invitation },
    { type: 'review_preview' }, { type: 'finish_preview' },
  ])('refuses collecting or completing before a participation gesture: %j', action => {
    expect(step(initial(), action)).toEqual(initial());
  });
  it('separates an activity from a usefulness answer', () => {
    const state = step(editing(), { type: 'choose_activity', value: 'considered_revision' });
    expect(preparePreviewDraft(state)).toBeNull();
    expect(step(state, { type: 'review_preview' })).toEqual(state);
  });
  it('does not accept usefulness before an activity', () => {
    expect(step(editing(), { type: 'choose_usefulness', value: 'helped' })).toEqual(editing());
  });
  it('an activity change invalidates the prior usefulness answer', () => {
    const state = step(ready(), { type: 'choose_activity', value: 'discussed_passage' });
    expect(state).toMatchObject({ activity: 'discussed_passage', usefulness: null });
    expect(preparePreviewDraft(state)).toBeNull();
  });
  it.each(['helped', 'partly', 'not_sure', 'did_not_help', 'prefer_not_to_answer'] as const)
    ('preserves the chosen answer without turning it into a score: %s', value => {
      const state = step(ready(), { type: 'choose_usefulness', value });
      expect(preparePreviewDraft(state)?.usefulness).toBe(value);
      expect(preparePreviewDraft(state)).not.toHaveProperty('score');
    });
  it('keeps participation and invitation attribution independent', () => {
    expect(preparePreviewDraft(ready())).not.toHaveProperty('invitation');
    const included = step(ready(), { type: 'choose_attribution', invitationId: invitation });
    expect(preparePreviewDraft(included)?.invitation)
      .toEqual({ id: invitation, source: 'member_confirmed_example' });
    const excluded = step(included, { type: 'choose_attribution', invitationId: null });
    expect(preparePreviewDraft(excluded)).not.toHaveProperty('invitation');
  });
  it.each(['invented', '__proto__', 'constructor', '', '/astrology?private=yes'])
    ('refuses an undeclared invitation: %s', id => {
      expect(step(ready(), { type: 'choose_attribution', invitationId: id })).toEqual(ready());
    });
  it('requires exact review before completing and never claims persistence', () => {
    expect(step(ready(), { type: 'finish_preview' })).toEqual(ready());
    const done = step(reviewed(), { type: 'finish_preview' });
    expect(done.phase).toBe('complete');
    expect(preparePreviewDraft(done)?.standing).toBe('preview_only_not_submitted');
    expect(done).not.toHaveProperty('receiptId');
  });
  it('does not change the reviewed draft through a stale input event', () => {
    const state = reviewed();
    expect(step(state, { type: 'choose_usefulness', value: 'did_not_help' })).toEqual(state);
  });
  it('returning to edit requires another review before finishing', () => {
    const state = step(reviewed(), { type: 'edit_preview' });
    const changed = step(state, { type: 'choose_usefulness', value: 'partly' });
    expect(changed.phase).toBe('editing');
    expect(step(changed, { type: 'finish_preview' })).toEqual(changed);
    expect(preparePreviewDraft(changed)?.usefulness).toBe('partly');
  });
  it.each([initial(), editing(), ready(), reviewed(), step(reviewed(), { type: 'finish_preview' })])
    ('clears every choice in every phase and never creates a withdrawal record', state => {
      expect(step(state, { type: 'clear_preview' })).toEqual({ phase: 'cleared' });
      expect(preparePreviewDraft(step(state, { type: 'clear_preview' }))).toBeNull();
    });
  it('clearing removes attribution too; restarting never resurrects it', () => {
    const included = step(ready(), { type: 'choose_attribution', invitationId: invitation });
    const cleared = step(included, { type: 'clear_preview' });
    expect(cleared).toEqual({ phase: 'cleared' });
    expect(step(cleared, { type: 'restart_preview' })).toEqual(initial());
    expect(step(cleared, { type: 'begin_preview' })).toEqual(cleared);
  });
  it('has a closed categorical output, not a place for private data', () => {
    const state = { ...ready(), note: 'PRIVATE', memberId: 'PRIVATE', manuscript: 'PRIVATE' } as ParticipationPreviewState;
    const draft = preparePreviewDraft(state)!;
    expect(Object.keys(draft).sort()).toEqual(['activity', 'basis', 'doorway', 'schema', 'standing', 'usefulness']);
    expect(JSON.stringify(draft)).not.toContain('PRIVATE');
    expect(draft.basis).toBe('member_reported_example');
  });
});
