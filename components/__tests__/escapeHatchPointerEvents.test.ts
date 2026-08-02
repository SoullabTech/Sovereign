/**
 * The escape hatch must not claim hit surface it does not use.
 *
 * The "Switch to text" pill is centred by a wrapper that spans the full viewport
 * width. Layout-wise that is fine. Hit-testing-wise it is not: a full-width
 * `fixed` strip at `z-below-nav` sits above anything with a lower stacking order
 * and silently absorbs clicks aimed at it.
 *
 * That is not hypothetical. On 2026-08-02 the Correction 3 feature walk halted at
 * the F4/F5 boundary because "Bring into the Lab" — the capsule review panel's
 * primary action — could not be clicked. The button rendered correctly, was
 * enabled, and sat at the right coordinates; `elementsFromPoint` at its own centre
 * returned this wrapper first and the button second. No request was ever
 * dispatched. Nothing was wrong with the feature under test.
 *
 * ⚠️ Why this is asserted against source text rather than a rendered tree: the bug
 * is a *stacking and hit-testing* property. jsdom performs no layout and no
 * hit-testing, so a render test would pass in every world, including the broken
 * one. An instrument that cannot fail on the defect is not evidence for its
 * absence. A browser-level check would be stronger still; this guards the one
 * character whose loss reintroduces the defect.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const SOURCE = readFileSync(
  join(__dirname, '..', 'OracleConversation.tsx'),
  'utf8',
);

/** The wrapper: full-width, fixed, centring, at z-below-nav. */
const WRAPPER = /className=\{`([^`]*\bfixed\b[^`]*\bleft-0\b[^`]*\bright-0\b[^`]*\bz-below-nav\b[^`]*\bjustify-center\b[^`]*)`\}/;

describe('escape hatch — hit surface', () => {
  it('is present in the source at all (guards against a silent rename)', () => {
    expect(SOURCE).toMatch(WRAPPER);
  });

  it('opts the full-width wrapper OUT of pointer events', () => {
    const classes = SOURCE.match(WRAPPER)![1];

    // The whole point: the strip must not be clickable across its width.
    expect(classes).toMatch(/\bpointer-events-none\b/);
  });

  it('keeps the pill itself clickable — opting out must not disable the control', () => {
    const wrapperIndex = SOURCE.search(WRAPPER);
    // The immediately following button is the pill this wrapper exists to centre.
    const following = SOURCE.slice(wrapperIndex, wrapperIndex + 1200);

    expect(following).toMatch(/Switch to text mode/);
    expect(following).toMatch(/\bpointer-events-auto\b/);
  });

  it('keeps the pill at a real tap target', () => {
    const wrapperIndex = SOURCE.search(WRAPPER);
    const following = SOURCE.slice(wrapperIndex, wrapperIndex + 1200);

    // 44px is the floor; a control that is opted back in still has to be hittable.
    expect(following).toMatch(/min-h-\[44px\]/);
  });
});
