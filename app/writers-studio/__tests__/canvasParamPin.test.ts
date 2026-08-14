/**
 * Pins the Canvas's manuscript parameter WITHOUT modifying the Canvas.
 *
 * Home and the Canvas are different rooms with different Experience
 * Contracts, and `app/writers-studio/canvas/page.tsx` has no installed
 * contract yet — so this lane must not edit it. But the two sides must not be
 * free to drift, because they already did: Home shipped `?id=` while the
 * Canvas read `?m`, and the Canvas silently fell back to the first manuscript
 * in its list. "Continue writing Elemental Alchemy" opened something else.
 *
 * So instead of importing the shared module into the Canvas, this test reads
 * the Canvas's source and asserts that what it actually parses is the same
 * string Home actually produces. If either side moves, this fails.
 *
 * When the Writer Canvas contract is installed, the Canvas should import
 * canvasIdentity directly and this source-reading guard can be deleted.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CANVAS_MANUSCRIPT_PARAM, canvasForManuscript } from '../canvasIdentity';
import { CANVAS_HREF } from '../studioMap';

const canvasSource = readFileSync(
  join(__dirname, '..', 'canvas', 'page.tsx'),
  'utf8',
);

describe('Canvas manuscript parameter — pinned across an un-editable boundary', () => {
  it('the Canvas parses exactly the parameter Home writes', () => {
    const reads = canvasSource.match(/URLSearchParams\([^)]*\)\s*\.get\(\s*'([^']+)'\s*\)/);
    expect(reads).not.toBeNull();
    expect(reads![1]).toBe(CANVAS_MANUSCRIPT_PARAM);
  });

  it('the href Home renders carries that parameter', () => {
    const href = canvasForManuscript(CANVAS_HREF, 'ms-alchemy');
    const value = new URLSearchParams(href.slice(href.indexOf('?'))).get(
      CANVAS_MANUSCRIPT_PARAM,
    );
    expect(value).toBe('ms-alchemy');
  });

  it('the Canvas still falls back — which is why a mismatch was silent', () => {
    /* Recorded, not celebrated. The fallback is correct behaviour for a
       deleted manuscript and catastrophic for a misspelled parameter, and
       nothing in the Canvas can tell those apart. That is the whole reason
       this guard exists rather than a code comment. */
    expect(canvasSource).toMatch(/manuscripts\[0\]/);
  });
});
