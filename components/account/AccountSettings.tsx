'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Shield, Mic, Brain, Users, MessageSquare, Bell, Lock,
  Link, Download, Trash2, Check, ChevronRight, Eye, EyeOff,
  Mail, Clock, Crown, Sparkles, AlertTriangle, ArrowLeft
} from 'lucide-react';
import { GoogleConnectSection } from '@/components/settings/GoogleConnectSection';
import {
  getAccountSettings,
  saveAccountSettings,
  DEFAULT_ACCOUNT_SETTINGS,
  type AccountSettings as AccountSettingsType,
} from '@/lib/settings/accountSettings';
import type { ArchetypeId } from '@/lib/services/archetypePreferenceService';
import { ConversationMode, CONVERSATION_STYLE_DESCRIPTIONS } from '@/lib/types/conversation-style';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface MemberProfile {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  passkey: string;
  bio: string | null;
  timezone: string | null;
  onboarded: boolean;
  createdAt: string;
  lastSignIn: string | null;
  membership: {
    tier: string;
    amount: number;
    joinedAt: string | null;
  };
}

interface MemberSettings {
  notifications: {
    weeklyDigest: boolean;
    breakthroughMoments: boolean;
    communityUpdates: boolean;
    productUpdates: boolean;
  };
  privacy: {
    shareAnonymousInsights: boolean;
    allowResearchParticipation: boolean;
  };
}

type SettingsSection = 'profile' | 'account' | 'maia' | 'notifications' | 'privacy' | 'membership' | 'connections' | 'data';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const VOICE_OPTIONS = [
  { id: 'shimmer', name: 'Shimmer', emoji: '💧', gender: 'Female' },
  { id: 'nova', name: 'Nova', emoji: '⭐', gender: 'Female' },
  { id: 'alloy', name: 'Alloy', emoji: '🌍', gender: 'Neutral' },
  { id: 'echo', name: 'Echo', emoji: '🎙️', gender: 'Male' },
  { id: 'fable', name: 'Fable', emoji: '📖', gender: 'Male' },
  { id: 'onyx', name: 'Onyx', emoji: '🗣️', gender: 'Male' },
];

const ARCHETYPE_OPTIONS = [
  { id: 'TRUSTED_FRIEND' as ArchetypeId, name: 'Friend', emoji: '☕' },
  { id: 'GUIDE' as ArchetypeId, name: 'Guide', emoji: '🧭' },
  { id: 'MENTOR' as ArchetypeId, name: 'Mentor', emoji: '📖' },
  { id: 'ALCHEMIST' as ArchetypeId, name: 'Alchemist', emoji: '⚗️' },
  { id: 'LAB_PARTNER' as ArchetypeId, name: 'Lab Partner', emoji: '🔬' },
  { id: 'AUTO' as ArchetypeId, name: 'Auto', emoji: '✨' },
];

const CIRCLE_TIERS = {
  explorer: { name: 'Explorer', emoji: '🌱', color: 'text-stone-400' },
  sustainer: { name: 'Sustainer', emoji: '🕯️', color: 'text-amber-400' },
  guardian: { name: 'Guardian', emoji: '🛡️', color: 'text-teal-400' },
  elder: { name: 'Elder', emoji: '🌳', color: 'text-green-400' },
  pioneer: { name: 'Pioneer', emoji: '⭐', color: 'text-purple-400' },
};

