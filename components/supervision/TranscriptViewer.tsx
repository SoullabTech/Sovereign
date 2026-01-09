'use client';

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ChevronDown } from 'lucide-react';
import { apiUrl } from '@/lib/http/apiBase';

interface TranscriptSegment {
  id: string;
  speaker: string;
  speakerConfidence?: number;
  startMs: number | null;
  endMs: number | null;
  text: string;
  confidence?: number;
  createdAt?: string;
}

interface TranscriptResponse {
  success: boolean;
  segments?: TranscriptSegment[];
  transcript?: TranscriptSegment[]; // Legacy field
  cursor?: { afterMs: number };
  error?: string;
}

interface TranscriptViewerProps {
  // New mode: self-managed with polling
  sessionId?: string | null;
  pollIntervalMs?: number;
  // Legacy mode: parent-managed segments
  segments?: TranscriptSegment[];
  // Shared props
  isLive?: boolean;
  highlightedSegmentId?: string;
  onSegmentClick?: (segment: TranscriptSegment) => void;
  maxHeight?: string;
  // Jump to specific segment/time (triggered by insight click)
  jumpToSegmentId?: string | null; // Preferred: exact segment
  jumpToMs?: number | null;        // Fallback: closest by time
  jumpNonce?: number;
}

function findClosestSegmentId(
  segs: TranscriptSegment[],
  targetMs: number
): string | null {
  if (!segs.length) return null;

  // 1) Prefer exact containment: startMs <= target <= endMs
  // If multiple contain (unlikely), pick the one whose center is closest to target.
  let bestContainedId: string | null = null;
  let bestContainedScore = Infinity;

  for (const s of segs) {
    if (s.startMs == null || s.endMs == null) continue;
    if (s.startMs <= targetMs && targetMs <= s.endMs) {
      const center = (s.startMs + s.endMs) / 2;
      const score = Math.abs(center - targetMs);
      if (score < bestContainedScore) {
        bestContainedScore = score;
        bestContainedId = s.id;
      }
    }
  }

  if (bestContainedId) return bestContainedId;

  // 2) Fallback: closest startMs (ignore null startMs)
  let bestId: string | null = null;
  let bestDist = Infinity;

  for (const s of segs) {
    if (s.startMs == null) continue;
    const dist = Math.abs(s.startMs - targetMs);
    if (dist < bestDist) {
      bestDist = dist;
      bestId = s.id;
    }
  }

  // 3) Last resort: if all startMs are null, fall back to first segment id
  return bestId ?? segs[0]?.id ?? null;
}

