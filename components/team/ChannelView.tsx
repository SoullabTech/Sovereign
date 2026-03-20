'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { TeamChannel, TeamMessage } from '@/lib/team/types';
import { MessageBubble, DateDivider } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { ThreadPanel } from './ThreadPanel';
import { useChannelStream } from './useChannelStream';
import { ChannelPurposeHeader } from './ChannelPurposeHeader';

interface ChannelViewProps {
  channel: TeamChannel;
  currentMemberId: string;
}

function sameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export function ChannelView({ channel, currentMemberId }: ChannelViewProps) {
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [threadMessage, setThreadMessage] = useState<TeamMessage | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);

  // Latest message timestamp for SSE cursor
  const latestTs = messages.length > 0
    ? new Date(messages[messages.length - 1].createdAt).getTime()
    : 0;

  // Load initial history
  useEffect(() => {
    setLoading(true);
    setMessages([]);
    fetch(`/api/team/channels/${channel.id}/messages?limit=50`)
      .then(r => r.json())
      .then(data => setMessages(data.messages ?? []))
      .catch(() => setError('Failed to load messages'))
      .finally(() => setLoading(false));
  }, [channel.id]);

  // Scroll to bottom on channel switch or initial load
  useEffect(() => {
    if (!loading) {
      bottomRef.current?.scrollIntoView({ behavior: 'instant' });
    }
  }, [loading, channel.id]);

  // Track if user is near bottom
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  }, []);

  // Append live messages from SSE
  const onLiveMessages = useCallback((incoming: TeamMessage[]) => {
    setMessages(prev => {
      const existingIds = new Set(prev.map(m => m.id));
      const newOnes = incoming.filter(m => !existingIds.has(m.id));
      if (!newOnes.length) return prev;
      return [...prev, ...newOnes];
    });
    if (atBottomRef.current) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, []);

  useChannelStream({
    channelId: channel.id,
    afterTs: latestTs,
    onMessages: onLiveMessages,
    enabled: !loading,
  });

  const sendMessage = async (body: string) => {
    const res = await fetch(`/api/team/channels/${channel.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) throw new Error('Failed to send');
    const { message } = await res.json();
    setMessages(prev => {
      if (prev.some(m => m.id === message.id)) return prev;
      return [...prev, message];
    });
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  const handleReact = async (messageId: string, emoji: string) => {
    const res = await fetch(`/api/team/reactions/${messageId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji }),
    });
    if (!res.ok) return;
    const { action } = await res.json();

    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m;
      const existing = m.reactions.find(r => r.emoji === emoji);
      if (action === 'added') {
        if (existing) {
          return {
            ...m,
            reactions: m.reactions.map(r =>
              r.emoji === emoji
                ? { ...r, count: r.count + 1, memberIds: [...r.memberIds, currentMemberId], hasMine: true }
                : r
            ),
          };
        }
        return {
          ...m,
          reactions: [...m.reactions, { emoji, count: 1, memberIds: [currentMemberId], hasMine: true }],
        };
      } else {
        return {
          ...m,
          reactions: m.reactions
            .map(r =>
              r.emoji === emoji
                ? { ...r, count: r.count - 1, memberIds: r.memberIds.filter(id => id !== currentMemberId), hasMine: false }
                : r
            )
            .filter(r => r.count > 0),
        };
      }
    }));
  };

  const handleReflect = async (messageId: string, mode: string) => {
    const msg = messages.find(m => m.id === messageId);
    if (!msg) return;
    await fetch(`/api/team/channels/${channel.id}/maia-reflect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, messageBody: msg.body, reflectMode: mode }),
    });
    // The response will arrive via SSE — no need to manually add it
  };

  const mainCol = (
    <div className="flex flex-col flex-1 min-w-0">
      <ChannelPurposeHeader channel={channel} />

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar-hide py-2"
      >
        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="w-5 h-5 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin" />
          </div>
        )}
        {error && <div className="px-4 py-3 text-sm text-red-400/80">{error}</div>}
        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
            <div className="text-4xl opacity-30">#</div>
            <p className="text-white/40 text-sm">
              This is the beginning of{' '}
              <span className="text-white/60 font-medium">#{channel.name}</span>
            </p>
            {channel.description && (
              <p className="text-white/25 text-xs">{channel.description}</p>
            )}
          </div>
        )}
        {messages.map((msg, i) => {
          const prev = messages[i - 1];
          const showDate = !prev || !sameDay(prev.createdAt, msg.createdAt);
          return (
            <div key={msg.id}>
              {showDate && <DateDivider iso={msg.createdAt} />}
              <MessageBubble
                message={msg}
                currentMemberId={currentMemberId}
                onReact={handleReact}
                onOpenThread={setThreadMessage}
                onReflect={handleReflect}
              />
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <MessageInput
        channelName={channel.slug}
        onSend={sendMessage}
        promptScaffold={channel.promptScaffold ?? undefined}
      />
    </div>
  );

  return (
    <div className="flex h-full min-h-0">
      {mainCol}
      {threadMessage && (
        <ThreadPanel
          parentMessage={threadMessage}
          channelId={channel.id}
          currentMemberId={currentMemberId}
          onClose={() => setThreadMessage(null)}
          onReact={handleReact}
        />
      )}
    </div>
  );
}
