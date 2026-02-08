'use client';

/**
 * STATE CARD
 *
 * Visual rendering of MAIA's State Vector reading.
 * Shows the member "where they are" in the first 10 seconds.
 *
 * Design principles:
 * - Descriptive, not prescriptive. The card observes; it does not tell.
 * - Minimal: element, polarity, kairos, and one move. Nothing else initially.
 * - Expandable: confidence, evidence, and full vector available on tap.
 * - No ranking: no element is "better" than another.
 * - Sovereignty: the member can always dismiss or override.
 */

import React, { useState } from 'react';
import {
  Flame, Droplets, Mountain, Wind, Sparkles,
  ChevronDown, ChevronUp, Activity
} from 'lucide-react';

// ── Types (aligned with lib/maia/state-vector/types.ts) ────────────────

type Element = 'earth' | 'water' | 'fire' | 'air' | 'aether';
type Intensity = 'low' | 'medium' | 'high';
type KairosAssessment = 'stable' | 'transition' | 'threshold' | 'integration' | 'collapse-risk';

interface ElementalReading {
  element: Element;
  intensity: Intensity;
  polarity: 1 | 2 | 3 | 4 | 5;
  stability: 1 | 2 | 3 | 4 | 5;
  phase?: 'entering' | 'in' | 'exiting';
}

interface StateVectorData {
  primary: ElementalReading;
  secondary?: ElementalReading;
  confidence: number;
  kairos: {
    assessment: KairosAssessment;
    confidence: number;
    description?: string;
  };
  movement: {
    entering: Element[];
    exiting: Element[];
    trajectory: string;
    velocity: number;
  };
}

interface PracticeData {
  primary: {
    id: string;
    title: string;
    element: string;
    category: string;
    duration?: string;
    instructions: string[];
    reflectionPrompt?: string;
  };
  rationale: string;
  duration: 'micro' | 'short' | 'full';
  contraindications: string[];
}

interface StateCardProps {
  stateVector: StateVectorData | null;
  practice?: PracticeData | null;
  onDismiss?: () => void;
}

// ── Element visual config ──────────────────────────────────────────────

const ELEMENT_CONFIG: Record<Element, {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
}> = {
  fire: {
    icon: <Flame className="w-5 h-5" />,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    borderColor: 'border-orange-400/20',
    label: 'Fire',
  },
  water: {
    icon: <Droplets className="w-5 h-5" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/20',
    label: 'Water',
  },
  earth: {
    icon: <Mountain className="w-5 h-5" />,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    label: 'Earth',
  },
  air: {
    icon: <Wind className="w-5 h-5" />,
    color: 'text-sky-300',
    bgColor: 'bg-sky-300/10',
    borderColor: 'border-sky-300/20',
    label: 'Air',
  },
  aether: {
    icon: <Sparkles className="w-5 h-5" />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400/20',
    label: 'Aether',
  },
};

const KAIROS_CONFIG: Record<KairosAssessment, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  'stable': { label: 'Settled', color: 'text-emerald-400', bgColor: 'bg-emerald-400/10' },
  'transition': { label: 'Shifting', color: 'text-amber-400', bgColor: 'bg-amber-400/10' },
  'threshold': { label: 'Threshold', color: 'text-orange-400', bgColor: 'bg-orange-400/10' },
  'integration': { label: 'Integrating', color: 'text-violet-400', bgColor: 'bg-violet-400/10' },
  'collapse-risk': { label: 'Ground First', color: 'text-red-400', bgColor: 'bg-red-400/10' },
};

const POLARITY_LABELS: Record<number, string> = {
  1: 'Deeply contractive',
  2: 'Contractive',
  3: 'Balanced',
  4: 'Expansive',
  5: 'Fully expansive',
};

const DURATION_LABELS: Record<string, string> = {
  'micro': '< 15 min',
  'short': '15-25 min',
  'full': '25+ min',
};

// ── Component ──────────────────────────────────────────────────────────

