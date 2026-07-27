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
