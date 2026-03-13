'use client';

/**
 * Practitioner Loop Indicator
 *
 * Compact visual progress tracker for the Field → Inquiry → Council → Decisions → Changes → Follow-up loop.
 * Shows which stages have data and which are still empty.
 *
 * Designed to be placed at the top of Decision and Change detail pages.
 */

import type { PractitionerLoopState } from '@/lib/studio/practitioner/types';
import { Activity, MessageSquare, Eye, Sparkles, FlaskConical, Target } from 'lucide-react';

interface Stage {
  key: keyof PractitionerLoopState;
  label: string;
  icon: typeof Activity;
  threshold?: (state: PractitionerLoopState) => boolean;
}

const STAGES: Stage[] = [
  {
    key: 'fieldSignalCount',
    label: 'Field',
    icon: Activity,
    threshold: (s) => s.fieldSignalCount > 0,
  },
  {
    key: 'hasClientInquiry',
    label: 'Inquiry',
    icon: MessageSquare,
    threshold: (s) => s.hasClientInquiry,
  },
  {
    key: 'observationCount',
    label: 'Observations',
    icon: Eye,
    threshold: (s) => s.observationCount > 0,
  },
  {
    key: 'hasCouncilSynthesis',
    label: 'Council',
    icon: Sparkles,
    threshold: (s) => s.hasCouncilSynthesis,
  },
  {
    key: 'hasExperiment',
    label: 'Experiment',
    icon: FlaskConical,
    threshold: (s) => s.hasExperiment,
  },
  {
    key: 'hasFollowUp',
    label: 'Follow-up',
    icon: Target,
    threshold: (s) => s.hasFollowUp,
  },
];

interface Props {
  state: PractitionerLoopState;
}

export default function PractitionerLoopIndicator({ state }: Props) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {STAGES.map((stage, i) => {
        const active = stage.threshold ? stage.threshold(state) : false;
        const Icon = stage.icon;
        return (
          <div key={stage.key} className="flex items-center gap-1">
            <div
              title={stage.label}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                active
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-800/60 text-slate-600 border border-slate-700/30'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span className="hidden sm:inline">{stage.label}</span>
            </div>
            {i < STAGES.length - 1 && (
              <span className={`text-xs ${active ? 'text-amber-500/40' : 'text-slate-700'}`}>›</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
