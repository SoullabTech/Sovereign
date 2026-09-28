import fs from 'node:fs';
import path from 'node:path';

const SHELL = fs.readFileSync(path.resolve(process.cwd(), 'components/maia/MaiaShell.tsx'), 'utf8');
const PAGE = fs.readFileSync(path.resolve(process.cwd(), 'app/maia/page.tsx'), 'utf8');

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

  it('/maia remains the MAIA destination rather than redirecting itself to Home', () => {
    expect(PAGE).toContain("placeFromPathname('/maia')");
    expect(PAGE).toContain('consciousnessType="maia"');
  });
});
