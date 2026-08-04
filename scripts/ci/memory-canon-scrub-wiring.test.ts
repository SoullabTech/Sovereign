/**
 * Memory Canon Scrub — route wiring CI guard.
 *
 * The defect this closes (2026-08-04):
 *   scrubMemoryAmnesia() — the output-side §V enforcement point — was wired into exactly
 *   one route: app/api/oracle/conversation. That route receives ~zero live traffic. The
 *   route that actually serves members (app/api/sovereign/app/maia/list) carried only the
 *   prompt-side MEMORY_CANON_GUARD_PROMPT, which is an instruction the model can override
 *   — and did, telling an authenticated member she starts fresh each time while atoms,
 *   episodic and developmental memory were all loaded and injected.
 *
 *   A guard on the wrong route is not a guard. This test makes that state fail CI.
 *
 * Why filesystem reads rather than importing the routes:
 *   The canonical route carries @ts-nocheck and a very large dependency graph; importing
 *   it in jest would require mocking most of the app. grep on the raw file is immune to
 *   @ts-nocheck and asserts the property we actually care about — that the call is present
 *   on the path traffic takes. Same technique as scripts/ci/maia-route-guard.test.ts.
 *
 * See: docs/canon/MAIA_MEMORY_CANON_v1.0.md §V / §VI
 * See: lib/maia/prompts/__tests__/memoryCanonGuard.test.ts (guard behaviour)
 */

import * as fs from 'fs';
import * as path from 'path';

const REPO_ROOT = path.resolve(__dirname, '../..');

const CANONICAL_GUARD_MODULE = '@/lib/maia/prompts/memoryCanonGuard';

/**
 * Routes that speak to a member in MAIA's voice and must therefore enforce §V on output.
 *
 * `list` is the live surface (it emits the [MAIA] start / conversational-block markers
 * observed in production). `oracle/conversation` is the historical wire site, kept here so
 * the two can never drift apart again.
 */
const ROUTES_REQUIRING_SCRUB = [
  'app/api/sovereign/app/maia/list/route.ts',
  'app/api/oracle/conversation/route.ts',
];

function readRoute(relPath: string): string {
  const abs = path.join(REPO_ROOT, relPath);
  expect(fs.existsSync(abs)).toBe(true);
  return fs.readFileSync(abs, 'utf8');
}

describe('Memory canon scrub — wiring', () => {
  it.each(ROUTES_REQUIRING_SCRUB)('%s imports the canonical guard module', (relPath) => {
    const source = readRoute(relPath);
    expect(source).toContain(CANONICAL_GUARD_MODULE);
    expect(source).toMatch(
      new RegExp(
        `import\\s*\\{[^}]*\\bscrubMemoryAmnesia\\b[^}]*\\}\\s*from\\s*['"]${CANONICAL_GUARD_MODULE}['"]`,
      ),
    );
  });

  it.each(ROUTES_REQUIRING_SCRUB)('%s actually invokes scrubMemoryAmnesia()', (relPath) => {
    const source = readRoute(relPath);
    // An import alone proves nothing — the call site is the enforcement point.
    expect(source).toMatch(/\bscrubMemoryAmnesia\s*\(/);
  });

  it.each(ROUTES_REQUIRING_SCRUB)(
    '%s passes a hasLoadedContext signal rather than a constant',
    (relPath) => {
      const source = readRoute(relPath);
      const callIndex = source.search(/\bscrubMemoryAmnesia\s*\(/);
      const window = source.slice(callIndex, callIndex + 600);
      expect(window).toContain('hasLoadedContext');
      // hasLoadedContext must report whether a layer reached this turn. Hardcoding it
      // makes the §VI replacement lie about the system's state in one direction or
      // the other, so a literal is rejected.
      expect(window).not.toMatch(/hasLoadedContext\s*:\s*(?:true|false)\s*[,}]/);
    },
  );

  it('the live route writes the scrub result back into the shipped response', () => {
    // Computing a replacement and discarding it is the failure mode this catches:
    // the guard would appear wired, log nothing useful, and still ship the amnesia text.
    const source = readRoute('app/api/sovereign/app/maia/list/route.ts');
    expect(source).toMatch(/orchestratorResult\.text\s*=\s*_?memoryScrub/i);
  });

  it('no route defines its own amnesia blocklist', () => {
    // The 2026-05 incident was verb-synonym drift between three private copies of this
    // regex. memoryCanonGuard.ts is the single source; a local re-implementation
    // reintroduces exactly that divergence.
    for (const relPath of ROUTES_REQUIRING_SCRUB) {
      const source = readRoute(relPath);
      expect(source).not.toMatch(/FORBIDDEN_AMNESIA_PATTERNS\s*(?::\s*RegExp\[\])?\s*=/);
      expect(source).not.toMatch(/const\s+\w*[Aa]mnesia\w*Patterns\s*=/);
    }
  });

  it('both routes resolve to the same guard implementation', () => {
    // Parity requirement: the live route must not acquire a forked copy of the guard.
    const sources = ROUTES_REQUIRING_SCRUB.map(readRoute);
    const importPaths = sources.map((source) => {
      const match = source.match(
        /import\s*\{[^}]*\bscrubMemoryAmnesia\b[^}]*\}\s*from\s*['"]([^'"]+)['"]/,
      );
      return match?.[1];
    });
    expect(importPaths.every((p) => p === CANONICAL_GUARD_MODULE)).toBe(true);
  });
});
