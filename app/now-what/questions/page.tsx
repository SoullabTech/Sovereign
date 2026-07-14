'use client';

/**
 * Now What? — Questions you're living. The ones you named, kept warm.
 * (Completion slice, authorized 2026-07-13.)
 *
 * Ruling this page implements verbatim: "Questions may render only explicit
 * member-authored question records. No inferred or synthesized questions."
 *
 * What that means in code:
 *   - Reads ONLY threads the member kept with the question kind — their
 *     explicit gesture, through the same member-scoped field-note GET.
 *   - Original wording preserved: titles render verbatim, chronological.
 *   - No extraction, no deduplication, no ranking, no thematic grouping,
 *     no "deeper question beneath your conversations". MAIA does not mine
 *     conversations for questions in the background — ever.
 *   - Empty renders as honest absence.
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
  can_be_shown_to_practitioner: boolean;
  created_at: string;
}

function dayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function QuestionsInner() {
  const params = useSearchParams();
  const fieldContext = params?.get('fieldContext') ?? undefined;
  const [questions, setQuestions] = useState<Thread[] | null>(null);
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
          setQuestions(threads.filter((t) => t.spiralogic_phase === 'question'));
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
        roomName="Questions you're living"
        line="The ones you named, kept warm."
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
      <NowWhatShell current="Questions you're living" fieldContext={fieldContext} />
      <div className="relative max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_35%_at_50%_0%,rgba(125,175,255,0.08),transparent_70%)]"
        />

        {/* Box 1 — orientation */}
        <div className={panel} style={{ animation: 'nwqFadeUp 0.55s ease both' }}>
          <p className="text-xs uppercase tracking-[0.35em] mb-2" style={{ color: '#ffe27a' }}>
            Questions you&apos;re living
          </p>
          <h1 className="text-slate-100 text-2xl font-extralight tracking-wide mb-2">
            The ones you named, kept warm.
          </h1>
          <p className="text-slate-400 text-sm font-light leading-relaxed">
            A question worth living doesn&apos;t need an answer yet — it needs to not
            get lost. When a session surfaces one that is still alive and you
            choose to keep it, it waits here in your exact words. MAIA does not
            dig questions out of your conversations; only your gesture puts one here.
          </p>
        </div>

        {/* Box 2 — the questions, verbatim, chronological */}
        <div className={panel} style={{ animation: 'nwqFadeUp 0.55s ease 120ms both' }}>
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-4">Still alive</h2>

          {error && <p role="alert" className="text-red-400 text-sm font-light">{error}</p>}

          {questions === null && !error && (
            <p className="text-slate-600 text-sm font-light">Opening…</p>
          )}

          {questions !== null && questions.length === 0 && (
            <p className="text-slate-400 text-sm font-light leading-relaxed">
              No questions named yet. When a session ends, the questions still
              alive are offered back to you — the ones you choose to keep are
              what live in this room. Nothing appears here without that choice.
            </p>
          )}

          {questions !== null && questions.length > 0 && (
            <ul className="space-y-5">
              {questions.map((t) => (
                <li key={t.id} className="relative border-l border-[#ffe27a]/25 pl-5 space-y-1">
                  <span
                    aria-hidden
                    className="absolute -left-[3.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-[#ffe27a]/80 shadow-[0_0_10px_rgba(255,226,122,0.55)]"
                  />
                  <p className="text-slate-100 text-sm font-light leading-relaxed">{t.title}</p>
                  <p className="text-slate-600 text-xs font-light">
                    kept {dayLabel(t.created_at)}
                    {t.can_be_shown_to_practitioner && (
                      <span className="ml-2 text-slate-500">· shared with your practitioner</span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Box 3 — THE accented action */}
        <div
          className="relative rounded-xl border p-6 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-[0_0_50px_rgba(255,226,122,0.07)]"
          style={{ borderColor: 'rgba(255,226,122,0.4)', animation: 'nwqFadeUp 0.55s ease 240ms both' }}
        >
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-3">Now</h2>
          <div className="flex flex-wrap items-center gap-5">
            <a
              href={roomHref}
              className="rounded-full border px-6 py-2.5 text-sm transition-all hover:shadow-[0_0_30px_rgba(255,226,122,0.3)]"
              style={{ color: '#ffe27a', borderColor: 'rgba(255,226,122,0.45)' }}
            >
              {questions !== null && questions.length > 0 ? 'Bring one back into the room →' : 'Enter the session room →'}
            </a>
            <p className="text-slate-500 text-xs font-light">
              A kept question is an invitation you wrote to yourself.
            </p>
          </div>
        </div>

        <RoomTrustCopy
          holds="Questions you explicitly chose to keep at the end of a session — verbatim, dated, in the order you kept them."
          doesNotHold="No questions MAIA inferred, extracted, or synthesized from your conversations. No grouping, ranking, or 'deeper question' analysis — this room does not think about you between visits."
          whoSees="You. A question is visible to your practitioner only if you explicitly shared that thread when you kept it."
          control="A question exists here only because you kept it. Keep fewer, keep none — the room simply holds what you placed."
        />

        <p className="relative text-slate-600 text-sm font-light italic pt-2">
          Nothing here rushes you.
        </p>

        <style>{`
          @keyframes nwqFadeUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: none; }
          }
        `}</style>
      </div>
    </>
  );
}

export default function NowWhatQuestionsPage() {
  return (
    <div className="min-h-screen bg-[#062a42] text-slate-200">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-slate-500 text-sm font-light">Opening…</p>
          </div>
        }
      >
        <QuestionsInner />
      </Suspense>
    </div>
  );
}
