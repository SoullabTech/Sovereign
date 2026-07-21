/**
 * Developmental Reflection Experience — register tests (beta v0).
 *
 * Pins the constitutional constraints of EA_WORLD_CLASS_ASSESSMENT_FOUNDATIONS
 * §§5–6 and the E0.1 authorship grammar at the source level:
 * no identity language, no scoring, no elements, member words verbatim,
 * skippable everything.
 */
import fs from 'fs';
import path from 'path';

const pageSource = fs
  .readFileSync(path.join(__dirname, '../page.tsx'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

const apiSource = fs
  .readFileSync(path.join(__dirname, '../../../api/reflection/route.ts'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

describe('reflection page register (E0.1 / foundations §6)', () => {
  it('asks the walkthrough questions in ordinary language', () => {
    expect(pageSource).toContain('What feels most alive in your life right now?');
    expect(pageSource).toContain('What may be ending?');
    expect(pageSource).toContain('What may be trying to emerge?');
    expect(pageSource).toContain('What feels difficult to name or explain?');
  });

  it('makes refusal first-class', () => {
    expect(pageSource).toMatch(/rather not say/i);
    expect(pageSource).toMatch(/skip/i);
  });

  it('contains no identity-register or typing language', () => {
    const refused = [
      /you are\s+(fire|water|earth|air|aether)/i,
      /dominant/i,
      /your element/i,
      /elemental balance/i,
      /personality/i,
      /\byour type\b/i,
      /yogic/i,
    ];
    for (const pattern of refused) {
      expect(pageSource).not.toMatch(pattern);
    }
  });

  it('contains no element vocabulary at all (elements stay backstage)', () => {
    for (const el of ['fire', 'water', 'earth', 'aether']) {
      expect(pageSource.toLowerCase()).not.toContain(el);
    }
  });

  it('computes nothing about the person: no scoring mechanics anywhere', () => {
    // The page PROMISES no scoring, in copy — assert the promise…
    expect(pageSource).toContain('Nothing here has been scored');
    // …and that no scoring mechanics exist in page or API code:
    for (const src of [pageSource, apiSource]) {
      expect(src).not.toMatch(/calculateResults|\bscores?\s*[[:=(]|percent|\d+\s*%|dominant|balance/);
    }
  });

  it('offers return as invitation, never streaks or reminders', () => {
    // The promise copy is present…
    expect(pageSource).toMatch(/No reminders/i);
    expect(pageSource).toMatch(/no streaks/i);
    // …and no streak/reminder mechanics exist (code identifiers are camelCase —
    // case-sensitive match so promise copy like "no streaks" doesn't trip):
    for (const src of [pageSource, apiSource]) {
      expect(src).not.toMatch(/streak[A-Z_]|_streak|Streak|Reminder|notification|Notification/);
    }
  });

  it('API stores only member-authored content, member-scoped', () => {
    expect(apiSource).toContain('getAuthenticatedMember');
    expect(apiSource).toContain('member_reflections');
    expect(apiSource).toMatch(/member_id = \$/);
  });
});
