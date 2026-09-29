import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const component = fs.readFileSync(
  path.join(root, 'components/maia/living-constellation/LivingConstellationPanel.tsx'),
  'utf8',
);

describe('Living Field epistemic presentation law', () => {
  test('quiet view privileges only factual continuation and keeps the rest non-ranked', () => {
    expect(component).toContain('nodeTimestamp(livingByRecency[0]) > 0');
    expect(component).toContain("a.label.localeCompare(b.label)");
    expect(component).toContain("The first presence is offered only because it was updated most recently.");
    expect(component).toContain('The remaining presences are shown alphabetically');
  });

  test('field level shows recognition fragments rather than full provenance blocks', () => {
    expect(component).toContain('function presenceFragment');
    expect(component).toContain('firstSentence');
    expect(component).toContain('function PresenceTeaser');
    expect(component).toContain('function EnteredPresence');
    expect(component).toContain('Why this is here');
  });

  test('MAIA candidate standing remains explicitly subordinate', () => {
    expect(component).toContain('MAIA noticed this — not yet yours');
    expect(component).toContain('not yet confirmed');
  });

  test('unsupported meaning remains explicitly refused in progressive disclosure', () => {
    expect(component).toContain('They do not claim hidden importance');
    expect(component).toContain('psychological connection');
    expect(component).toContain('complete picture of your life');
  });

  test('quiet Living Field does not mark first presence important merely for being first', () => {
    expect(component).not.toContain('active={index === 0}');
    expect(component).not.toContain('importance score');
  });
});
