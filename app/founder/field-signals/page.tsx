'use client';

/**
 * Founder Field Signals
 *
 * Read-only observability surface for participatory reality theme signals
 * stored in `member_theme_signals` (deployed 2026-03-16).
 *
 * Founder-only — protected at the API layer by `requireFounder()`.
 * The page itself relies on the founder layout's feature-flag gate
 * for client-side scoping; the API is the actual auth boundary.
 *
 * Note on canon: PR #157's `canonComplianceEvaluator` is not on this
 * branch, so canon compliance flags are not surfaced here. When the
 * evaluator lands and writes to `maia_turns.observer_insights`, a
 * sibling panel can carry that stream.
 *
 * v1 scope:
 *   • List recent theme signals, newest first, LIMIT 200
 *   • Filters: window, theme, signal type, element
 *   • No content shown — table stores structural metadata only
 *   • No exports, no aggregation, no charts
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  Filter,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

type WindowKey = '24h' | '7d' | '30d';
type SignalType = 'active' | 'emerging' | 'blocked' | 'integrating';
type ElementKey = 'fire' | 'water' | 'earth' | 'air' | 'aether';
type ThemeKey =
  | 'field_awareness'
  | 'pattern_recurrence'
  | 'embodied_coherence'
  | 'adaptive_unfolding'
  | 'wise_acceptance'
  | 'ripeness';

interface SignalRow {
  id: string;
  memberId: string;
  sessionId: string | null;
  journalEntryId: string | null;
  theme: ThemeKey;
  signalType: SignalType;
  resonanceStrength: number | null;
  element: ElementKey | null;
  context: Record<string, unknown>;
  detectedAt: string;
}

interface FieldSignalsResponse {
  signals: SignalRow[];
  count: number;
  window: WindowKey;
  filters: {
    theme: ThemeKey | null;
    signalType: SignalType | null;
    element: ElementKey | null;
  };
  canonStreamActive: false;
  canonStreamNote: string;
}

const THEME_LABELS: Record<ThemeKey, string> = {
  field_awareness: 'Field Awareness',
  pattern_recurrence: 'Pattern Recurrence',
  embodied_coherence: 'Embodied Coherence',
  adaptive_unfolding: 'Adaptive Unfolding',
  wise_acceptance: 'Wise Acceptance',
  ripeness: 'Ripeness',
};

const THEME_KEYS: ThemeKey[] = [
  'field_awareness',
  'pattern_recurrence',
  'embodied_coherence',
  'adaptive_unfolding',
  'wise_acceptance',
  'ripeness',
];

const SIGNAL_TYPE_LABELS: Record<SignalType, string> = {
  active: 'Active',
  emerging: 'Emerging',
  blocked: 'Blocked',
  integrating: 'Integrating',
};

const SIGNAL_TYPE_KEYS: SignalType[] = [
  'active',
  'emerging',
  'blocked',
  'integrating',
];

const SIGNAL_TYPE_STYLE: Record<SignalType, string> = {
  active: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  emerging: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  blocked: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  integrating: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

const ELEMENT_KEYS: ElementKey[] = ['fire', 'water', 'earth', 'air', 'aether'];

const ELEMENT_GLYPH: Record<ElementKey, string> = {
  fire: '△',
  water: '▽',
  earth: '⬢',
  air: '◯',
  aether: '✶',
};

type ResonanceBucket = 'high' | 'medium' | 'low' | 'unknown';

function bucketResonance(r: number | null): ResonanceBucket {
  if (r == null) return 'unknown';
  if (r >= 0.75) return 'high';
  if (r >= 0.55) return 'medium';
  return 'low';
}

const RESONANCE_STYLE: Record<ResonanceBucket, string> = {
  high: 'text-amber-200',
  medium: 'text-amber-300/70',
  low: 'text-white/45',
  unknown: 'text-white/30',
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function shortId(id: string | null, chars = 8): string {
  return id ? id.slice(0, chars) : '—';
}

function contextPreview(ctx: Record<string, unknown>): string {
  const keys = Object.keys(ctx);
  if (keys.length === 0) return '';
  const parts: string[] = [];
  for (const k of keys.slice(0, 3)) {
    const v = ctx[k];
    const valStr = typeof v === 'string' ? v : JSON.stringify(v);
    if (valStr.length > 24) {
      parts.push(`${k}: ${valStr.slice(0, 22)}…`);
    } else {
      parts.push(`${k}: ${valStr}`);
    }
  }
  return parts.join(' · ');
}

export default function FieldSignalsPage() {
  const [signals, setSignals] = useState<SignalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canonNote, setCanonNote] = useState<string>(
    'Canon compliance stream not active on this branch.',
  );

  const [windowKey, setWindowKey] = useState<WindowKey>('7d');
  const [themeFilter, setThemeFilter] = useState<ThemeKey | ''>('');
  const [signalFilter, setSignalFilter] = useState<SignalType | ''>('');
  const [elementFilter, setElementFilter] = useState<ElementKey | ''>('');

  const fetchSignals = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ window: windowKey });
    if (themeFilter) params.set('theme', themeFilter);
    if (signalFilter) params.set('signal', signalFilter);
    if (elementFilter) params.set('element', elementFilter);
    try {
      const res = await fetch(
        `/api/founder/field-signals?${params.toString()}`,
        { cache: 'no-store' },
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(body?.error ?? `Request failed (${res.status})`);
        setSignals([]);
        return;
      }
      const json = (await res.json()) as FieldSignalsResponse;
      setSignals(json.signals);
      if (json.canonStreamNote) setCanonNote(json.canonStreamNote);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
      setSignals([]);
    } finally {
      setLoading(false);
    }
  }, [windowKey, themeFilter, signalFilter, elementFilter]);

  useEffect(() => {
    void fetchSignals();
  }, [fetchSignals]);

  return (
    <div className="text-[var(--sl-text-primary)]">
      <header className="mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[var(--sl-accent-admin)]" />
          <h1 className="text-lg font-semibold">Field Signals</h1>
        </div>
        <p className="mt-1 text-sm text-[var(--sl-text-muted)]">
          Recent participatory theme signals. Read-only. Structural metadata
          only — no session content is stored or shown.
        </p>
        <p className="mt-2 text-xs text-[var(--sl-text-muted)]/70">
          {canonNote}
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)] px-3 py-2.5">
        <Filter className="h-3.5 w-3.5 text-[var(--sl-text-muted)]" />

        <select
          value={windowKey}
          onChange={(e) => setWindowKey(e.target.value as WindowKey)}
          className="rounded-md border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-elevated)] px-2 py-1 text-xs text-[var(--sl-text-secondary)]"
          aria-label="Time window"
        >
          <option value="24h">24h</option>
          <option value="7d">7d</option>
          <option value="30d">30d</option>
        </select>

        <select
          value={themeFilter}
          onChange={(e) => setThemeFilter(e.target.value as ThemeKey | '')}
          className="rounded-md border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-elevated)] px-2 py-1 text-xs text-[var(--sl-text-secondary)]"
          aria-label="Theme filter"
        >
          <option value="">All themes</option>
          {THEME_KEYS.map((k) => (
            <option key={k} value={k}>
              {THEME_LABELS[k]}
            </option>
          ))}
        </select>

        <select
          value={signalFilter}
          onChange={(e) => setSignalFilter(e.target.value as SignalType | '')}
          className="rounded-md border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-elevated)] px-2 py-1 text-xs text-[var(--sl-text-secondary)]"
          aria-label="Signal type filter"
        >
          <option value="">All types</option>
          {SIGNAL_TYPE_KEYS.map((k) => (
            <option key={k} value={k}>
              {SIGNAL_TYPE_LABELS[k]}
            </option>
          ))}
        </select>

        <select
          value={elementFilter}
          onChange={(e) =>
            setElementFilter(e.target.value as ElementKey | '')
          }
          className="rounded-md border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-elevated)] px-2 py-1 text-xs text-[var(--sl-text-secondary)]"
          aria-label="Element filter"
        >
          <option value="">All elements</option>
          {ELEMENT_KEYS.map((k) => (
            <option key={k} value={k}>
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2 text-[11px] text-[var(--sl-text-muted)]">
          <span>
            {signals.length} {signals.length === 1 ? 'signal' : 'signals'}
          </span>
          <button
            onClick={() => void fetchSignals()}
            disabled={loading}
            className="ml-2 inline-flex items-center gap-1 rounded border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-elevated)] px-2 py-1 text-[var(--sl-text-secondary)] hover:text-[var(--sl-text-primary)] disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)]">
        {loading && signals.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-[var(--sl-text-muted)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading…</span>
          </div>
        ) : error ? (
          <div className="px-4 py-12 text-center text-sm text-rose-300/80">
            {error}
          </div>
        ) : signals.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <Activity className="mx-auto mb-3 h-6 w-6 text-[var(--sl-text-muted)]" />
            <p className="text-sm text-[var(--sl-text-muted)]">
              No signals in this window.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--sl-border-subtle)]">
            {signals.map((s) => {
              const ctxPreview = contextPreview(s.context ?? {});
              const resBucket = bucketResonance(s.resonanceStrength);
              return (
                <li
                  key={s.id}
                  className="px-4 py-3 hover:bg-[var(--sl-bg-elevated)]/40"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <span className="text-sm font-medium text-[var(--sl-text-primary)]">
                      {THEME_LABELS[s.theme]}
                    </span>
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${SIGNAL_TYPE_STYLE[s.signalType]}`}
                    >
                      {SIGNAL_TYPE_LABELS[s.signalType]}
                    </span>
                    {s.element && (
                      <span className="text-xs text-[var(--sl-text-muted)]">
                        <span aria-hidden>{ELEMENT_GLYPH[s.element]}</span>{' '}
                        {s.element}
                      </span>
                    )}
                    <span
                      className={`text-xs tabular-nums ${RESONANCE_STYLE[resBucket]}`}
                    >
                      {s.resonanceStrength != null
                        ? `r ${s.resonanceStrength.toFixed(2)}`
                        : 'r —'}
                    </span>
                    <span className="ml-auto text-[11px] text-[var(--sl-text-muted)]">
                      {relativeTime(s.detectedAt)}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 text-[11px] text-[var(--sl-text-muted)]">
                    <span>member {shortId(s.memberId)}</span>
                    <span>session {shortId(s.sessionId)}</span>
                    {s.journalEntryId && (
                      <span>journal {shortId(s.journalEntryId)}</span>
                    )}
                    {ctxPreview && (
                      <span className="text-[var(--sl-text-muted)]/80">
                        {ctxPreview}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
