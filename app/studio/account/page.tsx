'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Settings,
  Shield,
  CreditCard,
  ChevronRight,
  Calendar,
  Crown,
  LogOut,
  ArrowLeft,
  Globe,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

interface MemberData {
  id: string;
  name: string | null;
  preferredName: string | null;
  username: string;
  email: string | null;
  circleTier: string;
  createdAt: string;
  lastSignIn: string | null;
  onboarded: boolean;
  avatarUrl: string | null;
}

interface PractitionerData {
  portalType: string;
  slug: string;
  studioMode: string;
  name: string;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 3600000) return 'Just now';
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;

  return formatDate(dateStr);
}

function tierLabel(tier: string): string {
  const labels: Record<string, string> = {
    explorer: 'Explorer',
    seeker: 'Seeker',
    guardian: 'Guardian',
    elder: 'Elder',
  };
  return labels[tier] || tier;
}

function portalLabel(portalType: string): string {
  const labels: Record<string, string> = {
    generalist: 'Generalist',
    astrology: 'Astrology',
    therapy: 'Therapy',
    bodywork: 'Bodywork',
    groups: 'Groups',
    clinician: 'Clinician',
    consultant: 'Consultant',
  };
  return labels[portalType] || portalType;
}

export default function StudioAccountPage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberData | null>(null);
  const [practitioner, setPractitioner] = useState<PractitionerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [memberRes, whoamiRes] = await Promise.all([
          apiFetch('/api/members/me'),
          apiFetch('/api/studio/whoami'),
        ]);

        if (memberRes.ok) {
          const data = await memberRes.json();
          if (data.member) {
            setMember({
              id: data.member.id,
              name: data.member.name,
              preferredName: data.member.preferredName,
              username: data.member.username,
              email: data.member.email,
              circleTier: data.member.circleTier || 'explorer',
              createdAt: data.member.createdAt,
              lastSignIn: data.member.lastSignIn,
              onboarded: data.member.onboarded,
              avatarUrl: data.member.avatarUrl || null,
            });
          }
        }

        if (whoamiRes.ok) {
          const data = await whoamiRes.json();
          if (data.identity) {
            setPractitioner({
              portalType: data.identity.portalType || 'generalist',
              slug: data.identity.slug || '',
              studioMode: data.identity.studioMode || 'practice',
              name: data.identity.name || '',
            });
          }
        }
      } catch {
        // Continue with whatever data we have
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await apiFetch('/api/members/signout', { method: 'POST' });
    } catch {
      // Continue with client-side cleanup
    }
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

  const displayName = member?.preferredName || member?.name || member?.username || '...';
  const initials = (displayName)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?';

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500">Loading account...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-slate-500 hover:text-slate-300 text-sm mb-3 inline-flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <h1 className="text-2xl font-medium text-white">Account</h1>
        <p className="text-slate-400 mt-1">
          Identity, settings, security, and membership.
        </p>
      </div>

      {/* Identity Card */}
      <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          {member?.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={displayName}
              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-xl text-slate-300 flex-shrink-0">
              {initials}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-medium text-white truncate">{displayName}</h2>
            <div className="text-sm text-slate-400 mt-0.5">@{member?.username}</div>
            {member?.email && (
              <div className="text-sm text-slate-500 mt-0.5">{member.email}</div>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Crown className="w-3 h-3" />
                {tierLabel(member?.circleTier || 'explorer')}
              </span>
              {practitioner && (
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <Globe className="w-3 h-3" />
                  {portalLabel(practitioner.portalType)}
                </span>
              )}
            </div>
          </div>

          {/* Edit profile link */}
          <Link
            href="/account/settings"
            className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/50"
          >
            Edit
          </Link>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/account/settings"
          className="group rounded-2xl bg-slate-800/30 border border-slate-700/50 p-5 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-amber-400" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
          </div>
          <div className="text-white font-medium">Preferences</div>
          <div className="text-sm text-slate-500 mt-1">
            Voice, MAIA behavior, display settings
          </div>
        </Link>

        <Link
          href="/account/security"
          className="group rounded-2xl bg-slate-800/30 border border-slate-700/50 p-5 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-teal-400" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
          </div>
          <div className="text-white font-medium">Security</div>
          <div className="text-sm text-slate-500 mt-1">
            Passkeys, devices, active sessions
          </div>
        </Link>

        <div className="rounded-2xl bg-slate-800/20 border border-slate-700/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-[10px] rounded-full px-2 py-0.5 bg-slate-800 text-slate-500">
              Soon
            </span>
          </div>
          <div className="text-white font-medium">Membership</div>
          <div className="text-sm text-slate-500 mt-1">
            Billing, tier, invoices, upgrades
          </div>
        </div>
      </div>

      {/* Account Stats */}
      <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 p-5">
        <h3 className="text-white font-medium mb-4">Account details</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Member since</div>
            <div className="text-sm text-slate-300">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {formatDate(member?.createdAt || null)}
              </div>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Tier</div>
            <div className="text-sm text-slate-300">
              <div className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                {tierLabel(member?.circleTier || 'explorer')}
              </div>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Last sign-in</div>
            <div className="text-sm text-slate-300">
              {formatRelativeDate(member?.lastSignIn || null)}
            </div>
          </div>

          {practitioner && (
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Portal</div>
              <div className="text-sm text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-teal-500" />
                  {portalLabel(practitioner.portalType)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sign Out */}
      <div className="pt-2">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-red-400 transition-colors disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          {signingOut ? 'Signing out...' : 'Sign out of all devices'}
        </button>
      </div>
    </div>
  );
}
