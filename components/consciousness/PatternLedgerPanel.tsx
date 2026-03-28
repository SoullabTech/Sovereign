'use client';

import { useEffect, useState } from 'react';
import type { ThemeSummary } from '@/app/api/members/themes/route';

// ── Theme display metadata ──────────────────────────────────────────────────

const THEME_META: Record<string, { label: string; description: string }> = {
  field_awareness: {
    label: 'Field Awareness',
    description: 'What\'s present beyond what belongs only to you.',
  },
  pattern_recurrence: {
    label: 'Pattern Recurrence',
    description: 'Old themes arriving again in new forms.',
  },
  embodied_coherence: {
    label: 'Embodied Coherence',
    description: 'The degree of alignment between intention and embodied state.',
  },
  adaptive_unfolding: {
    label: 'Adaptive Unfolding',
    description: 'Where choice and meaning-making shape what unfolds.',
  },
  wise_acceptance: {
    label: 'Wise Acceptance',
    description: 'Energy bound around what can\'t be changed.',
  },
  ripeness: {
    label: 'Ripeness',
    description: 'A quality of timing — readiness, emergence.',
  },
};

// ── Element colours ─────────────────────────────────────────────────────────

const ELEMENT_ACCENT: Record<string, { dot: string; bar: string; text: string }> = {
  fire:   { dot: 'bg-orange-400/70',  bar: 'bg-orange-400/40', text: 'text-orange-300/60' },
  water:  { dot: 'bg-blue-400/70',    bar: 'bg-blue-400/40',   text: 'text-blue-300/60' },
  earth:  { dot: 'bg-emerald-400/70', bar: 'bg-emerald-400/40',text: 'text-emerald-300/60' },
  air:    { dot: 'bg-sky-300/70',     bar: 'bg-sky-300/40',    text: 'text-sky-300/60' },
  aether: { dot: 'bg-violet-400/70',  bar: 'bg-violet-400/40', text: 'text-violet-300/60' },
};

const DEFAULT_ACCENT = { dot: 'bg-white/30', bar: 'bg-white/20', text: 'text-white/40' };

// ── Trajectory logic ────────────────────────────────────────────────────────

type TrajectoryStatus =
  | 'integrating'   // Moving toward integration
  | 'active'        // Present and engaged
  | 'persisting'    // Recurring without resolution
  | 'blocked'       // Resistance detected
  | 'emerging';     // Just beginning to surface

function deriveTrajectory(t: ThemeSummary): { status: TrajectoryStatus; label: string } {
  const { signal_types: s, count } = t;

  // If most recent signals show integrating, that's the trajectory
  if (s.integrating > 0 && s.integrating >= s.blocked) {
    return { status: 'integrating', label: 'Integrating' };
  }

  // If blocked signals dominate, flag it
  if (s.blocked > s.active && s.blocked > s.integrating) {
    return { status: 'blocked', label: 'Meeting resistance' };
  }

  // If count is high but no integrating signals, it's persisting
  if (count >= 5 && s.integrating === 0) {
    return { status: 'persisting', label: 'Persisting' };
  }

  // Low count = emerging
  if (count <= 2) {
    return { status: 'emerging', label: 'Emerging' };
  }

  return { status: 'active', label: 'Active' };
}

const TRAJECTORY_STYLE: Record<TrajectoryStatus, string> = {
  integrating: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  active:      'border-amber-500/30 bg-amber-500/10 text-amber-400',
  persisting:  'border-orange-500/30 bg-orange-500/10 text-orange-400',
  blocked:     'border-red-400/30 bg-red-400/10 text-red-400',
  emerging:    'border-sky-500/30 bg-sky-500/10 text-sky-400',
};

// ── Time formatting ─────────────────────────────────────────────────────────

function formatSpan(first: string, last: string): string {
  const firstDate = new Date(first);
  const lastDate = new Date(last);
  const diffDays = Math.floor((lastDate.getTime() - firstDate.getTime()) / 86_400_000);

  if (diffDays === 0) return 'first appeared today';
  if (diffDays === 1) return 'over 1 day';
  if (diffDays < 7) return `over ${diffDays} days`;
  if (diffDays < 14) return 'over 1 week';
  if (diffDays < 30) return `over ${Math.floor(diffDays / 7)} weeks`;
  return `over ${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''}`;
}

