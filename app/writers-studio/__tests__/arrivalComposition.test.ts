/**
 * THE ARRIVAL IS A ROOM, NOT AN INVENTORY.
 *
 * Seven bands on the Home carried the identical margin and the identical
 * eyebrow, so a writer arriving was handed seven equal claims and asked to
 * weigh them before they could act. Seven things of equal weight are not a
 * hierarchy. A room that receives someone does the weighing itself.
 *
 * These obligations guard the composition, and nothing else. `arrivalFor()`
 * still decides WHAT is alive — `homeState.test.ts` owns that, and none of
 * this may reach into it. What is asserted here is only how much room the
 * answer is given, and that the room stays the writer's own.
 *
 * Where a Part B falsifier is experiential rather than structural — whether
 * the page FEELS like a threshold, whether the first viewport over-explains —
 * it is deliberately absent. A unit test that claimed to prove it would be
 * worth less than the authenticated browser witness that actually can.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { arrivalFor } from '../homeState';

const HOME = join(__dirname, '..', 'HomeView.tsx');

function source(path: string): string {
  return readFileSync(path, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

describe('B01 — the arrival composes existing intelligence, it does not decide', () => {
  it('asks arrivalFor() once and takes its answer whole', () => {
    const home = source(HOME);
    const calls = home.match(/arrivalFor\(/g) ?? [];
    expect(calls).toHaveLength(1);
    expect(home).toContain('const { kind, resume, alsoWritten, shelf, feature, imported } = arrivalFor(works, manuscripts)');
  });

  it('the three arrival states are still exactly three', () => {
    /* A fourth state invented to serve a layout would be design changing
       semantics, which is the one thing Part B may not do. */
    const empty = arrivalFor([], []);
    expect(empty.kind).toBe('begin');
    expect(Object.keys(empty).sort()).toEqual(
      ['alsoWritten', 'feature', 'imported', 'kind', 'resume', 'shelf'],
    );
  });
});

describe('B02 — the arrival fetches nothing and remembers nothing', () => {
  it('holds no fetch, no client, no storage', () => {
    const home = source(HOME);
    expect(home).not.toMatch(/\bfetch\(/);
    expect(home).not.toContain('apiFetch');
    expect(home).not.toContain('localStorage');
    expect(home).not.toContain('sessionStorage');
  });
});

describe('B03 — one beginning gesture, and it works from an empty room', () => {
  it('Begin and Import are each written once', () => {
    const home = source(HOME);
    expect(home.match(/Begin a new work/g) ?? []).toHaveLength(1);
    expect(home.match(/Import writing/g) ?? []).toHaveLength(1);
  });

  it('both arrival states reach the SAME gesture, differing only in emphasis', () => {
    /* The defect this replaced: the empty Studio's only act called
       setBeginning(true), and `beginning` had exactly one reader — inside a
       branch gated on kind !== 'begin', which the empty Studio never renders.
       The one obvious thing to do did nothing at all. */
    const home = source(HOME);
    expect(home.match(/<BeginAndImport/g) ?? []).toHaveLength(2);
    const readers = home.match(/beginning=\{beginning\}/g) ?? [];
    expect(readers).toHaveLength(2);
    expect(home).toContain('primary={false}');
  });

  it('⛔ the naming field is not an inline component', () => {
    /* An inline component is a new type on every parent render, so React
       remounts the field and the writer loses focus on each keystroke. */
    const home = source(HOME);
    const decl = home.indexOf('function BeginAndImport');
    const component = home.indexOf('export default function HomeView');
    expect(decl).toBeGreaterThan(-1);
    expect(decl).toBeLessThan(component);
  });
});

describe('B04 · B08 — what is alive is given air; what continues is not deleted', () => {
  it('there are exactly three weights, and they are ordered', () => {
    const home = source(HOME);
    for (const w of ['arrival', 'continuity', 'depth']) {
      expect(home).toContain(`${w}:`);
      expect(home).toContain(`movement('${w}')`);
    }
  });

  it('⛔ no band carries the old uniform weight', () => {
    expect(source(HOME)).not.toContain('mb-14 md:mb-20');
  });

  it('History survives, subordinated rather than removed', () => {
    const home = source(HOME);
    expect(home).toContain('<Eyebrow>History</Eyebrow>');
    const history = home.indexOf('<Eyebrow>History</Eyebrow>');
    const band = home.lastIndexOf("movement('", history);
    expect(home.slice(band, history)).toContain("movement('continuity')");
  });

  it('the shelf is depth, never the front door', () => {
    const home = source(HOME);
    const works = home.indexOf('<Eyebrow>Your works</Eyebrow>');
    const band = home.lastIndexOf("movement('", works);
    expect(home.slice(band, works)).toContain("movement('depth')");
  });
});

describe('B06 · B07 — the arrival is the writer’s room, not a remembered one', () => {
  it('the photograph dissolves into the CHOSEN ground', () => {
    const home = source(HOME);
    expect(home).toContain('--ws-ground-base');
    expect(home).not.toContain('rgba(26,21,19');
  });

  it('⛔ the arrival defines no atmosphere of its own', () => {
    /* Consuming the tokens is the whole contract. Emitting one here would be
       a second appearance system competing with the first. */
    const home = source(HOME);
    expect(home).not.toContain('atmosphereVariables');
    expect(home).not.toContain('canvasSurfaceVariables');
    expect(home).not.toMatch(/'--ws-[a-z-]+':/);
  });
});

describe('B09 · B15 — scrolling is ordinary and trustworthy', () => {
  it('⛔ no competing scroll container, no height that could hide material', () => {
    const home = source(HOME);
    expect(home).not.toMatch(/overflow-y-(auto|scroll)/);
    expect(home).not.toMatch(/overflowY:/);
    expect(home).not.toMatch(/\bmax-h-/);
    /* `min-h-screen` is the page growing to at least the viewport, which is
       the opposite of a fixed height — the lookbehind keeps this obligation
       from failing the very thing it exists to require. */
    expect(home).not.toMatch(/(?<!min-)\bh-screen\b/);
    expect(home).toContain('min-h-screen');
  });

  it('⛔ nothing repositions the viewport', () => {
    const home = source(HOME);
    expect(home).not.toContain('scrollIntoView');
    expect(home).not.toContain('window.scrollTo');
    expect(home).not.toContain('scroll-snap');
  });
});
