'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useMaiaPlace } from '@/components/maia/presence/MaiaPresence';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Wind,
  Sparkles,
  AlertTriangle,
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
  Droplets,
  Sprout,
  DoorOpen,
  Merge,
  Zap,
  Sun,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import type { ChangeRecord, ChangeIteration, ChangeExperience } from '@/lib/studio/changes/types';
import { getChangeTypeConfig } from '@/lib/studio/changes/changeTypes';
import HexagramDisplay from '@/components/studio/changes/HexagramDisplay';
import HexagramCaster from '@/components/studio/changes/HexagramCaster';
import ChangeMentorPanelComponent from '@/components/studio/changes/ChangeMentorPanel';
import ChangeExperienceTimelineComponent from '@/components/studio/changes/ChangeExperienceTimeline';
import { ShareToCircleModal } from '@/components/circles/ShareToCircleModal';
import { useOfferToCircle } from '@/lib/circles/useOfferToCircle';
import PractitionerLoopIndicator from '@/components/studio/practitioner/PractitionerLoopIndicator';
import FieldSignalsPanel from '@/components/studio/practitioner/FieldSignalsPanel';
import PractitionerObservationsPanel from '@/components/studio/practitioner/PractitionerObservationsPanel';
import ClientInquiryPanel from '@/components/studio/practitioner/ClientInquiryPanel';
import OccupancyRatingWidget from '@/components/studio/practitioner/OccupancyRatingWidget';
import ChangeExperimentPanel from '@/components/studio/practitioner/ChangeExperimentPanel';
import ProtocolSelector from '@/components/studio/practitioner/ProtocolSelector';
import type { PractitionerLoopState } from '@/lib/studio/practitioner/types';

const CHANGE_TYPE_ICONS: Record<string, typeof Wind> = {
  dissolution: Droplets,
  emergence: Sprout,
  threshold: DoorOpen,
  integration: Merge,
  upheaval: Zap,
  ripening: Sun,
};

// ─── What Changed (Iteration Diff) ──────────────────────────────

type ChangeItem =
  | { type: 'emotion'; from: string; to: string }
  | { type: 'recommendation'; from: string; to: string }
  | { type: 'hexagram'; from: number; to: number }
  | { type: 'tensions'; added: string[]; resolved: string[] };

function firstSentence(text: string | undefined): string {
  if (!text) return '';
  const match = text.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : text.slice(0, 120).trim();
}

function tensionKey(t: string): string {
  return t.slice(0, 60).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function computeChanges(
  current: ChangeIteration,
  previous: ChangeIteration
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

  // Hexagram shift
  if (current.hexagramNumber && previous.hexagramNumber &&
      current.hexagramNumber !== previous.hexagramNumber) {
    changes.push({ type: 'hexagram', from: previous.hexagramNumber, to: current.hexagramNumber });
  }

  // Tension evolution
  if (curr?.tensions && prev?.tensions) {
    const prevKeys = new Set(prev.tensions.map(tensionKey));
    const currKeys = new Set(curr.tensions.map(tensionKey));
    const added = curr.tensions.filter(t => !prevKeys.has(tensionKey(t)));
    const resolved = prev.tensions.filter(t => !currKeys.has(tensionKey(t)));
    if (added.length > 0 || resolved.length > 0) {
      changes.push({ type: 'tensions', added, resolved });
    }
  }

  return changes;
}

function WhatChanged({ current, previous }: { current: ChangeIteration; previous: ChangeIteration }) {
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
                  <span className="text-indigo-400">Guidance shifted:</span>{' '}
                  <span className="text-slate-500 line-through">{change.from}</span>{' '}
                  <span>{change.to}</span>
                </li>
              );
            case 'hexagram':
              return (
                <li key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                  <span className="text-indigo-400">Hexagram:</span>
                  <span className="text-slate-500">{change.from}</span>
                  <ArrowRight className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                  <span>{change.to}</span>
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
          }
        })}
      </ul>
    </div>
  );
}

// ─── Council Result Display (with I Ching interpretation) ─────

function ChangeCouncilResult({ council, animate = true }: { council: NonNullable<ChangeRecord['councilResult']>; animate?: boolean }) {
  return (
    <div className="space-y-6">
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
          <h3 className="text-sm font-medium text-emerald-300 mb-2">Guidance</h3>
          <p className="text-sm text-emerald-200/70">{council.recommendation}</p>
        </div>
      )}
    </div>
  );
}

