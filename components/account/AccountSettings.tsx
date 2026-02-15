'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiUrl, apiBaseUrl, BUILD_STAMP } from '@/lib/http/apiBase';
import { Capacitor } from '@capacitor/core';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Shield, Mic, Brain, Users, MessageSquare, Bell, Lock,
  Link as LinkIcon, Download, Trash2, Check, ChevronRight, Eye, EyeOff,
  Mail, Clock, Crown, Sparkles, AlertTriangle, ArrowLeft, BookOpen,
  Star, MapPin, Search, ExternalLink, Globe
} from 'lucide-react';
import Link from 'next/link';
import { GoogleConnectSection } from '@/components/settings/GoogleConnectSection';
import {
  getAccountSettings,
  saveAccountSettings,
  DEFAULT_ACCOUNT_SETTINGS,
  type AccountSettings as AccountSettingsType,
} from '@/lib/settings/accountSettings';
import {
  setStorageMode,
  setAutoSync,
  setDataTypeConsent,
  setSanctuaryDefault,
  getConsentSummary,
  getSyncState,
  subscribeSyncState,
  triggerSync,
  getSyncStatus,
  DEFAULT_STORAGE_CONSENT,
  type StorageMode,
  type ConsentSummary,
  type DataType,
} from '@/lib/storage/sovereign';
import { Database, HardDrive, Cloud, RefreshCw } from 'lucide-react';
import ForgettingRitual from '@/components/sovereignty/ForgettingRitual';
import type { ArchetypeId } from '@/lib/services/archetypePreferenceService';
import { ConversationMode, CONVERSATION_STYLE_DESCRIPTIONS } from '@/lib/types/conversation-style';
import { useUpdate } from '@/components/providers/UpdateProvider';
import { Settings } from 'lucide-react';
import VoiceSettingsPanel from '@/components/settings/VoiceSettingsPanel';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface BirthDataType {
  date: string | null;
  time: string | null;
  location: {
    lat: number;
    lng: number;
    name: string | null;
    timezone: string | null;
  } | null;
}

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
  birthData: BirthDataType | null;
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

type SettingsSection = 'profile' | 'account' | 'astrology' | 'maia' | 'voice' | 'data-privacy' | 'sovereignty' | 'notifications' | 'privacy' | 'membership' | 'connections' | 'data' | 'portals';

