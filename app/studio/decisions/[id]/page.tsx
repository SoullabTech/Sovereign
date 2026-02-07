'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Scale,
  Sparkles,
  AlertTriangle,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Star,
  Save,
  RefreshCw,
  Plus,
  X,
  Copy,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import type { DecisionRecord } from '@/lib/studio/leadership/types';

const ELEMENT_CONFIG: Record<string, { icon: typeof Flame; color: string; label: string }> = {
  'leadership-power': { icon: Flame, color: 'text-red-400', label: 'Power Dynamics' },
  'governance-incentives': { icon: Scale, color: 'text-amber-400', label: 'Governance & Incentives' },
  'organizational-field': { icon: Mountain, color: 'text-emerald-400', label: 'Organizational Field' },
  'strategic-vision': { icon: Star, color: 'text-purple-400', label: 'Strategic Vision' },
  'risk-reliability': { icon: AlertTriangle, color: 'text-orange-400', label: 'Risk & Reliability' },
  'ethics': { icon: Scale, color: 'text-blue-400', label: 'Ethics' },
  'systems-thinking': { icon: Wind, color: 'text-cyan-400', label: 'Systems Thinking' },
  'first-principles': { icon: Mountain, color: 'text-slate-300', label: 'First Principles' },
  'user-experience': { icon: Droplets, color: 'text-blue-300', label: 'Human Experience' },
  'phenomenology': { icon: Star, color: 'text-indigo-400', label: 'Phenomenology' },
  'jung-archetypal': { icon: Star, color: 'text-violet-400', label: 'Archetypal' },
};

function getFramingConfig(id: string) {
  return ELEMENT_CONFIG[id] || { icon: Sparkles, color: 'text-slate-400', label: id.replace(/-/g, ' ') };
}

