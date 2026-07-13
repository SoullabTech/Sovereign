'use client';

/**
 * Now What? — What may be next. Held open, not prescribed.
 * (Completion slice, authorized 2026-07-13.)
 *
 * This room creates NO new mechanism. It composes what already exists:
 *   - the practices the member chose at the end of their own sessions
 *     (member_field_note_threads tagged 'practice' — their gesture, their
 *     words), read through the same member-scoped field-note GET the field
 *     page uses;
 *   - the one door where "next" actually emerges: the session room, where
 *     the member pulls, and MAIA never pushes.
 *
 * Constitutional lines:
 *   - Possibilities are invited; nothing is prescribed. This page contains
 *     no recommendation engine and MAIA does not announce a next step here.
 *   - What renders is only what the member already chose to live. Absence
 *     renders as honest absence.
 */

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { NowWhatShell, NowWhatThreshold, useMemberSession } from '@/components/now-what/NowWhatShell';
import { RoomTrustCopy } from '@/components/now-what/RoomTrustCopy';

interface Thread {
  id: string;
  title: string;
  spiralogic_phase: string | null;
  created_at: string;
}

function dayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function NextInner() {
  const params = useSearchParams();
  const fieldContext = params?.get('fieldContext') ?? undefined;
  const [practices, setPractices] = useState<Thread[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const session = useMemberSession();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const qs = fieldContext ? `?fieldContext=${encodeURIComponent(fieldContext)}` : '';
        const res = await apiFetch(`/api/now-what/field-note${qs}`);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || 'Could not open this room right now.');
        if (!cancelled) {
          const threads: Thread[] = json.threads ?? [];
          setPractices(threads.filter((t) => t.spiralogic_phase === 'practice'));
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => { cancelled = true; };
  }, [fieldContext]);

  if (session === 'out') {
    return (
      <NowWhatThreshold
        roomName="What may be next"
        line="Held open, not prescribed."
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
      <NowWhatShell current="What may be next" fieldContext={fieldContext} />
      <div className="relative max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_35%_at_50%_0%,rgba(125,175,255,0.08),transparent_70%)]"
        />

        {/* Box 1 — orientation */}
        <div className={panel} style={{ animation: 'nwnFadeUp 0.55s ease both' }}>
          <p className="text-xs uppercase tracking-[0.35em] mb-2" style={{ color: '#ffe27a' }}>What may be next</p>
          <h1 className="text-slate-100 text-2xl font-extralight tracking-wide mb-2">
            Held open, not prescribed.
          </h1>
          <p className="text-slate-400 text-sm font-light leading-relaxed">
            No one here announces your next step — not MAIA, not the program,
            not this page. What may be next emerges when you sit with the actual
            thing, and the only version of it this room shows is the one you
            already chose: the practices you committed to live.
          </p>
        </div>

        {/* Box 2 — what the member already chose (facts, their gesture) */}
        <div className={panel} style={{ animation: 'nwnFadeUp 0.55s ease 120ms both' }}>
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-4">What you chose to live</h2>

          {error && <p role="alert" className="text-red-400 text-sm font-light">{error}</p>}

          {practices === null && !error && (
            <p className="text-slate-600 text-sm font-light">Opening…</p>
          )}

          {practices !== null && practices.length === 0 && (
            <p className="text-slate-400 text-sm font-light leading-relaxed">
              No practices yet. At the end of a session, when something is worth
              actually living, you choose it — and it appears here as you said it.
            </p>
          )}

          {practices !== null && practices.length > 0 && (
            <ul className="space-y-4">
              {practices.map((t) => (
                <li key={t.id} className="relative border-l border-[#ffe27a]/25 pl-5 space-y-1">
                  <span
                    aria-hidden
                    className="absolute -left-[3.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-[#ffe27a]/80 shadow-[0_0_10px_rgba(255,226,122,0.55)]"
                  />
                  <p className="text-slate-100 text-sm font-light leading-relaxed">{t.title}</p>
                  <p className="text-slate-600 text-xs font-light">{dayLabel(t.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Box 3 — THE accented action: where next actually emerges */}
        <div
          className="relative rounded-xl border p-6 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-[0_0_50px_rgba(255,226,122,0.07)]"
          style={{ borderColor: 'rgba(255,226,122,0.4)', animation: 'nwnFadeUp 0.55s ease 240ms both' }}
        >
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-3">Now</h2>
          <div className="flex flex-wrap items-center gap-5">
            <a
              href={roomHref}
              className="rounded-full border px-6 py-2.5 text-sm transition-all hover:shadow-[0_0_30px_rgba(255,226,122,0.3)]"
              style={{ color: '#ffe27a', borderColor: 'rgba(255,226,122,0.45)' }}
            >
              Sit with what may be next →
            </a>
            <p className="text-slate-500 text-xs font-light">
              The session room is where a next real step appears — pulled by you, never pushed.
            </p>
          </div>
        </div>

        <RoomTrustCopy
          holds="The practices you chose at the end of your own sessions, in your words, and a door to the room where next steps emerge."
          doesNotHold="No recommendations, no suggested next steps, no ranking of possibilities, no compliance tracking of whether you lived a practice."
          whoSees="You. A practice is visible to your practitioner only if you explicitly shared that thread when you kept it."
          control="Practices exist only because you chose them. Nothing new is written by opening this room."
        />

        <p className="relative text-slate-600 text-sm font-light italic pt-2">
          Nothing here rushes you.
        </p>

        <style>{`
          @keyframes nwnFadeUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: none; }
          }
        `}</style>
      </div>
    </>
  );
}

export default function NowWhatNextPage() {
  return (
    <div className="min-h-screen bg-[#062a42] text-slate-200">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-slate-500 text-sm font-light">Opening…</p>
          </div>
        }
      >
        <NextInner />
      </Suspense>
    </div>
  );
}
