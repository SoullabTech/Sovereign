import { Capacitor } from '@capacitor/core';

/**
 * Full-document navigation target for the Capacitor iOS shell.
 *
 * Next's client-side router cannot change routes inside the native WebView:
 * CapacitorHttp intercepts the RSC payload fetch and the router hangs waiting
 * for RSC JSON (documented in scripts/build-ios.sh's entry-point notes; observed
 * on-device 2026-07-27 as dead taps on every House destination). The static
 * export ships each page as `<route>.html` (trailingSlash: false), and
 * Capacitor's router maps any EXTENSIONLESS path back to index.html — so a
 * working native navigation must target the `.html` file explicitly. The
 * build pipeline's per-page URL-fixup scripts restore the pretty URL after
 * load on the pages they cover.
 *
 * Returns the href to assign on native, or null on web (caller falls through
 * to router.push, which works everywhere else).
 */
export function capacitorHref(route: string): string | null {
  if (!Capacitor.isNativePlatform()) return null;
  const clean = route.split('?')[0].split('#')[0].replace(/\/+$/, '');
  if (clean === '' || clean === '/') return '/index.html';
  return `${clean}.html`;
}

/**
 * Navigate on native with SPA-first, document-load fallback.
 *
 * Why try SPA first: a document load remounts the whole app — measured on
 * device (build 2504): the live conversation surface resets to the greeting,
 * taking the Keep affordance with it. The March-era "router hangs" note
 * predates the expanded bundle, which now ships the router's static payload
 * files alongside each page — so client navigation may work. If it doesn't,
 * the watchdog falls back to the document load proven working on 2503/2504,
 * so the worst case is the previous behavior, one second later.
 *
 * Returns true if it handled navigation (native); false → caller uses the
 * normal web router directly.
 */
export function nativeNavigate(
  routerPush: (route: string) => void,
  route: string,
): boolean {
  const fallbackHref = capacitorHref(route);
  if (!fallbackHref) return false;

  const startPath = window.location.pathname;
  const clean = route.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  // Already there (e.g. House → MAIA while on /maia): navigating would either
  // no-op the SPA router and then TRIGGER the fallback reload — remounting the
  // app for nothing — or reload outright. Treat as handled, stay put.
  if (clean === startPath || `${clean}.html` === startPath) {
    return true;
  }
  try {
    routerPush(route);
  } catch {
    window.location.assign(fallbackHref);
    return true;
  }
  window.setTimeout(() => {
    // If the SPA router didn't move us, take the document-load path.
    if (window.location.pathname === startPath) {
      window.location.assign(fallbackHref);
    }
  }, 800);
  return true;
}
