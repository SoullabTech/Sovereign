/**
 * THE SACRED IS NOT A SYMPTOM — the falsifier, as a runnable instrument.
 *
 * ⭐⭐ Soullab may recognize spiritual bypassing. It may never infer it merely
 *     because someone speaks the language of soul.
 *
 * THE TEST: changing ONLY the member's meaning-language must not change a
 * psychological, developmental or safety inference.
 *
 * ⚠️ This file covers the LAWFUL case only — the reference implementation each
 * instance repair must match. INSTANCE 2 (`MaiaBeadsPlugin:260`, element-as-flag)
 * and INSTANCE 3 (`ConsciousnessMemoryLattice:643`, mislabelled pattern) are OPEN;
 * a repo-wide version of this test would fail by design until they close, and each
 * carries its own substitution test as its witness.
 */

import { routePanconsciousField } from '../panconsciousFieldRouter';
import type { CognitiveProfile } from '../../consciousness/cognitiveProfileService';

const profile = (over: Partial<CognitiveProfile> = {}) => ({
  rollingAverage: 4.2,
  stability: 'stable',
  bypassingFrequency: { spiritual: 0.1, intellectual: 0.1 },
  ...over,
}) as CognitiveProfile;

/** Same person, same behaviour, different meaning-vocabulary. */
const SECULAR = { element: 'earth', facet: 'inner life', archetype: 'the maker' };
const SACRED  = { element: 'aether', facet: 'soul', archetype: 'the mystic' };

describe('the safety decision does not move when only the vocabulary moves', () => {
  it.each([
    ['a settled field', profile()],
    ['a developing field', profile({ rollingAverage: 3.1 })],
    ['a low-altitude field', profile({ rollingAverage: 2.0 })],
    ['a volatile field', profile({ stability: 'volatile' } as Partial<CognitiveProfile>)],
    ['a high-bypassing field', profile({ bypassingFrequency: { spiritual: 0.7, intellectual: 0.1 } } as Partial<CognitiveProfile>)],
  ])('%s routes identically in secular and sacred language', (_label, p) => {
    const secular = routePanconsciousField({ cognitiveProfile: p, ...SECULAR });
    const sacred = routePanconsciousField({ cognitiveProfile: p, ...SACRED });
    expect(sacred.fieldWorkSafe).toBe(secular.fieldWorkSafe);
    expect(sacred.realm).toBe(secular.realm);
    expect(sacred.deepWorkRecommended).toBe(secular.deepWorkRecommended);
    expect(sacred.basis).toBe(secular.basis);
  });

  it('⭐ is invariant BY CONSTRUCTION — the router consumes no meaning-language at all', () => {
    // The strongest form of the guarantee: not "the words happen not to matter",
    // but "the words are never read". `element`, `facet`, `archetype` and
    // `bloomLevel` are accepted by the signature and never consulted.
    const p = profile();
    const wild = routePanconsciousField({
      cognitiveProfile: p,
      element: 'aether', facet: 'transcendent mystical oracular soul-fire',
      archetype: 'spiritual bypasser', bloomLevel: 9,
    });
    expect(wild).toEqual(routePanconsciousField({ cognitiveProfile: p }));
  });

  it('still responds to the MEASURED bypassing frequency — the rule forbids vocabulary, not measurement', () => {
    // ⭐ Reading `bypassingFrequency.spiritual` is lawful: it is a measured
    // pattern of relationship to experience, not a word the member used.
    const low = routePanconsciousField({
      cognitiveProfile: profile({ bypassingFrequency: { spiritual: 0.1, intellectual: 0.1 } } as Partial<CognitiveProfile>),
    });
    const high = routePanconsciousField({
      cognitiveProfile: profile({ bypassingFrequency: { spiritual: 0.7, intellectual: 0.1 } } as Partial<CognitiveProfile>),
    });
    expect(low.deepWorkRecommended).not.toBe(high.deepWorkRecommended);
  });
});
