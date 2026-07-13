'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

/**
 * Marked Moments — the member's own review of what they chose to keep.
 * (Instrument-sized room, authorized 2026-07-13. The lived-week witness asks
 * "do people naturally return to their marks?" — this is the place to return to.)
 *
 * Constitutional lines, enforced by what this page reads and says:
 *   - Renders ONLY member-marked rows (marked_by_member = TRUE), verbatim +
 *     date. Interpretive columns are NULL by CHECK constraint; nothing here
 *     titles, groups, ranks, or interprets. Chronology is the only order.
 *   - COPY GUARD (Kelly's ruling, extended from the mark gesture): this page
 *     promises HOLDING only. No mention of patterns, themes, reflection, or
 *     what any future room might do with these words.
 *   - Removal is the member's, total, and quiet: unmark hard-deletes the row.
 *   - No practitioner surface exists for these, here or anywhere.
 *   - Deliberately excluded until lived use teaches otherwise: kinds, shelves,
 *     search, counts, sharing, any organization (spec §VIII: the first witness
 *     is return, not taxonomy).
 */

interface Moment {
  episodeId: string;
  verbatimText: string;
  createdAt: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
}

export default function MarkedMomentsPage() {
  const router = useRouter();
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [armedId, setArmedId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/api/sovereign/episodes/mark', { method: 'GET' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMoments(Array.isArray(data.moments) ? data.moments : []);
      } catch {
        setError('Could not load.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Two quiet taps to remove — the first arms, the second is the gesture.
  // Removal is total (hard delete); we never leave the UI asserting a state
  // the server did not record.
  const remove = useCallback(
    async (m: Moment) => {
      if (removingId) return;
      if (armedId !== m.episodeId) {
        setArmedId(m.episodeId);
        return;
      }
      setRemovingId(m.episodeId);
      try {
        const res = await apiFetch(
          `/api/sovereign/episodes/mark?episodeId=${encodeURIComponent(m.episodeId)}`,
          { method: 'DELETE' },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setMoments((list) => list.filter((x) => x.episodeId !== m.episodeId));
      } catch {
        // Leave the moment in place; removal either happened or it didn't.
      } finally {
        setRemovingId(null);
        setArmedId(null);
      }
    },
    [armedId, removingId],
  );

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}
    >
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#f8f7f5]/80 border-b border-stone-200/40">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center gap-5">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-stone-700 hover:text-stone-900 hover:-translate-x-0.5 transition-all"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </button>
          <div className="h-4 w-px bg-stone-300/60" />
          <h1 className="text-sm font-medium tracking-wide text-stone-600 uppercase">
            Moments
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        {loading ? (
          <div className="text-center text-stone-400 text-sm mt-16">…</div>
        ) : error ? (
          <div className="text-center text-stone-500 text-sm mt-16">{error}</div>
        ) : moments.length === 0 ? (
          <div className="text-center mt-16 space-y-3">
            <p className="text-stone-400 text-sm italic">nothing kept yet</p>
            <p className="text-stone-400 text-[13px] leading-relaxed max-w-sm mx-auto">
              In conversation, your own words carry a quiet &ldquo;Keep this
              moment.&rdquo; What you keep waits here — exactly as you said it.
            </p>
          </div>
        ) : (
          <>
            <p className="text-[13px] text-stone-500 leading-relaxed mb-3">
              Things you chose to keep — your exact words, from the moment you
              marked them. Nothing here is titled, sorted, or interpreted, and
              no one else can see this page. Removing one is complete: the words
              are gone, not archived.
            </p>
            <p className="text-[12px] text-stone-400 leading-relaxed mb-12">
              A kept moment may return in conversation with MAIA — as you said
              it, dated, yours.
            </p>

            <div className="space-y-12">
              {moments.map((m) => {
                const armed = armedId === m.episodeId;
                const removing = removingId === m.episodeId;
                return (
                  <div key={m.episodeId}>
                    <p className="text-[12px] text-stone-400 mb-2 tracking-wide">
                      {formatDate(m.createdAt)}
                    </p>
                    <p className="text-[14px] text-stone-700 leading-relaxed whitespace-pre-wrap">
                      {m.verbatimText}
                    </p>
                    <div className="mt-3">
                      <button
                        type="button"
                        disabled={removing}
                        onClick={() => remove(m)}
                        onBlur={() => setArmedId((id) => (id === m.episodeId ? null : id))}
                        className={`text-[12px] tracking-wide transition-colors disabled:opacity-50 ${
                          armed
                            ? 'text-stone-600 underline underline-offset-4'
                            : 'text-stone-400 hover:text-stone-600'
                        }`}
                      >
                        {removing ? '…' : armed ? 'remove — this is complete' : 'remove'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
