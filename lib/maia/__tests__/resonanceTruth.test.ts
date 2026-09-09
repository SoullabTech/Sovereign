/**
 * RESONANCE-TRUTH — chronology is not relationship.
 *
 * ⭐⭐ Count may describe chronology. It may not masquerade as relationship.
 * ⭐⭐ Chronology tells us how long the conversation has gone on. It does not
 *     tell us what the relationship has become.
 * ⭐   Unknown is not neutral.
 */

import { ResonanceFieldGenerator, ProbabilityCascade } from '../resonance-field-system';

const gen = () => new ResonanceFieldGenerator();
const TEXT = 'A paragraph I am revising, about the shape of the chapter.';

describe('turn count no longer determines the elemental field', () => {
  it.each([1, 9, 11, 29, 31, 200])('produces no elemental weights at exchange %i', n => {
    const f = gen().generateField(TEXT, {}, n);
    expect(f.elements).toBeUndefined();
  });

  it('turn 9 and turn 11 are not different fields', () => {
    const a = gen().generateField(TEXT, {}, 9);
    const b = gen().generateField(TEXT, {}, 11);
    // Previously: turn 9 was "Air 0.5 early", turn 11 was "Water 0.4 deepening".
    expect(a.elements).toEqual(b.elements);
    expect(a.wordDensity).toEqual(b.wordDensity);
  });

  it('keeps exchangeCount as a plain fact', () => {
    expect(gen().generateField(TEXT, {}, 17).exchangeCount).toBe(17);
  });

  it('exposes no intimacy value of any kind', () => {
    const f = gen().generateField(TEXT, {}, 60) as Record<string, unknown>;
    expect(f.intimacyLevel).toBeUndefined();
    expect(JSON.stringify(f)).not.toMatch(/intimacy/i);
  });
});

describe('unknown is not neutral', () => {
  it('absent weather yields no elemental weights — not a balanced middle', () => {
    expect(ProbabilityCascade.calculateElementalWeights(undefined)).toBeUndefined();
    expect(ProbabilityCascade.calculateElementalWeights('')).toBeUndefined();
  });

  it('absent state yields no consciousness influence — not an "early conversation" default', () => {
    expect(ProbabilityCascade.calculateConsciousnessInfluence(undefined)).toBeUndefined();
    expect(ProbabilityCascade.calculateConsciousnessInfluence('')).toBeUndefined();
  });

  it('a real weather signal still produces weights', () => {
    const w = ProbabilityCascade.calculateElementalWeights('crisis');
    expect(w).toBeDefined();
    expect(w!.fire).toBeGreaterThan(0.5);
  });

  it('a real state signal still produces influence', () => {
    expect(ProbabilityCascade.calculateConsciousnessInfluence('crisis')).toBeDefined();
  });
});

describe('outputs survive only where their premises do', () => {
  const f = () => gen().generateField(TEXT, {}, 12);

  it.each(['wordDensity', 'silenceProbability', 'fragmentationRate', 'responseLatency', 'pauseDuration'])(
    '%s is absent when the elemental premise is absent', k => {
      expect((f() as Record<string, unknown>)[k]).toBeUndefined();
    });

  it('⭐ what WAS observed survives: the hemispheric reading of this text', () => {
    const field = f();
    expect(field.hemispheres).toBeDefined();
    expect(typeof field.textSilence).toBe('number');
    expect(typeof field.textTiming).toBe('number');
  });

  it('the surviving text readings actually vary with the text', () => {
    const a = gen().generateField('Short.', {}, 5);
    const b = gen().generateField(
      'A long, winding, associative sentence that keeps reaching for something it cannot quite name.', {}, 5);
    expect(a.hemispheres).not.toEqual(b.hemispheres);
  });

  it('does not rescale a surviving term into the missing quantity', () => {
    // fragmentationRate was `elements.air * 0.7 + hemispheres.rightBrain * 0.3`.
    // Returning just the hemispheric term would be a DIFFERENT quantity under the
    // same name, so it is absent instead.
    const field = f();
    expect(field.fragmentationRate).toBeUndefined();
    expect(field.hemispheres.rightBrain).toBeDefined();
  });
});

describe('field evolution no longer measures the passage of turns', () => {
  it('reports nothing rather than zeros when there is nothing to compare', () => {
    expect(gen().analyzeFieldEvolution()).toEqual({});
  });

  it('exposes no intimacy growth', () => {
    const g = gen();
    g.generateField(TEXT, {}, 1);
    g.generateField(TEXT, {}, 2);
    expect(JSON.stringify(g.analyzeFieldEvolution())).not.toMatch(/intimacy/i);
  });
});