// ─── I Ching Interpretation Display ────────────────────────────

function ChangeInterpretation({ interpretation }: { interpretation: NonNullable<ChangeRecord['hexagramInterpretation']> }) {
  return (
    <div className="rounded-lg border border-purple-900/30 bg-purple-950/10 p-4 space-y-4">
      <h3 className="text-sm font-medium text-purple-300">MAIA's Reading</h3>

      <div className="space-y-3 text-sm text-slate-300">
        {interpretation.reading && (
          <div>
            <h4 className="text-xs text-purple-400 uppercase tracking-wider mb-1">Reading</h4>
            <p className="text-slate-300 leading-relaxed">{interpretation.reading}</p>
          </div>
        )}

        {interpretation.guidance && (
          <div>
            <h4 className="text-xs text-emerald-400 uppercase tracking-wider mb-1">Guidance</h4>
            <p className="text-emerald-200/70 leading-relaxed">{interpretation.guidance}</p>
          </div>
        )}

        {interpretation.warnings && interpretation.warnings.length > 0 && (
          <div>
            <h4 className="text-xs text-amber-400 uppercase tracking-wider mb-1">Warnings</h4>
            <ul className="space-y-1">
              {interpretation.warnings.map((w, i) => (
                <li key={i} className="text-amber-200/70 flex items-start gap-2">
                  <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {interpretation.timing && (
          <div>
            <h4 className="text-xs text-cyan-400 uppercase tracking-wider mb-1">Timing</h4>
            <p className="text-cyan-200/70 leading-relaxed">{interpretation.timing}</p>
          </div>
        )}

        {interpretation.changingLinesReading && (
          <div>
            <h4 className="text-xs text-purple-400 uppercase tracking-wider mb-1">Changing Lines</h4>
            <p className="text-slate-300 leading-relaxed">{interpretation.changingLinesReading}</p>
          </div>
        )}

        {interpretation.relatingReading && (
          <div>
            <h4 className="text-xs text-indigo-400 uppercase tracking-wider mb-1">Relating Hexagram</h4>
            <p className="text-slate-300 leading-relaxed">{interpretation.relatingReading}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Iteration Timeline Item ────────────────────────────────────

function IterationTimelineItem({ iteration, previousIteration, isLast }: { iteration: ChangeIteration; previousIteration?: ChangeIteration; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative pl-8">
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-0 w-px bg-slate-800/60" />
      )}
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
            {new Date(iteration.consultedAt).toLocaleDateString()}
          </span>
          {iteration.hexagramNumber && (
            <span className="text-xs text-purple-400">
              Hexagram {iteration.hexagramNumber}
            </span>
          )}
        </button>

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
                {previousIteration && (
                  <WhatChanged current={iteration} previous={previousIteration} />
                )}

                {iteration.sessionNotes && (
                  <div className="rounded-lg border border-slate-800/40 bg-slate-900/20 p-3">
                    <h4 className="text-xs font-medium text-slate-400 mb-1">What happened since</h4>
                    <p className="text-sm text-slate-300 whitespace-pre-line">{iteration.sessionNotes}</p>
                  </div>
                )}

                {iteration.notes && (
                  <div className="rounded-lg border border-slate-800/40 bg-slate-900/20 p-3">
                    <h4 className="text-xs font-medium text-slate-400 mb-1">Notes</h4>
                    <p className="text-sm text-slate-300 whitespace-pre-line">{iteration.notes}</p>
                  </div>
                )}

                {iteration.councilResult && (
                  <ChangeCouncilResult council={iteration.councilResult} animate={false} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Continue Change Form ───────────────────────────────────────

function ContinueChangeForm({
  onSubmit,
  consulting,
  changeType,
  allowRecast,
}: {
  onSubmit: (sessionNotes: string, emotionalState?: string, recast?: boolean) => void;
  consulting: boolean;
  changeType: string | null;
  allowRecast: boolean;
}) {
  const [sessionNotes, setSessionNotes] = useState('');
  const [emotionalState, setEmotionalState] = useState('');
  const [recast, setRecast] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const config = getChangeTypeConfig(changeType);

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Continue Change
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-amber-900/30 bg-amber-950/10 p-4 space-y-3"
    >
      <h3 className="text-sm font-medium text-amber-300">What has happened since last session?</h3>
      <textarea
        value={sessionNotes}
        onChange={e => setSessionNotes(e.target.value)}
        placeholder="What has changed? What has emerged? What has resolved?"
        rows={4}
        autoFocus
        className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none resize-none"
      />
      <div>
        <label className="block text-xs text-slate-400 mb-1">
          {config.contextLabels.stateLabel} (updated)
        </label>
        <input
          type="text"
          value={emotionalState}
          onChange={e => setEmotionalState(e.target.value)}
          placeholder="Optional — has your inner state shifted?"
          className="w-full px-3 py-1.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
        />
      </div>
      {allowRecast && (
        <label className="flex items-center gap-2 text-xs text-slate-400">
          <input
            type="checkbox"
            checked={recast}
            onChange={e => setRecast(e.target.checked)}
            className="rounded border-slate-600 bg-slate-800 text-amber-600 focus:ring-amber-500/50"
          />
          <span>Cast I Ching again for this iteration</span>
        </label>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => onSubmit(sessionNotes, emotionalState || undefined, recast)}
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


function ChangeChain({ changeId, parentChange, childChanges }: { changeId: string; parentChange: any; childChanges: any[] }) {
  if (!parentChange && (!childChanges || childChanges.length === 0)) return null;

  return (
    <div className="rounded-lg border border-slate-800/60 bg-slate-900/30 p-4">
      <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-2">Change Chain</h3>
      <p className="text-xs text-slate-500 italic">Chain visualization — coming soon</p>
    </div>
  );
}


// ─── Main Page ──────────────────────────────────────────────────

export default function ChangeDetailPage() {
  const params = useParams();
  const changeId = params?.id as string;
  // 🚪 House Presence: declarative place facts (id only — never contents).
  useMaiaPlace({
    placeId: 'changes',
    placeName: 'Changes',
    purpose: 'A room for noticing and reflecting on transitions over time.',
    objectType: 'change',
    objectId: changeId,
  });
  const [change, setChange] = useState<ChangeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [consulting, setConsulting] = useState(false);
  const [consultError, setConsultError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [showCaster, setShowCaster] = useState(false);
  const councilRef = useRef<HTMLDivElement>(null);
  const circleOffer = useOfferToCircle();

  // Practitioner loop state — counts for the loop progress indicator
  const [fieldSignalCount, setFieldSignalCount] = useState(0);
  const [inquiryCount, setInquiryCount] = useState(0);
  const [observationCount, setObservationCount] = useState(0);
  const [experimentCount, setExperimentCount] = useState(0);
  const [evidenceOpen, setEvidenceOpen] = useState(true);

  // Protocol + occupancy tracking
  const [selectedProtocolId, setSelectedProtocolId] = useState<string | null>(null);
  const [currentOccupancyScore, setCurrentOccupancyScore] = useState<number | null>(null);

  useEffect(() => {
    loadChange();
    loadLoopState();
  }, [changeId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadLoopState() {
    try {
      const params = new URLSearchParams({ changeId });
      const [signalsRes, inquiryRes, obsRes, expRes] = await Promise.all([
        apiFetch(`/api/studio/field-signals?${params.toString()}`),
        apiFetch(`/api/studio/client-inquiry/responses?${params.toString()}`),
        apiFetch(`/api/studio/practitioner-observations?${params.toString()}`),
        apiFetch(`/api/studio/changes/${changeId}/experiments`),
      ]);
      const [signalsData, inquiryData, obsData, expData] = await Promise.all([
        signalsRes.json(),
        inquiryRes.json(),
        obsRes.json(),
        expRes.json(),
      ]);
      setFieldSignalCount((signalsData.signals || []).length);
      setInquiryCount((inquiryData.responses || []).length);
      setObservationCount((obsData.observations || []).length);
      setExperimentCount((expData.experiments || []).length);
    } catch { /* graceful — loop indicator stays empty */ }
  }

  async function loadChange() {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/studio/changes/${changeId}`);
      if (res.ok) {
        const data = await res.json();
        setChange(data.change);
        setNotes(data.change.notes || '');
        setQuestions(data.change.questions || []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function runCouncil(sessionNotes?: string, emotionalState?: string, recast?: boolean) {
    setConsulting(true);
    setConsultError(null);
    try {
      const body: Record<string, any> = {};
      if (sessionNotes?.trim()) body.sessionNotes = sessionNotes.trim();
      if (emotionalState?.trim()) body.emotionalState = emotionalState.trim();
      if (recast) body.recast = true;
      if (selectedProtocolId) body.protocolId = selectedProtocolId;

      const res = await apiFetch(`/api/studio/changes/${changeId}/consult`, {
        method: 'POST',
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
      });
      if (res.ok) {
        const data = await res.json();
        setChange(data.change);
        await loadChange();
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
      await apiFetch(`/api/studio/changes/${changeId}`, {
        method: 'PUT',
        body: JSON.stringify({ notes, questions }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(status: 'integrating' | 'complete' | 'active') {
    try {
      const res = await apiFetch(`/api/studio/changes/${changeId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        setChange(data.change);
      }
    } catch {
      // Silently fail
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

  if (!change) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-500">Change not found</div>
      </div>
    );
  }

  const council = change.councilResult;
  const config = getChangeTypeConfig(change.changeType);
  const Icon = CHANGE_TYPE_ICONS[change.changeType] || Wind;

  const loopState: PractitionerLoopState = {
    fieldSignalCount,
    inquiryCount,
    observationCount,
    councilIterationCount: change.iterationCount,
    experimentCount,
    hasMentorReflection: !!(change.mentorReflection),
    hasFollowUp: !!(change.followUpIntention),
    currentOccupancyScore,
  };
  const hasIterations = (change.iterations?.length || 0) > 1;
  const priorIterations = change.iterations?.slice(0, -1) || [];
  const isComplete = change.status === 'complete';

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/studio/changes" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-light text-white">{change.title}</h1>
              {change.iterationCount > 1 && (
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {change.iterationCount} rounds
                </span>
              )}
            </div>
            {change.clientName && (
              <p className="text-sm text-slate-400 mt-0.5">{change.clientName}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isComplete && (
              <span className="text-xs px-2 py-1 rounded bg-emerald-900/30 text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Complete
              </span>
            )}
            {!council && !consulting && change.status === 'naming' && (
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
          <div className="flex items-start gap-3 mb-2">
            <Icon className="w-5 h-5 text-cyan-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-slate-300">{config.label}</h3>
              <p className="text-xs text-slate-500">{config.description}</p>
            </div>
          </div>
          <p className="text-sm text-slate-300 mt-3">{change.description}</p>
          <div className="flex flex-wrap gap-3 mt-3">
            {change.urgency && change.urgency !== 'none' && (
              <span className="text-xs px-2 py-0.5 rounded text-red-300 bg-red-900/30">
                {change.urgency} urgency
              </span>
            )}
            {change.emotionalState && (
              <span className="text-xs text-slate-400">
                <span className="text-slate-500">{config.contextLabels.stateLabel}:</span> {change.emotionalState}
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
                changeId={changeId}
                clientId={change.clientId || null}
                occupancyScore={currentOccupancyScore}
                onProtocolChange={setSelectedProtocolId}
              />
              <div className="border-t border-slate-800/60 pt-6">
                <FieldSignalsPanel changeId={changeId} />
              </div>
              <div className="border-t border-slate-800/60 pt-6">
                <ClientInquiryPanel
                  changeId={changeId}
                  clientName={change.clientName || null}
                />
              </div>
              <div className="border-t border-slate-800/60 pt-6">
                <PractitionerObservationsPanel changeId={changeId} />
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

        {/* I Ching Section */}
        {change.hexagramNumber && (
          <div className="mb-6">
            <div className="rounded-lg border border-slate-800/60 bg-slate-900/30 p-4">
              <h2 className="text-sm font-medium text-slate-300 mb-4">I Ching Hexagram</h2>
              <HexagramDisplay
                hexagramNumber={change.hexagramNumber}
                changingLines={change.changingLines}
                relatingHexagramNumber={change.relatingHexagramNumber}
                size="md"
              />
            </div>
          </div>
        )}

        {/* I Ching Interpretation */}
        {change.hexagramInterpretation && (
          <div className="mb-6">
            <ChangeInterpretation interpretation={change.hexagramInterpretation} />
          </div>
        )}

        {/* Cast I Ching (if not yet cast) */}
        {!change.hexagramNumber && !showCaster && (
          <div className="mb-6">
            <button
              onClick={() => setShowCaster(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-purple-800/40 bg-purple-950/10 text-purple-300 hover:bg-purple-950/20 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Cast the I Ching
            </button>
          </div>
        )}

        {showCaster && !change.hexagramNumber && (
          <div className="mb-6 rounded-lg border border-slate-800/60 bg-slate-900/30 p-4">
            <HexagramCaster
              changeId={changeId}
              onCast={async (result) => {
                await apiFetch(`/api/studio/changes/${changeId}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                    hexagramNumber: result.hexagramNumber,
                    changingLines: result.changingLines,
                    relatingHexagramNumber: result.relatingHexagramNumber,
                    castingMethod: result.castingMethod,
                  }),
                });
                await loadChange();
                setShowCaster(false);
              }}
            />
          </div>
        )}

        {/* Current Council Result */}
        {council ? (
          <div ref={councilRef}>
            {change.iterations && change.iterations.length >= 2 && (() => {
              const iters = change.iterations!;
              const currentIter = iters[iters.length - 1];
              const previousIter = iters[iters.length - 2];
              return currentIter && previousIter ? (
                <div className="mb-6">
                  <WhatChanged current={currentIter} previous={previousIter} />
                </div>
              ) : null;
            })()}
            <ChangeCouncilResult council={council} />
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
              onClick={() => {
                const title = change.hexagramName
                  ? `${change.title} — ${change.hexagramName}`
                  : change.title;
                const summary = change.hexagramInterpretation?.guidance
                  || (council.recommendation || '').slice(0, 200);
                circleOffer.offerToCircle('change', changeId, title, summary);
              }}
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
              changeId={changeId}
              onRated={setCurrentOccupancyScore}
            />
          </div>
        )}

        {/* Mentor Panel */}
        {council && (
          <div className="mt-6">
            <ChangeMentorPanelComponent
              changeId={changeId}
              council={council}
              changeType={change.changeType}
              urgency={change.urgency}
              emotionalState={change.emotionalState}
              hexagramNumber={change.hexagramNumber}
              mentorReflection={change.mentorReflection}
              followUpIntention={change.followUpIntention}
              onReflectionGenerated={(reflection) => {
                setChange(prev => prev ? { ...prev, mentorReflection: reflection } : prev);
              }}
              onIntentionSaved={(intention) => {
                setChange(prev => prev ? { ...prev, followUpIntention: intention } : prev);
              }}
            />
          </div>
        )}

        {/* Spiral Path */}
        {council && (
          <div className="mt-6 space-y-6">
            <ChangeChain
              changeId={changeId}
              parentChange={change.parentChange || null}
              childChanges={change.childChanges || []}
            />
            <ChangeExperienceTimelineComponent
              changeId={changeId}
              experiences={change.experiences || []}
              onExperienceAdded={(experience) => {
                setChange(prev => prev ? {
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
            {!isComplete && change.status === 'active' && (
              <ContinueChangeForm
                onSubmit={(notes, state, recast) => runCouncil(notes, state, recast)}
                consulting={consulting}
                changeType={change.changeType}
                allowRecast={!!change.hexagramNumber}
              />
            )}
            {change.status === 'active' && (
              <button
                onClick={() => updateStatus('integrating')}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400 hover:text-cyan-300 border border-slate-700 hover:border-cyan-700 rounded-lg transition-colors"
              >
                <Wind className="w-4 h-4" />
                Mark Integrating
              </button>
            )}
            {change.status === 'integrating' && (
              <button
                onClick={() => updateStatus('complete')}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400 hover:text-emerald-300 border border-slate-700 hover:border-emerald-700 rounded-lg transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark Complete
              </button>
            )}
            {isComplete && (
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

        {/* Iteration Timeline */}
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

        {/* Notes & Questions */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Your Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="What patterns do you see? What is emerging?"
              rows={4}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-300">{config.contextLabels.questionsLabel}</label>
              {questions.length > 0 && (
                <button
                  onClick={copyQuestions}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-cyan-300 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy all'}
                </button>
              )}
            </div>
            <div className="space-y-2 mb-2">
              {questions.map((q, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-cyan-500 mt-0.5">{i + 1}.</span>
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
                className="flex-1 px-3 py-1.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none"
              />
              <button
                onClick={addQuestion}
                disabled={!newQuestion.trim()}
                className="px-3 py-1.5 text-sm border border-slate-600 text-slate-300 rounded-lg hover:border-cyan-500/50 disabled:opacity-50"
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
                : 'bg-cyan-600 hover:bg-cyan-500 text-white'
            }`}
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : saved ? 'Saved' : 'Save Notes & Questions'}
          </button>
        </div>

        {/* Intervention Design */}
        <div className="mt-8 pt-6 border-t border-slate-800/60">
          <ChangeExperimentPanel changeId={changeId} />
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
