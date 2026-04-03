'use client';

/**
 * IdeasPanel — Right panel for the Ideas world
 *
 * Generative emergence. A place for thoughts that are forming but not yet structured.
 * Fetches saved ideas from /api/ideas and displays them as cards.
 * New ideas arrive via the toast confirmation flow in OracleConversation.
 */

import { useEffect, useState, useCallback } from 'react';
import { Lightbulb, Sparkles, RefreshCw } from 'lucide-react';

interface Idea {
  id: string;
  title: string | null;
  description: string | null;
  status: string;
  confidence: number | null;
  source: string;
  capture_mode: string;
  created_at: string;
}

interface IdeasPanelProps {
  explorerId: string;
}

export function IdeasPanel({ explorerId }: IdeasPanelProps) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIdeas = useCallback(async () => {
    try {
      const res = await fetch('/api/ideas?limit=20');
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

  // Re-fetch when panel becomes visible (ideas may have been saved via toast)
  useEffect(() => {
    const interval = setInterval(fetchIdeas, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchIdeas]);

  const hasIdeas = ideas.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-stone-500 font-light">
          Thoughts that are forming. Not yet structured — just emerging.
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

      {/* Capture prompt */}
      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 text-center">
        <Lightbulb className="w-5 h-5 text-amber-400/50 mx-auto mb-2" />
        <p className="text-sm text-amber-300/70 font-light">
          Speak your thoughts freely.
        </p>
        <p className="text-xs text-stone-500 mt-1">
          MAIA can capture ideas as they surface during conversation.
        </p>
      </div>

      {/* Ideas list */}
      {loading ? (
        <div className="pt-4 text-center">
          <div className="w-4 h-4 border border-amber-500/30 border-t-amber-400/70 rounded-full animate-spin mx-auto" />
        </div>
      ) : hasIdeas ? (
        <div className="space-y-2 pt-2">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      ) : (
        <div className="pt-4 text-center">
          <Sparkles className="w-4 h-4 text-stone-600 mx-auto mb-1" />
          <p className="text-[10px] text-stone-600 font-light">
            Ideas will gather here as they emerge
          </p>
        </div>
      )}
    </div>
  );
}

function IdeaCard({ idea }: { idea: Idea }) {
  const displayTitle = idea.title || 'Untitled thought';
  const timeAgo = formatTimeAgo(idea.created_at);

  return (
    <div className="p-3 rounded-lg bg-stone-900/50 border border-stone-800/50 hover:border-amber-500/20 transition-colors">
      <div className="flex items-start gap-2">
        <Lightbulb className="w-3.5 h-3.5 text-amber-400/40 mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-amber-300/80 font-medium truncate">
            {displayTitle}
          </p>
          {idea.description && (
            <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-2 leading-relaxed">
              {idea.description}
            </p>
          )}
          <p className="text-[10px] text-stone-600 mt-1">
            {timeAgo}
          </p>
        </div>
      </div>
    </div>
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
