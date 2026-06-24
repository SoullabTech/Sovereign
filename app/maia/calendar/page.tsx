'use client';

// MAIA Coherence Engine v0 — direct entry surface (/maia/calendar).
// A coherence layer, not a productivity layer. The first question is not
// "how do we manage tasks?" but "how does MAIA help someone become present
// because the loose ends have been safely held?"
// Doctrine: docs/canon/MAIA_COHERENCE_ENGINE_v0.md

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, getValidMemberId } from '@/lib/http/apiBase';

type Classification = 'today' | 'later' | 'time_sensitive' | 'ongoing';

interface Capture {
  id: string;
  capture_text: string;
  classification: Classification;
  released_at: string | null;
  created_at: string;
}

// Light dispositions — not priorities, not statuses. The member decides.
const CLASS_OPTIONS: { value: Classification; label: string; hint: string }[] = [
  { value: 'today', label: 'Today', hint: 'Wants attention today' },
  { value: 'later', label: 'Later', hint: 'Not today — but real' },
  { value: 'time_sensitive', label: 'Time-sensitive', hint: 'Has a clock on it' },
  { value: 'ongoing', label: 'Keep an eye on', hint: 'Tend over time' },
];

// Groups are shown calmly, not ranked by urgency.
const GROUP_ORDER: Classification[] = ['today', 'time_sensitive', 'later', 'ongoing'];
const LABEL: Record<Classification, string> = {
  today: 'Today',
  time_sensitive: 'Time-sensitive',
  later: 'Later',
  ongoing: 'Keep an eye on',
};

function timeAgo(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function MaiaCalendarPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [text, setText] = useState('');
  const [classification, setClassification] = useState<Classification>('today');
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/maia/coherence/captures');
      if (!res.ok) throw new Error('load failed');
      const data = await res.json();
      setCaptures(Array.isArray(data.captures) ? data.captures : []);
    } catch {
      setError('Could not load what you’re holding. Try again in a moment.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Auth gate — no broken unauthenticated state; send to sign-in cleanly.
    const memberId = getValidMemberId();
    if (!memberId) {
      router.replace('/signin');
      return;
    }
    setReady(true);
    load();
  }, [router, load]);

  const submit = useCallback(async () => {
    const value = text.trim();
    if (!value || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch('/api/maia/coherence/captures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: value, classification }),
      });
      if (!res.ok) throw new Error('save failed');
      const data = await res.json();
      if (data.capture) setCaptures((prev) => [data.capture, ...prev]);
      setText('');
    } catch {
      setError('That didn’t save. Your words are still here — try again.');
    } finally {
      setSaving(false);
    }
  }, [text, classification, saving]);

  const release = useCallback(
    async (id: string) => {
      // Optimistic remove; restore on failure.
      const snapshot = captures;
      setCaptures((c) => c.filter((x) => x.id !== id));
      try {
        const res = await apiFetch(`/api/maia/coherence/captures?id=${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ released: true }),
        });
        if (!res.ok) throw new Error('release failed');
      } catch {
        setCaptures(snapshot);
        setError('Could not release that one. It’s still held.');
      }
    },
    [captures]
  );

  if (!ready) {
    return (
      <main className="min-h-screen bg-[#1a1a2e] text-slate-300 flex items-center justify-center p-6">
        <p className="text-sm text-slate-500">Opening…</p>
      </main>
    );
  }

  const held = captures.filter((c) => !c.released_at);
  const grouped = GROUP_ORDER.map((g) => ({
    group: g,
    items: held.filter((c) => c.classification === g),
  })).filter((g) => g.items.length > 0);

  return (
    <main className="min-h-screen bg-[#1a1a2e] text-slate-200">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-6 md:py-8">
        {/* Back to MAIA / Studio */}
        <nav className="flex items-center justify-between text-sm">
          <Link href="/maia" className="text-slate-400 transition-colors hover:text-slate-200">
            ← MAIA
          </Link>
          <Link
            href="/studio/calendar"
            className="text-slate-500 transition-colors hover:text-slate-300"
          >
            Full calendar →
          </Link>
        </nav>

        {/* Heading */}
        <header className="mb-5 mt-6">
          <h1 className="text-2xl font-semibold text-white">Today</h1>
          <p className="mt-1 text-sm text-slate-400">
            Set down what you’re carrying, so you can be here for what’s in front of you.
          </p>
        </header>

        {/* Capture */}
        <section className="rounded-2xl border border-slate-800/60 bg-[#16162a] p-4">
          <label htmlFor="capture" className="block text-sm font-medium text-amber-300/90">
            Anything missing from today?
          </label>
          <textarea
            id="capture"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit();
            }}
            rows={3}
            placeholder="A loose end, a call to make, something you don’t want to lose…"
            className="mt-2 w-full resize-none rounded-xl border border-slate-700/60 bg-[#1a1a2e] px-3 py-2.5 text-[15px] text-slate-100 placeholder:text-slate-600 focus:border-amber-500/40 focus:outline-none"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {CLASS_OPTIONS.map((opt) => {
              const active = classification === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setClassification(opt.value)}
                  title={opt.hint}
                  className={
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ' +
                    (active
                      ? 'border-amber-500/50 bg-amber-500/15 text-amber-200'
                      : 'border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-200')
                  }
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-600">Held exactly as you wrote it. No interpretation.</span>
            <button
              type="button"
              onClick={submit}
              disabled={!text.trim() || saving}
              className="rounded-lg bg-amber-500/90 px-4 py-2 text-sm font-medium text-[#1a1a2e] transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? 'Holding…' : 'Hold this'}
            </button>
          </div>
        </section>

        {error && <p className="mt-3 text-sm text-rose-300/80">{error}</p>}

        {/* Held items */}
        <section className="mt-7">
          {loading ? (
            <p className="text-sm text-slate-500">Gathering what you’re holding…</p>
          ) : held.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800/60 p-6 text-center">
              <p className="text-sm text-slate-400">Nothing held right now.</p>
              <p className="mt-1 text-xs text-slate-600">
                When something tugs at your attention, set it down here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {grouped.map(({ group, items }) => (
                <div key={group}>
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {LABEL[group]}
                    <span className="ml-2 font-normal text-slate-600">{items.length}</span>
                  </h2>
                  <ul className="space-y-2">
                    {items.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-start gap-3 rounded-xl border border-slate-800/50 bg-[#16162a] p-3"
                      >
                        <button
                          type="button"
                          onClick={() => release(c.id)}
                          title="Release — this one’s handled"
                          aria-label="Release capture"
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-600 text-[11px] leading-none text-slate-600 transition-colors hover:border-emerald-400/70 hover:bg-emerald-400/10 hover:text-emerald-300"
                        >
                          ✓
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="whitespace-pre-wrap break-words text-[15px] text-slate-200">
                            {c.capture_text}
                          </p>
                          <p className="mt-1 text-xs text-slate-600">{timeAgo(c.created_at)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-10 border-t border-slate-800/50 pt-4">
          <p className="text-xs leading-relaxed text-slate-600">
            This is a coherence surface, not a task list. Held here, a loose end stops pulling at
            you — so your attention can return to the present.
          </p>
        </footer>
      </div>
    </main>
  );
}
