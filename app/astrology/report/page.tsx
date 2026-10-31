import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function AstrologyReportHeldPage() {
  return (
    <main className="min-h-screen bg-[#0A0705] px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link href="/astrology" className="inline-flex items-center gap-2 text-amber-200/60 hover:text-amber-200">
          <ArrowLeft className="h-4 w-4" />
          Back to Free Astrology
        </Link>
        <section className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-8">
          <div className="flex items-center gap-3 text-amber-200">
            <ShieldCheck className="h-6 w-6" />
            <p className="text-xs font-semibold tracking-[0.2em]">GENERATED REPORT · HELD</p>
          </div>
          <h1 className="mt-5 text-3xl font-semibold">The generated Astrology report is not available in this Free release.</h1>
          <p className="mt-4 leading-7 text-white/65">
            A generated report would send private chart facts across an AI boundary and create stored derivative material.
            That pathway remains closed until exact-turn consent, memory provenance, withdrawal and restoration controls pass review.
          </p>
        </section>
      </div>
    </main>
  );
}
