'use client';

/**
 * Practitioner Loop Indicator
 *
 * Evidence strength display for the Field → Inquiry → Observations → Council → Experiment → Follow-up loop.
 * Each pill reflects evidence density, not just presence:
 *
 *   grey   = no evidence
 *   blue   = minimal (1–2 items / early stage)
 *   amber  = developing (3–6 / confirmed)
 *   green  = strong (7+ / revised or longitudinal)
 *
 * The current edge (rightmost active stage without completion beyond it) is marked with ▶.
 */

import type { PractitionerLoopState } from '@/lib/studio/practitioner/types';
import { Activity, MessageSquare, Eye, Sparkles, FlaskConical, Target } from 'lucide-react';

type EvidenceStrength = 'none' | 'minimal' | 'developing' | 'strong';

function fieldStrength(count: number): EvidenceStrength {
  if (count === 0) return 'none';
  if (count <= 2) return 'minimal';
  if (count <= 5) return 'developing';
  return 'strong';
}

function inquiryStrength(count: number): EvidenceStrength {
  if (count === 0) return 'none';
  if (count <= 3) return 'minimal';
  if (count <= 8) return 'developing';
  return 'strong';
}

function obsStrength(count: number): EvidenceStrength {
  if (count === 0) return 'none';
  if (count <= 2) return 'minimal';
  if (count <= 6) return 'developing';
  return 'strong';
}

function councilStrength(iterationCount: number): EvidenceStrength {
  if (iterationCount === 0) return 'none';
  if (iterationCount === 1) return 'minimal';
  if (iterationCount <= 2) return 'developing';
  return 'strong';
}

function experimentStrength(count: number): EvidenceStrength {
  if (count === 0) return 'none';
  if (count === 1) return 'minimal';
  if (count <= 3) return 'developing';
  return 'strong';
}

function followUpStrength(hasFollowUp: boolean): EvidenceStrength {
  return hasFollowUp ? 'minimal' : 'none';
}

const STRENGTH_PILL: Record<EvidenceStrength, string> = {
  none:       'bg-slate-800/60 text-slate-600 border border-slate-700/30',
  minimal:    'bg-blue-900/30 text-blue-400 border border-blue-700/30',
  developing: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  strong:     'bg-emerald-900/20 text-emerald-300 border border-emerald-600/30',
};

const STRENGTH_CONNECTOR: Record<EvidenceStrength, string> = {
  none:       'text-slate-700',
  minimal:    'text-blue-700/50',
  developing: 'text-amber-500/40',
  strong:     'text-emerald-500/40',
};

interface StageConfig {
  label: string;
  icon: typeof Activity;
  strength: EvidenceStrength;
}

interface Props {
  state: PractitionerLoopState;
}

export default function PractitionerLoopIndicator({ state }: Props) {
  const stages: StageConfig[] = [
    { label: 'Field',        icon: Activity,      strength: fieldStrength(state.fieldSignalCount) },
    { label: 'Inquiry',      icon: MessageSquare, strength: inquiryStrength(state.inquiryCount) },
    { label: 'Observations', icon: Eye,           strength: obsStrength(state.observationCount) },
    { label: 'Council',      icon: Sparkles,      strength: councilStrength(state.councilIterationCount) },
    { label: 'Experiment',   icon: FlaskConical,  strength: experimentStrength(state.experimentCount) },
    { label: 'Follow-up',    icon: Target,        strength: followUpStrength(state.hasFollowUp) },
  ];

  // Current edge: rightmost active stage with no active stages beyond it that are complete
  // Simpler: the rightmost stage with strength !== 'none', provided the next stage is 'none'
  let currentEdgeIdx = -1;
  for (let i = stages.length - 1; i >= 0; i--) {
    if (stages[i].strength !== 'none') {
      // Check that not all stages ahead are also active (we want the frontier)
      const allAheadEmpty = stages.slice(i + 1).every(s => s.strength === 'none');
      if (allAheadEmpty) {
        currentEdgeIdx = i;
        break;
      }
    }
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {stages.map((stage, i) => {
        const Icon = stage.icon;
        const isEdge = i === currentEdgeIdx;
        return (
          <div key={stage.label} className="flex items-center gap-1">
            <div
              title={stage.label}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${STRENGTH_PILL[stage.strength]}`}
            >
              <Icon className="w-3 h-3" />
              <span className="hidden sm:inline">{stage.label}</span>
              {isEdge && <span className="ml-0.5 opacity-70">▶</span>}
            </div>
            {i < stages.length - 1 && (
              <span className={`text-xs ${STRENGTH_CONNECTOR[stage.strength]}`}>›</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
