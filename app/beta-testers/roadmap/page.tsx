'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { ROADMAP_STATUS } from '@/lib/beta-testers/constants';
import { Loading, Empty } from '../_components/states';

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string | null;
}

export default function RoadmapPage() {
  const [items, setItems] = useState<RoadmapItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/beta-testers/roadmap');
        const data = await res.json().catch(() => ({}));
        if (!cancelled) setItems(Array.isArray(data.items) ? data.items : []);
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
        <h2 className="text-xl font-light text-zinc-100">Roadmap</h2>
        <p className="text-[15px] text-zinc-500">
          Honest status, in the language we use internally — built is not the same as live.
        </p>
      </header>

      {items === null ? (
        <Loading />
      ) : items.length === 0 ? (
        <Empty text="The roadmap is being drawn." />
      ) : (
        <div className="space-y-3">
          {items.map((it) => {
            const s = ROADMAP_STATUS[it.status] ?? { label: it.status, note: '', tone: '#8A8A93' };
            return (
              <section key={it.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-base font-normal text-zinc-100">{it.title}</h3>
                  <span
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs"
                    style={{ color: s.tone, backgroundColor: `${s.tone}1a` }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.tone }} />
                    {s.label}
                  </span>
                </div>
                {it.description && (
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{it.description}</p>
                )}
                {s.note && <p className="mt-2 text-xs text-zinc-600">{s.note}</p>}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
