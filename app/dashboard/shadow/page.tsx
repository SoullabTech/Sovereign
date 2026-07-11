'use client';

/**
 * SHADOW — honest threshold.
 *
 * HONESTY GATE (same doctrine as /studio/comms): this surface previously
 * rendered fabricated per-member shadow "aspects" — invented integration
 * percentages and last-engaged dates — over no data source at all. The
 * shadow-work API (/api/consciousness/shadow-work) serves flow steps but
 * persists nothing. Until a real, consented practice substrate exists,
 * this page states that truthfully rather than performing a history that
 * never happened.
 *
 * Found by SYSTEM_CENSUS_2026-07-11 (audit item 4); closed pre-ratification.
 * No fabricated state. No implied tracking. Nothing here is recorded.
 */

import React from 'react';
import Link from 'next/link';

export default function ShadowThreshold() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center px-6">
      <div className="max-w-xl w-full space-y-8 py-16">
        <div className="space-y-3">
          <p className="text-xs tracking-[0.3em] uppercase text-slate-500">
            Shadow
          </p>
          <h1 className="text-2xl font-light text-slate-100">
            This room isn&apos;t open yet.
          </h1>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-slate-400">
          <p>
            Shadow work is a practice direction we hold seriously — which is
            exactly why there&apos;s nothing to show you here. A surface that
            displayed &ldquo;integration levels&rdquo; or a history of
            engagement would be inventing a story about you, and this
            platform doesn&apos;t do that.
          </p>
          <p>
            Nothing on this page is recorded, tracked, or inferred. When a
            shadow practice space opens, it will begin from your own words,
            with your consent governing what — if anything — is kept.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <Link
            href="/journal"
            className="text-sm text-amber-500/80 hover:text-amber-400 transition-colors"
          >
            The journal is open, if something is moving →
          </Link>
        </div>
      </div>
    </div>
  );
}
