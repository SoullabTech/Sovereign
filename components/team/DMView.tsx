'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { DMMessage, DMThread } from '@/lib/team/DMService';
import { MessageInput } from './MessageInput';
import { useChannelStream } from './useChannelStream';
import { DMProfileCard } from './DMProfileCard';

interface DMViewProps {
  dmThread: DMThread;
  currentMemberId: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function stringToColor(str: string): string {
  const colors = ['#7c5cbf','#4f8fcc','#3fa88a','#c05c7e','#c08c3f','#5c8fcc','#8f5ccc','#3f9c7a'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function DMView({ dmThread, currentMemberId }: DMViewProps) {
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);

  const otherMembers = dmThread.members.filter(m => m.memberId !== currentMemberId);
  const title = otherMembers.map(m => m.name).join(', ') || 'Direct Message';
  const otherMemberId = otherMembers[0]?.memberId;

  const latestTs = messages.length > 0
    ? new Date(messages[messages.length - 1].createdAt).getTime()
    : 0;

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    fetch(`/api/team/dm/${dmThread.id}/messages?limit=50`)
      .then(r => r.json())
      .then(data => setMessages(data.messages ?? []))
      .finally(() => setLoading(false));
  }, [dmThread.id]);

  useEffect(() => {
    if (!loading) bottomRef.current?.scrollIntoView({ behavior: 'instant' });
  }, [loading, dmThread.id]);

  // Reuse the channel stream hook with DM stream endpoint via a custom EventSource
  useEffect(() => {
    if (loading) return;
    const es = new EventSource(`/api/team/dm/${dmThread.id}/stream?afterTs=${latestTs}`);
    es.addEventListener('messages', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(prev => {
            const ids = new Set(prev.map(m => m.id));
            const newOnes = data.messages.filter((m: DMMessage) => !ids.has(m.id));
            if (!newOnes.length) return prev;
            const updated = [...prev, ...newOnes];
            if (atBottomRef.current) {
              requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }));
            }
            return updated;
          });
        }
      } catch { /* ignore */ }
    });
    return () => es.close();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dmThread.id, loading]);

  const sendMessage = async (body: string) => {
    const res = await fetch(`/api/team/dm/${dmThread.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) throw new Error('Failed to send');
    const { message } = await res.json();
    setMessages(prev => prev.some(m => m.id === message.id) ? prev : [...prev, message]);
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/8 flex-shrink-0">
        {/* Avatar stack */}
        <div className="flex -space-x-1.5">
          {otherMembers.slice(0, 3).map(m => (
            <div
              key={m.memberId}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-zinc-950"
              style={{ background: stringToColor(m.memberId) }}
            >
              {m.name[0]?.toUpperCase()}
            </div>
          ))}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white/90">{title}</h2>
          <p className="text-xs text-white/30">
            {otherMembers[0]?.status === 'online' ? '● Online' :
             otherMembers[0]?.status === 'away'   ? '◐ Away'   : '○ Offline'}
          </p>
        </div>
      </div>

      {/* Profile card for the other participant */}
      {otherMemberId && (
        <DMProfileCard memberId={otherMemberId} currentMemberId={currentMemberId} />
      )}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto scrollbar-hide py-2"
        onScroll={e => {
          const el = e.currentTarget;
          atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
        }}
      >
        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="w-5 h-5 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-8">
            <div className="flex -space-x-2 mb-1">
              {otherMembers.slice(0, 2).map(m => (
                <div
                  key={m.memberId}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold border-2 border-zinc-950"
                  style={{ background: stringToColor(m.memberId) }}
                >
                  {m.name[0]?.toUpperCase()}
                </div>
              ))}
            </div>
            <p className="text-white/50 text-sm font-medium">{title}</p>
            <p className="text-white/25 text-xs">Start a conversation</p>
          </div>
        )}

        {messages.map(msg => {
          const isOwn = msg.senderId === currentMemberId;
          const initials = msg.senderName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
          return (
            <div key={msg.id} className="flex gap-3 px-4 py-1.5 hover:bg-white/[0.03] rounded-lg transition-colors">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5"
                style={{ background: stringToColor(msg.senderId) }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-white/90">
                    {msg.senderName}
                    {isOwn && <span className="text-xs text-white/30 font-normal ml-1">(you)</span>}
                  </span>
                  <span className="text-xs text-white/30">{formatTime(msg.createdAt)}</span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap break-words">
                  {msg.body}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <MessageInput channelName={`@${title}`} onSend={sendMessage} />
    </div>
  );
}
