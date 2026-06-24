import { deriveContentFeature } from '../contentFeature';

describe('deriveContentFeature — an inspectable trigger, never an inferred member-state', () => {
  it('detects an explicit member mode-request', () => {
    const r = deriveContentFeature('Honestly, can we map this out? Help me think clearly.');
    expect(r.feature).toBe(true);
    expect(r.kind).toBe('mode_request');
    expect(r.evidence).toBeTruthy();
  });

  it('detects a member-reported communication event', () => {
    const r = deriveContentFeature("That's not what I meant — we keep misunderstanding each other.");
    expect(r.feature).toBe(true);
    expect(r.kind).toBe('communication_event');
  });

  it('detects a repeated content term and shows it back as text-on-the-table', () => {
    const r = deriveContentFeature('Freedom. I want freedom, but freedom scares me — this whole freedom question.');
    expect(r.feature).toBe(true);
    expect(r.kind).toBe('repeated_term');
    expect(r.evidence).toContain('freedom');
  });

  it('detects multiple bundled questions', () => {
    const r = deriveContentFeature('Should I leave? Or stay? And what does that even mean for us?');
    expect(r.feature).toBe(true);
    expect(r.kind).toBe('multiple_questions');
  });

  it('returns no feature for ordinary single-thread text', () => {
    const r = deriveContentFeature('I had a long day and I am tired.');
    expect(r.feature).toBe(false);
    expect(r.kind).toBeNull();
    expect(r.evidence).toBeNull();
  });

  // The load-bearing one: emotion is not an inspectable hook — surfacing on it would require inferring
  // "they're in Water / they need Air", which is the wire this boundary exists to remove.
  it('does NOT invent a feature from emotional content alone (that would require inference)', () => {
    const r = deriveContentFeature('I feel so betrayed and hurt right now.');
    expect(r.feature).toBe(false);
  });
});
