import { parseExperienceSubmission, EXPERIENCE_COLLECTION_OPEN, EXPERIENCE_POLICY, EXPERIENCE_RETENTION_DAYS } from '../experience/contract';
import { preparePreviewDraft, initialParticipationPreview, transitionParticipationPreview } from '../participationPreview';

const body = () => ({ policy: EXPERIENCE_POLICY, agreement: 'submit_this_report_once', activity: 'considered_revision', usefulness: 'partly' });

describe('Approved one-experience contract, not an activated pilot', () => {
  it('holds the approved 30-day scope but does not open collection', () => {
    expect(EXPERIENCE_RETENTION_DAYS).toBe(30);
    expect(EXPERIENCE_COLLECTION_OPEN).toBe(false);
  });
  it('admits a categorical report without attribution', () => {
    expect(parseExperienceSubmission(body())).toEqual({ ok: true, value: body() });
    expect(parseExperienceSubmission(body())).not.toHaveProperty('value.invitation');
  });
  it('admits attribution only with a separate affirmative selection', () => {
    const input = { ...body(), invitation: { id: 'wisdom-carrier', confirmed: true } };
    expect(parseExperienceSubmission(input)).toEqual({ ok: true, value: input });
    expect(parseExperienceSubmission({ ...body(), invitation: { id: 'wisdom-carrier', confirmed: false } }).ok).toBe(false);
    expect(parseExperienceSubmission({ ...body(), invitation: { id: 'wisdom-carrier' } }).ok).toBe(false);
  });
  it.each(['helped', 'partly', 'not_sure', 'did_not_help', 'prefer_not_to_answer'])('preserves %s without assigning a score', usefulness => {
    expect(parseExperienceSubmission({ ...body(), usefulness })).toMatchObject({ ok: true, value: { usefulness } });
  });
  it.each([
    null, [], {}, { ...body(), agreement: true }, { ...body(), policy: 'other' },
    { ...body(), activity: 'opened_app' }, { ...body(), usefulness: 'converted' },
    { ...body(), note: 'private text' }, { ...body(), member_id: 'fake owner' },
    { ...body(), marketing: true }, { ...body(), consent: true },
    { ...body(), invitation: null }, { ...body(), invitation: { id: 'unknown', confirmed: true } },
    { ...body(), invitation: { id: 'wisdom-carrier', confirmed: true, reason: 'private text' } },
  ])('rejects unapproved fields or meanings: %j', input => {
    expect(parseExperienceSubmission(input)).toEqual({ ok: false, reason: 'invalid_submission' });
  });
  it('a reviewed preview cannot be submitted as a real report', () => {
    let state = transitionParticipationPreview(initialParticipationPreview(), { type: 'begin_preview' });
    state = transitionParticipationPreview(state, { type: 'choose_activity', value: 'considered_revision' });
    state = transitionParticipationPreview(state, { type: 'choose_usefulness', value: 'helped' });
    expect(parseExperienceSubmission(preparePreviewDraft(state)).ok).toBe(false);
  });
});
