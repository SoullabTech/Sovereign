'use client';

/**
 * Now What? — Reflections. HOLD + EXPLAIN (ruling 2026-07-13).
 *
 * The room's honest designed-state surface. ZERO data reads, ZERO
 * interpretive calls — the explanation IS the room until the gates lift.
 *
 * The eventual shape is constitutionally fixed (Ruling 3 / Template grammar):
 *   member enters → member asks → MAIA reads authorized material →
 *   MAIA reflects with provenance → member accepts, rejects, edits, or leaves.
 * Never: system continually analyzes → system posts conclusions.
 * Do not add data reads or synthesis to this page ahead of the gates.
 */

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { NowWhatShell } from '@/components/now-what/NowWhatShell';
import { RoomTrustCopy } from '@/components/now-what/RoomTrustCopy';

function ReflectionsInner() {
  const params = useSearchParams();
  const fieldContext = params?.get('fieldContext') ?? undefined;
  const panel =
    'relative rounded-xl border border-slate-600/50 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6';

  return (
    <>
      <NowWhatShell current="Reflections" fieldContext={fieldContext} />
      <div className="relative max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_35%_at_50%_0%,rgba(196,164,110,0.08),transparent_70%)]"
        />

        <div className={panel} style={{ animation: 'nwrFadeUp 0.55s ease both' }}>
          <p className="text-xs uppercase tracking-[0.35em] mb-2" style={{ color: '#8fa0b8' }}>
            Reflections · taking shape
          </p>
          <h1 className="text-slate-100 text-2xl font-extralight tracking-wide mb-2">
            MAIA&apos;s mirror, only when you ask.
          </h1>
          <p className="text-slate-400 text-sm font-light leading-relaxed">
            This will be a room you intentionally enter — not a judgment running
            behind the scenes. You come in, you ask, MAIA reads only what you have
            authorized, and reflects it back with every source named. Then you
            accept it, reject it, edit it, or simply leave. The mirror never
            speaks first.
          </p>
        </div>

        <div className={panel} style={{ animation: 'nwrFadeUp 0.55s ease 120ms both' }}>
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-3">Why it isn&apos;t open yet</h2>
          <p className="text-slate-400 text-sm font-light leading-relaxed">
            A mirror is only trustworthy if what stands behind it is proven.
            Reflection needs memory that is consented, provenance-grounded, and
            tested under real use — and the discipline to reflect only when asked.
            That substrate is being built and verified first. Opening this door
            early would mean an automated reflection feed wearing a mirror&apos;s name,
            and that is not what this room is for.
          </p>
        </div>

        <div className={panel} style={{ animation: 'nwrFadeUp 0.55s ease 240ms both' }}>
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-3">What it will never do</h2>
          <p className="text-slate-400 text-sm font-light leading-relaxed">
            It will never analyze you continuously and post conclusions. It will
            never open with what it noticed about you. It will never hand a
            reflection to your practitioner without your separate, explicit
            consent. Entered, asked, sourced, and yours to refuse — or it
            doesn&apos;t happen.
          </p>
        </div>

        <RoomTrustCopy
          holds="Nothing yet — this page is the whole room. No member data is read to render it."
          doesNotHold="No reflections, no synthesis, no background analysis. Nothing is being concluded about you while this room takes shape."
          whoSees="This explanation is the same for everyone. There is nothing of yours here for anyone to see."
          control="When the room opens, reflection will happen only when you enter and ask — and every reflection will be yours to accept, reject, edit, or walk away from."
        />

        <p className="relative text-slate-600 text-sm font-light italic pt-2">
          Nothing here rushes you.
        </p>

        <style>{`
          @keyframes nwrFadeUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: none; }
          }
        `}</style>
      </div>
    </>
  );
}

export default function NowWhatReflectionsPage() {
  return (
    <div className="min-h-screen bg-[#1f1b16] text-slate-200">
      <Suspense fallback={null}>
        <ReflectionsInner />
      </Suspense>
    </div>
  );
}
