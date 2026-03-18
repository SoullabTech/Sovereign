'use client';

/**
 * Field Signals Panel
 *
 * Displays and captures discrete field signals — somatic, relational, behavioral,
 * emotional, symbolic, cognitive — between sessions.
 *
 * Used on both Decision and Change detail pages.
 * Signals feed into the council evidence bundle when "Run Council" is triggered.
 */

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import type { FieldSignal, FieldSignalType, FieldSignalSource } from '@/lib/studio/practitioner/types';
import { Plus, X, Zap, Heart, Users, Brain, Star, Activity } from 'lucide-react';

const SIGNAL_TYPE_CONFIG: Record<FieldSignalType, { label: string; icon: typeof Zap; color: string }> = {
  somatic:    { label: 'Somatic',    icon: Activity, color: 'text-orange-400' },
  relational: { label: 'Relational', icon: Users,    color: 'text-blue-400' },
  behavioral: { label: 'Behavioral', icon: Zap,      color: 'text-yellow-400' },
  emotional:  { label: 'Emotional',  icon: Heart,    color: 'text-rose-400' },
  symbolic:   { label: 'Symbolic',   icon: Star,     color: 'text-violet-400' },
  cognitive:  { label: 'Cognitive',  icon: Brain,    color: 'text-cyan-400' },
};

const SOURCE_LABELS: Record<FieldSignalSource, string> = {
  client:       'Client',
  practitioner: 'Practitioner',
  maia:         'MAIA',
};

interface Props {
  decisionId?: string;
  changeId?: string;
  clientId?: string | null;
}

export default function FieldSignalsPanel({ decisionId, changeId, clientId }: Props) {
  const [signals, setSignals] = useState<FieldSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    source: 'practitioner' as FieldSignalSource,
    type: 'somatic' as FieldSignalType,
    title: '',
    content: '',
    intensity: '',
  });

  useEffect(() => {
    loadSignals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decisionId, changeId]);

  async function loadSignals() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (decisionId) params.set('decisionId', decisionId);
      if (changeId)   params.set('changeId', changeId);
      const res = await apiFetch(`/api/studio/field-signals?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSignals(data.signals || []);
      }
    } catch {
      // Graceful degradation — signals panel is non-blocking
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      const res = await apiFetch('/api/studio/field-signals', {
        method: 'POST',
        body: JSON.stringify({
          decisionId: decisionId || null,
          changeId: changeId || null,
          clientId: clientId || null,
          source: form.source,
          type: form.type,
          title: form.title.trim(),
          content: form.content.trim(),
          intensity: form.intensity ? parseFloat(form.intensity) / 10 : null,
          tags: [],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSignals((prev) => [data.signal, ...prev]);
        setForm({ source: 'practitioner', type: 'somatic', title: '', content: '', intensity: '' });
        setAdding(false);
      }
    } catch {
      // keep form open on error
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(signalId: string) {
    try {
      await apiFetch(`/api/studio/field-signals/${signalId}`, { method: 'DELETE' });
      setSignals((prev) => prev.filter((s) => s.id !== signalId));
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-slate-200">Field Signals</h3>
          <p className="text-xs text-slate-500 mt-0.5">Somatic, relational, and behavioral observations between sessions</p>
        </div>
        <button
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add signal
        </button>
      </div>

      {adding && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Source</label>
              <select
                value={form.source}
                onChange={(e) => setForm((f) => ({ ...f, source: e.target.value as FieldSignalSource }))}
                className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5"
              >
                {(Object.keys(SOURCE_LABELS) as FieldSignalSource[]).map((s) => (
                  <option key={s} value={s}>{SOURCE_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as FieldSignalType }))}
                className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5"
              >
                {(Object.keys(SIGNAL_TYPE_CONFIG) as FieldSignalType[]).map((t) => (
                  <option key={t} value={t}>{SIGNAL_TYPE_CONFIG[t].label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Title <span className="text-slate-600">(brief label)</span></label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. chest tightening before speaking"
              className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5 placeholder-slate-600"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Detail</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="Describe the signal with as much sensory specificity as possible..."
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5 placeholder-slate-600 resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">Intensity</label>
              <input
                type="number"
                min="0"
                max="10"
                value={form.intensity}
                onChange={(e) => setForm((f) => ({ ...f, intensity: e.target.value }))}
                placeholder="0–10"
                className="w-16 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAdding(false)}
                className="text-xs text-slate-500 hover:text-slate-300 px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim() || !form.content.trim()}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded disabled:opacity-40 transition-colors"
              >
                {saving ? 'Saving...' : 'Save signal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-xs text-slate-600">Loading signals...</p>
      ) : signals.length === 0 ? (
        <p className="text-xs text-slate-600 italic">
          No field signals recorded. Signals captured here feed into the council evidence bundle.
        </p>
      ) : (
        <div className="space-y-2">
          {signals.map((sig) => {
            const cfg = SIGNAL_TYPE_CONFIG[sig.type];
            const Icon = cfg.icon;
            return (
              <div
                key={sig.id}
                className="flex items-start gap-3 bg-slate-800/40 border border-slate-700/30 rounded-lg px-3 py-2.5 group"
              >
                <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-slate-300">{sig.title}</span>
                    <span className="text-xs text-slate-600">{SOURCE_LABELS[sig.source]}</span>
                    {sig.intensity != null && (
                      <span className="text-xs text-slate-600">{Math.round(sig.intensity * 10)}/10</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{sig.content}</p>
                </div>
                <button
                  onClick={() => handleDelete(sig.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-all flex-shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
