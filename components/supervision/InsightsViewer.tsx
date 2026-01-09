'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { apiUrl } from '@/lib/http/apiBase';

// Prefer importing the real type if it exists in your repo.
// If this import path differs, adjust it to wherever your Supervision insight type lives.
import type { SupervisionInsight } from '@/lib/supervision/SupervisionStore';

type ConnectionState = 'idle' | 'sse' | 'polling' | 'reconnecting';

// Unified insight type for callbacks
type InsightLike = { id: string } & Record<string, unknown>;

type InsightsViewerProps = {
  sessionId: string;
  isLive?: boolean;

  // Optional: controlled mode (if parent provides insights)
  insights?: SupervisionInsight[];
  onInsightsChange?: (insights: InsightLike[]) => void;

  // Selection handling
  onInsightClick?: (insight: InsightLike) => void;
  selectedInsightId?: string;

  className?: string;
};

function safeDateMs(input: unknown): number {
  if (typeof input === 'number' && Number.isFinite(input)) return input;
  if (typeof input === 'string') {
    const t = Date.parse(input);
    return Number.isFinite(t) ? t : 0;
  }
  return 0;
}

function getInsightId(i: SupervisionInsight): string {
  const anyI = i as unknown as Record<string, unknown>;
  return String(anyI.id ?? anyI.insight_id ?? `${safeDateMs(anyI.created_at ?? anyI.createdAt)}:${Math.random()}`);
}

function getInsightCreatedAt(i: SupervisionInsight): string {
  const anyI = i as unknown as Record<string, unknown>;
  const v = (anyI.created_at ?? anyI.createdAt ?? anyI.timestamp) as unknown;
  if (typeof v === 'string') return v;
  const ms = safeDateMs(v);
  return ms ? new Date(ms).toISOString() : new Date().toISOString();
}

function getInsightTitle(i: SupervisionInsight): string {
  const anyI = i as unknown as Record<string, unknown>;
  return String(anyI.title ?? anyI.kind ?? anyI.insight_type ?? anyI.type ?? anyI.category ?? 'Insight');
}

function getInsightBody(i: SupervisionInsight): string {
  const anyI = i as unknown as Record<string, unknown>;
  const body =
    anyI.body ??
    anyI.summary ??
    anyI.content ??
    anyI.text ??
    anyI.message ??
    anyI.insight ??
    anyI.recommendation;

  if (typeof body === 'string') return body;

  // If the server returns structured insight payloads, render a compact JSON.
  try {
    return JSON.stringify(body ?? anyI, null, 2);
  } catch {
    return String(body ?? '');
  }
}

