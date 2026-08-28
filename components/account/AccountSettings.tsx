'use client';

/**
 * AccountSettings — Member identity + control surface
 *
 * Contribution surfaces (Sustaining Circle, Seva, tier membership) live on /patrons,
 * not here. Account = where the member controls presence, privacy, settings,
 * feedback, and exit. An identity-control surface should never carry a membership
 * card or contribution prompt as peer-weight content.
 *
 * The paid-feature gate referencing profile.membership.tier (cloud audio backup)
 * is preserved as actual contribution functionality, not a UI affordance.
 */

import { useState, useEffect, useCallback } from 'react';
import { apiFetch, apiBaseUrl, BUILD_STAMP } from '@/lib/http/apiBase';
import { Capacitor } from '@capacitor/core';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Shield, Mic, Brain, Users, MessageSquare, Bell, Lock,
  Link as LinkIcon, Download, Trash2, Check, ChevronRight, Eye, EyeOff,
  Mail, Clock, Sparkles, AlertTriangle, ArrowLeft, BookOpen,
  Star, MapPin, Search, ExternalLink, Globe, History
} from 'lucide-react';
import Link from 'next/link';
import { GoogleConnectSection } from '@/components/settings/GoogleConnectSection';
import { ObsidianConnectSection } from '@/components/settings/ObsidianConnectSection';
import { CalDAVConnectSection } from '@/components/settings/CalDAVConnectSection';
import {
  getAccountSettings,
  saveAccountSettings,
  getSessionSanctuary,
  setSessionSanctuary,
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
import { NostrMessagingSection } from '@/components/nostr/NostrMessagingSection';
import PatternLedger from '@/components/consciousness/PatternLedger';
import RecurringThemesCard from '@/components/consciousness/RecurringThemesCard';
import { MemoryConsentSection } from '@/components/settings/MemoryConsentSection';

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
  astrologyConsent: 'unknown' | 'opted_in' | 'declined' | null;
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

type SettingsSection = 'profile' | 'account' | 'astrology' | 'maia' | 'voice' | 'data-privacy' | 'sovereignty' | 'memory-consent' | 'patterns' | 'notifications' | 'privacy' | 'connections' | 'data' | 'portals' | 'messaging' | 'scheduling';

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

const SECTIONS: { id: SettingsSection; label: string; icon: typeof User; practitionerOnly?: boolean }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: Lock },
  { id: 'portals', label: 'Client Portals', icon: Globe, practitionerOnly: true },
  { id: 'scheduling', label: 'Scheduling', icon: Clock, practitionerOnly: true },
  { id: 'maia', label: 'MAIA Settings', icon: Brain },
  { id: 'voice', label: 'Voice', icon: Mic },
  { id: 'astrology', label: 'Astrology', icon: Star },
  { id: 'data-privacy', label: 'Data & Privacy', icon: Eye },
  { id: 'sovereignty', label: 'Data Sovereignty', icon: Database },
  { id: 'memory-consent', label: 'Memory & Consent', icon: History },
  // 'continuity' section unsurfaced (audit F-02, 2026-07-20): inferred spiral
  // state may not render as "Your Current Position" without disclosure + consent.
  { id: 'patterns', label: 'Patterns', icon: BookOpen },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'messaging', label: 'Sovereign Messaging', icon: MessageSquare },
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
  const [birthSaveError, setBirthSaveError] = useState<string | null>(null);
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
  const [editPronouns, setEditPronouns] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editTimezone, setEditTimezone] = useState('');

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

  // Astrology consent state
  const [astrologyConsent, setAstrologyConsent] = useState<'unknown' | 'opted_in' | 'declined' | null>(null);
  const [consentSaving, setConsentSaving] = useState(false);

  // Sovereignty state
  const [consentSummary, setConsentSummary] = useState<ConsentSummary | null>(null);

  // Live session Sanctuary flag (`maia_settings.sanctuary`) — distinct from the
  // default above, and the thing the indicator on /maia actually reads.
  const [sessionSanctuaryActive, setSessionSanctuaryActive] = useState(false);
  useEffect(() => {
    setSessionSanctuaryActive(getSessionSanctuary());
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.sanctuary !== undefined) setSessionSanctuaryActive(detail.sanctuary === true);
    };
    window.addEventListener('maia-settings-changed', handler);
    return () => window.removeEventListener('maia-settings-changed', handler);
  }, []);
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
        const profileRes = await apiFetch(`/api/members/profile?id=${memberId}`);
        console.log('[AccountSettings] Profile API response status:', profileRes.status);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          console.log('[AccountSettings] Profile data received:', profileData);
          console.log('[AccountSettings] Birth data in profile:', profileData.birthData);
          setAstrologyConsent(profileData.astrologyConsent ?? 'unknown');
          setProfile(profileData);
          setEditName(profileData.name || '');
          setEditPreferredName(profileData.preferredName || '');
          setEditPronouns(profileData.pronouns || '');
          setEditEmail(profileData.email || '');
          setEditBio(profileData.bio || '');
          setEditTimezone(profileData.timezone || '');

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
        const settingsRes = await apiFetch(`/api/members/settings?memberId=${memberId}`);
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
          const consentRes = await apiFetch(`/api/account/storage-consent?memberId=${memberId}`);
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
          const projectsRes = await apiFetch('/api/practitioner/projects', {
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

    // NOTE: changing a default deliberately does NOT touch the live boundary
    // (`maia_settings.sanctuary`). A default governs how the *next* session
    // begins; the encounter already in progress keeps whatever boundary it was
    // given. Changing tomorrow's default must never silently rewrite today's
    // consent. The live state is disclosed separately, and left only by the
    // explicit member act in endSessionSanctuary().

    // Also sync to server if we have userId
    if (userId) {
      apiFetch('/api/members/settings', {
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

    // Sync voice name to legacy localStorage key (still read by agentConfig)
    if (path === 'voice.openaiVoice') {
      localStorage.setItem('selected_voice', value as string);
    }
    // NOTE: No separate conversationStyleChanged dispatch here.
    // saveAccountSettings() already emits 'maia-account-settings-changed',
    // which OracleConversation listens to. Double-dispatching caused a
    // feedback loop with log spam (dozens of updates per second).

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
        apiFetch('/api/members/settings', {
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

    await apiFetch('/api/members/settings', {
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

    await apiFetch('/api/members/settings', {
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
      const res = await apiFetch('/api/members/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: userId,
          name: editName,
          preferredName: editPreferredName,
          pronouns: editPronouns.trim() || null,
          email: editEmail,
          bio: editBio,
          timezone: editTimezone || null,
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
  }, [userId, editName, editPreferredName, editPronouns, editEmail, editBio, editTimezone, showSaveIndicator]);

  // Search for birth location
  const searchLocation = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setLocationResults([]);
      return;
    }

    setSearchingLocation(true);
    try {
      const res = await apiFetch(`/api/astrology/geocode?q=${encodeURIComponent(query)}`);
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
    setBirthSaveError(null);

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

      const res = await apiFetch('/api/members/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: userId, birthData }),
      });

      if (res.ok) {
        setProfile(prev => prev ? { ...prev, birthData } : null);
        const storedUser = localStorage.getItem('beta_user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            user.birthData = birthData;
            // /maia reads the flat birthDate key (set at registration) — keep it in sync
            user.birthDate = birthData?.date ?? null;
            localStorage.setItem('beta_user', JSON.stringify(user));
          } catch { /* silent */ }
        }
        showSaveIndicator();
      } else {
        const errBody = await res.json().catch(() => ({}));
        setBirthSaveError(errBody?.error || `Save failed (${res.status})`);
      }
    } catch {
      setBirthSaveError('Network error — check your connection and try again');
    } finally {
      setSaving(false);
    }
  }, [userId, editBirthDate, editBirthTime, selectedLocation, showSaveIndicator]);

  // Remove birth data — explicit null PUT, bypasses form state closure
  const removeBirthData = useCallback(async () => {
    if (!userId) return;
    setSaving(true);
    setBirthSaveError(null);
    try {
      const res = await apiFetch('/api/members/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: userId, birthData: null }),
      });
      if (res.ok) {
        setEditBirthDate('');
        setEditBirthTime('');
        setEditBirthLocation('');
        setSelectedLocation(null);
        setProfile(prev => prev ? { ...prev, birthData: null } : null);
        const storedUser = localStorage.getItem('beta_user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            delete user.birthData;
            delete user.birthDate;
            localStorage.setItem('beta_user', JSON.stringify(user));
          } catch { /* silent */ }
        }
        showSaveIndicator();
      } else {
        const errBody = await res.json().catch(() => ({}));
        setBirthSaveError(errBody?.error || `Remove failed (${res.status})`);
      }
    } catch {
      setBirthSaveError('Network error — check your connection and try again');
    } finally {
      setSaving(false);
    }
  }, [userId, showSaveIndicator]);

  // Save astrology consent
  const saveAstrologyConsent = useCallback(async (consent: 'opted_in' | 'declined') => {
    if (!userId) return;
    setConsentSaving(true);
    try {
      const res = await apiFetch('/api/members/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: userId, astrologyConsent: consent }),
      });
      if (res.ok) {
        setAstrologyConsent(consent);
        setProfile(prev => prev ? { ...prev, astrologyConsent: consent } : null);
        // Keep localStorage in sync
        const storedUser = localStorage.getItem('beta_user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            user.astrologyConsent = consent;
            localStorage.setItem('beta_user', JSON.stringify(user));
          } catch (e) { /* silent */ }
        }
        showSaveIndicator();
      }
    } catch (err) {
      console.error('[AccountSettings] Astrology consent save error:', err);
    } finally {
      setConsentSaving(false);
    }
  }, [userId, showSaveIndicator]);

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
      const res = await apiFetch('/api/members/export-data', {
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
      const res = await apiFetch('/api/members/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // No memberId: the server derives the account to close from the
        // verified session. Sending one here could only ever disagree — this
        // component's userId falls back to `user.passkey` when `user.id` is
        // absent, which would be refused as a mismatch on a legitimate closure.
        body: JSON.stringify({
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
      const res = await apiFetch('/api/members/change-password', {
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
        <p className="text-xs text-stone-400 mt-2">Used in greetings and voice conversations</p>
      </div>
      <div>
        <label htmlFor="profile-pronouns" className="text-sm text-stone-400 mb-2 block">Pronouns</label>
        <input
          id="profile-pronouns"
          type="text"
          value={editPronouns}
          onChange={(e) => setEditPronouns(e.target.value)}
          list="pronoun-suggestions"
          placeholder="e.g. he/him, she/her, they/them"
          autoComplete="off"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-stone-200 placeholder-stone-500 focus:border-amber-500/50 focus:outline-none"
        />
        <datalist id="pronoun-suggestions">
          <option value="he/him" />
          <option value="she/her" />
          <option value="they/them" />
          <option value="he/they" />
          <option value="she/they" />
        </datalist>
        <p className="text-xs text-stone-400 mt-2">
          How MAIA refers to you. Leave blank to keep this unspecified — names alone don&apos;t imply pronouns.
        </p>
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
      <div>
        <label className="text-sm text-stone-400 mb-2 block">Timezone</label>
        <select
          value={editTimezone}
          onChange={(e) => setEditTimezone(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-stone-200 focus:border-amber-500/50 focus:outline-none"
        >
          <option value="">— Select timezone —</option>
          <optgroup label="Americas">
            <option value="America/New_York">Eastern Time (New York)</option>
            <option value="America/Chicago">Central Time (Chicago)</option>
            <option value="America/Denver">Mountain Time (Denver)</option>
            <option value="America/Phoenix">Mountain Time – no DST (Phoenix)</option>
            <option value="America/Los_Angeles">Pacific Time (Los Angeles)</option>
            <option value="America/Anchorage">Alaska Time (Anchorage)</option>
            <option value="America/Honolulu">Hawaii Time (Honolulu)</option>
            <option value="America/Toronto">Eastern Time (Toronto)</option>
            <option value="America/Vancouver">Pacific Time (Vancouver)</option>
            <option value="America/Mexico_City">Central Time (Mexico City)</option>
          </optgroup>
          <optgroup label="Europe">
            <option value="Europe/London">London (GMT/BST)</option>
            <option value="Europe/Paris">Paris (CET/CEST)</option>
            <option value="Europe/Berlin">Berlin (CET/CEST)</option>
            <option value="Europe/Rome">Rome (CET/CEST)</option>
            <option value="Europe/Madrid">Madrid (CET/CEST)</option>
            <option value="Europe/Amsterdam">Amsterdam (CET/CEST)</option>
            <option value="Europe/Stockholm">Stockholm (CET/CEST)</option>
            <option value="Europe/Helsinki">Helsinki (EET/EEST)</option>
            <option value="Europe/Moscow">Moscow (MSK)</option>
          </optgroup>
          <optgroup label="Asia / Pacific">
            <option value="Asia/Dubai">Dubai (GST)</option>
            <option value="Asia/Kolkata">India (IST)</option>
            <option value="Asia/Bangkok">Bangkok (ICT)</option>
            <option value="Asia/Singapore">Singapore (SGT)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
            <option value="Asia/Shanghai">Shanghai (CST)</option>
            <option value="Asia/Seoul">Seoul (KST)</option>
            <option value="Australia/Melbourne">Melbourne (AEST/AEDT)</option>
            <option value="Australia/Sydney">Sydney (AEST/AEDT)</option>
            <option value="Pacific/Auckland">Auckland (NZST/NZDT)</option>
          </optgroup>
          <optgroup label="Universal">
            <option value="UTC">UTC</option>
          </optgroup>
        </select>
      </div>
      <div className="flex items-center justify-between text-sm text-stone-400">
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

      {/* ── Birth Chart ──────────────────────────────────────────────── */}
      <div className="border-t border-white/10 pt-6 mt-2">
        <h3 className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-4">
          <Star size={16} />
          Birth Chart
        </h3>
        <p className="text-sm text-stone-400 mb-4">
          Share your birth details so MAIA can weave astrological wisdom into your conversations.
        </p>

        {/* Birth Date */}
        <div className="mb-4">
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
        <div className="mb-4">
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
          <p className="text-xs text-stone-400 mt-1">
            Birth time enables accurate rising sign and house placements
          </p>
        </div>

        {/* Birth Location */}
        <div className="relative mb-4">
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
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300" />
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
                      setSelectedLocation(locationObj);
                      setEditBirthLocation(loc.display_name);
                      setBirthLocationSearch('');
                      setShowLocationResults(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-white/10 border-b border-white/10 last:border-0 transition-colors"
                  >
                    <div className="text-sm text-stone-200 line-clamp-2">{loc.display_name}</div>
                    <div className="text-xs text-stone-400 mt-1">{loc.timezone}</div>
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
              <div className="text-xs text-stone-400">{selectedLocation.timezone}</div>
            </div>
          )}
        </div>

        {/* Current Chart Status */}
        {profile?.birthData?.date && (
          <div className="p-4 bg-gradient-to-br from-violet-500/10 to-amber-500/10 rounded-xl border border-violet-500/20 mb-4">
            <div className="flex items-center gap-2 text-violet-300 mb-2">
              <Star size={18} />
              <span className="text-sm font-medium">Birth Chart Saved</span>
            </div>
            <p className="text-xs text-stone-400">
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

        {/* Birth save error */}
        {birthSaveError && (
          <p className="text-red-400 text-sm text-center">{birthSaveError}</p>
        )}

        {/* Save Birth Data */}
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
            className="w-full text-sm text-stone-400 hover:text-stone-400 transition-colors mt-2"
          >
            Clear birth data
          </button>
        )}
      </div>
    </div>
  );

  // ─── Astrology Section ───────────────────────────────────────────────────────

  const renderAstrology = () => {
    const isOptedIn = astrologyConsent === 'opted_in';
    const isDeclined = astrologyConsent === 'declined';
    const isUnknown = !astrologyConsent || astrologyConsent === 'unknown';
    const hasBirthData = !!(profile?.birthData?.date);

    return (
      <div className="space-y-6">

        {/* ── Consent State ────────────────────────────────────────────────── */}
        <div>
          <h3 className="text-base font-medium text-stone-200 mb-1">Birth Chart & Astrology</h3>
          <p className="text-sm text-stone-400 mb-4">
            When enabled, MAIA can reference your natal chart and current transits in conversations.
            Your birth data is stored privately — it is never shared or sold.
          </p>

          {/* Opted in */}
          {isOptedIn && (
            <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl mb-4">
              <div className="flex items-center gap-2 text-violet-300 mb-1">
                <Star size={16} />
                <span className="text-sm font-medium">Astrological context active</span>
              </div>
              <p className="text-xs text-stone-400 mb-3">
                MAIA may draw on your natal chart and current planetary transits when relevant.
              </p>
              <button
                onClick={async () => {
                  await saveAstrologyConsent('declined');
                  // Also clear stored birth data so nothing lingers server-side
                  if (hasBirthData) await removeBirthData();
                }}
                disabled={consentSaving || saving}
                className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
              >
                {consentSaving ? 'Saving…' : 'Remove astrological context from MAIA'}
              </button>
            </div>
          )}

          {/* Declined */}
          {isDeclined && (
            <div className="p-4 bg-stone-800/50 border border-white/10 rounded-xl mb-4">
              <div className="flex items-center gap-2 text-stone-400 mb-1">
                <Star size={16} />
                <span className="text-sm font-medium">Astrology not active</span>
              </div>
              <p className="text-xs text-stone-500 mb-3">
                Birth chart features are disabled. You can enable them at any time.
              </p>
              <motion.button
                onClick={() => saveAstrologyConsent('opted_in')}
                disabled={consentSaving}
                className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                whileTap={{ scale: 0.97 }}
              >
                {consentSaving ? 'Saving…' : 'Enable astrology features'}
              </motion.button>
            </div>
          )}

          {/* Unknown — first time seeing this */}
          {isUnknown && (
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl mb-4 space-y-3">
              <p className="text-sm text-stone-300">
                Would you like MAIA to be able to reference your birth chart in conversations?
              </p>
              <p className="text-xs text-stone-400">
                This is entirely optional. If you choose yes, you can add your birth details below.
                You can change this preference at any time.
              </p>
              <div className="flex gap-3">
                <motion.button
                  onClick={() => saveAstrologyConsent('opted_in')}
                  disabled={consentSaving}
                  className="flex-1 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-amber-300 text-sm font-medium transition-colors disabled:opacity-50"
                  whileTap={{ scale: 0.97 }}
                >
                  Yes, enable
                </motion.button>
                <motion.button
                  onClick={() => saveAstrologyConsent('declined')}
                  disabled={consentSaving}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-stone-400 text-sm transition-colors disabled:opacity-50"
                  whileTap={{ scale: 0.97 }}
                >
                  No thanks
                </motion.button>
              </div>
            </div>
          )}
        </div>

        {/* ── Birth Data (only shown when opted in) ────────────────────────── */}
        {isOptedIn && (
          <div className="pt-4 border-t border-white/10 space-y-4">
            <h4 className="text-sm font-medium text-stone-300">
              {hasBirthData ? 'Birth Data' : 'Add Birth Data'}
            </h4>

            {/* Current chart summary */}
            {hasBirthData && (
              <div className="p-3 bg-gradient-to-br from-violet-500/10 to-amber-500/10 border border-violet-500/20 rounded-xl">
                <div className="text-xs text-stone-400 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Date</span>
                    <span className="text-stone-200">{profile?.birthData?.date}</span>
                  </div>
                  {profile?.birthData?.time && (
                    <div className="flex justify-between">
                      <span className="text-stone-500">Time</span>
                      <span className="text-stone-200">{profile.birthData.time}</span>
                    </div>
                  )}
                  {profile?.birthData?.location?.name && (
                    <div className="flex justify-between">
                      <span className="text-stone-500">Place</span>
                      <span className="text-stone-200 text-right max-w-[55%] line-clamp-1">
                        {profile.birthData.location.name}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-3">
                  <motion.button
                    onClick={() => window.location.href = '/astrology'}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                    whileTap={{ scale: 0.97 }}
                  >
                    View Full Chart →
                  </motion.button>
                </div>
              </div>
            )}

            {/* Edit form */}
            <div className="space-y-3">
              {/* Birth Date */}
              <div>
                <label className="text-xs text-stone-400 mb-1 block">Birth Date</label>
                <input
                  type="date"
                  value={editBirthDate}
                  onChange={e => setEditBirthDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-stone-200 text-sm focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Birth Time */}
              <div>
                <label className="text-xs text-stone-400 mb-1 block">Birth Time <span className="text-stone-500">(optional)</span></label>
                <input
                  type="time"
                  value={editBirthTime}
                  onChange={e => setEditBirthTime(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-stone-200 text-sm focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Birth Location */}
              <div className="relative">
                <label className="text-xs text-stone-400 mb-1 block">Birth Location</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    type="text"
                    value={birthLocationSearch || editBirthLocation}
                    onChange={e => {
                      setBirthLocationSearch(e.target.value);
                      setEditBirthLocation(e.target.value);
                    }}
                    placeholder="Search city or region…"
                    className="w-full pl-8 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-stone-200 text-sm placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50"
                  />
                  {searchingLocation && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 text-xs">…</div>
                  )}
                </div>

                <AnimatePresence>
                  {showLocationResults && locationResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute z-10 w-full mt-2 bg-stone-900 border border-white/10 rounded-xl shadow-xl max-h-48 overflow-y-auto"
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
                            setSelectedLocation(locationObj);
                            setEditBirthLocation(loc.display_name);
                            setBirthLocationSearch('');
                            setShowLocationResults(false);
                          }}
                          className="w-full px-3 py-2.5 text-left hover:bg-white/10 border-b border-white/10 last:border-0 transition-colors"
                        >
                          <div className="text-sm text-stone-200 line-clamp-1">{loc.display_name}</div>
                          <div className="text-xs text-stone-400">{loc.timezone}</div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {selectedLocation && (
                  <div className="mt-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <div className="text-xs text-stone-200 line-clamp-1">{selectedLocation.name}</div>
                    <div className="text-xs text-stone-400">{selectedLocation.timezone}</div>
                  </div>
                )}
              </div>

              {/* Save */}
              {birthSaveError && (
                <p className="text-red-400 text-xs">{birthSaveError}</p>
              )}
              <motion.button
                onClick={saveBirthData}
                disabled={saving || !editBirthDate}
                className="w-full py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-xl text-amber-300 text-sm font-medium transition-colors disabled:opacity-50"
                whileTap={{ scale: 0.98 }}
              >
                {saving ? 'Saving…' : (hasBirthData ? 'Update Birth Data' : 'Save Birth Data')}
              </motion.button>

              {/* Remove */}
              {hasBirthData && (
                <button
                  onClick={removeBirthData}
                  disabled={saving}
                  className="w-full text-xs text-stone-500 hover:text-stone-300 transition-colors py-1 disabled:opacity-50"
                >
                  {saving ? 'Removing…' : 'Remove birth data'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── Account Section ─────────────────────────────────────────────────────────

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
        <p className="text-xs text-stone-400 mt-2">
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
        <p className="text-xs text-stone-400 mb-3">
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
            className="w-full py-2 text-xs text-stone-400 hover:text-stone-400 transition-colors"
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
            <span className="text-xs text-stone-400">Currently: </span>
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
                <div className="text-xs text-stone-400 mt-1">
                  {mode === 'continuity'
                    ? 'MAIA remembers what helps growth.'
                    : "Sessions aren't saved. Speak freely."}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* The live session can differ from the default — say so here rather
            than letting the picker imply a state the session isn't in. */}
        {sessionSanctuaryActive && maiaSettings.defaultMemoryMode !== 'sanctuary' && (
          <div className="mt-3 flex items-start gap-2 text-xs text-emerald-300/90">
            <Shield size={14} className="mt-0.5 flex-shrink-0" />
            <span>
              Sanctuary is on for the session in progress, above this default.
              End it under Data &amp; Privacy.
            </span>
          </div>
        )}
      </div>

      {/* Voice — sovereign controls live in the dedicated Voice section */}
      <motion.button
        onClick={() => setActiveSection('voice')}
        className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 active:bg-white/10 transition-colors"
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/10 text-amber-400">
            <Mic size={18} />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-stone-200">Voice Preferences</div>
            <div className="text-xs text-stone-400">
              Pace, warmth, clarity, guidance style, energy
            </div>
          </div>
        </div>
        <ChevronRight size={16} className="text-stone-400" />
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
                    <p className="text-xs text-stone-400">{desc.description}</p>
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
            <div className="text-xs text-stone-400">
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
              <span className="text-stone-400">Native App Build:</span>
              <p className="text-stone-300 font-mono">
                {nativeBuildInfo
                  ? `v${nativeBuildInfo.version} (${nativeBuildInfo.build})`
                  : 'Web / Not native'}
              </p>
            </div>
            <div>
              <span className="text-stone-400">Server Build:</span>
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
              <p className="text-xs text-stone-400 mt-0.5">
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
        <p className="text-xs text-stone-400 mb-4">
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
        await apiFetch('/api/account/storage-consent', {
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
    // Default only — the session in progress is untouched. See updateMaiaSetting.
    const summary = await getConsentSummary();
    setConsentSummary(summary);
    showSaveIndicator();
  }, [showSaveIndicator]);

  /**
   * Leave Sanctuary for the conversation in progress without changing the
   * member's default. This is the exit that did not exist: a session entered
   * from the voice HUD or by voice command persisted in `maia_settings` across
   * reloads, and no settings screen could clear it — the indicator stayed lit
   * while both defaults read "off".
   */
  const endSessionSanctuary = useCallback(() => {
    if ('vibrate' in navigator) navigator.vibrate(5);
    setSessionSanctuary(false);
    setSessionSanctuaryActive(false);
    showSaveIndicator();
  }, [showSaveIndicator]);

  const renderDataPrivacy = () => {
    const details = consentSummary?.details;

    // Compute live status
    const getStatusLabel = () => {
      // The live session flag outranks the default here: while it is set,
      // nothing is being saved, whatever the per-type toggles below say.
      if (sessionSanctuaryActive) {
        return { text: 'Sanctuary — this session is not being saved', color: 'text-emerald-400', icon: Shield };
      }
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
          sessionSanctuaryActive || consentSummary?.sanctuaryDefault
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
                  <p className="text-stone-400 mt-2 text-xs">
                    Transcript and audio are separate: you can save transcripts without saving raw audio.
                  </p>
                  <p className="text-stone-400 mt-1 text-xs">
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
              <div className="text-xs text-stone-400">
                Ephemeral sessions — no conversations, journals, transcripts, or audio saved
              </div>
            </div>
          </div>
          {renderToggle(
            consentSummary?.sanctuaryDefault ?? false,
            () => updateSanctuaryDefault(!consentSummary?.sanctuaryDefault)
          )}
        </div>

        {/* Session Sanctuary — active without being the default */}
        {sessionSanctuaryActive && !consentSummary?.sanctuaryDefault && (
          <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
            <div className="flex items-start gap-3">
              <Shield size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium text-emerald-200">
                  Sanctuary is on for the session in progress
                </div>
                <div className="text-xs text-stone-400 mt-1">
                  Turned on for this conversation rather than as your default, so it stays on
                  until you end it. Nothing said inside it is saved — ending Sanctuary does not
                  reach back and save it.
                </div>
                <button
                  onClick={endSessionSanctuary}
                  className="mt-3 px-3 py-2 rounded-lg text-xs font-medium bg-white/5 border border-white/15 text-stone-200 active:bg-white/10 transition-colors"
                >
                  End Sanctuary for this session
                </button>
              </div>
            </div>
          </div>
        )}

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
                      <div className="mt-2 text-xs text-stone-400 text-center">
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
                <p className="text-stone-400 text-xs mt-0.5">
                  MAIA remembers your patterns, preferences, and growth journey across sessions.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <Sparkles size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-stone-200 font-medium">Personalization</span>
                <p className="text-stone-400 text-xs mt-0.5">
                  Your journals and conversations help MAIA understand what matters to you.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <RefreshCw size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-stone-200 font-medium">Cross-device sync</span>
                <p className="text-stone-400 text-xs mt-0.5">
                  Server storage enables access from any device you sign into.
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs text-stone-400 mt-4 text-center">
            MAIA never shares your data with third parties or uses it for advertising.
          </p>
        </div>
      </div>
    );
  };

  const renderNotifications = () => (
    <div className="space-y-4">
      <p className="text-sm text-stone-400 mb-6">
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
      <p className="text-sm text-stone-400 mb-6">
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

  const renderPortals = () => (
    <div className="space-y-6">
      <p className="text-sm text-stone-400 mb-4">
        Quick access to your client-facing portal sites.
      </p>

      {projects.length === 0 ? (
        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
          <div className="text-center mb-4">
            <Globe size={32} className="mx-auto mb-3 text-stone-300" />
            <p className="text-stone-400 font-medium">No client portals found</p>
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
                       border border-white/10 text-sm text-stone-400
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
                  <div className="text-sm text-stone-400 truncate">
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
            <ChevronRight size={18} className="text-stone-300" />
          </a>
        </div>
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
        <p className="text-sm text-stone-400 mb-4">
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
                      <span className={`text-sm font-medium ${comingSoon ? 'text-stone-400' : 'text-stone-200'}`}>{label}</span>
                      {comingSoon && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-500/20 text-purple-300 rounded">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-400">{desc}</div>
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
                <div className="text-xs text-stone-400">
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
                <div className="text-xs text-stone-400">Local</div>
              </div>
              <div className="p-2 bg-white/5 rounded-lg">
                <div className="text-lg font-medium text-stone-200">{syncCounts.server}</div>
                <div className="text-xs text-stone-400">Server</div>
              </div>
              <div className="p-2 bg-white/5 rounded-lg">
                <div className="text-lg font-medium text-amber-400">{syncCounts.pending}</div>
                <div className="text-xs text-stone-400">Pending</div>
              </div>
            </div>
            {syncState.lastSyncAt && (
              <div className="mt-3 text-xs text-stone-400 text-center">
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
                <div className="text-xs text-stone-400">
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
            className="text-xs text-stone-400 hover:text-stone-400 transition-colors"
          >
            MAIA operates under explicit architectural constraints.
          </a>
        </div>
      </div>
    );
  };

  const renderConnections = () => (
    <div className="space-y-6">
      <p className="text-sm text-stone-400 mb-6">
        Connect external services to enhance your MAIA experience.
      </p>

      {userId ? (
        <div className="space-y-6">
          {/* Connected Accounts (OAuth) */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider">
              Connected Accounts
            </h3>
            <GoogleConnectSection userId={userId} />
          </div>

          {/* Sovereign Coordination */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider">
              Sovereign Coordination
            </h3>
            <CalDAVConnectSection userId={userId} />
          </div>

          {/* Sovereign Expression */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider">
              Sovereign Expression
            </h3>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"/><path d="M4.93 4.93l4.24 4.24"/><path d="M14.83 14.83l4.24 4.24"/><path d="M14.83 9.17l4.24-4.24"/><path d="M14.83 9.17l-1.41-1.41"/><path d="M4.93 19.07l4.24-4.24"/></svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-stone-200">Nostr</h4>
                  <p className="text-xs text-stone-500">
                    Publish reflections to your own relay. Decentralized, sovereign identity.
                  </p>
                </div>
              </div>
              <p className="text-xs text-stone-400">
                Manage your Nostr identity in the <button onClick={() => setActiveSection('messaging')} className="text-violet-400 hover:text-violet-300 underline">Messaging</button> section.
              </p>
            </div>
          </div>

          {/* Sovereign Archive */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider">
              Sovereign Archive
            </h3>
            <ObsidianConnectSection userId={userId} />
          </div>
        </div>
      ) : (
        <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-stone-400 text-sm">
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
            <p className="text-xs text-stone-400 mt-1 mb-3">
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
            <p className="text-xs text-stone-400 mt-1 mb-3">
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
        <div className="animate-pulse text-stone-400">Loading settings...</div>
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
    <div className="max-w-xl mx-auto px-5 pb-8 font-sans">
      {/* Header - Claude style: minimal.
          Sticky + opaque, and the safe-area inset lives HERE rather than on the
          scrolling container. The container's own padding only held at scroll
          position 0: once the list moved, this header scrolled away and rows
          ("MAIA Settings", Voice, Astrology…) travelled under the iPhone status
          bar, colliding with the clock. Holding the header at the top with the
          page background behind it keeps that strip covered at every scroll
          position, and rows disappear beneath the header instead. */}
      <div
        className="sticky top-0 z-20 -mx-5 px-5 pb-3 mb-8 flex items-center gap-3 bg-[#0f1419]/95 backdrop-blur-sm"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 1.5rem)' }}
      >
        <button
          onClick={() => activeSection ? setActiveSection(null) : window.location.href = '/maia'}
          className="p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={20} className="text-amber-400" />
        </button>
        <h1 className="text-xl font-medium text-white">
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
                <Icon size={18} className="text-amber-400 group-hover:text-amber-300 transition-colors" />
                <span className="flex-1 text-left text-white">{label}</span>
                <ChevronRight size={16} className="text-stone-300 group-hover:text-amber-300 transition-colors" />
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
            {activeSection === 'memory-consent' && <MemoryConsentSection />}
            {activeSection === 'patterns' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">Patterns</h2>
                </div>
                <RecurringThemesCard />
                <PatternLedger />
              </div>
            )}
            {activeSection === 'notifications' && renderNotifications()}
            {activeSection === 'privacy' && renderPrivacy()}
            {activeSection === 'scheduling' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">Scheduling</h2>
                  <p className="text-sm text-stone-400 mt-1">Manage your availability, services, and booking page.</p>
                </div>
                <div className="space-y-3">
                  <a href="/studio/scheduling" className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:border-amber-500/30 transition-colors group">
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-amber-400">Availability</p>
                      <p className="text-xs text-stone-400">Set your weekly hours and date overrides</p>
                    </div>
                    <ArrowLeft size={16} className="text-stone-500 rotate-180" />
                  </a>
                  <a href="/studio/services" className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:border-amber-500/30 transition-colors group">
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-amber-400">Services</p>
                      <p className="text-xs text-stone-400">Add, edit, or remove your session offerings</p>
                    </div>
                    <ArrowLeft size={16} className="text-stone-500 rotate-180" />
                  </a>
                  <a href="/studio/scheduling" className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:border-amber-500/30 transition-colors group">
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-amber-400">Your Booking Page</p>
                      <p className="text-xs text-stone-400">View your public booking link and share it</p>
                    </div>
                    <ArrowLeft size={16} className="text-stone-500 rotate-180" />
                  </a>
                </div>
              </div>
            )}
            {activeSection === 'portals' && renderPortals()}
            {activeSection === 'messaging' && userId && (
              <NostrMessagingSection memberId={userId} />
            )}
            {activeSection === 'connections' && renderConnections()}
            {activeSection === 'data' && renderData()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Internal: VoiceController Phase 1 smoke test — native only.
          See docs/architecture/MAIA_VOICE_CONTROLLER_DESIGN.md

          This used to be a button that navigated to /voice-controller-test. On
          native it silently did nothing, because P12 (founder ruling
          2026-08-16, scripts/capacitor-patch-routes.sh) excludes that route
          from the static native bundle: its layout calls requireFounder(), a
          server-session read, and output:'export' cannot prerender a route
          that reads cookies. The security boundary wins; the export boundary
          yields. So the destination is absent from the app by decision, while
          the entry point — rendered ONLY on native — remained. P12 touched
          just the patch script; nothing pointed it at this control.

          It is now a STATEMENT, not a control, for the reason P12 itself gives
          for keeping the PHONE_ROUTES entry: removing the surface would
          "silently convert an implementation incompatibility into a product
          decision nobody has made". A dead button did the same thing in the
          opposite direction — it implied a capability that is, in P12's own
          words, UNMET.

          Deliberately NOT offered here: an "open on the web" link. This page
          exists to exercise the Swift VoiceController through the Capacitor
          bridge. Safari has no bridge, so the harness would load and be inert
          — a door that opens onto nothing is worse than a door marked shut. */}
      {Capacitor.isNativePlatform() && (
        <div className="mt-6 pt-4 border-t border-white/5 text-center">
          <p className="text-[10px] text-stone-500 font-mono">
            🧪 Voice Controller Test — unavailable on device
          </p>
          <p className="mt-1 text-[10px] text-stone-600 font-mono leading-relaxed max-w-xs mx-auto">
            The Phase 1 harness is founder-gated server-side, which the native
            build cannot prerender. On-device voice diagnostic is unmet (P12).
          </p>
        </div>
      )}

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
