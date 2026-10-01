import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const constellation = fs.readFileSync(path.join(root, 'components/maia/living-constellation/LivingConstellationPanel.tsx'), 'utf8');
const card = fs.readFileSync(path.join(root, 'components/maia/living-field/LivingFieldCard.tsx'), 'utf8');
const dashboard = fs.readFileSync(path.join(root, 'components/maia/living-field/PersonalLivingFieldDashboard.tsx'), 'utf8');
const page = fs.readFileSync(path.join(root, 'app/maia/living-field/page.tsx'), 'utf8');

describe('Living Field navigation clarity', () => {
  it('gives the three domain rooms equal desktop width and whole-card links', () => {
    expect(constellation).toContain('sm:grid-cols-3');
    expect(constellation).not.toContain('sm:grid-cols-[1fr_132px_1fr]');
    expect(constellation).toContain('aria-label={`${meta.action}. ${meta.subtitle}`}');
  });

  it('explains what each domain is for and gives it a persistent enter action', () => {
    expect(constellation).toContain('Three spaces. Three different kinds of attention.');
    expect(constellation).toContain("action: 'Enter Vision Studio'");
    expect(constellation).toContain("action: 'Enter Living Field'");
    expect(constellation).toContain("action: 'Enter Practice Field'");
  });

  it('makes dimension cards explicit, keyboard-accessible doors', () => {
    expect(card).toContain('<button');
    expect(card).toContain('Open dimension →');
    expect(card).toContain('aria-label={`Open ${field.label} dimension`}');
  });

  it('does not silently swallow a dimension-open failure', () => {
    expect(card).toContain('Couldn’t open this dimension just now. Try again.');
    expect(card).toContain('role="status"');
  });

  it('explains dimensions before asking the member to use them', () => {
    expect(dashboard).toContain('not forms you need to complete');
    expect(dashboard).toContain('Open a dimension to see what has gathered');
  });

  it('uses one House-owned return gesture for House arrivals', () => {
    expect(page).toContain('fromHouse={fromHouse}');
    expect(dashboard).toContain('{!fromHouse && (');
    expect(dashboard).toContain('<ReturnHome');
  });
});
