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

  // Group by month, newest first (threads arrive newest-first from the API).
  const groups: { month: string; items: Thread[] }[] = [];
  for (const t of threads ?? []) {
    const key = monthKey(t.created_at);
    const last = groups[groups.length - 1];
    if (last && last.month === key) last.items.push(t);
    else groups.push({ month: key, items: [t] });
  }

  return (
    <div className="max-w-prose mx-auto px-4 py-12 space-y-10">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Your field</p>
        <h1 className="text-slate-200 text-lg font-light">
          What you have carried, in your own words.
        </h1>
        <p className="text-slate-500 text-sm font-light leading-relaxed">
          Every line here is something you authored or chose to keep — threads, practices,
          offerings. Nothing is interpreted, scored, or summarized. What it adds up to is
          yours to recognize.
        </p>
      </div>

      {error && <p role="alert" className="text-red-400 text-sm font-light">{error}</p>}

      {threads === null && !error && (
        <p className="text-slate-600 text-sm font-light">Opening your field…</p>
      )}

      {threads !== null && threads.length === 0 && (
        <div className="space-y-3">
          <p className="text-slate-400 text-sm font-light leading-relaxed">
            Nothing here yet. The field fills only through your own gestures — what you
            carry from the room is what accumulates.
          </p>
        </div>
      )}

      {groups.map(group => (
        <div key={group.month} className="space-y-3">
          <p className="text-slate-600 text-xs uppercase tracking-widest">{group.month}</p>
          <ul className="space-y-3">
            {group.items.map(t => (
              <li key={t.id} className="border-l-2 border-slate-800 pl-4 space-y-1">
                <p className="text-slate-200 text-sm font-light leading-relaxed">{t.title}</p>
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

      <div className="pt-4 border-t border-slate-800 flex items-center gap-6">
        <a
          href={roomHref}
          className="text-[#ffe27a] hover:text-[#fff2ab] text-sm underline underline-offset-4 transition-colors"
        >
          Return to the room
        </a>
        <p className="text-slate-600 text-xs font-light">
          The room is a threshold. This is what has come through it.
        </p>
      </div>
    </div>
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
