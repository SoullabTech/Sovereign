'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

/**
 * Anchor history — the member's own review of past Daily Anchors, and the
 * member-facing control for standing consent to surface.
 *
 * Each anchor carries a surface_preference (see lib/anchor/surfacePreference.ts).
 * The default is 'member_pulled' — private, surfaced only when the member raises
 * it. The toggle here lets the member grant standing consent for MAIA to gently
 * reference an anchor on its own ('contextual_doorway'). This is the member's
 * visible way to manage the eligibility the loader gate enforces — removing
 * ambient surfacing without a way to restore agency would leave consent state
 * unmanageable. No default nudges toward "on"; the choice is the member's.
 *
 * The third preference value ('ritual_review_opt_in') belongs to a review-ritual
 * surface that does not exist yet, so it is not exposed as a control here — only
 * the meaningful choice (private vs. may-reference) is shown. If an anchor already
 * holds an ambient-eligible value, it renders as "on".
 */

type SurfacePreference =
  | 'member_pulled'
  | 'contextual_doorway'
  | 'ritual_review_opt_in';

interface Anchor {
  id: string;
  anchor_date: string;
  prompt_shown: string;
  response: string;
  surface_preference: SurfacePreference;
}

/** Whether a preference makes the anchor eligible to surface ambiently. */
function isAmbient(p: SurfacePreference): boolean {
  return p !== 'member_pulled';
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function AnchorHistoryPage() {
  const router = useRouter();
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/api/anchor/recent?limit=30', { method: 'GET' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setAnchors(Array.isArray(data.anchors) ? data.anchors : []);
      } catch {
        setError('Could not load.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggle = useCallback(async (anchor: Anchor) => {
    if (savingId) return;
    const prev = anchor.surface_preference;
    const next: SurfacePreference = isAmbient(prev) ? 'member_pulled' : 'contextual_doorway';

    setSavingId(anchor.id);
    setRowError(null);
    // Optimistic update.
    setAnchors((list) =>
      list.map((x) => (x.id === anchor.id ? { ...x, surface_preference: next } : x)),
    );

    try {
      const res = await apiFetch(`/api/anchor/${anchor.id}/surface-preference`, {
        method: 'POST',
        body: JSON.stringify({ preference: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json().catch(() => null);
      const confirmed: SurfacePreference = data?.surface_preference ?? next;
      setAnchors((list) =>
        list.map((x) => (x.id === anchor.id ? { ...x, surface_preference: confirmed } : x)),
      );
    } catch {
      // Revert to the member's prior state; never leave the UI asserting a
      // consent state the server did not record.
      setAnchors((list) =>
        list.map((x) => (x.id === anchor.id ? { ...x, surface_preference: prev } : x)),
      );
      setRowError(anchor.id);
    } finally {
      setSavingId(null);
    }
  }, [savingId]);

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}
    >
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#f8f7f5]/80 border-b border-stone-200/40">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center gap-5">
          {/* Explicit return — deep links and refreshes have no history to go
              "back" to, so the way home is a real destination, not history. */}
          <button
            onClick={() => router.push('/maia/anchor')}
            className="p-2 -ml-2 flex items-center gap-1.5 text-stone-700 hover:text-stone-900 hover:-translate-x-0.5 transition-all"
            aria-label="Back to your anchor"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
            <span className="text-[13px]">Anchor</span>
          </button>
          <div className="h-4 w-px bg-stone-300/60" />
          <h1 className="text-sm font-medium tracking-wide text-stone-600 uppercase">
            Earlier
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        {loading ? (
          <div className="text-center text-stone-400 text-sm mt-16">…</div>
        ) : error ? (
          <div className="text-center text-stone-500 text-sm mt-16">{error}</div>
        ) : anchors.length === 0 ? (
          <div className="text-center text-stone-400 text-sm italic mt-16">nothing held yet</div>
        ) : (
          <>
            <p className="text-[13px] text-stone-500 leading-relaxed mb-12">
              These are your anchors. You choose which ones MAIA may gently bring
              forward on its own, when the moment continues the thread. The rest
              stay private — held here for you, surfaced only when you raise them.
            </p>

            <div className="space-y-12">
              {anchors.map((a) => {
                const on = isAmbient(a.surface_preference);
                const saving = savingId === a.id;
                return (
                  <div key={a.id}>
                    <p className="text-[12px] text-stone-400 mb-2 tracking-wide">
                      {formatDate(a.anchor_date)}
                    </p>
                    <p className="text-[12px] text-stone-400 mb-3 italic">
                      {a.prompt_shown}
                    </p>
                    <p className="text-[14px] text-stone-700 leading-relaxed whitespace-pre-wrap">
                      {a.response}
                    </p>

                    <div className="mt-4 flex items-center gap-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={on}
                        aria-label="Let MAIA gently reference this anchor"
                        disabled={saving}
                        onClick={() => toggle(a)}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          on ? 'bg-[#5a7a6f]' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                            on ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="text-[12px] text-stone-500">
                        {on
                          ? 'MAIA may gently reference this'
                          : 'Private — only when you bring it up'}
                      </span>
                      {rowError === a.id && (
                        <span className="text-[11px] text-stone-400">couldn’t save</span>
                      )}
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
