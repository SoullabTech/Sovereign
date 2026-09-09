/**
 * FIELD-TRUTH-02 — honest elemental absence.
 *
 * ⭐⭐ No evidence of an element is not evidence of Earth.
 *
 * The census found the Earth default on the ORDINARY path: `dominantElement`
 * was initialized to 'earth' and only replaced when some element scored above
 * zero, so any text without the keyword vocabulary returned Earth. Manuscript
 * prose is exactly that case.
 *
 * ⛔ Out of scope, deliberately: the keyword vocabulary, thresholds, PFI,
 * Unified beyond respecting absence, the `(meta as any)` transit, producer
 * registration, room cutover.
 */

import { ElementalOracleBridge, getElementalTruthCounters } from '../elemental-oracle-bridge';

const fast = (input: string) =>
  new ElementalOracleBridge().processAll({ input, includeAll: true, fastMode: true });

describe('FAST — zero elemental matches yields no dominant element', () => {
  it('does not return Earth for prose with no elemental vocabulary', async () => {
    // NB: probe prose must avoid every vocabulary. "I think" is an AIR keyword;
    // "structure"/"whole" are EARTH/AETHER. Instrument faults found on first run.
    const r = await fast('A quiet paragraph that says very little.');
    expect(r.dominant).toBeUndefined();
    expect(r.dominant).not.toBe('earth');
  });

  it('does not return an empty string either — absence is no value at all', async () => {
    const r = await fast('The chapter moves from one passage to the next.');
    expect(r.dominant).toBeUndefined();
    expect(r.dominant).not.toBe('');
  });

  it('says why it is absent, for the receipt', async () => {
    const r = await fast('A quiet paragraph about nothing in particular.');
    expect(r.dominantAbsentReason).toBe('no_elemental_signal');
  });

  it('does not narrate a fabricated dominance in its synthesis', async () => {
    const r = await fast('A quiet paragraph about nothing in particular.');
    expect(r.synthesis).not.toMatch(/earth/i);
    expect(r.synthesis).toMatch(/no elemental signal/i);
  });

  it('still names a dominant element when the text actually indicates one', async () => {
    const r = await fast('There was rage and fury in it, a passion that would burn.');
    expect(r.dominant).toBe('fire');
    expect(r.dominantAbsentReason).toBeUndefined();
  });

  it('reads a manuscript passage ABOUT fire — the referent question is separate', async () => {
    // Recorded, not asserted as correct: this is the Work-about vs member-about
    // boundary the Writer Referent ruling must decide. FIELD-TRUTH-02 only stops
    // the FABRICATION; it does not change what a reading is ABOUT.
    const r = await fast('Rage and passion, a fierce and bold burn.');
    expect(r.dominant).toBe('fire');
  });

  it('⚠️ the vocabularies are BASE FORMS ONLY — "burned" does not match "burn"', async () => {
    // Found while writing this suite. `/\bburn\b/` misses "burned", "burning";
    // "raging" misses "rage". So an unmistakably fiery passage can score zero.
    // ⛔ NOT repaired — FIELD-TRUTH-02 forbids altering the keyword vocabulary.
    // Recorded because it bears directly on how often "no signal" actually fires.
    const r = await fast('The forest burned for three days, raging through the pines.');
    expect(r.dominant).toBeUndefined();
  });
});

describe('the three outcomes are distinguishable', () => {
  it('counts a no-signal run separately from a signal-present run', async () => {
    const before = getElementalTruthCounters();
    await fast('nothing in particular here at all');
    const mid = getElementalTruthCounters();
    expect(mid.noSignal).toBe(before.noSignal + 1);
    expect(mid.signalPresent).toBe(before.signalPresent);

    await fast('rage and fury and passion');
    const after = getElementalTruthCounters();
    expect(after.signalPresent).toBe(mid.signalPresent + 1);
    expect(after.noSignal).toBe(mid.noSignal);
  });
});

describe('the handoff can no longer forward a fabricated identity', () => {
  it('an absent dominant is nullish, so `??` falls through to the other source', async () => {
    const r = await fast('a plain sentence');
    const suppliedElsewhere = 'water';
    expect(r.dominant ?? suppliedElsewhere).toBe('water');
  });

  it('an empty-string sentinel would NOT have fallen through — which is why it is gone', () => {
    const sentinel = '' as string | undefined;
    expect(sentinel ?? 'water').toBe('');   // the old behaviour, pinned as the reason
  });
});
