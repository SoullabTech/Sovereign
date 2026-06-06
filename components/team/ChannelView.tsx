'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { TeamChannel, TeamMessage, MessageKind } from '@/lib/team/types';
import { MessageBubble, DateDivider } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { ThreadPanel } from './ThreadPanel';
import { useChannelStream } from './useChannelStream';
import { ChannelPurposeHeader } from './ChannelPurposeHeader';
import { ChannelMembersPanel } from './ChannelMembersPanel';

interface ChannelViewProps {
  channel: TeamChannel;
  currentMemberId: string;
}

function sameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export function ChannelView({ channel, currentMemberId }: ChannelViewProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [threadMessage, setThreadMessage] = useState<TeamMessage | null>(null);
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [memberCount, setMemberCount] = useState<number | undefined>(undefined);
  const [accessRevoked, setAccessRevoked] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [capturedIds, setCapturedIds] = useState<Set<string>>(new Set());
  // Option A — offer "Create Task" immediately after capture (no Decisions detour)
  const [captureAction, setCaptureAction] = useState<{ decisionId: string; title: string } | null>(null);
  const [taskMembers, setTaskMembers] = useState<{ memberId: string; name: string }[]>([]);
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskBusy, setTaskBusy] = useState(false);
  const [showAssign, setShowAssign] = useState(false);

  // Pick up redirect toast (e.g. set when access was revoked from another channel)
  useEffect(() => {
    try {
      const t = sessionStorage.getItem('team:toast');
      if (t) {
        sessionStorage.removeItem('team:toast');
        setToast(t);
        setTimeout(() => setToast(null), 5000);
      }
    } catch { /* ignore */ }
  }, [channel.id]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);

  // Bounce out when the channel goes private and the user isn't a member.
  // Triggered by 403 from /messages GET or POST.
  const handleAccessRevoked = useCallback(() => {
    setAccessRevoked(true);
    setTimeout(() => {
      try {
        sessionStorage.setItem(
          'team:toast',
          `You no longer have access to #${channel.slug}.`
        );
      } catch { /* ignore */ }
      router.push('/team');
    }, 1200);
  }, [router, channel.slug]);

  // Latest message timestamp for SSE cursor
  const latestTs = messages.length > 0
    ? new Date(messages[messages.length - 1].createdAt).getTime()
    : 0;

  // Load member count for private channels
  useEffect(() => {
    if (!channel.isPrivate) return;
    fetch(`/api/team/channels/${channel.id}/members`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.members) setMemberCount(d.members.length); })
      .catch(() => undefined);
  }, [channel.id, channel.isPrivate]);

  // Load initial history
  useEffect(() => {
    setLoading(true);
    setMessages([]);
    setAccessRevoked(false);
    fetch(`/api/team/channels/${channel.id}/messages?limit=50`)
      .then(async r => {
        if (r.status === 403) {
          handleAccessRevoked();
          return null;
        }
        if (!r.ok) {
          setError('Failed to load messages');
          return null;
        }
        return r.json();
      })
      .then(data => { if (data) setMessages(data.messages ?? []); })
      .catch(() => setError('Failed to load messages'))
      .finally(() => setLoading(false));
  }, [channel.id, handleAccessRevoked]);

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

  const sendMessage = async (body: string, messageKind: MessageKind = 'build') => {
    const res = await fetch(`/api/team/channels/${channel.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body, messageKind }),
    });
    if (res.status === 403) {
      handleAccessRevoked();
      throw new Error('Access revoked');
    }
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
    const res = await fetch(`/api/team/channels/${channel.id}/maia-reflect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, messageBody: msg.body, reflectMode: mode }),
    });
    if (res.status === 403) {
      handleAccessRevoked();
      return;
    }
    // The response will arrive via SSE — no need to manually add it
  };

  // Capture a channel message as an operational Team Decision (studio_decisions).
  // "A decision becomes operational when it is captured into Studio Decisions."
  const handleCaptureDecision = async (messageId: string) => {
    const showToast = (msg: string) => {
      setToast(msg);
      setTimeout(() => setToast(null), 4000);
    };
    try {
      const res = await fetch(`/api/team/channels/${channel.id}/decisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId }),
      });
      if (res.status === 403) { handleAccessRevoked(); return; }
      if (!res.ok) { showToast('Could not capture decision. Try again.'); return; }
      const data = await res.json().catch(() => ({}));
      setCapturedIds(prev => new Set(prev).add(messageId));
      const decision = data.decision;
      if (decision?.id) {
        // Offer Create Task right here (Option A) instead of routing to Team Decisions.
        setCaptureAction({ decisionId: decision.id, title: decision.title || 'Decision' });
        setShowAssign(false);
        setTaskAssignee('');
        if (taskMembers.length === 0) {
          fetch('/api/team/members')
            .then(r => (r.ok ? r.json() : { members: [] }))
            .then(d => setTaskMembers(d.members ?? []))
            .catch(() => {});
        }
      } else {
        showToast(data.alreadyCaptured ? 'Already in Team Decisions.' : 'Captured to Team Decisions.');
      }
    } catch {
      showToast('Could not capture decision. Try again.');
    }
  };

  // Option A — create a task straight from the just-captured decision.
  const createTaskFromCapture = async () => {
    if (!captureAction) return;
    setTaskBusy(true);
    try {
      const res = await fetch(`/api/team/decisions/${captureAction.decisionId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: captureAction.title, assignee: taskAssignee || undefined }),
      });
      if (res.ok) {
        setCaptureAction(null);
        setShowAssign(false);
        setTaskAssignee('');
        setToast(taskAssignee ? `Task created · assigned to ${taskAssignee}` : 'Task created');
        setTimeout(() => setToast(null), 4000);
      } else {
        setToast('Could not create task. Try again.');
        setTimeout(() => setToast(null), 4000);
      }
    } catch {
      setToast('Could not create task. Try again.');
      setTimeout(() => setToast(null), 4000);
    } finally {
      setTaskBusy(false);
    }
  };

  if (accessRevoked) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
        <svg className="w-8 h-8 text-amber-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-white/60 text-sm">
          #{channel.slug} is now private and you're not a member.
        </p>
        <p className="text-white/30 text-xs">Returning to your channels…</p>
      </div>
    );
  }

  const mainCol = (
    <div className="flex flex-col flex-1 min-w-0">
      {toast && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-5 py-2 text-xs text-amber-300 flex items-center justify-between">
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="text-amber-300/60 hover:text-amber-300" aria-label="Dismiss">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      {/* Option A — actionable post-capture banner: Create Task without leaving the conversation */}
      {captureAction && (
        <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-4 py-2.5 text-xs text-emerald-100 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="text-emerald-400 flex-shrink-0">✓</span>
              <span className="truncate">Captured to Team Decisions</span>
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              {!showAssign && (
                <button
                  onClick={() => setShowAssign(true)}
                  className="px-2.5 py-1 rounded-md bg-amber-500 text-black font-medium hover:bg-amber-400 transition-colors"
                >
                  Create task
                </button>
              )}
              <a href="/team/decisions" className="text-emerald-300/70 hover:text-emerald-200 underline underline-offset-2">View</a>
              <button
                onClick={() => { setCaptureAction(null); setShowAssign(false); }}
                aria-label="Dismiss"
                className="text-emerald-300/50 hover:text-emerald-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          {showAssign && (
            <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-emerald-500/20">
              <span className="text-white/50">Assign to</span>
              <select
                value={taskAssignee}
                onChange={e => setTaskAssignee(e.target.value)}
                className="bg-[#1a1a2e] border border-white/10 rounded-md px-2 py-1 text-xs text-white/80 focus:outline-none focus:border-amber-500/50"
              >
                <option value="">Unassigned</option>
                {taskMembers.map(m => (
                  <option key={m.memberId} value={m.name}>{m.name}</option>
                ))}
              </select>
              <button
                onClick={createTaskFromCapture}
                disabled={taskBusy}
                className="px-2.5 py-1 rounded-md bg-amber-500 text-black font-medium disabled:opacity-40 hover:bg-amber-400 transition-colors"
              >
                {taskBusy ? 'Creating…' : 'Create'}
              </button>
              <button onClick={() => setShowAssign(false)} className="text-white/40 hover:text-white/70">Cancel</button>
            </div>
          )}
        </div>
      )}
      <ChannelPurposeHeader
        channel={channel}
        currentMemberId={currentMemberId}
        memberCount={memberCount}
        onOpenMembers={channel.isPrivate ? () => setShowMembersPanel(p => !p) : undefined}
        onVisibilityChanged={() => {
          // Re-fetch the page to get fresh channel data + sidebar refresh
          if (typeof window !== 'undefined') window.location.reload();
        }}
      />

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
                onCaptureDecision={handleCaptureDecision}
                captured={capturedIds.has(msg.id)}
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
      {showMembersPanel && channel.isPrivate && (
        <ChannelMembersPanel
          channelId={channel.id}
          currentMemberId={currentMemberId}
          onClose={() => setShowMembersPanel(false)}
        />
      )}
    </div>
  );
}
