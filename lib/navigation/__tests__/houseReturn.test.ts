/**
 * The way back — RETURN guard.
 *
 * THE DEFECT THIS EXISTS TO PREVENT. `journalReachability.test.ts` proves a
 * member can REACH Journal. Nothing proved they could leave it. On trunk at
 * 00d12a350 the House registry declared `returnBehavior: 'back-to-maia'` on
 * eight destinations, and three of them — Journal, Living Field, Keeps — had no
 * return affordance anywhere in their component closure, while a fourth
 * (Anchor) had only `router.back()`. The field was typed, populated and
 * reviewed, and read by nothing. A member could enter and not get out.
 *
 * Reaching a room and leaving it are different guarantees. This test is the
 * second half.
 *
 * WHAT THIS TEST PROVES (structurally, from the real source files):
 *   - every 'back-to-maia' destination resolves to a page that exists;
 *   - somewhere in that page's import closure, or in a SEGMENT layout on its
 *     chain, some file performs a navigation to MAIA's route;
 *   - that navigation is not `router.back()`.
 *
 * WHAT IT DOES NOT PROVE: that the affordance is visible, reachable by touch,
 * inside the viewport, not covered by another element, or rendered under the
 * conditional branch the member actually meets. It is a source-shape guard, not
 * a browser walk. The member device walk remains the acceptance test.
 *
 * TWO WAYS THIS GUARD WAS VACUOUS BEFORE IT WORKED — both found by the negative
 * control below (revert a fix, the matching room must fail), neither by reading:
 *   1. accepting any file containing the literal '/maia' — which let
 *      `houseDestinations.ts` satisfy the very contract it declares;
 *   2. walking `app/layout.tsx` — an ancestor of every route, stranded ones
 *      included, whose global chrome navigates to MAIA.
 * Both are guarded against explicitly below. If this test is ever widened,
 * re-run the negative control; a return guard that cannot fail is worse than
 * none, because it certifies the trap.
 *
 * WHY `router.back()` DOES NOT COUNT. It is history-dependent: on a cold start,
 * a deep link, a restored PWA session, or a native WebView with an empty stack
 * it does nothing, and where it does fire it can leave the app. A way home that
 * depends on how the member arrived is not a way home.
 */
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { HOUSE_DESTINATIONS } from '../houseDestinations';
import { MAIA_HOME, destinationsRequiringReturn, routesRequiringReturn } from '../houseReturn';

const REPO = path.resolve(__dirname, '../../..');
const read = (rel: string) => readFileSync(path.join(REPO, rel), 'utf8');
const abs = (rel: string) => path.join(REPO, rel);

