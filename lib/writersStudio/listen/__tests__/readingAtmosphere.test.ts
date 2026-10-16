import { describe, expect, it } from 'vitest';
import {
  READING_ATMOSPHERES, isReadingAtmosphere,
  readingAtmosphereById, readingAtmosphereStorageKey,
} from '../readingAtmosphere';

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string): number {
  const l1 = luminance(a);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05);
}

describe('Writer’s Studio Listen · optional reading atmospheres', () => {
  it('offers six writer-selectable choices without asserting therapeutic benefits', () => {
    expect(READING_ATMOSPHERES.map((a) => a.label))
      .toEqual(['Parchment', 'Earth', 'Water', 'Fire', 'Air', 'Aether']);
    expect(new Set(READING_ATMOSPHERES.map((a) => a.id)).size).toBe(6);
    expect(READING_ATMOSPHERES.every((a) => !/cure|treat|heal|therapy/i.test(a.meaning)))
      .toBe(true);
  });

  it('keeps primary and supporting text readable on every background', () => {
    for (const a of READING_ATMOSPHERES) {
      expect(contrast(a.paper, a.text), a.label + ' main').toBeGreaterThanOrEqual(7);
      expect(contrast(a.paper, a.heading), a.label + ' heading').toBeGreaterThanOrEqual(7);
      expect(contrast(a.paper, a.muted), a.label + ' supporting').toBeGreaterThanOrEqual(4.5);
      expect(contrast(a.paper, a.accent), a.label + ' accent').toBeGreaterThanOrEqual(4.5);
    }
  });

  it('refuses unknown palette values and safely defaults', () => {
    expect(isReadingAtmosphere('water')).toBe(true);
    expect(isReadingAtmosphere('aether')).toBe(true);
    expect(isReadingAtmosphere('unknown')).toBe(false);
    expect(isReadingAtmosphere(null)).toBe(false);
    expect(readingAtmosphereById('water').label).toBe('Water');
    expect(readingAtmosphereById('unknown' as 'water').id).toBe('parchment');
  });

  it('scopes the preference to a particular work, not the global theme', () => {
    const first = readingAtmosphereStorageKey('manuscript-one');
    const second = readingAtmosphereStorageKey('manuscript-two');
    expect(first).not.toBe(second);
    expect(first).toContain('reading-atmosphere');
    expect(first).not.toContain('ws_atmosphere');
  });
});