export default function InsightsViewer({
  sessionId,
  isLive = false,
  insights: externalInsights,
  onInsightsChange,
  onInsightClick,
  selectedInsightId,
  className,
}: InsightsViewerProps) {
  const isSelfManaged = !externalInsights;

  const [internalInsights, setInternalInsights] = useState<SupervisionInsight[]>([]);
  const [usePolling, setUsePolling] = useState(false); // SSE primary, polling fallback
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [isLoading, setIsLoading] = useState(false);

  const afterTsRef = useRef<number>(-1);
  const seenRef = useRef<Set<string>>(new Set());

  const insights = externalInsights ?? internalInsights;

  const sortedInsights = useMemo(() => {
    const arr = [...insights];
    arr.sort((a, b) => safeDateMs(getInsightCreatedAt(a)) - safeDateMs(getInsightCreatedAt(b)));
    return arr;
  }, [insights]);

  const upsertInsights = (next: SupervisionInsight[]) => {
    if (!next.length) return;

    const deduped: SupervisionInsight[] = [];
    for (const i of next) {
      const id = getInsightId(i);
      if (seenRef.current.has(id)) continue;
      seenRef.current.add(id);
      deduped.push(i);

      const createdMs = safeDateMs(getInsightCreatedAt(i));
      if (createdMs > afterTsRef.current) afterTsRef.current = createdMs;
    }

    if (!deduped.length) return;

    if (isSelfManaged) {
      setInternalInsights(prev => {
        const merged = [...prev, ...deduped];
        merged.sort((a, b) => safeDateMs(getInsightCreatedAt(a)) - safeDateMs(getInsightCreatedAt(b)));

        // Normalize with id for parent lookup, then notify
        const normalized = merged.map(x => ({ ...x, id: getInsightId(x) }));
        onInsightsChange?.(normalized);

        return merged;
      });
    } else {
      // controlled mode
      const merged = [...(externalInsights ?? []), ...deduped];
      merged.sort((a, b) => safeDateMs(getInsightCreatedAt(a)) - safeDateMs(getInsightCreatedAt(b)));

      // Normalize with id for parent lookup
      const normalized = merged.map(x => ({ ...x, id: getInsightId(x) }));
      onInsightsChange?.(normalized);
    }
  };

  // Reset when session changes
  useEffect(() => {
    afterTsRef.current = -1;
    seenRef.current = new Set();
    if (isSelfManaged) setInternalInsights([]);
    setUsePolling(false);
    setConnectionState('idle');
  }, [sessionId, isSelfManaged]);

  // SSE (primary)
  useEffect(() => {
    if (!isSelfManaged || !isLive || usePolling) return;

    setConnectionState('reconnecting');

    const url = apiUrl(
      `/api/supervision/insights/stream?sessionId=${encodeURIComponent(sessionId)}&afterTs=${afterTsRef.current}`
    );

    const es = new EventSource(url);

    es.addEventListener('ready', () => {
      setConnectionState('sse');
    });

    es.addEventListener('insights', evt => {
      try {
        const parsed = JSON.parse((evt as MessageEvent).data) as { insights?: SupervisionInsight[] };
        if (Array.isArray(parsed.insights)) upsertInsights(parsed.insights);
      } catch {
        // ignore malformed event payloads
      }
    });

    es.onerror = () => {
      es.close();
      setConnectionState('reconnecting');
      setUsePolling(true); // fallback
    };

    return () => {
      es.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelfManaged, isLive, sessionId, usePolling]);

  // Polling fallback
  useEffect(() => {
    if (!isSelfManaged || !isLive || !usePolling) return;

    setConnectionState('polling');

    let alive = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const INTERVALS = [1000, 2000, 3000, 5000];
    let idleCycles = 0;
    let currentInterval = INTERVALS[0];

    const tick = async () => {
      if (!alive) return;

      setIsLoading(true);
      try {
        const res = await fetch(
          apiUrl(
            `/api/supervision/insights?sessionId=${encodeURIComponent(sessionId)}&afterTs=${afterTsRef.current}`
          ),
          { method: 'GET' }
        );

        if (!res.ok) throw new Error(`Insights polling failed (${res.status})`);

        const data = (await res.json()) as { insights?: SupervisionInsight[] };
        const newItems = Array.isArray(data.insights) ? data.insights : [];

        if (newItems.length) {
          upsertInsights(newItems);
          idleCycles = 0;
          currentInterval = INTERVALS[0];
        } else {
          idleCycles++;
          currentInterval = INTERVALS[Math.min(idleCycles, INTERVALS.length - 1)];
        }
      } catch {
        // stay in polling; next tick will retry
        idleCycles++;
        currentInterval = INTERVALS[Math.min(idleCycles, INTERVALS.length - 1)];
      } finally {
        setIsLoading(false);
        timer = setTimeout(tick, currentInterval);
      }
    };

    timer = setTimeout(tick, currentInterval);

    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelfManaged, isLive, sessionId, usePolling]);

  return (
    <div className={className ?? ''}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-stone-200 text-sm font-medium">Insights</div>

        {isLive && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-2 text-stone-500 text-xs"
          >
            <div
              className={[
                'w-2 h-2 rounded-full',
                connectionState === 'sse'
                  ? 'bg-emerald-500'
                  : connectionState === 'polling'
                    ? 'bg-amber-500'
                    : connectionState === 'reconnecting'
                      ? 'bg-red-500'
                      : 'bg-stone-500',
              ].join(' ')}
            />
            <span>
              {connectionState === 'sse' && 'LIVE'}
              {connectionState === 'polling' && 'LIVE (fallback)'}
              {connectionState === 'reconnecting' && 'Reconnecting...'}
              {connectionState === 'idle' && 'Listening...'}
            </span>
          </motion.div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
        {sortedInsights.length === 0 ? (
          <div className="text-stone-500 text-sm">
            {isLoading ? 'Loading...' : isLive ? 'No insights yet.' : 'Select a session to view insights.'}
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {sortedInsights.map((i) => {
                const id = getInsightId(i);
                const title = getInsightTitle(i);
                const body = getInsightBody(i);
                const createdAt = getInsightCreatedAt(i);
                const isSelected = selectedInsightId === id;

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onInsightClick?.({ ...i, id })}
                    className={[
                      'rounded-xl border p-3 transition-colors',
                      onInsightClick ? 'cursor-pointer' : '',
                      isSelected
                        ? 'border-amber-500/50 bg-amber-500/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-stone-100 text-sm font-medium">{title}</div>
                      <div className="text-stone-500 text-xs whitespace-nowrap">
                        {new Date(createdAt).toLocaleString()}
                      </div>
                    </div>

                    <pre className="mt-2 text-stone-200 text-sm whitespace-pre-wrap break-words">
                      {body}
                    </pre>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
