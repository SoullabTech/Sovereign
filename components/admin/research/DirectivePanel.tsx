'use client';

import React, { useState } from 'react';

export interface DirectiveRow {
  id: string;
  directive_key: string;
  signal_type: string;
  observation_period_start: string;
  title: string;
  summary: string;
  evidence_payload: Record<string, unknown>;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'acknowledged' | 'resolved' | 'dismissed';
  opened_at: string;
  condition_cleared_at: string | null;
  resolved_at: string | null;
  acknowledged_by: string | null;
  notes: string | null;
}

interface Props {
  directives: DirectiveRow[];
  onAcknowledge: (id: string, by: string) => void;
  onResolve: (id: string, by: string, notes: string) => void;
  onDismiss: (id: string) => void;
}

const PRIORITY_BADGE: Record<string, { label: string; className: string }> = {
  high: { label: 'HIGH', className: 'bg-red-500/20 text-red-300 border border-red-500/40' },
  medium: { label: 'MED', className: 'bg-amber-500/20 text-amber-300 border border-amber-500/40' },
  low: { label: 'LOW', className: 'bg-slate-500/20 text-slate-400 border border-slate-500/40' },
};

const STATUS_BADGE: Record<string, string> = {
  open: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
  acknowledged: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
  resolved: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  dismissed: 'bg-slate-500/20 text-slate-500 border border-slate-600/30',
};

function formatDate(iso: string): string {
  return iso.slice(0, 10);
}

function EvidenceList({ payload }: { payload: Record<string, unknown> }) {
  const entries = Object.entries(payload);
  if (entries.length === 0) return <p className="text-xs text-slate-500 italic">No evidence data</p>;
  return (
    <div className="space-y-0.5">
      {entries.map(([k, v]) => (
        <div key={k} className="flex gap-2 text-xs">
          <span className="text-slate-500 font-mono shrink-0">{k}:</span>
          <span className="text-slate-300 font-mono break-all">{JSON.stringify(v)}</span>
        </div>
      ))}
    </div>
  );
}

type ActionMode = 'idle' | 'acknowledging' | 'resolving';

