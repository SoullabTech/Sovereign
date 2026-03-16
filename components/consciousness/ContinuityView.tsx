'use client';

/**
 * ContinuityView — A symbolic mirror of the member's spiral journey.
 *
 * Shows WHERE the member is in the spiral — not what they said.
 * Structural position made visible. Not analytics. Not metrics.
 * A mirror, not a dashboard.
 *
 * Design principles:
 * - Sparse. One glance should be enough.
 * - Symbolic, not clinical. Glyphs, not bar charts.
 * - No judgment. No element is better. No phase is preferred.
 * - Honest about absence: if there's no state yet, say so plainly.
 */

import { useEffect, useState } from 'react';
import { Flame, Droplets, Mountain, Wind, Sparkles } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────

type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';
type SpiralMotion = 'ascending' | 'stuck' | 'breakthrough';

interface SpiralState {
  dominant_element: Element;
  phase: number;
  motion: SpiralMotion | null;
  intensity: number | null;
  relational_phase: number;
  autonomy_streak: number;
  return_count: number;
  updated_at: string;
}

// ── Element config (matches StateCard.tsx palette) ─────────────────────

const ELEMENT_CONFIG: Record<Element, {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
  glyph: string;
  quality: string;
}> = {
  fire: {
    icon: <Flame className="w-4 h-4" />,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    borderColor: 'border-orange-400/20',
    label: 'Fire',
    glyph: '△',
    quality: 'Transformation, will, illumination',
  },
  water: {
    icon: <Droplets className="w-4 h-4" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/20',
    label: 'Water',
    glyph: '▽',
    quality: 'Feeling, depth, reception',
  },
  earth: {
    icon: <Mountain className="w-4 h-4" />,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    label: 'Earth',
    glyph: '◻',
    quality: 'Ground, embodiment, patience',
  },
  air: {
    icon: <Wind className="w-4 h-4" />,
    color: 'text-sky-300',
    bgColor: 'bg-sky-300/10',
    borderColor: 'border-sky-300/20',
    label: 'Air',
    glyph: '◇',
    quality: 'Clarity, perspective, movement',
  },
  aether: {
    icon: <Sparkles className="w-4 h-4" />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400/20',
    label: 'Aether',
    glyph: '✦',
    quality: 'Integration, threshold, potential',
  },
};

// ── Phase labels (Spiralogic 12-phase) ────────────────────────────────

const PHASE_LABELS: Record<number, string> = {
  1:  'Seed',
  2:  'Root',
  3:  'Emergence',
  4:  'Growth',
  5:  'Flowering',
  6:  'Fruition',
  7:  'Harvest',
  8:  'Release',
  9:  'Descent',
  10: 'Rest',
  11: 'Gestation',
  12: 'Return',
};

// ── Relational phase labels ────────────────────────────────────────────

const RELATIONAL_PHASE_LABELS: Record<number, { label: string; description: string }> = {
  1: { label: 'Orientation',      description: 'Finding the ground' },
  2: { label: 'Capacity',         description: 'Deepening range' },
  3: { label: 'Autonomy',         description: 'Moving into your own authority' },
  4: { label: 'Seasonal Return',  description: 'Returning from a place of wholeness' },
};

// ── Motion labels ──────────────────────────────────────────────────────

const MOTION_CONFIG: Record<SpiralMotion, { label: string; color: string; symbol: string }> = {
  ascending:    { label: 'ascending',    color: 'text-emerald-400', symbol: '↑' },
  stuck:        { label: 'in tension',   color: 'text-amber-400',   symbol: '—' },
  breakthrough: { label: 'breakthrough', color: 'text-sky-300',     symbol: '↗' },
};

// ── Helpers ────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// ── Component ──────────────────────────────────────────────────────────

export function ContinuityView() {
  const [state, setState] = useState<SpiralState | null>(null);
  const [loading, setLoading] = useState(true);
  const [noState, setNoState] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const headers: Record<string, string> = {};
        try {
          const stored = localStorage.getItem('beta_user');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed?.id) headers['x-member-id'] = parsed.id;
          }
        } catch {}

        const res = await fetch('/api/members/spiral-state', { headers });

        if (res.status === 204) {
          setNoState(true);
          return;
        }
        if (!res.ok) {
          setError(true);
          return;
        }

        const data = await res.json();
        setState(data.state);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="py-8 flex items-center justify-center">
        <div className="w-1 h-1 rounded-full bg-stone-600 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-stone-600 italic py-4">
        Unable to load spiral state.
      </p>
    );
  }

  if (noState || !state) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-stone-500">
          Your spiral position will appear here after your first conversation.
        </p>
      </div>
    );
  }

  const el = ELEMENT_CONFIG[state.dominant_element];
  const phaseLabel = PHASE_LABELS[state.phase] ?? `Phase ${state.phase}`;
  const relational = RELATIONAL_PHASE_LABELS[state.relational_phase];
  const motion = state.motion ? MOTION_CONFIG[state.motion] : null;

  return (
    <div className="space-y-5">
      {/* Element + Phase — primary position */}
      <div className={`rounded-lg border ${el.borderColor} ${el.bgColor} p-5`}>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className={`flex items-center gap-2 ${el.color}`}>
              {el.icon}
              <span className="text-lg font-light tracking-wide">{el.label}</span>
              <span className="text-2xl font-light opacity-60">{el.glyph}</span>
            </div>
            <p className="text-xs text-stone-500">{el.quality}</p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-medium ${el.color}`}>{phaseLabel}</p>
            <p className="text-xs text-stone-500">Phase {state.phase} of 12</p>
          </div>
        </div>

        {/* Motion indicator */}
        {motion && (
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
            <span className={`text-sm ${motion.color}`}>{motion.symbol}</span>
            <span className={`text-xs ${motion.color}`}>{motion.label}</span>
          </div>
        )}
      </div>

      {/* Relational phase */}
      {relational && (
        <div className="rounded-lg border border-stone-800 bg-stone-900/40 p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-xs text-stone-400 uppercase tracking-widest">Relational</p>
            <p className="text-xs text-stone-600">Phase {state.relational_phase} of 4</p>
          </div>
          <p className="mt-1 text-sm text-stone-200">{relational.label}</p>
          <p className="text-xs text-stone-500 mt-0.5">{relational.description}</p>
        </div>
      )}

      {/* Autonomy — only show if meaningful */}
      {state.autonomy_streak > 0 && (
        <div className="rounded-lg border border-stone-800 bg-stone-900/40 p-4">
          <p className="text-xs text-stone-400 uppercase tracking-widest">Autonomy</p>
          <p className="mt-1 text-sm text-stone-200">
            {state.autonomy_streak} session{state.autonomy_streak !== 1 ? 's' : ''} moving
            under your own authority
          </p>
          {state.return_count > 0 && (
            <p className="text-xs text-stone-500 mt-0.5">
              Returned {state.return_count} time{state.return_count !== 1 ? 's' : ''} after periods of independence
            </p>
          )}
        </div>
      )}

      {/* Last updated */}
      <p className="text-xs text-stone-700 text-right">
        Updated {formatDate(state.updated_at)}
      </p>
    </div>
  );
}
