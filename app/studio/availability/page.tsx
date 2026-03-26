'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Save,
  Plus,
  Trash2,
  CalendarOff,
  CalendarCheck,
  AlertCircle,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

// ============================================================================
// Types
// ============================================================================

interface WeeklyRow {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface OverrideRow {
  id: string;
  override_date: string;
  is_available: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
}

interface BookingSettings {
  timezone: string;
  buffer_between_sessions: number;
  booking_advance_days: number;
  min_notice_hours: number;
  booking_enabled: boolean;
  cancellation_policy: string;
}

// ============================================================================
// Constants
// ============================================================================

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const COMMON_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Australia/Sydney',
];

const DEFAULT_WEEKLY: WeeklyRow[] = DAY_LABELS.map((_, i) => ({
  day_of_week: i,
  start_time: '09:00:00',
  end_time: '17:00:00',
  is_available: i >= 1 && i <= 5, // Mon–Fri default
}));

// ============================================================================
// Component
// ============================================================================

export default function StudioAvailabilityPage() {
  const [weekly, setWeekly] = useState<WeeklyRow[]>(DEFAULT_WEEKLY);
  const [overrides, setOverrides] = useState<OverrideRow[]>([]);
  const [settings, setSettings] = useState<BookingSettings>({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
    buffer_between_sessions: 15,
    booking_advance_days: 60,
    min_notice_hours: 2,
    booking_enabled: false,
    cancellation_policy: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Override form
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [overrideDate, setOverrideDate] = useState('');
  const [overrideAvailable, setOverrideAvailable] = useState(false);
  const [overrideStart, setOverrideStart] = useState('09:00');
  const [overrideEnd, setOverrideEnd] = useState('17:00');
  const [overrideReason, setOverrideReason] = useState('');

  // ── Load ──────────────────────────────────────────────

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/studio/availability');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();

      if (data.weeklyAvailability?.length > 0) {
        // Merge loaded data with defaults to ensure all 7 days exist
        const loaded = data.weeklyAvailability as WeeklyRow[];
        const merged = DAY_LABELS.map((_, i) => {
          const existing = loaded.find(r => r.day_of_week === i);
          return existing ?? { day_of_week: i, start_time: '09:00:00', end_time: '17:00:00', is_available: false };
        });
        setWeekly(merged);
      }

      if (data.overrides) setOverrides(data.overrides);
      if (data.settings) setSettings(prev => ({ ...prev, ...data.settings }));
    } catch (err) {
      console.error('Failed to load availability:', err);
      setError('Failed to load availability settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Save ──────────────────────────────────────────────

  const saveAll = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await apiFetch('/api/studio/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weeklyAvailability: weekly, settings }),
      });

      if (!res.ok) throw new Error('Save failed');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Weekly helpers ────────────────────────────────────

  const updateDay = (dayIndex: number, patch: Partial<WeeklyRow>) => {
    setWeekly(prev =>
      prev.map(row => row.day_of_week === dayIndex ? { ...row, ...patch } : row),
    );
  };

  // ── Override helpers ──────────────────────────────────

  const addOverride = async () => {
    if (!overrideDate) return;

    try {
      const res = await apiFetch('/api/studio/availability/overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          override_date: overrideDate,
          is_available: overrideAvailable,
          start_time: overrideAvailable ? `${overrideStart}:00` : null,
          end_time: overrideAvailable ? `${overrideEnd}:00` : null,
          reason: overrideReason || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to save override');
      const data = await res.json();

      // Replace or add
      setOverrides(prev => {
        const idx = prev.findIndex(o => o.override_date === overrideDate);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = data.override;
          return updated;
        }
        return [...prev, data.override].sort((a, b) => a.override_date.localeCompare(b.override_date));
      });

      setShowOverrideForm(false);
      setOverrideDate('');
      setOverrideReason('');
    } catch (err) {
      console.error('Override save failed:', err);
      setError('Failed to save date override');
    }
  };

  const removeOverride = async (id: string) => {
    try {
      await apiFetch(`/api/studio/availability/overrides?id=${id}`, { method: 'DELETE' });
      setOverrides(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      console.error('Override delete failed:', err);
    }
  };

  // ── Render ────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-400" />
            Availability
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Set your working hours, booking rules, and date overrides.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-emerald-400"
            >
              Saved
            </motion.span>
          )}
          <button
            onClick={saveAll}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-black font-medium rounded-lg transition-colors"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Booking Toggle */}
      <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <div className="font-medium text-white">Accept bookings</div>
            <div className="text-sm text-slate-400">
              When enabled, clients can book sessions through your portal
            </div>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={settings.booking_enabled}
              onChange={e => setSettings(prev => ({ ...prev, booking_enabled: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-amber-500/50 rounded-full peer peer-checked:bg-amber-500 transition-colors" />
            <div className="absolute left-[2px] top-[2px] bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-5" />
          </div>
        </label>
      </section>

      {/* Weekly Schedule */}
      <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-medium text-white">Weekly schedule</h2>

        <div className="space-y-2">
          {DAY_LABELS.map((label, i) => {
            const row = weekly.find(r => r.day_of_week === i)!;

            return (
              <div
                key={i}
                className={`grid grid-cols-[120px_80px_1fr_1fr] gap-3 items-center p-3 rounded-lg border transition-colors ${
                  row.is_available
                    ? 'border-slate-700 bg-slate-800/30'
                    : 'border-slate-800 bg-slate-900/30 opacity-60'
                }`}
              >
                <div className="font-medium text-white text-sm">{label}</div>

                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={row.is_available}
                    onChange={e => updateDay(i, { is_available: e.target.checked })}
                    className="rounded border-slate-600 text-amber-500 focus:ring-amber-500/50"
                  />
                  On
                </label>

                <input
                  type="time"
                  value={row.start_time.slice(0, 5)}
                  onChange={e => updateDay(i, { start_time: `${e.target.value}:00` })}
                  disabled={!row.is_available}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white disabled:opacity-40"
                />

                <input
                  type="time"
                  value={row.end_time.slice(0, 5)}
                  onChange={e => updateDay(i, { end_time: `${e.target.value}:00` })}
                  disabled={!row.is_available}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white disabled:opacity-40"
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* Booking Rules */}
      <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-medium text-white">Booking rules</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1.5">
            <div className="text-sm text-slate-300">Timezone</div>
            <select
              value={settings.timezone}
              onChange={e => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              {COMMON_TIMEZONES.map(tz => (
                <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <div className="text-sm text-slate-300">Buffer between sessions</div>
            <select
              value={settings.buffer_between_sessions}
              onChange={e => setSettings(prev => ({ ...prev, buffer_between_sessions: Number(e.target.value) }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value={0}>No buffer</option>
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
            </select>
          </label>

          <label className="space-y-1.5">
            <div className="text-sm text-slate-300">Maximum booking window</div>
            <select
              value={settings.booking_advance_days}
              onChange={e => setSettings(prev => ({ ...prev, booking_advance_days: Number(e.target.value) }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value={7}>1 week ahead</option>
              <option value={14}>2 weeks ahead</option>
              <option value={30}>1 month ahead</option>
              <option value={60}>2 months ahead</option>
              <option value={90}>3 months ahead</option>
            </select>
          </label>

          <label className="space-y-1.5">
            <div className="text-sm text-slate-300">Minimum notice</div>
            <select
              value={settings.min_notice_hours}
              onChange={e => setSettings(prev => ({ ...prev, min_notice_hours: Number(e.target.value) }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value={1}>1 hour</option>
              <option value={2}>2 hours</option>
              <option value={4}>4 hours</option>
              <option value={8}>8 hours</option>
              <option value={24}>24 hours</option>
              <option value={48}>48 hours</option>
            </select>
          </label>
        </div>

        <label className="space-y-1.5 block">
          <div className="text-sm text-slate-300">Cancellation policy</div>
          <textarea
            value={settings.cancellation_policy}
            onChange={e => setSettings(prev => ({ ...prev, cancellation_policy: e.target.value }))}
            placeholder="e.g., Sessions may be rescheduled up to 24 hours in advance..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 min-h-[80px] resize-y"
          />
        </label>
      </section>

      {/* Date Overrides */}
      <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-white">Date overrides</h2>
            <p className="text-sm text-slate-400">Block specific dates or set custom hours</p>
          </div>
          <button
            onClick={() => setShowOverrideForm(!showOverrideForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add override
          </button>
        </div>

        {/* Override form */}
        {showOverrideForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border border-slate-700 rounded-lg p-4 space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="space-y-1.5">
                <div className="text-sm text-slate-300">Date</div>
                <input
                  type="date"
                  value={overrideDate}
                  onChange={e => setOverrideDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </label>

              <label className="space-y-1.5">
                <div className="text-sm text-slate-300">Reason (optional)</div>
                <input
                  type="text"
                  value={overrideReason}
                  onChange={e => setOverrideReason(e.target.value)}
                  placeholder="e.g., Holiday, Conference"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600"
                />
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={overrideAvailable}
                onChange={e => setOverrideAvailable(e.target.checked)}
                className="rounded border-slate-600 text-amber-500 focus:ring-amber-500/50"
              />
              Available with custom hours (uncheck to block the entire day)
            </label>

            {overrideAvailable && (
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1.5">
                  <div className="text-sm text-slate-300">Start</div>
                  <input
                    type="time"
                    value={overrideStart}
                    onChange={e => setOverrideStart(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </label>
                <label className="space-y-1.5">
                  <div className="text-sm text-slate-300">End</div>
                  <input
                    type="time"
                    value={overrideEnd}
                    onChange={e => setOverrideEnd(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </label>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowOverrideForm(false)}
                className="px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addOverride}
                disabled={!overrideDate}
                className="px-3 py-1.5 text-sm bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-black font-medium rounded-lg transition-colors"
              >
                Save override
              </button>
            </div>
          </motion.div>
        )}

        {/* Override list */}
        {overrides.length === 0 && !showOverrideForm && (
          <div className="text-sm text-slate-500 py-4 text-center">
            No date overrides set
          </div>
        )}

        <div className="space-y-2">
          {overrides.map(override => (
            <div
              key={override.id}
              className="flex items-center justify-between p-3 border border-slate-800 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {override.is_available ? (
                  <CalendarCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <CalendarOff className="w-4 h-4 text-red-400" />
                )}
                <div>
                  <div className="text-sm font-medium text-white">{override.override_date}</div>
                  <div className="text-xs text-slate-400">
                    {override.is_available
                      ? `${override.start_time?.slice(0, 5)} – ${override.end_time?.slice(0, 5)}`
                      : 'Unavailable'}
                    {override.reason ? ` · ${override.reason}` : ''}
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeOverride(override.id)}
                className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
