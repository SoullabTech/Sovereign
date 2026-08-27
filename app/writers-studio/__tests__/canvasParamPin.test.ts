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

  it('the Canvas never substitutes a manuscript that was asked for', () => {
    /* The predecessor of this test recorded the opposite — that the Canvas
       DID fall back — as a defect held under glass. WS2-01 closed it, so the
       guard is inverted: the fallback survives only for the case it was ever
       right for (nothing asked for), and an asked-for id that is not on the
       shelf must open nothing and say so.

       DECISIONS.md D-008: identity failure may never masquerade as
       successful retrieval. */
    expect(canvasSource).toMatch(/asked \? found : \(manuscripts\[0\] \?\? null\)/);
    expect(canvasSource).toContain('not on your shelf');
  });
});
