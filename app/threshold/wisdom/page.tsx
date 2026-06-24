'use client';

/**
 * Personal Portal — Wisdom Field (the living canon).
 *
 * "What has moved you — kept." A member-built canon: quotes, teachings, songs,
 * passages, dreams, insights, synchronicities, the moments that strike you.
 * Canon building ONLY — no AI interpretation, no scoring, no "this matters."
 * The member keeps; MAIA holds. (Negative Rights Principle.)
 *
 * Persistence is prototype-local (lib/portal/portalStore.ts seam → sovereign atoms,
 * source_type 'spontaneous', in Track B). No counts, no streaks (Drift gate #1).
 */

import { useEffect, useMemo, useState } from 'react';
import {
  getWisdom,
  saveWisdom,
  removeWisdom,
  type WisdomItem,
  type WisdomKind,
} from '@/lib/portal/portalStore';

const KINDS: { key: WisdomKind; label: string; placeholder: string }[] = [
  { key: 'quote', label: 'Quote', placeholder: 'A line that stays with you…' },
  { key: 'passage', label: 'Passage', placeholder: 'A longer piece worth keeping…' },
  { key: 'song', label: 'Song', placeholder: 'A song, a lyric, what it opened…' },
  { key: 'teaching', label: 'Teaching', placeholder: 'Something you were taught…' },
  { key: 'insight', label: 'Insight', placeholder: 'Something you saw clearly…' },
  { key: 'dream', label: 'Dream', placeholder: 'A dream worth remembering…' },
  { key: 'synchronicity', label: 'Synchronicity', placeholder: 'A meaningful coincidence…' },
  { key: 'moment', label: 'Moment', placeholder: 'A moment that struck you…' },
];

export default function WisdomCanonPage() {
  const [items, setItems] = useState<WisdomItem[]>([]);
  const [kind, setKind] = useState<WisdomKind>('quote');
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [filter, setFilter] = useState<WisdomKind | 'all'>('all');

  useEffect(() => setItems(getWisdom()), []);

  const active = KINDS.find((k) => k.key === kind) ?? KINDS[0];
  const shown = useMemo(
    () => (filter === 'all' ? items : items.filter((i) => i.kind === filter)),
    [items, filter],
  );

  function keep() {
    if (!text.trim()) return;
    saveWisdom(kind, text, source);
    setText('');
    setSource('');
    setItems(getWisdom());
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-neutral-200">
      <div className="mx-auto w-full max-w-2xl px-5 py-12">
        <a href="/threshold" className="text-[13px] text-neutral-500 transition hover:text-neutral-300">
          ← Threshold
        </a>

        <header className="mb-8 mt-6">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Wisdom</p>
          <h1 className="mt-3 text-3xl font-light text-neutral-100">Your canon</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-neutral-400">
            What has moved you — kept. Nothing interpreted, nothing scored. Yours to wander.
          </p>
        </header>

        {/* Keep something */}
        <section className="rounded-3xl border border-neutral-800 bg-neutral-900/30 px-6 py-5">
          <div className="flex flex-wrap gap-2">
            {KINDS.map((k) => (
              <button
                key={k.key}
                onClick={() => setKind(k.key)}
                className={`rounded-full border px-3 py-1 text-[12px] transition ${
                  kind === k.key
                    ? 'border-neutral-300 bg-neutral-200 text-neutral-900'
                    : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={active.placeholder}
            className="mt-3 w-full resize-none rounded-xl border border-neutral-700 bg-neutral-950/60 px-4 py-3 text-[15px] text-neutral-100 placeholder-neutral-600 outline-none focus:border-neutral-500"
          />
          <div className="mt-2 flex items-center gap-2">
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="source (optional)"
              className="flex-1 rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-[13px] text-neutral-200 placeholder-neutral-600 outline-none focus:border-neutral-500"
            />
            <button
              disabled={!text.trim()}
              onClick={keep}
              className="rounded-full bg-neutral-100 px-5 py-2 text-[13px] font-medium text-neutral-900 transition hover:bg-white disabled:opacity-40"
            >
              Keep
            </button>
          </div>
        </section>

        {/* Wander by kind */}
        {items.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            <FilterChip label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
            {KINDS.filter((k) => items.some((i) => i.kind === k.key)).map((k) => (
              <FilterChip
                key={k.key}
                label={k.label}
                active={filter === k.key}
                onClick={() => setFilter(k.key)}
              />
            ))}
          </div>
        )}

        {/* The canon */}
        <div className="mt-6 space-y-4">
          {shown.length === 0 ? (
            <p className="py-10 text-center text-[14px] leading-relaxed text-neutral-600">
              {items.length === 0
                ? 'Nothing kept yet. The first thing that moves you begins the canon.'
                : 'Nothing of this kind yet.'}
            </p>
          ) : (
            shown.map((w) => (
              <article
                key={w.id}
                className="group rounded-2xl border border-neutral-800 bg-neutral-900/30 px-5 py-4"
              >
                <p className="whitespace-pre-wrap text-[16px] leading-relaxed text-neutral-100">
                  {w.kind === 'quote' || w.kind === 'passage' ? `“${w.text}”` : w.text}
                </p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-[12px] capitalize text-neutral-500">
                    {w.kind}
                    {w.source && <span className="text-neutral-600"> · {w.source}</span>}
                    <span className="text-neutral-700"> · {new Date(w.at).toLocaleDateString()}</span>
                  </span>
                  <button
                    onClick={() => {
                      removeWisdom(w.id);
                      setItems(getWisdom());
                    }}
                    className="shrink-0 text-[12px] text-neutral-600 opacity-0 transition group-hover:opacity-100 hover:text-neutral-400"
                  >
                    remove
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-[12px] transition ${
        active ? 'border-neutral-400 text-neutral-100' : 'border-neutral-800 text-neutral-500 hover:border-neutral-600'
      }`}
    >
      {label}
    </button>
  );
}
