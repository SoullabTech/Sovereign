'use client';

/**
 * Now What? — the member's own field. The developmental off-ramp.
 *
 * This is what the member's practice has been teaching them, in their own
 * words: every thread they carried, every practice they committed, every
 * offering they made. Facts only — authored notes, carried practices, lived
 * evidence. No interpretation, no synthesis, no scores. The timeline itself
 * is the teacher; recognition belongs to the member.
 *
 * Without this page the member's only source of continuity is MAIA herself —
 * which quietly creates centrality. With it, the center shifts back toward
 * the person's own life. (Constitutional grammar, ratified in dialogue
 * 2026-07-10: "The room exists to return people to their lives.")
 *
 * Query params:
 *   fieldContext — optional; scopes the timeline to one field (e.g. now-what-demo)
 */

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { NowWhatShell, NowWhatThreshold, useMemberSession } from '@/components/now-what/NowWhatShell';

interface Thread {
  id: string;
  title: string;
  authorship: string;
  member_decision: string | null;
  spiralogic_phase: string | null;
  can_be_shown_to_practitioner: boolean;
  field_context: string | null;
  created_at: string;
}

const TAG_LABELS: Record<string, string> = {
  practice: 'Practice',
  offering: 'Offering',
};

function monthKey(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function dayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function FieldInner() {
  const params = useSearchParams();
  const fieldContext = params?.get('fieldContext') ?? undefined;
  const [threads, setThreads] = useState<Thread[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Session fact only (shell rider 2): signed in before, or not.
  const session = useMemberSession();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const qs = fieldContext ? `?fieldContext=${encodeURIComponent(fieldContext)}` : '';
        const res = await apiFetch(`/api/now-what/field-note${qs}`);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || 'Could not open your field right now.');
        if (!cancelled) setThreads(json.threads ?? []);
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => { cancelled = true; };
  }, [fieldContext]);

  const roomHref = `/now-what/room${fieldContext ? `?fieldContext=${encodeURIComponent(fieldContext)}` : ''}`;

  if (session === 'out') {
    return (
      <NowWhatThreshold
        roomName="Your field"
        line="Everything you chose to keep — threads, practices, offerings — in your own words."
        fieldContext={fieldContext}
      />
    );
  }
  if (session === 'unknown') return null;

  // Group by month, newest first (threads arrive newest-first from the API).
  const groups: { month: string; items: Thread[] }[] = [];
  for (const t of threads ?? []) {
    const key = monthKey(t.created_at);
    const last = groups[groups.length - 1];
    if (last && last.month === key) last.items.push(t);
    else groups.push({ month: key, items: [t] });
  }

  // Card grammar (walk verdict #7: spacious ≠ structureless — "one container
  // per question, one accented action per page"). The atmosphere lives
  // BETWEEN the boxes; the content lives IN them. Same glass vocabulary as
  // the map's chambers, so learning one page is learning all of them.
  const panel =
    'relative rounded-xl border border-slate-600/50 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6';

  return (
    <>
    <NowWhatShell current="Your field" fieldContext={fieldContext} />
    <div className="relative max-w-2xl mx-auto px-4 py-10 space-y-6">
      {/* The environment's weather — between the boxes, never inside them */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_35%_at_50%_0%,rgba(125,175,255,0.08),transparent_70%)]"
      />
      <img
        src="/holoflower.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-0 top-6 w-56 opacity-[0.05]"
      />

      {/* Box 1 — where am I: orientation */}
      <div className={panel} style={{ animation: 'nwfFadeUp 0.55s ease both' }}>
        <p className="text-xs uppercase tracking-[0.35em] mb-2" style={{ color: '#ffe27a' }}>Your field</p>
        <h1 className="text-slate-100 text-2xl font-extralight tracking-wide mb-2">
          What you have carried, in your own words.
        </h1>
        <p className="text-slate-400 text-sm font-light leading-relaxed">
          Every line here is something you authored or chose to keep — threads, practices,
          offerings. Nothing is interpreted, scored, or summarized. What it adds up to is
          yours to recognize.
        </p>
      </div>

      {/* Box 2 — what have I kept: the field itself */}
      <div className={panel} style={{ animation: 'nwfFadeUp 0.55s ease 120ms both' }}>
        <h2 className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-4">Kept</h2>

        {error && <p role="alert" className="text-red-400 text-sm font-light">{error}</p>}

        {threads === null && !error && (
          <p className="text-slate-600 text-sm font-light">Opening your field…</p>
        )}

        {threads !== null && threads.length === 0 && (
          <p className="text-slate-400 text-sm font-light leading-relaxed">
            Nothing here yet. The field fills only through your own gestures — what you
            carry from the room is what accumulates.
          </p>
        )}

        {groups.map((group) => (
          <div key={group.month} className="space-y-3 [&:not(:first-child)]:mt-6">
            <p className="text-slate-500 text-xs uppercase tracking-widest">{group.month}</p>
            <ul className="space-y-4">
              {group.items.map(t => (
                <li key={t.id} className="relative border-l border-[#ffe27a]/25 pl-5 space-y-1">
                  <span
                    aria-hidden
                    className="absolute -left-[3.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-[#ffe27a]/80 shadow-[0_0_10px_rgba(255,226,122,0.55)]"
                  />
                  <p className="text-slate-100 text-sm font-light leading-relaxed">{t.title}</p>
                  <p className="text-slate-600 text-xs font-light">
                    {dayLabel(t.created_at)}
                    {t.spiralogic_phase && TAG_LABELS[t.spiralogic_phase] && (
                      <span className="ml-2 text-[#ffe27a]/70">{TAG_LABELS[t.spiralogic_phase]}</span>
                    )}
                    {t.can_be_shown_to_practitioner && (
                      <span className="ml-2 text-slate-500">· shared with your practitioner</span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Box 3 — what do I do now: THE accented action (exactly one per page) */}
      <div
        className="relative rounded-xl border p-6 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-[0_0_50px_rgba(255,226,122,0.07)]"
        style={{ borderColor: 'rgba(255,226,122,0.4)', animation: 'nwfFadeUp 0.55s ease 240ms both' }}
      >
        <h2 className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-3">Now</h2>
        <div className="flex flex-wrap items-center gap-5">
          <a
            href={roomHref}
            className="rounded-full border px-6 py-2.5 text-sm transition-all hover:shadow-[0_0_30px_rgba(255,226,122,0.3)]"
            style={{ color: '#ffe27a', borderColor: 'rgba(255,226,122,0.45)' }}
          >
            {threads !== null && threads.length === 0 ? 'Enter the session room →' : 'Return to the room →'}
          </a>
          <p className="text-slate-500 text-xs font-light">
            The room is a threshold. This is what has come through it.
          </p>
        </div>
      </div>

      <p className="relative text-slate-600 text-sm font-light italic pt-2">
        Nothing here rushes you.
      </p>

      <style>{`
        @keyframes nwfFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
    </>
  );
}

export default function NowWhatFieldPage() {
  return (
    <div className="min-h-screen bg-[#062a42] text-slate-200">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-slate-500 text-sm font-light">Opening your field…</p>
          </div>
        }
      >
        <FieldInner />
      </Suspense>
    </div>
  );
}
