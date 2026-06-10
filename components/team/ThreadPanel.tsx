'use client';

import { useState, useEffect, useRef } from 'react';
import type { TeamMessage, MessageKind } from '@/lib/team/types';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

interface ThreadPanelProps {
  parentMessage: TeamMessage;
  channelId: string;
  currentMemberId: string;
  onClose: () => void;
  onReact: (messageId: string, emoji: string) => void;
}

export function ThreadPanel({
  parentMessage,
  channelId,
  currentMemberId,
  onClose,
  onReact,
}: ThreadPanelProps) {
  const [replies, setReplies] = useState<TeamMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/team/channels/${channelId}/messages?parentId=${parentMessage.id}&limit=100`)
      .then(r => r.json())
      .then(data => setReplies(data.messages ?? []))
      .finally(() => setLoading(false));
  }, [parentMessage.id, channelId]);

  useEffect(() => {
    if (!loading) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [loading, replies.length]);

  const sendReply = async (body: string, messageKind: MessageKind = 'build') => {
    const res = await fetch(`/api/team/channels/${channelId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body, parentId: parentMessage.id, messageKind }),
    });
    if (!res.ok) throw new Error('Failed to send reply');
    const { message } = await res.json();
    setReplies(prev => prev.some(m => m.id === message.id) ? prev : [...prev, message]);
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }));
  };

  const editReply = async (messageId: string, newBody: string) => {
    const res = await fetch(`/api/team/channels/${channelId}/messages`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, body: newBody }),
    });
    if (!res.ok) throw new Error('Failed to edit reply');
    const { message } = await res.json();
    setReplies(prev => prev.map(m =>
      m.id === messageId ? { ...m, body: message.body, editedAt: message.editedAt } : m
    ));
  };

  return (
    <div className="w-80 flex-shrink-0 border-l border-white/8 bg-zinc-900/60 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <h3 className="text-sm font-semibold text-white/80">Thread</h3>
        <button
          onClick={onClose}
          className="text-white/30 hover:text-white/70 transition-colors p-1 rounded"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Parent message */}
      <div className="border-b border-white/8 py-1 opacity-80">
        <MessageBubble
          message={parentMessage}
          currentMemberId={currentMemberId}
          onReact={onReact}
        />
      </div>

      <div className="px-4 py-2">
        <p className="text-xs text-white/25 font-medium">
          {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
        </p>
      </div>

      {/* Replies */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {loading && (
          <div className="flex items-center justify-center h-16">
            <div className="w-4 h-4 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin" />
          </div>
        )}

        {!loading && replies.length === 0 && (
          <div className="px-4 py-3 text-xs text-white/25">No replies yet — be the first</div>
        )}

        {replies.map(msg => (
          <MessageBubble
            key={msg.id}
            message={msg}
            currentMemberId={currentMemberId}
            onReact={onReact}
            onEdit={editReply}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <MessageInput channelName="thread" onSend={sendReply} />
    </div>
  );
}
