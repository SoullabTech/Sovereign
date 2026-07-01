'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { DMMessage, DMThread } from '@/lib/team/DMService';
import { MessageInput } from './MessageInput';
import { MessageText } from './MessageText';
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
  const [lastReadAt, setLastReadAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
      .then(data => {
        setLastReadAt(data.lastReadAt ?? null);
        setMessages(data.messages ?? []);
      })
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

  // Soft-delete own DM message. Optimistic; roll back on failure.
  const handleDelete = async (messageId: string) => {
    const prev = messages;
    setMessages(p => p.filter(m => m.id !== messageId));
    setConfirmDeleteId(null);
    const res = await fetch(`/api/team/dm/${dmThread.id}/messages/${messageId}`, {
      method: 'DELETE',
    }).catch(() => null);
    if (!res || !res.ok) setMessages(prev);
  };

  // Edit own DM message. Optimistic; roll back on failure.
  const saveEdit = async (messageId: string) => {
    const v = editValue.trim();
    const orig = messages.find(m => m.id === messageId)?.body;
    if (!v || v === orig) { setEditingId(null); return; }
    const prev = messages;
    setMessages(p => p.map(m => m.id === messageId ? { ...m, body: v, editedAt: new Date().toISOString() } : m));
    setEditingId(null);
    const res = await fetch(`/api/team/dm/${dmThread.id}/messages/${messageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: v }),
    }).catch(() => null);
    if (!res || !res.ok) { setMessages(prev); return; }
    const data = await res.json().catch(() => null);
    if (data?.editedAt) setMessages(p => p.map(m => m.id === messageId ? { ...m, editedAt: data.editedAt } : m));
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

        {messages.map((msg, idx) => {
          const isOwn = msg.senderId === currentMemberId;
          const initials = msg.senderName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
          const editing = editingId === msg.id;
          // Show "New" divider at the first message after lastReadAt (only for messages not sent by current member)
          const isFirstUnread = lastReadAt != null
            && !isOwn
            && msg.createdAt > lastReadAt
            && (idx === 0 || messages[idx - 1].createdAt <= lastReadAt);
          return (
            <div key={msg.id}>
              {isFirstUnread && (
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="flex-1 h-px bg-rose-400/40" />
                  <span className="text-xs text-rose-300/80 font-medium tracking-wide">New</span>
                  <div className="flex-1 h-px bg-rose-400/40" />
                </div>
              )}
            <div className="group relative flex gap-3 px-4 py-1.5 hover:bg-white/[0.03] rounded-lg transition-colors">
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
                  {msg.editedAt && <span className="text-xs text-white/25 italic">edited</span>}
                </div>
                {editing ? (
                  <div className="mt-1">
                    <textarea
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(msg.id); }
                        else if (e.key === 'Escape') { e.preventDefault(); setEditingId(null); }
                      }}
                      autoFocus
                      rows={Math.min(10, Math.max(2, editValue.split('\n').length))}
                      className="w-full bg-zinc-800 border border-white/15 rounded-md px-2.5 py-1.5 text-sm text-white/85 focus:outline-none focus:border-amber-500/50 resize-y"
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => saveEdit(msg.id)}
                        disabled={!editValue.trim() || editValue.trim() === msg.body}
                        className="text-xs font-medium bg-amber-500 text-black rounded px-2.5 py-1 disabled:opacity-40 hover:bg-amber-400 transition-colors"
                      >
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-xs text-white/50 hover:text-white/80 transition-colors">Cancel</button>
                      <span className="text-[10px] text-white/30">Enter to save · Esc to cancel</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap break-words">
                    <MessageText body={msg.body} />
                  </p>
                )}
              </div>

              {/* Own-message actions (sender-only) */}
              {isOwn && !editing && (
                <div className="absolute right-3 -top-3 flex gap-0.5 bg-zinc-800 border border-white/10 rounded-lg p-1 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditingId(msg.id); setEditValue(msg.body); }}
                    title="Edit message"
                    className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-amber-300 hover:bg-white/10 rounded transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(msg.id)}
                    title="Delete message"
                    className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-white/10 rounded transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Delete confirm */}
              {confirmDeleteId === msg.id && (
                <div className="absolute right-3 top-6 w-56 bg-zinc-800 border border-white/12 rounded-lg p-3 shadow-xl z-20 flex flex-col gap-2.5">
                  <div>
                    <p className="text-xs font-semibold text-white/85">Delete message?</p>
                    <p className="text-[11px] text-white/50 leading-relaxed mt-1">It&apos;s removed from the conversation but not erased.</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => setConfirmDeleteId(null)} className="flex-1 text-xs text-white/60 hover:text-white/90 hover:bg-white/5 rounded px-2 py-1.5 transition-colors">Cancel</button>
                    <button onClick={() => handleDelete(msg.id)} className="flex-1 text-xs font-medium bg-red-500/80 hover:bg-red-500 text-white rounded px-2 py-1.5 transition-colors">Delete</button>
                  </div>
                </div>
              )}
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
