'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp,
  User,
  Settings,
  Shield,
  CreditCard,
  Database,
  LogOut,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { useTeamContext, useTeams } from '@/hooks/useStudioData';

interface MemberInfo {
  id: string;
  name: string | null;
  preferredName: string | null;
  username: string;
  email: string | null;
  circleTier: string;
  avatarUrl: string | null;
}

interface AccountPopoverProps {
  collapsed?: boolean;
  /** Effective studio mode — what the UI is actually rendering */
  studioMode?: 'personal' | 'practice';
}

export function AccountPopover({ collapsed = false, studioMode }: AccountPopoverProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Derive workspace name from team context (rendered inside TeamContextProvider)
  const { currentTeamId } = useTeamContext();
  const { teams, loading: teamsLoading } = useTeams();
  const currentTeam = currentTeamId ? teams.find(t => t.id === currentTeamId) : null;
  const workspaceName = currentTeamId
    ? (currentTeam?.name || (teamsLoading ? 'Co-lab\u2026' : 'Co-lab'))
    : 'Personal';

  // Fetch member data
  useEffect(() => {
    async function loadMember() {
      try {
        const res = await apiFetch('/api/members/me');
        if (res.ok) {
          const data = await res.json();
          if (data.member) {
            setMember({
              id: data.member.id,
              name: data.member.name,
              preferredName: data.member.preferredName,
              username: data.member.username,
              email: data.member.email,
              circleTier: data.member.circleTier || 'explorer',
              avatarUrl: data.member.avatarUrl || null,
            });
          }
        }
      } catch {
        // Silently fail — sidebar still functional
      } finally {
        setLoading(false);
      }
    }
    loadMember();
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = member?.preferredName || member?.name || member?.username || 'Account';
  const subtitle = member?.email || (member?.circleTier ? `${member.circleTier} tier` : '');
  const initials = (displayName)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?';

  const menuItems = [
    { href: '/studio/account', label: 'Account', icon: User, disabled: false },
    { href: '/account/settings', label: 'Settings', icon: Settings, disabled: false },
    { href: '/account/security', label: 'Security', icon: Shield, disabled: false },
    { href: '/account/billing', label: 'Membership', icon: CreditCard, disabled: true },
    { href: '/account/privacy', label: 'Data & Privacy', icon: Database, disabled: true },
  ];

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await apiFetch('/api/members/signout', { method: 'POST' });
    } catch {
      // Continue with client-side cleanup even if server call fails
    }

    // Clear client-side session data
    try {
      localStorage.removeItem('beta_user');
      localStorage.removeItem('soullab_member');
      localStorage.removeItem('member_profile');
      localStorage.removeItem('explorerId');
      localStorage.removeItem('explorerName');
      localStorage.removeItem('explorerPreferredName');
      localStorage.removeItem('maia_session_version');
      localStorage.removeItem('userName');
      localStorage.removeItem('displayName');
      localStorage.removeItem('userTier');
      sessionStorage.clear();
    } catch {
      // localStorage may not be available
    }

    window.location.href = '/signin';
  }

  // Collapsed: just show avatar icon
  if (collapsed) {
    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-full p-2 rounded-lg hover:bg-slate-800 text-slate-400 flex items-center justify-center"
          title={displayName}
        >
          {member?.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={displayName}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-slate-300">
              {loading ? '...' : initials}
            </div>
          )}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-0 mb-2 w-56 bg-[#1e1e38] border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden"
            >
              <PopoverContent
                menuItems={menuItems}
                pathname={pathname}
                signingOut={signingOut}
                onSignOut={handleSignOut}
                onClose={() => setOpen(false)}
                studioMode={studioMode}
                workspaceName={workspaceName}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Expanded: show full identity cluster
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors"
      >
        {member?.avatarUrl ? (
          <img
            src={member.avatarUrl}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300 flex-shrink-0">
            {loading ? '...' : initials}
          </div>
        )}
        <div className="min-w-0 flex-1 text-left">
          <div className="text-sm text-white/90 truncate">
            {loading ? 'Loading...' : displayName}
          </div>
          {subtitle && (
            <div className="text-[11px] text-slate-500 truncate">{subtitle}</div>
          )}
        </div>
        <ChevronUp
          className={`w-3.5 h-3.5 text-slate-500 transition-transform ${open ? '' : 'rotate-180'}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-[#1e1e38] border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden"
          >
            <PopoverContent
              menuItems={menuItems}
              pathname={pathname}
              signingOut={signingOut}
              onSignOut={handleSignOut}
              onClose={() => setOpen(false)}
              studioMode={studioMode}
              workspaceName={workspaceName}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Shared popover menu content
function PopoverContent({
  menuItems,
  pathname,
  signingOut,
  onSignOut,
  onClose,
  studioMode,
  workspaceName,
}: {
  menuItems: Array<{ href: string; label: string; icon: typeof User; disabled: boolean }>;
  pathname: string | null;
  signingOut: boolean;
  onSignOut: () => void;
  onClose: () => void;
  studioMode?: 'personal' | 'practice';
  workspaceName: string;
}) {
  return (
    <div className="py-1">
      {/* Context readout — workspace + mode at a glance (passive, not a control) */}
      <div className="px-3 py-2 border-b border-slate-700/50">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500">
            {workspaceName}
          </span>
          {studioMode && (
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${
              studioMode === 'personal'
                ? 'bg-slate-700/50 text-slate-400'
                : 'bg-amber-500/10 text-amber-400/80'
            }`}>
              {studioMode === 'personal' ? 'Field' : 'Practice'}
            </span>
          )}
        </div>
      </div>

      <div className="px-3 py-1.5 text-[10px] text-slate-500 uppercase tracking-wider">
        Account
      </div>

      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname?.startsWith(item.href);

        if (item.disabled) {
          return (
            <div
              key={item.href}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 cursor-default"
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              <span className="ml-auto text-[10px] rounded-full px-1.5 py-0.5 bg-slate-800 text-slate-500">
                Soon
              </span>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
              isActive
                ? 'text-amber-400 bg-amber-500/10'
                : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}

      <div className="border-t border-slate-700 my-1" />

      <button
        onClick={onSignOut}
        disabled={signingOut}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:bg-slate-800/50 hover:text-red-400 transition-colors disabled:opacity-50"
      >
        <LogOut className="w-4 h-4" />
        <span>{signingOut ? 'Signing out...' : 'Sign out'}</span>
      </button>
    </div>
  );
}
