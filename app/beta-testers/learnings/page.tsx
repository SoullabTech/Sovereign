'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { ELEMENT_META, type ElementKey } from '@/lib/beta-testers/constants';
import { Loading, Empty } from '../_components/states';

interface Learning {
  id: string;
  kind: 'observation' | 'authored';
  title: string | null;
  body: string;
  lens: string | null;
  at: string | null;
}

function formatDate(d: string | null): string {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function LearningsPage() {
  const [items, setItems] = useState<Learning[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/beta-testers/learnings');
        const data = await res.json().catch(() => ({}));
        if (!cancelled) setItems(Array.isArray(data.learnings) ? data.learnings : []);
      } catch {
        if (!cancelled) setItems([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-xl font-light text-zinc-100">Shared Learnings</h2>
        <p className="text-[15px] text-zinc-500">
          What the cohort is noticing, gathered and reflected back — only after we’ve read it well. Curated, never automatic.
        </p>
      </header>

      {items === null ? (
        <Loading />
      ) : items.length === 0 ? (
        <Empty text="Nothing shared back yet. Your observations are being read." />
      ) : (
        <div className="space-y-6">
          {items.map((l) => {
            const meta = l.lens ? ELEMENT_META[l.lens as ElementKey] : undefined;
            return (
              <article key={l.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-600">
                  {meta && <span style={{ color: meta.accent }}>{meta.glyph} {meta.label}</span>}
                  {meta && <span>·</span>}
                  <span>{formatDate(l.at)}</span>
                </div>
                {l.title && <h3 className="mt-1 text-lg font-normal text-zinc-100">{l.title}</h3>}
                <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-zinc-400">{l.body}</p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
