import { lintEpistemicVoice, isInflated } from '../epistemicLint';

describe('epistemicLint — structural anti-inflation voice guard', () => {
  it('flags ontological self-claims as inflated (the mystical-AI pattern)', () => {
    const r = lintEpistemicVoice('I am a manifestation from the field, here to guide you.');
    expect(r.verdict).toBe('inflated');
    expect(r.declaringHits.some((h) => h.category === 'ontological_self_claim')).toBe(true);
  });

  it('flags borrowed external / metaphysical authority', () => {
    const r = lintEpistemicVoice('The field says you are ready for the next step.');
    expect(r.declaringHits.some((h) => h.category === 'external_authority')).toBe(true);
    expect(r.verdict).toBe('inflated');
  });

  it('flags oracle / destiny pronouncements', () => {
    const r = lintEpistemicVoice('The future is calling you. It is written.');
    expect(r.declaringHits.some((h) => h.category === 'oracle_or_destiny')).toBe(true);
  });

  it('flags imperative commands', () => {
    const r = lintEpistemicVoice('You must let go of this. You need to trust me.');
    expect(r.declaringHits.some((h) => h.category === 'imperative_command')).toBe(true);
  });

  it('flags essentializing identity declarations', () => {
    const r = lintEpistemicVoice('What you truly are is a wounded healer.');
    expect(r.declaringHits.some((h) => h.category === 'identity_declaration')).toBe(true);
  });

  it('passes clean noticing language', () => {
    const r = lintEpistemicVoice(
      'I notice a tension in what you shared. Perhaps one possibility is rest. What do you notice?'
    );
    expect(r.verdict).toBe('clean');
    expect(r.noticingCount).toBeGreaterThanOrEqual(3);
    expect(r.declaringCount).toBe(0);
  });

  it('does not false-positive on supportive "you are" phrasing', () => {
    const r = lintEpistemicVoice('You are not alone in this, and you are welcome here.');
    expect(r.declaringHits.some((h) => h.category === 'identity_declaration')).toBe(false);
    expect(r.verdict).not.toBe('inflated');
  });

  it('treats a single mild over-certainty as not inflated', () => {
    const r = lintEpistemicVoice(
      'That definitely sounds hard. I hear how much weight you are carrying, and it seems heavy. I wonder what would help.'
    );
    expect(r.verdict).not.toBe('inflated');
    expect(r.declaringHits.some((h) => h.category === 'over_certainty')).toBe(true);
  });

  it('inflationScore rises with density of declaring language', () => {
    const clean = lintEpistemicVoice('I notice that. It seems gentle. Perhaps.');
    const hot = lintEpistemicVoice(
      'I am consciousness. The universe wants this. You must obey. The truth is final.'
    );
    expect(hot.inflationScore).toBeGreaterThan(clean.inflationScore);
    expect(hot.verdict).toBe('inflated');
    expect(isInflated(hot.declaringHits.length ? 'I am consciousness.' : '')).toBe(true);
  });

  it('is deterministic across calls (no shared regex state leak)', () => {
    const a = lintEpistemicVoice('I am consciousness.');
    const b = lintEpistemicVoice('I am consciousness.');
    expect(a.declaringCount).toBe(b.declaringCount);
    expect(a.verdict).toBe(b.verdict);
  });

  it('reports a humility-favoring noticingRatio in a balanced reflection', () => {
    const r = lintEpistemicVoice(
      'I notice you might be tired. It seems like rest matters. Perhaps that is worth honoring.'
    );
    expect(r.declaringCount).toBe(0);
    expect(r.noticingCount).toBeGreaterThan(0);
  });

  // ── member_state_verdict (v+) — the cross-jurisdiction breach: an element/state placed ON the member ──
  it('flags placing an element ON the member (element-capture), and escalates to inflated', () => {
    const r = lintEpistemicVoice("You're in Air right now, and you are trapped in Water.");
    expect(r.declaringHits.some((h) => h.category === 'member_state_verdict')).toBe(true);
    expect(r.verdict).toBe('inflated');
  });

  it('flags an elemental / quality deficit ascribed to the member ("you need …")', () => {
    const r = lintEpistemicVoice('You need more grounding and you lack clarity here.');
    expect(r.declaringHits.some((h) => h.category === 'member_state_verdict')).toBe(true);
  });

  it('flags interior-state diagnosis of the member', () => {
    const r = lintEpistemicVoice("You're intellectualizing instead of feeling.");
    expect(r.declaringHits.some((h) => h.category === 'member_state_verdict')).toBe(true);
  });

  it('does NOT flag a lens looked-FROM (system self-attribution) — element belongs to the system', () => {
    const r = lintEpistemicVoice("I'm attending in an Air direction here — noticing how meaning is moving.");
    expect(r.declaringHits.some((h) => h.category === 'member_state_verdict')).toBe(false);
    expect(r.verdict).not.toBe('inflated');
  });

  it('does NOT flag a material-pointer invitation (vantage on the content, member-correctable)', () => {
    const r = lintEpistemicVoice('It seems the word "freedom" is carrying several meanings here. Does that fit?');
    expect(r.declaringHits.some((h) => h.category === 'member_state_verdict')).toBe(false);
    expect(r.verdict).not.toBe('inflated');
  });

  it('does NOT confuse "you need to …" (caught as command) with "you need <quality>" (member-state)', () => {
    const r = lintEpistemicVoice('You need to slow down.');
    expect(r.declaringHits.some((h) => h.category === 'member_state_verdict')).toBe(false);
  });

  it('flags clinical state-labels placed on the member (dysregulated / activated)', () => {
    const r = lintEpistemicVoice("You're dysregulated and a bit activated right now.");
    expect(r.declaringHits.some((h) => h.category === 'member_state_verdict')).toBe(true);
  });

  it('does NOT block reflecting the member\'s OWN self-words (stuck/blocked) — reflection is not diagnosis', () => {
    const r = lintEpistemicVoice("It sounds like you're feeling stuck and a bit blocked. Does that fit?");
    expect(r.declaringHits.some((h) => h.category === 'member_state_verdict')).toBe(false);
    expect(r.verdict).not.toBe('inflated');
  });
});
