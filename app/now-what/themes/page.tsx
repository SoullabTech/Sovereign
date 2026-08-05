'use client';

/**
 * Now What? — Themes. HOLD + EXPLAIN (ruling 2026-07-13).
 *
 * This page is the room's honest designed-state surface: it explains what
 * the room will be and why it is deliberately not running yet. It makes
 * ZERO data reads and ZERO interpretive calls — there is nothing behind
 * this door but the explanation, and that is the point.
 *
 * The function stays held until every recorded gate is satisfied: episodic
 * memory live and tested, meaning-write rulings resolved, member-pulled
 * invocation, provenance on every reflected theme, member ability to reject
 * or remove a theme, and no practitioner access without separate explicit
 * consent. Do not add data reads to this page ahead of those gates.
 */

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { NowWhatShell } from '@/components/now-what/NowWhatShell';
import { RoomTrustCopy } from '@/components/now-what/RoomTrustCopy';

function ThemesInner() {
  const params = useSearchParams();
  const fieldContext = params?.get('fieldContext') ?? undefined;
  const panel =
    'relative rounded-xl border border-slate-600/50 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6';

  return (
    <>
      <NowWhatShell current="Themes" fieldContext={fieldContext} />
      <div className="relative max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_35%_at_50%_0%,rgba(196,164,110,0.08),transparent_70%)]"
        />

        <div className={panel} style={{ animation: 'nwtFadeUp 0.55s ease both' }}>
          <p className="text-xs uppercase tracking-[0.35em] mb-2" style={{ color: '#8fa0b8' }}>
            Themes · taking shape
          </p>
          {/* YPO-grade sweep 2026-07-14: function words lead the headline;
              the doctrine phrase stays as its closing clause. */}
          <h1 className="text-slate-100 text-2xl font-extralight tracking-wide mb-2">
            See what repeats in what you kept — patterns you pull, never pushed.
          </h1>
          <p className="text-slate-400 text-sm font-light leading-relaxed">
            This room will let you ask MAIA to look across the material you have
            chosen to keep and reflect back patterns — when you ask, over what
            you kept, with every reflection pointing at the exact things it came
            from. You will be able to reject or remove anything it offers.
          </p>
        </div>

        <div className={panel} style={{ animation: 'nwtFadeUp 0.55s ease 120ms both' }}>
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-3">Why it isn&apos;t open yet</h2>
          <p className="text-slate-400 text-sm font-light leading-relaxed">
            Because the alternative is worse than waiting. A themes room that runs
            before its foundations are proven would be MAIA interpreting your life
            in the background and presenting the result as if you asked — the exact
            thing this environment exists to refuse. The memory this room needs is
            being built and tested first. Until it holds, this door stays honest:
            there is nothing behind it, and it says so.
          </p>
        </div>

        <div className={panel} style={{ animation: 'nwtFadeUp 0.55s ease 240ms both' }}>
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-3">What it will never do</h2>
          <p className="text-slate-400 text-sm font-light leading-relaxed">
            It will not interpret your life continuously in the background. It will
            not tell you what kind of person you are, announce that &ldquo;you always&rdquo;
            do anything, or share a theme with your practitioner without your separate,
            explicit consent. Themes will be something you pull — never something
            running behind the scenes.
          </p>
        </div>

        <RoomTrustCopy
          holds="Nothing yet — this page is the whole room. No member data is read to render it."
          doesNotHold="No themes, no analysis, no background pattern detection. Nothing is being computed about you while this room takes shape."
          whoSees="This explanation is the same for everyone. There is nothing of yours here for anyone to see."
          control="When the room opens, themes will exist only when you request them, and you will be able to reject or remove every one."
        />

        <p className="relative text-slate-600 text-sm font-light italic pt-2">
          Nothing here rushes you.
        </p>

        <style>{`
          @keyframes nwtFadeUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: none; }
          }
        `}</style>
      </div>
    </>
  );
}

export default function NowWhatThemesPage() {
  return (
    <div className="min-h-screen bg-[#1f1b16] text-slate-200">
      <Suspense fallback={null}>
        <ThemesInner />
      </Suspense>
    </div>
  );
}
