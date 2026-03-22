'use client';

// SoulComms — SSE hook for live channel messages
// Opens an EventSource to the channel stream, calls onMessage for each batch.

import { useEffect, useRef } from 'react';
import type { TeamMessage } from '@/lib/team/types';

interface UseChannelStreamOptions {
  channelId: string;
  afterTs: number;
  onMessages: (messages: TeamMessage[]) => void;
  enabled?: boolean;
}

export function useChannelStream({
  channelId,
  afterTs,
  onMessages,
  enabled = true,
}: UseChannelStreamOptions) {
  const esRef = useRef<EventSource | null>(null);
  const afterTsRef = useRef(afterTs);
  afterTsRef.current = afterTs;

  useEffect(() => {
    if (!enabled || !channelId) return;

    const url = `/api/team/channels/${channelId}/stream?afterTs=${afterTsRef.current}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener('messages', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          onMessages(data.messages);
        }
      } catch {
        // ignore parse errors
      }
    });

    es.addEventListener('error', () => {
      // Browser auto-reconnects via retry hint
    });

    return () => {
      es.close();
      esRef.current = null;
    };
    // Reconnect when channelId changes; afterTs handled by ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, enabled]);
}
