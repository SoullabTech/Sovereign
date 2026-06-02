'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

export interface CareEvaluatorSheetProps {
  sessionId: string;
  userId: string;
  mode: 'care' | 'care+ifs' | 'mentor' | 'mentor+ifs';
  therapeuticFramework?: string;
  mentorStance: boolean;
  onSubmitted?: () => void;
}

const SCORE_FIELDS: Array<{ key: string; label: string }> = [
  { key: 'lens_fidelity', label: 'Lens fidelity' },
  { key: 'elemental_integrity', label: 'Elemental integrity' },
  { key: 'canon_alignment', label: 'Canon alignment' },
  { key: 'helpfulness', label: 'Helpfulness' },
  { key: 'clarity', label: 'Clarity' },
  { key: 'agency_preservation', label: 'Agency preservation' },
  { key: 'trust_again', label: 'Trust again' },
];

type Verdict = 'pass' | 'borderline' | 'fail';

const VERDICT_OPTIONS: Array<{ value: Verdict; label: string; color: string; selected: string }> = [
  {
    value: 'pass',
    label: 'Pass',
    color: 'border-white/20 text-white/50 hover:border-emerald-400/50 hover:text-emerald-300',
    selected: 'border-emerald-400 text-emerald-300 bg-emerald-400/10',
  },
  {
    value: 'borderline',
    label: 'Borderline',
    color: 'border-white/20 text-white/50 hover:border-amber-400/50 hover:text-amber-300',
    selected: 'border-amber-400 text-amber-300 bg-amber-400/10',
  },
  {
    value: 'fail',
    label: 'Fail',
    color: 'border-white/20 text-white/50 hover:border-red-400/50 hover:text-red-300',
    selected: 'border-red-400 text-red-300 bg-red-400/10',
  },
];

export function CareEvaluatorSheet({
  sessionId,
  userId,
  mode,
  therapeuticFramework,
  mentorStance,
  onSubmitted,
}: CareEvaluatorSheetProps) {
  // Gate: only render if localStorage flag is set
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(localStorage.getItem('maia.careEvaluator.enabled') === '1');
  }, []);

  const [scores, setScores] = useState<Record<string, number>>({});
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!enabled) return null;

  const filledScoreCount = Object.keys(scores).length;
  const canSubmit = filledScoreCount >= 3 && verdict !== null && !submitting;

  const handleScoreClick = (fieldKey: string, value: number) => {
    setScores(prev => ({ ...prev, [fieldKey]: value }));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);

    try {
      await apiFetch('/api/care/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          mode,
          therapeutic_framework: therapeuticFramework ?? null,
          mentor_stance: mentorStance,
          verdict,
          notes: notes.trim() || null,
          ...scores,
        }),
      });
      setSubmitted(true);
      setTimeout(() => {
        onSubmitted?.();
      }, 1200);
    } catch (err) {
      console.error('[CareEvaluatorSheet] Submit error:', err);
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 32 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-4 pointer-events-none"
      >
        <div
          className="w-full max-w-sm bg-black/80 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl pointer-events-auto"
        >
          {submitted ? (
            <div className="flex items-center justify-center py-4">
              <p className="text-white/70 text-sm">Evaluation recorded.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/50 text-xs font-mono uppercase tracking-wider">
                  Care evaluator — {mode}
                </p>
                <button
                  onClick={() => onSubmitted?.()}
                  className="text-white/30 hover:text-white/60 transition-colors"
                  aria-label="Close evaluator"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Score rows */}
              <div className="space-y-2 mb-4">
                {SCORE_FIELDS.map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between gap-2">
                    <span className="text-white/60 text-xs w-36 shrink-0">{label}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          onClick={() => handleScoreClick(key, n)}
                          className={[
                            'w-6 h-6 rounded-full border transition-all text-xs font-medium',
                            scores[key] === n
                              ? 'border-violet-400 bg-violet-400/20 text-violet-200'
                              : 'border-white/15 text-white/30 hover:border-white/40 hover:text-white/60',
                          ].join(' ')}
                          aria-label={`${label} score ${n}`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Verdict */}
              <div className="flex gap-2 mb-3">
                {VERDICT_OPTIONS.map(({ value, label, color, selected }) => (
                  <button
                    key={value}
                    onClick={() => setVerdict(value)}
                    className={[
                      'flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all',
                      verdict === value ? selected : color,
                    ].join(' ')}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Notes */}
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value.slice(0, 500))}
                placeholder="Notes (optional)"
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/70
                           text-xs resize-none placeholder-white/20 focus:outline-none
                           focus:border-white/25 transition-colors mb-3"
              />

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full py-2 rounded-xl border text-xs font-medium transition-all
                           disabled:opacity-30 disabled:cursor-not-allowed
                           border-white/20 text-white/70
                           enabled:hover:border-violet-400/50 enabled:hover:text-violet-200
                           enabled:hover:bg-violet-400/5"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  `Submit (${filledScoreCount}/7 scored)`
                )}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
