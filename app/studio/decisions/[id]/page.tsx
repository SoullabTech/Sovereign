'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useMaiaPlace } from '@/components/maia/presence/MaiaPresence';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
  ChevronRight,
  CircleDot,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import type { DecisionRecord, DecisionIteration, DecisionExperience, MentorReflection } from '@/lib/studio/leadership/types';
import { getSituationConfig } from '@/lib/studio/leadership/situationTypes';
import MentorPanel from '@/components/studio/MentorPanel';
import DecisionChain from '@/components/studio/DecisionChain';
import ExperienceTimeline from '@/components/studio/ExperienceTimeline';
import { ShareToCircleModal } from '@/components/circles/ShareToCircleModal';
import { useOfferToCircle } from '@/lib/circles/useOfferToCircle';
import PractitionerLoopIndicator from '@/components/studio/practitioner/PractitionerLoopIndicator';
import FieldSignalsPanel from '@/components/studio/practitioner/FieldSignalsPanel';
import PractitionerObservationsPanel from '@/components/studio/practitioner/PractitionerObservationsPanel';
import ClientInquiryPanel from '@/components/studio/practitioner/ClientInquiryPanel';
import OccupancyRatingWidget from '@/components/studio/practitioner/OccupancyRatingWidget';
import ProtocolSelector from '@/components/studio/practitioner/ProtocolSelector';
import type { PractitionerLoopState } from '@/lib/studio/practitioner/types';

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
  'relationships': { icon: Droplets, color: 'text-rose-400', label: 'Relationships' },
  'grief': { icon: Wind, color: 'text-slate-400', label: 'Grief' },
};

