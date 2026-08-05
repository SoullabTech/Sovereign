'use client';

/**
 * Now What? — Client Home. Where a person lands, and what they come back to.
 *
 * The room is where the work happens. This is the place that is theirs
 * between visits: where they are, what they are carrying, and what they have
 * chosen to share. Without it, the only source of continuity is MAIA herself,
 * which quietly makes the system the center. With it, the center stays with
 * the person.
 *
 * Three questions, in the member's own register — not the platform's:
 *
 *   Where am I?          → the doors they came through, and the current focus
 *   What am I carrying?  → their own threads, in their own words
 *   What is mine?        → shared vs private, stated per item, never inferred
 *
 * The sharing state is shown on every carried item, not summarised in a
 * settings page. A boundary a person has to go looking for is one they will
 * assume the worst about. Default is private, and the copy says so plainly.
 *
 * Deliberately absent: progress, streaks, completion, scores, "insights",
 * anything that would make returning feel like being measured.
 *
 * Existing data only — no new schema, no new endpoints.
 */

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { NowWhatShell, NowWhatThreshold, useMemberSession } from '@/components/now-what/NowWhatShell';

interface Position {
  programSlug: string;
  programTitle: string | null;
  focalPoint: string;
}

interface Thread {
  id: string;
  title: string;
  authorship: string;
  member_decision: string | null;
  can_be_shown_to_practitioner: boolean;
  created_at: string;
}

function ClientHome() {
  const params = useSearchParams();
  const fieldContext = params?.get('fieldContext') ?? undefined;
  const ctx = fieldContext ? `?fieldContext=${encodeURIComponent(fieldContext)}` : '';

  const [positions, setPositions] = useState<Position[] | null>(null);
  const [threads, setThreads] = useState<Thread[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (fieldContext) {
        try {
          const r = await apiFetch(`/api/now-what/program-position${ctx}`);
          if (r.ok && !cancelled) setPositions((await r.json()).positions ?? []);
          else if (!cancelled) setPositions([]);
        } catch { if (!cancelled) setPositions([]); }
      } else if (!cancelled) setPositions([]);

      try {
        const r = await apiFetch(`/api/now-what/field-note${ctx}`);
        if (r.ok && !cancelled) {
          const d = await r.json();
          setThreads(d.threads ?? d.notes ?? []);
        } else if (!cancelled) setThreads([]);
      } catch { if (!cancelled) setThreads([]); }
    })();
    return () => { cancelled = true; };
  }, [fieldContext, ctx]);

  const shared = threads?.filter((t) => t.can_be_shown_to_practitioner).length ?? 0;

  return (
    <div className="min-h-screen bg-[#1f1b16] text-slate-200">
      <NowWhatShell current="Home" fieldContext={fieldContext} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_35%_at_50%_0%,rgba(196,164,110,0.08),transparent_70%)]" />

      <div className="relative max-w-2xl mx-auto px-4 py-10 space-y-8">
        <header>
          <h1 className="text-slate-100 text-2xl font-extralight tracking-wide mb-2">
            Where you left off
          </h1>
          <p className="text-slate-400 text-sm font-light leading-relaxed">
            This is yours. Come back to it whenever you want — nothing here is keeping score.
          </p>
        </header>

        {/* ── Where you are ─────────────────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-3">Where you are</h2>
          {positions === null && <p className="text-slate-500 text-sm font-light">Opening…</p>}
          {positions?.length === 0 && (
            <p className="text-slate-500 text-sm font-light leading-relaxed">
              You haven&rsquo;t come in through a door yet. That&rsquo;s fine — you can just start.
            </p>
          )}
          {positions && positions.length > 0 && (
            <div className="relative rounded-xl border border-white/10 p-6 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-[0_0_50px_rgba(255,226,122,0.07)]">
              <ul className="relative border-l border-[#ffe27a]/25 pl-5 space-y-4">
                {positions.map((p) => (
                  <li key={p.programSlug} className="relative">
                    <span className="absolute -left-[23px] top-1.5 w-1.5 h-1.5 rounded-full bg-[#ffe27a]/80 shadow-[0_0_10px_rgba(255,226,122,0.55)]" />
                    <div className="text-slate-100 text-sm font-light leading-relaxed">
                      {p.programTitle ?? 'On your own'}
                    </div>
                    <div className="text-slate-400 text-sm font-light leading-relaxed">
                      {p.focalPoint}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* ── What you're carrying ──────────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-3">
            What you&rsquo;re carrying
          </h2>
          {threads === null && <p className="text-slate-500 text-sm font-light">Opening…</p>}
          {threads?.length === 0 && (
            <p className="text-slate-500 text-sm font-light leading-relaxed">
              Nothing yet. What you say in the room stays here when you want it to.
            </p>
          )}
          {threads && threads.length > 0 && (
            <ul className="space-y-3">
              {threads.map((t) => (
                <li
                  key={t.id}
                  className="rounded-xl border border-white/10 p-4 bg-gradient-to-b from-white/[0.06] to-white/[0.02]"
                >
                  <div className="text-slate-100 text-sm font-light leading-relaxed">{t.title}</div>
                  {/* Sharing state, per item. Never summarised, never inferred. */}
                  <div className="mt-2 text-xs font-light">
                    {t.can_be_shown_to_practitioner ? (
                      <span className="text-[#ffe27a]/70">you chose to share this</span>
                    ) : (
                      <span className="text-slate-500">yours only</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Continue ──────────────────────────────────────────────────── */}
        <section>
          <a
            href={`/now-what/room${ctx}`}
            className="inline-block rounded-full border border-[#ffe27a]/30 px-6 py-2.5 text-sm font-light text-slate-100 transition-all hover:shadow-[0_0_30px_rgba(255,226,122,0.3)]"
          >
            Pick this back up
          </a>
        </section>

        {/* ── The boundary, in plain language ───────────────────────────── */}
        <div className="relative rounded-xl border border-white/10 p-6 bg-gradient-to-b from-white/[0.06] to-white/[0.02] mt-4">
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-4">
            What stays yours
          </h2>
          <p className="text-slate-100 text-sm font-light leading-relaxed">
            Everything here is private by default. Your practitioner sees only what you have
            explicitly chosen to share — item by item, and you can change your mind.
          </p>
          <p className="text-slate-400 text-sm font-light leading-relaxed mt-3">
            {shared === 0
              ? 'You have not shared anything.'
              : `You have shared ${shared} ${shared === 1 ? 'thing' : 'things'}.`}
          </p>
          <p className="relative text-slate-600 text-sm font-light italic pt-4">
            They can accompany you. What you work out in here is yours.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ClientHomePage() {
  const session = useMemberSession();
  if (session === 'unknown') return <div className="min-h-screen bg-[#1f1b16]" />;
  if (session === 'out') {
    return (
      <NowWhatThreshold
        roomName="Where you left off"
        line="Your own place between conversations — what you're carrying, and what stays yours."
      />
    );
  }
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1f1b16]" />}>
      <ClientHome />
    </Suspense>
  );
}