function formatRecency(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

// ── Signal type bar ─────────────────────────────────────────────────────────

function SignalDistribution({ types, total }: { types: ThemeSummary['signal_types']; total: number }) {
  if (total === 0) return null;

  const segments = [
    { key: 'integrating', count: types.integrating, color: 'bg-emerald-400/60' },
    { key: 'active',      count: types.active,      color: 'bg-amber-400/50' },
    { key: 'emerging',    count: types.emerging,     color: 'bg-sky-400/50' },
    { key: 'blocked',     count: types.blocked,      color: 'bg-red-400/50' },
  ].filter(s => s.count > 0);

  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-white/5">
      {segments.map(s => (
        <div
          key={s.key}
          className={`h-full ${s.color}`}
          style={{ width: `${(s.count / total) * 100}%` }}
        />
      ))}
    </div>
  );
}

// ── Loading skeleton ────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map(i => (
        <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
          <div className="mt-3 h-3 w-full animate-pulse rounded bg-white/8" />
          <div className="mt-4 h-1.5 w-full animate-pulse rounded-full bg-white/5" />
        </div>
      ))}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

interface PatternLedgerPanelProps {
  /** Number of days to look back. Default 30, max 90. */
  windowDays?: number;
}

export default function PatternLedgerPanel({ windowDays = 30 }: PatternLedgerPanelProps) {
  const [themes, setThemes]     = useState<ThemeSummary[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setHasError(false);

        const res = await fetch(`/api/members/themes?days=${windowDays}`, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });

        if (!res.ok) {
          if (res.status === 401) return; // not signed in — hide quietly
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        if (mounted) {
          setThemes(data.themes ?? []);
          setTotal(data.total_signals ?? 0);
        }
      } catch {
        if (mounted) setHasError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [windowDays]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium text-white/90">
          What your process keeps returning to
        </h2>
        <p className="mt-1 text-sm text-white/40">
          Structural patterns detected across your conversations — not diagnoses.
        </p>
      </div>

      {/* Body */}
      {loading ? (
        <Skeleton />
      ) : hasError ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Unable to load patterns right now.</p>
        </div>
      ) : themes.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/60">
            Patterns surface as you have more conversations with MAIA.
          </p>
          <p className="mt-2 text-xs text-white/30">
            Theme detection runs automatically — no action needed on your part.
          </p>
        </div>
      ) : (
        <>
          {/* Summary line */}
          <p className="text-xs text-white/30">
            {total} signal{total !== 1 ? 's' : ''} detected in the last {windowDays} days
          </p>

          {/* Theme cards */}
          <div className="space-y-3">
            {themes.map(t => {
              const meta = THEME_META[t.theme] ?? {
                label: t.theme.replace(/_/g, ' '),
                description: '',
              };
              const accent = t.element
                ? (ELEMENT_ACCENT[t.element] ?? DEFAULT_ACCENT)
                : DEFAULT_ACCENT;
              const trajectory = deriveTrajectory(t);
              const span = formatSpan(t.first_detected_at, t.latest_detected_at);

              return (
                <div
                  key={t.theme}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 transition-colors hover:border-white/12"
                >
                  {/* Top row: element dot + label + trajectory badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${accent.dot}`} />
                      <span className="text-sm font-medium text-white/85">{meta.label}</span>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs ${TRAJECTORY_STYLE[trajectory.status]}`}
                    >
                      {trajectory.label}
                    </span>
                  </div>

                  {/* Description */}
                  {meta.description && (
                    <p className="mt-2 text-sm text-white/45 leading-relaxed">
                      {meta.description}
                    </p>
                  )}

                  {/* Signal distribution bar */}
                  <div className="mt-3">
                    <SignalDistribution types={t.signal_types} total={t.count} />
                  </div>

                  {/* Meta row: count, span, recency */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/35">
                    <span>{t.count} appearance{t.count !== 1 ? 's' : ''}</span>
                    <span>{span}</span>
                    <span>last seen {formatRecency(t.latest_detected_at)}</span>
                    {t.element && (
                      <span className={accent.text}>{t.element}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
