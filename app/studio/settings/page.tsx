'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Settings,
  User,
  Clock,
  Shield,
  Palette,
  GitBranch,
  Key,
  Database,
  Save,
  Moon,
  Sun,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Video,
  MessageCircle,
  Send,
  Phone,
  Mail,
  ArrowRight,
  LayoutGrid,
  Check,
  Compass,
  Briefcase,
  Waves,
  AtSign,
  MessagesSquare,
  Hash,
  Inbox,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { getLocalMemberId } from '@/lib/auth/getLocalMemberId';
import {
  MODULE_DEFINITIONS,
  ALL_MODULE_SLUGS,
  getModulesByCategory,
  getDefaultModules,
  CATEGORY_LABELS,
  validateModuleSlugs,
  type PortalType,
  type ModuleSlug,
  type ModuleCategory,
} from '@/lib/studio/moduleDefinitions';
import {
  NOTIFICATION_EVENT_TYPES,
  EVENT_LABELS,
  type NotificationEventType,
  type NotificationChannel,
  type ResolvedPreference,
} from '@/lib/team/notificationTypes';

interface SettingsSection {
  id: string;
  label: string;
  icon: typeof Settings;
}

const sections: SettingsSection[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'studio-mode', label: 'Studio Mode', icon: Compass },
  { id: 'modules', label: 'Modules', icon: LayoutGrid },
  { id: 'attention', label: 'Attention', icon: Waves },
  { id: 'time-tracking', label: 'Time Tracking', icon: Clock },
  { id: 'agents', label: 'Agent Defaults', icon: GitBranch },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'integrations', label: 'Integrations', icon: Key },
  { id: 'data', label: 'Data & Storage', icon: Database },
];

// Attention section — icon per awareness event (the "what may surface").
const EVENT_ICONS: Record<NotificationEventType, typeof Settings> = {
  dm_received: MessageCircle,
  mentioned: AtSign,
  thread_reply: MessagesSquare,
  channel_activity: Hash,
};

// Delivery channels (the "how it reaches you"). in_app + email are live; sms is
// modeled in the schema but not delivered until a later phase — shown disabled,
// never written (the API rejects sms writes too).
const ATTENTION_CHANNELS: { key: NotificationChannel; label: string; available: boolean }[] = [
  { key: 'in_app', label: 'In-app', available: true },
  { key: 'email', label: 'Email', available: true },
  { key: 'sms', label: 'SMS', available: false },
];

// Calendar connection state
interface CalendarStatus {
  configured: boolean;
  connected: boolean;
  email: string | null;
}

// Messaging integration status
interface MessagingStatus {
  configured: boolean;
  connected: boolean;
}

