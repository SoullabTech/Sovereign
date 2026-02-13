'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

type FeedItem = {
  id: string;
  created_at: string;
  shared_by: string;
  sharer_name: string | null;
  artifact_type: string;
  artifact_ref: string;
  content_mode: 'summary_only' | 'full_text';
  shared_title: string | null;
  shared_summary: string | null;
};

export function SharedFeed({ circleId, memberId }: { circleId: string; memberId?: string }) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/circles/${circleId}/feed`);
      const json = await res.json();
      setItems(json.items ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circleId]);

  async function handleRevoke(sharedId: string) {
    await apiFetch(`/api/circles/shared/${sharedId}/revoke`, { method: 'POST' });
    await load();
  }

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-maia-spice-400" />
        <p className="mt-3 text-sm text-maia-ink-40">Loading feed...</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-maia-navy-700 bg-maia-navy-850 p-6 text-center">
        <h3 className="text-lg font-semibold text-maia-ink-80">Nothing shared yet</h3>
        <p className="mt-2 text-sm text-maia-ink-40">
          Shared items appear here when members choose "Share to circle..." from their private work.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div
          key={it.id}
          className="rounded-2xl border border-maia-navy-700 bg-maia-navy-850 p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs text-maia-ink-40">
                <span>{it.sharer_name || 'A member'}</span>
                <span>&middot;</span>
                <span>{it.artifact_type}</span>
                <span>&middot;</span>
                <span>{new Date(it.created_at).toLocaleDateString()}</span>
              </div>
              <h3 className="mt-1 text-base font-semibold text-maia-ink-100">
                {it.shared_title || 'Shared reflection'}
              </h3>
              {it.shared_summary && (
                <p className="mt-2 text-sm text-maia-ink-60">{it.shared_summary}</p>
              )}
            </div>

            {memberId && it.shared_by === memberId && (
              <button
                onClick={() => handleRevoke(it.id)}
                className="shrink-0 rounded-lg border border-maia-navy-700 px-3 py-1.5 text-xs text-maia-ink-40 transition-colors hover:border-red-500/30 hover:text-red-400"
              >
                Unshare
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
