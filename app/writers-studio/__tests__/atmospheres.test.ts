/**
 * ATMOSPHERE — the contract, made falsifiable.
 *
 * Four clauses, four kinds of test:
 *   MEMBER-CHOSEN  nothing infers, schedules, or suggests a room
 *   REVERSIBLE     choosing nothing is exactly today's Studio
 *   ACCESSIBLE     contrast is a GATE — a pretty room that fails cannot ship
 *   NON-SEMANTIC   an atmosphere means nothing and nothing may branch on it
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  ATMOSPHERES,
  ATMOSPHERE_IDS,
  ATMOSPHERE_LIST,
  DEFAULT_ATMOSPHERE,
  atmosphereVariables,
  isAtmosphereId,
} from '../atmosphere/atmospheres';
import { contrast, groundRamp, mix, luminance, parseHex, toHex } from '../atmosphere/palette';
import { PRESS, fallbackOf } from '../studioTheme';

describe('colour arithmetic', () => {
  it('round-trips a colour', () => {
    expect(toHex(parseHex('#1A1513'))).toBe('#1A1513');
    expect(toHex(parseHex('1a1513'))).toBe('#1A1513');
  });

  it('refuses something that is not a colour rather than guessing one', () => {
    expect(() => parseHex('espresso')).toThrow(/not a hex colour/);
  });

  it('mixes toward the far end and stops there', () => {
    expect(mix('#000000', '#FFFFFF', 0)).toBe('#000000');
    expect(mix('#000000', '#FFFFFF', 1)).toBe('#FFFFFF');
    expect(mix('#000000', '#FFFFFF', 5)).toBe('#FFFFFF'); // clamped, not extrapolated
  });

  it('measures contrast on the WCAG scale', () => {
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
    expect(contrast('#777777', '#777777')).toBeCloseTo(1, 5);
  });

  it('a light room lifts toward shadow, not toward white', () => {
    /* The reason `toward` is passed rather than inferred: a mid-toned anchor
       must not flip its own depth order at some luminance threshold. */
    const dark = groundRamp('#141C18', 'light');
    const light = groundRamp('#F2F0EA', 'shadow');
    expect(luminance(dark.active)).toBeGreaterThan(luminance(dark.base));
    expect(luminance(light.active)).toBeLessThan(luminance(light.base));
  });
});

describe('REVERSIBLE — choosing nothing is exactly the Studio we already had', () => {
  it('the default is Atelier', () => {
    expect(DEFAULT_ATMOSPHERE).toBe('atelier');
  });

  it('⛔ Atelier is the existing palette, byte for byte', () => {
    /* The whole safety property. If a value here drifts, every member who
       never touched atmosphere silently gets a repainted Studio. */
    const a = ATMOSPHERES.atelier;
    expect(a.ground).toEqual({
      deepest: '#15120D',
      base: '#1A1513',
      field: '#1D1812',
      raised: '#221B12',
      active: '#342715',
    });
    expect(a.ink).toEqual({
      primary: '#F3EDE4',
      secondary: '#CFC5B6',
      muted: '#9A8F80',
      quiet: '#7A7065',
    });
    expect(a.gold).toEqual({
      base: '#C9A227',
      fill: '#734F1A',
      text: '#A7783A',
      edge: '#5A431C',
      on: '#1A1513',
    });
    expect(a.rule).toEqual({ base: '#4A4238', soft: '#3a322b' });
  });

  it("Atelier's values are the token fallbacks, so an unwrapped surface matches", () => {
    /* A component the provider never wraps renders the fallback. If the two
       disagreed, the Studio would be two-toned at its own edges. */
    expect(fallbackOf(PRESS.text)).toBe(ATMOSPHERES.atelier.ink.primary);
    expect(fallbackOf(PRESS.accent)).toBe(ATMOSPHERES.atelier.gold.base);
    expect(fallbackOf(PRESS.rule)).toBe(ATMOSPHERES.atelier.rule.base);
    expect(fallbackOf(PRESS.ruleSoft)).toBe(ATMOSPHERES.atelier.rule.soft);
    expect(fallbackOf(PRESS.ink)).toBe(ATMOSPHERES.atelier.gold.on);
  });

  it('an unknown id is not a room', () => {
    expect(isAtmosphereId('atelier')).toBe(true);
    expect(isAtmosphereId('twilight')).toBe(false);
    expect(isAtmosphereId(null)).toBe(false);
  });
});

