'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  ChevronDown,
  User,
  Settings,
  Plus,
  Check,
  Compass,
  Briefcase,
} from 'lucide-react';
import { useTeams, useTeamContext } from '@/hooks/useStudioData';
import type { StudioMode } from '@/hooks/useStudioData';

interface TeamSwitcherProps {
  collapsed?: boolean;
}

const MODE_CONFIG: Record<StudioMode, { label: string; icon: typeof Compass; description: string }> = {
  personal: {
    label: 'Personal Field',
    icon: Compass,
    description: 'Inner orientation, decisions, changes',
  },
  practice: {
    label: 'Practice Portal',
    icon: Briefcase,
    description: 'Client work, sessions, operations',
  },
};

export function TeamSwitcher({ collapsed = false }: TeamSwitcherProps) {
  const { teams, loading } = useTeams();
  const {
    currentTeamId,
    setCurrentTeamId,
    includePersonal,
    setIncludePersonal,
    studioMode,
    setStudioMode,
  } = useTeamContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Find current team
  const currentTeam = teams.find(t => t.id === currentTeamId);
  const modeConfig = MODE_CONFIG[studioMode];
  const ModeIcon = modeConfig.icon;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (collapsed) {
    return (
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-2 rounded-lg hover:bg-slate-800 text-slate-400"
        title={modeConfig.label}
      >
        <ModeIcon className="w-4 h-4 mx-auto" />
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger button — shows current mode + scope */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 transition-colors"
      >
        <ModeIcon className={`w-4 h-4 ${studioMode === 'practice' ? 'text-amber-400' : 'text-teal-400'}`} />
        <div className="flex-1 text-left min-w-0">
          <div className="text-sm truncate">{modeConfig.label}</div>
          {currentTeam && (
            <div className="text-[10px] text-slate-500 truncate">{currentTeam.name}</div>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-[#1e1e38] border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden"
          >
            {/* ── Mode Axis ── */}
            <div className="px-3 pt-2.5 pb-1">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Mode</div>
              {(Object.keys(MODE_CONFIG) as StudioMode[]).map((mode) => {
                const config = MODE_CONFIG[mode];
                const isActive = studioMode === mode;
                const Icon = config.icon;

                return (
                  <button
                    key={mode}
                    onClick={() => {
                      setStudioMode(mode);
                      // Don't close — user might also want to switch scope
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                      isActive
                        ? mode === 'practice'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-teal-500/15 text-teal-400'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <div className="flex-1 text-left">
                      <div>{config.label}</div>
                      <div className="text-[10px] text-slate-500">{config.description}</div>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* ── Scope Axis (Team / Personal) ── */}
            <div className="border-t border-slate-700/50 mx-2 my-1" />
            <div className="px-3 pb-1">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Scope</div>

              {/* Personal option */}
              <button
                onClick={() => {
                  setCurrentTeamId(null);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                  !currentTeamId ? 'bg-slate-700/30 text-white' : 'text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="flex-1 text-left">Personal</span>
                {!currentTeamId && <Check className="w-3.5 h-3.5" />}
              </button>

              {/* Teams */}
              {loading ? (
                <div className="px-2 py-1.5 text-sm text-slate-500">Loading Co-labs...</div>
              ) : (
                teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => {
                      setCurrentTeamId(team.id);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                      currentTeamId === team.id ? 'bg-slate-700/30 text-white' : 'text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span className="flex-1 text-left truncate">{team.name}</span>
                    <span className="text-[10px] text-slate-500">{team.member_count}</span>
                    {currentTeamId === team.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))
              )}

              {/* Include personal toggle (when in team context) */}
              {currentTeamId && (
                <button
                  onClick={() => setIncludePersonal(!includePersonal)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-slate-400 hover:bg-slate-800/50 transition-colors mt-0.5"
                >
                  <div className={`w-3.5 h-3.5 border rounded-sm flex items-center justify-center ${includePersonal ? 'bg-amber-500 border-amber-500' : 'border-slate-500'}`}>
                    {includePersonal && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span>Include personal items</span>
                </button>
              )}
            </div>

            {/* ── Actions ── */}
            <div className="border-t border-slate-700/50 mx-2 my-1" />
            <div className="px-1 pb-1.5">
              <Link
                href="/studio/teams"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-slate-400 hover:bg-slate-800/50 hover:text-slate-300 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Manage Co-labs</span>
              </Link>
              <Link
                href="/studio/teams?create=true"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-slate-400 hover:bg-slate-800/50 hover:text-slate-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Co-lab</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TeamSwitcher;
