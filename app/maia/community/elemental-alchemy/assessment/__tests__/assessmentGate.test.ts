/**
 * EA Assessment gate tests (ruling E0.2, 2026-07-21).
 *
 * The assessment route must render only the non-interpretive holding
 * notice: no identity language, no scores, no element assignment.
 * Because the gate IS the route's page component, direct URL access
 * cannot bypass it. The page is a static server component, so these
 * source-level assertions pin exactly what it can render.
 */
import fs from 'fs';
import path from 'path';

const pagePath = path.join(__dirname, '../page.tsx');
const rawSource = fs.readFileSync(pagePath, 'utf8');
// Strip comments: the file header cites the ruling and therefore names the
// refused vocabulary; only renderable code may be held to the register test.
const source = rawSource
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

describe('EA assessment gate (E0.2)', () => {
  it('renders the holding notice', () => {
    expect(source).toContain('This reflection is being revised');
    expect(source).toContain('without defining who you are');
  });

  it('links back to the Elemental Alchemy hub', () => {
    expect(source).toContain('"/maia/community/elemental-alchemy"');
  });

  it('contains no identity-register language', () => {
    const refused = [
      /dominant element/i,
      /your dominant/i,
      /discover your element/i,
      /you are\s+(fire|water|earth|air|aether)/i,
      /elemental balance/i,
      /yogic path/i,
      /\d+\s*%/,
    ];
    for (const pattern of refused) {
      expect(source).not.toMatch(pattern);
    }
  });

  it('is a static gate: no interactivity, no scoring, no client state', () => {
    expect(source).not.toContain("'use client'");
    expect(source).not.toMatch(/useState|useMemo|useRouter/);
    expect(source).not.toContain('calculateResults');
    expect(source).not.toContain('ASSESSMENT_QUESTIONS');
    expect(source).not.toMatch(/<button/i);
    expect(source).not.toMatch(/<input/i);
    expect(source).not.toContain('localStorage');
  });

  it('preserves the redesign path: scoring module remains on disk, untouched by the gate', () => {
    const scoringPath = path.join(
      __dirname,
      '../../../../../../lib/elemental-alchemy/assessmentQuestions.ts'
    );
    expect(fs.existsSync(scoringPath)).toBe(true);
    const scoring = fs.readFileSync(scoringPath, 'utf8');
    expect(scoring).toContain('calculateResults');
  });

  it('leaves the hub page intact (chapters remain reachable)', () => {
    const hubPath = path.join(__dirname, '../../page.tsx');
    expect(fs.existsSync(hubPath)).toBe(true);
    const hub = fs.readFileSync(hubPath, 'utf8');
    expect(hub).toContain('Elemental Alchemy');
  });
});
