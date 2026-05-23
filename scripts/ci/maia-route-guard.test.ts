/**
 * MAIA Route CI Guard
 *
 * Two bidirectional assertions that close the loop on getMaiaResponse() drift:
 *
 *   Assertion 1 — Callers registered:
 *     Every route.ts under app/api/ that calls getMaiaResponse() must appear
 *     in MAIA_ROUTE_REGISTRY with callsMaiaResponse: true.
 *
 *   Assertion 2 — Registered callers real:
 *     Every registry entry with callsMaiaResponse: true must point to a file
 *     that exists and contains a getMaiaResponse() call.
 *
 * Together these prevent two divergence modes:
 *   - A new route calls getMaiaResponse() without being registered (drift inward)
 *   - A registry entry claims callsMaiaResponse: true for a file that was
 *     refactored away from the call (stale registry, silent lie)
 *
 * Why a test, not a lint rule:
 *   Lint rules are per-file. This check cross-references the registry (a module)
 *   against the filesystem (route files). Only a test can import the registry
 *   and walk the filesystem in the same assertion.
 *
 * Why filesystem reads, not TypeScript imports:
 *   The canonical route (/list) has @ts-nocheck at line 1. TypeScript-based
 *   detection would be silenced by that directive. grep on the raw file is immune.
 *
 * The third assertion (authority map classification → registry presence) is
 * intentionally absent: the authority map is a markdown doc, not a typed object.
 * Parsing markdown tables in a test creates fragile maintenance debt. When a
 * typed authority map object exists, add assertion 3 here.
 *
 * See: docs/architecture/MAIA_ROUTE_AUTHORITY_MAP.md
 * See: lib/maia/maiaRuntimeContext.ts (MAIA_ROUTE_REGISTRY)
 * See: memory/project_recurrence_prevention_architecture.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { MAIA_ROUTE_REGISTRY } from '@/lib/maia/maiaRuntimeContext';

// ─── Path helpers ─────────────────────────────────────────────────────────────

const REPO_ROOT = path.resolve(__dirname, '../..');
const API_DIR = path.join(REPO_ROOT, 'app', 'api');

/**
 * Convert an absolute route.ts path to its routeId.
 * app/api/sovereign/app/maia/list/route.ts → sovereign/app/maia/list
 */
function filePathToRouteId(filePath: string): string {
  const relative = path.relative(API_DIR, filePath);
  // Normalize Windows separators, strip trailing /route.ts
  return relative.replace(/\\/g, '/').replace(/\/route\.ts$/, '');
}

/**
 * Convert a routeId to the expected absolute route.ts path.
 * sovereign/app/maia/list → /abs/path/app/api/sovereign/app/maia/list/route.ts
 */
function routeIdToFilePath(routeId: string): string {
  return path.join(REPO_ROOT, 'app', 'api', routeId, 'route.ts');
}

/** Recursively find all route.ts files under a directory. */
function findRouteFiles(dir: string): string[] {
  const results: string[] = [];
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results; // dir doesn't exist — return empty
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findRouteFiles(fullPath));
    } else if (entry.name === 'route.ts') {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Return true if the file content contains a getMaiaResponse() call.
 * Uses raw string search — immune to @ts-nocheck and import aliasing.
 * Searches for "getMaiaResponse(" (with opening paren) to distinguish
 * calls from import statements like `import { getMaiaResponse }`.
 */
function callsMaiaResponse(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.includes('getMaiaResponse(');
  } catch {
    return false;
  }
}

// ─── Collect data once, share across tests ────────────────────────────────────

const allRouteFiles = findRouteFiles(API_DIR);
const callerFiles = allRouteFiles.filter(callsMaiaResponse);
const callerRouteIds = callerFiles.map(filePathToRouteId);

const registeredCallerEntries = Object.entries(MAIA_ROUTE_REGISTRY).filter(
  ([, entry]) => entry.callsMaiaResponse,
);
const registeredCallerRouteIds = registeredCallerEntries.map(([routeId]) => routeId);

// ─── Assertion 1: Callers must be registered ─────────────────────────────────

describe('MAIA Route CI Guard — Assertion 1: callers registered', () => {
  test('getMaiaResponse() is called by at least one route (sanity check)', () => {
    // Guards against a scenario where the grep pattern breaks and returns zero
    // callers — which would make all Assertion 1 tests vacuously pass.
    expect(callerFiles.length).toBeGreaterThan(0);
  });

  if (callerRouteIds.length === 0) {
    // If callerFiles is empty despite the above test, skip the per-route checks.
    // The sanity test above will already fail.
    test.skip('no caller files found — skipping per-route checks', () => {});
  } else {
    test.each(callerRouteIds)(
      'route "%s" is in MAIA_ROUTE_REGISTRY with callsMaiaResponse: true',
      (routeId) => {
        const entry = MAIA_ROUTE_REGISTRY[routeId];

        // Conditional throw preserves guidance messages across all Jest versions
        if (!entry) {
          throw new Error(
            `Route "${routeId}" calls getMaiaResponse() but is not in MAIA_ROUTE_REGISTRY.\n` +
            `Add an entry to lib/maia/maiaRuntimeContext.ts following the registry convention:\n` +
            `  - status: from docs/architecture/MAIA_ROUTE_AUTHORITY_MAP.md\n` +
            `  - reason: one sentence — why this route qualifies\n` +
            `  - registeredAt: today's date\n` +
            `  - registeredBy: which thread\n` +
            `Do NOT add this entry to silence the warning. Classify the route first.`,
          );
        }

        if (!entry.callsMaiaResponse) {
          throw new Error(
            `Route "${routeId}" is in MAIA_ROUTE_REGISTRY but callsMaiaResponse is false or missing.\n` +
            `The route file calls getMaiaResponse() — the registry must reflect that.`,
          );
        }
      },
    );
  }
});

// ─── Assertion 2: Registered callers must actually call ───────────────────────

describe('MAIA Route CI Guard — Assertion 2: registered callers real', () => {
  test('MAIA_ROUTE_REGISTRY has at least one callsMaiaResponse: true entry (sanity check)', () => {
    expect(registeredCallerRouteIds.length).toBeGreaterThan(0);
  });

  if (registeredCallerRouteIds.length === 0) {
    test.skip('no registered callers — skipping per-route checks', () => {});
  } else {
    test.each(registeredCallerRouteIds)(
      'registry entry "%s" (callsMaiaResponse: true) — file exists and calls getMaiaResponse()',
      (routeId) => {
        const filePath = routeIdToFilePath(routeId);

        if (!fs.existsSync(filePath)) {
          throw new Error(
            `MAIA_ROUTE_REGISTRY entry "${routeId}" has callsMaiaResponse: true\n` +
            `but the expected file does not exist: ${filePath}\n` +
            `Either the route was moved/deleted (update the registry) or the routeId\n` +
            `→ file-path mapping is wrong (check filePathToRouteId / routeIdToFilePath).`,
          );
        }

        if (!callsMaiaResponse(filePath)) {
          throw new Error(
            `MAIA_ROUTE_REGISTRY entry "${routeId}" has callsMaiaResponse: true\n` +
            `but ${filePath} does not contain "getMaiaResponse(".\n` +
            `The route may have been refactored to use a different call path.\n` +
            `Update callsMaiaResponse to false in the registry, or restore the call.`,
          );
        }
      },
    );
  }
});
