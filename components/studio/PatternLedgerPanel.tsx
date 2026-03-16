'use client';

/**
 * Pattern Ledger Panel
 *
 * Studio tool for practitioners to view and record recurring patterns
 * observed across a client's sessions. Patterns are hypotheses — the
 * practitioner's observations, not diagnoses.
 *
 * Design principles:
 * - Patterns as hypotheses: confidence-gated, epistemic framing throughout
 * - Status lifecycle: emerging → offered → confirmed/partial/rejected/retired
 * - Practitioner adds; member recognizes (or doesn't); both are valid
 * - No pattern asserted to the member directly — only attended to
 */

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import {
  TrendingUp,
  Plus,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';

interface Pattern {
  id: string;
  statement: string;
  scope: 'relationship' | 'work' | 'somatic' | 'spiritual' | 'recurring_trigger' | 'theme';
  confidence: number;
  status: 'emerging' | 'offered' | 'confirmed' | 'partial' | 'rejected' | 'retired';
  member_response: string | null;
  context_note: string | null;
  last_evidence_at: string | null;
  created_at: string;
}

interface Props {
  clientId: string;
  memberId: string | null; // null = unlinked client, panel shows limited state
}

const STATUS_CONFIG: Record<
  Pattern['status'],
  { label: string; color: string; bg: string }
> = {
  emerging:      { label: 'Emerging',  color: 'text-amber-400',   bg: 'bg-amber-500/10' },
  offered:       { label: 'Offered',   color: 'text-blue-400',    bg: 'bg-blue-500/10' },
  confirmed:     { label: 'Confirmed', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  partial:       { label: 'Partial',   color: 'text-teal-400',    bg: 'bg-teal-500/10' },
  rejected:      { label: 'Rejected',  color: 'text-red-400',     bg: 'bg-red-500/10' },
  retired:       { label: 'Retired',   color: 'text-slate-500',   bg: 'bg-slate-700/30' },
};

const SCOPE_LABELS: Record<Pattern['scope'], string> = {
  relationship:      'Relationship',
  work:              'Work',
  somatic:           'Somatic',
  spiritual:         'Spiritual',
  recurring_trigger: 'Trigger',
  theme:             'Theme',
};

function ConfidenceDots({ value }: { value: number }) {
  const filled = Math.round(value * 5);
  return (
    <div className="flex items-center gap-0.5" title={`${Math.round(value * 100)}% confidence`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i < filled ? 'bg-slate-400' : 'bg-slate-700'
          }`}
        />
      ))}
    </div>
  );
}

const SCOPE_OPTIONS: { value: Pattern['scope']; label: string; description: string }[] = [
  { value: 'relationship',      label: 'Relationship', description: 'Relational patterns' },
  { value: 'work',              label: 'Work',         description: 'Career / vocation patterns' },
  { value: 'somatic',           label: 'Somatic',      description: 'Body / felt-sense patterns' },
  { value: 'spiritual',         label: 'Spiritual',    description: 'Meaning / depth patterns' },
  { value: 'recurring_trigger', label: 'Trigger',      description: 'Repeating activation points' },
  { value: 'theme',             label: 'Theme',        description: 'Cross-domain recurring theme' },
];

export function PatternLedgerPanel({ clientId, memberId }: Props) {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showRetired, setShowRetired] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // New pattern form state
  const [statement, setStatement] = useState('');
  const [scope, setScope] = useState<Pattern['scope']>('theme');
  const [confidence, setConfidence] = useState(0.7);
  const [contextNote, setContextNote] = useState('');

  const load = useCallback(async () => {
    if (!memberId) {
      setLoading(false);
      return;
    }
    try {
      const res = await apiFetch(`/api/studio/clients/${clientId}/patterns`);
      if (!res.ok) throw new Error('Failed to load patterns');
      const data = await res.json();
      setPatterns(data.patterns ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [clientId, memberId]);

  useEffect(() => { load(); }, [load]);

  async function addPattern() {
    if (!statement.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await apiFetch(`/api/studio/clients/${clientId}/patterns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statement: statement.trim(),
          scope,
          confidence,
          context_note: contextNote.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add pattern');
      setPatterns(prev => [data.pattern, ...prev]);
      // Reset form
      setStatement('');
      setScope('theme');
      setConfidence(0.7);
      setContextNote('');
      setShowForm(false);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Add failed');
    } finally {
      setSubmitting(false);
    }
  }

  const activePatterns = patterns.filter(p => p.status !== 'retired' && p.status !== 'rejected');
  const resolvedPatterns = patterns.filter(p => p.status === 'retired' || p.status === 'rejected');

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="flex items-center gap-2 text-sm font-medium text-white">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          Pattern Observations
        </h3>
        {!loading && memberId && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showForm ? 'Cancel' : 'Add'}
          </button>
        )}
      </div>
      <p className="text-[11px] text-slate-600 mb-4">
        Recurring observations — hypotheses, not diagnoses. Attended to, not asserted.
      </p>

      {/* Add Form */}
      {showForm && (
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-3 mb-4 space-y-3">
          <textarea
            value={statement}
            onChange={e => setStatement(e.target.value)}
            placeholder="Observation — e.g. 'Returns to self-sufficiency narrative when vulnerability surfaces'"
            rows={2}
            className="w-full text-sm text-slate-200 bg-transparent border border-slate-700/40 rounded p-2 resize-none focus:outline-none focus:border-amber-500/40 placeholder:text-slate-600"
          />

          <div className="flex items-center gap-3">
            {/* Scope */}
            <div className="flex-1">
              <div className="text-[10px] text-slate-500 mb-1">Scope</div>
              <div className="flex gap-1">
                {SCOPE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setScope(opt.value)}
                    title={opt.description}
                    className={`px-2 py-0.5 text-xs rounded transition-colors ${
                      scope === opt.value
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'text-slate-500 border border-slate-700/40 hover:text-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Confidence */}
            <div>
              <div className="text-[10px] text-slate-500 mb-1">
                Confidence — {Math.round(confidence * 100)}%
              </div>
              <input
                type="range"
                min={0.4}
                max={1.0}
                step={0.1}
                value={confidence}
                onChange={e => setConfidence(parseFloat(e.target.value))}
                className="w-24 accent-amber-500"
              />
            </div>
          </div>

          <input
            value={contextNote}
            onChange={e => setContextNote(e.target.value)}
            placeholder="Context note (optional)"
            className="w-full text-xs text-slate-400 bg-transparent border-b border-slate-700/40 py-1 focus:outline-none focus:border-amber-500/40 placeholder:text-slate-600"
          />

          {submitError && (
            <div className="flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle className="w-3.5 h-3.5" />
              {submitError}
            </div>
          )}

          <button
            onClick={addPattern}
            disabled={submitting || !statement.trim()}
            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded transition-colors"
          >
            {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            {submitting ? 'Adding…' : 'Record Observation'}
          </button>
        </div>
      )}

      {/* Unlinked client */}
      {!memberId && (
        <p className="text-xs text-slate-500 py-2">
          Pattern ledger is available once this client links a MAIA account.
        </p>
      )}

      {/* Loading */}
      {loading && memberId && (
        <div className="flex items-center gap-2 text-slate-500 py-3">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="text-xs">Loading patterns…</span>
        </div>
      )}

      {error && (
        <div className="text-xs text-red-400">{error}</div>
      )}

      {/* Active patterns */}
      {!loading && memberId && activePatterns.length === 0 && !showForm && (
        <p className="text-xs text-slate-500 italic">
          No observations recorded yet. Add the first when you notice a recurring pattern.
        </p>
      )}

      {activePatterns.length > 0 && (
        <div className="space-y-2">
          {activePatterns.map(p => {
            const status = STATUS_CONFIG[p.status];
            return (
              <div
                key={p.id}
                className="rounded-lg border border-slate-700/30 bg-slate-800/20 p-3"
              >
                <p className="text-sm text-slate-200 leading-snug mb-2">{p.statement}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${status.bg} ${status.color}`}>
                    {status.label}
                  </span>
                  <span className="text-[10px] text-slate-500 border border-slate-700/50 px-1.5 py-0.5 rounded">
                    {SCOPE_LABELS[p.scope]}
                  </span>
                  <ConfidenceDots value={p.confidence} />
                  {p.member_response && (
                    <span className="text-[10px] text-teal-400 ml-auto">
                      Member: {p.member_response}
                    </span>
                  )}
                </div>
                {p.context_note && (
                  <p className="text-[11px] text-slate-500 mt-1.5 italic">{p.context_note}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Resolved patterns (retired/rejected) — collapsed */}
      {resolvedPatterns.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowRetired(!showRetired)}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            {showRetired ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {resolvedPatterns.length} resolved
          </button>

          {showRetired && (
            <div className="mt-2 space-y-1.5">
              {resolvedPatterns.map(p => {
                const status = STATUS_CONFIG[p.status];
                return (
                  <div key={p.id} className="rounded border border-slate-800 p-2.5 opacity-60">
                    <p className="text-xs text-slate-400 leading-snug mb-1">{p.statement}</p>
                    <span className={`text-[10px] ${status.color}`}>{status.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