const SECTIONS: { id: SettingsSection; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: Lock },
  { id: 'maia', label: 'MAIA Settings', icon: Brain },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'membership', label: 'Membership', icon: Crown },
  { id: 'connections', label: 'Connections', icon: Link },
  { id: 'data', label: 'Your Data', icon: Download },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function AccountSettings() {
  const [activeSection, setActiveSection] = useState<SettingsSection | null>(null);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [memberSettings, setMemberSettings] = useState<MemberSettings | null>(null);
  const [maiaSettings, setMaiaSettings] = useState<AccountSettingsType>(DEFAULT_ACCOUNT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Password change state
  const [showPasskey, setShowPasskey] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Delete account state
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Profile edit state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBio, setEditBio] = useState('');

  // ─────────────────────────────────────────────────────────────────────────
  // Data Loading
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const loadData = async () => {
      // Get user from localStorage
      const storedUser = localStorage.getItem('beta_user');
      if (!storedUser) {
        setLoading(false);
        return;
      }

      try {
        const user = JSON.parse(storedUser);
        const memberId = user.id || user.passkey;
        setUserId(memberId);

        // Load MAIA settings from localStorage
        setMaiaSettings(getAccountSettings());

        // Load profile from server
        const profileRes = await fetch(`/api/members/profile?id=${memberId}`);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
          setEditName(profileData.name || '');
          setEditEmail(profileData.email || '');
          setEditBio(profileData.bio || '');
        }

        // Load settings from server
        const settingsRes = await fetch(`/api/members/settings?memberId=${memberId}`);
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setMemberSettings({
            notifications: settingsData.notifications,
            privacy: settingsData.privacy,
          });
        }
      } catch (err) {
        console.error('[AccountSettings] Load error:', err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Save Handlers
  // ─────────────────────────────────────────────────────────────────────────

  const showSaveIndicator = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  const updateMaiaSetting = useCallback(<K extends keyof AccountSettingsType>(
    key: K,
    value: AccountSettingsType[K]
  ) => {
    if ('vibrate' in navigator) navigator.vibrate(5);

    const updated = { ...maiaSettings, [key]: value };
    setMaiaSettings(updated);
    saveAccountSettings(updated);
    showSaveIndicator();

    // Also sync to server if we have userId
    if (userId) {
      fetch('/api/members/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: userId,
          [key === 'defaultMemoryMode' ? 'defaultMemoryMode' : key]: value,
        }),
      }).catch(console.error);
    }
  }, [maiaSettings, userId, showSaveIndicator]);

  const updateNestedMaiaSetting = useCallback((path: string, value: unknown) => {
    if ('vibrate' in navigator) navigator.vibrate(5);

    const keys = path.split('.');
    const updated = { ...maiaSettings };
    let current: Record<string, unknown> = updated;

    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...(current[keys[i]] as Record<string, unknown>) };
      current = current[keys[i]] as Record<string, unknown>;
    }
    current[keys[keys.length - 1]] = value;

    setMaiaSettings(updated);
    saveAccountSettings(updated);
    showSaveIndicator();
  }, [maiaSettings, showSaveIndicator]);

  const updateNotification = useCallback(async (key: string, value: boolean) => {
    if (!userId || !memberSettings) return;
    if ('vibrate' in navigator) navigator.vibrate(5);

    const keyMap: Record<string, string> = {
      weeklyDigest: 'emailWeeklyDigest',
      breakthroughMoments: 'emailBreakthroughMoments',
      communityUpdates: 'emailCommunityUpdates',
      productUpdates: 'emailProductUpdates',
    };

    setMemberSettings({
      ...memberSettings,
      notifications: { ...memberSettings.notifications, [key]: value },
    });

    await fetch('/api/members/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: userId, [keyMap[key]]: value }),
    });

    showSaveIndicator();
  }, [userId, memberSettings, showSaveIndicator]);

  const updatePrivacy = useCallback(async (key: string, value: boolean) => {
    if (!userId || !memberSettings) return;
    if ('vibrate' in navigator) navigator.vibrate(5);

    const keyMap: Record<string, string> = {
      shareAnonymousInsights: 'shareAnonymousInsights',
      allowResearchParticipation: 'allowResearchParticipation',
    };

    setMemberSettings({
      ...memberSettings,
      privacy: { ...memberSettings.privacy, [key]: value },
    });

    await fetch('/api/members/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: userId, [keyMap[key]]: value }),
    });

    showSaveIndicator();
  }, [userId, memberSettings, showSaveIndicator]);

  const saveProfile = useCallback(async () => {
    if (!userId) return;
    setSaving(true);

    try {
      const res = await fetch('/api/members/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: userId,
          name: editName,
          email: editEmail,
          bio: editBio,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(prev => prev ? { ...prev, ...data.profile } : null);
        showSaveIndicator();
      }
    } catch (err) {
      console.error('[AccountSettings] Save profile error:', err);
    } finally {
      setSaving(false);
    }
  }, [userId, editName, editEmail, editBio, showSaveIndicator]);

  const exportData = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await fetch('/api/members/export-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: userId }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `maia-data-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('[AccountSettings] Export error:', err);
    }
  }, [userId]);

  const deleteAccount = useCallback(async () => {
    if (!userId || !profile || deleteConfirm !== profile.username) return;
    setDeleting(true);

    try {
      const res = await fetch('/api/members/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: userId,
          confirmUsername: deleteConfirm,
        }),
      });

      if (res.ok) {
        localStorage.removeItem('beta_user');
        localStorage.removeItem('maia_settings');
        localStorage.removeItem('maia_account_settings');
        window.location.href = '/';
      }
    } catch (err) {
      console.error('[AccountSettings] Delete error:', err);
    } finally {
      setDeleting(false);
    }
  }, [userId, profile, deleteConfirm]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render Helpers
  // ─────────────────────────────────────────────────────────────────────────

  const renderToggle = (enabled: boolean, onToggle: () => void) => (
    <button
      onClick={onToggle}
      className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
        enabled ? 'bg-amber-500' : 'bg-white/20'
      }`}
    >
      <motion.div
        className="w-5 h-5 rounded-full bg-white shadow-md"
        animate={{ x: enabled ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Section Renderers
  // ─────────────────────────────────────────────────────────────────────────

  const renderProfile = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm text-white/60 mb-2 block">Display Name</label>
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-amber-500/50 focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm text-white/60 mb-2 block">Email</label>
        <input
          type="email"
          value={editEmail}
          onChange={(e) => setEditEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-amber-500/50 focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm text-white/60 mb-2 block">Bio</label>
        <textarea
          value={editBio}
          onChange={(e) => setEditBio(e.target.value)}
          placeholder="A brief description about yourself..."
          rows={3}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-amber-500/50 focus:outline-none resize-none"
        />
      </div>
      <div className="flex items-center justify-between text-sm text-white/40">
        <span>Member since {profile ? new Date(profile.createdAt).toLocaleDateString() : '...'}</span>
        <span>@{profile?.username}</span>
      </div>
      <motion.button
        onClick={saveProfile}
        disabled={saving}
        className="w-full py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-xl text-amber-300 font-medium transition-colors disabled:opacity-50"
        whileTap={{ scale: 0.98 }}
      >
        {saving ? 'Saving...' : 'Save Profile'}
      </motion.button>
    </div>
  );

  const renderAccount = () => (
    <div className="space-y-6">
      {/* Passkey Display */}
      <div>
        <label className="text-sm text-white/60 mb-2 block">Your Passkey</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm">
            {showPasskey ? profile?.passkey : '••••••••••••••••'}
          </div>
          <button
            onClick={() => setShowPasskey(!showPasskey)}
            className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white transition-colors"
          >
            {showPasskey ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <p className="text-xs text-white/40 mt-2">
          Your passkey is used to recover your account. Keep it safe.
        </p>
      </div>

      {/* Password Change */}
      <div className="pt-4 border-t border-white/10">
        <h4 className="text-sm font-medium text-white/80 mb-4">Change Password</h4>
        <div className="space-y-3">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-amber-500/50 focus:outline-none"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-amber-500/50 focus:outline-none"
          />
          <motion.button
            disabled={!newPassword || newPassword !== confirmPassword}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 font-medium transition-colors disabled:opacity-30"
            whileTap={{ scale: 0.98 }}
          >
            Update Password
          </motion.button>
        </div>
      </div>
    </div>
  );

  const renderMaiaSettings = () => (
    <div className="space-y-6">
      {/* Memory Mode */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-3">
          <Shield size={16} />
          Default Memory Mode
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(['continuity', 'sanctuary'] as const).map((mode) => (
            <motion.button
              key={mode}
              onClick={() => updateMaiaSetting('defaultMemoryMode', mode)}
              className={`p-4 rounded-xl border text-left transition-all ${
                maiaSettings.defaultMemoryMode === mode
                  ? mode === 'sanctuary'
                    ? 'border-emerald-500/50 bg-emerald-500/15'
                    : 'border-amber-500/50 bg-amber-500/15'
                  : 'border-white/10 bg-black/20'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`text-sm font-medium ${
                mode === 'sanctuary' ? 'text-emerald-300' : 'text-white/90'
              }`}>
                {mode === 'continuity' ? 'Continuity' : 'Sanctuary'}
              </div>
              <div className="text-xs text-white/50 mt-1">
                {mode === 'continuity'
                  ? 'MAIA remembers what helps growth.'
                  : "Sessions aren't saved. Speak freely."}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Voice Model */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-3">
          <Mic size={16} />
          Voice Model
        </label>
        <div className="grid grid-cols-3 gap-2">
          {VOICE_OPTIONS.map((voice) => (
            <motion.button
              key={voice.id}
              onClick={() => updateNestedMaiaSetting('voice.openaiVoice', voice.id)}
              className={`py-3 px-3 rounded-xl border transition-all ${
                maiaSettings.voice.openaiVoice === voice.id
                  ? 'border-amber-500/50 bg-amber-500/15 text-amber-400'
                  : 'border-white/10 bg-black/20 text-white/60'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-lg mb-1">{voice.emoji}</div>
              <div className="text-xs font-medium">{voice.name}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Voice Speed */}
      <div>
        <label className="text-sm font-medium text-amber-200/80 mb-3 block">
          Voice Speed: {maiaSettings.voice.speed.toFixed(2)}x
        </label>
        <input
          type="range"
          min="0.75"
          max="1.25"
          step="0.05"
          value={maiaSettings.voice.speed}
          onChange={(e) => updateNestedMaiaSetting('voice.speed', parseFloat(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500"
        />
      </div>

      {/* Memory Depth */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-3">
          <Brain size={16} />
          Memory Depth
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['minimal', 'moderate', 'deep'] as const).map((depth) => (
            <motion.button
              key={depth}
              onClick={() => updateNestedMaiaSetting('memory.depth', depth)}
              className={`py-3 rounded-xl border transition-all ${
                maiaSettings.memory.depth === depth
                  ? 'border-amber-500/50 bg-amber-500/15 text-amber-400'
                  : 'border-white/10 bg-black/20 text-white/60'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-xs capitalize">{depth}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Archetype */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-3">
          <Users size={16} />
          MAIA's Presence
        </label>
        <div className="grid grid-cols-3 gap-2">
          {ARCHETYPE_OPTIONS.map((arch) => (
            <motion.button
              key={arch.id}
              onClick={() => updateMaiaSetting('archetype', arch.id)}
              className={`py-3 px-2 rounded-xl border transition-all ${
                maiaSettings.archetype === arch.id
                  ? arch.id === 'AUTO'
                    ? 'border-purple-500/50 bg-purple-500/15 text-purple-300'
                    : 'border-amber-500/50 bg-amber-500/15 text-amber-400'
                  : 'border-white/10 bg-black/20 text-white/60'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-lg mb-1">{arch.emoji}</div>
              <div className="text-xs">{arch.name}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Conversation Style */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-3">
          <MessageSquare size={16} />
          Conversation Style
        </label>
        <div className="space-y-2">
          {(['her', 'classic', 'adaptive'] as ConversationMode[]).map((mode) => {
            const desc = CONVERSATION_STYLE_DESCRIPTIONS[mode];
            return (
              <motion.button
                key={mode}
                onClick={() => updateMaiaSetting('conversationMode', mode)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  maiaSettings.conversationMode === mode
                    ? 'border-amber-500/50 bg-amber-500/15'
                    : 'border-white/10 bg-black/20'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{desc.icon}</span>
                  <div>
                    <span className="text-sm font-medium text-white/90">{desc.title}</span>
                    <p className="text-xs text-white/50">{desc.description}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-4">
      <p className="text-sm text-white/50 mb-6">
        Choose which emails you'd like to receive from MAIA.
      </p>
      {[
        { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of your growth journey' },
        { key: 'breakthroughMoments', label: 'Breakthrough Moments', desc: 'When MAIA notices significant insights' },
        { key: 'communityUpdates', label: 'Community Updates', desc: 'News from the Community Commons' },
        { key: 'productUpdates', label: 'Product Updates', desc: 'New features and improvements' },
      ].map(({ key, label, desc }) => (
        <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
          <div>
            <div className="text-sm font-medium text-white/90">{label}</div>
            <div className="text-xs text-white/50">{desc}</div>
          </div>
          {renderToggle(
            memberSettings?.notifications[key as keyof typeof memberSettings.notifications] ?? false,
            () => updateNotification(key, !memberSettings?.notifications[key as keyof typeof memberSettings.notifications])
          )}
        </div>
      ))}
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-4">
      <p className="text-sm text-white/50 mb-6">
        Control how your data is used to improve MAIA for everyone.
      </p>
      {[
        { key: 'shareAnonymousInsights', label: 'Anonymous Insights', desc: 'Help improve MAIA with anonymized usage patterns' },
        { key: 'allowResearchParticipation', label: 'Research Participation', desc: 'Contribute to consciousness research studies' },
      ].map(({ key, label, desc }) => (
        <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
          <div>
            <div className="text-sm font-medium text-white/90">{label}</div>
            <div className="text-xs text-white/50">{desc}</div>
          </div>
          {renderToggle(
            memberSettings?.privacy[key as keyof typeof memberSettings.privacy] ?? false,
            () => updatePrivacy(key, !memberSettings?.privacy[key as keyof typeof memberSettings.privacy])
          )}
        </div>
      ))}
    </div>
  );

  const renderMembership = () => {
    const tier = profile?.membership?.tier || 'explorer';
    const tierInfo = CIRCLE_TIERS[tier as keyof typeof CIRCLE_TIERS] || CIRCLE_TIERS.explorer;

    return (
      <div className="space-y-6">
        {/* Current Tier */}
        <div className="p-6 bg-gradient-to-br from-amber-500/10 to-purple-500/10 rounded-xl border border-amber-500/20">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{tierInfo.emoji}</span>
            <div>
              <div className={`text-xl font-medium ${tierInfo.color}`}>{tierInfo.name}</div>
              <div className="text-sm text-white/50">
                {profile?.membership?.joinedAt
                  ? `Since ${new Date(profile.membership.joinedAt).toLocaleDateString()}`
                  : 'Current tier'}
              </div>
            </div>
          </div>
          {profile?.membership?.amount ? (
            <div className="text-sm text-white/60">
              Contributing ${profile.membership.amount}/month
            </div>
          ) : null}
        </div>

        {/* Tier Benefits */}
        <div>
          <h4 className="text-sm font-medium text-white/80 mb-3">All Members Receive</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li className="flex items-center gap-2">
              <Check size={14} className="text-emerald-400" />
              Full MAIA access with all features
            </li>
            <li className="flex items-center gap-2">
              <Check size={14} className="text-emerald-400" />
              Community Commons access
            </li>
            <li className="flex items-center gap-2">
              <Check size={14} className="text-emerald-400" />
              Consciousness Lab tools
            </li>
          </ul>
        </div>

        {/* Upgrade CTA */}
        <motion.button
          onClick={() => window.location.href = '/maia?openSettings=true'}
          className="w-full py-3 bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 border border-amber-500/30 rounded-xl text-amber-300 font-medium transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          <Sparkles className="inline w-4 h-4 mr-2" />
          Join Sustaining Circle
        </motion.button>
      </div>
    );
  };

  const renderConnections = () => (
    <div className="space-y-6">
      <p className="text-sm text-white/50 mb-6">
        Connect external services to enhance your MAIA experience.
      </p>

      {userId ? (
        <GoogleConnectSection userId={userId} />
      ) : (
        <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-white/50 text-sm">
          Sign in to connect services
        </div>
      )}
    </div>
  );

  const renderData = () => (
    <div className="space-y-6">
      {/* Export */}
      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-start gap-3">
          <Download className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-white/90">Export Your Data</h4>
            <p className="text-xs text-white/50 mt-1 mb-3">
              Download all your data including profile, settings, and session history.
            </p>
            <motion.button
              onClick={exportData}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 text-sm font-medium transition-colors"
              whileTap={{ scale: 0.98 }}
            >
              Download JSON
            </motion.button>
          </div>
        </div>
      </div>

      {/* Delete Account */}
      <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-red-300">Delete Account</h4>
            <p className="text-xs text-white/50 mt-1 mb-3">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={`Type "${profile?.username}" to confirm`}
              className="w-full px-3 py-2 mb-2 bg-white/5 border border-red-500/20 rounded-lg text-white text-sm placeholder-white/30 focus:border-red-500/50 focus:outline-none"
            />
            <motion.button
              onClick={deleteAccount}
              disabled={deleteConfirm !== profile?.username || deleting}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              whileTap={{ scale: 0.98 }}
            >
              {deleting ? 'Deleting...' : 'Delete My Account'}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Main Render
  // ─────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="animate-pulse text-white/50">Loading settings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {activeSection && (
            <motion.button
              onClick={() => setActiveSection(null)}
              className="p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={20} className="text-white/60" />
            </motion.button>
          )}
          <div>
            <h1 className="text-2xl font-light text-amber-50">
              {activeSection
                ? SECTIONS.find(s => s.id === activeSection)?.label
                : 'Settings'}
            </h1>
            {!activeSection && (
              <p className="text-sm text-white/50 mt-1">
                Manage your account and preferences
              </p>
            )}
          </div>
        </div>

        {/* Save indicator */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5 text-emerald-400 text-sm"
            >
              <Check size={16} />
              <span>Saved</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {!activeSection ? (
          /* Section List */
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-2"
          >
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <motion.button
                key={id}
                onClick={() => setActiveSection(id)}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className="text-amber-400" />
                  <span className="text-white/90">{label}</span>
                </div>
                <ChevronRight size={18} className="text-white/40" />
              </motion.button>
            ))}
          </motion.div>
        ) : (
          /* Section Detail */
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {activeSection === 'profile' && renderProfile()}
            {activeSection === 'account' && renderAccount()}
            {activeSection === 'maia' && renderMaiaSettings()}
            {activeSection === 'notifications' && renderNotifications()}
            {activeSection === 'privacy' && renderPrivacy()}
            {activeSection === 'membership' && renderMembership()}
            {activeSection === 'connections' && renderConnections()}
            {activeSection === 'data' && renderData()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
