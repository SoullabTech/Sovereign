'use client';

/**
 * DecisionCouncilView — Mobile decision detail for /maia iOS sheet
 *
 * Shows the full council result, MAIA Mentor panel, and allows:
 * - "Consult Council" (first run or continue)
 * - Mark Resolved / Reopen
 * - Go deeper with MAIA Mentor
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  RotateCcw,
  Loader2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import type { DecisionRecord } from '@/lib/studio/leadership/types';
import { getSituationConfig } from '@/lib/studio/leadership/situationTypes';
import MentorPanel from '@/components/studio/MentorPanel';

interface DecisionCouncilViewProps {
  decisionId: string;
  onBack: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DecisionCouncilView({ decisionId, onBack }: DecisionCouncilViewProps) {
  const [decision, setDecision] = useState<DecisionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [consulting, setConsulting] = useState(false);
  const [consultError, setConsultError] = useState<string | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [showContinueForm, setShowContinueForm] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadDecision();
  }, [decisionId]);

  // Auto-consult if draft with no council result yet
  useEffect(() => {
    if (decision && decision.status === 'draft' && !decision.councilResult && !consulting) {
      runCouncil();
    }
  }, [decision?.id]);

  async function loadDecision() {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/studio/decisions/${decisionId}`);
      if (res.ok) {
        const data = await res.json();
        setDecision(data.decision);
      }
    } finally {
      setLoading(false);
    }
  }

  async function runCouncil(notes?: string) {
    setConsulting(true);
    setConsultError(null);
    try {
      const body: Record<string, string> = {};
      if (notes?.trim()) body.sessionNotes = notes.trim();

      const res = await apiFetch(`/api/studio/decisions/${decisionId}/consult`, {
        method: 'POST',
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
      });

      if (res.ok) {
        await loadDecision();
        setShowContinueForm(false);
        setSessionNotes('');
      } else {
        const err = await res.json().catch(() => ({ error: 'Council consultation failed' }));
        setConsultError(err.error || 'Council consultation failed');
      }
    } catch {
      setConsultError('Network error — could not reach the council');
    } finally {
      setConsulting(false);
    }
  }

  async function updateStatus(status: 'complete' | 'active') {
    setUpdatingStatus(true);
    try {
      const res = await apiFetch(`/api/studio/decisions/${decisionId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        setDecision(data.decision);
      }
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!decision) {
    return (
      <div className="p-4 text-center py-12">
        <p className="text-stone-500 text-sm">Decision not found.</p>
      </div>
    );
  }

  const council = decision.councilResult;
  const situationConfig = getSituationConfig(decision.situationType);
  const isResolved = decision.status === 'complete';

  return (
    <div className="p-4 space-y-5 pb-8">
      {/* Decision context card */}
      <div className="rounded-xl bg-stone-800/30 border border-stone-700/30 p-4">
        <div className="flex items-start gap-2 mb-2">
          <Scale className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="text-stone-100 text-sm font-medium leading-snug">{decision.title}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-stone-500 text-xs">{situationConfig.label}</span>
              {decision.iterationCount > 1 && (
                <span className="text-xs text-amber-500/70">{decision.iterationCount} rounds</span>
              )}
              {isResolved && (
                <span className="flex items-center gap-1 text-xs text-emerald-400/80">
                  <CheckCircle2 className="w-3 h-3" /> Resolved
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="text-stone-400 text-xs leading-relaxed line-clamp-3">{decision.context}</p>
        {decision.stakes && (
          <p className="text-stone-500 text-xs mt-1">Stakes: {decision.stakes}</p>
        )}
        {decision.timePressure && decision.timePressure !== 'none' && (
          <span className={`inline-flex items-center gap-1 text-xs mt-1 px-1.5 py-0.5 rounded ${
            decision.timePressure === 'urgent' || decision.timePressure === 'high'
              ? 'text-red-300 bg-red-900/20'
              : 'text-amber-300 bg-amber-900/20'
          }`}>
            <AlertTriangle className="w-3 h-3" />
            {decision.timePressure} pressure
          </span>
        )}
      </div>

      {/* Council Result or Consulting State */}
      {consulting ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-10"
        >
          <RefreshCw className="w-7 h-7 text-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-stone-400 text-sm">The council is deliberating...</p>
          <p className="text-stone-600 text-xs mt-1">10–30 seconds</p>
        </motion.div>
      ) : council ? (
        <AnimatePresence>
          <motion.div
            key="council"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Emergence rating */}
            {council.emergenceRating && (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300 capitalize">{council.emergenceRating}</span>
                <span className="text-xs text-stone-500">
                  {council.framingsUsed?.length || 0} perspectives
                  {council.confidence !== undefined && ` · ${((council.confidence) * 100).toFixed(0)}% confidence`}
                </span>
              </div>
            )}

            {/* Recommendation — most important, first */}
            {council.recommendation && (
              <div className="rounded-xl bg-emerald-900/20 border border-emerald-700/30 p-4">
                <p className="text-xs text-emerald-400 uppercase tracking-wide mb-2">Recommendation</p>
                <p className="text-sm text-emerald-100/90 leading-relaxed">{council.recommendation}</p>
              </div>
            )}

            {/* Tensions */}
            {council.tensions?.length > 0 && (
              <div className="rounded-xl bg-amber-900/10 border border-amber-700/20 p-4">
                <p className="text-xs text-amber-400 uppercase tracking-wide mb-2">Tensions</p>
                <ul className="space-y-1.5">
                  {council.tensions.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-amber-200/70">
                      <span className="text-amber-500 mt-1 flex-shrink-0">–</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risks */}
            {council.risks?.length > 0 && (
              <div className="rounded-xl bg-red-900/10 border border-red-700/20 p-4">
                <p className="text-xs text-red-400 uppercase tracking-wide mb-2">Risks</p>
                <ul className="space-y-1.5">
                  {council.risks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-200/70">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Insights */}
            {council.insights?.length > 0 && (
              <div className="rounded-xl bg-stone-800/30 border border-stone-700/20 p-4">
                <p className="text-xs text-stone-400 uppercase tracking-wide mb-2">Insights</p>
                <ul className="space-y-1.5">
                  {council.insights.map((ins, i) => (
                    <li key={i} className="text-sm text-stone-300/80 flex items-start gap-2">
                      <span className="text-stone-600 mt-1 flex-shrink-0">·</span>
                      <span>{ins}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Council Voices — collapsible */}
            {council.rawResponses && Object.keys(council.rawResponses).length > 0 && (
              <CouncilVoices rawResponses={council.rawResponses} framingWeights={council.framingWeights} />
            )}
          </motion.div>
        </AnimatePresence>
      ) : (
        /* No council result yet — prompt first consultation */
        <div className="text-center py-8 space-y-3">
          <Scale className="w-10 h-10 text-amber-400/40 mx-auto" />
          <p className="text-stone-400 text-sm">Draft saved. Ready to consult the council?</p>
          {consultError && (
            <p className="text-red-400 text-xs">{consultError}</p>
          )}
          <button
            onClick={() => runCouncil()}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-xl mx-auto transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Consult Council
          </button>
        </div>
      )}

      {/* Consult error (when council has been run before) */}
      {consultError && council && (
        <div className="rounded-xl bg-red-900/10 border border-red-700/20 p-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300 flex-1">{consultError}</p>
          <button
            onClick={() => runCouncil()}
            className="text-red-400 hover:text-red-300 text-xs underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* MAIA Mentor — the "go deeper" section */}
      {council && (
        <div className="pt-2">
          <MentorPanel
            decisionId={decisionId}
            council={council}
            situationType={decision.situationType}
            timePressure={decision.timePressure}
            emotionalState={decision.emotionalState}
            mentorReflection={decision.mentorReflection}
            followUpIntention={decision.followUpIntention}
            onReflectionGenerated={(reflection) => {
              setDecision(prev => prev ? { ...prev, mentorReflection: reflection } : prev);
            }}
            onIntentionSaved={(intention) => {
              setDecision(prev => prev ? { ...prev, followUpIntention: intention } : prev);
            }}
          />
        </div>
      )}

      {/* Continue / Status Actions */}
      {council && !consulting && (
        <div className="space-y-3 pt-2 border-t border-stone-800/60">
          {/* Continue form */}
          {!isResolved && (
            <>
              {!showContinueForm ? (
                <button
                  onClick={() => setShowContinueForm(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Continue Decision
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <p className="text-stone-400 text-sm font-medium">What happened since last session?</p>
                  <textarea
                    value={sessionNotes}
                    onChange={e => setSessionNotes(e.target.value)}
                    placeholder="What landed? What didn't? What emerged?"
                    rows={3}
                    autoFocus
                    className="w-full px-3 py-2.5 rounded-lg bg-stone-800/60 border border-stone-700/50 text-stone-200 placeholder-stone-600 text-sm focus:outline-none focus:border-amber-500/50 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => runCouncil(sessionNotes)}
                      disabled={!sessionNotes.trim()}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-xl disabled:opacity-40 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      Consult Council
                    </button>
                    <button
                      onClick={() => { setShowContinueForm(false); setSessionNotes(''); }}
                      className="px-4 py-2.5 text-stone-400 hover:text-stone-200 text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </>
          )}

          {/* Mark resolved / reopen */}
          {decision.status === 'active' && (
            <button
              onClick={() => updateStatus('complete')}
              disabled={updatingStatus}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stone-800/40 hover:bg-stone-800/70 border border-stone-700/40 text-stone-300 text-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Mark Resolved
            </button>
          )}

          {isResolved && (
            <button
              onClick={() => updateStatus('active')}
              disabled={updatingStatus}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stone-800/40 hover:bg-stone-800/70 border border-stone-700/40 text-stone-400 text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reopen
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Council Voices (collapsible) ────────────────────────────────

const FRAMING_CONFIG: Record<string, { color: string; label: string }> = {
  'leadership-power':     { color: 'text-red-400',    label: 'Power Dynamics' },
  'governance-incentives':{ color: 'text-amber-400',  label: 'Governance' },
  'organizational-field': { color: 'text-emerald-400',label: 'Org Field' },
  'strategic-vision':     { color: 'text-purple-400', label: 'Strategic Vision' },
  'risk-reliability':     { color: 'text-orange-400', label: 'Risk' },
  'ethics':               { color: 'text-blue-400',   label: 'Ethics' },
  'systems-thinking':     { color: 'text-cyan-400',   label: 'Systems' },
  'first-principles':     { color: 'text-stone-300',  label: 'First Principles' },
  'user-experience':      { color: 'text-blue-300',   label: 'Human Experience' },
  'phenomenology':        { color: 'text-indigo-400', label: 'Phenomenology' },
  'jung-archetypal':      { color: 'text-violet-400', label: 'Archetypal' },
  'relationships':        { color: 'text-rose-400',   label: 'Relationships' },
  'grief':                { color: 'text-slate-400',  label: 'Grief' },
};

function getFramingConfig(id: string) {
  return FRAMING_CONFIG[id] ?? { color: 'text-stone-400', label: id.replace(/-/g, ' ') };
}

function CouncilVoices({
  rawResponses,
  framingWeights,
}: {
  rawResponses: Record<string, unknown>;
  framingWeights?: Record<string, number>;
}) {
  const [open, setOpen] = useState(false);
  const count = Object.keys(rawResponses).length;

  return (
    <div className="rounded-xl bg-stone-800/20 border border-stone-700/20 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-xs text-stone-400 uppercase tracking-wide">
          Council Voices ({count})
        </span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-stone-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-stone-500" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {Object.entries(rawResponses).map(([id, response]) => {
                const cfg = getFramingConfig(id);
                const weight = framingWeights?.[id];
                return (
                  <div key={id} className="rounded-lg bg-stone-800/40 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                      {weight !== undefined && (
                        <span className="text-[10px] text-stone-600">
                          {(weight * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-stone-300 leading-relaxed whitespace-pre-line">
                      {response as string}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
