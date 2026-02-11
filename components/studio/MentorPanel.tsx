'use client';

/**
 * MAIA Mentor Panel — Inline Decision Reflection
 *
 * Template reflections (always visible, instant) + optional AI depth.
 * Templates are good enough standalone. AI is for precision.
 *
 * Sovereignty footer: "Take only what serves."
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Save, Check, Leaf } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { getMentorTemplateForDecision } from '@/lib/studio/leadership/mentorTemplates';
import type { ConsultationResult } from '@/lib/ain/types';
import type { MentorReflection, TimePressure } from '@/lib/studio/leadership/types';

interface MentorPanelProps {
  decisionId: string;
  council: ConsultationResult | null;
  situationType: string | null;
  timePressure: TimePressure | null;
  emotionalState: string | null;
  mentorReflection: MentorReflection | null;
  followUpIntention: string | null;
  onReflectionGenerated: (reflection: MentorReflection) => void;
  onIntentionSaved: (intention: string) => void;
}

const POSTURE_LABELS: Record<string, string> = {
  stuck: 'Stuck',
  polarized: 'Polarized',
  high_stakes: 'High Stakes',
  avoidant: 'Avoidant',
  overresponsible: 'Overresponsible',
  clear_but_afraid: 'Clear but Afraid',
  emerging: 'Emerging',
};

export default function MentorPanel({
  decisionId,
  council,
  situationType,
  timePressure,
  emotionalState,
  mentorReflection,
  followUpIntention,
  onReflectionGenerated,
  onIntentionSaved,
}: MentorPanelProps) {
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [intention, setIntention] = useState(followUpIntention || '');
  const [savingIntention, setSavingIntention] = useState(false);
  const [intentionSaved, setIntentionSaved] = useState(false);

  if (!council) return null;

  const { template, posture } = getMentorTemplateForDecision(council, {
    situationType,
    timePressure,
    emotionalState,
  });

  async function generateReflection() {
    setGenerating(true);
    setGenError(null);
    try {
      const res = await apiFetch(`/api/studio/decisions/${decisionId}/mentor`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        onReflectionGenerated(data.mentorReflection);
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed' }));
        setGenError(err.error || 'Mentor reflection failed');
      }
    } catch {
      setGenError('Could not reach MAIA');
    } finally {
      setGenerating(false);
    }
  }

  async function saveIntention() {
    if (!intention.trim()) return;
    setSavingIntention(true);
    try {
      await apiFetch(`/api/studio/decisions/${decisionId}`, {
        method: 'PUT',
        body: JSON.stringify({ followUpIntention: intention.trim() }),
      });
      onIntentionSaved(intention.trim());
      setIntentionSaved(true);
      setTimeout(() => setIntentionSaved(false), 2000);
    } finally {
      setSavingIntention(false);
    }
  }

  return (
    <div className="rounded-xl border border-maia-ink-40/30 bg-gradient-to-br from-maia-navy-850/40 via-maia-navy-900/30 to-maia-navy-850/40 overflow-hidden">
      {/* Sage accent bar */}
      <div className="h-1 bg-gradient-to-r from-maia-sage-600 via-maia-sage-400 to-maia-sage-600" />

      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="relative w-7 h-7">
            <div className="absolute inset-0 bg-maia-sage-500/20 rounded-full" />
            <div className="absolute top-1 left-1 bottom-1 right-1 bg-maia-sage-500/40 rounded-full" />
            <div className="absolute top-1.5 left-1.5 bottom-1.5 right-1.5 bg-maia-sage-400 rounded-full" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-maia-sage-400 tracking-wide">MAIA Mentor</h3>
            <p className="text-xs text-maia-ink-60">
              Posture detected: <span className="text-maia-ink-80 capitalize">{POSTURE_LABELS[posture] || posture}</span>
            </p>
          </div>
        </div>

        {/* Template Reflections (always visible) */}
        <div className="space-y-3">
          <p className="text-xs text-maia-ink-60 uppercase tracking-wider">Reflections</p>
          {template.reflections.map((reflection, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 bg-maia-sage-600/60 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-maia-ink-80 font-light leading-relaxed">{reflection}</p>
            </div>
          ))}
        </div>

        {/* Micro-practice */}
        <div className="bg-maia-navy-800/30 border border-maia-ink-40/20 rounded-lg p-3">
          <p className="text-xs text-maia-spice-500 uppercase tracking-wider mb-1.5">Micro-Practice</p>
          <p className="text-sm text-maia-ink-80 font-light leading-relaxed">{template.microPractice}</p>
        </div>

        {/* Sovereignty Check */}
        <div className="bg-maia-navy-800/30 border border-maia-ink-40/20 rounded-lg p-3">
          <p className="text-xs text-amber-400 uppercase tracking-wider mb-1.5">Sovereignty Check</p>
          <p className="text-sm text-maia-ink-80 font-light leading-relaxed italic">{template.sovereigntyCheck}</p>
        </div>

        {/* Follow-up Intention */}
        <div>
          <label className="block text-xs text-maia-ink-60 uppercase tracking-wider mb-1.5">
            Follow-up Intention
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={intention}
              onChange={e => setIntention(e.target.value)}
              placeholder="What's the next checkpoint? What will you look for?"
              className="flex-1 px-3 py-1.5 text-sm bg-maia-navy-850/60 border border-maia-ink-40/20 rounded-lg text-maia-ink-80 placeholder-maia-ink-40 focus:border-maia-sage-500/50 focus:outline-none"
            />
            <button
              onClick={saveIntention}
              disabled={savingIntention || !intention.trim()}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors disabled:opacity-40 ${
                intentionSaved
                  ? 'bg-emerald-800/40 text-emerald-300 border border-emerald-700/40'
                  : 'bg-maia-navy-800/20 text-maia-ink-80 border border-maia-ink-40/20 hover:border-maia-sage-500/40'
              }`}
            >
              {intentionSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-maia-ink-40/30 to-transparent" />
        </div>

        {/* AI Reflection (opt-in) */}
        {mentorReflection ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-maia-sage-400" />
              <p className="text-xs text-maia-sage-400 uppercase tracking-wider">Deeper Reflection</p>
            </div>

            {/* AI Questions */}
            <div className="space-y-2">
              {mentorReflection.questions.map((q, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-maia-sage-400 text-xs mt-0.5">{i + 1}.</span>
                  <p className="text-sm text-maia-ink-80 font-light leading-relaxed">{q}</p>
                </div>
              ))}
            </div>

            {/* AI Sovereignty Check */}
            <div className="bg-maia-navy-800/30 border border-maia-sage-500/20 rounded-lg p-3">
              <p className="text-xs text-amber-400 uppercase tracking-wider mb-1">Agency Check</p>
              <p className="text-sm text-maia-ink-80 font-light italic">{mentorReflection.sovereigntyCheck}</p>
            </div>

            {/* AI Next Experiment */}
            <div className="bg-maia-navy-800/30 border border-maia-sage-500/20 rounded-lg p-3">
              <p className="text-xs text-maia-spice-500 uppercase tracking-wider mb-1">Next Experiment</p>
              <p className="text-sm text-maia-ink-80 font-light">{mentorReflection.nextExperiment}</p>
            </div>

            {/* Regenerate */}
            <button
              onClick={generateReflection}
              disabled={generating}
              className="text-xs text-maia-ink-60 hover:text-maia-ink-80 transition-colors flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${generating ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          </motion.div>
        ) : (
          <div>
            <button
              onClick={generateReflection}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-maia-navy-800/20 hover:bg-maia-navy-800/30 border border-maia-ink-40/20 hover:border-maia-sage-500/40 text-maia-ink-80 text-sm font-light rounded-lg transition-all disabled:opacity-50"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  MAIA is reflecting...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-maia-sage-400" />
                  Go deeper with MAIA
                </>
              )}
            </button>
            {genError && (
              <p className="text-xs text-red-400 mt-1.5">{genError}</p>
            )}
          </div>
        )}

        {/* Footer */}
        <p className="text-xs text-maia-ink-40 text-center font-light">
          Sovereignty first. Take only what serves.
        </p>
      </div>
    </div>
  );
}
