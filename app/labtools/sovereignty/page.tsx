import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

/**
 * F5-CONFORMANCE-REPAIR-01 · P5-C
 *
 * Historical status surface for the retired sovereignty experiment.
 * Lab Tools is an internal research environment, not the member account-erasure
 * authority. No read, delete, confirmation phrase, or member id is accepted here.
 */
export default function DataSovereigntyCenter() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href="/labtools"
          className="mb-10 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Lab Tools
        </Link>

        <section className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-8">
          <div className="mb-5 flex items-center gap-3 text-amber-200">
            <ShieldAlert className="h-6 w-6" />
            <span className="text-sm font-medium uppercase tracking-[0.18em]">Retired experiment</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">Legacy data-sovereignty control retired</h1>

          <div className="mt-6 space-y-4 text-base leading-7 text-white/70">
            <p>
              This Lab Tools control no longer reads, summarizes, queues, or deletes member data.
              Its legacy deletion engine and mock data-summary contract were retired under
              F5-CONFORMANCE-REPAIR-01 P5-C.
            </p>
            <p>
              Canonical account controls live in Account Settings. Account erasure remains
              fail-closed while governed content cannot yet be disposed through the constitutional
              erasure plan. This page does not activate or bypass that boundary.
            </p>
            <p>
              The record is kept here only so the old experiment is visibly retired rather than
              silently disappearing from the research environment.
            </p>
          </div>

          <div className="mt-8">
            <Link
              href="/account/settings"
              className="inline-flex rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 hover:border-white/30 hover:text-white"
            >
              Open Account Settings
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