describe('ACCESSIBLE — contrast is a gate, not an intention', () => {
  /* WCAG AA for body text is 4.5:1. Applied to every room, on every surface a
     writer actually reads prose against, in the atmosphere's own primary ink.
     A room that fails cannot ship by being beautiful. */
  const BODY_FLOOR = 4.5;

  for (const atm of ATMOSPHERE_LIST) {
    describe(atm.name, () => {
      it('reads on every ground surface', () => {
        for (const [surface, colour] of Object.entries(atm.ground)) {
          expect({ surface, ratio: contrast(atm.ink.primary, colour) }).toEqual({
            surface,
            ratio: expect.any(Number),
          });
          expect(contrast(atm.ink.primary, colour)).toBeGreaterThanOrEqual(BODY_FLOOR);
        }
      });

      it('keeps quiet text quiet without making it unreadable', () => {
        /* 3:1 — the WCAG floor for large text and UI. Quiet metadata may
           recede; it may not become a colour only a designer can see. */
        expect(contrast(atm.ink.quiet, atm.ground.field)).toBeGreaterThanOrEqual(3);
      });

      it('ink on a filled accent reads', () => {
        expect(contrast(atm.gold.on, atm.gold.base)).toBeGreaterThanOrEqual(BODY_FLOOR);
      });

      it('its depth order is monotonic, so depth reads as depth', () => {
        /* ⚠️ Ordered, NOT ascending. This asserted rising luminance and failed
           Cloud — correctly, because a light room lifts toward shadow, so its
           ramp descends. "Brighter means raised" is a dark-room assumption
           wearing the costume of an invariant. What actually has to hold is
           that depth is consistent, so the eye can read one surface as sitting
           on another. (studioTheme's own assertGroundRampOrdered still hard-
           codes ascending; it only ever inspects the Atelier defaults, which
           are dark — recorded, not a defect there.) */
        const ramp = [atm.ground.deepest, atm.ground.base, atm.ground.field, atm.ground.raised, atm.ground.active];
        const steps = ramp.map(luminance);
        const ascending = [...steps].sort((a, b) => a - b);
        const descending = [...ascending].reverse();
        const monotonic =
          steps.every((v, i) => v === ascending[i]) || steps.every((v, i) => v === descending[i]);
        expect({ room: atm.name, monotonic }).toEqual({ room: atm.name, monotonic: true });
      });
    });
  }
});

describe('NON-SEMANTIC — an atmosphere means nothing', () => {
  const SOURCE = readFileSync(join(__dirname, '..', 'atmosphere', 'atmospheres.ts'), 'utf8');
  const CODE = SOURCE.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  it('⛔ no room is named for an element, a phase, or a feeling', () => {
    /* A room called "Fire" or "Calm" stops being a room. It becomes a claim
       about the writer, and then something downstream reads it. */
    const forbidden = [
      'fire', 'water', 'earth', 'air', 'aether',
      'calm', 'focus', 'flow', 'anxious', 'creative', 'productive', 'deep',
    ];
    for (const atm of ATMOSPHERE_LIST) {
      for (const word of forbidden) {
        expect(atm.id.toLowerCase()).not.toContain(word);
        expect(atm.name.toLowerCase()).not.toContain(word);
      }
    }
  });

  it('⛔ carries no mood, state, or recommendation field', () => {
    /* Asserted on the shape: a `mood` or `suggestedFor` field cannot be added
       without this failing, which forces the argument into the open. */
    for (const atm of ATMOSPHERE_LIST) {
      expect(Object.keys(atm).sort()).toEqual(['bg', 'gold', 'ground', 'id', 'ink', 'name', 'rule']);
    }
  });

  it('⛔ nothing about the member is read to pick a room', () => {
    for (const banned of ['Date(', 'hour', 'season', 'prefers-color-scheme', 'matchMedia', 'sentiment', 'mood']) {
      expect(CODE.toLowerCase()).not.toContain(banned.toLowerCase());
    }
  });

  it('every room supplies every variable — no half-lit surface', () => {
    const names = Object.keys(atmosphereVariables(ATMOSPHERES.atelier)).sort();
    for (const id of ATMOSPHERE_IDS) {
      const vars = atmosphereVariables(ATMOSPHERES[id]);
      expect(Object.keys(vars).sort()).toEqual(names);
      for (const [name, value] of Object.entries(vars)) {
        expect({ id, name, empty: value.trim().length === 0 }).toEqual({ id, name, empty: false });
      }
    }
  });
});
