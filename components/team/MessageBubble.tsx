'use client';

import { useState } from 'react';
import type { TeamMessage, MessageKind } from '@/lib/team/types';
import { MessageText } from './MessageText';

const KIND_BADGE: Record<Exclude<MessageKind, 'build'>, { label: string; className: string }> = {
  question: {
    label: '? Question',
    className: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  },
  request: {
    label: '→ Request',
    className: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  },
  decision: {
    label: '\u2713 Decision',
    className: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  insight: {
    label: '\u25C8 Insight',
    className: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
};

const QUICK_REACTIONS = ['👍', '❤️', '🔥', '🎉', '✅', '🤔'];

const REFLECT_MODES = [
  { key: 'reflect',  label: 'Reflect' },
  { key: 'pattern',  label: 'Pattern' },
  { key: 'element',  label: 'Element' },
  { key: 'shadow',   label: 'Shadow' },
  { key: 'practice', label: 'Practice' },
] as const;

interface MessageBubbleProps {
  message: TeamMessage;
  currentMemberId: string;
  onReact: (messageId: string, emoji: string) => void;
  onOpenThread?: (message: TeamMessage) => void;
  onReflect?: (messageId: string, mode: string) => void;
  onCaptureDecision?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  /** True if the current member can moderate (delete others') in this channel. */
  canModerate?: boolean;
  captured?: boolean;
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

export function MessageBubble({ message, currentMemberId, onReact, onOpenThread, onReflect, onCaptureDecision, onDelete, canModerate, captured }: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [showReflectMenu, setShowReflectMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isOwn = message.senderId === currentMemberId;
  const isMaia = message.senderType === 'maia';
  // You can always delete your own; moderators can delete anyone's.
  const canDelete = !!onDelete && !isMaia && (isOwn || !!canModerate);

  const initials = isMaia
    ? 'M'
    : message.senderName
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

  const avatarStyle = isMaia
    ? { background: 'rgba(245,158,11,0.25)' }
    : { background: stringToColor(message.senderId) };

  return (
    <div
      className={`group flex gap-3 px-4 py-1.5 rounded-lg transition-colors relative ${
        isMaia
          ? 'bg-amber-500/[0.04] hover:bg-amber-500/[0.07]'
          : 'hover:bg-white/[0.03]'
      }`}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => { setShowReactions(false); setShowReflectMenu(false); setShowDeleteConfirm(false); }}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5 ${
          isMaia ? 'text-amber-400' : ''
        }`}
        style={avatarStyle}
      >
        {initials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className={`text-sm font-semibold ${isMaia ? 'text-amber-400/90' : 'text-white/90'}`}>
            {message.senderName}
            {isOwn && !isMaia && <span className="text-xs text-white/30 font-normal ml-1">(you)</span>}
          </span>
          <span className="text-xs text-white/30">{formatTime(message.createdAt)}</span>
          {message.editedAt && (
            <span className="text-xs text-white/25 italic">edited</span>
          )}
          {message.messageKind && message.messageKind !== 'build' && KIND_BADGE[message.messageKind] && (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${KIND_BADGE[message.messageKind].className}`}>
              {KIND_BADGE[message.messageKind].label}
            </span>
          )}
          {captured && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
              ✓ Captured
            </span>
          )}
        </div>

        <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap break-words">
          <MessageText body={message.body} />
        </p>

        {/* Reactions */}
        {message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {message.reactions.map(r => (
              <button
                key={r.emoji}
                onClick={() => !isMaia && onReact(message.id, r.emoji)}
                disabled={isMaia}
                className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-colors ${
                  r.hasMine
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                } ${isMaia ? 'cursor-default' : ''}`}
              >
                <span>{r.emoji}</span>
                <span>{r.count}</span>
              </button>
            ))}
          </div>
        )}
        {/* Sender-side attention receipts (own messages): Sent / Opened / Resolved / Declined.
            "Opened" = receipt that it reached them — never agreement or completion (D2). */}
        {isOwn && message.attentionStates && message.attentionStates.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {message.attentionStates.map((s, i) => {
              const label =
                s.status === 'resolved' ? 'Resolved'
                : s.status === 'declined' ? 'Declined'
                : s.opened ? 'Opened'
                : 'Sent';
              const cls =
                s.status === 'resolved' ? 'text-emerald-300/80'
                : s.status === 'declined' ? 'text-white/40'
                : s.opened ? 'text-sky-300/80'
                : 'text-white/35';
              return (
                <span key={i} className={`text-[10px] ${cls}`}>
                  {s.recipientName}: {label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick reaction toolbar (hover) — not shown for MAIA messages */}
      {showReactions && !isMaia && (
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
          {/* Capture as Team Decision */}
          {onCaptureDecision && !captured && (
            <button
              onClick={() => onCaptureDecision(message.id)}
              className="w-7 h-7 flex items-center justify-center text-emerald-400/50 hover:text-emerald-400/90 hover:bg-white/10 rounded transition-colors ml-0.5"
              title="Capture as Team Decision"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}

          {/* MAIA Reflect button */}
          {onReflect && (
            <div className="relative ml-0.5">
              <button
                onClick={() => setShowReflectMenu(v => !v)}
                className="w-7 h-7 flex items-center justify-center text-amber-400/50 hover:text-amber-400/90 hover:bg-white/10 rounded transition-colors"
                title="Ask MAIA to reflect"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3l14 9-14 9V3z" />
                </svg>
              </button>
              {showReflectMenu && (
                <div className="absolute right-0 top-8 bg-zinc-800 border border-white/12 rounded-lg p-1.5 shadow-xl z-20 flex flex-col gap-0.5 min-w-[110px]">
                  {REFLECT_MODES.map(m => (
                    <button
                      key={m.key}
                      onClick={() => { onReflect(message.id, m.key); setShowReflectMenu(false); setShowReactions(false); }}
                      className="text-left text-xs text-white/60 hover:text-amber-300 hover:bg-white/5 rounded px-2 py-1.5 transition-colors"
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Delete message — own messages always; others' only for moderators */}
          {canDelete && (
            <div className="relative ml-0.5">
              <button
                onClick={() => { setShowDeleteConfirm(v => !v); setShowReflectMenu(false); }}
                className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-white/10 rounded transition-colors"
                title="Delete message"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              {showDeleteConfirm && (
                <div className="absolute right-0 top-8 w-60 bg-zinc-800 border border-white/12 rounded-lg p-3 shadow-xl z-20 flex flex-col gap-2.5 text-left">
                  <div>
                    <p className="text-xs font-semibold text-white/85">Delete message?</p>
                    <p className="text-[11px] text-white/50 leading-relaxed mt-1">
                      It&apos;s removed from the conversation but not erased. A record — including who deleted it — is kept for moderation.
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 text-xs text-white/60 hover:text-white/90 hover:bg-white/5 rounded px-2 py-1.5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { onDelete?.(message.id); setShowDeleteConfirm(false); setShowReactions(false); }}
                      className="flex-1 text-xs font-medium bg-red-500/80 hover:bg-red-500 text-white rounded px-2 py-1.5 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
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
