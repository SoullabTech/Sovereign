'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import { FIELD_ACCENT } from '@/lib/beta-testers/constants';
import { Loading, Empty } from '../_components/states';

interface Experiment {
  id: string;
  code: string | null;
  title: string;
  protocol: string;
}

export default function ExperimentsPage() {
  const [items, setItems] = useState<Experiment[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/beta-testers/experiments');
        const data = await res.json().catch(() => ({}));
        if (!cancelled) setItems(Array.isArray(data.experiments) ? data.experiments : []);
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
        <h2 className="text-xl font-light text-zinc-100">Experiments</h2>
        <p className="text-[15px] text-zinc-500">
          Investigations, not invitations. Try one, then leave what you noticed in the Observation Stream.
        </p>
      </header>

      {items === null ? (
        <Loading />
      ) : items.length === 0 ? (
        <Empty text="No experiments running right now." />
      ) : (
        <div className="space-y-4">
          {items.map((x) => (
            <section key={x.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              {x.code && (
                <div className="text-xs uppercase tracking-[0.2em]" style={{ color: FIELD_ACCENT }}>
                  {x.code}
                </div>
              )}
              <h3 className="mt-1 text-base font-medium text-zinc-100">{x.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-zinc-300">{x.protocol}</p>
              <Link href="/beta-testers/observe" className="mt-4 inline-block text-sm" style={{ color: FIELD_ACCENT }}>
                Record what you noticed →
              </Link>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
