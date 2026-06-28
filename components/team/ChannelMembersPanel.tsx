'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ChannelMember } from '@/lib/team/types';

function stringToColor(str: string): string {
  const colors = ['#7c5cbf','#4f8fcc','#3fa88a','#c05c7e','#c08c3f','#5c8fcc','#8f5ccc','#3f9c7a'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function PresenceDot({ status }: { status: 'online' | 'away' | 'offline' }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
      status === 'online' ? 'bg-emerald-400' :
      status === 'away'   ? 'bg-amber-400' :
                            'bg-white/20'
    }`} />
  );
}

interface AllMember {
  memberId: string;
  name: string;
  status: string;
}

interface ChannelMembersPanelProps {
  channelId: string;
  currentMemberId: string;
  /** Only admins may add/remove members; others see a read-only roster. */
  canManage?: boolean;
  onClose: () => void;
}

export function ChannelMembersPanel({ channelId, currentMemberId, canManage = false, onClose }: ChannelMembersPanelProps) {
  const [members, setMembers] = useState<ChannelMember[]>([]);
  const [allMembers, setAllMembers] = useState<AllMember[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    const res = await fetch(`/api/team/channels/${channelId}/members`);
    if (res.ok) {
      const d = await res.json();
      setMembers(d.members ?? []);
    }
    setLoading(false);
  }, [channelId]);

  const loadAllMembers = useCallback(async () => {
    const res = await fetch('/api/team/members');
    if (res.ok) {
      const d = await res.json();
      setAllMembers(d.members ?? []);
    }
  }, []);

  useEffect(() => {
    loadMembers();
    loadAllMembers();
  }, [loadMembers, loadAllMembers]);

  const memberIds = new Set(members.map(m => m.memberId));

  const addMember = async (targetId: string) => {
    setSaving(targetId);
    setError(null);
    const res = await fetch(`/api/team/channels/${channelId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: targetId }),
    }).catch(() => null);
    if (res && res.ok) {
      await loadMembers();
      setSearch('');
    } else {
      setError(res?.status === 403 ? 'Only admins can add members.' : 'Could not add member.');
    }
    setSaving(null);
  };

  const removeMember = async (targetId: string) => {
    setSaving(targetId);
    setError(null);
    const res = await fetch(`/api/team/channels/${channelId}/members`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: targetId }),
    }).catch(() => null);
    if (res && res.ok) {
      await loadMembers();
    } else {
      setError(res?.status === 403 ? 'Only admins can remove members.' : 'Could not remove member.');
    }
    setSaving(null);
  };

  const searchLower = search.toLowerCase();
  const suggestions = allMembers.filter(m =>
    !memberIds.has(m.memberId) &&
    m.memberId !== currentMemberId &&
    (searchLower === '' || m.name.toLowerCase().includes(searchLower))
  );

  return (
    <div className="w-64 flex-shrink-0 border-l border-white/8 flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 flex-shrink-0">
        <h3 className="text-sm font-semibold text-white/80">Members {!loading && `(${members.length})`}</h3>
        <button
          onClick={onClose}
          className="text-white/30 hover:text-white/70 transition-colors"
          aria-label="Close members panel"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Add member search — admins only */}
      {canManage && (
        <div className="px-3 py-2 border-b border-white/6 flex-shrink-0">
          {error && <p className="mb-1.5 text-xs text-red-400/80">{error}</p>}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Add member…"
            className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/80 placeholder-white/25 focus:outline-none focus:border-amber-500/40"
          />
          {search && suggestions.length > 0 && (
            <div className="mt-1 bg-zinc-800 border border-white/10 rounded-lg overflow-hidden">
              {suggestions.slice(0, 6).map(m => (
                <button
                  key={m.memberId}
                  onClick={() => addMember(m.memberId)}
                  disabled={saving === m.memberId}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors"
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{ background: stringToColor(m.memberId) }}
                  >
                    {m.name[0]?.toUpperCase()}
                  </div>
                  <span className="text-xs text-white/70 truncate">{m.name}</span>
                  {saving === m.memberId && <span className="text-xs text-white/30 ml-auto">…</span>}
                </button>
              ))}
            </div>
          )}
          {search && suggestions.length === 0 && (
            <p className="mt-1 text-xs text-white/25 px-1">No matches</p>
          )}
        </div>
      )}

      {/* Member list */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
        {loading && (
          <div className="flex items-center justify-center h-16">
            <div className="w-4 h-4 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin" />
          </div>
        )}
        {!loading && members.map(m => {
          const isOwner = m.role === 'owner';
          const isMe = m.memberId === currentMemberId;
          return (
            <div
              key={m.memberId}
              className="flex items-center gap-2.5 px-3 py-2 hover:bg-white/[0.03] transition-colors"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                style={{ background: stringToColor(m.memberId) }}
              >
                {m.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-white/80 font-medium truncate">{m.name}</span>
                  <PresenceDot status={m.status} />
                </div>
                {m.role !== 'member' && (
                  <span className="text-xs text-white/30">{m.role}</span>
                )}
              </div>
              {canManage && !isOwner && !isMe && (
                <button
                  onClick={() => removeMember(m.memberId)}
                  disabled={saving === m.memberId}
                  className="text-white/15 hover:text-red-400/60 transition-colors flex-shrink-0"
                  aria-label={`Remove ${m.name}`}
                >
                  {saving === m.memberId ? (
                    <span className="text-xs">…</span>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
