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
  it('the Canvas imports the shared parameter rather than inlining a literal', () => {
    /* Stronger than the regex this replaces. The Canvas now imports
       CANVAS_MANUSCRIPT_PARAM from canvasIdentity, so the two sides cannot
       drift by construction — there is one definition, not two that happen to
       agree. */
    expect(canvasSource).toMatch(
      /import\s*\{[^}]*\bCANVAS_MANUSCRIPT_PARAM\b[^}]*\}\s*from\s*'\.\.\/canvasIdentity'/,
    );
    expect(canvasSource).toContain('.get(CANVAS_MANUSCRIPT_PARAM)');
  });

  it('the Canvas reads the parameter reactively, not once at mount', () => {
    /* WS2-01, 2026-08-27. Every entry into the Canvas is a client-side
       navigation, so a mount-time read of window.location returned null and
       the room fell back to the most recent manuscript. A direct load refused
       correctly while a clicked manuscript opened the wrong text — same code,
       two paths. useSearchParams is bound to the router, not to the mount. */
    expect(canvasSource).toContain('useSearchParams');
    expect(canvasSource).not.toMatch(/useState<string \| null>\(readAsked\)/);
  });

  it('the href Home renders carries that parameter', () => {
    const href = canvasForManuscript(CANVAS_HREF, 'ms-alchemy');
    const value = new URLSearchParams(href.slice(href.indexOf('?'))).get(
      CANVAS_MANUSCRIPT_PARAM,
    );
    expect(value).toBe('ms-alchemy');
  });

  it('the Canvas never substitutes a manuscript, named or unnamed', () => {
    /* Two predecessors of this test recorded the opposite. The first pinned an
       unconditional fallback to manuscripts[0]. The second kept the fallback
       "for the case it was ever right for (nothing asked for)" — and that case
       is how the 2026-08-27 failure reached the founder: a work with no
       manuscript attached emitted a Canvas URL with no id, and the room put a
       5-page transcript on the table under that work's name.

       There is now no path through this room that opens a manuscript nobody
       named. The rule lives in canvasIdentity.ts and is imported, not
       restated, so it cannot drift from what Home builds.

       DECISIONS.md D-008 + D-010. */
    /* Comments name the old behaviour on purpose — the history is why this
       rule exists. Only executable source is pinned. */
    const code = canvasSource.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    expect(code).toContain('selectManuscript');
    expect(code).not.toMatch(/manuscripts\[0\]/);
    expect(code).not.toContain('most recent of your');
    expect(canvasSource).toContain('not on your shelf');
    expect(canvasSource).toContain('Which writing would you like on the table?');
  });

  it('Studio Home cannot render a card that opens something it did not name', () => {
    /* F-1: the live producer hole. `manuscriptIdOf(w)` is null for a work with
       no manuscript, and the old builder answered a null id with a bare Canvas
       URL — a link that looks like it opens this work and opens another. */
    const homeSource = readFileSync(join(__dirname, '..', 'HomeView.tsx'), 'utf8');
    expect(homeSource).toContain('canvasHrefFor');
    expect(homeSource).not.toMatch(/canvasForManuscript\(CANVAS_HREF, manuscriptIdOf\(w\)\)/);
    expect(homeSource).toContain('No writing attached yet');
  });

  it('the parameter name is never inlined outside the contract', () => {
    /* F-4. The 2026-08-14 defect was a hand-written parameter name drifting
       from the one the reader used. Every builder imports it now. */
    for (const file of ['canvas/page.tsx', 'canvas/MaterialsDrawer.tsx', 'HomeView.tsx']) {
      const source = readFileSync(join(__dirname, '..', file), 'utf8');
      expect(source).not.toMatch(/[`'"]&m=|\?m=\$\{/);
    }
  });
});
