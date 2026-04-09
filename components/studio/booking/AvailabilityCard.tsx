'use client';

import { useEffect, useState } from 'react';
import { Clock, Plus, Trash2, Loader2, Check, X, Ban, CalendarX } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { formatRelativeTime } from './lastUpdated';

// Monday-first week (matches the booking page)
const DAY_NAMES_MON_FIRST: Array<{ dow: number; label: string }> = [
  { dow: 1, label: 'Monday' },
  { dow: 2, label: 'Tuesday' },
  { dow: 3, label: 'Wednesday' },
  { dow: 4, label: 'Thursday' },
  { dow: 5, label: 'Friday' },
  { dow: 6, label: 'Saturday' },
  { dow: 0, label: 'Sunday' },
];

interface AvailabilityWindow {
  id: string;
  day_of_week: number;
  start_time: string; // HH:MM or HH:MM:SS
  end_time: string;
  is_available: boolean;
}

interface AvailabilityOverride {
  id: string;
  override_date: string;
  is_blocked: boolean;
  reason: string | null;
}

// In-memory edit row — id is optional (new rows have no id yet)
interface WindowDraft {
  tempId: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

function toDraft(w: AvailabilityWindow): WindowDraft {
  return {
    tempId: w.id,
    day_of_week: w.day_of_week,
    start_time: normalizeTime(w.start_time),
    end_time: normalizeTime(w.end_time),
    is_available: w.is_available,
  };
}

function normalizeTime(t: string): string {
  // Trim HH:MM:SS → HH:MM for HTML time inputs
  if (t && t.length >= 5) return t.slice(0, 5);
  return t || '09:00';
}

export function AvailabilityCard() {
  const [windows, setWindows] = useState<AvailabilityWindow[]>([]);
  const [overrides, setOverrides] = useState<AvailabilityOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Weekly hours editor state
  const [editingHours, setEditingHours] = useState(false);
  const [drafts, setDrafts] = useState<WindowDraft[]>([]);
  const [savingHours, setSavingHours] = useState(false);

  // Blocked date form state
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');
  const [savingBlock, setSavingBlock] = useState(false);

  async function fetchAvailability() {
    try {
      const res = await apiFetch('/api/studio/availability');
      if (!res.ok) {
        setError('Failed to load availability');
        return;
      }
      const data = await res.json();
      setWindows(data.windows || []);
      setOverrides(data.overrides || []);
    } catch {
      setError('Failed to load availability');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAvailability();
  }, []);

  function openHoursEditor() {
    setDrafts(windows.map(toDraft));
    setEditingHours(true);
    setError(null);
  }

  function closeHoursEditor() {
    setEditingHours(false);
    setError(null);
  }

  function addDraftRow() {
    setDrafts((prev) => [
      ...prev,
      {
        tempId: `new-${Date.now()}-${Math.random()}`,
        day_of_week: 1, // Monday
        start_time: '09:00',
        end_time: '17:00',
        is_available: true,
      },
    ]);
  }

  function removeDraftRow(tempId: string) {
    setDrafts((prev) => prev.filter((d) => d.tempId !== tempId));
  }

  function updateDraft(tempId: string, patch: Partial<WindowDraft>) {
    setDrafts((prev) => prev.map((d) => (d.tempId === tempId ? { ...d, ...patch } : d)));
  }

  async function handleSaveHours() {
    // Safeguard: if the user is about to wipe all availability, confirm
    if (drafts.length === 0) {
      const ok = window.confirm(
        "This will remove all availability windows. Clients won't be able to book until you add new hours. Continue?"
      );
      if (!ok) return;
    }

    // Validate
    for (const d of drafts) {
      if (!d.start_time || !d.end_time) {
        setError('Start and end times are required for every row');
        return;
      }
      if (d.start_time >= d.end_time) {
        setError('End time must be after start time');
        return;
      }
    }

    setSavingHours(true);
    setError(null);
    try {
      const payload = {
        windows: drafts.map((d) => ({
          day_of_week: d.day_of_week,
          start_time: d.start_time,
          end_time: d.end_time,
          is_available: d.is_available,
        })),
      };
      const res = await apiFetch('/api/studio/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save hours');
      }
      await fetchAvailability();
      setLastSavedAt(new Date().toISOString());
      setEditingHours(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSavingHours(false);
    }
  }

  async function handleAddBlockedDate() {
    if (!newBlockDate) {
      setError('Date is required');
      return;
    }
    setSavingBlock(true);
    setError(null);
    try {
      const res = await apiFetch('/api/studio/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          override_date: newBlockDate,
          is_blocked: true,
          reason: newBlockReason.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to add blocked date');
      }
      await fetchAvailability();
      setLastSavedAt(new Date().toISOString());
      setNewBlockDate('');
      setNewBlockReason('');
      setShowBlockForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSavingBlock(false);
    }
  }

  async function handleRemoveOverride(id: string) {
    if (!confirm('Remove this blocked date?')) return;
    try {
      const res = await apiFetch(`/api/studio/availability?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to remove');
      }
      await fetchAvailability();
      setLastSavedAt(new Date().toISOString());
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove');
    }
  }

  // Group windows by day for display
  const windowsByDay = DAY_NAMES_MON_FIRST.map((d) => ({
    ...d,
    windows: windows.filter((w) => w.day_of_week === d.dow),
  }));

  const updatedLabel = formatRelativeTime(lastSavedAt);

  return (
    <div className="rounded-xl border border-slate-800/50 bg-[#1e1e38] p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Availability</h2>
            {updatedLabel && (
              <p className="text-xs text-slate-500">Last updated {updatedLabel}</p>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 bg-slate-800/50 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Weekly hours section */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Weekly hours
              </p>
              {!editingHours && (
                <button
                  onClick={openHoursEditor}
                  className="text-xs text-amber-400 hover:text-amber-300"
                >
                  Edit
                </button>
              )}
            </div>

            {editingHours ? (
              <div className="space-y-2">
                {drafts.map((d) => (
                  <div key={d.tempId} className="flex items-center gap-2">
                    <select
                      value={d.day_of_week}
                      onChange={(e) => updateDraft(d.tempId, { day_of_week: Number(e.target.value) })}
                      className="px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      {DAY_NAMES_MON_FIRST.map((day) => (
                        <option key={day.dow} value={day.dow}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="time"
                      value={d.start_time}
                      onChange={(e) => updateDraft(d.tempId, { start_time: e.target.value })}
                      className="px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-slate-500 text-xs">to</span>
                    <input
                      type="time"
                      value={d.end_time}
                      onChange={(e) => updateDraft(d.tempId, { end_time: e.target.value })}
                      className="px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={() => removeDraftRow(d.tempId)}
                      className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addDraftRow}
                  className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 pt-1"
                >
                  <Plus className="w-3 h-3" />
                  Add window
                </button>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={closeHoursEditor}
                    disabled={savingHours}
                    className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveHours}
                    disabled={savingHours}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingHours ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    {savingHours ? 'Saving...' : 'Save hours'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {windows.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    No hours set. Add weekly availability so clients can book.
                  </p>
                ) : (
                  windowsByDay.map((day) =>
                    day.windows.length > 0 ? (
                      <div key={day.dow} className="flex items-baseline gap-3 text-sm">
                        <span className="text-slate-400 w-20 flex-shrink-0">{day.label}</span>
                        <span className="text-slate-200">
                          {day.windows.map((w, i) => (
                            <span key={w.id}>
                              {i > 0 && ', '}
                              {normalizeTime(w.start_time)}–{normalizeTime(w.end_time)}
                            </span>
                          ))}
                        </span>
                      </div>
                    ) : null
                  )
                )}
              </div>
            )}
          </div>

          {/* Blocked dates section */}
          <div className="pt-4 border-t border-slate-800/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Blocked dates
              </p>
              {!showBlockForm && (
                <button
                  onClick={() => { setShowBlockForm(true); setError(null); }}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"
                >
                  <Plus className="w-3 h-3" />
                  Block a date
                </button>
              )}
            </div>

            {showBlockForm && (
              <div className="mb-3 p-3 rounded-lg border border-amber-500/30 bg-slate-900/60 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={newBlockDate}
                    onChange={(e) => setNewBlockDate(e.target.value)}
                    className="px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    value={newBlockReason}
                    onChange={(e) => setNewBlockReason(e.target.value)}
                    placeholder="Reason (optional)"
                    className="flex-1 px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => { setShowBlockForm(false); setNewBlockDate(''); setNewBlockReason(''); setError(null); }}
                    disabled={savingBlock}
                    className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddBlockedDate}
                    disabled={savingBlock || !newBlockDate}
                    className="flex items-center gap-1 px-3 py-1 text-xs rounded bg-amber-500 hover:bg-amber-400 text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingBlock ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    {savingBlock ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </div>
            )}

            {overrides.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No blocked dates.</p>
            ) : (
              <div className="space-y-1">
                {overrides.map((o) => (
                  <div key={o.id} className="flex items-center justify-between text-sm py-1">
                    <div className="flex items-center gap-2">
                      <CalendarX className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="text-slate-200">{o.override_date}</span>
                      {o.reason && <span className="text-slate-500 text-xs">· {o.reason}</span>}
                    </div>
                    <button
                      onClick={() => handleRemoveOverride(o.id)}
                      className="p-1 rounded text-slate-500 hover:text-red-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
