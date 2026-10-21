'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type Tab = 'overview' | 'channels' | 'members' | 'bugs';

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  message: string | null;
  expiresAt: string;
  createdAt: string;
  invitedByName: string;
}

interface Channel {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  channel_type: string;
  is_private: boolean;
  archived_at: string | null;
  created_by_name: string | null;
  message_count: number;
}

interface Member {
  id: string;
  name: string;
  email: string;
  username: string;
  roles: string[];
  tier: string;
  status: 'online' | 'away' | 'offline';
  message_count: number;
  last_sign_in: string | null;
}

interface Stats {
  totalMessages: number;
  activeMembersToday: number;
  onlineNow: number;
  activeChannels: number;
  dmThreads: number;
}

interface BugItem {
  id: string;
  message: string;
  severity: string;
  status: string;
  reporterName: string | null;
  url: string | null;
  attachmentCount: number;
  createdAt: string;
}

interface BugCounts {
  new: number;
  seen: number;
  resolved: number;
  wont_fix: number;
  total: number;
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-[#16162a]/80 border border-white/8 rounded-xl p-4">
      <p className="text-2xl font-bold text-white/90">{value}</p>
      <p className="text-xs text-white/40 mt-0.5">{label}</p>
    </div>
  );
}

function PresenceDot({ status }: { status: 'online' | 'away' | 'offline' }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
      status === 'online' ? 'bg-emerald-400' :
      status === 'away'   ? 'bg-amber-400' : 'bg-white/20'
    }`} />
  );
}

export function AdminPanel() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [bugs, setBugs] = useState<BugItem[]>([]);
  const [bugCounts, setBugCounts] = useState<BugCounts>({ new: 0, seen: 0, resolved: 0, wont_fix: 0, total: 0 });
  const [saving, setSaving] = useState<string | null>(null);
  const [editChannel, setEditChannel] = useState<Channel | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editArchetype, setEditArchetype] = useState('');
  const [editPurposeBlock, setEditPurposeBlock] = useState('');
  const [editResponseMode, setEditResponseMode] = useState('');
  const [editPromptScaffold, setEditPromptScaffold] = useState('');
  const [channelMembers, setChannelMembers] = useState<Record<string, Array<{ memberId: string; name: string; role: string }>>>({});
  const [expandedMembersChannel, setExpandedMembersChannel] = useState<string | null>(null);
  const [addMemberSearch, setAddMemberSearch] = useState('');
  const [savingMember, setSavingMember] = useState<string | null>(null);
  const [channelMemberError, setChannelMemberError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [sRes, cRes, mRes, iRes, bRes] = await Promise.all([
      fetch('/api/team/admin/stats'),
      fetch('/api/team/admin/channels'),
      fetch('/api/team/admin/members'),
      fetch('/api/team/invites'),
      fetch('/api/team/admin/bugs'),
    ]);
    if (sRes.ok) setStats(await sRes.json().then(d => d));
    if (cRes.ok) setChannels(await cRes.json().then(d => d.channels));
    if (mRes.ok) setMembers(await mRes.json().then(d => d.members));
    if (iRes.ok) setPendingInvites(await iRes.json().then((d: { invites: PendingInvite[] }) => d.invites ?? []));
    if (bRes.ok) {
      const bd = await bRes.json();
      setBugs(bd.bugs ?? []);
      setBugCounts(bd.counts ?? { new: 0, seen: 0, resolved: 0, wont_fix: 0, total: 0 });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const archiveChannel = async (ch: Channel) => {
    setSaving(ch.id);
    await fetch('/api/team/admin/channels', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId: ch.id, archive: !ch.archived_at }),
    });
    await load();
    setSaving(null);
  };

  const flipVisibility = async (ch: Channel) => {
    const target = !ch.is_private;
    let confirmText: string;
    if (target) {
      // Public → private. Fetch participant count for confirmation.
      let count = 0;
      try {
        const r = await fetch(`/api/team/channels/${ch.id}/visibility/preview`);
        if (r.ok) {
          const d = await r.json();
          count = d.participantCount ?? 0;
        }
      } catch { /* ignore */ }
      confirmText =
        `Make #${ch.slug} private?\n\n` +
        `${count} active participant${count === 1 ? '' : 's'} will keep access ` +
        `(people who have posted here).\n\n` +
        `People who are not members will lose access immediately. ` +
        `Message history stays.`;
    } else {
      confirmText =
        `Make #${ch.slug} public?\n\n` +
        `The channel becomes visible to everyone on the team. ` +
        `Current member roles are preserved but no longer enforced.`;
    }
    if (!confirm(confirmText)) return;

    setSaving(ch.id);
    const res = await fetch(`/api/team/channels/${ch.id}/visibility`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPrivate: target }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.message ?? d.error ?? 'Failed to change visibility');
    }
    await load();
    setSaving(null);
  };

  const deleteChannel = async (ch: Channel) => {
    if (!confirm(`Delete #${ch.slug} permanently? This cannot be undone.`)) return;
    setSaving(ch.id);
    await fetch('/api/team/admin/channels', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId: ch.id }),
    });
    await load();
    setSaving(null);
  };

  const saveEdit = async () => {
    if (!editChannel) return;
    setSaving(editChannel.id);

    let parsedScaffold: unknown = undefined;
    if (editPromptScaffold.trim()) {
      try { parsedScaffold = JSON.parse(editPromptScaffold); } catch { /* leave undefined */ }
    } else {
      parsedScaffold = null;
    }

    await fetch('/api/team/admin/channels', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channelId: editChannel.id,
        name: editName,
        description: editDesc,
        archetype: editArchetype || undefined,
        purposeBlock: editPurposeBlock || undefined,
        responseMode: editResponseMode || undefined,
        promptScaffold: parsedScaffold,
      }),
    });
    setEditChannel(null);
    await load();
    setSaving(null);
  };

  const loadChannelMembers = async (channelId: string) => {
    setAddMemberSearch('');
    setChannelMemberError(null);
    if (channelMembers[channelId]) {
      setExpandedMembersChannel(prev => prev === channelId ? null : channelId);
      return;
    }
    const res = await fetch(`/api/team/channels/${channelId}/members`);
    if (res.ok) {
      const d = await res.json();
      setChannelMembers(prev => ({ ...prev, [channelId]: d.members ?? [] }));
      setExpandedMembersChannel(channelId);
    } else {
      const d = await res.json().catch(() => ({}));
      setChannelMemberError(d.error ?? d.message ?? 'Failed to load members');
    }
  };

  const refreshChannelMembers = async (channelId: string) => {
    const res = await fetch(`/api/team/channels/${channelId}/members`);
    if (res.ok) {
      const d = await res.json();
      setChannelMembers(prev => ({ ...prev, [channelId]: d.members ?? [] }));
    } else {
      const d = await res.json().catch(() => ({}));
      setChannelMemberError(d.error ?? d.message ?? 'Failed to refresh members');
    }
  };

  const addChannelMemberAdmin = async (channelId: string, memberId: string, role: string = 'member') => {
    setSavingMember(memberId);
    setChannelMemberError(null);
    const res = await fetch(`/api/team/channels/${channelId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, role }),
    });
    if (res.ok) {
      await refreshChannelMembers(channelId);
      setAddMemberSearch('');
    } else {
      const d = await res.json().catch(() => ({}));
      setChannelMemberError(d.error ?? d.message ?? 'Failed to add member');
    }
    setSavingMember(null);
  };

  const removeChannelMemberAdmin = async (channelId: string, memberId: string) => {
    setSavingMember(memberId);
    setChannelMemberError(null);
    const res = await fetch(`/api/team/channels/${channelId}/members`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId }),
    });
    if (res.ok) {
      await refreshChannelMembers(channelId);
    } else {
      const d = await res.json().catch(() => ({}));
      setChannelMemberError(d.error ?? d.message ?? 'Failed to remove member');
    }
    setSavingMember(null);
  };

  const channelAddSuggestions = (channelId: string) => {
    const roster = channelMembers[channelId] ?? [];
    const inChannel = new Set(roster.map(m => m.memberId));
    const q = addMemberSearch.toLowerCase();
    return members.filter(mm =>
      !inChannel.has(mm.id) &&
      (mm.name?.toLowerCase().includes(q) ||
        mm.username?.toLowerCase().includes(q) ||
        mm.email?.toLowerCase().includes(q))
    );
  };

  const toggleAdmin = async (m: Member) => {
    const isAdmin = m.roles?.includes('team_admin');
    setSaving(m.id);
    await fetch('/api/team/admin/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: m.id, makeAdmin: !isAdmin }),
    });
    await load();
    setSaving(null);
  };

  const removeFromStudio = async (m: Member) => {
    if (!confirm(`Remove ${m.name || m.username} from the Studio? Their MAIA account will not be deleted.`)) return;
    setSaving(m.id);
    await fetch(`/api/team/admin/members/${m.id}`, { method: 'DELETE' });
    await load();
    setSaving(null);
  };

  const revokeInvite = async (inviteId: string) => {
    if (!confirm('Revoke this invite?')) return;
    setSaving(inviteId);
    await fetch(`/api/team/invite/${inviteId}`, { method: 'DELETE' });
    await load();
    setSaving(null);
  };

  const filteredMembers = memberSearch
    ? members.filter(m =>
        m.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.email?.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.username?.toLowerCase().includes(memberSearch.toLowerCase())
      )
    : members;

  const activeChannels = channels.filter(c => !c.archived_at);
  const archivedChannels = channels.filter(c => c.archived_at);

  return (
    <div className="flex flex-col h-full bg-[#1a1a2e]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 flex-shrink-0">
        <div>
          <h1 className="text-base font-semibold text-white/90">Co-lab Admin</h1>
          <p className="text-xs text-white/35 mt-0.5">Manage channels, collaborators, and Co-lab settings</p>
        </div>
        <button
          onClick={() => router.push('/team')}
          className="text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          ← Back to channels
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-white/8 flex-shrink-0 px-6">
        {(['overview', 'channels', 'members', 'bugs'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t
                ? 'border-amber-500 text-white/90'
                : 'border-transparent text-white/35 hover:text-white/60'
            }`}
          >
            {t === 'bugs' ? 'Bug Reports' : t}
            {t === 'channels' && <span className="ml-1.5 text-xs text-white/25">{activeChannels.length}</span>}
            {t === 'members' && <span className="ml-1.5 text-xs text-white/25">{members.length}</span>}
            {t === 'bugs' && (bugCounts.new + bugCounts.seen) > 0 && (
              <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400/80">
                {bugCounts.new + bugCounts.seen}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard label="Total messages" value={stats?.totalMessages ?? '—'} />
              <StatCard label="Active today" value={stats?.activeMembersToday ?? '—'} />
              <StatCard label="Online now" value={stats?.onlineNow ?? '—'} />
              <StatCard label="Active channels" value={stats?.activeChannels ?? '—'} />
              <StatCard label="DM threads" value={stats?.dmThreads ?? '—'} />
              <StatCard label="Members" value={members.length || '—'} />
            </div>

            <div className="bg-[#16162a]/60 border border-white/8 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white/70 mb-3">Most active channels</h3>
              <div className="space-y-2">
                {[...activeChannels].sort((a, b) => b.message_count - a.message_count).slice(0, 5).map(ch => (
                  <div key={ch.id} className="flex items-center gap-3">
                    <span className="text-white/25 text-xs w-3">#</span>
                    <span className="text-sm text-white/70 flex-1">{ch.name}</span>
                    <span className="text-xs text-white/30">{ch.message_count} msgs</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CHANNELS */}
        {tab === 'channels' && (
          <div className="max-w-2xl space-y-6">
            {channelMemberError && (
              <div className="flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5">
                <p className="text-xs text-red-300/90">{channelMemberError}</p>
                <button
                  onClick={() => setChannelMemberError(null)}
                  className="text-xs text-red-300/60 hover:text-red-300 flex-shrink-0"
                >
                  Dismiss
                </button>
              </div>
            )}
            {/* Active channels */}
            <div>
              <h3 className="text-xs font-semibold text-white/35 uppercase tracking-wider mb-3">
                Active · {activeChannels.length}
              </h3>
              <div className="space-y-1">
                {activeChannels.map(ch => (
                  <div key={ch.id} className="bg-[#16162a]/60 border border-white/6 rounded-lg hover:border-white/12 transition-colors overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3">
                    {ch.is_private ? (
                      <svg className="w-3 h-3 text-amber-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="private">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    ) : (
                      <span className="text-white/25 text-xs">#</span>
                    )}
                    <div className="flex-1 min-w-0">
                      {editChannel?.id === ch.id ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <input
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              placeholder="Channel name"
                              className="flex-1 bg-[#1e1e38] border border-white/15 rounded px-2 py-1 text-sm text-white/90 focus:outline-none focus:border-amber-500/50"
                            />
                            <input
                              value={editDesc}
                              onChange={e => setEditDesc(e.target.value)}
                              placeholder="Description"
                              className="flex-1 bg-[#1e1e38] border border-white/15 rounded px-2 py-1 text-sm text-white/60 focus:outline-none focus:border-amber-500/50"
                            />
                          </div>
                          <div className="flex gap-2">
                            <select
                              value={editArchetype}
                              onChange={e => setEditArchetype(e.target.value)}
                              className="bg-[#1e1e38] border border-white/15 rounded px-2 py-1 text-sm text-white/70 focus:outline-none focus:border-amber-500/50"
                            >
                              <option value="">Archetype…</option>
                              <option value="general">General</option>
                              <option value="checkin">Check-In</option>
                              <option value="field_note">Field Note</option>
                              <option value="practice">Practice</option>
                              <option value="cohort">Cohort / Circle</option>
                              <option value="venture">Venture</option>
                            </select>
                            <select
                              value={editResponseMode}
                              onChange={e => setEditResponseMode(e.target.value)}
                              className="bg-[#1e1e38] border border-white/15 rounded px-2 py-1 text-sm text-white/70 focus:outline-none focus:border-amber-500/50"
                            >
                              <option value="">Response mode…</option>
                              <option value="open">Open</option>
                              <option value="witnessing">Witnessing</option>
                              <option value="reflection">Reflection</option>
                              <option value="advice">Advice</option>
                            </select>
                          </div>
                          <textarea
                            value={editPurposeBlock}
                            onChange={e => setEditPurposeBlock(e.target.value)}
                            placeholder="Purpose block (displayed below channel name)…"
                            rows={3}
                            className="w-full bg-[#1e1e38] border border-white/15 rounded px-2 py-1 text-sm text-white/60 focus:outline-none focus:border-amber-500/50 resize-none"
                          />
                          <textarea
                            value={editPromptScaffold}
                            onChange={e => setEditPromptScaffold(e.target.value)}
                            placeholder={`Prompt scaffold JSON, e.g. [{"label":"What I am tending","placeholder":"...","required":true}]`}
                            rows={4}
                            className="w-full bg-[#1e1e38] border border-white/15 rounded px-2 py-1 text-xs text-white/50 font-mono focus:outline-none focus:border-amber-500/50 resize-none"
                          />
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-white/80 font-medium">{ch.name}</p>
                          {ch.description && <p className="text-xs text-white/30 truncate">{ch.description}</p>}
                        </>
                      )}
                    </div>
                    <span className="text-xs text-white/20 flex-shrink-0">{ch.message_count} msgs</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${
                      ch.channel_type === 'announcement' ? 'bg-amber-500/15 text-amber-400/70' : 'bg-white/5 text-white/25'
                    }`}>
                      {ch.channel_type === 'announcement' ? 'announce' : 'text'}
                    </span>

                    {editChannel?.id === ch.id ? (
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button onClick={saveEdit} disabled={saving === ch.id} className="text-xs px-2 py-1 bg-amber-500 text-black rounded font-medium hover:bg-amber-400 disabled:opacity-40">Save</button>
                        <button onClick={() => setEditChannel(null)} className="text-xs px-2 py-1 bg-[#1e1e38] text-white/50 rounded hover:text-white/80">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => loadChannelMembers(ch.id)}
                          className="text-xs text-white/25 hover:text-white/70 transition-colors px-1.5 py-1 rounded hover:bg-white/5"
                        >
                          Members
                        </button>
                        <button
                          onClick={() => {
                            setEditChannel(ch);
                            setEditName(ch.name);
                            setEditDesc(ch.description ?? '');
                            setEditArchetype((ch as Channel & { archetype?: string }).archetype ?? '');
                            setEditPurposeBlock((ch as Channel & { purpose_block?: string }).purpose_block ?? '');
                            setEditResponseMode((ch as Channel & { response_mode?: string }).response_mode ?? '');
                            const scaffold = (ch as Channel & { prompt_scaffold?: unknown }).prompt_scaffold;
                            setEditPromptScaffold(scaffold ? JSON.stringify(scaffold, null, 2) : '');
                          }}
                          className="text-xs text-white/25 hover:text-white/70 transition-colors px-1.5 py-1 rounded hover:bg-white/5"
                        >
                          Edit
                        </button>
                        {ch.slug !== 'general' && ch.slug !== 'announcements' && (
                          <button
                            onClick={() => flipVisibility(ch)}
                            disabled={saving === ch.id}
                            className="text-xs text-white/25 hover:text-white/70 transition-colors px-1.5 py-1 rounded hover:bg-white/5"
                            title={ch.is_private ? 'Make public' : 'Make private'}
                          >
                            {ch.is_private ? 'Make public' : 'Make private'}
                          </button>
                        )}
                        <button
                          onClick={() => archiveChannel(ch)}
                          disabled={saving === ch.id}
                          className="text-xs text-white/25 hover:text-amber-400/70 transition-colors px-1.5 py-1 rounded hover:bg-white/5"
                        >
                          Archive
                        </button>
                        {ch.slug !== 'general' && (
                          <button
                            onClick={() => deleteChannel(ch)}
                            disabled={saving === ch.id}
                            className="text-xs text-white/20 hover:text-red-400/70 transition-colors px-1.5 py-1 rounded hover:bg-white/5"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Channel members expansion */}
                  {expandedMembersChannel === ch.id && channelMembers[ch.id] && (
                    <div className="border-t border-white/6 px-4 py-3">
                      <p className="text-xs text-white/30 font-medium mb-2">Members ({channelMembers[ch.id].length})</p>
                      <div className="space-y-1">
                        {channelMembers[ch.id].map((m) => (
                          <div key={m.memberId} className="flex items-center gap-2">
                            <span className="text-xs text-white/60 flex-1">{m.name}</span>
                            <span className="text-xs text-white/25">{m.role}</span>
                            {m.role !== 'owner' && (
                              <button
                                onClick={() => removeChannelMemberAdmin(ch.id, m.memberId)}
                                disabled={savingMember === m.memberId}
                                className="text-xs text-white/20 hover:text-red-400/60 transition-colors disabled:opacity-40"
                              >
                                {savingMember === m.memberId ? '…' : 'Remove'}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Add member */}
                      <div className="mt-3 pt-3 border-t border-white/6">
                        <input
                          value={addMemberSearch}
                          onChange={e => setAddMemberSearch(e.target.value)}
                          placeholder="Add member…"
                          className="w-full bg-[#1e1e38] border border-white/10 rounded px-2 py-1 text-xs text-white/80 placeholder-white/25 focus:outline-none focus:border-amber-500/40"
                        />
                        {addMemberSearch && channelAddSuggestions(ch.id).length > 0 && (
                          <div className="mt-1 bg-[#1e1e38] border border-white/10 rounded overflow-hidden">
                            {channelAddSuggestions(ch.id).slice(0, 6).map(mm => (
                              <button
                                key={mm.id}
                                onClick={() => addChannelMemberAdmin(ch.id, mm.id)}
                                disabled={savingMember === mm.id}
                                className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-white/5 transition-colors disabled:opacity-40"
                              >
                                <span className="text-xs text-white/70 truncate flex-1">{mm.name || mm.username}</span>
                                {savingMember === mm.id && <span className="text-xs text-white/30">…</span>}
                              </button>
                            ))}
                          </div>
                        )}
                        {addMemberSearch && channelAddSuggestions(ch.id).length === 0 && (
                          <p className="mt-1 text-xs text-white/25 px-1">No matches</p>
                        )}
                      </div>
                    </div>
                  )}
                  </div>
                ))}
              </div>
            </div>

            {/* Archived */}
            {archivedChannels.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-white/25 uppercase tracking-wider mb-3">
                  Archived · {archivedChannels.length}
                </h3>
                <div className="space-y-1">
                  {archivedChannels.map(ch => (
                    <div key={ch.id} className="flex items-center gap-3 bg-[#16162a]/40 border border-white/4 rounded-lg px-4 py-3 opacity-60">
                      <span className="text-white/15 text-xs">#</span>
                      <div className="flex-1">
                        <p className="text-sm text-white/50 line-through">{ch.name}</p>
                      </div>
                      <button
                        onClick={() => archiveChannel(ch)}
                        disabled={saving === ch.id}
                        className="text-xs text-white/25 hover:text-emerald-400/70 transition-colors px-2 py-1 rounded hover:bg-white/5"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => deleteChannel(ch)}
                        disabled={saving === ch.id}
                        className="text-xs text-white/20 hover:text-red-400/70 transition-colors px-2 py-1 rounded hover:bg-white/5"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MEMBERS */}
        {tab === 'members' && (
          <div className="max-w-3xl space-y-4">
            <input
              value={memberSearch}
              onChange={e => setMemberSearch(e.target.value)}
              placeholder="Search members…"
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-amber-500/40"
            />

            <div className="space-y-1">
              {filteredMembers.map(m => {
                const isAdmin = m.roles?.includes('team_admin') || m.roles?.includes('admin');
                return (
                  <div key={m.id} className="flex items-center gap-3 bg-[#16162a]/60 border border-white/6 rounded-lg px-4 py-3 hover:border-white/12 transition-colors">
                    <PresenceDot status={m.status} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-white/80 font-medium truncate">{m.name || m.username}</p>
                        {isAdmin && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400/80 flex-shrink-0">admin</span>
                        )}
                        {m.tier && m.tier !== 'free' && (
                          <span className="text-xs text-white/20 flex-shrink-0">{m.tier}</span>
                        )}
                      </div>
                      <p className="text-xs text-white/30 truncate">{m.email}</p>
                    </div>
                    <span className="text-xs text-white/20 flex-shrink-0">{m.message_count} msgs</span>
                    <button
                      onClick={() => toggleAdmin(m)}
                      disabled={saving === m.id}
                      className={`text-xs px-2.5 py-1 rounded border transition-colors flex-shrink-0 ${
                        isAdmin
                          ? 'border-amber-500/30 text-amber-400/60 hover:border-red-500/30 hover:text-red-400/60'
                          : 'border-white/10 text-white/25 hover:border-amber-500/30 hover:text-amber-400/60'
                      }`}
                    >
                      {saving === m.id ? '…' : isAdmin ? 'Remove admin' : 'Make admin'}
                    </button>
                    <button
                      onClick={() => removeFromStudio(m)}
                      disabled={saving === m.id}
                      className="text-xs px-2.5 py-1 rounded border border-white/8 text-white/20 hover:border-red-500/30 hover:text-red-400/60 transition-colors flex-shrink-0"
                    >
                      Remove from Studio
                    </button>
                  </div>
                );
              })}
            </div>

            {pendingInvites.length > 0 && (
              <div className="pt-4 border-t border-white/8">
                <h3 className="text-xs font-semibold text-white/35 uppercase tracking-wider mb-3">
                  Pending invites · {pendingInvites.length}
                </h3>
                <div className="space-y-1">
                  {pendingInvites.map(invite => {
                    const expiresDate = new Date(invite.expiresAt);
                    const daysLeft = Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={invite.id} className="flex items-center gap-3 bg-[#16162a]/50 border border-white/5 rounded-lg px-4 py-2.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white/70 truncate">{invite.email}</p>
                          <p className="text-xs text-white/30">
                            invited by {invite.invitedByName} · expires in {daysLeft}d
                          </p>
                        </div>
                        <button
                          onClick={() => revokeInvite(invite.id)}
                          disabled={saving === invite.id}
                          className="text-xs text-white/20 hover:text-red-400/70 transition-colors px-2 py-1 rounded hover:bg-white/5 flex-shrink-0"
                        >
                          {saving === invite.id ? '…' : 'Revoke'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* BUG REPORTS */}
        {tab === 'bugs' && (
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <p className="text-xs text-white/30">
                {bugCounts.total} total · {bugCounts.new} new · {bugCounts.seen} seen · {bugCounts.resolved} resolved
              </p>
              <a
                href="https://soullab.life/admin/monitor"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-xs text-amber-400/50 hover:text-amber-400/80 transition-colors"
              >
                Open Monitor →
              </a>
            </div>

            {bugs.length === 0 && (
              <div className="text-sm text-white/25 py-8 text-center">No bug reports yet.</div>
            )}

            {bugs.map(bug => {
              const monitorUrl = `https://soullab.life/admin/monitor?bug=${bug.id}`;
              const isOpen = bug.status === 'new' || bug.status === 'seen';
              const severityColor =
                bug.severity === 'critical' ? 'bg-red-500/20 text-red-400/80' :
                bug.severity === 'high'     ? 'bg-orange-500/20 text-orange-400/80' :
                bug.severity === 'low'      ? 'bg-white/5 text-white/25' :
                                              'bg-white/5 text-white/30';
              const statusColor =
                bug.status === 'new'       ? 'bg-red-500/15 text-red-400/70' :
                bug.status === 'seen'      ? 'bg-amber-500/15 text-amber-400/70' :
                bug.status === 'resolved'  ? 'bg-emerald-500/10 text-emerald-400/50' :
                                             'bg-white/5 text-white/25';
              const preview = bug.message.length > 100
                ? `${bug.message.slice(0, 100)}…`
                : bug.message;
              const when = new Date(bug.createdAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
              });

              return (
                <div
                  key={bug.id}
                  className={`flex flex-col gap-1.5 bg-[#16162a]/60 border rounded-lg px-4 py-3 transition-colors ${
                    isOpen ? 'border-white/10 hover:border-white/18' : 'border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${severityColor}`}>
                      {bug.severity}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${statusColor}`}>
                      {bug.status.replace('_', ' ')}
                    </span>
                    {bug.attachmentCount > 0 && (
                      <span className="text-xs text-white/25">
                        📎 {bug.attachmentCount}
                      </span>
                    )}
                    <span className="text-xs text-white/20 ml-auto flex-shrink-0">{when}</span>
                  </div>
                  <p className="text-sm text-white/70 leading-snug">{preview}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {bug.reporterName && (
                      <span className="text-xs text-white/25">{bug.reporterName}</span>
                    )}
                    {bug.url && (
                      <span className="text-xs text-white/20 truncate max-w-[200px]">{bug.url}</span>
                    )}
                    <a
                      href={monitorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-xs text-amber-400/40 hover:text-amber-400/70 transition-colors flex-shrink-0"
                    >
                      → Monitor
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
