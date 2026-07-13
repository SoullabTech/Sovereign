'use client';

/**
 * Now What? — Where you are. The member's place in a program, as THEY
 * declared it. (Completion slice, authorized 2026-07-13.)
 *
 * Constitutional lines, enforced by what this page reads:
 *   - Position is member-declared or absent. This page renders rows from
 *     field_program_positions (member-scoped GET) and NOTHING else — no
 *     inference, no scoring, no sequence progress, no "next".
 *   - Programs the member never entered do not appear (P8b fence): this is
 *     a mirror of their declarations, not a catalog or an offer.
 *   - Epistemic footing is shown honestly: member-confirmed positions read
 *     as current; anything else reads as last-known, not reconfirmed.
 *   - Empty renders as honest absence, never inferred placement.
 *   - The practitioner has NO read of this — here or anywhere (catalog §8).
 */

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { NowWhatShell, NowWhatThreshold, useMemberSession } from '@/components/now-what/NowWhatShell';
import { RoomTrustCopy } from '@/components/now-what/RoomTrustCopy';

interface PositionRow {
  programSlug: string;
  programTitle: string | null;
  focalPoint: string;
  statedBy: 'member_confirmed' | 'member_stated' | 'practitioner_seeded';
  footing: 'confirmed-current' | 'assumed-from-last-known';
  confirmedAt: string | null;
}

function dayLabel(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// The register each row speaks in — who said this, and does it still stand.
function footingLine(p: PositionRow): string {
  if (p.statedBy === 'practitioner_seeded') {
    return 'placed by your practitioner — not yet yours until you say so';
  }
  if (p.footing === 'confirmed-current') {
    return p.statedBy === 'member_stated'
      ? `in your own words · ${dayLabel(p.confirmedAt)}`
      : `you confirmed this · ${dayLabel(p.confirmedAt)}`;
  }
  return `last known — not reconfirmed since ${dayLabel(p.confirmedAt)}`;
}

function PositionInner() {
  const params = useSearchParams();
  const fieldContext = params?.get('fieldContext') ?? undefined;
  const [positions, setPositions] = useState<PositionRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const session = useMemberSession();

  useEffect(() => {
    if (!fieldContext) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch(
          `/api/now-what/program-position?fieldContext=${encodeURIComponent(fieldContext)}`,
        );
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || 'Could not open this room right now.');
        if (!cancelled) setPositions(json.positions ?? []);
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => { cancelled = true; };
  }, [fieldContext]);

  if (session === 'out') {
    return (
      <NowWhatThreshold
        roomName="Where you are"
        line="If you came in through a program, this shows where you stand in it — as you declared it."
        fieldContext={fieldContext}
      />
    );
  }
  if (session === 'unknown') return null;

  const roomHref = `/now-what/room${fieldContext ? `?fieldContext=${encodeURIComponent(fieldContext)}` : ''}`;
  const panel =
    'relative rounded-xl border border-slate-600/50 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6';

  return (
    <>
      <NowWhatShell current="Where you are" fieldContext={fieldContext} />
      <div className="relative max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_35%_at_50%_0%,rgba(125,175,255,0.08),transparent_70%)]"
        />

        {/* Box 1 — orientation */}
        <div className={panel} style={{ animation: 'nwpFadeUp 0.55s ease both' }}>
          <p className="text-xs uppercase tracking-[0.35em] mb-2" style={{ color: '#ffe27a' }}>Where you are</p>
          <h1 className="text-slate-100 text-2xl font-extralight tracking-wide mb-2">
            Your place, as you declared it.
          </h1>
          <p className="text-slate-400 text-sm font-light leading-relaxed">
            A program can say where its cohort is; only you can say where you are.
            This room shows what you have said — confirmed or in your own words —
            and nothing it worked out about you, because it works nothing out.
          </p>
        </div>

        {/* Box 2 — the declarations themselves */}
        <div className={panel} style={{ animation: 'nwpFadeUp 0.55s ease 120ms both' }}>
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-4">Declared</h2>

          {!fieldContext && (
            <p className="text-slate-400 text-sm font-light leading-relaxed">
              You arrived without a field in context. This room shows your place
              inside a specific field&apos;s programs — enter through a program door,
              or open it from that field&apos;s map, and your declarations appear here.
            </p>
          )}

          {fieldContext && error && (
            <p role="alert" className="text-red-400 text-sm font-light">{error}</p>
          )}

          {fieldContext && positions === null && !error && (
            <p className="text-slate-600 text-sm font-light">Opening…</p>
          )}

          {fieldContext && positions !== null && positions.length === 0 && (
            <p className="text-slate-400 text-sm font-light leading-relaxed">
              You have not placed yourself in a program here yet. When you arrive
              through a program&apos;s door, the session room will ask where you are —
              your answer, in your words, is what appears in this room. Nothing
              appears until you say so.
            </p>
          )}

          {positions !== null && positions.length > 0 && (
            <ul className="space-y-5">
              {positions.map((p) => (
                <li key={p.programSlug} className="relative border-l border-[#ffe27a]/25 pl-5 space-y-1">
                  <span
                    aria-hidden
                    className="absolute -left-[3.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-[#ffe27a]/80 shadow-[0_0_10px_rgba(255,226,122,0.55)]"
                  />
                  <p className="text-slate-300 text-xs uppercase tracking-widest">
                    {p.programTitle ?? 'This field'}
                  </p>
                  <p className="text-slate-100 text-sm font-light leading-relaxed">
                    {p.statedBy === 'member_stated' ? `“${p.focalPoint}”` : p.focalPoint}
                  </p>
                  <p className="text-slate-500 text-xs font-light">{footingLine(p)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Box 3 — THE accented action (exactly one per page) */}
        <div
          className="relative rounded-xl border p-6 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-[0_0_50px_rgba(255,226,122,0.07)]"
          style={{ borderColor: 'rgba(255,226,122,0.4)', animation: 'nwpFadeUp 0.55s ease 240ms both' }}
        >
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-3">Now</h2>
          <div className="flex flex-wrap items-center gap-5">
            <a
              href={roomHref}
              className="rounded-full border px-6 py-2.5 text-sm transition-all hover:shadow-[0_0_30px_rgba(255,226,122,0.3)]"
              style={{ color: '#ffe27a', borderColor: 'rgba(255,226,122,0.45)' }}
            >
              Return to the room →
            </a>
            <p className="text-slate-500 text-xs font-light">
              Confirming, restating, or departing all happen there — where the work is.
            </p>
          </div>
        </div>

        <RoomTrustCopy
          holds="Where you said you stand in a program — confirmed by you, or in your own words, verbatim."
          doesNotHold="No inferred placement, no progress score, no sequence position, no record of departures — departing erases the row entirely."
          whoSees="You. Your practitioner cannot see your positions — there is no read for them, anywhere."
          control="Confirm, restate in your own words, or depart at any time from the session room. Nothing is written unless you make one of those gestures."
        />

        <p className="relative text-slate-600 text-sm font-light italic pt-2">
          Nothing here rushes you.
        </p>

        <style>{`
          @keyframes nwpFadeUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: none; }
          }
        `}</style>
      </div>
    </>
  );
}

export default function NowWhatPositionPage() {
  return (
    <div className="min-h-screen bg-[#062a42] text-slate-200">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-slate-500 text-sm font-light">Opening…</p>
          </div>
        }
      >
        <PositionInner />
      </Suspense>
    </div>
  );
}
