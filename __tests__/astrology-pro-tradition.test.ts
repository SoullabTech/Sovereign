/**
 * ASTRO-PRO-REPORTS-01 — founder ruling 2026-11-04: written readings only
 * when labelled as tradition. These tests hold the text to that ruling.
 */
import {
  ASPECT_TRADITION, HOUSE_TRADITION, PLANET_TRADITION, SIGN_TRADITION, TRADITION_NOTICE,
  angleReading, aspectReading, dignity, placementReading,
} from '../lib/astrology/proTraditionText';

const SIGNS = Object.keys(SIGN_TRADITION);
const PLANETS = Object.keys(PLANET_TRADITION);

function everyLine(): string[] {
  const lines: string[] = [];
  for (const p of PLANETS) for (const s of SIGNS) for (let h = 1; h <= 12; h++) lines.push(...placementReading(p, s, h));
  for (const t of Object.keys(ASPECT_TRADITION)) lines.push(aspectReading('Sun', 'Moon', t)!);
  for (const s of SIGNS) lines.push(angleReading('Ascendant', s)!, angleReading('Midheaven', s)!);
  return lines;
}

describe('tradition text', () => {
  it('uses the classical dignity tables', () => {
    expect(dignity('Sun', 'Leo')).toBe('domicile');
    expect(dignity('Sun', 'Aries')).toBe('exaltation');
    expect(dignity('Sun', 'Aquarius')).toBe('detriment');
    expect(dignity('Sun', 'Libra')).toBe('fall');
    expect(dignity('Mars', 'Scorpio')).toBe('domicile');
    expect(dignity('Saturn', 'Libra')).toBe('exaltation');
    expect(dignity('Venus', 'Virgo')).toBe('fall');
    expect(dignity('Jupiter', 'Gemini')).toBe('detriment');
    expect(dignity('Mercury', 'Leo')).toBeNull();
    expect(dignity('Pluto', 'Scorpio')).toBe('domicile');
  });

  it('covers every sign, planet and house', () => {
    expect(SIGNS).toHaveLength(12);
    expect(Object.keys(HOUSE_TRADITION)).toHaveLength(12);
    for (const p of PLANETS) expect(placementReading(p, 'Aries', 1).length).toBeGreaterThanOrEqual(3);
  });

  it('attributes every reading to tradition rather than asserting it', () => {
    for (const line of everyLine()) {
      expect(line).toMatch(/[Tt]radition|traditionally|modern usage|in modern|medieval/);
    }
  });

  it('never predicts or tells the person who they are', () => {
    const banned = /\b(will|destined|fated|guarantee[sd]?|always|never|you are|you will|must|doomed)\b/i;
    for (const line of everyLine()) expect(line).not.toMatch(banned);
  });

  it('says plainly what the report is and is not', () => {
    expect(TRADITION_NOTICE).toMatch(/record of a tradition/);
    expect(TRADITION_NOTICE).toMatch(/not a statement about who this person is or what will happen/);
  });
});
