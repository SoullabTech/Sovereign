/**
 * P12 follow-on — a native-only control must not point at a route the native
 * build excludes.
 *
 * THE DEFECT THIS ENCODES. Settings rendered a "Voice Controller Test" button
 * behind `Capacitor.isNativePlatform()`, which navigated to
 * `/voice-controller-test`. P12 (founder ruling 2026-08-16) excludes that route
 * from the static native bundle, because its layout calls requireFounder() — a
 * server-session read — and output:'export' cannot prerender a route that reads
 * cookies. So the entry point existed on exactly the platform where the
 * destination did not, and tapping it did nothing at all. P12's commit touched
 * only scripts/capacitor-patch-routes.sh; nothing pointed it at the control.
 *
 * The general shape is what matters: an exclusion made in the BUILD layer
 * cannot see the entry points in the UI layer, so this class of orphan is
 * silent by construction. This test is the missing link between them — it reads
 * the exclusion list from the patch script itself rather than restating it, so
 * it cannot drift from the list it guards.
 *
 * NOTE ON SCOPE. This asserts reachability, never product intent. A control may
 * legitimately be removed, or the route may legitimately be restored to the
 * bundle — both satisfy this test. What it forbids is the third state: a native
 * control whose destination is absent from the native build, failing silently.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '..');
const PATCH_SCRIPT = path.join(ROOT, 'scripts', 'capacitor-patch-routes.sh');
const ACCOUNT_SETTINGS = path.join(ROOT, 'components', 'account', 'AccountSettings.tsx');

/**
 * Top-level app routes the native build drops. Read from the script's own
 * quoted "app/<name>" entries so the list is never restated here — a copy would
 * be one more thing that can silently disagree with the build.
 */
function nativeExcludedRoutes(): Set<string> {
  const src = readFileSync(PATCH_SCRIPT, 'utf8');
  const out = new Set<string>();
  for (const m of src.matchAll(/^\s*"app\/([a-z0-9-]+)"/gim)) out.add(`/${m[1]}`);
  return out;
}

/** Absolute in-app paths a component navigates to via a hard location assignment. */
function hardNavTargets(file: string): string[] {
  const src = readFileSync(file, 'utf8');
  return [...src.matchAll(/window\.location\.href\s*=\s*['"`](\/[a-z0-9\-/]*)['"`]/gi)]
    .map((m) => m[1]);
}

describe('P12 — native entry points must reach routes the native build ships', () => {
  it('reads a non-empty exclusion list from the patch script (guards the guard)', () => {
    const excluded = nativeExcludedRoutes();
    expect(excluded.size).toBeGreaterThan(0);
    // If this ever fails, the regex stopped matching the script's format and
    // every assertion below would pass vacuously.
    expect(excluded.has('/voice-controller-test')).toBe(true);
  });

  it('Settings does not hard-navigate to any natively excluded route', () => {
    const excluded = nativeExcludedRoutes();
    const offenders = hardNavTargets(ACCOUNT_SETTINGS)
      .map((t) => `/${t.split('/')[1] ?? ''}`)
      .filter((top) => excluded.has(top));
    expect(offenders).toEqual([]);
  });

  it('THE REGRESSION: no /voice-controller-test navigation survives in Settings', () => {
    const src = readFileSync(ACCOUNT_SETTINGS, 'utf8');
    // Referring to it in a comment is fine and desirable — the reason belongs
    // next to the surface. Navigating to it is what must not come back.
    expect(src).not.toMatch(/window\.location\.href\s*=\s*['"`]\/voice-controller-test/);
    expect(src).not.toMatch(/router\.push\(\s*['"`]\/voice-controller-test/);
    expect(src).not.toMatch(/href=["'`]\/voice-controller-test/);
  });

  it('the capability is still named on the native surface, not quietly deleted', () => {
    // P12 kept the PHONE_ROUTES entry so the unmet capability stays visible.
    // The same reasoning applies here: the surface should say the diagnostic is
    // unavailable, rather than vanish and imply nothing was ever intended.
    const src = readFileSync(ACCOUNT_SETTINGS, 'utf8');
    expect(src).toMatch(/Voice Controller/i);
    expect(src).toMatch(/unavailable|unmet/i);
  });
});
