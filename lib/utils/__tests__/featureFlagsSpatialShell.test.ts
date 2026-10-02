import fs from 'node:fs';
import path from 'node:path';

const SOURCE = fs.readFileSync(
  path.resolve(process.cwd(), 'lib/utils/feature-flags.ts'),
  'utf8',
);

describe('canonical MAIA spatial shell authority', () => {
  it('forces spatialMaiaShell on after merging stored browser flags', () => {
    expect(SOURCE).toContain(
      'return { ...DEFAULT_FLAGS, ...parsed, spatialMaiaShell: true };',
    );
  });

  it('does not preserve the retired explicit-false escape hatch', () => {
    expect(SOURCE).not.toContain(
      '!parsed._spatialShellExplicit && parsed.spatialMaiaShell === false',
    );
  });
});