/** Comments describe history; code is what ships. */
function code(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/** The page file backing a route, or null when the route has no static page. */
function pageFor(route: string): string | null {
  const base = path.join('app', route.replace(/^\//, ''));
  for (const cand of [path.join(base, 'page.tsx'), path.join(base, 'page.ts')]) {
    if (existsSync(abs(cand))) return cand;
  }
  return null;
}

/**
 * Every layout.tsx BELOW the root, from app/<segment> down to the segment
 * holding `pageRel`.
 *
 * `app/layout.tsx` is deliberately excluded. It is an ancestor of every route
 * in the application, including the stranded ones, so it cannot distinguish a
 * room that has a way out from a room that does not — and its import closure
 * pulls in global providers and chrome, at least one of which navigates to
 * MAIA. Including it made the second version of this guard vacuous in exactly
 * the way the first was: the negative control passed with every fix reverted.
 *
 * Segment layouts are kept, because they genuinely carry the return for some
 * rooms — /astrology gets its way back from app/astrology/layout.tsx via
 * MaiaBoundaryLayout's rail, and that is a real implementation, not a
 * coincidence of being global.
 */
function ancestorLayouts(pageRel: string): string[] {
  const segs = path.dirname(pageRel).split('/');
  const found: string[] = [];
  // start at i = 2 → skip 'app/layout.tsx', keep 'app/<segment>/layout.tsx' down
  for (let i = 2; i <= segs.length; i++) {
    const candidate = path.join(...segs.slice(0, i), 'layout.tsx');
    if (existsSync(abs(candidate))) found.push(candidate);
  }
  return found;
}

/** Resolve an `@/…` import specifier to a repo-relative source file. */
function resolveAlias(spec: string): string | null {
  const rel = spec.replace(/^@\//, '');
  for (const cand of [`${rel}.tsx`, `${rel}.ts`, path.join(rel, 'index.tsx'), path.join(rel, 'index.ts')]) {
    if (existsSync(abs(cand))) return cand;
  }
  return null;
}

/** Resolve a relative import from the importing file's directory. */
function resolveRelative(fromRel: string, spec: string): string | null {
  const rel = path.normalize(path.join(path.dirname(fromRel), spec));
  for (const cand of [`${rel}.tsx`, `${rel}.ts`, path.join(rel, 'index.tsx'), path.join(rel, 'index.ts')]) {
    if (existsSync(abs(cand))) return cand;
  }
  return null;
}

/**
 * Every first-party source file reachable from `entries` by import.
 *
 * Bounded so a stray import cannot walk the whole repo and make the guard pass
 * by accident — if the closure is hitting the cap, the detector is measuring
 * the wrong thing and should fail loudly rather than quietly succeed.
 */
const CLOSURE_CAP = 400;

function importClosure(entries: string[]): string[] {
  const seen = new Set<string>();
  const queue = [...entries];
  while (queue.length > 0 && seen.size < CLOSURE_CAP) {
    const file = queue.shift()!;
    if (seen.has(file) || !existsSync(abs(file))) continue;
    seen.add(file);
    const source = read(file);
    for (const m of source.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      const spec = m[1];
      const next = spec.startsWith('@/')
        ? resolveAlias(spec)
        : spec.startsWith('.')
          ? resolveRelative(file, spec)
          : null; // node_modules — not ours
      if (next) queue.push(next);
    }
  }
  return [...seen];
}

/**
 * Files that may DECLARE MAIA's route but can never SATISFY this guard.
 *
 * The first version of this test accepted any file in the closure containing
 * the literal '/maia'. `lib/navigation/houseDestinations.ts` contains exactly
 * that — `route: '/maia'` — and is reachable from most pages, so the registry's
 * own declaration was answering the question the registry asks. The guard
 * passed with every fix reverted. A negative control caught it; nothing else
 * would have.
 *
 * The rule this encodes: a declaration is never evidence of its own
 * implementation.
 */
const NEVER_A_CARRIER = /^lib\/navigation\//;

/**
 * A file that actually TAKES the member to MAIA, as opposed to one that
 * mentions the route.
 *
 * Requires a navigation FORM, not a bare string — `<ReturnToMaia …>` rendered,
 * or a push/href/location assignment naming MAIA's route. `route: '/maia'` in a
 * config object matches none of these, which is the point.
 */
function navigatesToMaia(source: string, rel = ''): boolean {
  if (NEVER_A_CARRIER.test(rel)) return false;
  const src = code(source);
  const home = MAIA_HOME.replace(/\//g, '\\/');
  const q = `['"\`]${home}['"\`]`;
  return (
    // The shared affordance, actually rendered (not merely imported).
    /<\s*ReturnToMaia[\s/>]/.test(src) ||
    /*
     * The House itself, mounted. Its "Your Center" row IS MAIA, dispatched
     * through the registry, so a surface that mounts the House has given the
     * member a way home as surely as one that renders the link.
     *
     * Added in MLX-06 Unit 7A, and only because that unit removed the literal
     * `router.push('/maia')` the House sheet used to carry: the Continue row
     * now dispatches through `dispatchHouseDestination` so it can honour
     * platform reachability. The navigation did not go away; this detector
     * could no longer see it, and /astrology — which gets its way out from
     * MaiaBoundaryLayout mounting the House — started failing. Recognising the
     * sheet keeps the guard measuring the behaviour rather than the spelling.
     *
     * Not vacuous: exactly two files in the tree mount it, both of them shells
     * whose whole job is to provide navigation. The negative control below
     * still fails every room whose own fix is reverted.
     */
    /<\s*MaiaHouseSheet[\s/>]/.test(src) ||
    // router.push('/maia') · router.replace('/maia')
    new RegExp(`\\.(push|replace)\\s*\\(\\s*${q}`).test(src) ||
    // href="/maia" · href={'/maia'}
    new RegExp(`href\\s*=\\s*\\{?\\s*${q}`).test(src) ||
    // window.location.href = '/maia'
    new RegExp(`location\\.href\\s*=\\s*${q}`).test(src)
  );
}

/** The unreliable pattern that must never be the ONLY way out. */
function usesRouterBack(source: string): boolean {
  return /router\.back\s*\(\s*\)/.test(code(source));
}

// ── the detectors are not vacuous ────────────────────────────────────────────
describe('detector sanity', () => {
  it('flags the pre-fix Living Field page (no return anywhere)', () => {
    const preFix = [
      "import { PersonalLivingFieldDashboard } from '@/components/maia/living-field/PersonalLivingFieldDashboard'",
      'export default function LivingFieldPage() {',
      '  return <PersonalLivingFieldDashboard />;',
      '}',
    ].join('\n');
    expect(navigatesToMaia(preFix)).toBe(false);
  });

  it('does not accept a docstring as an implementation', () => {
    expect(navigatesToMaia("/* the member returns to '/maia' from here */")).toBe(false);
  });

  it('does not accept the registry DECLARING the route as an implementation', () => {
    // The exact shape that made the first version of this guard vacuous: the
    // House registry contains `route: '/maia'` and is reachable from most
    // pages, so every room "had" a return. It does not.
    expect(navigatesToMaia("{ id: 'maia', route: '/maia' }")).toBe(false);
    expect(navigatesToMaia("route: '/maia'", 'lib/navigation/houseDestinations.ts')).toBe(false);
  });

  it('does not accept merely IMPORTING the affordance without rendering it', () => {
    expect(navigatesToMaia("import { ReturnToMaia } from '@/components/navigation/ReturnToMaia';")).toBe(false);
  });

  it('recognises router.back() where it really is unreliable', () => {
    expect(usesRouterBack("onClick={() => router.back()}")).toBe(true);
    expect(usesRouterBack("onClick={() => router.push('/maia')}")).toBe(false);
  });

  it('recognises the shared affordance and a literal push alike', () => {
    expect(navigatesToMaia('<ReturnToMaia className="x" />')).toBe(true);
    expect(navigatesToMaia("router.push('/maia')")).toBe(true);
  });
});

// ── the contract is populated and points somewhere real ──────────────────────
describe('the back-to-maia contract', () => {
  it('MAIA_HOME is the registry route, not a hard-coded guess', () => {
    expect(MAIA_HOME).toBe(HOUSE_DESTINATIONS.find((d) => d.id === 'maia')!.route);
  });

  it('covers the rooms a member can be stranded in, and excludes MAIA itself', () => {
    const ids = destinationsRequiringReturn().map((d) => d.id);
    expect(ids).not.toContain('maia');
    // The rooms this guard was written for. New ones are welcome; losing one
    // of these means a returnBehavior was quietly downgraded.
    for (const id of ['journal', 'living-field', 'keeps', 'anchor', 'ideas', 'settings']) {
      expect(ids).toContain(id);
    }
  });

  it('every such destination resolves to a real page', () => {
    for (const route of routesRequiringReturn()) {
      expect({ route, page: pageFor(route) }).toEqual({ route, page: expect.any(String) });
    }
  });
});

// ── the guarantee itself ─────────────────────────────────────────────────────
describe('every room a member can enter has a way back to MAIA', () => {
  for (const d of destinationsRequiringReturn()) {
    const route = d.route!;

    it(`${d.label} (${route}) carries a return to MAIA`, () => {
      const page = pageFor(route)!;
      const files = importClosure([page, ...ancestorLayouts(page)]);
      expect(files.length).toBeLessThan(CLOSURE_CAP); // the walk stayed bounded
      const carriers = files.filter((f) => navigatesToMaia(read(f), f));
      // Named so a failure says which room stranded the member, not just "false".
      expect({ route, carriers: carriers.length > 0 }).toEqual({ route, carriers: true });
    });

    it(`${d.label} (${route}) does not rely on router.back() alone`, () => {
      const page = pageFor(route)!;
      const files = importClosure([page, ...ancestorLayouts(page)]);
      const reliable = files.filter((f) => {
        const source = read(f);
        return navigatesToMaia(source, f) && !usesRouterBack(source);
      });
      expect({ route, reliable: reliable.length > 0 }).toEqual({ route, reliable: true });
    });
  }
});

/**
 * MLX-06 Unit 6A — the blind spot named at the top of this file, closed as far
 * as a source-shape guard can close it.
 *
 * The closure walk above asks whether a way out exists ANYWHERE in a room's
 * imports. Living Field satisfied that and still stranded the member: the
 * affordance lived in the dashboard, and the page returned early three times —
 * loading, signed out, load-failed — before the dashboard ever rendered. A
 * member whose field could not be read met a dead end whose own copy said "try
 * returning" with nothing to return with.
 *
 * The rule this encodes: a page that CHOOSES between several whole-screen
 * returns must carry the way out in every one of them. A page with a single
 * return delegates to a component, and the closure walk already covers that.
 *
 * Still not proven here: visibility, touch size, occlusion. The browser walk
 * remains the acceptance test — this only makes the branch case non-silent.
 */
describe('every BRANCH a member can land on carries the way out', () => {
  /** Whole-screen `return (…)` blocks at the top level of a page component. */
  function returnBranches(source: string): string[] {
    const src = code(source);
    const out: string[] = [];
    const re = /\breturn\s*\(/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) {
      let depth = 0;
      let i = m.index + m[0].length - 1;
      for (; i < src.length; i++) {
        if (src[i] === '(') depth += 1;
        else if (src[i] === ')') {
          depth -= 1;
          if (depth === 0) break;
        }
      }
      const body = src.slice(m.index, i + 1);
      // Only whole-screen branches — a `return (` inside a .map() callback is
      // a list item, not a screen the member can land on.
      if (/min-h-screen/.test(body)) out.push(body);
    }
    return out;
  }

  it('the branch detector finds the shape it was written for', () => {
    const two = `
      if (loading) { return (<div className="min-h-screen">…</div>) }
      return (<div className="min-h-screen"><ReturnToMaia /></div>)
    `;
    expect(returnBranches(two)).toHaveLength(2);
    // A list item is not a screen.
    expect(returnBranches('items.map(i => { return (<li>{i}</li>) })')).toHaveLength(0);
  });

  for (const d of destinationsRequiringReturn()) {
    const route = d.route!;

    it(`${d.label} (${route}) leaves no branch without one`, () => {
      const page = pageFor(route)!;
      // A SEGMENT LAYOUT carries the return for every branch by construction —
      // /astrology gets its way back from app/astrology/layout.tsx, which wraps
      // whatever the page returns. Only rooms whose way out lives in the page's
      // own closure can lose it down a branch.
      const heldByLayout = ancestorLayouts(page).some((f) =>
        importClosure([f]).some((g) => navigatesToMaia(read(g), g)),
      );
      if (heldByLayout) return;

      const source = read(page);
      const branches = returnBranches(source);
      // Single-branch pages delegate; the closure walk above is their guard.
      if (branches.length < 2) return;
      const naked = branches.filter((b) => !navigatesToMaia(b, page));
      expect({ route, branchesWithoutAWayOut: naked.length }).toEqual({
        route,
        branchesWithoutAWayOut: 0,
      });
    });
  }
});