export function StateCard({ stateVector, practice, onDismiss }: StateCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (!stateVector) return null;

  const { primary, secondary, confidence, kairos, movement } = stateVector;
  const elConfig = ELEMENT_CONFIG[primary.element];
  const secConfig = secondary ? ELEMENT_CONFIG[secondary.element] : null;
  const kairosConfig = KAIROS_CONFIG[kairos.assessment];

  return (
    <div
      className={`
        rounded-2xl border ${elConfig.borderColor} ${elConfig.bgColor}
        p-4 shadow-sm transition-all duration-300 ease-out
        backdrop-blur-sm
      `}
    >
      {/* ── Header: Element + Kairos ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={elConfig.color}>{elConfig.icon}</span>
          <div>
            <div className={`text-lg font-semibold ${elConfig.color}`}>
              {elConfig.label}
              {secConfig && (
                <span className={`text-sm font-normal ${secConfig.color} ml-1.5`}>
                  + {secConfig.label}
                </span>
              )}
            </div>
            <div className="text-xs text-white/40 mt-0.5">
              {POLARITY_LABELS[primary.polarity] || 'Balanced'}
              {primary.intensity !== 'medium' && ` | ${primary.intensity} intensity`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${kairosConfig.bgColor} ${kairosConfig.color}`}>
            {kairosConfig.label}
          </span>
          {confidence < 0.55 && (
            <span className="text-xs text-white/30" title="Low confidence reading">
              ~
            </span>
          )}
        </div>
      </div>

      {/* ── Kairos description (when present) ── */}
      {kairos.description && (
        <p className="mt-2 text-sm text-white/50 leading-relaxed">
          {kairos.description}
        </p>
      )}

      {/* ── Movement (when elements are entering/exiting) ── */}
      {(movement.entering.length > 0 || movement.exiting.length > 0) && (
        <div className="mt-2 flex items-center gap-2 text-xs text-white/40">
          <Activity className="w-3 h-3" />
          {movement.entering.length > 0 && (
            <span>entering {movement.entering.map(e => ELEMENT_CONFIG[e].label.toLowerCase()).join(', ')}</span>
          )}
          {movement.exiting.length > 0 && (
            <span>{movement.entering.length > 0 ? ' | ' : ''}leaving {movement.exiting.map(e => ELEMENT_CONFIG[e].label.toLowerCase()).join(', ')}</span>
          )}
        </div>
      )}

      {/* ── One Move (practice recommendation) ── */}
      {practice && practice.primary && (
        <div className="mt-3 rounded-xl bg-black/20 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50">
              One move
              {practice.duration && (
                <span className="ml-1.5 text-white/30">
                  {DURATION_LABELS[practice.duration] || practice.duration}
                </span>
              )}
            </span>
          </div>
          <div className="mt-1 text-sm font-medium text-white/90">
            {practice.primary.title}
          </div>
          {practice.rationale && expanded && (
            <p className="mt-1.5 text-xs text-white/40 leading-relaxed">
              {practice.rationale}
            </p>
          )}
        </div>
      )}

      {/* ── Expand/Collapse toggle ── */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-2 flex items-center gap-1 text-xs text-white/30 hover:text-white/50 transition-colors"
      >
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {expanded ? 'Less' : 'More'}
      </button>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div className="mt-3 space-y-2 border-t border-white/5 pt-3">
          {/* Stability */}
          <div className="flex justify-between text-xs">
            <span className="text-white/40">Stability</span>
            <span className="text-white/60">
              {primary.stability <= 2 ? 'Settled' : primary.stability === 3 ? 'Moderate flux' : primary.stability === 4 ? 'Unsettled' : 'Volatile'}
            </span>
          </div>

          {/* Confidence */}
          <div className="flex justify-between text-xs">
            <span className="text-white/40">Confidence</span>
            <span className="text-white/60">{Math.round(confidence * 100)}%</span>
          </div>

          {/* Secondary element detail */}
          {secondary && secConfig && (
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Secondary</span>
              <span className={secConfig.color}>
                {secConfig.label} | {secondary.intensity} | {POLARITY_LABELS[secondary.polarity]?.toLowerCase()}
              </span>
            </div>
          )}

          {/* Trajectory */}
          {movement.trajectory !== 'still' && (
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Trajectory</span>
              <span className="text-white/60 capitalize">{movement.trajectory}</span>
            </div>
          )}

          {/* Contraindications */}
          {practice?.contraindications && practice.contraindications.length > 0 && (
            <div className="mt-2">
              <span className="text-xs text-white/30">Be aware</span>
              {practice.contraindications.map((c, i) => (
                <p key={i} className="text-xs text-white/40 mt-1 leading-relaxed">{c}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
