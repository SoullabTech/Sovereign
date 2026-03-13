'use client';

/**
 * Change Experiment Panel
 *
 * Intervention hypothesis and practice design for a Change record.
 * This is the practitioner-side engineering layer:
 *   - What are we testing?
 *   - With what modality?
 *   - What would success look like?
 *   - What is the risk?
 *   - How long before reviewing?
 *
 * Optionally loads from a built-in intervention template.
 */

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import type { ChangeExperiment, InterventionModality } from '@/lib/studio/practitioner/types';
import { Plus, X, FlaskConical, Check, AlertTriangle, Eye, Calendar } from 'lucide-react';

const MODALITY_LABELS: Record<InterventionModality, string> = {
  hypnosis:      'Hypnosis',
  nlp:           'NLP',
  somatic:       'Somatic',
  relational:    'Relational experiment',
  journaling:    'Journaling',
  maia_practice: 'MAIA practice',
  mixed:         'Mixed',
  other:         'Other',
};

const MODALITY_COLORS: Record<InterventionModality, string> = {
  hypnosis:      'text-violet-400',
  nlp:           'text-blue-400',
  somatic:       'text-orange-400',
  relational:    'text-rose-400',
  journaling:    'text-amber-400',
  maia_practice: 'text-cyan-400',
  mixed:         'text-slate-300',
  other:         'text-slate-400',
};

interface Props {
  changeId: string;
}

const EMPTY_FORM = {
  title: '',
  hypothesis: '',
  interventionType: 'somatic' as InterventionModality,
  instructions: '',
  observationWindow: '',
  successSignals: [''],
  riskNotes: '',
  followUpIntention: '',
};

