'use client';

/**
 * ProtocolCard — components/studio/protocols/ProtocolCard.tsx
 *
 * Full protocol view for studio practitioners.
 * - Week progress indicator (6 badges, current highlighted)
 * - Observation feed with source badges (maia / manual / practitioner)
 * - Manual observation input (practitioner can add entries)
 * - Week advance button (PATCH { action: 'advance_week' })
 * - Status controls (PATCH { action: 'set_status', status })
 * - Notes field (editable, PUT)
 */

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Protocol {
  id: string;
  patternName: string;
  patternDescription: string | null;
  trigger: string | null;
  behavior: string | null;
  immediateReward: string | null;
  longTermCost: string | null;
  status: string;
  currentWeek: number;
  councilGuides: string[];
  notes: string | null;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
}

interface Observation {
  id: string;
  weekNumber: number;
  observationText: string | null;
  source: 'maia' | 'manual' | 'practitioner';
  createdAt: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const WEEK_TITLES: Record<number, string> = {
  1: 'Baseline Observation',
  2: 'Somatic Mapping',
  3: 'Origin Inquiry',
  4: 'Micro-Intervention',
  5: 'Pattern Integration',
  6: 'Closing the Inquiry',
};

const STATUS_OPTIONS = ['draft', 'active', 'paused', 'completed'] as const;

const SOURCE_BADGE: Record<string, string> = {
  maia: 'bg-indigo-900/60 text-indigo-300',
  manual: 'bg-gray-700 text-gray-300',
  practitioner: 'bg-teal-900/60 text-teal-300',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-700 text-gray-300',
  active: 'bg-amber-900/60 text-amber-300',
  paused: 'bg-blue-900/60 text-blue-300',
  completed: 'bg-green-900/60 text-green-300',
};

function formatRelative(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = Date.now();
    const diff = now - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  protocolId: string;
  onBack?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ProtocolCard({ protocolId, onBack }: Props) {
  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Observation form state
  const [newObsText, setNewObsText] = useState('');
  const [obsSource, setObsSource] = useState<'manual' | 'practitioner'>('practitioner');
  const [addingObs, setAddingObs] = useState(false);
  const [obsError, setObsError] = useState<string | null>(null);

  // Notes editing state
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Action states
  const [advancing, setAdvancing] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  const loadProtocol = useCallback(() => {
    return apiFetch(`/api/studio/protocols/${protocolId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setProtocol(data.protocol);
        setNotesValue(data.protocol.notes ?? '');
      });
  }, [protocolId]);

  const loadObservations = useCallback(() => {
    return apiFetch(`/api/studio/protocols/${protocolId}/observations`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setObservations(data.observations ?? []);
      });
  }, [protocolId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadProtocol(), loadObservations()])
      .catch((err) => setError(err.message ?? 'Failed to load protocol'))
      .finally(() => setLoading(false));
  }, [loadProtocol, loadObservations]);

  // ─── Actions ────────────────────────────────────────────────────────────────

  async function handleAdvanceWeek() {
    if (!protocol) return;
    setAdvancing(true);
    try {
      const res = await apiFetch(`/api/studio/protocols/${protocolId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'advance_week' }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setProtocol(data.protocol);
    } catch (err) {
      alert((err as Error).message ?? 'Failed to advance week');
    } finally {
      setAdvancing(false);
    }
  }

  async function handleSetStatus(status: string) {
    if (!protocol) return;
    setChangingStatus(true);
    try {
      const res = await apiFetch(`/api/studio/protocols/${protocolId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_status', status }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setProtocol(data.protocol);
    } catch (err) {
      alert((err as Error).message ?? 'Failed to update status');
    } finally {
      setChangingStatus(false);
    }
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    try {
      const res = await apiFetch(`/api/studio/protocols/${protocolId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesValue }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setProtocol(data.protocol);
      setEditingNotes(false);
    } catch (err) {
      alert((err as Error).message ?? 'Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleAddObservation(e: React.FormEvent) {
    e.preventDefault();
    setObsError(null);
    if (!newObsText.trim()) {
      setObsError('Observation text is required');
      return;
    }
    setAddingObs(true);
    try {
      const res = await apiFetch(`/api/studio/protocols/${protocolId}/observations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          observationText: newObsText.trim(),
          source: obsSource,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setObservations((prev) => [data.observation, ...prev]);
      setNewObsText('');
    } catch (err) {
      setObsError((err as Error).message ?? 'Failed to add observation');
    } finally {
      setAddingObs(false);
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return <div className="text-sm text-gray-500 py-8 text-center">Loading protocol...</div>;
  }

  if (error || !protocol) {
    return <div className="text-sm text-red-400 py-8 text-center">{error ?? 'Protocol not found'}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="text-xs text-gray-500 hover:text-gray-300 mb-2 flex items-center gap-1"
            >
              ← Back
            </button>
          )}
          <h2 className="text-lg font-medium text-gray-200">{protocol.patternName}</h2>
          {protocol.patternDescription && (
            <p className="text-sm text-gray-500 mt-1">{protocol.patternDescription}</p>
          )}
        </div>
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${
            STATUS_COLORS[protocol.status] ?? 'bg-gray-700 text-gray-300'
          }`}
        >
          {protocol.status}
        </span>
      </div>

      {/* Week progress */}
      <div>
        <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Progress</div>
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5, 6].map((week) => (
            <div
              key={week}
              className={`flex flex-col items-center px-3 py-2 rounded-lg border text-xs ${
                week === protocol.currentWeek
                  ? 'border-amber-500 bg-amber-900/40 text-amber-300'
                  : week < protocol.currentWeek
                  ? 'border-gray-600 bg-gray-800 text-gray-400'
                  : 'border-gray-700 bg-gray-800/50 text-gray-600'
              }`}
            >
              <span className="font-semibold">W{week}</span>
              <span className="text-center leading-tight mt-0.5 max-w-[64px]">
                {WEEK_TITLES[week]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap">
        {protocol.currentWeek < 6 && protocol.status === 'active' && (
          <button
            onClick={handleAdvanceWeek}
            disabled={advancing}
            className="px-3 py-1.5 text-sm bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-100 rounded transition-colors"
          >
            {advancing ? 'Advancing...' : `Advance to Week ${protocol.currentWeek + 1}`}
          </button>
        )}

        <div className="flex gap-1">
          {STATUS_OPTIONS.filter((s) => s !== protocol.status).map((s) => (
            <button
              key={s}
              onClick={() => handleSetStatus(s)}
              disabled={changingStatus}
              className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 rounded border border-gray-700 transition-colors capitalize"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Habit loop anatomy */}
      {(protocol.trigger || protocol.behavior || protocol.immediateReward || protocol.longTermCost) && (
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Pattern Anatomy</div>
          {protocol.trigger && (
            <div className="text-sm">
              <span className="text-gray-500">Trigger: </span>
              <span className="text-gray-300">{protocol.trigger}</span>
            </div>
          )}
          {protocol.behavior && (
            <div className="text-sm">
              <span className="text-gray-500">Behavior: </span>
              <span className="text-gray-300">{protocol.behavior}</span>
            </div>
          )}
          {protocol.immediateReward && (
            <div className="text-sm">
              <span className="text-gray-500">Immediate reward: </span>
              <span className="text-gray-300">{protocol.immediateReward}</span>
            </div>
          )}
          {protocol.longTermCost && (
            <div className="text-sm">
              <span className="text-gray-500">Long-term cost: </span>
              <span className="text-gray-300">{protocol.longTermCost}</span>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Practitioner Notes</div>
          {!editingNotes && (
            <button
              onClick={() => setEditingNotes(true)}
              className="text-xs text-amber-500 hover:text-amber-400"
            >
              Edit
            </button>
          )}
        </div>
        {editingNotes ? (
          <div className="space-y-2">
            <textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200 text-sm resize-none"
              placeholder="Private practitioner notes..."
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="px-3 py-1 text-sm bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white rounded"
              >
                {savingNotes ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setEditingNotes(false);
                  setNotesValue(protocol.notes ?? '');
                }}
                className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            {protocol.notes || <span className="text-gray-600 italic">No notes yet.</span>}
          </p>
        )}
      </div>

      {/* Add observation */}
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Add Observation</div>
        <form onSubmit={handleAddObservation} className="space-y-2">
          {obsError && (
            <div className="text-xs text-red-400">{obsError}</div>
          )}
          <textarea
            value={newObsText}
            onChange={(e) => setNewObsText(e.target.value)}
            rows={3}
            placeholder="Note an observation from this week..."
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-600 resize-none"
          />
          <div className="flex items-center gap-3">
            <div className="flex gap-2 text-sm">
              {(['manual', 'practitioner'] as const).map((s) => (
                <label key={s} className="flex items-center gap-1 cursor-pointer text-gray-400">
                  <input
                    type="radio"
                    name="obsSource"
                    value={s}
                    checked={obsSource === s}
                    onChange={() => setObsSource(s)}
                    className="accent-amber-600"
                  />
                  {s}
                </label>
              ))}
            </div>
            <button
              type="submit"
              disabled={addingObs}
              className="ml-auto px-3 py-1.5 text-sm bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-100 rounded transition-colors"
            >
              {addingObs ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>

      {/* Observation feed */}
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">
          Observations ({observations.length})
        </div>
        {observations.length === 0 ? (
          <div className="text-sm text-gray-600 italic">No observations yet.</div>
        ) : (
          <div className="space-y-3">
            {observations.map((obs) => (
              <div key={obs.id} className="bg-gray-800/50 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        SOURCE_BADGE[obs.source] ?? 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {obs.source}
                    </span>
                    <span className="text-xs text-gray-500">Week {obs.weekNumber}</span>
                  </div>
                  <span className="text-xs text-gray-600">{formatRelative(obs.createdAt)}</span>
                </div>
                {obs.observationText && (
                  <p className="text-sm text-gray-300">{obs.observationText}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
