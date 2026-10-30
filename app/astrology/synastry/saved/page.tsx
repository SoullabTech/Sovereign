import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function SavedSynastryHeldPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-dune-ibad-blue via-dune-navigator-purple to-dune-deep-sand px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-8 pt-8">
        <Link href="/astrology" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Free Astrology
        </Link>
        <section className="rounded-2xl border border-white/10 bg-black/25 p-8">
          <div className="flex items-center gap-3 text-violet-200">
            <ShieldCheck className="h-6 w-6" />
            <p className="text-xs font-semibold tracking-[0.2em]">RELATIONSHIP ASTROLOGY · HELD</p>
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-white">Synastry is not open in this Free release.</h1>
          <p className="mt-4 leading-7 text-white/65">
            Comparing and saving two people’s charts requires server-owned identity, clear consent from the
            people involved, account isolation and reliable withdrawal. Those controls are still under review,
            so Soullab is not presenting an incomplete or misleading experience here.
          </p>
        </section>
      </div>
    </main>
  );
}
