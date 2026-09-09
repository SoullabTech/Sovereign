/**
 * FIELD-SAFETY-COPY-01B — INTERFACE HUMILITY, as a runnable falsifier.
 *
 * ⭐⭐ The gate can say "I won't go there yet." It should not say "you are not ready."
 * ⭐⭐ The system may be certain about its own boundary without claiming certainty
 *     about the person who triggered it.
 *
 * FAIL if the member-facing boundary asserts a psychological, developmental or
 * spiritual condition more specific than the evidence used to make the routing
 * decision — four numbers on a cognitive profile.
 */

import { getFieldSafetyCopy } from '../fieldSafetyCopy';
import { routePanconsciousField } from '../panconsciousFieldRouter';
import type { CognitiveProfile } from '../../consciousness/cognitiveProfileService';

const blocked = routePanconsciousField({
  cognitiveProfile: {
    rollingAverage: 2.0, stability: 'stable',
    bypassingFrequency: { spiritual: 0.1, intellectual: 0.1 },
  } as CognitiveProfile,
});
const copy = () => getFieldSafetyCopy({ fieldRouting: blocked, userName: 'Kelly' });

describe('the copy owns MAIA\'s decision', () => {
  it('is still a real boundary — it declines, it does not hedge', () => {
    expect(copy().message).toMatch(/I'm going to keep this grounded/i);
    expect(copy().state).toBe('not_safe');
  });

  it('locates the uncertainty in MAIA\'s evidence, not in the member', () => {
    expect(copy().message).toMatch(/signals available to me/i);
    expect(copy().message).toMatch(/don't give me enough confidence/i);
  });

  it('says what remains available', () => {
    expect(copy().message).toMatch(/concrete, embodied, and present/i);
    expect(copy().message).toMatch(/return to the symbolic layer/i);
  });
});

describe('the copy claims no jurisdiction over the member\'s interiority', () => {
  it.each([
    ['your field is asking', /your field.{0,20}(is asking|right now)/i],
    ['you are in a phase', /you'?re in a phase|you are in a phase/i],
    ['when your field is ready', /your field is ready|ready to hold/i],
    ['what you are building', /what you'?re building/i],
    ['a claim about readiness', /you'?re not ready|not yet ready/i],
    ['a claim about need', /you need (to|more)/i],
    ['a claim about longing', /you'?re longing/i],
  ])('does not assert %s', (_label, forbidden) => {
    expect(copy().message).not.toMatch(forbidden);
  });

  it('⭐ makes no second-person claim about the member\'s inner state at all', () => {
    // The precise line: "you" may appear as address ("we can stay…"), never as
    // the subject of a psychological predicate.
    const psychological = /\byou(?:'re| are)\s+(?!going)\w+/gi;
    expect(copy().message.match(psychological) ?? []).toEqual([]);
  });
});

describe('the sacred is not framed as a risk', () => {
  it.each([
    ['escape', /escap/i],
    ['bypass', /bypass/i],
    ['danger', /danger|unsafe|risk/i],
    // ⚠️ INSTRUMENT NOTE: an earlier version of this row also matched
    // `rather than …(symbolic)`, which flagged the copy's own
    // "keep this grounded for now rather than move into deeper symbolic work".
    // That is MAIA stating which of two paths she is taking — not a claim that
    // the symbolic path is lesser. Contrastive phrasing is not disparagement;
    // the test was wrong, and the copy was not changed to satisfy it.
    ['a substitute for real work', /instead of|in place of|not real|avoid(ing)? the real/i],
  ])('does not frame symbolic work as %s', (_label, forbidden) => {
    expect(copy().message).not.toMatch(forbidden);
  });
});

describe('no elemental note reaches the member', () => {
  it('carries none — a bare element string is not member-about prose', () => {
    expect(copy() as Record<string, unknown>).not.toHaveProperty('elementalNote');
  });

  it('is unaffected by the element, because it never receives one', () => {
    const a = getFieldSafetyCopy({ fieldRouting: blocked, userName: 'Kelly' });
    const b = getFieldSafetyCopy({ fieldRouting: blocked, userName: 'Kelly', element: 'aether' });
    expect(b).toEqual(a);
  });
});

describe('the precondition still holds', () => {
  it('refuses to produce boundary copy for a permitted field', () => {
    const permitted = routePanconsciousField({
      cognitiveProfile: {
        rollingAverage: 4.5, stability: 'stable',
        bypassingFrequency: { spiritual: 0.1, intellectual: 0.1 },
      } as CognitiveProfile,
    });
    expect(() => getFieldSafetyCopy({ fieldRouting: permitted })).toThrow(/declined boundary only/);
  });
});
