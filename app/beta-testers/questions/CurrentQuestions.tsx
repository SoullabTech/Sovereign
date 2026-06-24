'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { FIELD_ACCENT } from '@/lib/beta-testers/constants';
import { Loading, Empty } from '../_components/states';

interface Question {
  id: string;
  question: string;
  detail: string;
}

export function CurrentQuestions() {
  const [items, setItems] = useState<Question[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/beta-testers/questions');
        const data = await res.json().catch(() => ({}));
        if (!cancelled) setItems(Array.isArray(data.questions) ? data.questions : []);
      } catch {
        if (!cancelled) setItems([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (items === null) return <Loading />;
  if (items.length === 0) return <Empty text="The questions are being drawn." />;

  return (
    <div className="space-y-5">
      {items.map((q) => (
        <div key={q.id} className="border-l-2 pl-5" style={{ borderColor: `${FIELD_ACCENT}55` }}>
          <p className="text-[17px] font-light leading-snug text-zinc-100">{q.question}</p>
          {q.detail && <p className="mt-2 text-[15px] leading-relaxed text-zinc-500">{q.detail}</p>}
        </div>
      ))}
    </div>
  );
}
