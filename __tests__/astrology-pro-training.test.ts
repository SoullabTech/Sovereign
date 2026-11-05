/**
 * ASTRO-PRO-TRAINING-01 — the Techniques track stays true to the tool and
 * to the non-prescriptive boundary.
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { TECHNIQUE_LESSONS } from '../lib/astrology/proTechniqueLessons';
import { dignity } from '../lib/astrology/proTraditionText';
import { midpoint } from '../lib/astrology/proComparison';

const UI = readdirSync(path.join(__dirname, '../app/astrology/pro-preview'))
  .filter((f) => f.endsWith('.tsx'))
  .map((f) => readFileSync(path.join(__dirname, '../app/astrology/pro-preview', f), 'utf8'))
  .join('\n')
  .replace(/&amp;/g, '&');

const allText = (l: typeof TECHNIQUE_LESSONS[number]) =>
  [l.concept, ...l.points, ...l.practice, l.check.question, l.check.answer, l.boundary].join(' ');

describe('Pro technique lessons', () => {
  it('covers every Pro tool with practice, a self-check and a boundary', () => {
    const ids = TECHNIQUE_LESSONS.map((l) => l.id);
    expect(ids).toEqual(expect.arrayContaining([
      'astrocartography', 'relocation', 'transits', 'progressions', 'returns', 'comparison', 'declination', 'harmonics', 'dignity',
    ]));
    for (const l of TECHNIQUE_LESSONS) {
      expect(l.practice.length).toBeGreaterThanOrEqual(3);
      expect(l.check.question.endsWith('?')).toBe(true);
      expect(l.boundary.length).toBeGreaterThan(40);
    }
  });

  it('names only panels and controls that exist in Pro', () => {
    const named = ['Astro map & relocation', 'Draw astro map', 'Transits', 'Play ▶▶', 'Ephemeris & timeline',
      'Progressions & returns', 'Show as outer ring', 'Compare', 'Composite', 'Aspect grid & declinations',
      'Chart points & views', 'Harmonic', 'Sidereal', 'Natal report', 'Relocate'];
    const practice = TECHNIQUE_LESSONS.flatMap((l) => l.practice).join(' ');
    for (const label of named) {
      if (practice.includes(label)) expect(UI).toContain(label);
    }
  });

  it('never predicts or tells the learner who someone is', () => {
    const banned = /\b(will (bring|cause|happen)|destined|fated|guarantee[sd]?|you are a|doomed)\b/i;
    for (const l of TECHNIQUE_LESSONS) expect(allText(l)).not.toMatch(banned);
  });

  it('gives self-check answers that agree with the calculator', () => {
    expect(dignity('Sun', 'Libra')).toBe('fall');
    // A composite planet sits at the shorter-arc midpoint.
    expect(midpoint(350, 10)).toBe(0);
  });
});