function getFramingConfig(id: string) {
  return ELEMENT_CONFIG[id] || { icon: Sparkles, color: 'text-slate-400', label: id.replace(/-/g, ' ') };
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── What Changed (Iteration Diff) ──────────────────────────────

type ChangeItem =
  | { type: 'emotion'; from: string; to: string }
  | { type: 'recommendation'; from: string; to: string }
  | { type: 'emergence'; from: string; to: string }
  | { type: 'tensions'; added: string[]; resolved: string[] }
  | { type: 'framings'; added: string[]; removed: string[] };

function firstSentence(text: string | undefined): string {
  if (!text) return '';
  const match = text.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : text.slice(0, 120).trim();
}

function tensionKey(t: string): string {
  return t.slice(0, 60).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function computeChanges(
  current: DecisionIteration,
  previous: DecisionIteration
): ChangeItem[] {
  const changes: ChangeItem[] = [];
  const curr = current.councilResult;
  const prev = previous.councilResult;

  // Emotional state shift
  if (current.emotionalState && previous.emotionalState &&
      current.emotionalState !== previous.emotionalState) {
    changes.push({ type: 'emotion', from: previous.emotionalState, to: current.emotionalState });
  }

  // Recommendation shift
  if (curr?.recommendation && prev?.recommendation) {
    const currFirst = firstSentence(curr.recommendation);
    const prevFirst = firstSentence(prev.recommendation);
    if (currFirst !== prevFirst) {
      changes.push({ type: 'recommendation', from: prevFirst, to: currFirst });
    }
  }

  // Emergence rating shift
  if (curr?.emergenceRating && prev?.emergenceRating &&
      curr.emergenceRating !== prev.emergenceRating) {
    changes.push({ type: 'emergence', from: prev.emergenceRating, to: curr.emergenceRating });
  }

  // Tension evolution (fuzzy match on first 60 chars)
  if (curr?.tensions && prev?.tensions) {
    const prevKeys = new Set(prev.tensions.map(tensionKey));
    const currKeys = new Set(curr.tensions.map(tensionKey));
    const added = curr.tensions.filter(t => !prevKeys.has(tensionKey(t)));
    const resolved = prev.tensions.filter(t => !currKeys.has(tensionKey(t)));
    if (added.length > 0 || resolved.length > 0) {
      changes.push({ type: 'tensions', added, resolved });
    }
  }

  // Perspective shift (framings used)
  if (curr?.framingsUsed && prev?.framingsUsed) {
    const prevSet = new Set(prev.framingsUsed);
    const currSet = new Set(curr.framingsUsed);
    const added = curr.framingsUsed.filter(f => !prevSet.has(f));
    const removed = prev.framingsUsed.filter(f => !currSet.has(f));
    if (added.length > 0 || removed.length > 0) {
      changes.push({ type: 'framings', added, removed });
    }
  }

  return changes;
}

function WhatChanged({ current, previous }: { current: DecisionIteration; previous: DecisionIteration }) {
  const changes = computeChanges(current, previous);
  if (changes.length === 0) return null;

  return (
    <div className="rounded-lg border border-indigo-900/30 bg-indigo-950/10 p-3">
      <h4 className="text-xs font-medium text-indigo-300 mb-2">What shifted since Round {previous.iterationNumber}</h4>
      <ul className="space-y-1.5">
        {changes.map((change, i) => {
          switch (change.type) {
            case 'emotion':
              return (
                <li key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                  <span className="text-indigo-400">State:</span>
                  <span className="text-slate-500">{change.from}</span>
                  <ArrowRight className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                  <span>{change.to}</span>
                </li>
              );
            case 'recommendation':
              return (
                <li key={i} className="text-xs text-slate-300">
                  <span className="text-indigo-400">Direction shifted:</span>{' '}
                  <span className="text-slate-500 line-through">{change.from}</span>{' '}
                  <span>{change.to}</span>
                </li>
              );
            case 'emergence':
              return (
                <li key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                  <span className="text-indigo-400">Emergence:</span>
                  <span className="text-slate-500 capitalize">{change.from}</span>
                  <ArrowRight className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                  <span className="capitalize">{change.to}</span>
                </li>
              );
            case 'tensions':
              return (
                <li key={i} className="text-xs text-slate-300">
                  {change.added.length > 0 && (
                    <div><span className="text-amber-400">New tensions:</span> {change.added.map(t => firstSentence(t)).join('; ')}</div>
                  )}
                  {change.resolved.length > 0 && (
                    <div><span className="text-emerald-400">Resolved:</span> {change.resolved.map(t => firstSentence(t)).join('; ')}</div>
                  )}
                </li>
              );
            case 'framings':
              return (
                <li key={i} className="text-xs text-slate-300">
                  {change.added.length > 0 && (
                    <span>
                      <span className="text-indigo-400">Added:</span>{' '}
                      {change.added.map(f => getFramingConfig(f).label).join(', ')}
                    </span>
                  )}
                  {change.added.length > 0 && change.removed.length > 0 && ' · '}
                  {change.removed.length > 0 && (
                    <span>
                      <span className="text-slate-500">Dropped:</span>{' '}
                      {change.removed.map(f => getFramingConfig(f).label).join(', ')}
                    </span>
                  )}
                </li>
              );
          }
        })}
      </ul>
    </div>
  );
}

// ─── Council Result Display ─────────────────────────────────────

function CouncilResultView({ council, animate = true }: { council: NonNullable<DecisionRecord['councilResult']>; animate?: boolean }) {
  return (
    <div className="space-y-6">
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
            const Wrapper = animate ? motion.div : 'div';
            const animProps = animate ? {
              initial: { opacity: 0, x: -10 },
              animate: { opacity: 1, x: 0 },
              transition: { delay: i * 0.1 },
            } : {};
            return (
              <Wrapper
                key={framingId}
                {...(animProps as any)}
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
              </Wrapper>
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
  );
}

// ─── Iteration Timeline Item ────────────────────────────────────

function IterationTimelineItem({ iteration, previousIteration, isLast }: { iteration: DecisionIteration; previousIteration?: DecisionIteration; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative pl-8">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-0 w-px bg-slate-800/60" />
      )}
      {/* Timeline dot */}
      <div className="absolute left-0 top-1">
        <CircleDot className="w-6 h-6 text-slate-600" />
      </div>

      <div className="pb-6">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-left w-full group"
        >
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-500" />
          )}
          <span className="text-sm font-medium text-slate-300">
            Round {iteration.iterationNumber}
          </span>
          <span className="text-xs text-slate-500">
            {formatDate(iteration.consultedAt)}
          </span>
          {iteration.councilResult?.emergenceRating && (
            <span className="text-xs text-purple-400 capitalize">
              {iteration.councilResult.emergenceRating}
            </span>
          )}
        </button>

        {/* Session notes preview (always visible if present) */}
        {iteration.sessionNotes && !expanded && (
          <p className="text-xs text-slate-500 mt-1 ml-6 line-clamp-2 italic">
            {iteration.sessionNotes}
          </p>
        )}

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 ml-6 space-y-4">
                {/* What changed since previous round */}
                {previousIteration && (
                  <WhatChanged current={iteration} previous={previousIteration} />
                )}

                {/* Session notes */}
                {iteration.sessionNotes && (
                  <div className="rounded-lg border border-slate-800/40 bg-slate-900/20 p-3">
                    <h4 className="text-xs font-medium text-slate-400 mb-1">What happened since</h4>
                    <p className="text-sm text-slate-300 whitespace-pre-line">{iteration.sessionNotes}</p>
                  </div>
                )}

                {/* Consultant notes from this iteration */}
                {iteration.consultantNotes && (
                  <div className="rounded-lg border border-slate-800/40 bg-slate-900/20 p-3">
                    <h4 className="text-xs font-medium text-slate-400 mb-1">Notes</h4>
                    <p className="text-sm text-slate-300 whitespace-pre-line">{iteration.consultantNotes}</p>
                  </div>
                )}

                {/* Council result */}
                {iteration.councilResult && (
                  <CouncilResultView council={iteration.councilResult} animate={false} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Continue Decision Form ─────────────────────────────────────

function ContinueDecisionForm({
  onSubmit,
  consulting,
  situationType,
}: {
  onSubmit: (sessionNotes: string, emotionalState?: string) => void;
  consulting: boolean;
  situationType: string | null;
}) {
  const [sessionNotes, setSessionNotes] = useState('');
  const [emotionalState, setEmotionalState] = useState('');
  const [showForm, setShowForm] = useState(false);
  const situationConfig = getSituationConfig(situationType);

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Continue Decision
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-amber-900/30 bg-amber-950/10 p-4 space-y-3"
    >
      <h3 className="text-sm font-medium text-amber-300">What happened since last session?</h3>
      <textarea
        value={sessionNotes}
        onChange={e => setSessionNotes(e.target.value)}
        placeholder="What landed? What didn't? What emerged? What did the client reveal?"
        rows={4}
        autoFocus
        className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none resize-none"
      />
      <div>
        <label className="block text-xs text-slate-400 mb-1">
          {situationConfig.contextLabels.stateLabel} (updated)
        </label>
        <input
          type="text"
          value={emotionalState}
          onChange={e => setEmotionalState(e.target.value)}
          placeholder="Optional — has their state shifted?"
          className="w-full px-3 py-1.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSubmit(sessionNotes, emotionalState || undefined)}
          disabled={consulting || !sessionNotes.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
        >
          {consulting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {consulting ? 'Consulting...' : 'Consult Council'}
        </button>
        <button
          onClick={() => setShowForm(false)}
          disabled={consulting}
          className="px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────

export default function DecisionDetailPage() {
  const params = useParams();
  const decisionId = params?.id as string;
  // 🚪 House Presence: declarative place facts (id only — never contents).
  useMaiaPlace({
    placeId: 'decisions',
    placeName: 'Decisions',
    purpose: 'A room for naming and reflecting on decisions.',
    objectType: 'decision',
    objectId: decisionId,
  });
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
  const circleOffer = useOfferToCircle();

  // Practitioner loop state — counts for the loop progress indicator
  const [fieldSignalCount, setFieldSignalCount] = useState(0);
  const [hasClientInquiry, setHasClientInquiry] = useState(false);
  const [observationCount, setObservationCount] = useState(0);
  const [evidenceOpen, setEvidenceOpen] = useState(true);

  // Protocol + occupancy tracking
  const [selectedProtocolId, setSelectedProtocolId] = useState<string | null>(null);
  const [currentOccupancyScore, setCurrentOccupancyScore] = useState<number | null>(null);

  useEffect(() => {
    loadDecision();
    loadLoopState();
  }, [decisionId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadLoopState() {
    try {
      const params = new URLSearchParams({ decisionId });
      const [signalsData, inquiryData, obsData] = await Promise.all([
        apiFetch(`/api/studio/field-signals?${params.toString()}`),
        apiFetch(`/api/studio/client-inquiry/responses?${params.toString()}`),
        apiFetch(`/api/studio/practitioner-observations?${params.toString()}`),
      ]);
      setFieldSignalCount((signalsData.signals || []).length);
      setHasClientInquiry((inquiryData.responses || []).length > 0);
      setObservationCount((obsData.observations || []).length);
    } catch { /* graceful — loop indicator stays empty */ }
  }

  async function loadDecision() {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/studio/decisions/${decisionId}`);
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

  async function runCouncil(sessionNotes?: string, emotionalState?: string) {
    setConsulting(true);
    setConsultError(null);
    try {
      const body: Record<string, string> = {};
      if (sessionNotes?.trim()) body.sessionNotes = sessionNotes.trim();
      if (emotionalState?.trim()) body.emotionalState = emotionalState.trim();
      if (selectedProtocolId) body.protocolId = selectedProtocolId;

      const res = await apiFetch(`/api/studio/decisions/${decisionId}/consult`, {
        method: 'POST',
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
      });
      if (res.ok) {
        const data = await res.json();
        setDecision(data.decision);
        // Reload to get full iteration history
        await loadDecision();
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
      await apiFetch(`/api/studio/decisions/${decisionId}`, {
        method: 'PUT',
        body: JSON.stringify({ consultantNotes: notes, questionsForLeader: questions }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(status: 'complete' | 'active') {
    try {
      const res = await apiFetch(`/api/studio/decisions/${decisionId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        setDecision(data.decision);
      }
    } catch {
      // Silently fail — user can try again
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
  const situationConfig = getSituationConfig(decision.situationType);
  const hasIterations = (decision.iterations?.length || 0) > 1;

  const loopState: PractitionerLoopState = {
    fieldSignalCount,
    hasClientInquiry,
    observationCount,
    hasCouncilSynthesis: !!council,
    hasExperiment: false,
    hasFollowUp: !!(decision.followUpIntention),
  };
  const priorIterations = decision.iterations?.slice(0, -1) || [];
  const isResolved = decision.status === 'complete';

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/studio/decisions" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-light text-white">{decision.title}</h1>
              {decision.iterationCount > 1 && (
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {decision.iterationCount} rounds
                </span>
              )}
            </div>
            {decision.clientName && (
              <p className="text-sm text-slate-400 mt-0.5">{decision.clientName}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Status badge */}
            {isResolved && (
              <span className="text-xs px-2 py-1 rounded bg-emerald-900/30 text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Resolved
              </span>
            )}
            {/* First consultation button (no prior result) */}
            {!council && !consulting && decision.status === 'draft' && (
              <button
                onClick={() => runCouncil()}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Consult Council
              </button>
            )}
          </div>
        </div>

        {/* Practitioner Loop Indicator */}
        <div className="mb-4">
          <PractitionerLoopIndicator state={loopState} />
        </div>

        {/* Context */}
        <div className="rounded-lg border border-slate-800/60 bg-slate-900/30 p-4 mb-6">
          <p className="text-sm text-slate-300">{decision.context}</p>
          <div className="flex flex-wrap gap-3 mt-3">
            {decision.situationType && (
              <span className="text-xs px-2 py-0.5 rounded text-slate-300 bg-slate-800/80">
                {situationConfig.label}
              </span>
            )}
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
                <span className="text-slate-500">{situationConfig.contextLabels.stateLabel}:</span> {decision.emotionalState}
              </span>
            )}
          </div>
        </div>

        {/* Evidence — Field Signals, Client Inquiry, Practitioner Observations */}
        <div className="mb-6 rounded-lg border border-slate-800/60 bg-slate-900/20 overflow-hidden">
          <button
            onClick={() => setEvidenceOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-900/40 transition-colors"
          >
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Evidence</span>
            <span className="text-xs text-slate-600">{evidenceOpen ? 'hide' : 'show'}</span>
          </button>
          {evidenceOpen && (
            <div className="px-4 pb-4 border-t border-slate-800/60 pt-4 space-y-6">
              {/* Protocol selector — persisted, orients the evidence loop and biases the council */}
              <ProtocolSelector
                decisionId={decisionId}
                clientId={decision.clientId || null}
                occupancyScore={currentOccupancyScore}
                onProtocolChange={setSelectedProtocolId}
              />
              <div className="border-t border-slate-800/60 pt-6">
                <FieldSignalsPanel decisionId={decisionId} />
              </div>
              <div className="border-t border-slate-800/60 pt-6">
                <ClientInquiryPanel
                  decisionId={decisionId}
                  clientName={decision.clientName || null}
                />
              </div>
              <div className="border-t border-slate-800/60 pt-6">
                <PractitionerObservationsPanel decisionId={decisionId} />
              </div>
            </div>
          )}
        </div>

        {/* Council Error */}
        {consultError && (
          <div className="rounded-lg border border-red-900/30 bg-red-950/10 p-3 mb-6 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-300">{consultError}</p>
              <button
                onClick={() => runCouncil()}
                disabled={consulting}
                className="text-xs text-red-400 hover:text-red-300 mt-1 underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Current Council Result */}
        {council ? (
          <div ref={councilRef}>
            {/* What changed since last round (current view) */}
            {decision.iterations && decision.iterations.length >= 2 && (() => {
              const iters = decision.iterations!;
              const currentIter = iters[iters.length - 1];
              const previousIter = iters[iters.length - 2];
              return currentIter && previousIter ? (
                <div className="mb-6">
                  <WhatChanged current={currentIter} previous={previousIter} />
                </div>
              ) : null;
            })()}
            <CouncilResultView council={council} />
          </div>
        ) : consulting ? (
          <div className="text-center py-16">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">The council is deliberating...</p>
            <p className="text-xs text-slate-500 mt-1">This may take 10-30 seconds</p>
          </div>
        ) : null}

        {/* Offer to Circle */}
        {council && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => circleOffer.offerToCircle(
                'decision',
                decisionId,
                decision.title,
                (council.recommendation || '').slice(0, 200)
              )}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-amber-500/20 text-amber-400/80 hover:bg-amber-500/10 transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              Offer to Circle
            </button>
          </div>
        )}

        {/* Relational Occupancy Rating (post-session) */}
        {council && (
          <div className="mt-4 rounded-lg border border-slate-800/60 bg-slate-900/20 p-4">
            <OccupancyRatingWidget
              decisionId={decisionId}
              onRated={setCurrentOccupancyScore}
            />
          </div>
        )}

        {/* MAIA Mentor Panel (after council result) */}
        {council && (
          <div className="mt-6">
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

        {/* Spiral Path: Decision Chain + Experiences */}
        {council && (
          <div className="mt-6 space-y-6">
            <DecisionChain
              decisionId={decisionId}
              decisionTitle={decision.title}
              parentDecision={decision.parentDecision || null}
              childDecisions={decision.childDecisions || []}
            />
            <ExperienceTimeline
              decisionId={decisionId}
              experiences={decision.experiences || []}
              onExperienceAdded={(experience) => {
                setDecision(prev => prev ? {
                  ...prev,
                  experiences: [experience, ...(prev.experiences || [])],
                } : prev);
              }}
            />
          </div>
        )}

        {/* Continue / Status Actions */}
        {council && !consulting && (
          <div className="mt-6 flex items-center gap-3">
            {!isResolved && (
              <ContinueDecisionForm
                onSubmit={(notes, state) => runCouncil(notes, state)}
                consulting={consulting}
                situationType={decision.situationType}
              />
            )}
            {decision.status === 'active' && (
              <button
                onClick={() => updateStatus('complete')}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400 hover:text-emerald-300 border border-slate-700 hover:border-emerald-700 rounded-lg transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark Resolved
              </button>
            )}
            {isResolved && (
              <button
                onClick={() => updateStatus('active')}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400 hover:text-amber-300 border border-slate-700 hover:border-amber-700 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reopen
              </button>
            )}
          </div>
        )}

        {/* Iteration Timeline (prior rounds) */}
        {hasIterations && priorIterations.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-800/60">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
              Prior Rounds
            </h2>
            <div>
              {priorIterations.map((iter, i) => (
                <IterationTimelineItem
                  key={iter.id}
                  iteration={iter}
                  previousIteration={i > 0 ? priorIterations[i - 1] : undefined}
                  isLast={i === priorIterations.length - 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* Consultant Notes & Questions */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Your Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={decision.situationType === 'self'
                ? 'What am I noticing? What patterns might be active in me?'
                : 'What patterns do you see? What would you surface in the next session?'
              }
              rows={4}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-300">{situationConfig.contextLabels.questionsLabel}</label>
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

        <ShareToCircleModal
          open={circleOffer.open}
          onClose={() => circleOffer.setOpen(false)}
          artifactType={circleOffer.artifact.type}
          artifactRef={circleOffer.artifact.ref}
          defaultTitle={circleOffer.artifact.title}
          defaultSummary={circleOffer.artifact.summary}
        />
      </div>
    </div>
  );
}
