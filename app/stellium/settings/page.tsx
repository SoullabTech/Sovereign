"use client";

/**
 * STELLIUM SETTINGS PAGE
 *
 * Manage practitioner settings with tabbed interface:
 * - Profile: Business info, name, email
 * - Session Defaults: Duration, location, fees
 * - Notifications: Email preferences
 * - Practice: Timezone, working hours, features
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Settings,
  User,
  Calendar,
  Bell,
  Building2,
  Loader2,
  Save,
  Check,
  CreditCard,
  DollarSign,
  ExternalLink,
  Mail,
  MessageSquare,
  Smartphone,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type {
  PractitionerSettings,
  PractitionerProfile,
  SessionDefaults,
  NotificationSettings,
  PracticeSettings,
  LocationType,
} from '@/lib/stellium/types';

type TabId = 'profile' | 'sessionDefaults' | 'notifications' | 'practice' | 'payouts' | 'pricing' | 'comms';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  { id: 'sessionDefaults', label: 'Sessions', icon: <Calendar className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { id: 'practice', label: 'Practice', icon: <Building2 className="w-4 h-4" /> },
  { id: 'comms', label: 'Email & SMS', icon: <Mail className="w-4 h-4" /> },
  { id: 'payouts', label: 'Payouts', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'pricing', label: 'Pricing', icon: <DollarSign className="w-4 h-4" /> },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [settings, setSettings] = useState<PractitionerSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings on mount (auth via httpOnly cookie)
  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/stellium/settings', {
          credentials: 'include',
        });

        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        if (response.status === 403) {
          throw new Error('Not a practitioner');
        }
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }

        const data = await response.json();
        setSettings(data.settings);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  // Save settings (auth via httpOnly cookie)
  const saveSettings = async (section: TabId, data: Record<string, unknown>) => {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const response = await fetch('/api/stellium/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ section, data }),
      });

      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      if (response.status === 403) {
        throw new Error('Not a practitioner');
      }
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      const result = await response.json();

      // Update local state
      setSettings(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [section]: result.data,
        };
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-sacred-gold/50 animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <Card className="bg-red-900/20 border-red-500/30">
        <CardContent className="p-6 text-center">
          <p className="text-red-300">{error || 'Settings not found'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-gray-100">Settings</h1>
          <p className="text-gray-500">Manage your practice configuration</p>
        </div>
        {saved && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center space-x-2 text-green-400"
          >
            <Check className="w-5 h-5" />
            <span>Saved</span>
          </motion.div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-4">
            <p className="text-red-300">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs - scrollable on mobile */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 border-b border-gray-800 pb-4 min-w-max sm:min-w-0 sm:flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm ${
                activeTab === tab.id
                  ? 'bg-sacred-gold/10 text-sacred-gold border border-sacred-gold/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'profile' && (
          <ProfileTab
            profile={settings.profile}
            onSave={(data) => saveSettings('profile', data)}
            saving={saving}
          />
        )}
        {activeTab === 'sessionDefaults' && (
          <SessionDefaultsTab
            defaults={settings.sessionDefaults}
            onSave={(data) => saveSettings('sessionDefaults', data)}
            saving={saving}
          />
        )}
        {activeTab === 'notifications' && (
          <NotificationsTab
            notifications={settings.notifications}
            onSave={(data) => saveSettings('notifications', data)}
            saving={saving}
          />
        )}
        {activeTab === 'practice' && (
          <PracticeTab
            practice={settings.practice}
            onSave={(data) => saveSettings('practice', data)}
            saving={saving}
          />
        )}
        {activeTab === 'comms' && <CommsTab />}
        {activeTab === 'payouts' && <PayoutsTab />}
        {activeTab === 'pricing' && <PricingTab />}
      </motion.div>
    </div>
  );
}

// ============================================
// PROFILE TAB
// ============================================

