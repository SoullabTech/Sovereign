'use client';

import { useState } from 'react';
import { X, Loader2, Video } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { PeoplePicker, PersonRef } from './PeoplePicker';
import { format } from 'date-fns';

interface MeetingCreateModalProps {
  defaultDate: Date;
  defaultHour?: number;
  onClose: () => void;
  onCreated: () => void;
}

export function MeetingCreateModal({
  defaultDate,
  defaultHour = 10,
  onClose,
  onCreated,
}: MeetingCreateModalProps) {
  const dateStr = format(defaultDate, 'yyyy-MM-dd');
  const pad = (n: number) => String(n).padStart(2, '0');

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(dateStr);
  const [startHour, setStartHour] = useState(pad(defaultHour));
  const [startMin, setStartMin] = useState('00');
  const [durationMin, setDurationMin] = useState('60');
  const [description, setDescription] = useState('');
  const [participants, setParticipants] = useState<PersonRef[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) return;
    setSaving(true);
    setError(null);
    try {
      const start = new Date(`${date}T${startHour}:${startMin}:00`);
      const end = new Date(start.getTime() + Number(durationMin) * 60_000);
      const res = await apiFetch('/api/studio/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          start: start.toISOString(),
          end: end.toISOString(),
          participants: participants.map(p => ({
            personId: p.id,
            email: p.email,
            name: p.name,
            type: 'required',
          })),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create meeting');
      }
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating meeting');
    } finally {
      setSaving(false);
    }
  }

  const hours = Array.from({ length: 24 }, (_, i) => pad(i));
  const mins = ['00', '15', '30', '45'];
  const durations = [
    { label: '30 min', value: '30' },
    { label: '1 hour', value: '60' },
    { label: '1.5 hours', value: '90' },
    { label: '2 hours', value: '120' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#16162a] border border-slate-700/60 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-violet-400" />
            <h2 className="text-base font-semibold text-white">Schedule Co-Lab Meeting</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Meeting title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Co-Lab session with Jondi"
              required
              autoFocus
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-400/50"
            />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-400/50"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Start time</label>
              <div className="flex gap-1">
                <select
                  value={startHour}
                  onChange={e => setStartHour(e.target.value)}
                  className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-violet-400/50"
                >
                  {hours.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="text-slate-400 flex items-center">:</span>
                <select
                  value={startMin}
                  onChange={e => setStartMin(e.target.value)}
                  className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-violet-400/50"
                >
                  {mins.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Duration</label>
            <div className="flex gap-2">
              {durations.map(d => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDurationMin(d.value)}
                  className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${
                    durationMin === d.value
                      ? 'border-violet-400/60 bg-violet-500/20 text-violet-300'
                      : 'border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Participants */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Participants</label>
            <PeoplePicker
              value={participants}
              onChange={setParticipants}
              placeholder="Search people or add by email…"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Notes (optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Agenda, context, or prep notes"
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-400/50 resize-none"
            />
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim() || !date}
              className="px-5 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {saving ? 'Scheduling…' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
