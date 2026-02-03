'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronDown, User, Settings, Plus, Check } from 'lucide-react';
import { useTeams, Team, useTeamContext } from '@/hooks/useStudioData';

interface TeamSwitcherProps {
  collapsed?: boolean;
}

export function TeamSwitcher({ collapsed = false }: TeamSwitcherProps) {
  const { teams, loading } = useTeams();
  const { currentTeamId, setCurrentTeamId, includePersonal, setIncludePersonal } = useTeamContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Find current team
  const currentTeam = teams.find(t => t.id === currentTeamId);

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
        title={currentTeam ? currentTeam.name : 'Personal'}
      >
        {currentTeam ? <Users className="w-4 h-4 mx-auto" /> : <User className="w-4 h-4 mx-auto" />}
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 transition-colors"
      >
        {currentTeam ? (
          <Users className="w-4 h-4 text-amber-400" />
        ) : (
          <User className="w-4 h-4 text-slate-400" />
        )}
        <span className="flex-1 text-left text-sm truncate">
          {currentTeam ? currentTeam.name : 'Personal'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-[#1e1e38] border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden"
          >
            {/* Personal option */}
            <button
              onClick={() => {
                setCurrentTeamId(null);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-800/50 transition-colors ${
                !currentTeamId ? 'text-amber-400' : 'text-slate-300'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="flex-1 text-left">Personal</span>
              {!currentTeamId && <Check className="w-4 h-4" />}
            </button>

            {/* Divider */}
            {teams.length > 0 && <div className="border-t border-slate-700 my-1" />}

            {/* Teams */}
            {loading ? (
              <div className="px-3 py-2 text-sm text-slate-500">Loading teams...</div>
            ) : (
              teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => {
                    setCurrentTeamId(team.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-800/50 transition-colors ${
                    currentTeamId === team.id ? 'text-amber-400' : 'text-slate-300'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="flex-1 text-left truncate">{team.name}</span>
                  <span className="text-xs text-slate-500">{team.member_count}</span>
                  {currentTeamId === team.id && <Check className="w-4 h-4" />}
                </button>
              ))
            )}

            {/* Include personal toggle (when in team context) */}
            {currentTeamId && (
              <>
                <div className="border-t border-slate-700 my-1" />
                <button
                  onClick={() => setIncludePersonal(!includePersonal)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:bg-slate-800/50 transition-colors"
                >
                  <div className={`w-4 h-4 border rounded ${includePersonal ? 'bg-amber-500 border-amber-500' : 'border-slate-500'}`}>
                    {includePersonal && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span>Include personal items</span>
                </button>
              </>
            )}

            {/* Actions */}
            <div className="border-t border-slate-700 my-1" />
            <Link
              href="/studio/teams"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:bg-slate-800/50 hover:text-slate-300 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Manage teams</span>
            </Link>
            <Link
              href="/studio/teams?create=true"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:bg-slate-800/50 hover:text-slate-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create team</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TeamSwitcher;
