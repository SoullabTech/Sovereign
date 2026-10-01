/**
 * LIVING-FIELD-RUNTIME-PARAMS-01
 *
 * Next's current route runtime supplies dynamic params as a Promise.
 * A fieldKey route must unwrap that Promise before using the key.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ROUTES = [
  'app/api/maia/living-field/[fieldKey]/route.ts',
  'app/api/maia/living-field/[fieldKey]/gathering/route.ts',
  'app/api/maia/living-field/[fieldKey]/sources/route.ts',
  'app/api/maia/living-field/[fieldKey]/refine/route.ts',
  'app/api/maia/living-field/[fieldKey]/consent/route.ts',
  'app/api/maia/living-field/[fieldKey]/encounter/route.ts',
] as const;

const source = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

describe('LIVING-FIELD-RUNTIME-PARAMS-01', () => {
  it.each(ROUTES)('%s declares asynchronous fieldKey params', (rel) => {
    const text = source(rel);
    expect(text).toContain('params: Promise<{ fieldKey: string }>');
  });
  it.each(ROUTES)('%s unwraps params before reading fieldKey', (rel) => {
    const text = source(rel);
    expect(text).toContain('await params');
    expect(text).not.toMatch(/params\.fieldKey/);
    expect(text).not.toContain('const { fieldKey } = params');
  });

  it('covers every dynamic Living Field fieldKey route file', () => {
    const dir = path.join(ROOT, 'app/api/maia/living-field/[fieldKey]');
    const found = fs.readdirSync(dir, { withFileTypes: true })
      .flatMap((entry) => {
        if (entry.isFile() && entry.name === 'route.ts') return ['app/api/maia/living-field/[fieldKey]/route.ts'];
        if (!entry.isDirectory()) return [];
        const candidate = path.join(dir, entry.name, 'route.ts');
        return fs.existsSync(candidate) ? [path.relative(ROOT, candidate)] : [];
      })
      .sort();
    expect(found).toEqual([...ROUTES].sort());
  });
});