function ProfileTab({
  profile,
  onSave,
  saving,
}: {
  profile: PractitionerProfile;
  onSave: (data: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    business_name: profile.business_name || '',
    tagline: profile.tagline || '',
    bio: profile.bio || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
      <CardHeader>
        <CardTitle className="text-lg text-gray-200">Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Your Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Business Name</label>
            <input
              type="text"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              placeholder="e.g., Stellar Astrology"
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-600 focus:border-sacred-gold/50 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Tagline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="e.g., Evolutionary Astrology for Soul Growth"
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-600 focus:border-sacred-gold/50 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell your clients about yourself and your practice..."
              rows={4}
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-600 focus:border-sacred-gold/50 focus:outline-none resize-none"
            />
          </div>

          <div className="p-4 bg-gray-800/30 rounded-lg">
            <p className="text-sm text-gray-500">
              <span className="text-gray-400">Your URL:</span>{' '}
              <span className="text-sacred-gold">{profile.slug}.soullab.life</span>
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================
// SESSION DEFAULTS TAB
// ============================================

function SessionDefaultsTab({
  defaults,
  onSave,
  saving,
}: {
  defaults: SessionDefaults;
  onSave: (data: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState({
    default_duration_minutes: defaults.default_duration_minutes,
    default_location_type: defaults.default_location_type,
    default_session_type: defaults.default_session_type,
    default_fee: defaults.default_fee || '',
    buffer_between_sessions: defaults.buffer_between_sessions,
    booking_advance_days: defaults.booking_advance_days,
    cancellation_policy: defaults.cancellation_policy || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      default_fee: formData.default_fee ? Number(formData.default_fee) : null,
    });
  };

  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
      <CardHeader>
        <CardTitle className="text-lg text-gray-200">Session Defaults</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Default Duration (minutes)</label>
              <select
                value={formData.default_duration_minutes}
                onChange={(e) =>
                  setFormData({ ...formData, default_duration_minutes: Number(e.target.value) })
                }
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>120 minutes</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Default Location</label>
              <select
                value={formData.default_location_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    default_location_type: e.target.value as LocationType,
                  })
                }
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
              >
                <option value="video">Video Call</option>
                <option value="phone">Phone</option>
                <option value="in_person">In Person</option>
                <option value="async">Async / Written</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Default Session Type</label>
              <input
                type="text"
                value={formData.default_session_type}
                onChange={(e) =>
                  setFormData({ ...formData, default_session_type: e.target.value })
                }
                placeholder="e.g., consultation, natal reading"
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-600 focus:border-sacred-gold/50 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Default Fee ($)</label>
              <input
                type="number"
                value={formData.default_fee}
                onChange={(e) => setFormData({ ...formData, default_fee: e.target.value })}
                placeholder="150"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-600 focus:border-sacred-gold/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Buffer Between Sessions (minutes)</label>
              <select
                value={formData.buffer_between_sessions}
                onChange={(e) =>
                  setFormData({ ...formData, buffer_between_sessions: Number(e.target.value) })
                }
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
              >
                <option value={0}>No buffer</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Advance Booking (days)</label>
              <input
                type="number"
                value={formData.booking_advance_days}
                onChange={(e) =>
                  setFormData({ ...formData, booking_advance_days: Number(e.target.value) })
                }
                min="1"
                max="365"
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Cancellation Policy</label>
            <textarea
              value={formData.cancellation_policy}
              onChange={(e) =>
                setFormData({ ...formData, cancellation_policy: e.target.value })
              }
              placeholder="Describe your cancellation policy..."
              rows={3}
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-600 focus:border-sacred-gold/50 focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================
// NOTIFICATIONS TAB
// ============================================

function NotificationsTab({
  notifications,
  onSave,
  saving,
}: {
  notifications: NotificationSettings;
  onSave: (data: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState({
    email_new_booking: notifications.email_new_booking,
    email_booking_reminder: notifications.email_booking_reminder,
    email_follow_up_reminder: notifications.email_follow_up_reminder,
    email_payment_received: notifications.email_payment_received,
    reminder_hours_before: notifications.reminder_hours_before,
    follow_up_days_after: notifications.follow_up_days_after,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const Toggle = ({
    checked,
    onChange,
    label,
    description,
  }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description: string;
  }) => (
    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
      <div>
        <p className="text-gray-200">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-sacred-gold' : 'bg-gray-700'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
      <CardHeader>
        <CardTitle className="text-lg text-gray-200">Email Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Toggle
            checked={formData.email_new_booking}
            onChange={(checked) => setFormData({ ...formData, email_new_booking: checked })}
            label="New Booking"
            description="Get notified when a client books a session"
          />

          <Toggle
            checked={formData.email_booking_reminder}
            onChange={(checked) => setFormData({ ...formData, email_booking_reminder: checked })}
            label="Session Reminders"
            description="Receive reminders before upcoming sessions"
          />

          <Toggle
            checked={formData.email_follow_up_reminder}
            onChange={(checked) =>
              setFormData({ ...formData, email_follow_up_reminder: checked })
            }
            label="Follow-up Reminders"
            description="Get reminded to send follow-ups after sessions"
          />

          <Toggle
            checked={formData.email_payment_received}
            onChange={(checked) =>
              setFormData({ ...formData, email_payment_received: checked })
            }
            label="Payment Received"
            description="Get notified when you receive a payment"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Reminder Hours Before Session</label>
              <select
                value={formData.reminder_hours_before}
                onChange={(e) =>
                  setFormData({ ...formData, reminder_hours_before: Number(e.target.value) })
                }
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
              >
                <option value={1}>1 hour</option>
                <option value={2}>2 hours</option>
                <option value={6}>6 hours</option>
                <option value={12}>12 hours</option>
                <option value={24}>24 hours</option>
                <option value={48}>48 hours</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Follow-up Days After Session</label>
              <select
                value={formData.follow_up_days_after}
                onChange={(e) =>
                  setFormData({ ...formData, follow_up_days_after: Number(e.target.value) })
                }
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
              >
                <option value={1}>1 day</option>
                <option value={2}>2 days</option>
                <option value={3}>3 days</option>
                <option value={5}>5 days</option>
                <option value={7}>7 days</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================
// PRACTICE TAB
// ============================================

function PracticeTab({
  practice,
  onSave,
  saving,
}: {
  practice: PracticeSettings;
  onSave: (data: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState({
    timezone: practice.timezone,
    currency: practice.currency,
    booking_enabled: practice.booking_enabled,
    payments_enabled: practice.payments_enabled,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Anchorage',
    'Pacific/Honolulu',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Singapore',
    'Australia/Sydney',
  ];

  const currencies = [
    { code: 'USD', label: 'US Dollar ($)' },
    { code: 'EUR', label: 'Euro (€)' },
    { code: 'GBP', label: 'British Pound (£)' },
    { code: 'CAD', label: 'Canadian Dollar (C$)' },
    { code: 'AUD', label: 'Australian Dollar (A$)' },
  ];

  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
      <CardHeader>
        <CardTitle className="text-lg text-gray-200">Practice Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm text-gray-400">Features</h3>

            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
              <div>
                <p className="text-gray-200">Online Booking</p>
                <p className="text-sm text-gray-500">
                  Allow clients to book sessions through your portal
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, booking_enabled: !formData.booking_enabled })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  formData.booking_enabled ? 'bg-sacred-gold' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    formData.booking_enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
              <div>
                <p className="text-gray-200">Accept Payments</p>
                <p className="text-sm text-gray-500">
                  Enable payment collection through Stripe
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, payments_enabled: !formData.payments_enabled })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  formData.payments_enabled ? 'bg-sacred-gold' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    formData.payments_enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================
// COMMS TAB (Email & SMS Providers)
// ============================================

interface CommsProvider {
  id: string;
  provider: string;
  displayName: string;
  channel: 'email' | 'sms';
  verified: boolean;
  verified_at: Date | null;
  last_used_at: Date | null;
  status: string;
  error_count: number;
  last_error: string | null;
}

interface CommsSettings {
  default_email: string | null;
  default_phone: string | null;
  default_channel: string;
  email_from_name: string | null;
  email_signature: string | null;
  sms_signature: string | null;
  timezone: string;
  auto_reminder_enabled: boolean;
  auto_followup_enabled: boolean;
}

function CommsTab() {
  const [providers, setProviders] = useState<CommsProvider[]>([]);
  const [settings, setSettings] = useState<CommsSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddProvider, setShowAddProvider] = useState<'resend' | 'twilio' | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Credential form state
  const [apiKey, setApiKey] = useState('');
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [fromNumber, setFromNumber] = useState('');

  // Settings form state
  const [formData, setFormData] = useState({
    default_email: '',
    email_from_name: '',
    email_signature: '',
    default_phone: '',
    sms_signature: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const [settingsRes, providersRes] = await Promise.all([
        fetch('/api/stellium/comms/settings', { credentials: 'include' }),
        fetch('/api/stellium/comms/credentials', { credentials: 'include' }),
      ]);

      if (settingsRes.ok) {
        const settingsJson = await settingsRes.json();
        setSettings(settingsJson.settings);
        setFormData({
          default_email: settingsJson.settings?.default_email || '',
          email_from_name: settingsJson.settings?.email_from_name || '',
          email_signature: settingsJson.settings?.email_signature || '',
          default_phone: settingsJson.settings?.default_phone || '',
          sms_signature: settingsJson.settings?.sms_signature || '',
        });
      }

      if (providersRes.ok) {
        const providersJson = await providersRes.json();
        setProviders(providersJson.providers || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function addProvider(provider: 'resend' | 'twilio') {
    setSaving(true);
    setError(null);

    try {
      const credentials = provider === 'resend'
        ? { api_key: apiKey }
        : { account_sid: accountSid, auth_token: authToken, from_number: fromNumber };

      const res = await fetch('/api/stellium/comms/credentials', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, credentials }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to add provider');

      // Refresh providers list
      await fetchData();
      setShowAddProvider(null);
      setApiKey('');
      setAccountSid('');
      setAuthToken('');
      setFromNumber('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add provider');
    } finally {
      setSaving(false);
    }
  }

  async function removeProvider(provider: string) {
    if (!confirm(`Remove ${provider} credentials? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/stellium/comms/credentials?provider=${provider}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to remove provider');
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove');
    }
  }

  async function saveSettings() {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch('/api/stellium/comms/settings', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save settings');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  const hasEmailProvider = providers.some(p => p.channel === 'email');
  const hasSmsProvider = providers.some(p => p.channel === 'sms');

  if (loading) {
    return (
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-sacred-gold/50 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-4">
            <p className="text-red-300">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Provider Configuration */}
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
        <CardHeader>
          <CardTitle className="text-lg text-gray-200">Connected Providers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-500 text-sm">
            Connect your email and SMS providers to send messages to clients.
          </p>

          {/* Existing Providers */}
          {providers.length > 0 && (
            <div className="space-y-3">
              {providers.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {p.channel === 'email' ? (
                      <Mail className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Smartphone className="w-5 h-5 text-green-400" />
                    )}
                    <div>
                      <p className="text-gray-200 font-medium">{p.displayName}</p>
                      <p className="text-gray-500 text-xs">
                        {p.verified ? (
                          <span className="text-green-400 flex items-center">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                          </span>
                        ) : (
                          <span className="text-amber-400 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" /> Not verified
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeProvider(p.provider)}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Provider Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            {!hasEmailProvider && (
              <button
                onClick={() => setShowAddProvider('resend')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <Mail className="w-4 h-4" />
                <span>Add Resend (Email)</span>
              </button>
            )}
            {!hasSmsProvider && (
              <button
                onClick={() => setShowAddProvider('twilio')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <MessageSquare className="w-4 h-4" />
                <span>Add Twilio (SMS)</span>
              </button>
            )}
          </div>

          {/* Add Resend Form */}
          {showAddProvider === 'resend' && (
            <div className="p-4 bg-gray-800/50 rounded-lg space-y-4 border border-gray-700">
              <h4 className="text-gray-200 font-medium">Connect Resend</h4>
              <p className="text-gray-500 text-sm">
                Get your API key from{' '}
                <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-sacred-gold hover:underline">
                  resend.com/api-keys
                </a>
              </p>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="re_..."
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => addProvider('resend')}
                  disabled={!apiKey || saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Connect</span>
                </button>
                <button
                  onClick={() => { setShowAddProvider(null); setApiKey(''); }}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Add Twilio Form */}
          {showAddProvider === 'twilio' && (
            <div className="p-4 bg-gray-800/50 rounded-lg space-y-4 border border-gray-700">
              <h4 className="text-gray-200 font-medium">Connect Twilio</h4>
              <p className="text-gray-500 text-sm">
                Get your credentials from{' '}
                <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer" className="text-sacred-gold hover:underline">
                  console.twilio.com
                </a>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Account SID</label>
                  <input
                    type="text"
                    value={accountSid}
                    onChange={(e) => setAccountSid(e.target.value)}
                    placeholder="AC..."
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Auth Token</label>
                  <input
                    type="password"
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    placeholder="Enter auth token"
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">From Phone Number</label>
                <input
                  type="text"
                  value={fromNumber}
                  onChange={(e) => setFromNumber(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
                />
                <p className="text-xs text-gray-600">The phone number you purchased from Twilio</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => addProvider('twilio')}
                  disabled={!accountSid || !authToken || !fromNumber || saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Connect</span>
                </button>
                <button
                  onClick={() => { setShowAddProvider(null); setAccountSid(''); setAuthToken(''); setFromNumber(''); }}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sender Settings */}
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
        <CardHeader>
          <CardTitle className="text-lg text-gray-200">Sender Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); saveSettings(); }} className="space-y-6">
            {/* Email Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300 flex items-center">
                <Mail className="w-4 h-4 mr-2" /> Email
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">From Email</label>
                  <input
                    type="email"
                    value={formData.default_email}
                    onChange={(e) => setFormData({ ...formData, default_email: e.target.value })}
                    placeholder="you@yourdomain.com"
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">From Name</label>
                  <input
                    type="text"
                    value={formData.email_from_name}
                    onChange={(e) => setFormData({ ...formData, email_from_name: e.target.value })}
                    placeholder="Your Practice Name"
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Email Signature</label>
                <textarea
                  value={formData.email_signature}
                  onChange={(e) => setFormData({ ...formData, email_signature: e.target.value })}
                  placeholder="Best wishes,&#10;Your Name"
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* SMS Settings */}
            <div className="space-y-4 pt-4 border-t border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 flex items-center">
                <Smartphone className="w-4 h-4 mr-2" /> SMS
              </h3>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">SMS Signature (appended to messages)</label>
                <input
                  type="text"
                  value={formData.sms_signature}
                  onChange={(e) => setFormData({ ...formData, sms_signature: e.target.value })}
                  placeholder="- Your Name"
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-2 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saved ? 'Saved!' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// PAYOUTS TAB (Stripe Connect)
// ============================================

interface ConnectStatus {
  configured: boolean;
  connected: boolean;
  onboarded: boolean;
  enabled?: boolean;
  dashboardUrl?: string | null;
}

function PayoutsTab() {
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stellium/stripe/connect', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch status');
      setStatus(json.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function startConnect() {
    setConnecting(true);
    setError(null);
    try {
      const res = await fetch('/api/stellium/stripe/connect', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnPath: '/stellium/settings' }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error || 'Failed to start onboarding');
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setConnecting(false);
    }
  }

  if (loading) {
    return (
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-sacred-gold/50 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    if (!status?.configured) {
      return <span className="px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-400">Not configured</span>;
    }
    if (status.onboarded) {
      return <span className="px-2 py-1 rounded-full text-xs bg-green-900/50 text-green-400">Connected</span>;
    }
    if (status.connected) {
      return <span className="px-2 py-1 rounded-full text-xs bg-amber-900/50 text-amber-400">Action needed</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-400">Not connected</span>;
  };

  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-gray-200">Stripe Connect</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {!status?.configured && (
          <div className="p-4 bg-gray-800/30 rounded-lg">
            <p className="text-gray-400 text-sm">
              Stripe is not configured on this server. Contact support to enable payments.
            </p>
          </div>
        )}

        {status?.configured && !status.onboarded && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-800/30 rounded-lg">
              <p className="text-gray-300 mb-2">
                Connect your Stripe account to receive payments from clients.
              </p>
              <p className="text-gray-500 text-sm">
                Soullab takes a 12% platform fee. The remaining 88% goes directly to your account.
              </p>
            </div>
            <button
              onClick={startConnect}
              disabled={connecting}
              className="flex items-center space-x-2 px-6 py-3 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg transition-colors disabled:opacity-50"
            >
              {connecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              <span>{status.connected ? 'Continue Setup' : 'Connect Stripe'}</span>
            </button>
          </div>
        )}

        {status?.onboarded && (
          <div className="space-y-4">
            <div className="p-4 bg-green-900/10 border border-green-700/20 rounded-lg">
              <p className="text-green-400 font-medium">Your Stripe account is connected</p>
              <p className="text-gray-500 text-sm mt-1">
                You can receive payments from clients. Manage your payouts in the Stripe dashboard.
              </p>
            </div>
            {status.dashboardUrl && (
              <a
                href={status.dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors"
              >
                <span>Open Stripe Dashboard</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// PRICING TAB (Tier Pricing)
// ============================================

interface TierPricingData {
  id?: string;
  tier: 'subscriber' | 'vip';
  monthly_price_cents: number;
  annual_price_cents: number | null;
  name: string | null;
  description: string | null;
  features: string[];
  is_active: boolean;
}

function PricingTab() {
  const [pricing, setPricing] = useState<Record<string, TierPricingData>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Local form state
  const [subscriberPrice, setSubscriberPrice] = useState('');
  const [subscriberActive, setSubscriberActive] = useState(false);
  const [vipPrice, setVipPrice] = useState('');
  const [vipActive, setVipActive] = useState(false);

  useEffect(() => {
    fetchPricing();
  }, []);

  async function fetchPricing() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stellium/pricing', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch pricing');

      setPricing(json.pricing || {});

      // Initialize form state
      if (json.pricing?.subscriber) {
        setSubscriberPrice((json.pricing.subscriber.monthly_price_cents / 100).toString());
        setSubscriberActive(json.pricing.subscriber.is_active);
      }
      if (json.pricing?.vip) {
        setVipPrice((json.pricing.vip.monthly_price_cents / 100).toString());
        setVipActive(json.pricing.vip.is_active);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function saveTier(tier: 'subscriber' | 'vip') {
    const priceStr = tier === 'subscriber' ? subscriberPrice : vipPrice;
    const isActive = tier === 'subscriber' ? subscriberActive : vipActive;

    const priceDollars = parseFloat(priceStr);
    if (isNaN(priceDollars) || priceDollars < 1) {
      setError(`${tier === 'subscriber' ? 'Subscriber' : 'VIP'} price must be at least $1`);
      return;
    }

    setSaving(tier);
    setSaved(null);
    setError(null);

    try {
      const res = await fetch('/api/stellium/pricing', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          monthly_price_cents: Math.round(priceDollars * 100),
          is_active: isActive,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save');

      setPricing(prev => ({ ...prev, [tier]: json.pricing }));
      setSaved(tier);
      setTimeout(() => setSaved(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-sacred-gold/50 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
      <CardHeader>
        <CardTitle className="text-lg text-gray-200">Subscription Tiers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <p className="text-gray-500 text-sm">
          Set pricing for your subscriber and VIP tiers. Clients can subscribe through your portal.
        </p>

        {/* Subscriber Tier */}
        <div className="p-4 bg-gray-800/30 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-200 font-medium">Subscriber</h3>
              <p className="text-gray-500 text-sm">Basic subscription tier</p>
            </div>
            <button
              type="button"
              onClick={() => setSubscriberActive(!subscriberActive)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                subscriberActive ? 'bg-sacred-gold' : 'bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  subscriberActive ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="text-sm text-gray-400 block mb-1">Monthly Price ($)</label>
              <input
                type="number"
                value={subscriberPrice}
                onChange={(e) => setSubscriberPrice(e.target.value)}
                min="1"
                step="0.01"
                placeholder="15.00"
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
              />
            </div>
            <button
              onClick={() => saveTier('subscriber')}
              disabled={saving === 'subscriber'}
              className="flex items-center space-x-2 px-4 py-2 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg transition-colors disabled:opacity-50 mt-5"
            >
              {saving === 'subscriber' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved === 'subscriber' ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* VIP Tier */}
        <div className="p-4 bg-gray-800/30 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-200 font-medium">VIP</h3>
              <p className="text-gray-500 text-sm">Premium subscription tier</p>
            </div>
            <button
              type="button"
              onClick={() => setVipActive(!vipActive)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                vipActive ? 'bg-sacred-gold' : 'bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  vipActive ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="text-sm text-gray-400 block mb-1">Monthly Price ($)</label>
              <input
                type="number"
                value={vipPrice}
                onChange={(e) => setVipPrice(e.target.value)}
                min="1"
                step="0.01"
                placeholder="50.00"
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
              />
            </div>
            <button
              onClick={() => saveTier('vip')}
              disabled={saving === 'vip'}
              className="flex items-center space-x-2 px-4 py-2 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg transition-colors disabled:opacity-50 mt-5"
            >
              {saving === 'vip' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved === 'vip' ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save</span>
            </button>
          </div>
        </div>

        <div className="p-4 bg-gray-800/20 rounded-lg">
          <p className="text-gray-500 text-sm">
            Clients can subscribe at <span className="text-sacred-gold">/portal/your-slug/subscribe</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
