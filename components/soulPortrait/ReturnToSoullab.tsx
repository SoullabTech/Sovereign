'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * ReturnToSoullab — a quiet, session-aware coda at the very END of a Gift Portrait.
 *
 * Gift vs. platform (Kelly 2026-06-20): a Soul Portrait is a complete gift, not an
 * acquisition channel. So this is shown ONLY to a viewer who ALREADY has a Soullab
 * account — a non-member sees nothing and the gift stays finished. For someone who
 * already lives in the house, it simply leaves the light on: one understated way back.
 *
 * Deliberately NOT a continuation funnel: no "Continue with MAIA", no journal, no
 * doorways, no account prompt. It is a LINK, not a binding — no MAIA, no memory, no
 * portrait↔member binding (that is Path B). It requires no login; it only *reads* an
 * existing session if one is present (the app's localStorage member identity).
 */
export function ReturnToSoullab() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    try {
      const direct = localStorage.getItem('memberId');
      const beta = localStorage.getItem('beta_user');
      const fromBeta = beta ? (JSON.parse(beta)?.memberId ?? JSON.parse(beta)?.id) : null;
      const id = direct ?? fromBeta;
      // Real member ids are UUIDs; the `local_*` placeholder is not a real account.
      if (id && !String(id).startsWith('local_')) setSignedIn(true);
    } catch {
      // A missing or malformed value simply means "show nothing" — the gift stays complete.
    }
  }, []);

  if (!signedIn) return null;

  return (
    <section className="bg-maia-navy-950 px-6 pb-20 pt-2 text-center">
      <p className="mx-auto max-w-md font-cormorant text-[1.02rem] italic leading-relaxed text-maia-ink-50">
        Whenever you’re ready, you’re welcome back.
      </p>
      <div className="mt-6">
        <Link
          href="/maia"
          className="inline-block rounded-full border border-maia-gold/30 bg-maia-navy-850/50 px-7 py-2.5 font-raleway text-xs uppercase tracking-[0.2em] text-maia-gold/90 transition-colors hover:bg-maia-navy-850"
        >
          Return to Soullab
        </Link>
      </div>
    </section>
  );
}

export default ReturnToSoullab;
