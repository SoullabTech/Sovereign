'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Team } from '@/lib/auth/teamPermissions';

/**
 * Co-Lab workspace switcher — replaces the static "Soullab" wordmark in the
 * sidebar header. Lists the member's teams (default workspace first), lets them
 * switch, and create a new workspace. Reuses the existing team APIs:
 *   GET  /api/team/teams      — switchable workspaces (member's + default)
 *   POST /api/studio/teams    — create a workspace (any member)
 * Channel scoping + cookie persistence live in the parent (onSwitch).
 */
export function CoLabTeamSwitcher({
  currentTeamId,
  onSwitch,
}: {
  currentTeamId: string | null;
  onSwitch: (teamId: string) => void;
}) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const newInputRef = useRef<HTMLInputElement>(null);

  const loadTeams = useCallback(async () => {
    const res = await fetch('/api/team/teams');
    if (res.ok) {
      const d = await res.json();
      setTeams(d.teams ?? []);
    }
  }, []);

  useEffect(() => { loadTeams(); }, [loadTeams]);

  // Close the dropdown on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => { if (showNew) newInputRef.current?.focus(); }, [showNew]);

  const current = teams.find(t => t.id === currentTeamId);
  const currentName = current?.name ?? 'Soullab';

  const select = (teamId: string) => {
    setOpen(false);
    if (teamId !== currentTeamId) onSwitch(teamId);
  };

  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name || busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/studio/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? 'Could not create workspace');
        return;
      }
      const { team } = await res.json();
      // A fresh workspace has no channels — seed #general so it isn't a dead end.
      await fetch('/api/team/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: team.id,
          name: 'General',
          slug: 'general',
          channelType: 'text',
          isPrivate: false,
        }),
      }).catch(() => {});
      await loadTeams();
      setNewName('');
      setShowNew(false);
      select(team.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 group"
        title="Switch workspace"
      >
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
            alt=""
            width={24}
            height={24}
            className="relative z-10 w-6 h-6 object-contain"
            style={{ filter: 'drop-shadow(0 0 6px rgba(212,184,150,0.5))' }}
          />
        </div>
        <span
          className="flex-1 min-w-0 text-left text-xs font-semibold tracking-[0.14em] text-white/70 group-hover:text-white/90 uppercase truncate transition-colors"
          style={{ letterSpacing: '0.14em' }}
        >
          {currentName}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#1c1c34] border border-white/12 rounded-xl shadow-2xl py-1.5 overflow-hidden">
          <p className="px-3 py-1 text-[10px] font-semibold text-white/30 uppercase tracking-wider">
            Workspaces
          </p>
          <div className="max-h-64 overflow-y-auto scrollbar-hide">
            {teams.map(t => {
              const active = t.id === currentTeamId;
              return (
                <button
                  key={t.id}
                  onClick={() => select(t.id)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors ${
                    active ? 'bg-amber-500/15 text-white/90' : 'text-white/55 hover:bg-white/5 hover:text-white/80'
                  }`}
                >
                  <span className="flex-1 truncate">{t.name}</span>
                  {typeof t.member_count === 'number' && (
                    <span className="text-[10px] text-white/30">{t.member_count}</span>
                  )}
                  {active && (
                    <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-t border-white/8 mt-1 pt-1">
            {showNew ? (
              <form onSubmit={createTeam} className="px-2 py-1.5 space-y-1.5">
                <input
                  ref={newInputRef}
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Workspace name"
                  maxLength={60}
                  className="w-full bg-[#12121f] border border-white/10 rounded-lg px-2.5 py-1.5 text-sm text-white/90 placeholder-white/25 focus:outline-none focus:border-amber-500/50"
                />
                {error && <p className="text-[11px] text-red-400 px-0.5">{error}</p>}
                <div className="flex gap-1.5">
                  <button
                    type="submit"
                    disabled={!newName.trim() || busy}
                    className="flex-1 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-semibold disabled:opacity-40 hover:bg-amber-400 transition-colors"
                  >
                    {busy ? 'Creating…' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowNew(false); setError(''); setNewName(''); }}
                    className="px-2.5 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowNew(true)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-white/50 hover:bg-white/5 hover:text-white/80 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New workspace
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
