'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Bell,
  Clock,
  Shield,
  Palette,
  GitBranch,
  Key,
  Database,
  Save,
  Moon,
  Sun,
  Volume2,
  VolumeX,
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
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { getLocalMemberId } from '@/lib/auth/getLocalMemberId';

interface SettingsSection {
  id: string;
  label: string;
  icon: typeof Settings;
}

const sections: SettingsSection[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'time-tracking', label: 'Time Tracking', icon: Clock },
  { id: 'agents', label: 'Agent Defaults', icon: GitBranch },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'integrations', label: 'Integrations', icon: Key },
  { id: 'data', label: 'Data & Storage', icon: Database },
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

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
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

  // Fetch Calendar statuses on mount
  useEffect(() => {
    const fetchGoogleStatus = async () => {
      try {
        // Use localStorage memberId or fallback for development
        const memberId = getLocalMemberId() || '00000000-0000-0000-0000-000000000001';

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


  const handleGoogleConnect = async () => {
    try {
      setGoogleConnecting(true);

      // Use localStorage memberId or fallback for development
      const memberId = getLocalMemberId() || '00000000-0000-0000-0000-000000000001';

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
    // Profile
    displayName: 'Operator',
    email: 'operator@soullab.life',

    // Notifications
    notifyOnAgentComplete: true,
    notifyOnHighPriority: true,
    notifyOnReviewReady: true,
    soundEnabled: true,

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
        {activeSection === 'profile' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Profile</h2>
              <p className="text-sm text-slate-400">Manage your account settings</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Display Name</label>
                <input
                  type="text"
                  value={settings.displayName}
                  onChange={(e) => updateSetting('displayName', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500/50"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => updateSetting('email', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500/50"
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Notifications</h2>
              <p className="text-sm text-slate-400">Control how you receive alerts</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div>
                  <div className="text-white font-medium">Agent Task Complete</div>
                  <div className="text-sm text-slate-400">Notify when delegated tasks finish</div>
                </div>
                <button
                  onClick={() => updateSetting('notifyOnAgentComplete', !settings.notifyOnAgentComplete)}
                  className={`
                    w-12 h-6 rounded-full transition-colors relative
                    ${settings.notifyOnAgentComplete ? 'bg-teal-500' : 'bg-slate-700'}
                  `}
                >
                  <div className={`
                    w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all
                    ${settings.notifyOnAgentComplete ? 'left-6' : 'left-0.5'}
                  `} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div>
                  <div className="text-white font-medium">High Priority Items</div>
                  <div className="text-sm text-slate-400">Alert for urgent triage items</div>
                </div>
                <button
                  onClick={() => updateSetting('notifyOnHighPriority', !settings.notifyOnHighPriority)}
                  className={`
                    w-12 h-6 rounded-full transition-colors relative
                    ${settings.notifyOnHighPriority ? 'bg-teal-500' : 'bg-slate-700'}
                  `}
                >
                  <div className={`
                    w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all
                    ${settings.notifyOnHighPriority ? 'left-6' : 'left-0.5'}
                  `} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div>
                  <div className="text-white font-medium">Review Ready</div>
                  <div className="text-sm text-slate-400">Notify when items need your review</div>
                </div>
                <button
                  onClick={() => updateSetting('notifyOnReviewReady', !settings.notifyOnReviewReady)}
                  className={`
                    w-12 h-6 rounded-full transition-colors relative
                    ${settings.notifyOnReviewReady ? 'bg-teal-500' : 'bg-slate-700'}
                  `}
                >
                  <div className={`
                    w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all
                    ${settings.notifyOnReviewReady ? 'left-6' : 'left-0.5'}
                  `} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  {settings.soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-teal-400" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-slate-400" />
                  )}
                  <div>
                    <div className="text-white font-medium">Sound Effects</div>
                    <div className="text-sm text-slate-400">Play sounds for notifications</div>
                  </div>
                </div>
                <button
                  onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                  className={`
                    w-12 h-6 rounded-full transition-colors relative
                    ${settings.soundEnabled ? 'bg-teal-500' : 'bg-slate-700'}
                  `}
                >
                  <div className={`
                    w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all
                    ${settings.soundEnabled ? 'left-6' : 'left-0.5'}
                  `} />
                </button>
              </div>
            </div>
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

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition-colors">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
