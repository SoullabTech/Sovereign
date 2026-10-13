import { buildLearningReport, learningWindow, MIN_FEEDBACK_CONTRIBUTORS } from '../learningReport';

const NOW = new Date('2026-10-03T20:00:00.000Z');
const group = (submissions: number, contributors: number) => ({
  signal: 'felt_like_my_voice', submissions, contributors,
});
const report = (groups: unknown[]) => buildLearningReport({ kind: 'read', groups }, NOW);
const voice = (r: ReturnType<typeof report>) => r.feedback.find(s => s.id === 'felt_like_my_voice')!;

// Predeclared acceptance: these assert observations, not flattering interpretations.
describe('C7A learning report', () => {
  it('bounds the read to 28 completed UTC days', () => {
    expect(learningWindow(NOW)).toEqual({
      start: '2026-09-05T00:00:00.000Z', endExclusive: '2026-10-03T00:00:00.000Z', days: 28,
    });
  });
  it('is independent of the browser timezone and handles year boundaries', () => {
    expect(learningWindow(new Date('2027-01-03T01:00:00+02:00')).endExclusive)
      .toBe('2027-01-02T00:00:00.000Z');
  });
  it('refuses an invalid clock', () => {
    expect(() => learningWindow(new Date('invalid'))).toThrow();
  });
  it('distinguishes an observed zero from an unavailable source', () => {
    expect(voice(report([]))).toMatchObject({ state: 'observed', submissions: 0 });
    const unavailable = buildLearningReport({ kind: 'unavailable' }, NOW);
    expect(voice(unavailable)).toMatchObject({ state: 'unavailable', submissions: null });
    expect(unavailable.source.state).toBe('unavailable');
  });
  it('cannot turn 100 submissions from one person into corroboration', () => {
    expect(voice(report([group(100, 1)]))).toMatchObject({ state: 'withheld', submissions: null });
  });
  it('uses five independent contributors as the display floor', () => {
    expect(MIN_FEEDBACK_CONTRIBUTORS).toBe(5);
    expect(voice(report([group(6, 4)]))).toMatchObject({ state: 'withheld', submissions: null });
    expect(voice(report([group(6, 5)]))).toMatchObject({ state: 'observed', submissions: 6 });
  });
  it('returns neither contributor counts nor small-group totals', () => {
    const r = report([group(100, 1)]);
    expect(Object.keys(voice(r)).sort()).toEqual(['id', 'label', 'state', 'submissions']);
    expect(JSON.stringify(r)).not.toContain('100');
    expect(r).not.toHaveProperty('total');
    expect(r).not.toHaveProperty('contributors');
  });
  it.each([
    [group(-1, 0)], [group(1.5, 1)], [group(3, 4)], [group(0, 1)], [group(1, 0)],
    [group(2, 2), group(2, 2)],
    [{ signal: 'invented_signal', submissions: 10, contributors: 5 }],
    [{ ...group(5, 5), note: 'PRIVATE NOTE' }],
    [{ ...group(5, 5), member_id: 'PRIVATE ID' }],
    [null], ['unexpected'],
  ])('refuses malformed source groups without fabricating an empty sample: %j', (...groups) => {
    const r = report(groups);
    expect(r.source.state).toBe('unavailable');
    expect(r.feedback.every(s => s.state === 'unavailable' && s.submissions === null)).toBe(true);
    expect(JSON.stringify(r)).not.toContain('PRIVATE');
  });
  it('preserves all eight choices, including unresolved and disagreeing feedback', () => {
    expect(report([]).feedback.map(s => s.id)).toEqual([
      'lost_thread', 'maia_misunderstood', 'too_much_too_quickly', 'wanted_more_help',
      'felt_like_my_voice', 'changed_how_i_see_work', 'not_ready_to_decide', 'something_else',
    ]);
  });
  it('does not invent campaign attribution, activation, retention, or referral results', () => {
    const r = report([group(7, 5)]);
    expect(r.unmeasured.map(m => m.id)).toEqual([
      'campaign_attribution', 'arrival', 'meaningful_first_act', 'return', 'referral', 'contribution',
    ]);
    expect(r.unmeasured.every(m => m.state === 'not_measured')).toBe(true);
    expect(r).not.toHaveProperty('conversionRate');
    expect(r).not.toHaveProperty('campaignWinner');
    expect(r.source.population).toContain('self-selected');
  });
  it('labels the unit as submissions, not unique people or editorial success', () => {
    const r = report([group(8, 5)]);
    expect(r.source.unit).toBe('feedback submissions');
    expect(r.source.attribution).toBe('not_collected');
  });
});
