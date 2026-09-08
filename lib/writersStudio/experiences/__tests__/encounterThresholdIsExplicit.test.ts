import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

/**
 * §X — the encounter threshold is a product-semantic binding, not a schema accident.
 *
 * A participation row freezes the version by trigger, so whatever writes one decides what
 * "encounter" means. If a second writer appears — an invitation flow, a roster import, a preview
 * handler — the meaning changes silently and a creator's still-shapeable version becomes history
 * because somebody opened a landing page.
 *
 * This test does not decide the threshold. It makes sure there is exactly ONE place where it is
 * decided, so the decision stays visible.
 */

const REPO = join(__dirname, '../../../..');
const SEAM = 'lib/writersStudio/experiences/index.ts';

const strip = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1 ');

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '__tests__' || entry === '.next') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (/\.tsx?$/.test(full) && !/\.test\.tsx?$/.test(full)) yield full;
  }
}

describe('the encounter threshold is decided in exactly one place', () => {
  it('only the seam writes writer_experience_participations', () => {
    const writers: string[] = [];
    for (const root of ['app', 'lib']) {
      for (const file of walk(join(REPO, root))) {
        const code = strip(readFileSync(file, 'utf8'));
        if (/(INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+writer_experience_participations/i.test(code)) {
          writers.push(relative(REPO, file));
        }
      }
    }
    expect(writers).toEqual([SEAM]);
  });

  it('the seam names what must not be treated as an encounter', () => {
    const seam = readFileSync(join(REPO, SEAM), 'utf8');
    for (const forbidden of ['invitation', 'roster', 'preview', 'landing page']) {
      expect(seam).toContain(forbidden);
    }
  });
});
