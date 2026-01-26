'use client';

/**
 * Unified Account Hub
 *
 * Consolidates Profile, Settings, and Data Sovereignty into one accessible location.
 * Improves Information Architecture by providing a single entry point for account management.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Settings,
  Shield,
  Bell,
  Volume2,
  Palette,
  Key,
  Mail,
  Calendar,
  Crown,
  ChevronRight,
  Download,
  Trash2,
  LogOut,
} from 'lucide-react';

interface MemberData {
  id: string;
  name?: string;
  username?: string;
  email?: string;
  tier?: string;
  created_at?: string;
}

type TabId = 'profile' | 'settings' | 'sovereignty';

export default function AccountPage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberData | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  useEffect(() => {
    const stored = localStorage.getItem('beta_user');
    if (stored) {
      try {
        setMember(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const handleBack = () => {
    router.push('/maia');
  };

  const handleSignOut = () => {
    localStorage.removeItem('beta_user');
    router.push('/signin');
  };

  const tabs: { id: TabId; label: string; icon: typeof User }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'sovereignty', label: 'Data', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-950 via-teal-900 to-slate-900">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                     bg-white/10 border border-white/20 text-white
                     hover:bg-white/20 hover:border-white/30 transition-all
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-950"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to MAIA
          </button>

          {member && (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                       bg-white/10 border border-white/20 text-white
                       hover:bg-red-500/20 hover:border-red-500/30 transition-all
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-950"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          )}
        </div>

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-light text-white tracking-wide mb-3">
            Account
          </h1>
          <p className="text-teal-100/70">
            Manage your profile, preferences, and data
          </p>
        </motion.div>

        {member ? (
          <>
            {/* Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex gap-2 mb-8 p-1.5 rounded-xl bg-white/5 border border-white/10"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                              text-sm font-medium transition-all
                              focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-950
                              ${isActive
                                ? 'bg-teal-500/20 text-white border border-teal-500/30'
                                : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </motion.div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'profile' && (
                <ProfileTab member={member} />
              )}
              {activeTab === 'settings' && (
                <SettingsTab />
              )}
              {activeTab === 'sovereignty' && (
                <SovereigntyTab />
              )}
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
              <User className="w-8 h-8 text-teal-300" />
            </div>
            <p className="text-white/80 mb-6">
              Please sign in to access your account
            </p>
            <button
              onClick={() => router.push('/signin')}
              className="px-6 py-3 rounded-xl text-sm font-medium
                       bg-white/90 hover:bg-white text-teal-950 transition-all
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-950"
            >
              Sign In
            </button>
          </motion.div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 pb-8">
          <p className="text-sm text-teal-100/40">
            Your identity, your sovereignty
          </p>
        </div>
      </div>
    </div>
  );
}

// Profile Tab Component
function ProfileTab({ member }: { member: MemberData }) {
  const infoItems = [
    { icon: User, label: 'Display Name', value: member.name || 'Not set', color: 'teal' },
    { icon: Key, label: 'Username', value: member.username || 'Not set', color: 'cyan' },
    { icon: Mail, label: 'Email', value: member.email || 'Not set', color: 'emerald' },
    { icon: Crown, label: 'Membership', value: member.tier || 'Beta Tester', color: 'violet' },
    ...(member.created_at ? [{
      icon: Calendar,
      label: 'Member Since',
      value: new Date(member.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      color: 'amber'
    }] : []),
  ];

  const colorMap: Record<string, string> = {
    teal: 'bg-teal-500/20',
    cyan: 'bg-cyan-500/20',
    emerald: 'bg-emerald-500/20',
    violet: 'bg-violet-500/20',
    amber: 'bg-amber-500/20',
  };

  const iconColorMap: Record<string, string> = {
    teal: 'text-teal-300',
    cyan: 'text-cyan-300',
    emerald: 'text-emerald-300',
    violet: 'text-violet-300',
    amber: 'text-amber-300',
  };

  return (
    <div className="space-y-4">
      {infoItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="p-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg ${colorMap[item.color]} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${iconColorMap[item.color]}`} />
              </div>
              <div>
                <p className="text-xs text-white/70 mb-1">{item.label}</p>
                <p className="text-white font-medium capitalize">{item.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Settings Tab Component
function SettingsTab() {
  const settingsSections = [
    {
      title: 'Notifications',
      icon: Bell,
      color: 'teal',
      items: [
        { label: 'Session Alerts', description: 'Monitor conversation quality', defaultOn: true },
        { label: 'System Updates', description: 'Enhancement notifications', defaultOn: true },
      ]
    },
    {
      title: 'Voice',
      icon: Volume2,
      color: 'cyan',
      items: [
        { label: 'Auto Voice', description: 'Enable seamless conversation flow', defaultOn: true },
      ]
    },
    {
      title: 'Appearance',
      icon: Palette,
      color: 'violet',
      items: [
        { label: 'Reduce Motion', description: 'Minimize animations', defaultOn: false },
      ]
    },
  ];

  const colorMap: Record<string, string> = {
    teal: 'bg-teal-500/20',
    cyan: 'bg-cyan-500/20',
    violet: 'bg-violet-500/20',
  };

  const iconColorMap: Record<string, string> = {
    teal: 'text-teal-300',
    cyan: 'text-cyan-300',
    violet: 'text-violet-300',
  };

  return (
    <div className="space-y-6">
      {settingsSections.map((section) => {
        const Icon = section.icon;
        return (
          <div
            key={section.title}
            className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-10 h-10 rounded-lg ${colorMap[section.color]} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${iconColorMap[section.color]}`} />
              </div>
              <h3 className="text-sm font-medium text-white tracking-wide">
                {section.title}
              </h3>
            </div>

            <div className="space-y-4">
              {section.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white mb-1">{item.label}</p>
                    <p className="text-xs text-white/70">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={item.defaultOn} className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/10 peer-focus-visible:ring-2 peer-focus-visible:ring-teal-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-teal-950 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <button
        className="w-full px-6 py-3 rounded-xl text-sm font-medium
                 bg-white/90 hover:bg-white text-teal-950 transition-all
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-950"
      >
        Save Changes
      </button>
    </div>
  );
}

// Data Sovereignty Tab Component
function SovereigntyTab() {
  const router = useRouter();

  const actions = [
    {
      icon: Download,
      label: 'Export Your Data',
      description: 'Download a complete copy of your data',
      color: 'emerald',
      action: 'export',
    },
    {
      icon: Trash2,
      label: 'Delete Account',
      description: 'Permanently remove all your data',
      color: 'red',
      action: 'delete',
    },
  ];

  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/20 border-emerald-500/20',
    red: 'bg-red-500/10 border-red-500/20',
  };

  const iconColorMap: Record<string, string> = {
    emerald: 'text-emerald-300',
    red: 'text-red-300',
  };

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-emerald-300" />
          </div>
          <h3 className="text-sm font-medium text-white tracking-wide">
            Data Sovereignty
          </h3>
        </div>
        <p className="text-sm text-white/80 leading-relaxed">
          Your data belongs to you. MAIA is designed with sovereignty first — you have complete
          control over what is stored, how it&apos;s used, and whether to take it with you or remove it entirely.
        </p>
      </div>

      {/* Privacy Controls */}
      <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
        <h3 className="text-sm font-medium text-white tracking-wide mb-5">
          Privacy Controls
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white mb-1">Pattern Analysis</p>
              <p className="text-xs text-white/70">Anonymous data for system improvement</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-white/10 peer-focus-visible:ring-2 peer-focus-visible:ring-teal-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-teal-950 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white mb-1">Conversation History</p>
              <p className="text-xs text-white/70">Store conversations for continuity</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-white/10 peer-focus-visible:ring-2 peer-focus-visible:ring-teal-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-teal-950 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              className={`w-full p-5 rounded-xl border ${colorMap[action.color]}
                       hover:bg-white/5 transition-all text-left
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-950`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg ${colorMap[action.color]} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${iconColorMap[action.color]}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white mb-0.5">{action.label}</p>
                  <p className="text-xs text-white/70">{action.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
