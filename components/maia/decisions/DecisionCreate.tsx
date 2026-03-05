'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Save, User, Users, Building, Crown, Eye, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import {
  SITUATION_TYPE_LIST,
  SITUATION_CONFIGS,
  type SituationType,
} from '@/lib/studio/leadership/situationTypes';

interface DecisionCreateProps {
  onCreated: (decisionId: string) => void;
  onBack: () => void;
}

const SITUATION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  User, Users, Building, Crown, Eye,
};

const TIME_PRESSURES = [
  { value: 'none',   label: 'None' },
  { value: 'low',    label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high',   label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export default function DecisionCreate({ onCreated, onBack }: DecisionCreateProps) {
  const [situationType, setSituationType] = useState<SituationType>('individual');
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [stakes, setStakes] = useState('');
  const [timePressure, setTimePressure] = useState('none');
  const [emotionalState, setEmotionalState] = useState('');
  const [saving, setSaving] = useState(false);
  const [consulting, setConsulting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = SITUATION_CONFIGS[situationType];
  const isValid = title.trim() && context.trim();

  async function handleSave(andConsult: boolean) {
    if (!isValid) return;
    setError(null);

    if (andConsult) setConsulting(true);
    else setSaving(true);

    try {
      const createRes = await apiFetch('/api/studio/decisions', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          context: context.trim(),
          stakes: stakes.trim() || null,
          timePressure,
          emotionalState: emotionalState.trim() || null,
          situationType,
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({ error: 'Failed to create' }));
        setError(err.error || 'Could not create decision');
        return;
      }

      const { decision } = await createRes.json();

      if (andConsult) {
        // Kick off council — don't await, navigate immediately
        apiFetch(`/api/studio/decisions/${decision.id}/consult`, { method: 'POST' });
      }

      onCreated(decision.id);
    } catch {
      setError('Network error — could not save decision');
    } finally {
      setSaving(false);
      setConsulting(false);
    }
  }

  const isBusy = saving || consulting;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="p-4 space-y-5"
    >
      {/* Situation Type */}
      <div>
        <p className="text-stone-400 text-xs font-medium uppercase tracking-wide mb-2">
          What kind of situation?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {SITUATION_TYPE_LIST.map(type => {
            const cfg = SITUATION_CONFIGS[type];
            const Icon = SITUATION_ICONS[cfg.icon] || User;
            const selected = situationType === type;
            return (
              <button
                key={type}
                onClick={() => setSituationType(type)}
                className={`flex flex-col items-start gap-0.5 p-2.5 rounded-lg border text-left transition-colors ${
                  selected
                    ? 'border-amber-500/50 bg-amber-900/20 text-amber-100'
                    : 'border-stone-700/50 bg-stone-800/30 text-stone-400 hover:border-stone-600'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${selected ? 'text-amber-400' : 'text-stone-500'}`} />
                  <span className="text-xs font-medium">{cfg.label}</span>
                </div>
                <span className="text-[10px] text-stone-500 leading-tight">{cfg.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-stone-400 text-xs font-medium uppercase tracking-wide mb-1.5">
          Decision
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What is the decision?"
          className="w-full px-3 py-2.5 rounded-lg bg-stone-800/60 border border-stone-700/50 text-stone-200 placeholder-stone-600 text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
          autoFocus
        />
      </div>

      {/* Context */}
      <div>
        <label className="block text-stone-400 text-xs font-medium uppercase tracking-wide mb-1.5">
          Context
        </label>
        <textarea
          value={context}
          onChange={e => setContext(e.target.value)}
          placeholder="Describe the situation and background..."
          rows={4}
          className="w-full px-3 py-2.5 rounded-lg bg-stone-800/60 border border-stone-700/50 text-stone-200 placeholder-stone-600 text-sm focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
        />
      </div>

      {/* Stakes */}
      <div>
        <label className="block text-stone-400 text-xs font-medium uppercase tracking-wide mb-1.5">
          What&apos;s at stake? <span className="text-stone-600 normal-case font-normal">(optional)</span>
        </label>
        <textarea
          value={stakes}
          onChange={e => setStakes(e.target.value)}
          placeholder={config.contextLabels.stakesPlaceholder}
          rows={2}
          className="w-full px-3 py-2.5 rounded-lg bg-stone-800/60 border border-stone-700/50 text-stone-200 placeholder-stone-600 text-sm focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
        />
      </div>

      {/* Time Pressure + Emotional State */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-stone-400 text-xs font-medium uppercase tracking-wide mb-1.5">
            Time pressure
          </label>
          <select
            value={timePressure}
            onChange={e => setTimePressure(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-stone-800/60 border border-stone-700/50 rounded-lg text-stone-200 focus:border-amber-500/50 focus:outline-none"
          >
            {TIME_PRESSURES.map(tp => (
              <option key={tp.value} value={tp.value}>{tp.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-stone-400 text-xs font-medium uppercase tracking-wide mb-1.5">
            {config.contextLabels.stateLabel}
          </label>
          <input
            type="text"
            value={emotionalState}
            onChange={e => setEmotionalState(e.target.value)}
            placeholder="Optional..."
            className="w-full px-3 py-2 text-sm bg-stone-800/60 border border-stone-700/50 rounded-lg text-stone-200 placeholder-stone-600 focus:border-amber-500/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-2">
        <button
          onClick={() => handleSave(true)}
          disabled={!isValid || isBusy}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {consulting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Consulting Council...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Consult Council</>
          )}
        </button>

        <button
          onClick={() => handleSave(false)}
          disabled={!isValid || isBusy}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stone-800/40 hover:bg-stone-800/70 border border-stone-700/40 text-stone-300 text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4" /> Save Draft</>
          )}
        </button>
      </div>
    </motion.div>
  );
}
