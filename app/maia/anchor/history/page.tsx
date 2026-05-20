'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

interface Anchor {
  anchor_date: string;
  prompt_shown: string;
  response: string;
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
          <div className="space-y-12">
            {anchors.map((a) => (
              <div key={a.anchor_date}>
                <p className="text-[12px] text-stone-400 mb-2 tracking-wide">
                  {formatDate(a.anchor_date)}
                </p>
                <p className="text-[12px] text-stone-400 mb-3 italic">
                  {a.prompt_shown}
                </p>
                <p className="text-[14px] text-stone-700 leading-relaxed whitespace-pre-wrap">
                  {a.response}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
