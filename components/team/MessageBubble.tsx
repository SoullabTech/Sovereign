'use client';

import { useState } from 'react';
import type { TeamMessage } from '@/lib/team/types';

const QUICK_REACTIONS = ['👍', '❤️', '🔥', '🎉', '✅', '🤔'];

interface MessageBubbleProps {
  message: TeamMessage;
  currentMemberId: string;
  onReact: (messageId: string, emoji: string) => void;
  onOpenThread?: (message: TeamMessage) => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

export function MessageBubble({ message, currentMemberId, onReact, onOpenThread }: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);
  const isOwn = message.senderId === currentMemberId;

  const initials = message.senderName
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className="group flex gap-3 px-4 py-1.5 hover:bg-white/[0.03] rounded-lg transition-colors relative"
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5"
        style={{ background: stringToColor(message.senderId) }}
      >
        {initials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-white/90">
            {message.senderName}
            {isOwn && <span className="text-xs text-white/30 font-normal ml-1">(you)</span>}
          </span>
          <span className="text-xs text-white/30">{formatTime(message.createdAt)}</span>
          {message.editedAt && (
            <span className="text-xs text-white/25 italic">edited</span>
          )}
        </div>

        <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap break-words">
          {message.body}
        </p>

        {/* Reactions */}
        {message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {message.reactions.map(r => (
              <button
                key={r.emoji}
                onClick={() => onReact(message.id, r.emoji)}
                className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-colors ${
                  r.hasMine
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <span>{r.emoji}</span>
                <span>{r.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick reaction toolbar (hover) */}
      {showReactions && (
        <div className="absolute right-4 -top-4 flex gap-0.5 bg-zinc-800 border border-white/10 rounded-lg p-1 shadow-xl z-10">
          {QUICK_REACTIONS.map(emoji => (
            <button
              key={emoji}
              onClick={() => onReact(message.id, emoji)}
              className="w-7 h-7 flex items-center justify-center text-base hover:bg-white/10 rounded transition-colors"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
          {onOpenThread && !message.parentId && (
            <button
              onClick={() => onOpenThread(message)}
              className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/10 rounded transition-colors ml-0.5"
              title="Open thread"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Thread reply count badge */}
      {!message.parentId && (message.replyCount ?? 0) > 0 && (
        <button
          onClick={() => onOpenThread?.(message)}
          className="mt-1 ml-11 text-xs text-amber-400/70 hover:text-amber-400 transition-colors flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {message.replyCount} {message.replyCount === 1 ? 'reply' : 'replies'}
        </button>
      )}
    </div>
  );
}

export function DateDivider({ iso }: { iso: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-xs text-white/30 font-medium">{formatDate(iso)}</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

// Deterministic color from member ID
function stringToColor(str: string): string {
  const colors = [
    '#7c5cbf', '#4f8fcc', '#3fa88a', '#c05c7e',
    '#c08c3f', '#5c8fcc', '#8f5ccc', '#3f9c7a',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
