import fs from 'node:fs';
import path from 'node:path';

const SHELL = fs.readFileSync(path.resolve(process.cwd(), 'components/maia/MaiaShell.tsx'), 'utf8');
const PAGE = fs.readFileSync(path.resolve(process.cwd(), 'app/maia/page.tsx'), 'utf8');
const ENCOUNTER = fs.readFileSync(path.resolve(process.cwd(), 'app/maia/encounter/page.tsx'), 'utf8');
const ACCESS = fs.readFileSync(path.resolve(process.cwd(), 'config/accessMatrix.ts'), 'utf8');

describe('MAIA as a Soullab destination', () => {
  it('returns from the spatial MAIA shell to canonical Soullab Home', () => {
    expect(SHELL).toContain("router.push('/home')");
    expect(SHELL).toContain('aria-label="Return to Soullab Home"');
    expect(SHELL).toContain('>\n              Home\n            </span>');
  });

  it('does not mount the old House navigation sheet as MAIA presentation authority', () => {
    expect(SHELL).not.toContain('<MaiaHouseSheet');
    expect(SHELL).not.toContain("onClick={() => setHouseOpen(true)}");
  });

  it('keeps the legacy MAIA surface compatible but sends its Home action to /home', () => {
    expect(PAGE).toContain("router.push('/home')");
    expect(PAGE).toContain('<span className="text-base">Home</span>');
    expect(PAGE).not.toContain("router.push('/house?from=maia')");
    expect(PAGE).not.toContain('Return to House');
  });

  it('bare /maia is now the compatibility threshold into Soullab', () => {
    expect(PAGE).toContain('MAIA now lives inside Soullab.');
    expect(PAGE).toContain('href="/home"');
    expect(PAGE).toContain('Go to Soullab');
  });

  it('the live MAIA runtime is exported to the explicit encounter route', () => {
    expect(PAGE).toContain('export function MaiaEncounterPage()');
    expect(PAGE).toContain('consciousnessType="maia"');
    expect(ENCOUNTER).toContain("export { MaiaEncounterPage as default } from '../page';");
  });

  it('keeps the compatibility threshold public while the encounter remains member-gated', () => {
    expect(ACCESS).toContain("{ exact: '/maia', public: true");
    expect(ACCESS).toContain("{ exact: '/maia/encounter', minTier: 'free'");
  });
});
