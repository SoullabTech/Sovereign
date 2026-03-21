'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface DraftSummary {
  id: string;
  title: string;
  seed_prompt: string | null;
  updated_at: string;
  last_opened_at: string | null;
}

interface RecentDraftsProps {
  onResume: (id: string) => void;
  onViewAll?: () => void;
  refreshKey?: number;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function RecentDrafts({ onResume, onViewAll, refreshKey }: RecentDraftsProps) {
  const [drafts, setDrafts] = useState<DraftSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/songwriter/songs?limit=5')
      .then(r => r.ok ? r.json() : { songs: [] })
      .then(data => setDrafts(data.songs ?? []))
      .catch(() => setDrafts([]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading || drafts.length === 0) return null;

  return (
    <div className="mt-8 max-w-2xl mx-auto px-4">
      <div className="flex items-center justify-between mb-3">
        <div
          className="text-xs uppercase tracking-widest text-white/20"
          style={{ fontFamily: 'Spectral, Georgia, serif' }}
        >
          Recent drafts
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-white/20 hover:text-amber-400/50 transition-colors"
            style={{ fontFamily: 'Spectral, Georgia, serif' }}
          >
            All songs →
          </button>
        )}
      </div>
      <div className="space-y-1.5">
        {drafts.map(draft => (
          <button
            key={draft.id}
            onClick={() => onResume(draft.id)}
            className="w-full flex items-center justify-between px-4 py-2.5
                       bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06]
                       hover:border-white/10 rounded-lg transition-all duration-150 text-left group"
          >
            <div className="min-w-0">
              <div
                className="text-white/60 group-hover:text-white/80 text-sm truncate transition-colors"
                style={{ fontFamily: 'Spectral, Georgia, serif' }}
              >
                {draft.title}
              </div>
              {draft.seed_prompt && (
                <div
                  className="text-white/20 text-xs truncate mt-0.5"
                  style={{ fontFamily: 'Spectral, Georgia, serif' }}
                >
                  {draft.seed_prompt}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-white/20 text-xs ml-4 shrink-0">
              <Clock size={10} />
              {timeAgo(draft.last_opened_at ?? draft.updated_at)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
