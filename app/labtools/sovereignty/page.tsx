'use client';

import Link from 'next/link';

/**
 * W1 / SPM-F5 — retired legacy sovereignty surface.
 *
 * The former page presented fabricated data counts and a destructive control
 * backed by the retired /api/sovereignty corridor. Keeping a static retirement
 * surface avoids dead bookmarks while making the old capability non-executable
 * and non-promissory.
 */
export default function DataSovereigntyCenter() {
  return (
    <main className="min-h-screen bg-black text-stone-200">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link
          href="/maia/labtools"
          className="text-sm text-stone-400 transition-colors hover:text-stone-200"
        >
          ← Back to Lab Tools
        </Link>

        <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
            Legacy control retired
          </p>

          <h1 className="mt-3 text-2xl font-medium text-stone-100">
            Data sovereignty controls have moved
          </h1>

          <p className="mt-4 text-sm leading-6 text-stone-400">
            This legacy Lab Tools panel no longer reads account data or performs
            memory deletion. Its previous deletion workflow has been retired.
          </p>

          <p className="mt-3 text-sm leading-6 text-stone-400">
            Use the current account settings for supported account controls. If
            a data request is not supported there, contact support rather than
            relying on this retired panel.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/account/settings"
              className="rounded-lg border border-white/15 bg-white/[0.05] px-4 py-2 text-sm text-stone-200 transition-colors hover:bg-white/[0.08]"
            >
              Open Account Settings
            </Link>
            <Link
              href="/maia/labtools"
              className="rounded-lg px-4 py-2 text-sm text-stone-400 transition-colors hover:text-stone-200"
            >
              Return to Lab Tools
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
