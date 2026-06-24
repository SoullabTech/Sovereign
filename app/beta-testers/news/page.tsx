'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { Loading, Empty } from '../_components/states';

interface NewsItem {
  id: string;
  title: string;
  body: string;
  published_at: string | null;
}

function formatDate(d: string | null): string {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/beta-testers/news');
        const data = await res.json().catch(() => ({}));
        if (!cancelled) setItems(Array.isArray(data.news) ? data.news : []);
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
      <header>
        <h2 className="text-xl font-light text-zinc-100">News</h2>
      </header>

      {items === null ? (
        <Loading />
      ) : items.length === 0 ? (
        <Empty text="No updates yet." />
      ) : (
        <div className="space-y-6">
          {items.map((n) => (
            <article key={n.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              {n.published_at && (
                <div className="text-xs uppercase tracking-wide text-zinc-600">{formatDate(n.published_at)}</div>
              )}
              <h3 className="mt-1 text-lg font-normal text-zinc-100">{n.title}</h3>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-zinc-400">{n.body}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
