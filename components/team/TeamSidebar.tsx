'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { TeamChannel, TeamMemberPresence } from '@/lib/team/types';
import type { DMThread } from '@/lib/team/DMService';
import { CoLabTeamSwitcher } from './CoLabTeamSwitcher';
import { COLAB_TEAM_COOKIE } from '@/lib/team/colabConstants';

interface TeamSidebarProps {
  currentMemberId: string;
  currentTeamId: string | null;
}

function PresenceDot({ status }: { status: 'online' | 'away' | 'offline' }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
        status === 'online'  ? 'bg-emerald-400' :
        status === 'away'    ? 'bg-amber-400' :
                               'bg-white/20'
      }`}
    />
  );
}

// For You — directed attention loops addressed to me. Self-contained (own fetch +
// poll + badge) so it adds no state to TeamSidebar. Mirrors the Decisions link.
function ForYouLink() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch('/api/team/attention')
        .then(r => (r.ok ? r.json() : { openCount: 0 }))
        .then(d => { if (alive) setCount(d.openCount ?? 0); })
        .catch(() => {});
    load();
    const t = setInterval(load, 10000);
    return () => { alive = false; clearInterval(t); };
  }, []);
  const active = pathname === '/team/for-you';
  return (
    <Link
      href="/team/for-you"
      className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md mx-1 transition-colors ${
        active ? 'bg-rose-500/15 text-white/90' : 'text-white/45 hover:text-white/70 hover:bg-white/5'
      }`}
    >
      <span className="text-rose-400/70 text-xs">→</span>
      <span className="flex-1">For You</span>
      {count > 0 && (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-rose-500/80 text-white min-w-[18px] text-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}

function CreateChannelModal({ onClose, onCreated, currentMemberId, teamId }: {
  onClose: () => void;
  onCreated: (slug: string) => void;
  currentMemberId: string;
  teamId: string | null;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'text' | 'announcement'>('text');
  const [isPrivate, setIsPrivate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/team/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), slug, description: description.trim(), channelType: type, isPrivate, teamId }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? 'Failed to create channel');
        return;
      }
      onCreated(slug);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#16162a] border border-white/12 rounded-xl shadow-2xl w-80 p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white/90">Create a channel</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-xs text-white/40 mb-1">Name</label>
            <input
              ref={nameRef}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. announcements"
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder-white/25 focus:outline-none focus:border-amber-500/50"
            />
            {slug && <p className="mt-1 text-xs text-white/25">#{slug}</p>}
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1">Description <span className="text-white/20">(optional)</span></label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's this channel for?"
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder-white/25 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1">Type</label>
            <div className="flex gap-2">
              {(['text', 'announcement'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    type === t
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-zinc-800 border-white/10 text-white/40 hover:text-white/60'
                  }`}
                >
                  {t === 'text' ? 'Channel' : 'Announcement'}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={e => setIsPrivate(e.target.checked)}
              className="accent-amber-500"
            />
            Private — only invited members can see this channel
          </label>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={!slug || saving}
            className="w-full py-2 rounded-lg bg-amber-500 text-black text-sm font-semibold disabled:opacity-40 hover:bg-amber-400 transition-colors"
          >
            {saving ? 'Creating…' : 'Create channel'}
          </button>
        </form>
      </div>
    </div>
  );
}

function InviteModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [existing, setExisting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), message: message.trim() || undefined }),
      });
      if (res.ok) {
        const d = await res.json();
        // Existing accounts are added to the workspace directly; new people get an invite link.
        setExisting(Boolean(d.alreadyMember));
        setStatus('sent');
      } else {
        const d = await res.json().catch(() => ({}));
        setErrorMsg(d.error ?? 'Failed to send invite');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error — please try again');
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-[#16162a] border border-white/12 rounded-xl shadow-2xl w-80 p-6 text-center space-y-3" onClick={e => e.stopPropagation()}>
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-white/90">
            {existing ? `${email} added to the Co-lab` : `Invite sent to ${email}`}
          </p>
          <p className="text-xs text-white/40">
            {existing
              ? 'They already have a Soullab account — we emailed them a sign-in link.'
              : "They'll receive an email with a link to join."}
          </p>
          <button onClick={onClose} className="text-xs text-white/30 hover:text-white/60 transition-colors">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#16162a] border border-white/12 rounded-xl shadow-2xl w-80 p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white/90">Invite to Co-lab</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-xs text-white/40 mb-1">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="teammate@example.com"
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder-white/25 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1">Personal note <span className="text-white/20">(optional)</span></label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Add a personal note..."
              rows={3}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder-white/25 focus:outline-none focus:border-amber-500/50 resize-none"
            />
          </div>

          {status === 'error' && <p className="text-xs text-red-400">{errorMsg}</p>}

          <button
            type="submit"
            disabled={!email.trim() || status === 'sending'}
            className="w-full py-2 rounded-lg bg-amber-500 text-black text-sm font-semibold disabled:opacity-40 hover:bg-amber-400 transition-colors"
          >
            {status === 'sending' ? 'Sending...' : 'Send invite'}
          </button>
        </form>
      </div>
    </div>
  );
}

export function TeamSidebar({ currentMemberId, currentTeamId: initialTeamId }: TeamSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentSlug = (pathname ?? '').replace(/^\/team\/?/, '').split('/')[0] || 'general';
  const [teamId, setTeamId] = useState<string | null>(initialTeamId);
  const [channels, setChannels] = useState<TeamChannel[]>([]);
  const [presence, setPresence] = useState<TeamMemberPresence[]>([]);
  const [dmThreads, setDMThreads] = useState<DMThread[]>([]);
  const [allMembers, setAllMembers] = useState<Array<{ memberId: string; name: string; status: string }>>([]);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdmin = useCallback(async () => {
    const res = await fetch('/api/team/admin/stats');
    setIsAdmin(res.ok);
  }, []);

  // Keep the local team in sync if the server re-resolves it (e.g. after a
  // router.refresh() following a switch), then re-fetch that team's channels.
  useEffect(() => { setTeamId(initialTeamId); }, [initialTeamId]);

  const switchTeam = useCallback(async (nextTeamId: string) => {
    document.cookie = `${COLAB_TEAM_COOKIE}=${nextTeamId}; path=/; max-age=31536000; samesite=lax`;
    setTeamId(nextTeamId);
    // Land on a real channel in the target team — prefer #general, else the first
    // channel — so a team without #general doesn't drop onto a "not found" page.
    let landing = 'general';
    try {
      const res = await fetch(`/api/team/channels?teamId=${encodeURIComponent(nextTeamId)}`);
      if (res.ok) {
        const { channels = [] } = await res.json();
        landing =
          channels.find((c: TeamChannel) => c.slug === 'general')?.slug ??
          channels[0]?.slug ??
          'general';
      }
    } catch {
      /* fall back to #general (shows the empty state for a channel-less team) */
    }
    router.push(`/team/${landing}`);
    router.refresh();
  }, [router]);

  const loadChannels = useCallback(async () => {
    const qs = teamId ? `?teamId=${encodeURIComponent(teamId)}` : '';
    const res = await fetch(`/api/team/channels${qs}`);
    if (res.ok) { const d = await res.json(); setChannels(d.channels ?? []); }
  }, [teamId]);

  const loadDMs = useCallback(async () => {
    const res = await fetch('/api/team/dm');
    if (res.ok) { const d = await res.json(); setDMThreads(d.threads ?? []); }
  }, []);

  const loadMembers = useCallback(async () => {
    const res = await fetch('/api/team/members');
    if (res.ok) { const d = await res.json(); setAllMembers(d.members ?? []); }
  }, []);

  const loadPresence = useCallback(async () => {
    const res = await fetch('/api/team/presence');
    if (res.ok) { const d = await res.json(); setPresence(d.presence ?? []); }
  }, []);

  const sendHeartbeat = useCallback(async () => {
    await fetch('/api/team/presence', { method: 'POST' });
  }, []);

  const openDM = useCallback(async (targetMemberId: string) => {
    const res = await fetch('/api/team/dm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetMemberId }),
    });
    if (res.ok) {
      const { dmThreadId } = await res.json();
      await loadDMs();
      router.push(`/team/dm/${dmThreadId}`);
    }
  }, [loadDMs, router]);

  useEffect(() => {
    loadChannels();
    loadDMs();
    loadMembers();
    loadPresence();
    sendHeartbeat();
    checkAdmin();

    const presenceInterval = setInterval(() => {
      loadPresence();
      loadDMs();
      sendHeartbeat();
    }, 25000);

    return () => clearInterval(presenceInterval);
  }, [loadChannels, loadDMs, loadMembers, loadPresence, sendHeartbeat, checkAdmin]);

  const announcements = channels.filter(c => c.channelType === 'announcement');
  const regular = channels.filter(c => c.channelType === 'text');

  return (
    <>
      {showInvite && (
        <InviteModal onClose={() => setShowInvite(false)} />
      )}

      {showCreateChannel && (
        <CreateChannelModal
          onClose={() => setShowCreateChannel(false)}
          currentMemberId={currentMemberId}
          teamId={teamId}
          onCreated={async (slug) => {
            setShowCreateChannel(false);
            await loadChannels();
            router.push(`/team/${slug}`);
          }}
        />
      )}

      <aside className="w-full md:w-56 flex-shrink-0 bg-[#16162a] border-r border-white/8 flex flex-col h-full">
        {/* Workspace header — switch / create workspaces */}
        <div className="px-4 py-3 border-b border-white/8">
          <CoLabTeamSwitcher currentTeamId={teamId} onSwitch={switchTeam} />
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto scrollbar-hide py-3">
          {/* Attention surfaces — what's addressed to me, and what we decided */}
          <div className="px-1 pb-2 mb-1 border-b border-white/5 space-y-0.5">
            <ForYouLink />
            <Link
              href="/team/decisions"
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md mx-1 transition-colors ${
                pathname === '/team/decisions'
                  ? 'bg-emerald-500/15 text-white/90'
                  : 'text-white/45 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <span className="text-emerald-400/70 text-xs">✓</span>
              <span className="flex-1">Decisions</span>
            </Link>
          </div>

          {/* Announcements */}
          {announcements.length > 0 && (
            <ChannelGroup label="Announcements">
              {announcements.map(ch => (
                <ChannelItem key={ch.id} channel={ch} active={ch.slug === currentSlug} />
              ))}
            </ChannelGroup>
          )}

          {/* Channels */}
          <ChannelGroup
            label="Channels"
            action={
              <button
                onClick={() => setShowCreateChannel(true)}
                className="text-white/60 hover:text-white hover:bg-white/10 transition-colors w-5 h-5 flex items-center justify-center rounded"
                title="Create a channel"
                aria-label="Create a channel"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            }
          >
            {regular.map(ch => (
              <ChannelItem key={ch.id} channel={ch} active={ch.slug === currentSlug} />
            ))}
          </ChannelGroup>

          {/* Direct Messages */}
          <ChannelGroup
            label="Direct Messages"
            action={
              <button
                onClick={() => setShowInvite(true)}
                className="text-white/55 hover:text-white/90 transition-colors text-xs"
                title="Invite to Co-lab"
              >
                + Invite
              </button>
            }
          >
            {dmThreads.map(thread => {
              const others = thread.members.filter(m => m.memberId !== currentMemberId);
              const name = others.map(m => m.name).join(', ') || 'DM';
              const isActive = pathname === `/team/dm/${thread.id}`;
              const firstStatus = others[0]?.status ?? 'offline';
              return (
                <div key={thread.id} className="group relative flex items-center mx-1">
                  <Link
                    href={`/team/dm/${thread.id}`}
                    className={`flex-1 flex items-center gap-2 px-4 py-1.5 text-sm transition-colors rounded-md ${
                      isActive
                        ? 'bg-amber-500/15 text-white/90'
                        : 'text-white/45 hover:text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <PresenceDot status={firstStatus} />
                    <span className="flex-1 truncate">{name}</span>
                    {(thread.unreadCount ?? 0) > 0 && !isActive && (
                      <span className="text-xs bg-amber-500 text-black font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {thread.unreadCount > 99 ? '99+' : thread.unreadCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      await fetch(`/api/team/dm/${thread.id}`, { method: 'DELETE' });
                      setDMThreads(prev => prev.filter(t => t.id !== thread.id));
                      if (isActive) router.push('/team/general');
                    }}
                    className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-white/70 p-1 rounded"
                    title="Hide conversation"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </ChannelGroup>

          {/* All members — click to DM */}
          {allMembers.length > 0 && (
            <div className="mt-2">
              <p className="px-4 py-1 text-xs font-semibold text-white/25 uppercase tracking-wider">
                Team · {allMembers.length}
              </p>
              <div className="mt-0.5 space-y-0.5">
                {allMembers.filter(m => m.memberId !== currentMemberId).map(m => (
                  <button
                    key={m.memberId}
                    onClick={() => openDM(m.memberId)}
                    className="w-full flex items-center gap-2 px-4 py-1 text-left hover:bg-white/5 rounded-md mx-1 transition-colors"
                  >
                    <PresenceDot status={m.status as 'online' | 'away' | 'offline'} />
                    <span className="text-xs text-white/45 truncate">{m.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/8 flex flex-col gap-1.5">
          <Link
            href="/team/notifications"
            className={`text-xs transition-colors ${
              pathname === '/team/notifications'
                ? 'text-white/80'
                : 'text-white/25 hover:text-white/50'
            }`}
          >
            🔔 Notifications
          </Link>
          {isAdmin && (
            <Link
              href="/team/admin"
              className="text-xs text-amber-400/40 hover:text-amber-400/70 transition-colors"
            >
              ⚙ Admin
            </Link>
          )}
          <Link
            href="/studio"
            className="text-xs text-white/25 hover:text-white/50 transition-colors"
          >
            ← Back to Studio
          </Link>
        </div>
      </aside>
    </>
  );
}

function ChannelGroup({ label, children, action }: { label: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between px-4 py-1">
        <p className="text-xs font-semibold text-white/45 uppercase tracking-wider">{label}</p>
        {action}
      </div>
      <div className="mt-0.5 space-y-0.5">
        {children}
      </div>
    </div>
  );
}

function ChannelItem({ channel, active }: { channel: TeamChannel; active: boolean }) {
  return (
    <Link
      href={`/team/${channel.slug}`}
      className={`flex items-center gap-2 px-4 py-1.5 text-sm transition-colors rounded-md mx-1 ${
        active
          ? 'bg-amber-500/15 text-white/90'
          : 'text-white/45 hover:text-white/70 hover:bg-white/5'
      }`}
    >
      {channel.isPrivate ? (
        <svg className="w-3 h-3 text-white/25 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ) : (
        <span className="text-white/25 text-xs">#</span>
      )}
      <span className="flex-1 truncate">{channel.name}</span>
      {(channel.unreadCount ?? 0) > 0 && !active && (
        <span className="text-xs bg-amber-500 text-black font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {channel.unreadCount! > 99 ? '99+' : channel.unreadCount}
        </span>
      )}
    </Link>
  );
}
