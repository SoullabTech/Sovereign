'use client';

import { useEffect, useState } from 'react';
import type { ThemeSummary } from '@/app/api/members/themes/route';

// ── Human-readable labels ────────────────────────────────────────────────────

const THEME_LABELS: Record<string, string> = {
  field_awareness:    'Field Awareness',
  pattern_recurrence: 'Pattern Recurrence',
  embodied_coherence: 'Embodied Coherence',
  adaptive_unfolding: 'Adaptive Unfolding',
  wise_acceptance:    'Wise Acceptance',
  ripeness:           'Ripeness',
};

// ── Element accent colours (subtle, consistent with app palette) ─────────────

const ELEMENT_DOT: Record<string, string> = {
  fire:   'bg-orange-400/70',
  water:  'bg-blue-400/70',
  earth:  'bg-emerald-400/70',
  air:    'bg-sky-300/70',
  aether: 'bg-violet-400/70',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <div className="h-2 w-2 animate-pulse rounded-full bg-white/15" />
          <div className="h-4 w-36 animate-pulse rounded bg-white/10" />
          <div className="ml-auto h-3 w-12 animate-pulse rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <p className="text-sm text-white/40 py-2">
      Themes surface as you have more conversations with MAIA.
    </p>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function RecurringThemesCard() {
  const [themes, setThemes]     = useState<ThemeSummary[]>([]);
  const [loading, setLoading]   = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setHasError(false);

        const res = await fetch('/api/members/themes?days=30', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });

        if (!res.ok) {
          // 401 = not signed in — don't show error, just hide
          if (res.status === 401) return;
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        if (mounted) {
          setThemes((data.themes ?? []).slice(0, 3));
        }
      } catch {
        if (mounted) setHasError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/80">Recurring Themes</h3>
        <span className="text-xs text-white/35">last 30 days</span>
      </div>

      {/* Body */}
      {loading ? (
        <Skeleton />
      ) : hasError ? (
        <p className="text-sm text-white/40 py-2">Unable to load themes right now.</p>
      ) : themes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          {themes.map((t) => {
            const label     = THEME_LABELS[t.theme] ?? t.theme.replace(/_/g, ' ');
            const dotClass  = t.element ? (ELEMENT_DOT[t.element] ?? 'bg-white/30') : 'bg-white/20';
            const resonance = t.strongest_resonance != null
              ? Math.round(t.strongest_resonance * 100)
              : null;

            return (
              <div
                key={t.theme}
                className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3"
              >
                {/* Element dot */}
                <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass}`} />

                {/* Theme label */}
                <span className="flex-1 text-sm text-white/75">{label}</span>

                {/* Count badge */}
                <span className="shrink-0 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs text-white/55">
                  {t.count}×
                </span>

                {/* Resonance bar (soft) */}
                {resonance != null && (
                  <div className="shrink-0 h-1 w-14 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-white/35"
                      style={{ width: `${resonance}%` }}
                    />
                  </div>
                )}

                {/* Recency */}
                <span className="shrink-0 text-xs text-white/35">
                  {formatRecency(t.latest_detected_at)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      {!loading && !hasError && themes.length > 0 && (
        <p className="mt-4 text-xs text-white/30">
          These are structural patterns detected across your conversations — not diagnoses.
        </p>
      )}
    </div>
  );
}
