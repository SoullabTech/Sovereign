'use client';

import { useEffect, useState, useCallback } from 'react';
import { Clock, Plus, Trash2, Ban, CalendarPlus, Copy, Check, ExternalLink } from 'lucide-react';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface AvailabilityWindow {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface AvailabilityOverride {
  id: string;
  override_date: string;
  is_blocked: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
}

interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
  isActive: boolean;
}

export default function SchedulingPage() {
  const [windows, setWindows] = useState<AvailabilityWindow[]>([]);
  const [overrides, setOverrides] = useState<AvailabilityOverride[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [slug, setSlug] = useState<string>('');

  // New override form
  const [newOverrideDate, setNewOverrideDate] = useState('');
  const [newOverrideReason, setNewOverrideReason] = useState('');

  // New window form
  const [newDay, setNewDay] = useState(1);
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('17:00');

  const loadData = useCallback(async () => {
    try {
      const [availRes, svcRes, configRes] = await Promise.all([
        fetch('/api/studio/availability'),
        fetch('/api/studio/services'),
        fetch('/api/studio/settings'),
      ]);

      if (availRes.ok) {
        const data = await availRes.json();
        setWindows(data.windows || []);
        setOverrides(data.overrides || []);
      }
      if (svcRes.ok) {
        const data = await svcRes.json();
        setServices(data.services || []);
      }
      if (configRes.ok) {
        const data = await configRes.json();
        setSlug(data.slug || data.practitioner_slug || '');
      }
    } catch (err) {
      console.error('Failed to load scheduling data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const addWindow = async () => {
    const updated = [...windows, {
      id: '',
      day_of_week: newDay,
      start_time: newStart,
      end_time: newEnd,
      is_available: true,
    }];

    setSaving(true);
    try {
      const res = await fetch('/api/studio/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          windows: updated.map((w) => ({
            day_of_week: w.day_of_week,
            start_time: w.start_time,
            end_time: w.end_time,
            is_available: w.is_available,
          })),
        }),
      });
      if (res.ok) {
        await loadData();
      }
    } finally {
      setSaving(false);
    }
  };

  const removeWindow = async (index: number) => {
    const updated = windows.filter((_, i) => i !== index);
    setSaving(true);
    try {
      const res = await fetch('/api/studio/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          windows: updated.map((w) => ({
            day_of_week: w.day_of_week,
            start_time: w.start_time,
            end_time: w.end_time,
            is_available: w.is_available,
          })),
        }),
      });
      if (res.ok) {
        await loadData();
      }
    } finally {
      setSaving(false);
    }
  };

  const addOverride = async () => {
    if (!newOverrideDate) return;
    setSaving(true);
    try {
      const res = await fetch('/api/studio/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          override_date: newOverrideDate,
          is_blocked: true,
          reason: newOverrideReason || null,
        }),
      });
      if (res.ok) {
        setNewOverrideDate('');
        setNewOverrideReason('');
        await loadData();
      }
    } finally {
      setSaving(false);
    }
  };

  const removeOverride = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/studio/availability?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadData();
      }
    } finally {
      setSaving(false);
    }
  };

  const copyBookingLink = () => {
    if (!slug) return;
    const url = `${window.location.origin}/book/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse text-neutral-400">Loading scheduling...</div>
      </div>
    );
  }

  // Group windows by day
  const windowsByDay: Record<number, AvailabilityWindow[]> = {};
  for (const w of windows) {
    if (!windowsByDay[w.day_of_week]) windowsByDay[w.day_of_week] = [];
    windowsByDay[w.day_of_week].push(w);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-100">Scheduling</h1>
        {slug && (
          <button
            onClick={copyBookingLink}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy booking link'}
          </button>
        )}
      </div>

      {/* Booking link preview */}
      {slug && (
        <div className="p-3 rounded-md bg-amber-900/10 border border-amber-800 flex items-center gap-2 text-sm">
          <ExternalLink className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-neutral-400">
            Public booking page:
          </span>
          <a
            href={`/book/${slug}`}
            target="_blank"
            rel="noopener"
            className="text-amber-400 hover:underline"
          >
            {typeof window !== 'undefined' ? window.location.origin : ''}/book/{slug}
          </a>
        </div>
      )}

      {/* Weekly Availability */}
      <section>
        <h2 className="text-lg font-medium text-neutral-200 mb-4">
          Weekly Hours
        </h2>

        <div className="space-y-3">
          {DAY_NAMES.map((dayName, dayIndex) => {
            const dayWindows = windowsByDay[dayIndex] || [];
            return (
              <div key={dayIndex} className="flex items-start gap-4 py-2 border-b border-neutral-800">
                <span className="w-24 text-sm font-medium text-neutral-300 pt-1">
                  {dayName}
                </span>
                <div className="flex-1">
                  {dayWindows.length === 0 ? (
                    <span className="text-sm text-neutral-400">Unavailable</span>
                  ) : (
                    <div className="space-y-1">
                      {dayWindows.map((w, i) => {
                        const globalIndex = windows.indexOf(w);
                        return (
                          <div key={w.id || i} className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-neutral-400" />
                            <span className="text-sm text-neutral-300">
                              {w.start_time.slice(0, 5)} — {w.end_time.slice(0, 5)}
                            </span>
                            <button
                              onClick={() => removeWindow(globalIndex)}
                              disabled={saving}
                              className="text-neutral-400 hover:text-red-500 p-0.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add window */}
        <div className="mt-4 flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Day</label>
            <select
              value={newDay}
              onChange={(e) => setNewDay(Number(e.target.value))}
              className="px-2 py-1.5 text-sm rounded border border-neutral-700 bg-neutral-800 text-neutral-100"
            >
              {DAY_NAMES.map((name, i) => (
                <option key={i} value={i}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Start</label>
            <input
              type="time"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              className="px-2 py-1.5 text-sm rounded border border-neutral-700 bg-neutral-800 text-neutral-100 [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">End</label>
            <input
              type="time"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
              className="px-2 py-1.5 text-sm rounded border border-neutral-700 bg-neutral-800 text-neutral-100 [color-scheme:dark]"
            />
          </div>
          <button
            onClick={addWindow}
            disabled={saving}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded bg-amber-500 hover:bg-amber-600 text-white disabled:bg-neutral-700 disabled:text-neutral-500"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </section>

      {/* Date Overrides */}
      <section>
        <h2 className="text-lg font-medium text-neutral-200 mb-4">
          Blocked Dates
        </h2>

        {overrides.length === 0 ? (
          <p className="text-sm text-neutral-400">No blocked dates set.</p>
        ) : (
          <div className="space-y-2">
            {overrides.map((o) => (
              <div key={o.id} className="flex items-center gap-3 py-1.5">
                <Ban className="w-4 h-4 text-red-400" />
                <span className="text-sm text-neutral-300">
                  {new Date(o.override_date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                {o.reason && (
                  <span className="text-xs text-neutral-400">({o.reason})</span>
                )}
                <button
                  onClick={() => removeOverride(o.id)}
                  disabled={saving}
                  className="text-neutral-400 hover:text-red-500 ml-auto p-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add override */}
        <div className="mt-4 flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Date</label>
            <input
              type="date"
              value={newOverrideDate}
              onChange={(e) => setNewOverrideDate(e.target.value)}
              className="px-2 py-1.5 text-sm rounded border border-neutral-700 bg-neutral-800 text-neutral-100 [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Reason (optional)</label>
            <input
              type="text"
              value={newOverrideReason}
              onChange={(e) => setNewOverrideReason(e.target.value)}
              placeholder="Holiday, conference..."
              className="px-2 py-1.5 text-sm rounded border border-neutral-700 bg-neutral-800 text-neutral-100 placeholder:text-neutral-500 w-48"
            />
          </div>
          <button
            onClick={addOverride}
            disabled={saving || !newOverrideDate}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded bg-red-500 hover:bg-red-600 text-white disabled:bg-neutral-700 disabled:text-neutral-500"
          >
            <Ban className="w-3.5 h-3.5" />
            Block Date
          </button>
        </div>
      </section>

      {/* Active Services */}
      <section>
        <h2 className="text-lg font-medium text-neutral-200 mb-4">
          Active Services
        </h2>
        {services.length === 0 ? (
          <p className="text-sm text-neutral-400">No services configured. Add them in the Services module.</p>
        ) : (
          <div className="space-y-2">
            {services.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-neutral-800">
                <div>
                  <p className="text-sm font-medium text-neutral-200">{s.name}</p>
                  <p className="text-xs text-neutral-400">
                    {s.durationMinutes} min
                    {s.priceCents > 0 && ` · $${(s.priceCents / 100).toFixed(0)}`}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  s.isActive
                    ? 'bg-green-900/30 text-green-400'
                    : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {s.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
