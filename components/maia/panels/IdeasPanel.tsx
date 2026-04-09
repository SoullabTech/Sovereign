'use client';

/**
 * IdeasPanel — Right panel for the Ideas world
 *
 * Shows the member's active ideas (most recently returned-to first).
 * Each row links into /maia/ideas/[id] — the single-idea workspace where
 * reflections, decisions, and shifts accumulate over time.
 *
 * This panel is a shortcut into Ideas, not an editor. All creation and
 * iteration happens in the workspace page.
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Lightbulb, RefreshCw, Plus, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

interface IdeaListItem {
  id: string;
  title: string;
  framing: string | null;
  status: string;
  last_entered_at: string;
  last_decision_at: string | null;
  block_count: number;
  last_block_at: string | null;
}

interface IdeasPanelProps {
  explorerId: string;
}

export function IdeasPanel({ explorerId }: IdeasPanelProps) {
  const router = useRouter();
  const [ideas, setIdeas] = useState<IdeaListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIdeas = useCallback(async () => {
    try {
      const res = await apiFetch('/api/ideas?limit=20');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.ideas)) {
        setIdeas(data.ideas);
      }
    } catch {
      // Silent — panel is non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  // Re-fetch periodically — ideas may be captured via conversation toast
  useEffect(() => {
    const interval = setInterval(fetchIdeas, 30000);
    return () => clearInterval(interval);
  }, [fetchIdeas]);

  const hasIdeas = ideas.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-stone-500 font-light">
          A place to stay with an idea over time.
        </p>
        {hasIdeas && (
          <button
            onClick={fetchIdeas}
            className="text-stone-600 hover:text-amber-400/70 transition-colors"
            aria-label="Refresh ideas"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Entry CTA — always visible, routes to list page */}
      <button
        onClick={() => router.push('/maia/ideas')}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all text-left group"
      >
        <Plus className="w-4 h-4 text-amber-400/60 group-hover:text-amber-400/90 transition-colors flex-shrink-0" />
        <div>
          <p className="text-sm text-amber-300/80 group-hover:text-amber-300 font-light">
            Open Ideas
          </p>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Reflections, decisions, shifts — held together.
          </p>
        </div>
      </button>

      {/* Ideas list */}
      {loading ? (
        <div className="pt-4 text-center">
          <div className="w-4 h-4 border border-amber-500/30 border-t-amber-400/70 rounded-full animate-spin mx-auto" />
        </div>
      ) : hasIdeas ? (
        <div className="space-y-2 pt-2">
          {ideas.slice(0, 6).map((idea) => (
            <IdeaRow
              key={idea.id}
              idea={idea}
              onClick={() => router.push(`/maia/ideas/${idea.id}`)}
            />
          ))}
          {ideas.length > 6 && (
            <button
              onClick={() => router.push('/maia/ideas')}
              className="w-full text-center text-[11px] text-stone-600 hover:text-amber-400/70 transition-colors pt-2"
            >
              View all {ideas.length} ideas
            </button>
          )}
        </div>
      ) : (
        <div className="pt-4 text-center">
          <Lightbulb className="w-4 h-4 text-stone-600 mx-auto mb-1" />
          <p className="text-[10px] text-stone-600 font-light">
            No ideas yet
          </p>
        </div>
      )}
    </div>
  );
}

function IdeaRow({ idea, onClick }: { idea: IdeaListItem; onClick: () => void }) {
  const timeAgo = formatTimeAgo(idea.last_entered_at);
  return (
    <button
      onClick={onClick}
      className="w-full p-3 rounded-lg bg-stone-900/40 hover:bg-stone-900/70 border border-stone-800/50 hover:border-amber-500/30 transition-all text-left group"
    >
      <div className="flex items-start gap-2 min-w-0">
        <Lightbulb className="w-3.5 h-3.5 text-amber-400/40 group-hover:text-amber-400/70 mt-0.5 flex-shrink-0 transition-colors" />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-amber-300/85 group-hover:text-amber-200 font-medium truncate transition-colors">
            {idea.title}
          </p>
          {idea.framing && (
            <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1 leading-relaxed">
              {idea.framing}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-600">
            <span>{timeAgo}</span>
            {idea.block_count > 0 && (
              <>
                <span>·</span>
                <span>{idea.block_count} {idea.block_count === 1 ? 'entry' : 'entries'}</span>
              </>
            )}
            {idea.last_decision_at && (
              <span className="flex items-center gap-0.5 text-emerald-500/60">
                <CheckCircle2 className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
