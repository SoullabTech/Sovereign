import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const instrument = fs.readFileSync(
  path.join(root, 'components/maia/living-field/LivingFieldInstrument.tsx'),
  'utf8',
);
const iconFix = fs.readFileSync(path.join(root, 'app/icon-fix.css'), 'utf8');

describe('Living Field instrument interaction', () => {
  it('opts the interactive SVG back into pointer events despite the global Safari icon rule', () => {
    expect(iconFix).toMatch(/svg\s*\{\s*pointer-events:\s*none;/);

    const interactiveSvg = instrument.match(
      /<svg[\s\S]*?aria-label="Recursive Living Field"[\s\S]*?>/,
    )?.[0];

    expect(interactiveSvg).toBeDefined();
    expect(interactiveSvg).toContain('pointer-events-auto');
  });

  it('reveals labels one level at a time and leaves the focused node to the center overlay', () => {
    expect(instrument).toContain("node.parent?.data.key === focus.data.key");
    expect(instrument).not.toContain('const visibleLabel = radius > 25\n');
  });
});
