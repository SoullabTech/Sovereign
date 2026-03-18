'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface PatternItem {
  value: string;
  count: number;
}

interface PatternSummary {
  themesTop?: PatternItem[];
  interventionsTop?: PatternItem[];
  elements?: PatternItem[];
  spiralMoves?: PatternItem[];
  noteCount?: number;
  chunkCount?: number;
  updatedAt?: string;
}

interface MemoryChunk {
  id: string;
  occurred_at: string;
  source_type: string;
  source_id: string | null;
  content: string;
  similarity?: number;
}

interface CaseMemoryPanelProps {
  caseId: string;
  memberId: string;
  className?: string;
}

export const CaseMemoryPanel: React.FC<CaseMemoryPanelProps> = ({
  caseId,
  memberId,
  className,
}) => {
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<MemoryChunk[]>([]);
  const [patterns, setPatterns] = useState<PatternSummary | null>(null);
  const [results, setResults] = useState<MemoryChunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [embeddingBacklog, setEmbeddingBacklog] = useState<number | null>(null);

  const fetchBacklog = useCallback(async () => {
    try {
      const res = await fetch('/api/embeddings/backlog', { cache: 'no-store' });
      const data = await res.json();
      setEmbeddingBacklog(typeof data?.pending === 'number' ? data.pending : 0);
    } catch {
      setEmbeddingBacklog(null);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/caseload/${caseId}/memories/list?memberId=${memberId}&limit=10`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load memories');
      }

      setRecent(data.recent || []);
      setPatterns(data.patterns || null);
    } catch (err) {
      console.error('[CaseMemoryPanel] Load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load memories');
    } finally {
      setLoading(false);
    }
  }, [caseId, memberId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Poll embedding backlog
  const BACKLOG_POLL_MS = 4_000;
  useEffect(() => {
    fetchBacklog();
    const interval = setInterval(fetchBacklog, BACKLOG_POLL_MS);
    return () => clearInterval(interval);
  }, [fetchBacklog]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setSearching(true);
      setError(null);
      const res = await fetch(`/api/caseload/${caseId}/memories/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, query, topK: 8 }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.results || []);
    } catch (err) {
      console.error('[CaseMemoryPanel] Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleRecomputePatterns = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/caseload/${caseId}/patterns?memberId=${memberId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to recompute patterns');
      }

      setPatterns(data.summary);
    } catch (err) {
      console.error('[CaseMemoryPanel] Patterns error:', err);
      setError(err instanceof Error ? err.message : 'Failed to recompute patterns');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search bar */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search memories... (e.g., 'abandonment', 'mother', 'sleep')"
          className="flex-1 px-3 py-2 bg-sacred-navy/60 border border-gold-divine/20 focus:border-gold-divine/50 rounded-lg text-sm text-neutral-silver placeholder-neutral-silver/40 outline-none"
        />
        <button
          onClick={handleSearch}
          disabled={searching || !query.trim()}
          className="px-4 py-2 bg-gold-divine/20 hover:bg-gold-divine/30 border border-gold-divine/40 rounded-lg text-sm text-gold-divine disabled:opacity-50"
        >
          {searching ? '...' : 'Search'}
        </button>
        {typeof embeddingBacklog === 'number' && (
          <span
            title={
              embeddingBacklog > 200
                ? 'High backlog - worker may be down or Ollama unreachable'
                : embeddingBacklog > 0
                  ? 'Embedding queue pending'
                  : 'Embedding queue healthy'
            }
            className={cn(
              'px-2 py-0.5 text-xs border rounded',
              embeddingBacklog > 200
                ? 'bg-red-900/60 text-red-300 border-red-600/30 animate-pulse'
                : embeddingBacklog > 0
                  ? 'bg-amber-900/60 text-amber-300 border-amber-600/30 animate-pulse'
                  : 'bg-emerald-900/20 text-emerald-300 border-emerald-600/20',
            )}
          >
            {embeddingBacklog > 200 ? '🚨' : '⏳'} {embeddingBacklog}
          </span>
        )}
      </div>

      {error && (
        <div className="px-3 py-2 bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Pattern summary header */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-neutral-silver/50">
          {loading ? (
            'Loading...'
          ) : patterns?.updatedAt ? (
            `Patterns updated ${formatDate(patterns.updatedAt)}`
          ) : (
            'No patterns yet'
          )}
        </div>
        <button
          onClick={handleRecomputePatterns}
          disabled={loading}
          className="text-xs text-gold-divine/60 hover:text-gold-divine"
        >
          Recompute
        </button>
      </div>

      {/* Pattern grids */}
      {patterns && (
        <div className="grid grid-cols-2 gap-3">
          <PatternList title="Top Themes" items={patterns.themesTop || []} color="text-cyan-400" />
          <PatternList title="Interventions" items={patterns.interventionsTop || []} color="text-purple-400" />
          <PatternList title="Elements" items={patterns.elements || []} color="text-amber-400" />
          <PatternList title="Spiral Movement" items={patterns.spiralMoves || []} color="text-green-400" />
        </div>
      )}

      {/* Search results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gold-divine">Search Results</h4>
            <button
              onClick={() => setResults([])}
              className="text-xs text-neutral-silver/50 hover:text-neutral-silver"
            >
              Clear
            </button>
          </div>
          {results.map((chunk) => (
            <MemoryCard key={chunk.id} chunk={chunk} showSimilarity />
          ))}
        </div>
      )}

      {/* Recent memories */}
      {recent.length > 0 && results.length === 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-neutral-silver/70">Recent Memory</h4>
          {recent.slice(0, 4).map((chunk) => (
            <MemoryCard key={chunk.id} chunk={chunk} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && recent.length === 0 && !patterns && (
        <div className="text-center py-6">
          <div className="text-3xl mb-2">🧠</div>
          <p className="text-sm text-neutral-silver/50">
            No memories yet. Add session notes to build case memory.
          </p>
        </div>
      )}
    </div>
  );
};

// Pattern list sub-component
function PatternList({
  title,
  items,
  color = 'text-neutral-silver',
}: {
  title: string;
  items: PatternItem[];
  color?: string;
}) {
  return (
    <div className="p-3 bg-sacred-navy/40 border border-gold-divine/10 rounded-lg">
      <h5 className="text-xs font-medium text-neutral-silver/60 mb-2">{title}</h5>
      {items.length === 0 ? (
        <div className="text-xs text-neutral-silver/30">—</div>
      ) : (
        <div className="space-y-1">
          {items.slice(0, 5).map((item) => (
            <div key={item.value} className="flex items-center justify-between text-xs">
              <span className={cn('truncate', color)}>{item.value}</span>
              <span className="text-neutral-silver/30 ml-2">{item.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Memory card sub-component
function MemoryCard({
  chunk,
  showSimilarity = false,
}: {
  chunk: MemoryChunk;
  showSimilarity?: boolean;
}) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-3 bg-sacred-navy/40 border border-gold-divine/10 rounded-lg">
      <div className="flex items-center justify-between text-xs text-neutral-silver/50 mb-2">
        <span>
          {chunk.source_type} • {formatDate(chunk.occurred_at)}
        </span>
        {showSimilarity && typeof chunk.similarity === 'number' && (
          <span className="text-gold-divine/60">
            {(chunk.similarity * 100).toFixed(0)}% match
          </span>
        )}
      </div>
      <p className="text-sm text-neutral-silver/80 line-clamp-3 whitespace-pre-wrap">
        {chunk.content}
      </p>
    </div>
  );
}

export default CaseMemoryPanel;