function DirectiveCard({
  directive,
  onAcknowledge,
  onResolve,
  onDismiss,
}: {
  directive: DirectiveRow;
  onAcknowledge: (id: string, by: string) => void;
  onResolve: (id: string, by: string, notes: string) => void;
  onDismiss: (id: string) => void;
}) {
  const [mode, setMode] = useState<ActionMode>('idle');
  const [byName, setByName] = useState('');
  const [resolveNotes, setResolveNotes] = useState('');

  const pb = PRIORITY_BADGE[directive.priority] ?? PRIORITY_BADGE.low;
  const sb = STATUS_BADGE[directive.status] ?? STATUS_BADGE.open;

  function handleAcknowledge() {
    if (!byName.trim()) return;
    onAcknowledge(directive.id, byName.trim());
    setMode('idle');
    setByName('');
  }

  function handleResolve() {
    if (!byName.trim()) return;
    onResolve(directive.id, byName.trim(), resolveNotes.trim());
    setMode('idle');
    setByName('');
    setResolveNotes('');
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 mb-3">
      {/* Header */}
      <div className="flex items-start gap-2 mb-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${pb.className}`}>{pb.label}</span>
        <span className={`text-xs px-2 py-0.5 rounded ${sb}`}>{directive.status}</span>
        <span className="text-xs px-2 py-0.5 rounded bg-slate-700/50 text-slate-400 border border-slate-600/30 font-mono">
          {directive.signal_type}
        </span>
        <span className="ml-auto text-xs text-slate-600 font-mono">{formatDate(directive.opened_at)}</span>
      </div>

      <h3 className="text-sm font-semibold text-slate-100 mb-1">{directive.title}</h3>
      <p className="text-xs text-slate-300 mb-3 leading-relaxed">{directive.summary}</p>

      {/* Evidence */}
      <div className="mb-3">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Evidence</p>
        <div className="bg-slate-900/40 rounded p-2">
          <EvidenceList payload={directive.evidence_payload} />
        </div>
      </div>

      {/* Recommendation */}
      <div className="mb-3 bg-slate-700/30 border border-slate-600/30 rounded p-3">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Recommendation</p>
        <p className="text-xs text-slate-200 leading-relaxed">{directive.recommendation}</p>
      </div>

      {/* Condition cleared notice */}
      {directive.condition_cleared_at && (
        <div className="mb-3 text-xs text-amber-300 bg-amber-900/20 border border-amber-500/20 rounded px-3 py-1.5">
          Condition cleared {formatDate(directive.condition_cleared_at)} — awaiting resolution
        </div>
      )}

      {/* Acknowledged by */}
      {directive.acknowledged_by && (
        <p className="text-xs text-slate-500 mb-2">
          Acknowledged by: <span className="text-slate-300">{directive.acknowledged_by}</span>
        </p>
      )}

      {/* Inline action form */}
      {mode === 'acknowledging' && (
        <div className="mt-2 bg-slate-700/30 rounded p-3 space-y-2">
          <label className="block text-xs text-slate-400">Your name</label>
          <input
            type="text"
            value={byName}
            onChange={(e) => setByName(e.target.value)}
            className="w-full text-xs bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-slate-200 focus:outline-none focus:border-violet-500"
            placeholder="Name or initials"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleAcknowledge}
              disabled={!byName.trim()}
              className="text-xs px-3 py-1.5 bg-violet-600/80 hover:bg-violet-600 text-white rounded disabled:opacity-40 transition-colors"
            >
              Confirm Acknowledge
            </button>
            <button
              onClick={() => { setMode('idle'); setByName(''); }}
              className="text-xs px-3 py-1.5 bg-slate-600/50 hover:bg-slate-600 text-slate-300 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {mode === 'resolving' && (
        <div className="mt-2 bg-slate-700/30 rounded p-3 space-y-2">
          <label className="block text-xs text-slate-400">Your name</label>
          <input
            type="text"
            value={byName}
            onChange={(e) => setByName(e.target.value)}
            className="w-full text-xs bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            placeholder="Name or initials"
            autoFocus
          />
          <label className="block text-xs text-slate-400">Resolution notes (optional)</label>
          <textarea
            value={resolveNotes}
            onChange={(e) => setResolveNotes(e.target.value)}
            className="w-full text-xs bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
            rows={2}
            placeholder="What was done to address this?"
          />
          <div className="flex gap-2">
            <button
              onClick={handleResolve}
              disabled={!byName.trim()}
              className="text-xs px-3 py-1.5 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded disabled:opacity-40 transition-colors"
            >
              Confirm Resolve
            </button>
            <button
              onClick={() => { setMode('idle'); setByName(''); setResolveNotes(''); }}
              className="text-xs px-3 py-1.5 bg-slate-600/50 hover:bg-slate-600 text-slate-300 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {mode === 'idle' && (
        <div className="flex gap-2 mt-2">
          {directive.status === 'open' && (
            <button
              onClick={() => setMode('acknowledging')}
              className="text-xs px-3 py-1.5 bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 border border-violet-500/30 rounded transition-colors"
            >
              Acknowledge
            </button>
          )}
          {directive.status === 'acknowledged' && (
            <button
              onClick={() => setMode('resolving')}
              className="text-xs px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 rounded transition-colors"
            >
              Resolve
            </button>
          )}
          <button
            onClick={() => onDismiss(directive.id)}
            className="text-xs px-3 py-1.5 bg-slate-600/20 hover:bg-slate-600/40 text-slate-400 border border-slate-600/30 rounded transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

export function DirectivePanel({ directives, onAcknowledge, onResolve, onDismiss }: Props) {
  const [showClosed, setShowClosed] = useState(false);

  const active = directives.filter((d) => d.status === 'open' || d.status === 'acknowledged');
  const closed = directives.filter((d) => d.status === 'resolved' || d.status === 'dismissed');

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedActive = active.slice().sort(
    (a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3)
  );

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
          System Directives
        </h2>
        {active.length > 0 && (
          <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded font-mono">
            {active.length} open
          </span>
        )}
      </div>

      {sortedActive.length === 0 ? (
        <p className="text-xs text-slate-500 italic mb-4">No open directives — all clear.</p>
      ) : (
        <div>
          {sortedActive.map((d) => (
            <DirectiveCard
              key={d.id}
              directive={d}
              onAcknowledge={onAcknowledge}
              onResolve={onResolve}
              onDismiss={onDismiss}
            />
          ))}
        </div>
      )}

      {/* Closed section toggle */}
      {closed.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setShowClosed((s) => !s)}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showClosed ? 'Hide' : 'Show'} resolved/dismissed ({closed.length})
          </button>
          {showClosed && (
            <div className="mt-3 opacity-60">
              {closed.map((d) => (
                <div
                  key={d.id}
                  className="bg-slate-900/40 border border-slate-700/30 rounded-lg p-3 mb-2"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${STATUS_BADGE[d.status] ?? ''}`}>
                      {d.status}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{formatDate(d.opened_at)}</span>
                  </div>
                  <p className="text-xs text-slate-400">{d.title}</p>
                  {d.acknowledged_by && (
                    <p className="text-xs text-slate-600 mt-0.5">by {d.acknowledged_by}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
