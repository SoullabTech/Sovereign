'use client';

/**
 * Practitioner Observations Panel
 *
 * Captures second-person observations from the practitioner — named, typed events
 * distinct from general notes. These feed the council evidence bundle.
 *
 * Examples:
 *   "client interrupted twice during emotionally charged material"
 *   "visible chest tightening before speaking about mother"
 *   "became more regulated after naming the urge"
 */

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import type { PractitionerObservation, ObservationType } from '@/lib/studio/practitioner/types';
import { Plus, X, Eye } from 'lucide-react';

const OBS_TYPE_LABELS: Record<ObservationType, string> = {
  in_session:       'In session',
  relational_field: 'Relational field',
  somatic_shift:    'Somatic shift',
  pattern_notice:   'Pattern',
  interruption:     'Interruption',
  repair:           'Repair',
  other:            'Other',
};

interface Props {
  decisionId?: string;
  changeId?: string;
  clientId?: string | null;
}

export default function PractitionerObservationsPanel({ decisionId, changeId, clientId }: Props) {
  const [observations, setObservations] = useState<PractitionerObservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    observationType: 'in_session' as ObservationType,
    content: '',
  });

  useEffect(() => {
    loadObservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decisionId, changeId]);

  async function loadObservations() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (decisionId) params.set('decisionId', decisionId);
      if (changeId)   params.set('changeId', changeId);
      if (clientId)   params.set('clientId', clientId);
      const data = await apiFetch(`/api/studio/practitioner-observations?${params.toString()}`);
      setObservations(data.observations || []);
    } catch { /* graceful */ }
    finally { setLoading(false); }
  }

  async function handleSave() {
    if (!form.content.trim()) return;
    setSaving(true);
    try {
      const data = await apiFetch('/api/studio/practitioner-observations', {
        method: 'POST',
        body: JSON.stringify({
          decisionId: decisionId || null,
          changeId: changeId || null,
          clientId: clientId || null,
          observationType: form.observationType,
          content: form.content.trim(),
          tags: [],
        }),
      });
      setObservations((prev) => [data.observation, ...prev]);
      setForm({ observationType: 'in_session', content: '' });
      setAdding(false);
    } catch { /* keep form open */ }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/api/studio/practitioner-observations/${id}`, { method: 'DELETE' });
      setObservations((prev) => prev.filter((o) => o.id !== id));
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-slate-200">Practitioner Observations</h3>
          <p className="text-xs text-slate-500 mt-0.5">Named relational and somatic events — distinct from general notes</p>
        </div>
        <button
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add observation
        </button>
      </div>

      {adding && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4 space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Type</label>
            <select
              value={form.observationType}
              onChange={(e) => setForm((f) => ({ ...f, observationType: e.target.value as ObservationType }))}
              className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5"
            >
              {(Object.keys(OBS_TYPE_LABELS) as ObservationType[]).map((t) => (
                <option key={t} value={t}>{OBS_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Observation</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="Describe what you observed specifically — what happened, when, and what it suggested..."
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5 placeholder-slate-600 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setAdding(false)}
              className="text-xs text-slate-500 hover:text-slate-300 px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.content.trim()}
              className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded disabled:opacity-40 transition-colors"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-xs text-slate-600">Loading...</p>
      ) : observations.length === 0 ? (
        <p className="text-xs text-slate-600 italic">
          No observations recorded. These are distinct from general notes — specific named events that the council can weigh.
        </p>
      ) : (
        <div className="space-y-2">
          {observations.map((obs) => (
            <div
              key={obs.id}
              className="flex items-start gap-3 bg-slate-800/40 border border-slate-700/30 rounded-lg px-3 py-2.5 group"
            >
              <Eye className="w-3.5 h-3.5 mt-0.5 text-slate-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-slate-500 uppercase tracking-wide">{OBS_TYPE_LABELS[obs.observationType]}</span>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{obs.content}</p>
              </div>
              <button
                onClick={() => handleDelete(obs.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-all flex-shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
