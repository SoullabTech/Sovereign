import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const component = fs.readFileSync(
  path.join(root, 'components/maia/living-constellation/LivingConstellationPanel.tsx'),
  'utf8',
);

describe('Living Field epistemic presentation law', () => {
  test('partial quiet view discloses its selection basis and rejects importance ranking', () => {
    expect(component).toContain('livingByRecency');
    expect(component).toContain('slice(0, 4)');
    expect(component).toContain('not a judgment of importance');
    expect(component).toContain('being treated as more important');
  });

  test('member language is foregrounded before canonical dimension metadata', () => {
    expect(component).toContain('const memberLanguage = node.excerpt?.trim()');
    expect(component).toContain('{memberLanguage}');
    expect(component).toContain('{node.label}');
  });

  test('MAIA candidate standing remains explicitly subordinate', () => {
    expect(component).toContain('MAIA noticed this — not yet yours');
    expect(component).toContain('not yet confirmed');
  });

  test('presentation explicitly refuses unsupported meaning', () => {
    expect(component).toContain('They do not claim hidden importance');
    expect(component).toContain('psychological connection');
    expect(component).toContain('complete picture of your life');
  });

  test('quiet Living Field does not visually mark the first presence as important', () => {
    expect(component).not.toContain('active={index === 0}');
  });
});
