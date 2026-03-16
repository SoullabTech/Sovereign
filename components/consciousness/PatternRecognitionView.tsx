'use client';

/**
 * PatternRecognitionView
 *
 * Member-facing view of their pattern ledger. Shows patterns that MAIA has
 * noticed across conversations — offered for recognition, not assertion.
 *
 * Sovereignty principles:
 * - Patterns are hypotheses. Member decides significance.
 * - No pattern is "true" until the member says so.
 * - Rejected patterns are respected and not re-surfaced.
 * - The tone is "MAIA has noticed…" not "You have a problem with…"
 */

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

type PatternScope = 'relationship' | 'work' | 'somatic' | 'spiritual' | 'recurring_trigger' | 'theme';
type PatternStatus = 'emerging' | 'offered' | 'confirmed' | 'partial' | 'rejected' | 'retired';
type MemberResponse = 'confirmed' | 'partial' | 'rejected' | 'retired';

interface Pattern {
  id: string;
  statement: string;
  scope: PatternScope;
  confidence: number;
  status: PatternStatus;
  member_response: string | null;
  context_note: string | null;
  created_at: string;
}

const SCOPE_LABELS: Record<PatternScope, { label: string; glyph: string }> = {
  relationship:      { label: 'Relationship', glyph: '◎' },
  work:              { label: 'Work',         glyph: '◇' },
  somatic:           { label: 'Somatic',      glyph: '○' },
  spiritual:         { label: 'Spiritual',    glyph: '✦' },
  recurring_trigger: { label: 'Trigger',      glyph: '△' },
  theme:             { label: 'Theme',        glyph: '⬡' },
};

const RESPONSE_OPTIONS: { value: MemberResponse; label: string; description: string; color: string }[] = [
  { value: 'confirmed', label: 'Yes, this lands',    description: 'Recognised as significant',  color: 'text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/10' },
  { value: 'partial',   label: 'Somewhat',           description: 'Partially true',              color: 'text-teal-400   border-teal-500/40   hover:bg-teal-500/10'   },
  { value: 'rejected',  label: "Not my experience",  description: 'Doesn\'t resonate',           color: 'text-slate-400  border-slate-600/40  hover:bg-slate-700/30'  },
  { value: 'retired',   label: 'No longer relevant', description: 'Has passed or changed',       color: 'text-slate-500  border-slate-700/30  hover:bg-slate-800/30'  },
];

function PatternCard({
  pattern,
  onRespond,
}: {
  pattern: Pattern;
  onRespond: (id: string, response: MemberResponse) => Promise<void>;
}) {
  const [responding, setResponding] = useState(false);
  const [submitting, setSubmitting] = useState<MemberResponse | null>(null);
  const scope = SCOPE_LABELS[pattern.scope];
  const hasResponded = pattern.status === 'confirmed' || pattern.status === 'partial' ||
                       pattern.status === 'rejected' || pattern.status === 'retired';

  async function handleRespond(response: MemberResponse) {
    setSubmitting(response);
    try {
      await onRespond(pattern.id, response);
    } finally {
      setSubmitting(null);
      setResponding(false);
    }
  }

  return (
    <div className={`rounded-xl border p-4 transition-colors ${
      hasResponded
        ? 'border-slate-700/30 bg-slate-900/20 opacity-60'
        : 'border-[#D4B896]/20 bg-[#1a1428]/40'
    }`}>
      {/* Scope + confidence */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] text-amber-500/70 font-mono">{scope.glyph}</span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{scope.label}</span>
        <span className="ml-auto text-[10px] text-slate-600">
          {Math.round(pattern.confidence * 100)}% confidence
        </span>
      </div>

      {/* Statement */}
      <p className="text-sm text-slate-200 leading-relaxed mb-1">
        <span className="text-slate-500 text-xs">MAIA has noticed: </span>
        {pattern.statement}
      </p>

      {pattern.context_note && (
        <p className="text-[11px] text-slate-500 italic mt-1">{pattern.context_note}</p>
      )}

      {/* Response area */}
      {hasResponded ? (
        <div className="mt-3 text-xs text-slate-500">
          You responded: <span className="text-slate-400">{pattern.member_response || pattern.status}</span>
        </div>
      ) : responding ? (
        <div className="mt-3 space-y-1.5">
          <p className="text-[10px] text-slate-500 mb-2">Does this resonate?</p>
          <div className="grid grid-cols-2 gap-1.5">
            {RESPONSE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleRespond(opt.value)}
                disabled={submitting !== null}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-colors disabled:opacity-50 ${opt.color}`}
              >
                {submitting === opt.value ? (
                  <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                ) : (
                  opt.label
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => setResponding(false)}
            className="text-[10px] text-slate-600 hover:text-slate-400 mt-1"
          >
            Not now
          </button>
        </div>
      ) : (
        <button
          onClick={() => setResponding(true)}
          className="mt-3 text-[11px] text-amber-500/60 hover:text-amber-400/80 transition-colors"
        >
          Respond to this →
        </button>
      )}
    </div>
  );
}

export function PatternRecognitionView() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/members/patterns');
      if (!res.ok) throw new Error('Failed to load patterns');
      const data = await res.json();
      setPatterns(data.patterns ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleRespond(id: string, response: MemberResponse) {
    const res = await apiFetch(`/api/members/patterns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response }),
    });
    if (!res.ok) throw new Error('Response failed');
    const data = await res.json();
    setPatterns(prev => prev.map(p => p.id === id ? { ...p, ...data.pattern } : p));
  }

  const active = patterns.filter(
    p => p.status !== 'rejected' && p.status !== 'retired'
  );
  const resolved = patterns.filter(
    p => p.status === 'rejected' || p.status === 'retired'
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-500 py-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-xs">Loading patterns…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-xs text-red-400 py-2">
        <AlertCircle className="w-3.5 h-3.5" />
        {error}
      </div>
    );
  }

  if (active.length === 0 && resolved.length === 0) {
    return (
      <p className="text-xs text-stone-500 py-2 italic">
        Patterns will appear here as MAIA notices recurring themes across your conversations.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {active.map(p => (
        <PatternCard key={p.id} pattern={p} onRespond={handleRespond} />
      ))}

      {resolved.length > 0 && (
        <div>
          <button
            onClick={() => setShowResolved(!showResolved)}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-400 transition-colors mt-2"
          >
            {showResolved ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {resolved.length} resolved
          </button>
          {showResolved && (
            <div className="mt-2 space-y-2 opacity-50">
              {resolved.map(p => (
                <PatternCard key={p.id} pattern={p} onRespond={handleRespond} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