export default function DecisionDetailPage() {
  const params = useParams();
  const [decision, setDecision] = useState<DecisionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [consulting, setConsulting] = useState(false);
  const [consultError, setConsultError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const councilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDecision();
  }, [params.id]);

  async function loadDecision() {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/studio/decisions/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setDecision(data.decision);
        setNotes(data.decision.consultantNotes || '');
        setQuestions(data.decision.questionsForLeader || []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function runCouncil() {
    setConsulting(true);
    setConsultError(null);
    try {
      const res = await apiFetch(`/api/studio/decisions/${params.id}/consult`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDecision(data.decision);
        setTimeout(() => councilRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
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

  async function saveNotes() {
    setSaving(true);
    try {
      await apiFetch(`/api/studio/decisions/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify({ consultantNotes: notes, questionsForLeader: questions }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  function copyQuestions() {
    if (questions.length === 0) return;
    const text = questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function addQuestion() {
    if (newQuestion.trim()) {
      setQuestions(prev => [...prev, newQuestion.trim()]);
      setNewQuestion('');
    }
  }

  function removeQuestion(idx: number) {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!decision) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-500">Decision not found</div>
      </div>
    );
  }

  const council = decision.councilResult;

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/studio/decisions" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-light text-white">{decision.title}</h1>
            {decision.clientName && (
              <p className="text-sm text-slate-400 mt-0.5">{decision.clientName}</p>
            )}
          </div>
          {decision.status !== 'complete' && (
            <button
              onClick={runCouncil}
              disabled={consulting}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
            >
              {consulting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {consulting ? 'Consulting...' : 'Consult Council'}
            </button>
          )}
        </div>

        {/* Context */}
        <div className="rounded-lg border border-slate-800/60 bg-slate-900/30 p-4 mb-6">
          <p className="text-sm text-slate-300">{decision.context}</p>
          <div className="flex flex-wrap gap-3 mt-3">
            {decision.stakes && (
              <span className="text-xs text-slate-400">
                <span className="text-slate-500">Stakes:</span> {decision.stakes}
              </span>
            )}
            {decision.timePressure && decision.timePressure !== 'none' && (
              <span className={`text-xs px-2 py-0.5 rounded ${
                decision.timePressure === 'urgent' || decision.timePressure === 'high'
                  ? 'text-red-300 bg-red-900/30'
                  : 'text-amber-300 bg-amber-900/30'
              }`}>
                {decision.timePressure} pressure
              </span>
            )}
            {decision.emotionalState && (
              <span className="text-xs text-slate-400">
                <span className="text-slate-500">Leader state:</span> {decision.emotionalState}
              </span>
            )}
          </div>
        </div>

        {/* Council Error */}
        {consultError && (
          <div className="rounded-lg border border-red-900/30 bg-red-950/10 p-3 mb-6 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-300">{consultError}</p>
              <button
                onClick={runCouncil}
                disabled={consulting}
                className="text-xs text-red-400 hover:text-red-300 mt-1 underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Council Result */}
        {council ? (
          <div ref={councilRef} className="space-y-6">
            {/* Emergence Rating */}
            {council.emergenceRating && (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300 capitalize">{council.emergenceRating}</span>
                <span className="text-xs text-slate-500">
                  ({council.framingsUsed?.length || 0} perspectives, {((council.confidence || 0) * 100).toFixed(0)}% confidence)
                </span>
              </div>
            )}

            {/* Framing Responses */}
            {council.rawResponses && (
              <div className="space-y-4">
                <h2 className="text-sm font-medium text-slate-300 uppercase tracking-wider">Council Voices</h2>
                {Object.entries(council.rawResponses).map(([framingId, response], i) => {
                  const config = getFramingConfig(framingId);
                  const Icon = config.icon;
                  const weight = council.framingWeights?.[framingId];
                  return (
                    <motion.div
                      key={framingId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="rounded-lg border border-slate-800/40 bg-slate-900/20 p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-4 h-4 ${config.color}`} />
                        <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                        {weight !== undefined && (
                          <span className="text-xs text-slate-500 ml-auto">
                            weight: {(weight * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                        {response as string}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Tensions */}
            {council.tensions?.length > 0 && (
              <div className="rounded-lg border border-amber-900/30 bg-amber-950/10 p-4">
                <h3 className="text-sm font-medium text-amber-300 mb-2">Tensions</h3>
                <ul className="space-y-1.5">
                  {council.tensions.map((t, i) => (
                    <li key={i} className="text-sm text-amber-200/70 flex items-start gap-2">
                      <span className="text-amber-500 mt-1">-</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risks */}
            {council.risks?.length > 0 && (
              <div className="rounded-lg border border-red-900/30 bg-red-950/10 p-4">
                <h3 className="text-sm font-medium text-red-300 mb-2">Risks</h3>
                <ul className="space-y-1.5">
                  {council.risks.map((r, i) => (
                    <li key={i} className="text-sm text-red-200/70 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Insights */}
            {council.insights?.length > 0 && (
              <div className="rounded-lg border border-slate-800/40 bg-slate-900/20 p-4">
                <h3 className="text-sm font-medium text-slate-300 mb-2">Insights</h3>
                <ul className="space-y-1.5">
                  {council.insights.map((ins, i) => (
                    <li key={i} className="text-sm text-slate-300/80">{ins}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendation */}
            {council.recommendation && (
              <div className="rounded-lg border border-emerald-900/30 bg-emerald-950/10 p-4">
                <h3 className="text-sm font-medium text-emerald-300 mb-2">Recommendation</h3>
                <p className="text-sm text-emerald-200/70">{council.recommendation}</p>
              </div>
            )}
          </div>
        ) : consulting ? (
          <div className="text-center py-16">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">The council is deliberating...</p>
            <p className="text-xs text-slate-500 mt-1">This may take 10-30 seconds</p>
          </div>
        ) : null}

        {/* Consultant Notes & Questions */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Your Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="What patterns do you see? What would you surface to the leader?"
              rows={4}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-300">Questions for the Leader</label>
              {questions.length > 0 && (
                <button
                  onClick={copyQuestions}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-amber-300 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy all'}
                </button>
              )}
            </div>
            <div className="space-y-2 mb-2">
              {questions.map((q, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-amber-500 mt-0.5">{i + 1}.</span>
                  <span className="flex-1">{q}</span>
                  <button onClick={() => removeQuestion(i)} className="text-slate-500 hover:text-red-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addQuestion()}
                placeholder="Add a question..."
                className="flex-1 px-3 py-1.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
              />
              <button
                onClick={addQuestion}
                disabled={!newQuestion.trim()}
                className="px-3 py-1.5 text-sm border border-slate-600 text-slate-300 rounded-lg hover:border-amber-500/50 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={saveNotes}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 transition-colors ${
              saved
                ? 'bg-emerald-700 text-emerald-100'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : saved ? 'Saved' : 'Save Notes & Questions'}
          </button>
        </div>
      </div>
    </div>
  );
}