interface PractitionerProject {
  id: string;
  slug: string;
  name: string;
  publicUrl: string;
  previewUrl: string;
  status: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const SUGGESTED_NAMES = [
  { name: 'MAIA', description: 'Original name (default)' },
  { name: 'Maya', description: 'Softer, more intimate' },
  { name: 'Aria', description: 'Musical, flowing' },
  { name: 'Sophia', description: 'Wisdom' },
  { name: 'Sage', description: 'Guide, counsel' },
  { name: 'Oracle', description: 'Visionary presence' },
  { name: 'Nova', description: 'New light' },
];

// Patterns for names that warrant a gentle confirmation
const SENSITIVE_NAME_PATTERNS = [
  /^(mom|mother|dad|father|mama|papa|mum|mummy|daddy|mommy)$/i,
  /^(god|jesus|allah|buddha|christ|lord|savior|messiah)$/i,
  /^(doctor|dr\.?|therapist|counselor|psychiatrist)$/i,
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

const SECTIONS: { id: SettingsSection; label: string; icon: typeof User; practitionerOnly?: boolean }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: Lock },
  { id: 'portals', label: 'Client Portals', icon: Globe, practitionerOnly: true },
  { id: 'astrology', label: 'Birth Chart', icon: Star },
  { id: 'maia', label: 'MAIA Settings', icon: Brain },
  { id: 'voice', label: 'Voice', icon: Mic },
  { id: 'data-privacy', label: 'Data & Privacy', icon: Eye },
  { id: 'sovereignty', label: 'Data Sovereignty', icon: Database },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'membership', label: 'Membership', icon: Crown },
  { id: 'connections', label: 'Connections', icon: LinkIcon },
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

  // Practitioner projects state
  const [projects, setProjects] = useState<PractitionerProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Password change state
  const [showPasskey, setShowPasskey] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Delete account state
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Settings applied confirmation
  const [settingsApplied, setSettingsApplied] = useState(false);

  // Profile edit state
  const [editName, setEditName] = useState('');
  const [editPreferredName, setEditPreferredName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBio, setEditBio] = useState('');

  // Birth data edit state
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editBirthTime, setEditBirthTime] = useState('');
  const [editBirthLocation, setEditBirthLocation] = useState('');
  const [birthLocationSearch, setBirthLocationSearch] = useState('');
  const [locationResults, setLocationResults] = useState<Array<{
    display_name: string;
    lat: string;
    lon: string;
    timezone: string;
  }>>([]);
  const [showLocationResults, setShowLocationResults] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
    timezone: string;
  } | null>(null);
  const [searchingLocation, setSearchingLocation] = useState(false);

  // Sovereignty state
  const [consentSummary, setConsentSummary] = useState<ConsentSummary | null>(null);
  const [syncState, setSyncState] = useState({ isSyncing: false, lastSyncAt: null as Date | null, pendingCount: 0 });
  const [syncCounts, setSyncCounts] = useState({ local: 0, server: 0, pending: 0 });
  const [showForgettingRitual, setShowForgettingRitual] = useState(false);

  // App update service
  const { currentVersion, checkForUpdate, isChecking, lastCheckResult } = useUpdate();

  // Native app build info
  const [nativeBuildInfo, setNativeBuildInfo] = useState<{ version: string; build: string } | null>(null);

  // Custom assistant name state
  const [customNameInput, setCustomNameInput] = useState('');
  const [showCustomNameInput, setShowCustomNameInput] = useState(false);
  const [sensitiveNameWarning, setSensitiveNameWarning] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // Data Loading
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const loadData = async () => {
      // Get user from localStorage
      const storedUser = localStorage.getItem('beta_user');
      console.log('[AccountSettings] Loading data, storedUser:', storedUser ? 'found' : 'not found');
      if (!storedUser) {
        setLoading(false);
        return;
      }

      try {
        const user = JSON.parse(storedUser);
        const memberId = user.id || user.passkey;
        console.log('[AccountSettings] Member ID:', memberId);
        setUserId(memberId);

        // Load MAIA settings from localStorage
        setMaiaSettings(getAccountSettings());

        // Load profile from server
        console.log('[AccountSettings] Fetching profile from API...');
        const profileRes = await fetch(apiUrl(`/api/members/profile?id=${memberId}`));
        console.log('[AccountSettings] Profile API response status:', profileRes.status);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          console.log('[AccountSettings] Profile data received:', profileData);
          console.log('[AccountSettings] Birth data in profile:', profileData.birthData);
          setProfile(profileData);
          setEditName(profileData.name || '');
          setEditPreferredName(profileData.preferredName || '');
          setEditEmail(profileData.email || '');
          setEditBio(profileData.bio || '');

          // Load birth data
          if (profileData.birthData) {
            console.log('[AccountSettings] Setting birth data fields:', {
              date: profileData.birthData.date,
              time: profileData.birthData.time,
              location: profileData.birthData.location,
            });
            // Parse date to ensure YYYY-MM-DD format for HTML date input
            let dateStr = '';
            if (profileData.birthData.date) {
              const rawDate = profileData.birthData.date;
              // Handle various formats: ISO string, Date object, or already YYYY-MM-DD
              if (typeof rawDate === 'string') {
                // If it's an ISO string like "1966-12-09T00:00:00.000Z", extract just the date part
                dateStr = rawDate.split('T')[0];
              } else if (rawDate instanceof Date) {
                dateStr = rawDate.toISOString().split('T')[0];
              }
              console.log('[AccountSettings] Parsed date:', rawDate, '->', dateStr);
            }
            setEditBirthDate(dateStr);
            setEditBirthTime(profileData.birthData.time || '');
            if (profileData.birthData.location) {
              setEditBirthLocation(profileData.birthData.location.name || '');
              setSelectedLocation({
                lat: profileData.birthData.location.lat,
                lng: profileData.birthData.location.lng,
                name: profileData.birthData.location.name || '',
                timezone: profileData.birthData.location.timezone || 'UTC',
              });
            }
          } else {
            console.log('[AccountSettings] No birth data in profile response');
          }
        } else {
          console.error('[AccountSettings] Profile API failed:', profileRes.status);
        }

        // Load settings from server
        const settingsRes = await fetch(apiUrl(`/api/members/settings?memberId=${memberId}`));
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setMemberSettings({
            notifications: settingsData.notifications,
            privacy: settingsData.privacy,
          });
        }

        // Load sovereignty/consent data (local first, then reconcile with server)
        let summary = await getConsentSummary();
        setConsentSummary(summary);

        // Reconcile with server-authoritative consent
        // Server is the source of truth for *Server consent flags
        try {
          const consentRes = await fetch(apiUrl(`/api/account/storage-consent?memberId=${memberId}`));
          if (consentRes.ok) {
            const { consent: serverConsent } = await consentRes.json();
            if (serverConsent && typeof serverConsent === 'object') {
              // Check each server-relevant flag and update local if different
              const dataTypes: DataType[] = ['conversations', 'journals', 'audio', 'memories', 'insights'];
              let needsRefresh = false;

              for (const dt of dataTypes) {
                const serverKey = `${dt}Server` as keyof typeof serverConsent;
                const localKey = `${dt}Local` as keyof typeof serverConsent;
                const serverValue = serverConsent[serverKey];
                const localValue = serverConsent[localKey];
                const localDetail = summary.details?.[dt];

                // If server has an explicit value that differs from local, update local
                if (typeof serverValue === 'boolean' && localDetail?.saveServer !== serverValue) {
                  console.log(`[Consent] Reconciling ${dt}Server: local=${localDetail?.saveServer} → server=${serverValue}`);
                  await setDataTypeConsent(dt, localDetail?.saveLocal ?? false, serverValue);
                  needsRefresh = true;
                }
                // Also sync local flags if server has them
                if (typeof localValue === 'boolean' && localDetail?.saveLocal !== localValue) {
                  console.log(`[Consent] Reconciling ${dt}Local: local=${localDetail?.saveLocal} → server=${localValue}`);
                  await setDataTypeConsent(dt, localValue, localDetail?.saveServer ?? false);
                  needsRefresh = true;
                }
              }

              if (needsRefresh) {
                summary = await getConsentSummary();
                setConsentSummary(summary);
              }
            }
          }
        } catch (e) {
          console.warn('[Consent] Failed to reconcile with server:', e);
          // Continue with local-only — graceful degradation
        }

        // Get sync status
        const counts = await getSyncStatus(memberId);
        setSyncCounts(counts);

        // Load practitioner projects (if user is a practitioner)
        try {
          const projectsRes = await fetch(apiUrl('/api/practitioner/projects'), {
            headers: { 'x-member-id': memberId }
          });
          if (projectsRes.ok) {
            const projectsData = await projectsRes.json();
            setProjects(projectsData.projects || []);
          }
          // 404 is expected for non-practitioners, ignore silently
        } catch (e) {
          console.log('[AccountSettings] Projects not available (non-practitioner)');
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

  // Detect native app build info (Capacitor)
  useEffect(() => {
    const checkNativeBuild = async () => {
      if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.()) {
        try {
          const { App } = await import('@capacitor/app');
          const info = await App.getInfo();
          setNativeBuildInfo({ version: info.version, build: info.build });
        } catch (e) {
          console.log('[AccountSettings] Not running in native app');
        }
      }
    };
    checkNativeBuild();
  }, []);

  // Subscribe to sync state
  useEffect(() => {
    const unsubscribe = subscribeSyncState((state) => {
      setSyncState(state);
    });
    return unsubscribe;
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
      fetch(apiUrl('/api/members/settings'), {
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

    // Sync voice settings to legacy localStorage keys used by OracleConversation
    // This ensures both event paths are triggered for maximum compatibility
    if (path === 'voice.openaiVoice') {
      localStorage.setItem('selected_voice', value as string);
    }
    if (path.startsWith('voice.')) {
      // Force reload of voice settings in OracleConversation
      window.dispatchEvent(new Event('conversationStyleChanged'));
    }

    // Also sync nested settings to server if we have userId
    if (userId) {
      // Map nested paths to server API keys
      const serverKeyMap: Record<string, string> = {
        'voice.openaiVoice': 'voiceModel',
        'voice.speed': 'voiceSpeed',
        'memory.depth': 'memoryDepth',
      };

      const serverKey = serverKeyMap[path];
      if (serverKey) {
        fetch(apiUrl('/api/members/settings'), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberId: userId,
            [serverKey]: value,
          }),
        }).catch(console.error);
      }
    }
  }, [maiaSettings, userId, showSaveIndicator]);

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

    await fetch(apiUrl('/api/members/settings'), {
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

    await fetch(apiUrl('/api/members/settings'), {
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
      const res = await fetch(apiUrl('/api/members/profile'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: userId,
          name: editName,
          preferredName: editPreferredName,
          email: editEmail,
          bio: editBio,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(prev => prev ? { ...prev, ...data.profile } : null);

        // Also update localStorage so MAIA uses the new name immediately
        const storedUser = localStorage.getItem('beta_user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            user.name = editName;
            user.preferredName = editPreferredName;
            localStorage.setItem('beta_user', JSON.stringify(user));
            // Also update the explorerPreferredName key that greetingService reads
            if (editPreferredName) {
              localStorage.setItem('explorerPreferredName', editPreferredName);
            }
          } catch (e) {
            console.error('[AccountSettings] Failed to update localStorage:', e);
          }
        }

        showSaveIndicator();
      }
    } catch (err) {
      console.error('[AccountSettings] Save profile error:', err);
    } finally {
      setSaving(false);
    }
  }, [userId, editName, editPreferredName, editEmail, editBio, showSaveIndicator]);

  // Search for birth location
  const searchLocation = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setLocationResults([]);
      return;
    }

    setSearchingLocation(true);
    try {
      const res = await fetch(apiUrl(`/api/astrology/geocode?q=${encodeURIComponent(query)}`));
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setLocationResults(data.data);
          setShowLocationResults(true);
        }
      }
    } catch (err) {
      console.error('[AccountSettings] Location search error:', err);
    } finally {
      setSearchingLocation(false);
    }
  }, []);

  // Debounced location search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (birthLocationSearch && birthLocationSearch.length >= 3) {
        searchLocation(birthLocationSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [birthLocationSearch, searchLocation]);

  // Save birth data
  const saveBirthData = useCallback(async () => {
    if (!userId) return;
    setSaving(true);

    try {
      const birthData = editBirthDate ? {
        date: editBirthDate,
        time: editBirthTime || null,
        location: selectedLocation ? {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          name: selectedLocation.name,
          timezone: selectedLocation.timezone,
        } : null,
      } : null;

      // Debug logging
      console.log('[AccountSettings] Saving birth data:', {
        editBirthDate,
        editBirthTime,
        selectedLocation,
        birthDataToSend: birthData,
      });

      const res = await fetch(apiUrl('/api/members/profile'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: userId,
          birthData,
        }),
      });

      if (res.ok) {
        // Update local profile state
        setProfile(prev => prev ? {
          ...prev,
          birthData,
        } : null);

        // Store birth data in localStorage for immediate MAIA access
        const storedUser = localStorage.getItem('beta_user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            user.birthData = birthData;
            localStorage.setItem('beta_user', JSON.stringify(user));
          } catch (e) {
            console.error('[AccountSettings] Failed to update localStorage:', e);
          }
        }

        showSaveIndicator();
      }
    } catch (err) {
      console.error('[AccountSettings] Save birth data error:', err);
    } finally {
      setSaving(false);
    }
  }, [userId, editBirthDate, editBirthTime, selectedLocation, showSaveIndicator]);

  // Sovereignty handlers
  const updateStorageMode = useCallback(async (mode: StorageMode) => {
    if ('vibrate' in navigator) navigator.vibrate(5);
    await setStorageMode(mode);
    const summary = await getConsentSummary();
    setConsentSummary(summary);
    showSaveIndicator();
  }, [showSaveIndicator]);

  const updateAutoSync = useCallback(async (enabled: boolean) => {
    if ('vibrate' in navigator) navigator.vibrate(5);
    await setAutoSync(enabled);
    const summary = await getConsentSummary();
    setConsentSummary(summary);
    showSaveIndicator();
  }, [showSaveIndicator]);

  const handleManualSync = useCallback(async () => {
    if (!userId || syncState.isSyncing) return;
    await triggerSync(userId);
    const counts = await getSyncStatus(userId);
    setSyncCounts(counts);
  }, [userId, syncState.isSyncing]);

  const exportData = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await fetch(apiUrl('/api/members/export-data'), {
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
      const res = await fetch(apiUrl('/api/members/delete-account'), {
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

  // Handler for changing password
  const handleChangePassword = async () => {
    // Validate inputs with helpful messages
    if (!currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }
    if (!newPassword) {
      setPasswordError('Please enter a new password');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordChanging(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      const res = await fetch('/api/members/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || 'Failed to change password');
        return;
      }

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError('Network error. Please try again.');
    } finally {
      setPasswordChanging(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render Helpers
  // ─────────────────────────────────────────────────────────────────────────

  const renderToggle = (enabled: boolean, onToggle: () => void) => (
    <button
      onClick={onToggle}
      className={`w-11 h-6 rounded-full p-0.5 transition-all duration-150
        active:scale-95 active:ring-2 active:ring-amber-400/50 ${
        enabled ? 'bg-amber-500 active:bg-amber-400' : 'bg-white/20 active:bg-white/30'
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
        <label className="text-sm text-stone-400 mb-2 block">Display Name</label>
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-stone-200 placeholder-stone-500 focus:border-amber-500/50 focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm text-stone-400 mb-2 block">What should MAIA call you?</label>
        <input
          type="text"
          value={editPreferredName}
          onChange={(e) => setEditPreferredName(e.target.value)}
          placeholder={editName || 'Your preferred name'}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-stone-200 placeholder-stone-500 focus:border-amber-500/50 focus:outline-none"
        />
        <p className="text-xs text-stone-500 mt-2">Used in greetings and voice conversations</p>
      </div>
      <div>
        <label className="text-sm text-stone-400 mb-2 block">Email</label>
        <input
          type="email"
          value={editEmail}
          onChange={(e) => setEditEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-stone-200 placeholder-stone-500 focus:border-amber-500/50 focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm text-stone-400 mb-2 block">Bio</label>
        <textarea
          value={editBio}
          onChange={(e) => setEditBio(e.target.value)}
          placeholder="A brief description about yourself..."
          rows={3}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-stone-200 placeholder-stone-500 focus:border-amber-500/50 focus:outline-none resize-none"
        />
      </div>
      <div className="flex items-center justify-between text-sm text-stone-500">
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
        <label className="text-sm text-stone-400 mb-2 block">Your Passkey</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-stone-200 font-mono text-sm">
            {showPasskey ? profile?.passkey : '••••••••••••••••'}
          </div>
          <button
            onClick={() => setShowPasskey(!showPasskey)}
            className="p-3 bg-white/5 border border-white/10 rounded-xl text-stone-400 hover:text-stone-200 transition-colors"
          >
            {showPasskey ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <p className="text-xs text-stone-500 mt-2">
          Your passkey is used to recover your account. Keep it safe.
        </p>
      </div>

      {/* Password Change */}
      <div className="pt-4 border-t border-white/10">
        <h4 className="text-sm font-medium text-stone-300 mb-4">Change Password</h4>
        <div className="space-y-3">
          {passwordError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
              Password updated successfully
            </div>
          )}
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError(null); }}
            placeholder="Current password"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-stone-200 placeholder-stone-500 focus:border-amber-500/50 focus:outline-none"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setPasswordError(null); }}
            placeholder="New password (min 8 characters)"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-stone-200 placeholder-stone-500 focus:border-amber-500/50 focus:outline-none"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(null); }}
            placeholder="Confirm new password"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-stone-200 placeholder-stone-500 focus:border-amber-500/50 focus:outline-none"
          />
          <motion.button
            type="button"
            onClick={handleChangePassword}
            disabled={!currentPassword || !newPassword || newPassword !== confirmPassword || passwordChanging}
            className="w-full py-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-stone-200 font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            whileTap={{ scale: 0.98 }}
          >
            {passwordChanging ? 'Updating...' : 'Update Password'}
          </motion.button>
        </div>
      </div>
    </div>
  );

  // Helper to check if name is sensitive
  const isSensitiveName = (name: string) => {
    return SENSITIVE_NAME_PATTERNS.some(pattern => pattern.test(name.trim()));
  };

  // Handler for setting assistant name
  const handleSetAssistantName = (name: string) => {
    if (isSensitiveName(name)) {
      setSensitiveNameWarning(true);
      setCustomNameInput(name);
    } else {
      updateMaiaSetting('preferredAssistantName', name);
      setShowCustomNameInput(false);
      setCustomNameInput('');
      setSensitiveNameWarning(false);
    }
  };

  // Handler for confirming sensitive name
  const confirmSensitiveName = () => {
    updateMaiaSetting('preferredAssistantName', customNameInput);
    setShowCustomNameInput(false);
    setCustomNameInput('');
    setSensitiveNameWarning(false);
  };

  const renderMaiaSettings = () => (
    <div className="space-y-6">
      {/* Assistant Name */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-2">
          <User size={16} />
          What should MAIA call herself?
        </label>
        <p className="text-xs text-stone-500 mb-3">
          Choose a name that feels companionable, symbolic, or relational.
          MAIA is not a replacement for a person, authority, or loved one.
        </p>

        {/* Suggested Names */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {SUGGESTED_NAMES.map((suggestion) => {
            const isSelected = maiaSettings.preferredAssistantName === suggestion.name;
            return (
              <motion.button
                key={suggestion.name}
                onClick={() => handleSetAssistantName(suggestion.name)}
                className={`py-2.5 px-2 rounded-xl border transition-all active:scale-95 relative ${
                  isSelected
                    ? 'border-amber-400/70 bg-amber-500/20 text-amber-300 ring-2 ring-amber-400/40'
                    : 'border-white/10 bg-white/5 text-stone-400 hover:bg-white/10'
                }`}
                whileTap={{ scale: 0.95 }}
                title={suggestion.description}
              >
                {isSelected && (
                  <div className="absolute top-1 right-1 text-amber-300">
                    <Check size={10} />
                  </div>
                )}
                <div className="text-xs font-medium">{suggestion.name}</div>
              </motion.button>
            );
          })}
        </div>

        {/* Custom Name Option */}
        {!showCustomNameInput ? (
          <motion.button
            onClick={() => setShowCustomNameInput(true)}
            className="w-full py-2 text-xs text-stone-500 hover:text-stone-500 transition-colors"
            whileTap={{ scale: 0.98 }}
          >
            Or choose a custom name...
          </motion.button>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={customNameInput}
                onChange={(e) => {
                  setCustomNameInput(e.target.value);
                  setSensitiveNameWarning(false);
                }}
                placeholder="Enter a name..."
                maxLength={30}
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-stone-200 text-sm placeholder-stone-500 focus:border-amber-500/50 focus:outline-none"
                autoFocus
              />
              <motion.button
                onClick={() => customNameInput.trim() && handleSetAssistantName(customNameInput.trim())}
                disabled={!customNameInput.trim()}
                className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-amber-300 text-sm font-medium transition-colors disabled:opacity-30"
                whileTap={{ scale: 0.95 }}
              >
                Set
              </motion.button>
              <motion.button
                onClick={() => {
                  setShowCustomNameInput(false);
                  setCustomNameInput('');
                  setSensitiveNameWarning(false);
                }}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-stone-400 text-sm transition-colors hover:bg-white/10"
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            </div>

            {/* Sensitive Name Warning */}
            <AnimatePresence>
              {sensitiveNameWarning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg"
                >
                  <p className="text-xs text-amber-200/90 mb-2">
                    This name carries personal meaning. MAIA will remain a guide and companion,
                    not a substitute for human relationships. Continue with this name?
                  </p>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={confirmSensitiveName}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded text-amber-300 text-xs font-medium transition-colors"
                      whileTap={{ scale: 0.95 }}
                    >
                      Yes, use this name
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        setCustomNameInput('');
                        setSensitiveNameWarning(false);
                      }}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-stone-400 text-xs transition-colors hover:bg-white/10"
                      whileTap={{ scale: 0.95 }}
                    >
                      Choose different name
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Current Name Display */}
        {maiaSettings.preferredAssistantName && maiaSettings.preferredAssistantName !== 'MAIA' && (
          <div className="mt-3 p-2 bg-white/5 rounded-lg text-center">
            <span className="text-xs text-stone-500">Currently: </span>
            <span className="text-xs text-amber-300 font-medium">{maiaSettings.preferredAssistantName}</span>
          </div>
        )}
      </div>

      {/* Memory Mode */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-3">
          <Shield size={16} />
          Default Memory Mode
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(['continuity', 'sanctuary'] as const).map((mode) => {
            const isSelected = maiaSettings.defaultMemoryMode === mode;
            return (
              <motion.button
                key={mode}
                onClick={() => updateMaiaSetting('defaultMemoryMode', mode)}
                className={`p-4 rounded-xl border text-left transition-all active:scale-95 relative ${
                  isSelected
                    ? mode === 'sanctuary'
                      ? 'border-emerald-400/70 bg-emerald-500/20 ring-2 ring-emerald-400/40 active:bg-emerald-500/30'
                      : 'border-amber-400/70 bg-amber-500/20 ring-2 ring-amber-400/40 active:bg-amber-500/30'
                    : 'border-white/10 bg-white/5 active:bg-white/10 active:border-white/20'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                {isSelected && (
                  <div className={`absolute top-2 right-2 ${mode === 'sanctuary' ? 'text-emerald-300' : 'text-amber-300'}`}>
                    <Check size={16} />
                  </div>
                )}
                <div className={`text-sm font-medium ${
                  isSelected
                    ? mode === 'sanctuary' ? 'text-emerald-200' : 'text-amber-200'
                    : mode === 'sanctuary' ? 'text-emerald-300' : 'text-stone-300'
                }`}>
                  {mode === 'continuity' ? 'Continuity' : 'Sanctuary'}
                </div>
                <div className="text-xs text-stone-500 mt-1">
                  {mode === 'continuity'
                    ? 'MAIA remembers what helps growth.'
                    : "Sessions aren't saved. Speak freely."}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Voice — sovereign controls live in the dedicated Voice section */}
      <motion.button
        onClick={() => setActiveSection('voice')}
        className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 active:bg-white/60 transition-colors"
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/10 text-amber-400">
            <Mic size={18} />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-stone-200">Voice Preferences</div>
            <div className="text-xs text-stone-500">
              Pace, warmth, clarity, guidance style, energy
            </div>
          </div>
        </div>
        <ChevronRight size={16} className="text-stone-500" />
      </motion.button>

      {/* Memory Depth */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-3">
          <Brain size={16} />
          Memory Depth
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['minimal', 'moderate', 'deep'] as const).map((depth) => {
            const isSelected = maiaSettings.memory.depth === depth;
            return (
              <motion.button
                key={depth}
                onClick={() => updateNestedMaiaSetting('memory.depth', depth)}
                className={`py-3 rounded-xl border transition-all active:scale-95 relative ${
                  isSelected
                    ? 'border-amber-400/70 bg-amber-500/20 text-amber-300 ring-2 ring-amber-400/40 active:bg-amber-500/30'
                    : 'border-white/10 bg-white/5 text-stone-400 active:bg-white/10 active:border-white/20'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {isSelected && (
                  <div className="absolute top-1 right-1 text-amber-300">
                    <Check size={12} />
                  </div>
                )}
                <div className="text-xs capitalize">{depth}</div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Archetype */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-3">
          <Users size={16} />
          MAIA's Presence
        </label>
        <div className="grid grid-cols-3 gap-2">
          {ARCHETYPE_OPTIONS.map((arch) => {
            const isSelected = maiaSettings.archetype === arch.id;
            return (
              <motion.button
                key={arch.id}
                onClick={() => updateMaiaSetting('archetype', arch.id)}
                className={`py-3 px-2 rounded-xl border transition-all active:scale-95 relative ${
                  isSelected
                    ? arch.id === 'AUTO'
                      ? 'border-purple-400/70 bg-purple-500/20 text-purple-200 ring-2 ring-purple-400/40 active:bg-purple-500/30'
                      : 'border-amber-400/70 bg-amber-500/20 text-amber-300 ring-2 ring-amber-400/40 active:bg-amber-500/30'
                    : 'border-white/10 bg-white/5 text-stone-400 active:bg-white/10 active:border-white/20'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {isSelected && (
                  <div className={`absolute top-1 right-1 ${arch.id === 'AUTO' ? 'text-purple-300' : 'text-amber-300'}`}>
                    <Check size={12} />
                  </div>
                )}
                <div className="text-lg mb-1">{arch.emoji}</div>
                <div className="text-xs">{arch.name}</div>
              </motion.button>
            );
          })}
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
            const isSelected = maiaSettings.conversationMode === mode;
            return (
              <motion.button
                key={mode}
                onClick={() => updateMaiaSetting('conversationMode', mode)}
                className={`w-full text-left p-3 rounded-xl border transition-all active:scale-[0.98] relative ${
                  isSelected
                    ? 'border-amber-400/70 bg-amber-500/20 ring-2 ring-amber-400/40 active:bg-amber-500/30'
                    : 'border-white/10 bg-white/5 active:bg-white/10 active:border-white/20'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 text-amber-300">
                    <Check size={16} />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-lg">{desc.icon}</span>
                  <div>
                    <span className={`text-sm font-medium ${isSelected ? 'text-amber-200' : 'text-stone-300'}`}>{desc.title}</span>
                    <p className="text-xs text-stone-500">{desc.description}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Vocabulary Tooltips */}
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/10 text-amber-400">
            <BookOpen size={18} />
          </div>
          <div>
            <div className="text-sm font-medium text-stone-200">Vocabulary Tooltips</div>
            <div className="text-xs text-stone-500">
              Highlight soul vocabulary terms with hover definitions
            </div>
          </div>
        </div>
        {renderToggle(
          maiaSettings.display?.vocabularyTooltips ?? true,
          () => updateNestedMaiaSetting('display.vocabularyTooltips', !(maiaSettings.display?.vocabularyTooltips ?? true))
        )}
      </div>

      {/* Apply Settings Button - confirms settings are saved */}
      <motion.button
        onClick={() => {
          // Dispatch event to notify OracleConversation of settings change
          window.dispatchEvent(new CustomEvent('maia-settings-applied', {
            detail: { settings: maiaSettings }
          }));
          // Haptic feedback
          if ('vibrate' in navigator) navigator.vibrate(10);
          // Show confirmation
          setSettingsApplied(true);
          setTimeout(() => setSettingsApplied(false), 2000);
        }}
        className={`w-full py-3 rounded-xl font-medium transition-all ${
          settingsApplied
            ? 'bg-emerald-600 text-white'
            : 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white'
        }`}
        whileTap={{ scale: 0.98 }}
      >
        {settingsApplied ? (
          <span className="flex items-center justify-center gap-2">
            <Check size={18} />
            Settings Applied
          </span>
        ) : (
          'Apply Settings'
        )}
      </motion.button>

      {/* Build Info */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-3">
          <Settings size={16} />
          Build Info
        </label>
        <div className="p-4 bg-stone-800/50 border border-stone-700/50 rounded-lg space-y-4">
          {/* Native App Info */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-stone-500">Native App Build:</span>
              <p className="text-stone-300 font-mono">
                {nativeBuildInfo
                  ? `v${nativeBuildInfo.version} (${nativeBuildInfo.build})`
                  : 'Web / Not native'}
              </p>
            </div>
            <div>
              <span className="text-stone-500">Server Build:</span>
              <p className="text-stone-300 font-mono">
                v{lastCheckResult?.serverVersion || currentVersion?.version || '...'} ({(lastCheckResult?.serverCommit || currentVersion?.commit)?.slice(0, 8) || '...'})
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-stone-700/30" />

          {/* Update Check */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-stone-200">Check for Updates</h4>
              <p className="text-xs text-stone-500 mt-0.5">
                Last checked: {lastCheckResult ? new Date().toLocaleTimeString() : 'Never'}
              </p>
            </div>
            <motion.button
              onClick={() => checkForUpdate()}
              disabled={isChecking}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-stone-700/50 hover:bg-stone-600
                       active:bg-amber-600/70 active:text-amber-100
                       text-stone-300 rounded-lg transition-all duration-150 disabled:opacity-50
                       border border-transparent active:border-amber-500/50"
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'Checking...' : 'Check'}
            </motion.button>
          </div>

          {lastCheckResult && (
            <div className="pt-3 border-t border-stone-700/30">
              {lastCheckResult.updateAvailable ? (
                <p className="text-xs text-amber-400">
                  Update available: v{lastCheckResult.serverVersion}
                </p>
              ) : (
                <p className="text-xs text-green-400">You&apos;re on the latest version</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderVoice = () => (
    <div className="space-y-6">
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-2">
          <Mic size={16} />
          Voice Preferences
        </label>
        <p className="text-xs text-stone-500 mb-4">
          Gently bias MAIA&apos;s vocal tone. These are offsets, not overrides &mdash;
          MAIA can still self-regulate during HOLD states.
        </p>
      </div>
      <VoiceSettingsPanel />
    </div>
  );

  // Handler for updating individual data type consent
  const updateDataTypeConsent = useCallback(async (
    dataType: DataType,
    local: boolean,
    server: boolean
  ) => {
    if ('vibrate' in navigator) navigator.vibrate(5);
    // Update local IndexedDB consent
    await setDataTypeConsent(dataType, local, server);
    const summary = await getConsentSummary();
    setConsentSummary(summary);
    showSaveIndicator();

    // Sync to server (server-authoritative consent)
    if (profile?.id) {
      try {
        await fetch(apiUrl('/api/account/storage-consent'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberId: profile.id,
            [`${dataType}Server`]: server,
            [`${dataType}Local`]: local
          })
        });
      } catch (e) {
        console.warn('Failed to sync consent to server:', e);
      }
    }
  }, [showSaveIndicator, profile?.id]);

  const updateSanctuaryDefault = useCallback(async (enabled: boolean) => {
    if ('vibrate' in navigator) navigator.vibrate(5);
    await setSanctuaryDefault(enabled);
    const summary = await getConsentSummary();
    setConsentSummary(summary);
    showSaveIndicator();
  }, [showSaveIndicator]);

  const renderDataPrivacy = () => {
    const details = consentSummary?.details;

    // Compute live status
    const getStatusLabel = () => {
      if (consentSummary?.sanctuaryDefault) {
        return { text: 'Sanctuary mode — not saved', color: 'text-emerald-400', icon: Shield };
      }
      const hasLocal = consentSummary?.localEnabled;
      const hasServer = consentSummary?.serverEnabled;
      // Use shared defaults from storage system
      const audioLocal = details?.audio?.saveLocal ?? DEFAULT_STORAGE_CONSENT.audioLocal;
      const audioServer = details?.audio?.saveServer ?? DEFAULT_STORAGE_CONSENT.audioServer;
      const audioSaved = audioLocal || audioServer;

      // Build status text with audio indicator
      let audioStatus = audioSaved
        ? (audioLocal && audioServer ? ' | Audio: device + server' : audioLocal ? ' | Audio: device' : ' | Audio: server')
        : '';

      if (hasLocal && hasServer) {
        return { text: `Saved locally + synced to server${audioStatus || ' | Audio: off'}`, color: 'text-amber-400', icon: Check };
      }
      if (hasLocal) {
        return { text: `Saved locally only${audioStatus || ' | Audio: off'}`, color: 'text-blue-400', icon: HardDrive };
      }
      if (hasServer) {
        return { text: `Synced to server only${audioStatus || ' | Audio: off'}`, color: 'text-purple-400', icon: Cloud };
      }
      return { text: 'Not saving', color: 'text-stone-400', icon: AlertTriangle };
    };

    const status = getStatusLabel();
    const StatusIcon = status.icon;

    const DATA_TYPES: { id: DataType; label: string; desc: string; helper?: string }[] = [
      { id: 'conversations', label: 'Conversations', desc: 'Your chats with MAIA (includes voice transcripts)' },
      { id: 'journals', label: 'Journals', desc: 'Quick journal entries and reflections' },
      {
        id: 'audio',
        label: 'Audio recordings',
        desc: 'Raw voice recordings (off by default)',
        helper: 'Transcript and audio are separate: you can save transcripts without saving raw audio.'
      },
    ];

    return (
      <div className="space-y-6">
        {/* Live Status Indicator */}
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${
          consentSummary?.sanctuaryDefault
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : 'bg-white/5 border-white/10'
        }`}>
          <StatusIcon size={20} className={status.color} />
          <span className={`text-sm font-medium ${status.color}`}>{status.text}</span>
        </div>

        {/* Audio Privacy Banner */}
        {(() => {
          // Adaptive footnote based on what's enabled
          const convoEnabled = details?.conversations?.saveLocal || details?.conversations?.saveServer;
          const journalEnabled = details?.journals?.saveLocal || details?.journals?.saveServer;
          const transcriptNote = convoEnabled && journalEnabled
            ? 'Voice transcripts may be saved in Conversations or Journals.'
            : convoEnabled
              ? 'Voice transcripts may be saved in Conversations.'
              : journalEnabled
                ? 'Voice transcripts may be saved in Journals.'
                : 'Voice transcripts won\u2019t be saved unless you enable Conversations or Journals.';

          return (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <Mic className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-amber-200 font-medium mb-2">Audio privacy (default: off)</p>
                  <p className="text-stone-300 leading-relaxed">
                    Raw audio recordings are <strong>not saved</strong> unless you enable audio saving below.
                  </p>
                  <p className="text-stone-500 mt-2 text-xs">
                    Transcript and audio are separate: you can save transcripts without saving raw audio.
                  </p>
                  <p className="text-stone-500 mt-1 text-xs">
                    {transcriptNote} Use <strong>Sanctuary mode</strong> for sessions that aren&apos;t saved at all.
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Sanctuary Mode Toggle */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Shield size={18} />
            </div>
            <div>
              <div className="text-sm font-medium text-emerald-200">Sanctuary Mode Default</div>
              <div className="text-xs text-stone-500">
                Ephemeral sessions — no conversations, journals, transcripts, or audio saved
              </div>
            </div>
          </div>
          {renderToggle(
            consentSummary?.sanctuaryDefault ?? false,
            () => updateSanctuaryDefault(!consentSummary?.sanctuaryDefault)
          )}
        </div>

        {/* Per-Data-Type Toggles */}
        {!consentSummary?.sanctuaryDefault && (() => {
          // Paid feature gate: server audio requires paid membership
          const memberTier = profile?.membership?.tier || 'explorer';
          const canSaveAudioServer = memberTier !== 'explorer';

          return (
          <div>
            <label className="text-sm font-medium text-amber-200/80 mb-3 block">
              Choose what MAIA saves
            </label>
            <div className="space-y-3">
              {DATA_TYPES.map(({ id, label, desc, helper }) => {
                const typeDetails = details?.[id];
                // Use shared defaults from storage system (single source of truth)
                const localKey = `${id}Local` as keyof typeof DEFAULT_STORAGE_CONSENT;
                const serverKey = `${id}Server` as keyof typeof DEFAULT_STORAGE_CONSENT;
                const saveLocal = typeDetails?.saveLocal ?? Boolean(DEFAULT_STORAGE_CONSENT[localKey]);
                const saveServer = typeDetails?.saveServer ?? Boolean(DEFAULT_STORAGE_CONSENT[serverKey]);
                const neitherEnabled = !saveLocal && !saveServer;

                // Audio server is gated to paid members
                const isAudio = id === 'audio';
                const serverDisabled = isAudio && !canSaveAudioServer;

                return (
                  <div key={id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm font-medium text-stone-200">{label}</div>
                        <div className="text-xs text-stone-400">{desc}</div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => updateDataTypeConsent(id, !saveLocal, saveServer)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                          saveLocal
                            ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                            : 'bg-white/5 border border-white/10 text-stone-400'
                        }`}
                      >
                        <HardDrive size={14} />
                        Device
                      </button>
                      <button
                        onClick={() => {
                          if (serverDisabled) return;
                          updateDataTypeConsent(id, saveLocal, !saveServer);
                        }}
                        disabled={serverDisabled}
                        title={serverDisabled ? 'Server audio backup is a paid feature' : undefined}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                          saveServer
                            ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                            : 'bg-white/5 border border-white/10 text-stone-400'
                        } ${serverDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Cloud size={14} />
                        Server{serverDisabled ? ' 🔒' : ''}
                      </button>
                    </div>
                    {/* Paid feature notice for audio server */}
                    {isAudio && !canSaveAudioServer && (
                      <div className="mt-2 text-xs text-amber-300/60 text-center">
                        Cloud audio backup is a paid feature.{' '}
                        <a href="/patrons" className="underline hover:text-amber-200">
                          Upgrade
                        </a>{' '}
                        to enable. Your audio stays on this device unless you opt in.
                      </div>
                    )}
                    {/* Status text when neither enabled */}
                    {neitherEnabled && (
                      <div className="mt-2 text-xs text-stone-500 text-center">
                        {id === 'audio' ? 'Audio recordings will not be stored' : `${label} will not be stored`}
                      </div>
                    )}
                    {/* Helper text (e.g., for audio) */}
                    {helper && (
                      <div className="mt-2 text-xs text-amber-300/60 italic">
                        {helper}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          );
        })()}

        {/* What MAIA Uses */}
        <div className="pt-4 border-t border-white/10">
          <label className="text-sm font-medium text-amber-200/80 mb-3 block">
            What MAIA uses your data for
          </label>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <Brain size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-stone-200 font-medium">Continuity</span>
                <p className="text-stone-500 text-xs mt-0.5">
                  MAIA remembers your patterns, preferences, and growth journey across sessions.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <Sparkles size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-stone-200 font-medium">Personalization</span>
                <p className="text-stone-500 text-xs mt-0.5">
                  Your journals and conversations help MAIA understand what matters to you.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <RefreshCw size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-stone-200 font-medium">Cross-device sync</span>
                <p className="text-stone-500 text-xs mt-0.5">
                  Server storage enables access from any device you sign into.
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-4 text-center">
            MAIA never shares your data with third parties or uses it for advertising.
          </p>
        </div>
      </div>
    );
  };

  const renderNotifications = () => (
    <div className="space-y-4">
      <p className="text-sm text-stone-500 mb-6">
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
            <div className="text-sm font-medium text-stone-200">{label}</div>
            <div className="text-xs text-stone-400">{desc}</div>
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
      <p className="text-sm text-stone-500 mb-6">
        Control how your data is used to improve MAIA for everyone.
      </p>
      {[
        { key: 'shareAnonymousInsights', label: 'Anonymous Insights', desc: 'Help improve MAIA with anonymized usage patterns' },
        { key: 'allowResearchParticipation', label: 'Research Participation', desc: 'Contribute to consciousness research studies' },
      ].map(({ key, label, desc }) => (
        <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
          <div>
            <div className="text-sm font-medium text-stone-200">{label}</div>
            <div className="text-xs text-stone-400">{desc}</div>
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
              <div className="text-sm text-stone-500">
                {profile?.membership?.joinedAt
                  ? `Since ${new Date(profile.membership.joinedAt).toLocaleDateString()}`
                  : 'Current tier'}
              </div>
            </div>
          </div>
          {profile?.membership?.amount ? (
            <div className="text-sm text-stone-500">
              Contributing ${profile.membership.amount}/month
            </div>
          ) : null}
        </div>

        {/* Tier Benefits */}
        <div>
          <h4 className="text-sm font-medium text-stone-300 mb-3">All Members Receive</h4>
          <ul className="space-y-2 text-sm text-stone-500">
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
          onClick={() => window.location.href = '/patrons'}
          className="w-full py-3 bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 border border-amber-500/30 rounded-xl text-amber-300 font-medium transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          <Sparkles className="inline w-4 h-4 mr-2" />
          Join Sustaining Circle
        </motion.button>

        {/* Stewardship Link */}
        <div className="mt-4 text-center">
          <Link
            href="/maia/stewardship"
            className="text-sm text-stone-500 hover:text-stone-500 transition-colors"
          >
            Why support matters →
          </Link>
        </div>
      </div>
    );
  };

  const renderPortals = () => (
    <div className="space-y-6">
      <p className="text-sm text-stone-500 mb-4">
        Quick access to your client-facing portal sites.
      </p>

      {projects.length === 0 ? (
        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
          <div className="text-center mb-4">
            <Globe size={32} className="mx-auto mb-3 text-stone-400" />
            <p className="text-stone-500 font-medium">No client portals found</p>
            <p className="text-sm text-stone-400 mt-1">
              Your member account may not be linked to a practitioner record yet.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <a
              href="/api/practitioner/projects"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                       border border-white/10 text-sm text-stone-500
                       hover:bg-white/10 transition-colors"
            >
              <ExternalLink size={14} />
              <span>Debug API</span>
            </a>

            <Link
              href="/practitioners/signup"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                       bg-amber-500 text-stone-900 text-sm font-medium
                       hover:bg-amber-400 transition-colors"
            >
              <span>Link Practitioner Account</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-xl border border-amber-500/20"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-base font-medium text-amber-100 truncate">
                    {project.name}
                  </div>
                  <div className="text-sm text-stone-500 truncate">
                    {project.publicUrl}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={project.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                             border border-white/10 text-sm text-stone-300
                             hover:bg-white/5 transition-colors"
                  >
                    <ExternalLink size={14} />
                    <span>Open</span>
                  </a>

                  <a
                    href={project.previewUrl}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                             bg-amber-500 text-stone-900 text-sm font-medium
                             hover:bg-amber-400 transition-colors"
                  >
                    <Eye size={14} />
                    <span>Preview</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Practitioner Dashboard Link - only show if user has projects */}
      {projects.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <a
            href="/practitioner/dashboard"
            className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
          >
            <span className="text-stone-200">Go to Practitioner Dashboard</span>
            <ChevronRight size={18} className="text-stone-400" />
          </a>
        </div>
      )}
    </div>
  );

  const renderAstrology = () => (
    <div className="space-y-6">
      <p className="text-sm text-stone-500 mb-4">
        Share your birth details so MAIA can weave astrological wisdom into your conversations.
      </p>

      {/* Birth Date */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-2">
          <Star size={16} />
          Birth Date
        </label>
        <input
          type="date"
          value={editBirthDate}
          onChange={(e) => setEditBirthDate(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-stone-200 focus:border-amber-500/50 focus:outline-none [color-scheme:dark]"
        />
      </div>

      {/* Birth Time */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-2">
          <Clock size={16} />
          Birth Time (optional)
        </label>
        <input
          type="time"
          value={editBirthTime}
          onChange={(e) => setEditBirthTime(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-stone-200 focus:border-amber-500/50 focus:outline-none [color-scheme:dark]"
        />
        <p className="text-xs text-stone-500 mt-1">
          Birth time enables accurate rising sign and house placements
        </p>
      </div>

      {/* Birth Location */}
      <div className="relative">
        <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-2">
          <MapPin size={16} />
          Birth Location
        </label>
        <div className="relative">
          <input
            type="text"
            value={birthLocationSearch || editBirthLocation}
            onChange={(e) => {
              setBirthLocationSearch(e.target.value);
              setEditBirthLocation(e.target.value);
            }}
            onFocus={() => locationResults.length > 0 && setShowLocationResults(true)}
            placeholder="Search city or place..."
            className="w-full px-4 py-3 pr-10 bg-white/5 border border-white/10 rounded-xl text-stone-200 placeholder-stone-500 focus:border-amber-500/50 focus:outline-none"
          />
          {searchingLocation ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
            </div>
          ) : (
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
          )}
        </div>

        {/* Location Search Results */}
        <AnimatePresence>
          {showLocationResults && locationResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 w-full mt-2 bg-stone-900 border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto"
            >
              {locationResults.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const locationObj = {
                      lat: parseFloat(loc.lat),
                      lng: parseFloat(loc.lon),
                      name: loc.display_name,
                      timezone: loc.timezone,
                    };
                    console.log('[AccountSettings] Location selected:', locationObj);
                    setSelectedLocation(locationObj);
                    setEditBirthLocation(loc.display_name);
                    setBirthLocationSearch('');
                    setShowLocationResults(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-white/10 border-b border-white/10 last:border-0 transition-colors"
                >
                  <div className="text-sm text-stone-200 line-clamp-2">{loc.display_name}</div>
                  <div className="text-xs text-stone-500 mt-1">{loc.timezone}</div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Location Display */}
        {selectedLocation && (
          <div className="mt-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="text-xs text-amber-300">Selected:</div>
            <div className="text-sm text-stone-200 line-clamp-1">{selectedLocation.name}</div>
            <div className="text-xs text-stone-500">{selectedLocation.timezone}</div>
          </div>
        )}
      </div>

      {/* Current Chart Status */}
      {profile?.birthData?.date && (
        <div className="p-4 bg-gradient-to-br from-violet-500/10 to-amber-500/10 rounded-xl border border-violet-500/20">
          <div className="flex items-center gap-2 text-violet-300 mb-2">
            <Star size={18} />
            <span className="text-sm font-medium">Birth Chart Saved</span>
          </div>
          <p className="text-xs text-stone-500">
            MAIA can now reference your natal chart and current transits in conversations.
          </p>
          <motion.button
            onClick={() => window.location.href = '/astrology'}
            className="mt-3 text-xs text-amber-400 hover:text-amber-300 transition-colors"
            whileTap={{ scale: 0.98 }}
          >
            View Full Chart →
          </motion.button>
        </div>
      )}

      {/* Save Button */}
      <motion.button
        onClick={saveBirthData}
        disabled={saving || !editBirthDate}
        className="w-full py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-xl text-amber-300 font-medium transition-colors disabled:opacity-50"
        whileTap={{ scale: 0.98 }}
      >
        {saving ? 'Saving...' : 'Save Birth Data'}
      </motion.button>

      {/* Clear Birth Data */}
      {profile?.birthData?.date && (
        <button
          onClick={() => {
            setEditBirthDate('');
            setEditBirthTime('');
            setEditBirthLocation('');
            setSelectedLocation(null);
            saveBirthData();
          }}
          className="w-full text-sm text-stone-500 hover:text-stone-500 transition-colors"
        >
          Clear birth data
        </button>
      )}
    </div>
  );

  const renderSovereignty = () => {
    const currentMode = consentSummary?.mode || 'local_only';

    const STORAGE_MODES: { id: StorageMode; label: string; desc: string; icon: typeof HardDrive; comingSoon?: boolean }[] = [
      {
        id: 'local_only',
        label: 'Device Only',
        desc: 'Data stays on this device. No server sync.',
        icon: HardDrive,
      },
      {
        id: 'both',
        label: 'Device + Cloud',
        desc: 'Local backup + encrypted cloud sync.',
        icon: Database,
        comingSoon: true,
      },
      {
        id: 'server_only',
        label: 'Cloud Only',
        desc: 'Encrypted cloud storage.',
        icon: Cloud,
        comingSoon: true,
      },
    ];

    return (
      <div className="space-y-6">
        <p className="text-sm text-stone-500 mb-4">
          You decide what MAIA remembers. Control where your data lives.
        </p>

        {/* Storage Mode */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-3">
            <Database size={16} />
            Storage Location
          </label>
          <div className="space-y-2">
            {STORAGE_MODES.map(({ id, label, desc, icon: Icon, comingSoon }) => (
              <motion.button
                key={id}
                onClick={() => !comingSoon && updateStorageMode(id)}
                disabled={comingSoon}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  comingSoon
                    ? 'border-white/10 bg-white/5 cursor-not-allowed'
                    : currentMode === id
                      ? 'border-amber-500/50 bg-amber-500/15'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
                whileTap={comingSoon ? {} : { scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className={currentMode === id && !comingSoon ? 'text-amber-400' : 'text-stone-400'} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${comingSoon ? 'text-stone-500' : 'text-stone-200'}`}>{label}</span>
                      {comingSoon && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-500/20 text-purple-300 rounded">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-500">{desc}</div>
                  </div>
                  {currentMode === id && !comingSoon && (
                    <Check size={18} className="ml-auto text-amber-400" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
          <p className="text-[10px] text-stone-400 mt-2 text-center">
            Currently all data is stored locally on your device.
          </p>
        </div>

        {/* Auto Sync Toggle */}
        {(currentMode === 'both' || currentMode === 'server_only') && (
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10 text-amber-400">
                <RefreshCw size={18} />
              </div>
              <div>
                <div className="text-sm font-medium text-stone-200">Auto Sync</div>
                <div className="text-xs text-stone-500">
                  Automatically sync changes in the background
                </div>
              </div>
            </div>
            {renderToggle(
              consentSummary?.autoSync ?? true,
              () => updateAutoSync(!consentSummary?.autoSync)
            )}
          </div>
        )}

        {/* Sync Status */}
        {(currentMode === 'both' || currentMode === 'server_only') && (
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-stone-300">Sync Status</span>
              <motion.button
                onClick={handleManualSync}
                disabled={syncState.isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg text-amber-300 text-xs font-medium transition-colors disabled:opacity-50"
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw size={12} className={syncState.isSyncing ? 'animate-spin' : ''} />
                {syncState.isSyncing ? 'Syncing...' : 'Sync Now'}
              </motion.button>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 bg-white/5 rounded-lg">
                <div className="text-lg font-medium text-stone-200">{syncCounts.local}</div>
                <div className="text-xs text-stone-500">Local</div>
              </div>
              <div className="p-2 bg-white/5 rounded-lg">
                <div className="text-lg font-medium text-stone-200">{syncCounts.server}</div>
                <div className="text-xs text-stone-500">Server</div>
              </div>
              <div className="p-2 bg-white/5 rounded-lg">
                <div className="text-lg font-medium text-amber-400">{syncCounts.pending}</div>
                <div className="text-xs text-stone-500">Pending</div>
              </div>
            </div>
            {syncState.lastSyncAt && (
              <div className="mt-3 text-xs text-stone-500 text-center">
                Last synced: {syncState.lastSyncAt.toLocaleString()}
              </div>
            )}
          </div>
        )}

        {/* Data Types - only show types that are actually wired/enforced */}
        {consentSummary?.details && (
          <div>
            <label className="text-sm font-medium text-amber-200/80 mb-3 block">
              What MAIA Stores
            </label>
            <div className="space-y-2">
              {Object.entries(consentSummary.details)
                .filter(([type]) => ['conversations', 'journals', 'audio'].includes(type))
                .map(([type, decision]) => {
                  const enabled = (decision as { saveLocal: boolean; saveServer: boolean }).saveLocal ||
                                 (decision as { saveLocal: boolean; saveServer: boolean }).saveServer;
                  return (
                    <div key={type} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <span className="text-sm text-stone-300 capitalize">{type.replace(/_/g, ' ')}</span>
                      <span className={`text-xs ${enabled ? 'text-emerald-400' : 'text-stone-400'}`}>
                        {enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Forgetting Ritual */}
        <div className="pt-4 border-t border-white/10">
          <motion.button
            onClick={() => setShowForgettingRitual(true)}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 hover:from-violet-500/15 hover:to-purple-500/15 border border-violet-500/20 rounded-xl transition-colors"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/20 text-violet-300">
                <Trash2 size={18} />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-violet-200">Forgetting Ritual</div>
                <div className="text-xs text-stone-500">
                  Consciously release what no longer serves you
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-violet-300/50" />
          </motion.button>
        </div>

        {/* Architectural Constraints Link */}
        <div className="pt-6 text-center">
          <a
            href="https://github.com/SoullabTech/Sovereign/blob/main/docs/canon/MAIA_PROMISE_v1.0.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-stone-400 hover:text-stone-500 transition-colors"
          >
            MAIA operates under explicit architectural constraints.
          </a>
        </div>
      </div>
    );
  };

  const renderConnections = () => (
    <div className="space-y-6">
      <p className="text-sm text-stone-500 mb-6">
        Connect external services to enhance your MAIA experience.
      </p>

      {userId ? (
        <GoogleConnectSection userId={userId} />
      ) : (
        <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-stone-500 text-sm">
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
            <h4 className="text-sm font-medium text-stone-200">Export Your Data</h4>
            <p className="text-xs text-stone-500 mt-1 mb-3">
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
            <p className="text-xs text-stone-500 mt-1 mb-3">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={`Type "${profile?.username}" to confirm`}
              className="w-full px-3 py-2 mb-2 bg-white/5 border border-red-500/20 rounded-lg text-stone-200 text-sm placeholder-stone-500 focus:border-red-500/50 focus:outline-none"
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
        <div className="animate-pulse text-stone-500">Loading settings...</div>
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
    <div className="max-w-xl mx-auto px-5 py-8 font-sans" style={{ paddingTop: 'max(env(safe-area-inset-top), 2rem)' }}>
      {/* Header - Claude style: minimal */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => activeSection ? setActiveSection(null) : window.location.href = '/maia'}
          className="p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={20} className="text-stone-400" />
        </button>
        <h1 className="text-xl font-medium text-stone-200">
          {activeSection
            ? SECTIONS.find(s => s.id === activeSection)?.label
            : 'Settings'}
        </h1>

        {/* Save indicator */}
        <AnimatePresence>
          {saved && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="ml-auto text-sm text-green-400"
            >
              Saved
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {!activeSection ? (
          /* Section List - Claude style: simple, clean */
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-1"
          >
            {SECTIONS
              .filter(({ practitionerOnly }) => !practitionerOnly || projects.length > 0)
              .map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className="group w-full flex items-center gap-3 px-3 py-3 hover:bg-white/5 rounded-lg transition-colors"
              >
                <Icon size={18} className="text-stone-400" />
                <span className="flex-1 text-left text-stone-200">{label}</span>
                <ChevronRight size={16} className="text-stone-500 group-hover:text-stone-300 transition-colors" />
              </button>
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
            {activeSection === 'astrology' && renderAstrology()}
            {activeSection === 'maia' && renderMaiaSettings()}
            {activeSection === 'voice' && renderVoice()}
            {activeSection === 'data-privacy' && renderDataPrivacy()}
            {activeSection === 'sovereignty' && renderSovereignty()}
            {activeSection === 'notifications' && renderNotifications()}
            {activeSection === 'privacy' && renderPrivacy()}
            {activeSection === 'membership' && renderMembership()}
            {activeSection === 'portals' && renderPortals()}
            {activeSection === 'connections' && renderConnections()}
            {activeSection === 'data' && renderData()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Build Info Footer - subtle version stamp */}
      <div className="mt-12 pt-6 border-t border-white/10 text-center">
        <p className="text-[10px] text-stone-300 font-mono">
          v1.1 ({BUILD_STAMP.commit}) • {BUILD_STAMP.timestamp.split('T')[0]}
          {Capacitor.isNativePlatform() && (
            <span className="ml-2">• {apiBaseUrl()}</span>
          )}
        </p>
      </div>

      {/* Forgetting Ritual Modal */}
      <ForgettingRitual
        isOpen={showForgettingRitual}
        onClose={() => setShowForgettingRitual(false)}
        onComplete={async () => {
          setShowForgettingRitual(false);
          // Refresh consent summary after deletion
          const summary = await getConsentSummary();
          setConsentSummary(summary);
          if (userId) {
            const counts = await getSyncStatus(userId);
            setSyncCounts(counts);
          }
        }}
      />
    </div>
  );
}
