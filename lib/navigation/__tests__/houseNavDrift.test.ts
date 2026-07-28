/**
 * House navigation DRIFT GUARD — the durable half of the fix.
 *
 * The House failed because three lists disagreed: the House render, the runtime
 * mobile allowlist, and the Capacitor native bundle. This guard fails the build
 * whenever a House destination is classified `native` (and marked ready) but is
 * missing from EITHER the runtime allowlist OR the Capacitor keep-list — so the
 * three can never silently drift apart again.
 *
 * It reads the real allowlist (lib/mobile/mobileAllowlist) and the real build
 * config (scripts/capacitor-patch-routes.sh), not copies, so a change to either
 * that orphans a native House route breaks this test.
 */
import { readFileSync } from 'fs';
import path from 'path';
import { HOUSE_DESTINATIONS, WEB_BRIDGE_ROUTE } from '../houseDestinations';
import { isMobileRoute } from '@/lib/mobile/mobileAllowlist';

// --- parse the Capacitor MOBILE_MODE keep-list from the shell script --------
const shell = readFileSync(
  path.resolve(__dirname, '../../../scripts/capacitor-patch-routes.sh'),
  'utf8',
);

function parseBashArray(name: string): string[] {
  const m = shell.match(new RegExp(`${name}=\\(([^)]*)\\)`));
  if (!m) return [];
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
}

const TOP_LEVEL = parseBashArray('MOBILE_TOP_LEVEL');
const MAIA_KEEP = parseBashArray('MOBILE_MAIA_KEEP');
const ACCOUNT_KEEP = parseBashArray('MOBILE_ACCOUNT_KEEP');
const LABTOOLS_KEEP = parseBashArray('MOBILE_LABTOOLS_KEEP');

/** Mirrors capacitor-patch-routes.sh MOBILE_MODE keep logic. */
function inNativeBundle(route: string): boolean {
  const segs = route.replace(/^\//, '').split('/');
  const top = segs[0];
  if (!TOP_LEVEL.includes(top)) return false;
  if (segs.length === 1) return true;
  const sub = segs[1];
  if (top === 'maia') return MAIA_KEEP.includes(sub);
  if (top === 'account') return ACCOUNT_KEEP.includes(sub);
  if (top === 'labtools') return LABTOOLS_KEEP.includes(sub);
  return true; // other top-level dirs are kept wholesale
}

const nativeReady = HOUSE_DESTINATIONS.filter(
  (d) => d.kind === 'route' && d.nativePolicy === 'native' && d.nativeReady && d.route,
);

describe('drift guard — parsing sanity', () => {
  it('parsed the keep-list arrays from the shell', () => {
    expect(TOP_LEVEL).toContain('maia');
    expect(TOP_LEVEL).toContain('journal');
    expect(ACCOUNT_KEEP).toContain('settings');
    expect(MAIA_KEEP).toEqual([]); // documents that all /maia/* subroutes are stripped
  });
});

describe('drift guard — every native-ready House route is reachable natively', () => {
  it('has at least one native-ready route to check', () => {
    expect(nativeReady.length).toBeGreaterThan(0);
  });

  it.each(nativeReady.map((d) => [d.id, d.route as string] as const))(
    '%s (%s) is in the runtime mobile allowlist',
    (_id, route) => {
      expect(isMobileRoute(route)).toBe(true);
    },
  );

  it.each(nativeReady.map((d) => [d.id, d.route as string] as const))(
    '%s (%s) is present in the Capacitor native bundle keep-list',
    (_id, route) => {
      expect(inNativeBundle(route)).toBe(true);
    },
  );
});

describe('drift guard — the web bridge itself must be reachable natively', () => {
  // If /open-web is not allowlisted, MobileRouteGuard shadows it with its
  // generic web-only screen and the ?to= target is lost — every web-policy
  // destination fails to reach its page on native.
  it('WEB_BRIDGE_ROUTE is in the runtime mobile allowlist', () => {
    expect(isMobileRoute(WEB_BRIDGE_ROUTE)).toBe(true);
  });

  it('WEB_BRIDGE_ROUTE is present in the Capacitor native bundle', () => {
    expect(inNativeBundle(WEB_BRIDGE_ROUTE)).toBe(true);
  });
});

describe('drift guard — model integrity', () => {
  it('every route destination has a route; every sheet has a sheet id', () => {
    for (const d of HOUSE_DESTINATIONS) {
      if (d.kind === 'sheet') {
        expect(d.sheet).toBeTruthy();
        expect(d.route).toBeUndefined();
      } else {
        expect(d.route).toBeTruthy();
      }
    }
  });

  it('native-policy routes declare a nativeReady boolean', () => {
    for (const d of HOUSE_DESTINATIONS) {
      if (d.kind === 'route' && d.nativePolicy === 'native') {
        expect(typeof d.nativeReady).toBe('boolean');
      }
    }
  });
});
