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
} from 'lucide-react';
import type {
  PractitionerSettings,
  PractitionerProfile,
  SessionDefaults,
  NotificationSettings,
  PracticeSettings,
  LocationType,
} from '@/lib/stellium/types';

type TabId = 'profile' | 'sessionDefaults' | 'notifications' | 'practice';

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

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
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