function SettingsContent() {
  // Onboarding params
  const searchParams = useSearchParams();
  const onboarding = searchParams.get('onboarding');
  const connected = searchParams.get('connected');
  const isCalendarOnboarding = onboarding === 'calendar';
  const justConnectedGoogle = connected === 'google';

  const [activeSection, setActiveSection] = useState(isCalendarOnboarding || justConnectedGoogle ? 'integrations' : 'profile');
  const [googleStatus, setGoogleStatus] = useState<CalendarStatus | null>(null);
  const [googleLoading, setGoogleLoading] = useState(true);
  const [googleConnecting, setGoogleConnecting] = useState(false);
  const [microsoftStatus, setMicrosoftStatus] = useState<CalendarStatus | null>(null);
  const [microsoftLoading, setMicrosoftLoading] = useState(true);
  const [microsoftConnecting, setMicrosoftConnecting] = useState(false);

  // Messaging integrations
  const [smsStatus, setSmsStatus] = useState<MessagingStatus | null>(null);
  const [smsLoading, setSmsLoading] = useState(true);
  const [whatsappStatus, setWhatsappStatus] = useState<MessagingStatus | null>(null);
  const [whatsappLoading, setWhatsappLoading] = useState(true);
  const [telegramStatus, setTelegramStatus] = useState<MessagingStatus | null>(null);
  const [telegramLoading, setTelegramLoading] = useState(true);

  // Video room URL (used in Session Room)
  const [videoRoomUrl, setVideoRoomUrl] = useState('');
  const [videoRoomUrlSaving, setVideoRoomUrlSaving] = useState(false);
  const [videoRoomUrlSaved, setVideoRoomUrlSaved] = useState(false);

  // Fetch Calendar statuses on mount
  useEffect(() => {
    const fetchGoogleStatus = async () => {
      try {
        const memberId = getLocalMemberId();
        if (!memberId) {
          setGoogleStatus({ configured: true, connected: false, email: null });
          setGoogleLoading(false);
          return;
        }

        const response = await apiFetch(`/api/auth/google/status?userId=${memberId}`);
        const data = await response.json();
        setGoogleStatus(data);
      } catch (error) {
        console.error('[Settings] Google status fetch error:', error);
        setGoogleStatus({ configured: false, connected: false, email: null });
      } finally {
        setGoogleLoading(false);
      }
    };

    const fetchMicrosoftStatus = async () => {
      try {
        const memberId = getLocalMemberId();

        if (!memberId) {
          setMicrosoftStatus({ configured: true, connected: false, email: null });
          setMicrosoftLoading(false);
          return;
        }

        const response = await apiFetch('/api/auth/microsoft/status');
        const data = await response.json();
        // Check if Microsoft is configured (env vars present)
        const configured = !data.error || data.error !== 'Microsoft integration not configured';
        setMicrosoftStatus({
          configured,
          connected: data.connected || false,
          email: data.email || null,
        });
      } catch (error) {
        console.error('[Settings] Microsoft status fetch error:', error);
        setMicrosoftStatus({ configured: false, connected: false, email: null });
      } finally {
        setMicrosoftLoading(false);
      }
    };

    // Check messaging integrations status
    const checkMessagingStatus = async () => {
      // SMS - check if Twilio env vars are set
      try {
        const smsResponse = await apiFetch('/api/notifications/sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: 'test', message: 'test' }),
        });
        const smsData = await smsResponse.json();
        setSmsStatus({
          configured: !smsData.error?.includes('not configured'),
          connected: smsData.devMode || smsData.success,
        });
      } catch {
        setSmsStatus({ configured: false, connected: false });
      } finally {
        setSmsLoading(false);
      }

      // Telegram
      try {
        const telegramResponse = await apiFetch('/api/notifications/telegram');
        const telegramData = await telegramResponse.json();
        setTelegramStatus({
          configured: telegramData.configured || false,
          connected: telegramData.connected || false,
        });
      } catch {
        setTelegramStatus({ configured: false, connected: false });
      } finally {
        setTelegramLoading(false);
      }

      // WhatsApp - uses Twilio, check env var
      const whatsappConfigured = !!process.env.NEXT_PUBLIC_WHATSAPP_ENABLED;
      setWhatsappStatus({
        configured: whatsappConfigured || smsStatus?.configured || false,
        connected: false, // Requires setup
      });
      setWhatsappLoading(false);
    };

    fetchGoogleStatus();
    fetchMicrosoftStatus();
    checkMessagingStatus();
  }, []);

  // Fetch video room URL
  useEffect(() => {
    const fetchVideoRoomUrl = async () => {
      try {
        const res = await apiFetch('/api/studio/settings?key=video_room_url');
        const data = await res.json();
        if (data?.value) setVideoRoomUrl(data.value);
      } catch {
        // non-critical
      }
    };
    fetchVideoRoomUrl();
  }, []);

  const handleSaveVideoRoomUrl = async () => {
    setVideoRoomUrlSaving(true);
    try {
      await apiFetch('/api/studio/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'video_room_url', value: videoRoomUrl.trim() || null }),
      });
      setVideoRoomUrlSaved(true);
      setTimeout(() => setVideoRoomUrlSaved(false), 2500);
    } catch (error) {
      console.error('[Settings] Failed to save video room URL:', error);
    } finally {
      setVideoRoomUrlSaving(false);
    }
  };

  const handleGoogleConnect = async () => {
    try {
      setGoogleConnecting(true);

      const memberId = getLocalMemberId();
      if (!memberId) {
        alert('Please sign in to connect Google Calendar');
        return;
      }

      const response = await apiFetch('/api/auth/google/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: memberId }),
      });

      const data = await response.json();

      if (data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      } else {
        alert(data.error || 'Failed to initiate Google connection');
      }
    } catch (error) {
      console.error('[Settings] Google connect error:', error);
      alert('Failed to connect to Google');
    } finally {
      setGoogleConnecting(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    if (!confirm('Disconnect Google Calendar? This will remove calendar sync for new bookings.')) {
      return;
    }

    try {
      const memberId = getLocalMemberId();

      const response = await apiFetch('/api/auth/google/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: memberId }),
      });

      const data = await response.json();
      if (data.success) {
        setGoogleStatus({ configured: true, connected: false, email: null });
      }
    } catch (error) {
      console.error('[Settings] Google disconnect error:', error);
    }
  };

  const handleMicrosoftConnect = async () => {
    try {
      setMicrosoftConnecting(true);

      const memberId = getLocalMemberId();

      if (!memberId) {
        alert('Please sign in to connect Microsoft Calendar');
        return;
      }

      const response = await apiFetch('/api/auth/microsoft/connect', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.authUrl) {
        // Redirect to Microsoft OAuth
        window.location.href = data.authUrl;
      } else {
        alert(data.error || 'Failed to initiate Microsoft connection');
      }
    } catch (error) {
      console.error('[Settings] Microsoft connect error:', error);
      alert('Failed to connect to Microsoft');
    } finally {
      setMicrosoftConnecting(false);
    }
  };

  const handleMicrosoftDisconnect = async () => {
    if (!confirm('Disconnect Microsoft Calendar? This will remove calendar sync for new bookings.')) {
      return;
    }

    try {
      const response = await apiFetch('/api/auth/microsoft/disconnect', {
        method: 'POST',
      });

      const data = await response.json();
      if (data.success) {
        setMicrosoftStatus({ configured: true, connected: false, email: null });
      }
    } catch (error) {
      console.error('[Settings] Microsoft disconnect error:', error);
    }
  };

  const [settings, setSettings] = useState({
    // Profile (loaded from /api/studio/profile on mount)
    displayName: '',
    email: '',

    // Time Tracking
    dailyHourTarget: 8,
    trackingEnabled: true,
    reminderFrequency: 'hourly',

    // Agents
    defaultAgent: 'maia-dev',
    autoDelegate: false,
    requireApproval: true,

    // Appearance
    theme: 'dark',
    compactMode: false,

    // Security
    sessionTimeout: 30,
    requireConfirmation: true,
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // ─── Attention (notification delivery preferences) ─────────
  // Backed by the existing member_notification_preferences table via
  // /api/team/notifications/preferences. Separates WHAT may surface (event
  // types) from HOW it reaches you (channels). Persists per-toggle — no new
  // notification system, no client-only dead toggles.
  const [attentionPrefs, setAttentionPrefs] = useState<Record<string, boolean>>({});
  const [attentionLoading, setAttentionLoading] = useState(true);
  const [attentionError, setAttentionError] = useState<string | null>(null);
  const [attentionSaving, setAttentionSaving] = useState<string | null>(null);

  useEffect(() => {
    async function loadAttention() {
      try {
        const res = await apiFetch('/api/team/notifications/preferences');
        if (res.ok) {
          const data = await res.json();
          const map: Record<string, boolean> = {};
          for (const p of (data.preferences ?? []) as ResolvedPreference[]) {
            map[`${p.event_type}:${p.channel}`] = p.enabled;
          }
          setAttentionPrefs(map);
        } else {
          setAttentionError('Could not load your attention settings.');
        }
      } catch {
        setAttentionError('Could not load your attention settings.');
      } finally {
        setAttentionLoading(false);
      }
    }
    loadAttention();
  }, []);

  async function toggleAttention(event: NotificationEventType, channel: NotificationChannel) {
    const key = `${event}:${channel}`;
    const next = !attentionPrefs[key];
    // Optimistic — reflect the member's intent immediately, reconcile on response.
    setAttentionPrefs(prev => ({ ...prev, [key]: next }));
    setAttentionSaving(key);
    setAttentionError(null);
    try {
      const res = await apiFetch('/api/team/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: event, channel, enabled: next }),
      });
      if (!res.ok) {
        setAttentionPrefs(prev => ({ ...prev, [key]: !next })); // revert
        const data = await res.json().catch(() => ({}));
        setAttentionError(data.error || 'Could not save that change.');
      }
    } catch {
      setAttentionPrefs(prev => ({ ...prev, [key]: !next })); // revert
      setAttentionError('Could not save that change.');
    } finally {
      setAttentionSaving(null);
    }
  }

  // ─── Profile ──────────────────────────────────────────────
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await apiFetch('/api/studio/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setSettings(prev => ({
              ...prev,
              displayName: data.profile.name ?? '',
              email: data.profile.email ?? '',
            }));
          }
        } else {
          console.error('[Settings] Profile load failed:', res.status);
        }
      } catch (error) {
        console.error('[Settings] Profile load error:', error);
      } finally {
        setProfileLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function saveProfile() {
    const name = settings.displayName.trim();
    if (!name) {
      setProfileError('Display name cannot be empty');
      return;
    }
    setProfileSaving(true);
    setProfileSaved(false);
    setProfileError(null);
    try {
      const res = await apiFetch('/api/studio/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setProfileError(data.error || 'Failed to save profile');
        return;
      }
      const data = await res.json();
      if (data.profile?.name) {
        setSettings(prev => ({ ...prev, displayName: data.profile.name }));
      }
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (error) {
      console.error('[Settings] Profile save error:', error);
      setProfileError('Failed to save profile');
    } finally {
      setProfileSaving(false);
    }
  }

  // ─── Studio Mode ──────────────────────────────────────────
  const [studioMode, setStudioMode] = useState<'personal' | 'practice'>('practice');
  const [studioModeLoading, setStudioModeLoading] = useState(true);
  const [studioModeSwitching, setStudioModeSwitching] = useState(false);

  useEffect(() => {
    async function fetchStudioMode() {
      try {
        const res = await apiFetch('/api/studio/mode');
        if (res.ok) {
          const data = await res.json();
          setStudioMode(data.studioMode ?? 'practice');
        }
      } catch {
        // fallback
      } finally {
        setStudioModeLoading(false);
      }
    }
    fetchStudioMode();
  }, []);

  async function switchStudioMode(mode: 'personal' | 'practice') {
    if (mode === studioMode) return;
    setStudioModeSwitching(true);
    try {
      const res = await apiFetch('/api/studio/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studioMode: mode }),
      });
      if (res.ok) {
        setStudioMode(mode);
        // Redirect to the appropriate home after switching
        window.location.href = mode === 'personal' ? '/studio/field' : '/studio';
      }
    } catch {
      // handle error
    } finally {
      setStudioModeSwitching(false);
    }
  }

  // ─── Module Settings ────────────────────────────────────
  const [modulePortalType, setModulePortalType] = useState<PortalType>('generalist');
  const [enabledModules, setEnabledModules] = useState<Set<ModuleSlug>>(new Set());
  const [modulesLoading, setModulesLoading] = useState(true);
  const [modulesSaving, setModulesSaving] = useState(false);
  const [modulesIsDefault, setModulesIsDefault] = useState(true);

  useEffect(() => {
    async function fetchModules() {
      try {
        const response = await apiFetch('/api/studio/modules');
        const data = await response.json();
        setModulePortalType(data.portalType ?? 'generalist');
        // Drop slugs no longer in the registry — DB may carry stale entries
        // from previous schema versions (e.g. notebook, ideas, today, schedule,
        // availability). Including them would 400 on the next PATCH.
        const validSet = new Set<string>(ALL_MODULE_SLUGS);
        const cleaned: ModuleSlug[] = (data.resolvedModules ?? []).filter(
          (s: string): s is ModuleSlug => validSet.has(s),
        );
        setEnabledModules(new Set(cleaned));
        setModulesIsDefault(data.isDefault ?? true);
      } catch {
        // fallback
      } finally {
        setModulesLoading(false);
      }
    }
    fetchModules();
  }, []);

  function toggleSettingsModule(slug: ModuleSlug) {
    const mod = MODULE_DEFINITIONS.find(m => m.slug === slug);
    if (mod?.alwaysOn) return;
    setEnabledModules(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  async function saveModules() {
    setModulesSaving(true);
    try {
      const modulesArray = Array.from(enabledModules);
      const response = await apiFetch('/api/studio/modules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabledModules: modulesArray }),
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.error('[Settings] Save modules failed:', response.status, text);
        return;
      }
      setModulesIsDefault(false);
      window.dispatchEvent(
        new CustomEvent('studio:modules-updated', { detail: modulesArray }),
      );
    } catch (error) {
      console.error('[Settings] Save modules error:', error);
    } finally {
      setModulesSaving(false);
    }
  }

  function resetModulesToDefaults() {
    const defaults = getDefaultModules(modulePortalType);
    setEnabledModules(new Set(defaults));
  }

  // Cut B-lite: Settings → Modules reflects the active mode, matching the sidebar's
  // getVisibleModules. Personal Field offers field+both modules; Practice Portal offers
  // practice+both. Display filter only — enabledModules stays one set (no mode-scoped schema).
  const settingsModulesByCategory = Object.fromEntries(
    (Object.entries(getModulesByCategory()) as [ModuleCategory, typeof MODULE_DEFINITIONS][])
      .map(([category, modules]) => [
        category,
        modules.filter(m =>
          studioMode === 'personal'
            ? m.mode === 'field' || m.mode === 'both'
            : m.mode === 'practice' || m.mode === 'both'
        ),
      ])
  ) as Record<ModuleCategory, typeof MODULE_DEFINITIONS>;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Settings Sidebar */}
      <div className="w-64 border-r border-slate-800 p-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-slate-400" />
          Settings
        </h1>

        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                ${activeSection === section.id
                  ? 'bg-teal-500/20 text-teal-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="flex-1 p-8 max-w-3xl">
        {/* Onboarding Card */}
        {((isCalendarOnboarding && !googleStatus?.connected) || justConnectedGoogle) && (
          <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-xl bg-slate-800 p-2">
                  <Calendar className={`h-5 w-5 ${justConnectedGoogle ? 'text-emerald-400' : 'text-amber-400'}`} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">
                    {justConnectedGoogle ? 'Google Calendar connected' : 'Connect Google Calendar'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {justConnectedGoogle
                      ? 'Your Studio can now sync sessions to your calendar and show availability.'
                      : 'This lets Studio sync sessions, pull availability, and keep everything aligned automatically.'}
                  </p>
                </div>
              </div>

              {!justConnectedGoogle && !googleStatus?.connected && (
                <button
                  onClick={handleGoogleConnect}
                  disabled={googleConnecting}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
                >
                  {googleConnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Connect <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}

              {justConnectedGoogle && (
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              )}
            </div>

            {!justConnectedGoogle && !googleStatus?.connected && (
              <div className="mt-3 text-sm">
                <Link href="/studio" className="text-slate-500 hover:text-slate-300">
                  Skip for now
                </Link>
              </div>
            )}

            {justConnectedGoogle && (
              <div className="mt-3">
                <Link
                  href="/studio"
                  className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300"
                >
                  Go to Command Center <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Profile</h2>
              <p className="text-sm text-slate-400">Manage your account settings</p>
            </div>

            {profileLoading ? (
              <div className="flex items-center gap-3 p-8 justify-center">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                <span className="text-slate-400">Loading profile...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={settings.displayName}
                    onChange={(e) => {
                      updateSetting('displayName', e.target.value);
                      setProfileSaved(false);
                      setProfileError(null);
                    }}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={settings.email}
                    readOnly
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed focus:outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Email is tied to your account and can&apos;t be changed here.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={saveProfile}
                    disabled={profileSaving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition-colors disabled:opacity-50"
                  >
                    {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                  {profileSaved && (
                    <span className="flex items-center gap-1.5 text-sm text-teal-400">
                      <CheckCircle2 className="w-4 h-4" /> Saved
                    </span>
                  )}
                  {profileError && (
                    <span className="flex items-center gap-1.5 text-sm text-red-400">
                      <AlertCircle className="w-4 h-4" /> {profileError}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'studio-mode' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Studio Mode</h2>
              <p className="text-sm text-slate-400">
                Choose how you use Studio. Switch between personal navigation and practice management anytime.
              </p>
            </div>

            {studioModeLoading ? (
              <div className="flex items-center gap-3 p-8 justify-center">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                <span className="text-slate-400">Loading...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {/* Personal / Field */}
                <button
                  onClick={() => switchStudioMode('personal')}
                  disabled={studioModeSwitching}
                  className={`
                    relative p-6 rounded-xl border text-left transition-all
                    ${studioMode === 'personal'
                      ? 'border-amber-500/40 bg-amber-500/10'
                      : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'}
                  `}
                >
                  {studioModeSwitching && studioMode !== 'personal' && (
                    <Loader2 className="absolute top-4 right-4 w-4 h-4 text-amber-400 animate-spin" />
                  )}
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                    <Compass className={`w-5 h-5 ${studioMode === 'personal' ? 'text-amber-400' : 'text-slate-400'}`} />
                  </div>
                  <h3 className={`font-medium mb-1 ${studioMode === 'personal' ? 'text-white' : 'text-slate-300'}`}>
                    Field
                  </h3>
                  <p className="text-sm text-slate-500">
                    Personal navigation. Decisions, changes, vault, and MAIA.
                  </p>
                  {studioMode === 'personal' && (
                    <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-amber-400" />
                    </div>
                  )}
                </button>

                {/* Practice / Operations */}
                <button
                  onClick={() => switchStudioMode('practice')}
                  disabled={studioModeSwitching}
                  className={`
                    relative p-6 rounded-xl border text-left transition-all
                    ${studioMode === 'practice'
                      ? 'border-teal-500/40 bg-teal-500/10'
                      : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'}
                  `}
                >
                  {studioModeSwitching && studioMode !== 'practice' && (
                    <Loader2 className="absolute top-4 right-4 w-4 h-4 text-teal-400 animate-spin" />
                  )}
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center mb-4">
                    <Briefcase className={`w-5 h-5 ${studioMode === 'practice' ? 'text-teal-400' : 'text-slate-400'}`} />
                  </div>
                  <h3 className={`font-medium mb-1 ${studioMode === 'practice' ? 'text-white' : 'text-slate-300'}`}>
                    Practice
                  </h3>
                  <p className="text-sm text-slate-500">
                    Client management, sessions, scheduling, and business tools.
                  </p>
                  {studioMode === 'practice' && (
                    <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-teal-400" />
                    </div>
                  )}
                </button>
              </div>
            )}

            <p className="text-xs text-slate-500">
              Switching mode changes which tools appear in your sidebar. Your data is preserved in both modes.
            </p>
          </div>
        )}

        {activeSection === 'modules' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Modules</h2>
              <p className="text-sm text-slate-400">
                Choose which tools appear in your Studio sidebar.
                Your practice style is <span className="text-amber-400">{modulePortalType}</span>.
              </p>
            </div>

            {modulesLoading ? (
              <div className="flex items-center gap-3 p-8 justify-center">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                <span className="text-slate-400">Loading modules...</span>
              </div>
            ) : (
              <>
                {(Object.entries(settingsModulesByCategory) as [ModuleCategory, typeof MODULE_DEFINITIONS][]).map(([category, modules]) => {
                  if (modules.length === 0) return null;
                  return (
                    <div key={category}>
                      <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3">
                        {CATEGORY_LABELS[category]}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {modules.map((mod) => {
                          const isEnabled = enabledModules.has(mod.slug);
                          const isLocked = mod.alwaysOn;
                          // comingSoon = present in the config surface but intentionally not
                          // available yet (no working backend / gated). The sidebar hides it
                          // (getVisibleModules); here we keep it visible but tell the truth —
                          // badge it and disable the toggle so "checked" never reads as "available".
                          const isComingSoon = !!mod.comingSoon;
                          const isActive = !isComingSoon && (isEnabled || isLocked);
                          return (
                            <button
                              key={mod.slug}
                              type="button"
                              onClick={() => toggleSettingsModule(mod.slug)}
                              disabled={isLocked || isComingSoon}
                              className={`
                                flex items-center gap-3 p-3 rounded-lg border text-left transition-all
                                ${isComingSoon
                                  ? 'bg-slate-900/40 border-slate-800/60 cursor-default opacity-60'
                                  : isLocked
                                    ? 'bg-slate-800/30 border-slate-800 cursor-default'
                                    : isEnabled
                                      ? 'bg-teal-500/10 border-teal-500/30 hover:bg-teal-500/15'
                                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                              `}
                            >
                              <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                                isActive ? 'bg-teal-500/30' : 'bg-slate-800 border border-slate-600'
                              }`}>
                                {isActive && <Check className="w-3 h-3 text-teal-400" />}
                                {isComingSoon && isEnabled && <Check className="w-3 h-3 text-slate-500" />}
                              </div>
                              <mod.icon className={`w-4 h-4 flex-shrink-0 ${
                                isActive ? 'text-teal-400' : 'text-slate-500'
                              }`} />
                              <div className="min-w-0">
                                <span className={`text-sm ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                  {mod.label}
                                </span>
                                {isLocked && (
                                  <span className="text-[10px] text-slate-600 ml-2">Always on</span>
                                )}
                                {isComingSoon && (
                                  <span className="text-[10px] uppercase tracking-wider text-amber-500/80 ml-2">Coming soon</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={saveModules}
                    disabled={modulesSaving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition-colors disabled:opacity-50"
                  >
                    {modulesSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Modules
                  </button>
                  <button
                    onClick={resetModulesToDefaults}
                    className="px-4 py-2.5 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    Reset to defaults
                  </button>
                </div>

                <p className="text-xs text-slate-500">
                  Changes take effect after saving. Reload Studio to see updated sidebar.
                </p>
              </>
            )}
          </div>
        )}

        {activeSection === 'attention' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Attention</h2>
              <p className="text-sm text-slate-400">
                Choose what deserves your attention, and how MAIA may bring it to you. You can change this at any time.
              </p>
            </div>

            {attentionLoading ? (
              <div className="flex items-center gap-3 p-8 justify-center">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                <span className="text-slate-400">Loading…</span>
              </div>
            ) : (
              <>
                {/* What may surface (rows) × how it reaches you (channel columns) */}
                <div>
                  <div className="flex items-center justify-between mb-3 px-4">
                    <h3 className="text-xs uppercase tracking-wider text-slate-500">
                      What may surface
                    </h3>
                    <div className="flex items-center gap-2">
                      {ATTENTION_CHANNELS.map((c) => (
                        <div key={c.key} className="w-14 text-center">
                          <span className={`text-[11px] ${c.available ? 'text-slate-400' : 'text-slate-600'}`}>
                            {c.label}
                          </span>
                          {!c.available && (
                            <span className="block text-[9px] text-slate-600 leading-tight">soon</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {NOTIFICATION_EVENT_TYPES.map((event) => {
                      const Icon = EVENT_ICONS[event];
                      const label = EVENT_LABELS[event];
                      return (
                        <div
                          key={event}
                          className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="text-white font-medium text-sm">{label.title}</div>
                              <div className="text-xs text-slate-400">{label.detail}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {ATTENTION_CHANNELS.map((c) => {
                              const cellKey = `${event}:${c.key}`;
                              const on = !!attentionPrefs[cellKey];
                              const busy = attentionSaving === cellKey;
                              return (
                                <div key={c.key} className="w-14 flex justify-center">
                                  <button
                                    type="button"
                                    disabled={!c.available || busy}
                                    onClick={() => toggleAttention(event, c.key)}
                                    aria-label={`${label.title} via ${c.label}`}
                                    className={`
                                      w-12 h-6 rounded-full transition-colors relative
                                      ${!c.available
                                        ? 'bg-slate-800 cursor-not-allowed opacity-40'
                                        : on ? 'bg-teal-500' : 'bg-slate-700'}
                                    `}
                                  >
                                    <div className={`
                                      w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all
                                      ${on && c.available ? 'left-6' : 'left-0.5'}
                                    `} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {attentionError && (
                    <p className="mt-3 flex items-center gap-1.5 text-sm text-red-400">
                      <AlertCircle className="w-4 h-4" /> {attentionError}
                    </p>
                  )}

                  <p className="mt-3 text-xs text-slate-500">
                    In-app stays gentle — a quiet badge, never an interruption. Changes save as you set them.
                  </p>
                </div>

                {/* Sacred Time — model in docs/architecture/ATTENTION.md; infra not built yet */}
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl opacity-70">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Moon className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      <div>
                        <div className="text-slate-300 font-medium">Sacred Time</div>
                        <div className="text-xs text-slate-500">
                          Protect a window from interruption. Only what you name as urgent may enter.
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 px-2 py-1 bg-slate-800 rounded whitespace-nowrap">
                      Not available yet
                    </span>
                  </div>
                </div>

                {/* Digest — cadence not modeled yet; shown so the model is visible, honestly disabled */}
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl opacity-70">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Inbox className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      <div>
                        <div className="text-slate-300 font-medium">Daily & weekly reflection</div>
                        <div className="text-xs text-slate-500">
                          Collect quiet items into a digest instead of surfacing them in the moment.
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 px-2 py-1 bg-slate-800 rounded whitespace-nowrap">
                      Not available yet
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeSection === 'time-tracking' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Time Tracking</h2>
              <p className="text-sm text-slate-400">Configure your daily targets and tracking</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Daily Hour Target</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="4"
                    max="12"
                    value={settings.dailyHourTarget}
                    onChange={(e) => updateSetting('dailyHourTarget', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-white font-mono w-16 text-center">
                    {settings.dailyHourTarget}h
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Your goal is to work less than this many hours per day
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div>
                  <div className="text-white font-medium">Time Tracking</div>
                  <div className="text-sm text-slate-400">Automatically track time in Studio</div>
                </div>
                <button
                  onClick={() => updateSetting('trackingEnabled', !settings.trackingEnabled)}
                  className={`
                    w-12 h-6 rounded-full transition-colors relative
                    ${settings.trackingEnabled ? 'bg-teal-500' : 'bg-slate-700'}
                  `}
                >
                  <div className={`
                    w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all
                    ${settings.trackingEnabled ? 'left-6' : 'left-0.5'}
                  `} />
                </button>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Break Reminders</label>
                <select
                  value={settings.reminderFrequency}
                  onChange={(e) => updateSetting('reminderFrequency', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500/50"
                >
                  <option value="never">Never</option>
                  <option value="hourly">Every hour</option>
                  <option value="90min">Every 90 minutes</option>
                  <option value="2hours">Every 2 hours</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'agents' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Agent Defaults</h2>
              <p className="text-sm text-slate-400">Configure how agents handle delegated tasks</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Default Agent</label>
                <select
                  value={settings.defaultAgent}
                  onChange={(e) => updateSetting('defaultAgent', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500/50"
                >
                  <option value="maia-dev">maia-dev (Development)</option>
                  <option value="maia-ops">maia-ops (Operations)</option>
                  <option value="explore">explore (Research)</option>
                  <option value="general-purpose">general-purpose (Mixed)</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Agent used when delegating without specifying type
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div>
                  <div className="text-white font-medium">Auto-delegate from Triage</div>
                  <div className="text-sm text-slate-400">Automatically send triaged items to agents</div>
                </div>
                <button
                  onClick={() => updateSetting('autoDelegate', !settings.autoDelegate)}
                  className={`
                    w-12 h-6 rounded-full transition-colors relative
                    ${settings.autoDelegate ? 'bg-teal-500' : 'bg-slate-700'}
                  `}
                >
                  <div className={`
                    w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all
                    ${settings.autoDelegate ? 'left-6' : 'left-0.5'}
                  `} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div>
                  <div className="text-white font-medium">Require Approval to Ship</div>
                  <div className="text-sm text-slate-400">All agent work must pass through Review</div>
                </div>
                <button
                  onClick={() => updateSetting('requireApproval', !settings.requireApproval)}
                  className={`
                    w-12 h-6 rounded-full transition-colors relative
                    ${settings.requireApproval ? 'bg-teal-500' : 'bg-slate-700'}
                  `}
                >
                  <div className={`
                    w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all
                    ${settings.requireApproval ? 'left-6' : 'left-0.5'}
                  `} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Appearance</h2>
              <p className="text-sm text-slate-400">Customize the look and feel of Studio</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-3">Theme</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateSetting('theme', 'dark')}
                    className={`
                      flex items-center gap-2 px-4 py-3 rounded-xl border transition-all
                      ${settings.theme === 'dark'
                        ? 'bg-slate-800 border-teal-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}
                    `}
                  >
                    <Moon className="w-4 h-4" />
                    Dark
                  </button>
                  <button
                    onClick={() => updateSetting('theme', 'light')}
                    className={`
                      flex items-center gap-2 px-4 py-3 rounded-xl border transition-all
                      ${settings.theme === 'light'
                        ? 'bg-slate-800 border-teal-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}
                    `}
                  >
                    <Sun className="w-4 h-4" />
                    Light
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div>
                  <div className="text-white font-medium">Compact Mode</div>
                  <div className="text-sm text-slate-400">Reduce spacing for more content</div>
                </div>
                <button
                  onClick={() => updateSetting('compactMode', !settings.compactMode)}
                  className={`
                    w-12 h-6 rounded-full transition-colors relative
                    ${settings.compactMode ? 'bg-teal-500' : 'bg-slate-700'}
                  `}
                >
                  <div className={`
                    w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all
                    ${settings.compactMode ? 'left-6' : 'left-0.5'}
                  `} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'security' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Security</h2>
              <p className="text-sm text-slate-400">Protect your account and data</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Session Timeout (minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={settings.sessionTimeout}
                  onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500/50"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div>
                  <div className="text-white font-medium">Confirm Destructive Actions</div>
                  <div className="text-sm text-slate-400">Require confirmation for deletes and rejects</div>
                </div>
                <button
                  onClick={() => updateSetting('requireConfirmation', !settings.requireConfirmation)}
                  className={`
                    w-12 h-6 rounded-full transition-colors relative
                    ${settings.requireConfirmation ? 'bg-teal-500' : 'bg-slate-700'}
                  `}
                >
                  <div className={`
                    w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all
                    ${settings.requireConfirmation ? 'left-6' : 'left-0.5'}
                  `} />
                </button>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <Key className="w-4 h-4" />
                  <span className="font-medium">Change Password</span>
                </div>
                <p className="text-sm text-slate-400 mb-3">
                  Update your password for enhanced security
                </p>
                <button className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors text-sm">
                  Update Password
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'integrations' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Integrations</h2>
              <p className="text-sm text-slate-400">Connect external services</p>
            </div>

            {/* Google Calendar */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${googleStatus?.connected ? 'bg-teal-500/20' : 'bg-slate-800'}
                  `}>
                    <Calendar className={`w-5 h-5 ${googleStatus?.connected ? 'text-teal-400' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <div className="text-white font-medium">Google Calendar</div>
                    {googleLoading ? (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Checking status...
                      </div>
                    ) : googleStatus?.connected ? (
                      <div className="flex items-center gap-2 text-sm text-teal-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Connected{googleStatus.email ? ` as ${googleStatus.email}` : ''}
                      </div>
                    ) : googleStatus?.configured ? (
                      <div className="text-sm text-slate-400">Not connected</div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-amber-400">
                        <AlertCircle className="w-3 h-3" />
                        Not configured
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  {googleLoading ? null : googleStatus?.connected ? (
                    <button
                      onClick={handleGoogleDisconnect}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                    >
                      Disconnect
                    </button>
                  ) : googleStatus?.configured ? (
                    <button
                      onClick={handleGoogleConnect}
                      disabled={googleConnecting}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition-colors text-sm disabled:opacity-50"
                    >
                      {googleConnecting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ExternalLink className="w-4 h-4" />
                      )}
                      Connect
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500">Setup required</span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-3">
                Sync bookings to your Google Calendar automatically. New bookings will appear on your calendar.
              </p>
            </div>

            {/* Calendar Disclosure Default */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-teal-500/20">
                  <Shield className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <div className="text-white font-medium">Calendar Privacy</div>
                  <div className="text-xs text-slate-400">What external calendars see for new sessions</div>
                </div>
              </div>
              <select
                value={settings.calendar_disclosure_default || 'generic'}
                onChange={(e) => updateSetting('calendar_disclosure_default', e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500/50"
              >
                <option value="busy_only">Busy only — no details visible</option>
                <option value="generic">Generic — session type, no client name (recommended)</option>
                <option value="full">Full details — client name and notes</option>
              </select>
              <p className="text-xs text-slate-500 mt-2">
                This default applies to all new sessions. You can override it per session.
              </p>
            </div>

            {/* Microsoft Calendar */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${microsoftStatus?.connected ? 'bg-blue-500/20' : 'bg-slate-800'}
                  `}>
                    <Calendar className={`w-5 h-5 ${microsoftStatus?.connected ? 'text-blue-400' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <div className="text-white font-medium">Microsoft 365 Calendar</div>
                    {microsoftLoading ? (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Checking status...
                      </div>
                    ) : microsoftStatus?.connected ? (
                      <div className="flex items-center gap-2 text-sm text-blue-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Connected{microsoftStatus.email ? ` as ${microsoftStatus.email}` : ''}
                      </div>
                    ) : microsoftStatus?.configured ? (
                      <div className="text-sm text-slate-400">Not connected</div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-amber-400">
                        <AlertCircle className="w-3 h-3" />
                        Not configured
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  {microsoftLoading ? null : microsoftStatus?.connected ? (
                    <button
                      onClick={handleMicrosoftDisconnect}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                    >
                      Disconnect
                    </button>
                  ) : microsoftStatus?.configured ? (
                    <button
                      onClick={handleMicrosoftConnect}
                      disabled={microsoftConnecting}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors text-sm disabled:opacity-50"
                    >
                      {microsoftConnecting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ExternalLink className="w-4 h-4" />
                      )}
                      Connect
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500">Setup required</span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-3">
                Sync bookings to your Outlook or Microsoft 365 Calendar. Works alongside Google Calendar.
              </p>
            </div>

            {/* Video Room URL */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center flex-shrink-0">
                  <Video className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <div className="text-white font-medium">Video Room</div>
                  <div className="text-sm text-slate-400">Your preferred video call link</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Use your preferred video room. Session Room will stay alongside it for notes, transcript, and preparation.
              </p>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={videoRoomUrl}
                  onChange={(e) => setVideoRoomUrl(e.target.value)}
                  placeholder="https://meet.google.com/xxx  or  https://zoom.us/j/..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
                />
                <button
                  onClick={handleSaveVideoRoomUrl}
                  disabled={videoRoomUrlSaving}
                  className="flex items-center gap-1.5 px-3 py-2 bg-sky-500/20 border border-sky-500/30 text-sky-400 rounded-lg hover:bg-sky-500/30 transition-colors text-sm disabled:opacity-50"
                >
                  {videoRoomUrlSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : videoRoomUrlSaved ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  {videoRoomUrlSaved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>

            {/* Descript Integration */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Video className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">Descript</div>
                    <div className="text-sm text-slate-400">Local workflow</div>
                  </div>
                </div>

                <a
                  href="/studio/media"
                  className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
                >
                  Media Studio
                </a>
              </div>

              <p className="text-xs text-slate-500 mt-3">
                Record → Save to Downloads → Drag into Descript for editing.
              </p>
            </div>

            {/* Camo Studio */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                    <Video className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">Camo Studio</div>
                    <div className="flex items-center gap-2 text-sm text-teal-400">
                      <CheckCircle2 className="w-3 h-3" />
                      Ready (uses system camera)
                    </div>
                  </div>
                </div>

                <a
                  href="/studio/camera"
                  className="px-4 py-2 bg-teal-500/20 text-teal-400 rounded-lg hover:bg-teal-500/30 transition-colors text-sm"
                >
                  Open Camera
                </a>
              </div>

              <p className="text-xs text-slate-500 mt-3">
                Use your iPhone as a high-quality webcam via Camo Studio.
              </p>
            </div>

            {/* Messaging Section Header */}
            <div className="mt-6 pt-6 border-t border-slate-800">
              <h3 className="text-sm font-medium text-slate-300 mb-4">Messaging Channels</h3>
            </div>

            {/* Email (Resend) */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">Email (Resend)</div>
                    <div className="flex items-center gap-2 text-sm text-teal-400">
                      <CheckCircle2 className="w-3 h-3" />
                      Configured
                    </div>
                  </div>
                </div>
                <span className="text-xs text-slate-500 px-2 py-1 bg-slate-800 rounded">Active</span>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Send session reminders and notifications via email.
              </p>
            </div>

            {/* SMS (Twilio) */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    smsStatus?.configured ? 'bg-green-500/20' : 'bg-slate-800'
                  }`}>
                    <Phone className={`w-5 h-5 ${smsStatus?.configured ? 'text-green-400' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <div className="text-white font-medium">SMS (Twilio)</div>
                    {smsLoading ? (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Checking...
                      </div>
                    ) : smsStatus?.configured ? (
                      <div className="flex items-center gap-2 text-sm text-teal-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Configured
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-amber-400">
                        <AlertCircle className="w-3 h-3" />
                        Not configured
                      </div>
                    )}
                  </div>
                </div>
                {!smsLoading && !smsStatus?.configured && (
                  <span className="text-xs text-slate-500">Set TWILIO_* env vars</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Send SMS reminders to clients. Requires Twilio account.
              </p>
            </div>

            {/* WhatsApp */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    whatsappStatus?.configured ? 'bg-green-500/20' : 'bg-slate-800'
                  }`}>
                    <MessageCircle className={`w-5 h-5 ${whatsappStatus?.configured ? 'text-green-400' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <div className="text-white font-medium">WhatsApp</div>
                    {whatsappLoading ? (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Checking...
                      </div>
                    ) : whatsappStatus?.configured ? (
                      <div className="flex items-center gap-2 text-sm text-teal-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Available (via Twilio)
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-amber-400">
                        <AlertCircle className="w-3 h-3" />
                        Not configured
                      </div>
                    )}
                  </div>
                </div>
                {!whatsappLoading && !whatsappStatus?.configured && (
                  <span className="text-xs text-slate-500">Enable in Twilio</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Send WhatsApp messages via Twilio. Requires WhatsApp Business API setup.
              </p>
            </div>

            {/* Telegram */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    telegramStatus?.configured ? 'bg-blue-500/20' : 'bg-slate-800'
                  }`}>
                    <Send className={`w-5 h-5 ${telegramStatus?.configured ? 'text-blue-400' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <div className="text-white font-medium">Telegram</div>
                    {telegramLoading ? (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Checking...
                      </div>
                    ) : telegramStatus?.connected ? (
                      <div className="flex items-center gap-2 text-sm text-teal-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Connected
                      </div>
                    ) : telegramStatus?.configured ? (
                      <div className="flex items-center gap-2 text-sm text-blue-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Bot configured
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-amber-400">
                        <AlertCircle className="w-3 h-3" />
                        Not configured
                      </div>
                    )}
                  </div>
                </div>
                {!telegramLoading && !telegramStatus?.configured && (
                  <span className="text-xs text-slate-500">Set TELEGRAM_BOT_TOKEN</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Send Telegram messages via bot. Create a bot with @BotFather first.
              </p>
            </div>
          </div>
        )}

        {activeSection === 'data' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Data & Storage</h2>
              <p className="text-sm text-slate-400">Manage your data and exports</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-white font-medium">Export Data</div>
                  <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm">
                    Export All
                  </button>
                </div>
                <p className="text-sm text-slate-400">
                  Download all your data including tasks, sessions, and settings
                </p>
              </div>

              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-red-400 font-medium">Clear Data</div>
                  <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm">
                    Clear
                  </button>
                </div>
                <p className="text-sm text-slate-400">
                  Permanently delete all data. This cannot be undone.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Save Button — Profile, Modules, and Attention persist on their own */}
        {activeSection !== 'profile' && activeSection !== 'modules' && activeSection !== 'attention' && (
          <div className="mt-8 pt-6 border-t border-slate-800">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition-colors">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-8 h-8 text-slate-400 animate-spin" /></div>}>
      <SettingsContent />
    </Suspense>
  );
}
