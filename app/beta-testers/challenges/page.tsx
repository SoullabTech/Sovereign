'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import { ELEMENT_META, FIELD_ACCENT, type ElementKey } from '@/lib/beta-testers/constants';
import { Loading, Empty } from '../_components/states';

interface Challenge {
  id: string;
  title: string;
  prompt: string;
  element: string | null;
}

export default function ChallengesPage() {
  const [items, setItems] = useState<Challenge[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/beta-testers/challenges');
        const data = await res.json().catch(() => ({}));
        if (!cancelled) setItems(Array.isArray(data.challenges) ? data.challenges : []);
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
        <h2 className="text-xl font-light text-zinc-100">Current Challenges</h2>
        <p className="text-[15px] text-zinc-500">Invitations to bring a real question — not tasks to complete.</p>
      </header>

      {items === null ? (
        <Loading />
      ) : items.length === 0 ? (
        <Empty text="No invitations right now. Bring whatever is real for you." />
      ) : (
        <div className="space-y-4">
          {items.map((c) => {
            const meta = c.element ? ELEMENT_META[c.element as ElementKey] : undefined;
            const accent = meta?.accent ?? FIELD_ACCENT;
            return (
              <section
                key={c.id}
                className="rounded-2xl border bg-white/[0.02] p-6"
                style={{ borderColor: `${accent}33` }}
              >
                <div className="flex items-center gap-2">
                  {meta && (
                    <span style={{ color: accent }} aria-hidden>
                      {meta.glyph}
                    </span>
                  )}
                  <h3 className="text-base font-medium text-zinc-100">{c.title}</h3>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-zinc-300">{c.prompt}</p>
                <Link href="/maia" className="mt-4 inline-block text-sm" style={{ color: accent }}>
                  Bring a question to MAIA →
                </Link>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
