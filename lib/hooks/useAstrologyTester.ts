'use client';

/**
 * ASTRO-FREE-TESTERS-ONLY — whether the signed-in member may see links into
 * Free Astrology.
 *
 * The proxy 404s every /astrology room page unless members.tester is true
 * (lib/astrology/testerGate.ts). Links must follow the same rule, or a
 * non-tester is shown a door that opens onto a 404. This reads the member's own
 * flag from GET /api/members/tester.
 *
 * Fails closed: false until known, and false on any error or signed-out state.
 * One request per page load, shared by every caller.
 */
import { useEffect, useState } from 'react';

let pending: Promise<boolean> | null = null;

function loadTesterFlag(): Promise<boolean> {
  if (!pending) {
    pending = fetch('/api/members/tester', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => body?.tester === true)
      .catch(() => false);
  }
  return pending;
}

export function useAstrologyTester(): boolean {
  const [isTester, setIsTester] = useState(false);
  useEffect(() => {
    let live = true;
    loadTesterFlag().then((value) => {
      if (live) setIsTester(value);
    });
    return () => {
      live = false;
    };
  }, []);
  return isTester;
}
