/**
 * LIVING-FIELD-AUTH-CONVERGENCE-01
 *
 * The proxy strips caller-supplied identity claims before route handlers.
 * Living Field subroutes therefore must use the verified session-backed
 * identity authority, never the retired Phase-0 x-member-id probe.
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
  'app/api/maia/living-field/states/route.ts',
  'app/api/maia/living-field/spirals/route.ts',
] as const;

const source = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

describe('LIVING-FIELD-AUTH-CONVERGENCE-01', () => {
  it.each(ROUTES)('%s does not depend on the stripped x-member-id probe', (rel) => {
    const text = source(rel);
    expect(text).not.toContain('authPostureProbe');
    expect(text).not.toContain('probeAuthPosture(');
  });
  it.each(ROUTES)('%s names the verified request auth authority', (rel) => {
    const text = source(rel);
    expect(text).toContain('getMemberIdFromRequest');
  });

  it('covers the complete current legacy seam: eight route files', () => {
    const dir = path.join(ROOT, 'app/api/maia/living-field');
    const hits: string[] = [];
    const walk = (p: string) => {
      for (const entry of fs.readdirSync(p, { withFileTypes: true })) {
        const full = path.join(p, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name === 'route.ts' && source(path.relative(ROOT, full)).includes('probeAuthPosture')) {
          hits.push(path.relative(ROOT, full));
        }
      }
    };
    walk(dir);
    expect(hits).toEqual([]);
  });
});