export default function ChangeExperimentPanel({ changeId }: Props) {
  const [experiments, setExperiments] = useState<ChangeExperiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    loadExperiments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeId]);

  async function loadExperiments() {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/studio/changes/${changeId}/experiments`);
      setExperiments(data.experiments || []);
      if (data.experiments?.length > 0) setExpanded(data.experiments[0].id);
    } catch { /* graceful */ }
    finally { setLoading(false); }
  }

  async function handleSave() {
    if (!form.title.trim() || !form.hypothesis.trim() || !form.instructions.trim() || !form.observationWindow.trim()) return;
    setSaving(true);
    try {
      const data = await apiFetch(`/api/studio/changes/${changeId}/experiments`, {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          successSignals: form.successSignals.filter((s) => s.trim()),
          riskNotes: form.riskNotes.trim() || null,
          followUpIntention: form.followUpIntention.trim() || null,
        }),
      });
      setExperiments((prev) => [data.experiment, ...prev]);
      setForm(EMPTY_FORM);
      setAdding(false);
      setExpanded(data.experiment.id);
    } catch { /* keep open */ }
    finally { setSaving(false); }
  }

  async function handleStatusChange(id: string, status: ChangeExperiment['status']) {
    try {
      await apiFetch(`/api/studio/changes/${changeId}/experiments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setExperiments((prev) => prev.map((e) => e.id === id ? { ...e, status } : e));
    } catch { /* silent */ }
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/api/studio/changes/${changeId}/experiments/${id}`, { method: 'DELETE' });
      setExperiments((prev) => prev.filter((e) => e.id !== id));
    } catch { /* silent */ }
  }

  function addSignalRow() {
    setForm((f) => ({ ...f, successSignals: [...f.successSignals, ''] }));
  }

  function updateSignal(i: number, val: string) {
    setForm((f) => {
      const ss = [...f.successSignals];
      ss[i] = val;
      return { ...f, successSignals: ss };
    });
  }

  const statusColors: Record<ChangeExperiment['status'], string> = {
    draft:     'text-slate-400',
    active:    'text-amber-400',
    completed: 'text-emerald-400',
    abandoned: 'text-red-400/60',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-slate-200">Intervention Design</h3>
          <p className="text-xs text-slate-500 mt-0.5">What we are testing next, with what modality, and how we will know</p>
        </div>
        <button
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New experiment
        </button>
      </div>

      {adding && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Somatic anchor for conversational urgency"
                className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5 placeholder-slate-600"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Modality</label>
              <select
                value={form.interventionType}
                onChange={(e) => setForm((f) => ({ ...f, interventionType: e.target.value as InterventionModality }))}
                className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5"
              >
                {(Object.keys(MODALITY_LABELS) as InterventionModality[]).map((m) => (
                  <option key={m} value={m}>{MODALITY_LABELS[m]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Observation window</label>
              <input
                value={form.observationWindow}
                onChange={(e) => setForm((f) => ({ ...f, observationWindow: e.target.value }))}
                placeholder="e.g. Next 2 sessions"
                className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5 placeholder-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Hypothesis</label>
            <textarea
              value={form.hypothesis}
              onChange={(e) => setForm((f) => ({ ...f, hypothesis: e.target.value }))}
              placeholder="What we believe is happening and what we are testing..."
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5 placeholder-slate-600 resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Instructions</label>
            <textarea
              value={form.instructions}
              onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
              placeholder="Step-by-step practice or protocol instructions..."
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5 placeholder-slate-600 resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-400">Success signals</label>
              <button onClick={addSignalRow} className="text-xs text-slate-500 hover:text-slate-300">+ add</button>
            </div>
            {form.successSignals.map((sig, i) => (
              <input
                key={i}
                value={sig}
                onChange={(e) => updateSignal(i, e.target.value)}
                placeholder="Observable marker that this is working..."
                className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5 placeholder-slate-600 mb-1.5"
              />
            ))}
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Risk / caution</label>
            <input
              value={form.riskNotes}
              onChange={(e) => setForm((f) => ({ ...f, riskNotes: e.target.value }))}
              placeholder="What to watch for, contraindications..."
              className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5 placeholder-slate-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-700/50">
            <button onClick={() => setAdding(false)} className="text-xs text-slate-500 hover:text-slate-300 px-3 py-1.5">Cancel</button>
            <button
              onClick={handleSave}
              disabled={saving || !form.title.trim() || !form.hypothesis.trim() || !form.instructions.trim() || !form.observationWindow.trim()}
              className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded disabled:opacity-40 transition-colors flex items-center gap-1.5"
            >
              <FlaskConical className="w-3 h-3" />
              {saving ? 'Saving...' : 'Save experiment'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-xs text-slate-600">Loading...</p>
      ) : experiments.length === 0 ? (
        <p className="text-xs text-slate-600 italic">
          No intervention design recorded. Use this to plan the next experiment from the council synthesis.
        </p>
      ) : (
        <div className="space-y-2">
          {experiments.map((exp) => (
            <div key={exp.id} className="bg-slate-800/40 border border-slate-700/30 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpanded((v) => v === exp.id ? null : exp.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left"
              >
                <div className="flex items-center gap-2">
                  <FlaskConical className={`w-3.5 h-3.5 flex-shrink-0 ${MODALITY_COLORS[exp.interventionType]}`} />
                  <span className="text-xs font-medium text-slate-300">{exp.title}</span>
                  <span className={`text-xs ${statusColors[exp.status]} capitalize`}>{exp.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">{MODALITY_LABELS[exp.interventionType]}</span>
                </div>
              </button>

              {expanded === exp.id && (
                <div className="px-3 pb-4 border-t border-slate-700/30 space-y-3 pt-3">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Hypothesis</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{exp.hypothesis}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Instructions</p>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{exp.instructions}</p>
                  </div>
                  {exp.successSignals.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" /> Success signals
                      </p>
                      <ul className="space-y-0.5">
                        {exp.successSignals.map((s, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                            <span className="text-emerald-400/60 mt-0.5">–</span>{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {exp.riskNotes && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" /> Risk / caution
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed">{exp.riskNotes}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    <span>Observation window: {exp.observationWindow}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/30">
                    <div className="flex items-center gap-2">
                      {(['draft', 'active', 'completed', 'abandoned'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(exp.id, s)}
                          className={`text-xs px-2 py-1 rounded capitalize transition-colors ${
                            exp.status === s
                              ? `${statusColors[s]} bg-slate-700`
                              : 'text-slate-600 hover:text-slate-300'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="text-slate-600 hover:text-rose-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
