'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { TeamChannel, TeamMemberPresence } from '@/lib/team/types';
import type { DMThread } from '@/lib/team/DMService';

interface TeamSidebarProps {
  currentMemberId: string;
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

export function TeamSidebar({ currentMemberId }: TeamSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentSlug = pathname.replace(/^\/team\/?/, '').split('/')[0] || 'general';
  const [channels, setChannels] = useState<TeamChannel[]>([]);
  const [presence, setPresence] = useState<TeamMemberPresence[]>([]);
  const [dmThreads, setDMThreads] = useState<DMThread[]>([]);
  const [allMembers, setAllMembers] = useState<Array<{ memberId: string; name: string; status: string }>>([]);

  const loadChannels = useCallback(async () => {
    const res = await fetch('/api/team/channels');
    if (res.ok) { const d = await res.json(); setChannels(d.channels ?? []); }
  }, []);

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

    const presenceInterval = setInterval(() => {
      loadPresence();
      loadDMs();
      sendHeartbeat();
    }, 25000);

    return () => clearInterval(presenceInterval);
  }, [loadChannels, loadDMs, loadMembers, loadPresence, sendHeartbeat]);

  const announcements = channels.filter(c => c.channelType === 'announcement');
  const regular = channels.filter(c => c.channelType === 'text');

  return (
    <aside className="w-56 flex-shrink-0 bg-zinc-900/80 border-r border-white/8 flex flex-col h-full">
      {/* Workspace header */}
      <div className="px-4 py-3 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          {/* Holoflower with warm glow */}
          <div className="relative flex-shrink-0 w-7 h-7 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(212,184,150,0.4) 0%, transparent 70%)',
                filter: 'blur(6px)',
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/holoflower.svg"
              alt="Soullab"
              width={24}
              height={24}
              className="relative z-10 w-6 h-6 object-contain"
              style={{ filter: 'drop-shadow(0 0 6px rgba(212,184,150,0.5))' }}
            />
          </div>
          {/* Wordmark */}
          <span
            className="text-xs font-semibold tracking-[0.18em] text-white/70 uppercase"
            style={{ fontFamily: 'var(--font-sans, inherit)', letterSpacing: '0.18em' }}
          >
            Soullab
          </span>
        </div>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-3">
        {/* Announcements */}
        {announcements.length > 0 && (
          <ChannelGroup label="Announcements">
            {announcements.map(ch => (
              <ChannelItem key={ch.id} channel={ch} active={ch.slug === currentSlug} />
            ))}
          </ChannelGroup>
        )}

        {/* Channels */}
        <ChannelGroup label="Channels">
          {regular.map(ch => (
            <ChannelItem key={ch.id} channel={ch} active={ch.slug === currentSlug} />
          ))}
        </ChannelGroup>

        {/* Direct Messages */}
        <ChannelGroup
          label="Direct Messages"
          action={<span className="text-white/20 text-xs">New</span>}
        >
          {dmThreads.map(thread => {
            const others = thread.members.filter(m => m.memberId !== currentMemberId);
            const name = others.map(m => m.name).join(', ') || 'DM';
            const isActive = pathname === `/team/dm/${thread.id}`;
            const firstStatus = others[0]?.status ?? 'offline';
            return (
              <Link
                key={thread.id}
                href={`/team/dm/${thread.id}`}
                className={`flex items-center gap-2 px-4 py-1.5 text-sm transition-colors rounded-md mx-1 ${
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
      <div className="px-4 py-3 border-t border-white/8">
        <Link
          href="/studio"
          className="text-xs text-white/25 hover:text-white/50 transition-colors"
        >
          ← Back to Studio
        </Link>
      </div>
    </aside>
  );
}

function ChannelGroup({ label, children, action }: { label: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between px-4 py-1">
        <p className="text-xs font-semibold text-white/25 uppercase tracking-wider">{label}</p>
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
      <span className="text-white/25 text-xs">#</span>
      <span className="flex-1 truncate">{channel.name}</span>
      {(channel.unreadCount ?? 0) > 0 && !active && (
        <span className="text-xs bg-amber-500 text-black font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {channel.unreadCount! > 99 ? '99+' : channel.unreadCount}
        </span>
      )}
    </Link>
  );
}