// Speaker colors mapping
const SPEAKER_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  therapist: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  client: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  supervisor: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  unknown: { bg: 'bg-stone-500/10', border: 'border-stone-500/30', text: 'text-stone-400' },
  'speaker_0': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  'speaker_1': { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  'speaker_2': { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  'speaker_3': { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' }
};

function getSpeakerColor(speaker: string) {
  const normalized = speaker.toLowerCase().replace(/\s+/g, '_');
  return SPEAKER_COLORS[normalized] || SPEAKER_COLORS.unknown;
}

function formatTimestamp(ms: number | null) {
  if (ms === null) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function TranscriptViewer({
  sessionId,
  pollIntervalMs = 1000,
  segments: externalSegments,
  isLive = false,
  highlightedSegmentId,
  onSegmentClick,
  maxHeight = '400px',
  jumpToSegmentId,
  jumpToMs,
  jumpNonce
}: TranscriptViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [focusedSegmentId, setFocusedSegmentId] = useState<string | null>(null);

  // Self-managed state (only used when sessionId is provided)
  const [internalSegments, setInternalSegments] = useState<TranscriptSegment[]>([]);
  const afterMsRef = useRef<number>(-1);  // useRef to avoid polling effect restarts
  const [isLoading, setIsLoading] = useState(false);
  const [usePolling, setUsePolling] = useState(false); // SSE primary, polling fallback
  const [connectionState, setConnectionState] = useState<'idle' | 'sse' | 'polling' | 'reconnecting'>('idle');

  // Use external segments if provided, otherwise use internal state
  const segments = externalSegments ?? internalSegments;
  const isSelfManaged = sessionId && !externalSegments;

  // Merge new segments into existing (deduped by id, sorted by time)
  const mergeSegments = useCallback((incoming: TranscriptSegment[]) => {
    if (!incoming.length) return;

    setInternalSegments(prev => {
      const byId = new Map(prev.map(s => [s.id, s]));
      for (const s of incoming) byId.set(s.id, s);

      return Array.from(byId.values()).sort((a, b) => {
        const am = (a.endMs ?? a.startMs ?? 0);
        const bm = (b.endMs ?? b.startMs ?? 0);
        if (am !== bm) return am - bm;
        return (a.createdAt ?? '').localeCompare(b.createdAt ?? '');
      });
    });
  }, []);

  // Scroll to bottom if user hasn't scrolled up
  const scrollToBottomIfAuto = useCallback(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [autoScroll]);

  // Initial fetch when session changes
  useEffect(() => {
    if (!isSelfManaged) return;

    setInternalSegments([]);
    afterMsRef.current = -1;

    let cancelled = false;

    (async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          apiUrl(`/api/supervision/transcript?sessionId=${encodeURIComponent(sessionId!)}&afterMs=-1&limit=500`),
          { cache: 'no-store' }
        );
        const data = (await res.json()) as TranscriptResponse;
        if (cancelled || !data.success) return;

        const segs = data.segments ?? data.transcript ?? [];
        mergeSegments(segs);

        if (data.cursor && typeof data.cursor.afterMs === 'number') {
          afterMsRef.current = data.cursor.afterMs;
        } else if (segs.length > 0) {
          const max = Math.max(...segs.map(s => (s.endMs ?? s.startMs ?? 0)));
          afterMsRef.current = max;
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [sessionId, isSelfManaged, mergeSegments]);

  // SSE streaming (primary method when live)
  useEffect(() => {
    if (!isSelfManaged || !isLive || usePolling) return;

    setConnectionState('reconnecting');

    const url = apiUrl(
      `/api/supervision/transcript/stream?sessionId=${encodeURIComponent(sessionId!)}&afterMs=${afterMsRef.current}`
    );
    const es = new EventSource(url);

    es.addEventListener('ready', () => {
      setConnectionState('sse');
    });

    es.addEventListener('segments', (evt) => {
      try {
        const { segments: newSegs, afterMs } = JSON.parse((evt as MessageEvent).data);
        mergeSegments(newSegs);
        scrollToBottomIfAuto();
        if (typeof afterMs === 'number') {
          afterMsRef.current = afterMs;
        }
      } catch {
        // Ignore parse errors
      }
    });

    es.onerror = () => {
      es.close();
      setConnectionState('reconnecting');
      // Fallback to polling on SSE failure
      setUsePolling(true);
    };

    return () => es.close();
  }, [sessionId, isSelfManaged, isLive, usePolling, mergeSegments, scrollToBottomIfAuto]);

  // Live polling loop (fallback when SSE fails)
  useEffect(() => {
    if (!isSelfManaged || !isLive || !usePolling) return;

    setConnectionState('polling');
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      if (!alive) return;

      try {
        const res = await fetch(
          apiUrl(`/api/supervision/transcript?sessionId=${encodeURIComponent(sessionId!)}&afterMs=${afterMsRef.current}&limit=200`),
          { cache: 'no-store' }
        );
        const data = (await res.json()) as TranscriptResponse;
        if (!alive || !data.success) return;

        const segs = data.segments ?? data.transcript ?? [];
        if (segs.length > 0) {
          mergeSegments(segs);
          scrollToBottomIfAuto();
        }

        // Update cursor ref (no re-render, no effect restart)
        if (data.cursor && typeof data.cursor.afterMs === 'number') {
          afterMsRef.current = data.cursor.afterMs;
        } else if (segs.length > 0) {
          const max = Math.max(...segs.map(s => (s.endMs ?? s.startMs ?? 0)));
          afterMsRef.current = Math.max(afterMsRef.current, max);
        }
      } catch {
        // Ignore transient network errors
      } finally {
        if (alive) timer = setTimeout(tick, pollIntervalMs);
      }
    };

    timer = setTimeout(tick, pollIntervalMs);

    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, [sessionId, isSelfManaged, isLive, pollIntervalMs, mergeSegments, scrollToBottomIfAuto]);

  // Auto-scroll when segments change (for external segments mode)
  useEffect(() => {
    if (!isSelfManaged) {
      scrollToBottomIfAuto();
    }
  }, [segments, isSelfManaged, scrollToBottomIfAuto]);

  // Jump to specific segment/time when insight clicked (with retry for DOM timing)
  useEffect(() => {
    // Prefer exact segment anchor, fallback to time-based search
    const targetId = jumpToSegmentId
      ? jumpToSegmentId
      : jumpToMs != null && Number.isFinite(jumpToMs) && segments?.length
        ? findClosestSegmentId(segments, jumpToMs)
        : null;

    if (!targetId) return;

    let rafId: number | null = null;
    let timeoutId: number | null = null;
    let cancelled = false;

    const tryScroll = (attemptsLeft: number) => {
      if (cancelled) return;

      const container = scrollRef.current;
      const el = container?.querySelector(
        `[data-transcript-segment-id="${targetId}"]`
      ) as HTMLElement | null;

      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setFocusedSegmentId(targetId);
        setAutoScroll(false); // Disable auto-scroll when jumping

        // Clear focus highlight after 2 seconds
        timeoutId = window.setTimeout(() => {
          setFocusedSegmentId((curr) => (curr === targetId ? null : curr));
        }, 2000);
        return;
      }

      // Retry if DOM not ready yet (~30 frames ≈ ~0.5s at 60fps)
      if (attemptsLeft <= 0) return;
      rafId = requestAnimationFrame(() => tryScroll(attemptsLeft - 1));
    };

    tryScroll(30);

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [jumpNonce, jumpToSegmentId, jumpToMs, segments]);

  // Track scroll position
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setAutoScroll(isNearBottom);
    setShowScrollButton(!isNearBottom && segments.length > 5);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setAutoScroll(true);
    }
  };

  // Group consecutive segments by speaker
  const groupedSegments = useMemo(() => {
    return segments.reduce<Array<TranscriptSegment[]>>((groups, segment) => {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup[0].speaker === segment.speaker) {
        lastGroup.push(segment);
      } else {
        groups.push([segment]);
      }
      return groups;
    }, []);
  }, [segments]);

  if (segments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-stone-500">
        <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">
          {isLoading ? 'Loading transcript...' : isLive ? 'Waiting for transcript...' : 'No transcript available'}
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-stone-700 scrollbar-track-transparent"
        style={{ maxHeight }}
      >
        <AnimatePresence initial={false}>
          {groupedSegments.map((group, groupIndex) => {
            const speaker = group[0].speaker;
            const colors = getSpeakerColor(speaker);
            const startTime = group[0].startMs;

            return (
              <motion.div
                key={`group-${groupIndex}-${group[0].id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative pl-4 border-l-2 ${colors.border}`}
              >
                {/* Speaker Header */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-sm font-medium ${colors.text} capitalize`}>
                    {speaker.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-stone-500">
                    {formatTimestamp(startTime)}
                  </span>
                </div>

                {/* Grouped Messages */}
                <div className="space-y-1">
                  {group.map((segment) => {
                    const isHighlighted = segment.id === highlightedSegmentId;
                    const isFocused = segment.id === focusedSegmentId;

                    return (
                      <motion.div
                        key={segment.id}
                        data-transcript-segment-id={segment.id}
                        onClick={() => onSegmentClick?.(segment)}
                        className={`
                          py-1.5 px-2 rounded-lg cursor-pointer transition-colors
                          ${isFocused
                            ? 'ring-2 ring-amber-500/60 bg-amber-500/10'
                            : isHighlighted
                              ? 'bg-amber-500/20 border border-amber-500/30'
                              : `${colors.bg} hover:bg-stone-700/30`
                          }
                        `}
                      >
                        <p className="text-stone-200 text-sm leading-relaxed">
                          {segment.text}
                        </p>
                        {segment.confidence !== undefined && segment.confidence < 0.8 && (
                          <span className="text-xs text-stone-500 italic">
                            (confidence: {(segment.confidence * 100).toFixed(0)}%)
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Live indicator with connection state */}
        {isLive && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-2 text-stone-500 text-sm"
          >
            <div className={`w-2 h-2 rounded-full ${
              connectionState === 'sse' ? 'bg-emerald-500' :
              connectionState === 'polling' ? 'bg-amber-500' :
              connectionState === 'reconnecting' ? 'bg-red-500' :
              'bg-stone-500'
            }`} />
            <span>
              {connectionState === 'sse' && 'LIVE'}
              {connectionState === 'polling' && 'LIVE (fallback)'}
              {connectionState === 'reconnecting' && 'Reconnecting...'}
              {connectionState === 'idle' && 'Transcribing...'}
            </span>
          </motion.div>
        )}
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={scrollToBottom}
            className="absolute bottom-2 right-2 p-2 bg-stone-800 hover:bg-stone-700 border border-stone-600 rounded-full shadow-lg transition-colors"
          >
            <ChevronDown className="w-4 h-4 text-stone-300" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
