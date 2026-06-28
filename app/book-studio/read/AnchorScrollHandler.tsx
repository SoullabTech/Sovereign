'use client';

import { useEffect } from 'react';

/**
 * Belt-and-suspenders for hash-anchor scrolling on the Read Flow.
 *
 * The native browser behavior of "load `/book-studio/read#chapter-7` and
 * scroll to that anchor" is fragile in this app for two compounding
 * reasons:
 *
 *   1. `app/styles/mobile-fixes.css` historically set
 *      `html { overflow: hidden }` globally, routing scroll to `body`.
 *      Browsers' native anchor-scroll targets `html`, finds it locked,
 *      and gives up — even though `body` would have scrolled fine. The
 *      sibling PR change scopes that rule to PWA standalone mode so
 *      regular browsers get default behavior back.
 *
 *   2. Next.js App Router server components stream their HTML; by the
 *      time the browser tries to honor the URL hash on first paint, the
 *      target heading may not be in the DOM yet, so the scroll is a
 *      no-op and never retried.
 *
 * This component runs after hydration. On mount it reads the current
 * URL hash and scrolls the matching element into view. On `hashchange`
 * (back/forward navigation through TOC clicks) it repeats. Two
 * `requestAnimationFrame` ticks give layout a chance to settle before
 * we measure — necessary on first mount because hydration may shift
 * the document height as client components attach.
 *
 * Scoped to the Read Flow page only — the rest of the app doesn't use
 * hash anchors and doesn't need this. Returns `null`; pure side effect.
 */
export default function AnchorScrollHandler() {
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (!hash || hash.length < 2) return;
      let id: string;
      try {
        id = decodeURIComponent(hash.slice(1));
      } catch {
        return;
      }
      const target = document.getElementById(id);
      if (!target) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          target.scrollIntoView({ behavior: 'auto', block: 'start' });
        });
      });
    };

    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, []);

  return null;
}
