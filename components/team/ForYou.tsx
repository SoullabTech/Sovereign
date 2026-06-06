'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// The RECIPIENT's "For You" surface — directed attention loops addressed to me.
// Reads GET /api/team/attention. A loop is a SENDER-DECLARED claim on my attention:
// I alone open / resolve / decline it. "Opened" is set when I open the item — it is
// receipt that it reached me, NOT agreement, completion, or consent.

interface AttentionItem {
  id: string;
  kind: 'mention' | 'request' | 'assignment' | 'thread_reply';
  status: 'open' | 'resolved' | 'declined';
  createdByName: string;
  sourceType: string;
  sourceId: string;
  excerpt: string;        // from source_context
  deepLink: string;       // from source_context — where to act on it
  channelSlug?: string;   // colab convenience (from source_context)
  createdAt: string;
  openedAt: string | null;
}

const KIND_LABEL: Record<AttentionItem['kind'], { label: string; className: string }> = {
  request:      { label: '→ Request',  className: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  assignment:   { label: '◆ Assigned', className: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  mention:      { label: '@ Mention',  className: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
  thread_reply: { label: '↩ Reply',    className: 'bg-white/8 text-white/50 border-white/15' },
};

export function ForYou() {
  const router = useRouter();
  const [items, setItems] = useState<AttentionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/team/attention');
      if (!res.ok) { setError('Failed to load'); return; }
      const d = await res.json();
      setItems(d.items ?? []);
      setError(null);
    } catch {
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000); // MVP: poll (SSE push is Phase 2)
    return () => clearInterval(t);
  }, [load]);

  const act = useCallback(async (id: string, action: 'open' | 'resolve' | 'decline') => {
    setBusyId(id);
    try {
      await fetch('/api/team/attention', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: id, action }),
      });
      await load();
    } finally {
      setBusyId(null);
    }
  }, [load]);

  // Open the loop (sets opened_at = receipt) then go to its source via the deep-link.
  const openItem = useCallback(async (item: AttentionItem) => {
    await act(item.id, 'open');
    router.push(item.deepLink || '/team');
  }, [act, router]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-white/8">
        <h1 className="text-lg font-semibold text-white/90 flex items-center gap-2">
          <span className="text-rose-400">→</span> For You
        </h1>
        <p className="text-xs text-white/40 mt-0.5">
          Open loops addressed to you. You decide what to do with each — opening just marks that it reached you.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-5 h-5 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin" />
          </div>
        )}

        {error && <p className="text-sm text-red-400/80">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8 text-white/40">
            <div className="text-4xl opacity-30">→</div>
            <p className="text-sm">Nothing needs your attention.</p>
            <p className="text-xs text-white/25">
              When someone @mentions you or sends you a Request, it shows up here.
            </p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="space-y-2 max-w-3xl">
            {items.map(item => (
              <div
                key={item.id}
                className="bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 hover:bg-white/[0.05] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${KIND_LABEL[item.kind].className}`}>
                    {KIND_LABEL[item.kind].label}
                  </span>
                  {item.openedAt && (
                    <span className="flex-shrink-0 text-[10px] text-white/30">opened</span>
                  )}
                </div>

                <p className="text-sm text-white/80 leading-snug mt-1.5 whitespace-pre-wrap break-words">
                  {item.excerpt}
                </p>

                <div className="flex items-center gap-2 mt-1.5 text-xs text-white/35 flex-wrap">
                  <span>from {item.createdByName}</span>
                  {item.channelSlug && <span>· #{item.channelSlug}</span>}
                  <span>· {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>

                <div className="mt-2.5 pt-2.5 border-t border-white/8 flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => openItem(item)}
                    disabled={busyId === item.id}
                    className="text-xs px-2.5 py-1 rounded-md bg-amber-500/90 text-black font-medium disabled:opacity-40 hover:bg-amber-400 transition-colors"
                  >
                    {item.channelSlug ? `Open in #${item.channelSlug}` : 'Open'}
                  </button>
                  <button
                    onClick={() => act(item.id, 'resolve')}
                    disabled={busyId === item.id}
                    className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 disabled:opacity-40 hover:bg-emerald-500/25 transition-colors"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => act(item.id, 'decline')}
                    disabled={busyId === item.id}
                    className="text-xs px-2 py-1 rounded-md text-white/40 hover:text-white/70 transition-colors"
                    title="Honestly close a loop you won't action"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
