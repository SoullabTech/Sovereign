/**
 * R1 — THE CANVAS TAKES ITS IDENTITY FROM THE ROUTE, AND KEEPS IT.
 *
 * ── The defect these tests exist to fail against ───────────────────────────
 *
 * Observed in production on de0f35434, 2026-09-05, on the acceptance act
 * "open a Work and write in it":
 *
 *   Studio Home → Continue writing
 *   URL:          /writers-studio/canvas?m=0186cd37-…-816b
 *   write-state:  NEVER REQUESTED
 *   result:       WRITE shell, no section body
 *
 *   Cold reload of that same URL
 *   write-state:  200 · mode "section_aware" · version 3
 *   result:       manuscript and section workspace render
 *
 * The producer was never at fault: Home's href comes from the shared
 * `canvasForManuscript(...)`. The consumer sampled `window.location.search`
 * ONCE, in a `useState` initializer, and never looked again. On that client
 * navigation the sample was empty, so `requested` stayed null, no manuscript
 * resolved, the write-state effect returned before fetching, `chooseMount`
 * never left `loading`, and the writer got a room with no body in it.
 *
 * Requiring a reload IS the defect. So the repair may not be a retry, a
 * timer, or a second fetch — it is reading the route's own params, which are
 * committed with the navigation rather than trailing it.
 *
 * ── What must NOT be lost in repairing it ──────────────────────────────────
 *
 * The one-shot read bought a real property: a mounted draft is never swapped
 * out from under the writer. The exit guard flushes on teardown, so a silent
 * swap can carry one manuscript's words toward another's row. The repair
 * therefore latches — and the latch is tested here as hard as the adoption.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CANVAS_MANUSCRIPT_PARAM,
  adoptRouteIdentity,
  canvasForManuscript,
  requestedManuscriptIdFrom,
  resolveManuscript,
} from '../canvasIdentity';
import { CANVAS_HREF } from '../studioMap';

const canvasSource = readFileSync(join(__dirname, '..', 'canvas', 'page.tsx'), 'utf8');
/** Comments quote the defect, so assertions about behaviour read only code. */
const canvasCode = canvasSource
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*/g, '');

/** The observed fixture: the fresh smoke Work that failed the acceptance act. */
const FRESH = '0186cd37-4124-44ce-a6d3-37286bbe816b';
const OTHER = 'dca75052-2551-436f-92b9-7bbed65f86c8';

describe('R1 · the route names the manuscript', () => {
  it('reads the id Home wrote, through the shared param name', () => {
    const href = canvasForManuscript(CANVAS_HREF, FRESH);
    const params = new URLSearchParams(href.slice(href.indexOf('?')));
    expect(requestedManuscriptIdFrom(params)).toBe(FRESH);
    expect(href).toContain(`${CANVAS_MANUSCRIPT_PARAM}=${FRESH}`);
  });

  it('accepts route params that are not URLSearchParams', () => {
    // Next hands the room a ReadonlyURLSearchParams. Structural typing keeps
    // the framework out of this file; this pins that the shape is enough.
    const readonlyish = { get: (n: string) => (n === CANVAS_MANUSCRIPT_PARAM ? FRESH : null) };
    expect(requestedManuscriptIdFrom(readonlyish)).toBe(FRESH);
  });

  it('reports no identity when the route carries none — it does not invent one', () => {
    expect(requestedManuscriptIdFrom(new URLSearchParams(''))).toBeNull();
  });
});

describe('R1 · adoption — the failure that shipped', () => {
  it('THE DEFECT: an identity absent at first look is taken at the next one', () => {
    // The exact production sequence. The old one-shot read could only ever
    // produce the first column, forever; that is why the body never mounted.
    let held: string | null = adoptRouteIdentity(null, null); // first render
    expect(held).toBeNull();

    held = adoptRouteIdentity(held, FRESH); // route commits the navigation
    expect(held).toBe(FRESH);
  });

  it('the adopted identity resolves the named manuscript', () => {
    const shelf = [{ id: OTHER }, { id: FRESH }];
    const held = adoptRouteIdentity(null, FRESH);
    const resolution = resolveManuscript(held, shelf);
    expect(resolution.kind).toBe('resolved');
    expect(resolution.kind === 'resolved' && resolution.manuscript.id).toBe(FRESH);
    // Resolving is what lets the write-state request happen at all: the room
    // returns before fetching while `manuscript` is null.
    expect(resolution.kind === 'resolved' && resolution.wasRequested).toBe(true);
  });

  it('does not weaken the refusal: a named id that is not on the shelf still refuses', () => {
    const held = adoptRouteIdentity(null, 'not-a-manuscript-of-mine');
    const resolution = resolveManuscript(held, [{ id: FRESH }, { id: OTHER }]);
    expect(resolution.kind).toBe('unresolved');
  });

  it('does not introduce fallback-to-first', () => {
    // Adoption returns what the route named or what was held. Never a guess.
    expect(adoptRouteIdentity(null, null)).toBeNull();
    expect(adoptRouteIdentity(null, OTHER)).toBe(OTHER);
  });
});

describe('R1 · the latch — the property the one-shot read was buying', () => {
  it('a held identity is never swapped by a later route', () => {
    // The exit guard flushes on teardown; a silent swap can carry one
    // manuscript's words toward another's row.
    expect(adoptRouteIdentity(FRESH, OTHER)).toBe(FRESH);
  });

  it('a route that goes quiet does not clear a held identity', () => {
    expect(adoptRouteIdentity(FRESH, null)).toBe(FRESH);
  });

  it("the member's own answer in the chooser also latches", () => {
    // `onPick` sets the identity; the pin effect then writes it to the URL.
    // That round trip must not be able to re-enter and re-decide.
    const chosen = adoptRouteIdentity(null, null) ?? FRESH;
    expect(adoptRouteIdentity(chosen, OTHER)).toBe(FRESH);
  });

  it('is idempotent under repeated route reports of the same id', () => {
    let held = adoptRouteIdentity(null, FRESH);
    for (let i = 0; i < 5; i++) held = adoptRouteIdentity(held, FRESH);
    expect(held).toBe(FRESH);
  });
});

describe('R1 · the room, structurally', () => {
  it('does not seed its identity from a one-shot window.location.search read', () => {
    // The precise shape that shipped:
    //   useState<string | null>(() =>
    //     typeof window === 'undefined' ? null
    //       : requestedManuscriptId(window.location.search))
    expect(canvasCode).not.toMatch(
      /useState<string \| null>\([\s\S]{0,200}window\.location\.search/,
    );
  });

  it('reads route state instead', () => {
    expect(canvasCode).toContain('useSearchParams');
    expect(canvasCode).toContain('requestedManuscriptIdFrom');
  });

  it('latches through the shared rule rather than an inline one', () => {
    expect(canvasCode).toContain('adoptRouteIdentity');
  });

  it('does not repair the race with time', () => {
    // A reload, a retry or a delay would leave the room guessing when the URL
    // is trustworthy. Reading committed route state removes the question.
    expect(canvasCode).not.toMatch(/setTimeout\([^)]*setRequested/);
    expect(canvasCode).not.toMatch(/location\.reload/);
  });

  it('still pins the resolved manuscript into the URL from the address bar', () => {
    // The pin effect compares against the real address bar before rewriting
    // it, which is a different question from "what did the route name".
    expect(canvasCode).toContain('requestedManuscriptId(window.location.search)');
  });
});
