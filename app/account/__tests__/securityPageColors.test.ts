import { readFileSync } from 'fs';
import { join } from 'path';
import resolveConfig from 'tailwindcss/resolveConfig';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tailwind = require('../../../tailwind.config');

/**
 * Every `maia-<group>-<shade>` colour class on the Security page must exist in the Tailwind theme. An undefined colour
 * class generates NO CSS, so the text silently falls back to the inherited default (dark on dark): the page was unreadable
 * because `maia-cream-100` (54 uses) was never defined.
 */
const PAGE = readFileSync(join(__dirname, '..', 'security', 'page.tsx'), 'utf8');
const used = Array.from(new Set(
  Array.from(PAGE.matchAll(/\b(?:text|bg|border|ring|from|to|via|divide|placeholder|fill|stroke|outline|accent|caret)-maia-([a-z]+)-(\d+)(?:\/\d+)?/g))
    .map(m => `${m[1]}-${m[2]}`),
));
const colors = (resolveConfig(tailwind) as any).theme.colors.maia as Record<string, Record<string, string>>;

describe('Security page colour tokens', () => {
  it('uses at least the tokens we expect (the scan itself works)', () => {
    expect(used).toEqual(expect.arrayContaining(['ink-100', 'navy-900']));
  });
  it.each(used)('maia-%s is defined in the Tailwind theme', (token) => {
    const [group, shade] = token.split('-');
    expect(colors?.[group]?.[shade]).toBeTruthy();
  });
  it('no longer uses the undefined cream token', () => {
    expect(PAGE).not.toContain('maia-cream');
  });
});
