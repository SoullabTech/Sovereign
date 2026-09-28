import fs from 'node:fs';
import path from 'node:path';
import { HOUSE_DESTINATIONS } from '../houseDestinations';
import {
  SOULLAB_HOME,
  RETURN_LABEL,
  RETURN_ARIA_LABEL,
  destinationsRequiringReturn,
} from '../houseReturn';

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

describe('Soullab Home return contract', () => {
  it('names canonical Home, not MAIA or the legacy House route', () => {
    expect(SOULLAB_HOME).toBe('/home');
    expect(RETURN_LABEL).toBe('Home');
    expect(RETURN_ARIA_LABEL).toBe('Return to Soullab Home');
  });

  it('uses back-to-home throughout the House registry', () => {
    const source = read('lib/navigation/houseDestinations.ts');
    expect(source).not.toContain("'back-to-maia'");
    expect(HOUSE_DESTINATIONS.filter((d) => d.returnBehavior === 'back-to-home').length).toBeGreaterThan(0);
  });

  it('includes MAIA itself among rooms that return to Home', () => {
    expect(destinationsRequiringReturn().map((d) => d.id)).toContain('maia');
  });

  it('shared ReturnHome never routes through /house or /maia', () => {
    const source = read('components/navigation/ReturnHome.tsx');
    expect(source).toContain('href={SOULLAB_HOME}');
    expect(source).not.toContain("'/house'");
    expect(source).not.toContain("'/maia'");
  });
});
