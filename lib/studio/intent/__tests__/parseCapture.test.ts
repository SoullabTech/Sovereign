import { normalizeCandidate, type CaptureCandidate } from '../parseCapture';

describe('normalizeCandidate', () => {
  const base: CaptureCandidate = {
    kind: 'calendar_event',
    confidence: 'high',
    title: 'Meeting with Nathan',
    fields: {},
  };

  it('keeps a well-formed high calendar_event as high', () => {
    const c = normalizeCandidate({
      ...base,
      fields: { date: '2026-06-18', startTime: '10:00', person: 'Nathan' },
    });
    expect(c.confidence).toBe('high');
    expect(c.fields.date).toBe('2026-06-18');
    expect(c.fields.startTime).toBe('10:00');
    expect(c.fields.person).toBe('Nathan');
  });

  it('downgrades a high calendar_event missing the time to medium with one question', () => {
    const c = normalizeCandidate({ ...base, fields: { date: '2026-06-18' } });
    expect(c.confidence).toBe('medium');
    expect(c.confirmation).toBeUndefined();
    expect(c.clarifyingQuestion).toMatch(/time/i);
  });

  it('strips malformed date/time rather than presenting a bad event', () => {
    const c = normalizeCandidate({
      ...base,
      confidence: 'medium',
      fields: { date: 'Friday', startTime: '25:99' },
    });
    expect(c.fields.date).toBeUndefined();
    expect(c.fields.startTime).toBeUndefined();
  });

  it('never restructures accompaniment — reflection is not a task', () => {
    const c = normalizeCandidate({
      kind: 'accompaniment',
      confidence: 'low',
      fields: {},
      possibleInterpretations: ['holding grief', 'a decision forming'],
    });
    expect(c.kind).toBe('accompaniment');
    expect(c.possibleInterpretations).toEqual(['holding grief', 'a decision forming']);
  });
});
