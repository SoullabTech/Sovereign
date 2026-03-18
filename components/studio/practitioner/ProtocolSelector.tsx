'use client';

/**
 * Protocol Selector
 *
 * Allows the practitioner to activate a clinical protocol for the current session.
 * Protocol selection is persisted to the DB immediately — survives page reload.
 *
 * Scope (one required): clientId, decisionId, or changeId.
 * Priority for lookups: change → decision → client.
 *
 * When a protocol is selected, Studio provides:
 *   - Scope indicator (Change-level / Decision-level / Client-level)
 *   - Pattern description and occupancy target
 *   - Stage navigator with manual advance/retreat (saved immediately)
 *   - Intervention recommendation (occupancy-gated, from getInterventionRecommendation)
 *   - Risk notes and success markers (collapsible)
 *   - Disciplined assignment notes (PATCH on blur)
 *   - Protocol review card (lazy-loaded snapshot: occupancy trajectory + experiments)
 *
 * The selectedProtocolId and currentOccupancyScore are lifted to the parent page
 * so they can be included in the council consult POST body — injecting councilBias
 * into the synthesis prompt without overriding the evidence.
 *
 * Usage:
 *   <ProtocolSelector
 *     decisionId={decisionId}
 *     clientId={decision.clientId}
 *     occupancyScore={currentOccupancyScore}
 *     onProtocolChange={setSelectedProtocolId}
 *   />
 */

import { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown, ChevronUp, BookOpen, AlertTriangle, Target,
  Layers, CheckCircle2, ChevronRight, ChevronLeft,
  FileText, Activity,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { PROTOCOL_REGISTRY, getInterventionRecommendation } from '@/lib/studio/practitioner/protocols';
import type { ProtocolDefinition } from '@/lib/studio/practitioner/protocols';

// ─── Types ───────────────────────────────────────────────────────

interface ProtocolAssignment {
  id:                string;
  protocolId:        string;
  activeStageNumber: number;
  targetOccupancy:   number | null;
  status:            string;
  startedAt:         string;
  notes:             string | null;
}

interface ProtocolSnapshot {
  daysActive:           number;
  stageReached:         number;
  targetOccupancy:      number | null;
  startingOccupancy:    number | null;
  currentOccupancy:     number | null;
  lowestOccupancy:      number | null;
  highestOccupancy:     number | null;
  ratingCount:          number;
  occupancyTrend:       'improving' | 'worsening' | 'stable' | 'unknown';
  onTarget:             boolean | null;
  experimentsTotal:     number;
  experimentsActive:    number;
  experimentsCompleted: number;
  experimentsAbandoned: number;
  mostRecentExperiment: { title: string; status: string } | null;
}

interface Props {
  clientId?:         string | null;
  decisionId?:       string;
  changeId?:         string;
  occupancyScore:    number | null;
  onProtocolChange?: (protocolId: string | null) => void;
}

const PROTOCOL_LIST = Object.values(PROTOCOL_REGISTRY);

const STATUS_LABELS: Record<string, string> = {
  active:    'Active',
  paused:    'Paused',
  complete:  'Complete',
  abandoned: 'Abandoned',
};

const STATUS_COLORS: Record<string, string> = {
  active:    'text-indigo-400',
  paused:    'text-amber-400',
  complete:  'text-emerald-400',
  abandoned: 'text-slate-500',
};

const OCCUPANCY_LABELS: Record<number, string> = {
  1: '1 — Reciprocal',
  2: '2 — Mostly open',
  3: '3 — Partial occupation',
  4: '4 — High occupation',
  5: '5 — Full occupation',
};

const TREND_DISPLAY: Record<string, { label: string; className: string }> = {
  improving: { label: '↓ improving', className: 'bg-emerald-950/50 text-emerald-400' },
  worsening: { label: '↑ worsening', className: 'bg-red-950/50 text-red-400'         },
  stable:    { label: '→ stable',    className: 'bg-amber-950/50 text-amber-400'      },
  unknown:   { label: '— unknown',   className: 'bg-slate-800 text-slate-500'         },
};

// ─── Stage Rail ──────────────────────────────────────────────────

function StageRail({
  protocol,
  activeStageNumber,
  onAdvance,
  onRetreat,
  advancing,
}: {
  protocol:          ProtocolDefinition;
  activeStageNumber: number;
  onAdvance:         () => void;
  onRetreat:         () => void;
  advancing:         boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const canAdvance = activeStageNumber < protocol.interventionStages.length;
  const canRetreat = activeStageNumber > 1;
  const activeStage = protocol.interventionStages.find((s) => s.stage === activeStageNumber);

  return (
    <div className="space-y-2">
      {/* Current stage summary row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 uppercase tracking-wide">
          Stage {activeStageNumber} of {protocol.interventionStages.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onRetreat}
            disabled={!canRetreat || advancing}
            className="p-0.5 text-slate-600 hover:text-slate-300 disabled:opacity-30 transition-colors"
            title="Previous stage"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onAdvance}
            disabled={!canAdvance || advancing}
            className="p-0.5 text-slate-600 hover:text-slate-300 disabled:opacity-30 transition-colors"
            title="Next stage"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-slate-500 hover:text-slate-300 ml-1 flex items-center gap-0.5"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Active stage summary */}
      {activeStage && (
        <div className="rounded px-2.5 py-2 bg-indigo-950/30 border border-indigo-900/40">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-indigo-300">{activeStage.label}</span>
            <span className="text-xs text-slate-600">{activeStage.modality}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 leading-snug">{activeStage.goal}</p>
          {activeStage.caution && (
            <p className="text-xs text-amber-600/80 mt-0.5 leading-snug">⚠ {activeStage.caution}</p>
          )}
          <p className="text-xs text-slate-600 mt-1 leading-snug italic">
            Proceed when: {activeStage.proceedWhen}
          </p>
        </div>
      )}

      {/* Full stage list (collapsible) */}
      {expanded && (
        <div className="space-y-1.5 mt-1">
          {protocol.interventionStages.map((stage) => (
            <div
              key={stage.stage}
              className={`flex items-start gap-2.5 rounded px-2.5 py-2 border transition-colors ${
                stage.stage === activeStageNumber
                  ? 'bg-indigo-950/30 border-indigo-900/40'
                  : 'bg-slate-800/40 border-slate-700/30'
              }`}
            >
              <span className={`text-xs font-mono mt-0.5 w-4 flex-shrink-0 ${
                stage.stage === activeStageNumber ? 'text-indigo-400' : 'text-slate-500'
              }`}>{stage.stage}.</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-medium ${
                    stage.stage === activeStageNumber ? 'text-indigo-300' : 'text-slate-400'
                  }`}>{stage.label}</span>
                  <span className="text-xs text-slate-600">{stage.modality}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">{stage.goal}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Risk Notes ──────────────────────────────────────────────────

function RiskNotes({ protocol }: { protocol: ProtocolDefinition }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-amber-600/80 hover:text-amber-500 transition-colors"
      >
        <AlertTriangle className="w-3 h-3" />
        {open ? 'Hide risk notes' : `${protocol.riskNotes.length} risk note${protocol.riskNotes.length !== 1 ? 's' : ''}`}
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {protocol.riskNotes.map((note) => (
            <div key={note.label} className="rounded px-2.5 py-2 bg-amber-950/20 border border-amber-900/30">
              <p className="text-xs font-medium text-amber-500/90">{note.label}</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">{note.description}</p>
              <p className="text-xs text-slate-500 mt-1 leading-snug">
                <span className="text-slate-600">Watch: </span>{note.watch}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                <span className="text-slate-600">Reframe: </span>{note.reframe}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Success Metrics ─────────────────────────────────────────────

function SuccessMetrics({ protocol }: { protocol: ProtocolDefinition }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-emerald-600/80 hover:text-emerald-500 transition-colors"
      >
        <CheckCircle2 className="w-3 h-3" />
        {open ? 'Hide success markers' : 'Success markers'}
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {protocol.successMetrics.map((sm) => (
            <div key={sm.timeframe} className="rounded px-2.5 py-2 bg-emerald-950/20 border border-emerald-900/30">
              <p className="text-xs font-medium text-emerald-500/90">{sm.timeframe}</p>
              <ul className="mt-1 space-y-0.5">
                {sm.markers.map((m, i) => (
                  <li key={i} className="text-xs text-slate-400 leading-snug">• {m}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────

export default function ProtocolSelector({
  clientId,
  decisionId,
  changeId,
  occupancyScore,
  onProtocolChange,
}: Props) {
  const [assignment, setAssignment]             = useState<ProtocolAssignment | null>(null);
  const [loading, setLoading]                   = useState(true);
  const [saving, setSaving]                     = useState(false);
  const [advancing, setAdvancing]               = useState(false);
  const [statusMenuOpen, setStatusMenuOpen]     = useState(false);

  // Notes: local state, PATCH on blur
  const [notes, setNotes]                       = useState<string>('');
  const [notesDirty, setNotesDirty]             = useState(false);

  // Protocol review (snapshot)
  const [reviewOpen, setReviewOpen]             = useState(false);
  const [snapshot, setSnapshot]                 = useState<ProtocolSnapshot | null>(null);
  const [snapshotLoading, setSnapshotLoading]   = useState(false);

  // Derive currently active protocol from assignment
  const selectedProtocolId = assignment?.protocolId ?? null;
  const protocol: ProtocolDefinition | null = selectedProtocolId
    ? (PROTOCOL_REGISTRY[selectedProtocolId] ?? null)
    : null;

  // Scope label — shown below the selector so practitioners know what they're assigning to
  const scopeLabel = changeId
    ? 'Change-level assignment'
    : decisionId
    ? 'Decision-level assignment'
    : clientId
    ? 'Client-level assignment'
    : null;

  // Build query string for API calls
  const scopeParams = useCallback(() => {
    const p = new URLSearchParams();
    if (changeId)        p.set('changeId',   changeId);
    else if (decisionId) p.set('decisionId', decisionId);
    else if (clientId)   p.set('clientId',   clientId);
    return p.toString();
  }, [changeId, decisionId, clientId]);

  // Load existing assignment on mount
  useEffect(() => {
    const scope = scopeParams();
    if (!scope) { setLoading(false); return; }

    setLoading(true);
    apiFetch(`/api/studio/protocol-assignments?${scope}`)
      .then((r) => r.json())
      .then((data) => {
        const a: ProtocolAssignment | null = data.assignment ?? null;
        setAssignment(a);
        onProtocolChange?.(a?.protocolId ?? null);
      })
      .catch(() => { /* graceful — stay unselected */ })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeId, decisionId, clientId]);

  // Sync notes and reset snapshot when assignment changes
  useEffect(() => {
    setNotes(assignment?.notes ?? '');
    setNotesDirty(false);
    setSnapshot(null);
    setReviewOpen(false);
  }, [assignment?.id]);

  // Save protocol selection (or clear)
  async function handleProtocolChange(newProtocolId: string) {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        protocolId: newProtocolId || null,
        clientId:   clientId   || null,
        decisionId: decisionId || null,
        changeId:   changeId   || null,
      };
      const res = await apiFetch('/api/studio/protocol-assignments', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      const a: ProtocolAssignment | null = data.assignment ?? null;
      setAssignment(a);
      onProtocolChange?.(a?.protocolId ?? null);
    } catch { /* keep current state */ }
    finally { setSaving(false); }
  }

  // Advance or retreat active stage
  async function handleStageChange(delta: 1 | -1) {
    if (!assignment || !protocol) return;
    const newStage = Math.max(1, Math.min(
      protocol.interventionStages.length,
      assignment.activeStageNumber + delta
    ));
    if (newStage === assignment.activeStageNumber) return;

    setAdvancing(true);
    try {
      const res = await apiFetch(`/api/studio/protocol-assignments/${assignment.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ activeStageNumber: newStage }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.assignment) {
          setAssignment(data.assignment);
        }
      }
    } catch { /* keep current stage */ }
    finally { setAdvancing(false); }
  }

  // Update assignment status
  async function handleStatusChange(newStatus: string) {
    if (!assignment) return;
    setStatusMenuOpen(false);
    try {
      const res = await apiFetch(`/api/studio/protocol-assignments/${assignment.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.assignment) {
          setAssignment(data.assignment);
        }
      }
    } catch { /* keep current status */ }
  }

  // Save notes on blur — only if changed
  async function handleNoteBlur() {
    if (!assignment || !notesDirty) return;
    const trimmed = notes.trim() || null;
    try {
      const res = await apiFetch(`/api/studio/protocol-assignments/${assignment.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ notes: trimmed }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.assignment) {
          setAssignment(data.assignment);
          setNotesDirty(false);
        }
      }
    } catch { /* keep local state */ }
  }

  // Toggle review panel; lazy-load snapshot on first open
  async function handleReviewToggle() {
    if (!assignment) return;
    const opening = !reviewOpen;
    setReviewOpen(opening);
    if (opening && !snapshot && !snapshotLoading) {
      setSnapshotLoading(true);
      try {
        const res = await apiFetch(
          `/api/studio/protocol-assignments/${assignment.id}/snapshot`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.snapshot) setSnapshot(data.snapshot);
        }
      } catch { /* show nothing */ }
      finally { setSnapshotLoading(false); }
    }
  }

  // Intervention recommendation based on occupancy
  const recommendation = protocol && occupancyScore != null
    ? getInterventionRecommendation(protocol, occupancyScore)
    : null;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-600">
        <BookOpen className="w-3.5 h-3.5" />
        <span>Loading protocol...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Selector row */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <select
            value={selectedProtocolId || ''}
            onChange={(e) => handleProtocolChange(e.target.value)}
            disabled={saving}
            className="flex-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5 min-w-0 disabled:opacity-60"
          >
            <option value="">No protocol active</option>
            {PROTOCOL_LIST.map((p) => (
              <option key={p.id} value={p.id}>{p.shortName}</option>
            ))}
          </select>

          {protocol && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-shrink-0">
              <Target className="w-3 h-3" />
              <span>≤{assignment?.targetOccupancy ?? protocol.occupancyTarget}</span>
            </div>
          )}

          {saving && (
            <span className="text-xs text-slate-600 flex-shrink-0">saving…</span>
          )}
        </div>

        {/* Scope indicator */}
        {scopeLabel && (
          <p className="text-xs text-slate-700 pl-5">{scopeLabel}</p>
        )}
      </div>

      {/* Protocol guidance card */}
      {protocol && assignment && (
        <div className="rounded-lg border border-indigo-900/40 bg-indigo-950/20 p-4 space-y-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <Layers className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-medium text-indigo-300">{protocol.name}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{protocol.targetPattern}</p>
              </div>
            </div>

            {/* Status badge + menu */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setStatusMenuOpen((v) => !v)}
                className={`text-xs px-2 py-0.5 rounded border border-current/30 ${STATUS_COLORS[assignment.status] ?? 'text-slate-500'}`}
              >
                {STATUS_LABELS[assignment.status] ?? assignment.status}
              </button>
              {statusMenuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded shadow-lg z-20 py-1 min-w-24">
                  {Object.entries(STATUS_LABELS).map(([s, label]) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className={`w-full text-left text-xs px-3 py-1.5 hover:bg-slate-700 ${STATUS_COLORS[s] ?? 'text-slate-400'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Intervention recommendation */}
          {recommendation && (
            <div className="rounded px-3 py-2 bg-indigo-900/30 border border-indigo-800/40">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                Session recommendation
                {occupancyScore != null && (
                  <span className="ml-2 normal-case text-indigo-400">
                    occupancy {occupancyScore} — {OCCUPANCY_LABELS[occupancyScore] ?? `${occupancyScore}`}
                  </span>
                )}
              </p>
              <p className="text-xs text-indigo-200 leading-relaxed">{recommendation}</p>
            </div>
          )}
          {!recommendation && occupancyScore == null && (
            <p className="text-xs text-slate-600 italic">
              Rate occupancy after the session to get an intervention recommendation.
            </p>
          )}

          {/* Stage rail — with advance/retreat controls */}
          <StageRail
            protocol={protocol}
            activeStageNumber={assignment.activeStageNumber}
            onAdvance={() => handleStageChange(1)}
            onRetreat={() => handleStageChange(-1)}
            advancing={advancing}
          />

          {/* Inquiry sets reference */}
          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Recommended Inquiry</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(protocol.inquirySets).map(([key, setId]) => (
                <span
                  key={key}
                  className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400"
                >
                  {key}: {setId}
                </span>
              ))}
            </div>
          </div>

          {/* Risk notes + success markers (collapsed) */}
          <div className="space-y-2 pt-1 border-t border-slate-800/60">
            <RiskNotes protocol={protocol} />
            <SuccessMetrics protocol={protocol} />
          </div>

          {/* Assignment note — disciplined, PATCH on blur */}
          <div className="pt-1 border-t border-slate-800/60 space-y-1.5">
            <label className="flex items-start gap-1.5 text-xs text-slate-500">
              <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>
                Assignment note
                <span className="text-slate-700 ml-1">
                  — reason paused · reason abandoned · rationale for stage advance · protocol deviation
                </span>
              </span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => { setNotes(e.target.value); setNotesDirty(true); }}
              onBlur={handleNoteBlur}
              rows={2}
              placeholder="Add a note..."
              className="w-full bg-slate-900/60 border border-slate-700/60 rounded text-xs text-slate-300 px-2.5 py-2 resize-none placeholder-slate-700 focus:outline-none focus:border-slate-600 transition-colors"
            />
          </div>

          {/* Protocol review — lazy-loaded snapshot */}
          <div className="pt-1 border-t border-slate-800/60 space-y-2">
            <button
              onClick={handleReviewToggle}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <Activity className="w-3 h-3" />
              {reviewOpen ? 'Hide review' : 'Protocol review'}
              {reviewOpen
                ? <ChevronUp className="w-3 h-3" />
                : <ChevronDown className="w-3 h-3" />
              }
            </button>

            {reviewOpen && (
              snapshotLoading ? (
                <p className="text-xs text-slate-600 pl-4">Loading...</p>
              ) : snapshot ? (
                <div className="space-y-2 pl-4">
                  {/* Summary row */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>{snapshot.daysActive}d active</span>
                    <span>Stage {snapshot.stageReached}</span>
                    {snapshot.targetOccupancy != null && (
                      <span>Target ≤{snapshot.targetOccupancy}</span>
                    )}
                  </div>

                  {/* Occupancy trajectory */}
                  {snapshot.ratingCount > 0 ? (
                    <div className="rounded px-2.5 py-2 bg-slate-800/40 border border-slate-700/30 space-y-1.5">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Occupancy</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-slate-300 font-mono">
                          {snapshot.startingOccupancy ?? '—'} → {snapshot.currentOccupancy ?? '—'}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-xs ${
                          TREND_DISPLAY[snapshot.occupancyTrend]?.className ?? TREND_DISPLAY.unknown.className
                        }`}>
                          {TREND_DISPLAY[snapshot.occupancyTrend]?.label ?? '— unknown'}
                        </span>
                        {snapshot.onTarget !== null && (
                          <span className={snapshot.onTarget ? 'text-emerald-500' : 'text-amber-500'}>
                            {snapshot.onTarget ? '✓ on target' : '✗ off target'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">
                        Range {snapshot.lowestOccupancy ?? '—'}–{snapshot.highestOccupancy ?? '—'} · {snapshot.ratingCount} rating{snapshot.ratingCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 italic">No occupancy ratings yet.</p>
                  )}

                  {/* Experiments — change-scope only */}
                  {snapshot.experimentsTotal > 0 && (
                    <div className="rounded px-2.5 py-2 bg-slate-800/40 border border-slate-700/30 space-y-1.5">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Experiments</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="text-slate-400">{snapshot.experimentsTotal} total</span>
                        {snapshot.experimentsCompleted > 0 && (
                          <span className="text-emerald-500/80">{snapshot.experimentsCompleted} completed</span>
                        )}
                        {snapshot.experimentsActive > 0 && (
                          <span className="text-indigo-400">{snapshot.experimentsActive} active</span>
                        )}
                        {snapshot.experimentsAbandoned > 0 && (
                          <span className="text-slate-500">{snapshot.experimentsAbandoned} abandoned</span>
                        )}
                      </div>
                      {snapshot.mostRecentExperiment && (
                        <p className="text-xs text-slate-600">
                          Last: {snapshot.mostRecentExperiment.title}
                          <span className="text-slate-700"> · {snapshot.mostRecentExperiment.status}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-600 italic pl-4">Review unavailable.</p>
              )
            )}
          </div>

          {/* Assignment metadata */}
          <p className="text-xs text-slate-700">
            Started {new Date(assignment.startedAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            })}
          </p>
        </div>
      )}
    </div>
  );
}
